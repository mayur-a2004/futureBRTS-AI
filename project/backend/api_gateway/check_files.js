const mongoose = require('mongoose');

async function run() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/fueture_db');
    console.log('Connected to fueture_db');
    
    const ProjectFile = mongoose.connection.db.collection('projectfiles');
    const files = await ProjectFile.find({ projectId: new mongoose.Types.ObjectId('6a0fc922516f35ee025ae58e') }).toArray();
    console.log('--- FILES IN MONGO ---');
    files.forEach(f => {
      console.log(`Path: ${f.filePath}, Content length: ${f.fileContent ? f.fileContent.length : 0}`);
      if (f.filePath.endsWith('.tsx') || f.filePath.endsWith('.jsx')) {
         console.log(`Preview: \n${f.fileContent ? f.fileContent.substring(0, 150) : ''}\n-------------------`);
      }
    });
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
