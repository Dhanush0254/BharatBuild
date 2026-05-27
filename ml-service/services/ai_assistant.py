from utils.gemini_client import get_gemini_model, generate

class AIAssistant:
    def __init__(self):
        self.model = get_gemini_model()
        self.system_prompt = """
        You are the BharatBuild AI Assistant. Your goal is to provide **short, direct, and actionable** construction advice for users in Telangana.
        
        Response Guidelines:
        1. **Brevity is Key**: Keep responses under 3-4 short paragraphs. Avoid long introductions or conclusions.
        2. **Direct Action**: Tell the user exactly what to do or where to look on the platform.
        3. **No Fluff**: Skip generic advice. Focus on specific steps for finding Mestris, materials, or prices.
        
        Formatting Rules:
        1. **Bold**: Use `**text**` for prices, category names, and key actions.
        2. **Lists**: Use bullet points for quick options.
        3. **Structure**: One sentence per point where possible.
        
        Example Style:
        To find a **Plumber** or **Electrician**:
        *   **Check the Directory**: Go to the "Mestris" section and filter by your city.
        *   **Compare Ratings**: Look for 4+ star rated professionals.
        *   **Request Quote**: Post a job in the **RFQ section** for competitive pricing.
        *   **Tip**: Ensure they have a valid license for complex electrical work.
        
        If you don't know market data, tell them to check the **"Market Rates"** tab.
        """
        
    def chat(self, message: str, context: str = "") -> str:
        model = self.model or get_gemini_model()
        
        if not model:
            # Fallback for when API key is missing or SDK failed to init
            return self._get_fallback_advice(message)
            
        prompt = f"{self.system_prompt}\n\nContext/Market Data:\n{context}\n\nUser: {message}\nAssistant:"
        
        response = generate(prompt)
        
        if response and response.startswith("AI_ERROR"):
            # If it's a specific error or quota exceeded, return fallback instead of an error string
            return self._get_fallback_advice(message)

        if not response:
            return self._get_fallback_advice(message)

        return response

    def _get_fallback_advice(self, message: str) -> str:
        msg = message.lower()
        if "cement" in msg or "price" in msg or "rate" in msg or "cost" in msg:
            return "To check the latest **Cement** or **Material** rates, please visit our **Market Rates** tab. Currently, cement is approximately ₹350-420 per bag in Telangana, while steel is around ₹65 per kg. Let me know if you need specific material estimates!"
        if "worker" in msg or "mestri" in msg or "plumber" in msg or "labor" in msg or "electrician" in msg or "painter" in msg:
            return "You can find verified **Mestris** and **Workers** in our directory. Filter by your location to see available professionals, compare their ratings, and request quotes directly."
        if "estimate" in msg or "calculator" in msg or "material" in msg or "sand" in msg or "brick" in msg:
            return "For accurate material estimates, please use the **Material Estimator** tool on our platform. It calculates exact quantities of bricks, cement, sand, and steel based on your square footage and work type."
        
        return "I can help you find workers, check material prices, or estimate construction costs. Just let me know what you're looking for! For detailed listings, you can always check our **Directory** or **Market Rates** sections."

ai_assistant = AIAssistant()
