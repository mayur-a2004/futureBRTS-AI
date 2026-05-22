const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    const Project = mongoose.model('CollageProject', new mongoose.Schema({}, { strict: false }));
    const pId = '69bfdc4fd2644a2224da879b';
    const project = await Project.findById(pId);
    console.log('--- Project Artifacts ---');
    console.log(JSON.stringify(project.artifacts, null, 2));
    console.log('--- Project Status ---');
    console.log(project.status);
    process.exit(0);
}
run();
