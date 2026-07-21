import { useEffect } from 'react';

interface SEOProps {
    title: string;
    description: string;
    keywords?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    twitterCard?: string;
    canonicalUrl?: string;
    structuredData?: object;
}

export default function SEO({
    title,
    description,
    keywords,
    ogTitle,
    ogDescription,
    ogImage,
    twitterCard,
    canonicalUrl,
    structuredData
}: SEOProps) {
    useEffect(() => {
        // Update Meta Tags
        const updateMeta = (name: string, content: string, isProperty = false) => {
            let element = document.querySelector(`meta[${isProperty ? 'property' : 'name'}="${name}"]`);
            if (!element) {
                element = document.createElement('meta');
                element.setAttribute(isProperty ? 'property' : 'name', name);
                document.head.appendChild(element);
            }
            element.setAttribute('content', content);
        };

        // Update Title
        document.title = title;

        updateMeta('description', description);
        if (keywords) updateMeta('keywords', keywords);
        if (ogTitle) updateMeta('og:title', ogTitle, true);
        if (ogDescription) updateMeta('og:description', ogDescription, true);
        if (ogImage) updateMeta('og:image', ogImage, true);
        if (twitterCard) updateMeta('twitter:card', twitterCard);

        // Canonical Link
        if (canonicalUrl) {
            let link: HTMLLinkElement | null = document.querySelector('link[rel="canonical"]');
            if (!link) {
                link = document.createElement('link');
                link.setAttribute('rel', 'canonical');
                document.head.appendChild(link);
            }
            link.setAttribute('href', canonicalUrl);
        }

        // Structured Data
        if (structuredData) {
            let script = document.querySelector('script[type="application/ld+json"]');
            if (!script) {
                script = document.createElement('script');
                script.setAttribute('type', 'application/ld+json');
                document.head.appendChild(script);
            }
            script.textContent = JSON.stringify(structuredData);
        }

        // Fetch dynamic SEO configuration from backend config store
        const fetchDynamicSEO = async () => {
            try {
                const response = await fetch('/api/landing/config/SEO_PAGES_CONFIG');
                const data = await response.json();
                if (data.success && data.value) {
                    let pagesConfig = data.value;
                    if (typeof pagesConfig === 'string') {
                        pagesConfig = JSON.parse(pagesConfig);
                    }
                    const currentPath = window.location.pathname;
                    if (pagesConfig && pagesConfig[currentPath]) {
                        const custom = pagesConfig[currentPath];
                        if (custom.title) {
                            document.title = custom.title;
                            updateMeta('og:title', custom.title, true);
                            updateMeta('twitter:title', custom.title);
                        }
                        if (custom.description) {
                            updateMeta('description', custom.description);
                            updateMeta('og:description', custom.description, true);
                            updateMeta('twitter:description', custom.description);
                        }
                        if (custom.keywords) {
                            updateMeta('keywords', custom.keywords);
                        }
                        if (custom.ogImage) {
                            updateMeta('og:image', custom.ogImage, true);
                            updateMeta('twitter:image', custom.ogImage);
                        }
                    }
                }
            } catch (err) {
                // Fallback to static
            }
        };
        fetchDynamicSEO();
    }, [title, description, keywords, ogTitle, ogDescription, ogImage, twitterCard, canonicalUrl, structuredData]);

    return null;
}
