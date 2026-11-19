export interface WikipediaGrounding {
    title: string;
    description: string;
    extract: string;
    thumbnailUrl?: string;
    originalImageUrl?: string;
    pageUrl: string;
}

export interface PibRelease {
    title: string;
    link: string;
    pubDate: string;
}

export interface TvChannel {
    name: string;
    category: 'Business & Stocks' | 'National News' | 'Global Markets';
    liveUrl: string;
    embedUrl: string;
    badge: string;
}

export interface ProductMarketplace {
    platform: string;
    searchUrl: string;
    type: 'B2C Retail' | 'B2B Wholesale' | 'Direct Manufacturer';
}

class OmniGroundingService {
    private wikiCache = new Map<string, { timestamp: number; data: WikipediaGrounding }>();
    private pibCache: { timestamp: number; items: PibRelease[] } | null = null;
    private readonly CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes

    /**
     * Curated verified 24/7 Official Live TV News Channels
     */
    getLiveTvChannels(): TvChannel[] {
        return [
            {
                name: 'CNBC Awaaz (Stock Market & Business)',
                category: 'Business & Stocks',
                liveUrl: 'https://www.youtube.com/@CNBCAwaaz/live',
                embedUrl: 'https://www.youtube.com/results?search_query=cnbc+awaaz+live+stream',
                badge: '🔴 24/7 LIVE'
            },
            {
                name: 'Zee Business (Share Bazaar & Corporate)',
                category: 'Business & Stocks',
                liveUrl: 'https://www.youtube.com/@ZeeBusiness/live',
                embedUrl: 'https://www.youtube.com/results?search_query=zee+business+live+stream',
                badge: '🔴 24/7 LIVE'
            },
            {
                name: 'NDTV Profit (Markets & Industry)',
                category: 'Business & Stocks',
                liveUrl: 'https://www.youtube.com/@ndtvprofit/live',
                embedUrl: 'https://www.youtube.com/results?search_query=ndtv+profit+live+stream',
                badge: '🔴 24/7 LIVE'
            },
            {
                name: 'Aaj Tak (National News Bulletin)',
                category: 'National News',
                liveUrl: 'https://www.youtube.com/@aajtak/live',
                embedUrl: 'https://www.youtube.com/results?search_query=aaj+tak+live+stream',
                badge: '🔴 24/7 LIVE'
            },
            {
                name: 'Bloomberg Television (Global Wall Street)',
                category: 'Global Markets',
                liveUrl: 'https://www.youtube.com/@markets/live',
                embedUrl: 'https://www.youtube.com/results?search_query=bloomberg+television+live',
                badge: '🔴 24/7 LIVE'
            }
        ];
    }

    /**
     * Verified Official Government of India & Regulatory Portals
     */
    getOfficialGovtPortals() {
        return [
            { name: 'PIB (Press Information Bureau - Govt of India)', url: 'https://pib.gov.in', description: 'Official Cabinet & Ministry Statements' },
            { name: 'RBI (Reserve Bank of India)', url: 'https://rbi.org.in', description: 'Monetary Policy, Repo Rate & Banking Regulations' },
            { name: 'SEBI (Securities & Exchange Board of India)', url: 'https://sebi.gov.in', description: 'Stock Market & Securities Circulars' },
            { name: 'MCA-21 (Ministry of Corporate Affairs)', url: 'https://mca.gov.in', description: 'Company Registration & Filings' },
            { name: 'GeM (Government e-Marketplace)', url: 'https://gem.gov.in', description: 'Central & State Government Tenders & Procurement' },
            { name: 'Department of Commerce (DGFT)', url: 'https://dgft.gov.in', description: 'Export-Import Policy & Trade Tariffs' }
        ];
    }

    /**
     * Fetches verified Wikipedia summary + High-Resolution Original Photos from Wikimedia Commons
     */
    async fetchWikipediaData(topic: string): Promise<WikipediaGrounding | null> {
        if (!topic || topic.trim().length < 2) return null;
        const clean = topic.trim();
        const cacheKey = clean.toLowerCase();

        const cached = this.wikiCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
            return cached.data;
        }

        try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 4000);

            const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(clean)}`;
            const res = await fetch(url, {
                headers: { 'User-Agent': 'FutureBuilder/2.0 (https://futurebrts.com; contact@futurebrts.com)' },
                signal: controller.signal
            });
            clearTimeout(timer);

            if (!res.ok) return null;
            const data: any = await res.json();
            if (!data || !data.title || data.type === 'https://mediawiki.org/wiki/HyperSwitch/errors/not_found') {
                return null;
            }

            const result: WikipediaGrounding = {
                title: data.title,
                description: data.description || '',
                extract: data.extract || '',
                thumbnailUrl: data.thumbnail?.source,
                originalImageUrl: data.originalimage?.source || data.thumbnail?.source,
                pageUrl: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(data.title)}`
            };

            this.wikiCache.set(cacheKey, { timestamp: Date.now(), data: result });
            return result;
        } catch {
            return null;
        }
    }

    /**
     * Fetches real, verified Government Press Releases from PIB India RSS
     */
    async fetchPibReleases(): Promise<PibRelease[]> {
        if (this.pibCache && Date.now() - this.pibCache.timestamp < this.CACHE_TTL_MS) {
            return this.pibCache.items;
        }

        try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 5000);

            const res = await fetch('https://pib.gov.in/RssMain.aspx?ModId=6', {
                headers: { 'User-Agent': 'Mozilla/5.0' },
                signal: controller.signal
            });
            clearTimeout(timer);

            if (!res.ok) return [];
            const xml = await res.text();
            const items: PibRelease[] = [];
            const itemRegex = /<item>[\s\S]*?<title>(.*?)<\/title>[\s\S]*?<link>(.*?)<\/link>[\s\S]*?<pubDate>(.*?)<\/pubDate>[\s\S]*?<\/item>/g;
            let match;

            while ((match = itemRegex.exec(xml)) !== null && items.length < 5) {
                const title = match[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim();
                const link = match[2].trim();
                const pubDate = match[3].trim();
                items.push({ title, link, pubDate });
            }

            if (items.length > 0) {
                this.pibCache = { timestamp: Date.now(), items };
            }
            return items;
        } catch {
            return [];
        }
    }

    /**
     * Detects if the query is a product / shopping / commercial purchase intent
     */
    
    isTvChannelsQuery(query: string): boolean {
        const low = query.toLowerCase().trim();
        return /\b(tv\s*chann?els?|live\s*tv|news\s*chann?els?|tv\s*news|aaj\s*tak|cnbc|zee\s*business|ndtv|bloomberg|sare\s*tv|khabar\s*chann?el|live\s*stream)\b/i.test(low);
    }
    _oldIsTvChannelsQuery(query: string): boolean {
        const low = query.toLowerCase().trim();
        return /\b(tv\s*channels?|live\s*tv|news\s*channels?|tv\s*news|aaj\s*tak|cnbc|zee\s*business|ndtv|bloomberg|sare\s*tv|khabar\s*channel|live\s*stream)\b/i.test(low);
    }

    isGovtPortalsQuery(query: string): boolean {
        const low = query.toLowerCase().trim();
        return /\b(gourm?ent|gov(ern)?ment|govt|sarkar|sare\s*portal|pib|rbi|sebi|yojana|mca|tender|scheme|cabinet\s*decision)\b/i.test(low);
    }
    _oldIsGovtPortalsQuery(query: string): boolean {
        const low = query.toLowerCase().trim();
        return /\b(gourment|goverment|government|govt\s*portal|sare\s*portal|pib|rbi|sebi|yojana|mca|tender|scheme|cabinet\s*decision)\b/i.test(low);
    }

    isMapsQuery(query: string): boolean {
        const low = query.toLowerCase().trim();
        return /\b(google\s*maps?|maps?|location|directions?|kaha\s*hai|near\s*me|address|route)\b/i.test(low);
    }

    isYoutubeQuery(query: string): boolean {
        const low = query.toLowerCase().trim();
        return /\b(yout[u]?be|yt|video\s*source|video\s*dekho|video\s*link)\b/i.test(low);
    }
    _oldIsYoutubeQuery(query: string): boolean {
        const low = query.toLowerCase().trim();
        return /\b(youtube|yt\s*channel|youtube\s*video|video\s*source|video\s*dekho|video\s*link)\b/i.test(low);
    }

    generateMapCards(query: string) {
        const clean = encodeURIComponent(query.replace(/\b(google\s*maps?|maps?|location|where\s*is|address|kaha\s*hai)\b/gi, '').trim() || 'India');
        return [
            { platform: 'Google Maps (Navigation & Live Traffic)', url: 'https://www.google.com/maps/search/?api=1&query=' + clean, type: 'Satellite & GPS' },
            { platform: 'OpenStreetMap (Global Open Geospatial Data)', url: 'https://www.openstreetmap.org/search?query=' + clean, type: 'Community Mapping' }
        ];
    }

    generateYoutubeCards(query: string) {
        const clean = encodeURIComponent(query.replace(/\b(youtube|yt|video|channels?|dikhao)\b/gi, '').trim() || 'live news india');
        return [
            { title: 'CNBC Awaaz Official Live Stream', url: 'https://www.youtube.com/@CNBCAwaaz/live' },
            { title: 'Zee Business Official Live Stream', url: 'https://www.youtube.com/@ZeeBusiness/live' },
            { title: 'Aaj Tak Official Live Stream', url: 'https://www.youtube.com/@aajtak/live' },
            { title: 'NDTV Profit Official Live Stream', url: 'https://www.youtube.com/@ndtvprofit/live' },
            { title: 'Search YouTube: ' + decodeURIComponent(clean), url: 'https://www.youtube.com/results?search_query=' + clean }
        ];
    }

    isProductQuery(query: string): boolean {
        const low = query.toLowerCase().trim();
        return /\b(buy|price|purchase|laptop|phone|mobile|iphon[e]?|camera|saree|textile|shoes|watch|car|bike|gadget|under\s+\d+|uper\s+ka|upar\s+ka|lena\s+he|kharidna|best\s+[a-z]+|amazon|flipkart|indiamart|meesho)\b/i.test(low);
    }

    /**
     * Generates verified multi-platform e-commerce search cards
     */
    generateProductCards(query: string): ProductMarketplace[] {
        const clean = encodeURIComponent(query.replace(/\b(buy|find|search|chahiye|dikhao)\b/gi, '').trim());
        return [
            { platform: 'Amazon India (Retail & 1-Day Prime)', searchUrl: `https://www.amazon.in/s?k=${clean}`, type: 'B2C Retail' },
            { platform: 'Flipkart (Electronics & Fashion)', searchUrl: `https://www.flipkart.com/search?q=${clean}`, type: 'B2C Retail' },
            { platform: 'IndiaMART (Direct Manufacturers & Bulk Wholesale)', searchUrl: `https://dir.indiamart.com/search.mp?ss=${clean}`, type: 'B2B Wholesale' },
            { platform: 'Meesho (Direct Wholesalers & Resellers)', searchUrl: `https://www.meesho.com/search?q=${clean}`, type: 'Direct Manufacturer' }
        ];
    }

    /**
     * Builds comprehensive multi-modal visual grounding injection
     */
    async buildOmniGroundingPrompt(rawQuery: string): Promise<string> {
        let snippet = '';

        // 1. Wikipedia & Verified Visual Media
        const wiki = await this.fetchWikipediaData(rawQuery);
        if (wiki && (wiki.extract || wiki.originalImageUrl)) {
            snippet += `
================================================================================
🏛️ VERIFIED ENCYCLOPEDIC GROUNDING & VISUAL MEDIA (WIKIPEDIA / WIKIMEDIA)
================================================================================
TOPIC: ${wiki.title} (${wiki.description || 'Verified Entity'})
FACTUAL EXTRACT: "${wiki.extract.substring(0, 400)}"
OFFICIAL ARTICLE: [Wikipedia: ${wiki.title}](${wiki.pageUrl})
`;
            if (wiki.originalImageUrl) {
                snippet += `AUTHENTIC HIGH-RES PHOTO: ![${wiki.title}](${wiki.originalImageUrl})\n`;
                snippet += `MANDATORY: You MUST embed this verified image in your response using markdown: ![${wiki.title}](${wiki.originalImageUrl})\n`;
            }
            snippet += `================================================================================\n`;
        }

        // 2. Official Government PIB Releases (if government/policy/national query)
        if (/\b(gov|government|policy|pib|minister|yojana|scheme|tender|modi|cabinet|rbi|sebi)\b/i.test(rawQuery)) {
            const pibItems = await this.fetchPibReleases();
            if (pibItems.length > 0) {
                snippet += `
================================================================================
🇮🇳 VERIFIED GOVERNMENT OF INDIA OFFICIAL PRESS RELEASES (PIB INDIA)
================================================================================
`;
                pibItems.forEach((p, idx) => {
                    snippet += `${idx + 1}. **${p.title}**\n   - Official Link: [Read on PIB India](${p.link})\n`;
                });
                snippet += `================================================================================\n`;
            }
        }

        // 3. Live 24/7 News TV Channels (if news/tv query)
        if (/\b(tv|channel|live news|khabar|bulletin|samachar|today news)\b/i.test(rawQuery)) {
            const channels = this.getLiveTvChannels();
            snippet += `
================================================================================
📺 24/7 VERIFIED OFFICIAL LIVE TV NEWS CHANNELS
================================================================================
`;
            channels.forEach((ch, idx) => {
                snippet += `${idx + 1}. **${ch.name}** (${ch.badge}) - [Watch Official Live Stream](${ch.liveUrl})\n`;
            });
            snippet += `================================================================================\n`;
        }

        // 4. E-Commerce & Product Cards (if shopping query)
        if (this.isProductQuery(rawQuery)) {
            const products = this.generateProductCards(rawQuery);
            snippet += `
================================================================================
🛍️ VERIFIED MULTI-PLATFORM SHOPPING & WHOLESALE DIRECT DIRECTORY
================================================================================
Include this clean comparison matrix for the user:
| Platform | Market Type | Direct Verified Link |
|---|---|---|
`;
            products.forEach(p => {
                snippet += `| **${p.platform}** | ${p.type} | [Check Live Pricing & Availability](${p.searchUrl}) |\n`;
            });
            snippet += `================================================================================\n`;
        }

        
        // 5. Maps & Geospatial (if maps/location query)
        if (this.isMapsQuery(rawQuery)) {
            const maps = this.generateMapCards(rawQuery);
            snippet += `
================================================================================
🗺️ VERIFIED MAPS & GEOSPATIAL DIRECTORY
================================================================================
`;
            maps.forEach(m => {
                snippet += `- **${m.platform}**: [Open Live Interactive Map](${m.url})\n`;
            });
            snippet += `================================================================================\n`;
        }

        // 6. YouTube Sources (if video/channel query)
        if (this.isYoutubeQuery(rawQuery)) {
            const yt = this.generateYoutubeCards(rawQuery);
            snippet += `
================================================================================
▶️ VERIFIED YOUTUBE SOURCES & CHANNELS
================================================================================
`;
            yt.forEach(y => {
                snippet += `- **${y.title}**: [Watch on YouTube](${y.url})\n`;
            });
            snippet += `================================================================================\n`;
        }

        return snippet;
    }
}

export const omniGroundingService = new OmniGroundingService();