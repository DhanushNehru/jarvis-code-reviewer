import os
import json
import vertexai
from vertexai.generative_models import GenerativeModel, SafetySetting, HarmCategory, HarmBlockThreshold
from app.prompts.review_prompt import SYSTEM_PROMPT
from app.services.bigquery_service import get_historical_rules

PROJECT_ID = os.getenv("PROJECT_ID", "qwiklabs-gcp-00-1dd11e38fdb3")
LOCATION = "us-central1"

# Initialize Vertex AI
vertexai.init(project=PROJECT_ID, location=LOCATION)

# Load the model
model = GenerativeModel(
    "gemini-2.5-flash",
    safety_settings={
        HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
        HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
        HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
        HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
    }
)

def generate_code_review(code: str, language: str) -> dict:
    """
    Takes source code and language, fetches historical rules, 
    and asks Gemini to review the code.
    Returns a parsed JSON dictionary.
    """
    rules = get_historical_rules()
    
    prompt = SYSTEM_PROMPT.format(historical_rules=rules, language=language)
    
    final_prompt = f"{prompt}\n\n# SOURCE CODE TO REVIEW:\n```{language}\n{code}\n```"
    
    try:
        response = model.generate_content(
            final_prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        
        result_text = response.text
        return json.loads(result_text)
    except Exception as e:
        print(f"Error generating review from Gemini: {e}")
        return {
            "rating": 0,
            "summary": "Failed to generate review due to an internal error.",
            "bugs": [],
            "bestPractices": [],
            "optimizations": []
        }
