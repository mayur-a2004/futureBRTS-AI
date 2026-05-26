const mongoose = require('mongoose');

async function run() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/fueture_db');
    console.log('Connected to fueture_db');
    
    const SystemLog = mongoose.connection.db.collection('systemlogs');
    const logs = await SystemLog.find({ projectId: new mongoose.Types.ObjectId('6a0fc922516f35ee025ae58e') }).sort({ createdAt: 1 }).toArray();
    console.log('--- BUILD LOGS ---');
    logs.forEach(l => {
      console.log(`[${l.logType}] ${l.message}`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
