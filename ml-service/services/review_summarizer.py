import json
from utils.gemini_client import get_gemini_model, generate
from typing import List

class ReviewSummarizer:
    def __init__(self):
        self.model = get_gemini_model()
        
    def summarize(self, reviews: List[str]) -> dict:
        if not self.model or not reviews:
            return self._fallback_summary()
            
        reviews_text = "\n- ".join(reviews)
        
        prompt = f"""
        Summarize the following customer reviews for a construction worker/supplier.
        Extract key strengths, weaknesses, and a 1-sentence overall quality assessment.
        
        Reviews:
        - {reviews_text}
        
        Return ONLY a JSON object with this exact structure:
        {{
            "strengths": ["strength 1", "strength 2"],
            "weaknesses": ["weakness 1", "weakness 2"],
            "overall_quality": "1 sentence summary"
        }}
        """
        
        response = generate(prompt)
        
        if not response or response.startswith("AI_ERROR"):
            return self._fallback_summary("AI is currently unavailable. Using generic summary.")

        try:
            text = response.strip()
            if text.startswith("```json"):
                text = text[7:-3].strip()
            elif text.startswith("```"):
                text = text[3:-3].strip()
                
            return json.loads(text)
        except Exception as e:
            print(f"Review Summarizer Parsing Error: {e}")
            return self._fallback_summary()

    def _fallback_summary(self, message: str = "Generally good service") -> dict:
        return {
            "strengths": [message],
            "weaknesses": ["None specified"],
            "overall_quality": "Average"
        }

review_summarizer = ReviewSummarizer()
