from typing import Dict, Any, List, Tuple

class ListingScorer:
    def score_listing(self, listing: Dict[str, Any]) -> Dict[str, Any]:
        score = 0
        suggestions = []
        
        # 1. Image count (max 20 pts)
        images = listing.get('images', [])
        img_count = len(images)
        if img_count >= 3:
            score += 20
        elif img_count > 0:
            score += 10
            suggestions.append("Add at least 3 images to improve visibility.")
        else:
            suggestions.append("Add images to your listing. Listings with images get 3x more inquiries.")
            
        # 2. Description quality (max 20 pts)
        desc = listing.get('description', '')
        if len(desc) > 150:
            score += 20
        elif len(desc) > 50:
            score += 10
            suggestions.append("Add more details to your description. Aim for at least 150 characters.")
        else:
            suggestions.append("Provide a detailed description of your services/materials.")
            
        # 3. Verified documents (max 20 pts)
        is_verified = listing.get('is_verified', False)
        if is_verified:
            score += 20
        else:
            suggestions.append("Verify your profile with ID/Business documents to build trust.")
            
        # 4. Review score (max 20 pts)
        rating = listing.get('rating', 0.0)
        reviews = listing.get('review_count', 0)
        if reviews > 0:
            score += min(20, int(rating * 4)) # 5 stars = 20 pts
        else:
            score += 10 # Neutral starting point
            suggestions.append("Encourage past customers to leave a review.")
            
        # 5. Location completeness (max 20 pts)
        location = listing.get('location', {})
        if location.get('lat') and location.get('lng') and location.get('address'):
            score += 20
        else:
            score += 10
            suggestions.append("Provide exact map location to appear in local searches.")
            
        return {
            "quality_score": score,
            "suggestions": suggestions,
            "grade": "Excellent" if score >= 80 else "Good" if score >= 60 else "Needs Improvement"
        }

listing_scorer = ListingScorer()
