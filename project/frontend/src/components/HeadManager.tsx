
import React, { useEffect } from 'react';
import { useSystemSettings } from '../hooks/useSystemSettings';

const HeadManager: React.FC = () => {
    // 🧠 Dynamic Analytics & Tag Manager Injection
    const { value: analyticsId } = useSystemSettings('GOOGLE_ANALYTICS_ID');
    const { value: gtmId } = useSystemSettings('GOOGLE_TAG_MANAGER_ID');

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
    }, [analyticsId, gtmId]);

    return null; // Logic Component only
};

export default HeadManager;
