from fastapi import APIRouter, Depends, HTTPException, Header
from typing import Optional
from app.middleware.auth import get_current_user
from app.services.firestore_service import get_user_reviews
import os
import json
import requests
from vertexai.generative_models import GenerativeModel, SafetySetting, HarmCategory, HarmBlockThreshold

router = APIRouter()

@router.get("/history/recommendations")
async def get_growth_recommendations(
    user: dict = Depends(get_current_user),
    x_api_key: Optional[str] = Header(None)
):
    """Analyzes a user's code history and generates learning recommendations."""
    reviews = get_user_reviews(user["uid"])
    
    if not reviews:
        return {"recommendations": ["Submit some code for review to get personalized recommendations!"]}
    
    # Aggregate recent feedback
    recent_reviews = reviews[:5]
    issues = []
    for r in recent_reviews:
        if "full_review" in r:
            issues.extend([b.get("issue", "") for b in r["full_review"].get("bugs", [])])
            issues.extend(r["full_review"].get("optimizations", []))
            
    if not issues:
         return {"recommendations": ["Your code is flawless! Keep building."]}

    prompt = f"""
    You are J.A.R.V.I.S., an elite AI coding mentor.
    Based on the following recent issues and optimizations from the Commander's code reviews, provide exactly 3 concise, highly actionable learning recommendations. Tell them what topics or technologies they should focus on studying to level up their skills.
    Address the user as Commander.
    
    Recent Issues:
    {chr(10).join(issues[:10])}
    
    Return ONLY a JSON list of 3 strings.
    """
    
    try:
        if x_api_key:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={x_api_key}"
            headers = {"Content-Type": "application/json"}
            data = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"responseMimeType": "application/json"}
            }
            resp = requests.post(url, headers=headers, json=data)
            resp_json = resp.json()
            result_text = resp_json["candidates"][0]["content"]["parts"][0]["text"]
        else:
            model = GenerativeModel("gemini-2.5-flash")
            response = model.generate_content(prompt, generation_config={"response_mime_type": "application/json"})
            result_text = response.text.strip()
            
        result_text = result_text.strip()
        if result_text.startswith("```json"): result_text = result_text[7:]
        elif result_text.startswith("```"): result_text = result_text[3:]
        if result_text.endswith("```"): result_text = result_text[:-3]
        
        return {"recommendations": json.loads(result_text)}
    except Exception as e:
        print(f"Error generating recommendations: {e}")
        return {"recommendations": ["Focus on Design Patterns and Clean Code Architecture.", "Review OWASP Security best practices.", "Study Big-O time and space complexity optimizations."]}
