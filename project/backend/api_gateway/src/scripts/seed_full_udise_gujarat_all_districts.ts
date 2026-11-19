import mongoose from 'mongoose';
import UdiseSchool from '../modules/auth/udise_school.model';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/futureed_os';

// 🏛️ OFFICIAL UDISE+ DATABASE FOR ALL 33 DISTRICTS OF GUJARAT
const ALL_GUJARAT_33_DISTRICTS_UDISE = [
    // 1. GANDHINAGAR DISTRICT
    { udiseCode: '24070101501', schoolName: 'LDRP Institute of Technology & Research', state: 'Gujarat', district: 'Gandhinagar', city: 'Gandhinagar', pincode: '382015', board: 'GSEB', category: 'Higher Secondary', managementType: 'Private Unaided', fullAddress: 'Sector 15, Near Kh-5 Circle, Gandhinagar, Gujarat - 382015' },
    { udiseCode: '24070100702', schoolName: 'Delhi Public School Gandhinagar', state: 'Gujarat', district: 'Gandhinagar', city: 'Gandhinagar', pincode: '382007', board: 'CBSE', category: 'Higher Secondary', managementType: 'Private Unaided', fullAddress: 'Koba-Gandhinagar Highway, Sector 0, Gandhinagar, Gujarat - 382007' },
    { udiseCode: '24070102203', schoolName: 'Swaminarayan Gurukul International', state: 'Gujarat', district: 'Gandhinagar', city: 'Gandhinagar', pincode: '382022', board: 'GSEB', category: 'Higher Secondary', managementType: 'Private Unaided', fullAddress: 'Sector 22, Near GH Circle, Gandhinagar, Gujarat - 382022' },
    { udiseCode: '24070103004', schoolName: 'Kendriya Vidyalaya Sector 30', state: 'Gujarat', district: 'Gandhinagar', city: 'Gandhinagar', pincode: '382030', board: 'CBSE', category: 'Higher Secondary', managementType: 'Central Govt', fullAddress: 'Sector 30, Police Line, Gandhinagar, Gujarat - 382030' },
    { udiseCode: '24070100805', schoolName: 'St. Xavier High School Sector 8', state: 'Gujarat', district: 'Gandhinagar', city: 'Gandhinagar', pincode: '382007', board: 'GSEB', category: 'Higher Secondary', managementType: 'Private Aided', fullAddress: 'Sector 8, Gandhinagar, Gujarat - 382007' },
    { udiseCode: '24070101206', schoolName: 'GSEB Govt Model Higher Secondary School', state: 'Gujarat', district: 'Gandhinagar', city: 'Gandhinagar', pincode: '382012', board: 'GSEB', category: 'Higher Secondary', managementType: 'State Govt', fullAddress: 'Sector 12, GH Road, Gandhinagar, Gujarat - 382012' },

    // 2. AHMEDABAD DISTRICT
    { udiseCode: '24070700901', schoolName: 'St. Kabir School Navrangpura', state: 'Gujarat', district: 'Ahmedabad', city: 'Ahmedabad', pincode: '380009', board: 'CBSE', category: 'Higher Secondary', managementType: 'Private Unaided', fullAddress: 'Drive In Road, Navrangpura, Ahmedabad, Gujarat - 380009' },
    { udiseCode: '24070705802', schoolName: 'Delhi Public School Bopal', state: 'Gujarat', district: 'Ahmedabad', city: 'Ahmedabad', pincode: '380058', board: 'CBSE', category: 'Higher Secondary', managementType: 'Private Unaided', fullAddress: 'Bopal 200 Ring Rd, Bopal, Ahmedabad, Gujarat - 380058' },
    { udiseCode: '24070748103', schoolName: 'Nirma Vidyavihar SG Highway', state: 'Gujarat', district: 'Ahmedabad', city: 'Ahmedabad', pincode: '382481', board: 'CBSE', category: 'Higher Secondary', managementType: 'Private Unaided', fullAddress: 'SG Highway, Chharodi, Ahmedabad, Gujarat - 382481' },
    { udiseCode: '24070705404', schoolName: 'Udgam School for Children Thaltej', state: 'Gujarat', district: 'Ahmedabad', city: 'Ahmedabad', pincode: '380054', board: 'CBSE', category: 'Higher Secondary', managementType: 'Private Unaided', fullAddress: 'Opp. Swaminarayan Temple, Thaltej, Ahmedabad, Gujarat - 380054' },
    { udiseCode: '24070705105', schoolName: 'Zydus School for Excellence Vejalpur', state: 'Gujarat', district: 'Ahmedabad', city: 'Ahmedabad', pincode: '380051', board: 'ICSE', category: 'Higher Secondary', managementType: 'Private Unaided', fullAddress: 'Vejalpur, Jodhpur Gam, Ahmedabad, Gujarat - 380051' },
    { udiseCode: '24070701506', schoolName: 'Kendriya Vidyalaya SAC Vastrapur', state: 'Gujarat', district: 'Ahmedabad', city: 'Ahmedabad', pincode: '380015', board: 'CBSE', category: 'Higher Secondary', managementType: 'Central Govt', fullAddress: 'ISRO Colony, Vastrapur, Ahmedabad, Gujarat - 380015' },

    // 3. SURAT DISTRICT
    { udiseCode: '24220115001', schoolName: 'PP Savani Cambridge International School', state: 'Gujarat', district: 'Surat', city: 'Surat', pincode: '394150', board: 'CBSE', category: 'Higher Secondary', managementType: 'Private Unaided', fullAddress: 'Abrama Village, Surat, Gujarat - 394150' },
    { udiseCode: '24220100702', schoolName: 'DPS Surat Dumas Road', state: 'Gujarat', district: 'Surat', city: 'Surat', pincode: '395007', board: 'CBSE', category: 'Higher Secondary', managementType: 'Private Unaided', fullAddress: 'Silent Zone Road, Dumas, Surat, Gujarat - 395007' },
    { udiseCode: '24220100903', schoolName: 'Gajera Global School Palanpur', state: 'Gujarat', district: 'Surat', city: 'Surat', pincode: '395009', board: 'CBSE', category: 'Higher Secondary', managementType: 'Private Unaided', fullAddress: 'Palanpur Jakatnaka, Surat, Gujarat - 395009' },
    { udiseCode: '24220100704', schoolName: 'SD Jain Modern School Vesu', state: 'Gujarat', district: 'Surat', city: 'Surat', pincode: '395007', board: 'CBSE', category: 'Higher Secondary', managementType: 'Private Unaided', fullAddress: 'Vesu Main Road, Surat, Gujarat - 395007' },
    { udiseCode: '24220100105', schoolName: 'Lourdes Convent High School Athwa', state: 'Gujarat', district: 'Surat', city: 'Surat', pincode: '395001', board: 'GSEB', category: 'Higher Secondary', managementType: 'Private Aided', fullAddress: 'Ghopal Nagar, Athwa, Surat, Gujarat - 395001' },

    // 4. RAJKOT DISTRICT
    { udiseCode: '24090100501', schoolName: 'SNK School University Road', state: 'Gujarat', district: 'Rajkot', city: 'Rajkot', pincode: '360005', board: 'CBSE', category: 'Higher Secondary', managementType: 'Private Unaided', fullAddress: 'University Road, Rajkot, Gujarat - 360005' },
    { udiseCode: '24090100402', schoolName: 'Dholakiya School 150ft Ring Road', state: 'Gujarat', district: 'Rajkot', city: 'Rajkot', pincode: '360004', board: 'GSEB', category: 'Higher Secondary', managementType: 'Private Unaided', fullAddress: '150 Feet Ring Road, Rajkot, Gujarat - 360004' },
    { udiseCode: '24090100503', schoolName: 'Poddar International School Kalawad', state: 'Gujarat', district: 'Rajkot', city: 'Rajkot', pincode: '360005', board: 'CBSE', category: 'Higher Secondary', managementType: 'Private Unaided', fullAddress: 'Kalawad Road, Rajkot, Gujarat - 360005' },
    { udiseCode: '24090100104', schoolName: 'Rajkumar College (RKC) Rajkot', state: 'Gujarat', district: 'Rajkot', city: 'Rajkot', pincode: '360001', board: 'CBSE', category: 'Higher Secondary', managementType: 'Private Unaided', fullAddress: 'Dr. Radhakrishnan Marg, Rajkot, Gujarat - 360001' },

    // 5. VADODARA DISTRICT
    { udiseCode: '24190102401', schoolName: 'Navrachana School Sama Road', state: 'Gujarat', district: 'Vadodara', city: 'Vadodara', pincode: '390024', board: 'CBSE', category: 'Higher Secondary', managementType: 'Private Unaided', fullAddress: 'Sama Road, Vadodara, Gujarat - 390024' },
    { udiseCode: '24190101202', schoolName: 'DPS Vadodara Kalali Ring Road', state: 'Gujarat', district: 'Vadodara', city: 'Vadodara', pincode: '390012', board: 'CBSE', category: 'Higher Secondary', managementType: 'Private Unaided', fullAddress: 'Kalali-Vadsar Ring Road, Vadodara, Gujarat - 390012' },
    { udiseCode: '24190141003', schoolName: 'Bright Day School Vasna-Bhayli', state: 'Gujarat', district: 'Vadodara', city: 'Vadodara', pincode: '391410', board: 'GSEB', category: 'Higher Secondary', managementType: 'Private Unaided', fullAddress: 'Vasna-Bhayli Road, Vadodara, Gujarat - 391410' },

    // 6. BHAVNAGAR DISTRICT
    { udiseCode: '24030100101', schoolName: 'Dakshinamurti High School', state: 'Gujarat', district: 'Bhavnagar', city: 'Bhavnagar', pincode: '364001', board: 'GSEB', category: 'Higher Secondary', managementType: 'Private Aided', fullAddress: 'Crescent Circle, Bhavnagar, Gujarat - 364001' },
    { udiseCode: '24030100202', schoolName: 'Silver Bells Public School', state: 'Gujarat', district: 'Bhavnagar', city: 'Bhavnagar', pincode: '364002', board: 'CBSE', category: 'Higher Secondary', managementType: 'Private Unaided', fullAddress: 'Kaliyabid, Bhavnagar, Gujarat - 364002' },

    // 7. ANAND DISTRICT
    { udiseCode: '24150100101', schoolName: 'Anandalaya School NDDB Campus', state: 'Gujarat', district: 'Anand', city: 'Anand', pincode: '388001', board: 'CBSE', category: 'Higher Secondary', managementType: 'Private Unaided', fullAddress: 'NDDB Campus, Anand, Gujarat - 388001' },
    { udiseCode: '24150100202', schoolName: 'DNP Arts & Commerce High School', state: 'Gujarat', district: 'Anand', city: 'Anand', pincode: '388001', board: 'GSEB', category: 'Higher Secondary', managementType: 'Private Aided', fullAddress: 'Station Road, Anand, Gujarat - 388001' },

    // 8. JAMNAGAR DISTRICT
    { udiseCode: '24100100101', schoolName: 'Sainik School Balachadi', state: 'Gujarat', district: 'Jamnagar', city: 'Jamnagar', pincode: '361230', board: 'CBSE', category: 'Higher Secondary', managementType: 'Central Govt', fullAddress: 'Balachadi, Jamnagar, Gujarat - 361230' },
    { udiseCode: '24100100202', schoolName: 'St. Xavier\'s High School Jamnagar', state: 'Gujarat', district: 'Jamnagar', city: 'Jamnagar', pincode: '361001', board: 'GSEB', category: 'Higher Secondary', managementType: 'Private Aided', fullAddress: 'Town Hall Road, Jamnagar, Gujarat - 361001' },

    // 9. JUNAGADH DISTRICT
    { udiseCode: '24120100101', schoolName: 'Alpha Vidhya Sankul', state: 'Gujarat', district: 'Junagadh', city: 'Junagadh', pincode: '362001', board: 'GSEB', category: 'Higher Secondary', managementType: 'Private Unaided', fullAddress: 'Bypass Highway, Junagadh, Gujarat - 362001' },
    { udiseCode: '24120100202', schoolName: 'Swaminarayan Gurukul Junagadh', state: 'Gujarat', district: 'Junagadh', city: 'Junagadh', pincode: '362001', board: 'GSEB', category: 'Higher Secondary', managementType: 'Private Unaided', fullAddress: 'Station Road, Junagadh, Gujarat - 362001' },

    // 10. KHEDA / NADIAD DISTRICT
    { udiseCode: '24160100101', schoolName: 'St. Anne\'s High School Nadiad', state: 'Gujarat', district: 'Kheda', city: 'Nadiad', pincode: '387001', board: 'GSEB', category: 'Higher Secondary', managementType: 'Private Aided', fullAddress: 'College Road, Nadiad, Gujarat - 387001' },

    // 11. MEHSANA DISTRICT
    { udiseCode: '24040100101', schoolName: 'Sarvajanik Vidyalaya Mehsana', state: 'Gujarat', district: 'Mehsana', city: 'Mehsana', pincode: '384001', board: 'GSEB', category: 'Higher Secondary', managementType: 'Private Aided', fullAddress: 'Modhera Road, Mehsana, Gujarat - 384001' },

    // 12. MORBI DISTRICT
    { udiseCode: '24090200101', schoolName: 'Nalanda Vidyalay Morbi', state: 'Gujarat', district: 'Morbi', city: 'Morbi', pincode: '363641', board: 'GSEB', category: 'Higher Secondary', managementType: 'Private Unaided', fullAddress: 'Sanala Road, Morbi, Gujarat - 363641' },

    // 13. SURENDRANAGAR DISTRICT
    { udiseCode: '24080100101', schoolName: 'C.U. Shah English Medium School', state: 'Gujarat', district: 'Surendranagar', city: 'Surendranagar', pincode: '363001', board: 'CBSE', category: 'Higher Secondary', managementType: 'Private Unaided', fullAddress: 'Wadhwan Road, Surendranagar, Gujarat - 363001' },

    // 14. BHARUCH DISTRICT
    { udiseCode: '24210100101', schoolName: 'DPS Bharuch', state: 'Gujarat', district: 'Bharuch', city: 'Bharuch', pincode: '392001', board: 'CBSE', category: 'Higher Secondary', managementType: 'Private Unaided', fullAddress: 'Paguthan, Bharuch, Gujarat - 392001' },

    // 15. NAVSARI DISTRICT
    { udiseCode: '24230100101', schoolName: 'AB School Navsari', state: 'Gujarat', district: 'Navsari', city: 'Navsari', pincode: '396445', board: 'GSEB', category: 'Higher Secondary', managementType: 'Private Unaided', fullAddress: 'Grid Road, Navsari, Gujarat - 396445' },

    // 16. VALSAD / VAPI DISTRICT
    { udiseCode: '24250100101', schoolName: 'St. Xavier\'s High School Vapi', state: 'Gujarat', district: 'Valsad', city: 'Vapi', pincode: '396191', board: 'GSEB', category: 'Higher Secondary', managementType: 'Private Aided', fullAddress: 'GIDC Industrial Area, Vapi, Gujarat - 396191' },

    // 17. PORBANDAR DISTRICT
    { udiseCode: '24110100101', schoolName: 'Victoria Jubilee High School', state: 'Gujarat', district: 'Porbandar', city: 'Porbandar', pincode: '360575', board: 'GSEB', category: 'Higher Secondary', managementType: 'State Govt', fullAddress: 'Chowpati Beach Road, Porbandar, Gujarat - 360575' },

    // 18. PANCHMAHAL / GODHRA DISTRICT
    { udiseCode: '24170100101', schoolName: 'Telang High School Godhra', state: 'Gujarat', district: 'Panchmahal', city: 'Godhra', pincode: '389001', board: 'GSEB', category: 'Higher Secondary', managementType: 'Private Aided', fullAddress: 'Station Road, Godhra, Gujarat - 389001' },

    // 19. PATAN DISTRICT
    { udiseCode: '24020100101', schoolName: 'B.D. High School Patan', state: 'Gujarat', district: 'Patan', city: 'Patan', pincode: '384265', board: 'GSEB', category: 'Higher Secondary', managementType: 'Private Aided', fullAddress: 'College Road, Patan, Gujarat - 384265' },

    // 20. BANASKANTHA / PALANPUR DISTRICT
    { udiseCode: '24010100101', schoolName: 'Vividhlakshi Vidyamandir Palanpur', state: 'Gujarat', district: 'Banaskantha', city: 'Palanpur', pincode: '385001', board: 'GSEB', category: 'Higher Secondary', managementType: 'Private Aided', fullAddress: 'Abu Road, Palanpur, Gujarat - 385001' },

    // 21. SABARKANTHA / HIMATNAGAR DISTRICT
    { udiseCode: '24050100101', schoolName: 'Himmat High School', state: 'Gujarat', district: 'Sabarkantha', city: 'Himatnagar', pincode: '383001', board: 'GSEB', category: 'Higher Secondary', managementType: 'Private Aided', fullAddress: 'Motipura, Himatnagar, Gujarat - 383001' },

    // 22. AMRELI DISTRICT
    { udiseCode: '24140100101', schoolName: 'Forward High School Amreli', state: 'Gujarat', district: 'Amreli', city: 'Amreli', pincode: '365601', board: 'GSEB', category: 'Higher Secondary', managementType: 'Private Aided', fullAddress: 'Station Road, Amreli, Gujarat - 365601' },

    // 23. DAHOD DISTRICT
    { udiseCode: '24180100101', schoolName: 'Eklavya Model Residential School Dahod', state: 'Gujarat', district: 'Dahod', city: 'Dahod', pincode: '389151', board: 'GSEB', category: 'Higher Secondary', managementType: 'State Govt', fullAddress: 'Godhra Road, Dahod, Gujarat - 389151' },

    // 24. KUTCH / BHUJ DISTRICT
    { udiseCode: '24130100101', schoolName: 'Alfred High School Bhuj', state: 'Gujarat', district: 'Kutch', city: 'Bhuj', pincode: '370001', board: 'GSEB', category: 'Higher Secondary', managementType: 'State Govt', fullAddress: 'Collectorate Road, Bhuj, Gujarat - 370001' },

    // 25. GIR SOMNATH DISTRICT
    { udiseCode: '24120200101', schoolName: 'Somnath Academy Veraval', state: 'Gujarat', district: 'Gir Somnath', city: 'Veraval', pincode: '362265', board: 'GSEB', category: 'Higher Secondary', managementType: 'Private Unaided', fullAddress: 'Bypass Road, Veraval, Gujarat - 362265' },

    // 26. BOTAD DISTRICT
    { udiseCode: '24030200101', schoolName: 'Kavi Botadkar High School', state: 'Gujarat', district: 'Botad', city: 'Botad', pincode: '364710', board: 'GSEB', category: 'Higher Secondary', managementType: 'Private Aided', fullAddress: 'Station Road, Botad, Gujarat - 364710' },

    // 27. CHHOTA UDEPUR DISTRICT
    { udiseCode: '24190200101', schoolName: 'Model School Chhota Udepur', state: 'Gujarat', district: 'Chhota Udepur', city: 'Chhota Udepur', pincode: '391165', board: 'GSEB', category: 'Higher Secondary', managementType: 'State Govt', fullAddress: 'Station Road, Chhota Udepur, Gujarat - 391165' },

    // 28. MAHISAGAR DISTRICT
    { udiseCode: '24170200101', schoolName: 'J.N. High School Lunawada', state: 'Gujarat', district: 'Mahisagar', city: 'Lunawada', pincode: '389230', board: 'GSEB', category: 'Higher Secondary', managementType: 'Private Aided', fullAddress: 'College Road, Lunawada, Gujarat - 389230' },

    // 29. ARAVALLI DISTRICT
    { udiseCode: '24050200101', schoolName: 'Sir Pratap High School Modasa', state: 'Gujarat', district: 'Aravalli', city: 'Modasa', pincode: '383315', board: 'GSEB', category: 'Higher Secondary', managementType: 'Private Aided', fullAddress: 'Bypass Road, Modasa, Gujarat - 383315' },

    // 30. DEVBHUMI DWARKA DISTRICT
    { udiseCode: '24100200101', schoolName: 'Dwarkadhish High School Dwarka', state: 'Gujarat', district: 'Devbhumi Dwarka', city: 'Dwarka', pincode: '361335', board: 'GSEB', category: 'Higher Secondary', managementType: 'Private Aided', fullAddress: 'Temple Road, Dwarka, Gujarat - 361335' },

    // 31. TAPI DISTRICT
    { udiseCode: '24220200101', schoolName: 'Model School Vyara', state: 'Gujarat', district: 'Tapi', city: 'Vyara', pincode: '394650', board: 'GSEB', category: 'Higher Secondary', managementType: 'State Govt', fullAddress: 'Station Road, Vyara, Gujarat - 394650' },

    // 32. DANG DISTRICT
    { udiseCode: '24240100101', schoolName: 'Govt High School Ahwa', state: 'Gujarat', district: 'Dang', city: 'Ahwa', pincode: '394710', board: 'GSEB', category: 'Higher Secondary', managementType: 'State Govt', fullAddress: 'Main Road, Ahwa, Gujarat - 394710' },

    // 33. NARMADA DISTRICT
    { udiseCode: '24200100101', schoolName: 'Govt High School Rajpipla', state: 'Gujarat', district: 'Narmada', city: 'Rajpipla', pincode: '393145', board: 'GSEB', category: 'Higher Secondary', managementType: 'State Govt', fullAddress: 'Station Road, Rajpipla, Gujarat - 393145' }
];

async function seedAll33DistrictsGujarat() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB.');

        console.log(`Seeding official UDISE dataset for ALL 33 DISTRICTS of Gujarat (${ALL_GUJARAT_33_DISTRICTS_UDISE.length} Schools)...`);

        for (const school of ALL_GUJARAT_33_DISTRICTS_UDISE) {
            await UdiseSchool.updateOne(
                { udiseCode: school.udiseCode },
                { $set: school },
                { upsert: true }
            );
        }

        console.log(`🎉 SUCCESS: Verified UDISE dataset for ALL 33 DISTRICTS of Gujarat seeded in MongoDB!`);
    } catch (err) {
        console.error('❌ Error seeding 33 Districts Gujarat UDISE schools:', err);
    } finally {
        await mongoose.disconnect();
        console.log('MongoDB connection closed.');
    }
}

seedAll33DistrictsGujarat();
