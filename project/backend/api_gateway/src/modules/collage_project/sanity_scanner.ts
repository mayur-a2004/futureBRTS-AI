import * as fs from 'fs';
import * as path from 'path';
import ProjectFile from './project_file.model';
import mongoose from 'mongoose';
import SystemLog from './system_log.model';

export const runSanityCheck = async (projectId: string, fsPath: string, symbolTable: any, aiRepairFunction?: any) => {
    try {
        const pId = new mongoose.Types.ObjectId(projectId);
        const files = await ProjectFile.find({ projectId: pId });
        
        await SystemLog.create({
            projectId: pId,
            logType: 'SANITY_SCANNER',
            message: `🔍 Initiating Phase G Sanity Scan across ${files.length} active documents...`
        });

        let fixCount = 0;

        for (const file of files) {
            let content = file.fileContent;
            const originalContent = content;
            
            // 1. Remove Markdown Code Block Boundaries (Anti-Leak)
            content = content.replace(/```[a-z]*\n/g, '').replace(/```/g, '');

            // 2. Remove any accidental "undefined" string bindings produced by LLMs
            content = content.replace(/=\s*undefined;/g, '= null;'); // Safe fallback 
            
            // 3. Catch missing Mongoose exports or unreferenced modules (basic check)
            if (file.filePath.includes('model') && !content.includes('mongoose.model')) {
                 await SystemLog.create({
                    projectId: pId,
                    logType: 'SANITY_SCANNER',
                    message: `⚠️ WARNING: Schema file ${file.filePath} might be missing 'mongoose.model' export.`
                });
            }

            // 4. Catch common missing React imports
            if ((file.filePath.endsWith('.jsx') || file.filePath.endsWith('.tsx')) && content.includes('React.') && !content.includes('import React')) {
                content = `import React from 'react';\n${content}`;
            }

            // 5. Catch HTML wrappers or missing default exports in React components and trigger AGENTIC SELF-HEALING
            let needsRepair = false;
            let repairReason = "";
            const isReactFile = file.filePath.endsWith('.jsx') || file.filePath.endsWith('.tsx');
            
            if (isReactFile) {
                if (/<!DOCTYPE\s+html/i.test(content) || /<html/i.test(content) || /<body/i.test(content)) {
                    needsRepair = true;
                    repairReason = "Frontend component contains HTML page wrappers (<html>, <body>, etc). It must be a raw React functional component without HTML document wrappers.";
                } else if (!content.includes('export default') && !content.includes('module.exports')) {
                    needsRepair = true;
                    repairReason = "Frontend component is missing an 'export default' statement. A React component must be exported.";
                }
            }

            if (needsRepair && aiRepairFunction) {
                await SystemLog.create({
                    projectId: pId,
                    logType: 'SANITY_SCANNER',
                    message: `⚠️ CRITICAL: Anomaly detected in ${file.filePath}. Triggering Agentic Auto-Repair...`
                });

                const repairPrompt = `You are an elite React Developer. The following code for the file "${file.filePath}" is fundamentally broken or improperly formatted.
REASON: ${repairReason}

Broken Code:
\`\`\`
${content}
\`\`\`

TASK: Fix the code completely. Ensure it is a valid, clean React component. DO NOT wrap it in <html> or <body> tags. Ensure it has a valid 'export default'.
CRITICAL: ONLY return the fixed raw code. Do NOT output any markdown, explanations, or chat. Return the pure code string.`;

                try {
                    let repairedCode = await aiRepairFunction(repairPrompt, projectId, file.filePath);
                    
                    // Clean markdown if the AI hallucinates it
                    repairedCode = repairedCode.replace(/```[a-z]*\n?/g, '').replace(/```/g, '').trim();
                    
                    if (repairedCode.length > 50) {
                        content = repairedCode;
                        await SystemLog.create({
                            projectId: pId,
                            logType: 'SANITY_SCANNER',
                            message: `✅ Agentic Repair successful for ${file.filePath}. Overwriting corrupted file.`
                        });
                    }
                } catch (e: any) {
                    console.error("Auto-Repair Failed:", e.message);
                }
            }


            if (content !== originalContent) {
                fixCount++;
                file.fileContent = content;
                await file.save();
                
                // Synchronize fix to physical file system if it was already written
                const physicalPath = path.join(fsPath, file.filePath);
                if (fs.existsSync(physicalPath)) {
                    fs.writeFileSync(physicalPath, content, 'utf8');
                }
            }
        }

        await SystemLog.create({
            projectId: pId,
            logType: 'SANITY_SCANNER',
            message: `✅ Sanity Scan Complete. Auto-Fixed ${fixCount} AST/Markdown anomalies.`
        });

        return true;
    } catch (e: any) {
        console.error("Sanity Scanner Error:", e);
        return false;
    }
};
