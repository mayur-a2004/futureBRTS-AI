# 🔱 Google Antigravity Agent: Exhaustive System Specification (Master Blueprint)

This document is the absolute reference manual for the actual **Google Antigravity Agentic IDE & Workspace Architecture**. It details every toolbar, sidebar, panel, cognitive loop, develop/deploy system, and verification gate, illustrating how the agent integrates with the IDE to deliver production-grade code.

---

## 🖥️ Chapter 1: The Unified Agentic Workspace (IDE & UI Micro-Phases)

The Antigravity workspace is not a simple chat window; it is a fully integrated agentic IDE where UI panels, commands, and local terminal processes coordinate dynamically.

```
+--------------------------------------------------------------------------------+
|  MENU BAR (File, Edit, Workspace, Plugins, Agent Mode, Developer Console)       |
+--------------------------------------------------------------------------------+
|  TOOLBAR: [Slash Commands Command Palette: /goal, /browser, /grill-me, /learn]  |
+--------------------------------------------------------------------------------+
|  SIDEBAR           |  ACTIVE EDITOR PANEL                   |  CHAT PANEL      |
|  - File Explorer   |  - [App.tsx]                           |  - Agent Bubble  |
|  - Skill Registry  |  - Code lines with cursor tracking     |  - Ask Question  |
|  - Subagents Swarm |  - Active symbols list                 |  - Permissions   |
|  - Task Tracker    |                                        |  - Logs/Timeline |
|                    +----------------------------------------+------------------+
|                    |  TERMINAL / DAEMON MONITOR (Ports)                        |
|                    |  - API Gateway [7001] | - Vite UI [5173]                  |
+--------------------+-----------------------------------------------------------+
```

### 1. The Toolbar (Command Palette & Slash Commands)
The toolbar contains the global Command Palette, exposing high-level Agentic Workflows (Slash Commands):
* **`/goal` (Autopilot Mode)**: Triggers a deep, long-running execution mode where the agent runs autonomously (often overnight), recursively fixing build issues, researching solutions, and editing files until the task is 100% complete.
* **`/browser` (Web Crawler)**: Opens the agent's headless browser panel (`read_browser_page`), allowing the agent to navigate websites, interact with buttons, bypass captchas, and scrape APIs.
* **`/grill-me` (Design Alignment)**: Initiates an interactive interview modal where the agent grills the user on design decisions, color tokens, database models, and API rules before starting.
* **`/teamwork-preview` (Swarm Planner)**: Spawns a visualization panel showing how a team of subagents (Architect, DBA, Frontend Dev, Tester) will divide and coordinate the tasks.
* **`/learn` (Memory Anchor)**: Persists user-defined patterns, styling guidelines, or environment settings to the global `C:\Users\Admin\.gemini\config\AGENTS.md` file.

### 2. The Menu Bar (Context & Control Center)
Exposes administrative configuration and operational modes:
* **Workspace Mode Selection**: Allows switching between **Planning Mode** (Read-Only research) and **Execution Mode** (Write/Execute).
* **Developer console**: Shows the real-time execution logs of the background tasks, daemon status, and port bindings.
* **Plugins Manager**: Integrates external custom tools (like `android-cli-plugin`, `firebase`, `chrome-devtools`).
* **Active Transcripts Viewer**: Exposes the local file links to `transcript.jsonl` (compact trace) and `transcript_full.jsonl` (raw HTTP requests/responses) for auditing.

### 3. The Sidebar (Operational Registry)
Provides navigation and state feedback:
* **Active File Explorer**: Standard workspace file tree.
* **Skill Registry**: Lists globally and locally discovered skills. Each skill is a folder containing `SKILL.md` instructions, helper scripts, examples, and documentation.
* **Active Agent Swarm**: Shows the list of running subagents, their conversation IDs, and active workspaces (cloned, branched, or shared).
* **Task Tracker Panel**: Reads `task.md` directly and displays a visual checklist (Pending `[ ]`, In Progress `[/]`, Completed `[x]`) to the user.

---

## 🧠 Chapter 2: The Cognitive Mind & Understanding System

The "Mind" of the Antigravity Agent is powered by recursive context parsing, customization loading, and symbolic dependency resolution.

```
       +-------------------------------------------------------+
       |                  USER PROMPT / TARGET                 |
       +----------------------------+--------------------------+
                                    |
                                    v
       +----------------------------+--------------------------+
       |   CONTEXT ENGINE (Editor states, Cursors, File tree)  |
       +----------------------------+--------------------------+
                                    |
                                    v
       +----------------------------+--------------------------+
       |  CUSTOMIZATIONS:                                      |
       |  - Global: C:\Users\Admin\.gemini\config\AGENTS.md    |
       |  - Project: workspace/.agents/skills/                 |
       +----------------------------+--------------------------+
                                    |
                                    v
       +----------------------------+--------------------------+
       |   SEMANTIC RESOLUTION (Symbol Table, Types, Imports)  |
       +-------------------------------------------------------+
```

### 1. The Context Engine
The agent does not operate in a vacuum. With every user request, it ingests metadata representing the IDE's active state:
* **Active Editor File**: The absolute path and line range currently visible to the developer.
* **Cursor Coordinates**: Line and column position of the user's cursor.
* **Selection State**: Highlighted code ranges.
* **Workspace Manifest**: Available microservices, paths, configuration files, and package dependencies.

### 2. The Customization & Skill Loading System
On startup, the agent dynamically parses two directories to load custom behaviors:
* **Global Rules**: `C:\Users\Admin\.gemini\config\AGENTS.md` containing global constraints (e.g. *"Prefer HSL colors"*, *"Always write ESM code"*).
* **Workspace Rules**: `[WorkspaceRoot]/.agents/AGENTS.md` for project-specific rules (e.g., *"Database port is 27017"*, *"Use Vitest instead of Jest"*).
* **Skills Loader**: Scans `C:\Users\Admin\.gemini\config\plugins\<plugin>\skills\<name>\SKILL.md` to load specialized procedural instructions.

### 3. The Symbol Table & Semantic Map
* When code is analyzed or generated, the agent extracts symbols: Models, Controller functions, Router paths, and React Exports.
* These are saved to a **Symbol Table** (structured JSON map).
* When generating or editing subsequent files, the agent retrieves this symbol map to compute relative import paths, ensure exact matching variable names, and prevent compilation errors.

---

## 🛠️ Chapter 3: The Develop System (Generation & Editing)

This is the system responsible for planning, synthesizing, and refactoring source code.

### 1. Research Phase
* Before writing a single file, the agent uses read-only tools:
  * `list_dir` to view folder trees.
  * `grep_search` to find symbols, configuration strings, or import usages.
  * `view_file` to read the exact line ranges.
* **Constraint**: In Planning Mode, all file writes (`write_to_file`) and modifications (`replace_file_content`) are disabled.

### 2. The Implementation Plan (`implementation_plan.md`)
* The plan must follow a strict markdown schema, specifying:
  * **User Review Required**: Structural decisions, UI visual styles, and API definitions.
  * **Open Questions**: Clarifications that affect the build.
  * **Proposed Changes**: Grouped by components and labeled:
    * `[NEW]` for new files.
    * `[MODIFY]` for existing files.
    * `[DELETE]` for files to remove.
  * **Verification Plan**: Exact commands (`npm run test`, `vite build`) to run for validation.
* The agent writes this plan to `brain/<conversation-id>/implementation_plan.md` and requests user approval before proceeding.

### 3. The Execution Board (`task.md`)
* Once approved, the agent initializes `task.md`.
* Each checklist item is written out at a granular level.
* As the agent starts a task, it updates the file to `[/]` (In Progress), writes the code, verifies it, and updates it to `[x]` (Completed).

### 4. Code Synthesis Mechanics
* The agent writes code using three main tools:
  * `write_to_file`: Creates new files. If `Overwrite: true`, it overwrites the file completely.
  * `replace_file_content`: Modifies a **single contiguous block** of code in an existing file. This is highly efficient and preserves the rest of the file.
  * `multi_replace_file_content`: Modifies **multiple non-contiguous blocks** in a single file simultaneously, using start/end line offsets and exact content matches.
* **Code Quality Rules**:
  * **No Placeholders**: Never outputs `// TODO` or `...`.
  * **Auto-Stitching**: If the LLM response is truncated due to token limits, the agent detects the unclosed brackets or trailing operator, makes a follow-up request starting from the exact boundary, and stitches the outputs together cleanly.
  * **Name Collision Prevention**: Prevents naming local page components identical to imported icons (e.g. naming a page `SettingsPage` instead of `Settings` to avoid collision with `<Settings />` from `lucide-react`).

---

## 🛡️ Chapter 4: The Verification & Self-Correction System

An elite agent system must verify its own changes before delivering them.

```
       +-------------------------------------------------------+
       |                SYNTAX SANITY FILTER                   |
       |  - Balance check: { }, [ ], ( )                       |
       |  - No raw HTML wrapper tags in React/JS               |
       |  - No obsolete React Router v5 syntax                 |
       +----------------------------+--------------------------+
                                    |
                                    v
       +----------------------------+--------------------------+
       |              SANDBOXED COMPILATION GATE               |
       |  - Executes `npm run build` or `vite build`            |
       |  - Collects stdout and stderr                         |
       +----------------------------+--------------------------+
                                    |
                                    v
       +----------------------------+--------------------------+
       |                 SELF-CORRECTION LOOP                  |
       |  - Feed compilation errors back to AI                 |
       |  - Refactor offending file                            |
       |  - Re-run compiler (up to 3 times)                    |
       +-------------------------------------------------------+
```

### 1. Syntax Sanity Filter
Before any file is committed, the agent runs local regex and character checks:
* **Bracket Balancing**: Iterates through the characters (ignoring string literals and comments) to verify that `{ }`, `( )`, and `[ ]` are balanced.
* **HTML Wrapper Checker**: Blocks raw HTML wrapper tags (`<!DOCTYPE html>`, `<html>`, `<body>`) inside React component files.
* **Router Validation**: Blocks obsolete React Router v5 structures (e.g., using `<Switch>` instead of `<Routes>`, or `component={}` instead of `element={}`).
* **Import Verification**: Scans JSX tags (like `<UserCard />` or `<Search />`) and verifies that they are either declared locally or explicitly imported.

### 2. Sandboxed Compilation Gate
* The agent spawns a background command (`run_command`) executing the bundler or compiler build script (e.g., `npm run build` or `tsc --noEmit`).
* It captures the full compiler stdout/stderr logs.

### 3. Self-Correction Loop
* If the compilation fails, the agent doesn't stop. It parses the compilation log, extracts the file name, line number, and error message.
* It feeds this context into a **Self-Correction Prompt**:
  `The file <file> failed compilation with error: <error>. Fix this specific issue and return the updated code.`
* The agent edits the file, updates the symbol table, and re-runs the compiler. It repeats this cycle up to 3 times until the build passes.

---

## 💬 Chapter 5: The Chat, Teamwork, & Swarm System

When a task is too complex, the main agent orchestrates a swarm of specialized subagents.

```
                  +--------------------------------+
                  |           MAIN AGENT           |
                  +---------------+----------------+
                                  |
            +---------------------+---------------------+
            |                     |                     |
            v                     v                     v
    +---------------+     +---------------+     +---------------+
    |  RESEARCHER   |     |   DB DESIGNER |     |  UI BUILDER   |
    | (Read-Only)   |     |  (Write/Cmd)  |     |  (Write/Cmd)  |
    +-------+-------+     +-------+-------+     +-------+-------+
            |                     |                     |
            +---------------------+---------------------+
                                  |
                                  v
                  +---------------+----------------+
                  |    SHARED / BRANCHED REPOS     |
                  +--------------------------------+
```

### 1. Subagent Spawning (`define_subagent` & `invoke_subagent`)
* **`define_subagent`**: Creates a custom subagent template specifying its name, role (e.g., "SQL Migration Expert"), system prompt, and tools access (e.g., enabling/disabling write tools or MCP tools).
* **`invoke_subagent`**: Spawns one or more instances of a subagent with a specific task prompt.

### 2. Workspace Isolation Modes
When spawning a subagent, the main agent configures its workspace:
* **`inherit` (Default)**: The subagent runs in the same folder as the parent. Good for fast collaboration on small edits.
* **`branch` (Isolated Clone)**: Creates a physical duplicate folder of the repository. The subagent works in isolation, and the parent merges the changes back via git commits.
* **`share` (Shared Git Worktree)**: Creates a new workspace sharing the parent's underlying git database. This allows the subagent to work on an independent branch without copying storage, saving disk space.

### 3. Inter-Agent Communication (`send_message`)
* Agents communicate asynchronously using the `send_message` tool.
* A subagent notifies the parent of completion by sending a message containing the files it edited and the test outcomes. The main agent is woke up automatically by the system.

---

## 💾 Chapter 6: The Save & Persistence System (State Capture)

This system ensures that conversation logs, file modifications, and workspace configurations are preserved and recovery is possible.

### 1. Chronological Logs (Transcripts)
Stored locally under `<appDataDir>\brain\<conversation-id>\.system_generated\logs/`:
* **`transcript.jsonl`**: A token-efficient log where large inputs, outputs, and file contents are truncated. Used for quick greps (e.g., finding spawned subagents or user inputs).
* **`transcript_full.jsonl`**: The raw, untruncated record. Used when the agent needs to read exact historical code edits or full API responses that have been rotated out of its context window.

### 2. The Artifacts Directory
All persistent artifacts (reports, diagrams, plans) are stored under:
`<appDataDir>\brain\<conversation-id>/`
* **`implementation_plan.md`**: The master design.
* **`task.md`**: The live checklist.
* **`walkthrough.md`**: The completion summary.
* **`/scratch`**: Contains temporary scripts or debugging logs generated during the run.

---

## 🚀 Chapter 7: The Deploy & Local Run System

The deployment system manages local servers and packages the final products.

### 1. Daemon Management
* The agent launches background tasks using `run_command` with `WaitMsBeforeAsync` set to a small value (e.g., 500ms).
* The task is detached and runs as a daemon process (like Vite dev server, Express server, Python worker).
* The agent uses `manage_task` (actions: `status`, `send_input`, `kill`) to interact with, query, or terminate these background processes.
* To check if a service is healthy, the agent runs test scripts or uses `curl.exe` to ping endpoints.

### 2. The Export Factory (Phase D)
When all tasks are marked complete, the agent builds the final package:
* **PDF Specification**: Synthesizes a technical report containing system design, DFDs, ERDs, and API routing specs.
* **PPTX Presentation**: Generates slide layouts representing the project's architecture and modules.
* **Source Code ZIP**: Bundles all files into a ZIP archive, excluding database logs and local node modules.
* **Git Remote Push**: Configures remote HTTPS URLs with the user's personal access token and pushes the code to the repository.
