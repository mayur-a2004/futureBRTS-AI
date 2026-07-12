import fs from 'fs';
import path from 'path';

const run = () => {
    try {
        const brainDir = 'C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\644ec58b-83ff-4475-bddd-85abadfa2a9c\\.system_generated\\tasks';
        const files = fs.readdirSync(brainDir);
        let out = '--- ACTIVE TASK LOGS ---\n';
        files.forEach(f => {
            if (f.endsWith('.log')) {
                const content = fs.readFileSync(path.join(brainDir, f), 'utf8');
                out += `\n=========================================\nFILE: ${f}\n=========================================\n${content}\n`;
            }
        });
        fs.writeFileSync(path.join(__dirname, '../../active_logs.txt'), out);
        console.log('✅ Logs written to active_logs.txt');
    } catch (err: any) {
        console.error(err);
    }
};

run();
