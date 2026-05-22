import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import PaymentGateway from '../modules/economy/payment-gateway.model';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const updateKeys = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/future_db');
        console.log("Connected to MongoDB...");

        const razorpayKeys = {
            apiKey: 'rzp_test_S5bPJ3wmKHma6g',
            apiSecret: 'edOmDrITqUAzY880L86tu380'
        };

        const result = await PaymentGateway.findOneAndUpdate(
            { provider: 'razorpay' },
            {
                config: razorpayKeys,
                isActive: true,
                name: 'Razorpay',
                metadata: {
                    label: 'Razorpay / Cards / UPI',
                    description: 'Secure Payment Gateway (Live Test Mode)',
                    icon: 'CreditCard'
                }
            },
            { upsert: true, new: true }
        );

        console.log("✅ Razorpay Keys Updated Successfully in Database!");
        console.log("Provider:", result.provider);
        console.log("API Key Set:", result.config.apiKey);

        process.exit(0);
    } catch (err) {
        console.error("❌ Error updating keys:", err);
        process.exit(1);
    }
};

updateKeys();
