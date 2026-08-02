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

    async sendSrsReminderEmail(to: string, studentName: string, dueTopics: { title: string; sessionTitle: string }[]) {
        const subject = `Review Reminder: You have ${dueTopics.length} topics due for review today!`;
        const topicsListHtml = dueTopics.map(t => 
            `<li style="margin-bottom: 8px; color: #334155; font-size: 15px;">
                <strong>${t.title}</strong> (from <em>${t.sessionTitle}</em>)
             </li>`
        ).join('');
        
        const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #6366f1;">Future Education OS - Spaced Repetition Review</h2>
                <p>Hello ${studentName || 'Student'},</p>
                <p>According to your personal learning curve, the following topics are due for review today. Reviewing them now will maximize long-term retention by up to 300%!</p>
                
                <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #edf2f7; margin: 20px 0;">
                    <span style="font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em;">Due Reviews Today</span>
                    <ul style="margin: 12px 0 0 0; padding-left: 20px;">
                        ${topicsListHtml}
                    </ul>
                </div>
                
                <div style="margin: 24px 0; text-align: center;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/future-education/dashboard" style="background-color: #6366f1; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Go to Dashboard & Review Now</a>
                </div>
                
                <p style="color: #64748b; font-size: 12px; margin-top: 24px;">This is an automated notification based on the SM-2 Spaced Repetition scheduler. Keep up the active study streak! 🔥</p>
            </div>
        `;
        await this.sendEmail(to, subject, html);
    }

    async sendPasswordResetEmail(to: string, userName: string, resetLink: string) {
        const subject = `🔐 Password Reset Request - Future BRTS Account`;
        const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                <h2 style="color: #4f46e5; margin-top: 0;">Future BRTS AI Platform</h2>
                <p>Hello ${userName || 'User'},</p>
                <p>We received a request to reset the password for your <strong>Future BRTS</strong> account associated with <strong>${to}</strong>.</p>
                <p>Please click the button below to reset your password. This link is valid for 15 minutes:</p>
                <div style="margin: 28px 0; text-align: center;">
                    <a href="${resetLink}" style="background-color: #4f46e5; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);">Reset Password Now</a>
                </div>
                <p style="color: #64748b; font-size: 13px;">Or copy and paste this link into your browser:<br/><a href="${resetLink}" style="color: #4f46e5; word-break: break-all;">${resetLink}</a></p>
                <p style="color: #94a3b8; font-size: 12px; margin-top: 32px; border-top: 1px solid #f1f5f9; padding-top: 16px;">If you did not request a password reset, please ignore this email or contact Future BRTS support if you have security concerns.</p>
            </div>
        `;
        await this.sendEmail(to, subject, html);
    }

    async sendNewUserAdminAlert(userData: { name: string; email: string; provider?: string; createdAt?: Date }) {
        const adminEmail = process.env.ADMIN_ALERT_EMAIL || 'futurebrts@gmail.com';
        const subject = `🎉 [New User Alert] ${userData.name || 'New Visitor'} (${userData.email}) joined Future BRTS!`;
        const timeStr = (userData.createdAt || new Date()).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
        
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #6366f1; border-radius: 16px; background-color: #05060b; color: #ffffff;">
                <div style="text-align: center; border-bottom: 1px solid #1e293b; padding-bottom: 16px; margin-bottom: 20px;">
                    <h2 style="color: #818cf8; margin: 0; font-size: 24px;">🚀 Future BRTS AI Platform</h2>
                    <span style="font-size: 11px; color: #10b981; font-weight: bold; letter-spacing: 0.1em; text-transform: uppercase;">NEW USER REGISTRATION ALERT</span>
                </div>
                
                <p style="font-size: 15px; color: #cbd5e1; margin-bottom: 20px;">A new user has just registered and activated their account on Future BRTS AI:</p>
                
                <div style="background-color: #0f172a; padding: 20px; border-radius: 12px; border: 1px solid #1e293b; margin-bottom: 24px;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                        <tr>
                            <td style="padding: 8px 0; color: #94a3b8; font-weight: bold; width: 35%;">User Name:</td>
                            <td style="padding: 8px 0; color: #f8fafc; font-weight: bold;">${userData.name || 'User'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #94a3b8; font-weight: bold;">Email Address:</td>
                            <td style="padding: 8px 0; color: #38bdf8; font-weight: bold;">${userData.email}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #94a3b8; font-weight: bold;">Registration Method:</td>
                            <td style="padding: 8px 0; color: #a855f7; font-weight: bold;">${userData.provider || 'Google One-Tap / Signup'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #94a3b8; font-weight: bold;">Initial Tokens Granted:</td>
                            <td style="padding: 8px 0; color: #f59e0b; font-weight: bold;">5,000 Free AI Tokens 🎁</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #94a3b8; font-weight: bold;">Registration Time:</td>
                            <td style="padding: 8px 0; color: #cbd5e1;">${timeStr} (IST)</td>
                        </tr>
                    </table>
                </div>

                <div style="text-align: center; margin-top: 24px;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" style="background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">Open Admin Panel</a>
                </div>

                <p style="color: #64748b; font-size: 11px; margin-top: 28px; text-align: center; border-top: 1px solid #1e293b; padding-top: 16px;">
                    This is an automated real-time notification sent directly to <strong>${adminEmail}</strong>.
                </p>
            </div>
        `;
        await this.sendEmail(adminEmail, subject, html);
    }
}

export const mailService = new MailService();
