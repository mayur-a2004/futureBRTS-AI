import axios from 'axios';

// System Prompts
const SYSTEM_PROMPT_CHAT = `
You are an advanced AI Decision Support System for Futurebilder, designed to help Indian students architect their careers and projects.
Your Persona:
- **Indian Student-Friendly:** Use a relatable, encouraging tone. You can use occasional Hinglish nuances (e.g., "Samajh gaya", "Focus karna hai", "Start karein?") but keep the core advice professional and in English.
- **Architect, Not Checkbox:** Do not just give answers. Help the user build a "Mental Blueprint".
- **No Predictions:** Never say "You will succeed". Instead say "The probability of success increases if..." or "Trade-offs are...".

Strict Rules:
1. **Decision Support:** Always explain *Trade-offs* and *Probabilities*.
   - Example: "Option A is faster (3 months) but has shallower depth. Option B is slower (6 months) but better for placement."
2. **Never Create Roadmaps Unsolicited:** If the user talks about a goal, discuss the *plan* first. Only if they explicitly ask to "generate" or "create" the roadmap, or after you've agreed on a direction, guide them to the action.
3. **Structured Output:** Prefer bullet points, bold text for emphasis, and clear sections.
4. **Context Aware:** You are part of the 'Futurebilder' app. The user is in the 'Builder' interface.
`;

const SYSTEM_PROMPT_ROADMAP = `
You are a Roadmap Architect. Your goal is to generate a structured, step-by-step learning or project roadmap in strict JSON format.

Input: A user's goal or session summary.
Output: A JSON object with a 'steps' array.
Each step must have:
- stepNumber: number
- title: string (Concise)
- why: string (Rationale)
- whatToDo: string (Actionable instruction)
- expectedOutcome: string (Tangible result)
- risk: string (What could go wrong?)

The roadmap should have 4-6 distinct steps involving "Foundation", "Building", "Advanced Concepts", and "Outcome/Portfolio".
Ensure the content is tailored to the Indian tech market context where applicable (e.g., mentioning placement value, practical projects).
RETURN ONLY JSON. NO MARKDOWN.
`;

export const openaiService = {
    generateResponse: async (context: { title: string; lastMsg: string }, userMessage: string) => {
        const apiKey = process.env.GEMINI_API_KEY;

        // Fallback to Mock if no key
        if (!apiKey) {
            console.warn("GEMINI_API_KEY not found. Using Mock response.");
            return mockResponse(userMessage);
        }

        try {
            // Using Gemini 2.0 Flash for maximum speed as requested
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            const prompt = `${SYSTEM_PROMPT_CHAT}\n\nContext: Session Title: "${context.title}".\nUser says: "${userMessage}"`;

            const payload = {
                contents: [{
                    parts: [{ text: prompt }]
                }]
            };

            const res = await axios.post(url, payload, {
                headers: { 'Content-Type': 'application/json' }
            });

            const content = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
            return content || "Sorry, I couldn't process that. (Empty response from AI)";

        } catch (error: any) {
            console.error("Gemini API call failed:", error.response?.data || error.message);
            return mockResponse(userMessage); // Fallback on error
        }
    },

    generateRoadmapJSON: async (sessionContext: string) => {
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.warn("GEMINI_API_KEY not found. Using Mock Roadmap.");
            return mockRoadmapJSON();
        }

        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            const prompt = `${SYSTEM_PROMPT_ROADMAP}\n\nGenerate a roadmap for: ${sessionContext}`;

            const payload = {
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    response_mime_type: "application/json"
                }
            };

            const res = await axios.post(url, payload, {
                headers: { 'Content-Type': 'application/json' }
            });

            const text = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;

            // Cleanup just in case
            const jsonText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonText);

        } catch (error: any) {
            console.error("Gemini Roadmap Generation failed:", error.response?.data || error.message);
            return mockRoadmapJSON();
        }
    },

    generateArtifact: async (type: 'PDF' | 'PPT' | 'DOC', content: any) => {
        // Mock artifact generation kept as is for now
        return `http://mock-storage.futurebuilder.ai/artifacts/${type}_${Date.now()}.${type.toLowerCase()}`;
    }
};

// --- Mock Helpers ---

const mockResponse = (userMessage: string) => {
    const lowerMsg = userMessage.toLowerCase();

    if (lowerMsg.includes('roadmap') || lowerMsg.includes('plan')) {
        return "Start karein? I can help you design a blueprint for this. Note that creating a roadmap takes commitment. \n\n**Trade-offs:**\n- **Fast Track:** Quick learning but less depth (High risk of gaps).\n- **Comprehensive:** Takes 6 months+ but ensures job readiness (High success probability).\n\nShall I request the system to generate a draft based on the 'Comprehensive' path?";
    }
    else if (lowerMsg.includes('python') || lowerMsg.includes('java')) {
        return "Great choice. In the Indian market, Java still dominates enterprise (TCS, Infosys), while Python is king for Data Science and AI startups.\n\n**Probability:**\n- **Java:** 70% chance of service-based placement.\n- **Python:** 50% chance but higher package potential in product companies.\n\nKaunsa path better lag raha hai?";
    }
    else {
        return "Samajh gaya. Let's analyze this step-by-step. I am here to help you architect this, not just chat. \n\nCan you provide more details so I can give you a specific blueprint?";
    }
};

const mockRoadmapJSON = () => {
    return {
        steps: [
            {
                stepNumber: 1,
                title: "Foundation & Basics",
                why: "You need to understand the core concepts before moving forward.",
                whatToDo: "Complete a crash course or read official documentation.",
                expectedOutcome: "Solid grasp of syntax and basic structure.",
                risk: "Getting stuck in tutorial hell."
            },
            {
                stepNumber: 2,
                title: "First Project Build",
                why: "Application of knowledge is key.",
                whatToDo: "Build a Todo List or Weather App.",
                expectedOutcome: "A working artifact for your portfolio.",
                risk: "Over-complicating the MVP."
            },
            {
                stepNumber: 3,
                title: "Advanced Concepts",
                why: "To scale applications, you need better architecture.",
                whatToDo: "Learn State Management and Clean Architecture.",
                expectedOutcome: "Ability to build scalable apps.",
                risk: "Loss of motivation due to complexity."
            },
            {
                stepNumber: 4,
                title: "Market Ready Portfolio",
                why: "Proof of work is more important than credentials.",
                whatToDo: "Deploy full stack app to Vercel/AWS.",
                expectedOutcome: "Hireable portfolio link.",
                risk: "Imposter syndrome during deployment."
            }
        ]
    };
};
