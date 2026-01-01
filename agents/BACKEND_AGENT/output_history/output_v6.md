# BACKEND_AGENT OUTPUT V6
**Task:** Generate Express + TypeScript API Gateway + MongoDB + Redis Queue

## 1. Project Structure
```
/src
  /config         # env vars, db connection
  /controllers    # Req/Res logic
  /models         # Mongoose schemas
  /routes         # Express routers
  /services       # Business logic
  /jobs           # Redis queue processors (BullMQ)
  /utils          # Logger, ErrorHandler
  app.ts          # Express app setup
  server.ts       # Entry point
```

## 2. Core Services

### Blueprint Service (`services/blueprintService.ts`)
- **CRUD:** Manages the `Blueprint` document in MongoDB.
- **Validation:** Ensures entity names are unique, relations are valid.
- **Atomic Updates:** Uses `$set` and `$push` for granular updates (columns, tables).

### Build Service (`services/buildService.ts`)
- **Queueing:** Adds a job to `buildQueue` (BullMQ).
- **Job Data:** `{ blueprintId, userId, buildId }`.
- **Status Tracking:** Updates Redis key `build:{id}:status` with progress.

## 3. Data Models (MongoDB)

**Blueprint Schema:**
```typescript
interface Blueprint {
  owner: ObjectId;
  name: string;
  domain: string;
  entities: [{
    name: string;
    columns: [{ name: string, type: string, constraints: string[] }];
    relations: [{ target: string, type: '1:1' | '1:N' }];
  }];
  theme: { primaryColor: string, font: string };
}
```

## 4. Redis & Workers
- **Queue:** `bullmq` used for job management.
- **Worker:** Separate process (`worker.ts`) that:
  1. Fetches Blueprint from Mongo.
  2. Generates code files (using EJS templates).
  3. Zips files.
  4. Uploads to S3/Local storage.
  5. Publishes events to Socket.io for frontend logs.

## 5. API Routes
- `POST /project/build` -> `buildController.startBuild`
- `GET /project/build/:id/status` -> `buildController.getStatus`
- `PATCH /blueprint/:id/features` -> `blueprintController.updateFeatures`
