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
        // Update Title
        document.title = title;

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
    }, [title, description, keywords, ogTitle, ogDescription, ogImage, twitterCard, canonicalUrl, structuredData]);

    return null;
}
