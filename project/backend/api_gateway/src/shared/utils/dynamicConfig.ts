import mongoose from 'mongoose';
import SystemSettings from '../../modules/admin/settings.model';
import { logger } from './logger';

/**
 * 💡 DYNAMIC CONFIGURATION UTILITY
 * Fetches settings from MongoDB (SystemSettings) with a fallback to process.env.
 * This ensures that admin-panel changes are live across the entire backend immediately.
 */
export const getDynamicConfig = async (key: string, defaultValue: any = null) => {
    try {
        if (mongoose.connection.readyState === 1) {
            const setting = await SystemSettings.findOne({ key }).maxTimeMS(1000).exec();
            if (setting && setting.value !== undefined && setting.value !== null) {
                // Trim if it's a string (common for keys)
                if (typeof setting.value === 'string') {
                    const trimmed = setting.value.trim();
                    if (trimmed !== '') return trimmed;
                } else {
                    return setting.value;
                }
            }
        }
    } catch (error: any) {
        logger.error(`[ConfigUtil] Error fetching key "${key}":`, error.message);
    }
    
    // Fallback to environment variable
    const envVal = process.env[key];
    return (envVal !== undefined && envVal !== null && envVal.trim() !== '') ? envVal.trim() : defaultValue;
};

/**
 * 🤖 SPECIALIZED: Get AI API Key
 * Specifically looks for AI_GROQ_KEY, etc., but falls back to GROQ_API_KEY for compatibility.
 */
export const getAiKey = async (provider: 'GROQ' | 'GEMINI' | 'OPENROUTER' | 'NVIDIA' | 'OPENAI' | 'ANTHROPIC' | 'BLUESMINDS') => {
    const primaryKey = `AI_${provider}_KEY`;
    const secondaryKey = `${provider}_API_KEY`;

    let key = await getDynamicConfig(primaryKey);
    if (!key || typeof key !== 'string' || key.trim() === '') {
        key = await getDynamicConfig(secondaryKey);
    }
    if (!key || typeof key !== 'string' || key.trim() === '') {
        key = process.env[primaryKey] || process.env[secondaryKey] || '';
    }
    
    return key ? String(key).trim() : '';
};

/**
 * 🔗 DYNAMIC PROVISIONING: Get Active AI Provider
 */
export const getActiveAiProvider = async () => {
    return await getDynamicConfig('AI_LIVE_PROVIDER', process.env.SYSTEM_AI_PROVIDER || 'groq');
};

// ─────────────────────────────────────────────────────
// GROQ: Dynamic Model Pools with Admin Overrides
// ─────────────────────────────────────────────────────
export const GROQ_MODEL_POOLS = [
    'openai/gpt-oss-120b',
    'openai/gpt-oss-20b',
    'allam-2-7b',
    'qwen/qwen3.8-27b'
];

export const getGroqModels = async (): Promise<string[]> => {
    try {
        const primaryOverride = await getDynamicConfig('GROQ_MODEL_PRIMARY');
        const secondaryOverride = await getDynamicConfig('GROQ_MODEL_SECONDARY');
        const basePool = [...GROQ_MODEL_POOLS];
        if (primaryOverride) basePool[0] = primaryOverride;
        if (secondaryOverride) basePool[1] = secondaryOverride;
        return basePool;
    } catch {
        return GROQ_MODEL_POOLS;
    }
};

// ─────────────────────────────────────────────────────
// NVIDIA NIM: Model Pool per Task Type
// Updated active NVIDIA model pools
// ─────────────────────────────────────────────────────
export const NVIDIA_MODEL_POOLS: Record<string, string[]> = {
    code: [
        'meta/llama-3.2-11b-vision-instruct',
        'meta/llama-3.2-90b-vision-instruct',
        'meta/codellama-70b',
    ],
    chat: [
        'meta/llama-3.2-11b-vision-instruct',
        'meta/llama-3.2-90b-vision-instruct',
        'google/gemma-3-12b-it',
    ],
    vision: [
        'meta/llama-3.2-11b-vision-instruct',
        'meta/llama-3.2-90b-vision-instruct',
    ],
    logic: [
        'meta/llama-3.2-11b-vision-instruct',
        'meta/llama-3.2-90b-vision-instruct',
    ],
};

/**
 * 🎯 Get the NVIDIA model pool for a task, with admin DB override support
 */
export const getNvidiaModels = async (taskType: keyof typeof NVIDIA_MODEL_POOLS = 'chat'): Promise<string[]> => {
    try {
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

