import os
from google.cloud import firestore
from datetime import datetime, timezone
import uuid

PROJECT_ID = os.getenv("PROJECT_ID", "qwiklabs-gcp-00-1dd11e38fdb3")
db = firestore.Client(project=PROJECT_ID)

def save_review(user_id: str, language: str, rating: int, summary: str, code_url: str, full_review: dict):
    """
    Saves a review session to Firestore for tracking developer growth over time.
    """
    try:
        review_id = str(uuid.uuid4())
        doc_ref = db.collection("users").document(user_id).collection("reviews").document(review_id)
        
        review_data = {
            "id": review_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "language": language,
            "rating": rating,
            "summary": summary,
            "code_url": code_url,
            "full_review": full_review
        }
        
        doc_ref.set(review_data)
        return review_data
    except Exception as e:
        print(f"Firestore save error (ignoring): {e}")
        # Return basic data anyway so the UI doesn't break
        return {
            "id": "temp-id",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "language": language,
            "rating": rating,
            "summary": summary,
            "code_url": code_url,
            "full_review": full_review
        }

def get_user_reviews(user_id: str):
    """
    Retrieves all past reviews for a specific user, ordered by timestamp descending.
    """
    try:
        reviews_ref = db.collection("users").document(user_id).collection("reviews")
        query = reviews_ref.order_by("timestamp", direction=firestore.Query.DESCENDING).limit(50)
        
        results = []
        for doc in query.stream():
            results.append(doc.to_dict())
            
        return results
    except Exception as e:
        print(f"Firestore get reviews error (ignoring): {e}")
        return []

def get_user_stats(user_id: str):
    """
    Calculates average rating and trend data to track development growth.
    """
    try:
        reviews = get_user_reviews(user_id)
        
        if not reviews:
            return {"total_reviews": 0, "average_rating": 0, "trends": []}
            
        total_rating = sum(r.get("rating", 0) for r in reviews)
        avg = round(total_rating / len(reviews), 1)
        
        trends = [{"date": r["timestamp"], "rating": r["rating"]} for r in reversed(reviews)]
        
        return {
            "total_reviews": len(reviews),
            "average_rating": avg,
            "trends": trends
        }
    except Exception as e:
        print(f"Firestore get stats error (ignoring): {e}")
        return {"total_reviews": 0, "average_rating": 0, "trends": []}
