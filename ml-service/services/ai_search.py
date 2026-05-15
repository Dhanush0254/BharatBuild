import json
from utils.gemini_client import get_gemini_model, generate

class AISearch:
    def __init__(self):
        self.model = get_gemini_model()
        
    def parse_query(self, query: str) -> dict:
        if not self.model:
            return self._mock_parse(query)
            
        prompt = f"""
        You are an AI search assistant for BharatBuild, an Indian construction marketplace.
        Parse the user's search query (which could be in English, Telugu, Hindi, Hinglish, or Telugish).
        Extract the intent, category, subcategory, district/location, and budget intent if present.
        
        Important Synonyms:
        - "naapa isuka" or "isuka" -> River Sand
        - "itukallu" -> Bricks
        - "ukku" -> Steel
        - "jelly" -> Gravel
        - "lorry", "truck", "tempo" -> Transport
        
        Valid categories: worker, machinery, materials, service, transport
        
        User Query: "{query}"
        
        Return ONLY a JSON object with this exact structure:
        {{
            "category": "worker|machinery|materials|service|transport|unknown",
            "subcategory": "specific type (e.g. mestri, jcb, cement, architect, lorry, sand)",
            "district": "extracted location or null",
            "intent": "find_provider|get_estimate|general_query|book_transport",
            "budget_intent": "cheap|premium|normal|null"
        }}
        """
        
        response = generate(prompt)
        
        if not response or response.startswith("AI_ERROR"):
            return self._mock_parse(query)
            
        try:
            # Clean markdown formatting if present
            text = response.strip()
            if text.startswith("```json"):
                text = text[7:-3].strip()
            elif text.startswith("```"):
                text = text[3:-3].strip()
                
            return json.loads(text)
        except Exception as e:
            print(f"AI Search Parsing Error: {e}")
            return self._mock_parse(query)
            
    def _mock_parse(self, query: str) -> dict:
        q = query.lower()
        cat = "unknown"
        subcat = ""
        
        if "jcb" in q or "crane" in q or "tractor" in q:
            cat = "machinery"
            subcat = "jcb" if "jcb" in q else "crane" if "crane" in q else "tractor"
        elif "cement" in q or "sand" in q or "brick" in q or "isuka" in q:
            cat = "materials"
            subcat = "cement" if "cement" in q else "sand" if "sand" in q or "isuka" in q else "bricks"
        elif "lorry" in q or "truck" in q or "transport" in q:
            cat = "transport"
            subcat = "lorry" if "lorry" in q else "truck" if "truck" in q else "transport"
        elif "mestri" in q or "worker" in q or "mason" in q or "plumber" in q:
            cat = "worker"
            subcat = "mestri" if "mestri" in q else "mason" if "mason" in q else "plumber"
            
        return {
            "category": cat,
            "subcategory": subcat,
            "district": "Hyderabad" if "hyderabad" in q else None,
            "intent": "book_transport" if cat == "transport" else "find_provider",
            "budget_intent": "cheap" if "cheap" in q else "normal"
        }

ai_search = AISearch()
