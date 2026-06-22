# Upgrade Collage Project Generator to Antigravity Standards

This plan outlines the steps to upgrade our code generation pipelines to meet the Google Antigravity Web Guidance and agentic quality standards.

## User Review Required

> [!IMPORTANT]
> - We are modernizing static fallback templates inside `source_code_generator.py` to use native HTML5 and CSS features (native `<dialog>`, Popover API, `:user-invalid` form states, CSS discrete transitions with `@starting-style`, and CSS-based textarea auto-resizing via `field-sizing`).
> - We will extend the Sandboxed Compilation and Auto-Repair Loop to the Chat Update Handler (`handleChatUpdate` and `runPostBuildIteration`) inside `multi_agent.service.ts` so that incremental code modifications made by the agent through chat are verified and repaired automatically.

## Open Questions

> [!NOTE]
> None at the moment. The requirements are fully detailed in the Google Antigravity Master Specification.

## Proposed Changes

### Component 1: Python Worker Code Generator Templates

#### [MODIFY] [source_code_generator.py](file:///c:/Users/Admin/.gemini/antigravity/futurebuilderlatest%20grok%20last/futurebuilderlatest/project/worker/generators/source_code_generator.py)
- Refactor `react_ui`, `next_ui`, and `vanilla_ui` template strings.
- Incorporate native `<dialog>` for interactive modal popups (e.g. details, settings).
- Integrate Popover API for dropdowns, profile cards, or context menus.
- Inject CSS `@starting-style` transitions for smooth discrete entrance/exit transitions.
- Use `field-sizing: content` for auto-growing comment and query textareas.
- Integrate `:user-invalid` styling for instant visual form validation without JS state checks.
- Add robust client-side `localStorage` CRUD mock logic inside the components to simulate live state saving on refresh.
- Inject helper CSS classes in the generated `index.css`/`styles.css` file to support these transitions.

---

### Component 2: API Gateway Service

#### [MODIFY] [multi_agent.service.ts](file:///c:/Users/Admin/.gemini/antigravity/futurebuilderlatest%20grok%20last/futurebuilderlatest/project/backend/api_gateway/src/modules/collage_project/multi_agent.service.ts)
- Fix TypeScript compile error: Remove duplicate declaration of `fsPath` at line 2079 within `runWorker`.
- Extract the compilation check and self-repair loop from `runWorker` into a reusable private helper method:
  `async verifyAndRepairBuild(pId: string, fsPath: string, techStack: any): Promise<boolean>`
- Call this helper method from the main build loop in `runWorker`.
- Integrate this helper method inside `handleChatUpdate` and `runPostBuildIteration` to verify and auto-repair any edits made in response to chat instructions.
- Ensure the live `task.md` checklist tracks compilation and repair progress during chat updates as well.

---

### Component 3: Task Tracker Checklist

#### [MODIFY] [task.md](file:///C:/Users/Admin/.gemini/antigravity/brain/399f95e7-df20-4fd0-85dd-43265ffcb369/task.md)
- Check off the items once execution is complete.

## Verification Plan

### Automated Tests
- Run `npx tsc --noEmit` inside the `api_gateway` folder to ensure gateway code is clean of compile-time syntax and type errors.
- Trigger a mock generation from the UI or command line to confirm sandboxed compilation links correctly and the `task.md` file is generated/updated dynamically.

### Manual Verification
- Verify the generated files in the zip archive to ensure they contain the modernized native dialogs, popovers, and CSS-based transition layers.
