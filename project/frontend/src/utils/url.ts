export const sanitizeExternalUrl = (url: string, fallbackName?: string): string => {
    if (!url || url.trim() === '') {
        return fallbackName ? `https://www.google.com/search?q=${encodeURIComponent(fallbackName)}` : 'https://www.google.com';
    }

    let target = url.trim();
    if (!/^https?:\/\//i.test(target)) {
        if (target.startsWith('/')) {
            target = window.location.origin + target;
        } else {
            target = 'https://' + target;
        }
    }

    try {
        if (target.includes('google.com/url?') || target.includes('/url?q=')) {
            const urlObj = new URL(target);
            const qParam = urlObj.searchParams.get('q');
            if (qParam && /^https?:\/\//i.test(qParam)) {
                return decodeURIComponent(qParam);
            }
        } else if (target.includes('google.com/search')) {
            const urlObj = new URL(target);
            const qParam = urlObj.searchParams.get('q');
            if (!qParam || qParam.trim() === '') {
                if (fallbackName) {
                    return `https://www.google.com/search?q=${encodeURIComponent(fallbackName)}`;
                }
            }
        }
    } catch (e) {
        const match = target.match(/[?&]q=([^&]+)/);
        if (match && match[1]) {
            try {
                const decoded = decodeURIComponent(match[1]);
                if (/^https?:\/\//i.test(decoded)) return decoded;
            } catch (_) {}
        }
    }

    return target;
};
