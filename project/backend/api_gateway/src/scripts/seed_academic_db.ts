import mongoose from 'mongoose';
import dotenv from 'dotenv';
import EducationDomain from '../modules/collage_project/education_domain.model';
import fs from 'fs';
import path from 'path';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://doadmin:q37r1940I8SgA5P2@db-mongodb-blr1-83863-1279099c.mongo.ondigitalocean.com/future_builder_db?authSource=admin&replicaSet=db-mongodb-blr1-83863&tls=true";

const seedAcademicData = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ MongoDB Connected for Seeding');

        // Clear existing domains to avoid duplication
        await EducationDomain.deleteMany({});
        console.log('🗑️  Cleared existing Education Domains');

        const jsonPath = path.join(__dirname, '../data/india_degree_mapping.json');
        const rawData = fs.readFileSync(jsonPath, 'utf-8');
        const degrees = JSON.parse(rawData);

        const domainMap = new Map();

        // Transform flat degree list into EducationDomain hierarchy
        degrees.forEach((deg: any) => {
            const domainName = deg.domain_primary;
            const specialization = deg.domain_secondary;

            if (!domainMap.has(domainName)) {
                domainMap.set(domainName, {
                    name: domainName,
                    description: "Academic Discipline",
                    degrees: {
                        UG: [],
                        PG: [],
                        Diploma: [],
                        Doctoral: [],
                        Vocational: []
                    },
                    projectTypes: new Set(),
                    suggestedTechStack: {
                        primary: "Core Fundamentals",
                        secondary: "Research Methodology",
                        tertiary: "Analysis tools"
                    },
                    regulator: deg.regulator // Map regulator
                });
            }

            const domain = domainMap.get(domainName);
            const degreeName = deg.degree_short;

            if (deg.level === 'UG') domain.degrees.UG.push(degreeName);
            else if (deg.level === 'PG') domain.degrees.PG.push(degreeName);
            else if (deg.level === 'PhD') domain.degrees.Doctoral.push(degreeName);

            // Add specialization as a project type hint
            domain.projectTypes.add(specialization);
            domain.projectTypes.add(deg.degree_full);

            // Heuristic for tech stack
            if (domainName.includes('Engineering') || domainName.includes('Technology')) {
                domain.suggestedTechStack = { primary: "Full-Stack (MERN)", secondary: "Python/AI", tertiary: "Cloud/DevOps" };
            } else if (domainName.includes('Medical')) {
                domain.suggestedTechStack = { primary: "Clinical Data", secondary: "Diagnosis Log", tertiary: "Patient History" };
            } else if (domainName.includes('Management') || domainName.includes('Commerce')) {
                domain.suggestedTechStack = { primary: "Financial Models", secondary: "Market Research", tertiary: "Business Strategy" };
            }
        });

        const domainsToInsert = Array.from(domainMap.values()).map(d => ({
            ...d,
            projectTypes: Array.from(d.projectTypes) // Convert Set to Array
        }));

        await EducationDomain.insertMany(domainsToInsert);
        console.log(`✅ Seeded ${domainsToInsert.length} MASTER Academic Domains successfully!`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding Failed:', error);
        process.exit(1);
    }
};

seedAcademicData();
