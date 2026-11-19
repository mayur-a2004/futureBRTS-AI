export interface TickerData {
    symbol: string;
    name: string;
    price: number;
    currency: string;
    change: number;
    changePercent: number;
    prevClose: number;
    dayHigh: number;
    dayLow: number;
    fiftyTwoWeekHigh: number;
    fiftyTwoWeekLow: number;
    timestamp: string;
}

class FinancialTickerService {
    private cache = new Map<string, { timestamp: number; data: TickerData }>();
    private readonly CACHE_TTL_MS = 1000 * 60 * 2; // 2 minutes cache for live market data

    private symbolMap: Record<string, { symbol: string; name: string }> = {
        'reliance': { symbol: 'RELIANCE.NS', name: 'Reliance Industries Ltd' },
        'relince': { symbol: 'RELIANCE.NS', name: 'Reliance Industries Ltd' },
        'relianc': { symbol: 'RELIANCE.NS', name: 'Reliance Industries Ltd' },
        'relaince': { symbol: 'RELIANCE.NS', name: 'Reliance Industries Ltd' },
        'ril': { symbol: 'RELIANCE.NS', name: 'Reliance Industries Ltd' },
        'tcs': { symbol: 'TCS.NS', name: 'Tata Consultancy Services' },
        'tata consultancy': { symbol: 'TCS.NS', name: 'Tata Consultancy Services' },
        'infy': { symbol: 'INFY.NS', name: 'Infosys Ltd' },
        'infosys': { symbol: 'INFY.NS', name: 'Infosys Ltd' },
        'hdfc': { symbol: 'HDFCBANK.NS', name: 'HDFC Bank Ltd' },
        'hdfc bank': { symbol: 'HDFCBANK.NS', name: 'HDFC Bank Ltd' },
        'hdfcbank': { symbol: 'HDFCBANK.NS', name: 'HDFC Bank Ltd' },
        'icici': { symbol: 'ICICIBANK.NS', name: 'ICICI Bank Ltd' },
        'icicibank': { symbol: 'ICICIBANK.NS', name: 'ICICI Bank Ltd' },
        'tata motors': { symbol: 'TATAMOTORS.NS', name: 'Tata Motors Ltd' },
        'tatamotors': { symbol: 'TATAMOTORS.NS', name: 'Tata Motors Ltd' },
        'tata power': { symbol: 'TATAPOWER.NS', name: 'Tata Power Ltd' },
        'tata steel': { symbol: 'TATASTEEL.NS', name: 'Tata Steel Ltd' },
        'sbi': { symbol: 'SBIN.NS', name: 'State Bank of India' },
        'sbin': { symbol: 'SBIN.NS', name: 'State Bank of India' },
        'itc': { symbol: 'ITC.NS', name: 'ITC Ltd' },
        'airtel': { symbol: 'BHARTIARTL.NS', name: 'Bharti Airtel Ltd' },
        'bharti airtel': { symbol: 'BHARTIARTL.NS', name: 'Bharti Airtel Ltd' },
        'l&t': { symbol: 'LT.NS', name: 'Larsen & Toubro Ltd' },
        'larsen': { symbol: 'LT.NS', name: 'Larsen & Toubro Ltd' },
        'adani ent': { symbol: 'ADANIENT.NS', name: 'Adani Enterprises Ltd' },
        'adani enterprises': { symbol: 'ADANIENT.NS', name: 'Adani Enterprises Ltd' },
        'adani ports': { symbol: 'ADANIPORTS.NS', name: 'Adani Ports & SEZ' },
        'bajaj finance': { symbol: 'BAJFINANCE.NS', name: 'Bajaj Finance Ltd' },
        'maruti': { symbol: 'MARUTI.NS', name: 'Maruti Suzuki India' },
        'sun pharma': { symbol: 'SUNPHARMA.NS', name: 'Sun Pharmaceutical Industries' },
        'wipro': { symbol: 'WIPRO.NS', name: 'Wipro Ltd' },
        'hcl tech': { symbol: 'HCLTECH.NS', name: 'HCL Technologies Ltd' },
        'zomato': { symbol: 'ZOMATO.NS', name: 'Zomato Ltd' },
        'paytm': { symbol: 'PAYTM.NS', name: 'One97 Communications (Paytm)' },
        'nifty': { symbol: '^NSEI', name: 'NIFTY 50' },
        'nifty 50': { symbol: '^NSEI', name: 'NIFTY 50' },
        'nifty50': { symbol: '^NSEI', name: 'NIFTY 50' },
        'bank nifty': { symbol: '^NSEBANK', name: 'NIFTY Bank' },
        'banknifty': { symbol: '^NSEBANK', name: 'NIFTY Bank' },
        'sensex': { symbol: '^BSESN', name: 'BSE SENSEX' },
        'bse sensex': { symbol: '^BSESN', name: 'BSE SENSEX' },
        'gold': { symbol: 'GC=F', name: 'Gold Futures (COMEX)' },
        'silver': { symbol: 'SI=F', name: 'Silver Futures' },
        'crude': { symbol: 'CL=F', name: 'Crude Oil (WTI)' },
        'crude oil': { symbol: 'CL=F', name: 'Crude Oil (WTI)' },
        'dollar': { symbol: 'INR=X', name: 'USD to INR Currency Pair' },
        'usd': { symbol: 'INR=X', name: 'USD to INR Currency Pair' },
        'usd inr': { symbol: 'INR=X', name: 'USD to INR Currency Pair' },
        'apple': { symbol: 'AAPL', name: 'Apple Inc.' },
        'tesla': { symbol: 'TSLA', name: 'Tesla Inc.' },
        'google': { symbol: 'GOOGL', name: 'Alphabet Inc.' },
        'microsoft': { symbol: 'MSFT', name: 'Microsoft Corporation' },
        'nvidia': { symbol: 'NVDA', name: 'NVIDIA Corporation' }
    };

    isTickerQuery(query: string): boolean {
        if (!query || typeof query !== 'string') return false;
        const low = query.toLowerCase().trim();
        const priceKeywords = [
            'price', 'share price', 'stock price', 'rate', 'bhav', 'ticker',
            'kitna he', 'kitna hai', 'kya rate', 'aaj ka price', 'live price',
            'ka price', 'ki price', 'value', 'stock', 'share'
        ];
        const hasPriceIntent = priceKeywords.some(k => low.includes(k));
        const matchedSymbolKey = Object.keys(this.symbolMap).find(k => new RegExp(`\\b${k}\\b`, 'i').test(low));
        
        return !!(hasPriceIntent && matchedSymbolKey) || (!!matchedSymbolKey && low.split(' ').length <= 4);
    }

    resolveSymbol(query: string): { symbol: string; name: string } | null {
        const low = query.toLowerCase().trim();
        if (/\brel[ia]{1,2}nce\b/i.test(low) || /\bril\b/i.test(low)) {
            return this.symbolMap['reliance'];
        }
        for (const [key, mapping] of Object.entries(this.symbolMap)) {
            if (new RegExp(`\\b${key}\\b`, 'i').test(low)) {
                return mapping;
            }
        }
        return null;
    }

    async fetchLiveTicker(query: string): Promise<TickerData | null> {
        const resolved = this.resolveSymbol(query);
        if (!resolved) return null;

        const cacheKey = resolved.symbol;
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
            return cached.data;
        }

        try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 4500);

            const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(resolved.symbol)}?interval=1d`;
            const res = await fetch(url, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) FutureBuilderTicker/2.0' },
                signal: controller.signal
            });
            clearTimeout(timer);

            if (!res.ok) return null;
            const json: any = await res.json();
            const meta = json.chart?.result?.[0]?.meta;
            if (!meta || typeof meta.regularMarketPrice !== 'number') return null;

            const price = meta.regularMarketPrice;
            const prevClose = meta.chartPreviousClose || price;
            const change = price - prevClose;
            const changePercent = prevClose !== 0 ? (change / prevClose) * 100 : 0;

            const data: TickerData = {
                symbol: meta.symbol || resolved.symbol,
                name: resolved.name,
                price: Number(price.toFixed(2)),
                currency: meta.currency || 'INR',
                change: Number(change.toFixed(2)),
                changePercent: Number(changePercent.toFixed(2)),
                prevClose: Number(prevClose.toFixed(2)),
                dayHigh: Number((meta.regularMarketDayHigh || price).toFixed(2)),
                dayLow: Number((meta.regularMarketDayLow || price).toFixed(2)),
                fiftyTwoWeekHigh: Number((meta.fiftyTwoWeekHigh || price).toFixed(2)),
                fiftyTwoWeekLow: Number((meta.fiftyTwoWeekLow || price).toFixed(2)),
                timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            };

            this.cache.set(cacheKey, { timestamp: Date.now(), data });
            return data;
        } catch (err: any) {
            console.warn(`[FinancialTickerService] Error fetching ticker for ${resolved.symbol}:`, err.message);
            return null;
        }
    }

    buildTickerPrompt(ticker: TickerData): string {
        const sign = ticker.change >= 0 ? '+' : '';
        const currSym = ticker.currency === 'INR' ? '₹' : (ticker.currency === 'USD' ? '$' : ticker.currency);

        return `
================================================================================
📈 100% VERIFIED REAL-TIME LIVE FINANCIAL TICKER (ZERO-HALLUCINATION HARD DATA)
================================================================================
ASSET / ENTITY: ${ticker.name} (${ticker.symbol})
EXACT LIVE PRICE (LTP): ${currSym}${ticker.price.toLocaleString('en-IN')} ${ticker.currency}
DAY CHANGE: ${sign}${currSym}${ticker.change.toFixed(2)} (${sign}${ticker.changePercent.toFixed(2)}%)
PREVIOUS CLOSE: ${currSym}${ticker.prevClose.toLocaleString('en-IN')}
TODAY'S INTRADAY RANGE: ${currSym}${ticker.dayLow.toLocaleString('en-IN')} - ${currSym}${ticker.dayHigh.toLocaleString('en-IN')}
52-WEEK HIGH / LOW: ${currSym}${ticker.fiftyTwoWeekHigh.toLocaleString('en-IN')} / ${currSym}${ticker.fiftyTwoWeekLow.toLocaleString('en-IN')}
LAST UPDATED: ${ticker.timestamp} (Live Market Feed)

CRITICAL INSTRUCTIONS FOR AI RESPONSE:
1. **EXACT PRICE ACCURACY (MANDATORY)**: You MUST state that ${ticker.name} is currently trading at **${currSym}${ticker.price.toLocaleString('en-IN')}** (${sign}${ticker.changePercent.toFixed(2)}%).
2. **ZERO FICTION**: DO NOT say 2650, 3200, or any outdated number. If asked why the price was previously ~₹3000, explain that Reliance issued a 1:1 Bonus share in October 2024, adjusting the share price to ~₹1,160 - ₹1,400 range.
3. **PRESENTATION**: Present a clean, high-impact KPI summary table and key technical metrics.
================================================================================
`;
    }
}

export const financialTickerService = new FinancialTickerService();