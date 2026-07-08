const mongoose = require('mongoose');

const mongoUri = 'mongodb+srv://kanjiyaparas2002_db_user:B7s6IUNngw5AVfAS@cluster0.1hl7shv.mongodb.net/futurebilder_tool?retryWrites=true&w=majority';

async function run() {
    try {
        await mongoose.connect(mongoUri);
        console.log('DB Connected!');
        const rooms = await mongoose.connection.db.collection('arenarooms').find().sort({ createdAt: -1 }).limit(3).toArray();
        console.log('Latest 3 rooms:');
        rooms.forEach((r, idx) => {
            console.log(`\n--- Room ${idx + 1}: ${r.roomCode} (Status: ${r.status}, Mode: ${r.mode}) ---`);
            console.log('Subject:', r.subject);
            console.log('Players:', r.players.map(p => ({ firstName: p.firstName, grade: p.grade, team: p.team })));
            if (r.playerQuestions) {
                console.log('PlayerQuestions Keys:', Object.keys(r.playerQuestions));
                for (const k of Object.keys(r.playerQuestions)) {
                    const qs = r.playerQuestions[k];
                    console.log(`Questions for user ${k} (count: ${qs ? qs.length : 0}):`);
                    if (qs && qs.length > 0) {
                        console.log('First Question:', qs[0].question);
                        console.log('Options:', qs[0].options);
                        console.log('Correct:', qs[0].correctAnswer);
                    }
                }
            } else {
                console.log('No playerQuestions Map/Object found.');
            }
        });
        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}
run();
