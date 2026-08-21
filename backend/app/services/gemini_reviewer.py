import os
import json
import vertexai
from vertexai.generative_models import GenerativeModel, SafetySetting, HarmCategory, HarmBlockThreshold
from app.prompts.review_prompt import SYSTEM_PROMPT
from app.services.bigquery_service import get_historical_rules
PROJECT_ID = os.getenv("PROJECT_ID", "qwiklabs-gcp-00-1dd11e38fdb3")
# Change back to us-central1 since Qwiklabs has 2.5 models available there!
LOCATION = "us-central1"

# Initialize Vertex AI
vertexai.init(project=PROJECT_ID, location=LOCATION)

def generate_code_review(code: str, language: str, model_name: str = "gemini-2.5-flash") -> dict:
    """
    Sends the user's code to Gemini and enforces organizational RAG rules.
    """
    
    # Load the requested model dynamically
    model = GenerativeModel(
        model_name,
        safety_settings={
            HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
        }
    )
    
    rules = get_historical_rules()
    
    prompt = SYSTEM_PROMPT.format(historical_rules=rules, language=language)
    
    final_prompt = f"{prompt}\n\n# SOURCE CODE TO REVIEW:\n```{language}\n{code}\n```"
    
    try:
        response = model.generate_content(
            final_prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        
        result_text = response.text.strip()
        
        # Manually strip markdown JSON blocks just in case
        if result_text.startswith("```json"):
            result_text = result_text[7:]
        if result_text.startswith("```"):
            result_text = result_text[3:]
        if result_text.endswith("```"):
            result_text = result_text[:-3]
            
        review_data = json.loads(result_text.strip())
        
        # Inject the historical rules we fetched from BigQuery into the response
        # so the frontend can render the "RAG Transparency" panel
        review_data["enforced_rules"] = rules 
        
        return review_data
    except Exception as e:
        error_msg = str(e)
        print(f"Error generating review from Gemini: {error_msg}")
        return {
            "rating": 0,
            "summary": f"Failed to generate review due to an internal error: {error_msg}",
            "bugs": [],
            "bestPractices": [],
            "optimizations": []
        }
