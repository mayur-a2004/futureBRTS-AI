import axios from 'axios';

const WORKER_URL = process.env.PYTHON_WORKER_URL || 'http://127.0.0.1:8000';

export const pythonService = {
    /**
     * Send attachment to Python Worker for processing (OCR/Text Extraction)
     */
    async processAttachment(filePath: string, fileType: string, originalName: string, command: string = "") {
        return this.executeTask('process_attachment', command, {
            file_path: filePath,
            fileType: fileType,
            originalName: originalName
        });
    },

    /**
     * Universal Titan Hub Execution
     */
    async executeTask(taskType: string, command: string, metadata: any = {}) {
        try {
            console.log(`[PythonService] Dispatched Titan Job: ${taskType} | Cmd: ${command.substring(0, 50)}...`);
            const res = await axios.post(`${WORKER_URL}/execute`, {
                taskId: `titan-${Date.now()}`,
                taskType: taskType,
                command: command,
                prompt: command, // Context duplication for stability
                metadata: metadata
            }, {
                headers: { 'Connection': 'close' },
                timeout: 120000 // Increased for Science/Modeling tasks
            });
            return res.data;
        } catch (error: any) {
            console.error('[PythonService] Titan Link Failure:', error.message);
            return { status: 'FAIL', reason: error.message };
        }
    }
};
