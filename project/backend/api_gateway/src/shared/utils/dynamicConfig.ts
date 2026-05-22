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
export const getAiKey = async (provider: 'GROQ' | 'GEMINI' | 'OPENROUTER') => {
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
