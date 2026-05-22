const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const pId = '69bfdc4fd2644a2224da879b';

const ProjectTaskSchema = new mongoose.Schema({
    projectId: mongoose.Schema.Types.ObjectId,
    taskType: String,
    status: String,
    priority: Number
}, { timestamps: true });

// Check if model already exists to avoid OverwriteModelError
const ProjectTask = mongoose.models.ProjectTask || mongoose.model('ProjectTask', ProjectTaskSchema);

async function run() {
    try {
        console.log('Connecting to:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        const types = ['analyze', 'blueprint', 'context_memory', 'database', 'api', 'backend_module', 'frontend_module', 'packaging'];
        for (let i = 0; i < types.length; i++) {
            await ProjectTask.findOneAndUpdate(
                { projectId: new mongoose.Types.ObjectId(pId), taskType: types[i] },
                { 
                   status: 'completed', 
                   priority: i + 1 
                },
                { upsert: true, new: true }
            );
            console.log(`Synced task: ${types[i]}`);
        }
        console.log('✅ Project 69bfdc... tasks globally synchronized.');
        process.exit(0);
    } catch (err) {
        console.error('❌ SEED ERROR:', err);
        process.exit(1);
    }
}
run();
