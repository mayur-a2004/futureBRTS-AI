import Razorpay from 'razorpay';
import Stripe from 'stripe';
import PaymentGateway from './payment-gateway.model';

export class PaymentService {
    private static async getGatewayConfig(provider: 'razorpay' | 'stripe' | 'phonepe') {
        const gateway = await PaymentGateway.findOne({ provider, isActive: true });
        if (!gateway) throw new Error(`${provider} gateway is not active or configured.`);
        return gateway.config;
    }

    // 💳 Razorpay Core
    static async createRazorpayOrder(amount: number, currency: string = 'INR') {
        const config = await this.getGatewayConfig('razorpay');
        const instance = new Razorpay({
            key_id: config.apiKey!,
            key_secret: config.apiSecret!,
        });

        const options = {
            amount: Math.round(amount * 100), // convert to paisa
            currency,
            receipt: `receipt_${Date.now()}`,
        };

        return await instance.orders.create(options);
    }

    // 🌍 Stripe Core
    static async createStripeSession(amount: number, planTitle: string, userEmail: string, successUrl: string, cancelUrl: string) {
        const config = await this.getGatewayConfig('stripe');
        const stripe = new Stripe(config.apiSecret!, { apiVersion: '2025-01-27' as any });

        return await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: { name: planTitle },
                    unit_amount: Math.round(amount * 100),
                },
                quantity: 1,
            }],
            mode: 'payment',
            customer_email: userEmail,
            success_url: successUrl,
            cancel_url: cancelUrl,
        });
    }

    // 📲 UPI Dynamic Generator
    static async generateUPILink(amount: number, reference: string) {
        const config = await this.getGatewayConfig('phonepe'); // Using phonepe provider for general UPI
        const upiId = config.upiId;
        const merchantName = "Future BRTS";

        // formats for BharatPe/PhonePe/GPay deep links
        const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(reference)}`;
        return {
            upiId,
            upiUrl: upiString,
            amount,
            reference
        };
    }
}
