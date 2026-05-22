
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const WORKER_URL = process.env.PYTHON_WORKER_URL || 'http://127.0.0.1:8000';

async function testConnection() {
    console.log(`[Test] Checking connection to worker at: ${WORKER_URL}`);
    try {
        const res = await axios.get(`${WORKER_URL}/status`);
        console.log('[Test] Worker Status:', res.data);

        console.log('[Test] Dispatching test task...');
        const taskRes = await axios.post(`${WORKER_URL}/execute`, {
            job_id: 'test-' + Date.now(),
            command: 'Explain the Big O of Binary Search in 1 sentence.',
            file_path: null
        });

        console.log('[Test] Worker Execution Result:', JSON.stringify(taskRes.data, null, 2));

        if (taskRes.data.status === 'completed') {
            console.log('✅ PROOF OF LIFE: Worker and LLM are linked and functional.');
        } else {
            console.log('❌ ISSUE: Worker returned non-completed status.');
        }

    } catch (e: any) {
        console.error('❌ CRITICAL: Could not reach worker.', e.message);
        if (e.response) {
            console.error('Response Data:', e.response.data);
        }
    }
}

testConnection();
