import axios from 'axios';
import { businessHackerService } from './businessHacker.service';

export interface EnrichedMediaItem {
    title: string;
    url: string;
    link: string;
    caption: string;
}

export interface EnrichedResourceItem {
    title: string;
    url: string;
    snippet: string;
}

export interface MediaEnrichmentResult {
    topic: string;
    images: EnrichedMediaItem[];
    resources: EnrichedResourceItem[];
    injectionPrompt: string;
}

class MediaEnrichmentService {
    private cache = new Map<string, { timestamp: number; data: MediaEnrichmentResult }>();
    private readonly CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour

    /**
     * Extracts pure entity or search topic by stripping common casual and conversational noise
     */
    extractSearchTopic(raw: string): string {
        if (!raw) return '';
        let q = raw.toLowerCase().trim();

        // 1. Remove common conversational/question fillers in Hindi, Hinglish, and English
        const fillers = [
            'kaya he', 'kya he', 'kya hai', 'kya hota hai', 'kya hota', 'kisko bolte',
            'batao', 'btao', 'samjhao', 'sikhao', 'dikhao', 'show me', 'tell me about',
            'kon konse', 'kon kon se', 'kaun kaun se', 'kaunse', 'kaun se',
            'ke bare me', 'ke baare mein', 'ke baare me', 'k bare me',
            'mujhe batao', 'muje batao', 'please explain', 'explain in detail',
            'explain', 'what is', 'what are', 'who is', 'who was', 'where is',
            'how does', 'how to', 'meaning of', 'definition of', 'list of',
            'in depth', 'step by step', 'with details', 'detail me'
        ];

        for (const f of fillers) {
            q = q.replace(new RegExp(`\\b${f}\\b`, 'gi'), ' ');
        }

        // 2. Remove standalone grammatical particles in Hinglish
        const particles = ['me', 'mein', 'hai', 'he', 'ho', 'ka', 'ki', 'ke', 'ko', 'se', 'bhi', 'to', 'aur', 'and', 'the', 'a', 'an'];
        for (const p of particles) {
            q = q.replace(new RegExp(`\\b${p}\\b`, 'gi'), ' ');
        }

        q = q.replace(/[^a-zA-Z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

        // 3. Normalize common regional terms to standard encyclopedic names
        if (/gujrat/i.test(q)) q = q.replace(/gujrat/gi, 'Gujarat');
        if (/maharastra/i.test(q)) q = q.replace(/maharastra/gi, 'Maharashtra');
        if (/dilli/i.test(q)) q = q.replace(/dilli/gi, 'Delhi');
        if (/bharat/i.test(q) && !/ratna/i.test(q)) q = q.replace(/bharat/gi, 'India');

        return q || raw.trim();
    }

    /**
     * Determines whether a query is suitable for media & encyclopedic enrichment
     */
    shouldEnrich(query: string): boolean {
        const low = query.toLowerCase().trim();
        if (low.length <= 4) return false;
        
        // Skip pure greetings or small acknowledgments
        const isGreeting = /^(hi|hello|hey|hyy?|how are you|hey there|good morning|good evening|namaste|kem cho|kese ho)/i.test(low);
        const isAck = /^(ok|okay|thanks?|thx|yes|ya|yup|hm+m?|done|thank you|sahi|theek|thik)$/i.test(low);
        if (isGreeting || isAck) return false;

        // Skip live news queries (Live news is handled directly by businessHackerService with real RSS, not Wikipedia!)
        if (businessHackerService.isNewsQuery(query)) return false;

        return true;
    }

    /**
     * Fetches real high-resolution images & verified authority links for the query
     */
    async enrichQuery(rawQuery: string): Promise<MediaEnrichmentResult | null> {
        if (!this.shouldEnrich(rawQuery)) return null;

        const topic = this.extractSearchTopic(rawQuery);
        if (!topic || topic.length < 3) return null;

        const cacheKey = topic.toLowerCase();
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
            return cached.data;
        }

        try {
            const url = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(topic)}&gsrlimit=5&prop=pageimages|extracts|info&inprop=url&piprop=thumbnail&pithumbsize=960&exintro=1&explaintext=1&exchars=250&format=json`;

            const res = await axios.get(url, {
                headers: { 'User-Agent': 'FutureBuilder/1.0 (https://futurebrts.com; contact@futurebrts.com)' },
                timeout: 3000
            });

            const pages = Object.values(res.data?.query?.pages || {}) as any[];
            if (!pages || pages.length === 0) return null;

            const images: EnrichedMediaItem[] = [];
            const resources: EnrichedResourceItem[] = [];

            for (const page of pages) {
                // Filter out non-relevant or disambiguation pages
                const title = page.title || '';
                if (title.includes('(disambiguation)') || title.toLowerCase().includes('list of')) continue;

                if (page.thumbnail?.source && images.length < 3) {
                    images.push({
                        title: title,
                        url: page.thumbnail.source,
                        link: page.fullurl || `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
                        caption: title
                    });
                }

                if (page.extract && resources.length < 4) {
                    resources.push({
                        title: title,
                        url: page.fullurl || `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
                        snippet: (page.extract || '').substring(0, 180).trim() + '...'
                    });
                }
            }

            // Build an injection block for the LLM
            let injectionPrompt = '';
            if (images.length > 0 || resources.length > 0) {
                injectionPrompt = `\n================================================================================\n🖼️ VERIFIED TOPIC MEDIA & AUTHENTIC KNOWLEDGE ARTIFACTS (${topic.toUpperCase()})\n================================================================================\n`;
                
                if (images.length > 0) {
                    injectionPrompt += `MANDATORY VISUAL REQUIREMENT: Embed 1 to 2 of the following verified, high-resolution authentic images naturally in your markdown response under appropriate section headings:\n`;
                    for (const img of images) {
                        injectionPrompt += `- ![${img.title}](${img.url})\n`;
                    }
                }

                if (resources.length > 0) {
                    injectionPrompt += `\nVERIFIED CITATIONAL RESOURCES: Cite 1 to 2 of these official encyclopedic links in your response or in a dedicated "🌐 Verified Resources" section:\n`;
                    for (const res of resources) {
                        injectionPrompt += `- [${res.title} Official Reference](${res.url}) - ${res.snippet}\n`;
                    }
                }
                injectionPrompt += `================================================================================\n`;
            }

            const result: MediaEnrichmentResult = {
                topic,
                images,
                resources,
                injectionPrompt
            };

            this.cache.set(cacheKey, { timestamp: Date.now(), data: result });
            return result;
        } catch (error: any) {
            console.warn(`[MediaEnrichmentService] Failed to enrich topic "${topic}":`, error.message);
            return null;
        }
    }
}

export const mediaEnrichmentService = new MediaEnrichmentService();
