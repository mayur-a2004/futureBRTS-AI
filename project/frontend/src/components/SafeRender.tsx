// 👉 SafeRender component ensures that we don't try to access undefined properties
// 👉 Ye API calls ke during stability maintain karta hai

import React from 'react';

interface SafeRenderProps {
    data: any;
    fallback?: React.ReactNode;
    children: (data: any) => React.ReactElement;
}

export const SafeRender: React.FC<SafeRenderProps> = ({ data, fallback, children }) => {
    if (!data) {
        return <>{fallback || null}</>;
    }

    try {
        return children(data);
    } catch (err) {
        console.error('SafeRender failed:', err);
        return <>{fallback || <div>Rendering failed</div>}</>;
    }
};
