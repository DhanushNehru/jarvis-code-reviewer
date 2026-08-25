from pydantic import BaseModel, Field
from typing import List, Optional

class ReviewRequest(BaseModel):
    code: str = Field(..., min_length=1, description="Source code to review")
    language: str = Field(..., description="Programming language (e.g., Python, JavaScript)")
    model: str = Field("gemini-2.5-flash", description="The Gemini model to use for evaluation")

class BugIssue(BaseModel):
    category: str
    line: Optional[str]
    issue: str
    fix: str

class ReviewResponse(BaseModel):
    rating: int
    security_score: int = Field(default=5, description="1-10 score for security")
    performance_score: int = Field(default=5, description="1-10 score for performance/efficiency")
    architecture_score: int = Field(default=5, description="1-10 score for clean code/architecture")
    testing_score: int = Field(default=5, description="1-10 score for edge cases/testability")
    summary: str
    bugs: List[BugIssue]
    bestPractices: List[str]
    optimizations: List[str]
    time_complexity: str
    space_complexity: str
    fixed_code: str

class ReviewHistoryItem(BaseModel):
    id: str
    timestamp: str
    language: str
    rating: int
    summary: str
    code_url: str
