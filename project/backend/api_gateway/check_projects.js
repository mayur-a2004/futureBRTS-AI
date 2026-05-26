const mongoose = require('mongoose');

async function run() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/fueture_db');
    console.log('Connected to fueture_db');
    
    // Find collage projects
    const CollageProject = mongoose.connection.db.collection('collageprojects');
    const projects = await CollageProject.find().sort({ createdAt: -1 }).limit(10).toArray();
    console.log('--- RECENT PROJECTS ---');
    projects.forEach(p => {
      console.log(`ID: ${p._id}, Title: ${p.title}, Category: ${p.category}, Status: ${p.status}, PrototypeMode: ${p.prototypeMode}, CreatedAt: ${p.createdAt}`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
