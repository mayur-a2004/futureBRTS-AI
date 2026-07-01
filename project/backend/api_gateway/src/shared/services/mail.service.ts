import nodemailer from 'nodemailer';

class MailService {
    private transporter: nodemailer.Transporter | null = null;

    constructor() {
        const host = process.env.SMTP_HOST || 'smtp.ethereal.email';
        const port = parseInt(process.env.SMTP_PORT || '587');
        const user = process.env.SMTP_USER;
        const pass = process.env.SMTP_PASS;

        if (user && pass) {
            this.transporter = nodemailer.createTransport({
                host,
                port,
                secure: port === 465,
                auth: { user, pass }
            });
            console.log('[MailService] SMTP Transporter initialized.');
        } else {
            console.log('[MailService] SMTP_USER and SMTP_PASS not set. Falling back to console-logging mock emails.');
        }
    }

    async sendEmail(to: string, subject: string, html: string) {
        const from = process.env.SMTP_FROM || '"Future Education OS" <noreply@futureeducation.os>';
        if (this.transporter) {
            try {
                await this.transporter.sendMail({ from, to, subject, html });
                console.log(`[MailService] Email sent successfully to: ${to}`);
            } catch (err) {
                console.error(`[MailService] Failed to send email to ${to}:`, err);
            }
        } else {
            console.log(`\n================= MOCK EMAIL =================`);
            console.log(`To: ${to}`);
            console.log(`Subject: ${subject}`);
            console.log(`HTML Body:\n${html}`);
            console.log(`==============================================\n`);
        }
    }

    async sendParentVerification(parentEmail: string, studentName: string, verificationLink: string) {
        const subject = `Verify your Parent Account on Future Education OS`;
        const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #6366f1;">Future Education OS</h2>
                <p>Hello,</p>
                <p>Your child <strong>${studentName}</strong> has registered your email address to receive their progress scorecards and homework reports.</p>
                <p>To confirm your consent and activate automatic scorecards, please click the button below:</p>
                <div style="margin: 24px 0;">
                    <a href="${verificationLink}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Verify Parent Email</a>
                </div>
                <p style="color: #64748b; font-size: 12px;">If you did not authorize this, please ignore this email.</p>
            </div>
        `;
        await this.sendEmail(parentEmail, subject, html);
    }

    async sendExamScorecard(parentEmail: string, studentName: string, data: { topic: string; score: number; feedback: string; correction: string }) {
        const subject = `Academic Alert: ${studentName} completed a ${data.topic} exam`;
        const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #6366f1;">Future Education OS - Scorecard</h2>
                <p>Dear Parent,</p>
                <p><strong>${studentName}</strong> has completed a test on <strong>${data.topic}</strong>.</p>
                
                <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #edf2f7; margin: 20px 0;">
                    <span style="font-size: 12px; color: #64748b; font-weight: bold; text-transform: uppercase;">Test Score</span>
                    <h1 style="color: ${data.score >= 75 ? '#22c55e' : '#f59e0b'}; margin: 4px 0 16px 0; font-size: 36px;">${data.score}%</h1>
                    
                    <h4 style="margin: 0 0 4px 0; color: #1e293b;">AI Teacher Feedback:</h4>
                    <p style="margin: 0 0 16px 0; color: #475569; font-size: 14px; line-height: 1.5;">${data.feedback}</p>
                    
                    <h4 style="margin: 0 0 4px 0; color: #1e293b;">Key Areas for Improvement:</h4>
                    <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.5;">${data.correction || 'None identified. Excellent work!'}</p>
                </div>
                
                <p style="color: #64748b; font-size: 12px; margin-top: 24px;">This is an automated notification. Track active progress live in the Student Dashboard.</p>
            </div>
        `;
        await this.sendEmail(parentEmail, subject, html);
    }

    async sendHomeworkAlert(parentEmail: string, studentName: string, data: { taskTitle: string; passed: boolean; feedback: string }) {
        const subject = `Homework Status: ${studentName} submitted an assignment`;
        const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #6366f1;">Future Education OS - Homework Alert</h2>
                <p>Dear Parent,</p>
                <p><strong>${studentName}</strong> has submitted homework for: <strong>${data.taskTitle}</strong>.</p>
                
                <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #edf2f7; margin: 20px 0;">
                    <span style="font-size: 12px; color: #64748b; font-weight: bold; text-transform: uppercase;">Evaluation Status</span>
                    <h2 style="color: ${data.passed ? '#22c55e' : '#ef4444'}; margin: 4px 0 16px 0;">${data.passed ? 'PASSED ✅' : 'RETRY REQUIRED ❌'}</h2>
                    
                    <h4 style="margin: 0 0 4px 0; color: #1e293b;">AI Teacher Evaluation:</h4>
                    <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.5;">${data.feedback}</p>
                </div>
                
                <p style="color: #64748b; font-size: 12px; margin-top: 24px;">This is an automated notification. Track active progress live in the Student Dashboard.</p>
            </div>
        `;
        await this.sendEmail(parentEmail, subject, html);
    }
}

export const mailService = new MailService();
