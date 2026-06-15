from flask import Flask, request, jsonify
from supabase import create_client, Client
from openai import OpenAI
import os

app = Flask(__name__)

# ── NVIDIA ────────────────────────────────────────────────────────────────────
nvidia_client = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key=os.environ.get("NVIDIA_API_KEY")
)
MODEL = "nvidia/nemotron-3-ultra-550b-a55b"

# ── Supabase ──────────────────────────────────────────────────────────────────
supabase: Client = create_client(
    os.environ.get("SUPABASE_URL"),
    os.environ.get("SUPABASE_SERVICE_KEY")
)

# ── Platform context ──────────────────────────────────────────────────────────
PLATFORM_CONTEXT = """
PLATFORM: AI Property Legal Advisor – India
Tagline : Understand Before You Invest

You are an AI-powered Indian real estate legal advisory assistant.
Help buyers, investors, NRIs, brokers, and property owners understand
legal, technical, and due-diligence aspects of real estate transactions
in simple plain language.

CAPABILITIES
- Answer questions on Indian property laws, registration, stamp duty,
  RERA, title verification, encumbrance, mutation, 7/12 extracts, sale deeds.
- Provide state-specific guidance where documents are available.
- Generate structured due-diligence checklists on request.
- Explain legal terminology in plain English / Hindi on request.
- Highlight red flags and risk categories:
  Title / Approval / Litigation / Encumbrance / Financial

LIMITATIONS
- Does NOT provide legal representation.
- Does NOT certify title or guarantee investment outcomes.
- Provides informational guidance only.
- Users should consult a licensed advocate for final decisions.

RISK LABELS: 🟢 Low  |  🟡 Moderate  |  🔴 High
"""

STATE_KEYWORDS = {
    "maharashtra":    ["maharashtra", "mumbai", "pune", "nagpur", "thane", "nashik"],
    "karnataka":      ["karnataka", "bangalore", "bengaluru", "mysore", "hubli"],
    "tamil_nadu":     ["tamil nadu", "tamilnadu", "chennai", "coimbatore", "madurai"],
    "telangana":      ["telangana", "hyderabad", "warangal", "nizamabad"],
    "delhi":          ["delhi", "new delhi", "ncr"],
    "gujarat":        ["gujarat", "ahmedabad", "surat", "vadodara"],
    "rajasthan":      ["rajasthan", "jaipur", "jodhpur", "udaipur"],
    "uttar_pradesh":  ["uttar pradesh", "up", "lucknow", "noida", "ghaziabad", "agra"],
    "west_bengal":    ["west bengal", "kolkata", "calcutta", "howrah"],
    "kerala":         ["kerala", "kochi", "thiruvananthapuram", "kozhikode"],
}


def detect_states(text: str) -> list:
    text_lower = text.lower()
    return [s for s, kws in STATE_KEYWORDS.items() if any(k in text_lower for k in kws)]


def fetch_documents(states: list) -> str:
    try:
        if states:
            filter_str = ",".join([f"filename.ilike.%{s}%" for s in states])
            result = supabase.table("documents").select("filename, content").or_(filter_str).limit(4).execute()
        else:
            result = supabase.table("documents").select("filename, content").limit(4).execute()

        rows = result.data or []
        if not rows:
            return "No relevant documents found in knowledge base."

        return "\n".join([f"--- {r['filename']} ---\n{r['content']}" for r in rows])

    except Exception as e:
        return f"[Supabase error: {str(e)}]"


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

        states = detect_states(prompt)
        knowledge = fetch_documents(states)

        full_prompt = f"""{PLATFORM_CONTEXT}

KNOWLEDGE BASE (use ONLY this for your answer):
{knowledge}

QUESTION: {prompt}

INSTRUCTIONS:
- Answer in clear simple language for a layperson.
- Mention the relevant state explicitly if state-specific.
- If answer not in knowledge base say:
  "I could not find that information. Please consult a licensed property advocate."
- Add risk label 🟢/🟡/🔴 where relevant.
- End with: "⚠️ This is informational guidance only and does not constitute legal advice."
"""

        completion = nvidia_client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": full_prompt}],
            temperature=0.3,
            top_p=0.95,
            max_tokens=2048,
            extra_body={
                "chat_template_kwargs": {"enable_thinking": True},
                "reasoning_budget": 2048
            },
            stream=True
        )

        full_response = ""
        for chunk in completion:
            if not chunk.choices:
                continue
            content = chunk.choices[0].delta.content
            if content:
                full_response += content

        return jsonify({
            "response": full_response,
            "states_detected": states
        })

    except Exception as e:
        import traceback
        return jsonify({
            "response": f"Error: {str(e)}",
            "traceback": traceback.format_exc()
        }), 200  # force 200 so we can read the JSON   
@app.route("/health")
def health():
    return jsonify({
        "nvidia_key": bool(os.environ.get("NVIDIA_API_KEY")),
        "supabase_url": bool(os.environ.get("SUPABASE_URL")),
        "supabase_key": bool(os.environ.get("SUPABASE_SERVICE_KEY")),
    })

@app.route("/documents", methods=["GET"])
def list_documents():
    try:
        result = supabase.table("documents").select("id, filename, created_at").execute()
        return jsonify({"documents": result.data})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
