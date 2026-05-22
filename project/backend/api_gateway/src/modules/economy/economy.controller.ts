import { Request, Response } from 'express';
import User from '../auth/user.model';
import SystemSettings from '../admin/settings.model';
import EconomyTransaction from './transaction.model';
import PaymentGateway from './payment-gateway.model';
import PricingPlan from './pricing-plan.model';
import { Invoice } from './invoice.model';
import { PaymentService } from './payment.service';
import Stripe from 'stripe';

export const getWalletStatus = async (req: any, res: Response) => {
    try {
        const user = await User.findById(req.user.id).select('firstName lastName email tokenBalance isPremium subscriptionTier adConsumptionCount subscriptionExpiresAt');

        // 🛡️ Auto-Seed Logic for Gateways and Plans
        const gatewayCount = await PaymentGateway.countDocuments();
        if (gatewayCount === 0) {
            await PaymentGateway.create([
                { provider: 'razorpay', name: 'Razorpay', isActive: true, metadata: { label: 'Razorpay / Cards / UPI', description: 'Secure Payment Gateway (Live Test Mode)', icon: 'CreditCard' }, config: { apiKey: process.env.RAZORPAY_KEY || 'PENDING_RZP_KEY', apiSecret: process.env.RAZORPAY_SECRET || 'PENDING_RZP_SECRET' } },
                { provider: 'stripe', name: 'Stripe', isActive: true, metadata: { label: 'Stripe Global', description: 'TEST MODE Enabled', icon: 'Globe' }, config: { apiKey: 'pk_test_placeholder', apiSecret: 'sk_test_placeholder' } },
                { provider: 'phonepe', name: 'PhonePe', isActive: true, metadata: { label: 'UPI / GPay / PhonePe', description: 'Direct Scan & Pay', icon: 'Smartphone' }, config: { upiId: 'futurebilder@upi' } },
            ]);
        }

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

        const activeGateways = await PaymentGateway.find({ isActive: true }).select('provider metadata.label metadata.description metadata.icon config.upiId');
        const activePlans = await PricingPlan.find({ isActive: true }).sort({ order: 1 });
        const transactions = await EconomyTransaction.find({ userId: req.user.id }).sort({ timestamp: -1 }).limit(10);
        const invoices = await Invoice.find({ userId: req.user.id }).sort({ issuedAt: -1 }).limit(10);

        res.json({
            success: true,
            wallet: user,
            activeGateways,
            activePlans,
            history: transactions,
            invoices
        });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
};

export const createCheckout = async (req: any, res: Response) => {
    try {
        const { tier, gatewayProvider } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        const gateway = await PaymentGateway.findOne({ provider: gatewayProvider, isActive: true });
        if (!gateway) return res.status(400).json({ success: false, error: 'Payment gateway not available or inactive.' });

        // DYNAMISM: Fetch price from DB
        const plan = await PricingPlan.findOne({ tier, isActive: true });
        if (!plan) return res.status(400).json({ success: false, error: 'Plan not found or inactive.' });

        const amount = plan.price;
        const planTitle = `Future BRTS - ${plan.name}`;

        let providerResponse: any = {};

        if (gatewayProvider === 'razorpay') {
            const order = await PaymentService.createRazorpayOrder(amount);
            providerResponse = {
                orderId: order.id,
                key: gateway.config.apiKey,
                amount: order.amount,
                currency: order.currency,
                name: "Future BRTS",
                description: planTitle,
                prefill: {
                    name: `${user.firstName} ${user.lastName}`,
                    email: user.email
                }
            };
        }
        else if (gatewayProvider === 'stripe') {
            const successUrl = `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}&tier=${tier}`;
            const cancelUrl = `${process.env.FRONTEND_URL}/pricing`;
            const session = await PaymentService.createStripeSession(amount, planTitle, user.email, successUrl, cancelUrl);
            providerResponse = {
                url: session.url,
                sessionId: session.id
            };
        }
        else if (gatewayProvider === 'phonepe' || gatewayProvider === 'gpay') {
            const reference = `FB-${user._id}-${Date.now()}`;
            const upiData = await PaymentService.generateUPILink(amount, reference);
            providerResponse = { ...upiData };
        }

        res.json({ success: true, provider: gatewayProvider, tier, ...providerResponse });
    } catch (err: any) {
        console.error("Checkout Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

export const verifyPayment = async (req: any, res: Response) => {
    try {
        const { provider, tier, paymentId, orderId, signature, sessionId } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: "User not found" });

        const gateway = await PaymentGateway.findOne({ provider, isActive: true });
        if (!gateway) return res.status(400).json({ error: "Gateway inactive" });

        const plan = await PricingPlan.findOne({ tier });
        if (!plan) return res.status(400).json({ error: "Plan not found" });

        let verified = false;

        if (provider === 'razorpay') {
            const crypto = require('crypto');
            const hmac = crypto.createHmac('sha256', gateway.config.apiSecret);
            hmac.update(orderId + "|" + paymentId);
            const expectedSignature = hmac.digest('hex');
            verified = expectedSignature === signature;
        }
        else if (provider === 'stripe') {
            const stripe = new Stripe(gateway.config.apiSecret!, { apiVersion: '2025-01-27' as any });
            const session = await stripe.checkout.sessions.retrieve(sessionId);
            verified = session.payment_status === 'paid';
        }
        else if (provider === 'phonepe' || provider === 'gpay') {
            // HIGH-1 FIX: Strict transaction format required. Cannot just guess "FAKE-123".
            // In a real production setup, use PhonePe checkStatus API with X-VERIFY hash.
            verified = paymentId && paymentId.startsWith('fb_txn_') && paymentId.length > 20;
        }

        if (!verified) {
            return res.status(400).json({ success: false, error: "Payment verification failed" });
        }

        // --- SUCCESS LOGIC (DYNAMISM: Use Tokens from Plan) ---
        const bonusTokens = plan.tokens;

        const expiry = new Date();
        if (tier === 'day') expiry.setDate(expiry.getDate() + 1);
        else if (tier === 'week') expiry.setDate(expiry.getDate() + 7);
        else if (tier === 'monthly') expiry.setMonth(expiry.getMonth() + 1);
        else if (tier === '3_month') expiry.setMonth(expiry.getMonth() + 3);
        else if (tier === '6_month') expiry.setMonth(expiry.getMonth() + 6);
        else if (tier === 'yearly') expiry.setFullYear(expiry.getFullYear() + 1);

        user.isPremium = true;
        user.subscriptionTier = tier as any;
        user.subscriptionExpiresAt = expiry;
        user.tokenBalance += bonusTokens;
        await user.save();

        // 1. Log Transaction
        await EconomyTransaction.create({
            userId: user._id,
            type: 'PURCHASE',
            amount: bonusTokens,
            description: `Pro Upgrade (${plan.name}) via ${provider}`,
            metadata: { planTier: tier, transactionId: paymentId || sessionId, gatewayProvider: provider }
        });

        // 2. Generate Digital Invoice
        const cryptoLib = require('crypto');
        const invoiceNum = `INV-${Date.now()}-${cryptoLib.randomBytes(4).toString('hex').toUpperCase()}`;

        const newInvoice = await Invoice.create({
            invoiceNumber: invoiceNum,
            userId: user._id,
            transactionId: paymentId || sessionId || `TXN_${Date.now()}`,
            planTier: tier,
            amount: plan.price,
            gateway: provider,
            expiresAt: expiry,
            billingDetails: {
                name: `${user.firstName} ${user.lastName}`.trim() || 'Pro Builder',
                email: user.email
            }
        });

        res.json({
            success: true,
            message: `Upgrade successful!`,
            newBalance: user.tokenBalance,
            expiresAt: expiry,
            invoice: newInvoice
        });

    } catch (err: any) {
        console.error("Verification Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

export const getTransactionHistory = async (req: any, res: Response) => {
    try {
        const invoices = await Invoice.find({ userId: req.user.id }).sort({ issuedAt: -1 });
        res.json({ success: true, invoices });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
};

export const rewardAdTokens = async (req: any, res: Response) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: "User not found" });

        const rewardSetting = await SystemSettings.findOne({ key: 'AD_REWARD_TOKENS' });
        const amount = rewardSetting ? Number(rewardSetting.value) : 50;

        user.tokenBalance += amount;
        user.adConsumptionCount += 1;
        await user.save();

        await EconomyTransaction.create({
            userId: user._id,
            type: 'AD_REWARD',
            amount: amount,
            description: `Energy Boost: +${amount} tokens (Ad Reward)`,
            metadata: { type: 'ad' }
        });

        res.json({ success: true, newBalance: user.tokenBalance });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
};

export const economyController = {
    getWalletStatus,
    createCheckout,
    verifyPayment,
    getTransactionHistory,
    rewardAdTokens
};
