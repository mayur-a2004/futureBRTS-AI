const mongoose = require('mongoose');

const mongoUri = 'mongodb+srv://kanjiyaparas2002_db_user:B7s6IUNngw5AVfAS@cluster0.1hl7shv.mongodb.net/futurebilder_tool?retryWrites=true&w=majority';

async function run() {
    try {
        await mongoose.connect(mongoUri);
        console.log('DB Connected!');
        const settings = await mongoose.connection.db.collection('systemsettings').find().toArray();
        console.log('All Settings in DB:');
        settings.forEach(s => {
            let str = String(s.value);
            if (str.length > 25) str = str.substring(0, 25) + '...';
            console.log(`- ${s.key}: ${str}`);
        });
        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}
run();
