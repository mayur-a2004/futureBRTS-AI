# 🧬 Real Algorithms: Antigravity / Codex / Claude — Kaise Kaam Karte Hain?

---

## 🎯 Pehle Samjho: "Algorithm" Matlab Kya Hai Yahan?

Ye sirf "LLM call karo aur code lo" nahi hai.
Real systems mein **5 alag types ke algorithms** milke kaam karte hain:

```
1. HOW AI READS CODE     → AST + Tree-sitter
2. HOW AI FINDS CONTEXT  → RAG + Embedding Search
3. HOW AI THINKS         → Chain of Thought + ReAct
4. HOW AI WRITES CODE    → FIM (Fill in the Middle)
5. HOW AI PLANS          → Dependency Graph Analysis
```

---

## 🔬 ALGORITHM 1: FIM — Fill in the Middle
### (Codex / GitHub Copilot ka Core Secret)

Ye **sabse important algorithm** hai jo Codex ne invent kiya.

### Normal AI ka problem:
```
AI ko do: "Function likho jo user login kare"
AI likhta hai: Top se neeche, blindly

❌ Result: Kabhi kabhi baaki code se match nahi karta
```

### FIM Algorithm:
```
Input to AI:
  PREFIX: [jo code pehle se exist karta hai - UPAR]
  SUFFIX: [jo code baad mein aata hai - NEECHE]  
  MIDDLE: [AI yahan generate karta hai - BEECH MEIN]

Example:
  PREFIX:  "const user = await User.findById(id);"
  SUFFIX:  "return res.json({ success: true, user });"
  MIDDLE:  AI fills: "if (!user) return res.status(404).json(...);"
```

**Matlab:** AI sirf code likhta nahi — **ye exact gap fill karta hai** jo existing code ke beech mein chahiye. Isliye Copilot ka suggestion itna accurate hota hai — wo upar aur neeche ka code dono padh ke beech mein perfect code deta hai.

**Training:** OpenAI ne Codex ko billions of GitHub files pe train kiya — specifically FIM format mein: PREFIX → MIDDLE → SUFFIX.

---

## 🔬 ALGORITHM 2: RAG — Retrieval Augmented Generation
### (Claude / Cursor ka Context Algorithm)

Ye solve karta hai: **"AI ko puri codebase yaad kaise rahegi?"**

### Problem:
```
Bada project = 500 files = 2,000,000 tokens
Claude ka context = 200,000 tokens max
→ Poori codebase fit nahi hoti!
```

### RAG Algorithm Steps:

```
STEP 1: INDEXING (Project khulne par ek baar)
├── Har file ko chunks mein todna
├── Har chunk ka "embedding" banana (mathematical vector)
└── Vector database mein store karna (Chroma/Pinecone)

STEP 2: RETRIEVAL (Jab user kuch pooche)
├── User query ka bhi embedding banana
├── Similarity search: "Kon se file chunks is query se related hain?"
└── Top 5-10 relevant chunks nikalna

STEP 3: GENERATION
├── Relevant chunks ko context mein dalna
└── AI sirf relevant code ke saath kaam karta hai
```

### Real Example (Cursor IDE):
```
User: "auth middleware mein rate limiting add karo"

RAG kya karta hai:
1. Search: "rate limiting" + "middleware" + "auth"
2. Finds: middleware/auth.ts, config/rateLimit.ts, package.json
3. Injects these 3 files into context
4. AI now knows: existing middleware structure, current packages
5. Generates: PERFECT code that fits exactly

Bina RAG ke: AI guess karta — import paths galat, 
structure alag, existing code se mismatch
```

---

## 🔬 ALGORITHM 3: AST Analysis — Tree-Sitter
### (Ek alag tarah ka "code reading")

LLM code ko **text ki tarah** padha karta hai.
Lekin professional tools code ko **structure ki tarah** padhte hain.

### AST = Abstract Syntax Tree

```javascript
// Ye code:
function greet(name) {
  return "Hello " + name;
}

// AST (Tree-Sitter) is tarah dekhta hai:
FunctionDeclaration
├── name: "greet"
├── parameters: ["name"]
└── body: ReturnStatement
    └── BinaryExpression
        ├── left: StringLiteral("Hello ")
        └── right: Identifier("name")
```

### Ye kyun important hai?

```
1. IMPORT GRAPH:
   auth.ts → imports → User.model.ts → imports → db.config.ts
   AI ko pata hai: "auth.ts banane se pehle User.model.ts chahiye"

2. FUNCTION SIGNATURES:
   "getUserById(id: string): Promise<User>"
   AI exactly jaanta hai — kaise call karein, kya return hoga

3. NO DUPLICATE DETECTION:
   "getUser function pehle se exist karta hai auth.ts mein"
   → AI naya function nahi banata, existing ko import karta hai

4. TYPE SAFETY:
   "Yahan string chahiye, number pass ho raha hai"
   → AI automatically fix karta hai
```

**Cursor, VS Code, JetBrains** — sab Tree-Sitter use karte hain.

---

## 🔬 ALGORITHM 4: Chain of Thought + ReAct
### (Claude / GPT-4 ka "Sochne ka Tarika")

Ye algorithm AI ko **sochne pe force karta hai** pehle likhne se.

### Normal (Bad):
```
User: "Complete ecommerce project banao"
AI: [Seedha code likhna shuru] → Incomplete, random
```

### Chain of Thought (Good):
```
User: "Complete ecommerce project banao"

AI INTERNAL THINKING:
"Step 1: Kya chahiye? 
  → Products, Cart, Orders, Auth, Payments

Step 2: Database schema kya hoga?
  → User{}, Product{}, Order{}, Cart{}
  
Step 3: File structure kya hoga?
  → /models, /routes, /controllers, /middleware
  
Step 4: Dependency order kya hoga?
  → config → models → middleware → controllers → routes → server
  
Step 5: Kaunse external packages?
  → stripe, bcrypt, jwt, mongoose

Step 6: Ab generate karo — ek ek file"

AI OUTPUT: Complete, structured, connected project
```

### ReAct Algorithm (Reason + Act):
```
Thought: "User ne login page manga hai"
Action: search_codebase("existing auth code")
Observation: "auth.controller.ts exist karta hai with JWT"
Thought: "To login component use karega /api/auth/login endpoint"
Action: read_file("auth.controller.ts")
Observation: "POST /login → { email, password } → { token }"
Thought: "Ab login component banata hun exact API ke saath"
Action: generate_file("Login.tsx")
```

**Devin AI** exactly yahi karta hai — sochta hai, action leta hai, result dekhta hai, phir aage badhta hai.

---

## 🔬 ALGORITHM 5: Dependency Graph
### (Project Complete Hone Ka Secret)

Ye ensure karta hai: **koi file tute nahi, sab connected ho**

```
Dependency Graph Example:

server.ts
    ↑
routes/auth.routes.ts ← controllers/auth.controller.ts
                                ↑
                        services/auth.service.ts
                                ↑
                        models/User.model.ts
                                ↑
                        config/database.ts
                                ↑
                        config/env.ts (base)
```

### Algorithm:
```
1. TOPOLOGICAL SORT:
   Pehle wo file banao jis pe koi depend nahi karta
   (env.ts → database.ts → User.model.ts → ...)
   
2. GENERATION ORDER respected karo:
   Base → Core → Business Logic → API → Entry Point
   
3. EACH FILE GETS:
   - Context of all files it imports
   - Knowledge of all files that will import it
   
4. RESULT:
   Koi bhi file generate ho — wo sab kuch jaanti hai
   Imports ✅ Types ✅ Functions ✅ Logic ✅
```

---

## 🔬 ALGORITHM 6: Speculative Decoding
### (Speed Algorithm — Groq/Anthropic)

Ye speed ke liye hai, quality ke liye nahi — lekin samajhna zaroori hai.

```
Normal Generation:
Token 1 → Token 2 → Token 3 → ... (sequential, slow)

Speculative Decoding:
Small Draft Model: predicts next 5 tokens quickly
Large Verify Model: checks if predictions are correct
If correct: accept all 5 tokens at once (5x faster!)
If wrong: reject from error point, regenerate

Groq hardware (LPU) + Speculative Decoding = 
World's fastest inference (500+ tokens/second)
```

---

## 🔬 ALGORITHM 7: Constitutional AI
### (Claude ka "Ethics + Quality" Algorithm)

Anthropic ne Claude ko ek alag algorithm se train kiya.

```
STEP 1: Generate response
STEP 2: AI khud apni response ko critique karta hai:
  "Kya ye helpful hai? Kya ye harmful hai?
   Kya code correct hai? Kya koi security issue hai?"
STEP 3: Based on critique, improve karo
STEP 4: Final output

Matlab: Claude ek baar nahi sochta — 
        khud ko review karke improve karta hai
        Isliye Claude ka code generally safer + better hota hai
```

---

## 🔬 ALGORITHM 8: Context Window Management
### (Bada Project Handle Karne Ka Algorithm)

```
SLIDING WINDOW:
[File 1][File 2][File 3]... → Window moves → [File 8][File 9][File 10]

IMPORTANCE SCORING:
Files rank hoti hain relevance se:
  Currently editing file: 100%
  Files it imports: 80%
  Files that import it: 60%
  Related by name/folder: 40%
  Everything else: 0% (excluded)

COMPRESSION:
Old conversation → Summarized into shorter form
"User ne pehle kaha tha: [short summary]"
Full history nahi, compressed history

PINNED CONTEXT:
Always in context (no matter what):
  - Project architecture overview
  - Tech stack
  - Coding standards/style guide
  - Current file being edited
```

---

## 📊 Comparison: Kaun Kya Use Karta Hai?

| Algorithm | Codex/Copilot | Cursor | Devin | Claude | Antigravity (Aapka) |
|---|---|---|---|---|---|
| FIM | ✅ Core | ✅ | ❌ | ❌ | ❌ |
| RAG | Partial | ✅ Full | ✅ | ✅ | ❌ |
| AST Analysis | ✅ | ✅ | ✅ | Partial | ❌ |
| Chain of Thought | ❌ | Partial | ✅ | ✅ | Partial |
| Dependency Graph | ❌ | Partial | ✅ | ❌ | ❌ |
| Constitutional AI | ❌ | ❌ | ❌ | ✅ | ❌ |
| Speculative Decode | ✅ | ✅ | ❌ | ✅ | ✅ (Groq) |

---

## 🧠 REAL Example: Cursor vs Antigravity (Aapka)

### User Request: "Add payment gateway to my Node.js project"

### Cursor ka Process:
```
1. AST scan: "project mein kya kya hai already?"
   → Finds: routes/, controllers/, models/, package.json
   
2. RAG search: "payment", "stripe", "route", "controller"
   → Retrieves: existing route structure, existing controller pattern,
                package.json (to check if stripe installed)

3. Chain of Thought:
   "Stripe nahi installed → package.json update karna hoga"
   "Existing routes pattern: router.post('/path', controller)"
   "Existing controller pattern: async (req, res) => { try/catch }"
   
4. Dependency check:
   "payment.controller.ts → needs → stripe config"
   "payment.routes.ts → needs → payment.controller.ts"
   Order: stripe.config → payment.controller → payment.routes → server (update)

5. Generates 4 files in correct order with correct patterns
   Matches existing code style exactly
```

### Antigravity (Current) ka Process:
```
1. Single Groq call: "add payment gateway"
2. Returns generic code
3. Import paths might be wrong
4. Might not match existing code style
5. Might miss registering route in server.ts
```

---

## 💡 TL;DR — Asli Difference Kya Hai?

```
CODEX/COPILOT = FIM specialist (completion expert)
CURSOR = RAG + AST (codebase-aware)
DEVIN = ReAct + Dependency Graph (autonomous agent)
CLAUDE = Constitutional AI + Long Context (quality + safety)
ANTIGRAVITY (ideal) = Sab milake (aapka goal)
```

**Single biggest improvement jo koi bhi system kar sakta hai:**
> **Code generate karne SE PEHLE — poori codebase padho, 
> dependency graph banao, phir order mein generate karo.**

Ye ek cheez implement karo → 70% problems automatically solve ho jaati hain.
