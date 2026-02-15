# Plant Social — Gemini AI Integration (Developer Guide)

A complete developer guide to the **Plant Doctor** feature powered by Google's Gemini 2.0 Flash API. Covers architecture, setup, code walkthrough, debugging, common errors, and how to extend it.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Setup & Configuration](#setup--configuration)
   - [Getting a Gemini API Key](#getting-a-gemini-api-key)
   - [Environment Variables](#environment-variables)
   - [Docker Configuration](#docker-configuration)
3. [Backend Code Walkthrough](#backend-code-walkthrough)
   - [gemini_service.py](#gemini_servicepy)
   - [plant_doctor.py (route)](#plant_doctorpy-route)
   - [main.py (registration)](#mainpy-registration)
4. [Frontend Code Walkthrough](#frontend-code-walkthrough)
   - [api.ts (client)](#apits-client)
   - [plant-doctor.tsx (screen)](#plant-doctortsx-screen)
5. [API Reference](#api-reference)
6. [Debugging Guide](#debugging-guide)
   - [Is the API key working?](#is-the-api-key-working)
   - [Testing the endpoint directly](#testing-the-endpoint-directly)
   - [Common errors & fixes](#common-errors--fixes)
   - [Reading Gemini raw responses](#reading-gemini-raw-responses)
   - [Frontend debugging](#frontend-debugging)
7. [How Gemini Differs from the CLIP/Pinecone Feature](#how-gemini-differs-from-the-clippinecone-feature)
8. [Extending the Feature](#extending-the-feature)
9. [Useful Links](#useful-links)

---

## Architecture Overview

```
┌─────────────────┐    POST /plant-doctor     ┌───────────────────┐
│                 │  ──────────────────────►  │                   │
│   Expo App      │   (image + context)       │   FastAPI Server  │
│   (Frontend)    │                           │   (Backend)       │
│                 │  ◄──────────────────────  │                   │
└─────────────────┘   { plant_name, tips, … } └────────┬──────────┘
                                                       │
                                              ┌────────▼──────────┐
                                              │   Gemini 2.0      │
                                              │   Flash API       │
                                              │                   │
                                              │  Analyzes image   │
                                              │  + user context   │
                                              │  Returns JSON     │
                                              │  diagnosis        │
                                              └───────────────────┘
```

**Data flow:**

1. User takes a photo and optionally types environment context (e.g. "Denver, CO, indoor, dry winter")
2. Frontend sends the image file + context string as multipart form data to `POST /plant-doctor`
3. Backend base64-encodes the image, builds a prompt with the system instructions + image + context
4. Backend sends the payload to the Gemini REST API (`generativelanguage.googleapis.com`)
5. Gemini returns a text response containing JSON with diagnosis data
6. Backend parses the JSON (stripping markdown fences if present) and returns it
7. Frontend renders the plant name, health badge, issues, tips, and summary

---

## Setup & Configuration

### Getting a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the key (starts with `AIza...`)
5. Paste it into your `.env` file (see below)

> **Free tier**: Gemini 2.0 Flash has a generous free tier — 15 requests/minute, 1M tokens/day as of early 2026. More than enough for development and demos.

### Environment Variables

In the project root `.env` file, add:

```bash
# Required for Plant Doctor
GEMINI_API_KEY=AIzaSy...your-key-here...

# Already existing vars you should have:
PINECONE_API_KEY=your-pinecone-key
EXPO_PUBLIC_API_URL=http://<YOUR_LAN_IP>:8080
LANIP=<YOUR_LAN_IP>
```

**Finding your LAN IP:**

```bash
# macOS
ipconfig getifaddr en0

# Linux
hostname -I | awk '{print $1}'

# Windows (PowerShell)
(Get-NetIPAddress -InterfaceAlias Wi-Fi -AddressFamily IPv4).IPAddress
```

### Docker Configuration

The `GEMINI_API_KEY` is passed into the API container via `docker-compose.yml`:

```yaml
api:
  environment:
    - PINECONE_API_KEY=${PINECONE_API_KEY}
    - GEMINI_API_KEY=${GEMINI_API_KEY}    # ← this line
```

The key is set in the container's environment and read at runtime by `gemini_service.py` using `os.getenv("GEMINI_API_KEY")`.

**Important**: After changing `.env`, you need to restart the containers:

```bash
docker compose down && docker compose up
```

You do **not** need to rebuild (`--build`) for env var changes — they're injected at runtime.

---

## Backend Code Walkthrough

### gemini_service.py

**Location**: `service/api/app/services/gemini_service.py`

This is the core Gemini integration. One async function that does everything.

#### Key constants

| Constant | Value | Notes |
|----------|-------|-------|
| `GEMINI_MODEL` | `gemini-2.0-flash` | Fast, cheap, great at vision tasks |
| `GEMINI_URL` | `https://generativelanguage.googleapis.com/v1beta/models/...` | REST endpoint |
| `SYSTEM_PROMPT` | (long string) | Instructs Gemini to act as "Plant Doctor" and return structured JSON |

#### `analyze_plant_image(image_bytes, mime_type, user_context="")`

**Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `image_bytes` | `bytes` | Raw image file bytes |
| `mime_type` | `str` | e.g. `"image/jpeg"`, `"image/png"` |
| `user_context` | `str` | Optional free-text environment context from user |

**Step by step:**

1. **Base64 encode** the image (Gemini API requires base64 for inline images)
2. **Build the `parts` array**:
   - Part 1: System prompt text (botanist instructions + JSON schema)
   - Part 2: Inline image data (`mime_type` + base64 `data`)
   - Part 3 (optional): User context text, if provided
3. **Build the request payload**:
   ```python
   {
     "contents": [{"parts": parts}],
     "generationConfig": {
       "temperature": 0.4,      # Low = more deterministic/factual
       "maxOutputTokens": 1024, # Plenty for a diagnosis
     }
   }
   ```
4. **Send the request** via `httpx.AsyncClient` with a 60-second timeout
5. **Extract the text** from `data["candidates"][0]["content"]["parts"][0]["text"]`
6. **Strip markdown fences**: Gemini sometimes wraps JSON in ` ```json ... ``` ` — we strip those
7. **Parse JSON**: Try `json.loads()`, or fall back to a structured wrapper if it fails

**Return value** (dict):

```json
{
  "plant_name": "Monstera Deliciosa",
  "health_status": "needs_attention",
  "issues": ["Minor yellowing on lower leaves", "Possible overwatering"],
  "tips": [
    "Allow the top 2 inches of soil to dry between waterings",
    "Ensure the pot has drainage holes",
    "Consider moving to brighter indirect light"
  ],
  "summary": "Your Monstera looks generally healthy but shows some early signs of overwatering..."
}
```

#### Key design decisions

- **API key re-read at call time**: `api_key = os.getenv("GEMINI_API_KEY", GEMINI_API_KEY)` — this means if you set the env var after the module was imported (e.g. in Docker), it still picks it up.
- **60s timeout**: Plant images can be large; Gemini vision can take 5-15s. The 60s timeout is generous to avoid false failures.
- **Graceful JSON fallback**: If Gemini returns non-JSON (rare), we wrap the raw text in a valid structure rather than crashing.

---

### plant_doctor.py (route)

**Location**: `service/api/app/routes/plant_doctor.py`

```python
@router.post("")   # → POST /plant-doctor
async def diagnose_plant(
    file: UploadFile = File(...),           # required image file
    context: Optional[str] = Form(""),      # optional text context
):
```

**What it does:**

1. Validates the upload is an image (`content_type` starts with `image/`)
2. Reads all bytes with `await file.read()`
3. Calls `analyze_plant_image(image_bytes, mime_type, context)`
4. Returns the dict directly (FastAPI auto-serializes to JSON)
5. On Gemini failure, returns HTTP 502 with error message

**Error codes:**

| Status | When | Meaning |
|--------|------|---------|
| 200 | Success | Diagnosis JSON returned |
| 400 | Non-image file | `"File must be an image"` |
| 502 | Gemini API error | `"Gemini analysis failed: <detail>"` |
| 422 | Missing file | FastAPI auto-validation (no file provided) |

---

### main.py (registration)

The router is registered in `service/api/app/main.py`:

```python
from .routes import images, plant_doctor

app.include_router(plant_doctor.router)   # mounts at /plant-doctor
```

The route prefix `/plant-doctor` is declared in the router itself:

```python
router = APIRouter(prefix="/plant-doctor", tags=["plant-doctor"])
```

---

## Frontend Code Walkthrough

### api.ts (client)

**Location**: `app/plant-social-app/lib/api.ts`

**Types:**

```typescript
export interface PlantDoctorResponse {
  plant_name: string;
  health_status: 'healthy' | 'needs_attention' | 'unhealthy';
  issues: string[];
  tips: string[];
  summary: string;
}
```

**`diagnosePlant(uri, context?)`:**

- Builds `FormData` with the image file (handles web vs native differently)
- Appends `context` field if provided
- Sends to `${API_BASE_URL}/plant-doctor` via `httpClient.upload()`
- Returns typed `PlantDoctorResponse`

The `API_BASE_URL` comes from `lib/config.ts`:

```typescript
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.250.81.211:8080';
```

Make sure `EXPO_PUBLIC_API_URL` in your `.env` points to your machine's LAN IP + port 8080.

---

### plant-doctor.tsx (screen)

**Location**: `app/plant-social-app/app/plant-doctor.tsx`

This is a standalone screen (not a tab) accessed via `router.push('/plant-doctor')` from the home screen.

**Key state variables:**

| State | Type | Purpose |
|-------|------|---------|
| `showCamera` | boolean | Toggle camera view |
| `loading` | boolean | Show spinner during API call |
| `result` | PlantDoctorResponse \| null | Diagnosis data |
| `context` | string | User's environment text input |

**UI sections (top to bottom):**

1. **Header** with back button and title
2. **Context input** — TextInput for environment details (location, climate, etc.)
3. **"Scan Your Plant" button** — opens camera
4. **Results** (when available):
   - Plant name + health badge (green/yellow/red)
   - Summary paragraph
   - Issues list (numbered)
   - Personalized care tips (numbered with emojis)
   - "Want to Learn More?" section with deep-dive category buttons
5. **"Scan Another Plant" button** — resets state

**Deep-dive buttons**: The screen scans the `issues` and `tips` arrays for keywords (water, light, pest, soil) and shows contextual buttons that link back to the Care Library (home screen).

---

## API Reference

### `POST /plant-doctor`

**Content-Type**: `multipart/form-data`

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File (image/*) | Yes | Plant photo (JPEG, PNG, etc.) |
| `context` | string | No | Free-text environment context |

**Success Response (200):**

```json
{
  "plant_name": "Peace Lily (Spathiphyllum)",
  "health_status": "needs_attention",
  "issues": [
    "Brown leaf tips indicating low humidity",
    "Slight drooping suggesting underwatering"
  ],
  "tips": [
    "Water when the top inch of soil feels dry — Peace Lilies are dramatic droppers but bounce back quickly",
    "Mist leaves daily or place on a pebble tray to raise humidity, especially important in Denver's dry winter air",
    "Keep away from heating vents — the dry hot air worsens brown tips",
    "Feed monthly in spring/summer with balanced liquid fertilizer at half strength"
  ],
  "summary": "Your Peace Lily is showing classic signs of low humidity stress, which is very common in Denver's dry winter climate. The brown tips and slight droop are easily fixable with a few adjustments to watering and humidity."
}
```

**Error Responses:**

```json
// 400 — not an image
{ "detail": "File must be an image" }

// 502 — Gemini API failure
{ "detail": "Gemini analysis failed: 403 Forbidden" }

// 422 — missing file field
{ "detail": [{ "loc": ["body", "file"], "msg": "field required" }] }
```

---

## Debugging Guide

### Is the API key working?

**Quick test** — run this inside the API container:

```bash
# Enter the container
docker compose exec api bash

# Test the key directly
python3 -c "
import os, httpx
key = os.getenv('GEMINI_API_KEY', '')
print(f'Key present: {bool(key)}')
print(f'Key prefix: {key[:10]}...' if key else 'NO KEY SET')
r = httpx.get(f'https://generativelanguage.googleapis.com/v1beta/models?key={key}')
print(f'Status: {r.status_code}')
if r.status_code == 200:
    models = [m['name'] for m in r.json().get('models', []) if 'flash' in m['name']]
    print(f'Flash models available: {models}')
else:
    print(f'Error: {r.text[:200]}')
"
```

**Expected output if working:**

```
Key present: True
Key prefix: AIzaSyBx2...
Status: 200
Flash models available: ['models/gemini-2.0-flash', ...]
```

**If you see `403` or `401`:** Your key is invalid, expired, or doesn't have the Generative Language API enabled. Go back to [Google AI Studio](https://aistudio.google.com/apikey) and regenerate.

**If you see `Key present: False`:** The env var isn't being passed. Check your `.env` file and restart containers.

---

### Testing the endpoint directly

Use `curl` to test the backend without the frontend:

```bash
# From your host machine (not inside Docker)
# Replace with a real image path

curl -X POST http://localhost:8080/plant-doctor \
  -F "file=@/path/to/plant-photo.jpg" \
  -F "context=Indoor plant in Seattle, winter, north-facing window" \
  | python3 -m json.tool
```

**Minimal test (no context):**

```bash
curl -X POST http://localhost:8080/plant-doctor \
  -F "file=@plant.jpg" \
  | python3 -m json.tool
```

**Using the FastAPI interactive docs:**

Visit [http://localhost:8080/docs](http://localhost:8080/docs) in your browser. You'll see the `/plant-doctor` endpoint listed — you can upload a file and test directly from the Swagger UI.

---

### Common errors & fixes

#### `502 — Gemini analysis failed: 403 Forbidden`

**Cause**: Invalid API key or Gemini API not enabled.

**Fix**:
1. Verify the key at [Google AI Studio](https://aistudio.google.com/apikey)
2. Make sure the key is in your `.env` file with no extra spaces or quotes:
   ```
   GEMINI_API_KEY=AIzaSyBx2k...
   ```
   NOT: `GEMINI_API_KEY="AIzaSyBx2k..."` (no quotes needed)
3. Restart containers: `docker compose down && docker compose up`

#### `502 — Gemini analysis failed: 429 Too Many Requests`

**Cause**: Rate limit exceeded (15 RPM on free tier).

**Fix**: Wait 60 seconds and try again. For sustained use, consider upgrading to a paid plan.

#### `502 — Gemini analysis failed: <HTTPStatusError ...>`

**Cause**: General Gemini API error. Could be temporary outage.

**Fix**:
1. Check [Google Cloud Status](https://status.cloud.google.com/) for outages
2. Try again in a few minutes
3. Check the API container logs for details: `docker compose logs api --tail=50`

#### `422 — Unprocessable Entity`

**Cause**: The frontend isn't sending the form data correctly.

**Fix**: Make sure the FormData has a field named exactly `file` with the image. For debugging, check the network tab in your browser (if using Expo web) or add logging in `api.ts`.

#### Connection Refused / Network Error (frontend)

**Cause**: Frontend can't reach the backend.

**Fix**:
1. Make sure containers are running: `docker compose ps`
2. Check `EXPO_PUBLIC_API_URL` in `.env` matches your machine's LAN IP:
   ```bash
   # Find your LAN IP
   ipconfig getifaddr en0   # macOS
   ```
3. Make sure it's `http://<LAN_IP>:8080`, not `localhost` (phones can't reach your laptop's localhost)
4. Restart the Expo dev server after changing env vars (it caches them at build time)

#### Gemini returns non-JSON / garbled response

**Cause**: Rare, but Gemini occasionally returns markdown-wrapped or malformed JSON.

**How the code handles it**: `gemini_service.py` strips ` ```json ``` ` fences and falls back to wrapping raw text in a valid structure. Check the container logs:

```bash
docker compose logs api --tail=20 | grep -i "gemini\|plant-doctor\|error"
```

If it's consistently returning bad JSON, the `SYSTEM_PROMPT` might need tweaking. You can add more explicit instructions like `"Return ONLY valid JSON with no markdown formatting."`.

---

### Reading Gemini raw responses

For deep debugging, add a temporary print statement in `gemini_service.py`:

```python
# In analyze_plant_image(), after getting the response:
text = data["candidates"][0]["content"]["parts"][0]["text"]
print(f"[GEMINI RAW] {text[:500]}")   # ← Add this temporarily
```

Then watch container logs:

```bash
docker compose logs api -f
```

This shows you exactly what Gemini returned before any parsing, which is invaluable for diagnosing JSON parse failures.

---

### Frontend debugging

#### Expo / React Native

**View console logs:**

- **Expo Go on phone**: Shake device → "Open JS Debugger" → browser console
- **Terminal**: Logs appear in the Metro bundler terminal
- **Web**: Regular browser DevTools console (F12)

**Network requests** (Expo web):

1. Open browser DevTools (F12) → Network tab
2. Tap "Scan Your Plant" and take a photo
3. Look for the `plant-doctor` request
4. Check the request payload (should have `file` and optionally `context`)
5. Check the response body for the JSON diagnosis

**Add extra logging in `api.ts`:**

```typescript
export async function diagnosePlant(uri: string, context?: string): Promise<PlantDoctorResponse> {
  console.log('[diagnosePlant] uri:', uri);
  console.log('[diagnosePlant] context:', context);
  // ... existing code ...
  const result = await httpClient.upload<PlantDoctorResponse>(`${API_BASE_URL}/plant-doctor`, formData);
  console.log('[diagnosePlant] result:', JSON.stringify(result, null, 2));
  return result;
}
```

#### Common frontend gotchas

- **`EXPO_PUBLIC_*` vars are baked in at build time.** If you change `EXPO_PUBLIC_API_URL` in `.env`, you must restart Metro (`npx expo start` or `docker compose restart plant-social-app`).
- **TypeScript routing**: `router.push('/plant-doctor')` may show a type error because expo-router generates route types. The code uses `as any` to work around this. It's safe.
- **Camera permissions**: On iOS simulator, the camera doesn't work. Use a physical device or Expo web for testing the full flow.

---

## How Gemini Differs from the CLIP/Pinecone Feature

| Aspect | Care Library (CLIP/Pinecone) | Plant Doctor (Gemini) |
|--------|-----------------------------|-----------------------|
| **AI model** | CLIP ViT-B-32 + Pinecone vector search | Gemini 2.0 Flash (multimodal LLM) |
| **How it works** | Embeds image → finds similar text in DB | Sends image to LLM → gets generated response |
| **Responses** | Pre-written care guides (curated) | Dynamically generated, personalized |
| **User context** | Not supported | Yes — location, climate, care history |
| **Needs seeding** | Yes (`python -m app.seed`) | No — no database needed |
| **Offline possible** | No (needs Pinecone) | No (needs Google API) |
| **Cost** | Pinecone free tier | Gemini free tier (15 RPM) |
| **Best for** | Quick reference, general tips | Specific diagnosis, tailored advice |
| **Speed** | ~1-3 seconds | ~5-15 seconds |
| **Accent color (UI)** | Green (`#2E7D32`) | Purple (`#7C3AED`) |

They're designed to complement each other: Care Library for evergreen reference, Plant Doctor for personalized diagnosis.

---

## Extending the Feature

### Changing the Gemini model

In `gemini_service.py`, change:

```python
GEMINI_MODEL = "gemini-2.0-flash"
```

Options:
- `gemini-2.0-flash` — fast, cheap, good for vision (current)
- `gemini-2.0-flash-lite` — even faster/cheaper, slightly lower quality
- `gemini-2.5-pro` — best quality, slower, more expensive
- `gemini-2.5-flash` — good balance, latest generation

Check available models at [Google AI model docs](https://ai.google.dev/gemini-api/docs/models).

### Customizing the system prompt

Edit `SYSTEM_PROMPT` in `gemini_service.py`. The current prompt asks for:

- `plant_name` — species identification
- `health_status` — one of `healthy | needs_attention | unhealthy`
- `issues` — array of problems
- `tips` — 3-5 actionable tips
- `summary` — friendly paragraph

You can add more fields (e.g. `"watering_schedule"`, `"light_needs"`, `"toxicity_warning"`) — just update the prompt and the `PlantDoctorResponse` TypeScript interface in `api.ts` to match.

### Adjusting generation parameters

In `gemini_service.py`, the `generationConfig`:

```python
"generationConfig": {
    "temperature": 0.4,       # 0.0 = deterministic, 1.0 = creative
    "maxOutputTokens": 1024,  # Max response length
}
```

- **Lower temperature** (0.1-0.3): More consistent, factual responses
- **Higher temperature** (0.6-0.9): More varied, creative responses
- **maxOutputTokens**: Increase if responses are getting truncated

### Adding new response fields

1. Update `SYSTEM_PROMPT` in `gemini_service.py` to request the new field
2. Update `PlantDoctorResponse` in `app/plant-social-app/lib/api.ts`
3. Update `plant-doctor.tsx` to render the new data

### Adding image history / saving diagnoses

Currently, diagnoses are not persisted. To add history:

1. Add a database (SQLite, PostgreSQL, etc.) to the backend
2. Save each diagnosis with timestamp, image hash, and result JSON
3. Add a `GET /plant-doctor/history` endpoint
4. Add a history screen in the frontend

---

## Useful Links

| Resource | URL |
|----------|-----|
| Google AI Studio (API Keys) | https://aistudio.google.com/apikey |
| Gemini API Docs | https://ai.google.dev/gemini-api/docs |
| Gemini Model List | https://ai.google.dev/gemini-api/docs/models |
| Gemini Pricing | https://ai.google.dev/pricing |
| Gemini REST API Reference | https://ai.google.dev/api/generate-content |
| FastAPI Docs | https://fastapi.tiangolo.com |
| Expo Router Docs | https://docs.expo.dev/router/introduction |
| Project Backend | `service/api/app/` |
| Project Frontend | `app/plant-social-app/` |

---

## Quick Command Reference

```bash
# Start everything
docker compose up

# Start with rebuild (after changing requirements.txt or Dockerfile)
docker compose up --build

# Stop everything
docker compose down

# View API logs (live)
docker compose logs api -f

# View just the last 50 lines
docker compose logs api --tail=50

# Shell into the API container (for debugging)
docker compose exec api bash

# Test Gemini endpoint with curl
curl -X POST http://localhost:8080/plant-doctor \
  -F "file=@photo.jpg" \
  -F "context=Denver CO, indoor, winter" \
  | python3 -m json.tool

# Open FastAPI Swagger docs
open http://localhost:8080/docs

# Check if API is running
curl http://localhost:8080/

# Watch for Gemini-specific logs
docker compose logs api -f 2>&1 | grep -i "gemini\|plant-doctor"
```

---

**Questions?** Check the main [AI_PIPELINE.md](AI_PIPELINE.md) for the CLIP/Pinecone feature docs, or [USER_GUIDE.md](../USER_GUIDE.md) for end-user documentation.
