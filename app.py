from flask import Flask, request, jsonify
import requests
import subprocess
import threading
import time
import os

app = Flask(__name__)
MODEL = "qwen2:0.5b"
OLLAMA_URL = "http://127.0.0.1:11434/api/generate"

COMPANY_DATA = """
COMPANY OVERVIEW
Instantly.ai is a leading sales engagement and lead
intelligence platform founded in 2021. Built for
businesses of all sizes — from solopreneurs to global
agencies — Instantly's mission is to be the simplest
tool on the market to help people make money with
cold email outreach.

With over 35,000 customers worldwide and $20M in
revenue, Instantly has grown into one of the most
trusted names in B2B sales automation — all without
any outside venture capital funding.

WHAT INSTANTLY.AI DOES
Instantly.ai helps businesses turn leads into clients
by combining four core capabilities in one platform:

- Automated Outreach
  Create and launch personalized cold email campaigns
  in minutes. AI crafts and personalizes messages at
  scale, while smart workflows automatically route,
  tag, and trigger follow-ups based on lead behavior.

- B2B Lead Database
  Access a database of 450M+ verified contacts.
  Filter by job title, company size, industry,
  tech stack, location, and more to find the right
  prospects fast.

- Email Deliverability Tools
  Built-in email warm-up, inbox placement testing,
  and a deliverability network ensure your messages
  land in primary inboxes — not spam folders.

- AI-Powered CRM
  Track opportunities, manage pipelines, automate
  tasks, and get AI-driven insights — all within
  the same platform. Native integrations with
  HubSpot, Salesforce, and Pipedrive are available.

KEY FEATURES
- AI Sales Agents & Reply Agents
- Unibox — centralized inbox for all email accounts
- Website Visitor Identification
- Campaign analytics (Opportunities, Pipeline,
  Conversions, Revenue)
- Unlimited email sending accounts
- Multi-channel outreach (Email, Calls, SMS)
- API access & Zapier integrations
- Instantly Academy for learning & community

WHO IT'S FOR
Instantly.ai serves a wide range of users including:
- Startups and founders doing founder-led sales
- Sales teams and SDRs scaling outreach
- Marketing agencies managing multiple clients
- Freelancers and solopreneurs growing their pipeline

COMPANY FACTS
- Founded     : 2021
- CEO/Founder : Nils Schneider
- Employees   : ~15
- Revenue     : $20M (2024)
- Funding     : Bootstrapped (no outside investment)
- Customers   : 35,000+
- Headquarters: Sheridan, Wyoming, USA

WEBSITE & CONTACT
Website  : https://instantly.ai
Support  : https://support.instantly.ai
Community: Facebook Group & Slack Community
Academy  : https://instantly.ai/academy

PRIVACY POLICY
Instantly.ai (operated by Foo Monk, LLC) collects and processes personal data
to provide its data marketing and sales engagement services.

Data collected includes: full name, email, job title, company, professional
history, phone number, postal address, IP address, cookie/device identifiers,
email interaction data, demographic info, and consumer behavioral data.

Data sources: third-party data compilers, publicly available websites,
government agencies, and Instantly's customers and partners.

Data is used for: B2B marketing and outreach services, audience segmentation,
email retargeting, campaign performance measurement, email validation, and
internal product development.

Data is shared with: Instantly's customers (businesses, agencies, non-profits,
recruiters), service providers, business and data partners, and law enforcement
when legally required.

Privacy contact: privacy@instantly.ai
Full policy: https://instantly.ai/privacy

DATA OPT-OUT & CONSUMER RIGHTS
Users have the right to access, correct, or delete their personal data, and to
opt out of the sale or sharing of their data.

Opt-out options:
- Online : app.instantly.ai/privacy/opt-out
- Phone  : 1-866-467-8688 (Service Code 1974#)
- GPC signal supported on all browsers

Opt-out requests processed within 1 business day. Data removal from active
marketing databases takes up to 15 business days.

CALIFORNIA PRIVACY RIGHTS (CCPA)
California residents have rights to know, access, delete, and opt out of the
sale of their data. Instantly does NOT knowingly collect or sell data of minors
under 16 years of age.

GDPR (EU & UK RESIDENTS)
Instantly complies with GDPR for EU and UK residents.
EU Representative: EDPO, Avenue Huart Hamoir 71, 1030 Brussels, Belgium
UK Representative: EDPO UK Ltd, Unit 33, Waterside, 44-48 Wharf Road, London

SECURITY
Instantly uses firewall protections, data encryption in transit and at rest,
hashing and truncation of sensitive data, and strict access controls.

TERMS OF SERVICE
Users must comply with anti-spam laws (CAN-SPAM, GDPR, CASL).
Full Terms: https://instantly.ai/terms

PRODUCTS
1. Outreach         - instantly.ai/outreach
2. AI Sales Agent   - instantly.ai/ai-agents/sales-agent
3. AI Reply Agent   - instantly.ai/ai-agents/reply-agent
4. Lead Database    - instantly.ai/b2b-lead-finder
5. Email Verification - instantly.ai/email-verification
6. CRM              - instantly.ai/crm
7. Email Warmup     - instantly.ai/email-warmup
8. Inbox Placement  - instantly.ai/inbox-placement
9. Website Visitors - instantly.ai/website-visitors
10. Email Accounts  - instantly.ai/email-accounts
11. Copilot (AI)    - instantly.ai/copilot
12. Automations     - instantly.ai/ai-agents/automations
13. Airmail         - instantly.ai/airmail
14. Unibox          - Centralized multi-inbox management

PRICING
14-day free trial available (no credit card needed).
Flat-fee subscription plans. Details: instantly.ai/pricing

HR NOTICE
We're sorry, we're unable to provide HR-related information through this
channel at this time. For any HR queries such as leave policies, office
timings, WFH policy, payroll, or anything else related to employment, please
reach out directly to our HR team — they'll be happy to help you.
hr@instantly.ai
We apologize for any inconvenience.
"""

DATA_FOLDER = "company_data"


def load_company_data():
    global COMPANY_DATA
    if not os.path.exists(DATA_FOLDER):
        os.makedirs(DATA_FOLDER)
    extra_texts = []
    for filename in os.listdir(DATA_FOLDER):
        filepath = os.path.join(DATA_FOLDER, filename)
        if filename.endswith(".txt"):
            with open(filepath, "r", encoding="utf-8") as f:
                extra_texts.append(f.read())
    if extra_texts:
        COMPANY_DATA += "\n\n" + "\n\n".join(extra_texts)
    print("Company data loaded")


def start_ollama():
    subprocess.Popen(
        ["ollama", "serve"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )
    # Wait until Ollama is actually ready
    for i in range(30):
        try:
            r = requests.get("http://127.0.0.1:11434")
            if r.status_code == 200:
                print("Ollama is ready")
                break
        except:
            pass
        time.sleep(2)
    subprocess.run(["ollama", "pull", MODEL])
    print(f"Model {MODEL} is ready")


threading.Thread(target=start_ollama).start()
load_company_data()


@app.route("/")
def home():
    return {
        "status": "running",
        "model": MODEL
    }


@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.json
        prompt = data.get("prompt", "")
        full_prompt = f"""You are a customer support assistant for Instantly.ai.
Answer ONLY using the COMPANY INFORMATION provided below.
Do NOT use any outside knowledge.
If the answer is not in the data, say: "I could not find that information in company records."

COMPANY INFORMATION:
{COMPANY_DATA}

QUESTION: {prompt}
"""
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": MODEL,
                "prompt": full_prompt,
                "stream": False
            },
            timeout=120
        )

        # Debug: print raw response if something goes wrong
        if response.status_code != 200:
            return jsonify({
                "response": f"Ollama error: HTTP {response.status_code} — {response.text}"
            })

        if not response.text.strip():
            return jsonify({
                "response": "Ollama returned an empty response. Model may still be loading."
            })

        ollama_response = response.json()
        return jsonify({
            "response": ollama_response.get("response", "No response from model.")
        })

    except requests.exceptions.ConnectionError:
        return jsonify({
            "response": "Cannot connect to Ollama. It may still be starting up — please wait and try again."
        })
    except requests.exceptions.Timeout:
        return jsonify({
            "response": "Request timed out. The model is taking too long to respond."
        })
    except Exception as e:
        return jsonify({
            "response": f"Error: {str(e)}"
        })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
