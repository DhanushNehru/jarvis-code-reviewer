from fastapi import APIRouter, Depends, HTTPException
from app.models.review import ReviewRequest, ReviewResponse
from app.middleware.auth import get_current_user
from app.services.gemini_reviewer import generate_code_review
from app.services.storage_service import upload_source_code
from app.services.firestore_service import save_review

router = APIRouter()

@router.post("/review", response_model=ReviewResponse)
async def submit_code_for_review(
    request: ReviewRequest, 
    user: dict = Depends(get_current_user)
):
    """
    1. Authenticates user
    2. Persists source code to Cloud Storage
    3. Calls Gemini for multi-language analysis (using BigQuery RAG rules)
    4. Saves quality rating and session history to Firestore
    5. Returns the structured bug report & optimization insights
    """
    try:
        # Securely persist the raw code
        code_uri = upload_source_code(user["uid"], request.code, request.language)
        
        # Invoke the core evaluation engine
        review_data = generate_code_review(request.code, request.language)
        
        # Maintain a robust, persistent session history
        save_review(
            user_id=user["uid"],
            language=request.language,
            rating=review_data.get("rating", 0),
            summary=review_data.get("summary", ""),
            code_url=code_uri,
            full_review=review_data
        )
        
        return review_data
        
    except Exception as e:
        print(f"Review endpoint error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during review processing")
