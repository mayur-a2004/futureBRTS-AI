/**
 * Sanitizes external URLs by extracting the target URL from Google search redirection wraps
 * (e.g., https://www.google.com/url?q=https://example.com/&sa=U&ved=...)
 */
export const sanitizeExternalUrl = (url: string): string => {
    if (!url) return url;
    try {
        if (url.includes('google.com/url?') || url.includes('/url?q=')) {
            // Ensure we have a valid protocol for URL parser
            let parsingUrl = url;
            if (!/^https?:\/\//i.test(url)) {
                parsingUrl = 'https://' + url;
            }
            const urlObj = new URL(parsingUrl);
            const qParam = urlObj.searchParams.get('q');
            if (qParam) {
                return decodeURIComponent(qParam);
            }
        }
    } catch (e) {
        // Fallback to regex query parameter matching if URL parsing fails
        const match = url.match(/[?&]q=([^&]+)/);
        if (match && match[1]) {
            try {
                return decodeURIComponent(match[1]);
            } catch (_) {
                return match[1];
            }
        }
    }
    return url;
};
