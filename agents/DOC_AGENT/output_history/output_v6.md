# DOC_AGENT OUTPUT V6
**Task:** Documentation for Real Microservice Architecture & Build Engine

# Module 6: System Architecture & Build Engine

## 1. Architecture Overview
The system follows a decoupled architecture:
- **Frontend:** Next.js SPA (Client-side rendering for Builder, SSR for Landing).
- **API Gateway:** Express.js REST API.
- **Database:** MongoDB (Flexible schema for Blueprints).
- **Async Workers:** Redis + BullMQ for heavy code generation tasks.
- **Real-time:** Socket.io for streaming build logs.

## 2. Build Engine Internals
The "Worker" is the heart of the code generation.
1.  **Input:** Blueprint JSON.
2.  **Templating:** Uses EJS templates located in `/templates/{stack}`.
    - `model.ejs` -> Generates Mongoose/Sequelize models.
    - `controller.ejs` -> Generates CRUD logic.
    - `route.ejs` -> Generates API routes.
3.  **Packaging:** `archiver` lib streams files into a ZIP.

## 3. Local Development Setup
**Prerequisites:** Node.js 18+, Docker (for Redis/Mongo).

1.  **Start Infrastructure:**
    ```bash
    docker-compose up -d mongo redis
    ```
2.  **Start Backend:**
    ```bash
    cd backend && npm install && npm run dev
    ```
3.  **Start Worker:**
    ```bash
    cd backend && npm run worker
    ```
4.  **Start Frontend:**
    ```bash
    cd frontend && npm install && npm run dev
    ```

## 4. Environment Variables
- `MONGO_URI`: MongoDB connection string.
- `REDIS_HOST`: Redis host (localhost).
- `JWT_SECRET`: Secret for auth tokens.
- `STORAGE_PATH`: Path to save generated zips.
