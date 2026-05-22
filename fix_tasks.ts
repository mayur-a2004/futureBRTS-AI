import mongoose from 'mongoose';
import ProjectTask from './project/backend/api_gateway/src/modules/collage_project/project_task.model';
import CollageProject from './project/backend/api_gateway/src/modules/collage_project/collage_project.model';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, 'project/backend/api_gateway/.env') });

async function fix() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/futurebuilders');
    const pId = '69bfdc4fd2644a2224da879b';
    const project = await CollageProject.findById(pId);
    if (!project) return console.log('Project not found');

    const types = ['analyze', 'blueprint', 'context_memory', 'database', 'api', 'backend_module', 'frontend_module', 'packaging'];
    for (const [i, t] of types.entries()) {
        await ProjectTask.findOneAndUpdate(
            { projectId: pId, taskType: t },
            { priority: i + 1, status: 'completed' }, // Set to completed since the logs show it ran
            { upsert: true }
        );
    }
    console.log('✅ Tasks Seeded & COMPLETED for Project');
    process.exit(0);
}
fix();
