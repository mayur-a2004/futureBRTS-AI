# DOC_AGENT OUTPUT V4
**Task:** Documentation for Module-4 (Gamification)

# Module 4: Gamification Engine

## 1. Overview
The Gamification Engine drives user engagement by rewarding actions with XP, Levels, and Badges. It introduces a competitive element via Leaderboards.

## 2. Mechanics
### XP & Leveling
- **XP Sources:**
  - Daily Login: +10 XP
  - Create Project: +50 XP
  - Complete Task: +20 XP
- **Leveling Curve:** Linear progression. `XP Required = Level * 100`.

### Badges
- **Novice Builder:** Create 1st project.
- **Socialite:** Refer a friend.
- **Marathon:** 7-day login streak.

## 3. Architecture Changes
- **Database:** Added `badges` and `user_badges` tables. Modified `users` table.
- **Services:** New `GamificationService` to handle event processing asynchronously.

## 4. API Reference
- `GET /leaderboard` - Public ranking.
- `GET /user/:id/gamification` - Personal stats.
