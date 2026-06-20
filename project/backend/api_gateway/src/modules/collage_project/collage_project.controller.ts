import { Request, Response } from 'express';
import mongoose from 'mongoose';
import CollageProject from './collage_project.model';
import ProjectMessage from './project_message.model';
import ProjectVersion from './project_version.model';
import ProjectBuildStatus from './project_build_status.model';
import ProjectFile from './project_file.model';
import EducationDomain from './education_domain.model';
import { multiAgentService } from './multi_agent.service';

const success = (res: Response, message: string, data: any = {}) => res.json({
    success: true,
    status: "success",
    message,
    ...data
});
const error = (res: Response, message: string, code: string = 'INTERNAL_ERROR') => {
    const statusCode = code === 'NOT_FOUND' ? 404 : code === 'THROTTLE_BLOCK' ? 429 : 500;
    return res.status(statusCode).json({
        success: false,
        status: "error",
        message,
        error_code: code
    });
};

// Memory-based per-user throttle map
const userLastRequest = new Map<string, number>();

// Sanitize Pollinations AI image links in Markdown (combines newlines and encodes prompt parts)
const sanitizeMarkdownImages = (text: string): string => {
    if (!text) return text;
    // 1. Remove newlines and whitespace between ![...] and (...)
    let sanitized = text.replace(/!\[([^\]]*)\]\s*\n+\s*\(([^)]+)\)/g, '![$1]($2)');
    
    // 2. Find pollinations.ai URLs and URL-encode their prompts safely
    sanitized = sanitized.replace(/https:\/\/image\.pollinations\.ai\/prompt\/([^?)\s]+(?:\s+[^?)\s]+)*)(?=\?|\)|$)/g, (match, promptPart) => {
        return `https://image.pollinations.ai/prompt/${encodeURIComponent(promptPart.trim())}`;
    });
    
    return sanitized;
};


export const collageProjectController = {
    // PROJECT MANAGEMENT
    createProject: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const now = Date.now();
            const lastTime = userLastRequest.get(userId) || 0;
            if (now - lastTime < 3000) return error(res, "Request throttled. Please wait 3 seconds.", "THROTTLE_BLOCK");
            userLastRequest.set(userId, now);

            const { title, requirements, category, field, type, technologyStack, prototypeMode } = req.body;
            if (!title || !requirements) return error(res, "Title and requirements are mandatory.", "VALIDATION_FAILED");

            const existing = await CollageProject.findOne({
                userId,
                title,
                status: 'GENERATING'
            });

            if (existing) {
                return success(res, "Build already in progress", { project: existing });
            }
            const project = new CollageProject({
                userId,
                title,
                requirements,
                category,
                field,
                type,
                technologyStack,
                prototypeMode: prototypeMode !== undefined ? prototypeMode : true, // Default to true for Frontend-First
                status: 'GENERATING'
            });
            await project.save();

            // P3: Integrate Versioning System
            const ProjectVersion = (await import('./project_version.model')).default;
            const newVersion = new ProjectVersion({
                projectId: project._id,
                version: 1.0,
                zipPath: `/api/collage-project/${project._id}/download`,
                changes: ['Initial Neural Blueprint Synthesis']
            });
            await newVersion.save();

            // Auto-trigger build pipeline via Antigravity Mode
            // OMEGA PIPELINE: Initialize File Registry for Advanced Tracking
            const FileRegistry = (await import('./file_registry.model')).default;
            await FileRegistry.deleteMany({ projectId: project._id });
            await new FileRegistry({
                projectId: project._id,
                filePath: '/project_root_initialized',
                status: 'completed',
                exports: [],
                imports: [],
                dependsOn: []
            }).save();

            multiAgentService.startProjectBuild(project).catch(err => {
                console.error("Autonomous Build Initiation Failed:", err);
            });

            success(res, "Autonomous project building initiated", { project });
        } catch (err: any) { error(res, err.message, "CREATE_FAILED"); }
    },
    discoveryChat: async (req: Request, res: Response) => {
        try {
            const { message, context, history } = req.body;
            if (!context || !context.title) return error(res, "Title context is mandatory.", "VALIDATION_FAILED");

            const { multiAgentService } = await import('./multi_agent.service');
            
            // 🌐 DEEP RESEARCH & WEB SCRAPER INTEGRATION
            let webContext = "";
            const urlRegex = /(https?:\/\/[^\s]+)/g;
            const urls = message ? message.match(urlRegex) : [];
            
            if (urls && urls.length > 0) {
                const axios = require('axios');
                const cheerio = require('cheerio');
                try {
                    for (const url of urls) {
                        const response = await axios.get(url, { 
                            timeout: 10000, 
                            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' } 
                        });
                        const html = response.data;
                        const $ = cheerio.load(html);
                        
                        // Clean up unnecessary tags
                        $('script, style, noscript, iframe, img, svg, video, path').remove();
                        
                        const title = $('title').text() || $('meta[property="og:title"]').attr('content') || '';
                        const metaDesc = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || '';
                        const siteName = $('meta[property="og:site_name"]').attr('content') || '';
                        const author = $('meta[name="author"]').attr('content') || '';
                        let textContent = $('body').text().replace(/\s+/g, ' ').trim();
                        
                        // Truncate to prevent token overflow
                        if (textContent.length > 8000) textContent = textContent.substring(0, 8000) + '...';
                        
                        webContext += `\n[LIVE_WEB_CONTEXT for ${url}]\nPlatform/Site: ${siteName}\nAuthor: ${author}\nTitle: ${title}\nDescription: ${metaDesc}\nContent Excerpt: ${textContent}\n`;
                    }
                } catch (e: any) {
                    console.error("Web Scraper Error:", e.message);
                    webContext += `\n[LIVE_WEB_CONTEXT for ${urls.join(', ')}]\nFailed to fetch live URL content. The website might have bot-protection. Proceed based on URL string inference.\n`;
                }
            }

            const historyText = history ? history.map((m: any) => `${m.role === 'user' ? 'User' : 'Agent'}: ${m.text}`).join('\n') : '';

            const prompt = `You are a highly intelligent Dual-Mode AI. You act as an Expert Senior Software Engineer and a Technical Architect interacting with a client.
Project Title: "${context.title}"
Type: ${context.type} | Sector: ${context.field}

Current Chat History:
${historyText}

User's latest message: "${message || 'Hi, I want to build this project.'}"
${webContext ? `\nCRITICAL LIVE DATA (Scraped from user's link):\n${webContext}\nAnalyze this data heavily to perfectly answer their questions about companies, code logic, platforms, developers, and tech stacks.` : ''}

You operate in DUAL-MODE based on the user's intent:

MODE A: PROBLEM SOLVING & CODING ASSISTANT
If the user is asking a coding question, debugging an error, asking for technology explanations, or sharing a StackOverflow/GitHub/Technical link:
1. Act purely as an Elite Senior Developer.
2. Provide exact, real-world code solutions, debugging steps, and technical explanations.
3. Use the EXACT language the user speaks (e.g. Hinglish/Hindi if they use it).
4. DO NOT write a SaaS project proposal. DO NOT ask them to approve a "Build Mission". Just solve their problem perfectly.
5. If explaining a complex architecture or UI concept, embed an illustrative image using: ![Alt](https://image.pollinations.ai/prompt/{url-encoded-detailed-description}?width=800&height=400&nologo=true)

MODE B: PROJECT ARCHITECT & BUILDER
If the user is explicitly discussing building a new software project or feature set:
1. Act like an advanced Architect doing a deep-dive session. 
2. Write a highly detailed pitch covering: Main Problem, User Roles, Core Functions, and Admin Panel.
3. Use the EXACT language the user speaks.
4. PAGE MANIFEST: You MUST list all pages to be developed in a Markdown table with columns: Page # | Page Name | Route Path | Functional Description | Key UI Components. State the total page count clearly (e.g. "Total Pages: 8").
5. VISUALS: You MUST embed 1 or 2 stunning conceptual images related to the user's project idea using this exact markdown format: ![UI Concept](https://image.pollinations.ai/prompt/{url-encoded-detailed-ui-concept-description}?width=800&height=400&nologo=true)
6. Call to Action: Ask if they approve this for the final Build Mission.

AUTO-COMPLETION RULE (Applies to Mode B only):
If the user explicitly approves the final project requirements, output STRICT JSON describing the final parsed requirements.
If COMPLETE, output ONLY a JSON object exactly like this:
{
  "status": "COMPLETE",
  "actors": ["user type 1", "admin"],
  "features": ["feature 1", "feature 2", "feature 3"],
  "pages": [
     { "name": "LandingPage", "path": "frontend/src/pages/LandingPage.tsx", "description": "Welcome Page with Hero and Features" }
  ],
  "techDecisions": { "auth": "JWT", "payment": "Stripe" },
  "summary": "Full comprehensive project requirements stringified here."
}
NEVER wrap JSON in markdown.`;

            const aiResponse = await multiAgentService.callAI(prompt, 'discovery_agent');
            let isComplete = false;
            let document = null;
            let question = aiResponse || "⚠️ System Alert: API is currently hitting extreme Rate Limits. Please wait a minute and try again.";

            // Apply markdown image sanitization
            question = sanitizeMarkdownImages(question);

            if (aiResponse.includes('"COMPLETE"') && aiResponse.includes('{') && aiResponse.includes('}')) {
                const jsonStr = aiResponse.substring(aiResponse.indexOf('{'), aiResponse.lastIndexOf('}') + 1);
                try {
                    document = JSON.parse(jsonStr);
                    isComplete = true;
                    question = "Discovery completed successfully.";
                } catch (e) {
                    console.error("Discovery JSON parse failed", e);
                }
            }

            success(res, "Discovery agent responded", { question, isComplete, document });
        } catch (err: any) { error(res, err.message, "DISCOVERY_ERROR"); }
    },
    getProject: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const project = await CollageProject.findOne({ _id: req.params.id, userId }).lean();
            if (!project) return error(res, "Project not found or unauthorized access", "NOT_FOUND");
            success(res, "Project retrieved", { project });
        } catch (err: any) { error(res, err.message); }
    },
    listProjects: async (req: Request, res: Response) => {
        try {
            const projects = await CollageProject.find({ userId: (req as any).user.id }).sort({ createdAt: -1 });
            success(res, "Projects listed", { projects });
        } catch (err: any) { error(res, err.message); }
    },
    getUserProjects: async (req: Request, res: Response) => {
        // Alias for listProjects to stay compatible with old routes
        return collageProjectController.listProjects(req, res);
    },
    deleteProject: async (req: Request, res: Response) => {
        try {
            const projectId = new mongoose.Types.ObjectId(req.params.id);
            const userId = (req as any).user.id;

            const existing = await CollageProject.findOne({ _id: projectId, userId });
            if (!existing) return error(res, "Project not found or you don't have permission to delete it.", "NOT_FOUND");

            await CollageProject.findByIdAndDelete(projectId);

            // Cascade Delete Cleanup
            const ProjectFile = (await import('./project_file.model')).default;
            const ProjectTask = (await import('./project_task.model')).default;
            const SystemLog = (await import('./system_log.model')).default;
            const ProjectMessage = (await import('./project_message.model')).default;
            const ProjectVersion = (await import('./project_version.model')).default;
            const ProjectBuildStatus = (await import('./project_build_status.model')).default;

            await ProjectFile.deleteMany({ projectId });
            await ProjectTask.deleteMany({ projectId });
            await SystemLog.deleteMany({ projectId });
            await ProjectMessage.deleteMany({ projectId });
            await ProjectVersion.deleteMany({ projectId });
            await ProjectBuildStatus.deleteMany({ projectId });

            success(res, "Project and all associated data purged.");
        } catch (err: any) { error(res, err.message); }
    },

    // BUILD PIPELINE
    buildProject: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const now = Date.now();
            const lastTime = userLastRequest.get(userId) || 0;
            if (now - lastTime < 3000) return error(res, "Request throttled. Please wait 3 seconds.", "THROTTLE_BLOCK");
            userLastRequest.set(userId, now);

            const project = await CollageProject.findOne({ _id: req.params.id, userId });
            if (!project) return error(res, "Project not found or unauthorized.", "NOT_FOUND");

            if (project.status === 'GENERATING') return error(res, "Build already running for this project.", "DUPLICATE_BLOCK");

            project.status = 'GENERATING';
            await project.save();

            // Integrate Version Bump for Pipeline Re-Runs
            const ProjectVersion = (await import('./project_version.model')).default;
            const lastVersion = await ProjectVersion.findOne({ projectId: project._id }).sort({ createdAt: -1 });
            const prevVer = lastVersion ? lastVersion.version : 1.0;
            const newVersionNum = parseFloat((prevVer + 0.1).toFixed(1));

            await new ProjectVersion({
                projectId: project._id,
                version: newVersionNum,
                zipPath: `/api/collage-project/${project._id}/download`,
                changes: ['Autonomous Build Pipeline Re-Activated']
            }).save();

            const ProjectBuildStatus = (await import('./project_build_status.model')).default;
            await ProjectBuildStatus.findOneAndUpdate(
                { projectId: project._id },
                { status: 'GENERATING', progress: 0 },
                { upsert: true }
            );

            multiAgentService.startProjectBuild(project).catch(console.error);
            success(res, "Autonomous build pipeline started", { project_id: project._id, version: newVersionNum });
        } catch (err: any) { error(res, err.message); }
    },
    approveManifest: async (req: Request, res: Response) => {
        // Alias for buildProject to stay compatible with old routes
        return collageProjectController.buildProject(req, res);
    },
    getBuildStatus: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const project = await CollageProject.findOne({ _id: req.params.id, userId });
            if (!project) return error(res, "Unauthorized", "NOT_FOUND");

            const status = await ProjectBuildStatus.findOne({ projectId: req.params.id });
            success(res, "Current build status", { status: status?.status || 'PENDING' });
        } catch (err: any) { error(res, err.message); }
    },

    // BLUEPRINT
    generateBlueprint: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const project = await CollageProject.findOne({ _id: req.params.id, userId });
            if (!project) return error(res, "Project not found or unauthorized", "NOT_FOUND");

            /** F5: Autonomous Standalone Blueprint Synthesis */
            const { multiAgentService } = await import('./multi_agent.service');
            multiAgentService.generateBlueprintOnly(req.params.id).catch(console.error);

            success(res, "Autonomous Blueprint synthesis initialized on background thread.");
        } catch (err: any) { error(res, err.message); }
    },
    getBlueprint: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const project = await CollageProject.findOne({ _id: req.params.id, userId });
            if (!project?.blueprint) return error(res, "Blueprint not yet synthesized or unauthorized.", "NOT_FOUND");
            success(res, "Blueprint retrieved", { blueprint: project.blueprint });
        } catch (err: any) { error(res, err.message); }
    },

    // CHAT & FEATURES
    chatUpdate: async (req: Request, res: Response) => {
        try {
            const { message } = req.body;
            if (!message || !message.trim()) return error(res, "Message cannot be empty", "VALIDATION_FAILED");

            const userId = (req as any).user.id;
            const project = await CollageProject.findOne({ _id: req.params.id, userId });
            if (!project) return error(res, "Project not found or unauthorized", "NOT_FOUND");

            multiAgentService.handleChatUpdate(project, message).catch(console.error);
            success(res, "Instruction received by Feature Injection Engine");
        } catch (err: any) { error(res, err.message); }
    },
    handleProjectChat: async (req: Request, res: Response) => {
        // Alias for compatibility
        return collageProjectController.chatUpdate(req, res);
    },
    getChatHistory: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const objectId = new mongoose.Types.ObjectId(req.params.id);
            const project = await CollageProject.findOne({ _id: objectId, userId });
            if (!project) return error(res, "Unauthorized", "NOT_FOUND");

            const history = await ProjectMessage.find({ projectId: objectId }).sort({ createdAt: 1 });
            success(res, "Chat history retrieved", { history });
        } catch (err: any) { error(res, err.message); }
    },
    getProjectVersions: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const objectId = new mongoose.Types.ObjectId(req.params.id);
            const project = await CollageProject.findOne({ _id: objectId, userId });
            if (!project) return error(res, "Unauthorized", "NOT_FOUND");

            const versions = await ProjectVersion.find({ projectId: objectId }).sort({ createdAt: -1 });
            success(res, "Version history retrieved", { versions });
        } catch (err: any) { error(res, err.message); }
    },

    // DOMAIN & SYNERGY (Missing from new version but used by UI)
    getEducationDomains: async (req: Request, res: Response) => {
        try {
            const count = await EducationDomain.countDocuments();
            if (count === 0) {
                await EducationDomain.insertMany([
                    { name: 'Computer Science', code: 'CS_IT', description: 'Web, Apps, AI, Data Science', isActive: true },
                    { name: 'Business Administration', code: 'BBA_MBA', description: 'Management, FinTech', isActive: true },
                    { name: 'Mechanical Engineering', code: 'MECH', description: 'CAD, Systems', isActive: true }
                ]);
            }
            const domains = await EducationDomain.find({ isActive: true });
            success(res, "Domains retrieved", { domains });
        } catch (err: any) { error(res, err.message); }
    },
    searchDomains: async (req: Request, res: Response) => {
        try {
            const { query } = req.query;
            if (!query) return success(res, "No query provided", { domains: [] });
            const domains = await EducationDomain.find({
                $or: [
                    { name: { $regex: query as string, $options: 'i' } },
                    { code: { $regex: query as string, $options: 'i' } }
                ]
            });
            success(res, "Search results", { domains });
        } catch (err: any) { error(res, err.message); }
    },
    getSynergyAdvice: async (req: Request, res: Response) => {
        try {
            const { techStack, title } = req.body;
            const contextName = title ? `for project "${title}"` : 'for a modern web project';
            const contextTech = techStack ? `using ${JSON.stringify(techStack)}` : 'using a decoupled full stack architecture';

            // R4 Fix: Replace Fake Static String with REAL AI generation
            const { multiAgentService } = await import('./multi_agent.service');
            const prompt = `You are a Principal Cloud Architect. Provide exactly 1 short, highly technical paragraph of structural advice ${contextName} ${contextTech}. Focus on performance, security, or deployment. No greetings, no markdown.`;
            const advice = await multiAgentService.callAI(prompt, 'synergy_engine');

            success(res, "Synergy intelligence retrieved.", { advice: advice || "Ensure multi-agent coordination remains memory efficient." });
        } catch (err: any) { error(res, err.message); }
    },
    recallMemory: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const objectId = new mongoose.Types.ObjectId(req.params.id);

            // R3: Ownership check
            const project = await CollageProject.findOne({ _id: objectId, userId });
            if (!project) return error(res, "Project not found or unauthorized.", "NOT_FOUND");

            const SystemLog = (await import('./system_log.model')).default;
            const memoryLog = await SystemLog.findOne({ projectId: objectId, logType: 'MEMORY_CORE' }).sort({ createdAt: -1 });

            let parsedContext = {};
            if (memoryLog?.message) {
                try { parsedContext = JSON.parse(memoryLog.message); } catch (e) { parsedContext = { raw: memoryLog.message }; }
            }

            success(res, "Context memory recalled", { context: parsedContext });
        } catch (err: any) { error(res, err.message); }
    },
    updateProjectStatus: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const userId = (req as any).user.id;
            const { status, log, currentStep, artifacts } = req.body;

            const project = await CollageProject.findOne({ _id: id, userId });
            if (!project) return error(res, "Project not found or unauthorized.", "NOT_FOUND");

            const update: any = {};
            if (status) update.status = status;
            if (currentStep) update.currentStep = currentStep;
            if (artifacts) update.artifacts = artifacts;

            if (log) {
                await CollageProject.findByIdAndUpdate(id, { $push: { logs: log }, $set: update });
            } else {
                await CollageProject.findByIdAndUpdate(id, { $set: update });
            }

            const updated = await CollageProject.findById(id);
            if (updated) {
                const SocketService = (await import('../../services/socket.service')).SocketService;
                if (log) SocketService.emitToSession(id, 'agent_pulse', { agent: 'TITAN_WORKER', state: 'active', message: log });
                SocketService.emitToSession(id, 'project_update', updated);
            }

            success(res, "Status synchronized", { status: updated?.status });
        } catch (err: any) { error(res, err.message); }
    },

    // DUPLICATE REMOVED BY CLEANUP (C1)

    downloadProject: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const objectId = new mongoose.Types.ObjectId(req.params.id);

            const project = await CollageProject.findOne({ _id: objectId, userId });
            if (!project) return error(res, "Project not found or unauthorized", "NOT_FOUND");

            const files = await ProjectFile.find({ projectId: objectId });
            if (!files || files.length === 0) return error(res, "No files found to package", "NOT_FOUND");

            const archiver = (await import('archiver')).default;
            const archive = archiver('zip', { zlib: { level: 9 } });

            // Set headers for industrial reliability
            res.setHeader('Content-Type', 'application/zip');
            res.setHeader('Content-Disposition', `attachment; filename="project_${req.params.id}.zip"`);
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            // Handle stream completion and errors
            archive.on('error', (err) => {
                console.error('ARCHIVER_ERROR:', err);
                if (!res.headersSent) {
                    res.status(500).send({ success: false, message: "ZIP compression failed" });
                }
            });

            // Wait for completion
            const zipFinished = new Promise<void>((resolve, reject) => {
                res.on('finish', resolve);
                res.on('error', reject);
                archive.on('error', reject);
            });

            archive.pipe(res);

            for (const f of files) {
                if (f.filePath && f.fileContent) {
                    // Sanitize path for Windows compatibility (replace backslashes with forward slashes)
                    let safePath = f.filePath.replace(/\\/g, '/');
                    // Remove leading slashes to prevent Windows zip extraction restrictions (Access Denied)
                    safePath = safePath.replace(/^\/+/g, '');
                    if (safePath) {
                        archive.append(f.fileContent, { name: safePath });
                    }
                }
            }

            await archive.finalize();
            await zipFinished;
        } catch (err: any) { error(res, err.message); }
    },

    downloadPdf: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const project = await CollageProject.findOne({ _id: req.params.id, userId });
            if (!project) return res.status(404).json({ success: false, message: "Project not found or unauthorized" });

            res.setHeader('Content-disposition', `attachment; filename="Project_Spec_${req.params.id}.pdf"`);
            res.setHeader('Content-type', 'application/pdf');

            const PDFDocument = (await import('pdfkit')).default;
            const doc = new PDFDocument({ margin: 50 });
            doc.pipe(res);

            // PDF Content
            doc.fontSize(24).text('PROJECT SPECIFICATION REPORT', { align: 'center' }).moveDown();
            doc.fontSize(16).text(`Title: ${project?.title || 'Unknown'}`).moveDown(0.5);
            doc.fontSize(12).text(`Target Category: ${project?.category}`).moveDown(0.5);
            doc.text(`Generated: ${new Date().toLocaleDateString()}`).moveDown(2);

            doc.fontSize(18).text('Requirements', { underline: true }).moveDown(0.5);
            doc.fontSize(12).text(project?.requirements || 'No clear requirements specified.').moveDown(2);

            doc.fontSize(18).text('Technical Blueprint / Diagrams', { underline: true }).moveDown();
            if (project?.blueprint?.diagrams) {
                Object.entries(project.blueprint.diagrams).forEach(([name, code]: any) => {
                    const krokiUrl = project.blueprint.krokiUrls?.[name];
                    doc.fontSize(14).text(`* ${name.toUpperCase()} MODEL *`).moveDown(0.2);

                    if (krokiUrl) {
                        doc.fontSize(10).fillColor('blue').text(`[View Dynamic Diagram (SVG)]`, { link: krokiUrl, underline: true }).fillColor('black').moveDown(0.5);
                    }

                    doc.fontSize(10).font('Courier').text(typeof code === 'string' ? code : JSON.stringify(code), {
                        width: 400,
                        align: 'left'
                    });
                    doc.font('Helvetica').moveDown();
                });
            }
            doc.end();
        } catch (err: any) { error(res, err.message); }
    },

    downloadPpt: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const project = await CollageProject.findOne({ _id: req.params.id, userId });
            if (!project) return res.status(404).json({ success: false, message: "Project not found or unauthorized" });

            const pptxgen = (await import('pptxgenjs')).default;
            const pptx = new pptxgen();

            // Title Slide
            let slide1 = pptx.addSlide();
            slide1.addText(project?.title || 'Project Pitch', { x: 0.5, y: 1.5, w: 9, fontSize: 44, bold: true, align: 'center', color: '363636' });
            slide1.addText(`Category: ${project?.category}`, { x: 0.5, y: 3, w: 9, fontSize: 24, align: 'center', color: '666666' });
            slide1.addText(`Generated via Titian Industrial Engine`, { x: 0.5, y: 4, w: 9, fontSize: 14, align: 'center', color: '999999' });

            // Problem Statement
            let slide2 = pptx.addSlide();
            slide2.addText('Core Objectives & Problem Statement', { x: 0.5, y: 0.5, fontSize: 28, bold: true, color: '363636' });
            slide2.addText(project?.requirements || 'Automated project specifications applied.', { x: 0.5, y: 1.5, w: 9, h: 4, fontSize: 16, color: '666666' });

            // Tech Stack
            let slide3 = pptx.addSlide();
            slide3.addText('Technology Stack', { x: 0.5, y: 0.5, fontSize: 28, bold: true, color: '363636' });
            slide3.addText(`Frontend: ${project?.technologyStack?.frontend || 'React'}\nBackend: ${project?.technologyStack?.backend || 'Node.js'}\nDatabase: ${project?.technologyStack?.database || 'MongoDB'}`, { x: 0.5, y: 1.5, w: 9, h: 4, fontFace: 'Courier', fontSize: 20, color: '003366', bullet: true });

            // Data Architecture (ER)
            let slide4 = pptx.addSlide();
            slide4.addText('Data Architecture (ER)', { x: 0.5, y: 0.5, fontSize: 28, bold: true, color: '363636' });
            slide4.addText(project?.blueprint?.diagrams?.architecture || 'Entity Relationship mapping pending.', { x: 0.5, y: 1.5, w: 9, h: 4, fontFace: 'Courier', fontSize: 12, color: '006600' });

            // System Flow (DFD)
            let slide5 = pptx.addSlide();
            slide5.addText('System Flow (DFD Context)', { x: 0.5, y: 0.5, fontSize: 28, bold: true, color: '363636' });
            slide5.addText(project?.blueprint?.diagrams?.system_flow || 'System context mapping pending.', { x: 0.5, y: 1.5, w: 9, h: 4, fontFace: 'Courier', fontSize: 12, color: '006600' });

            // Features
            let slide6 = pptx.addSlide();
            slide6.addText('Project Modules & Architecture', { x: 0.5, y: 0.5, fontSize: 28, bold: true, color: '363636' });

            const entityName = project?.title?.split(' ')[0] || 'System';
            const dbName = project?.technologyStack?.database || 'Database';
            const feName = project?.technologyStack?.frontend || 'Frontend';
            const catName = project?.category?.replace(/_/g, ' ') || 'Core';

            const dynamicModules = `1. Secure ${catName} Gateway\n2. ${feName} Client Interface\n3. ${entityName} Management Engine\n4. ${dbName} Persistence Layer`;

            slide6.addText(dynamicModules, { x: 0.5, y: 1.5, w: 9, h: 4, fontSize: 22, color: '363636', bullet: true });

            // Thank You
            let slide7 = pptx.addSlide();
            slide7.addText('Thank You', { x: 0.5, y: 2, w: 9, fontSize: 48, bold: true, align: 'center', color: '363636' });
            slide7.addText('Ready for Deployment', { x: 0.5, y: 3.5, w: 9, fontSize: 24, align: 'center', color: '666666' });

            // Output
            const stream = await pptx.write({ outputType: 'nodebuffer' });
            res.setHeader('Content-disposition', `attachment; filename="Vision_Deck_${req.params.id}.pptx"`);
            res.setHeader('Content-type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
            res.send(stream);
        } catch (err: any) { error(res, err.message); }
    },

    downloadWord: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const project = await CollageProject.findOne({ _id: req.params.id, userId });
            if (!project) return res.status(404).json({ success: false, message: "Project not found or unauthorized" });

            const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType } = await import('docx');

            const doc = new Document({
                sections: [{
                    children: [
                        new Paragraph({ text: "SOFTWARE ARCHITECTURE DOCUMENT", heading: HeadingLevel.TITLE, spacing: { after: 400 } }),
                        new Paragraph({ text: (project.title || "UNTITLED PROJECT").toUpperCase(), heading: HeadingLevel.HEADING_1, spacing: { after: 200 } }),

                        new Paragraph({ text: "1. PROJECT OVERVIEW", heading: HeadingLevel.HEADING_2, spacing: { before: 400, after: 200 } }),
                        new Paragraph({ children: [new TextRun({ text: project.requirements || "Standard industrial requirements applied.", size: 24 })] }),

                        new Paragraph({ text: "2. TECHNICAL SPECIFICATIONS", heading: HeadingLevel.HEADING_2, spacing: { before: 400, after: 200 } }),
                        new Table({
                            width: { size: 100, type: WidthType.PERCENTAGE },
                            rows: [
                                new TableRow({
                                    children: [
                                        new TableCell({ children: [new Paragraph("Stack Layer")] }),
                                        new TableCell({ children: [new Paragraph("Technology")] }),
                                    ],
                                }),
                                new TableRow({
                                    children: [
                                        new TableCell({ children: [new Paragraph("Frontend")] }),
                                        new TableCell({ children: [new Paragraph(project.technologyStack?.frontend || "React")] }),
                                    ],
                                }),
                                new TableRow({
                                    children: [
                                        new TableCell({ children: [new Paragraph("Backend")] }),
                                        new TableCell({ children: [new Paragraph(project.technologyStack?.backend || "Node.js")] }),
                                    ],
                                }),
                                new TableRow({
                                    children: [
                                        new TableCell({ children: [new Paragraph("Database")] }),
                                        new TableCell({ children: [new Paragraph(project.technologyStack?.database || "MongoDB")] }),
                                    ],
                                }),
                            ],
                        }),

                        new Paragraph({ text: "3. DATA MODELS & ENTITIES", heading: HeadingLevel.HEADING_2, spacing: { before: 400, after: 200 } }),
                        new Paragraph({ text: "Primary System Entity: " + ((project.title || "Entity").split(' ')[0]) }),

                        new Paragraph({ text: "4. SYSTEM DIAGRAMS (CODE)", heading: HeadingLevel.HEADING_2, spacing: { before: 400, after: 200 } }),
                        new Paragraph({ children: [new TextRun({ text: "Below are the Mermaid.js source codes for system visualization:", italics: true })] }),
                        ...(Object.entries(project.blueprint?.diagrams || {}).map(([name, code]) => (
                            new Paragraph({
                                children: [
                                    new TextRun({ text: `\n[${name.toUpperCase()}]\n`, bold: true }),
                                    new TextRun({ text: typeof code === 'string' ? code : JSON.stringify(code), font: "Courier New", size: 18 })
                                ]
                            })
                        )))
                    ]
                }]
            });

            const buffer = await Packer.toBuffer(doc);
            res.setHeader('Content-disposition', `attachment; filename="Software_Doc_${req.params.id}.docx"`);
            res.setHeader('Content-type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            res.send(buffer);
        } catch (err: any) { error(res, err.message); }
    },

    getProjectFiles: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const objectId = new mongoose.Types.ObjectId(req.params.id);
            const project = await CollageProject.findOne({ _id: objectId, userId });
            if (!project) return error(res, "Unauthorized", "NOT_FOUND");

            const files = await ProjectFile.find({ projectId: objectId }).select('filePath module createdAt');
            success(res, "Project files retrieved", { files });
        } catch (err: any) { error(res, err.message); }
    },

    getFileContent: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const filePath = req.query.path as string;
            if (!filePath) return error(res, "Query parameter 'path' is required.", "VALIDATION_FAILED");
            const objectId = new mongoose.Types.ObjectId(req.params.id);

            const project = await CollageProject.findOne({ _id: objectId, userId });
            if (!project) return error(res, "Unauthorized", "NOT_FOUND");

            const file = await ProjectFile.findOne({ projectId: objectId, filePath });
            if (!file) return error(res, "File not found", "NOT_FOUND");
            success(res, "File content retrieved", { content: file.fileContent });
        } catch (err: any) { error(res, err.message); }
    },
    getProjectTasks: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const objectId = new mongoose.Types.ObjectId(req.params.id);
            const project = await CollageProject.findOne({ _id: objectId, userId });
            if (!project) return error(res, "Unauthorized", "NOT_FOUND");

            const ProjectTask = (await import('./project_task.model')).default;
            const tasks = await ProjectTask.find({ projectId: objectId }).sort({ priority: 1, createdAt: 1 });
            success(res, "Task ledger retrieved", { tasks });
        } catch (err: any) { error(res, err.message); }
    },
    getSystemLogs: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const objectId = new mongoose.Types.ObjectId(req.params.id);
            const project = await CollageProject.findOne({ _id: objectId, userId });
            if (!project) return error(res, "Unauthorized", "NOT_FOUND");

            const SystemLog = (await import('./system_log.model')).default;

            // I-2 Fix: Use DB Aggregation Pipeline to sort LATEST 500 logs chronologically safely without memory JS reverse
            const logs = await SystemLog.aggregate([
                { $match: { projectId: objectId } },
                { $sort: { createdAt: -1 } },
                { $limit: 500 },
                { $sort: { createdAt: 1 } }
            ]);

            // Front-end expects format { agent, state, message, timestamp }
            const formattedLogs = logs.map(l => {
                let state = 'done';
                if (l.message.startsWith('❌')) state = 'error';
                else if (l.message.includes('...') || l.message.includes('running') || l.message.includes('Processing')) state = 'active';

                return {
                    agent: l.logType,
                    state,
                    message: l.message,
                    timestamp: l.createdAt
                };
            });
            success(res, "System logs retrieved", { logs: formattedLogs });
        } catch (err: any) { error(res, err.message); }
    },

    // ============================================================
    // 🌿 PHASE F: VERSIONING & POST-BUILD ITERATIONS
    // ============================================================


    postBuildIteration: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const objectId = new mongoose.Types.ObjectId(req.params.id);
            const userChangeRequest = req.body.changeRequest;

            if (!userChangeRequest) return error(res, "changeRequest required", "VALIDATION_FAILED");

            const project = await CollageProject.findOne({ _id: objectId, userId });
            if (!project) return error(res, "Unauthorized", "NOT_FOUND");
            if (project.status !== 'COMPLETED') return error(res, "Project must be COMPLETED before firing iterative branch.", "BAD_STATE");

            success(res, "Post-build iteration dispatched", null);

            // Detach iteration execution and report
            const multiAgentServiceModule = await import('./multi_agent.service');
            multiAgentServiceModule.multiAgentService.runPostBuildIteration(req.params.id, userChangeRequest).catch(e => {
                console.error("Post Build Iteration Error", e);
            });
        } catch (err: any) { error(res, err.message); }
    },

    getProjectRegistry: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const objectId = new mongoose.Types.ObjectId(req.params.id);
            
            const project = await CollageProject.findOne({ _id: objectId, userId });
            if (!project) return error(res, "Project Not Found", "NOT_FOUND");
            
            const FileRegistry = (await import('./file_registry.model')).default;
            const registry = await FileRegistry.find({ projectId: objectId }).sort({ createdAt: 1 });
            
            success(res, "Omega File Registry retrieved", { registry });
        } catch (err: any) { error(res, err.message); }
    }
};
