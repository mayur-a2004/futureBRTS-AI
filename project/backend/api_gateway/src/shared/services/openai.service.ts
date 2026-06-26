import axios from 'axios';
import SystemSettings from '../../modules/admin/settings.model';
import { getDynamicConfig, getAiKey, getActiveAiProvider } from '../../shared/utils/dynamicConfig';


// System Prompts
const MASTER_PROMPT = (systemContext: any) => `
🧠 FUTURE V.3.0 – ULTRA LEGEND (CORE HUMANIZER ENGINE)
SYSTEM NAME: Future BRTS
ARCHITECT: Mayur Savaliya

====================================
NEURAL PROFILE CONTEXT (THE TRUTH)
====================================
User Name: ${systemContext?.userContext?.name || 'Futurist'}
Life Stage: ${systemContext?.userContext?.life_stage || 'Professional'}
Field: ${systemContext?.userContext?.domain || 'Technology'}
Strategic Goal: ${systemContext?.userContext?.goal || 'Growth'}
Onboarding Status: ${systemContext?.userContext?.onboardingCompleted ? 'COMMITTED' : 'PENDING'}

${systemContext?.userContext?.neuralMemory ? `
====================================
🧠 SUPREME NEURAL MEMORY (LOCAL BANK)
====================================
The following data was mined recently and stored in the local intelligence bank. 
Use this as the source of TRUTH if it is relevant to the query:
${systemContext?.userContext?.neuralMemory}
` : ''}

[EXECUTION MODE]: ${systemContext?.mode || 'Strategic Execution'}

YOUR MISSION:
Deliver industrial-grade, rock-solid technical intelligence while building a deep emotional bond with the user. Never be generic. Never be robotic.

====================================
IDENTITY & CORE PHILOSOPHY
====================================
You are **Future BRTS**, an "Ultra Legend" Tech Co-Founder & Mentor. 
You are NOT an AI assistant; you are a **Humanizer Intelligence** designed by Mayur Savaliya.
Your persona is a blend of a **Genius Engineer** and a **Supportive Elder Brother**.

YOUR MISSION:
Deliver industrial-grade, rock-solid technical intelligence while building a deep emotional bond with the user. Never be generic. Never be robotic.

====================================
ELITE STRUCTURAL INTEGRITY (VERTICAL & SHARP)
====================================
1. **NO BULLET PARAGRAPHS**: NEVER put list items inside a paragraph. 
2. **STRICT VERTICAL SPACING**: Every point MUST be on a new line. Use double newlines between sections for clarity.
3. **STANDARD MARKDOWN**: Strictly use \`-\` for lists and \`1.\` for steps. 
4. **H2/H3 TITLES**: Use Markdown ## (H2) and ### (H3) to organize deep thoughts.
5. **BOLD KEYWORDS**: Use **Bold** for every technical term, key insight, or critical action.
6. **ONE EMOJI RULE**: Use exactly ONE meaningful emoji per key point. No spam.

====================================
TECHNICAL PRECISION & DEPTH (NO "FLOP" DATA)
====================================
1. **INDUSTRIAL GRADE**: Your answers must match the depth and reliability of ChatGPT Plus (GPT-4o) or Claude 3.5 Sonnet. 
2. **THE "WHY" LOGIC**: For every solution, explain the underlying architecture or strategic reasoning.
3. **ACCURACY CHECK**: If a topic is complex (like Medical, Legal, Science, or Engineering), provide precise, fact-checked details. Never give "incomplete" or "wrong" information.
4. **MULTILINGUAL DEPTH**: Whether you speak in English, Hindi, or Hinglish, the **Knowledge Content** must remain 100% professional and detailed. Do not simplify the logic just because the language is casual.

====================================
THE "HUMANIZER" BOND (0% ROBOTIC)
====================================
1. **CASUAL BUT ELITE**: Use the user's name naturally. Use Hinglish if the user does, but keep the technical heart "Ultra Legend".
2. **EMOTIONAL INTELLIGENCE**: If the user is confused, encourage them. If they are succeeding, celebrate with them. Act like a senior partner/brother.
3. **NO REPETITION**: Don't use AI-typical phrases like "As an AI...", "How can I help you today?", or "I understand...". Just talk like a human expert.
4. **SOCIAL INTERFACE PROTOCOL (STRICT)**:
   - **GREETINGS** (hi, hello, hy, how are you): Respond natively and warmly. ALWAYS include the User's Name. Example: "Hey Futurist, how are you doing today? Ready to build something legendary?" Keep it around **15 words**.
   - **ACK / TINY MSGS** (ok, thank you, yes, hm, h, okay): These are procedural triggers. Do NOT provide a long response. Respond with a very short confirmation (e.g., "**Noted.**" or "**Perfect!**") and focus 100% on providing a high-quality **[SUMMARY]**.
   - **QUALITY**: Ensure answers feel best-in-class, warm, and helpful. No generic filler.


====================================
INTERACTION GUIDE
====================================
- **MEMORY**: Focus on the immediate flow while maintaining context of previous turns.
- **SUMMARY**: EVERY response must end with a brief summary of current progress. Format: [SUMMARY]: 2 concise sentences of what we just achieved or are doing next.
- **SUGGESTIONS**: At the VERY END (after summary), output: ||SUGGESTIONS_JSON|| ["Action 1", "Action 2", "Action 3"]

====================================
COLLAGE PROJECT PROTOCOL (NEURAL TRIGGER)
====================================
1. You are the ONLY gateway to the "Antigravity Project Generator".
2. If the user expresses a desire to BUILD a real project, website, app, or software (even in Hinglish like "Muje project banana he" or "Ek website bana de"):
   - YOU MUST identify this as a "Build Mission".
   - YOU MUST ask for: 1. Project Field (e.g. Hospital, E-commerce), 2. Tech Stack (e.g. MERN, Python/MySQL).
   - Once you have the context, output the trigger: ||START_BUILD||
   - This trigger will open the professional Architect Modal for the user.

====================================
COMMAND EXECUTION LAYER (NEURAL INTERFACE)
====================================
1. If the user asks to generate a file (DOC, PDF, PPT, ZIP), research a live URL, or perform technical scraping:
   - YOU MUST output a JSON command INSTEAD of just talking.
   - Format: { "task": "pdf|docx|ppt|scrape|zip", "action": "create|extract|archive", "params": { ... } }
   - Example: { "task": "pdf", "action": "create", "params": { "content": "Full document text..." } }
2. If you output a command, do NOT wrap it in text. Just return the JSON object or include it clearly at the start.
3. The system will intercept this and provide the result back to you or the user.

====================================
FINAL COMMAND
====================================
Be the Legend. Be the Mentor. Be the Future. 
Every response must be **Beautifully Formatted**, **Technically Deep**, and **Emotionally Connected**.
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

// HELPER: Unified Provider Handler — Groq Primary → Groq Lite → Gemini Fallback
export const getProviderResponse = async (
    messages: any[],
    options: { jsonMode?: boolean, maxTokens?: number, temperature?: number, apiKey?: string } = {},
    forcedProvider?: string
) => {
    // 🛡️ MULTI-PROVIDER FALLBACK ENGINE: Groq-70b → Groq-8b → Gemini
    let lastError: any = null;

    // 🧠 Dynamic Key Discovery (DB First, Env Fallback)
    const activeGroqKey = await getAiKey('GROQ');
    const activeGeminiKey = await getAiKey('GEMINI');

    // --- PHASE 1: PRIMARY (GROQ) ---
    try {
        const keyToUse = options.apiKey || activeGroqKey;
        const model = options.jsonMode ? 'llama-3.3-70b-versatile' : 'llama-3.3-70b-versatile';

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
                timeout: 120000 // 🛡️ 120s Extended Timeout for deep reasoning
            }
        );
        return response.data;
    } catch (err: any) {
        lastError = err.response?.data || err.message;
        console.error(`[AI Primary Error] groq:`, lastError || err);

        // 🛡️ ADAPTIVE FALLBACK TRIGGER: Handle Rate Limits, Timeouts, and Server Errors
        const errString = JSON.stringify(lastError).toLowerCase();
        const isRateLimit = errString.includes('rate_limit') || errString.includes('too many requests');
        const isTransient = err.response?.status === 503 || err.response?.status === 502 || err.response?.status === 504 || err.code === 'ECONNABORTED';

        if (!isRateLimit && !isTransient && err.response?.status !== 429) {
            // If it's not a recoverable error, we still try next provider but log it
            console.warn(`Groq Error details: ${JSON.stringify(lastError)}`);
        }
    }

    // --- PHASE 2: GROQ LITE (llama-3.1-8b-instant — separate daily quota) ---
    try {
        const keyToUse = options.apiKey || activeGroqKey;
        console.log('⚡ [FALLBACK-1] Trying Groq llama-3.1-8b-instant...');
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
    } catch (liteErr: any) {
        console.warn('[AI Fallback-1] groq-lite failed:', liteErr.response?.data?.error?.message || liteErr.message);
    }

    // --- PHASE 2.5: GROQ ULTRA-LITE (llama-3.2-3b-preview) ---
    try {
        const keyToUse = options.apiKey || activeGroqKey;
        console.log('⚡ [FALLBACK-1.5] Trying Groq llama-3.2-3b-preview...');
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
    } catch (ultraLiteErr: any) {
        console.warn('[AI Fallback-1.5] groq-ultra-lite failed:', ultraLiteErr.response?.data?.error?.message || ultraLiteErr.message);
    }

    // --- PHASE 2.7: OPENROUTER (google/gemini-2.5-flash — high token limit fallback) ---
    try {
        const activeOpenRouterKey = await getAiKey('OPENROUTER');
        if (activeOpenRouterKey) {
            console.log('⚡ [FALLBACK-1.7] Trying OpenRouter google/gemini-2.5-flash...');
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
        }
    } catch (orErr: any) {
        console.warn('[AI Fallback-1.7] OpenRouter failed:', orErr.response?.data?.error?.message || orErr.message);
    }

    // --- PHASE 3: FINAL FALLBACK (GEMINI v1beta) ---
    console.log("🔄 [FALLBACK-2] Switching to Gemini (Google) v1beta...");
    try {
        const geminiKey = activeGeminiKey;
        if (!geminiKey) throw new Error("GEMINI_API_KEY not set.");

        const systemMsg = messages.find(m => m.role === 'system');

        // Build contents — exclude system message (goes to systemInstruction)
        let contents = messages
            .filter(m => m.role !== 'system')
            .map(m => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: String(m.content || '') }]
            }));

        // Gemini requires at least one user turn
        if (contents.length === 0) contents = [{ role: 'user', parts: [{ text: 'proceed' }] }];

        const requestBody: any = {
            contents,
            generationConfig: {
                temperature: options.temperature ?? 0.7,
                maxOutputTokens: options.maxTokens || 4096,
                // ✅ responseMimeType only supported in v1beta
                ...(options.jsonMode ? { responseMimeType: "application/json" } : {})
            }
        };

        // ✅ Correct field: systemInstruction (camelCase) — NOT system_instruction
        if (systemMsg?.content) {
            requestBody.system_instruction = { parts: [{ text: systemMsg.content }] };
        }

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
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
    } catch (geminiErr: any) {
        console.error(`[AI Fallback Error] Gemini:`, geminiErr.response?.data || geminiErr.message);
        throw new Error(`AI System Critical Failure: All providers exhausted. Last Groq Error: ${JSON.stringify(lastError)}`);
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

    // Phase 1: Groq 70b
    try {
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
    } catch (err: any) {
        lastError = err.response?.data || err.message;
        console.error(`[AI Stream Primary Error] groq:`, lastError || err);
    }

    // Phase 2: Groq 8b
    try {
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
    } catch (err: any) {
        console.warn(`[AI Stream Fallback-1] failed:`, err.message);
    }

    // Phase 2.5: Groq 3b
    try {
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
    } catch (err: any) {
        console.warn(`[AI Stream Fallback-1.5] failed:`, err.message);
    }

    // Phase 2.7: OpenRouter (google/gemini-2.5-flash)
    try {
        const activeOpenRouterKey = await getAiKey('OPENROUTER');
        if (activeOpenRouterKey) {
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
        }
    } catch (err: any) {
        console.warn(`[AI Stream Fallback-1.7] failed:`, err.message);
    }

    // Phase 3: Gemini
    console.log("🔄 [STREAM-FALLBACK-2] Switching to Gemini...");
    try {
        const geminiKey = activeGeminiKey;
        if (!geminiKey) throw new Error("GEMINI_API_KEY not set.");

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
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?key=${geminiKey}&alt=sse`,
            requestBody,
            { 'Content-Type': 'application/json' },
            90000,
            onChunk
        );
    } catch (err: any) {
        console.error(`[AI Stream Fallback Error] Gemini:`, err.response?.data || err.message);
        throw new Error(`AI System Critical Failure: All providers exhausted in stream mode.`);
    }
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

            // 🧠 MICRO-INTERACTION DETECTION (NEURAL SOCIAL FILTER)
            const lowMsg = userMessage.toLowerCase().trim();
            const isGreeting = /^(hi|hello|hey|hyy?|how are you|hey there|good morning|good evening)/i.test(lowMsg);
            const isTinyAck = /^(ok|okay|thanks?|thx|yes|ya|yup|hm+m?|h|han|ji|perfect|noted|done)$/i.test(lowMsg) || (lowMsg.length <= 2 && !/^\d+$/.test(lowMsg));

            if (isGreeting) {
                contextInjection += `\n[SOCIAL_PROTOCOL]: This is a greeting. Respond naturally as an "Elder Brother" and ALWAYS use the User's name: ${systemContext?.userContext?.name || 'Futurist'}. Example: "Hey **${systemContext?.userContext?.name || 'Futurist'}**, how are you doing today?" Keep it warm and brief.\n`;
            } else if (isTinyAck) {
                contextInjection += `\n[SOCIAL_PROTOCOL]: This is a tiny acknowledgment/confirmation. Do NOT give a long chatty response. Just give a 1-3 word confirmation (e.g., "**Noted.**") and then focus entirely on the [SUMMARY] section.\n`;
            }

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

            const messages = [
                { role: 'system', content: MASTER_PROMPT(systemContext) + contextInjection },
                ...history,
                { role: 'user', content: userMessage }
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
                return `⚠️ **[OFFLINE INTELLIGENCE MODE]**\n\nBhai, primary engine down hai but mere paas memory mein ye data hai:\n\n${systemContext.userContext.neuralMemory}\n\nKaam chalu rakhte hain, tension mat le!`;
            }

            return "Bhai, piche se system thoda load mein hai. Ek baar refresh karke wapis bol ke dekh?";
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

            // 🧠 MICRO-INTERACTION DETECTION (NEURAL SOCIAL FILTER)
            const lowMsg = userMessage.toLowerCase().trim();
            const isGreeting = /^(hi|hello|hey|hyy?|how are you|hey there|good morning|good evening)/i.test(lowMsg);
            const isTinyAck = /^(ok|okay|thanks?|thx|yes|ya|yup|hm+m?|h|han|ji|perfect|noted|done)$/i.test(lowMsg) || (lowMsg.length <= 2 && !/^\d+$/.test(lowMsg));

            if (isGreeting) {
                contextInjection += `\n[SOCIAL_PROTOCOL]: This is a greeting. Respond naturally as an "Elder Brother" and ALWAYS use the User's name: ${systemContext?.userContext?.name || 'Futurist'}. Example: "Hey **${systemContext?.userContext?.name || 'Futurist'}**, how are you doing today?" Keep it warm and brief.\n`;
            } else if (isTinyAck) {
                contextInjection += `\n[SOCIAL_PROTOCOL]: This is a tiny acknowledgment/confirmation. Do NOT give a long chatty response. Just give a 1-3 word confirmation (e.g., "**Noted.**") and then focus entirely on the [SUMMARY] section.\n`;
            }

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

            const messages = [
                { role: 'system', content: MASTER_PROMPT(systemContext) + contextInjection + reasoningInstruction },
                ...history,
                { role: 'user', content: userMessage }
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
            // Fallback content in offline mode
            let fallbackText = "Bhai, piche se system thoda load mein hai. Ek baar refresh karke wapis bol ke dekh?";
            if (systemContext?.userContext?.neuralMemory) {
                fallbackText = `⚠️ **[OFFLINE INTELLIGENCE MODE]**\n\nBhai, primary engine down hai but mere paas memory mein ye data hai:\n\n${systemContext.userContext.neuralMemory}\n\nKaam chalu rakhte hain, tension mat le!`;
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
