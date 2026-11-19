const axios = require('axios');

async function searchRealBusinesses(query) {
    try {
        console.log(`Searching real web for: "${query}"...`);
        // Using SearXNG / DuckDuckGo / Qwant or Wikipedia API or Google search
        const url = 'https://html.duckduckgo.com/html/?q=' + encodeURIComponent(query);
        const res = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            },
            timeout: 7000
        });

        const html = res.data;
        const results = [];
        const resultBlocks = html.split('<div class="result results_links');
        
        for (let i = 1; i < resultBlocks.length && results.length < 5; i++) {
            const block = resultBlocks[i];
            const titleMatch = block.match(/<a class="result__snippet[^>]*>([\s\S]*?)<\/a>/);
            const linkMatch = block.match(/<a class="result__url"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/);
            const headingMatch = block.match(/<a class="result__title"[^>]*>([\s\S]*?)<\/a>/) || block.match(/<h2[^>]*>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/);
            
            if (headingMatch && linkMatch) {
                const title = headingMatch[1].replace(/<[^>]+>/g, '').trim();
                const snippet = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : '';
                let rawUrl = linkMatch[1].trim();
                if (rawUrl.includes('uddg=')) {
                    const decoded = decodeURIComponent(rawUrl.split('uddg=')[1].split('&')[0]);
                    rawUrl = decoded;
                }
                results.push({ title, url: rawUrl, snippet });
            }
        }
        console.log('Real Web Search Results:', JSON.stringify(results, null, 2));
        return results;
    } catch (err) {
        console.error('Search failed:', err.message);
        return [];
    }
}

searchRealBusinesses('top saree manufacturers in Surat');
