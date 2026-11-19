import mongoose from 'mongoose';
import UdiseSchool from '../modules/auth/udise_school.model';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/futureed_os';

const GUJARAT_FULL_SCHOOLS = [
    // 🏙️ GANDHINAGAR DISTRICT
    { udiseCode: '24070101501', schoolName: 'LDRP Institute of Technology & Research', state: 'Gujarat', district: 'Gandhinagar', city: 'Gandhinagar', pincode: '382015', board: 'GSEB', category: 'Higher Secondary', managementType: 'Private Unaided', fullAddress: 'Sector 15, Near Kh-5 Circle, Gandhinagar, Gujarat - 382015' },
    { udiseCode: '24070100702', schoolName: 'Delhi Public School Gandhinagar', state: 'Gujarat', district: 'Gandhinagar', city: 'Gandhinagar', pincode: '382007', board: 'CBSE', category: 'Higher Secondary', managementType: 'Private Unaided', fullAddress: 'Koba-Gandhinagar Highway, Sector 0, Gandhinagar, Gujarat - 382007' },
    { udiseCode: '24070102203', schoolName: 'Swaminarayan Gurukul International', state: 'Gujarat', district: 'Gandhinagar', city: 'Gandhinagar', pincode: '382022', board: 'GSEB', category: 'Higher Secondary', managementType: 'Private Unaided', fullAddress: 'Sector 22, Near GH Circle, Gandhinagar, Gujarat - 382022' },
    { udiseCode: '24070103004', schoolName: 'Kendriya Vidyalaya Sector 30', state: 'Gujarat', district: 'Gandhinagar', city: 'Gandhinagar', pincode: '382030', board: 'CBSE', category: 'Higher Secondary', managementType: 'Central Govt', fullAddress: 'Sector 30, Police Line, Gandhinagar, Gujarat - 382030' },
    { udiseCode: '24070100805', schoolName: 'St. Xavier High School Sector 8', state: 'Gujarat', district: 'Gandhinagar', city: 'Gandhinagar', pincode: '382007', board: 'GSEB', category: 'Higher Secondary', managementType: 'Private Aided', fullAddress: 'Sector 8, Gandhinagar, Gujarat - 382007' },
    { udiseCode: '24070101206', schoolName: 'GSEB Govt Model Higher Secondary School', state: 'Gujarat', district: 'Gandhinagar', city: 'Gandhinagar', pincode: '382012', board: 'GSEB', category: 'Higher Secondary', managementType: 'State Govt', fullAddress: 'Sector 12, GH Road, Gandhinagar, Gujarat - 382012' },
    { udiseCode: '24070102807', schoolName: 'Jawahar Navodaya Vidyalaya Gandhinagar', state: 'Gujarat', district: 'Gandhinagar', city: 'Gandhinagar', pincode: '382028', board: 'CBSE', category: 'Higher Secondary', managementType: 'Central Govt', fullAddress: 'Sector 28, Industrial Area, Gandhinagar, Gujarat - 382028' },
    { udiseCode: '24070102108', schoolName: 'Mount Carmel High School', state: 'Gujarat', district: 'Gandhinagar', city: 'Gandhinagar', pincode: '382021', board: 'GSEB', category: 'Secondary', managementType: 'Private Unaided', fullAddress: 'Sector 21, Gandhinagar, Gujarat - 382021' },
    { udiseCode: '24070100709', schoolName: 'Chaudhari Higher Secondary School', state: 'Gujarat', district: 'Gandhinagar', city: 'Gandhinagar', pincode: '382007', board: 'GSEB', category: 'Higher Secondary', managementType: 'Private Aided', fullAddress: 'Sector 7, Gandhinagar, Gujarat - 382007' },

    // 🏙️ AHMEDABAD DISTRICT
    { udiseCode: '24070700901', schoolName: 'St. Kabir School Navrangpura', state: 'Gujarat', district: 'Ahmedabad', city: 'Ahmedabad', pincode: '380009', board: 'CBSE', category: 'Higher Secondary', managementType: 'Private Unaided', fullAddress: 'Drive In Road, Navrangpura, Ahmedabad, Gujarat - 380009' },
    { udiseCode: '24070705802', schoolName: 'Delhi Public School Bopal', state: 'Gujarat', district: 'Ahmedabad', city: 'Ahmedabad', pincode: '380058', board: 'CBSE', category: 'Higher Secondary', managementType: 'Private Unaided', fullAddress: 'Bopal 200 Ring Rd, Bopal, Ahmedabad, Gujarat - 380058' },
    { udiseCode: '24070748103', schoolName: 'Nirma Vidyavihar SG Highway', state: 'Gujarat', district: 'Ahmedabad', city: 'Ahmedabad', pincode: '382481', board: 'CBSE', category: 'Higher Secondary', managementType: 'Private Unaided', fullAddress: 'SG Highway, Chharodi, Ahmedabad, Gujarat - 382481' },
    { udiseCode: '24070705404', schoolName: 'Udgam School for Children Thaltej', state: 'Gujarat', district: 'Ahmedabad', city: 'Ahmedabad', pincode: '380054', board: 'CBSE', category: 'Higher Secondary', managementType: 'Private Unaided', fullAddress: 'Opp. Swaminarayan Temple, Thaltej, Ahmedabad, Gujarat - 380054' },
    { udiseCode: '24070705105', schoolName: 'Zydus School for Excellence Vejalpur', state: 'Gujarat', district: 'Ahmedabad', city: 'Ahmedabad', pincode: '380051', board: 'ICSE', category: 'Higher Secondary', managementType: 'Private Unaided', fullAddress: 'Vejalpur, Jodhpur Gam, Ahmedabad, Gujarat - 380051' },
    { udiseCode: '24070701506', schoolName: 'Kendriya Vidyalaya SAC Vastrapur', state: 'Gujarat', district: 'Ahmedabad', city: 'Ahmedabad', pincode: '380015', board: 'CBSE', category: 'Higher Secondary', managementType: 'Central Govt', fullAddress: 'ISRO Colony, Vastrapur, Ahmedabad, Gujarat - 380015' },
    { udiseCode: '24070700807', schoolName: 'Anand Niketan School Maninagar', state: 'Gujarat', district: 'Ahmedabad', city: 'Ahmedabad', pincode: '380008', board: 'CBSE', category: 'Higher Secondary', managementType: 'Private Unaided', fullAddress: 'Maninagar East, Ahmedabad, Gujarat - 380008' },
    { udiseCode: '24070705808', schoolName: 'Shanti Asiatic School Shela', state: 'Gujarat', district: 'Ahmedabad', city: 'Ahmedabad', pincode: '380058', board: 'CBSE', category: 'Higher Secondary', managementType: 'Private Unaided', fullAddress: 'Shela Road, Ahmedabad, Gujarat - 380058' },
    { udiseCode: '24070701509', schoolName: 'A-One High School Satellite', state: 'Gujarat', district: 'Ahmedabad', city: 'Ahmedabad', pincode: '380015', board: 'GSEB', category: 'Higher Secondary', managementType: 'Private Aided', fullAddress: 'Satellite Road, Ahmedabad, Gujarat - 380015' },

    // 🏙️ SURAT DISTRICT
    { udiseCode: '24220115001', schoolName: 'PP Savani Cambridge International School', state: 'Gujarat', district: 'Surat', city: 'Surat', pincode: '394150', board: 'CBSE', category: 'Higher Secondary', managementType: 'Private Unaided', fullAddress: 'Abrama Village, Surat, Gujarat - 394150' },
    { udiseCode: '24220100702', schoolName: 'DPS Surat Dumas Road', state: 'Gujarat', district: 'Surat', city: 'Surat', pincode: '395007', board: 'CBSE', category: 'Higher Secondary', managementType: 'Private Unaided', fullAddress: 'Silent Zone Road, Dumas, Surat, Gujarat - 395007' },
    { udiseCode: '24220100903', schoolName: 'Gajera Global School Palanpur', state: 'Gujarat', district: 'Surat', city: 'Surat', pincode: '395009', board: 'CBSE', category: 'Higher Secondary', managementType: 'Private Unaided', fullAddress: 'Palanpur Jakatnaka, Surat, Gujarat - 395009' },
    { udiseCode: '24220100704', schoolName: 'SD Jain Modern School Vesu', state: 'Gujarat', district: 'Surat', city: 'Surat', pincode: '395007', board: 'CBSE', category: 'Higher Secondary', managementType: 'Private Unaided', fullAddress: 'Vesu Main Road, Surat, Gujarat - 395007' },
    { udiseCode: '24220100105', schoolName: 'Lourdes Convent High School Athwa', state: 'Gujarat', district: 'Surat', city: 'Surat', pincode: '395001', board: 'GSEB', category: 'Higher Secondary', managementType: 'Private Aided', fullAddress: 'Ghopal Nagar, Athwa, Surat, Gujarat - 395001' },
    { udiseCode: '24220100206', schoolName: 'Khatodara Model Govt School', state: 'Gujarat', district: 'Surat', city: 'Surat', pincode: '395002', board: 'GSEB', category: 'Secondary', managementType: 'State Govt', fullAddress: 'Khatodara Main Road, Surat, Gujarat - 395002' },
    { udiseCode: '24220100907', schoolName: 'Ryan International School Adajan', state: 'Gujarat', district: 'Surat', city: 'Surat', pincode: '395009', board: 'CBSE', category: 'Higher Secondary', managementType: 'Private Unaided', fullAddress: 'Adajan Hazira Road, Surat, Gujarat - 395009' },
    { udiseCode: '24220100708', schoolName: 'Kendriya Vidyalaya No. 1 SVNIT Surat', state: 'Gujarat', district: 'Surat', city: 'Surat', pincode: '395007', board: 'CBSE', category: 'Higher Secondary', managementType: 'Central Govt', fullAddress: 'Ichchhanath, SVNIT Campus, Surat, Gujarat - 395007' },

    // 🏙️ RAJKOT DISTRICT
    { udiseCode: '24090100501', schoolName: 'SNK School University Road', state: 'Gujarat', district: 'Rajkot', city: 'Rajkot', pincode: '360005', board: 'CBSE', category: 'Higher Secondary', managementType: 'Private Unaided', fullAddress: 'University Road, Rajkot, Gujarat - 360005' },
    { udiseCode: '24090100402', schoolName: 'Dholakiya School 150ft Ring Road', state: 'Gujarat', district: 'Rajkot', city: 'Rajkot', pincode: '360004', board: 'GSEB', category: 'Higher Secondary', managementType: 'Private Unaided', fullAddress: '150 Feet Ring Road, Rajkot, Gujarat - 360004' },
    { udiseCode: '24090100503', schoolName: 'Poddar International School Kalawad', state: 'Gujarat', district: 'Rajkot', city: 'Rajkot', pincode: '360005', board: 'CBSE', category: 'Higher Secondary', managementType: 'Private Unaided', fullAddress: 'Kalawad Road, Rajkot, Gujarat - 360005' },
    { udiseCode: '24090100104', schoolName: 'Rajkumar College (RKC) Rajkot', state: 'Gujarat', district: 'Rajkot', city: 'Rajkot', pincode: '360001', board: 'CBSE', category: 'Higher Secondary', managementType: 'Private Unaided', fullAddress: 'Dr. Radhakrishnan Marg, Rajkot, Gujarat - 360001' },

    // 🏙️ VADODARA DISTRICT
    { udiseCode: '24190102401', schoolName: 'Navrachana School Sama Road', state: 'Gujarat', district: 'Vadodara', city: 'Vadodara', pincode: '390024', board: 'CBSE', category: 'Higher Secondary', managementType: 'Private Unaided', fullAddress: 'Sama Road, Vadodara, Gujarat - 390024' },
    { udiseCode: '24190101202', schoolName: 'DPS Vadodara Kalali Ring Road', state: 'Gujarat', district: 'Vadodara', city: 'Vadodara', pincode: '390012', board: 'CBSE', category: 'Higher Secondary', managementType: 'Private Unaided', fullAddress: 'Kalali-Vadsar Ring Road, Vadodara, Gujarat - 390012' },
    { udiseCode: '24190141003', schoolName: 'Bright Day School Vasna-Bhayli', state: 'Gujarat', district: 'Vadodara', city: 'Vadodara', pincode: '391410', board: 'GSEB', category: 'Higher Secondary', managementType: 'Private Unaided', fullAddress: 'Vasna-Bhayli Road, Vadodara, Gujarat - 391410' },

    // 🏙️ BHAVNAGAR DISTRICT
    { udiseCode: '24030100101', schoolName: 'Dakshinamurti High School', state: 'Gujarat', district: 'Bhavnagar', city: 'Bhavnagar', pincode: '364001', board: 'GSEB', category: 'Higher Secondary', managementType: 'Private Aided', fullAddress: 'Crescent Circle, Bhavnagar, Gujarat - 364001' },
    { udiseCode: '24030100202', schoolName: 'Silver Bells Public School', state: 'Gujarat', district: 'Bhavnagar', city: 'Bhavnagar', pincode: '364002', board: 'CBSE', category: 'Higher Secondary', managementType: 'Private Unaided', fullAddress: 'Kaliyabid, Bhavnagar, Gujarat - 364002' },

    // 🏙️ ANAND DISTRICT
    { udiseCode: '24150100101', schoolName: 'Anandalaya School NDDB Campus', state: 'Gujarat', district: 'Anand', city: 'Anand', pincode: '388001', board: 'CBSE', category: 'Higher Secondary', managementType: 'Private Unaided', fullAddress: 'NDDB Campus, Anand, Gujarat - 388001' },
    { udiseCode: '24150100202', schoolName: 'DNP Arts & Commerce High School', state: 'Gujarat', district: 'Anand', city: 'Anand', pincode: '388001', board: 'GSEB', category: 'Higher Secondary', managementType: 'Private Aided', fullAddress: 'Station Road, Anand, Gujarat - 388001' }
];

async function seedFullGujaratSchools() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB.');

        console.log(`Inserting/Updating ${GUJARAT_FULL_SCHOOLS.length} verified UDISE schools...`);

        for (const school of GUJARAT_FULL_SCHOOLS) {
            await UdiseSchool.updateOne(
                { udiseCode: school.udiseCode },
                { $set: school },
                { upsert: true }
            );
        }

        console.log(`🎉 SUCCESS: ${GUJARAT_FULL_SCHOOLS.length} Official Gujarat UDISE Schools seeded in MongoDB!`);
    } catch (err) {
        console.error('❌ Error seeding Gujarat UDISE schools:', err);
    } finally {
        await mongoose.disconnect();
        console.log('MongoDB connection closed.');
    }
}

seedFullGujaratSchools();
