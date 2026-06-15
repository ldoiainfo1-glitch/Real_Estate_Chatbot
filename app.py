from flask import Flask, request, jsonify
from supabase import create_client, Client
import requests
import subprocess
import threading
import time
import os
import re

app = Flask(__name__)

MODEL = "qwen2:0.5b"
OLLAMA_URL = "http://127.0.0.1:11434/api/generate"

# ── Supabase ──────────────────────────────────────────────────────────────────
SUPABASE_URL = os.environ.get("SUPABASE_URL")          # set in env / .env
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")  # service role key

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ── Static system context (platform info + legal disclaimer) ──────────────────
PLATFORM_CONTEXT = """
PLATFORM: AI Property Legal Advisor – India
Tagline : Understand Before You Invest

PURPOSE
You are an AI-powered Indian real estate legal advisory assistant.
Your job is to help buyers, investors, NRIs, brokers, and property owners
understand legal, technical, and due-diligence aspects of real estate
transactions in simple, plain language.

CAPABILITIES
- Answer questions on Indian property laws, registration, stamp duty, RERA,
  title verification, encumbrance, mutation, 7/12 extracts, sale deeds, etc.
- Provide state-specific guidance where documents are available.
- Generate structured due-diligence checklists on request.
- Explain legal terminology in plain English / Hindi on request.
- Highlight red flags and risk categories (Title / Approval / Litigation /
  Encumbrance / Financial).

LIMITATIONS – ALWAYS MENTION WHEN RELEVANT
- This platform does NOT provide legal representation.
- It does NOT certify title or guarantee investment outcomes.
- It provides informational guidance only.
- Users should consult a licensed advocate for final decisions.

RISK LABELS
🟢 Low Risk  |  🟡 Moderate Risk  |  🔴 High Risk
"""

# Indian states / UTs for keyword detection
STATE_KEYWORDS = {
    "maharashtra": ["maharashtra", "mumbai", "pune", "nagpur", "thane", "nashik"],
    "karnataka":   ["karnataka", "bangalore", "bengaluru", "mysore", "hubli"],
    "tamil_nadu":  ["tamil nadu", "tamilnadu", "chennai", "coimbatore", "madurai"],
    "telangana":   ["telangana", "hyderabad", "warangal", "nizamabad"],
    "delhi":       ["delhi", "new delhi", "ncr"],
    "gujarat":     ["gujarat", "ahmedabad", "surat", "vadodara"],
    "rajasthan":   ["rajasthan", "jaipur", "jodhpur", "udaipur"],
    "uttar_pradesh": ["uttar pradesh", "up", "lucknow", "noida", "ghaziabad", "agra"],
    "west_bengal": ["west bengal", "kolkata", "calcutta", "howrah"],
    "kerala":      ["kerala", "kochi", "thiruvananthapuram", "kozhikode"],
}


def detect_states(text: str) -> list[str]:
    text_lower = text.lower()
    matched = []
    for state, keywords in STATE_KEYWORDS.items():
        if any(kw in text_lower for kw in keywords):
            matched.append(state)
    return matched


def fetch_documents(states: list[str]) -> str:
    """
    Pull matching rows from Supabase `documents` table.
    If states detected → filter by filename ILIKE.
    If no state detected → fetch all rows (general query).
    Max ~4 docs to keep context window manageable.
    """
    try:
        if states:
            # Build OR filter: filename ilike '%maharashtra%' OR '%karnataka%' ...
            filters = [f"filename.ilike.%{s}%" for s in states]
            filter_str = ",".join(filters)
            result = (
                supabase.table("documents")
                .select("filename, content")
                .or_(filter_str)
                .limit(4)
                .execute()
            )
        else:
            result = (
                supabase.table("documents")
                .select("filename, content")
                .limit(4)
                .execute()
            )

        rows = result.data or []
        if not rows:
            return "No relevant state documents found in knowledge base."

        parts = []
        for row in rows:
            parts.append(
                f"--- Document: {row['filename']} ---\n{row['content']}\n"
            )
        return "\n".join(parts)

    except Exception as e:
        return f"[Supabase error: {str(e)}]"


# ── Ollama startup ─────────────────────────────────────────────────────────────
def start_ollama():
    subprocess.Popen(
        ["ollama", "serve"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    for _ in range(30):
        try:
            r = requests.get("http://127.0.0.1:11434")
            if r.status_code == 200:
                print("Ollama is ready")
                break
        except Exception:
            pass
        time.sleep(2)
    subprocess.run(["ollama", "pull", MODEL])
    print(f"Model {MODEL} is ready")


threading.Thread(target=start_ollama, daemon=True).start()


# ── Routes ────────────────────────────────────────────────────────────────────
@app.route("/")
def home():
    return jsonify({"status": "running", "model": MODEL})


@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.json or {}
        prompt = data.get("prompt", "").strip()
        if not prompt:
            return jsonify({"response": "No prompt provided."})

        # 1. Detect state from user query
        states = detect_states(prompt)

        # 2. Fetch relevant documents from Supabase
        knowledge = fetch_documents(states)

        # 3. Build full prompt
        full_prompt = f"""{PLATFORM_CONTEXT}

KNOWLEDGE BASE (use ONLY this for your answer):
{knowledge}

QUESTION: {prompt}

INSTRUCTIONS:
- Answer in clear, simple language suitable for a layperson.
- If state-specific laws differ, mention the relevant state explicitly.
- If the answer is not in the knowledge base, say:
  "I could not find that information in the current knowledge base. Please consult a licensed property advocate."
- Add a risk label (🟢/🟡/🔴) when relevant.
- End with: "⚠️ This is informational guidance only and does not constitute legal advice."
"""

        # 4. Call Ollama
        response = requests.post(
            OLLAMA_URL,
            json={"model": MODEL, "prompt": full_prompt, "stream": False},
            timeout=120,
        )

        if response.status_code != 200:
            return jsonify({
                "response": f"Ollama error: HTTP {response.status_code} — {response.text}"
            })

        if not response.text.strip():
            return jsonify({
                "response": "Ollama returned an empty response. Model may still be loading."
            })

        ollama_data = response.json()
        return jsonify({
            "response": ollama_data.get("response", "No response from model."),
            "states_detected": states,
        })

    except requests.exceptions.ConnectionError:
        return jsonify({
            "response": "Cannot connect to Ollama. It may still be starting — please wait and retry."
        })
    except requests.exceptions.Timeout:
        return jsonify({
            "response": "Request timed out. The model is taking too long to respond."
        })
    except Exception as e:
        return jsonify({"response": f"Error: {str(e)}"})


@app.route("/documents", methods=["GET"])
def list_documents():
    """Utility endpoint — lists all filenames in the knowledge base."""
    try:
        result = supabase.table("documents").select("id, filename, created_at").execute()
        return jsonify({"documents": result.data})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
