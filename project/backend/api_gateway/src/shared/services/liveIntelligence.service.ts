import axios from 'axios';
import { getAiKey, getDynamicConfig } from '../../shared/utils/dynamicConfig';

// ──────────────────────────────────────────────────────────────
// LIVE INTELLIGENCE SERVICE — Real-time Web Search & Grounding
// ──────────────────────────────────────────────────────────────

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
  publishedAt?: string;
  credibilityScore?: number;
}

export interface SearchResponse {
  success: boolean;
  query: string;
  results: SearchResult[];
  totalResults: number;
  searchTimeMs: number;
  error?: string;
}

export interface LiveFactCheck {
  claim: string;
  verified: boolean;
  confidence: number;
  sources: SearchResult[];
  explanation: string;
}

export interface LiveDataFeed {
  type: 'stock' | 'news' | 'weather' | 'govt' | 'academic';
  data: any;
  timestamp: string;
  source: string;
}

class LiveIntelligenceService {
  private braveApiKey: string | null = null;
  private bingApiKey: string | null = null;
  private serpApiKey: string | null = null;
  private googleCseKey: string | null = null;
  private googleCseId: string | null = null;
  private cache = new Map<string, { data: any; expires: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.loadKeys();
    // Refresh keys every 10 minutes
    setInterval(() => this.loadKeys(), 10 * 60 * 1000);
  }

  private async loadKeys() {
    try {
      this.braveApiKey = await getDynamicConfig('BRAVE_SEARCH_API_KEY');
      this.bingApiKey = await getDynamicConfig('BING_SEARCH_API_KEY');
      this.serpApiKey = await getDynamicConfig('SERPAPI_KEY');
      this.googleCseKey = await getDynamicConfig('GOOGLE_CSE_API_KEY');
      this.googleCseId = await getDynamicConfig('GOOGLE_CSE_ID');
    } catch (e) {
      console.warn('[LiveIntelligence] Key load failed:', e);
    }
  }

  // ──────────────────────────────────────────────────────────────
  // CORE SEARCH — Multi-provider with fallback
  // ──────────────────────────────────────────────────────────────
  async searchWeb(query: string, options: {
    freshness?: 'day' | 'week' | 'month' | 'year';
    sources?: ('news' | 'academic' | 'web' | 'video')[];
    count?: number;
    region?: string;
    language?: string;
  } = {}): Promise<SearchResponse> {
    const startTime = Date.now();
    const cacheKey = `search:${query}:${JSON.stringify(options)}`;

    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
      return { ...cached.data, searchTimeMs: Date.now() - startTime };
    }

    const { freshness = 'month', sources = ['web', 'news'], count = 10, region = 'in', language = 'en' } = options;

    let results: SearchResult[] = [];
    let providerUsed = 'none';
    let error: string | undefined;

    // Provider 1: Brave Search (Best for privacy, good quality)
    if (this.braveApiKey && results.length < count) {
      try {
        const braveResults = await this.searchBrave(query, { freshness, count: Math.min(count, 10), region });
        results.push(...braveResults);
        providerUsed = 'brave';
      } catch (e: any) {
        console.warn('[LiveIntelligence] Brave search failed:', e.message);
      }
    }

    // Provider 2: Bing Search (Microsoft, good coverage)
    if (this.bingApiKey && results.length < count) {
      try {
        const bingResults = await this.searchBing(query, { freshness, count: Math.min(count - results.length, 10), region });
        results.push(...bingResults);
        providerUsed += providerUsed !== 'none' ? '+bing' : 'bing';
      } catch (e: any) {
        console.warn('[LiveIntelligence] Bing search failed:', e.message);
      }
    }

    // Provider 3: SerpAPI (Google results via API)
    if (this.serpApiKey && results.length < count) {
      try {
        const serpResults = await this.searchSerpAPI(query, { freshness, count: Math.min(count - results.length, 10), region });
        results.push(...serpResults);
        providerUsed += providerUsed !== 'none' ? '+serpapi' : 'serpapi';
      } catch (e: any) {
        console.warn('[LiveIntelligence] SerpAPI search failed:', e.message);
      }
    }

    // Provider 4: Google Custom Search (Free tier available)
    if (this.googleCseKey && this.googleCseId && results.length < count) {
      try {
        const googleResults = await this.searchGoogleCSE(query, { count: Math.min(count - results.length, 10) });
        results.push(...googleResults);
        providerUsed += providerUsed !== 'none' ? '+google' : 'google';
      } catch (e: any) {
        console.warn('[LiveIntelligence] Google CSE failed:', e.message);
      }
    }

    // Provider 5: DuckDuckGo HTML Scrape (Free, no key needed - fallback)
    if (results.length === 0) {
      try {
        const ddgResults = await this.searchDuckDuckGo(query, { count: Math.min(count, 10) });
        results.push(...ddgResults);
        providerUsed = 'duckduckgo';
      } catch (e: any) {
        console.warn('[LiveIntelligence] DuckDuckGo failed:', e.message);
        error = 'All search providers failed';
      }
    }

    // Deduplicate by URL
    const seenUrls = new Set<string>();
    const uniqueResults = results.filter(r => {
      if (seenUrls.has(r.url)) return false;
      seenUrls.add(r.url);
      return true;
    }).slice(0, count);

    // Add credibility scoring
    const scoredResults = uniqueResults.map(r => ({
      ...r,
      credibilityScore: this.calculateCredibility(r)
    }));

    // Sort by credibility
    scoredResults.sort((a, b) => (b.credibilityScore || 0) - (a.credibilityScore || 0));

    const response: SearchResponse = {
      success: scoredResults.length > 0,
      query,
      results: scoredResults,
      totalResults: scoredResults.length,
      searchTimeMs: Date.now() - startTime,
      error
    };

    // Cache successful results
    if (response.success) {
      this.cache.set(cacheKey, { data: response, expires: Date.now() + this.CACHE_TTL });
    }

    console.log(`[LiveIntelligence] Search "${query}" → ${scoredResults.length} results via ${providerUsed} (${response.searchTimeMs}ms)`);
    return response;
  }

  // ──────────────────────────────────────────────────────────────
  // PROVIDER IMPLEMENTATIONS
  // ──────────────────────────────────────────────────────────────
  private async searchBrave(query: string, options: { freshness: string; count: number; region: string }): Promise<SearchResult[]> {
    const freshnessMap: Record<string, string> = { day: 'pd', week: 'pw', month: 'pm', year: 'py' };
    const url = 'https://api.search.brave.com/res/v1/web/search';

    const response = await axios.get(url, {
      headers: { 'Accept': 'application/json', 'X-Subscription-Token': this.braveApiKey! },
      params: {
        q: query,
        count: options.count,
        freshness: freshnessMap[options.freshness] || 'pm',
        country: options.region.toUpperCase(),
        search_lang: 'en',
        safesearch: 'moderate'
      },
      timeout: 8000
    });

    return (response.data.web?.results || []).map((r: any) => ({
      title: r.title,
      url: r.url,
      snippet: r.description || r.snippet || '',
      source: 'brave',
      publishedAt: r.age ? new Date(Date.now() - this.parseAge(r.age)).toISOString() : undefined
    }));
  }

  private async searchBing(query: string, options: { freshness: string; count: number; region: string }): Promise<SearchResult[]> {
    const url = 'https://api.bing.microsoft.com/v7.0/search';
    const freshnessMap: Record<string, string> = { day: 'Day', week: 'Week', month: 'Month', year: 'Year' };

    const response = await axios.get(url, {
      headers: { 'Ocp-Apim-Subscription-Key': this.bingApiKey! },
      params: {
        q: query,
        count: options.count,
        freshness: freshnessMap[options.freshness] || 'Month',
        mkt: options.region === 'in' ? 'en-IN' : 'en-US',
        safeSearch: 'Moderate',
        responseFilter: 'Webpages,News'
      },
      timeout: 8000
    });

    const results: SearchResult[] = [];

    // Web results
    for (const r of response.data.webPages?.value || []) {
      results.push({
        title: r.name,
        url: r.url,
        snippet: r.snippet,
        source: 'bing',
        publishedAt: r.dateLastCrawled
      });
    }

    // News results if available
    for (const r of response.data.news?.value || []) {
      results.push({
        title: r.name,
        url: r.url,
        snippet: r.description,
        source: 'bing-news',
        publishedAt: r.datePublished
      });
    }

    return results;
  }

  private async searchSerpAPI(query: string, options: { freshness: string; count: number; region: string }): Promise<SearchResult[]> {
    const url = 'https://serpapi.com/search';
    const tbsMap: Record<string, string> = { day: 'qdr:d', week: 'qdr:w', month: 'qdr:m', year: 'qdr:y' };

    const response = await axios.get(url, {
      params: {
        q: query,
        api_key: this.serpApiKey!,
        engine: 'google',
        num: options.count,
        gl: options.region,
        hl: 'en',
        tbs: tbsMap[options.freshness] || 'qdr:m',
        safe: 'active'
      },
      timeout: 10000
    });

    return (response.data.organic_results || []).map((r: any) => ({
      title: r.title,
      url: r.link,
      snippet: r.snippet || '',
      source: 'serpapi',
      publishedAt: r.date
    }));
  }

  private async searchGoogleCSE(query: string, options: { count: number }): Promise<SearchResult[]> {
    const url = 'https://www.googleapis.com/customsearch/v1';

    const response = await axios.get(url, {
      params: {
        key: this.googleCseKey!,
        cx: this.googleCseId!,
        q: query,
        num: Math.min(options.count, 10),
        safe: 'active'
      },
      timeout: 8000
    });

    return (response.data.items || []).map((r: any) => ({
      title: r.title,
      url: r.link,
      snippet: r.snippet || '',
      source: 'google-cse'
    }));
  }

  private async searchDuckDuckGo(query: string, options: { count: number }): Promise<SearchResult[]> {
    const url = 'https://html.duckduckgo.com/html/';

    const response = await axios.post(url, new URLSearchParams({ q: query }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    const cheerio = (await import('cheerio')).default;
    const $ = cheerio.load(response.data);
    const results: SearchResult[] = [];

    $('.result__snippet').each((i, el) => {
      if (i >= options.count) return false;
      const $el = $(el);
      const $link = $el.prev('.result__url').find('a').first();
      const $title = $el.prev('.result__title').find('a').first();

      results.push({
        title: $title.text().trim(),
        url: $link.attr('href') || $title.attr('href') || '',
        snippet: $el.text().trim(),
        source: 'duckduckgo'
      });
    });

    return results;
  }

  // ──────────────────────────────────────────────────────────────
  // HELPER METHODS
  // ──────────────────────────────────────────────────────────────
  private parseAge(ageStr: string): number {
    // Parse "2 hours ago", "3 days ago", etc.
    const match = ageStr.match(/(\d+)\s*(second|minute|hour|day|week|month|year)s?\s*ago/i);
    if (!match) return 0;
    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    const multipliers: Record<string, number> = {
      second: 1000, minute: 60000, hour: 3600000,
      day: 86400000, week: 604800000, month: 2592000000, year: 31536000000
    };
    return value * (multipliers[unit] || 0);
  }

  private calculateCredibility(result: SearchResult): number {
    let score = 50; // Base score

    const url = result.url.toLowerCase();
    const title = result.title.toLowerCase();
    const snippet = result.snippet.toLowerCase();

    // High credibility domains
    const highCredDomains = [
      'gov.in', 'nic.in', 'gov.uk', 'gov.au', 'gov.ca', '.edu', '.ac.in',
      'wikipedia.org', 'britannica.com', 'reuters.com', 'apnews.com', 'bbc.com',
      'nytimes.com', 'wsj.com', 'ft.com', 'economist.com', 'nature.com',
      'science.org', 'ieee.org', 'acm.org', 'arxiv.org', 'pubmed.ncbi.nlm.nih.gov',
      'who.int', 'un.org', 'worldbank.org', 'imf.org', 'oecd.org',
      'rbi.org.in', 'sebi.gov.in', 'nseindia.com', 'bseindia.com',
      'pib.gov.in', 'mea.gov.in', 'lawmin.nic.in', 'legislative.gov.in'
    ];

    for (const domain of highCredDomains) {
      if (url.includes(domain)) { score += 30; break; }
    }

    // Medium credibility
    const medCredDomains = [
      'medium.com', 'github.com', 'stackoverflow.com', 'geeksforgeeks.org',
      'w3schools.com', 'mdn.io', 'developer.mozilla.org', 'khanacademy.org',
      'coursera.org', 'edx.org', 'mit.edu', 'stanford.edu', 'iit.edu.in',
      'ncert.nic.in', 'cbse.gov.in', 'cbseacademic.nic.in'
    ];

    for (const domain of medCredDomains) {
      if (url.includes(domain)) { score += 15; break; }
    }

    // Penalize low quality
    const lowQuality = ['pinterest', 'quora.com', 'yahoo.com/answers', 'answers.com', 'buzzfeed'];
    for (const domain of lowQuality) {
      if (url.includes(domain)) { score -= 20; break; }
    }

    // Recency bonus
    if (result.publishedAt) {
      const daysOld = (Date.now() - new Date(result.publishedAt).getTime()) / 86400000;
      if (daysOld <= 1) score += 10;
      else if (daysOld <= 7) score += 5;
      else if (daysOld <= 30) score += 2;
    }

    // Snippet quality
    if (snippet.length > 100) score += 5;
    if (snippet.length > 200) score += 5;

    return Math.max(0, Math.min(100, score));
  }

  // ──────────────────────────────────────────────────────────────
  // FACT CHECKING
  // ──────────────────────────────────────────────────────────────
  async factCheck(claim: string): Promise<LiveFactCheck> {
    // Search for evidence
    const searchResults = await this.searchWeb(`fact check "${claim}"`, {
      sources: ['news', 'web'],
      count: 10,
      freshness: 'month'
    });

    // Use AI to analyze results (will be called from AI service)
    const evidence = searchResults.results.slice(0, 5);

    return {
      claim,
      verified: evidence.length > 0,
      confidence: evidence.length > 0 ? 70 : 0,
      sources: evidence,
      explanation: evidence.length > 0
        ? `Found ${evidence.length} sources. Top source credibility: ${evidence[0]?.credibilityScore || 0}%`
        : 'No reliable sources found for verification'
    };
  }

  // ──────────────────────────────────────────────────────────────
  // LIVE DATA FEEDS
  // ──────────────────────────────────────────────────────────────
  async getLiveFeed(type: 'stock' | 'news' | 'weather' | 'govt' | 'academic', params: any = {}): Promise<LiveDataFeed> {
    const cacheKey = `feed:${type}:${JSON.stringify(params)}`;
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expires > Date.now()) return cached.data;

    let data: any;
    let source = '';

    switch (type) {
      case 'stock':
        data = await this.fetchStockData(params.symbol || 'RELIANCE.NS');
        source = 'NSE/Yahoo Finance';
        break;
      case 'news':
        data = await this.fetchLatestNews(params.category || 'business', params.region || 'in', params.count || 10);
        source = 'NewsAPI/Bing News';
        break;
      case 'weather':
        data = await this.fetchWeather(params.city || 'Mumbai', params.country || 'IN');
        source = 'OpenWeatherMap';
        break;
      case 'govt':
        data = await this.fetchGovtData(params.portal || 'pib', params.query);
        source = 'Government Portals';
        break;
      case 'academic':
        data = await this.fetchAcademicData(params.query, params.field);
        source = 'PubMed/arXiv/Crossref';
        break;
    }

    const feed: LiveDataFeed = {
      type,
      data,
      timestamp: new Date().toISOString(),
      source
    };

    this.cache.set(cacheKey, { data: feed, expires: Date.now() + 60000 }); // 1 min cache for live feeds
    return feed;
  }

  private async fetchStockData(symbol: string): Promise<any> {
    try {
      // Try Yahoo Finance (unofficial)
      const response = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 5000
      });
      const chart = response.data.chart?.result?.[0];
      if (chart) {
        const meta = chart.meta;
        return {
          symbol: meta.symbol,
          name: meta.longName || meta.shortName,
          price: meta.regularMarketPrice,
          change: meta.regularMarketPrice - meta.previousClose,
          changePercent: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100,
          currency: meta.currency,
          marketState: meta.marketState,
          timestamp: new Date(meta.regularMarketTime * 1000).toISOString()
        };
      }
    } catch (e) {
      console.warn('[LiveIntelligence] Stock fetch failed:', e);
    }
    return { error: 'Stock data unavailable', symbol };
  }

  private async fetchLatestNews(category: string, region: string, count: number): Promise<any[]> {
    try {
      // Use Bing News search
      if (this.bingApiKey) {
        const response = await axios.get('https://api.bing.microsoft.com/v7.0/news/search', {
          headers: { 'Ocp-Apim-Subscription-Key': this.bingApiKey },
          params: { q: category, count, mkt: region === 'in' ? 'en-IN' : 'en-US', freshness: 'Day' },
          timeout: 5000
        });
        return (response.data.value || []).map((n: any) => ({
          title: n.name,
          url: n.url,
          description: n.description,
          provider: n.provider?.[0]?.name,
          publishedAt: n.datePublished,
          image: n.image?.thumbnail?.contentUrl
        }));
      }
    } catch (e) {
      console.warn('[LiveIntelligence] News fetch failed:', e);
    }
    return [];
  }

  private async fetchWeather(city: string, country: string): Promise<any> {
    // Would need OpenWeatherMap API key
    return { city, country, note: 'Weather API key required' };
  }

  private async fetchGovtData(portal: string, query?: string): Promise<any> {
    const portals: Record<string, string> = {
      pib: 'https://pib.gov.in',
      mea: 'https://mea.gov.in',
      rbi: 'https://rbi.org.in',
      sebi: 'https://sebi.gov.in',
      parliament: 'https://loksabha.nic.in'
    };
    return { portal, baseUrl: portals[portal] || portals.pib, query, note: 'Scraping needed' };
  }

  private async fetchAcademicData(query: string, field?: string): Promise<any> {
    try {
      // Crossref API for papers
      const response = await axios.get('https://api.crossref.org/works', {
        params: { query, rows: 5, sort: 'relevance' },
        timeout: 8000
      });
      return (response.data.message?.items || []).map((item: any) => ({
        title: item.title?.[0],
        authors: item.author?.map((a: any) => `${a.given} ${a.family}`).join(', '),
        journal: item['container-title']?.[0],
        year: item.published?.['date-parts']?.[0]?.[0],
        doi: item.DOI,
        url: `https://doi.org/${item.DOI}`,
        citations: item['is-referenced-by-count'] || 0
      }));
    } catch (e) {
      console.warn('[LiveIntelligence] Academic fetch failed:', e);
    }
    return [];
  }

  // ──────────────────────────────────────────────────────────────
  // BATCH OPERATIONS FOR AI CONTEXT INJECTION
  // ──────────────────────────────────────────────────────────────
  async buildContextInjection(userQuery: string, options: {
    includeNews?: boolean;
    includeStocks?: boolean;
    includeAcademic?: boolean;
    includeGovt?: boolean;
    symbols?: string[];
  } = {}): Promise<string> {
    const sections: string[] = [];
    const { includeNews = true, includeStocks = false, includeAcademic = false, includeGovt = false, symbols = [] } = options;

    // 1. Web Search for query
    const searchResults = await this.searchWeb(userQuery, { count: 8, freshness: 'week' });
    if (searchResults.success && searchResults.results.length > 0) {
      sections.push(`
═══════════════════════════════════════════════════════════════
🌐 LIVE WEB INTELLIGENCE — "${userQuery}"
═══════════════════════════════════════════════════════════════
${searchResults.results.map((r, i) =>
  `${i+1}. **${r.title}** (Credibility: ${r.credibilityScore}%)
   Source: ${r.source} | ${r.url}
   ${r.snippet.substring(0, 300)}
   ${r.publishedAt ? `Published: ${new Date(r.publishedAt).toLocaleDateString()}` : ''}`
).join('\n\n')}
      `.trim());
    }

    // 2. Live News if requested
    if (includeNews) {
      const news = await this.getLiveFeed('news', { category: 'business', count: 5 });
      if (news.data.length > 0) {
        sections.push(`
═══════════════════════════════════════════════════════════════
📰 LIVE BUSINESS NEWS (Last 24h)
═══════════════════════════════════════════════════════════════
${news.data.map((n: any, i: number) =>
  `${i+1}. **${n.title}**
   ${n.provider} | ${new Date(n.publishedAt).toLocaleString()}
   ${n.description?.substring(0, 200) || ''}
   ${n.url}`
).join('\n\n')}
        `.trim());
      }
    }

    // 3. Stock data if requested
    if (includeStocks && symbols.length > 0) {
      const stockData = await Promise.all(symbols.map(s => this.getLiveFeed('stock', { symbol: s })));
      const validStocks = stockData.filter(s => s.data.price).map(s => s.data);
      if (validStocks.length > 0) {
        sections.push(`
═══════════════════════════════════════════════════════════════
📈 LIVE MARKET DATA
═══════════════════════════════════════════════════════════════
${validStocks.map(s =>
  `**${s.name} (${s.symbol})**: ₹${s.price.toLocaleString()} (${s.change >= 0 ? '+' : ''}${s.change.toFixed(2)} | ${s.changePercent >= 0 ? '+' : ''}${s.changePercent.toFixed(2)}%) | ${s.marketState}`
).join('\n')}
        `.trim());
      }
    }

    // 4. Academic papers if requested
    if (includeAcademic) {
      const academic = await this.getLiveFeed('academic', { query: userQuery, field: options.symbols?.[0] });
      if (academic.data.length > 0) {
        sections.push(`
═══════════════════════════════════════════════════════════════
📚 RECENT ACADEMIC RESEARCH
═══════════════════════════════════════════════════════════════
${academic.data.map((p: any, i: number) =>
  `${i+1}. **${p.title}** (${p.year})
   Authors: ${p.authors} | ${p.journal} | Citations: ${p.citations}
   DOI: ${p.doi} | ${p.url}`
).join('\n\n')}
        `.trim());
      }
    }

    return sections.length > 0 ? sections.join('\n\n\n') : '';
  }

  // ──────────────────────────────────────────────────────────────
  // CLEANUP
  // ──────────────────────────────────────────────────────────────
  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats(): { size: number; keys: string[] } {
    return { size: this.cache.size, keys: Array.from(this.cache.keys()) };
  }
}

// Singleton instance
export const liveIntelligenceService = new LiveIntelligenceService();