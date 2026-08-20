from fastapi import APIRouter, Depends
from app.middleware.auth import get_current_user
from app.services.firestore_service import get_user_reviews, get_user_stats

router = APIRouter()

@router.get("/history")
async def get_history(user: dict = Depends(get_current_user)):
    """
    Returns the user's past review sessions.
    """
    reviews = get_user_reviews(user["uid"])
    return {"reviews": reviews}

@router.get("/history/stats")
async def get_stats(user: dict = Depends(get_current_user)):
    """
    Returns aggregated stats and trends so optimization patterns 
    can be tracked over time.
    """
    stats = get_user_stats(user["uid"])
    return stats
