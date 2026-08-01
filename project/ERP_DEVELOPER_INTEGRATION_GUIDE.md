# 🏫 Future Education OS & BRTS - B2B ERP Integration Guide

Welcome to the **Future Education OS & Future BRTS B2B Integration API**. This guide provides external ERP developers with complete documentation for connecting School Management Systems, Colleges, and Coaching Institute Software with the Future Education OS AI Gateway.

---

## 🔑 1. Authentication & Security

All ERP requests to Future Education OS require B2B Credentials provisioned via the **Future Education OS Admin Panel** (`/admin/education-os` -> `School & ERP B2B` tab).

### Required Headers
For protected B2B endpoints:
```http
X-Tenant-Org-ID: YOUR_ORG_ID
X-API-Key: YOUR_RAW_API_KEY
Content-Type: application/json
```

---

## 🤖 2. 1-Line Embedded Floating AI Assistant Web SDK

Add our glowing **Future Education AI Assistant** directly into ANY School ERP website/HTML page with a single script tag:

```html
<!-- 🤖 Future Education AI Assistant Floating Widget Embed -->
<script 
  src="http://localhost:7001/sdk/future-ai.js" 
  data-tenant="mount_carmel_school" 
  data-api-key="fbrts_ak_mt_carmel_8a92f">
</script>
```

This automatically injects a floating glassmorphism AI Assistant in the bottom-right corner of the ERP UI for students and teachers!

---

## 🎛️ 3. Granular Permission Enforcement & Available Feature Endpoints

Every API request is automatically validated against the school organization's ON/OFF module feature flags set in the Admin Control Panel. If a module is disabled by the admin, the Gateway responds with `403 Forbidden`.

### 3.1 AI Tutor Chat Bot (`aiTutor`)
* **POST** `/api/v1/tenant/ai-tutor-chat`
* **Body:**
```json
{
  "tenantId": "mount_carmel_school",
  "studentName": "Aarav Sharma",
  "subject": "Physics",
  "prompt": "Explain Newton's Third Law of Motion with daily life examples."
}
```

### 3.2 Syllabus & Study Roadmaps (`studyRoadmaps`)
* **POST** `/api/v1/tenant/generate-roadmap`
* **Body:**
```json
{
  "tenantId": "mount_carmel_school",
  "subject": "Mathematics",
  "grade": "Class 10",
  "board": "CBSE 2026"
}
```

### 3.3 Teacher-to-Student Assignment Push (`parentTeacherHub`)
* **POST** `/api/v1/tenant/push-assignment`
* **Body:**
```json
{
  "tenantId": "mount_carmel_school",
  "teacherName": "Mrs. Anjali Mehta",
  "assignmentTitle": "Solve Chapter 4 Trigonometry Exercises",
  "grade": "Class 10-A",
  "dueDate": "2026-08-05",
  "studentIds": ["STU-101", "STU-102", "STU-103"]
}
```

### 3.4 1v1 Student Quiz Battles (`quizBattles`)
* **POST** `/api/v1/tenant/quiz-battle`
* **Body:**
```json
{
  "tenantId": "mount_carmel_school",
  "studentId": "STU-101",
  "subject": "Science"
}
```

### 3.5 Dynamic ERP Student & Teacher Database User Sync
* **POST** `/api/v1/tenant/sync-users`
* **Headers:** `X-Tenant-Org-ID: mount_carmel_school`
* **Body:**
```json
{
  "tenantId": "mount_carmel_school",
  "users": [
    {
      "externalId": "STU-10492",
      "name": "Aarav Sharma",
      "role": "STUDENT",
      "grade": "Class 10-A",
      "email": "aarav.s@school.edu.in"
    },
    {
      "externalId": "TCH-901",
      "name": "Mrs. Anjali Mehta",
      "role": "TEACHER",
      "subject": "Mathematics",
      "email": "anjali.m@school.edu.in"
    }
  ]
}
```
* **Response:**
```json
{
  "success": true,
  "tenantId": "mount_carmel_school",
  "syncedCount": 2
}
```

---

## 🌐 4. Base Gateway URLs

| Environment | Base URL | Port |
| :--- | :--- | :--- |
| **Local Development** | `http://localhost:7001` | Gateway: `7001` |
| **Production** | `https://api.futurebuilder.io` | SSL Standard: `443` |

---

## 🚀 3. Core B2B API Endpoints

### 3.1 Onboard School / Tenant Organization
* **POST** `/api/v1/tenant/register`
* **Body:**
```json
{
  "orgId": "DPS-DELHI-001",
  "orgName": "Delhi Public School, R.K. Puram",
  "orgType": "SINGLE_SCHOOL",
  "webhookUrl": "https://erp.dpsrkp.edu/api/v1/ai-webhooks",
  "secretKey": "custom_secret_if_any"
}
```
* **Response:**
```json
{
  "success": true,
  "message": "B2B Tenant Organization onboarded successfully",
  "tenant": {
    "orgId": "DPS-DELHI-001",
    "orgName": "Delhi Public School, R.K. Puram",
    "orgType": "SINGLE_SCHOOL",
    "apiKey": "fbrts_ak_...",
    "secretKey": "fbrts_sk_...",
    "webhookUrl": "https://erp.dpsrkp.edu/api/v1/ai-webhooks",
    "billing": {
      "walletBalanceINR": 1000,
      "planType": "PREPAID"
    }
  }
}
```
--

### 3.2 Vision AI Homework Auto-Checker (Notebook Image AI)
* **POST** `/api/v1/tenant/grade-homework`
* **Body:**
```json
{
  "tenantId": "DPS-DELHI-001",
  "externalId": "STUDENT-10492",
  "studentName": "Aarav Sharma",
  "subject": "Mathematics",
  "chapter": "Quadratic Equations",
  "imageUrl": "https://storage.school.edu/submissions/math_hw_101.jpg",
  "webhookUrl": "https://erp.dpsrkp.edu/api/v1/ai-webhooks"
}
```
* **Response:**
```json
{
  "success": true,
  "result": {
    "scoreObtained": 9.5,
    "maxScore": 10.0,
    "feedback": "Excellent step-by-step resolution of roots. Minor sign oversight on Q3.",
    "gradedAt": "2026-07-30T21:00:00.000Z"
  }
}
```

---

### 3.3 360° Principal Search Dossier
* **GET** `/api/v1/tenant/principal-dossier?studentId=STUDENT-10492&name=Aarav`
* **Response:**
```json
{
  "success": true,
  "dossier": {
    "studentId": "STUDENT-10492",
    "studentName": "Aarav Sharma",
    "academicMasteryScore": 92.4,
    "weakTopics": ["Complex Numbers", "Integration by Parts"],
    "strongTopics": ["Quadratic Equations", "Vectors"],
    "recentBattlesWon": 14,
    "aiTutorEngagementHours": 38.5
  }
}
```

---

### 3.4 Webhook Testing & Payload Format
* **POST** `/api/v1/tenant/test-webhook`
* **Body:**
```json
{
  "webhookUrl": "https://erp.dpsrkp.edu/api/v1/ai-webhooks",
  "event": "HOMEWORK_GRADED",
  "tenantId": "DPS-DELHI-001",
  "externalId": "STUDENT-10492",
  "studentName": "Aarav Sharma",
  "scoreObtained": 9.5,
  "maxScore": 10.0
}
```

#### Dispatched Webhook Payload Structure
When Future Education OS evaluates homework or finishes a quiz battle, it dispatches an HTTP `POST` to your registered `webhookUrl`:
```json
{
  "event": "HOMEWORK_GRADED",
  "tenantId": "DPS-DELHI-001",
  "externalId": "STUDENT-10492",
  "studentName": "Aarav Sharma",
  "scoreObtained": 9.5,
  "maxScore": 10.0,
  "gradedAt": "2026-07-30T21:00:00.000Z"
}
```

---

## 💼 4. Wallet & Billing Architecture

* **Billing Model:** Prepaid / Credits-based or Enterprise Monthly Subscription.
* **Top-Up Wallet Endpoint (Admin Only):**
  * **POST** `/api/v1/tenant/update-wallet`
  * **Body:** `{"orgId": "DPS-DELHI-001", "walletBalanceINR": 5000, "planType": "ENTERPRISE"}`

---

## 🛠️ 5. Admin Panel Management

Administrators can view, onboard, top-up wallets, and manage B2B School HMAC keys from the **School & ERP B2B** tab inside the Future Education OS Admin Panel:
* URL: `http://localhost:5173/admin/education-os/school-management`

---

*Architected for Future Education OS & Future BRTS Master Ecosystem* 🚀
