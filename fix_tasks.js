const mongoose = require('mongoose');
const pId = '69bfdc4fd2644a2224da879b';

// Direct Schema to avoid TS issues
const ProjectTaskSchema = new mongoose.Schema({
    projectId: mongoose.Types.ObjectId,
    taskType: String,
    status: String,
    priority: Number
}, { timestamps: true });

const ProjectTask = mongoose.model('ProjectTask', ProjectTaskSchema);

async function run() {
    await mongoose.connect('mongodb://localhost:27017/fueture_db');
    const types = ['analyze', 'blueprint', 'context_memory', 'database', 'api', 'backend_module', 'frontend_module', 'packaging'];
    for (let i = 0; i < types.length; i++) {
        await ProjectTask.findOneAndUpdate(
            { projectId: pId, taskType: types[i] },
            { 
               status: 'completed', 
               priority: i + 1 
            },
            { upsert: true }
        );
    }
    console.log('Project 69bfdc... tasks fixed.');
    process.exit(0);
}
run();
