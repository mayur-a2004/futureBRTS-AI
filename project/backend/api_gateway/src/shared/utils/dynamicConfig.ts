import SystemSettings from '../../modules/admin/settings.model';
import { logger } from './logger';

/**
 * 💡 DYNAMIC CONFIGURATION UTILITY
 * Fetches settings from MongoDB (SystemSettings) with a fallback to process.env.
 * This ensures that admin-panel changes are live across the entire backend immediately.
 */
export const getDynamicConfig = async (key: string, defaultValue: any = null) => {
    try {
        const setting = await SystemSettings.findOne({ key });
        if (setting && setting.value !== undefined && setting.value !== null) {
            // Trim if it's a string (common for keys)
            if (typeof setting.value === 'string') {
                return setting.value.trim();
            }
            return setting.value;
        }
    } catch (error: any) {
        logger.error(`[ConfigUtil] Error fetching key "${key}":`, error.message);
    }
    
    // Fallback to environment variable
    return process.env[key] !== undefined ? process.env[key] : defaultValue;
};

/**
 * 🤖 SPECIALIZED: Get AI API Key
 * Specifically looks for AI_GROQ_KEY, etc., but falls back to GROQ_API_KEY for compatibility.
 */
export const getAiKey = async (provider: 'GROQ' | 'GEMINI' | 'OPENROUTER' | 'NVIDIA' | 'OPENAI' | 'ANTHROPIC' | 'BLUESMINDS') => {
    const primaryKey = `AI_${provider}_KEY`;
    const secondaryKey = `${provider}_API_KEY`;

    let key = await getDynamicConfig(primaryKey);
    if (!key) {
        key = await getDynamicConfig(secondaryKey);
    }
    
    return key;
};

/**
 * 🔗 DYNAMIC PROVISIONING: Get Active AI Provider
 */
export const getActiveAiProvider = async () => {
    return await getDynamicConfig('AI_LIVE_PROVIDER', process.env.SYSTEM_AI_PROVIDER || 'groq');
};

// ─────────────────────────────────────────────────────
// NVIDIA NIM: Model Pool per Task Type
// These are the NVIDIA NIM model pools for each task.
// Admin can override primary/secondary via DB settings.
// ─────────────────────────────────────────────────────
export const NVIDIA_MODEL_POOLS: Record<string, string[]> = {
    // For coding, roadmap generation, builder tasks
    code: [
        'meta/llama-3.1-8b-instruct',
        'meta/llama-3.3-70b-instruct',
    ],
    // For fast student chat, quiz battle
    chat: [
        'meta/llama-3.1-8b-instruct',
        'meta/llama-3.2-3b-instruct',
        'meta/llama-3.3-70b-instruct',
    ],
    // For vision tasks - diagram analysis, lab images
    vision: [
        'meta/llama-3.2-11b-vision-instruct',
    ],
    // For heavy logic - syllabus parsing, analytics
    logic: [
        'meta/llama-3.1-8b-instruct',
        'meta/llama-3.3-70b-instruct',
    ],
};

/**
 * 🎯 Get the NVIDIA model pool for a task, with admin DB override support
 */
export const getNvidiaModels = async (taskType: keyof typeof NVIDIA_MODEL_POOLS = 'chat'): Promise<string[]> => {
    try {
        // Admin can override primary model via DB: e.g., NVIDIA_MODEL_CHAT_PRIMARY = 'meta/llama-3.3-70b-instruct'
        const primaryOverride = await getDynamicConfig(`NVIDIA_MODEL_${taskType.toUpperCase()}_PRIMARY`);
        const secondaryOverride = await getDynamicConfig(`NVIDIA_MODEL_${taskType.toUpperCase()}_SECONDARY`);
        
        const basePool = [...(NVIDIA_MODEL_POOLS[taskType] || NVIDIA_MODEL_POOLS.chat)];
        
        if (primaryOverride) basePool[0] = primaryOverride;
        if (secondaryOverride) basePool[1] = secondaryOverride;
        
        return basePool;
    } catch {
        return NVIDIA_MODEL_POOLS[taskType] || NVIDIA_MODEL_POOLS.chat;
    }
};
