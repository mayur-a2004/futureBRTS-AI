// 🎓 Minerva Education API — Frontend wrapper

const BASE_URL = '/api/future-education';

const authHeaders = (token: string) => ({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
});

const handleRes = async (res: Response) => {
    const data = await res.json();
    return data;
};

export const minervaApi = {

    // ── PROFILE ──────────────────────────────────
    getProfile: async (token: string) => {
        const res = await fetch(`${BASE_URL}/profile`, { headers: authHeaders(token) });
        return handleRes(res);
    },
    updateProfile: async (token: string, data: any) => {
        const res = await fetch(`${BASE_URL}/profile`, {
            method: 'PUT',
            headers: authHeaders(token),
            body: JSON.stringify(data),
        });
        return handleRes(res);
    },

    // ── STATS ─────────────────────────────────────
    getStats: async (token: string) => {
        const res = await fetch(`${BASE_URL}/stats`, { headers: authHeaders(token) });
        return handleRes(res);
    },

    // ── CHAT ──────────────────────────────────────
    sendChat: async (token: string, message: string, session_id?: string, chat_session_id?: string, deep_study?: boolean) => {
        const res = await fetch(`${BASE_URL}/chat`, {
            method: 'POST',
            headers: authHeaders(token),
            body: JSON.stringify({ message, session_id, chat_session_id, deep_study }),
        });
        return handleRes(res);
    },
    getChatHistory: async (token: string, limit = 30) => {
        const res = await fetch(`${BASE_URL}/chat/history?limit=${limit}`, { headers: authHeaders(token) });
        return handleRes(res);
    },
    getChatSessions: async (token: string) => {
        const res = await fetch(`${BASE_URL}/chat/sessions`, { headers: authHeaders(token) });
        return handleRes(res);
    },
    createChatSession: async (token: string, title?: string) => {
        const res = await fetch(`${BASE_URL}/chat/session`, {
            method: 'POST',
            headers: authHeaders(token),
            body: JSON.stringify({ title }),
        });
        return handleRes(res);
    },
    getChatSessionMessages: async (token: string, sessionId: string) => {
        const res = await fetch(`${BASE_URL}/chat/session/${sessionId}`, { headers: authHeaders(token) });
        return handleRes(res);
    },
    renameChatSession: async (token: string, sessionId: string, title: string) => {
        const res = await fetch(`${BASE_URL}/chat/session/${sessionId}`, {
            method: 'PUT',
            headers: authHeaders(token),
            body: JSON.stringify({ title }),
        });
        return handleRes(res);
    },
    deleteChatSession: async (token: string, sessionId: string) => {
        const res = await fetch(`${BASE_URL}/chat/session/${sessionId}`, {
            method: 'DELETE',
            headers: authHeaders(token),
        });
        return handleRes(res);
    },
    togglePinChatSession: async (token: string, sessionId: string) => {
        const res = await fetch(`${BASE_URL}/chat/session/${sessionId}/pin`, {
            method: 'PUT',
            headers: authHeaders(token),
        });
        return handleRes(res);
    },

    // ── SESSIONS ──────────────────────────────────
    getSessions: async (token: string) => {
        const res = await fetch(`${BASE_URL}/sessions`, { headers: authHeaders(token) });
        return handleRes(res);
    },
    getSession: async (token: string, sessionId: string) => {
        const res = await fetch(`${BASE_URL}/session/${sessionId}`, { headers: authHeaders(token) });
        return handleRes(res);
    },

    learnNode: async (token: string, nodeId: string) => {
        const res = await fetch(`${BASE_URL}/node/${nodeId}/learn`, {
            method: 'POST',
            headers: authHeaders(token),
        });
        return handleRes(res);
    },
    updateNodePriority: async (token: string, nodeId: string, priority: 'HIGH' | 'MEDIUM' | 'LOW') => {
        const res = await fetch(`${BASE_URL}/node/${nodeId}/priority`, {
            method: 'PUT',
            headers: authHeaders(token),
            body: JSON.stringify({ priority }),
        });
        return handleRes(res);
    },

    // ── TASKS ─────────────────────────────────────
    submitTask: async (token: string, taskId: string, answer: string) => {
        const res = await fetch(`${BASE_URL}/task/${taskId}/submit`, {
            method: 'POST',
            headers: authHeaders(token),
            body: JSON.stringify({ answer }),
        });
        return handleRes(res);
    },
    getTodayHomework: async (token: string) => {
        const res = await fetch(`${BASE_URL}/homework/today`, { headers: authHeaders(token) });
        return handleRes(res);
    },

    // ── EXAMS ─────────────────────────────────────
    getExams: async (token: string) => {
        const res = await fetch(`${BASE_URL}/exams`, { headers: authHeaders(token) });
        return handleRes(res);
    },
    generateExam: async (token: string, data: { session_id: string; exam_type?: string; total_marks?: number }) => {
        const res = await fetch(`${BASE_URL}/exam/generate`, {
            method: 'POST',
            headers: authHeaders(token),
            body: JSON.stringify(data),
        });
        return handleRes(res);
    },
    getExam: async (token: string, examId: string) => {
        const res = await fetch(`${BASE_URL}/exam/${examId}`, { headers: authHeaders(token) });
        return handleRes(res);
    },
    submitExam: async (token: string, examId: string, answers: Record<number, string>, time_taken_minutes: number) => {
        const res = await fetch(`${BASE_URL}/exam/${examId}/submit`, {
            method: 'POST',
            headers: authHeaders(token),
            body: JSON.stringify({ answers, time_taken_minutes }),
        });
        return handleRes(res);
    },

    // ─── STUDENT TASKS ──────────────────────────────
    getAllTasks: async (token: string) => {
        const res = await fetch(`${BASE_URL}/tasks/list`, { headers: authHeaders(token) });
        return handleRes(res);
    },

    // ─── E-BUILDER ──────────────────────────────────
    generateStudyMaterial: async (token: string, data: { session_id: string; type: string; language: string }) => {
        const res = await fetch(`${BASE_URL}/builder/generate`, {
            method: 'POST',
            headers: authHeaders(token),
            body: JSON.stringify(data),
        });
        return handleRes(res);
    },

    // ─── TRANSLATOR ─────────────────────────────────
    translateText: async (token: string, text: string, targetLanguage: string) => {
        const res = await fetch(`${BASE_URL}/translate`, {
            method: 'POST',
            headers: authHeaders(token),
            body: JSON.stringify({ text, targetLanguage }),
        });
        return handleRes(res);
    },
};
