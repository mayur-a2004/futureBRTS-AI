# BACKEND_AGENT OUTPUT V4
**Task:** Gamification Backend Logic

## 1. Database Schema Updates

### Table: `users` (Update)
- `xp` (INTEGER, Default: 0)
- `level` (INTEGER, Default: 1)

### Table: `badges` (New)
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | PK |
| `name` | VARCHAR | e.g., "First Brick" |
| `icon_url` | VARCHAR | Asset path |
| `xp_bonus` | INTEGER | Extra XP on unlock |

### Table: `user_badges` (New)
| Column | Type | Description |
| :--- | :--- | :--- |
| `user_id` | UUID | FK -> users.id |
| `badge_id` | UUID | FK -> badges.id |
| `earned_at` | TIMESTAMP | |

## 2. API Endpoints

### GET `/gamification/leaderboard`
- **Query:** `?limit=10&filter=global`
- **Output:** `[{ rank: 1, name: "Alice", xp: 1200, level: 12 }, ...]`

### GET `/gamification/user/{id}`
- **Output:** `{ xp: 450, level: 5, next_level_xp: 500, badges: [...] }`

### POST `/gamification/event` (Internal)
- **Input:** `{ user_id, action: "PROJECT_CREATED" }`
- **Logic:**
  1. Lookup XP value for action (e.g., +50).
  2. Update `users.xp`.
  3. Check `if new_xp >= level * 100`:
     - Increment `level`.
     - Trigger "Level Up" notification.
  4. Check Badge conditions.

## 3. Logic Rules
- **Level Formula:** Threshold = `CurrentLevel * 100`.
- **Idempotency:** Prevent double XP for same one-time action.
