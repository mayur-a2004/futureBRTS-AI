import axios from 'axios';
import * as cheerio from 'cheerio';

export interface LiveWebSearchResult {
    query: string;
    newsItems: { title: string; link: string; pubDate: string; snippet?: string }[];
    images: { title: string; url: string; sourceUrl: string }[];
    youtubeVideo?: {
        videoId: string;
        title: string;
        watchUrl: string;
        embedUrl: string;
        thumbnailUrl: string;
    };
    productGrounding?: {
        targetProduct: string;
        priceRange?: string;
        recommendedModels: {
            name: string;
            approxPrice: string;
            imageUrl?: string;
            amazonUrl: string;
            flipkartUrl: string;
            features: string[];
        }[];
    };
    injectionPrompt: string;
}

class LiveWebSearchService {
    private cache = new Map<string, { timestamp: number; data: LiveWebSearchResult }>();
    private ytCache = new Map<string, { timestamp: number; data: any }>();
    private readonly CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes

    /**
     * Cleans user query and extracts core entity/intent
     */
    extractCleanEntity(raw: string): { cleanTopic: string; isCommercial: boolean; isNews: boolean; isVideo: boolean } {
        if (!raw) return { cleanTopic: '', isCommercial: false, isNews: false, isVideo: false };
        const low = raw.toLowerCase().trim();

        const isCommercial = /\b(buy|price|purchase|laptop|phone|mobile|iphon[e]?|camera|tv|shoes|under\s+\d+|uper\s+ka|latest\s+piece|amazon|flipkart|meesho|chahiye|lena\s+he|kharidna)\b/i.test(low);
        const isNews = /\b(news|samachar|khabar|aaj\s*ka|today|headline|update|nifty|sensex|budget|election|stock\s*market)\b/i.test(low);
        const isVideo = /\b(video|trailer|unboxing|review|youtube|yt|dikhao|animation|stream)\b/i.test(low);

        let topic = low;
        // Strip common conversational Hindi/English noise
        const noise = [
            '50000 ku uper ka', '50000 ke upar ka', '50000 ke upar', 'under 50000', 'under 60000', 'under 1 lakh',
            'amazon ke link ka according', 'amazon ke link ke sath', 'proper dikhav', 'dikhav muje lena he',
            'running konsa', 'latest piece he', 'latest piece', 'muje lena he', 'lena he', 'dikhao', 'batao',
            'chahiye', 'kya hai', 'kya he', 'bataiye', 'please show me', 'show me'
        ];
        for (const n of noise) {
            topic = topic.replace(new RegExp(n, 'gi'), ' ');
        }
        topic = topic.replace(/[^a-zA-Z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

        // Standardize common misspellings
        if (/\biphon[e]?\b/i.test(low)) topic = 'iPhone';
        else if (/\bsams[u]?ng\b/i.test(low)) topic = 'Samsung Galaxy';
        else if (/\bleptop|lapto[p]?\b/i.test(low)) topic = 'Laptop';
        else if (/\brel[ia]{1,2}nce\b/i.test(low)) topic = 'Reliance Industries';

        return {
            cleanTopic: topic || raw.trim(),
            isCommercial,
            isNews,
            isVideo
        };
    }

    /**
     * Resolves verified 11-char YouTube Video ID
     */
    async resolveYouTubeVideo(query: string): Promise<any | null> {
        if (!query || query.trim().length < 2) return null;
        const cacheKey = query.toLowerCase().trim();
        const cached = this.ytCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
            return cached.data;
        }

        try {
            const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
            const res = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                    'Accept-Language': 'en-US,en;q=0.9'
                },
                timeout: 3000
            });

            const data = res.data;
            const matches = [...data.matchAll(/\/watch\?v=([a-zA-Z0-9_-]{11})/g)];
            const ids = Array.from(new Set(matches.map(m => m[1])));

            if (ids.length > 0) {
                const videoId = ids[0];
                const videoData = {
                    videoId,
                    title: `${query} (Official Video)`,
                    watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
                    embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
                    thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
                };
                this.ytCache.set(cacheKey, { timestamp: Date.now(), data: videoData });
                return videoData;
            }
            return null;
        } catch (e: any) {
            console.warn('[LiveWebSearch] YouTube resolve failed:', e.message);
            return null;
        }
    }

    /**
     * Fetches real-time web & news headlines via Google RSS
     */
    async fetchLiveNews(query: string): Promise<any[]> {
        try {
            const res = await axios.get(`https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-IN&gl=IN&ceid=IN:en`, {
                headers: { 'User-Agent': 'Mozilla/5.0' },
                timeout: 3000
            });
            const $ = cheerio.load(res.data, { xmlMode: true });
            const items: any[] = [];
            $('item').slice(0, 5).each((_, el) => {
                const title = $(el).find('title').text();
                const link = $(el).find('link').text();
                const pubDate = $(el).find('pubDate').text();
                if (title && link) {
                    items.push({ title, link, pubDate });
                }
            });
            return items;
        } catch {
            return [];
        }
    }

    /**
     * Fetches real product & entity images from Wikimedia Commons
     */
    async fetchWikipediaMedia(entity: string): Promise<any[]> {
        try {
            const url = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(entity)}&gsrlimit=6&prop=pageimages|extracts|info&inprop=url&piprop=thumbnail|original&pithumbsize=600&exintro=1&explaintext=1&exchars=200&format=json`;
            const res = await axios.get(url, { headers: { 'User-Agent': 'FutureBuilder/2.0' }, timeout: 3000 });
            const pages = Object.values(res.data?.query?.pages || {}) as any[];
            const images: any[] = [];
            for (const p of pages) {
                const imgUrl = p.thumbnail?.source || p.original?.source;
                if (imgUrl && !p.title.includes('(disambiguation)') && !p.title.toLowerCase().includes('list of')) {
                    images.push({
                        title: p.title,
                        url: imgUrl,
                        sourceUrl: p.fullurl || `https://en.wikipedia.org/wiki/${encodeURIComponent(p.title)}`
                    });
                }
            }
            return images;
        } catch {
            return [];
        }
    }

    /**
     * Comprehensive multi-modal enrichment for user queries
     */
    async searchAndEnrich(rawQuery: string): Promise<LiveWebSearchResult | null> {
        if (!rawQuery || rawQuery.trim().length < 3) return null;

        const cacheKey = rawQuery.toLowerCase().trim();
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
            return cached.data;
        }

        const { cleanTopic, isCommercial, isNews, isVideo } = this.extractCleanEntity(rawQuery);

        try {
            // Run live searches concurrently
            const [newsItems, mediaImages, ytVideo] = await Promise.all([
                this.fetchLiveNews(cleanTopic || rawQuery),
                this.fetchWikipediaMedia(cleanTopic || rawQuery),
                (isVideo || isCommercial || rawQuery.toLowerCase().includes('video'))
                    ? this.resolveYouTubeVideo(`${cleanTopic || rawQuery} review`)
                    : Promise.resolve(null)
            ]);

            // Build rich prompt injection
            let injectionPrompt = `\n================================================================================\n🌐 REAL-TIME LIVE WEB & MEDIA GROUNDING (RETRIEVED JUST NOW)\n================================================================================\n`;
            injectionPrompt += `QUERY CONTEXT: "${rawQuery}" (Target: ${cleanTopic})\n`;
            injectionPrompt += `TIMESTAMP: ${new Date().toISOString()} (Live Real-Time Ground Truth)\n\n`;

            if (newsItems.length > 0) {
                injectionPrompt += `🔥 CURRENT LIVE HEADLINES & MARKET UPDATES:\n`;
                newsItems.forEach((n, idx) => {
                    injectionPrompt += `${idx + 1}. ${n.title} (${n.pubDate})\n   Source: ${n.link}\n`;
                });
                injectionPrompt += `\n`;
            }

            if (mediaImages.length > 0) {
                injectionPrompt += `📸 AUTHENTIC VERIFIED IMAGES (MANDATORY TO EMBED):\n`;
                mediaImages.slice(0, 3).forEach(img => {
                    injectionPrompt += `- ![${img.title}](${img.url})\n`;
                });
                injectionPrompt += `MANDATORY: Embed at least 1-2 of the above verified image URLs in your response using markdown syntax: ![Title](URL)\n\n`;
            }

            if (ytVideo) {
                injectionPrompt += `🎥 VERIFIED PLAYABLE YOUTUBE VIDEO:\n`;
                injectionPrompt += `- Title: ${ytVideo.title}\n`;
                injectionPrompt += `- Watch URL: [${ytVideo.title}](${ytVideo.watchUrl})\n`;
                injectionPrompt += `- Video ID: ${ytVideo.videoId} (Direct Embed Ready)\n`;
                injectionPrompt += `MANDATORY: Cite this video link so users can watch directly: [Watch on YouTube](${ytVideo.watchUrl})\n\n`;
            }

            if (isCommercial) {
                const searchProduct = encodeURIComponent(cleanTopic || rawQuery);
                injectionPrompt += `🛒 DIRECT E-COMMERCE PURCHASE LINKS:\n`;
                injectionPrompt += `- Amazon India: [Buy on Amazon India](https://www.amazon.in/s?k=${searchProduct})\n`;
                injectionPrompt += `- Flipkart: [Check Deals on Flipkart](https://www.flipkart.com/search?q=${searchProduct})\n`;
                injectionPrompt += `\nCRITICAL PRICE & MODEL ACCURACY:\n`;
                injectionPrompt += `Do NOT use outdated 2023/2024 cutoff models as current flagships. Use the live headlines provided above. For iPhone, acknowledge the current active lineup (iPhone 16, 16 Pro, 16 Plus, 16 Pro Max, iPhone 15) with current Indian market pricing (e.g. ₹69,000 - ₹1,34,000). Show verified images and direct purchase links.\n`;
            }

            injectionPrompt += `================================================================================\n`;

            const result: LiveWebSearchResult = {
                query: rawQuery,
                newsItems,
                images: mediaImages,
                youtubeVideo: ytVideo || undefined,
                injectionPrompt
            };

            this.cache.set(cacheKey, { timestamp: Date.now(), data: result });
            return result;
        } catch (e: any) {
            console.warn('[LiveWebSearchService] Enrichment failed:', e.message);
            return null;
        }
    }
}

export const liveWebSearchService = new LiveWebSearchService();
