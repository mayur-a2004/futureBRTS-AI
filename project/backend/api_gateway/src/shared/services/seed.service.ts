import User from '../../modules/auth/user.model';
import PricingPlan from '../../modules/economy/pricing-plan.model';
import SystemSettings from '../../modules/admin/settings.model';
import PaymentGateway from '../../modules/economy/payment-gateway.model';

export const seedService = {
    seedInitialData: async () => {
        try {
            console.log("🌱 Starting Dynamic Data Seeding...");

            // 1. Seed Pricing Plans
            const planCount = await PricingPlan.countDocuments();
            if (planCount === 0) {
                await PricingPlan.create([
                    { tier: 'day', name: "24h Ultra", duration: "1 Day", price: 49, tokens: 2000, features: ['24h Unlimited Access', 'Pro Roadmap Sync'], isPopular: false, order: 1 },
                    { tier: 'week', name: "Sprint Pro", duration: "1 Week", price: 249, tokens: 15000, features: ['7 Days Access', 'Priority Processing'], isPopular: false, order: 2 },
                    { tier: 'monthly', name: "Master Builder", duration: "1 Month", price: 999, tokens: 75000, features: ['30 Days Premium', 'Deep Tech Access'], isPopular: true, order: 3 },
                    { tier: '3_month', name: "Strategic Plan", duration: "3 Months", price: 2699, tokens: 250000, features: ['90 Days Power', 'Bulk Token Saving'], isPopular: false, order: 4 },
                    { tier: 'yearly', name: "Architect Elite", duration: "1 Year", price: 8999, tokens: 1500000, features: ['365 Days Access', 'Developer API Early Access'], isPopular: false, order: 5 },
                ]);
            }

            // 2. Seed System Settings (Ad rewards, AI defaults, etc.)
            const settings = [
                { key: 'AD_REWARD_TOKENS', value: 50, description: 'Tokens granted per ad view' },
                { key: 'PRIMARY_AI_PROVIDER', value: 'GROQ', description: 'Live AI Engine Routing (FIXED: GROQ)' },
                { key: 'AI_TIMEOUT_MS', value: 60000, description: 'Global AI wait limit' },
                { key: 'AI_GROQ_KEY', value: process.env.GROQ_API_KEY || '', description: 'Dynamic Groq API Key' },
                { key: 'AI_OPENROUTER_KEY', value: process.env.OPENROUTER_API_KEY || '', description: 'Dynamic OpenRouter (DeepSeek) API Key' },
                { key: 'GROQ_MODEL', value: 'llama-3.3-70b-versatile', description: 'Active Groq Model' }
            ];

            for (const s of settings) {
                // Only seed if it doesn't already exist to preserve manual admin changes
                const existing = await SystemSettings.findOne({ key: s.key });
                if (!existing) {
                    await SystemSettings.create(s);
                }
            }

            // 3. Seed Gateways
            const gatewayCount = await PaymentGateway.countDocuments();
            if (gatewayCount === 0) {
                await PaymentGateway.create([
                    { provider: 'razorpay', name: 'Razorpay', isActive: true, metadata: { label: 'Razorpay / Cards / UPI', description: 'Secure Payment Gateway (Live Test Mode)', icon: 'CreditCard' }, config: { apiKey: 'rzp_test_S5bPJ3wmKHma6g', apiSecret: 'edOmDrITqUAzY880L86tu380' } },
                    { provider: 'phonepe', name: 'PhonePe', isActive: true, metadata: { label: 'UPI / GPay / PhonePe', description: 'Direct Scan & Pay', icon: 'Smartphone' }, config: { upiId: 'futurebilder@upi' } },
                ]);
            }

            // 4. Seed Default Admin
            const adminEmail = 'mayur@gmail.com';
            const adminExists = await User.findOne({ email: adminEmail });
            if (!adminExists) {
                const bcrypt = require('bcryptjs');
                const passwordHash = await bcrypt.hash('123', 10);
                await User.create({
                    firstName: 'Mayur',
                    lastName: 'Admin',
                    email: adminEmail,
                    passwordHash,
                    role: 'admin',
                    status: 'active',
                    onboardingCompleted: true,
                    provider: 'local'
                });
                console.log("👤 Default Admin Profile Provisioned.");
            }

            console.log("✅ Seeding Completed Successfully.");
        } catch (err) {
            console.error("❌ Seeding Error:", err);
        }
    }
};
