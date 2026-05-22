import { OnboardingProfile } from '../onboarding/onboarding.model';
import { openaiService } from '../../shared/services/openai.service';
import { ITask } from './task.model';
import TaskLog from './task-log.model';

export const verificationService = {

    /**
     * 🧠 PRIMARY: VIVA-based Execution Lab Verification (70% threshold via AI)
     * Called from tasks.controller.ts → verifyTask endpoint
     */
    verifyVivaSubmission: async (
        userId: string,
        task: ITask,
        results: any[],
        context: { subTaskIndex: number; smallTaskIndex: number; isRootViva?: boolean }
    ): Promise<{ success: boolean; isPassed: boolean; score: number; results: any[]; message: string }> => {
        try {
            const { subTaskIndex, smallTaskIndex, isRootViva } = context;

            let vivaData = null;
            if (isRootViva) {
                vivaData = (task as any).viva;
            } else {
                vivaData = (task.subTasks as any)?.[subTaskIndex]?.executionLabs?.[smallTaskIndex]?.viva;
            }

            if (!vivaData) {
                return {
                    success: false, isPassed: false, score: 0, results: [],
                    message: "No VIVA data found for this context."
                };
            }

            const groundTruth = {
                mcqs: vivaData.mcqs,
                shortQuestion: vivaData.shortQuestion
            };

            console.log(`[Neural VIVA] User: ${userId} | Task: ${task.title} | Lab [${subTaskIndex}.${smallTaskIndex}]`);

            // 🧠 AI EVALUATION — 70% success threshold enforced inside evaluateViva
            const evaluation = await openaiService.evaluateViva(results, groundTruth);

            // ✅ Write Audit Log on pass
            if (evaluation.isPassed) {
                await TaskLog.create({ taskId: task._id, userId, action: 'verified' });
            }

            return {
                success: true,
                isPassed: evaluation.isPassed,
                score: evaluation.score || 0,
                results: evaluation.results || [],
                message: evaluation.isPassed
                    ? "🚀 Neural Node Synchronized! Move to the next Execution Lab."
                    : "70% threshold not met. Review corrections and retry the VIVA."
            };
        } catch (error: any) {
            console.error("[Verification Service] VIVA Error:", error);
            return { success: false, isPassed: false, score: 0, results: [], message: "Neural Verification System Error. Try again." };
        }
    },

    /**
     * 🛡️ LEGACY: Text/Submission-based verification (fallback for older task types)
     */
    verifySubmission: async (
        userId: string,
        task: ITask,
        submission: string
    ): Promise<{ success: boolean; reason?: string; grade?: number }> => {
        try {
            const profile = await OnboardingProfile.findOne({ userId });
            const userType = determineUserType(profile);
            console.log(`[Legacy Verify] User: ${userId}, Type: ${userType}, Task: ${task.title}`);

            let result: { success: boolean; reason?: string; grade?: number };
            switch (userType) {
                case 'STUDENT': result = await verifyStudent(task, submission); break;
                case 'BUSINESS': result = await verifyBusiness(task, submission); break;
                default: result = await verifyProfessional(task, submission); break;
            }

            if (result.success) {
                await TaskLog.create({ taskId: task._id, userId, action: 'verified' });
            }
            return result;
        } catch (error: any) {
            console.error("[Verification Service] Legacy Error:", error);
            return { success: false, reason: "Neural Verification System Encountered an Error." };
        }
    }
};

// ─── Internal Helper Functions ──────────────────────────────────────────────

function determineUserType(profile: any): 'STUDENT' | 'JOB_SWITCHER' | 'BUSINESS' {
    if (!profile) return 'JOB_SWITCHER';
    const field = (profile.field || '').toLowerCase();
    const stage = (profile.life_stage || '').toLowerCase();
    if (field.includes('school') || field.includes('student') || stage.includes('student') || field.includes('graduation')) return 'STUDENT';
    if (field.includes('business') || field.includes('startup') || field.includes('entrepreneur') || field.includes('founder')) return 'BUSINESS';
    return 'JOB_SWITCHER';
}

async function verifyStudent(task: ITask, submission: string) {
    if (!submission || submission.length < 30)
        return { success: false, reason: "Academic standard requires at least 30 characters for conceptual clarity." };
    const result = await openaiService.gradeStudentSubmission(task.title, submission);
    return result.score >= 75
        ? { success: true, grade: result.score }
        : { success: false, reason: `Grade too low (${result.score}%). Passing: 75%. Feedback: ${result.feedback}` };
}

async function verifyProfessional(task: ITask, submission: string) {
    if (!submission || submission.length < 50)
        return { success: false, reason: "Professional intent requires a more detailed response (min 50 chars)." };
    const isValid = await openaiService.validateProfessionalIntent(task.title, submission);
    return isValid ? { success: true } : { success: false, reason: "Response lacks industrial relevance to the task mission." };
}

async function verifyBusiness(task: ITask, submission: string) {
    if (!submission || submission.trim().length < 15)
        return { success: false, reason: "Strategic reflection requires a meaningful input (min 15 chars)." };
    
    // HIGH-6 FIX: Use AI to evaluate business intent instead of auto-passing to prevent trivial bypass
    const isValid = await openaiService.validateProfessionalIntent(task.title + " (Business Track)", submission);
    return isValid ? { success: true } : { success: false, reason: "Response lacks strategic business relevance for this task." };
}