const axios = require('axios');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const mongoose = require('mongoose');

// We can just load Settings model and retrieve keys manually to avoid ts compilation imports
const SystemSettingsSchema = new mongoose.Schema({
    key: String,
    value: mongoose.Schema.Types.Mixed
}, { collection: 'systemsettings' });

const SystemSettings = mongoose.models.SystemSettings || mongoose.model('SystemSettings', SystemSettingsSchema);

async function test() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fueture_db');
    
    // Get NVIDIA key from DB
    let setting = await SystemSettings.findOne({ key: 'AI_NVIDIA_KEY' });
    if (!setting) {
        setting = await SystemSettings.findOne({ key: 'NVIDIA_API_KEY' });
    }
    const nvidiaKey = setting ? setting.value : process.env.NVIDIA_API_KEY;
    
    console.log("NVIDIA KEY:", nvidiaKey ? "FOUND" : "NOT FOUND");
    if (!nvidiaKey) {
        process.exit(1);
    }
    
    const model = 'meta/llama-3.1-8b-instruct';
    
    const messages = [
        { role: 'system', content: 'You are a JSON assistant. You must respond with a JSON object containing a "reply" key.' },
        { role: 'user', content: 'linked list kya hota hai simple term me dsa me samjhao' }
    ];
    
    try {
        const response = await axios.post(
            'https://integrate.api.nvidia.com/v1/chat/completions',
            {
                messages,
                model,
                temperature: 0.7,
                max_tokens: 1000,
                response_format: { type: 'json_object' }
            },
            {
                headers: {
                    'Authorization': `Bearer ${nvidiaKey.trim()}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log("Status:", response.status);
        console.log("Response body:", JSON.stringify(response.data, null, 2));
    } catch (e) {
        console.error("Error:", e.response?.data || e.message);
    } finally {
        await mongoose.disconnect();
    }
}

test();
