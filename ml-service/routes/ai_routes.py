from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

from services.ai_search import ai_search
from services.ai_assistant import ai_assistant
from services.review_summarizer import review_summarizer

router = APIRouter(prefix="/api/ai", tags=["AI Services"])

class SearchQuery(BaseModel):
    query: str

class ChatMessage(BaseModel):
    message: str
    context: str = ""

class ReviewList(BaseModel):
    reviews: List[str]

@router.post("/search")
def parse_search_query(req: SearchQuery):
    return ai_search.parse_query(req.query)

@router.post("/chat")
def chat_with_assistant(req: ChatMessage):
    response = ai_assistant.chat(req.message, req.context)
    return {"reply": response}

@router.post("/summarize-reviews")
def summarize_reviews(req: ReviewList):
    return review_summarizer.summarize(req.reviews)
