import os
import json
import requests
import vertexai
from vertexai.generative_models import GenerativeModel, SafetySetting, HarmCategory, HarmBlockThreshold
from app.prompts.review_prompt import SYSTEM_PROMPT
from app.services.bigquery_service import get_historical_rules

PROJECT_ID = os.getenv("PROJECT_ID", "qwiklabs-gcp-00-1dd11e38fdb3")
LOCATION = "us-central1"

try:
    vertexai.init(project=PROJECT_ID, location=LOCATION)
except Exception as e:
    print(f"Vertex AI init failed (expected in local dev if not authed): {e}")

def generate_code_review(code: str, language: str, model_name: str = "gemini-2.5-flash", custom_api_key: str = None) -> dict:
    """
    Sends the user's code to Gemini and enforces organizational RAG rules.
    If custom_api_key is provided, bypasses Vertex AI and hits Google AI Studio REST directly (BYOK).
    """
    rules = get_historical_rules()
    prompt = SYSTEM_PROMPT.format(historical_rules=rules, language=language)
    final_prompt = f"{prompt}\n\n# SOURCE CODE TO REVIEW:\n```{language}\n{code}\n```"
    
    result_text = ""
    
    try:
        if custom_api_key:
            # Bring Your Own Key (BYOK) - Hit Google AI Studio REST endpoint
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={custom_api_key}"
            headers = {"Content-Type": "application/json"}
            data = {
                "contents": [{"parts": [{"text": final_prompt}]}],
                "generationConfig": {"responseMimeType": "application/json"}
            }
            resp = requests.post(url, headers=headers, json=data)
            if not resp.ok:
                raise Exception(f"Custom API Key Error: {resp.text}")
            resp_json = resp.json()
            result_text = resp_json["candidates"][0]["content"]["parts"][0]["text"]
        else:
            # Default Enterprise Vertex AI
            model = GenerativeModel(
                model_name,
                safety_settings={
                    HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
                    HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
                    HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
                    HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
                }
            )
            response = model.generate_content(
                final_prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            result_text = response.text.strip()
        
        # Cleanup markdown JSON blocks just in case
        result_text = result_text.strip()
        if result_text.startswith("```json"): result_text = result_text[7:]
        elif result_text.startswith("```"): result_text = result_text[3:]
        if result_text.endswith("```"): result_text = result_text[:-3]
            
        review_data = json.loads(result_text.strip())
        review_data["enforced_rules"] = rules 
        
        return review_data
    except Exception as e:
        error_msg = str(e)
        print(f"Error generating review from Gemini: {error_msg}")
        return {
            "rating": 0, "security_score": 0, "performance_score": 0, "architecture_score": 0, "testing_score": 0,
            "summary": f"Failed to generate review. Check API key or backend logs. Error: {error_msg}",
            "bugs": [], "bestPractices": [], "optimizations": [], "time_complexity": "N/A", "space_complexity": "N/A", "fixed_code": ""
        }
