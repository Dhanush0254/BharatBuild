from utils.gemini_client import get_gemini_model, generate

class AIAssistant:
    def __init__(self):
        self.model = get_gemini_model()
        self.system_prompt = """
        You are the BharatBuild AI Assistant. 
        You help users with finding construction workers, machinery, and materials in Telangana, India.
        You can also help with estimating material costs.
        Keep your answers concise, practical, and strictly related to construction, marketplace features, and pricing.
        Do NOT hallucinate. Do NOT act like a generic AI. You are a domain-specific expert.
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
