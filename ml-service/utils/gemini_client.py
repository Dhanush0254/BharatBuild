import os
import time
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Internal state
_client = None
_initialized = False


def _init():
    global _client, _initialized
    _initialized = True
    if not GEMINI_API_KEY:
        print("[WARNING] GEMINI_API_KEY not found. AI features will be disabled or mocked.")
        return

    # Use the new google-genai SDK (recommended)
    try:
        from google import genai
        _client = genai.Client(api_key=GEMINI_API_KEY)
        print("[OK] Gemini AI initialized (google-genai SDK)")
        return
    except ImportError:
        pass

    # Fallback to legacy google-generativeai
    try:
        import google.generativeai as genai_legacy
        genai_legacy.configure(api_key=GEMINI_API_KEY)
        _client = genai_legacy.GenerativeModel("gemini-1.5-flash")
        print("[OK] Gemini AI initialized (legacy google-generativeai SDK)")
    except (ImportError, Exception) as e:
        print(f"[ERROR] Could not initialize any Gemini SDK: {e}")


_init()


def get_gemini_model():
    """Return the raw client (for backward compat)."""
    return _client


def generate(prompt: str, max_retries: int = 2) -> str:
    """Universal generate helper with model fallback, retry, and error handling."""
    if _client is None:
        return None

    # Use stable models available in the free tier
    models_to_try = [
        "gemini-1.5-flash",        # High quota, fast
        "gemini-1.5-flash-8b",     # Even faster, lower quota
        "gemini-1.0-pro",          # Legacy but stable
    ]

    for model_name in models_to_try:
        for attempt in range(max_retries):
            try:
                # New google-genai SDK
                if hasattr(_client, 'models'):
                    response = _client.models.generate_content(
                        model=model_name,
                        contents=prompt,
                    )
                    return response.text.strip()
                else:
                    # Legacy SDK fallback
                    # Note: Legacy GenerativeModel object is bound to a model name.
                    # We need to re-initialize if we want to try a different model.
                    import google.generativeai as genai_legacy
                    temp_model = genai_legacy.GenerativeModel(model_name)
                    response = temp_model.generate_content(prompt)
                    return response.text.strip()

            except Exception as e:
                error_msg = str(e)

                # Quota exceeded — wait and retry once, then try next model
                if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
                    if attempt < max_retries - 1:
                        wait_time = (attempt + 1) * 5  # 5s, 10s
                        print(f"[RETRY] {model_name} quota hit, waiting {wait_time}s (attempt {attempt+1}/{max_retries})...")
                        time.sleep(wait_time)
                        continue
                    else:
                        print(f"[QUOTA] {model_name} exhausted after {max_retries} attempts, trying next model...")
                        break  # Try next model

                # Model not found — skip to next immediately
                if "404" in error_msg or "not found" in error_msg.lower():
                    print(f"[NOT FOUND] Model {model_name} not available, trying next...")
                    break  # Try next model

                # API key invalid
                if "401" in error_msg or "403" in error_msg or "PERMISSION_DENIED" in error_msg:
                    print(f"[AUTH ERROR] API key may be invalid: {error_msg[:200]}")
                    return "AI_ERROR: Invalid API key. Please check your GEMINI_API_KEY."

                # Other errors
                print(f"[GEMINI ERROR] {model_name}: {error_msg[:200]}")
                return f"AI_ERROR: {error_msg[:200]}"

    # All models and retries exhausted
    print("[QUOTA EXCEEDED] All Gemini models reached their limit.")
    return "AI_ERROR_QUOTA_EXCEEDED"
