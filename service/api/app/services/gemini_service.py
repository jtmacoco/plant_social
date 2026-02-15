import base64
import os
import httpx

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = "gemini-2.0-flash"
GEMINI_URL = (
    f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}"
    f":generateContent?key={GEMINI_API_KEY}"
)

SYSTEM_PROMPT = (
    "You are an expert botanist and plant-care advisor called Plant Doctor. "
    "The user will send you an image of a plant. They may also provide extra "
    "context about their environment (location, climate, indoor/outdoor, season, "
    "recent care, etc.). Use ALL available context to tailor your advice. "
    "Respond with a JSON object (no markdown fences) with the following keys:\n"
    '  "plant_name": best guess of the plant species/common name,\n'
    '  "health_status": one of "healthy", "needs_attention", or "unhealthy",\n'
    '  "issues": an array of strings describing any problems you notice '
    "(yellowing, pests, overwatering, etc.). Empty array if healthy,\n"
    '  "tips": an array of 3-5 actionable care tips specific to this plant, '
    "its current condition, AND the user's environment/context,\n"
    '  "summary": a short friendly paragraph summarizing your assessment.\n'
    "Be specific and practical. Factor in the user's climate, location, and "
    "growing conditions when giving tips. If you cannot identify the plant, "
    "still give general care advice based on what you see."
)


async def analyze_plant_image(
    image_bytes: bytes, mime_type: str, user_context: str = ""
) -> dict:
    """Send a plant image to Gemini and return structured care advice."""
    image_b64 = base64.b64encode(image_bytes).decode("utf-8")

    parts: list[dict] = [
        {"text": SYSTEM_PROMPT},
        {
            "inline_data": {
                "mime_type": mime_type,
                "data": image_b64,
            }
        },
    ]

    if user_context.strip():
        parts.append(
            {"text": f"\nAdditional context from the user: {user_context.strip()}"}
        )

    payload = {
        "contents": [{"parts": parts}],
        "generationConfig": {
            "temperature": 0.4,
            "maxOutputTokens": 1024,
        },
    }

    # Build URL at call-time so env var can be set after import
    api_key = os.getenv("GEMINI_API_KEY", GEMINI_API_KEY)
    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}"
        f":generateContent?key={api_key}"
    )

    async with httpx.AsyncClient(timeout=60.0) as client:
        resp = await client.post(url, json=payload)
        resp.raise_for_status()
        data = resp.json()

    # Extract the text content from Gemini's response
    text = data["candidates"][0]["content"]["parts"][0]["text"]

    # Try to parse the JSON from the response
    import json

    # Strip markdown code fences if present
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("\n", 1)[1]  # remove first line
    if cleaned.endswith("```"):
        cleaned = cleaned.rsplit("```", 1)[0]
    cleaned = cleaned.strip()

    try:
        result = json.loads(cleaned)
    except json.JSONDecodeError:
        # If parsing fails, return the raw text in a structured format
        result = {
            "plant_name": "Unknown",
            "health_status": "needs_attention",
            "issues": [],
            "tips": [cleaned],
            "summary": cleaned,
        }

    return result
