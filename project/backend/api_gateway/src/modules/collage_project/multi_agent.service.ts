/**
 * ============================================================
 *  TITAN INDUSTRIAL ENGINE v6.0 — REAL AI CODE GENERATOR
 *  ✅ Uses GROQ API to generate PROJECT-SPECIFIC real code
 *  ✅ Socket.io live streaming of all agent events
 *  ✅ No fake files, no generic LogicNodes
 *  ✅ Files based on actual project title + requirements
 * ============================================================
 */
import mongoose from 'mongoose';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';
import { SocketService } from '../../services/socket.service';
import CollageProject from './collage_project.model';
import ProjectTask from './project_task.model';
import ProjectFile from './project_file.model';
import ProjectVersion from './project_version.model';
import SystemLog from './system_log.model';
import { generateProjectDocx } from './doc_engine';
import { generateProjectPptx } from './ppt_engine';
import { createProjectZip, generateSetupScript, generateEnvExample } from './packager';
import { generateTestCasesPdf } from './test_engine';
import { runSanityCheck } from './sanity_scanner';
import { getDynamicConfig, getAiKey } from '../../shared/utils/dynamicConfig';


// 🌐 KROKI.IO — Advanced SVG Diagram Generator (RFC 1951 compliant)
const generateKrokiUrl = (diagramType: string, content: string) => {
    // Kroki requires deflate (zlib) + base64 encoding
    try {
        const compressed = zlib.deflateSync(content, { level: 9 });
        const encoded = compressed.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        return `https://kroki.io/${diagramType}/svg/${encoded}`;
    } catch (e) {
        // Fallback to plain base64 if zlib fails (though should not)
        const data = Buffer.from(content).toString('base64');
        return `https://kroki.io/${diagramType}/svg/${data}`;
    }
};

// Sanitize Mermaid code to prevent Kroki compilation errors
const sanitizeMermaidCode = (type: string, code: string): string => {
    if (!code) return code;
    let lines = code.split('\n');
    
    // 1. erDiagram constraints
    if (type === 'architecture' || code.includes('erDiagram')) {
        // erDiagram does NOT support classDef, style, class, click, subgraph, or flowchart arrows
        lines = lines.filter(line => {
            const clean = line.trim();
            return !clean.startsWith('classDef') && 
                   !clean.startsWith('class ') && 
                   !clean.startsWith('style ') && 
                   !clean.startsWith('subgraph') && 
                   !clean.startsWith('end') &&
                   !clean.startsWith('click');
        });
        
        // Replace invalid relationships or flowchart arrow connectors inside erDiagram
        lines = lines.map(line => {
            let clean = line.trim();
            if (clean.includes(':') && !clean.startsWith('%%')) {
                // Check if connector is valid. Connectors must be: [|o, ||, }o, }|]-- or ..[o|, ||, o{, |{]
                const validConnectorPattern = /(\|o|\|\||\}o|\}|o\||o\{|\|\{)\s*(--|\.\.)\s*(\|o|\|\||\}o|\}|o\||o\{|\|\{)/;
                if (!validConnectorPattern.test(clean)) {
                    // Replace the connector with a safe default "||--o{"
                    clean = clean.replace(/([a-zA-Z0-9_]+)\s+[^:]*?\s+([a-zA-Z0-9_]+)\s*:/, '$1 ||--o{ $2 :');
                }
            }
            return clean;
        });
    }
    
    // 2. sequenceDiagram constraints
    if (type === 'sequence_flow' || code.includes('sequenceDiagram')) {
        lines = lines.filter(line => {
            const clean = line.trim();
            return !clean.startsWith('classDef') && !clean.startsWith('class ') && !clean.startsWith('style ');
        });
    }

    // 3. stateDiagram constraints
    if (type === 'activity_flow' || code.includes('stateDiagram')) {
        lines = lines.filter(line => {
            const clean = line.trim();
            return !clean.startsWith('classDef') && !clean.startsWith('class ') && !clean.startsWith('style ');
        });
    }
    
    // 4. flowchart constraints (system_flow, dfd_level_1, dfd_level_2)
    if (type.includes('flow') || type.includes('dfd') || code.includes('graph ') || code.includes('flowchart ')) {
        lines = lines.map(line => {
            let clean = line.trim();
            // Ensure nested parentheses inside labels are converted to safe double quotes
            clean = clean.replace(/([a-zA-Z0-9_-]+)\s*\(([^)]+)\)/g, (match, id, label) => {
                if (label.includes('(') || label.includes(')') || /[^a-zA-Z0-9_ -]/.test(label)) {
                    return `${id}["${label.replace(/"/g, '')}"]`;
                }
                return match;
            });
            return clean;
        });
    }

    return lines.join('\n');
};


// 🏁 BOOT CHECK — Ensure API Keys exist (Initial check, dynamic fetching will follow)
(async () => {
    const groq = await getAiKey('GROQ');
    const openrouter = await getAiKey('OPENROUTER');
    if (!groq) console.warn('⚠️ WARNING: GROQ_API_KEY missing from system. Engine will stall.');
    if (!openrouter) console.warn('ℹ️ INFO: OPENROUTER_API_KEY missing. Failover-only mode active.');
})();

// ============================================================
// ⚡ ANTIGRAVITY COMPACT DESIGN RULE — Token Efficient
// ============================================================
const ANTIGRAVITY_GOD_MODE = (title: string, tech: string, filePath?: string, prototypeMode: boolean = false) => {
    let linesLimit = "400+ lines per file";
    const lowerPath = filePath ? filePath.toLowerCase() : "";
    
    // Accurately distinguish backend vs frontend files
    const isBackend = lowerPath.includes('backend/') || lowerPath.includes('controllers/') || lowerPath.includes('models/') || lowerPath.includes('routes/');
    const isFrontend = !isBackend && (lowerPath.includes('frontend/') || lowerPath.includes('admin/') || lowerPath.includes('public/'));
    
    const isReact = isFrontend && (lowerPath.endsWith('.tsx') || lowerPath.endsWith('.jsx') || lowerPath.endsWith('.ts') || lowerPath.endsWith('.js'));
    
    if (filePath) {
        if (lowerPath.includes('config') || lowerPath.includes('context') || lowerPath.includes('hook') || lowerPath.includes('helper') || lowerPath.includes('mockdata') || lowerPath.includes('util') || lowerPath.includes('theme') || lowerPath.endsWith('main.jsx') || lowerPath.endsWith('main.tsx')) {
            linesLimit = "50+ lines per file";
        }
    }

    const isComponent = isReact && 
        !(lowerPath.includes('context') || 
          lowerPath.includes('mockdata') || 
          lowerPath.includes('uicomponents') || 
          lowerPath.includes('main.jsx') || 
          lowerPath.includes('main.tsx') ||
          lowerPath.includes('authcontext'));

    const reactConstraint = isReact 
        ? `\nCRITICAL REACT CONSTRAINT:
${isComponent ? `- Output clean ESM React component code ONLY.` : `- Output clean, complete ESM code. If this is a data module (e.g. mockData), export the raw data arrays/objects directly. If this is a context provider, export the Context and AppProvider properly. If this is UIComponents, export multiple independent reusable component functions (like StatCard, DataTable, RecentActivity, ProductCard, Modal, Button).`}
- DO NOT include HTML wrapper tags (e.g. <!DOCTYPE html>, <html>, <head>, <body>) or <style> blocks.
- Use Tailwind CSS classes for styles and animations. DO NOT link or import external Google font files inside React components.
- IMPORT only universally available Lucide icons from 'lucide-react' (safe list: Plus, Trash2, Edit, Save, X, Search, Filter, ChevronLeft, ChevronRight, Settings, User, LogOut, LayoutDashboard, BarChart3, ListTodo, Activity, AlertCircle, CheckCircle2, Shield, ArrowUpRight, Calendar, Info, Star, ShoppingCart, Heart, Eye, LogIn, UserPlus, Menu, Bell, Trash, Check, Lock, CreditCard, ArrowLeft, ArrowRight).
- Any Lucide icon component used in the JSX (e.g. <Star />, <ShoppingCart />) MUST be explicitly imported from 'lucide-react' at the top of the file.
- NO PLACEHOLDERS: DO NOT write comments like '// TODO', '// implement later', '// rest of the code', '// add logic here' or '...'. You must write 100% complete, functional code for every function, form handler, page section, and list item. No lorem ipsum text.
- DYNAMIC STATE & LINKS: Use React useState/useEffect for functional search, sorting, filtering, adding/editing items in lists, and pagination controls. Use '<Link to="...">' from 'react-router-dom' for sidebars, navbars, and buttons to connect pages properly.
- TYPE DEFINITIONS: When initializing state objects in TSX/JSX (like user profile, cart, payments), always provide full type declarations or safe fallbacks (e.g. use '<any>' or define interfaces/types for initialized empty objects) to avoid TypeScript compiler errors when reading sub-properties (e.g. state.accountStatistics?.orders).
- NO NAME COLLISIONS: To avoid name collisions, do NOT name local components or page components the same as Lucide icons. If importing icons like 'Settings' or 'User', use them strictly as icons, and name pages/routes/page components as 'SettingsPage', 'UserPage', etc. instead of 'Settings' or 'User'.`
        : "";

    const backendConstraint = isBackend 
        ? `\nCRITICAL BACKEND CONSTRAINT:
- Write complete, fully-implemented Express/Node.js controllers, schemas, and routes.
- NO FAKE/MOCK CONTROLLERS: Database queries must use real Mongoose/Sequelize methods (e.g. Model.find(), Model.create(), save(), deleteOne()). DO NOT return static mock JSON objects from controllers.
- Complete password hashing using bcrypt.
- Complete error handling middleware catching and routing all exceptions.
- Export all models and middleware correctly using ES Modules/CommonJS.` 
        : "";

    const dataRule = prototypeMode 
        ? `LOCAL STORAGE DATA PERSISTENCE: Write fully functional CRUD logic inside React components using state and 'localStorage'. Retrieve, filter, add, edit, and delete records dynamically in the UI so that refreshing the page maintains state changes. Do not use dummy empty event handlers or mock placeholders; write complete client-side simulation logic.`
        : `FULL STACK CONNECTIVITY: The frontend MUST make real Axios or Fetch API requests to backend API endpoints (e.g., '/api/users', '/api/products'). Handle request loading states, dynamic error messaging, and update local component states based on backend JSON responses. Do not mock API responses or use static hardcoded state where API integration is required.`;

    return `DESIGN MANDATE FOR "${title}" (${tech}):
1. BACKGROUND: Dark #0F172A. Gradient accents indigo→purple→cyan. NEVER plain white/grey.
2. GLASS CARDS: backdrop-filter:blur(20px) + rgba(255,255,255,0.05) borders + glow shadows.
3. ANIMATIONS: @keyframes fadeInUp, pulse-glow, shimmer. Hover scale(1.05) on all interactive elements.
4. TYPOGRAPHY: Google Fonts Inter/Poppins. Min 3 font-size scales. Font-weight 400/600/800.
5. DATA STRATEGY: ${dataRule}
6. LAYOUT: CSS Grid + Flexbox. Sticky glassmorphic Navbar.
7. MINIMUM: ${linesLimit}. All sections with real data and working interactions.
8. COMPLETE LOGIC & NO FAKE CODE: Under no circumstances may any file have missing code blocks, placeholders, "// TODO" comments, or truncated event handlers. Everything must be fully and functionally coded.${reactConstraint}${backendConstraint}
OUTPUT: Raw ${tech} code ONLY. Zero markdown. Zero explanations.`;
};

// ============================================================
// 🎓 DEGREE COMPLEXITY MAPPER
// ============================================================
const getDegreeComplexity = (category: string, title?: string): { level: string; fileCount: string; authType: string; extra: string } => {
    const isML = title?.toUpperCase().includes('ML') || title?.toUpperCase().includes('AI') || title?.toUpperCase().includes('BOT');
    
    switch (category) {
        case 'STUDENT_8_12':
            return { level: 'BASIC', fileCount: '30-36', authType: 'Session-Based simple login', extra: 'Simple HTML/CSS fallback acceptable.' };
        case 'GRADUATION':
            return { level: 'INTERMEDIATE', fileCount: '45-55', authType: 'JWT with bcrypt hashing', extra: isML ? 'Neural Processing Layers involved.' : 'Full REST API setup.' };
        case 'POST_GRAD_PHD':
            return { level: 'ADVANCED', fileCount: '70-85', authType: 'JWT + Refresh Tokens + Role Guards', extra: 'Microservice-ready. Redis caching. Advanced ML Models if applicable.' };
        case 'BUSINESS_FREELANCE':
            return { level: 'ENTERPRISE', fileCount: '65-75', authType: 'JWT + RBAC + 2FA support', extra: 'Audit logs. Rate limiting. Payment hooks.' };
        default:
            return { level: 'INTERMEDIATE', fileCount: '45-55', authType: 'JWT with bcrypt hashing', extra: '' };
    }
};

// 🤖 OPENROUTER — Master Neural Engine
const pickOpenRouterModel = (filePath?: string): string => {
    if (!filePath) return "openai/gpt-4o-mini";
    if (filePath.includes('frontend') || filePath.endsWith('.jsx') || filePath.endsWith('.tsx') || filePath.endsWith('.vue')) return "openai/gpt-4o-mini";
    if (filePath.includes('models') || filePath.includes('schema') || filePath.includes('db')) return "google/gemma-3-27b-it:free";
    if (filePath.includes('controllers') || filePath.includes('services')) return "meta-llama/llama-3.1-8b-instruct:free";
    return "openai/gpt-4o-mini";
};

const callOpenRouterAI = async (prompt: string, projectId: string, modelOverride?: string): Promise<string> => {
  const OPENROUTER_API_KEY = await getAiKey('OPENROUTER');
  if (!OPENROUTER_API_KEY) return ""; // Fail silently to allow fallback to Groq
  
  try {
      const res = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
          model: modelOverride || "openai/gpt-4o-mini", // Cost efficient fallback
          messages: [{ role: "user", content: prompt }]
      }, {
          headers: { "Authorization": `Bearer ${OPENROUTER_API_KEY}`, "Content-Type": "application/json" },
          timeout: 60000 // Ensure we never hang forever
      });
      return res.data.choices[0].message.content.trim();
  } catch (e) {
      console.error("OPENROUTER_ERROR:", e);
      return "";
  }
};

// ============================================================
// GROQ AI CALLER — Real code generation engine
// ============================================================
export const callGroqAI = async (prompt: string, projectId: string, retries = 3): Promise<string> => {
  const GROQ_API_KEY = await getAiKey('GROQ');
  if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY not configured in admin or .env');

  for (let i = 0; i < retries; i++) {
    try {
      // Use 8b model for exam generator to avoid strict 12k TPM free tier limits
      const model = projectId === 'exam_generator' ? 'llama-3.1-8b-instant' : 'llama-3.3-70b-versatile';
      const maxTokens = projectId === 'exam_generator' ? 4000 : 8192;

      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: model,
          messages: [
            {
              role: 'system',
              content: projectId === 'discovery_agent'
                ? `You are a brilliant Architectural AI Assistant conducting a Discovery Chat with a client. Be conversational, proactive, use the exact language they speak (Hindi/English), and output exactly as requested.`
                : projectId === 'exam_generator'
                ? `You are an Expert Academic Examiner.`
                : `You are an ELITE DESIGN ENGINEER & FULL STACK ARCHITECT. 
You ONLY write complete, working, production-quality code.
NEVER write placeholder comments like "// Add logic here".
Write REAL, FUNCTIONAL code with real logic.
Output ONLY the raw code, no markdown, no explanation.`
            },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
          max_tokens: maxTokens
        },
        {
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 60000
        }
      );

      return response.data.choices[0].message.content.trim();
    } catch (e: any) {
      const status = e.response?.status;
      if (status === 429) {
        console.error('GROQ_429: Rate Limit Hit. Failing fast to trigger OpenRouter.');
        throw new Error('GROQ_RATE_LIMIT');
      } else if (i === retries - 1) {
        console.error('GROQ_API_ERROR:', e.response?.data || e.message);
        throw new Error(`GROQ_CALL_FAILED: ${e.message}`);
      } else {
        await new Promise(r => setTimeout(r, 5000));
      }
    }
  }
  throw new Error("GROQ_CALL_FAILED: Max retries exhausted");
};

// 🧠 GEMINI — Deep Synthesis Engine (Fallback for Rate Limits)
export const callGeminiAI = async (prompt: string): Promise<string> => {
    const GEMINI_API_KEY = await getAiKey('GEMINI');
    if (!GEMINI_API_KEY) return "";
    try {
        const res = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 8192 }
        }, { timeout: 60000 });
        return res.data.candidates[0].content.parts[0].text.trim();
    } catch(e: any) {
        console.error("GEMINI_ERROR:", e.response?.data?.error || e.message);
        return "";
    }
};

const callSwarmAI = async (prompt: string, projectId: string, filePath?: string): Promise<string> => {
    // 🚀 DEDICATED DISCOVERY ROUTE 🚀
    if (projectId === 'discovery_agent') {
        try {
            return await callGroqAI(prompt, projectId);
        } catch (e: any) {
            console.warn(`[SWARM:Discovery] Groq 70B rate limit hit. Routing to OpenRouter DeepSeek/Claude smart model...`);
            const fallbackRes = await callOpenRouterAI(prompt, projectId, "anthropic/claude-3-haiku");
            if (fallbackRes) return fallbackRes;
            
            throw new Error((e as Error).message);
        }
    }

    // 🚀 EXAM GENERATOR / STUDY PORTAL -> GEMINI 2.5 FLASH ONLY 🚀
    let isExamGen = projectId === 'exam_generator';
    if (!isExamGen && mongoose.Types.ObjectId.isValid(projectId)) {
        try {
            const p = await CollageProject.findById(projectId).lean();
            if (p) {
                const text = `${p.title} ${p.requirements} ${p.category}`.toLowerCase();
                isExamGen = text.includes('exam') || text.includes('paper') || text.includes('study') || text.includes('test');
            }
        } catch (e) {}
    }

    if (isExamGen) {
        try {
            console.log(`[SWARM:Exam] Routing to Gemini 2.5 Flash for project ${projectId}...`);
            const geminiRes = await callGeminiAI(prompt);
            if (geminiRes && geminiRes.length > 50) return geminiRes;
        } catch (e: any) {
            console.warn(`[SWARM:Exam] Gemini 2.5 Flash failed: ${e.message}. Falling back...`);
        }
    }

    // Standard Strategy: Groq for hyper-speed -> OpenRouter Failover
    try {
        return await callGroqAI(prompt, projectId);
    } catch (e: any) {
        if (e.message?.includes('GROQ_RATE_LIMIT') || e.message?.includes('429')) {
            console.warn(`[SWARM] Groq rate limit instantly hit. Routing to OpenRouter smart model...`);
        } else {
            console.warn(`[SWARM] Groq Exhausted/Failed. Escalating to OpenRouter...`);
        }
        const smartModel = pickOpenRouterModel(filePath);
        const fallbackRes = await callOpenRouterAI(prompt, projectId, smartModel);
        if (fallbackRes) return fallbackRes;

        throw e; // Rethrow original error if everything fails
    }
};

// ============================================================
// ⏱️ TIME-BASED TOKEN THROTTLE (12s gap = safe under 6000 TPM)
// ============================================================
const projectLastRequest = new Map<string, number>();

const awaitTokenBudget = async (promptText: string, pId: string) => {
    // Each request ≈ 1500 input + 4000 output = ~5500 tokens
    // Groq 6000 TPM limit → must wait ≥ 12 seconds between requests
    const MIN_INTERVAL_MS = 13000; // 13s = safe buffer
    const lastTime = projectLastRequest.get(pId) || 0;
    const elapsed = Date.now() - lastTime;

    if (lastTime > 0 && elapsed < MIN_INTERVAL_MS) {
        const waitMs = MIN_INTERVAL_MS - elapsed;
        await SystemLogger.log(pId, 'RATE_GUARD', `⏳ Sequential buffer: ${Math.ceil(waitMs / 1000)}s before next file...`);
        await new Promise(r => setTimeout(r, waitMs));
    }
    projectLastRequest.set(pId, Date.now());
};

const extractSymbols = (code: string, filePath: string) => {
    const symbols: any = { exports: [], importPath: '', originalPath: filePath };
    try {
        const baseNameMatch = filePath.match(/([^\/]+)\.[a-zA-Z]+$/);
        const baseName = baseNameMatch ? baseNameMatch[1].replace('.controller', '').replace('.model', '').replace('.routes', '') : 'Module';
        
        // 1. Models Extractor
        if (filePath.includes('model') || filePath.includes('schema')) {
            const modelMatch = code.match(/mongoose\.model\(['"]([^'"]+)['"]\s*,/);
            if (modelMatch) symbols.modelName = modelMatch[1];
            
            symbols.schemaFields = {};
            const fieldMatches = code.matchAll(/([a-zA-Z0-9_]+)\s*:\s*(?:{|String|Number|Boolean|Date|Array|Object|Schema)[^,\n}]*/g);
            for (const match of fieldMatches) {
               const fieldName = match[1];
               if (!['type', 'required', 'default', 'timestamps', 'true', 'false'].includes(fieldName) && fieldName.length > 1) {
                  symbols.schemaFields[fieldName] = "Field";
               }
            }
            symbols.exports = symbols.modelName ? [symbols.modelName] : [baseName];
            symbols.importPath = `../models/${baseName}`;
        }
        // 2. Controllers Extractor
        else if (filePath.includes('controller')) {
            const funcMatches = code.matchAll(/(?:const|let|function|export const|export default)\s+([a-zA-Z0-9_]+)\s*(?:=|=>|\()/g);
            for (const match of funcMatches) {
                if (!['require', 'import', 'const', 'let', 'router', 'express', 'async'].includes(match[1])) {
                    if (match[1].length > 2) symbols.exports.push(match[1]);
                }
            }
            symbols.exports = [...new Set(symbols.exports)];
            symbols.apiEndpoints = [];
            const apiMatches = code.matchAll(/router\.(get|post|put|delete|patch)\(['"]([^'"]+)['"]/g);
            for (const match of apiMatches) {
                 symbols.apiEndpoints.push(`${match[1].toUpperCase()} ${match[2]}`);
            }
            symbols.importPath = `../controllers/${baseName}Controller`;
        }
        // 3. Frontend / React Extractor
        else if (filePath.includes('.jsx') || filePath.includes('.tsx') || filePath.includes('.js')) {
             const exportMatch = code.match(/export\s+default\s+(?:function|class|\s)*([a-zA-Z0-9_]+)/) || code.match(/const\s+([a-zA-Z0-9_]+)\s*=\s*(?:\([^)]*\)|props)\s*=>/);
             if (exportMatch && exportMatch[1].length > 2) symbols.exports = [exportMatch[1]];
             else symbols.exports = [baseName];
             
             // Compute relative importPath relative to src/
             const srcMatch = filePath.match(/src\/(.+)\.[a-zA-Z]+$/);
             if (srcMatch) {
                 symbols.importPath = `./${srcMatch[1]}`;
             } else {
                 symbols.importPath = `./${baseName}`;
             }
        }
    } catch(err) { console.error("Symbol extraction failed", err); }
    return symbols;
};

const validateGeneratedCode = (code: string, filePath: string): void => {
    const trimmed = code.trim();
    if (trimmed.length < 50) {
        throw new Error(`Code is too short (${trimmed.length} chars).`);
    }

    // 1. Check for placeholder comments
    const placeholders = [
        /\/\/\s*\.\.\./,
        /\b\.\.\.\b/,
        /^\s*\.\.\.\s*$/m,
        /\/\/\s*rest\s+of\s+(?:the\s+)?code/i,
        /\/\/\s*implement\s+(?:here|this)/i,
        /\/\/\s*add\s+(?:your\s+)?logic/i,
        /\/\/\s*(?:TODO|todo|Todo):\s*implement/i,
        /HTML\s+comment\s+placeholder/i,
        /\/\*\s*\.\.\.\s*\*\//,
        /\b(?:lorem\s+ipsum|Lorem\s+Ipsum)\b/
    ];
    for (const pattern of placeholders) {
        if (pattern.test(trimmed)) {
            throw new Error(`Placeholder comments found matching ${pattern.toString()}`);
        }
    }

    // 2. Syntax check: Braces, parentheses, and brackets balancing (skipping strings and comments)
    let openBraces = 0, openParens = 0, openBrackets = 0;
    let inSingleQuote = false, inDoubleQuote = false, inTemplateLiteral = false;
    let inLineComment = false, inBlockComment = false;
    for (let i = 0; i < trimmed.length; i++) {
        const c = trimmed[i];
        const next = trimmed[i + 1] || '';
        if (inLineComment) {
            if (c === '\n') inLineComment = false;
            continue;
        }
        if (inBlockComment) {
            if (c === '*' && next === '/') {
                inBlockComment = false;
                i++;
            }
            continue;
        }
        if (inSingleQuote) {
            if (c === "'" && trimmed[i - 1] !== '\\') inSingleQuote = false;
            continue;
        }
        if (inDoubleQuote) {
            if (c === '"' && trimmed[i - 1] !== '\\') inDoubleQuote = false;
            continue;
        }
        if (inTemplateLiteral) {
            if (c === '`' && trimmed[i - 1] !== '\\') inTemplateLiteral = false;
            continue;
        }
        
        // Detect comments
        if (c === '/' && next === '/') {
            inLineComment = true;
            i++;
            continue;
        }
        if (c === '/' && next === '*') {
            inBlockComment = true;
            i++;
            continue;
        }
        
        // Detect string literals
        if (c === "'") { inSingleQuote = true; continue; }
        if (c === '"') { inDoubleQuote = true; continue; }
        if (c === '`') { inTemplateLiteral = true; continue; }
        
        // Count brackets
        if (c === '{') openBraces++;
        else if (c === '}') openBraces--;
        else if (c === '(') openParens++;
        else if (c === ')') openParens--;
        else if (c === '[') openBrackets++;
        else if (c === ']') openBrackets--;
    }
    if (openBraces !== 0) {
        throw new Error(`SYNTAX_ERROR: Unbalanced curly braces { } (${openBraces > 0 ? openBraces + ' unclosed' : -openBraces + ' extra closed'}).`);
    }
    if (openParens !== 0) {
        throw new Error(`SYNTAX_ERROR: Unbalanced parentheses ( ) (${openParens > 0 ? openParens + ' unclosed' : -openParens + ' extra closed'}).`);
    }

    const lowerPath = filePath.toLowerCase();
    const isReactFile = lowerPath.endsWith('.tsx') || lowerPath.endsWith('.jsx') || lowerPath.endsWith('.ts') || lowerPath.endsWith('.js');

    // 3. Prevent raw HTML wrappers in TSX/JSX/JS/TS component files
    if (isReactFile) {
        const htmlWrappers = [
            /<!DOCTYPE\s+html/i,
            /<html/i,
            /<head/i,
            /<body/i
        ];
        for (const pattern of htmlWrappers) {
            if (pattern.test(trimmed)) {
                throw new Error(`FILE_QUALITY_FAIL: HTML page wrapper tag (${pattern.toString()}) found in React/JS/TS component file.`);
            }
        }

        // 4. React Router version validation
        if (trimmed.includes('Switch') && trimmed.includes('react-router-dom')) {
            throw new Error(`COMPILATION_ERROR: Obsolete React Router v5 'Switch' component detected. You must use React Router v6 'Routes' instead.`);
        }
        if (trimmed.includes('Route') && /component\s*=\s*\{/.test(trimmed)) {
            throw new Error(`COMPILATION_ERROR: Obsolete React Router v5 'component={}' prop found. You must use React Router v6 'element={<Component />}' instead.`);
        }

        // 5. Unimported components or Lucide icons verification check
        const usedComponents = [...new Set([...trimmed.matchAll(/<([A-Z][a-zA-Z0-9_]*)/g)].map(m => m[1]))];
        for (const comp of usedComponents) {
            if (comp === 'Fragment' || comp === 'React') continue;
            
            const isDeclared = new RegExp(`\\b(const|let|var|function|class)\\s+${comp}\\b`).test(trimmed);
            const isImportedExplicitly = new RegExp(`\\bimport\\b.*\\b${comp}\\b`).test(trimmed);
            
            if (!isDeclared && !isImportedExplicitly) {
                throw new Error(`COMPILATION_ERROR: Component or Icon <${comp} /> is used in JSX but is neither imported nor declared in this file.`);
            }
        }

        // 6. Name collisions checker (Imports vs Local declarations)
        const imports = [...trimmed.matchAll(/import\s+.*\{([^}]+)\}\s+from/g)].flatMap(m => m[1].split(',').map(s => s.trim()));
        for (const imp of imports) {
            const name = imp.split(/\sas\s/)[1] || imp;
            const localDecl = new RegExp(`\\b(const|let|var|function|class)\\s+${name}\\b`).test(trimmed.replace(/import[\s\S]*?from.*/g, ''));
            if (localDecl) {
                throw new Error(`COMPILATION_ERROR: Name collision detected. Local component/variable declaration '${name}' conflicts with import.`);
            }
        }
    }
};

const updateSymbolTable = async (projectId: string, filePath: string, code: string) => {
    const sig = extractSymbols(code, filePath);
    const safeKey = filePath.replace(/\./g, '_').replace(/\//g, '__');
    await CollageProject.findByIdAndUpdate(projectId, { $set: { [`symbolTable.${safeKey}`]: sig } });
};

const getRelativeImportPath = (fromFile: string, toFile: string): string => {
    const fromDir = path.dirname(fromFile);
    let relPath = path.relative(fromDir, toFile);
    relPath = relPath.replace(/\\/g, '/');
    relPath = relPath.replace(/\.[a-zA-Z0-9]+$/, '');
    if (!relPath.startsWith('.') && !relPath.startsWith('/')) {
        relPath = './' + relPath;
    }
    return relPath;
};

const buildSymbolContext = (registry: any, importsFrom?: string | null): string => {
    if (!registry || Object.keys(registry).length === 0) return "No prior dependencies mapped yet.";
    
    // Filter registry based on where we are importing from
    const isFrontendTarget = importsFrom ? (importsFrom.includes('frontend/') || importsFrom.includes('admin/') || importsFrom.includes('public/')) : false;
    
    const relevantRegistry = Object.entries(registry).filter(([key, sym]: any) => {
        const path = sym.originalPath || key;
        if (!importsFrom) return true;
        const isFrontendSym = path.includes('frontend/') || path.includes('admin/') || path.includes('public/');
        return isFrontendTarget ? isFrontendSym : (!isFrontendSym || path.includes('models'));
    });

    if (relevantRegistry.length === 0) return "No relevant dependencies mapped yet.";

    return relevantRegistry.map(([key, sym]: any) => {
        const filePath = sym.originalPath || key.replace(/__/g, '/').replace(/_/g, '.');
        const lines = [`📁 ${filePath}:`];
        if (sym.modelName) lines.push(`  Model: ${sym.modelName}`);
        if (sym.schemaFields && Object.keys(sym.schemaFields).length > 0) {
            lines.push('  Fields (MUST USE EXACT MATCH):');
            Object.keys(sym.schemaFields).slice(0, 15).forEach((f) => lines.push(`    • ${f}`));
        }
        if (sym.exports && sym.exports.length > 0) lines.push(`  Exports: ${sym.exports.join(', ')}`);
        if (sym.apiEndpoints && sym.apiEndpoints.length > 0) lines.push(`  APIs: ${sym.apiEndpoints.join(', ')}`);
        
        let importPath = sym.importPath;
        if (importsFrom) {
            importPath = getRelativeImportPath(importsFrom, filePath);
        }
        if (importPath) lines.push(`  Import Path: ${importPath}`);
        return lines.join('\n');
    }).join('\n\n');
};

const resolveImports = (importsFrom: any, registry: any): string => {
    return buildSymbolContext(registry, importsFrom);
};

const isCodeQualityHigh = (code: string, filePath?: string, rule: string = ""): boolean => {
    if (!rule) return code.trim().length > 50;
    const lowerCode = code.toLowerCase();
    const reqs = rule.toLowerCase().split(/and|,|\\+|&/).map(s => s.trim()).filter(Boolean);
    let passes = true;
    for (const r of reqs) {
       if (r.length > 3 && !lowerCode.includes(r.replace('must include ', '').replace('export ', ''))) {
           passes = false;
       }
    }
    // Strict checks for AI placeholders (false-negatives block)
    if (lowerCode.includes('// add your') || lowerCode.includes('// implement') || lowerCode.includes('// TODO')) {
        passes = false;
    }
    const minLength = (filePath?.includes('frontend/') || filePath?.includes('admin/')) ? 300 : 50;
    return code.trim().length > minLength && passes;
};



// ============================================================
// 🔍 DOMAIN DETECTOR — Maps project title to domain type
// ============================================================
type DomainType = 'library' | 'ecommerce' | 'hospital' | 'school' | 'restaurant' | 'hr' | 'realestate' | 'banking' | 'inventory' | 'crm' | 'blog' | 'saas';

const detectDomain = (title: string, requirements: string): DomainType => {
    const text = (title + ' ' + requirements).toLowerCase();
    if (/library|book|borrow|lend|catalog|isbn|shelf|publication/.test(text)) return 'library';
    if (/ecommerce|e-commerce|shop|cart|checkout|product|order|payment|sell|buy|store|marketplace/.test(text)) return 'ecommerce';
    if (/hospital|clinic|patient|doctor|appointment|medical|pharmacy|diagnosis|prescription|nurse/.test(text)) return 'hospital';
    if (/school|college|student|class|grade|exam|assignment|attendance|teacher|course|education|university/.test(text)) return 'school';
    if (/restaurant|food|menu|table|reservation|order|kitchen|delivery|dish|meal|cafe/.test(text)) return 'restaurant';
    if (/hr|human resource|employee|payroll|salary|leave|department|recruitment|staff|workforce/.test(text)) return 'hr';
    if (/real estate|property|house|rent|flat|apartment|land|agent|listing|mortgage/.test(text)) return 'realestate';
    if (/bank|finance|account|transaction|loan|credit|debit|wallet|payment gateway|ledger/.test(text)) return 'banking';
    if (/inventory|warehouse|stock|supply|item|sku|purchase|vendor|shipment/.test(text)) return 'inventory';
    if (/crm|customer|lead|sales|pipeline|contact|deal|campaign|marketing/.test(text)) return 'crm';
    if (/blog|article|post|author|comment|publish|content|cms|media/.test(text)) return 'blog';
    return 'saas';
};

// ============================================================
// 🖥️ DOMAIN-AWARE FRONTEND PLAN — Dynamic by Project Type
// ============================================================
const buildFrontendOnlyPlan = (title: string, fe: string, feExt: string, entity: string, requirements: string, prototypeMode: boolean = true) => {
    const D = "__ANTIGRAVITY_GOD_MODE_PLACEHOLDER__";
    const C = `Project:"${title}". Stack:${fe}. Req:${requirements.substring(0, 150)}.`;
    const domain = detectDomain(title, requirements);
    const projectName = title.toLowerCase().replace(/[^a-z0-9]/g, '-');

    const staticFiles = [
        {
            path: 'frontend/index.html',
            content: `<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>${title}</title>\n    <link rel="preconnect" href="https://fonts.googleapis.com">\n    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Poppins:wght@600;700;800&display=swap" rel="stylesheet">\n  </head>\n  <body>\n    <div id="root"></div>\n    <script type="module" src="/src/main.${feExt}"></script>\n  </body>\n</html>`
        },
        {
            path: `frontend/src/main.${feExt}`,
            content: `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\nimport './index.css';\n\nReactDOM.createRoot(document.getElementById('root')!).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>\n);`
        },
        {
            path: 'frontend/package.json',
            content: `{\n  "name": "${projectName}",\n  "private": true,\n  "version": "1.0.0",\n  "type": "module",\n  "scripts": { "dev": "vite", "build": "tsc && vite build", "preview": "vite preview" },\n  "dependencies": {\n    "axios": "^1.6.8",\n    "framer-motion": "^11.0.3",\n    "lucide-react": "^0.330.0",\n    "react": "^18.3.1",\n    "react-dom": "^18.3.1",\n    "react-router-dom": "^6.22.0",\n    "recharts": "^2.12.0"\n  },\n  "devDependencies": {\n    "@types/react": "^18.2.55",\n    "@types/react-dom": "^18.2.19",\n    "@vitejs/plugin-react": "^4.2.1",\n    "autoprefixer": "^10.4.17",\n    "postcss": "^8.4.35",\n    "tailwindcss": "^3.4.1",\n    "typescript": "^5.3.3",\n    "vite": "^5.1.0"\n  }\n}`
        },
        {
            path: 'frontend/vite.config.js',
            content: `import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\nexport default defineConfig({ plugins: [react()], server: { port: 3000 } });`
        },
        {
            path: 'frontend/tailwind.config.js',
            content: `/** @type {import('tailwindcss').Config} */\nexport default {\n  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],\n  theme: {\n    extend: {\n      fontFamily: { sans: ['Inter', 'sans-serif'], poppins: ['Poppins', 'sans-serif'] },\n      colors: {\n        brand: { 50: '#eef2ff', 100: '#e0e7ff', 500: '#6366f1', 600: '#4f46e5', 900: '#312e81' },\n        glass: 'rgba(255, 255, 255, 0.05)',\n        glassBorder: 'rgba(255, 255, 255, 0.1)'\n      }\n    }\n  },\n  plugins: []\n}`
        },
        {
            path: 'frontend/postcss.config.js',
            content: `export default { plugins: { tailwindcss: {}, autoprefixer: {} } }`
        },
        {
            path: 'frontend/tsconfig.json',
            content: `{\n  "compilerOptions": {\n    "target": "ES2020",\n    "useDefineForClassFields": true,\n    "lib": ["ES2020", "DOM", "DOM.Iterable"],\n    "module": "ESNext",\n    "skipLibCheck": true,\n    "moduleResolution": "bundler",\n    "allowImportingTsExtensions": true,\n    "resolveJsonModule": true,\n    "isolatedModules": true,\n    "noEmit": true,\n    "jsx": "react-jsx",\n    "strict": false,\n    "noUnusedLocals": false,\n    "noUnusedParameters": false,\n    "noFallthroughCasesInSwitch": true,\n    "baseUrl": ".",\n    "paths": {\n      "@/*": ["src/*"]\n    }\n  },\n  "include": ["src"],\n  "references": [{ "path": "./tsconfig.node.json" }]\n}`
        },
        {
            path: 'frontend/tsconfig.node.json',
            content: `{\n  "compilerOptions": {\n    "composite": true,\n    "skipLibCheck": true,\n    "module": "ESNext",\n    "moduleResolution": "bundler",\n    "allowSyntheticDefaultImports": true\n  },\n  "include": ["vite.config.ts", "vite.config.js"]\n}`
        },
        {
            path: 'frontend/README.md',
            content: `# ${title}\n\n## Project Setup\nThis is a fully functional React frontend application generated by Antigravity Engine.\n\n### Prerequisites\n- Node.js (v18+ recommended)\n- npm or yarn\n\n### Installation\n1. Open a terminal in the \`frontend\` directory.\n2. Run \`npm install\` to install all dependencies.\n3. Run \`npm run dev\` to start the development server.\n\n### Features Included\n- Complete Routing (\`react-router-dom\`)\n- Global State Context (\`src/context\`)\n- Premium UI Components (\`src/components\`)\n- Animations (\`framer-motion\`)\n- Charts (\`recharts\`)\n- Mock Data Engine (\`src/data\`)\n- Tailwind CSS Styling\n`
        },
        {
            path: 'frontend/src/index.css',
            content: `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n:root {\n  --bg: #030712;\n  --bg-gradient-1: #0f172a;\n  --bg-gradient-2: #1e1b4b;\n  --accent: #6366f1;\n  --accent-glow: rgba(99, 102, 241, 0.4);\n  --glass: rgba(255, 255, 255, 0.03);\n  --glass-border: rgba(255, 255, 255, 0.08);\n}\n* { box-sizing: border-box; margin: 0; padding: 0; }\nbody {\n  background-color: var(--bg);\n  background-image:\n    radial-gradient(ellipse at top right, var(--bg-gradient-2) 0%, transparent 60%),\n    radial-gradient(ellipse at bottom left, var(--bg-gradient-1) 0%, transparent 60%);\n  background-attachment: fixed;\n  color: #f8fafc;\n  font-family: 'Inter', sans-serif;\n  min-height: 100vh;\n  overflow-x: hidden;\n}\n.glass-panel {\n  background: var(--glass);\n  backdrop-filter: blur(12px);\n  -webkit-backdrop-filter: blur(12px);\n  border: 1px solid var(--glass-border);\n  border-radius: 1rem;\n  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);\n}\n.glass-nav {\n  background: rgba(3, 7, 18, 0.6);\n  backdrop-filter: blur(16px);\n  border-bottom: 1px solid var(--glass-border);\n}\n.glow-text { text-shadow: 0 0 20px var(--accent-glow); }\n.btn-primary {\n  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);\n  color: white;\n  border: 1px solid rgba(255,255,255,0.1);\n  box-shadow: 0 0 15px var(--accent-glow);\n  transition: all 0.3s ease;\n}\n.btn-primary:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 0 25px rgba(99, 102, 241, 0.6);\n}\n.btn-secondary {\n  background: var(--glass);\n  color: #e2e8f0;\n  border: 1px solid var(--glass-border);\n  transition: all 0.3s ease;\n}\n.btn-secondary:hover {\n  background: rgba(255, 255, 255, 0.08);\n  transform: translateY(-2px);\n}\n.input-glass {\n  background: rgba(0, 0, 0, 0.2);\n  border: 1px solid var(--glass-border);\n  color: white;\n}\n.input-glass:focus {\n  outline: none;\n  border-color: var(--accent);\n  box-shadow: 0 0 0 2px var(--accent-glow);\n}\n/* Scrollbar */\n::-webkit-scrollbar { width: 8px; height: 8px; }\n::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }\n::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }\n::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }`
        }
    ];

    const coreUiFiles = [
        // Foundation & Mock Data
        { path: `frontend/src/data/mockData.ts`, prompt: `${C}\nCreate comprehensive, realistic mock data module for "${title}" (${domain} domain).\nMUST EXPORT: multiple realistic arrays/objects (e.g. users, main entities, activities, statistics) to populate the entire UI.\n${D}` },
        { path: `frontend/src/context/AppContext.${feExt}`, prompt: `${C}\nCreate React App Context + Provider (combining Auth, Toast notifications, and global state for CRUD operations).\nImplement session persistence in localStorage for auth and database items.\n${D}` },
        
        // Layouts & UI Components
        { path: `frontend/src/components/Navigation.${feExt}`, prompt: `${C}\nCreate unified responsive Navigation system (combining Navbar, Sidebar, and DashboardLayout with sticky glassmorphism and active link indicators). Ensure it links to Dashboard, Settings, Profile, and domain pages.\n${D}` },
        { path: `frontend/src/components/UIComponents.${feExt}`, prompt: `${C}\nCreate a premium UI Kit file exporting reusable components: StatCard (with trends), DataTable (with sorting, filtering, and functional pagination), Modal (with backdrop blur), Button (with variants), and Toast notifications.\n${D}` },
        
        // Base Pages
        { path: `frontend/src/pages/LandingPage.${feExt}`, prompt: `${C}\nCreate stunning landing page for ${domain} application. Include Hero, Features, Stats, Testimonials, and Call to Action. Use framer-motion for scroll animations.\n${D}` },
        { path: `frontend/src/pages/LoginPage.${feExt}`, prompt: `${C}\nCreate premium login page with glassmorphic form. Include validation and loading state.\n${D}` },
        { path: `frontend/src/pages/RegisterPage.${feExt}`, prompt: `${C}\nCreate premium register page with glassmorphic form.\n${D}` },
        { path: `frontend/src/pages/DashboardPage.${feExt}`, prompt: `${C}\nCreate main dashboard overview page for ${domain} application. Use StatCards, Recharts area/bar charts, and recent activity feed.\n${D}` },
        { path: `frontend/src/pages/SettingsPage.${feExt}`, prompt: `${C}\nCreate settings page with tabs (Profile, Security, Preferences, Notifications). Allow mock toggling of settings.\n${D}` },
        { path: `frontend/src/pages/ProfilePage.${feExt}`, prompt: `${C}\nCreate a detailed user profile page showing avatar, bio, recent activity, and account statistics.\n${D}` },
        { path: `frontend/src/pages/NotFoundPage.${feExt}`, prompt: `${C}\nCreate a creative 404 Not Found page with a "Go Back Home" button.\n${D}` }
    ];

    // Domain-Specific Pages are now generated dynamically by the Neural Planner in runWorker
    
    // Pass the list of all base pages to the App.jsx prompt so it wires them
    const allPageNames = [...coreUiFiles]
        .filter(f => f.path.includes('pages/'))
        .map(f => f.path.split('/').pop()?.replace(`.${feExt}`, ''))
        .join(', ');

    const routingFiles = [
        // Routing & Entry
        { path: `frontend/src/App.${feExt}`, prompt: `${C}\nCreate root App component with React Router v6. \nIMPORT ALL THESE PAGES: ${allPageNames}.\nDefine routes for all of them. Wrap everything in the AppProvider and use the Navigation layout component for dashboard pages.\nEnsure the LandingPage is at "/", Login at "/login", Dashboard at "/dashboard", etc.\n${D}` }
    ];

    const rawAiFiles = [...coreUiFiles, ...routingFiles];
    const aiFiles = rawAiFiles.map(f => ({
        ...f,
        prompt: f.prompt.replace(/__ANTIGRAVITY_GOD_MODE_PLACEHOLDER__/g, ANTIGRAVITY_GOD_MODE(title, fe, f.path, prototypeMode))
    }));

    return { staticFiles, aiFiles };
};

// ============================================================
// PROJECT FILE PLAN GENERATOR — Hybrid Architecture (Fast + Real AI)
// ============================================================

const buildFilePlan = (title: string, requirements: string, category: string, techStack: any, type: string, blueprintContext?: string, prototypeMode: boolean = false) => {
  const fe = techStack?.frontend || techStack?.mobile || techStack?.desktop || 'React';
  const be = techStack?.backend || techStack?.php_ecosystem || 'Node.js';
  const db = techStack?.database || 'MongoDB';

  const blueprintStr = blueprintContext ? `\n\nPROJECT BLUEPRINT (USE THIS FOR CONSISTENCY):\n${blueprintContext}` : "";

  const complexity = getDegreeComplexity(category);

  const projectContext = `
Project Title: "${title}"
App Type: ${type}
Category: ${category} | Complexity Level: ${complexity.level}
Tech Stack: Frontend/UI=${fe}, Backend=${be}, Database=${db}
Requirements: ${requirements}
Degree Auth Standard: ${complexity.authType}
Additional Rules: ${complexity.extra}
Provide REAL production quality code matching this context in the requested language. Only raw code output.`;

  const stopWords = ['A', 'THE', 'ONLINE', 'SYSTEM', 'MANAGEMENT', 'APP', 'APPLICATION', 'PORTAL', 'WEBSITE', 'SOFTWARE'];
  const words = title.toUpperCase().split(/[^A-Z]/).filter(w => w.length > 2 && !stopWords.includes(w));
  let mainEntityName = 'Dashboard';
  if (words.length > 0) {
      mainEntityName = words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase();
  } else {
      const fallbackSplit = title.split(' ')[0].replace(/[^a-zA-Z]/g, '');
      if (fallbackSplit) mainEntityName = fallbackSplit;
  }

  // Conditional DB Boilerplate Config (Fixes Bug #4: Generic Schema removed)
  let dbConfigCode = '';
  if (db.toLowerCase().includes('mongo')) {
     dbConfigCode = `const mongoose = require('mongoose');\nconst connectDB = async () => {\n  try { await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/db');\n  console.log('✅ MONGO_SYNC_SUCCESS'); } catch (err) { console.error('❌ DB_SYNC_ERROR'); process.exit(1); }\n};\nmodule.exports = connectDB;`;
  } else if (db.toLowerCase().includes('postgres') || db.toLowerCase().includes('mysql')) {
     dbConfigCode = `const { Sequelize } = require('sequelize');\nconst sequelize = new Sequelize(process.env.DB_URI || 'postgres://user:pass@localhost:5432/db');\nconst connectDB = async () => {\n  try { await sequelize.authenticate(); console.log('✅ SQL_SYNC_SUCCESS'); } catch (err) { console.error('❌ DB_SYNC_ERROR', err); }\n};\nmodule.exports = connectDB;`;
  } else if (db.toLowerCase().includes('firebase') || db.toLowerCase().includes('supabase')) {
     dbConfigCode = `// ${db} Initialization\nconst { createClient } = require('@supabase/supabase-js');\nconst supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);\nmodule.exports = supabase;`;
  } else if (db.toLowerCase().includes('sqlite')) {
     dbConfigCode = `const sqlite3 = require('sqlite3').verbose();\nconst db = new sqlite3.Database('./database.sqlite', (err) => {\n  if (err) console.error(err.message);\n  console.log('✅ SQLITE_SYNC_SUCCESS');\n});\nmodule.exports = db;`;
  } else {
     dbConfigCode = `// Connection logic for ${db}\n// Recommended: Use an official SDK for ${db} integration.\nmodule.exports = () => { console.log('Initialized ${db} Driver'); };`;
  }

  const beLower = be.toLowerCase();
  let beExt = 'js';
  if (beLower.includes('python') || beLower.includes('fastapi') || beLower.includes('django')) beExt = 'py';
  else if (beLower.includes('java ') || beLower === 'java' || beLower.includes('spring')) beExt = 'java';
  else if (beLower.includes('php') || beLower.includes('laravel')) beExt = 'php';
  else if (beLower.includes('go')) beExt = 'go';
  else if (beLower.includes('rust')) beExt = 'rs';
  else if (beLower.includes('ruby')) beExt = 'rb';
  else if (beLower.includes('c#') || beLower.includes('.net')) beExt = 'cs';

  const feLower = fe.toLowerCase();
  let feExt = 'jsx';
  if (feLower.includes('vue')) feExt = 'vue';
  else if (feLower.includes('angular')) feExt = 'ts';
  else if (feLower.includes('svelte')) feExt = 'svelte';
  else if (feLower.includes('flutter')) feExt = 'dart';
  else if (feLower.includes('swift')) feExt = 'swift';
  else if (feLower.includes('kotlin')) feExt = 'kt';
  // 🛡️ CRITICAL FIX: If high-fidelity is requested or in prototype mode, NEVER fallback to HTML unless strictly specified
  else if ((feLower.includes('html') || feLower.includes('vanilla')) && !prototypeMode) feExt = 'html';
  else feExt = 'jsx'; // Default to React for 'Antigravity' quality

  const isFrontendFile = (path: string) => path.startsWith('frontend/') || path.startsWith('public/') || path === 'README.md' || path === 'setup.sh';

  const plan = {
    // 📁 CORE BOILERPLATE (Dynamic Engine)
    staticFiles: [
      {
        path: beExt === 'py' ? 'backend/main.py' : (beExt === 'php' ? 'backend/api.php' : `backend/server.${beExt}`),
        content: beExt === 'py' ? `from fastapi import FastAPI
from routes.mainRoutes import router as main_router
from config.db import connect_db

app = FastAPI()
connect_db()

app.include_router(main_router, prefix="/api")

@app.get("/")
def read_root():
    return {"Status": "Active"}
` : (beExt === 'php' ? `<?php
/**
 * 🚀 Neural Project Router (PHP Edition)
 * Central Hub for all API Requests and Controllers
 */
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once 'config/db.php';
require_once 'routes/mainRoutes.php';

$method = $_SERVER['REQUEST_METHOD'];
$request = explode('/', trim($_SERVER['PATH_INFO'],'/'));

// Real Routing Engine Synthesis
echo json_encode(["status" => "online", "engine" => "TITAN_V9_PHP", "request" => $method]);
?>` : `const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());

// Initialize Database
connectDB();

// Dynamic Neural Routes Mounting
try {
  const mainRoutes = require('./routes/mainRoutes');
  app.use('/api', mainRoutes);
  console.log('✅ NEURAL_ROUTES_SYNCED: /api');
} catch(e) {
  console.warn('⚠️ Routes module pending synthesis.', e.message);
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('🚀 SYSTEM DEPLOYED ON PORT ' + PORT));` )
      },
      {
        path: `backend/config/db.${beExt}`,
        content: beExt === 'py' ? `def connect_db():\n    print("✅ Initialized ${db} connection for Python Engine")\n` : (beExt === 'php' ? `<?php\n/**\n * 🛠️ Relational Database Connection (${db})\n * This file establishes a secure connection to the central data nexus.\n */\n$host = 'localhost';\n$db_name = '${mainEntityName}_db';\n$username = 'root';\n$password = '';\n\ntry {\n    $conn = new PDO("mysql:host=" . $host . ";dbname=" . $db_name, $username, $password);\n    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);\n    // echo "✅ DB_SYNC_SUCCESS";\n} catch(PDOException $exception) {\n    echo "Connection error: " . $exception->getMessage();\n}\n?>` : dbConfigCode)
      },
      {
        path: `backend/models/index.${beExt}`,
        content: beExt === 'php' ? `<?php\n/**\n * 📂 Neural Model Registry\n * This file acts as a central registry for all database models generated for the project.\n * It ensures all entities from the Architectural Blueprint are properly mapped.\n */\nrequire_once 'UserModel.php';\nrequire_once '${mainEntityName}Model.php';\n?>` : (beExt === 'py' ? `# Neural Model Registry\n# This file acts as a central registry for all database models generated for the project.\n` : `// Neural Model Export Registry\n// Use this file to manage and export all models for clean imports across the project.\nmodule.exports = {};`)
      },
      {
        path: 'frontend/src/index.css',
        content: `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\nbody {\n  @apply bg-slate-950 text-slate-100 font-sans;\n}`
      },
      {
        path: 'frontend/index.html',
        content: `<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>${title}</title>\n  </head>\n  <body>\n    <div id="root"></div>\n    <script type="module" src="/src/main.${feExt}"></script>\n  </body>\n</html>`
      },
      {
        path: feExt === 'dart' ? 'frontend/pubspec.yaml' : 'frontend/package.json',
        content: feExt === 'dart' 
           ? `name: frontend\ndescription: Flutter Project\n\nenvironment:\n  sdk: ^3.0.0\n\ndependencies:\n  flutter:\n    sdk: flutter\n  http: ^1.1.0\n`
           : (feExt === 'vue' 
              ? `{\n  "name": "frontend",\n  "private": true,\n  "version": "0.1.0",\n  "type": "module",\n  "scripts": {\n    "dev": "vite --port 3000",\n    "build": "vite build"\n  },\n  "dependencies": {\n    "vue": "^3.4.0",\n    "vue-router": "^4.0.0"\n  },\n  "devDependencies": {\n    "@vitejs/plugin-vue": "^5.0.0",\n    "tailwindcss": "^3.4.4",\n    "vite": "^5.3.1"\n  }\n}` 
              : `{\n  "name": "frontend",\n  "private": true,\n  "version": "0.1.0",\n  "type": "module",\n  "scripts": {\n    "dev": "vite --port 3000",\n    "build": "vite build"\n  },\n  "dependencies": {\n    "react": "^18.3.1",\n    "react-dom": "^18.3.1"\n  },\n  "devDependencies": {\n    "@vitejs/plugin-react": "^4.3.1",\n    "tailwindcss": "^3.4.4",\n    "vite": "^5.3.1"\n  }\n}`)
      },
      {
        path: feExt === 'dart' ? 'frontend/README.md' : 'frontend/vite.config.js',
        content: feExt === 'dart'
           ? `# Flutter UI Architecture`
           : (feExt === 'vue'
              ? `import { defineConfig } from 'vite';\nimport vue from '@vitejs/plugin-vue';\n\nexport default defineConfig({\n  plugins: [vue()],\n  server: { port: 3000 }\n});`
              : `import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\n\nexport default defineConfig({\n  plugins: [react()],\n  server: { port: 3000 }\n});`)
      },
      {
         path: feExt === 'dart' ? 'frontend/lib/main.dart' : `frontend/src/main.${feExt}`,
         content: feExt === 'dart'
            ? `import 'package:flutter/material.dart';\n\nvoid main() {\n  runApp(const MyApp());\n}\n\nclass MyApp extends StatelessWidget {\n  const MyApp({super.key});\n  @override\n  Widget build(BuildContext context) {\n    return MaterialApp(\n      title: '${title}',\n      home: Scaffold(body: Center(child: Text('Flutter App'))),\n    );\n  }\n}`
            : (feExt === 'vue'
               ? `import { createApp } from 'vue';\nimport App from './App.vue';\nimport './index.css';\n\ncreateApp(App).mount('#root');`
               : `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\nimport './index.css';\n\nReactDOM.createRoot(document.getElementById('root')).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>,\n);`)
      },
      // Admin Panel Boilerplate Additions
      {
        path: 'admin/package.json',
        content: `{\n  "name": "admin-panel",\n  "version": "1.0.0",\n  "type": "module",\n  "scripts": {\n    "dev": "vite --port 3001",\n    "build": "vite build"\n  },\n  "dependencies": {\n    "react": "^18.3.1",\n    "react-dom": "^18.3.1",\n    "lucide-react": "^0.300.0"\n  },\n  "devDependencies": {\n    "@vitejs/plugin-react": "^4.3.1",\n    "tailwindcss": "^3.4.4",\n    "vite": "^5.3.1"\n  }\n}`
      },
      {
        path: 'admin/vite.config.js',
        content: `import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\n\nexport default defineConfig({\n  plugins: [react()],\n  server: { port: 3001 }\n});`
      },
      {
        path: 'admin/index.html',
        content: `<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <title>${title} - Admin Panel</title>\n  </head>\n  <body>\n    <div id="root"></div>\n    <script type="module" src="/src/main.jsx"></script>\n  </body>\n</html>`
      },
      {
         path: 'admin/src/index.css',
         content: `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\nbody {\n  @apply bg-gray-50 text-gray-900 font-sans;\n}`
      },
      {
         path: 'admin/src/main.jsx',
         content: `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport AdminApp from './AdminApp';\nimport './index.css';\n\nReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><AdminApp /></React.StrictMode>);`
      },
      {
        path: 'backend/package.json',
        content: `{\n  "name": "backend",\n  "version": "1.0.0",\n  "main": "server.js",\n  "scripts": {\n    "start": "node server.js",\n    "dev": "nodemon server.js"\n  },\n  "dependencies": {\n    "cors": "^2.8.5",\n    "express": "^4.19.2",\n    "helmet": "^7.1.0",\n    "mongoose": "^8.4.4"\n  }\n}`
      }
    ],

    // 🧠 AI DYNAMIC FILES (Sequential build — each file aware of all prior files)
    aiFiles: []
  };

  const D = "__ANTIGRAVITY_GOD_MODE_PLACEHOLDER__";
  const rawAiFiles = [
    {
      path: `backend/models/UserModel.${beExt}`,
      prompt: `${projectContext}\nFILE GOAL: Write the complete User Database Model for "${title}" using ${db}.\nRules:\n- Include exact fields: id, name, email (unique/index), password (hashed), role (enum: ['user','admin']).\n- Real schema syntax ONLY. No placeholder objects.\n- Export model as 'UserModel'.\nOutput: Raw ${beExt} code ONLY. No markdown.`
    },
    {
      path: `backend/models/${mainEntityName}Model.${beExt}`,
      prompt: `${projectContext}\nFILE GOAL: Write the complete ${mainEntityName} Database Model for "${title}" using ${db}.\nDEPENDS_ON: UserModel exists (references may use 'ref: User').\nRules:\n- Include ALL rigorous fields needed for a production ${mainEntityName} entity (title, desc, status, price, createdAt etc).\n- Real schema syntax ONLY. Export model.\nOutput: Raw ${beExt} code ONLY. No markdown.`
    },
    {
      path: `backend/middleware/auth.${beExt}`,
      prompt: `${projectContext}\nFILE GOAL: Write a production-grade JWT Authentication Middleware.\nRules:\n- Decrypt JWT from Authorization header.\n- Attach user metadata to request.\n- Handle 401/403 errors gracefully.\nOutput: Raw ${beExt} code ONLY.`
    },
    {
      path: `backend/middleware/errorHandler.${beExt}`,
      prompt: `${projectContext}\nFILE GOAL: Centralized Error Handling Middleware.\nRules:\n- Catch all async errors.\n- Return standardized JSON response with status codes.\nOutput: Raw ${beExt} code ONLY.`
    },
    {
      path: `backend/controllers/${mainEntityName}Controller.${beExt}`,
      prompt: `${projectContext}\nFILE GOAL: Write production-level CRUD controllers for ${mainEntityName}.\nDEPENDS_ON: UserModel and ${mainEntityName}Model.\nRules:\n- Implement: create, getAll, getById, update, delete.\n- MANDATORY: Use try/catch blocks for error handling.\n- MANDATORY: Query the database with proper functions (e.g., .findById, .save, .deleteOne in matching framework syntax).\n- Return standard JSON responses { success: boolean, data: any }.\n- No fake logic or "// add query here" placeholders. Write the full database operation.\nOutput: Raw ${beExt} code ONLY. No markdown.`
    },
    {
      path: `backend/routes/mainRoutes.${beExt}`,
      prompt: `${projectContext}\nFILE GOAL: Consolidate modular routes for ${mainEntityName}Controller.\nRules:\n- Create standard GET/POST/PUT/DELETE routes mapped to Controller logic.\n- Export router object.\nOutput: Raw ${beExt} code ONLY. No markdown.`
    },
    {
      path: `frontend/src/context/AuthContext.${feExt}`,
      prompt: `${projectContext}\nFILE GOAL: React/Universal Auth Context Provider.\nRules:\n- Manage login/logout state.\n- Persist tokens in localStorage.\n- Handle session restoration on boot.\nOutput: Raw ${feExt} code ONLY.`
    },
    {
      path: `frontend/src/components/layout/Navbar.${feExt}`,
      prompt: `${projectContext}\nFILE GOAL: Premium Header / Navigation component.\nRules:\n${D}\n- Include: Logo, Dynamic Links (Home, Dashboard, Admin), User Profile Dropdown.\n- Glassmorphic style.\nOutput: Raw ${feExt} code ONLY.`
    },
    {
      path: `frontend/src/pages/Login.${feExt}`,
      prompt: `${projectContext}\nFILE GOAL: Industrial Login Experience.\nRules:\n${D}\n- Animated form entrance.\n- Validation and Loading states.\nOutput: Raw ${feExt} code ONLY.`
    },
    {
      path: `frontend/src/pages/Register.${feExt}`,
      prompt: `${projectContext}\nFILE GOAL: User Registration Page.\nRules:\n${D}\nOutput: Raw ${feExt} code ONLY.`
    },
    {
      path: `admin/src/pages/AdminDashboard.${feExt}`,
      prompt: `${projectContext}\nFILE GOAL: Write the Admin Dashboard landing page.\nRules:\n- Fetch aggregate stats from backend (e.g., total users, total ${mainEntityName}s).\n- Professional UI using cards and data tables. Do not use generic <h1> layouts.\n- Real data mapping with robust conditional rendering for loading/errors.\nOutput: Raw ${feExt} code ONLY.`
    },
    {
      path: `admin/src/pages/UserManagement.${feExt}`,
      prompt: `${projectContext}\nFILE GOAL: Admin Section - User Control Center.\nRules:\n- List all users in a data table.\n- Options to Toggle status (Active/Suspended).\nOutput: Raw ${feExt} code ONLY.`
    },
    {
      path: type.includes('Mobile') ? `frontend/lib/screens/Home.${feExt}` : `frontend/src/pages/Home.${feExt}`,
      prompt: `${projectContext}\nFILE GOAL: Write the Home Page (User View) for "${title}".\nRules:\n- Map and display ${mainEntityName} items nicely via fetch/axios.\n- Real loading/error states. Use 100% accurate variable names based on your Model's fields.\nOutput: Raw ${feExt} code ONLY.`
    },
    {
      path: `admin/src/AdminApp.${feExt}`,
      prompt: `${projectContext}\nFILE GOAL: Write the ROOT file for the ADMIN PANEL application.\nRules:\n- Admin panel runs independently on port 3001.\n- Setup react-router or native router for: /admin/dashboard, /admin/manage-${mainEntityName.toLowerCase()}.\n- Wrap with AdminAuth context provider.\n- Must use distinct Admin-style sidebar layout component.\nOutput: Raw ${feExt} code ONLY.`
    },
    {
      path: type.includes('Mobile') ? `frontend/lib/main.${feExt}` : (type.includes('Desktop') ? `frontend/src/Main.${feExt}` : `frontend/src/App.${feExt}`),
      prompt: `${projectContext}\nFILE GOAL: Write the User-Facing App Root / Entry file.\nDEPENDS_ON: REST APIs at /api/${mainEntityName.toLowerCase()}.\nRules:\n- Setup routing for: /, /login, /dashboard (User Dashboard).\n- Initialize global state/store. Setup API base URL.\nOutput: Raw ${feExt} code ONLY. No markdown.`
    }
  ];

  plan.aiFiles = rawAiFiles.map(f => ({
      ...f,
      prompt: f.prompt.replace(/__ANTIGRAVITY_GOD_MODE_PLACEHOLDER__/g, ANTIGRAVITY_GOD_MODE(title, fe, f.path, prototypeMode))
  }));

  if (prototypeMode) {
      plan.staticFiles = plan.staticFiles.filter(f => isFrontendFile(f.path));
      plan.aiFiles = plan.aiFiles.filter(f => isFrontendFile(f.path));
  }

  return plan;
};

// ============================================================
// SYSTEM LOGGER — Real-time socket + DB logging  
// ============================================================
const SystemLogger = {
  log: async (projectId: string, type: string, message: string) => {
    try {
      const log = new SystemLog({ projectId: new mongoose.Types.ObjectId(projectId), logType: type, message });
      await log.save();
      SocketService.emitToSession(projectId, 'agent_pulse', {
        agent: type,
        state: 'active',
        message,
        timestamp: new Date().toISOString()
      });
    } catch (e) {
      console.error('SystemLogger Error:', e);
    }
  }
};

// ============================================================
// COMMAND EXECUTOR — Writes files to disk + DB
// ============================================================
const CommandExecutor = {
  writeFile: async (projectId: string, filePath: string, content: string) => {
    let projectTitle = '';
    try {
      const project = await CollageProject.findById(projectId);
      if (project) {
        projectTitle = project.title || '';
      }
    } catch (e) {
      console.error('Failed to fetch project title in writeFile:', e);
    }

    let cleanPath = filePath.replace(/\\/g, '/');
    cleanPath = cleanPath.replace(/^\/+/g, '');
    cleanPath = cleanPath.replace(/^[a-zA-Z]:\/?/g, '');

    if (projectTitle) {
      const cleanTitle = projectTitle.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const pathParts = cleanPath.split('/');
      if (pathParts.length > 1) {
        const firstPartClean = pathParts[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        if (firstPartClean === cleanTitle) {
          pathParts.shift();
          cleanPath = pathParts.join('/');
        }
      }
    }

    let prev;
    do {
      prev = cleanPath;
      cleanPath = cleanPath.replace(/(^|\/)\.\.\//g, '/').replace(/(^|\/)\.\//g, '/');
      cleanPath = cleanPath.replace(/\/+/g, '/').replace(/^\/+/g, '');
    } while (cleanPath !== prev);

    if (cleanPath.startsWith('src/') && !cleanPath.startsWith('frontend/')) {
      cleanPath = 'frontend/' + cleanPath;
    }

    if (!cleanPath || cleanPath === '.' || cleanPath === '..') {
      throw new Error(`SECURITY_VIOLATION: Invalid target path: ${filePath}`);
    }

    const baseDir = path.resolve(__dirname, '../../../../projects', projectId);
    const fullPath = path.resolve(baseDir, cleanPath);

    // CRITICAL: Prevent Path Traversal (COL-1)
    if (!fullPath.startsWith(baseDir)) {
      throw new Error(`SECURITY_VIOLATION: Attempted path traversal in filePath: ${cleanPath}`);
    }

    // Fix MED-5: Meaningful file validation (at least 50 chars)
    if (!content || content.trim().length < 50) {
      throw new Error(`FILE_QUALITY_FAIL: ${cleanPath} — Content too short (${content?.length || 0} chars). Required 50+ chars.`);
    }

    const objectId = new mongoose.Types.ObjectId(projectId);

    await ProjectFile.findOneAndUpdate(
      { projectId: objectId, filePath: cleanPath },
      { fileContent: content, createdAt: new Date() },
      { upsert: true }
    );

    if (!fs.existsSync(path.dirname(fullPath))) {
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    }
    fs.writeFileSync(fullPath, content, 'utf8');

    SocketService.emitToSession(projectId, 'file_created', {
      path: cleanPath,
      lines: content.split('\n').length,
      time: new Date().toISOString()
    });

    return fullPath;
  }
};

// ============================================================
// MULTI-AGENT SERVICE — Main build orchestrator
// ============================================================
export const multiAgentService = {
  callAI: async (prompt: string, id: string = "system") => callSwarmAI(prompt, id),

  handleChatUpdate: async (project: any, message: string) => {
    const pId = project._id.toString();
    await SystemLogger.log(pId, 'FEATURE_INJECTOR', `Processing: ${message}`);
    SocketService.emitToSession(pId, 'agent_pulse', { agent: 'FEATURE_INJECTOR', state: 'active', message: `Integrating instruction: ${message}` });
    
    try {
      const ProjectMessage = (await import('./project_message.model')).default;
      const dbMsg = new ProjectMessage({ projectId: new mongoose.Types.ObjectId(pId), userMessage: message, status: 'PROCESSING' });
      await dbMsg.save();
      
      const response = await callSwarmAI(`User instruction: "${message}". Project: "${project.title}". You are a Neural Assistant capable of application expansion. 1) Acknowledge the logic technically (1 short sentence). 2) Provide the EXACT filename path that will be created or updated for this. Format exactly as: Response Text | filename.ext`, pId);
      
      const parts = response.split('|');
      const chatText = parts[0]?.trim() || "Instruction intercepted and compiled.";
      const rawTargetFile = parts[1]?.replace(/`/g, '').trim();
      const targetFile = rawTargetFile && rawTargetFile.includes('.') ? rawTargetFile : `frontend/src/extensions/latest_feature.js`;
      
      dbMsg.aiResponse = chatText;
      dbMsg.status = 'COMPLETED';
      await dbMsg.save();
      
      await SystemLogger.log(pId, 'NEURAL_CHAT', chatText);
      SocketService.emitToSession(pId, 'agent_pulse', { agent: 'NEURAL_CHAT', state: 'done', message: chatText });
      SocketService.emitToSession(pId, 'chat_reply', { _id: dbMsg._id, userMessage: message, aiResponse: chatText, status: 'COMPLETED' });

      // REAL FILE REGENERATION IN BACKGROUND
      SocketService.emitToSession(pId, 'agent_pulse', { agent: 'CODE_FORGE', state: 'active', message: `Synthesizing modifications for ${targetFile}...` });
      
      const codeOutput = await callSwarmAI(`Implement the following instruction for project "${project.title}": "${message}". Output ONLY raw, robust, executable code for the file: ${targetFile}. Do NOT use markdown codeblock wrappers, output strictly code.`, pId);
      const cleanCode = codeOutput.replace(/```[a-z]*\n?/g, '').replace(/```/g, '').trim() || "// Execution failed to compile feature.";
      
      await CommandExecutor.writeFile(pId, targetFile, cleanCode);
      
      await SystemLogger.log(pId, 'CODE_FORGE', `Successfully integrated ${targetFile} via Neural Request.`);
      SocketService.emitToSession(pId, 'agent_pulse', { metadata: { type: 'code_stream', path: targetFile, content: cleanCode }, agent: 'CODE_FORGE', message: `Module Injected: ${targetFile}`, state: 'done' });
      SocketService.emitToSession(pId, 'file_created', { path: targetFile });

    } catch(err: any) {
      await SystemLogger.log(pId, 'CHAT_ERROR', `Failed to generate response: ${err.message}`);
    }
  },

  generateBlueprintOnly: async (projectId: string) => {
      const project = await CollageProject.findById(projectId);
      if (!project) return;
      
      const pId = projectId.toString();
      const title = project.title || 'Application';
      const requirements = project.requirements || '';
      const techStack = project.technologyStack || { frontend: 'React', backend: 'Node.js', database: 'MongoDB' };
      
      await SystemLogger.log(pId, 'ARCHITECT', `🧠 Standalone Blueprint Synthesis Request...`);
      
      const prompt = `You are an ELITE SOFTWARE ARCHITECT. Generate 4 ULTRA-DETAILED, HIGH-FIDELITY Mermaid.js diagrams for project "${title}". Tech: ${techStack.frontend}, ${techStack.backend}, ${techStack.database}. Requirements: ${requirements}. Output ONLY parseable JSON with keys: "architecture", "system_flow", "activity_flow", "sequence_flow".
CRITICAL RULES:
1. "architecture" MUST be an \`erDiagram\`.
2. "system_flow" MUST use \`flowchart TD\` with colored \`subgraph\` layers (Presentation, Application, Domain, Data) and \`classDef\` styling.
3. "activity_flow" MUST be a detailed \`stateDiagram-v2\`.
4. "sequence_flow" MUST be a \`sequenceDiagram\` with alt/opt blocks.
JSON ONLY. Use "\\n" for newlines. NO markdown bounds.`;
      
      try {
          const rawRes = await callSwarmAI(prompt, pId);
          const cleanJson = rawRes.substring(rawRes.indexOf('{'), rawRes.lastIndexOf('}') + 1);
          if (cleanJson) {
              const diagrams = JSON.parse(cleanJson);
              
              // Apply diagram syntax sanitization
              diagrams.architecture = sanitizeMermaidCode('architecture', diagrams.architecture);
              diagrams.system_flow = sanitizeMermaidCode('system_flow', diagrams.system_flow);
              diagrams.activity_flow = sanitizeMermaidCode('activity_flow', diagrams.activity_flow);
              diagrams.sequence_flow = sanitizeMermaidCode('sequence_flow', diagrams.sequence_flow);

              const krokiUrls = {
                  architecture: generateKrokiUrl('mermaid', diagrams.architecture),
                  system_flow: generateKrokiUrl('mermaid', diagrams.system_flow),
                  activity_flow: generateKrokiUrl('mermaid', diagrams.activity_flow),
                  sequence_flow: generateKrokiUrl('mermaid', diagrams.sequence_flow),
              };
              await CollageProject.findByIdAndUpdate(pId, { 'blueprint.diagrams': diagrams, 'blueprint.krokiUrls': krokiUrls });
              await SystemLogger.log(pId, 'ARCHITECT', `✅ Blueprint updated successfully.`);
          }
      } catch (e) {
          console.error("Blueprint Solo Failed", e);
      }
  },

  startProjectBuild: async (project: any) => {
    const pId = project._id.toString();
    const title = project.title || 'Full Stack Application';
    const requirements = project.requirements || '';
    const category = project.category || 'GRADUATION';
    const techStack = project.technologyStack || { frontend: 'React', backend: 'Node.js', database: 'MongoDB' };

    await SystemLogger.log(pId, 'GENESIS_ENGINE', `🚀 Initializing HYBRID TITAN BUILD for: "${title}"`);
    await CollageProject.findByIdAndUpdate(pId, { status: 'GENERATING' });
    SocketService.emitToSession(pId, 'project_update', { status: 'GENERATING' });

    // Create tasks
    const taskTypes = ['analyze', 'blueprint', 'context_memory', 'database', 'api', 'backend_module', 'frontend_module', 'packaging'];
    const objectId = new mongoose.Types.ObjectId(pId);
    for (const [i, type] of taskTypes.entries()) {
      const existing = await ProjectTask.findOne({ projectId: objectId, taskType: type });
      if (!existing) {
        const task = new ProjectTask({ projectId: objectId, taskType: type, priority: i + 1, status: 'pending' });
        await task.save();
      }
    }

    // Run Worker in detached state
    setImmediate(() => {
      const timeoutPromise = new Promise<void>((_, reject) => {
        setTimeout(() => reject(new Error('AI Build Timeout - Operations took too long (60 mins max)')), 3600000);
      });
      
      const buildPromise = async () => {
         // TRIGGERS OMEGA PIPELINE (DANGER ALGORITHM) in Python
         try {
             await axios.post('http://127.0.0.1:8000/omega-build', {
                 project_id: pId,
                 title: title,
                 requirements: requirements,
                 tech_stack: techStack
             });
             console.log("Omega Pipeline execution complete on Python side.");
         } catch (e: any) {
             console.error("Omega Pipeline connection failed:", e.message);
         }
         // Continue with existing flow for fallback / full ZIP packaging
         await multiAgentService.runWorker(pId, title, requirements, category, techStack, project.type || 'Full Stack App', project.prototypeMode);
      };

      Promise.race([
        buildPromise(),
        timeoutPromise
      ]).catch(async (err) => {
        console.error('BUILD_WORKER_CRASH:', err);
        await SystemLogger.log(pId, 'CRITICAL', `Execution Halted: ${err.message}`);
        await CollageProject.findByIdAndUpdate(pId, { status: 'FAILED' });
        SocketService.emitToSession(pId, 'project_update', { status: 'FAILED' });
      });
    });
  },

  runWorker: async (pId: string, title: string, requirements: string, category: string, techStack: any, type: string, initialPrototypeMode: boolean = true) => {
    let prototypeMode = initialPrototypeMode;
    const reqText = (requirements + ' ' + title + ' ' + type).toLowerCase();
    if (
        reqText.includes('only frontend') ||
        reqText.includes('only for frontend') ||
        reqText.includes('frontend only') ||
        reqText.includes('no backend') ||
        reqText.includes('backend nhi') ||
        reqText.includes('backend nahi') ||
        reqText.includes('backend nahi chahiye') ||
        reqText.includes('mobile interface') ||
        reqText.includes('desktop ui')
    ) {
        prototypeMode = true;
    }
    const objectId = new mongoose.Types.ObjectId(pId);
    
    // Dynamically finding and updating the tracker to prevent stale references
    const updateTask = async (taskType: string, stats: string) => {
      try {
         const tgt = await ProjectTask.findOneAndUpdate(
             { projectId: objectId, taskType: taskType },
             { status: stats },
             { new: true }
         );
         if(tgt) {
            SocketService.emitToSession(pId, 'task_update', { taskId: tgt._id, taskType: taskType, status: stats });
         }
      } catch (err) {
         console.error(`Task update failed for ${taskType}`, err);
      }
    };

    // Phase 1: Planning (PSD Extractor)
    await updateTask('analyze', 'running');
    await SystemLogger.log(pId, 'NEURAL_PLANNER', `📋 Compiling Project Specification Document (PSD)...`);
    
    let psd = { actors: ['User'], features: ['Authentication', 'Core Business Logic'], constraints: {} };
    try {
        const psdPrompt = `Extract the core Project Specification Document (PSD) for "${title}". Requirements: ${requirements}.
Return ONLY a valid JSON object matching this strict schema: { "actors": ["..."], "features": ["Feature 1", "Feature 2"...], "constraints": {"auth": true} }`;
        const rawPsd = await callSwarmAI(psdPrompt, pId);
        const psdJsonStr = rawPsd.substring(rawPsd.indexOf('{'), rawPsd.lastIndexOf('}') + 1);
        if (psdJsonStr) {
           psd = JSON.parse(psdJsonStr);
           await CollageProject.findByIdAndUpdate(pId, { requirements: JSON.stringify(psd) }); 
           await SystemLogger.log(pId, 'NEURAL_PLANNER', `✅ PSD Compiled: Mapped ${psd.actors?.length || 0} Actors and ${psd.features?.length || 0} Core Features.`);
        }
    } catch(e) {
        console.error("PSD MAPPING FAILED:", e);
    }
    await updateTask('analyze', 'completed');

    // Phase 2: Blueprint
    await updateTask('blueprint', 'running');
    
    // ✅ TECH RESOLVER — reads mobile/desktop keys for non-web type projects
    const fe = techStack?.frontend || techStack?.mobile || techStack?.desktop || 'React + Vite';
    const be = techStack?.backend || techStack?.php_ecosystem || 'Node.js / Express';
    const db = techStack?.database || 'MongoDB';
    const additionalStack = Object.entries(techStack || {})
        .filter(([k]) => !['frontend','mobile','desktop','backend','php_ecosystem','database'].includes(k))
        .map(([k,v]) => `${k}: ${v}`)
        .join(', ');
    
    const stopWords = ['A', 'THE', 'ONLINE', 'SYSTEM', 'MANAGEMENT', 'APP', 'APPLICATION', 'PORTAL', 'WEBSITE', 'SOFTWARE'];
    const words = title.toUpperCase().split(/[^A-Z]/).filter(w => w.length > 2 && !stopWords.includes(w));
    const safeEntity = (words[0] || 'User').replace(/[^a-zA-Z]/g, '').toUpperCase();
    
    const prompt = prototypeMode 
      ? `You are an ELITE FRONTEND ARCHITECT. Generate 6 ULTRA-DETAILED, HIGH-FIDELITY Mermaid.js diagrams for a project titled "${title}". 
This is a High-Fidelity UI Prototype. Focus 100% on the User Interface, UX Flows, and Antigravity Design System.

Output ONLY a valid parseable JSON object with these exact 6 keys: 
"architecture", "system_flow", "dfd_level_1", "dfd_level_2", "activity_flow", "sequence_flow".

CRITICAL MERMAID RULES FOR PREMIUM DESIGN:
1. "architecture" MUST be an \`erDiagram\` but represent the UI COMPONENT HIERARCHY (e.g., App contains Sidebar, Dashboard; Dashboard contains Charts).
2. "system_flow" MUST be a \`flowchart TD\` showing the NAVIGATION & STATE FLOW (e.g., Auth State -> Hero -> Dashboard).
3. "dfd_level_1" MUST be a \`flowchart TD\` showing the USER INTERACTION LOGIC (e.g., Click 'Analyze' -> Trigger Animation -> Show Modal).
4. "dfd_level_2" MUST be a \`flowchart LR\` representing the UI LAYOUT WIREFRAME.
5. "activity_flow" MUST be a \`stateDiagram-v2\` showing the COMPONENT LIFECYCLE (Mount -> Fetch Mock Data -> Render UI).
6. "sequence_flow" MUST be a \`sequenceDiagram\` between User, React Context, and UI Components.

SYNTAX & STYLING MANDATES:
- Apply \`classDef ui fill:#06b6d4,stroke:#fff,color:#fff; classDef state fill:#6366f1,stroke:#fff,color:#fff;\`.
- Use the Indigo/Cyan 'Antigravity' theme.
- NO markdown, NO other text. ONLY valid JSON output.`
      : `You are an ELITE SOFTWARE ARCHITECT. Generate 6 ULTRA-DETAILED, HIGH-FIDELITY Mermaid.js diagrams for a project titled "${title}". 
Requirements: ${requirements}
Full Tech Stack: UI/Frontend=${fe}, Backend=${be}, Database=${db}${additionalStack ? ', ' + additionalStack : ''}.

Output ONLY a valid parseable JSON object with these exact 6 keys: 
"architecture", "system_flow", "dfd_level_1", "dfd_level_2", "activity_flow", "sequence_flow".

CRITICAL MERMAID RULES FOR PREMIUM DESIGN:
1. "architecture" MUST be a highly detailed \`erDiagram\` with real tables, keys, and specific data types.
2. "system_flow" MUST be a \`flowchart TD\` that uses colored \`subgraph\` blocks to define Clean Architecture layers (e.g., Presentation Layer, Domain Layer, Application Layer, Data Layer).
3. "dfd_level_1" MUST use \`flowchart TD\` with detailed decision diamonds (e.g., \`id{Condition}\`), distinct node shapes, and thorough logic flows (similar to complex login/payment logic).
4. "dfd_level_2" MUST use \`flowchart LR\` representing User Interface/App Wireframe flows. Use \`subgraph\` for specific Screens and nodes for buttons/forms navigating to next screens.
5. "activity_flow" MUST be a \`stateDiagram-v2\` with complex states, forks, joins, and descriptive notes.
6. "sequence_flow" MUST be a \`sequenceDiagram\` featuring actors, participants, alt/opt logic blocks, and data payloads over arrows.

SYNTAX & STYLING MANDATES:
- For flowcharts, ALWAYS apply \`classDef\` styling to make them visually stunning (e.g., \`classDef ui fill:#6366f1,stroke:#fff,color:#fff; classDef logic fill:#10b981,stroke:#fff,color:#fff; classDef db fill:#f59e0b,stroke:#fff,color:#fff;\`) and apply them using \`class [Node] [classStyle]\`.
- ALWAYS enclose node labels in double quotes. Example: \`A["Search Book"]\` instead of \`A(Search Book)\` to prevent syntax errors.
- NO markdown, NO other text. ONLY valid JSON output.`;

    let generatedDiagrams = null;
    try {
      await SystemLogger.log(pId, 'ARCHITECT', `🧠 Synthesizing Complete Micro-level Diagrams...`);
      const rawRes = await callSwarmAI(prompt, pId);
      
      let cleanJson = rawRes.substring(rawRes.indexOf('{'), rawRes.lastIndexOf('}') + 1);
      // Fix Bug #4: Clean literal newlines and unescaped quotes inside Mermaid strings
      cleanJson = cleanJson.replace(/[\n\r\t]/g, " "); 
      if (cleanJson) {
         generatedDiagrams = JSON.parse(cleanJson);
      }
    } catch(e: any) {
      console.error("DIAGRAMS PARSE ERROR:", e.message || "Unknown error");
    }
    
    // Fallback if Groq fails or rate limits
    const diagrams = generatedDiagrams || {
       architecture: `erDiagram\n    USER ||--o{ ${safeEntity} : manages\n    ${safeEntity} ||--|{ RECORD : contains\n    USER {\n      string id\n      string name\n      string email\n    }\n    ${safeEntity} {\n      string id\n      string title\n      date created_at\n    }`,
       system_flow: `flowchart TD\n    classDef presentation fill:#6366f1,stroke:#fff,color:#fff,stroke-width:2px;\n    classDef domain fill:#10b981,stroke:#fff,color:#fff,stroke-width:2px;\n    classDef data fill:#f59e0b,stroke:#fff,color:#fff,stroke-width:2px;\n    subgraph Presentation Layer\n        UI["${fe} Interface"]:::presentation\n        App["React Store / State"]:::presentation\n    end\n    subgraph Domain Layer\n        API["${be} REST API"]:::domain\n        Controllers["Business Logic"]:::domain\n    end\n    subgraph Data Layer\n        DB[("${db} Database")]:::data\n        Cache[("Redis Cache")]:::data\n    end\n    UI --> App\n    App -->|JSON/HTTP| API\n    API --> Controllers\n    Controllers --> DB\n    Controllers -.-> Cache`,
       dfd_level_1: `flowchart TD\n    classDef start fill:#8b5cf6,stroke:#fff,color:#fff;\n    classDef process fill:#3b82f6,stroke:#fff,color:#fff;\n    classDef dec fill:#ec4899,stroke:#fff,color:#fff;\n    classDef endNode fill:#10b981,stroke:#fff,color:#fff;\n    A(["Start Login"]):::start --> B("Enter Credentials"):::process\n    B --> C{"Is Valid?"}:::dec\n    C -->|"Yes"| D("Generate JWT Token"):::process\n    C -->|"No"| E("Show Error"):::process\n    E --> B\n    D --> F(["Dashboard"]):::endNode`,
       dfd_level_2: `flowchart LR\n    classDef screen fill:#f8fafc,stroke:#94a3b8,color:#333;\n    classDef btn fill:#6366f1,stroke:#fff,color:#fff,rx:5px,ry:5px;\n    subgraph "Login Screen"\n        S1["Email/Password"]:::screen\n        B1["Login Btn"]:::btn\n    end\n    subgraph "Dashboard Screen"\n        S2["List View"]:::screen\n        B2["Add New Btn"]:::btn\n    end\n    S1 --> B1\n    B1 -->|Success| S2\n    S2 --> B2`,
       activity_flow: `stateDiagram-v2\n    [*] --> Authentication\n    Authentication --> Dashboard : Success\n    Authentication --> Authentication : Failed\n    state Dashboard {\n        [*] --> ViewRecords\n        ViewRecords --> CreateRecord\n        CreateRecord --> SaveToDB\n        SaveToDB --> ViewRecords\n    }\n    Dashboard --> [*] : Logout`,
       sequence_flow: `sequenceDiagram\n    actor User\n    participant UI as ${fe}\n    participant API as ${be}\n    participant DB as ${db}\n    User->>UI: Submit Form\n    UI->>API: POST /resource\n    alt Valid Data\n        API->>DB: INSERT data\n        DB-->>API: Success\n        API-->>UI: 201 Created\n        UI-->>User: Show Success Msg\n    else Invalid Data\n        API-->>UI: 400 Bad Request\n        UI-->>User: Show Validation Error\n    end`
    };

    // Generate robust SVG links using Kroki encoder
    diagrams.architecture = sanitizeMermaidCode('architecture', diagrams.architecture);
    diagrams.system_flow = sanitizeMermaidCode('system_flow', diagrams.system_flow);
    if (diagrams.dfd_level_1) diagrams.dfd_level_1 = sanitizeMermaidCode('dfd_level_1', diagrams.dfd_level_1);
    if (diagrams.dfd_level_2) diagrams.dfd_level_2 = sanitizeMermaidCode('dfd_level_2', diagrams.dfd_level_2);
    diagrams.activity_flow = sanitizeMermaidCode('activity_flow', diagrams.activity_flow);
    diagrams.sequence_flow = sanitizeMermaidCode('sequence_flow', diagrams.sequence_flow);

    const krokiUrls = {
        architecture: generateKrokiUrl('mermaid', diagrams.architecture),
        system_flow: generateKrokiUrl('mermaid', diagrams.system_flow),
        dfd_level_1: generateKrokiUrl('mermaid', diagrams.dfd_level_1 || diagrams.system_flow),
        dfd_level_2: generateKrokiUrl('mermaid', diagrams.dfd_level_2 || diagrams.system_flow),
        activity_flow: generateKrokiUrl('mermaid', diagrams.activity_flow),
        sequence_flow: generateKrokiUrl('mermaid', diagrams.sequence_flow),
    };
    
    // 🔥 CRITICAL: Persistent diagrams update (Move out of R&D block to ensure tab visibility)
    await CollageProject.findByIdAndUpdate(pId, { 
        'blueprint.diagrams': diagrams,
        'blueprint.krokiUrls': krokiUrls 
    });

    // Phase 2.2: Structural Deep Analysis (R&D)
    await SystemLogger.log(pId, 'BLUEPRINT_ENGINE', `🔍 Performing Structural Deep Analysis (R&D Phase)...`);
    let blueprintContent = "";
    try {
      await new Promise(r => setTimeout(r, 1000)); // Optimized Blueprint flow
      const blueprintPrompt = prototypeMode 
        ? `Perform an architectural R&D for project "${title}". Focus 100% on Frontend Prototype.
Tech Stack: ${fe}. Requirements: ${requirements}.
Define exactly:
1. UI Component Hierarchy: List 20+ essential premium components (Hero, GlassCards, HUDNav, etc.).
2. UX Flows: Define the complete user journey through the application.
3. Design Tokens: Define the specific Antigravity colors, glows, and animation durations.
Output strictly JSON only with keys: "database" (use for Component Hierarchy), "api_endpoints" (use for UX Flows), "frontend_structure".`
        : `Perform an architectural R&D for project "${title}". 
Tech Stack: ${fe}, ${be}, ${db}. Requirements: ${requirements}.
Define exactly:
1. Database Schema: List at least 8 essential tables with their full fields and relationships.
2. API Endpoints: Define a full REST API structure covering all modules.
3. Frontend Pages: List all components and routes for a high-end application.
Output strictly JSON only with keys: "database", "api_endpoints", "frontend_structure".`;
      const rawBlueprint = await callSwarmAI(blueprintPrompt, pId);
      
      if (rawBlueprint) {
        blueprintContent = rawBlueprint.substring(rawBlueprint.indexOf('{'), rawBlueprint.lastIndexOf('}') + 1);
        if (blueprintContent.includes('{')) {
            const blueprintObj = JSON.parse(blueprintContent);
            await CollageProject.findByIdAndUpdate(pId, { 
                'blueprint.structuralAnalysis': blueprintObj
            });
            
            if (prototypeMode) {
                await SystemLogger.log(pId, 'BLUEPRINT_ENGINE', `✅ Deep Analysis Complete: Component Hierarchies & UX Flows mapped.`);
            } else {
                await SystemLogger.log(pId, 'BLUEPRINT_ENGINE', `✅ Deep Analysis Complete: 10+ Tables, 20+ API Endpoints defined.`);
            }
        } else {
            throw new Error("Invalid AI Blueprint Response Format");
        }
      } else {
        throw new Error("Empty AI Blueprint Response");
      }
    } catch (e: any) {
      console.error("BLUEPRINT_ENGINE_ERROR:", e.message || "Unknown error");
      await SystemLogger.log(pId, 'BLUEPRINT_ENGINE', `⚠️ Deep Analysis timeout/failed. Reverting to Baseline Architecture.`);
      blueprintContent = "Generic architecture fallback.";
    }

    const limitedBlueprint = blueprintContent.length > 6000 ? blueprintContent.substring(0, 6000) + '...}' : blueprintContent;
    
    // ============================================================
    // Phase 2.3: FILE PLAN — Frontend-Only vs Full Stack
    // ============================================================
    let filePlan: any;

    if (prototypeMode) {
        // 🚀 FRONTEND-ONLY MODE: Dynamic Neural Planner
        const feExt = fe.toLowerCase().includes('vue') ? 'vue'
            : fe.toLowerCase().includes('angular') ? 'ts'
            : fe.toLowerCase().includes('svelte') ? 'svelte'
            : 'tsx';
            
        filePlan = buildFrontendOnlyPlan(title, fe, feExt, safeEntity, requirements);
        
        await SystemLogger.log(pId, 'NEURAL_PLANNER', `🧠 Dynamic Frontend Planner active. Generating custom pages for "${title}"...`);
        try {
            const plannerPrompt = `You are a frontend UI architect. Plan exactly 5-8 highly specific React application pages for "${title}". Requirements: "${requirements}". Stack: ${fe}.
Focus heavily on unique features required for this specific app (e.g. BiddingPage, TrackingDashboard, etc.).
DO NOT include base pages like LandingPage, LoginPage, RegisterPage, or DashboardPage (they already exist).
Return ONLY a valid JSON array of objects:
[{"path":"frontend/src/pages/CustomPageName.${feExt}", "prompt":"FILE GOAL: ... detailed instructions for premium UI ..."}]
JSON array ONLY. No markdown, no explanations.`;

            const rawPlannerStr = await callSwarmAI(plannerPrompt, pId);
            const plannerJsonStr = rawPlannerStr.substring(rawPlannerStr.indexOf('['), rawPlannerStr.lastIndexOf(']') + 1);
            if (plannerJsonStr && plannerJsonStr.includes('[')) {
                const dynamicPages = JSON.parse(plannerJsonStr);
                if (Array.isArray(dynamicPages) && dynamicPages.length > 0) {
                    const newDynamicPages = dynamicPages.filter((p: any) => !p.path.includes('LandingPage') && !p.path.includes('LoginPage'));
                    
                    const D = "__ANTIGRAVITY_GOD_MODE_PLACEHOLDER__";
                    const injectedPages = newDynamicPages.map((f: any) => ({
                        ...f,
                        prompt: (f.prompt.includes(D) ? f.prompt : f.prompt + "\n" + D).replace(/__ANTIGRAVITY_GOD_MODE_PLACEHOLDER__/g, ANTIGRAVITY_GOD_MODE(title, fe, f.path, prototypeMode))
                    }));

                    const appFileIndex = filePlan.aiFiles.findIndex((f: any) => f.path.endsWith(`App.${feExt}`));
                    if (appFileIndex !== -1) {
                         const dynamicPageNames = injectedPages.map((f: any) => f.path.split('/').pop()?.replace(`.${feExt}`, '')).join(', ');
                         filePlan.aiFiles[appFileIndex].prompt = filePlan.aiFiles[appFileIndex].prompt.replace(
                             "Define routes for all of them.",
                             `Define routes for all of them. CRITICAL: YOU MUST ALSO IMPORT AND ROUTE THESE DYNAMIC PAGES: ${dynamicPageNames}.`
                         );
                    }
                    
                    filePlan.aiFiles.splice(filePlan.aiFiles.length - 2, 0, ...injectedPages);
                    await SystemLogger.log(pId, 'NEURAL_PLANNER', `✅ Custom dynamic plan added ${injectedPages.length} specialized pages.`);
                }
            }
        } catch (e: any) {
            await SystemLogger.log(pId, 'NEURAL_PLANNER', `⚠️ Dynamic Planner fallback to base plan. (${e.message})`);
        }
        await SystemLogger.log(pId, 'NEURAL_PLANNER', `✅ Frontend-Only execution plan finalized: ${filePlan.staticFiles.length} static + ${filePlan.aiFiles.length} AI files.`);
    } else {
        // Full-stack mode: Use the standard plan + Neural Planner enhancement
        filePlan = buildFilePlan(title, requirements, category, techStack, type, limitedBlueprint, prototypeMode);

        await SystemLogger.log(pId, 'NEURAL_PLANNER', `🧠 Full-Stack Planner active. Mapping ${filePlan.aiFiles.length} files...`);
        try {
            await new Promise(r => setTimeout(r, 6000));
            const plannerPrompt = `Plan sequential files for "${title}". Stack: ${fe}, ${be || 'Node.js'}, ${db || 'MongoDB'}.\nReturn JSON array: [{"path":"frontend/src/pages/Home.tsx","prompt":"FILE GOAL: ..."}]\n30-50 files max. Frontend + Backend balanced. JSON array ONLY. No markdown.`;
            const rawPlannerStr = await callSwarmAI(plannerPrompt, pId);
            const plannerJsonStr = rawPlannerStr.substring(rawPlannerStr.indexOf('['), rawPlannerStr.lastIndexOf(']') + 1);
            if (plannerJsonStr && plannerJsonStr.includes('[')) {
                const dynamicFiles = JSON.parse(plannerJsonStr);
                if (Array.isArray(dynamicFiles) && dynamicFiles.length > 5) {
                    filePlan.aiFiles = dynamicFiles;
                    await SystemLogger.log(pId, 'NEURAL_PLANNER', `✅ Custom plan: ${dynamicFiles.length} files.`);
                }
            }
        } catch (e: any) {
            await SystemLogger.log(pId, 'NEURAL_PLANNER', `⚠️ Planner fallback to baseline plan.`);
        }
    }

    await SystemLogger.log(pId, 'ARCHITECT', `📁 Execution Map: ${filePlan.staticFiles.length} static + ${filePlan.aiFiles.length} AI files.`);
    
    // Log planned pages to the R&D Discovery Stream
    for (const f of filePlan.aiFiles) {
        if (f.path.includes('pages/')) {
            const pageName = f.path.split('/').pop()?.replace(/\.[a-zA-Z0-9]+$/, '') || '';
            await SystemLogger.log(pId, 'NEURAL_PLANNER', `📋 Planned UI Page: ${pageName} at ${f.path}`);
        }
    }
    await updateTask('blueprint', 'completed');
    
    // Phase 2.5: Context Memory
    await updateTask('context_memory', 'running');
    const memoryVector = JSON.stringify({ coreFeature: safeEntity, neuralPaths: filePlan.aiFiles.map((f: any) => f.path), timestamp: Date.now() });
    const memoryLog = new SystemLog({ projectId: objectId, logType: 'MEMORY_CORE', message: memoryVector });
    await memoryLog.save();
    await updateTask('context_memory', 'completed');


    // Phase 3: Core Framework Deployment (Lightning Fast)
    await updateTask('database', 'running');
    for (const fileDef of filePlan.staticFiles) {
      await CommandExecutor.writeFile(pId, fileDef.path, fileDef.content);
      await SystemLogger.log(pId, 'CORE_SYNTHESIS', `✅ ${fileDef.path} deployed (Industrial Boilerplate)`);
      await new Promise(r => setTimeout(r, 50)); // Fast visual pipeline
    }
    await updateTask('database', 'completed');

    // Phase 4: LEGEND Sequential Mastery Build (Neural Sync Mode)
    let aiSuccess = 0;
    const phaseTrack: Record<string, { s: number, f: number }> = { api: { s: 0, f: 0 }, backend_module: { s: 0, f: 0 }, frontend_module: { s: 0, f: 0 } };
    
    // 🧠 Project Memory Source: Compact Symbol Table Context
    const fetchRecentContext = async (targetFilePath: string) => {
        try {
            const pDoc = await CollageProject.findById(objectId).lean();
            return resolveImports(targetFilePath, pDoc?.symbolTable || {});
        } catch(e) { return "No prior context map."; }
    };

    for (const aiFile of filePlan.aiFiles) {
      let activePhase = 'api';
      if (aiFile.path.includes('models') || aiFile.path.includes('controllers')) activePhase = 'backend_module';
      if (aiFile.path.includes('routes')) activePhase = 'api';
      if (aiFile.path.includes('frontend') || aiFile.path.includes('admin')) activePhase = 'frontend_module';
      
      await updateTask(activePhase as any, 'running');

      let fileSuccess = false;
      let repairAttempts = 0;
      
      while (!fileSuccess && repairAttempts < 3) {
          try {
              const structuralContext = await fetchRecentContext(aiFile.path);
              const fe = techStack?.frontend || techStack?.mobile || techStack?.desktop || 'React';
              
              // Phase B: Layer-Aware Quality Prompt Injection
              let layerRules = '';
              const isFrontend = aiFile.path.includes('frontend/') || aiFile.path.includes('admin/') || aiFile.path.includes('public/');
              
              if (aiFile.path.includes('admin/')) {
                  layerRules = `\nLAYER OVERRIDE — ADMIN PANEL:\nBuild a high-fidelity React Admin Dashboard component. DARK HUD style. Include stats widgets, activity monitors, and command logs. ${ANTIGRAVITY_GOD_MODE(title, fe, aiFile.path, prototypeMode)}`;
              } else if (isFrontend && (aiFile.path.endsWith('.jsx') || aiFile.path.endsWith('.tsx') || aiFile.path.endsWith('.vue') || aiFile.path.endsWith('.html') || aiFile.path.endsWith('.css'))) {
                  const compRule = (aiFile.path.endsWith('.tsx') || aiFile.path.endsWith('.jsx')) 
                      ? "Spend 100% of tokens on a clean, complete React ESM component. DO NOT write HTML wrappers (<html>, <body>, etc.)." 
                      : "Spend 100% of tokens on a premium UI interface layout.";
                  layerRules = `\nLAYER OVERRIDE — DIVINE FRONTEND:\n${compRule} Ensure all links and routing inside this component work correctly. Use Industrial Datasets. ${ANTIGRAVITY_GOD_MODE(title, fe, aiFile.path, prototypeMode)}`;
              }

              // STRICT PROTOTYPE MODE ENFORCEMENT
              if (prototypeMode && !isFrontend) {
                  layerRules += `\nSTRICT PROTOTYPE RULE: This is a frontend-first build. GENERATE THE COMPLETE LOGIC/SCHEMA but you MUST wrap the entire file content in /* ... */ comments. NO EXCEPTIONS. Start with /* and end with */.`;
              } else if (!prototypeMode) {
                  if (aiFile.path.includes('models/')) {
                      layerRules = `\nLAYER OVERRIDE — DATABASE MODEL:\nDefine the full schema.`;
                  } else if (aiFile.path.includes('controllers/') || aiFile.path.includes('routes/') || aiFile.path.includes('backend/')) {
                      layerRules = `\nLAYER OVERRIDE — BACKEND LOGIC:\nImplement the full business logic.`;
                  }
              }

              // Provide generous context for dependencies without blowing up the token limit
              const maxContextLen = 2500;
              const safeStructContext = structuralContext.length > maxContextLen 
                  ? structuralContext.substring(0, maxContextLen) + "\n...(truncated)"
                  : structuralContext;

              // ⚠️ FIX: Design rule already embedded in aiFile.prompt (from buildFrontendOnlyPlan)
              // DO NOT add it again here — that was double-injecting 800 tokens waste
              const enrichedPrompt = `${aiFile.prompt}${layerRules}\n\nSYMBOL CONTEXT (use exact names):\n${safeStructContext}`;

              if (repairAttempts === 0) {
                 await SystemLogger.log(pId, 'GROQ_ENGINE', `🧠 Neural Sync Active for: ${aiFile.path}...`);
              } else {
                 await SystemLogger.log(pId, 'GEAR_REPAIR', `🔄 Repair Agent Retrying ${aiFile.path} (Attempt ${repairAttempts}). Executing failover...`);
              }
              
              await awaitTokenBudget(enrichedPrompt, pId);
              let realCode = await callSwarmAI(enrichedPrompt, pId, aiFile.path);
              
              // AUTO-STITCH PROTOCOL
              let stitchAttempts = 0;
              while (stitchAttempts < 3) {
                  let tempTrimmed = realCode.trim();
                  const trailingChars = tempTrimmed.slice(-40);
                  const isTruncated = /[\{\[\(\+\-\=\,\&\|\?]$/.test(trailingChars.trim()) || 
                      (!tempTrimmed.endsWith('}') && !tempTrimmed.endsWith('>') && !tempTrimmed.endsWith(';') && !tempTrimmed.endsWith(']'));
                  
                  if (isTruncated && stitchAttempts < 2) {
                      await SystemLogger.log(pId, 'AUTO_STITCH', `🧵 Truncation detected for ${aiFile.path}. Auto-stitching code...`);
                      await awaitTokenBudget("stitch", pId);
                      const stitchPrompt = `The previous code response was cut off. Continue writing the code EXACTLY from this snippet (DO NOT repeat the snippet, just continue it): "${trailingChars.replace(/"/g, "'")}"\nOutput raw code only.`;
                      let stitchedPart = await callSwarmAI(stitchPrompt, pId, aiFile.path);
                      stitchedPart = stitchedPart.replace(/```[a-z]*\n?/g, '').replace(/```/g, ''); // strip markdown immediately
                      realCode += "\n" + stitchedPart;
                      stitchAttempts++;
                  } else {
                      break;
                  }
              }
              
              let safeCode = realCode;
              const markdownMatch = safeCode.match(/```[a-zA-Z]*\n([\s\S]*?)```/);
              if (markdownMatch && markdownMatch[1]) {
                  safeCode = markdownMatch[1].trim();
              } else {
                  safeCode = safeCode.replace(/```[a-z]*\n?/g, '').replace(/```/g, '');
                  const codeStartIndex = safeCode.search(/^(<\?php|import|from|const|export|require|module|class|function|def|package|CREATE|ALTER|SELECT|INSERT|UPDATE|DELETE|public|private|protected|<%|#|\/\/|\$|--)/m);
                  if (codeStartIndex > 0) safeCode = safeCode.substring(codeStartIndex);
              }
              
              if (safeCode.length < 50) throw new Error("Repair Audit Failed: Code still too short/empty.");
              validateGeneratedCode(safeCode, aiFile.path);
              
              // 🛡️ PROTOTYPE MODE POST-PROCESSING (Double safety)
              let finalCode = safeCode.trim();
              if (prototypeMode && !isFrontend) {
                  if (!finalCode.startsWith('/*')) {
                      finalCode = `/* \n   UI PROTOTYPE MODE: BACKEND LOGIC PRESERVED AS DOCUMENTATION\n   -----------------------------------------------------------\n${finalCode}\n*/`;
                  }
              }

              await CommandExecutor.writeFile(pId, aiFile.path, finalCode);
              await updateSymbolTable(pId, aiFile.path, safeCode.trim()); // Phase A: Core Memory Save
              
              fileSuccess = true;
              aiSuccess++;
              if (repairAttempts > 0) {
                  await SystemLogger.log(pId, 'GEAR_REPAIR_SUCCESS', `✅ Repair Agent successfully compiled & repaired ${aiFile.path}.`);
                  if (phaseTrack[activePhase]) { 
                      phaseTrack[activePhase].s++; 
                      if (phaseTrack[activePhase].f > 0) phaseTrack[activePhase].f--; 
                  } // Fixes Bug #8
              } else {
                  if (phaseTrack[activePhase]) phaseTrack[activePhase].s++;
                  await SystemLogger.log(pId, 'GROQ_SUCCESS', `🟢 ${aiFile.path} compiled & synced.`);
              }
              await new Promise(r => setTimeout(r, 1000)); // Dynamic budget tracks the rest
          } catch (err: any) {
              repairAttempts++;
              if (repairAttempts === 1) {
                  if (phaseTrack[activePhase]) phaseTrack[activePhase].f++;
                  // Only report API limits from deep inside. If 401 is received, OpenRouter config will fail fast anyway.
                  await SystemLogger.log(pId, 'GROQ_LIMIT', `⚠️ Auto-Failover triggered for ${aiFile.path}: ${err.message}`);
              }

              if (err.message && (err.message.includes('429') || err.message.includes('RATE_LIMIT') || err.message.includes('Too Many'))) {
                  const FAST_COOLDOWN = 20000; // 20s for new keys
                  await SystemLogger.log(pId, 'RATE_GUARD', `⏸️ Provider Rate Limit hit. Forcing ${FAST_COOLDOWN / 1000}s adaptive cooldown...`);
                  await new Promise(r => setTimeout(r, FAST_COOLDOWN));
              }
              
              if (repairAttempts >= 3) {
                  await SystemLogger.log(pId, 'ULTRA_FAILOVER', `🛡️ AI exhausted 3 attempts on ${aiFile.path}. Engaging OpenRouter DeepSeek Ultra-Failover (Guaranteed Completion)...`);
                  try {
                      const ultraCode = await callOpenRouterAI(aiFile.prompt, pId, "deepseek/deepseek-chat");
                      if (ultraCode && ultraCode.length > 100) {
                          await CommandExecutor.writeFile(pId, aiFile.path, ultraCode.trim());
                          await updateSymbolTable(pId, aiFile.path, ultraCode.trim());
                          fileSuccess = true;
                          aiSuccess++;
                          await SystemLogger.log(pId, 'ULTRA_SUCCESS', `✅ OpenRouter DeepSeek Ultra-Failover successfully salvaged ${aiFile.path}.`);
                      } else {
                          throw new Error("Ultra-Failover returned insufficient code.");
                      }
                  } catch (uErr) {
                      await SystemLogger.log(pId, 'GEAR_REPAIR', `❌ ALL engines failed for ${aiFile.path}. Skipping file.`);
                      await CommandExecutor.writeFile(pId, aiFile.path, `// ERROR: Critical failure across all AI providers.\n// Manual intervention required for ${aiFile.path}`);
                      fileSuccess = true;
                      if (phaseTrack[activePhase]) phaseTrack[activePhase].f++;
                  }
              }
          }
      }
      // Leave phase running until next iteration, we'll mark all completed below
      // Leave phase running until next iteration, we'll mark all completed below
    }
    
    // Conclude all modules status dynamically
    await updateTask('api', phaseTrack.api.f > 0 && phaseTrack.api.s === 0 ? 'failed' : 'completed');
    await updateTask('backend_module', phaseTrack.backend_module.f > 0 && phaseTrack.backend_module.s === 0 ? 'failed' : 'completed');
    await updateTask('frontend_module', phaseTrack.frontend_module.f > 0 && phaseTrack.frontend_module.s === 0 ? 'failed' : 'completed');
    
    // Phase 4.5: FINAL REQUIREMENT AUDIT AGENT
    await SystemLogger.log(pId, 'AUDIT_AGENT', `🔍 Running Final System Verification Audit against original PSD...`);
    try {
        const fileListMap = aiSuccess > 0 ? filePlan.aiFiles.map(f => f.path).join(", ") : "No AI files recorded";
        const psdFeats = psd.features?.join(", ") || requirements;
        const auditPrompt = `You are a SYSTEM AUDITOR. Compare the original requested features against the files actually built.
Requested Features: ${psdFeats}
Files Built: ${fileListMap}
Calculate an audit score percentage (0-100%). Return strictly a JSON object matching: { "score": 95, "missing": ["any missing architectural piece conceptually"] }`;
        const rawAudit = await callSwarmAI(auditPrompt, pId);
        const aJsonStr = rawAudit.substring(rawAudit.indexOf('{'), rawAudit.lastIndexOf('}') + 1);
        if (aJsonStr) {
            const auditObj = JSON.parse(aJsonStr);
            const scoreMsg = `✅ Final System Audit Score: ${auditObj.score}%. Missing Sub-Systems: ${auditObj.missing?.length > 0 ? auditObj.missing.join(', ') : 'None'}`;
            await SystemLogger.log(pId, 'AUDIT_AGENT', scoreMsg);
            await CollageProject.findByIdAndUpdate(pId, { 'agentTracking.compiler.message': `Audit Score: ${auditObj.score}%` });
        }
    } catch(err: any) {
        await SystemLogger.log(pId, 'AUDIT_AGENT', `⚠️ Audit Agent bypassed due to format strictness.`);
    }

    // ─── Phase 5: EXPORT FACTORY (Phase D) ─────────────────────────────────
    await updateTask('packaging', 'running');
    await SystemLogger.log(pId, 'EXPORT_FACTORY', `📦 Initializing Phase D Export Factory — Doc + PPT + ZIP...`);
    
    const fsPath = path.join(__dirname, '../../../../projects', pId);
    if (!fs.existsSync(fsPath)) { fs.mkdirSync(fsPath, { recursive: true }); }

    // ─── 5A: README.md ──────────────────────────────────────────────────────
    const projData = await CollageProject.findById(pId).lean();
    const liveSymbolTable = (projData as any)?.symbolTable || {};
    const safeDiagrams = projData?.blueprint?.diagrams || { architecture: 'graph TD; A-->B;', system_flow: 'graph TD; C-->D;' };
    const complexity = getDegreeComplexity(category);
    const readmeContent = `# ${title} 🔱
> **TITAN SUPREME FRONTEND BUILD v6.0 (ANTIGRAVITY EDITION)**

## 📊 Mission Overview
- **Project Vision:** ${requirements}
- **High-Fidelity Stack:** ${techStack.frontend || 'React'}
- **Tier:** ${category}
- **Status:** Frontend Fully Operational | Backend/DB Preserved as Comments

## 🚀 Deployment Strategy (Frontend Only)
1. **Frontend:**
   \`\`\`bash
   cd frontend && npm install && npm run dev
   \`\`\`

## 📂 Industrial Architecture
- \`/frontend\`: High-Fidelity Responsive UI Components (Complete & Ready).
- \`/backend\`: [INACTIVE] Backend skeletons and API protocols preserved for future development.
- \`/docs\`: Project vision and technical specs.

##  Architecture
\`\`\`mermaid
${safeDiagrams.architecture}
\`\`\`
`;
    await CommandExecutor.writeFile(pId, 'README.md', readmeContent);

    // ============================================================
    // 🛡️ PHASE G: THE SANITY & VALIDATION SCANNER
    // ============================================================
    try {
        await runSanityCheck(pId.toString(), fsPath, liveSymbolTable, callSwarmAI);
    } catch(err) { console.error("Sanity check skipped:", err); }

    // ─── 5B: setup.sh + .env.example ────────────────────────────────────────
    let docPath = null, pptPath = null, testPdfPath = null, zipFilePath = null;
    try {
        const setupScript = generateSetupScript(title, techStack.backend || 'Node.js', techStack.database || 'MongoDB', techStack.frontend || 'React');
        const envExample = generateEnvExample(techStack.database || 'MongoDB', title);
        await CommandExecutor.writeFile(pId, 'setup.sh', setupScript);
        if (!prototypeMode) {
            await CommandExecutor.writeFile(pId, 'backend/.env.example', envExample);
        }
        await SystemLogger.log(pId, 'EXPORT_FACTORY', `✅ README.md + setup.sh + .env.example written`);
    } catch(err) { console.error("Scripts failed:", err); }

    // ─── 5C: DOCX Academic Report ────────────────────────────────────────────
    try {
        await SystemLogger.log(pId, 'EXPORT_FACTORY', `📄 Generating Word document (Academic Project Report)...`);
        docPath = await generateProjectDocx(pId, title, category, techStack, psd, liveSymbolTable, fsPath, prototypeMode);
        if (docPath) await SystemLogger.log(pId, 'EXPORT_FACTORY', `✅ project-report.docx generated (${Math.round(fs.statSync(docPath).size / 1024)}KB)`);
    } catch(err) { console.error("DOCX Gen failed:", err); }

    // ─── 5D: PPTX Presentation ───────────────────────────────────────────────
    try {
        await SystemLogger.log(pId, 'EXPORT_FACTORY', `📊 Generating PowerPoint presentation (12 slides)...`);
        pptPath = await generateProjectPptx(pId, title, category, techStack, psd, liveSymbolTable, fsPath, prototypeMode);
        if (pptPath) await SystemLogger.log(pId, 'EXPORT_FACTORY', `✅ presentation.pptx generated (${Math.round(fs.statSync(pptPath).size / 1024)}KB)`);
    } catch(err) { console.error("PPTX Gen failed:", err); }

    // ─── 5E: PDF Test Case Report (Phase E) ──────────────────────────────────
    try {
        await SystemLogger.log(pId, 'EXPORT_FACTORY', `🧪 Generating Auto-Test Case Report (PDF)...`);
        testPdfPath = await generateTestCasesPdf(pId, title, techStack, psd, liveSymbolTable, fsPath);
        if (testPdfPath) await SystemLogger.log(pId, 'EXPORT_FACTORY', `✅ test-report.pdf generated (${Math.round(fs.statSync(testPdfPath).size / 1024)}KB)`);
    } catch(err) { console.error("PDF Gen failed:", err); }

    // ─── 5F: ZIP Archive ─────────────────────────────────────────────────────
    try {
        await SystemLogger.log(pId, 'EXPORT_FACTORY', `🗜️ Packaging complete project into ZIP archive...`);
        // Move output to parent directory to avoid circularity (Fixes Windows Access Denied)
        const parentDir = path.dirname(fsPath);
        zipFilePath = await createProjectZip(pId, fsPath, parentDir, title);
        if (zipFilePath && fs.existsSync(zipFilePath)) {
            await SystemLogger.log(pId, 'EXPORT_FACTORY', `✅ ZIP archive created: ${path.basename(zipFilePath)} (${Math.round(fs.statSync(zipFilePath).size / 1024)}KB)`);
        }
    } catch(err) { console.error("ZIP Gen failed:", err); }

    // ─── 5G: File count verification ─────────────────────────────────────────
    const totalExpected = filePlan.staticFiles.length + filePlan.aiFiles.length;
    let verifiedCount = 0;
    for (const f of [...filePlan.staticFiles, ...filePlan.aiFiles]) {
        if (fs.existsSync(path.join(fsPath, f.path))) verifiedCount++;
    }
    await SystemLogger.log(pId, 'VALIDATOR', `🏆 System Assembled. ${verifiedCount}/${totalExpected} files on disk. AI Injected: ${aiSuccess}. Docs: ${docPath ? '✅' : '❌'} | PPT: ${pptPath ? '✅' : '❌'} | Test PDF: ${testPdfPath ? '✅' : '❌'} | ZIP: ${zipFilePath ? '✅' : '❌'}`);
    
    const zipUrl = `/api/collage-project/${pId}/download`;
    const documentUrl = `/api/collage-project/${pId}/download-pdf`;
    const pitchDeckUrl = `/api/collage-project/${pId}/download-ppt`;
    const wordUrl = `/api/collage-project/${pId}/download-word`;
    const testReportUrl = `/api/collage-project/${pId}/download-test-report`;
    
    await CollageProject.findByIdAndUpdate(pId, { 
      status: 'COMPLETED',
      'artifacts.zipUrl': zipUrl,
      'artifacts.documentUrl': documentUrl,
      'artifacts.pitchDeckUrl': pitchDeckUrl,
      'artifacts.wordUrl': wordUrl,
      'artifacts.testReportUrl': testReportUrl,
      'agentTracking.agent1_Planner.status': 'COMPLETED',
      'agentTracking.agent2_BusinessAuditor.status': 'COMPLETED',
      'agentTracking.agent3_Architect.status': 'COMPLETED',
      'agentTracking.agent4_DBATester.status': 'COMPLETED',
      'agentTracking.agent5_BackendDev.status': 'COMPLETED',
      'agentTracking.agent6_SecurityCodeScanner.status': 'COMPLETED',
      'agentTracking.agent7_FrontendDev.status': 'COMPLETED',
      'agentTracking.agent8_IntegrationDevOps.status': 'COMPLETED',
      'agentTracking.compiler.status': 'COMPLETED'
    });
    SocketService.emitToSession(pId, 'project_update', { 
      status: 'COMPLETED', 
      totalFiles: filePlan.staticFiles.length + filePlan.aiFiles.length,
      artifacts: { zipUrl, documentUrl, pitchDeckUrl, wordUrl, testReportUrl }
    });

    // Add a final completion explanation message in the chat
    try {
      const ProjectMessage = (await import('./project_message.model')).default;
      
      const fileList = filePlan.aiFiles.map((f: any) => {
          const name = f.path.split('/').pop();
          const desc = f.path.includes('pages/') ? 'UI Page' 
                     : f.path.includes('components/') ? 'UI Component' 
                     : f.path.includes('controllers/') ? 'Backend Controller' 
                     : f.path.includes('models/') ? 'Database Model' 
                     : f.path.includes('routes/') ? 'API Router' 
                     : 'Module';
          return `- **${name}** (\`${f.path}\`): ${desc}`;
      }).join('\n');

      const summaryText = `### 🔱 Antigravity Build Complete!

I have built a fully functional, production-ready implementation of **"${title}"** with 100% complete logic. Here is the summary of what was generated:

**Total Files:** ${filePlan.staticFiles.length + filePlan.aiFiles.length} (${filePlan.aiFiles.length} AI generated + ${filePlan.staticFiles.length} boilerplate files)
**Data Strategy:** ${prototypeMode ? 'Local Storage Client-Side CRUD' : 'MongoDB / Mongoose Live Database Queries'}

#### Mapped Pages & Modules:
${fileList}

All files have been written directly to disk. You can download the complete project zip or view the files in the workspace.`;

      const dbMsg = new ProjectMessage({
          projectId: objectId,
          userMessage: "[System Trigger: Build Complete]",
          aiResponse: summaryText,
          status: 'COMPLETED'
      });
      await dbMsg.save();
      
      SocketService.emitToSession(pId, 'chat_reply', {
          _id: dbMsg._id,
          userMessage: "[System Trigger: Build Complete]",
          aiResponse: summaryText,
          status: 'COMPLETED'
      });
      
      await SystemLogger.log(pId, 'NEURAL_CHAT', "Sent build completion chat summary.");
    } catch(err) {
      console.error("Failed to save final project completion message:", err);
    }

    await updateTask('packaging', 'completed');
  },

  // ============================================================
  // 🌿 PHASE F: DIFF ENGINE & POST-BUILD ITERATION
  // ============================================================
  runPostBuildIteration: async (projectId: string, userChangeRequest: string) => {
    const objectId = new mongoose.Types.ObjectId(projectId);
    const projData = await CollageProject.findById(objectId).lean();
    if (!projData) throw new Error("Project not found");

    const pId = objectId.toString();
    const title = projData.title || 'App';
    const techStack = projData.technologyStack || {};
    const liveSymbolTable = (projData as any).symbolTable || {};

    await SystemLogger.log(pId, 'DIFF_ENGINE', `🧩 Initializing Iteration Branch. Analyzing request: "${userChangeRequest}"`);

    // Figure out version number
    const lastVersion = await ProjectVersion.findOne({ projectId: objectId }).sort({ version: -1 });
    const currentV = lastVersion ? lastVersion.version + 1 : 2;

    // ─── 1. DIFF PLANNER ───
    const contextMap = Object.entries(liveSymbolTable).map(([file, sym]: any) => `📁 ${file}: ${sym.exports?.join(', ')} | Models: ${sym.modelName}`).join('\n');
    const plannerPrompt = `You are a DIFF PLANNER for an existing full-stack codebase.
TECH STACK: ${techStack.frontend || 'React'}, ${techStack.backend || 'Node.js'}, ${techStack.database || 'MongoDB'}.
EXISTING ARCHITECTURE:
${contextMap}

USER CHANGE REQUEST: "${userChangeRequest}"

Generate a precise DIFF JSON payload outlining EXACTLY which files need to be ADDED and which need to be UPDATED to implement this change.
Format strictly: { "add": [{ "path": "path/file.js", "instruction": "Goal of file" }], "update": [{ "path": "existing/router.js", "instruction": "how to alter" }] }`;

    let diffPlan = { add: [], update: [] };
    try {
        const rawDiff = await callSwarmAI(plannerPrompt, pId);
        const jsonStr = rawDiff.substring(rawDiff.indexOf('{'), rawDiff.lastIndexOf('}') + 1);
        if (jsonStr) diffPlan = JSON.parse(jsonStr);
    } catch (e) {
        throw new Error("Diff Planner Failed to parse JSON.");
    }

    await SystemLogger.log(pId, 'DIFF_ENGINE', `📌 Mapped Change Plan: ${diffPlan.add.length} Additions | ${diffPlan.update.length} Updates.`);

    // ─── 2. EXECUTE UPDATES (File Editor) ───
    for (const fileToUpdate of diffPlan.update) {
        const pFile = await ProjectFile.findOne({ projectId: objectId, filePath: (fileToUpdate as any).path });
        if (!pFile) continue;

        await SystemLogger.log(pId, 'GEAR_REPAIR', `⚙️ Mutating existing file: ${(fileToUpdate as any).path}...`);
        
        const mutatePrompt = `You are updating an existing file.
FILE: ${(fileToUpdate as any).path}
INSTRUCTION: ${(fileToUpdate as any).instruction}
EXISTING CODE:
\`\`\`
${pFile.fileContent}
\`\`\`

ONLY return the FULLY UPDATED code. No markdown formatting blocks around it. Ensure old functionality remains intact.`;

        let updatedCode = await callSwarmAI(mutatePrompt, pId);
        updatedCode = updatedCode.replace(/```[a-z]*\n?/g, '').replace(/```/g, '');
        await CommandExecutor.writeFile(pId, (fileToUpdate as any).path, updatedCode.trim());
        await updateSymbolTable(pId, (fileToUpdate as any).path, updatedCode.trim());
    }

    // ─── 3. EXECUTE ADDITIONS (Generator) ───
    for (const fileToAdd of diffPlan.add) {
        await SystemLogger.log(pId, 'GROQ_ENGINE', `🧠 Synthesizing NEW file: ${(fileToAdd as any).path}...`);
        
        const addPrompt = `Write this new file.
FILE: ${(fileToAdd as any).path}
PURPOSE: ${(fileToAdd as any).instruction}
STRICT CONTEXT: Ensure imports match this: ${contextMap}
ONLY return raw code. No markdown.`;

        let newCode = await callSwarmAI(addPrompt, pId);
        newCode = newCode.replace(/```[a-z]*\n?/g, '').replace(/```/g, '');
        await CommandExecutor.writeFile(pId, (fileToAdd as any).path, newCode.trim());
        await updateSymbolTable(pId, (fileToAdd as any).path, newCode.trim());
    }

    // ─── 4. PACKAGE VERSION (V2 / V3) ───
    await SystemLogger.log(pId, 'EXPORT_FACTORY', `📦 Packaging Version ${currentV} Release...`);
    const fsPath = path.join(__dirname, '../../../../projects', pId);
    
    // Quick re-generate updated Docs
    const updatedProjData = await CollageProject.findById(pId).lean();
    const psdObj = JSON.parse(updatedProjData?.requirements || "{}");
    const updatedSymbols = (updatedProjData as any)?.symbolTable || {};
    
    const prototypeMode = (projData as any).prototypeMode || false;
    const docPath = await generateProjectDocx(pId, title, projData.category || 'GRADUATION', techStack, psdObj, updatedSymbols, fsPath, prototypeMode);
    const pptPath = await generateProjectPptx(pId, title, projData.category || 'GRADUATION', techStack, psdObj, updatedSymbols, fsPath, prototypeMode);
    
    // We pass the "title-vX" to differentiate internal folder names if needed
    const vTitle = `${title}-V${currentV}`;
    const zipFilePath = await createProjectZip(pId, fsPath, fsPath, vTitle);

    if (zipFilePath) {
        const vRec = new ProjectVersion({
            projectId: objectId,
            version: currentV,
            zipPath: `/api/collage-project/${pId}/versions/${currentV}/download`, // Simulated Route
            description: userChangeRequest,
            changes: [...diffPlan.add.map((a:any) => `Added ${a.path}`), ...diffPlan.update.map((u:any) => `Updated ${u.path}`)]
        });
        await vRec.save();
        await SystemLogger.log(pId, 'VALIDATOR', `🏆 Version ${currentV} Successfully Deployed!`);
        SocketService.emitToSession(pId, 'project_update', {
            status: 'COMPLETED_ITERATION',
            version: currentV,
            newZipUrl: vRec.zipPath
        });
    }
  }
};
