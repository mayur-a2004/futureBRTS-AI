# Titanium Project Architect: Implementation Plan (v1.0)

## Objective: 
Transform the current "One-Shot" project generator into a high-fidelity, iterative, and industrial-grade pipeline that produces 100+ page documentation and fully functional modular codebases (Login, DB, Payments, Admin Panel).

---

## Phase 1: Neural Manifest & Orchestration (Day 1)
- [x] Define the `TitanProjectState` schema to track multi-step progress.
- [x] Implement the `Architect.manifest` AI call to generate the project's DNA (Tech Stack, DB Schema, 22-Point Vision).
- [x] Create the "Approval Gate" logic in the API Gateway to pause until the user confirms the manifest.

## Phase 2: High-Fidelity Deep Writing Engine (Day 1-2)
- [x] Refactor `collage_project_pipeline.py` to support **Batch-Chunking** (writing 22 points in 4-5 separate AI calls).
- [x] Implement **Context Injection** to maintain flow between chunks (e.g., Chunk 2 knows what was in Chunk 1).
- [x] Academic Formatting: Integrate Times New Roman, IEEE Citation logic, and auto-generated TOC.

## Phase 3: Visual Diagram Engine (Mermaid + Kroki) (Day 2)
- [ ] Implement a `DiagramService` that converts AI-generated Mermaid/PlantUML strings into PNG/SVG via Kroki API.
- [ ] Integrate diagrams into specific Word/PDF sections (DFD, ERD, Class Diagrams, Flowcharts).
- [ ] Ensure PPT slides are created specifically for each visual diagram.

## Phase 4: Modular Code Synthesis (The Functional Layer) (Day 3)
- [ ] Create **Boilerplate Templates** for MERN, Python/Django, and PHP/SQL stacks.
- [ ] Implement iterative code generation:
    - Task 1: Setup (package.json, folder tree, .env).
    - Task 2: Auth Module (Login/Signup/Middlewares).
    - Task 3: Core Business Logic (Products, Services, Payments).
    - Task 4: Database Models & Migrations.
    - Task 5: Admin Panel & Dashboard.
- [ ] Add a **Code Integrity Audit** step that cross-checks the code against the finalized Documentation.

## Phase 5: Frontend UI - Progressive Architecture (Day 3-4)
- [ ] Refactor `Builder.tsx` to include a "Titan Pulse" progress tracker.
- [ ] Add an "Architect Editor" modal where users can tweak the DB Schema and Points before deep writing starts.
- [ ] Implement real-time log streaming for each phase (Architecture -> Documentation -> Diagrams -> Code).

## Phase 6: Testing & Quality Assurance (Day 4)
- [ ] Self-Testing: AI automatically generates unit tests and runs them.
- [ ] Fix the "Empty ZIP" and "XML Corruption" issues once and for all by enforcing binary-safe storage protocols.

---

## Expected Results
- **Documentation**: 80-150 pages (tier-dependent) with real diagrams and academic depth.
- **Source Code**: A real, installable project with separate Frontend/Backend/DB modules.
- **Generation Time**: 3-7 minutes (prioritizing quality over speed).
