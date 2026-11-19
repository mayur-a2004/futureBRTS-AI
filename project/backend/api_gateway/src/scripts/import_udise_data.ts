import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import UdiseSchool from '../modules/auth/udise_school.model';

// Load Environment Variables
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/futureed_os';

async function importUdiseData() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB.');

        const filePath = path.join(__dirname, '../data/udise_schools.json');
        const csvPath = path.join(__dirname, '../data/udise_schools.csv');

        let records: any[] = [];

        if (fs.existsSync(filePath)) {
            const rawData = fs.readFileSync(filePath, 'utf-8');
            records = JSON.parse(rawData);
            console.log(`Loaded ${records.length} schools from JSON.`);
        } else if (fs.existsSync(csvPath)) {
            const rawData = fs.readFileSync(csvPath, 'utf-8');
            const lines = rawData.split('\n');
            const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;
                const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
                if (cols.length >= 2) {
                    records.push({
                        udiseCode: cols[0] || `24${String(i).padStart(9, '0')}`,
                        schoolName: cols[1] || 'Unknown School',
                        state: cols[2] || 'Gujarat',
                        district: cols[3] || 'Gandhinagar',
                        city: cols[4] || cols[3] || 'Gandhinagar',
                        pincode: cols[5] || '382015',
                        board: cols[6] || 'GSEB',
                        fullAddress: cols[7] || `${cols[1]}, ${cols[4] || cols[3]}, ${cols[2] || 'Gujarat'} - ${cols[5] || '382015'}`
                    });
                }
            }
            console.log(`Parsed ${records.length} schools from CSV.`);
        } else {
            console.log('⚠️ No udise_schools.json or udise_schools.csv found in project/backend/api_gateway/src/data/');
            console.log('Creating sample dataset template...');
            records = [
                {
                    udiseCode: '24070101501',
                    schoolName: 'LDRP Institute of Technology & Research',
                    state: 'Gujarat',
                    district: 'Gandhinagar',
                    city: 'Gandhinagar',
                    pincode: '382015',
                    board: 'GSEB',
                    medium: 'English',
                    fullAddress: 'Sector 15, Near Kh-5 Circle, Gandhinagar, Gujarat - 382015'
                },
                {
                    udiseCode: '24070100702',
                    schoolName: 'Delhi Public School Gandhinagar',
                    state: 'Gujarat',
                    district: 'Gandhinagar',
                    city: 'Gandhinagar',
                    pincode: '382007',
                    board: 'CBSE',
                    medium: 'English',
                    fullAddress: 'Koba-Gandhinagar Highway, Sector 0, Gandhinagar, Gujarat - 382007'
                }
            ];
        }

        if (records.length > 0) {
            console.log('Inserting into MongoDB...');
            for (const r of records) {
                await UdiseSchool.updateOne(
                    { udiseCode: r.udiseCode },
                    { $set: r },
                    { upsert: true }
                );
            }
            console.log(`🎉 Successfully imported/updated ${records.length} UDISE schools in database!`);
        }
    } catch (err) {
        console.error('❌ Error importing UDISE data:', err);
    } finally {
        await mongoose.disconnect();
        console.log('MongoDB connection closed.');
    }
}

importUdiseData();
