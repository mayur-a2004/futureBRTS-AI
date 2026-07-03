import User from '../modules/auth/user.model';
import MinervaKnowledgeNode from '../modules/minerva/models/minerva_knowledge_node.model';
import MinervaStudySession from '../modules/minerva/models/minerva_study_session.model';
import { mailService } from '../shared/services/mail.service';
import { logger } from '../shared/utils/logger';

let lastRunDateString = '';

export const runSrsReminderCheck = async (force: boolean = false) => {
    try {
        const now = new Date();
        const dateStr = now.toDateString();

        if (!force && dateStr === lastRunDateString) {
            return;
        }

        logger.info('[SRS Cron] Running Spaced Repetition Due Reviews Reminder...');
        
        // Find all users
        const users = await User.find({});
        for (const user of users) {
            // Find due nodes for this user
            const dueNodes = await MinervaKnowledgeNode.find({
                userId: user._id,
                status: { $in: ['DONE', 'NEEDS_REVIEW'] },
                sr_due_date: { $lte: now }
            });

            if (dueNodes.length > 0) {
                // Fetch sessions to map titles
                const sessionIds = dueNodes.map(n => n.session_id);
                const sessions = await MinervaStudySession.find({ _id: { $in: sessionIds } });
                const sessionMap: { [key: string]: string } = {};
                sessions.forEach(s => {
                    sessionMap[s._id.toString()] = s.title;
                });

                const dueTopics = dueNodes.map(node => ({
                    title: node.title,
                    sessionTitle: sessionMap[node.session_id?.toString() || ''] || 'Learning Path'
                }));

                const studentName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Student';
                
                logger.info(`[SRS Cron] Sending SRS reminder email to ${user.email} with ${dueTopics.length} due items.`);
                await mailService.sendSrsReminderEmail(user.email, studentName, dueTopics);
            }
        }

        lastRunDateString = dateStr;
    } catch (err: any) {
        logger.error('[SRS Cron] Error during SRS reminder check:', err);
    }
};

export const initSrsCronJobs = () => {
    logger.info('Initializing SRS Spaced Repetition Cron Scheduler (Hourly check)...');

    // Run hourly check
    setInterval(async () => {
        const now = new Date();
        // Trigger at 8:00 AM
        if (now.getHours() === 8) {
            await runSrsReminderCheck();
        }
    }, 60 * 60 * 1000);
};
