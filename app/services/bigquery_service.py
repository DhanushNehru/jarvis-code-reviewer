import os
from google.cloud import bigquery

PROJECT_ID = os.getenv("PROJECT_ID")
DATASET_ID = "jarvis_reviewer"
TABLE_ID = "historical_rules"

def get_historical_rules() -> str:
    """
    Fetches historical rules from BigQuery and formats them as a string 
    to be injected into the Gemini context.
    """
    client = bigquery.Client(project=PROJECT_ID)
    
    query = f"""
        SELECT type, description 
        FROM `{PROJECT_ID}.{DATASET_ID}.{TABLE_ID}`
        LIMIT 50
    """
    
    try:
        query_job = client.query(query)
        results = query_job.result()
        
        formatted_rules = []
        for row in results:
            formatted_rules.append(f"- [{row.type.upper()}] {row.description}")
            
        if not formatted_rules:
            return "No historical rules available."
            
        return "\n".join(formatted_rules)
    except Exception as e:
        print(f"Error fetching BigQuery rules: {e}")
        return "No historical rules available due to an error."
