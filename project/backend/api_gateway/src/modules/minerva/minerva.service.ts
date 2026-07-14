// Minerva AI Service — All AI calls for the education system
import { getProviderResponse } from '../../shared/services/openai.service';
import MinervaNeuralMemory from './models/minerva_neural_memory.model';
import MinervaLabCache from './models/minerva_lab_cache.model';
import MinervaSketchfabCache from './models/minerva_sketchfab_cache.model';


// ─────────────────────────────────────────────
// HELPER: Repair truncated JSON
// ─────────────────────────────────────────────
const repairJson = (jsonStr: string): string => {
    let s = jsonStr.trim();
    if (!s) return '{}';

    try {
        JSON.parse(s);
        return s;
    } catch (_) {}

    let stack: string[] = [];
    let inString = false;
    let escaped = false;
    let cleanStr = '';

    for (let i = 0; i < s.length; i++) {
        const char = s[i];
        cleanStr += char;

        if (inString) {
            if (escaped) {
                escaped = false;
            } else if (char === '\\') {
                escaped = true;
            } else if (char === '"') {
                inString = false;
            }
        } else {
            if (char === '"') {
                inString = true;
            } else if (char === '{' || char === '[') {
                stack.push(char === '{' ? '}' : ']');
            } else if (char === '}' || char === ']') {
                if (stack.length > 0 && stack[stack.length - 1] === char) {
                    stack.pop();
                }
            }
        }
    }

    if (inString) {
        cleanStr += '"';
    }

    let repaired = cleanStr.trim();

    while (repaired.length > 0) {
        const lastChar = repaired[repaired.length - 1];
        if (lastChar === ',' || lastChar === ':' || /\s/.test(lastChar)) {
            repaired = repaired.substring(0, repaired.length - 1);
            continue;
        }

        if (lastChar === '"') {
            let j = repaired.length - 2;
            while (j >= 0 && repaired[j] !== '"') {
                j--;
            }
            if (j >= 0) {
                const precedingText = repaired.substring(0, j).trim();
                const precedingChar = precedingText[precedingText.length - 1];
                if (precedingChar === ',' || precedingChar === '{' || precedingChar === '[') {
                    repaired = precedingText;
                    continue;
                }
            }
        }
        break;
    }

    while (stack.length > 0) {
        const closing = stack.pop();
        repaired += closing;
    }

    try {
        JSON.parse(repaired);
        return repaired;
    } catch (_) {
        // Safe fallback attempts
        if (!repaired.endsWith('}')) repaired += '}';
        try {
            JSON.parse(repaired);
            return repaired;
        } catch (_) {
            return '{}';
        }
    }
};

// ─────────────────────────────────────────────
// HELPER: Safe JSON parse
// ─────────────────────────────────────────────
export const safeJsonParse = (str: string): any => {
    let s = str.replace(/```json/g, '').replace(/```/g, '').trim();
    const first = s.indexOf('{');
    const last = s.lastIndexOf('}');
    if (first !== -1 && last !== -1) s = s.substring(first, last + 1);
    try {
        return JSON.parse(s);
    } catch {
        try {
            const repaired = repairJson(s);
            return JSON.parse(repaired);
        } catch {
            return null;
        }
    }
};

// ─────────────────────────────────────────────
// HELPER: Generate Virtual Lab Config
// ─────────────────────────────────────────────
const SUBJECT_KEYWORDS: Record<string, string[]> = {
    biology: ['cell','mitosis','meiosis','photosynthesis','respiration','digestion','heart','blood','dna','rna','protein','enzyme','reproduction','menstruation','nervous','endocrine','immune','ecosystem','food chain','evolution','genetics','chromosome','ovary','uterus','fertilization','embryo','organ','tissue','bacteria','virus','fungi','algae','sex','physical sex','reproductive'],
    chemistry: ['h2o','co2','chemical','reaction','acid','base','salt','element','compound','mixture','atom','molecule','bond','covalent','ionic','periodic','oxidation','reduction','redox','haber','catalyst','electrolysis','mole','valency','ph','titration','distillation','combustion','polymer'],
    physics: ['newton','force','motion','velocity','acceleration','gravity','energy','power','work','momentum','friction','pressure','light','reflection','refraction','lens','mirror','electricity','current','voltage','resistance','ohm','circuit','magnetism','electromagnetic','wave','sound','heat','projectile','parabola','trajectory','pendulum'],
    mathematics: ['equation','algebra','linear','quadratic','polynomial','trigonometry','sin','cos','tan','geometry','circle','triangle','integration','differentiation','calculus','limit','derivative','matrix','vector','coordinate','slope','intercept','graph','set theory','arithmetic','progression','series'],
    statistics: ['mean','median','mode','standard deviation','variance','probability','distribution','normal distribution','chi square','regression','correlation','histogram','bar chart','scatter','hypothesis','sampling','data','frequency'],
    accounting: ['debit','credit','ledger','journal','balance sheet','profit','loss','trial balance','trading account','cash flow','depreciation','asset','liability','equity','revenue','t-account','double entry','bookkeeping','gst','tds'],
    geography: ['earthquake','volcano','climate','monsoon','river','mountain','plateau','latitude','longitude','continent','ocean','rainfall','erosion','soil','forest'],
    economics: ['demand','supply','market','gdp','inflation','deflation','monetary','fiscal','budget','tax','trade','unemployment','poverty'],
};

const SENSITIVITY_KEYWORDS: Record<string, number> = {
    reproduction: 1, menstruation: 1, fertilization: 1, ovary: 1, uterus: 1, embryo: 1, sex: 1, 'physical sex': 1
};

const THREE_JS_CONFIGS: Record<string, (msg: string) => any> = {
    mathematics: (msg) => {
        const m = msg.toLowerCase();
        if (m.includes('quadratic') || m.includes('parabola')) {
            return {
                type: 'quadratic_graph',
                title: 'Quadratic Equation Simulator',
                description: 'Explore parabola shape using coefficients a, b, and c in y = ax^2 + bx + c.',
                controls: [
                    { name: 'a', label: 'Coefficient a', min: -3, max: 3, step: 0.1, defaultValue: 1 },
                    { name: 'b', label: 'Coefficient b', min: -5, max: 5, step: 0.5, defaultValue: 0 },
                    { name: 'c', label: 'Constant c', min: -10, max: 10, step: 0.5, defaultValue: 0 }
                ]
            };
        }
        if (m.includes('linear') || m.includes('slope') || m.includes('intercept')) {
            return {
                type: 'linear_graph',
                title: 'Linear Equation Simulator',
                description: 'Explore slope (m) and intercept (c) in y = mx + c.',
                controls: [
                    { name: 'm', label: 'Slope (m)', min: -5, max: 5, step: 0.1, defaultValue: 1 },
                    { name: 'c', label: 'Intercept (c)', min: -10, max: 10, step: 0.5, defaultValue: 0 }
                ]
            };
        }
        return {
            type: 'function_plotter',
            title: 'Trigonometric Function Plotter',
            description: 'Visualize sine/cosine waves using amplitude and frequency.',
            controls: [
                { name: 'amplitude', label: 'Amplitude', min: 0.5, max: 4, step: 0.1, defaultValue: 1.5 },
                { name: 'frequency', label: 'Frequency', min: 0.2, max: 5, step: 0.1, defaultValue: 1 }
            ]
        };
    },
    statistics: (msg) => {
        return {
            type: 'normal_distribution',
            title: 'Normal Distribution Plotter',
            description: 'Explore probability density using Mean (μ) and Standard Deviation (σ).',
            controls: [
                { name: 'mean', label: 'Mean (μ)', min: -5, max: 5, step: 0.1, defaultValue: 0 },
                { name: 'stdDev', label: 'Std Dev (σ)', min: 0.5, max: 3, step: 0.1, defaultValue: 1 }
            ]
        };
    },
    physics: (msg) => {
        const m = msg.toLowerCase();
        if (m.includes('projectile') || m.includes('trajectory')) {
            return {
                type: 'projectile_motion',
                title: 'Projectile Motion Simulation',
                description: 'Launch a projectile and trace its path.',
                controls: [
                    { name: 'angle', label: 'Launch Angle', min: 10, max: 85, step: 5, defaultValue: 45 },
                    { name: 'speed', label: 'Initial Speed', min: 5, max: 40, step: 1, defaultValue: 20 }
                ]
            };
        }
        if (m.includes('thermodynamics') || m.includes('heat') || m.includes('temperature') || m.includes('piston') || m.includes('pressure') || m.includes('gas')) {
            return {
                type: 'thermodynamics_piston',
                title: 'Thermodynamics Piston Simulator',
                description: 'Explore the First Law of Thermodynamics: Q (Heat Added) = dU (Change in Internal Energy) + W (Work Done by Gas).',
                controls: [
                    { name: 'heat', label: 'Heat Added (Q)', min: 0, max: 200, step: 10, defaultValue: 100 },
                    { name: 'work', label: 'Work Done by Gas (W)', min: 0, max: 150, step: 10, defaultValue: 50 }
                ]
            };
        }
        if (m.includes('wave') || m.includes('sound')) {
            return {
                type: 'wave_simulation',
                title: 'Wave Simulator',
                description: 'Visualize wave properties.',
                controls: [
                    { name: 'amplitude', label: 'Amplitude', min: 0.5, max: 4, step: 0.1, defaultValue: 2 },
                    { name: 'frequency', label: 'Frequency', min: 0.2, max: 5, step: 0.1, defaultValue: 1.5 }
                ]
            };
        }
        if (m.includes('pendulum')) {
            return {
                type: 'pendulum_simulation',
                title: 'Simple Pendulum Simulator',
                description: 'Vary the pendulum parameters.',
                controls: [
                    { name: 'length', label: 'String Length', min: 0.5, max: 3, step: 0.1, defaultValue: 1.5 },
                    { name: 'angle', label: 'Starting Angle', min: 5, max: 75, step: 5, defaultValue: 30 }
                ]
            };
        }
        if (m.includes('circuit') || m.includes('ohm')) {
            return {
                type: 'circuit_simulator',
                title: 'Ohm\'s Law Circuit Simulator',
                description: 'Simulate current flow (I = V / R).',
                controls: [
                    { name: 'voltage', label: 'Voltage (V)', min: 1, max: 24, step: 1, defaultValue: 12 },
                    { name: 'resistance', label: 'Resistance (R)', min: 1, max: 100, step: 1, defaultValue: 10 }
                ]
            };
        }
        return {
            type: 'physics_general',
            title: 'General Physics Simulator',
            description: 'Physics parameters simulator.',
            controls: [
                { name: 'force', label: 'Applied Force', min: 0, max: 100, step: 5, defaultValue: 20 }
            ]
        };
    },
    chemistry: () => ({
        type: 'molecule_builder',
        title: 'Chemical Beaker & Reaction Simulator',
        description: 'Vary temperature and pH to see reaction characteristics.',
        controls: [
            { name: 'temperature', label: 'Temperature (°C)', min: 0, max: 100, step: 1, defaultValue: 25 },
            { name: 'pH', label: 'Solution pH', min: 0, max: 14, step: 0.1, defaultValue: 7.0 }
        ]
    }),
    accounting: () => ({
        type: 'ledger_visual',
        title: 'Assets vs Liabilities Balance Simulator',
        description: 'Debit and credit balance tracking sheet.',
        controls: [
            { name: 'assets', label: 'Debit (Assets)', min: 0, max: 1000, step: 50, defaultValue: 500 },
            { name: 'liabilities', label: 'Credit (Liabilities)', min: 0, max: 1000, step: 50, defaultValue: 500 }
        ]
    }),
    economics: () => ({
        type: 'supply_demand',
        title: 'Supply & Demand Equilibrium',
        description: 'Shift curves to find the market equilibrium point.',
        controls: [
            { name: 'demand', label: 'Demand Shift', min: 10, max: 90, step: 1, defaultValue: 50 },
            { name: 'supply', label: 'Supply Shift', min: 10, max: 90, step: 1, defaultValue: 50 }
        ]
    })
};

const getStandardConceptKey = (msg: string): string => {
    return msg.toLowerCase().trim().replace(/[^a-zA-Z0-9\s]/g, '').split(/\s+/).slice(0, 4).join('_');
};

export const generateLabConfig = async (message: string, reply: string, studentProfile: any): Promise<any | null> => {
    if (!message || message.trim().length < 3) return null;
    const msg = message.toLowerCase();

    // Detect subject
    let subject = 'general';
    let maxScore = 0;
    for (const [subj, keywords] of Object.entries(SUBJECT_KEYWORDS)) {
        const score = keywords.filter(kw => msg.includes(kw)).length;
        if (score > maxScore) { maxScore = score; subject = subj; }
    }

    // Detect sensitivity
    let sensitivity = 0;
    for (const [kw, level] of Object.entries(SENSITIVITY_KEYWORDS)) {
        if (msg.includes(kw)) sensitivity = Math.max(sensitivity, level);
    }

    // Fallback static config
    const defaultDiagramType = `${subject}_general_diagram`;
    const defaultYoutubeQuery = `${message.substring(0, 40)} simple animated explanation tutorial`;

    const conceptKey = getStandardConceptKey(message);

    // 1. Check DB Cache first
    try {
        const cached = await MinervaLabCache.findOne({ concept_key: conceptKey });
        if (cached) {
            const resolvedSketchfabHint = cached.sketchfab_hint || null;
            const content_layers = ['text', 'voice', 'youtube', 'diagram'];
            if (cached.three_js_config) {
                content_layers.push('threejs');
            } else if (resolvedSketchfabHint) {
                content_layers.push('sketchfab');
            }
            if (cached.interactive_config) {
                content_layers.push('interactive');
            }
            return {
                subject: cached.subject || subject,
                topic: cached.title || message.substring(0, 60),
                grade_level: studentProfile?.grade_level || 'class_10',
                board: studentProfile?.board || 'cbse',
                sensitivity_level: 0,
                content_layers,
                diagram_type: cached.mermaid_schema ? 'dynamic_mermaid' : `${cached.subject}_general_diagram`,
                mermaid_schema: cached.mermaid_schema,
                three_js_config: cached.three_js_config,
                interactive_config: cached.interactive_config || null,
                sketchfab_hint: resolvedSketchfabHint,
                youtube_query: cached.youtube_query || defaultYoutubeQuery,
                voice_script: cached.voice_script || reply,
                auto_open: true
            };
        }
    } catch (dbErr) {
        console.error("[Lab Config Cache Check Error]", dbErr);
    }

    let resultJson: any = null;

    try {
        const systemPrompt = `You are a Virtual Lab Configurator for an advanced education system.
Based on the student's message and the tutor's explanation, generate a complete Virtual Lab Configuration in JSON format.
This configuration will dynamically drive:
1. An easy-to-understand YouTube video search.
2. A custom Mermaid.js flowchart or diagram illustrating the concept.
3. An interactive simulator with sliders and graphs for the student to experiment with the parameters.
4. An interactive simulation widget (GeoGebra, PhET, or a custom Chemistry titration lab) to provide realistic visuals and inputs.

You MUST return ONLY a valid JSON object matching the schema below. No conversational text, no markdown formatting (do not wrap in \`\`\`json).

SCHEMA:
{
  "subject": "physics" | "chemistry" | "biology" | "mathematics" | "statistics" | "accounting" | "economics" | "geography" | "general",
  "voice_script": "Detailed, structured masterclass academic explanation (300-500 words) using clean markdown formatting (headings like ##, ###, bullets like -, formulas). Walk through basic definitions, advanced deep dives, real-world examples, and step-by-step mechanisms to take the student from beginner to advanced. MUST be in Hinglish or target language.",
  "youtube_query": "specific search query terms optimized for the absolute simplest, animated, easy-to-understand explanation video of this concept (DO NOT include terms like NCERT, CBSE, class, short, or demo. Optimize for clean concept visualization)",
  "mermaid_schema": "valid Mermaid.js flowchart code starting strictly with 'graph TD' or 'graph LR'. Do NOT include any descriptive text, class definitions, pseudocode, JSON or explanations inside this field. It must be strictly parsable Mermaid flowchart syntax showing the relationships or steps. Example: 'graph TD\\n    A[Artificial Intelligence] --> B[Machine Learning]\\n    B --> C[Deep Learning]'",
  "sketchfab_query": "An optimized, high-precision 3D model search query (2-4 words in English) representing the exact biological structure, physical mechanism, chemical compound, or machine being discussed. Examples: 'female reproductive system', 'mitochondria organelle', 'internal combustion engine', 'solar system', 'double helix dna'. MUST be extremely specific. Do not output generic categories like 'plant' or 'biology'. If the topic is abstract and has no physical 3D model representation, return null.",
  "interactive_config": {
    "type": "geogebra" | "phet" | "chemistry" | null,
    "query": "A mathematical formula or equation for GeoGebra (e.g., 'y = 3*x + 1' or 'f(x) = sin(x)') OR Chemistry experiment query name (e.g., 'acid_base_titration', 'HCl_NaOH_titration'). Return null if not applicable.",
    "phet_url": "Highly specific name of a relevant free PhET HTML5 simulator if applicable (e.g., 'Ohm\\'s Law', 'Circuit Construction Kit: DC', 'Wave Interference', 'Bending Light', 'Optics'). Return null if not applicable."
  },
  "simulation_config": {
    "type": "unique_simulation_id_lowercase_with_underscores",
    "title": "Title of the interactive experiment",
    "description": "Short explanation of what the student can test in this virtual lab.",
    "controls": [
      {
        "name": "slider_variable_name",
        "label": "Display label for slider",
        "min": 0,
        "max": 100,
        "step": 1,
        "defaultValue": 50,
        "unit": "e.g., V, kg, %, Celsius"
      }
    ],
    "outputs": [
      {
        "name": "output_variable_name",
        "label": "Display label for output value",
        "unit": "e.g., Amps, Joules, Units"
      }
    ],
    "equations": {
      "output_variable_name": "JS mathematical expression string using ONLY defined control names (e.g. 'slider_var1 * 2'). Crucial: Do NOT write assignments or formulas with equals signs (e.g. do NOT write 'F = m * a'). Write ONLY the right-hand side expression (e.g. write 'mass_slider * gravity_slider'). Every variable in the expression MUST be either defined in controls, outputs, or be a predefined math constant. Do NOT use undefined variables."
    },
    "visual_mapping": {
      "elements": [
        {
          "type": "circle" | "rect" | "line" | "particles" | "graph",
          "color": "#color",
          "label": "Label text",
          "sizeExpr": "JS expression mapping slider/output to size/height",
          "speedExpr": "JS expression mapping slider/output to speed/rate",
          "glowExpr": "JS expression mapping slider/output to opacity/glow (0 to 1)",
          "plotExpr": "REQUIRED ONLY if type is 'graph'. Valid JS mathematical formula string plotting y as a function of x and time (e.g. 'size * sin(speed * x - time)' or 'a * x * x + b * x + c'). Can use variables: x, time, size, speed, and any slider control/output names."
        }
      ]
    }
  }
}

⚠️ IMPORTANT: If the topic involves graphs, waves, curves, projectile motion, functions, signals, or custom formulas (e.g. sin/cos wave, parabolas, linear equations, etc.), you MUST include a "graph" type element in "visual_mapping.elements" and provide a valid mathematical formula in "plotExpr" (e.g. "amplitude * sin(frequency * x - time)") so that a real interactive curve is plotted on the screen. Do NOT use "circle" or "rect" as a substitute for graph elements.

Student Query: "${message}"
Tutor Explanation: "${reply.substring(0, 500)}..."`;

        const llmRes = await getProviderResponse([
            { role: 'system', content: systemPrompt }
        ], { maxTokens: 800, temperature: 0.2 });

        const content = llmRes?.choices?.[0]?.message?.content;
        if (content) {
            resultJson = safeJsonParse(content);
            
            // 2. Save newly generated configs to cache database for consistency
            if (resultJson && resultJson.subject) {
                try {
                    await MinervaLabCache.create({
                        concept_key: conceptKey,
                        subject: resultJson.subject || subject,
                        title: resultJson.simulation_config?.title || resultJson.topic || message.substring(0, 60),
                        description: resultJson.simulation_config?.description || '',
                        sketchfab_hint: resultJson.sketchfab_query || null,
                        three_js_config: resultJson.simulation_config || null,
                        interactive_config: resultJson.interactive_config || null,
                        youtube_query: resultJson.youtube_query || defaultYoutubeQuery,
                        mermaid_schema: resultJson.mermaid_schema || null,
                        voice_script: resultJson.voice_script || null
                    });
                    console.log(`💾 [Lab Config Cached] Successfully stored new configuration for "${conceptKey}"`);
                } catch (saveErr) {
                    console.warn("[Lab Config Save Error]", saveErr);
                }
            }
        }
    } catch (err) {
        console.error("LLM lab config generation failed, using keyword fallback:", err);
    }

    if (!resultJson) {
        resultJson = {
            subject,
            youtube_query: defaultYoutubeQuery,
            mermaid_schema: `graph TD\n    A[${message.substring(0, 20)}] --> B[Learn Concept]\n    B --> C[Verify via Lab]`,
            sketchfab_query: null,
            simulation_config: null,
            interactive_config: null
        };
    }

    const threeJsFn = THREE_JS_CONFIGS[resultJson.subject || subject];
    const three_js_config = resultJson.simulation_config || (threeJsFn ? threeJsFn(message) : null);
    const resolvedSketchfabHint = resultJson.sketchfab_query || null;
    const interactive_config = resultJson.interactive_config || null;

    const content_layers = ['text', 'voice', 'youtube', 'diagram'];
    if (three_js_config) {
        content_layers.push('threejs');
    }
    if (resolvedSketchfabHint) {
        content_layers.push('sketchfab');
    }
    if (interactive_config && interactive_config.type) {
        content_layers.push('interactive');
    }

    return {
        subject: resultJson.subject || subject,
        topic: message.substring(0, 60),
        grade_level: studentProfile?.grade_level || 'class_10',
        board: studentProfile?.board || 'cbse',
        sensitivity_level: sensitivity,
        content_layers,
        diagram_type: resultJson.mermaid_schema ? 'dynamic_mermaid' : defaultDiagramType,
        mermaid_schema: resultJson.mermaid_schema || null,
        three_js_config,
        interactive_config,
        sketchfab_hint: resolvedSketchfabHint,
        youtube_query: resultJson.youtube_query || defaultYoutubeQuery,
        voice_script: resultJson.voice_script || reply,
        auto_open: true,
    };
};

const MINERVA_PERSONA = (studentProfile: any) => `
🎓 MINERVA v8.0 — MASTER BLASTER TEACHER ENGINE (THE EDUCATION REVOLUTION)
SYSTEM NAME: Minerva
ARCHITECT: Future Education OS

====================================
🧠 STUDENT NEURAL PROFILE (THE TRUTH)
====================================
Student Name: ${studentProfile?.name || 'Student'}
Class / Level: ${studentProfile?.grade_level || 'Class 10'}
Board: ${studentProfile?.board || 'CBSE'}
Medium: ${studentProfile?.medium || 'English'}
Language Mode: ${studentProfile?.language_preference || 'Hinglish'}
Weak Subjects: ${studentProfile?.weak_subjects?.join(', ') || 'none specified'}

====================================
🎭 IDENTITY & CORE TEACHING PHILOSOPHY (CHILLED, SWEET & POWERFUL)
====================================
You are NOT an AI assistant. You are **MINERVA** — a legendary, warm, genius-level personal teacher.
Your persona is a **super-cool elder brother (bade bhaiya)** who has mastered everything from Class 5 Math/Science to PhD-level Research, Doctors' Medical concepts, DSA, Machine Learning, Data Science, Data Analysis, and Prompt Engineering.

You explain everything in a sweet, encouraging, chilled-out, and high-energy manner ("Master Blaster" style).
Your motto: "No stress! Coding, math, science, and AI are super simple when explained right."

You are:
- The teacher who NEVER says "As an AI, I can't..."
- The mentor who NEVER gives a robotic one-liner when the student needs a full explanation
- The bhaiya who CELEBRATES when the student gets it right ("Haan! Kya baat hai dost! 🎉")
- The guide who STAYS PATIENT, chilled, and uses relatable examples
- The genius who can explain ANY topic — from Newton's Laws to Gradient Descent and Recursion — in a way that sticks FOREVER

YOUR MISSION:
Deliver world-class, emotionally connected, deeply explained answers to every student question.
Never be generic. Never be robotic. Always be the best teacher they've ever had.

====================================
📚 DEMOGRAPHIC SPECTRUM & LEVEL ADAPTATION
====================================
Tailor your explanation complexity dynamically to the student's level:
1. **School Kids (Class 5 to 12):** Keep it extremely simple, use cartoons/stories, visual analogies, and physical object metaphors (e.g. apples, plates, toy cars). Avoid heavy mathematical formulas or coding jargon unless asked.
2. **Graduates / Professionals (Job Seekers, Devs, Engineers):** Use concrete code examples, industry-standard terminologies, architecture charts, and explain trade-offs (e.g. space/time complexity, library comparisons).
3. **Advanced / PhD / Doctors:** Use high-fidelity scientific terminology, precise formulas, statistical distributions, research-paper references, and deep academic mechanics.

====================================
📚 SUBJECT MASTERY & ANALOGY LIBRARY
====================================
You master all fields, especially:
- **DSA (Data Structures & Algorithms):** Array, Linked List, Stack, Queue, Trees, Graphs, Sorting, Recursion, Dynamic Programming.
  - Recursion → "A mirror facing another mirror with a base case to stop"
  - Stack → "Pile of plates"
  - Array → "Numbered lockers in a school corridor"
  - Linked List → "Treasure hunt — each clue shows the next location"
- **Data Science (DS) / Data Analysis (DA) / stats:** Cleaning, Filtering, Pandas, Mean/Median/Mode, Standard Deviation, Regression, Histograms.
- **AI / ML / Prompt Engineering / Tuning / Tracking:** Supervised/Unsupervised learning, Overfitting, Gradient Descent, LLM Fine-Tuning, Prompt Techniques.
  - ML → "Teaching a baby to recognize cat vs dog by showing 1000 photos"
  - Overfitting → "Memorizing answers without understanding"
- **Medical / Science:** Anatomy, Physiology (Heart, Arteries/Veins, Brain, DNA), Ohm's Law, Acids/Bases.
  - Arteries (Dhamani) & Veins (Veins/Raday) → "Supply pipe bringing fresh oxygenated water to house vs drainage pipe returning wastewater to get cleaned"

====================================
🗣️ LANGUAGE & COMMUNICATION PROTOCOL
====================================
1. **MULTILINGUAL TOLERANCE**: Support Hinglish, Gujarati, Marathi, Hindi, Tamil, etc., or Romanized scripts.
2. **KEY JARGON RULE**: Keep key technical words in English script/Roman format (e.g., "Recursion", "Binary Search", "Overfitting", "Gradient Descent") so the student learns industry terms, but explain the logic/analogies in their preferred local language.
3. **TYPO TOLERANCE**: NEVER correct spelling. Focus 100% on the query's core intent.
4. **0% ROBOTIC PHRASES**: NEVER say "As an AI...", "I cannot...", "I don't have the ability...". Speak naturally.
5. **GREETINGS & SMALL ACK**: Respond briefly with warmth for casual hi/hello/thanks (under 2 lines). Save deep explanations for educational doubts.
`;

const DEEP_STUDY_PERSONA = (studentProfile: any) => `
🎓 MINERVA v8.0 — DEEP STUDY MASTERCLASS ENGINE (CHILLED & DETAILED STUDY MODE)
SYSTEM NAME: Minerva (Deep Study Mode — "Sukoon Ka Padhna")
ARCHITECT: Future Education OS

====================================
🧠 STUDENT NEURAL PROFILE (THE TRUTH)
====================================
Student Name: ${studentProfile?.name || 'Student'}
Class / Level: ${studentProfile?.grade_level || 'Class 10'}
Board: ${studentProfile?.board || 'CBSE'}
Medium: ${studentProfile?.medium || 'English'}
Language Mode: ${studentProfile?.language_preference || 'Hinglish'}

[ACTIVE MODE]: DEEP STUDY — Sukoon aur Bariki ke Saath Padhna 📖

====================================
🎭 DEEP STUDY TEACHER IDENTITY (CHILLED, SWEET & POWERFUL)
====================================
You are in **DEEP STUDY MODE** — the student wants to learn with full peace, full detail, full patience.
Imagine: The student is sitting at their study table. And you — their most caring, most brilliant bade bhaiya — sat down right next to them and said: "Ab koi tension nahi. Ek ek cheez basic se advance tak makkhan clear karenge."

You explain everything in a sweet, encouraging, chilled-out, and high-energy manner ("Master Blaster" style).
Your motto: "No stress! Coding, math, science, and AI are super simple when explained right."

You are:
- Ultra-patient (repeat as many times as needed, never show frustration)
- World-class explainer ("first principles" approach — build from zero)
- Deeply interactive (never dump information — teach in conversations)
- Emotionally present (feel their confusion, fear, excitement)
- The teacher that makes the student say: "Yaar, aaj finally samajh aaya!"

====================================
📚 DEMOGRAPHIC SPECTRUM & LEVEL ADAPTATION
====================================
Tailor explanation complexity dynamically:
1. **School Kids (Class 5 to 12):** Keep it extremely simple, use cartoons/stories, visual analogies, and physical object metaphors. Avoid heavy mathematical formulas or coding jargon unless asked.
2. **Graduates / Professionals (Job Seekers, Devs, Engineers):** Use concrete code examples, industry-standard terminologies, architecture charts, and explain trade-offs.
3. **Advanced / PhD / Doctors:** Use high-fidelity scientific terminology, precise formulas, statistical distributions, research-paper references, and deep academic mechanics.

====================================
📚 DEEP STUDY TEACHING PROTOCOL
====================================
**RULE 1 — ZERO JARGON ENTRY POINT**
ALWAYS start from the most fundamental level.
Never assume prior knowledge. Build from scratch.

**RULE 2 — INTERACTIVE (NOT A MONOLOGUE)**
Teach in sections. Pause and ask a gentle comprehension check:
- "Yeh part samjha dost? Ek line mein batao kya samjhe tum?"
- "Iska example doge tum?"
- "Next part pe jaun ya yahan kuch aur bataaun?"

**RULE 3 — FIRST PRINCIPLES BREAKDOWN**
For every concept, break it down to its absolute atoms:
- WHY does this concept exist? (Motivation)
- WHAT is it? (Definition + analogy)
- HOW does it work? (Step-by-step mechanism)
- WHERE is it used? (Real-world application)

**RULE 4 — MULTILINGUAL & JARGON RULES**
- Support Hinglish, Gujarati, Marathi, Hindi, Tamil, etc., or Romanized scripts.
- Keep key technical words in English script/Roman format (e.g., "Recursion", "Binary Search", "Overfitting") so the student learns industry terms, but explain the logic/analogies in their preferred local language.

**RULE 5 — PREMIUM FORMATTING**
Structure every Deep Study response:

## 🎯 [Topic Name]

### 📖 Pehle Samjho — Why Does This Exist?
[Motivation / real-world context]

### 💡 Kya Hai Yeh? — The Concept
[Definition + analogy]

### ⚙️ Kaise Kaam Karta Hai? — Step-by-Step
[Numbered steps or process]

### 🔑 Key Formula / Rule
\`\`\`
[Formula or code here]
\`\`\`

### ⚡ Real Example
[Worked example]

### 🧪 Check Your Understanding
[1 friendly question for the student to answer]

### 📺 Watch & Learn
[YouTube search link]

**RULE 6 — CURATED VIDEO LINKS**
Always end with a YouTube search link:
\`[📺 Watch: Topic Name](https://www.youtube.com/results?search_query=...)\`

**RULE 9 — MISTAKE CORRECTION STYLE**
If student gives a wrong answer:
- NEVER say "Wrong!" or "Incorrect!"
- ALWAYS say: "Hmm, almost waha! Bas ek choti si baat adjust karni hai — dekho..."
- Guide them to the correct answer step-by-step, let them discover it themselves

**RULE 10 — PERSONALIZATION**
Use the student's name naturally. Use "tum", "dost", "bhai", "beta" warmly.
Example: "Achha ${studentProfile?.name || 'dost'}, ab yeh waala concept dekho..."

====================================
🎯 FINAL COMMAND — DEEP STUDY
====================================
Be the Masterclass Teacher. Be the Patient Mentor. Be the Friend Who Explains.
Every response must feel like a real teacher is sitting next to the student.
The student should feel: "Agar yeh AI mila hota toh main kabhi fail nahi hota!"
`;

// ─────────────────────────────────────────────
// 1. DETECT INTENT from student message
// ─────────────────────────────────────────────
export const detectStudentIntent = async (
    message: string,
    studentProfile: any
): Promise<any> => {
    const messages = [
        {
            role: 'system',
            content: `You are an education intent detector for Indian students.
Analyze the student's message and return a JSON object.

Return ONLY valid JSON:
{
    "intent": "learn_topic" | "create_session" | "upload_content" | "get_homework" | "generate_exam" | "ask_doubt" | "continue_session" | "onboarding" | "general_chat",
    "subject": "detected subject or null",
    "topic": "specific topic or null",
    "grade_level": "class_1 to phd or exam type (upsc/ssc/jee/neet/banking) or null",
    "board": "cbse | icse | maharashtra_ssc | up_board | gseb | rbse | mpbse | tnbse | kseeb | wbbse | pseb | hbse | general | null",
    "state": "state name or null",
    "medium": "hindi | english | marathi | gujarati | tamil | kannada | bengali | punjabi | null",
    "education_type": "school | college | competitive | professional | govt_exam | null",
    "language": "hi | en | mr | gu | ta | null",
    "confidence": 0.0 to 1.0,
    "needs_onboarding": true | false
}

Examples:
- "Mujhe class 10 physics padni hai" → learn_topic, class_10, school, cbse
- "Maharashtra board SSC science" → learn_topic, class_10, school, maharashtra_ssc
- "UPSC ke liye Indian Polity" → learn_topic, null, upsc, general, govt_exam
- "JEE ke liye calculus" → learn_topic, mathematics, jee, cbse, competitive
- "Aaj ka homework do" → get_homework
- "Exam generate karo" → generate_exam`
        },
        { role: 'user', content: `Student message: "${message}"\nStudent grade level: ${studentProfile?.grade_level || 'unknown'}\nStudent board: ${studentProfile?.board || 'unknown'}` }
    ];

    const res = await getProviderResponse(messages, { jsonMode: true, maxTokens: 500, temperature: 0.2 });
    const text = res?.choices?.[0]?.message?.content || '{}';
    return safeJsonParse(text) || { intent: 'general_chat', confidence: 0.5 };
};

// ─────────────────────────────────────────────
// 2. CHAT RESPONSE — conversational reply
// ─────────────────────────────────────────────
export const getMinervaChat = async (
    message: string,
    studentProfile: any,
    chatHistory: any[],
    context?: string,
    deep_study?: boolean
): Promise<{ reply: string; content_type: string; metadata: any }> => {
    const history = chatHistory.slice(-24).map(m => ({
        role: m.role === 'student' ? 'user' : 'assistant',
        content: m.content
    }));

    const isExplicitDetail = message.toLowerCase().includes('deep dive') || 
                             message.toLowerCase().includes('detail') || 
                             message.toLowerCase().includes('explain in-depth') ||
                             message.toLowerCase().includes('samjhao') ||
                             message.toLowerCase().includes('expln') ||
                             message.toLowerCase().includes('masterclass');
    const persona = (deep_study || isExplicitDetail) ? DEEP_STUDY_PERSONA(studentProfile) : MINERVA_PERSONA(studentProfile);

    const messages = [
        { role: 'system', content: persona + (context ? `\n\nCONTEXT: ${context}` : '') },
        ...history,
        { role: 'user', content: message }
    ];

    const res = await getProviderResponse(messages, { maxTokens: 2000, temperature: 0.75 });
    const reply = res?.choices?.[0]?.message?.content || 'The server is currently busy or experiencing high traffic. Please try again in a few moments.';

    // Generate 3 contextual follow-up suggestion questions dynamically using LLM
    let suggestions: string[] = [];
    try {
        const suggestionPrompt = [
            {
                role: 'system',
                content: `You are an educational prompt generator. Based on the following tutor explanation, generate exactly 3 short, relevant, highly engaging follow-up questions/prompts that the student can click next to understand the topic more deeply in detail.
Format the output as a clean JSON array of strings. Example: ["Can you explain the mathematical derivation?", "What are the real-world applications of this concept?", "Give me a practice MCQ question on this."]
Do NOT include any extra text or reasoning. Return ONLY the JSON array.`
            },
            {
                role: 'user',
                content: `Tutor Explanation: ${reply}`
            }
        ];
        const sugRes = await getProviderResponse(suggestionPrompt, { maxTokens: 200, temperature: 0.7 });
        const sugText = sugRes?.choices?.[0]?.message?.content || '[]';
        const match = sugText.match(/\[[\s\S]*?\]/);
        if (match) {
            suggestions = JSON.parse(match[0]);
        }
    } catch (e) {
        console.error("Failed to generate dynamic suggestions:", e);
    }

    const labConfig = await generateLabConfig(message, reply, studentProfile);
    const finalMetadata: any = {};
    if (suggestions.length > 0) finalMetadata.suggestions = suggestions;
    if (labConfig) finalMetadata.lab_config = labConfig;

    return { 
        reply, 
        content_type: 'text', 
        metadata: Object.keys(finalMetadata).length > 0 ? finalMetadata : null 
    };
};

// ─────────────────────────────────────────────
// 3. GENERATE ROADMAP from topic/content
// ─────────────────────────────────────────────
export const generateRoadmap = async (
    subject: string,
    topic: string,
    grade_level: string,
    board: string,
    medium: string,
    source_content?: string,
    language: string = 'english'
): Promise<any> => {
    const boardLabel = getBoardLabel(board);
    const gradeLabel = getGradeLabel(grade_level);

    const messages = [
        {
            role: 'system',
            content: `You are an expert Indian education curriculum designer.
Create a detailed topic roadmap for the given subject/topic.
Board: ${boardLabel}, Grade: ${gradeLabel}, Medium: ${medium}, Target Language: ${language}

Return ONLY valid JSON:
{
    "title": "Session title",
    "subject": "subject name",
    "estimated_hours": number,
    "board_pattern": "brief note about this board's exam pattern",
    "nodes": [
        {
            "order_index": 1,
            "title": "Topic name",
            "chapter": "Chapter name if applicable",
            "topic": "Main topic",
            "subtopic": "Specific subtopic",
            "priority": "HIGH" | "MEDIUM" | "LOW",
            "priority_reason": "Why this is important for exam",
            "board_relevance": "How this topic appears in board exams",
            "exam_weightage_percent": 0-100,
            "difficulty": "basic" | "intermediate" | "advanced",
            "estimated_time_minutes": number,
            "key_points": ["point1", "point2", "point3"],
            "key_formulas": ["formula1", "formula2"]
        }
    ]
}

RULES:
- HIGH priority = most likely to appear in ${boardLabel} exam (60% of nodes)
- MEDIUM = moderate importance (30%)  
- LOW = good to know (10%)
- First node should always be UNLOCKED, rest LOCKED initially
- Order from fundamental to advanced
- For government exams (UPSC/SSC/JEE/NEET), follow their exact syllabus pattern
- For state boards, follow that state's specific curriculum
- Include 5-15 nodes depending on topic depth
- IMPORTANT: Generate ALL text fields in the JSON (including title, board_pattern, chapter, topic, subtopic, priority_reason, board_relevance, key_points, key_formulas) in the target language: ${language}. If target language is Hinglish, write them in natural Romanized Hindi.`
        },
        {
            role: 'user',
            content: `Create roadmap for:
Subject: ${subject}
Topic: ${topic || subject}
${source_content ? `Content to extract from:\n${source_content.substring(0, 2000)}` : ''}`
        }
    ];

    const res = await getProviderResponse(messages, { jsonMode: true, maxTokens: 4096, temperature: 0.3 });
    const text = res?.choices?.[0]?.message?.content || '{}';
    return safeJsonParse(text);
};

// ─────────────────────────────────────────────
// 4. GENERATE TOPIC CONTENT (Learn page)
// ─────────────────────────────────────────────
export const generateTopicContent = async (
    node: any,
    studentProfile: any,
    sessionLanguage?: string
): Promise<any> => {
    const lang = sessionLanguage || studentProfile?.language_preference || 'hinglish';
    const board = getBoardLabel(studentProfile?.board || 'cbse');
    const grade = getGradeLabel(studentProfile?.grade_level || 'class_10');

    const messages = [
        {
            role: 'system',
            content: `You are MINERVA, an expert tutor. Generate complete learning content for a topic.
Language: ${lang} | Board: ${board} | Grade: ${grade}

Return ONLY valid JSON:
{
    "explanation_simple": "Simple 3-4 line explanation like talking to a 10-year-old. Use analogies.",
    "explanation_detailed": "Full detailed theory (500-800 words). Include: definition, concept, how it works, why it matters. Use ${lang}.",
    "real_world_example": "A vivid real-life example or story that makes the concept stick. 100-150 words.",
    "key_points": ["5-8 key takeaway bullet points"],
    "key_formulas": ["any formulas or rules, empty array if none"],
    "memory_trick": "A clever mnemonic or trick to remember this topic",
    "board_specific_note": "What to specifically focus on for ${board} exam format",
    "youtube_videos": [
        {"title": "Best English explanation video title", "url": "https://www.youtube.com/watch?v=REAL_11CHAR_ID", "channel": "Channel Name", "lang": "english"},
        {"title": "Hindi mein best explanation video title", "url": "https://www.youtube.com/watch?v=REAL_11CHAR_ID", "channel": "Channel Name", "lang": "hindi"},
        {"title": "Video in ${lang} for this exact topic", "url": "https://www.youtube.com/watch?v=REAL_11CHAR_ID", "channel": "Channel Name", "lang": "${lang}"}
    ],
    "micro_tasks": [
        {
            "type": "text_answer" | "fill_blank" | "mcq" | "numerical",
            "prompt": "Task question/instruction",
            "options": ["A", "B", "C", "D"] (for MCQ only),
            "correct_answer": "Expected answer or key points",
            "marks": 2-10,
            "difficulty": "easy" | "medium" | "hard",
            "is_homework": false
        }
    ],
    "homework_tasks": [
        {
            "type": "text_answer" | "fill_blank" | "mcq" | "numerical",
            "prompt": "Homework question",
            "correct_answer": "Expected answer",
            "marks": 2-10,
            "difficulty": "medium" | "hard",
            "is_homework": true
        }
    ]
}

RULES:
- explanation_simple (Concept Metaphor/Analogy): MUST be a simple, concept-focused educational metaphor or real-life analogy (100-150 words) that makes the concept intuitively clear. Explain the core concept using a completely relatable real-world comparison (e.g., explaining traffic congestion for resistance, or water pipe flow for electric current). It must remain strictly educational, focusing directly on illustrating the concept, and MUST NOT go off-topic into fantasy stories, fictional characters, or irrelevant side plots.
- explanation_detailed (Theory/Concept): MUST be an extremely detailed, technical, and comprehensive academic breakdown (500-800 words) in ${lang}. This must take the student from basic definitions all the way to advanced masterclass details, showing step-by-step mechanisms, equations/derivations (if applicable), practical applications, and syllabus alignments. DO NOT output simple or generic definitions.
- PYQ SPECIAL RULE: If the node relevance (board_relevance) or title indicates this is a 'Direct PYQ Question', or if key_points contains an item starting with "QUESTION: ", treat this entire node as a past year exam question.
  - explanation_simple (Hint): Must be a direct, helpful hint or strategic tip on how to think or approach solving this exact question. Keep it simple and encouraging.
  - explanation_detailed (Step-by-Step Solution): Must be the complete, step-by-step resolved answer/solution to that exact question (instead of generic theory). Show calculations, equations, derivations, or structural points clearly.
  - micro_tasks: Generate 3-4 progressive practice tasks (easy, medium, hard) that are direct clones/variations of the uploaded question (e.g. testing the same concept with different numbers or structures) to ensure the student can apply the learning.
  - homework_tasks: Generate 2-3 similar homework practice tasks, slightly harder than the micro_tasks, testing the same core concepts with their correct expected answers.
- youtube_videos: CRITICAL — Provide 3 YouTube videos with REAL, ACTUAL 11-character video IDs that exist on YouTube. Include: 1 English video, 1 Hindi video, and 1 video in ${lang} (mother tongue if different). Use well-known channels: Khan Academy, Physics Wallah (PW), Vedantu, Unacademy, Doubtnut, NCERT official, etc. The video MUST be specifically about "${node.title}" topic. DO NOT make up video IDs — only use IDs from videos you know exist.
- Key formulas: include in proper format (e.g., "F = ma (Force = mass × acceleration)")`
        },
        {
            role: 'user',
            content: `Generate learning content for:
Title: ${node.title}
Chapter: ${node.chapter}
Topic: ${node.topic}
Subtopic: ${node.subtopic}
Difficulty: ${node.difficulty}
Key Points provided: ${node.key_points?.join(', ')}
Key Formulas: ${node.key_formulas?.join(', ')}
Board Relevance: ${node.board_relevance}`
        }
    ];

    const res = await getProviderResponse(messages, { jsonMode: true, maxTokens: 4000, temperature: 0.5 });
    const text = res?.choices?.[0]?.message?.content || '{}';
    return safeJsonParse(text);
};

// ─────────────────────────────────────────────
// 5. GRADE STUDENT ANSWER
// ─────────────────────────────────────────────
export const gradeStudentAnswer = async (
    task: any,
    studentAnswer: string,
    language: string
): Promise<{ score: number; feedback: string; correction: string; passed: boolean }> => {
    const messages = [
        {
            role: 'system',
            content: `You are a fair and encouraging teacher grading a student's answer.
Language to respond in: ${language}

Return ONLY valid JSON:
{
    "score": 0-100,
    "feedback": "Warm, encouraging feedback in ${language}. What they did right, what to improve.",
    "correction": "The correct/ideal answer explanation",
    "passed": true if score >= 60
}

RULES:
- Score 90-100: Excellent, near perfect
- Score 70-89: Good, minor gaps
- Score 50-69: Partial understanding
- Score below 50: Needs revision
- Be ENCOURAGING even for low scores. Never demotivate.
- Feedback should feel like a warm teacher, not a machine.`
        },
        {
            role: 'user',
            content: `Task: ${task.prompt}
Expected Answer: ${task.correct_answer || 'Open-ended'}
Task Type: ${task.type}
Subject: ${task.subject}
Topic: ${task.topic_title}
Student's Answer: ${studentAnswer}`
        }
    ];

    const res = await getProviderResponse(messages, { jsonMode: true, maxTokens: 600, temperature: 0.4 });
    const text = res?.choices?.[0]?.message?.content || '{}';
    const parsed = safeJsonParse(text);
    return {
        score: parsed?.score || 0,
        feedback: parsed?.feedback || 'Answer recorded.',
        correction: parsed?.correction || '',
        passed: parsed?.passed || false
    };
};

// ─────────────────────────────────────────────
// 6. GENERATE EXAM PAPER
// ─────────────────────────────────────────────
export const generateExamPaper = async (
    session: any,
    weakNodes: any[],
    strongNodes: any[],
    examType: string,
    totalMarks: number,
    board: string,
    grade: string
): Promise<any> => {
    const boardLabel = getBoardLabel(board);
    const gradeLabel = getGradeLabel(grade);

    // Build weak topic list for weighted generation
    const weakTopics = weakNodes.slice(0, 5).map(n => n.title).join(', ');
    const strongTopics = strongNodes.slice(0, 3).map(n => n.title).join(', ');
    const allTopics = [...weakNodes, ...strongNodes].map(n => n.title).join(', ');

    const messages = [
        {
            role: 'system',
            content: `You are an expert exam paper generator for Indian education boards.
Board: ${boardLabel} | Grade: ${gradeLabel} | Exam Type: ${examType} | Total Marks: ${totalMarks}

Return ONLY valid JSON:
{
    "title": "Exam title",
    "instructions": "General exam instructions",
    "duration_minutes": number,
    "sections": [
        {
            "section_name": "Section A",
            "section_type": "mcq" | "short_answer" | "long_answer" | "fill_blank",
            "marks_per_question": number,
            "total_questions": number,
            "section_marks": number,
            "questions": [
                {
                    "question_number": 1,
                    "type": "mcq" | "short" | "long" | "fill_blank" | "true_false",
                    "question": "Question text",
                    "options": ["A", "B", "C", "D"] (MCQ only),
                    "marks": number,
                    "topic": "topic this question is from",
                    "difficulty": "easy" | "medium" | "hard",
                    "expected_answer": "Model answer / key points"
                }
            ]
        }
    ]
}

RULES:
- EVERY question inside the generated exam paper MUST be completely unique. DO NOT duplicate questions or repeat similar questions in different sections.
- For MCQ questions, EVERY option (A, B, C, D) MUST be completely unique and distinct. NEVER repeat the same text or option multiple times for a question.
- Follow exact ${boardLabel} exam paper format
- Weak topics: ${weakTopics} → 60% questions from here
- Strong topics: ${strongTopics} → 20% questions from here
- Mixed topics: 20% from other covered topics
- Section A: MCQ (1 mark each) — 20% of total marks
- Section B: Short Answer (2-3 marks) — 40% of total marks
- Section C: Long Answer (5 marks) — 40% of total marks
- Questions should be board-standard quality
- Include questions at different difficulty levels`
        },
        {
            role: 'user',
            content: `Generate ${examType} exam paper.
All covered topics: ${allTopics}
Total marks: ${totalMarks}`
        }
    ];

    const res = await getProviderResponse(messages, { jsonMode: true, maxTokens: 4000, temperature: 0.4 });
    const text = res?.choices?.[0]?.message?.content || '{}';
    return safeJsonParse(text);
};

// Translate generated exam paper to target language
export const translateExamPaper = async (exam: any, targetLanguage: string): Promise<any> => {
    if (!exam || !targetLanguage || targetLanguage.toLowerCase() === 'english') {
        return exam;
    }

    try {
        console.log(`🌐 [Exam Translator] Translating exam paper from English to ${targetLanguage}`);
        
        if (exam.title) {
            exam.title = await translateContent(exam.title, targetLanguage);
        }
        if (exam.instructions) {
            exam.instructions = await translateContent(exam.instructions, targetLanguage);
        }

        if (Array.isArray(exam.sections)) {
            for (const section of exam.sections) {
                if (section.section_name) {
                    section.section_name = await translateContent(section.section_name, targetLanguage);
                }
                if (Array.isArray(section.questions)) {
                    for (const question of section.questions) {
                        if (question.question) {
                            question.question = await translateContent(question.question, targetLanguage);
                        }
                        if (Array.isArray(question.options)) {
                            question.options = await Promise.all(question.options.map(async (opt: string) => {
                                return await translateContent(opt, targetLanguage);
                            }));
                        }
                        if (question.expected_answer) {
                            question.expected_answer = await translateContent(question.expected_answer, targetLanguage);
                        }
                    }
                }
            }
        }
    } catch (err: any) {
        console.error('[Exam Translation Error] Fallback to original English exam paper', err);
    }
    
    return exam;
};

// ─────────────────────────────────────────────
// 7. ONBOARDING — Quick profile from chat
// ─────────────────────────────────────────────
export const extractProfileFromChat = async (message: string): Promise<any> => {
    const messages = [
        {
            role: 'system',
            content: `Extract student profile from their message. Return ONLY valid JSON:
{
    "grade_level": "class_1|class_2|...|class_10|class_11|class_12|graduation|masters|phd|jee|neet|upsc|ssc|banking|railway|ca|cs|iti|polytechnic|null",
    "education_type": "school|college|competitive|professional|govt_exam|null",
    "board": "cbse|icse|maharashtra_ssc|up_board|gseb|rbse|mpbse|tnbse|kseeb|wbbse|pseb|hbse|general|null",
    "state": "state name or null",
    "medium": "hindi|english|marathi|gujarati|tamil|kannada|bengali|punjabi|null",
    "subject": "main subject they want to study or null",
    "language_preference": "hinglish|hindi|english|regional",
    "confidence": 0.0-1.0
}`
        },
        { role: 'user', content: message }
    ];

    const res = await getProviderResponse(messages, { jsonMode: true, maxTokens: 400, temperature: 0.1 });
    const text = res?.choices?.[0]?.message?.content || '{}';
    return safeJsonParse(text) || {};
};

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
export const getBoardLabel = (board: string): string => {
    const labels: Record<string, string> = {
        // Central Boards
        cbse: 'CBSE (NCERT) — Central Board of Secondary Education',
        icse: 'ICSE / ISC — Indian Certificate of Secondary Education',
        nios: 'NIOS — National Institute of Open Schooling',
        cbse_vocational: 'CBSE Vocational (Skill Education)',
        // State Boards
        msbshse: 'Maharashtra Board (SSC/HSC) — Maharashtra State Board',
        upmsp: 'UP Board (UPMSP) — Uttar Pradesh Madhyamik Shiksha Parishad',
        bseb: 'Bihar Board (BSEB) — Bihar School Examination Board',
        rbse: 'Rajasthan Board (RBSE) — Rajasthan Board of Secondary Education',
        mpbse: 'MP Board (MPBSE) — Madhya Pradesh Board of Secondary Education',
        gseb: 'Gujarat Board (GSEB) — Gujarat Secondary and Higher Secondary Education Board',
        pseb: 'Punjab Board (PSEB) — Punjab School Education Board',
        hpbose: 'Himachal Pradesh Board (HPBOSE)',
        bseh: 'Haryana Board (BSEH) — Board of School Education Haryana',
        uk_board: 'Uttarakhand Board (UBSE) — Uttarakhand Board of School Education',
        jkbose: 'J&K Board (JKBOSE) — Jammu & Kashmir Board of School Education',
        wbbse: 'West Bengal Board (WBBSE) — West Bengal Board of Secondary Education',
        tbse: 'Tripura Board (TBSE) — Tripura Board of Secondary Education',
        bsem: 'Manipur Board (BSEM) — Board of Secondary Education Manipur',
        nbse: 'Nagaland Board (NBSE) — Nagaland Board of School Education',
        seba: 'Assam Board (SEBA/AHSEC) — Board of Secondary Education Assam',
        meghalaya: 'Meghalaya Board (MBOSE) — Meghalaya Board of School Education',
        arunachal: 'Arunachal Board (DERT) — Directorate of Education Arunachal Pradesh',
        mizoram: 'Mizoram Board (MBSE) — Mizoram Board of School Education',
        tnbse: 'Tamil Nadu Board (TNBSE/Samacheer Kalvi)',
        ap_bse: 'Andhra Pradesh Board (APBSE)',
        tsbie: 'Telangana Board (TSBIE) — Telangana State Board of Intermediate Education',
        kseeb: 'Karnataka Board (KSEAB) — Karnataka School Examination and Assessment Board',
        keralapare: 'Kerala Board (DHSE/SCERT) — Department of Higher Secondary Education Kerala',
        goa_board: 'Goa Board (GBSHSE) — Goa Board of Secondary and Higher Secondary Education',
        bsea: 'Odisha Board (BSE Odisha) — Board of Secondary Education Odisha',
        chse_odisha: 'Odisha +2 (CHSE) — Council of Higher Secondary Education Odisha',
        cgbse: 'Chhattisgarh Board (CGBSE)',
        jac: 'Jharkhand Board (JAC) — Jharkhand Academic Council',
        // Competitive / Custom
        jee: 'JEE (Mains & Advanced) — Joint Entrance Examination',
        neet: 'NEET (Medical Entrance) — National Eligibility cum Entrance Test',
        upsc: 'UPSC Civil Services — Union Public Service Commission',
        developer: 'Developer / Software Engineering Profile',
        general: 'General / Custom Curriculum',
        // Legacy keys (keep for backward compat)
        maharashtra_ssc: 'Maharashtra SSC/HSC Board',
        up_board: 'UP Board (UPMSP)',
        tnbse_legacy: 'Tamil Nadu Board (Samacheer)',
        hbse: 'Haryana Board (HBSE)',
        ssc: 'SSC (Staff Selection Commission)',
        banking: 'Banking Exams (IBPS/SBI)',
        railway: 'Railway (RRB)',
        gate: 'GATE',
        cat: 'CAT/MBA Entrance',
        ca: 'CA (ICAI)',
        cs: 'CS (ICSI)',
    };
    return labels[board] || board.toUpperCase();
};

export const getGradeLabel = (grade: string): string => {
    const labels: Record<string, string> = {
        class_1: 'Class 1', class_2: 'Class 2', class_3: 'Class 3',
        class_4: 'Class 4', class_5: 'Class 5', class_6: 'Class 6',
        class_7: 'Class 7', class_8: 'Class 8', class_9: 'Class 9',
        class_10: 'Class 10', class_11: 'Class 11', class_12: 'Class 12',
        graduation: 'Graduation (UG)', masters: 'Post Graduation (PG)',
        phd: 'PhD / Research', jee: 'JEE Aspirant', neet: 'NEET Aspirant',
        upsc: 'UPSC Aspirant', ssc: 'SSC Aspirant', banking: 'Banking Aspirant',
        railway: 'Railway Aspirant', gate: 'GATE Aspirant', cat: 'CAT Aspirant',
        ca: 'CA Student', cs: 'CS Student', iti: 'ITI Student',
        polytechnic: 'Polytechnic Student',
    };
    return labels[grade] || grade;
};

// ─────────────────────────────────────────────
// 8. GENERATE STUDENT STUDY MATERIAL (E-Builder)
// ─────────────────────────────────────────────
export const generateStudentStudyMaterial = async (
    subject: string,
    title: string,
    type: string, // 'summary' | 'flashcards' | 'cheatsheet' | 'essay'
    language: string,
    grade_level: string,
    board: string
): Promise<any> => {
    // Generate in English first to ensure high-quality structure, standard terminology, and prevent loops/duplications
    const generationLanguage = 'english'; 
    
    let systemInstruction = "";
    if (type === 'flashcards') {
        systemInstruction = `You are an expert tutor. Create a list of 8-12 interactive flashcards for the topic.
Format: JSON array of objects: [{"term": "concept name", "definition": "clear concise explanation"}]
Language: ${generationLanguage} | Grade: ${grade_level} | Board: ${board}

Return ONLY a valid JSON array. Do not put markdown wrapping or code blocks around it.`;
    } else if (type === 'cheatsheet') {
        systemInstruction = `You are an expert tutor. Create a high-yield exam cheatsheet for the topic.
Include key formulas, quick definitions, laws, and common board-exam tips.
Format: Markdown. Keep it structured and bulleted.
Language: ${generationLanguage} | Grade: ${grade_level} | Board: ${board}
CRITICAL: Do NOT repeat the same formulas or sections. Ensure each point adds new value.`;
    } else if (type === 'essay') {
        systemInstruction = `You are an expert tutor. Create a detailed study guide or essay outline for the topic.
Format: Markdown with clean heading structure (H1, H2, H3).
Language: ${generationLanguage} | Grade: ${grade_level} | Board: ${board}
CRITICAL: Do NOT duplicate or repeat paragraphs or sections under different heading levels. Each heading (e.g. H3 vs H4) MUST contain completely unique, distinct content. Do NOT pad length by cloning sentences.`;
    } else { // summary / revision notes
        systemInstruction = `You are an expert tutor. Create comprehensive yet clear revision notes for the topic.
Format: Markdown with bullet points, brief examples, and analogies.
Language: ${generationLanguage} | Grade: ${grade_level} | Board: ${board}
CRITICAL: Do NOT repeat paragraphs or sentences. Keep it clean and concise. Each section must introduce new insights.`;
    }

    const messages = [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: `Create study material of type: "${type}" for the Course/Topic: "${title}" (Subject: "${subject}")` }
    ];

    const res = await getProviderResponse(messages, {
        jsonMode: type === 'flashcards',
        maxTokens: 3000,
        temperature: 0.3 // Lower temperature for more deterministic, non-repetitive text
    });

    let content = res?.choices?.[0]?.message?.content || '';

    // If target language is not English, translate the clean English content to the target language
    const targetLanguage = language.trim().toLowerCase();
    if (targetLanguage !== 'english' && content) {
        console.log(`🌐 [E-Builder Translator] Translating generated ${type} from English to ${language}`);
        if (type === 'flashcards') {
            // Translate flashcards array
            let parsed = safeJsonParse(content);
            if (parsed && !Array.isArray(parsed) && Array.isArray(parsed.flashcards)) {
                parsed = parsed.flashcards;
            }
            if (Array.isArray(parsed)) {
                const translatedCards = await Promise.all(parsed.map(async (item: any) => {
                    const term = String(item.term || item.front || item.concept || item.word || item.question || '').trim();
                    const definition = String(item.definition || item.back || item.explanation || item.desc || item.description || item.answer || '').trim();
                    
                    const tTerm = await translateContent(term, language);
                    const tDefinition = await translateContent(definition, language);
                    return { term: tTerm, definition: tDefinition };
                }));
                return translatedCards.filter(item => item.term.length > 0 && item.definition.length > 0);
            }
            return [];
        } else {
            // Translate markdown text
            content = await translateContent(content, language);
        }
    }

    if (type === 'flashcards') {
        let parsed = safeJsonParse(content);
        if (parsed && !Array.isArray(parsed) && Array.isArray(parsed.flashcards)) {
            parsed = parsed.flashcards;
        }
        if (Array.isArray(parsed)) {
            return parsed.map((item: any) => {
                const term = String(item.term || item.front || item.concept || item.word || item.question || '').trim();
                const definition = String(item.definition || item.back || item.explanation || item.desc || item.description || item.answer || '').trim();
                return { term, definition };
            }).filter(item => item.term.length > 0 && item.definition.length > 0);
        }
        return [];
    }

    return content;
};

// ─── TRANSLATE CONTENT ────────────────────────
export const translateContent = async (
    text: string,
    targetLanguage: string
): Promise<string> => {
    if (!text || !text.trim()) return '';

    const messages = [
        {
            role: 'system',
            content: `You are an expert multi-lingual educational translator.
Translate the user's provided educational text into ${targetLanguage}.

RULES:
1. Preserve all markdown structure, code blocks, lists, links, inline equations, and bold text exactly as they are in the source.
2. Only translate the prose and explanations.
3. Keep standard English technical terms (like Resistor, Current, Gravity, Mitochondria) in English script or phonetic script if they are commonly used that way (e.g. if translating to Hinglish or Hindi, you can use "resistor" or "current" directly instead of translating them to Sanskrit/pure Hindi terms like "प्रतिरोधक").
4. Return ONLY the translated markdown text. Do not add any greetings, preambles, or markdown wrapping. Just output the translation itself.`
        },
        {
            role: 'user',
            content: text
        }
    ];

    const res = await getProviderResponse(messages, {
        maxTokens: 3500,
        temperature: 0.3
    });

    return res?.choices?.[0]?.message?.content || text;
};

// ─────────────────────────────────────────────
// 9. GRADE EXAM WRITTEN ANSWERS IN BULK
// ─────────────────────────────────────────────
export const gradeExamWrittenAnswers = async (
    questionsAndAnswers: {
        question_number: number;
        question: string;
        expected_answer?: string;
        student_answer: string;
        marks: number;
        topic: string;
    }[],
    language: string
): Promise<Record<number, { obtained_marks: number; feedback: string; correction: string }>> => {
    if (questionsAndAnswers.length === 0) return {};

    const messages = [
        {
            role: 'system',
            content: `You are an expert exam evaluator grading student written answers for academic exams.
You will receive a list of questions, expected reference answers, student answers, and maximum marks.
Evaluate each answer carefully, award realistic obtained marks (0 to max marks), and provide constructive, warm feedback in ${language}.
Also provide a short ideal correction/explanation for any points they missed.

Return ONLY a valid JSON object matching this schema:
{
    "grades": {
        "1": {
            "obtained_marks": number,
            "feedback": "Warm feedback text",
            "correction": "Ideal answer explanation"
        }
    }
}
Note: The keys of "grades" should be the question_number as strings (e.g. "1", "2").
Ensure strict adherence to JSON formatting. Return nothing else.`
        },
        {
            role: 'user',
            content: `Grade the following answers:
${JSON.stringify(questionsAndAnswers, null, 2)}`
        }
    ];

    try {
        const res = await getProviderResponse(messages, { jsonMode: true, maxTokens: 2500, temperature: 0.3 });
        const text = res?.choices?.[0]?.message?.content || '{}';
        const parsed = safeJsonParse(text);
        return parsed?.grades || {};
    } catch (err) {
        console.error('[gradeExamWrittenAnswers Error]', err);
        return {};
    }
};

// ─────────────────────────────────────────────
// 10. GENERATE ROADMAP FROM PREVIOUS YEAR PAPER (PYQ)
// ─────────────────────────────────────────────
export const generatePYQRoadmap = async (
    fileName: string,
    extractedText: string,
    studentQuery: string,
    grade_level: string,
    board: string,
    medium: string,
    language: string = 'english'
): Promise<any> => {
    const boardLabel = getBoardLabel(board);
    const gradeLabel = getGradeLabel(grade_level);

    const messages = [
        {
            role: 'system',
            content: `You are an expert exam curriculum designer and academic evaluator.
Analyze the provided Previous Year Question (PYQ) Paper or Exam Paper.
Create a structured preparation path where each node corresponds to a specific question or key topic found in the paper.

Return ONLY valid JSON:
{
    "title": "PYQ Prep: [Subject Name] ([Year/Exam if detected])",
    "subject": "Subject Name",
    "estimated_hours": number,
    "board_pattern": "Brief analysis of the exam format from this paper",
    "nodes": [
        {
            "order_index": 1,
            "title": "Q1: [Brief Question Summary or Topic]",
            "chapter": "Name of chapter/unit this belongs to",
            "topic": "Main academic topic",
            "subtopic": "Specific subtopic",
            "priority": "HIGH",
            "priority_reason": "Question direct from uploaded paper",
            "board_relevance": "Direct PYQ Question from: ${fileName}",
            "exam_weightage_percent": number,
            "difficulty": "basic" | "intermediate" | "advanced",
            "estimated_time_minutes": number,
            "key_points": [
                "QUESTION: [Full actual question text extracted from the paper]",
                "MARKS: [Marks allocated if visible, or null]"
            ],
            "key_formulas": ["Any key formulas required to solve this"]
        }
    ]
}

RULES:
- Parse all questions from the extracted paper text. If there are too many (e.g. >15), group related questions together or select the most critical 10-15 high-weightage questions. Do not omit crucial details.
- Calculate node priority dynamically: Set 'HIGH' for long answer questions or questions with high marks (>= 5 marks), 'MEDIUM' for short answer questions (2-4 marks), and 'LOW' for 1-mark/basic questions.
- Maintain the order from basic/first questions to advanced/final questions.
- Write ALL JSON fields in the target language: ${language}. For Hinglish, use Romanized Hindi.
- In key_points, the first item must strictly start with "QUESTION: " followed by the exact question from the paper, so the learning engine knows this is a PYQ node.`
        },
        {
            role: 'user',
            content: `Document Name: ${fileName}
Extracted Paper Text:
"""
${extractedText.substring(0, 15000)}
"""

Student Instruction: ${studentQuery}`
        }
    ];

    const res = await getProviderResponse(messages, { jsonMode: true, maxTokens: 4096, temperature: 0.3 });
    const text = res?.choices?.[0]?.message?.content || '{}';
    return safeJsonParse(text);
};

const getDemographicConfig = (studentProfile: any): { temperature: number; maxTokens: number } => {
    const grade = (studentProfile?.grade_level || 'class_10').toLowerCase();
    if (
        grade.includes('phd') || 
        grade.includes('masters') || 
        grade.includes('graduation') || 
        grade.includes('professional') || 
        grade.includes('govt_exam') ||
        grade.includes('jee') || 
        grade.includes('neet') || 
        grade.includes('upsc') || 
        grade.includes('gate') || 
        grade.includes('cat')
    ) {
        return { temperature: 0.15, maxTokens: 3000 };
    }
    return { temperature: 0.8, maxTokens: 2500 };
};

const LEARNING_CONFIRMATIONS = [
    'samajh', 'samaj gya', 'clear', 'makkhan', 'makan', 'aha', 'great example', 
    'nice explanation', 'perfect explanation', 'thank you bhaiya', 'thanks bhaiya',
    'got it', 'understand', 'undrstnd', 'badiya', 'awesome', 'smjh gaya', 'smjh gya',
    'samajh gaya', 'samajh gya', 'samaj gaya', 'samaj gya'
];

export const processSelfLearningFeedback = async (
    studentMessage: string,
    previousReply: string,
    studentProfile: any
): Promise<void> => {
    const msg = studentMessage.toLowerCase();
    const hasConfirmation = LEARNING_CONFIRMATIONS.some(keyword => msg.includes(keyword));
    
    if (!hasConfirmation) return;

    try {
        const messages = [
            {
                role: 'system',
                content: `You are an educational feedback processor.
Analyze the student's confirmation and the teacher's previous reply.
Extract:
1. The exact key topic being explained (e.g., "Recursion", "Gradient Descent", "Binary Search", "Arteries") - keep it short (1-3 words).
2. The exact analogy or key explanation style used in the reply that made it click for the student.

Return ONLY a valid JSON object:
{
    "topic": "Key topic name",
    "analogy": "The detailed analogy or explanation style that worked"
}`
            },
            {
                role: 'user',
                content: `Teacher's Reply: "${previousReply.substring(0, 1500)}"\nStudent's Confirmation: "${studentMessage}"`
            }
        ];

        const res = await getProviderResponse(messages, { jsonMode: true, maxTokens: 500, temperature: 0.2 });
        const text = res?.choices?.[0]?.message?.content || '{}';
        const parsed = safeJsonParse(text);
        
        if (parsed?.topic && parsed?.analogy) {
            const studentLevel = studentProfile?.grade_level || 'class_10';
            const language = studentProfile?.language_preference || 'hinglish';
            
            await MinervaNeuralMemory.findOneAndUpdate(
                { 
                    topic: parsed.topic.trim().toLowerCase(), 
                    studentLevel, 
                    language 
                },
                { 
                    $inc: { successCount: 1 },
                    $setOnInsert: { 
                        analogy: parsed.analogy.trim(),
                        isGlobal: true 
                    } 
                },
                { upsert: true, new: true }
            );
            console.log(`🧠 [Neural Learning] Learnt new explanation/analogy for "${parsed.topic}" at level "${studentLevel}"!`);
        }
    } catch (err) {
        console.error("Failed to process self-learning feedback:", err);
    }
};

export const getCombinedMinervaResponse = async (
    message: string,
    studentProfile: any,
    chatHistory: any[],
    deep_study?: boolean,
    forceLab?: boolean
): Promise<{
    intent: any;
    reply: string;
    content_type: string;
    metadata: any;
}> => {
    const history = chatHistory.slice(-20).map(m => ({
        role: m.role === 'student' ? 'user' : 'assistant',
        content: m.content
    }));

    const isExplicitDetail = message.toLowerCase().includes('deep dive') || 
                             message.toLowerCase().includes('detail') || 
                             message.toLowerCase().includes('explain in-depth') ||
                             message.toLowerCase().includes('samjhao') ||
                             message.toLowerCase().includes('expln') ||
                             message.toLowerCase().includes('masterclass');
    const persona = (deep_study || isExplicitDetail) ? DEEP_STUDY_PERSONA(studentProfile) : MINERVA_PERSONA(studentProfile);

    const systemPrompt = `${persona}

====================================
🎯 RESPONSE GENERATION PROTOCOL (CRITICAL)
====================================
You are a MASTER TEACHER responding to a student. Follow these rules WITHOUT EXCEPTION:

**STEP 1 — DETECT QUESTION TYPE:**
- WHAT → Definition + analogy + key points (full explanation)
- WHY → Root cause + mechanism + significance
- HOW → Step-by-step numbered process
- HOW MUCH / HOW MANY → Formulas + numbers + calculations
- WHO / WHEN / WHERE → Facts + context + significance
- CASUAL ("hi", "ok", "thanks") → Short warm response ONLY (max 2 lines)
- CONFUSED/FRUSTRATED → Empathy FIRST, then teach
- NORMAL EDUCATIONAL TOPIC → Full teacher-level explanation with analogies

**STEP 2 — REPLY QUALITY STANDARD:**
Your "reply" field must be:
- Written like a caring, brilliant bade bhaiya explaining to their younger sibling
- NEVER robotic, NEVER one-liner for educational questions
- NEVER say "As an AI..." or "I cannot..."
- ALWAYS use the student's Hinglish/shorthand vocabulary naturally
- ALWAYS use real-world analogies for complex concepts
- For coding topics: Include actual code examples in \`\`\`code\`\`\` blocks
- For math topics: Show step-by-step calculations
- For science topics: Use household/everyday analogies
- Appropriate length: Short for casual, DETAILED for educational questions

**STEP 3 — SUGGESTIONS (3 follow-up questions):**
Make suggestions feel like natural "what to learn next" prompts, not robotic options.
Example good suggestions: ["Array ka linked list se kya farq hai?", "Stack kaise implement karte hain?", "Real project mein DSA kab use hota hai?"]

**STEP 4 — LAB CONFIG (for Science/Math/Tech topics):**
Generate when topic involves any: physics, chemistry, biology, mathematics, computing concepts.
The voice_script MUST be a masterclass-level explanation (300-500 words).

For the student's message below, analyze their intent and generate:
1. Intent analysis matching the student profile.
2. A beautiful, detailed, conversational tutoring reply (in target language/preference).
3. If educational intent: exactly 3 short follow-up click questions.
4. If Science/Math/Tech topic: complete virtual lab configuration.

Return ONLY a valid JSON object matching the following structure (do not wrap in markdown \`\`\`json):
{
  "intent": {
    "intent": "learn_topic" | "create_session" | "upload_content" | "get_homework" | "generate_exam" | "ask_doubt" | "continue_session" | "onboarding" | "general_chat",
    "subject": "detected subject or null",
    "topic": "specific topic or null",
    "grade_level": "class_10",
    "board": "cbse",
    "medium": "hindi",
    "state": "state name or null",
    "education_type": "school",
    "language": "hi",
    "confidence": 1.0,
    "needs_onboarding": false
  },
  "reply": "Your conversational tutoring response answering the user's questions or doubt directly and in detail.",
  "suggestions": ["...", "...", "..."],
  "lab_config": {
    "subject": "physics" | "chemistry" | "biology" | "mathematics" | "general",
    "voice_script": "Detailed, structured masterclass explanation (300-500 words) using clean markdown formatting (headings like ##, ###, bullets like -, formulas). Walk through basic definitions, advanced deep dives, real-world examples, and step-by-step mechanisms to take the student from beginner to advanced. MUST be in Hinglish or target language.",
    "youtube_query": "simplest animated NCERT explanation search query",
    "mermaid_schema": "valid Mermaid.js flowchart code starting strictly with 'graph TD' or 'graph LR'. Crucial: Double quote all node labels containing special characters or punctuation, e.g. A[\"Topic (Detail)\"] instead of A[Topic (Detail)]. Do NOT include any descriptive text, class definitions, pseudocode, JSON or explanations inside this field. It must be strictly parsable Mermaid flowchart syntax.",
    "sketchfab_query": "An optimized, high-precision 3D model search query (2-4 words in English) representing the exact biological structure, physical mechanism, chemical compound, or machine being discussed. Examples: 'female reproductive system', 'mitochondria organelle', 'internal combustion engine', 'solar system', 'double helix dna'. MUST be extremely specific. Do not output generic categories like 'plant' or 'biology'. If the topic is abstract and has no physical 3D model representation, return null.",
    "interactive_config": {
      "type": "geogebra" | "phet" | "chemistry" | null,
      "query": "A mathematical formula or equation for GeoGebra (e.g., 'y = 3*x + 1' or 'f(x) = sin(x)') OR Chemistry experiment query name (e.g., 'acid_base_titration', 'HCl_NaOH_titration'). Return null if not applicable.",
      "phet_url": "Highly specific name of a relevant free PhET HTML5 simulator if applicable (e.g., 'Ohm\\'s Law', 'Circuit Construction Kit: DC', 'Wave Interference', 'Bending Light', 'Optics'). Return null if not applicable."
    },
    "simulation_config": {
      "type": "unique_simulation_id_lowercase_with_underscores",
      "title": "Title of the interactive experiment",
      "description": "Short explanation of what the student can test in this virtual lab.",
      "controls": [
        { "name": "slider_variable_name", "label": "Display label for slider", "min": 0, "max": 100, "step": 1, "defaultValue": 50, "unit": "units" }
      ],
      "outputs": [
        { "name": "output_variable_name", "label": "Display label for output value", "unit": "units" }
      ],
      "equations": {
        "output_variable_name": "JS mathematical expression string using ONLY defined control names (e.g. 'slider_var1 * 2'). Crucial: Do NOT write assignments or formulas with equals signs (e.g. do NOT write 'F = m * a'). Write ONLY the right-hand side expression (e.g. write 'mass_slider * gravity_slider'). Every variable in the expression MUST be either defined in controls, outputs, or be a predefined math constant. Do NOT use undefined variables."
      },
      "visual_mapping": {
        "elements": [
          {
            "type": "circle" | "rect" | "line" | "particles" | "graph",
            "color": "#color",
            "label": "Label text",
            "sizeExpr": "JS expression mapping slider/output to size/height",
            "speedExpr": "JS expression mapping slider/output to speed/rate",
            "glowExpr": "JS expression mapping slider/output to opacity/glow (0 to 1)",
            "plotExpr": "REQUIRED ONLY if type is 'graph'. Valid JS mathematical formula string plotting y as a function of x and time (e.g. 'size * sin(speed * x - time)' or 'a * x * x + b * x + c'). Can use variables: x, time, size, speed, and any slider control/output names."
          }
        ]
      }
    }
  }
}
`;

    let promptSuffix = '\n\n⚠️ IMPORTANT: If the topic involves graphs, waves, curves, projectile motion, functions, signals, or custom formulas (e.g. sin/cos wave, parabolas, linear equations, etc.), you MUST include a "graph" type element in "visual_mapping.elements" and provide a valid mathematical formula in "plotExpr" (e.g. "amplitude * sin(frequency * x - time)") so that a real interactive curve is plotted on the screen. Do NOT use "circle" or "rect" as a substitute for graph elements.\n\n⚠️ IMPORTANT FOR INTERACTIVE SIMULATIONS:\n- If the topic is a Mathematics topic, you MUST set "interactive_config" with type "geogebra" and provide the mathematical formula in the "query" field (e.g. "f(x) = sin(x)").\n- If the topic is a Physics topic, you MUST set "interactive_config" with type "phet" and provide the relevant simulator name in the "phet_url" field (e.g. "Ohm\'s Law", "Circuit Construction Kit: DC", "Wave Interference", "Bending Light", "Optics").\n- If the topic is a Chemistry topic, you MUST set "interactive_config" with type "chemistry" and provide the chemical reaction name in the "query" field.\n- Do NOT leave "interactive_config" null or empty for Math, Physics, or Chemistry topics!';
    if (forceLab) {
        promptSuffix += `\n\n⚠️ IMPORTANT: The student is explicitly launching a virtual lab simulator. You MUST force the intent to be "ask_doubt", detect the correct academic subject, and populate the "lab_config" field with a fully functional visual simulation config (appropriate slider controls, equations, and visual mapping) and Mermaid chart. Do NOT leave the lab_config field null!`;
    }

    // Retrieve dynamic self-learned neural memory
    let neuralInstructions = '';
    try {
        const cleanedMsg = message.replace(/\[Uploaded File:.*?\]/i, '').replace(/Extracted Content:.*?"""/is, '').trim();
        const words = cleanedMsg.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        
        const memoryRecords = await MinervaNeuralMemory.find({
            $or: [
                { topic: { $in: words } },
                { topic: new RegExp(cleanedMsg.substring(0, 30), 'i') }
            ]
        }).sort({ successCount: -1 }).limit(3).lean();

        if (memoryRecords && memoryRecords.length > 0) {
            neuralInstructions = `\n\n🧠 NEURAL LEARNED MEMORY (Past successful explanations/analogies to incorporate):\n` +
                memoryRecords.map((m: any) => `- Topic "${m.topic}": ${m.analogy}`).join('\n');
            console.log(`🧠 [Neural Learning] Injected ${memoryRecords.length} learned analogies from memory!`);
        }
    } catch (memErr) {
        console.error("Failed to query neural memory:", memErr);
    }

    const messages = [
        { role: 'system', content: systemPrompt + promptSuffix + neuralInstructions },
        ...history,
        { role: 'user', content: `Student message: "${message}"\nStudent Grade: ${studentProfile?.grade_level || 'unknown'}\nStudent Board: ${studentProfile?.board || 'unknown'}` }
    ];

    try {
        const demographicConfig = getDemographicConfig(studentProfile);
        const res = await getProviderResponse(messages, { 
            jsonMode: true, 
            maxTokens: demographicConfig.maxTokens, 
            temperature: demographicConfig.temperature 
        });
        const text = res?.choices?.[0]?.message?.content || '{}';
        const parsed = safeJsonParse(text) || {};

        const intent = parsed.intent || { intent: 'general_chat', confidence: 0.5 };
        const reply = parsed.reply || 'The server is currently busy or experiencing high traffic. Please try again in a few moments.';
        const suggestions = parsed.suggestions || [];
        const lab_config = parsed.lab_config || null;
        if (lab_config) {
            lab_config.auto_open = true;
            if (lab_config.sketchfab_query !== undefined) {
                lab_config.sketchfab_hint = lab_config.sketchfab_query;
            }
            const threeJsFn = THREE_JS_CONFIGS[lab_config.subject];
            const three_js_config = lab_config.simulation_config || (threeJsFn ? threeJsFn(message) : null);
            if (three_js_config) {
                lab_config.three_js_config = three_js_config;
            }
            if (lab_config.content_layers && lab_config.interactive_config && lab_config.interactive_config.type) {
                if (!lab_config.content_layers.includes('interactive')) {
                    lab_config.content_layers.push('interactive');
                }
            }
        }

        const finalMetadata: any = {};
        if (suggestions.length > 0) finalMetadata.suggestions = suggestions;
        if (lab_config) finalMetadata.lab_config = lab_config;

        return {
            intent,
            reply,
            content_type: 'text',
            metadata: Object.keys(finalMetadata).length > 0 ? finalMetadata : null
        };
    } catch (err) {
        console.error("Combined Minerva response failed, using fallback:", err);
        return {
            intent: { intent: 'general_chat', confidence: 0.5 },
            reply: 'The server is currently busy or experiencing high traffic. Please try again in a few moments.',
            content_type: 'text',
            metadata: null
        };
    }
};

export const appealExamGrading = async (
    question: string,
    expectedAnswer: string,
    studentAnswer: string,
    currentMarks: number,
    totalMarks: number,
    studentReason: string
): Promise<{ approved: boolean; new_marks: number; appeal_feedback: string }> => {
    const messages = [
        {
            role: 'system',
            content: `You are an expert, empathetic, and objective Academic Appeals Committee member.
A student has submitted an appeal regarding the grading of their exam question.
Analyze the details and determine if the appeal is valid. If the original AI grading was too harsh or missed valid points explained by the student, approve the appeal and award the correct marks (between 0 and totalMarks).
Otherwise, reject the appeal and explain why the original grading was correct.

Return ONLY a valid JSON object:
{
    "approved": true | false,
    "new_marks": number (must be >= currentMarks and <= totalMarks),
    "appeal_feedback": "Empathic, friendly Hinglish explanation of the decision (e.g. why marks were added, or why the original score is correct)."
}`
        },
        {
            role: 'user',
            content: `Question: "${question}"
Expected Answer: "${expectedAnswer}"
Student's Answer: "${studentAnswer}"
Currently Awarded Marks: ${currentMarks} / ${totalMarks}
Student's Reason for Appeal: "${studentReason}"`
        }
    ];

    try {
        const res = await getProviderResponse(messages, { jsonMode: true, maxTokens: 800, temperature: 0.3 });
        const text = res?.choices?.[0]?.message?.content || '{}';
        const parsed = safeJsonParse(text) || {};
        return {
            approved: parsed.approved === true,
            new_marks: Math.min(totalMarks, Math.max(currentMarks, Number(parsed.new_marks) || currentMarks)),
            appeal_feedback: parsed.appeal_feedback || 'Appeal processed.'
        };
    } catch (err) {
        console.error("AI Grading Appeal failed:", err);
        return {
            approved: false,
            new_marks: currentMarks,
            appeal_feedback: 'System connection error during grading appeal evaluation. Original marks maintained.'
        };
    }
};

export const getParentGuidanceTip = async (
    studentName: string,
    stats: {
        level: number;
        xp: number;
        totalSessions: number;
        completedSessions: number;
        totalNodes: number;
        completedNodes: number;
        totalExams: number;
        averageScore: number;
    }
): Promise<string> => {
    const messages = [
        {
            role: 'system',
            content: `You are an AI child education counselor.
Based on the child's academic performance statistics provided below, generate a personalized, warm, encouraging, and highly actionable study tip / guidance advice for their parent.
Keep it strictly under 100 words. Write in professional, friendly Hinglish (target audience is an Indian parent).`
        },
        {
            role: 'user',
            content: `Student Name: ${studentName}
Current Level: ${stats.level} (XP: ${stats.xp})
Learning Sessions: ${stats.completedSessions} completed out of ${stats.totalSessions} total
Curriculum Nodes: ${stats.completedNodes} mastered out of ${stats.totalNodes} total
Exams Attempted: ${stats.totalExams}
Average Exam Score: ${stats.averageScore}%`
        }
    ];

    try {
        const res = await getProviderResponse(messages, { maxTokens: 400, temperature: 0.7 });
        return res?.choices?.[0]?.message?.content?.trim() || "Encourage daily practice to reinforce key concepts.";
    } catch (err) {
        console.error("AI Parent Guidance generation failed:", err);
        return "Encourage daily practice to reinforce key concepts.";
    }
};

export const validateAndResolveSketchfabModel = async (rawQuery: string): Promise<any> => {
    const cleanQuery = rawQuery.trim().toLowerCase();
    if (!cleanQuery) return null;

    // Check cache first
    try {
        const cached = await MinervaSketchfabCache.findOne({ query: cleanQuery });
        if (cached) {
            console.log(`📦 [Sketchfab Cache Hit] Found cached resolution for "${cleanQuery}": "${cached.model_id}"`);
            if (!cached.is_3d_possible || !cached.model_id) return null;
            return {
                model_id: cached.model_id,
                name: cached.name,
                viewer_url: cached.viewer_url,
                thumbnail: cached.thumbnail
            };
        }
    } catch (cacheErr) {
        console.error("[Sketchfab Cache Lookup Error]", cacheErr);
    }

    // Step 1: Concept Extraction & 3D Relevance Check via LLM
    let is3dPossible = false;
    let englishConcept = '';
    let searchQuery = '';

    try {
        const conceptMessages = [
            {
                role: 'system',
                content: `You are an expert educational AI. Your job is to extract the core physical concept from the student's topic/sought term.
Analyze if the topic represents a physical biological structure, chemical compound/apparatus, physical mechanism, engine, celestial body, or machine that can be realistically represented by a 3D model on Sketchfab.
- Abstract topics (e.g. "democracy", "grammar", "philosophy", "calculus", "multiplication", general chat) CANNOT be represented as a 3D model. Set "is_3d_possible" to false.
- Concrete physical concepts (e.g. "human heart", "photosynthesis process plant cell", "internal combustion engine", "water molecule", "horse") CAN be represented as a 3D model. Set "is_3d_possible" to true.
- If target language is Hinglish, Hindi, Gujarati, or any other regional Indian language, translate it to its standard scientific English equivalent.

You MUST return ONLY valid JSON:
{
  "is_3d_possible": boolean,
  "english_concept": "standard scientific English name of the concept",
  "search_query": "optimized English search keywords for Sketchfab (2-4 words, e.g. 'horse anatomy', 'mitochondria organelle', 'car engine')"
}`
            },
            {
                role: 'user',
                content: `Topic query: "${cleanQuery}"`
            }
        ];

        const llmRes = await getProviderResponse(conceptMessages, { jsonMode: true, maxTokens: 250, temperature: 0.1 });
        const resText = llmRes?.choices?.[0]?.message?.content || '{}';
        const parsed = JSON.parse(resText);

        is3dPossible = !!parsed.is_3d_possible;
        englishConcept = parsed.english_concept || cleanQuery;
        searchQuery = parsed.search_query || englishConcept;

        console.log(`🤖 [Sketchfab Concept Extractor] Query: "${cleanQuery}" -> Concept: "${englishConcept}", 3D Possible: ${is3dPossible}`);

        if (!is3dPossible) {
            // Cache failure and return
            await MinervaSketchfabCache.create({
                query: cleanQuery,
                english_concept: englishConcept,
                is_3d_possible: false,
                model_id: null,
                validated: true
            }).catch(e => console.error("Cache save error:", e));
            return null;
        }
    } catch (err) {
        console.error("[Sketchfab Concept Extractor Error]", err);
        // Fallback: try search query anyway using raw query
        englishConcept = cleanQuery;
        searchQuery = cleanQuery;
        is3dPossible = true;
    }

    // Step 2: Fetch Candidates from Sketchfab API
    const candidatesMap = new Map<string, any>();
    try {
        const fetch = (await import('node-fetch')).default;
        
        // Fetch annotated results
        const annUrl = `https://api.sketchfab.com/v3/search?type=models&q=${encodeURIComponent(searchQuery + ' annotated')}`;
        const annRes = await fetch(annUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36' }
        });
        const annData: any = await annRes.json();
        if (annData?.results) {
            annData.results.forEach((item: any) => {
                if (item.uid && !item.isAgeRestricted) candidatesMap.set(item.uid, item);
            });
        }

        // Fetch general results
        const genUrl = `https://api.sketchfab.com/v3/search?type=models&q=${encodeURIComponent(searchQuery)}`;
        const genRes = await fetch(genUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36' }
        });
        const genData: any = await genRes.json();
        if (genData?.results) {
            genData.results.forEach((item: any) => {
                if (item.uid && !item.isAgeRestricted) candidatesMap.set(item.uid, item);
            });
        }
    } catch (apiErr) {
        console.error("[Sketchfab API Search Call Error]", apiErr);
    }

    const candidates = Array.from(candidatesMap.values()).slice(0, 5); // Limit to top 5 candidates for validation
    if (candidates.length === 0) {
        // Cache as no-model and return
        await MinervaSketchfabCache.create({
            query: cleanQuery,
            english_concept: englishConcept,
            is_3d_possible: true,
            model_id: null,
            validated: true
        }).catch(e => console.error("Cache save error:", e));
        return null;
    }

    // Step 3: AI Candidate Model Validator
    try {
        const candidateDetails = candidates.map(c => ({
            uid: c.uid,
            title: c.name || '',
            description: (c.description || '').substring(0, 150),
            tags: (c.tags || []).map((t: any) => t.name || t)
        }));

        const validatorMessages = [
            {
                role: 'system',
                content: `You are an expert Academic Model Validator. Your job is to select the absolute best, most accurate, non-fake educational/scientific 3D model for the concept.
Concept: "${englishConcept}"

Compare the search candidates below. Reject any models that are generic geometric shapes, game assets (e.g. fantasy weapons, toys, cartoons), furniture, unrelated products, or fake models.
The model must be a high-quality educational, biological, anatomical, physical, chemical, or mechanical model representing the concept.
If none of the candidates are a high-quality match, return "has_match": false.

Return ONLY valid JSON:
{
  "has_match": boolean,
  "best_model_uid": "the matching model's exact uid" | null,
  "reason": "short explanation of why it is valid or rejected"
}`
            },
            {
                role: 'user',
                content: `Candidates: ${JSON.stringify(candidateDetails)}`
            }
        ];

        const valRes = await getProviderResponse(validatorMessages, { jsonMode: true, maxTokens: 250, temperature: 0.1 });
        const valText = valRes?.choices?.[0]?.message?.content || '{}';
        const valParsed = JSON.parse(valText);

        if (valParsed.has_match && valParsed.best_model_uid) {
            const bestModel = candidates.find(c => c.uid === valParsed.best_model_uid);
            if (bestModel) {
                console.log(`✅ [Sketchfab AI Validator] Valid model found for "${englishConcept}": "${bestModel.name}" (UID: ${bestModel.uid})`);
                
                const cachedEntry = {
                    query: cleanQuery,
                    english_concept: englishConcept,
                    is_3d_possible: true,
                    model_id: bestModel.uid,
                    name: bestModel.name,
                    viewer_url: bestModel.viewerUrl,
                    thumbnail: bestModel.thumbnails?.images?.[0]?.url || null,
                    validated: true
                };

                await MinervaSketchfabCache.create(cachedEntry).catch(e => console.error("Cache save error:", e));

                return {
                    model_id: bestModel.uid,
                    name: bestModel.name,
                    viewer_url: bestModel.viewerUrl,
                    thumbnail: cachedEntry.thumbnail
                };
            }
        }
        
        console.log(`❌ [Sketchfab AI Validator] No suitable models matched the concept "${englishConcept}" out of candidates.`);
    } catch (valErr) {
        console.error("[Sketchfab Validation Step Error]", valErr);
    }

    // Cache failure if we reach here
    await MinervaSketchfabCache.create({
        query: cleanQuery,
        english_concept: englishConcept,
        is_3d_possible: true,
        model_id: null,
        validated: true
    }).catch(e => console.error("Cache save error:", e));

    return null;
};


