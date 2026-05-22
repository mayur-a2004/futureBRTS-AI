import mongoose from 'mongoose';
import dotenv from 'dotenv';
import EducationDomain from './education_domain.model';

dotenv.config();

const domains = [
    {
        name: "School Education (8th-12th)",
        description: "Foundational and advanced school subjects for 8th to 12th standards.",
        degrees: {
            UG: ["8th Standard", "9th Standard", "10th Standard (SSC)", "11th Standard (Science/Commerce/Arts)", "12th Standard (HSC)"],
            PG: [],
            Diploma: [],
            Doctoral: [],
            Vocational: ["Skill Hub", "Robotics Basics", "Vedic Maths"]
        },
        projectTypes: ["Science Fair Prototype", "Digital Poster", "Mini Discovery Paper", "Logic & Algorithm Puzzle", "Basic Animation", "History Case Study"],
        suggestedTechStack: {
            primary: "Fundamental Theory",
            secondary: "Logical Flow",
            tertiary: "Visual Presentation"
        }
    },
    {
        name: "Engineering & Technology",
        description: "Applied science and technology for software, hardware, electronics, mechanical, civil systems.",
        degrees: {
            UG: ["BTech Computer Science", "BE Computer Engineering", "BSc IT", "BCA", "BTech IT", "BTech AI & ML", "BTech Data Science"],
            PG: ["MTech CS", "ME Computer", "MCA", "MTech Data Science", "MTech Cyber Security"],
            Diploma: ["Polytechnic Diploma in CSE", "Diploma in IT", "Diploma in AI"],
            Doctoral: ["PhD in Engineering/Technology"],
            Vocational: []
        },
        projectTypes: ["Full-Stack App", "IoT Prototype", "AI System", "ML Model", "DSA Research", "BlockChain DApp", "Python Automation"],
        suggestedTechStack: {
            primary: "React + Tailwind",
            secondary: "Node.js / Python",
            tertiary: "MongoDB / PostgreSQL"
        }
    },
    {
        name: "Business, Finance & Entrepreneurship",
        description: "Professional business fields, freelance ventures, startups, and economic strategy.",
        degrees: {
            UG: ["BBA Entrepreneurship", "BMS", "BCom Finance"],
            PG: ["MBA", "PGDM Sales & Marketing", "MBA FinTech"],
            Diploma: ["Business Management Diploma", "Project Management Diploma"],
            Doctoral: ["PhD in Business Administration"],
            Vocational: ["Freelance Digital Services", "Startup Operations", "Social Media Agency"]
        },
        projectTypes: ["Startup Pitch Deck", "Business Strategy Blueprint", "Marketing Ecosystem", "Freelance Portfolio", "E-commerce Strategy", "Revenue Model Design"],
        suggestedTechStack: {
            primary: "Strategic Business Plan",
            secondary: "Revenue Model",
            tertiary: "Operations Blueprint"
        }
    },
    {
        name: "Data & Artificial Intelligence (Universal Skills)",
        description: "Core high-demand skills applicable across multiple domains.",
        degrees: {
            UG: ["BSc Data Science", "BSc Data Analytics", "BE Artificial Intelligence", "BCA Machine Learning"],
            PG: ["Advanced AI Research", "Master in Data Science", "Big Data Analytics"],
            Diploma: ["Post Graduate Diploma in ML/AI", "Certification in Python Programming"],
            Doctoral: ["PhD in Computational Intelligence"],
            Vocational: ["Data Processing", "AI Prompt Engineering"]
        },
        projectTypes: ["Predictive Analytics Model", "Neural Network Design", "Big Data Pipeline", "NLP System", "Computer Vision Project"],
        suggestedTechStack: {
            primary: "Python (NumPy/Pandas)",
            secondary: "Scikit-Learn / TensorFlow",
            tertiary: "Jupyter Notebooks"
        }
    },
    {
        name: "Commerce & Management",
        description: "General commerce, accounting, and management studies.",
        degrees: {
            UG: ["BCom Accounting", "BBA", "BMS"],
            PG: ["MCom", "MBA", "PGDM"],
            Diploma: ["Accounting Diploma", "HR Diploma", "Marketing Diploma"],
            Doctoral: ["PhD in Commerce/Management"],
            Vocational: []
        },
        projectTypes: ["Market Research Report", "Financial modeling", "Case study Analysis", "Consumer Behavior Study"],
        suggestedTechStack: {
            primary: "Market Analysis",
            secondary: "Financial Projections",
            tertiary: "Case Study Database"
        }
    },
    {
        name: "Science",
        description: "Pure sciences involving research, experiments, analysis across physics, chemistry, biology, mathematics.",
        degrees: {
            UG: ["BSc Physics", "BSc Chemistry", "BSc Math", "BSc Biotech"],
            PG: ["MSc Physics", "MSc Chemistry", "MSc Math"],
            Diploma: ["Lab Technology Diploma", "Biotech Diploma"],
            Doctoral: ["PhD in Science"],
            Vocational: []
        },
        projectTypes: ["Lab Experiment Report", "Field Research study", "Scientific Data analysis", "Simulation modeling"],
        suggestedTechStack: {
            primary: "Empirical Research",
            secondary: "Statistical Analysis",
            tertiary: "Scientific Documentation"
        }
    },
    {
        name: "Medical & Health Sciences",
        description: "Clinical sciences, pharmaceutical sciences, therapeutic and diagnostic fields.",
        degrees: {
            UG: ["MBBS", "BDS", "BPT", "BSc Nursing", "BPharm"],
            PG: ["MD", "MS", "MDS", "MPharm", "MPT"],
            Diploma: ["GNM", "ANM", "Medical Lab Technician"],
            Doctoral: ["PhD Biomedical", "DM", "MCh"],
            Vocational: []
        },
        projectTypes: ["Clinical Case Analysis", "Lab Research Paper", "Drug Formulation Protocol", "Medical Thesis"],
        suggestedTechStack: {
            primary: "Medical Literature",
            secondary: "Clinical Methodology",
            tertiary: "Diagnostic Framework"
        }
    },
    {
        name: "Law & Legal Studies",
        description: "Legal studies including civil, criminal, corporate, and cyber law.",
        degrees: {
            UG: ["LLB (3 Year)", "Integrated BA LLB (5 Year)"],
            PG: ["LLM", "MBL"],
            Diploma: ["Diploma in Cyber Law", "Diploma in Corporate Law"],
            Doctoral: ["PhD in Law"],
            Vocational: []
        },
        projectTypes: ["Case analysis", "Legal research", "Moot court", "Legislation review"],
        suggestedTechStack: {
            primary: "Legal Precedents",
            secondary: "Statutory Research",
            tertiary: "Jurisprudence Analysis"
        }
    },
    {
        name: "Design & Creative Arts",
        description: "Product design, fashion, film, fine arts, animation, UI/UX.",
        degrees: {
            UG: ["BDes UI/UX", "BFA Fine Arts", "BDes Fashion Design"],
            PG: ["MDes", "MFA"],
            Diploma: ["Animation Diploma", "Fashion Diploma"],
            Doctoral: ["PhD in Design"],
            Vocational: []
        },
        projectTypes: ["UI/UX Prototype", "Visual Portfolio", "3D Product modeling", "Short Film Project", "Design research"],
        suggestedTechStack: {
            primary: "Figma / Adobe Creative Suite",
            secondary: "Visual Storyboarding",
            tertiary: "User Research / Prototyping"
        }
    }
];

async function seedDomains() {
    try {
        // IMPORTANT: Use the MONGO_URI from .env with the correct typo 'fueture_db' if that's what's there
        const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fueture_db';
        console.log(`Connecting to: ${mongoUri}`);
        await mongoose.connect(mongoUri);

        await EducationDomain.deleteMany({});
        await EducationDomain.insertMany(domains);

        console.log('Successfully seeded Indian Education Domains with strict categorization and suggested tech stacks!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding domains:', error);
        process.exit(1);
    }
}

seedDomains();
