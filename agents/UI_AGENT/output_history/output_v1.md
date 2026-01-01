# UI_AGENT OUTPUT V1
**Task:** Build Foundation UI Screens

## 1. Login Page
**Layout:**
- **Center Card:**
  - **Logo:** "FutureBuilder" (Top Center)
  - **Input:** Email Address (Placeholder: "you@example.com")
  - **Input:** Password (Type: Password)
  - **Button:** "Login" (Primary Color: Blue/Indigo)
  - **Link:** "Create Account" (Secondary text)
  - **Social Login:** "Continue with Google" (Optional, below separator)

**Component Structure (React/HTML concept):**
```jsx
<Container>
  <LoginCard>
    <Logo src="/assets/logo.png" />
    <Input label="Email" type="email" />
    <Input label="Password" type="password" />
    <PrimaryButton>Login</PrimaryButton>
    <SecondaryLink>Create Account</SecondaryLink>
  </LoginCard>
</Container>
```

## 2. Onboarding (Role Selection)
**Layout:**
- **Header:** "Welcome! Tell us about yourself."
- **Grid Layout (3 Cards):**
  1.  **Student:** Icon (Grad cap), Title "Student", Desc "Learning & growing"
  2.  **Job Seeker:** Icon (Briefcase), Title "Job", Desc "Looking for opportunities"
  3.  **Startup:** Icon (Rocket), Title "Startup", Desc "Building something new"
- **Action:** Clicking a card highlights it. "Continue" button appears at bottom right.

## 3. Dashboard
**Layout:**
- **Sidebar (Left):**
  - Navigation: Home, Tasks, Profile, Settings
- **Header (Top):**
  - Breadcrumbs
  - **Profile Panel:** Small avatar, Name, "Student Mode" badge.
- **Main Content Area:**
  - **Progress Section (Top):**
    - Large Circular Progress Bar: "Stage 1: Foundation" (25%)
    - Text: "User Stage: 25/100"
  - **Next Task Card (Hero):**
    - Title: "Complete Profile"
    - Description: "Add your skills to unlock the next stage."
    - Button: "Start Task"

**Component Structure:**
```jsx
<DashboardLayout>
  <Sidebar />
  <MainContent>
    <Header profile={userProfile} />
    <ProgressSection value={25} stage="Foundation" />
    <TaskCard task={currentTask} />
  </MainContent>
</DashboardLayout>
```

## 4. Header + Side Menu
**Styles:**
- **Sidebar:** Dark mode or light gray background. Fixed width (250px).
- **Header:** White/Glassmorphism effect. Sticky top.
- **Responsive:** Hamburger menu on mobile (< 768px) replaces Sidebar.

**Visual Hierarchy:**
1.  **Primary:** Next Task Button (Call to Action)
2.  **Secondary:** Progress Status
3.  **Tertiary:** Navigation items
