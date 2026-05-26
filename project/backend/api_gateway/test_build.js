const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

async function run() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/fueture_db');
    console.log('Connected to fueture_db');

    // 1. Get or create a user
    const usersCollection = mongoose.connection.db.collection('users');
    let user = await usersCollection.findOne({ email: 'mayur@gmail.com' });
    if (!user) {
      console.log('Creating a test user...');
      const insertResult = await usersCollection.insertOne({
        email: 'mayur@gmail.com',
        role: 'user',
        status: 'active',
        createdAt: new Date()
      });
      user = { _id: insertResult.insertedId, email: 'mayur@gmail.com' };
    }
    console.log('User ID:', user._id);

    // 2. Import the collage project model and services
    const CollageProject = require('./dist/modules/collage_project/collage_project.model').default;
    const { multiAgentService } = require('./dist/modules/collage_project/multi_agent.service');

    // 3. Create a test project
    console.log('Creating test project...');
    const project = new CollageProject({
      userId: user._id,
      title: 'TaskTrackerPro',
      requirements: 'A dark theme Task Management application with user authentication, dynamic charts showing completed tasks, list of tasks, edit task modal, and premium glassmorphic styling.',
      category: 'STUDENT_8_12',
      field: 'saas',
      type: 'Full Stack App',
      technologyStack: {
        frontend: 'React',
        backend: 'Node.js',
        database: 'MongoDB'
      },
      prototypeMode: true, // Frontend prototype mode to build all UI files
      status: 'DRAFT'
    });
    await project.save();
    console.log('Project created with ID:', project._id);

    // 4. Start the build
    console.log('Starting project build...');
    await multiAgentService.startProjectBuild(project);
    console.log('Build started. Polling status...');

    // 5. Poll status until completed or failed
    const start = Date.now();
    let done = false;
    let anyError = false;
    while (!done) {
      await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10s
      const updatedProject = await CollageProject.findById(project._id);
      console.log(`[${Math.round((Date.now() - start)/1000)}s] Status: ${updatedProject.status}`);
      
      // If it takes more than 10 minutes, abort
      if (Date.now() - start > 1800000) {
        console.error('Timeout: Project build took more than 10 minutes.');
        done = true;
        break;
      }
      
      if (updatedProject.status === 'COMPLETED' || updatedProject.status === 'FAILED') {
        done = true;
        console.log('Final status:', updatedProject.status);
        
        // Let's print logs
        const SystemLog = mongoose.connection.db.collection('systemlogs');
        const logs = await SystemLog.find({ projectId: project._id }).sort({ createdAt: 1 }).toArray();
        console.log('--- SYSTEM BUILD LOGS ---');
        logs.forEach(l => console.log(`[${l.logType}] ${l.message}`));

        if (updatedProject.status === 'COMPLETED') {
          console.log('Checking generated files...');
          const ProjectFile = mongoose.connection.db.collection('projectfiles');
          const files = await ProjectFile.find({ projectId: project._id }).toArray();
          console.log(`Generated ${files.length} files.`);
          
          // Print some file names and verify they don't contain <html>
          files.forEach(f => {
            const hasHtml = /<!DOCTYPE html>|<html|<body>/i.test(f.fileContent);
            const isComponent = f.filePath.endsWith('.tsx') || f.filePath.endsWith('.jsx');
            console.log(` - ${f.filePath} (Size: ${f.fileContent.length} bytes, has HTML page wrapper: ${hasHtml})`);
            if (isComponent && hasHtml) {
              console.error(`❌ ERROR: Component file ${f.filePath} contains HTML page wrapper!`);
              anyError = true;
            }
          });
          
          if (!anyError) {
            console.log('🏆 SUCCESS: All component files verified successfully! No HTML page wrappers found.');
          } else {
            console.error('❌ FAILURE: Some component files contained HTML page wrappers.');
            process.exit(1);
          }
        } else {
          console.error('❌ FAILURE: Project build failed.');
          process.exit(1);
        }
      }
    }
  } catch (err) {
    console.error('Test Build Script Error:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

run();
