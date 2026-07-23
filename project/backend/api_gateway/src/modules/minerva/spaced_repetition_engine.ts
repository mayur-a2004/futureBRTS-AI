import MinervaStudentKnowledgeGraph from './models/minerva_student_knowledge_graph.model';
import mongoose from 'mongoose';

export class SpacedRepetitionEngine {
    /**
     * Get all due review notifications for a student based on Ebbinghaus Forgetting Curve intervals
     */
    public static async getDueReviews(userId: string): Promise<any[]> {
        try {
            if (!userId) return [];
            const userObjectId = new mongoose.Types.ObjectId(userId);
            const now = new Date();

            const dueNodes = await MinervaStudentKnowledgeGraph.find({
                userId: userObjectId,
                nextReviewDue: { $lte: now }
            }).sort({ nextReviewDue: 1 }).limit(5);

            return dueNodes.map(node => ({
                topic: node.topic,
                subject: node.subject,
                masteryScore: node.masteryScore,
                dueSinceDays: Math.floor((now.getTime() - node.nextReviewDue.getTime()) / (1000 * 3600 * 24)),
                notificationMessage: `Dost, ${node.subject} me "${node.topic}" ko revise kiye huye kuch din ho gaye hain. Ek quick 2-minute revision quiz try karoge? ⚡`
            }));
        } catch (err) {
            console.error('[SpacedRepetitionEngine] Get due reviews error:', err);
            return [];
        }
    }
}
