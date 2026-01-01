# UI_AGENT OUTPUT V4
**Task:** Gamification UI (Profile & Leaderboard)

## 1. Profile Page Updates
**Layout:**
- **Hero Section:**
  - **Avatar:** Large centered with level badge overlay (e.g., "Lvl 5").
  - **Name & Title:** "Alex Builder" | "Junior Architect".
  - **XP Progress:**
    - Visual: Wide bar with gradient fill.
    - Text: "450 / 500 XP to Level 6".
- **Badges Section:**
  - **Title:** "Achievements".
  - **Grid:** 4 columns.
  - **Card:** Icon + Name.
    - *Unlocked:* Full color, tooltip with date.
    - *Locked:* Grayscale, tooltip with "How to unlock".

## 2. Leaderboard Page
**Layout:**
- **Filters (Tabs):** [Global] [Friends] [Region].
- **Table/List:**
  - **Row Style:** Card-like rows with ranking number on left.
  - **Columns:** Rank (#1), User (Avatar+Name), Level (Badge), XP (Bold).
  - **Highlight:** Current user's row highlighted in blue.

## 3. Visual Effects
- **Level Up:** Full-screen overlay with confetti and "Level Up!" sound effect.
- **XP Gain:** Floating "+50 XP" text animation near profile icon when action completes.

**Component Structure:**
```jsx
<ProfilePage>
  <Hero level={5} xp={450} maxXp={500} />
  <BadgesGrid badges={userBadges} />
</ProfilePage>

<Leaderboard>
  <FilterTabs active="global" />
  <RankList data={topUsers} />
</Leaderboard>
```
