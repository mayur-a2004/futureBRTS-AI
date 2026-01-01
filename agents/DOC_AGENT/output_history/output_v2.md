# DOC_AGENT OUTPUT V2
**Task:** Create documentation for Module-2 (Project Brain)

# Module 2: Project Brain Engine

## 1. Module Description
The Project Brain Engine is the core generative component of the FutureBuilder tool. It takes high-level user intent (Idea + Domain) and expands it into a comprehensive technical specification. This allows users to go from "Idea" to "Blueprint" in seconds.

## 2. Input Parameters
The engine accepts the following inputs to tailor the generation:
*   **Project Name:** The identifier for the project.
*   **Domain:** The industry or technology sector (e.g., Fintech, EdTech, AI, IoT). This determines the architectural patterns used.
*   **Difficulty Level:**
    *   *Easy:* Monolithic, simple CRUD.
    *   *Medium:* Modular, standard industry practices.
    *   *Hard:* Microservices, high scalability, complex logic.

## 3. How Auto Generation Works
1.  **Template Selection:** The system picks a base template matching the Domain.
2.  **Complexity Injection:** Features are added or removed based on Difficulty.
3.  **Contextualization:** The Project Name and specific domain rules are applied to rename entities and relationships.
4.  **Artifact Construction:** The system generates text-based representations of ERDs, DFDs, and Schemas.

## 4. Output Format Structure
The output is a structured JSON object containing:
*   **Overview:** Executive summary of the project.
*   **ER Diagram:** Entity-Relationship text (Mermaid.js compatible).
*   **DFD:** Data Flow Diagram narrative.
*   **Schema:** Database table definitions.
*   **Report:** A consolidated Markdown document suitable for PDF conversion.

## 5. Sample Generated Project (Simulation)
*   **Input:** Name="PayFast", Domain="Fintech", Difficulty="Medium"
*   **Output:**
    *   *Entities:* User, Wallet, Transaction, BankAccount.
    *   *Flow:* User -> Add Money -> Wallet -> Transfer -> Recipient.
    *   *Schema:* `CREATE TABLE wallets (id UUID, balance DECIMAL...);`
