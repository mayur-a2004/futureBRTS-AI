import React from 'react';

interface ElementRendererProps {
    type: string;
    props?: any;
}

export const ElementRenderer: React.FC<ElementRendererProps> = ({ type, props }) => {
    switch (type) {
        case 'text':
            return <p {...props}>Text Element</p>;
        case 'button':
            return <button className="px-4 py-2 bg-blue-500 text-white rounded" {...props}>Button</button>;
        case 'image':
            return <div className="w-full h-32 bg-gray-200 flex items-center justify-center" {...props}>Image Placeholder</div>;
        default:
            return <div {...props}>Unknown Element</div>;
    }
};
