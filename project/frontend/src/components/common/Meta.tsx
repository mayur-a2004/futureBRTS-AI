
import React from 'react';
import { Helmet } from 'react-helmet-async';

interface MetaProps {
    title?: string;
    description?: string;
    keywords?: string;
    ogImage?: string;
    ogUrl?: string;
}

const Meta: React.FC<MetaProps> = ({
    title = "Future BRTS | The Ultimate Career Architect",
    description = "Transform your human intent into technical roadmaps with the world's most advanced neural career engine.",
    keywords = "career, roadmap, ai, learning, builder, tech, developer, strategic planning",
    ogImage = "https://futurebrts.com/og-image.jpg",
    ogUrl = "https://futurebrts.com"
}) => {
    return (
        <Helmet>
            <title>{title}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={ogUrl} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={ogImage} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={ogUrl} />
            <meta property="twitter:title" content={title} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:image" content={ogImage} />
        </Helmet>
    );
};

export default Meta;
