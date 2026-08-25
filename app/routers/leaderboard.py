from fastapi import APIRouter, Depends
from typing import List
from pydantic import BaseModel
from app.middleware.auth import get_current_user
from google.cloud import firestore

router = APIRouter()
db = firestore.Client()

class LeaderboardEntry(BaseModel):
    uid: str
    email: str
    average_rating: float
    total_reviews: int

class PrivacyToggle(BaseModel):
    is_public: bool

@router.get("/leaderboard", response_model=List[LeaderboardEntry])
async def get_leaderboard(user: dict = Depends(get_current_user)):
    """Fetches the top global engineers who have opted-in to the leaderboard."""
    profiles = db.collection("user_profiles").where("is_public", "==", True).stream()
    
    leaderboard = []
    for profile in profiles:
        data = profile.to_dict()
        leaderboard.append({
            "uid": profile.id,
            "email": data.get("email", "Anonymous Developer"),
            "average_rating": data.get("average_rating", 0.0),
            "total_reviews": data.get("total_reviews", 0)
        })
        
    # Sort descending by rating
    leaderboard.sort(key=lambda x: x["average_rating"], reverse=True)
    return leaderboard[:50]

@router.post("/leaderboard/privacy")
async def toggle_privacy(request: PrivacyToggle, user: dict = Depends(get_current_user)):
    """Allows a user to opt-in or opt-out of the public leaderboard."""
    doc_ref = db.collection("user_profiles").document(user["uid"])
    
    # Check if exists
    if not doc_ref.get().exists:
        # Initialize basic profile
        doc_ref.set({
            "email": user["email"],
            "is_public": request.is_public,
            "average_rating": 0.0,
            "total_reviews": 0
        })
    else:
        doc_ref.update({"is_public": request.is_public})
        
    return {"status": "success", "is_public": request.is_public}
    
@router.get("/leaderboard/privacy")
async def get_privacy(user: dict = Depends(get_current_user)):
    doc = db.collection("user_profiles").document(user["uid"]).get()
    if doc.exists:
        return {"is_public": doc.to_dict().get("is_public", False)}
    return {"is_public": False}
