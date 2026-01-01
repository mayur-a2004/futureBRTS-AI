# UI_AGENT OUTPUT V6
**Task:** Generate Full Next.js (TS) Frontend Scaffold + Builder UI + Build Console

## 1. Project Structure (Next.js App Router)
```
/app
  /layout.tsx       # Root layout with ThemeProvider, Toaster
  /page.tsx         # Landing page (Hero, Features)
  /login/page.tsx   # Auth page
  /dashboard
    /layout.tsx     # Dashboard shell (Sidebar, Header)
    /page.tsx       # Project list
  /project
    /[id]/page.tsx  # Project overview
  /builder
    /[id]/page.tsx  # The main Builder UI
  /build
    /[id]/page.tsx  # Build Console (Logs & Download)
/components
  /ui               # shadcn/ui components (Button, Input, Card...)
  /builder          # Builder specific components
    /BlueprintForm.tsx
    /TableBuilder.tsx
    /RelationManager.tsx
  /console
    /TerminalWindow.tsx
/lib
  /api.ts           # Axios instance with interceptors
  /store.ts         # Zustand store for builder state
```

## 2. Key Components

### Builder UI (`/builder/[id]`)
- **Layout:** Split screen. Left: Configuration Forms. Right: Live Preview (JSON/Visual).
- **Tabs:** [General] [Database] [API] [Theme].
- **State Management:** Zustand store `useBuilderStore` tracks the entire blueprint object.
- **Auto-save:** Debounced hook triggers `PATCH /blueprint/:id` on changes.

### Build Console (`/build/[id]`)
- **WebSockets:** Connects to backend via `socket.io-client` to stream logs.
- **Terminal:** Renders log lines with ANSI color parsing.
- **Download:** Button triggers `window.location.href = /api/project/download/:id`.

## 3. Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Lib:** shadcn/ui (Radix Primitives)
- **Icons:** Lucide React
- **State:** Zustand
- **Forms:** React Hook Form + Zod
