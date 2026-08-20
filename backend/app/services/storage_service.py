import os
from google.cloud import storage
import uuid

PROJECT_ID = os.getenv("PROJECT_ID", "qwiklabs-gcp-00-1dd11e38fdb3")
BUCKET_NAME = f"{PROJECT_ID}-code-submissions"

def ensure_bucket_exists():
    client = storage.Client(project=PROJECT_ID)
    bucket = client.bucket(BUCKET_NAME)
    if not bucket.exists():
        try:
            bucket = client.create_bucket(bucket, location="US")
            print(f"Created bucket {bucket.name}")
        except Exception as e:
            print(f"Bucket creation issue: {e}")

def upload_source_code(user_id: str, code: str, language: str) -> str:
    """
    Securely persists source code submissions to Cloud Storage.
    Returns the gs:// URI of the uploaded object.
    """
    ensure_bucket_exists()
    client = storage.Client(project=PROJECT_ID)
    bucket = client.bucket(BUCKET_NAME)
    
    ext_map = {"python": "py", "javascript": "js", "java": "java", "go": "go"}
    ext = ext_map.get(language.lower(), "txt")
    
    filename = f"submissions/{user_id}/{uuid.uuid4()}.{ext}"
    blob = bucket.blob(filename)
    
    blob.upload_from_string(code, content_type="text/plain")
    
    return f"gs://{BUCKET_NAME}/{filename}"
