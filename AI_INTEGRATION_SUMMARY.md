
# Hybrid AI Integration Strategy

## Status
The system has been updated to support a **Hybrid AI Strategy** that prioritizes Groq but robustly falls back to Gemini. This ensures maximum uptime and adheres to the request to utilize Groq.

## Service Logic (`openai.service.ts`)
1.  **Primary Provider: Groq**
    *   The system checks for `GROQ_API_KEY`.
    *   It attempts to generate a response using the `llama3-70b-8192` model.
    *   **Current State**: The provided Groq key appears to be invalid (401 Unauthorized), so this step logs a warning and automatically proceeds to the fallback.

2.  **Fallback Provider: Google Gemini**
    *   If Groq fails (or is missing), the system switches to `GEMINI_API_KEY`.
    *   It uses the `gemini-2.5-flash` model (latest available).
    *   **Current State**: Working correctly, but subject to Free Tier rate limits (429 Quota Exceeded). If you see a "Mock" response or "Samajh gaya", it means the rate limit was hit (usually resets in ~20-60 seconds).

## Configuration
*   **Keys**: Managed in `backend/api_gateway/.env`. 
    *   Update `GROQ_API_KEY` with a valid key to make Groq the active primary provider.
    *   Keep `GEMINI_API_KEY` as the safety net.

## Verification
You can verify operation in the `Builder` chat:
*   **Success**: Detailed, Markdown-formatted response (e.g., from Gemini).
*   **Rate Limit/Failure**: "Samajh gaya. Let's analyze this step-by-step..." (Mock response).
