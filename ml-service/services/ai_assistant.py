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
        if not self.model:
            return "AI Assistant is currently unavailable. Please check the API key configuration."
            
        prompt = f"{self.system_prompt}\n\nContext/Market Data:\n{context}\n\nUser: {message}\nAssistant:"
        
        response = generate(prompt)

        if response == "AI_ERROR_QUOTA_EXCEEDED":
            return "BharatBuild AI is currently at its limit (Gemini Free Tier). Please try again in about 60 seconds."
        
        if response and response.startswith("AI_ERROR:"):
            return "Sorry, I encountered an error. Please try again later."

        if not response:
            return "No response generated."

        return response
ai_assistant = AIAssistant()
