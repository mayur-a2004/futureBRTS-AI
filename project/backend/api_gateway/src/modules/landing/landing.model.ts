// 👉 Ye landing page ka schema hai
// 👉 Isme page content aur SEO metadata store hota hai

import mongoose, { Schema, Document } from 'mongoose';

export interface ILandingPage extends Document {
    page: string;
    hero: {
        title: string;
        subtitle: string;
        placeholders: string[];
    };
    sections: any[];
    seo: {
        title: string;
        description: string;
        keywords: string[];
    };
}

const LandingPageSchema: Schema = new Schema({
    page: { type: String, required: true, unique: true },
    hero: {
        title: { type: String, required: true },
        subtitle: { type: String, required: true },
        placeholders: [{ type: String }]
    },
    sections: { type: Array, default: [] },
    seo: {
        title: { type: String, required: true },
        description: { type: String, required: true },
        keywords: [{ type: String }]
    }
});

export default mongoose.model<ILandingPage>('LandingPage', LandingPageSchema);
