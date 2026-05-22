/**
 * ============================================================
 *  PPT ENGINE — Phase D Export Factory
 *  Generates professional PowerPoint presentations (PPTX)
 *  Uses: pptxgenjs (zero native deps, pure Node.js)
 * ============================================================
 */
import * as path from 'path';
import * as fs from 'fs';

// Theme colours for professional slides
const THEME = {
    titleBg: '0F172A',       // dark slate
    titleText: 'FFFFFF',
    accentBg: '6366F1',      // indigo
    accentText: 'FFFFFF',
    bodyBg: 'FFFFFF',
    bodyText: '1E293B',
    bullet: '6366F1',
    subText: '475569',
    green: '10B981',
    border: 'E2E8F0',
};

export const generateProjectPptx = async (
    projectId: string,
    title: string,
    category: string,
    techStack: any,
    psd: any,
    symbolTable: any,
    outputDir: string,
    prototypeMode: boolean = false
): Promise<string | null> => {
    try {
        const PptxGenJS = (await import('pptxgenjs')).default;
        const prs = new PptxGenJS();

        const fe = techStack?.frontend || 'React';
        const be = techStack?.backend || 'Node.js';
        const db = techStack?.database || 'MongoDB';
        const actors: string[] = psd?.actors || ['User', 'Admin'];
        const features: string[] = psd?.features || ['Authentication', 'Core Business Logic'];

        const degreeMap: Record<string, string> = {
            STUDENT_8_12: '10th/12th Standard Project',
            GRADUATION: "Bachelor's Degree Project",
            POST_GRAD_PHD: "Master's / PhD Research Project",
            BUSINESS_FREELANCE: 'Professional Software Product',
        };

        // Extract endpoints from symbol table
        const endpoints: string[] = [];
        if (symbolTable) {
            for (const [, sym] of Object.entries(symbolTable as any)) {
                const s = sym as any;
                if (s.apiEndpoints?.length) endpoints.push(...s.apiEndpoints.slice(0, 3));
            }
        }

        const addTitle = (slide: any, text: string) => {
            slide.addText(text, {
                x: 0.5, y: 0.2, w: 9, h: 0.7,
                fontSize: 26, bold: true, color: THEME.titleText,
                fontFace: 'Calibri',
            });
        };

        const addBullet = (slide: any, items: string[], x = 0.5, y = 1.2, w = 9) => {
            slide.addText(
                items.map(i => ({ text: i, options: { bullet: true, paraSpaceBefore: 8 } })),
                { x, y, w, h: 5.5, fontSize: 16, color: THEME.bodyText, fontFace: 'Calibri' }
            );
        };

        // ─── SLIDE 1: TITLE SLIDE ───────────────────────────────────
        const s1 = prs.addSlide();
        s1.background = { color: THEME.titleBg };
        s1.addShape(prs.ShapeType.rect, { x: 0, y: 3.8, w: 10, h: 0.08, fill: { color: THEME.accentBg } });
        s1.addText(title, {
            x: 0.5, y: 1.0, w: 9, h: 1.5,
            fontSize: 40, bold: true, color: THEME.titleText, fontFace: 'Calibri',
            align: 'center',
        });
        s1.addText(degreeMap[category] || 'Software Project', {
            x: 0.5, y: 2.8, w: 9, h: 0.5,
            fontSize: 20, color: THEME.accentBg, fontFace: 'Calibri', align: 'center',
        });
        s1.addText(prototypeMode ? `Built with ${fe} (High-Fidelity Prototype)` : `Built with ${fe} + ${be} + ${db}`, {
            x: 0.5, y: 3.5, w: 9, h: 0.5,
            fontSize: 16, color: '94A3B8', fontFace: 'Calibri', align: 'center',
        });
        s1.addText('Powered by Universal AI Build Engine', {
            x: 0.5, y: 6.5, w: 9, h: 0.4,
            fontSize: 12, color: '64748B', fontFace: 'Calibri', align: 'center', italic: true,
        });

        // ─── SLIDE 2: AGENDA ─────────────────────────────────────────
        const s2 = prs.addSlide();
        s2.background = { color: THEME.bodyBg };
        s2.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: 10, h: 1.0, fill: { color: THEME.titleBg } });
        addTitle(s2, '📋 Agenda');
        addBullet(s2, [
            '01 — Problem Statement',
            '02 — Proposed Solution',
            '03 — Technology Stack',
            prototypeMode ? '04 — UI/UX Architecture' : '04 — System Architecture',
            '05 — Key Features',
            prototypeMode ? '06 — Design System (Antigravity)' : '06 — Database Design',
            prototypeMode ? '07 — Mock Data Strategy' : '07 — API Overview',
            '08 — Live Screenshots',
            '09 — Future Scope',
            '10 — Thank You',
        ]);

        // ─── SLIDE 3: PROBLEM STATEMENT ──────────────────────────────
        const s3 = prs.addSlide();
        s3.background = { color: THEME.bodyBg };
        s3.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: 10, h: 1.0, fill: { color: THEME.accentBg } });
        addTitle(s3, '❌ Problem Statement');
        addBullet(s3, [
            'Traditional manual workflows lack efficiency and real-time tracking',
            'No centralised platform for data management and reporting',
            'Multiple roles have no clear access control or security boundary',
            'Existing solutions are either too complex or too limited in scope',
            `${title} aims to solve all of the above with a unified digital solution`,
        ]);

        // ─── SLIDE 4: PROPOSED SOLUTION ──────────────────────────────
        const s4 = prs.addSlide();
        s4.background = { color: THEME.bodyBg };
        s4.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: 10, h: 1.0, fill: { color: THEME.titleBg } });
        addTitle(s4, '✅ Proposed Solution');
        addBullet(s4, prototypeMode 
            ? [
                `Ultra-premium frontend application built with ${fe}`,
                `Antigravity Supreme Design System (Glassmorphism)`,
                `Cinematic 3D Animated UI Components`,
                `High-fidelity multi-page navigation experience`,
                `Realistic Mock Data integration for all features`,
                `Responsive Industrial Grid Layout`,
              ]
            : [
                `A full-stack web application with ${fe} frontend`,
                `Secure ${be} REST API backend with JWT authentication`,
                `Real-time data storage with ${db}`,
                'Separate Admin Panel (Port 3001) for complete control',
                'User-facing frontend (Port 3000) with premium 3D animated UI',
                'Role-based access control for all system operations',
            ]);

        // ─── SLIDE 5: TECHNOLOGY STACK ───────────────────────────────
        const s5 = prs.addSlide();
        s5.background = { color: THEME.bodyBg };
        s5.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: 10, h: 1.0, fill: { color: THEME.accentBg } });
        addTitle(s5, '⚙️ Technology Stack');
        // Visual 3-column layout
        const cols = [
            { label: 'Frontend', tech: fe, icon: '🎨', x: 0.5 },
            { label: 'Backend', tech: be, icon: '⚡', x: 3.7 },
            { label: 'Database', tech: db, icon: '🗃️', x: 6.9 },
        ];
        cols.forEach(col => {
            s5.addShape(prs.ShapeType.rect, { x: col.x, y: 1.2, w: 2.9, h: 4.5, fill: { color: 'F8FAFC' }, line: { color: THEME.border, width: 1 } });
            s5.addText(col.icon, { x: col.x, y: 1.4, w: 2.9, h: 0.8, align: 'center', fontSize: 32 });
            s5.addText(col.label, { x: col.x, y: 2.4, w: 2.9, h: 0.5, align: 'center', bold: true, color: THEME.bodyText, fontSize: 16 });
            s5.addText(col.tech, { x: col.x, y: 3.0, w: 2.9, h: 1.8, align: 'center', color: THEME.subText, fontSize: 14, wrap: true });
        });

        // ─── SLIDE 6: SYSTEM ARCHITECTURE ────────────────────────────
        const s6 = prs.addSlide();
        s6.background = { color: THEME.bodyBg };
        s6.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: 10, h: 1.0, fill: { color: THEME.titleBg } });
        addTitle(s6, '🏗️ System Architecture (4-Layer)');
        const layers = prototypeMode 
            ? [
                { label: 'Layer 1: Design System', desc: 'Antigravity Tokens — Glass, Neon, Glows', color: '10B981', y: 1.2 },
                { label: 'Layer 2: Core Layout', desc: 'Industrial Grids — Responsive & Futuristic', color: '6366F1', y: 2.3 },
                { label: 'Layer 3: UI Components', desc: '3D Transforms — Perspective & Cinematic Motion', color: 'F59E0B', y: 3.4 },
                { label: 'Layer 4: Data Layer', desc: 'Mock Services — Realistic Interaction Scenarios', color: 'EC4899', y: 4.5 },
              ]
            : [
                { label: 'Layer 1: Database', desc: `${db} — Models, Schemas, Indexes`, color: '10B981', y: 1.2 },
                { label: 'Layer 2: Backend API', desc: `${be} — Controllers, Routes, Auth`, color: '6366F1', y: 2.3 },
                { label: 'Layer 3: Admin Panel', desc: 'React (Port 3001) — Full CRUD + Dashboard', color: 'F59E0B', y: 3.4 },
                { label: 'Layer 4: Frontend App', desc: 'React (Port 3000) — User-facing 3D Animated UI', color: 'EC4899', y: 4.5 },
              ];
        layers.forEach(l => {
            s6.addShape(prs.ShapeType.rect, { x: 0.5, y: l.y, w: 9, h: 0.9, fill: { color: l.color } });
            s6.addText(`${l.label}  |  ${l.desc}`, {
                x: 0.7, y: l.y + 0.1, w: 8.6, h: 0.7, fontSize: 16, bold: true, color: 'FFFFFF',
            });
        });

        // ─── SLIDE 7: KEY FEATURES ────────────────────────────────────
        const s7 = prs.addSlide();
        s7.background = { color: THEME.bodyBg };
        s7.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: 10, h: 1.0, fill: { color: THEME.accentBg } });
        addTitle(s7, '✨ Key Features');
        addBullet(s7, features.slice(0, 8).map((f, i) => `${i + 1}. ${f}`));

        // ─── SLIDE 8: USER ROLES ──────────────────────────────────────
        const s8 = prs.addSlide();
        s8.background = { color: THEME.bodyBg };
        s8.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: 10, h: 1.0, fill: { color: THEME.titleBg } });
        addTitle(s8, '👥 System Actors & Roles');
        addBullet(s8, actors.map(a => `${a} — Has dedicated role-based access to system features`));

        // ─── SLIDE 9: API ENDPOINTS ───────────────────────────────────
        const s9 = prs.addSlide();
        s9.background = { color: THEME.bodyBg };
        s9.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: 10, h: 1.0, fill: { color: THEME.accentBg } });
        addTitle(s9, '🔌 API Overview');
        const epDisplay = endpoints.length > 0
            ? endpoints.slice(0, 8)
            : ['POST /api/auth/login', 'POST /api/auth/register', 'GET /api/resource', 'POST /api/resource', 'PUT /api/resource/:id', 'DELETE /api/resource/:id', 'GET /api/admin/stats'];
        addBullet(s9, epDisplay.map(ep => `→ ${ep}`));

        // ─── SLIDE 10: FUTURE SCOPE ───────────────────────────────────
        const s10 = prs.addSlide();
        s10.background = { color: THEME.bodyBg };
        s10.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: 10, h: 1.0, fill: { color: THEME.titleBg } });
        addTitle(s10, '🚀 Future Scope');
        addBullet(s10, [
            'Mobile application development (React Native / Flutter)',
            'AI-powered analytics and recommendation engine',
            'Real-time notifications via WebSockets / Push',
            'Cloud deployment (AWS/GCP) with CI/CD pipelines',
            'Multi-language support (i18n/l10n)',
            'Payment gateway integration (Razorpay/Stripe)',
        ]);

        // ─── SLIDE 11: CONCLUSION ─────────────────────────────────────
        const s11 = prs.addSlide();
        s11.background = { color: THEME.bodyBg };
        s11.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: 10, h: 1.0, fill: { color: THEME.accentBg } });
        addTitle(s11, '📌 Conclusion');
        addBullet(s11, [
            `${title} successfully delivers a production-ready, full-stack solution`,
            'Follows industry-standard 4-layer architecture pattern',
            'Includes admin panel, user frontend, REST API, and database',
            'Code is maintainable, scalable, and security-first',
            'Fully documented with project report, diagrams, and test cases',
        ]);

        // ─── SLIDE 12: THANK YOU ──────────────────────────────────────
        const s12 = prs.addSlide();
        s12.background = { color: THEME.titleBg };
        s12.addShape(prs.ShapeType.rect, { x: 0, y: 3.3, w: 10, h: 0.08, fill: { color: THEME.accentBg } });
        s12.addText('🙏 Thank You', {
            x: 0.5, y: 1.5, w: 9, h: 1.2,
            fontSize: 52, bold: true, color: THEME.titleText, align: 'center', fontFace: 'Calibri',
        });
        s12.addText('Questions & Feedback Welcome', {
            x: 0.5, y: 3.0, w: 9, h: 0.6,
            fontSize: 22, color: '94A3B8', align: 'center', fontFace: 'Calibri',
        });
        s12.addText(`Generated by Universal AI Build Engine | ${title}`, {
            x: 0.5, y: 6.5, w: 9, h: 0.4,
            fontSize: 12, color: '475569', align: 'center', italic: true, fontFace: 'Calibri',
        });

        const outPath = path.join(outputDir, 'presentation.pptx');
        await prs.writeFile({ fileName: outPath });
        return outPath;
    } catch (e: any) {
        console.error('PPT_ENGINE_ERROR:', e.message);
        return null;
    }
};
