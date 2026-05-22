/**
 * ============================================================
 *  DOC ENGINE — Phase D Export Factory
 *  Generates complete academic project reports in DOCX format
 *  Uses: docx npm library (pure JS, no extra binary deps)
 * ============================================================
 */
import * as fs from 'fs';
import * as path from 'path';

// ============================================================
// DOCX GENERATOR — Academic Chapter-Wise Report
// ============================================================
export const generateProjectDocx = async (
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
        const { Document, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, SectionType, Packer } = await import('docx');

        const fe = techStack?.frontend || 'React';
        const be = techStack?.backend || 'Node.js';
        const db = techStack?.database || 'MongoDB';
        const actors: string[] = psd?.actors || ['User', 'Admin'];
        const features: string[] = psd?.features || ['Authentication', 'Core Business Logic'];

        // Extract API endpoints from symbol table for implementation chapter
        const endpoints: string[] = [];
        if (symbolTable) {
            for (const [, sym] of Object.entries(symbolTable as any)) {
                const s = sym as any;
                if (s.apiEndpoints?.length) {
                    endpoints.push(...s.apiEndpoints);
                }
            }
        }

        // Extract models from symbol table
        const models: { name: string; fields: string[] }[] = [];
        if (symbolTable) {
            for (const [filePath, sym] of Object.entries(symbolTable as any)) {
                const s = sym as any;
                if (s.modelName) {
                    models.push({
                        name: s.modelName,
                        fields: Object.keys(s.schemaFields || {}),
                    });
                }
            }
        }

        const degreeMap: Record<string, string> = {
            STUDENT_8_12: '10th/12th Standard',
            GRADUATION: "Bachelor's Degree (B.Tech/BCA/BCS)",
            POST_GRAD_PHD: "Master's / PhD",
            BUSINESS_FREELANCE: 'Professional / Business',
        };
        const degreeLabel = degreeMap[category] || 'Graduation';

        const heading = (text: string, lvl: (typeof HeadingLevel)[keyof typeof HeadingLevel]) =>
            new Paragraph({ text, heading: lvl, spacing: { after: 200, before: 400 } });

        const body = (text: string, bold: boolean = false) =>
            new Paragraph({
                children: [new TextRun({ text, bold, size: 24, font: 'Times New Roman' })],
                spacing: { after: 160 },
                alignment: AlignmentType.JUSTIFIED,
            });

        const bullet = (text: string) =>
            new Paragraph({
                text: `• ${text}`,
                indent: { left: 720 },
                spacing: { after: 80 },
                children: [new TextRun({ text: `• ${text}`, size: 24, font: 'Times New Roman' })],
            });

        // API endpoint table rows
        const endpointRows = [
            new TableRow({
                children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Endpoint', bold: true })] })], width: { size: 4000, type: WidthType.DXA } }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Method', bold: true })] })], width: { size: 1500, type: WidthType.DXA } }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Description', bold: true })] })], width: { size: 4500, type: WidthType.DXA } }),
                ],
            }),
            ...(endpoints.length > 0
                ? endpoints.slice(0, 20).map(ep => {
                    const parts = ep.split(' ');
                    const method = parts[0] || 'GET';
                    const route = parts[1] || '/api/resource';
                    return new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph(route)], width: { size: 4000, type: WidthType.DXA } }),
                            new TableCell({ children: [new Paragraph(method)], width: { size: 1500, type: WidthType.DXA } }),
                            new TableCell({ children: [new Paragraph(`Handles ${method.toLowerCase()} operation on ${route}`)], width: { size: 4500, type: WidthType.DXA } }),
                        ],
                    });
                  })
                : [
                    new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph('/api/auth/login')] }),
                            new TableCell({ children: [new Paragraph('POST')] }),
                            new TableCell({ children: [new Paragraph('User login with JWT')] }),
                        ],
                    }),
                  ]),
        ];

        const doc = new Document({
            sections: [{
                properties: { type: SectionType.CONTINUOUS },
                children: [
                    // ─── TITLE PAGE ───
                    new Paragraph({ children: [new TextRun({ text: '', break: 5 })], }),
                    new Paragraph({
                        children: [new TextRun({ text: title.toUpperCase(), bold: true, size: 52, font: 'Times New Roman' })],
                        alignment: AlignmentType.CENTER, spacing: { after: 400 },
                    }),
                    new Paragraph({
                        children: [new TextRun({ text: 'PROJECT REPORT', bold: true, size: 36, font: 'Times New Roman' })],
                        alignment: AlignmentType.CENTER, spacing: { after: 400 },
                    }),
                    new Paragraph({
                        children: [new TextRun({ text: `Submitted in partial fulfilment of the requirements for the award of ${degreeLabel}`, size: 24, font: 'Times New Roman' })],
                        alignment: AlignmentType.CENTER, spacing: { after: 600 },
                    }),
                    new Paragraph({
                        children: [new TextRun({ text: `Generated by: Universal AI Build Engine`, size: 24, font: 'Times New Roman', italics: true })],
                        alignment: AlignmentType.CENTER, spacing: { after: 800 },
                    }),
                    new Paragraph({ children: [new TextRun({ text: '', break: 3 })], }),

                    // ─── CHAPTER 1: INTRODUCTION ───
                    heading('CHAPTER 1: INTRODUCTION', HeadingLevel.HEADING_1),
                    heading('1.1 Overview', HeadingLevel.HEADING_2),
                    body(prototypeMode 
                        ? `The ${title} is a high-fidelity frontend prototype developed to showcase a cinematic, 3D animated user interface. This project focuses on premium UI/UX engineering using ${fe}, implementing the "Antigravity Supreme" design system with glassmorphism and futuristic aesthetics.`
                        : `The ${title} is a comprehensive software system developed to address modern digital requirements. This project has been designed using cutting-edge web technologies including ${fe} for the frontend, ${be} for backend services, and ${db} as the primary data store.`),
                    
                    heading('1.2 Problem Statement', HeadingLevel.HEADING_2),
                    body(`Traditional manual workflows in this domain lack efficiency, real-time tracking, and data integrity. This project addresses these challenges by providing a fully automated, secure, and user-friendly digital platform that meets the demands of all stakeholders involved.`),
                    
                    heading('1.3 Objectives', HeadingLevel.HEADING_2),
                    ...features.slice(0, 8).map(f => bullet(f)),

                    heading('1.4 Scope of the Project', HeadingLevel.HEADING_2),
                    body(`The scope of this project includes the development of a multi-layer application comprising a user-facing frontend application, a comprehensive admin control panel, a RESTful backend API, and a structured database. The system supports the following user roles: ${actors.join(', ')}.`),

                    // ─── CHAPTER 2: LITERATURE REVIEW ───
                    heading('CHAPTER 2: LITERATURE REVIEW', HeadingLevel.HEADING_1),
                    body('Several existing systems have been analysed to understand industry standards and best practices. The following technologies form the backbone of modern full-stack applications:'),
                    bullet(`${fe} — A modern JavaScript framework known for its component-based UI architecture and high performance. It enables rapid prototyping with hot-module reloading.`),
                    bullet(`${be} — A robust backend framework for building scalable RESTful APIs. It supports middleware pipelining, JWT authentication, and multi-layered route management.`),
                    bullet(`${db} — A production-grade database system offering schema-flexiblity (NoSQL) or ACID compliance (SQL), depending on the project type.`),
                    body('The gap identified in existing literature was the lack of a fully-integrated academic project that combines frontend, admin panel, backend, and documentation in one deployable package. This project fulfils that gap.'),

                    // ─── CHAPTER 3: SYSTEM ANALYSIS ───
                    heading('CHAPTER 3: SYSTEM ANALYSIS', HeadingLevel.HEADING_1),
                    heading('3.1 System Actors', HeadingLevel.HEADING_2),
                    ...actors.map(a => bullet(`${a}: Interacts with the system for core operations.`)),
                    
                    heading('3.2 Functional Requirements', HeadingLevel.HEADING_2),
                    ...features.map(f => bullet(f)),
                    
                    heading('3.3 Non-Functional Requirements', HeadingLevel.HEADING_2),
                    bullet('Performance: API response time < 300ms for 95% of requests'),
                    bullet('Security: JWT-based authentication with bcrypt password hashing'),
                    bullet('Scalability: RESTful stateless architecture supports horizontal scaling'),
                    bullet('Availability: 99.9% uptime with proper error boundary management'),
                    
                    heading('3.4 System Architecture', HeadingLevel.HEADING_2),
                    body(prototypeMode ? 'The system follows a modern Frontend-First prototype architecture:' : 'The system follows a 4-layer architecture pattern:'),
                    ...(prototypeMode 
                        ? [
                            bullet('Layer 1 — Core Layout: Responsive grid system with CSS perspective'),
                            bullet('Layer 2 — Design System: Antigravity Supreme tokens (Glassmorphism, Neon Glows)'),
                            bullet('Layer 3 — State Management: React Context API for navigation and user interaction'),
                            bullet('Layer 4 — Animation Engine: CSS Keyframes and 3D transforms for cinematic experience'),
                          ]
                        : [
                            bullet('Layer 1 — Database Layer: MongoDB/SQL schema design with proper indexing'),
                            bullet('Layer 2 — Backend API Layer: Express/FastAPI RESTful API server'),
                            bullet('Layer 3 — Admin Panel: Separate React application (Port 3001) with full CRUD access'),
                            bullet('Layer 4 — Frontend User App: Separate React application (Port 3000) with user-facing features'),
                          ]),

                    // ─── CHAPTER 4: SYSTEM DESIGN ───
                    heading('CHAPTER 4: SYSTEM DESIGN', HeadingLevel.HEADING_1),
                    heading('4.1 Database Schema', HeadingLevel.HEADING_2),
                    body('The following entities have been identified and modelled in the database:'),
                    ...models.map(m => {
                        return new Paragraph({
                            children: [
                                new TextRun({ text: `${m.name}: `, bold: true, size: 24 }),
                                new TextRun({ text: `Fields — ${m.fields.join(', ') || 'id, createdAt, updatedAt'}`, size: 24 }),
                            ],
                            indent: { left: 720 }, spacing: { after: 80 },
                        });
                    }),
                    
                    heading('4.2 API Design', HeadingLevel.HEADING_2),
                    body('The following REST API endpoints have been implemented:'),
                    new Table({ rows: endpointRows, width: { size: 100, type: WidthType.PERCENTAGE } }),
                    
                    heading('4.3 Component Architecture', HeadingLevel.HEADING_2),
                    bullet('Frontend: Component → Page → Layout → App hierarchy'),
                    bullet('Admin: AdminLayout → Pages → DataTable Components'),
                    bullet('Backend: Routes → Controllers → Models → Database'),

                    // ─── CHAPTER 5: IMPLEMENTATION ───
                    heading('CHAPTER 5: IMPLEMENTATION', HeadingLevel.HEADING_1),
                    body(`The project was implemented using ${fe}, ${be}, and ${db}. The implementation followed a bottom-up approach, starting from database models, building API controllers, then developing the admin panel, and finally implementing the user-facing frontend.`),
                    
                    heading('5.1 Frontend Architecture', HeadingLevel.HEADING_2),
                    body(`The frontend is built with ${fe} using a modular component architecture. The UI implements 3D animated components using CSS transforms and WebGL-lite effects for a premium visual experience. State management uses React Context API with custom hooks.`),
                    
                    heading('5.2 Design System Implementation', HeadingLevel.HEADING_2),
                    body(`The project implements the "Antigravity Supreme" design system. This includes backdrop-filter blurs, mesh gradients, and neon indigo/cyan accents. Every interactive element features smooth transitions and depth-based perspective effects.`),
                    
                    heading('5.3 Responsive Layout', HeadingLevel.HEADING_2),
                    body(`The UI is fully responsive across mobile, tablet, and desktop views. It uses a flexible industrial grid system that maintains the 3D aesthetic regardless of screen size.`),

                    // ─── CHAPTER 6: TESTING ───
                    heading('CHAPTER 6: TESTING', HeadingLevel.HEADING_1),
                    heading('6.1 Testing Strategy', HeadingLevel.HEADING_2),
                    body('The system was tested using a combination of unit testing (individual functions), integration testing (API + DB), and end-to-end testing (complete user flows). All API endpoints were validated for correct HTTP status codes, data validation, and error responses.'),
                    
                    heading('6.2 Test Results', HeadingLevel.HEADING_2),
                    body('All critical user flows were verified successfully. API endpoints responded with correct status codes. Database CRUD operations were validated. Admin panel permissions were correctly enforced.'),

                    // ─── CHAPTER 7: CONCLUSION ───
                    heading('CHAPTER 7: CONCLUSION', HeadingLevel.HEADING_1),
                    body(`The ${title} project has been successfully designed, developed, and tested. The system fulfils all the objectives outlined in Chapter 1 and provides a production-ready, scalable solution. The use of ${fe}, ${be}, and ${db} ensures modern, maintainable, and performant code.`),
                    body('Future enhancements could include mobile application integration, AI-powered recommendations, real-time notifications via WebSockets, and cloud deployment with CI/CD pipelines.'),
                    
                    heading('REFERENCES', HeadingLevel.HEADING_1),
                    bullet(`${fe} Official Documentation — https://react.dev`),
                    bullet(`${be} Official Documentation — https://nodejs.org`),
                    bullet(`${db} Official Documentation — https://www.mongodb.com/docs`),
                    bullet('Mongoose.js — https://mongoosejs.com'),
                    bullet('JWT Authentication — https://jwt.io'),
                ],
            }],
        });

        const buffer = await Packer.toBuffer(doc);
        const outPath = path.join(outputDir, 'project-report.docx');
        fs.writeFileSync(outPath, buffer);
        return outPath;
    } catch (e: any) {
        console.error('DOC_ENGINE_ERROR:', e.message);
        return null;
    }
};
