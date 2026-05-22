import * as fs from 'fs';
import * as path from 'path';
import ProjectFile from './project_file.model';
import mongoose from 'mongoose';
import SystemLog from './system_log.model';

export const runSanityCheck = async (projectId: string, fsPath: string, symbolTable: any) => {
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
