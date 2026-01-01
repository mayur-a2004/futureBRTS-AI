# BACKEND_AGENT OUTPUT V3 (PATCHED)
**Task:** Build Engine Backend Logic - PATCH

## 1. API Endpoints

### POST `/project/build`
- **Description:** Triggers the code generation process.
- **Input:** `{ blueprint_id: "..." }`
- **Output:** `{ build_id: "12345", status: "queued" }`

### GET `/project/build/{build_id}/status`
- **Description:** Polls for build progress.
- **Output:** `{ status: "processing", progress: 45, logs: [...] }`

### GET `/project/download/{build_id}`
- **Description:** Downloads the generated source code.
- **Output:** Binary Stream (`application/zip`)

**Patch Notes:**
- Added error handling for invalid `blueprint_id`.
- Increased timeout for large project builds.

## 2. Internal Logic
- **Timeout:** Set to 300s (was 60s).
- **Cleanup:** Temp files now deleted after 24h (verified cron job).
