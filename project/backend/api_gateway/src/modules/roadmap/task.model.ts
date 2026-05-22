// import mongoose, { Schema, Document } from 'mongoose';

// export interface ITask extends Document {
//     userId: mongoose.Types.ObjectId;
//     roadmapId?: mongoose.Types.ObjectId; // Link to parent Roadmap
//     roadmapStepId?: string;
//     title: string;
//     description: string;
//     objective: string;
//     input: string;
//     output: string;
//     validationRule: string;
//     difficulty_level: 1 | 2 | 3 | 4 | 5;
//     unlock_condition?: string;
//     completion_condition?: string;
//     detailedGuidance?: string;
//     subTasks?: {
//         title: string;
//         description: string;
//         suggestion: string;
//         neuralInsight?: string;
//         skillGain?: string;
//         deepLearning?: string;
//         machineLearning?: string;
//         aiAlgorithm?: string;
//         microTasks: string[];
//         isCompleted: boolean;
//     }[];
//     verification?: {
//         required: boolean;
//         type: 'AUTO_CHECK_TEXT' | 'AUTO_CHECK_CODE' | 'CODE_REVIEW' | 'PROJECT_SUBMISSION' | 'QUIZ' | 'MANUAL' | 'VIVA_MCQ';
//         criteria: string;
//         correct_answer_data?: string;
//         pass_criteria?: string;
//         isVerified: boolean;
//         questions?: {
//             id: string;
//             question: string;
//             type: 'MCQ' | 'VIVA';
//             options?: string[]; // For MCQ
//             correctAnswer?: string;
//             globalTruth?: string; // Data from Scraper
//             hint?: string; // For Viva questions
//         }[];
//         results?: {
//             questionId: string;
//             userAnswer: string;
//             isCorrect: boolean;
//             suggestion?: string; // If false, provide true suggestion
//         }[];
//     };
//     dayNumber: number;
//     status: 'todo' | 'doing' | 'done';
//     isLocked: boolean;
//     dueDate?: Date;
//     createdAt: Date;
//     updatedAt: Date;
// }

// const TaskSchema: Schema = new Schema({
//     userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
//     roadmapId: { type: Schema.Types.ObjectId, ref: 'Roadmap' },
//     roadmapStepId: { type: String },
//     title: { type: String, required: true },
//     description: { type: String, required: true }, // Logic Enforcement: Description is Mandatory
//     objective: { type: String, required: true },
//     input: { type: String, required: true },
//     output: { type: String, required: true },
//     validationRule: { type: String, required: true },
//     detailedGuidance: { type: String },
//     difficulty_level: { type: Number, enum: [1, 2, 3, 4, 5], default: 1 },
//     unlock_condition: { type: String },
//     completion_condition: { type: String },

//     // Learning Resources (YouTube, etc.)
//     learningResources: [{
//         type: { type: String, enum: ['youtube', 'article', 'book'], default: 'youtube' },
//         title: String,
//         url: String
//     }],

//     status: { type: String, enum: ['locked', 'active', 'todo', 'doing', 'done', 'completed'], default: 'locked' }, // Updated status enum to match 'locked | active | completed' + legacy
//     isLocked: { type: Boolean, default: false },
//     subTasks: [{
//         title: String,
//         description: String,
//         suggestion: String,
//         neuralInsight: String,
//         skillGain: String,
//         deepLearning: String,
//         machineLearning: String,
//         aiAlgorithm: String,
//         microTasks: [String],
//         isCompleted: { type: Boolean, default: false }
//     }],
//     verification: {
//         required: { type: Boolean, default: false },
//         type: { type: String, enum: ['AUTO_CHECK_TEXT', 'AUTO_CHECK_CODE', 'CODE_REVIEW', 'PROJECT_SUBMISSION', 'QUIZ', 'MANUAL', 'VIVA_MCQ'], default: 'MANUAL' },
//         criteria: String,
//         correct_answer_data: String, // STORE THE TRUTH
//         pass_criteria: String,
//         isVerified: { type: Boolean, default: false },
//         questions: [{
//             id: String,
//             question: String,
//             type: { type: String, enum: ['MCQ', 'VIVA'] },
//             options: [String],
//             correctAnswer: String,
//             globalTruth: String,
//             hint: String
//         }],
//         results: [{
//             questionId: String,
//             userAnswer: String,
//             isCorrect: Boolean,
//             suggestion: String
//         }]
//     },
//     dayNumber: { type: Number, default: 1 }, // Day 1, Day 2...
//     dueDate: { type: Date },
//     createdAt: { type: Date, default: Date.now },
//     updatedAt: { type: Date, default: Date.now }
// });

// export default mongoose.model<ITask>('Task', TaskSchema);
import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
    userId: mongoose.Types.ObjectId;
    roadmapId?: mongoose.Types.ObjectId; // Link to parent Roadmap
    roadmapStepId?: string;
    title: string;
    description: string;
    what?: string;
    why?: string;
    how?: string;
    who?: string;
    objective?: string;
    conceptMap?: string[]; // 🔗 Atomic Detail (Main Task Level)
    siliconValleyWisdom?: string;
    viva?: {
        mcqs: {
            question: string;
            options: string[];
            correctAnswer: string;
        }[];
        shortQuestion: {
            question: string;
            correctAnswer: string;
            explanation: string;
        };
    };
    input?: string;
    output?: string;
    validationRule?: string;
    difficulty_level: 1 | 2 | 3 | 4 | 5;
    unlock_condition?: string;
    completion_condition?: string;
    detailedGuidance?: string;
    subTasks: {
        title: string;
        description: string;
        executionLabs: {
            title: string;
            description: string;
            siliconValleyWisdom?: string; // 200-300 word deep dive
            conceptMap?: string[]; // 🔗 Atomic Detail (User requested list)
            isCompleted: boolean;
            viva?: {
                mcqs: {
                    question: string;
                    options: string[];
                    correctAnswer: string;
                }[];
                shortQuestion: {
                    question: string;
                    correctAnswer: string;
                    explanation: string;
                };
            };
        }[];
        isCompleted: boolean;
    }[];
    learningResources?: {
        type: string;
        title: string;
        url: string;
    }[];
    verification: {
        isVerified: boolean;
        results: {
            questionId: string;
            userAnswer: string;
            isCorrect: boolean;
            suggestion?: string;
        }[];
    };
    level?: number;
    dayNumber: number;
    status: 'todo' | 'doing' | 'done' | 'locked' | 'active' | 'completed';
    isLocked: boolean;
    dueDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const TaskSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    roadmapId: { type: Schema.Types.ObjectId, ref: 'Roadmap' },
    roadmapStepId: { type: String },
    title: { type: String, required: true },
    description: { type: String, required: true }, // Logic Enforcement: Description is Mandatory
    what: { type: String },
    why: { type: String },
    how: { type: String },
    who: { type: String },
    objective: { type: String, required: false },
    conceptMap: [String],
    siliconValleyWisdom: { type: String },
    viva: {
        mcqs: [{
            question: String,
            options: [String],
            correctAnswer: String
        }],
        shortQuestion: {
            question: String,
            correctAnswer: String,
            explanation: String
        }
    },
    input: { type: String, required: false },
    output: { type: String, required: false },
    validationRule: { type: String, required: false },
    detailedGuidance: { type: String },
    difficulty_level: { type: Number, enum: [1, 2, 3, 4, 5], default: 1 },
    unlock_condition: { type: String },
    completion_condition: { type: String },

    // Learning Resources (YouTube, etc.)
    learningResources: [{
        type: { type: String, enum: ['youtube', 'article', 'book'], default: 'youtube' },
        title: String,
        url: String
    }],

    status: { type: String, enum: ['locked', 'active', 'todo', 'doing', 'done', 'completed'], default: 'locked' }, // Updated status enum to match 'locked | active | completed' + legacy
    isLocked: { type: Boolean, default: false },
    subTasks: [{
        title: String,
        description: String,
        isCompleted: { type: Boolean, default: false },
        executionLabs: [{
            title: String,
            description: String,
            siliconValleyWisdom: String,
            conceptMap: [String],
            isCompleted: { type: Boolean, default: false },
            viva: {
                mcqs: [{
                    question: String,
                    options: [String],
                    correctAnswer: String
                }],
                shortQuestion: {
                    question: String,
                    correctAnswer: String,
                    explanation: String
                }
            }
        }]
    }],
    verification: {
        isVerified: { type: Boolean, default: false },
        results: [{
            questionId: String,
            userAnswer: String,
            isCorrect: Boolean,
            suggestion: String
        }]
    },
    level: { type: Number, enum: [1, 2, 3], default: 1 }, // 1=Normal, 2=High, 3=Legend (from roadmap phase)
    dayNumber: { type: Number, default: 1 }, // Day 1, Day 2...
    dueDate: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// MED-8 FIX: Compound Index for rapid step-based task retrieval
TaskSchema.index({ userId: 1, roadmapStepId: 1 });
TaskSchema.index({ roadmapId: 1 });

export default mongoose.model<ITask>('Task', TaskSchema);