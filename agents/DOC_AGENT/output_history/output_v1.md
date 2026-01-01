# DOC_AGENT OUTPUT V1
**Task:** Create documentation for Module-1 Foundation

# Foundation Engine Overview

## 1. Overview
The Foundation Engine serves as the core entry point for the FutureBuilder platform. It manages user identity, role selection, and the gamified "Stage" tracking system. This module ensures that every user starts with a clear profile and a tracked progression path.

## 2. User Roles
The system supports three distinct user personas, each tailoring the future experience:
*   **Student:** Focused on learning paths, skill acquisition, and academic growth.
*   **Job Seeker:** Focused on resume building, interview prep, and job applications.
*   **Startup:** Focused on business planning, MVP creation, and scaling.

## 3. Stage Tracking Logic
The "Stage" is a numerical representation (0-100) of a user's progress.
*   **Initialization:** All users start at Stage 0.
*   **Progression:** Completing tasks (e.g., profile completion, first course) increments the stage.
*   **Logging:** Every stage change is historically recorded to allow for progress visualization graphs.

## 4. API List
The following core APIs power Module-1:
*   **Authentication:**
    *   `/auth/register`: Creates new user accounts.
    *   `/auth/login`: Authenticates users and issues tokens.
*   **User Management:**
    *   `/user/updateRole`: Assigns one of the three personas.
    *   `/user/updateStage`: Updates the user's progress metric.

## 5. Future Expandability (Modules 2-5)
This foundation is designed to support:
*   **Module 2 (Skill Engine):** Will link specific skills to User Roles.
*   **Module 3 (Marketplace):** Will allow Startups to hire Students/Job Seekers.
*   **Module 4 (Gamification):** Will add badges based on Stage milestones.
