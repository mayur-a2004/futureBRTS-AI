const mongoose = require('mongoose');
const { multiAgentService } = require('./src/modules/collage_project/multi_agent.service');
const CollageProject = require('./src/modules/collage_project/collage_project.model').default;

const mongoUri = 'mongodb://127.0.0.1:27017/fueture_db';

const triggerBuild = async () => {
    try {
        await mongoose.connect(mongoUri);
        const pId = '69b6bb41ba474d3b64c2948d';
        const project = await CollageProject.findById(pId);
        if (!project) throw new Error("Project not found");

        console.log("Triggering build for:", project.title);

        // Reset status to clear any hang
        project.status = 'GENERATING';
        await project.save();

        const b = await multiAgentService.generateBlueprint(project);
        console.log("Blueprint generated.");

        const updatedProject = await CollageProject.findById(pId);
        await multiAgentService.generateCode(updatedProject);
        console.log("Code generated.");

        await multiAgentService.packageProject(updatedProject);
        console.log("Packaging complete.");

        process.exit(0);
    } catch (e: any) {
        console.error("Manual Build Failed:", e.response?.data || e.message);
        process.exit(1);
    }
};

triggerBuild();
