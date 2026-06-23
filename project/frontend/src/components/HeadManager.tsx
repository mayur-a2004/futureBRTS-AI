
import React, { useEffect } from 'react';
import { useSystemSettings } from '../hooks/useSystemSettings';

const HeadManager: React.FC = () => {
    // 🧠 Dynamic Analytics, Tag Manager, Ads & AdSense Injection
    const { value: analyticsId } = useSystemSettings('GOOGLE_ANALYTICS_ID');
    const { value: gtmId } = useSystemSettings('GOOGLE_TAG_MANAGER_ID');
    const { value: adsenseClientId } = useSystemSettings('GOOGLE_ADSENSE_CLIENT_ID');
    const { value: pixelId } = useSystemSettings('FACEBOOK_PIXEL_ID');
    const { value: googleAdsId } = useSystemSettings('GOOGLE_ADS_ID');

    useEffect(() => {
        if (analyticsId) {
            // Google Analytics 4 (Measurement ID)
            const script = document.createElement('script');
            script.src = `https://www.googletagmanager.com/gtag/js?id=${analyticsId}`;
            script.async = true;
            document.head.appendChild(script);

            const inlineScript = document.createElement('script');
            inlineScript.innerHTML = `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${analyticsId}');
            `;
            document.head.appendChild(inlineScript);
        }

        if (gtmId) {
            // Google Tag Manager
            const script = document.createElement('script');
            script.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
             new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
             j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
             'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
             })(window,document,'script','dataLayer','${gtmId}');`;
            document.head.appendChild(script);
        }

        if (adsenseClientId) {
            // Google AdSense
            const script = document.createElement('script');
            script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`;
            script.async = true;
            script.crossOrigin = "anonymous";
            document.head.appendChild(script);
        }

        if (pixelId) {
            // Meta Pixel (Facebook Ads)
            const script = document.createElement('script');
            script.innerHTML = `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${pixelId}');
                fbq('track', 'PageView');
            `;
            document.head.appendChild(script);
        }

        if (googleAdsId) {
            // Google Ads Conversion Tag
            const script = document.createElement('script');
            script.src = `https://www.googletagmanager.com/gtag/js?id=${googleAdsId}`;
            script.async = true;
            document.head.appendChild(script);

            const inlineScript = document.createElement('script');
            inlineScript.innerHTML = `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${googleAdsId}');
            `;
            document.head.appendChild(inlineScript);
        }
    }, [analyticsId, gtmId, adsenseClientId, pixelId, googleAdsId]);

    return null; // Logic Component only
};

export default HeadManager;
