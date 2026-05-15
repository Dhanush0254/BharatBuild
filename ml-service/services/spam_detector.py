import re
from typing import Dict, Any

class SpamDetector:
    def __init__(self):
        self.spam_keywords = ['guaranteed', '100% free', 'click here', 'buy now', 'cheap cheap', 'discount!!!']
        
    def detect_spam(self, listing: Dict[str, Any]) -> Dict[str, Any]:
        score = 0.0
        reasons = []
        
        # 1. Check description for spam keywords
        desc = listing.get('description', '').lower()
        keyword_count = sum(1 for kw in self.spam_keywords if kw in desc)
        if keyword_count > 0:
            score += min(keyword_count * 0.2, 0.6)
            reasons.append(f"Found {keyword_count} spam keywords in description")
            
        # 2. Check for repeated phone numbers or excessive caps
        if len(re.findall(r'[A-Z]{4,}', listing.get('description', ''))) > 3:
            score += 0.2
            reasons.append("Excessive capitalization in description")
            
        # 3. Check for suspiciously low or high prices
        price = listing.get('price', -1)
        if price == 0 or price > 1000000:
            score += 0.3
            reasons.append("Suspicious price range")
            
        # 4. Check for duplicate descriptions (mocked by very short or generic description)
        if len(desc) < 10:
            score += 0.2
            reasons.append("Description is too short or generic")
            
        # Final decision
        is_spam = score >= 0.7
        
        return {
            "is_spam": is_spam,
            "spam_score": round(score, 2),
            "reasons": reasons
        }

spam_detector = SpamDetector()
