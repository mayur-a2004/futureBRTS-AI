---
description: How to use and verify the 4-Stage Task System
---

# Task Verification Flow

This workflow explains how the strict 4-stage task system works in FutureBRTS.

## 1. System Overview
FutureBRTS splits tasks into 4 strict stages:
1. **Main Task**: The high-level objective (e.g., "Learn React State").
2. **Sub-Tasks**: Breakdowns of the main task.
3. **Micro-Tasks**: Specific actionable steps.
4. **Verification**: The mandatory check stage (AI or Manual).

## 2. Verification Rules
- **Locking**: You cannot mark a task as `Done` if it requires verification (`verification.required: true`) and hasn't been verified yet.
- **Attempting to Bypass**: If you try to checkbox a locked task, the system will alert you: "Verification Required".

## 3. How to Verify a Task
1. Open **Today's Tasks** (`/today-task`).
2. Click on the Task to open the **Detail Modal**.
3. Scroll to the "Verification Required (Stage 4)" section.
4. Review the criteria (e.g., "Submit code snippet").
5. Click **"Step 4: Verify Output"**.
   - *Currently acts as a mock verification for demo purposes.*
6. Once verified, the status changes to "Verified & Approved".
7. You can now close the modal and mark the task as **Done**.

## 4. API Endpoints
- `PUT /api/tasks`: Updates status (enforces verification check).
- `POST /api/tasks/verify`: Verifies the task (sets `verification.isVerified = true`).
