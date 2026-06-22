# 🔱 Algorithmic Architecture Diagrams: Future BRTS Builder vs. Standard LLMs
> **Visual Comparison of Autonomous Compilation Loops vs. Autoregressive Token Generation**

This document provides visual flowcharts mapping the exact algorithms of **Future BRTS Builder Chat** and **Standard LLM Chats (ChatGPT, Grok, Claude)**.

---

## 🌀 Diagram 1: Future BRTS Builder Chat Algorithm
> **The Agentic Swarm & Self-Healing Compile Loop (Autonomous & Sandboxed)**

This algorithm manages local file I/O, parses symbols, splits tasks, and runs a self-correction loop with a local compiler.

```mermaid
graph TD
    %% Nodes
    Start([User Prompt: Vision / Edit]) --> Gateway[1. API Gateway / Orchestrator]
    Gateway --> SymbolTable[2. Read Codebase Symbol Table JSON Map]
    SymbolTable --> DiffPlanner[3. Diff Planner: Map Affected Files & Routes]
    
    DiffPlanner --> Swarm[4. Spawn Swarm Agents: Coder & Reviewer]
    Swarm --> WriteFile[5. File I/O: Write Code & Update Symbols]
    
    %% Compiler Sandbox Block
    WriteFile --> CompilerGate{6. Sandbox Compiler Gate: npm run build / tsc}
    
    %% Self-Correction Loop Check
    CompilerGate -- "Build Fails (Errors Capture)" --> LogParser[7. Parse Compiler Logs: Extract File, Line & Error Details]
    LogParser --> CounterCheck{Attempt < 3?}
    CounterCheck -- Yes --> RepairAgent[8. Auto-Repair Prompt Sent to Swarm Coder]
    RepairAgent --> WriteFile
    CounterCheck -- No --> OutputFail[9. Fail-Safe Mode: Output Code with Warnings]
    
    %% Compilation Success Path
    CompilerGate -- "Build Success (0 Errors)" --> PackageFactory[10. Deliverables Factory: ZIP, PPTX Slides, DOCX Report, PDF Logs]
    PackageFactory --> CommitSync[11. Commit & Push Code to GitHub Remote]
    CommitSync --> EndNode([Deliver Verified Package to User])
    OutputFail --> EndNode

    %% Styling
    style Start fill:#4f46e5,stroke:#312e81,stroke-width:2px,color:#fff
    style CompilerGate fill:#b91c1c,stroke:#7f1d1d,stroke-width:2px,color:#fff
    style EndNode fill:#059669,stroke:#064e3b,stroke-width:2px,color:#fff
    style CounterCheck fill:#d97706,stroke:#78350f,stroke-width:2px,color:#fff
```

---

## 💬 Diagram 2: Standard LLM Chat Algorithm
> **Standard Autoregressive Token Inference & Manual Human Debugging Loop**

This algorithm maps the standard conversational next-token prediction loop, which relies on the human developer to compile, test, and copy-paste errors back to the chat.

```mermaid
graph TD
    %% Nodes
    Start([User Prompt: Vision / Edit]) --> ContextLoader[1. Load Active Context Window & Chat History]
    ContextLoader --> Transformer[2. Transformer Attention Layers: Process Input Tokens]
    Transformer --> ProbDist[3. Compute Next-Token Probability Distribution]
    
    ProbDist --> TopPFilter[4. Temperature / Top-P Sampling Filter]
    TopPFilter --> TokenStream{Is End-Of-Sequence Token?}
    
    TokenStream -- No --> NextToken[5. Stream Next Token to Chat UI]
    NextToken --> ProbDist
    
    %% Human Loop Begins
    TokenStream -- Yes (Code Finished) --> RenderUI[6. Display Code Block in Chat Box]
    RenderUI --> HumanCopy[7. HUMAN: Manually Copy Code from Browser]
    HumanCopy --> HumanPaste[8. HUMAN: Paste Code into Local IDE / Files]
    HumanPaste --> HumanCompile{9. HUMAN: Manually Run Build/TSC in Terminal}
    
    %% Compilation Loop
    HumanCompile -- "Build Fails (Error)" --> CopyError[10. HUMAN: Copy Terminal Errors]
    CopyError --> PasteBack[11. HUMAN: Paste Errors Back into LLM Chat Box]
    PasteBack --> Start
    
    HumanCompile -- "Build Success" --> EndNode([Project Done])

    %% Styling
    style Start fill:#4f46e5,stroke:#312e81,stroke-width:2px,color:#fff
    style TokenStream fill:#d97706,stroke:#78350f,stroke-width:2px,color:#fff
    style HumanCompile fill:#b91c1c,stroke:#7f1d1d,stroke-width:2px,color:#fff
    style EndNode fill:#059669,stroke:#064e3b,stroke-width:2px,color:#fff
```
