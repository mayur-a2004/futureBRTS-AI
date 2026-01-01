# ARCHITECTURE LOCK
## STRICT ENFORCEMENT RULES

1. **SINGLE API GATEWAY POLICY**
   - **Canonical Path:** `project/backend/api_gateway`
   - **Status:** ACTIVE
   - **Prohibited:** Any other `api-gateway` folder creation (e.g. `apps/api-gateway`).

2. **DUPLICATE SERVICE BAN**
   - No duplicate backend services allowed.
   - All backend logic must reside in `project/backend/*`.

3. **FRONTEND POLICY**
   - **Canonical Path:** `project/frontend`
   - **Status:** ACTIVE
   - **Prohibited:**
     - Usage of `apps/web` (Archived).
     - Creation of any new frontend folders.
     - New Next.js roots anywhere in the project.

*This file defines the immutable structure of the project.*
