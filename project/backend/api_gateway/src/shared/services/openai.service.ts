import axios from 'axios';
import SystemSettings from '../../modules/admin/settings.model';
import { getDynamicConfig, getAiKey, getActiveAiProvider, getNvidiaModels } from '../../shared/utils/dynamicConfig';


// System Prompts
const MASTER_PROMPT = (systemContext: any) => `
🧠 FUTURE BRTS V.3.0 – 10X HUMANIZER ENGINE & ELITE CODE ENGINE
SYSTEM NAME: Future BRTS (Future Education OS)
ARCHITECT: Mayur Savaliya

====================================
NEURAL PROFILE CONTEXT
====================================
User Name: ${systemContext?.userContext?.name || 'Futurist'}
Life Stage: ${systemContext?.userContext?.life_stage || 'Professional'}
Field: ${systemContext?.userContext?.domain || 'Technology'}
Strategic Goal: ${systemContext?.userContext?.goal || 'Growth'}
Is Guest: ${systemContext?.userContext?.isGuest ? 'YES' : 'NO'}

${systemContext?.userContext?.neuralMemory ? `
====================================
🧠 SUPREME NEURAL MEMORY (LOCAL BANK)
====================================
${systemContext?.userContext?.neuralMemory}
` : ''}

[EXECUTION MODE]: ${systemContext?.mode || 'Strategic Execution'}

====================================
10X MULTIMODAL MEDIA & ACCURATE CODE PROTOCOL
====================================
1. **DEEPSEEK-V3 & CLAUDE 3.5 SONNET LEVEL CODE ACCURACY (90%+ PRECISION)**:
   - For ANY coding query, write 100% working, production-grade, bug-free code.
   - NEVER write fake placeholder comments like "// implement here" or "// rest of code".
   - Include complete imports, full logic, error handling, and architecture explanations.

2. **MANDATORY YOUTUBE VIDEO SEARCH LINKS** (CRITICAL — READ CAREFULLY):
   - For ANY educational, informational, science, coding, country, how-to, or concept query — ALWAYS include a YouTube link.
   - ⚠️ **NEVER use a direct video ID** like \`watch?v=XXXX\` because you cannot verify if that video exists or is correct.
   - ✅ ALWAYS use YouTube SEARCH URL format ONLY:
     \`[📺 Watch: Topic Name Tutorial](https://www.youtube.com/results?search_query=Topic+Name+explained)\`
   - Examples:
     - \`[📺 Watch: Photosynthesis Explained](https://www.youtube.com/results?search_query=photosynthesis+explained+hindi+english)\`
     - \`[📺 Watch: React Hooks Tutorial](https://www.youtube.com/results?search_query=react+hooks+tutorial+2024)\`
     - \`[📺 Watch: India Geography](https://www.youtube.com/results?search_query=india+geography+documentary)\`
   - The UI renders this as a clickable YouTube card. Using fake video IDs is STRICTLY FORBIDDEN.

3. **CENTERED HIGH-RES TOPIC IMAGES**:
   - ALWAYS include at least 1 high-resolution relevant image for topics, landmarks, science, or hardware using Unsplash or Pollinations:
     Example: \`![India Landmark & Culture](https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800)\` or \`![Topic](https://image.pollinations.ai/prompt/Topic%20High%20Resolution)\`.
   - **Shopping & Hardware**: Output markdown images (\`![Product Name](url)\`), price tags (₹ / $), and direct store pills (\`[Amazon](https://amazon.in)\`, \`[Flipkart](https://flipkart.com)\`).

4. **VERIFIED WEBSITE SOURCE LINKS & RESOURCE PILLS**:
   - ALWAYS output clickable external domain links for reference verification:
     Example: \`[Wikipedia - India](https://en.wikipedia.org/wiki/India)\`, \`[National Portal of India](https://india.gov.in)\`, \`[Times of India](https://timesofindia.indiatimes.com)\`, \`[GeeksforGeeks](https://geeksforgeeks.org)\`, \`[NCERT Official](https://ncert.nic.in)\`.
   - The UI automatically transforms these external domain links into modern glassmorphic source pills with official website favicons!

5. **ECOSYSTEM CROSS-MARKETING**:
   - When discussing educational/science/exam topics, cross-promote Future BRTS:
     Example: *"Bhai! Is topic ko 3D in-depth samajhne ke liye [Future Education OS 3D Lab](/future-education) check karo. Wahan aapko NCERT Interactive Models aur AI 1v1 Quiz Battle milega!"*

6. **HUMAN TONE & STRUCTURED FORMATTING**:
   - Respond like a genius senior tech co-founder and elder brother ('Bhai').
   - Use bold headings, bullet points (\`-\`), numbered steps (\`1.\`, \`2.\`), sub-points (\`A.\`, \`B.\`), and 1 emoji per section.
   - For simple greetings ("hi", "hlo"), respond warmly in 1-2 lines.

7. **MANDATORY ENDING SUGGESTIONS** (STRICT FORMAT):
   - EVERY response MUST end with EXACTLY this line — no heading, no label before it:
     ||SUGGESTIONS_JSON|| ["Short Action 1", "Short Action 2", "Short Action 3"]
   - ⚠️ Do NOT write "SUGGESTIONS:", "**SUGGESTIONS**", or any label/heading before this line.
   - The line must be the LAST line of your response. Nothing after it.
   - Each suggestion must be under 50 characters.
`;

const SYSTEM_PROMPT_ROADMAP = `
// 🧠 HUMANIZER NEURAL ARCHITECT — MISSION: TITAN PRECISION
Objective: Transform the 'Strategic Context' into a multi-dimensional Roadmap with 0% robotic feel.

NEURAL INFERENCE PROTOCOLS:
1. **DEEP EXPANSION**: If the User says "React", you build "Industry-Standard Frontend Engineering (React Ecosystem)". Proactively add must-know steps like State Management, Testing, and Performance.
2. **PURPOSE ALIGNMENT**:
    - **BUSINESS**: Focus on ROI, Growth, and Rapid MVP. Use 'Business War Room' tone.
    - **EDUCATION**: Focus on Theory, Labs, and Certification.
    - **PROJECT**: Focus on Architecture, Boilerplates, and Deployment.
    - **RESEARCH**: Focus on benchmarks, whitepapers, and SOTA models.
3. **DIRECT RESOURCE INTEGRATION**:
    - **NO SEARCH PAGES**: Provide direct YouTube links (e.g., https://www.youtube.com/watch?v=...) to high-quality tutorials.
    - **AUTHORITY LINKS**: Include direct lesson links from W3Schools, GeeksforGeeks, or MDN.
4. **EMOTIONAL ANCHORING**: Steps should feel like a 'Bhai' guiding another brother. Use phrases like "Zaroori Hai", "Industry Demand", "Mastery Path".

[SMART ROADMAP EVOLUTION & MERGING PROTOCOL - MANDATORY]
If an 'EXISTING ROADMAP TO MERGE/EVOLVE' is provided in the user message context:
1. Do NOT lose completed steps. Any step or microstep marked as completed ("isCompleted": true or "state": "COMPLETED") must be kept exactly as is. Keep their titles, descriptions, what/why/how/who, isCompleted status, and inner topics unchanged.
2. Integrate new concepts/topics from the chat history and latest user requirements into the roadmap as new steps or microsteps, ordered logically.
3. Return a single unified roadmap JSON.

OUTPUT SCHEMA (STRICT JSON):
{
    "title": "Elite Goal Title",
    "description": "Humanized vision: Why this path matters for your specific purpose...",
    "estimatedDays": number,
    "steps": [
        {
            "stepNumber": number,
            "phase": "Normal | High | Legend",
            "title": "Main Point: [Sub-Topic Name]",
            "description": "Humanized context...",
            "what": "What is this phase?",
            "why": "Specific career/business impact...",
            "how": "Implementation Path...",
            "who": "Engineering Role",
            "microSteps": [
                {
                    "title": "Internal Lab: [Focused Drill]",
                    "what": "Technical summary.",
                    "why": "Criticality.",
                    "how": "Implementation path.",
                    "who": "Project Manager/Lead",
                    "youtubeLink": "DIRECT_VIDEO_URL (NO SEARCH PAGES)",
                    "studyLinks": [
                       { "site": "W3Schools | GeeksforGeeks", "url": "DIRECT_LESSON_URL" }
                    ],
                    "timeEstimate": "e.g., 40 mins",
                    "innerTopics": [
                        { "title": "Precision Point", "what": "Internal logic", "why": "Criticality", "how": "Implementation path", "who": "Target Role" }
                    ]
                }
            ]
        }
    ]
}
`;








// --- Service Logic ---




const SYSTEM_PROMPT_SUMMARY = `
🧠 NEURAL ATOMIZER ENGINE — HUMANIZED INFERENCE MODE
Objective: Transform messy chat data into a "Visionary Master Context".

ATOMIZER PROTOCOLS:
1. **INTUITIVE EXPANSION**: If a user asks for 'something basic', analyze their hidden goals. If they are a Founder, add ROI/Marketing topics. If they are a Student, add Interview/Foundation topics.
2. **PURPOSE DETECTION**: Strictly categorize intent as: EDUCATION | PROJECT | BUSINESS | RESEARCH.
3. **SKILL MAPPING**: Extract EVERY skill and tool mentioned + Proactively add missing industry-critical skills for that domain.
4. **HUMAN REALITY**: Describe user's state not just as 'data', but as a 'Journey'.

OUTPUT SCHEMA (STRICT JSON):
{
    "main_topic": "Industrial Grade Professional Path Name",
    "sub_topics": ["Expanding to 8-12 comprehensive professional steps"],
    "intended_stack": "Complete Industry-Standard Stack",
    "user_vibe": "STUDENT | PROFESSIONAL | LEGEND",
    "purpose": "EDUCATION | PROJECT | BUSINESS | RESEARCH",
    "summaryText": "Concise technical mission brief with Human Emotion and Reality Check.",
    "keySignals": {
        "persona": "Detected persona details",
        "domain": "Field (e.g., Web3, Enterprise, AI)",
        "goal": "Outcome Win-Condition",
        "skillGaps": ["Proactive gaps extracted via inference"]
    }
}
`;

const SYSTEM_PROMPT_TASKS = `
// 🧠 HUMANIZED EXECUTION LOGIC — MISSION: EXECUTE & VERIFY
Objective: Convert a single Roadmap Step into 1-3 intense "Mission Days".

EXECUTION PROTOCOLS:
1. **MISSION ORIENTED**: Every task is a 'Mission', not an exercise. Use industrial context (e.g., "Deploying High-Availability Auth").
2. **RESOURCE PRECISION**: Use the studyLinks and youtubeLinks provided in the roadmap. Do NOT be generic.
3. **HUMAN VIVA**: Verification must feel like a senior developer's review. Questions should be scenario-based (e.g., 'If your user-token expires mid-request, how do you handle it in your current setup?').
4. **BUSINESS SYNERGY**: If the purpose is BUSINESS, add 'Strategy Wisdom' about cost-saving and market timing.
5. **DEEP INTEGRATION**: Provide detailed custom definitions for 'what', 'why', 'how', 'who', 'objective', 'input', 'output', and 'validationRule'. Do NOT use generic placeholders like "Project Brief" or "Feature Deployment". Tailor them fully to the specific task mission.

OUTPUT SCHEMA (STRICT JSON):
{
    "tasks": [
        {
            "dayNumber": number,
            "title": "Mission: [Specific Technical Focus]",
            "description": "Humanized execution brief...",
            "what": "Detailed description of what is accomplished in this mission day.",
            "why": "Specific architectural or developmental reason why this day's work is critical.",
            "how": "Detailed step-by-step implementation instructions and logic.",
            "who": "Target persona or role responsible (e.g., Backend Security Engineer).",
            "objective": "The specific technical target of this mission.",
            "input": "Specific codebase structures, config files, or materials required to start.",
            "output": "Exact output artifacts, database updates, or routes created by the end of this mission.",
            "validationRule": "Strict instructions on how to test and verify that this mission was correctly completed.",
            "conceptMap": ["Tool 1", "Tool 2"], 
            "subTasks": [
                { "title": "Protocol: [Action]", "description": "Humanized detail" }
            ],
            "siliconValleyWisdom": "Deep industry secret for this specific mission.",
            "viva": {
                "mcqs": [
                    { "question": "Scenario-based drill...", "options": ["A...", "B...", "C...", "D..."], "correctAnswer": "A..." }
                ],
                "shortQuestion": {
                    "question": "Architecture/Logic challenge...",
                    "correctAnswer": "Keyword",
                    "explanation": "Humanized reasoning."
                }
            }
        }
    ]
}
`;

const SYSTEM_PROMPT_TITANIUM_MANIFEST = `
// 🧠 TITANIUM ARCHITECT — NEURAL MANIFEST ENGINE (ULTRA ADAPTIVE)
You are the primary orchestrator.Your mission is to build the DNA for an elite Academic / Industrial project.
You must be able to handle ANY user prompt, no matter how messy, short, or casual.

[CORE ARCHITECT PROTOCOL]
1. ** Neural De - Noising **: If the user prompt is loose(e.g., "chai shop app", "hospital mangment"), intelligently expand it into a high - fidelity vision.Determine the hidden professional goals.
2. ** Modular Tech Stack **: Select a state - of - the - art stack(Frontend, Backend, DB, Infra) that fits the Academic Tier.
3. ** 2Point Neural Outline **: For each of the 22 mandatory points(Abstract to Viva), define a 1 - sentence "Strategic Intent".
4. ** Database DNA **: Define a real - world, normalized schema with min 5 tables and industrial fields.
5. ** Diagram specs **: Write valid Mermaid.js code for DFD(Level 0 / 1) and ERD.

[TIER SPECIFIC INTENSITY]
- BACHELOR: Practical, clean, industry - standard.
- MASTER: Pattern - driven, scalable, research - oriented.
- PHD: Highly mathematical / algorithmic, includes SOTA(State of the Art) references.
- BUSINESS: Marketing - First, ROI - centered, Lean MVP logic.

[OUTPUT FORMAT]
Return ONLY a valid JSON object:
{
    "title": "Industrial Title",
        "vision": "A 100-word deep executive vision...",
            "stack": { "primary": "...", "secondary": "...", "db": "...", "infra": "...", "reasoning": "..." },
    "outline22": { "p1_abstract": "...", "p2_intro": "...", "p3_scope": "...", "p4_stack": "...", "p5_existing": "...", "p6_proposed": "...", "p7_pros_cons": "...", "p8_feasibility": "...", "p9_dfd": "...", "p10_erd": "...", "p11_std": "...", "p12_data_dict": "...", "p13_schema": "...", "p14_arch": "...", "p15_uml": "...", "p16_conclusion": "...", "p17_future": "...", "p18_references": "...", "p19_appendix": "...", "p20_viva": "...", "p21_defense": "...", "p22_final_review": "..." },
    "dbSchema": [{ "table": "users", "fields": [{ "name": "id", "type": "UUID", "desc": "Prim Key" }] }],
        "diagrams": { "dfd_mermaid": "graph TD...", "erd_mermaid": "erDiagram..." }
}
`;

// 🌍 Global Intelligence Cache
let GLOBAL_INTELLIGENCE: any = { status: "baseline" };

const syncIntelligence = async () => {
    try {
        const workerUrl = await getDynamicConfig('PYTHON_WORKER_URL', process.env.PYTHON_WORKER_URL || 'http://127.0.0.1:8000');
        const res = await axios.post(`${workerUrl}/execute`, {
            job_id: 'sync-intel-' + Date.now(),
            command: 'get intelligence status',
            file_path: null
        }, { timeout: 5000 });
        if (res.data?.status === 'completed') GLOBAL_INTELLIGENCE = res.data.result;
    } catch (e: any) { }
};

// Orchestrator to be called from server.ts
export const initOpenAIService = () => {
    syncIntelligence();
    setInterval(syncIntelligence, 10 * 60 * 1000); // Sync every 10 min
};

const safeJsonParse = (str: string) => {
    let jsonStr = str.replace(/```json/g, '').replace(/```/g, '').trim();

    const sanitize = (s: string) => {
        return s.replace(/[\u0000-\u001F\u007F-\u009F]/g, (match) => {
            if (match === "\n") return "\\n";
            if (match === "\r") return "\\r";
            if (match === "\t") return "\\t";
            return "";
        });
    };

    // Attempt 1: Standard Parse
    try {
        return JSON.parse(jsonStr);
    } catch (e: any) {
        // Attempt 2: Extract and Sanitize
        const first = jsonStr.indexOf('{');
        const last = jsonStr.lastIndexOf('}');
        if (first !== -1 && last !== -1) {
            jsonStr = jsonStr.substring(first, last + 1);
        }

        const sanitized = sanitize(jsonStr);
        try {
            return JSON.parse(sanitized);
        } catch (e2: any) {
            // Attempt 3: Aggressive Repair
            // 1. Double quote unquoted keys
            let repaired = sanitized.replace(/(\b[a-zA-Z_][a-zA-Z0-9_]*\b)\s*:/g, '"$1":');
            // 2. Remove trailing commas
            repaired = repaired.replace(/,\s*([}\]])/g, '$1');
            // 3. Fix single quotes wrapping strings (only if not preceded by a letter/digit to avoid breaking contractions)
            // This is safer than global replace. 
            // We'll only do this if it still fails.

            try {
                return JSON.parse(repaired);
            } catch (e3: any) {
                // Last ditch: global single quote replace (Removed for MED-2 fix since it breaks contractions)
                console.error("CRITICAL: AI JSON Parsing completely failed.");
                console.log("RAW CONTENT START >>>");
                console.log(str);
                console.log("<<< RAW CONTENT END");
                console.error("Last Repair Attempt:", repaired);
                throw new Error(`Neural engine returned malformed logic: ${e.message}`);
            }
        }
    }
};

// HELPER: Unified Provider Handler — NVIDIA NIM (8 models) → Groq → OpenRouter → Gemini
export const getProviderResponse = async (
    messages: any[],
    options: { jsonMode?: boolean, maxTokens?: number, temperature?: number, apiKey?: string, taskType?: string } = {},
    forcedProvider?: string
) => {
    let lastError: any = null;

    // 🧠 Dynamic Key Discovery (DB First, Env Fallback)
    const activeGroqKey = await getAiKey('GROQ');
    const activeGeminiKey = await getAiKey('GEMINI');
    const activeNvidiaKey = await getAiKey('NVIDIA');
    const activeOpenAiKey = await getAiKey('OPENAI');
    const activeAnthropicKey = await getAiKey('ANTHROPIC');

    const activeProvider = (forcedProvider || await getActiveAiProvider() || 'groq').toLowerCase();

    // Define individual runner functions
    const runNvidia = async () => {
        if (!activeNvidiaKey) return null;
        const taskType = (options.taskType || 'chat') as string;
        const nvidiaModels = await getNvidiaModels(taskType as any);
        
        for (let i = 0; i < nvidiaModels.length; i++) {
            const model = nvidiaModels[i];
            try {
                console.log(`🚀 [NVIDIA-${i}] Trying ${model}...`);
                const response = await axios.post(
                    'https://integrate.api.nvidia.com/v1/chat/completions',
                    {
                        messages,
                        model,
                        temperature: options.temperature ?? 0.7,
                        max_tokens: options.maxTokens || 4096,
                        ...(options.jsonMode ? { response_format: { type: 'json_object' } } : {})
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${activeNvidiaKey}`,
                            'Content-Type': 'application/json'
                        },
                        timeout: 30000
                    }
                );
                console.log(`✅ [NVIDIA] ${model} responded successfully.`);
                return response.data;
            } catch (nvidiaErr: any) {
                const errData = nvidiaErr.response?.data || nvidiaErr.message;
                console.error(`❌ [NVIDIA-${i} Error] ${model} failed:`, errData);
                console.warn(`⚠️ [NVIDIA-${i}] ${model} failed. Trying next...`);
                lastError = errData;
            }
        }
        return null;
    };

    const runGroqPrimary = async () => {
        if (!activeGroqKey) return null;
        const keyToUse = options.apiKey || activeGroqKey;
        const model = 'llama-3.3-70b-versatile';
        try {
            console.log(`🚀 [GROQ-70B] Trying ${model}...`);
            const response = await axios.post(
                'https://api.groq.com/openai/v1/chat/completions',
                {
                    messages: messages,
                    model: model,
                    temperature: options.temperature || 0.7,
                    max_tokens: options.maxTokens || 4096,
                    response_format: options.jsonMode ? { type: "json_object" } : undefined
                },
                {
                    headers: {
                        'Authorization': `Bearer ${keyToUse}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 120000
                }
            );
            console.log(`✅ [GROQ-70B] Responded successfully.`);
            return response.data;
        } catch (err: any) {
            lastError = err.response?.data || err.message;
            console.error(`[GROQ-70B Error] groq:`, lastError || err);
            return null;
        }
    };

    const runGroqLite = async () => {
        if (!activeGroqKey) return null;
        const keyToUse = options.apiKey || activeGroqKey;
        try {
            console.log('⚡ [GROQ-LITE] Trying Groq llama-3.1-8b-instant...');
            const response = await axios.post(
                'https://api.groq.com/openai/v1/chat/completions',
                {
                    messages,
                    model: 'llama-3.1-8b-instant',
                    temperature: options.temperature ?? 0.7,
                    max_tokens: options.maxTokens || 4096,
                    response_format: options.jsonMode ? { type: 'json_object' } : undefined
                },
                {
                    headers: { 'Authorization': `Bearer ${keyToUse}`, 'Content-Type': 'application/json' },
                    timeout: 30000
                }
            );
            return response.data;
        } catch (err: any) {
            console.warn('[GROQ-LITE Failed]:', err.message);
            return null;
        }
    };

    const runGroq3B = async () => {
        if (!activeGroqKey) return null;
        const keyToUse = options.apiKey || activeGroqKey;
        try {
            console.log('⚡ [GROQ-3B] Trying Groq llama-3.2-3b-preview...');
            const response = await axios.post(
                'https://api.groq.com/openai/v1/chat/completions',
                {
                    messages,
                    model: 'llama-3.2-3b-preview',
                    temperature: options.temperature ?? 0.7,
                    max_tokens: options.maxTokens || 4096,
                    response_format: options.jsonMode ? { type: 'json_object' } : undefined
                },
                {
                    headers: { 'Authorization': `Bearer ${keyToUse}`, 'Content-Type': 'application/json' },
                    timeout: 20000
                }
            );
            return response.data;
        } catch (err: any) {
            return null;
        }
    };

    const runOpenRouter = async () => {
        const activeOpenRouterKey = await getAiKey('OPENROUTER');
        if (!activeOpenRouterKey) return null;
        try {
            console.log('⚡ [OPENROUTER] Trying google/gemini-2.5-flash...');
            const response = await axios.post(
                'https://openrouter.ai/api/v1/chat/completions',
                {
                    messages,
                    model: 'google/gemini-2.5-flash',
                    temperature: options.temperature ?? 0.7,
                    max_tokens: options.maxTokens || 4096,
                    response_format: options.jsonMode ? { type: 'json_object' } : undefined
                },
                {
                    headers: { 'Authorization': `Bearer ${activeOpenRouterKey}`, 'Content-Type': 'application/json' },
                    timeout: 45000
                }
            );
            return response.data;
        } catch (err: any) {
            return null;
        }
    };

    const runOpenRouterLlama70B = async () => {
        const activeOpenRouterKey = await getAiKey('OPENROUTER');
        if (!activeOpenRouterKey) return null;
        try {
            console.log('⚡ [OPENROUTER-LLAMA70B] Trying meta-llama/llama-3.3-70b-instruct...');
            const response = await axios.post(
                'https://openrouter.ai/api/v1/chat/completions',
                {
                    messages,
                    model: 'meta-llama/llama-3.3-70b-instruct',
                    temperature: options.temperature ?? 0.7,
                    max_tokens: options.maxTokens || 4096,
                    response_format: options.jsonMode ? { type: 'json_object' } : undefined
                },
                {
                    headers: { 'Authorization': `Bearer ${activeOpenRouterKey}`, 'Content-Type': 'application/json' },
                    timeout: 45000
                }
            );
            return response.data;
        } catch (err: any) {
            return null;
        }
    };

    const runBluesMinds = async () => {
        const activeBluesMindsKey = await getAiKey('BLUESMINDS') || process.env.BLUESMINDS_API_KEY;
        if (!activeBluesMindsKey) return null;
        const model = 'meta-llama/Meta-Llama-3-8B-Instruct';
        try {
            console.log(`🚀 [BLUESMINDS] Trying BluesMinds ${model}...`);
            const response = await axios.post(
                'https://api.bluesminds.com/v1/chat/completions',
                {
                    messages,
                    model,
                    temperature: options.temperature ?? 0.7,
                    max_tokens: options.maxTokens || 4096,
                    response_format: options.jsonMode ? { type: 'json_object' } : undefined
                },
                {
                    headers: { 'Authorization': `Bearer ${activeBluesMindsKey}`, 'Content-Type': 'application/json' },
                    timeout: 45000
                }
            );
            console.log(`✅ [BLUESMINDS] Responded successfully.`);
            return response.data;
        } catch (err: any) {
            console.error(`[BLUESMINDS Error] failed:`, err.response?.data || err.message);
            try {
                console.log(`🔄 [BLUESMINDS Fallback] Trying general 'llama3' model...`);
                const fallbackResponse = await axios.post(
                    'https://api.bluesminds.com/v1/chat/completions',
                    {
                        messages,
                        model: 'llama3',
                        temperature: options.temperature ?? 0.7,
                        max_tokens: options.maxTokens || 4096,
                        response_format: options.jsonMode ? { type: 'json_object' } : undefined
                    },
                    {
                        headers: { 'Authorization': `Bearer ${activeBluesMindsKey}`, 'Content-Type': 'application/json' },
                        timeout: 45000
                    }
                );
                return fallbackResponse.data;
            } catch (fallbackErr: any) {
                console.error(`[BLUESMINDS Fallback Error] failed:`, fallbackErr.response?.data || fallbackErr.message);
                return null;
            }
        }
    };

    // Helper: convert OpenAI-style message content to Gemini parts (supports vision)
    const toGeminiParts = (content: any): any[] => {
        if (typeof content === 'string') return [{ text: content || '' }];
        if (Array.isArray(content)) {
            return content.map((part: any) => {
                if (part.type === 'text') return { text: part.text || '' };
                if (part.type === 'image_url' && part.image_url?.url) {
                    const dataUrl = part.image_url.url;
                    const match = dataUrl.match(/^data:(image\/[a-z]+);base64,(.+)$/);
                    if (match) {
                        return { inlineData: { mimeType: match[1], data: match[2] } };
                    }
                }
                return { text: String(part) };
            });
        }
        return [{ text: String(content || '') }];
    };

    const runGemini = async () => {
        if (!activeGeminiKey) return null;
        try {
            console.log("🔄 [GEMINI] Trying Gemini v1beta...");
            const systemMsg = messages.find(m => m.role === 'system');
            let contents = messages
                .filter(m => m.role !== 'system')
                .map(m => ({
                    role: m.role === 'assistant' ? 'model' : 'user',
                    parts: toGeminiParts(m.content)
                }));
            if (contents.length === 0) contents = [{ role: 'user', parts: [{ text: 'proceed' }] }];
            const requestBody: any = {
                contents,
                generationConfig: {
                    temperature: options.temperature ?? 0.7,
                    maxOutputTokens: options.maxTokens || 4096,
                    ...(options.jsonMode ? { responseMimeType: "application/json" } : {})
                }
            };
            if (systemMsg?.content) {
                requestBody.system_instruction = { parts: [{ text: systemMsg.content }] };
            }
            const response = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${activeGeminiKey}`,
                requestBody,
                { timeout: 90000 }
            );
            const geminiContent = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!geminiContent) throw new Error("Gemini returned empty response.");
            return {
                choices: [{
                    message: { content: geminiContent },
                    finish_reason: 'stop'
                }]
            };
        } catch (err: any) {
            console.error(`[Gemini Failed]:`, err.response?.data || err.message);
            return null;
        }
    };

    const runGemini25Flash = async () => {
        if (!activeGeminiKey) return null;
        try {
            console.log("🔄 [GEMINI-2.5-FLASH] Trying gemini-2.5-flash...");
            const systemMsg = messages.find(m => m.role === 'system');
            let contents = messages
                .filter(m => m.role !== 'system')
                .map(m => ({
                    role: m.role === 'assistant' ? 'model' : 'user',
                    parts: toGeminiParts(m.content)
                }));
            if (contents.length === 0) contents = [{ role: 'user', parts: [{ text: 'proceed' }] }];
            const requestBody: any = {
                contents,
                generationConfig: {
                    temperature: options.temperature ?? 0.7,
                    maxOutputTokens: options.maxTokens || 4096,
                    ...(options.jsonMode ? { responseMimeType: "application/json" } : {})
                }
            };
            if (systemMsg?.content) {
                requestBody.system_instruction = { parts: [{ text: systemMsg.content }] };
            }
            const response = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${activeGeminiKey}`,
                requestBody,
                { timeout: 60000 }
            );
            const geminiContent = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!geminiContent) throw new Error("Gemini returned empty response.");
            return {
                choices: [{
                    message: { content: geminiContent },
                    finish_reason: 'stop'
                }]
            };
        } catch (err: any) {
            console.error(`[GEMINI-2.5-FLASH Failed]:`, err.message);
            return null;
        }
    };

    const runGemini15Pro = async () => {
        if (!activeGeminiKey) return null;
        try {
            console.log("🔄 [GEMINI-1.5-PRO] Trying gemini-1.5-pro...");
            const systemMsg = messages.find(m => m.role === 'system');
            let contents = messages
                .filter(m => m.role !== 'system')
                .map(m => ({
                    role: m.role === 'assistant' ? 'model' : 'user',
                    parts: toGeminiParts(m.content)
                }));
            if (contents.length === 0) contents = [{ role: 'user', parts: [{ text: 'proceed' }] }];
            const requestBody: any = {
                contents,
                generationConfig: {
                    temperature: options.temperature ?? 0.7,
                    maxOutputTokens: options.maxTokens || 4096,
                    ...(options.jsonMode ? { responseMimeType: "application/json" } : {})
                }
            };
            if (systemMsg?.content) {
                requestBody.system_instruction = { parts: [{ text: systemMsg.content }] };
            }
            const response = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${activeGeminiKey}`,
                requestBody,
                { timeout: 80000 }
            );
            const geminiContent = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!geminiContent) throw new Error("Gemini returned empty response.");
            return {
                choices: [{
                    message: { content: geminiContent },
                    finish_reason: 'stop'
                }]
            };
        } catch (err: any) {
            console.error(`[GEMINI-1.5-PRO Failed]:`, err.message);
            return null;
        }
    };

    const runGroqMixtral = async () => {
        if (!activeGroqKey) return null;
        const keyToUse = options.apiKey || activeGroqKey;
        const model = 'mixtral-8x7b-32768';
        try {
            console.log(`🚀 [GROQ-MIXTRAL] Trying ${model}...`);
            const response = await axios.post(
                'https://api.groq.com/openai/v1/chat/completions',
                {
                    messages: messages,
                    model: model,
                    temperature: options.temperature || 0.7,
                    max_tokens: options.maxTokens || 4096,
                    response_format: options.jsonMode ? { type: "json_object" } : undefined
                },
                {
                    headers: {
                        'Authorization': `Bearer ${keyToUse}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 40000
                }
            );
            console.log(`✅ [GROQ-MIXTRAL] Responded successfully.`);
            return response.data;
        } catch (err: any) {
            console.error(`[GROQ-MIXTRAL Error] failed:`, err.message);
            return null;
        }
    };

    const runGroqGemma2 = async () => {
        if (!activeGroqKey) return null;
        const keyToUse = options.apiKey || activeGroqKey;
        const model = 'gemma2-9b-it';
        try {
            console.log(`🚀 [GROQ-GEMMA2] Trying ${model}...`);
            const response = await axios.post(
                'https://api.groq.com/openai/v1/chat/completions',
                {
                    messages: messages,
                    model: model,
                    temperature: options.temperature || 0.7,
                    max_tokens: options.maxTokens || 4096,
                    response_format: options.jsonMode ? { type: "json_object" } : undefined
                },
                {
                    headers: {
                        'Authorization': `Bearer ${keyToUse}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 40000
                }
            );
            console.log(`✅ [GROQ-GEMMA2] Responded successfully.`);
            return response.data;
        } catch (err: any) {
            console.error(`[GROQ-GEMMA2 Error] failed:`, err.message);
            return null;
        }
    };

    const runOpenAI = async () => {
        if (!activeOpenAiKey) return null;
        const models = ['gpt-4o-mini', 'gpt-4o'];
        for (const model of models) {
            try {
                console.log(`🚀 [OPENAI] Trying ${model}...`);
                const response = await axios.post(
                    'https://api.openai.com/v1/chat/completions',
                    {
                        messages,
                        model,
                        temperature: options.temperature ?? 0.7,
                        max_tokens: options.maxTokens || 4096,
                        response_format: options.jsonMode ? { type: 'json_object' } : undefined
                    },
                    {
                        headers: { 'Authorization': `Bearer ${activeOpenAiKey}`, 'Content-Type': 'application/json' },
                        timeout: 50000
                    }
                );
                console.log(`✅ [OPENAI] ${model} responded successfully.`);
                return response.data;
            } catch (err: any) {
                console.error(`[OPENAI Error] ${model} failed:`, err.message);
            }
        }
        return null;
    };

    const runAnthropic = async () => {
        if (!activeAnthropicKey) return null;
        const models = ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022'];
        for (const model of models) {
            try {
                console.log(`🚀 [ANTHROPIC] Trying ${model}...`);
                const systemMsg = messages.find(m => m.role === 'system');
                const response = await axios.post(
                    'https://api.anthropic.com/v1/messages',
                    {
                        model,
                        max_tokens: options.maxTokens || 4096,
                        messages: messages.filter(m => m.role !== 'system').map(m => ({
                            role: m.role === 'assistant' ? 'assistant' : 'user',
                            content: String(m.content || '')
                        })),
                        system: systemMsg?.content || undefined,
                        temperature: options.temperature ?? 0.7
                    },
                    {
                        headers: {
                            'x-api-key': activeAnthropicKey,
                            'anthropic-version': '2023-06-01',
                            'content-type': 'application/json'
                        },
                        timeout: 60000
                    }
                );
                const content = response.data?.content?.[0]?.text;
                if (!content) throw new Error("Anthropic returned empty content.");
                console.log(`✅ [ANTHROPIC] ${model} responded successfully.`);
                return {
                    choices: [{
                        message: { content },
                        finish_reason: 'stop'
                    }]
                };
            } catch (err: any) {
                console.error(`[ANTHROPIC Error] ${model} failed:`, err.message);
            }
        }
        return null;
    };

    // Build adaptive queue containing ALL 15+ models, sorted by preferred provider
    let queue: (() => Promise<any>)[] = [];
    
    const groqGroup = [runGroqPrimary, runGroqGemma2, runGroqLite, runGroq3B, runGroqMixtral];
    const openaiGroup = [runOpenAI];
    const anthropicGroup = [runAnthropic];
    const nvidiaGroup = [runNvidia]; // loops over all 8 NVIDIA NIM models internally
    const geminiGroup = [runGemini25Flash, runGemini15Pro, runGemini]; // direct APIs
    const openrouterGroup = [runOpenRouter, runOpenRouterLlama70B];
    const bluesmindsGroup = [runBluesMinds];

    if (activeProvider === 'nvidia') {
        queue = [...nvidiaGroup, ...bluesmindsGroup, ...groqGroup, ...openaiGroup, ...anthropicGroup, ...geminiGroup, ...openrouterGroup];
    } else if (activeProvider === 'gemini') {
        queue = [...geminiGroup, ...bluesmindsGroup, ...groqGroup, ...openaiGroup, ...anthropicGroup, ...nvidiaGroup, ...openrouterGroup];
    } else if (activeProvider === 'openrouter') {
        queue = [...openrouterGroup, ...bluesmindsGroup, ...groqGroup, ...openaiGroup, ...anthropicGroup, ...geminiGroup, ...nvidiaGroup];
    } else if (activeProvider === 'openai') {
        queue = [...openaiGroup, ...bluesmindsGroup, ...anthropicGroup, ...groqGroup, ...geminiGroup, ...nvidiaGroup, ...openrouterGroup];
    } else if (activeProvider === 'anthropic') {
        queue = [...anthropicGroup, ...bluesmindsGroup, ...openaiGroup, ...groqGroup, ...geminiGroup, ...nvidiaGroup, ...openrouterGroup];
    } else if (activeProvider === 'bluesminds') {
        queue = [...bluesmindsGroup, ...groqGroup, ...openaiGroup, ...anthropicGroup, ...geminiGroup, ...nvidiaGroup, ...openrouterGroup];
    } else {
        // Default is groq
        queue = [...groqGroup, ...bluesmindsGroup, ...openaiGroup, ...anthropicGroup, ...nvidiaGroup, ...geminiGroup, ...openrouterGroup];
    }

    // Execute queue sequentially until one succeeds
    for (const runProvider of queue) {
        try {
            const res = await runProvider();
            if (res) return res;
        } catch (e: any) {
            console.warn(`[AI Queue Fallback] Provider failed:`, e.message);
        }
    }

    // Final mock fallback if everything failed
    console.error("⚠️ [CRITICAL] All AI cloud providers failed. Returning mock response.");
    if (options.jsonMode) {
        return {
            choices: [{
                message: {
                    content: JSON.stringify({
                        intent: {
                            intent: "general_chat",
                            confidence: 0.9,
                            subject: "general",
                            topic: "general",
                            needs_onboarding: false
                        },
                        reply: "⚠️ **AI Service Temporarily Offline**\n\nThe server is experiencing very high traffic. Let's study using our interactive sandbox simulator below while we reconnect!",
                        suggestions: ["Explain Gravity", "Try Ohm's Law", "Run Titration Experiment"],
                        lab_config: null
                    })
                },
                finish_reason: 'stop'
            }]
        };
    } else {
        return {
            choices: [{
                message: {
                    content: "⚠️ **AI Service Temporarily Unavailable**\n\nAll AI providers are currently experiencing high load. Please try again in a moment.\n\nIn the meantime, you can explore your **Tasks**, **Roadmap**, or **Simulator**."
                },
                finish_reason: 'stop'
            }]
        };
    }
};

const requestStreamFromProvider = async (
    provider: string,
    model: string,
    url: string,
    payload: any,
    headers: any,
    timeout: number,
    onChunk: (token: string) => void
) => {
    const response = await axios.post(url, payload, {
        headers,
        timeout,
        responseType: 'stream'
    });

    return new Promise<string>((resolve, reject) => {
        let accumulatedText = "";
        let buffer = "";

        response.data.on('data', (chunk: Buffer) => {
            buffer += chunk.toString('utf8');
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                const cleanLine = line.trim();
                if (!cleanLine) continue;

                if (cleanLine.startsWith('data: ')) {
                    const dataStr = cleanLine.slice(6);
                    if (dataStr === '[DONE]') continue;
                    try {
                        const parsed = JSON.parse(dataStr);
                        let token = "";
                        if (provider === 'gemini') {
                            token = parsed.candidates?.[0]?.content?.parts?.[0]?.text || "";
                        } else {
                            token = parsed.choices?.[0]?.delta?.content || "";
                        }
                        if (token) {
                            accumulatedText += token;
                            onChunk(token);
                        }
                    } catch (e) {
                        // ignore malformed JSON
                    }
                }
            }
        });

        response.data.on('end', () => {
            if (buffer.startsWith('data: ')) {
                const dataStr = buffer.slice(6).trim();
                if (dataStr !== '[DONE]') {
                    try {
                        const parsed = JSON.parse(dataStr);
                        let token = "";
                        if (provider === 'gemini') {
                            token = parsed.candidates?.[0]?.content?.parts?.[0]?.text || "";
                        } else {
                            token = parsed.choices?.[0]?.delta?.content || "";
                        }
                        if (token) {
                            accumulatedText += token;
                            onChunk(token);
                        }
                    } catch (e) {}
                }
            }
            resolve(accumulatedText);
        });

        response.data.on('error', (err: any) => {
            reject(err);
        });
    });
};

export const getProviderResponseStream = async (
    messages: any[],
    onChunk: (token: string) => void,
    options: { jsonMode?: boolean, maxTokens?: number, temperature?: number, apiKey?: string } = {},
    forcedProvider?: string
) => {
    let lastError: any = null;
    const activeGroqKey = await getAiKey('GROQ');
    const activeGeminiKey = await getAiKey('GEMINI');

    const activeProvider = (forcedProvider || await getActiveAiProvider() || 'groq').toLowerCase();

    // Define individual stream runners
    const runGroqPrimaryStream = async () => {
        if (!activeGroqKey) return null;
        const keyToUse = options.apiKey || activeGroqKey;
        const model = 'llama-3.3-70b-versatile';
        console.log(`[AI STREAM] Trying Groq ${model}...`);
        return await requestStreamFromProvider(
            'groq',
            model,
            'https://api.groq.com/openai/v1/chat/completions',
            {
                messages,
                model,
                temperature: options.temperature || 0.7,
                max_tokens: options.maxTokens || 4096,
                stream: true
            },
            {
                'Authorization': `Bearer ${keyToUse}`,
                'Content-Type': 'application/json'
            },
            120000,
            onChunk
        );
    };

    const runGroqLiteStream = async () => {
        if (!activeGroqKey) return null;
        const keyToUse = options.apiKey || activeGroqKey;
        const model = 'llama-3.1-8b-instant';
        console.log(`⚡ [STREAM-FALLBACK-1] Trying Groq ${model}...`);
        return await requestStreamFromProvider(
            'groq',
            model,
            'https://api.groq.com/openai/v1/chat/completions',
            {
                messages,
                model,
                temperature: options.temperature || 0.7,
                max_tokens: options.maxTokens || 4096,
                stream: true
            },
            {
                'Authorization': `Bearer ${keyToUse}`,
                'Content-Type': 'application/json'
            },
            30000,
            onChunk
        );
    };

    const runGroq3BStream = async () => {
        if (!activeGroqKey) return null;
        const keyToUse = options.apiKey || activeGroqKey;
        const model = 'llama-3.2-3b-preview';
        console.log(`⚡ [STREAM-FALLBACK-1.5] Trying Groq ${model}...`);
        return await requestStreamFromProvider(
            'groq',
            model,
            'https://api.groq.com/openai/v1/chat/completions',
            {
                messages,
                model,
                temperature: options.temperature || 0.7,
                max_tokens: options.maxTokens || 4096,
                stream: true
            },
            {
                'Authorization': `Bearer ${keyToUse}`,
                'Content-Type': 'application/json'
            },
            20000,
            onChunk
        );
    };

    const runOpenRouterStream = async () => {
        const activeOpenRouterKey = await getAiKey('OPENROUTER');
        if (!activeOpenRouterKey) return null;
        const model = 'google/gemini-2.5-flash';
        console.log(`⚡ [STREAM-FALLBACK-1.7] Trying OpenRouter ${model}...`);
        return await requestStreamFromProvider(
            'openrouter',
            model,
            'https://openrouter.ai/api/v1/chat/completions',
            {
                messages,
                model,
                temperature: options.temperature || 0.7,
                max_tokens: options.maxTokens || 4096,
                stream: true
            },
            {
                'Authorization': `Bearer ${activeOpenRouterKey}`,
                'Content-Type': 'application/json'
            },
            45000,
            onChunk
        );
    };

    const runGeminiStream = async () => {
        if (!activeGeminiKey) return null;
        console.log("🔄 [STREAM-FALLBACK-2] Switching to Gemini...");
        const systemMsg = messages.find(m => m.role === 'system');
        let contents = messages
            .filter(m => m.role !== 'system')
            .map(m => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: String(m.content || '') }]
            }));
        if (contents.length === 0) contents = [{ role: 'user', parts: [{ text: 'proceed' }] }];

        const requestBody: any = {
            contents,
            generationConfig: {
                temperature: options.temperature ?? 0.7,
                maxOutputTokens: options.maxTokens || 4096
            }
        };
        if (systemMsg?.content) {
            requestBody.system_instruction = { parts: [{ text: systemMsg.content }] };
        }

        return await requestStreamFromProvider(
            'gemini',
            'gemini-1.5-flash',
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?key=${activeGeminiKey}&alt=sse`,
            requestBody,
            { 'Content-Type': 'application/json' },
            90000,
            onChunk
        );
    };


    const runNvidiaStream = async () => {
        const activeNvidiaKey = await getAiKey('NVIDIA');
        if (!activeNvidiaKey) return null;
        const nvidiaModels = await getNvidiaModels('chat');
        for (const model of nvidiaModels) {
            try {
                console.log(`🚀 [STREAM-NVIDIA] Trying ${model}...`);
                const result = await requestStreamFromProvider(
                    'nvidia',
                    model,
                    'https://integrate.api.nvidia.com/v1/chat/completions',
                    {
                        messages,
                        model,
                        temperature: options.temperature ?? 0.7,
                        max_tokens: options.maxTokens || 4096,
                        stream: true
                    },
                    {
                        'Authorization': `Bearer ${activeNvidiaKey}`,
                        'Content-Type': 'application/json'
                    },
                    60000,
                    onChunk
                );
                if (result) return result;
            } catch (err: any) {
                console.warn(`[STREAM-NVIDIA] ${model} failed: ${err.message}`);
            }
        }
        return null;
    };

    // Build streams queue based on active provider preference
    let queue: (() => Promise<any>)[] = [];
    if (activeProvider === 'gemini') {
        queue = [runGeminiStream, runNvidiaStream, runGroqPrimaryStream, runGroqLiteStream, runOpenRouterStream];
    } else if (activeProvider === 'openrouter') {
        queue = [runOpenRouterStream, runNvidiaStream, runGroqPrimaryStream, runGeminiStream, runGroqLiteStream];
    } else {
        // default: NVIDIA first (valid key), then groq, gemini, openrouter fallbacks
        queue = [runNvidiaStream, runGroqPrimaryStream, runGroqLiteStream, runGeminiStream, runOpenRouterStream, runGroq3BStream];
    }

    for (const runStream of queue) {
        try {
            const res = await runStream();
            if (res) return res;
        } catch (err: any) {
            console.warn(`Stream provider failed:`, err.message);
            lastError = err;
        }
    }

    throw new Error(`AI System Critical Failure: All providers exhausted in stream mode.`);
};


const getResponseFormattingInstruction = (userMessage: string, userName?: string): string => {
    const lowMsg = userMessage.toLowerCase().trim();
    
    // 1. Casual Chat / Greetings / Acknowledgment
    const isGreeting = /^(hi|hello|hey|hyy?|how are you|hey there|good morning|good evening)/i.test(lowMsg);
    const isTinyAck = /^(ok|okay|thanks?|thx|yes|ya|yup|hm+m?|h|han|ji|perfect|noted|done|thank you)$/i.test(lowMsg) || (lowMsg.length <= 3 && !/^\d+$/.test(lowMsg));
    
    if (isGreeting || isTinyAck) {
        return `
====================================
🎯 CASUAL CHAT MODE (STRICT LIMITS)
====================================
The user has sent a greeting, procedural acknowledgment, or short social message.
1. **STRICT LIMIT**: Respond with exactly ONE sentence or line (maximum 15-20 words).
2. **TONE**: Warm, friendly, elder-brotherly, and helpful. ALWAYS address the user as "${userName || 'Futurist'}". Example: "Hey **${userName || 'Futurist'}**, how are you doing today? Ready to build something legendary?"
3. **FORMAT**: Keep it simple. NEVER use H2/H3 headings, bullet lists, or bold lists here.
4. **NO OVERHEAD**: Do NOT append any long [SUMMARY] or suggestions JSON to this response. Keep it clean and short.
`;
    }

    // 2. Technical Academic Questions (Maths, Physics, Chemistry, Biology)
    const academicKeywords = [
        'math', 'solve', 'calculate', 'formula', 'equation', 'reaction', 'chemistry', 'physics', 
        'biology', 'photosynthesis', 'pythagoras', 'gravity', 'electric', 'circuit', 'atom', 'molecule',
        'cell', 'dna', 'rna', 'protein', 'enzyme', 'organelle', 'deriv', 'proof', 'theorem', 'sum',
        'algebra', 'geometry', 'calculus', 'integration', 'differentiation', 'force', 'velocity', 'acid', 'base'
    ];
    const isAcademic = academicKeywords.some(kw => lowMsg.includes(kw));
    
    if (isAcademic) {
        return `
====================================
🔬 DEEP TECHNICAL ACADEMIC MODE (EXHAUSTIVE & DETAILED)
====================================
The user is asking an academic/technical question (Math, Physics, Chemistry, Biology).
1. **LENGTH**: Provide a VERY DETAILED, long, and comprehensive masterclass explanation.
2. **STRUCTURE**:
   - Use H2 (##) and H3 (###) titles to organize the sections logically.
   - Use standard Markdown bullets (\`-\`) and numbered steps (\`1.\`) for mechanisms or steps.
   - Highlight key terms in **bold**.
3. **CONTENT**:
   - Mix clear descriptions with step-by-step mathematical calculations, derivations, chemical formulas, and biological processes.
   - Write equations in plain text/Unicode (e.g. use subscripts like H₂O, superscripts like x², arrows like →, etc.) without LaTeX dollar signs ($ or $$).
   - Use real-world analogies where helpful.
`;
    }

    // 3. Explicit Detail Request
    const detailKeywords = ['detail', 'explain in-depth', 'samjhao', 'long', 'discuss', 'explain fully', 'deep dive', 'step by step', 'sikhau'];
    const isDetailRequest = detailKeywords.some(kw => lowMsg.includes(kw));

    if (isDetailRequest) {
        return `
====================================
📝 HIGHLY STRUCTURED DETAILED MODE (bullet points, highlighted, organized)
====================================
The user has explicitly asked for a detailed explanation/discussion.
1. **LENGTH**: Long and detailed.
2. **FORMAT**:
   - Use clear sections with H2 (##) and H3 (###) headings.
   - Use bullet points (\`-\`) and numbered lists (\`1.\`) extensively.
   - Put key insights, critical actions, and terminology in **bold**.
   - Emphasize takeaways and examples.
`;
    }

    // 4. Default: Normal Questions (Medium length, simple structure)
    return `
====================================
ℹ️ MEDIUM DETAIL EXPLANATION MODE (NORMAL)
====================================
The user has asked a general question.
1. **LENGTH**: Medium-length response (1 to 2 concise, clear paragraphs).
2. **FORMAT**:
   - Answer directly.
   - Do NOT use heavy vertical lists, multiple headings (H2/H3), or overly long bullet blocks unless they are specifically requested or necessary.
   - Keep it friendly, clear, and focused.
`;
};

export const openaiService = {
    // ... logic to use GLOBAL_INTELLIGENCE in prompts if needed
    // For now, I will just inject it into the final prompt builder

    // ... existing generateResponse ...
    async generateResponse(context: { title: string; lastMsg: string }, userMessage: string, systemContext?: { mode: string, sessionState: any, userContext: any }, chatHistory: any[] = []) {
        try {
            const sessionContextContract = JSON.stringify({
                user_profile: systemContext?.userContext || {},
                session_state: systemContext?.sessionState || {}
            }, null, 2);

            const activeMode = systemContext?.mode || "execution";

            const attachmentAnalysis = systemContext?.userContext?.attachmentAnalysis;

            let contextInjection = `
[SYSTEM CONTEXT CONTRACT(NON - NEGOTIABLE)]
${sessionContextContract}

[LEARNED INTELLIGENCE & EVOLUTION STATUS]
${JSON.stringify(GLOBAL_INTELLIGENCE, null, 2)}

CURRENT MODE: ${activeMode.toUpperCase()}
`;

            // Formatting instruction dynamically routed by query intent & subject
            contextInjection += getResponseFormattingInstruction(userMessage, systemContext?.userContext?.name);

            if (attachmentAnalysis && attachmentAnalysis.length > 5) {
                // FORCE OVERRIDE
                contextInjection += `
--------------------------------------------------------------------------------
⚠️ ** URGENT: USER HAS ATTACHED A FILE.IGNORE DEFAULT PERSONA LIMITS.** ⚠️
--------------------------------------------------------------------------------
    You MUST prioritize the file analysis below over any other context.
The user wants you to analyze, summarize, or work with this file content.

[ATTACHMENT ANALYSIS & CONTENT]:
${attachmentAnalysis}

INSTRUCTIONS:
1. If the user asks a question, answer it using the [ATTACHMENT ANALYSIS] above.
2. If the user gives a command alongside the file, execute it on the file's content.
3. Be specific.Quote the file content where possible.
4. Maintain the persona while prioritizing this data.
--------------------------------------------------------------------------------
    `;
            }

            // 1. Build Historical Context: Focus on the last 20 turns to maintain sharp context.
            const history = chatHistory.slice(-20).map(m => ({
                role: m.role,
                content: m.content
            }));

            // 🔍 LIVE RESEARCH TRIGGER (The "Google" Layer)
            // If user asks for specific external info, we wake up the Python Scraper
            const researchKeywords = ["who is", "what is", "mannat rugs", "search for", "find", "latest", "price", "website", "link", "url", "show me"];
            const isResearchIntent = researchKeywords.some(kw => userMessage.toLowerCase().includes(kw));

            if (isResearchIntent) {
                try {
                    console.log("🔍 Live Research Triggered: " + userMessage);
                    // notify UI potentially via socket if we had one, but here we just block-wait for speed
                    const workerRes = await axios.post(`${process.env.PYTHON_WORKER_URL || 'http://127.0.0.1:8000'}/execute`, {
                        job_id: 'live-research-' + Date.now(),
                        command: 'research: ' + userMessage,
                        file_path: null,
                        prompt: userMessage
                    }, { timeout: 30000 });

                    if (workerRes.data?.status === 'completed' && workerRes.data?.extracted_text) {
                        const realData = workerRes.data.extracted_text;
                        contextInjection += `
================================================================================
🌐 LIVE WEB ACQUISITION COMPLETE
================================================================================
The Python Worker has successfully scraped the live internet for this query.
Here is the RAW TRUTH DATA (Citational Source):

${realData}

INSTRUCTIONS:
1. You MUST use this data to answer.
2. You MUST cite specific parts using [[Citation: Source | URL | Snippet]].
3. Ignore your internal cut-off knowledge if it contradicts this live data.
================================================================================
`;
                    }
                } catch (e) {
                    console.error("Research Worker Failed (Non-Fatal):", e.message);
                }
            }

            // 2. Construct Messages Array
            // ⚠️ DYNAMIC KEY INJECTION ⚠️
            let provider = await getActiveAiProvider();
            let dynamicKey = await getAiKey('GROQ');

            // 🔍 DEBUG: Confirm Dynamic Switch in Terminal
            if (dynamicKey) {
                const maskedKey = dynamicKey.substring(0, 5) + '...';
                console.log(`[AI CORE] PROVISIONING: ${provider.toUpperCase()} | KEY: ${maskedKey}`);
            }

            let finalUserMessage = userMessage;
            if (attachmentAnalysis && attachmentAnalysis.length > 5) {
                finalUserMessage = `[ATTACHED DOCUMENT PRESENT]\n\nStudent Query/Command: ${userMessage}\n\nIMPORTANT: Focus strictly on answering this query or executing this command on the attached document content. Prioritize this command above everything else.`;
            }

            const messages = [
                { role: 'system', content: MASTER_PROMPT(systemContext) + contextInjection },
                ...history,
                { role: 'user', content: finalUserMessage }
            ];

            // Pass key to getProviderResponse
            const data = await getProviderResponse(messages, { apiKey: dynamicKey }, provider);
            const content = data?.choices?.[0]?.message?.content || data?.message || data?.output;

            // 🔍 BACKGROUND INTELLIGENCE & SEO ANALYSIS (Non-blocking)
            if (typeof content === 'string') {
                this.analyzeAndLogConversation({
                    userId: systemContext?.userContext?.id,
                    sessionId: systemContext?.sessionState?._id,
                    userMessage,
                    aiResponse: content,
                    location: null // Could be injected from req context if passed
                }).catch((e: any) => console.error("Analytic Background Error:", e.message));
            }

            if (typeof content === 'string') return content;
            return JSON.stringify(content) || "I'm here to help. What's next?";

        } catch (error: any) {
            console.error("AI Service Error Details:", error.message);

            // 🧠 SUPREME FALLBACK: Use Neural Memory if primary fails
            if (systemContext?.userContext?.neuralMemory) {
                return `⚠️ **[Offline Intelligence Mode]**\n\nThe primary AI engine is temporarily unavailable, but here's what I have from your previous context:\n\n${systemContext.userContext.neuralMemory}\n\nPlease try again shortly — the system will resume automatically.`;
            }

            // Determine if it's a rate limit or server error
            const isRateLimit = error.message?.includes('429') || error.message?.includes('rate') || error.message?.includes('RATE_LIMIT') || error.response?.status === 429;
            if (isRateLimit) {
                return "⏳ **AI capacity reached.** Our systems are handling high demand right now. Please wait a moment and try again — your request will go through shortly.";
            }
            return "⚠️ **AI service is temporarily unavailable.** We're working to restore it. Please try again in a few seconds.";
        }
    },

    async generateResponseStream(
        context: { title: string; lastMsg: string },
        userMessage: string,
        onToken: (chunk: { type: 'think' | 'text', token: string }) => void,
        systemContext?: { mode: string, sessionState: any, userContext: any },
        chatHistory: any[] = []
    ): Promise<string> {
        try {
            const sessionContextContract = JSON.stringify({
                user_profile: systemContext?.userContext || {},
                session_state: systemContext?.sessionState || {}
            }, null, 2);

            const activeMode = systemContext?.mode || "execution";
            const attachmentAnalysis = systemContext?.userContext?.attachmentAnalysis;

            let contextInjection = `
[SYSTEM CONTEXT CONTRACT(NON - NEGOTIABLE)]
${sessionContextContract}

[LEARNED INTELLIGENCE & EVOLUTION STATUS]
${JSON.stringify(GLOBAL_INTELLIGENCE, null, 2)}

CURRENT MODE: ${activeMode.toUpperCase()}
`;

            // Formatting instruction dynamically routed by query intent & subject
            contextInjection += getResponseFormattingInstruction(userMessage, systemContext?.userContext?.name);

            if (attachmentAnalysis && attachmentAnalysis.length > 5) {
                contextInjection += `
--------------------------------------------------------------------------------
⚠️ ** URGENT: USER HAS ATTACHED A FILE.IGNORE DEFAULT PERSONA LIMITS.** ⚠️
--------------------------------------------------------------------------------
    You MUST prioritize the file analysis below over any other context.
The user wants you to analyze, summarize, or work with this file content.

[ATTACHMENT ANALYSIS & CONTENT]:
${attachmentAnalysis}

INSTRUCTIONS:
1. If the user asks a question, answer it using the [ATTACHMENT ANALYSIS] above.
2. If the user gives a command alongside the file, execute it on the file's content.
3. Be specific.Quote the file content where possible.
4. Maintain the persona while prioritizing this data.
--------------------------------------------------------------------------------
    `;
            }

            const history = chatHistory.slice(-20).map(m => ({
                role: m.role,
                content: m.content
            }));

            // 🔍 LIVE RESEARCH TRIGGER
            const researchKeywords = ["who is", "what is", "mannat rugs", "search for", "find", "latest", "price", "website", "link", "url", "show me"];
            const isResearchIntent = researchKeywords.some(kw => userMessage.toLowerCase().includes(kw));

            if (isResearchIntent) {
                try {
                    console.log("🔍 Live Research Triggered: " + userMessage);
                    const workerRes = await axios.post(`${process.env.PYTHON_WORKER_URL || 'http://127.0.0.1:8000'}/execute`, {
                        job_id: 'live-research-' + Date.now(),
                        command: 'research: ' + userMessage,
                        file_path: null,
                        prompt: userMessage
                    }, { timeout: 30000 });

                    if (workerRes.data?.status === 'completed' && workerRes.data?.extracted_text) {
                        const realData = workerRes.data.extracted_text;
                        contextInjection += `
================================================================================
🌐 LIVE WEB ACQUISITION COMPLETE
================================================================================
The Python Worker has successfully scraped the live internet for this query.
Here is the RAW TRUTH DATA (Citational Source):

${realData}

INSTRUCTIONS:
1. You MUST use this data to answer.
2. You MUST cite specific parts using [[Citation: Source | URL | Snippet]].
3. Ignore your internal cut-off knowledge if it contradicts this live data.
================================================================================
`;
                    }
                } catch (e: any) {
                    console.error("Research Worker Failed (Non-Fatal):", e.message);
                }
            }

            let provider = await getActiveAiProvider();
            let dynamicKey = await getAiKey('GROQ');

            if (dynamicKey) {
                const maskedKey = dynamicKey.substring(0, 5) + '...';
                console.log(`[AI CORE STREAM] PROVISIONING: ${provider.toUpperCase()} | KEY: ${maskedKey}`);
            }

            // We must inject a system instruction to output detailed step-by-step reasoning inside <think>...</think> tags if they are not already doing it natively
            let reasoningInstruction = `\nBefore answering, you MUST write down your detailed step-by-step thinking/reasoning process inside <think> and </think> tags. Do not skip this step.\n`;

            let finalUserMessage = userMessage;
            if (attachmentAnalysis && attachmentAnalysis.length > 5) {
                finalUserMessage = `[ATTACHED DOCUMENT PRESENT]\n\nUser Query/Command: ${userMessage}\n\nIMPORTANT: Focus strictly on answering this query or executing this command on the attached document content. Prioritize this command above everything else.`;
            }

            const messages = [
                { role: 'system', content: MASTER_PROMPT(systemContext) + contextInjection + reasoningInstruction },
                ...history,
                { role: 'user', content: finalUserMessage }
            ];

            let accumulatedText = "";
            let lastSentThink = "";
            let lastSentAnswer = "";

            const onChunkWrapper = (token: string) => {
                accumulatedText += token;

                const thinkStart = accumulatedText.indexOf('<think>');
                const thinkEnd = accumulatedText.indexOf('</think>');

                let currentThink = "";
                let currentAnswer = "";

                if (thinkStart !== -1) {
                    if (thinkEnd !== -1) {
                        currentThink = accumulatedText.slice(thinkStart + 7, thinkEnd);
                        currentAnswer = accumulatedText.slice(0, thinkStart) + accumulatedText.slice(thinkEnd + 8);
                    } else {
                        currentThink = accumulatedText.slice(thinkStart + 7);
                        currentAnswer = accumulatedText.slice(0, thinkStart);
                    }
                } else {
                    currentThink = "";
                    currentAnswer = accumulatedText;
                }

                if (currentThink.length > lastSentThink.length) {
                    const newThink = currentThink.slice(lastSentThink.length);
                    onToken({ type: 'think', token: newThink });
                    lastSentThink = currentThink;
                }
                if (currentAnswer.length > lastSentAnswer.length) {
                    const newAnswer = currentAnswer.slice(lastSentAnswer.length);
                    onToken({ type: 'text', token: newAnswer });
                    lastSentAnswer = currentAnswer;
                }
            };

            const fullText = await getProviderResponseStream(messages, onChunkWrapper, { apiKey: dynamicKey }, provider);

            // 🔍 BACKGROUND INTELLIGENCE & SEO ANALYSIS (Non-blocking)
            if (typeof fullText === 'string') {
                this.analyzeAndLogConversation({
                    userId: systemContext?.userContext?.id,
                    sessionId: systemContext?.sessionState?._id,
                    userMessage,
                    aiResponse: fullText,
                    location: null
                }).catch((e: any) => console.error("Analytic Background Error:", e.message));
            }

            return fullText;

        } catch (error: any) {
            console.error("AI Service Stream Error Details:", error.message);
            // Professional fallback in offline / error mode
            const isRateLimit = error.message?.includes('429') || error.message?.includes('rate') || error.message?.includes('RATE_LIMIT') || error.response?.status === 429;
            let fallbackText: string;
            if (systemContext?.userContext?.neuralMemory) {
                fallbackText = `⚠️ **[Offline Intelligence Mode]**\n\nThe primary AI engine is temporarily unavailable. Here's relevant context from your previous session:\n\n${systemContext.userContext.neuralMemory}\n\nPlease try again shortly.`;
            } else if (isRateLimit) {
                fallbackText = "⏳ **AI capacity reached.** Our systems are handling high demand right now. Please wait a moment and try again.";
            } else {
                fallbackText = "⚠️ **AI service temporarily unavailable.** Please try again in a few seconds.";
            }
            onToken({ type: 'text', token: fallbackText });
            return fallbackText;
        }
    },

    async analyzeAndLogConversation(data: { userId?: any, sessionId?: any, userMessage: string, aiResponse: string, location?: any }) {
        try {
            const { analyticsService } = await import('../../modules/analytics/analytics.service');

            // 🏷️ Extract Keywords & Intent using a fast AI call
            const analysisPrompt = [
                { role: 'system', content: 'You are a Strategic SEO Analyst. Analyze the conversation turn and return ONLY JSON: { "keywords": ["word1", "word2"], "intent": "user goal summary" }' },
                { role: 'user', content: `User: ${data.userMessage}\nAssistant: ${data.aiResponse.substring(0, 500)}` }
            ];

            const provider = 'groq';
            const analysisData = await getProviderResponse(analysisPrompt, { jsonMode: true, maxTokens: 150 }, provider);
            const analysisContent = analysisData?.choices?.[0]?.message?.content || analysisData?.message || analysisData?.output;

            const parsed = safeJsonParse(String(analysisContent));

            if (parsed && parsed.keywords) {
                await analyticsService.logChatTurn({
                    userId: data.userId,
                    sessionId: data.sessionId,
                    keywords: parsed.keywords,
                    intent: parsed.intent,
                    location: {
                        city: data.location?.city || "Unknown",
                        region: data.location?.region || "Unknown",
                        country: data.location?.country || "Unknown",
                        ip: data.location?.ip || "Unknown"
                    },
                    device: "Desktop / Web"
                });
            }
        } catch (e: any) {
            // Silent fail for analytics
        }
    },

    generateSummary: async (chatHistory: any[]) => {
        try {
            const conversation = chatHistory.map(m => `${m.role}: ${m.content}`).join('\n');
            const messages = [
                { role: 'system', content: SYSTEM_PROMPT_SUMMARY },
                { role: 'user', content: `Analyze this conversation Turn-by-Turn and extract the TRUTH:\n${conversation}` }
            ];

            const data = await getProviderResponse(messages, { jsonMode: true, temperature: 0.1 }); // Low temp for accuracy
            const content = data?.choices?.[0]?.message?.content || data?.message || data?.output;
            const parsed = safeJsonParse(String(content));

            // Intelligence Healing: Ensure mandatory fields exist
            if (!parsed.sub_topics || !Array.isArray(parsed.sub_topics) || parsed.sub_topics.length === 0) {
                parsed.sub_topics = ["Fundamentals", "Core Implementation", "Strategic Deployment", "Optimization", "Security Hardening", "Scaling"];
            }

            // Consistency fix: ensure intended_stack is a string for the model
            if (Array.isArray(parsed.intended_stack)) {
                parsed.intended_stack = parsed.intended_stack.join(', ');
            }

            return parsed;
        } catch (error) {
            console.error("Summary Generation Error:", error);
            return {
                main_topic: "Project Mastery",
                sub_topics: ["Planning", "Building", "Optimizing"],
                summaryText: "Failed to generate deep summary.",
                keySignals: {}
            };
        }
    },

    generateRoadmapJSON: async (sessionContext: string, existingRoadmap?: any, persona: string = 'PROFESSIONAL') => {
        try {
            let userPromptContent = sessionContext;
            if (existingRoadmap) {
                userPromptContent += `\n\n### EXISTING ROADMAP TO MERGE/EVOLVE (PRESERVE COMPLETED STEPS):\n${JSON.stringify(existingRoadmap.steps || existingRoadmap, null, 2)}`;
            }
            const messages = [{ role: 'system', content: SYSTEM_PROMPT_ROADMAP }, { role: 'user', content: userPromptContent }];
            const data = await getProviderResponse(messages, { jsonMode: true, temperature: 0.1 }); // High precision for roadmap
            const content = data?.choices?.[0]?.message?.content || data?.message || data?.output;
            return safeJsonParse(String(content));
        } catch (error) {
            console.error("❌ Roadmap Generation Error:", error);
            // CRIT-1 FIX: Do not return mock roadmap silently, throw error so controller refunds tokens.
            throw new Error("Neural engines failed to parse roadmap requirements.");
        }
    },

    generateProjectBlueprint: async (projectData: any) => {
        try {
            const userPrompt = `Architect a project for:
            Category: ${projectData.category}
            Field: ${projectData.field}
            Requirements: ${projectData.requirements}
            Tier: ${projectData.tier}`;

            const messages = [
                { role: 'system', content: SYSTEM_PROMPT_TITANIUM_MANIFEST },
                { role: 'user', content: userPrompt }
            ];

            const data = await getProviderResponse(messages, { jsonMode: true });
            const content = data?.choices?.[0]?.message?.content || data?.message || data?.output;

            return safeJsonParse(String(content));
        } catch (error: any) {
            console.error("Titan Blueprint Error:", error);
            throw error;
        }
    },

    generateTasksJSON: async (stepContext: string, userType: string = 'PROFESSIONAL', roadmapTitle: string = '', chatSummary: string = '', phase: string = 'FOUNDATION', existingTasks: string = '') => {
        try {
            const payload = { stepContext, userType, roadmapTitle, chatSummary, phase, existingTasks };
            const messages = [{ role: 'system', content: SYSTEM_PROMPT_TASKS }, { role: 'user', content: JSON.stringify(payload) }];
            const data = await getProviderResponse(messages, { jsonMode: true, temperature: 0.1 });
            const content = data?.choices?.[0]?.message?.content || data?.message || data?.output;
            return safeJsonParse(String(content));
        } catch (error) {
            console.error("❌ Task Generation Error:", error);
            return { tasks: [] };
        }
    },

    generateArtifact: async (type: 'PDF' | 'PPT' | 'DOC', content: any) => {
        // HIGH-2 FIX: Real frontend route for document generation instead of mock-storage
        return `${process.env.FRONTEND_URL || 'http://localhost:5173'}/project/artifacts/${type.toLowerCase()}`;
    },


    gradeStudentSubmission: async (taskTitle: string, submission: string) => {
        try {
            const messages = [
                { role: 'system', content: 'You are a strict academic grader. Grade the user answer for the given task. Return ONLY JSON: { "score": number (0-100), "feedback": "Short reason" }.' },
                { role: 'user', content: `Task: ${taskTitle}\nStudent Answer: ${submission}` }
            ];
            const data = await getProviderResponse(messages, { jsonMode: true });
            const content = data?.choices?.[0]?.message?.content || data?.message || data?.output;
            return safeJsonParse(String(content));

        } catch (error) {
            console.error("Grading Error:", error);
            // Fail-safe: If AI fails, we cannot verify knowledge strictly, so we fail safe or manual check.
            // Policy: "Fail safe" -> Block.
            return { score: 0, feedback: "Grading system unavailable." };
        }
    },

    validateProfessionalIntent: async (taskTitle: string, submission: string) => {
        try {
            const messages = [
                { role: 'system', content: 'You are a professional auditor. Check if the user response is a serious, relevant, and non-spam attempt to address the task. Return ONLY JSON: { "valid": boolean }.' },
                { role: 'user', content: `Task: ${taskTitle}\nUser Response: ${submission}` }
            ];
            const data = await getProviderResponse(messages, { jsonMode: true });
            const content = data?.choices?.[0]?.message?.content || data?.message || data?.output;
            const result = safeJsonParse(String(content));
            return result.valid === true;

        } catch (error) {
            console.error("Validation Error:", error);
            return true; // Allow professional to proceed on AI error (less strict than student)
        }
    },

    generateVerificationQuestions: async (taskContext: any, chatSummary: string) => {
        try {
            const messages = [
                {
                    role: 'system', content: `You are the Learning Checker (Deep Tech Edition).
Generate EXACTLY 3 high-fidelity questions to verify understanding.
- 2 MCQs: Targets edge cases and technical nuances.
- 1 Viva Question (Semantic Logic): Targets the "Deep How" or "Why". 
- PERSISTENT TRUTH: Questions must align with these Truth Nodes: ${taskContext.verification?.correct_answer_data || 'General domain excellence'}.
- LANGUAGE NEUTRALITY: The questions should be clear such that an answer in Hindi, Gujarati, or English can be validated.
- Return ONLY JSON:
{
  "questions": [
    { "id": "q1", "type": "MCQ", "question": "...", "options": ["...", "...", "...", "..."], "correctAnswer": "..." },
    { "id": "q2", "type": "MCQ", "question": "...", "options": ["...", "...", "...", "..."], "correctAnswer": "..." },
    { "id": "q3", "type": "VIVA", "question": "...", "correctAnswer": "The Absolute Truth logic that must be present in ANY language answer." }
  ]
}`
                },
                { role: 'user', content: `Task: ${taskContext.title}\nDescription: ${taskContext.description}\nChat Context: ${chatSummary}` }
            ];
            const data = await getProviderResponse(messages, { jsonMode: true });
            const content = data?.choices?.[0]?.message?.content || data?.message || data?.output;
            const parsed = safeJsonParse(String(content));
            if (parsed && parsed.questions && parsed.questions.length > 0) return parsed;
            throw new Error("Invalid AI format");

        } catch (error) {
            console.error("Question Generation Error:", error);
            // 🛡️ ADAPTIVE FALLBACK MATRIX: Ensure the user is never blocked
            return {
                questions: [
                    {
                        id: "q1",
                        type: "MCQ",
                        question: `Which fundamental concept is most critical for completing "${taskContext.title}"?`,
                        options: ["Syntax & Rules", "Logic & Architecture", "Environment Setup", "Performance Tuning"],
                        correctAnswer: "Logic & Architecture"
                    },
                    {
                        id: "q2",
                        type: "MCQ",
                        question: "What is the primary risk if this task is implemented incorrectly?",
                        options: ["Syntax Error", "Logic Flaw", "Security Breach", "Resource Leak"],
                        correctAnswer: "Logic Flaw"
                    },
                    {
                        id: "q3",
                        type: "VIVA",
                        question: `Describe your technical roadmap for "${taskContext.title}". How did you verify your implementation worked?`,
                        correctAnswer: "User should provide a logical breakdown of their dev and test flow."
                    }
                ]
            };
        }
    },

    evaluateViva: async (results: any[], groundTruth: any) => {
        try {
            const prompt = `You are an expert AI Academic Evaluator for the FutureBRTS-AI learning platform.
Your task is to grade a student's responses to VIVA questions against the ground truth.

Student's Submitted Answers:
${JSON.stringify(results, null, 2)}

Ground Truth (MCQs and Short Question):
${JSON.stringify(groundTruth, null, 2)}

Strict Grading Protocols:
1. Multilingual Semantic Checking: 
   - Students may answer the Viva short question in English, Hindi, Hinglish (e.g. "routing table connect karta hai client aur server ko"), Gujarati, or a mixture of these.
   - You MUST perform semantic comparison of the student's answer against the correct answer. Do not perform strict keyword or text matching.
   - If the student's answer demonstrates that they understand the underlying technical concept, count it as correct.
2. Typos & Grammar Tolerance:
   - Ignore grammatical mistakes, spelling typos, casing, and punctuation errors.
   - Focus strictly on conceptual mastery.
3. MCQ Grading:
   - For MCQs, compare the student's selected answer option with the correct answer. MCQ answers must be correct based on choice.
4. Threshold & Score:
   - Calculate a score from 0 to 100 representing the percentage of correctness.
   - A score of 70 or higher is a PASS (isPassed = true). Otherwise, isPassed = false.
5. Suggestions:
   - For incorrect answers, provide a friendly, supportive explanation (like a helpful elder brother/tech co-founder) in clear English/Hinglish suggesting how to improve and what the correct concept is.

Output Format:
You must output ONLY a valid JSON object. Do not include markdown block wrappers (like \`\`\`json) or any other chatty text.
JSON Schema:
{
  "isPassed": boolean,
  "score": number, // 0 to 100
  "results": [
    {
      "questionId": "string matching the questionId from the student's answer",
      "question": "string text of the question",
      "isCorrect": boolean,
      "correctSuggestion": "Friendly coaching suggestion or explanation if wrong, or praise if correct"
    }
  ]
}
`;
            const messages = [{ role: 'system', content: prompt }];
            const res = await getProviderResponse(messages, { jsonMode: true, temperature: 0.1 });
            return safeJsonParse(String(res?.choices?.[0]?.message?.content || res?.message));
        } catch (error) {
            console.error("❌ Evaluation Error:", error);
            return { isPassed: false, score: 0, results: [] };
        }
    },

    translateContent: async (content: string, targetLanguage: string) => {
        try {
            const messages = [
                {
                    role: 'system', content: `You are a professional technical translator. Translate the following text into ${targetLanguage}.
                - Maintain all Markdown formatting (bold, subheaders, pointers).
                - Do NOT summarize. Translate fully.
                - Keep technical terms (React, Node.js, Python) in English/Roman script if needed for clarity.` },
                { role: 'user', content: content }
            ];
            const data = await getProviderResponse(messages);
            return data?.choices?.[0]?.message?.content || content;
        } catch (error) {
            return content;
        }
    },

    generateTitle: async (firstMessage: string) => {
        try {
            const messages = [
                {
                    role: 'system',
                    content: 'You are a master of strategic branding. Given the user\'s first message (intent), generate a 2-4 word high-impact, professional title for this chat. Focus on the core objective. Do not use quotes. Just return the title.'
                },
                { role: 'user', content: firstMessage }
            ];
            const data = await getProviderResponse(messages);
            const title = data?.choices?.[0]?.message?.content || data?.message || data?.output;
            if (!title) return "New Chat";
            return String(title).replace(/"/g, '').trim().substring(0, 30);
        } catch (error) {
            return "New Chat";
        }
    },

    extractIntent: async (message: string, attachmentPath?: string | null, attachmentMeta?: any | null): Promise<string> => {
        console.log(`[AI SERVICE] extractIntent called for: ${message.substring(0, 50)}`);
        return message;
    }
};


// ... mockResponse ...
