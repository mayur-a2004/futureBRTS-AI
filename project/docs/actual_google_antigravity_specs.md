# 🔱 Detailed Specifications: Actual Google Antigravity Agent vs. Current Collage Project Generator

This document outlines the actual system architecture, cognitive workflows, and design guidelines of the **Google Antigravity Agent** (the AI agent currently pair-programming with you) and conducts a detailed gap analysis against the current **Collage Project Generator** in the workspace.

---

## 🔬 Part 1: Anatomy of the Actual Google Antigravity Agent

The Google Antigravity agent does not simply take a prompt and output a single-shot file. It operates on a multi-stage cognitive loop powered by strict behavioral rules and structured artifacts.

### 1. The Cognitive Planning Loop (Systematic Prototyping)
When given a complex task, the Antigravity agent strictly divides its work into two modes: **Planning Mode** and **Execution Mode**.

```mermaid
graph TD
    subgraph Planning Mode (Phase 1)
        A["Research & Read Codebase"] --> B["Create/Update implementation_plan.md"]
        B --> C["Identify Open Questions & Design Decisions"]
        C --> D["Stop & Request User Approval (Approval Gate)"]
    end
    subgraph Execution Mode (Phase 2)
        D -->|Approved| E["Create/Update task.md (Checklist)"]
        E --> F["Mark Current Item as [/] (In Progress)"]
        F --> G["Execute Modifications / File Writes"]
        G --> H["Verify Changes (Build & Test)"]
        H -->|Fix Errors| I["Mark Item as [x] (Completed)"]
        I -->|Next Item| F
    end
    subgraph Conclusion (Phase 3)
        I -->|All Done| J["Create/Update walkthrough.md"]
        J --> K["Highlight Key Outcomes & Demo UI"]
    end
```

### 2. The Web Application Prototyping System
The actual Antigravity design guidelines mandate elite visual aesthetics:
* **Tech Stack**: Uses **HTML** and **JavaScript** for core logic, and **Vanilla CSS** for styling (to maintain maximum flexibility and avoid generic UI templates) unless Tailwind CSS is explicitly requested.
* **Design Aesthetics**:
  * **Color Palettes**: Avoids generic primary colors. Uses HSL-tailored dark modes and curated, harmonious color accents.
  * **Typography**: Clean, scalable typography using modern Google Fonts (e.g., Inter, Poppins, Outfit) instead of default browser sans-serif.
  * **Glassmorphism**: Combines high blur filters (`backdrop-filter: blur(20px)`), translucent borders (`rgba(255,255,255,0.05)`), and smooth shadows.
  * **Micro-Animations**: Uses hover scale effects, pulsing glow states, shimmer loaders, and smooth transitions on active elements.
* **Documentation & Links**: All files and symbols are referenced using clickable `file:///` markdown links to maintain full workspace navigability.

---

## 📊 Part 2: Gap Analysis (Actual Antigravity vs. Current Generator)

Our current **Collage Project Generator** (scaffolder + worker) has a simplified mode named `ANTIGRAVITY_GOD_MODE` inside `multi_agent.service.ts`, but it misses the core operational characteristics of the actual Antigravity agent:

| Cognitive Pillar | Actual Google Antigravity Agent | Current Collage Project Generator |
|---|---|---|
| **Phase 1: Planning** | Creates `implementation_plan.md` with explicit `[MODIFY]`, `[NEW]`, `[DELETE]` file list, lists open design questions, and halts for user approval. | Calls a basic AI specification extractor (`analyze` and `blueprint` tasks) to output a JSON list of files, but starts writing them immediately without user verification or review. |
| **Phase 2: Execution** | Maintains a living `task.md` TODO checklist, updating items from `[ ]` to `[/]` and then `[x]` as work progresses. | Has database records for tasks (`ProjectTask`), but does not write a live checklist file or update it sequentially with in-progress markers (`[/]`). |
| **Code Completeness** | Strictly writes 100% complete functions, styling, forms, event handlers, and data grids with zero placeholders. | Tries to validate code with regexes, but the models still output simple templates with empty event handlers or basic metrics. |
| **Verification & Gate** | Runs compilation commands (`npm run build`) and runs tests to guarantee 100% correct code before marking tasks completed. | Just writes files to disk. It has a basic syntax parser, but does not run the actual compiler (`vite build` or `tsc`) to test if the generated code compiles. |
| **Auto-Repair Agent** | Captures compiler logs and error outputs to automatically refactor and fix compilation or import errors. | Has a basic failover to a different model (DeepSeek) if a file fails validation, but does not read compilation logs to repair syntax or import errors. |
| **Chat Iterations** | Analyzes the impact across all files, modifying routing, context state, layouts, and pages collectively. | Limits modifications to a single file at a time during chat updates, which breaks the project when new pages are added. |

---

## 🚀 Part 3: Blueprint for the Collage Project Generator Upgrade

To bring the Collage Project Generator up to the **Actual Google Antigravity** standard, we will structure the upgrade into four core architectural modules:

### 1. Interactive Planning Mode Gate (UI + API)
* Before the project starts code generation, the system will output a detailed `implementation_plan.md` into the generated project's directory.
* The API Gateway will pause the generation and send a `WAITING_FOR_APPROVAL` state.
* The frontend UI will display the planned pages, database schemas, and folder structure, allowing the user to click "Approve Build" or tweak the requirements.

### 2. Task Checklist (`task.md`) Runner
* During generation, the system will write a `task.md` file in the project directory.
* As each file is being generated, the system will update the checklist in real time (e.g. changing `- [ ] Create HomePage.tsx` to `- [/] Create HomePage.tsx` and finally `- [x] Create HomePage.tsx`), streaming this file state to the UI.

### 3. Compilation Verification & Auto-Repair Agent (Sandbox Compiler)
* After writing the files, the worker will run a sandboxed build command (`npm run build` or `vite build`).
* If the build fails:
  * The compiler output (e.g., `TypeScript Error: Property 'total' does not exist on type 'Order' in DashboardPage.tsx:45`) will be captured.
  * A **Self-Correction Agent** will take the error logs and the offending file, rewrite the code to fix the type collision or missing import, and re-run the compile check.
  * This loop will run up to 3 times to guarantee a **100% working, compile-safe build**.

### 4. Multi-File Chat Planner
* The chat update handler (`handleChatUpdate`) will be upgraded to use a Planner LLM.
* Instead of editing a single file, the Planner will return a list of files to add or edit.
* The system will iterate through this list, updating the Router, Sidebar menu, and Context states together to keep the application fully synchronized.
