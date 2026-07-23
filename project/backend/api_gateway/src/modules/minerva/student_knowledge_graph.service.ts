import MinervaStudentKnowledgeGraph from './models/minerva_student_knowledge_graph.model';
import mongoose from 'mongoose';

export class StudentKnowledgeGraphService {
    /**
     * Record a student learning event (task result, misconception, or mastery change)
     */
    public static async recordLearningEvent(params: {
        userId: string;
        subject: string;
        topic: string;
        subtopic?: string;
        isCorrect: boolean;
        weakConcept?: string;
        misconception?: string;
    }): Promise<any> {
        try {
            if (!params.userId || !params.topic) return null;

            const userObjectId = new mongoose.Types.ObjectId(params.userId);
            const query = { userId: userObjectId, topic: params.topic };

            let graphNode = await MinervaStudentKnowledgeGraph.findOne(query);

            if (!graphNode) {
                graphNode = new MinervaStudentKnowledgeGraph({
                    userId: userObjectId,
                    subject: params.subject || 'General',
                    topic: params.topic,
                    subtopic: params.subtopic || '',
                    masteryScore: params.isCorrect ? 60 : 40,
                    errorCount: params.isCorrect ? 0 : 1,
                    successCount: params.isCorrect ? 1 : 0,
                    weakConcepts: params.weakConcept ? [params.weakConcept] : [],
                    misconceptions: params.misconception ? [params.misconception] : [],
                    lastPracticedAt: new Date(),
                    nextReviewDue: new Date(Date.now() + (params.isCorrect ? 3 : 1) * 86400000)
                });
            } else {
                if (params.isCorrect) {
                    graphNode.successCount += 1;
                    graphNode.masteryScore = Math.min(100, graphNode.masteryScore + 10);
                } else {
                    graphNode.errorCount += 1;
                    graphNode.masteryScore = Math.max(0, graphNode.masteryScore - 15);
                }

                if (params.weakConcept && !graphNode.weakConcepts.includes(params.weakConcept)) {
                    graphNode.weakConcepts.push(params.weakConcept);
                }
                if (params.misconception && !graphNode.misconceptions.includes(params.misconception)) {
                    graphNode.misconceptions.push(params.misconception);
                }

                graphNode.lastPracticedAt = new Date();
                // Spaced repetition calculation: interval = 2^(successes) days
                const daysUntilReview = Math.min(30, Math.max(1, Math.pow(2, Math.min(5, graphNode.successCount))));
                graphNode.nextReviewDue = new Date(Date.now() + daysUntilReview * 86400000);
            }

            await graphNode.save();
            return graphNode;
        } catch (err) {
            console.error('[StudentKnowledgeGraph] Record event error:', err);
            return null;
        }
    }

    /**
     * Get student's weak topics & recent misconceptions for AI prompt injection
     */
    public static async getStudentMemoryContext(userId: string): Promise<string> {
        try {
            if (!userId) return '';
            const userObjectId = new mongoose.Types.ObjectId(userId);
            const weakNodes = await MinervaStudentKnowledgeGraph.find({
                userId: userObjectId,
                masteryScore: { $lt: 70 }
            }).sort({ masteryScore: 1 }).limit(5);

            if (!weakNodes || weakNodes.length === 0) return '';

            const memorySummaries = weakNodes.map(node =>
                `- Topic "${node.topic}" (Mastery: ${node.masteryScore}%, Errors: ${node.errorCount}${node.weakConcepts?.length ? `, Weakness: ${node.weakConcepts.join(', ')}` : ''})`
            ).join('\n');

            return `\nSTUDENT LONG-TERM KNOWLEDGE GRAPH MEMORY (PAST STRENGTHS & WEAKNESSES):\n${memorySummaries}\nIMPORTANT INSTRUCTION: Warmly remember these past struggles if relevant. Address the student as 'dost' or 'bhai'.\n`;
        } catch (err) {
            console.error('[StudentKnowledgeGraph] Get memory context error:', err);
            return '';
        }
    }
}
