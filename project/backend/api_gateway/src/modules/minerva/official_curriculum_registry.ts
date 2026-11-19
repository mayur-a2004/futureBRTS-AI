// Official Curriculum Source Registry — Tier 1 & Tier 2 Government Authority Sources
export interface IOfficialBoardSource {
    name: string;
    boardKey: string;
    officialWebsite: string;
    textbooksUrl: string;
    syllabusUrl: string;
    learningOutcomesUrl?: string;
    dikshaSupport: boolean;
    ePathshalaSupport: boolean;
}

export const TIER_1_NATIONAL_BOARDS: Record<string, IOfficialBoardSource> = {
    ncert: {
        name: 'National Council of Educational Research and Training (NCERT)',
        boardKey: 'ncert',
        officialWebsite: 'https://ncert.ncert.org.in',
        textbooksUrl: 'https://ncert.ncert.org.in/textbook.php',
        syllabusUrl: 'https://ncert.ncert.org.in/syllabus.php',
        learningOutcomesUrl: 'https://ncert.ncert.org.in/learning-outcomes.php',
        dikshaSupport: true,
        ePathshalaSupport: true,
    },
    ncert_books: {
        name: 'NCERT Books Portal',
        boardKey: 'ncert_books',
        officialWebsite: 'https://ncertbooks.ncert.gov.in',
        textbooksUrl: 'https://ncertbooks.ncert.gov.in',
        syllabusUrl: 'https://ncertbooks.ncert.gov.in',
        learningOutcomesUrl: 'https://ncertbooks.ncert.gov.in',
        dikshaSupport: true,
        ePathshalaSupport: true,
    },
    epathshala: {
        name: 'ePathshala Portal (Ministry of Education)',
        boardKey: 'epathshala',
        officialWebsite: 'https://epathshala.nic.in',
        textbooksUrl: 'https://epathshala.nic.in/process.php?id=students&type=eTextbooks',
        syllabusUrl: 'https://epathshala.nic.in',
        learningOutcomesUrl: 'https://epathshala.nic.in',
        dikshaSupport: true,
        ePathshalaSupport: true,
    },
    diksha: {
        name: 'DIKSHA - National Digital Infrastructure for Teachers & Students',
        boardKey: 'diksha',
        officialWebsite: 'https://diksha.gov.in',
        textbooksUrl: 'https://diksha.gov.in/explore',
        syllabusUrl: 'https://diksha.gov.in',
        learningOutcomesUrl: 'https://diksha.gov.in',
        dikshaSupport: true,
        ePathshalaSupport: true,
    },
    cbse: {
        name: 'Central Board of Secondary Education (CBSE Academic)',
        boardKey: 'cbse',
        officialWebsite: 'https://cbseacademic.nic.in',
        textbooksUrl: 'https://ncert.ncert.org.in/textbook.php',
        syllabusUrl: 'https://cbseacademic.nic.in/curriculum_2024.html',
        learningOutcomesUrl: 'https://cbseacademic.nic.in/lo.html',
        dikshaSupport: true,
        ePathshalaSupport: true,
    },
    nios: {
        name: 'National Institute of Open Schooling (NIOS)',
        boardKey: 'nios',
        officialWebsite: 'https://nios.ac.in',
        textbooksUrl: 'https://nios.ac.in/online-course-material.aspx',
        syllabusUrl: 'https://nios.ac.in/student-information-section.aspx',
        dikshaSupport: true,
        ePathshalaSupport: true,
    },
    cisce: {
        name: 'Council for the Indian School Certificate Examinations (CISCE)',
        boardKey: 'cisce',
        officialWebsite: 'https://cisce.org',
        textbooksUrl: 'https://cisce.org/publications/',
        syllabusUrl: 'https://cisce.org/regulations-and-syllabuses-2025/',
        dikshaSupport: false,
        ePathshalaSupport: false,
    }
};

export const TIER_2_STATE_BOARDS: Record<string, IOfficialBoardSource> = {
    gseb: {
        name: 'Gujarat Council of Educational Research and Training (GCERT) / GSEB',
        boardKey: 'gseb',
        officialWebsite: 'https://gcert.gujarat.gov.in',
        textbooksUrl: 'https://gsstb.gujarat.gov.in',
        syllabusUrl: 'https://gseb.org',
        learningOutcomesUrl: 'https://gcert.gujarat.gov.in/lo',
        dikshaSupport: true,
        ePathshalaSupport: true,
    },
    maharashtra: {
        name: 'Maharashtra State Bureau of Textbook Production (Balbharati) / MSBSHSE',
        boardKey: 'maharashtra',
        officialWebsite: 'https://balbharati.in',
        textbooksUrl: 'https://ebalbharati.in',
        syllabusUrl: 'https://mahahsscboard.in',
        dikshaSupport: true,
        ePathshalaSupport: true,
    },
    up: {
        name: 'State Council of Educational Research and Training Uttar Pradesh (SCERT UP)',
        boardKey: 'up',
        officialWebsite: 'https://scertup.org.in',
        textbooksUrl: 'https://scertup.org.in/textbooks',
        syllabusUrl: 'https://upmsp.edu.in',
        dikshaSupport: true,
        ePathshalaSupport: true,
    },
    mp: {
        name: 'Madhya Pradesh State Council of Educational Research and Training (SCERT MP)',
        boardKey: 'mp',
        officialWebsite: 'https://scert.mp.gov.in',
        textbooksUrl: 'http://mpsb.mp.gov.in',
        syllabusUrl: 'https://mpbse.nic.in',
        dikshaSupport: true,
        ePathshalaSupport: true,
    },
    rajasthan: {
        name: 'Rajasthan Council of School Education / BSER',
        boardKey: 'rajasthan',
        officialWebsite: 'https://education.rajasthan.gov.in',
        textbooksUrl: 'https://rajeduboard.rajasthan.gov.in/textbook.htm',
        syllabusUrl: 'https://rajeduboard.rajasthan.gov.in',
        dikshaSupport: true,
        ePathshalaSupport: true,
    },
    karnataka: {
        name: 'Karnataka School Examination and Assessment Board (KSEAB)',
        boardKey: 'karnataka',
        officialWebsite: 'https://kseab.karnataka.gov.in',
        textbooksUrl: 'https://ktbs.kar.nic.in',
        syllabusUrl: 'https://kseab.karnataka.gov.in',
        dikshaSupport: true,
        ePathshalaSupport: true,
    },
    tamilnadu: {
        name: 'State Council of Educational Research and Training Tamil Nadu (TNSCERT)',
        boardKey: 'tamilnadu',
        officialWebsite: 'https://tnscert.org',
        textbooksUrl: 'https://textbookcorp.tn.gov.in',
        syllabusUrl: 'https://dge.tn.gov.in',
        dikshaSupport: true,
        ePathshalaSupport: true,
    },
    telangana: {
        name: 'State Council of Educational Research and Training Telangana (SCERT Telangana)',
        boardKey: 'telangana',
        officialWebsite: 'https://scert.telangana.gov.in',
        textbooksUrl: 'https://scert.telangana.gov.in/textbooks.jsp',
        syllabusUrl: 'https://bse.telangana.gov.in',
        dikshaSupport: true,
        ePathshalaSupport: true,
    },
    andhra: {
        name: 'State Council of Educational Research and Training Andhra Pradesh (APSCERT)',
        boardKey: 'andhra',
        officialWebsite: 'https://apscert.gov.in',
        textbooksUrl: 'https://apscert.gov.in/textbooks',
        syllabusUrl: 'https://bse.ap.gov.in',
        dikshaSupport: true,
        ePathshalaSupport: true,
    },
    westbengal: {
        name: 'West Bengal State Council of Higher Secondary Education & SCERT',
        boardKey: 'westbengal',
        officialWebsite: 'https://scertwb.org',
        textbooksUrl: 'https://wbchse.wb.gov.in',
        syllabusUrl: 'https://wbbse.wb.gov.in',
        dikshaSupport: true,
        ePathshalaSupport: true,
    },
    bihar: {
        name: 'State Council of Educational Research and Training Bihar (SCERT Bihar)',
        boardKey: 'bihar',
        officialWebsite: 'https://scert.bihar.gov.in',
        textbooksUrl: 'https://bstbpc.gov.in',
        syllabusUrl: 'https://biharboardonline.bihar.gov.in',
        dikshaSupport: true,
        ePathshalaSupport: true,
    },
    kerala: {
        name: 'State Council of Educational Research and Training Kerala (SCERT Kerala)',
        boardKey: 'kerala',
        officialWebsite: 'https://scert.kerala.gov.in',
        textbooksUrl: 'https://samagra.kite.kerala.gov.in',
        syllabusUrl: 'https://pareekshabhavan.kerala.gov.in',
        dikshaSupport: true,
        ePathshalaSupport: true,
    },
    punjab: {
        name: 'State Council of Educational Research and Training Punjab (SCERT Punjab)',
        boardKey: 'punjab',
        officialWebsite: 'https://scert.epunjabschool.gov.in',
        textbooksUrl: 'https://pseb.ac.in/textbooks',
        syllabusUrl: 'https://pseb.ac.in',
        dikshaSupport: true,
        ePathshalaSupport: true,
    },
    haryana: {
        name: 'State Council of Educational Research and Training Haryana (SCERT Haryana)',
        boardKey: 'haryana',
        officialWebsite: 'https://scertharyana.gov.in',
        textbooksUrl: 'https://bseh.org.in',
        syllabusUrl: 'https://bseh.org.in',
        dikshaSupport: true,
        ePathshalaSupport: true,
    },
    himachal: {
        name: 'State Council of Educational Research and Training Himachal Pradesh (SCERT HP)',
        boardKey: 'himachal',
        officialWebsite: 'https://scerthp.hp.gov.in',
        textbooksUrl: 'https://hpbose.org',
        syllabusUrl: 'https://hpbose.org',
        dikshaSupport: true,
        ePathshalaSupport: true,
    },
    chhattisgarh: {
        name: 'State Council of Educational Research and Training Chhattisgarh (SCERT CG)',
        boardKey: 'chhattisgarh',
        officialWebsite: 'https://scert.cg.gov.in',
        textbooksUrl: 'https://cgbse.nic.in',
        syllabusUrl: 'https://cgbse.nic.in',
        dikshaSupport: true,
        ePathshalaSupport: true,
    },
    odisha: {
        name: 'State Council of Educational Research and Training Odisha (SCERT Odisha)',
        boardKey: 'odisha',
        officialWebsite: 'https://scert.samsodisha.gov.in',
        textbooksUrl: 'https://bseodisha.ac.in',
        syllabusUrl: 'https://chseodisha.nic.in',
        dikshaSupport: true,
        ePathshalaSupport: true,
    },
    assam: {
        name: 'State Council of Educational Research and Training Assam (SCERT Assam)',
        boardKey: 'assam',
        officialWebsite: 'https://scert.assam.gov.in',
        textbooksUrl: 'https://sebaonline.org',
        syllabusUrl: 'https://ahsec.assam.gov.in',
        dikshaSupport: true,
        ePathshalaSupport: true,
    },
    jharkhand: {
        name: 'Jharkhand Council of Educational Research and Training (JCERT)',
        boardKey: 'jharkhand',
        officialWebsite: 'https://jcert.jharkhand.gov.in',
        textbooksUrl: 'https://jac.jharkhand.gov.in',
        syllabusUrl: 'https://jac.jharkhand.gov.in',
        dikshaSupport: true,
        ePathshalaSupport: true,
    },
    uttarakhand: {
        name: 'State Council of Educational Research and Training Uttarakhand (SCERT UK)',
        boardKey: 'uttarakhand',
        officialWebsite: 'https://scert.uk.gov.in',
        textbooksUrl: 'https://ubse.uk.gov.in',
        syllabusUrl: 'https://ubse.uk.gov.in',
        dikshaSupport: true,
        ePathshalaSupport: true,
    },
    delhi: {
        name: 'State Council of Educational Research and Training Delhi (SCERT Delhi)',
        boardKey: 'delhi',
        officialWebsite: 'https://scert.delhi.gov.in',
        textbooksUrl: 'https://edudel.nic.in',
        syllabusUrl: 'https://edudel.nic.in',
        dikshaSupport: true,
        ePathshalaSupport: true,
    },
    goa: {
        name: 'State Council of Educational Research and Training Goa (SCERT Goa)',
        boardKey: 'goa',
        officialWebsite: 'https://scert.goa.gov.in',
        textbooksUrl: 'https://gbshse.in',
        syllabusUrl: 'https://gbshse.in',
        dikshaSupport: true,
        ePathshalaSupport: true,
    },
    jammu_kashmir: {
        name: 'Jammu and Kashmir Board of School Education (JKBOSE)',
        boardKey: 'jammu_kashmir',
        officialWebsite: 'https://jkbose.nic.in',
        textbooksUrl: 'https://jkbose.nic.in/textbooks.html',
        syllabusUrl: 'https://jkbose.nic.in/syllabus.html',
        dikshaSupport: true,
        ePathshalaSupport: true,
    }
};

export const ALLOWED_SOURCES = [
    'ncert.ncert.org.in',
    'ncertbooks.ncert.gov.in',
    'epathshala.nic.in',
    'diksha.gov.in',
    'cbseacademic.nic.in',
    'nios.ac.in',
    'cisce.org',
    'gcert.gujarat.gov.in',
    'gsstb.gujarat.gov.in',
    'gseb.org',
    'balbharati.in',
    'ebalbharati.in',
    'scertup.org.in',
    'scert.mp.gov.in',
    'rajeduboard.rajasthan.gov.in',
    'kseab.karnataka.gov.in',
    'tnscert.org',
    'scert.telangana.gov.in',
    'apscert.gov.in',
    'scertwb.org',
    'scert.bihar.gov.in',
    'scert.kerala.gov.in',
    'scert.epunjabschool.gov.in',
    'scertharyana.gov.in',
    'scerthp.hp.gov.in',
    'scert.cg.gov.in',
    'scert.samsodisha.gov.in',
    'scert.assam.gov.in',
    'jcert.jharkhand.gov.in',
    'scert.uk.gov.in',
    'scert.delhi.gov.in',
    'scert.goa.gov.in',
    'jkbose.nic.in',
    'gov.in',
    'nic.in'
];

export const STRICTLY_FORBIDDEN_SOURCES = [
    'wikipedia.org',
    'byjus.com',
    'toppr.com',
    'vedantu.com',
    'physicswallah.live',
    'pw.live',
    'careers360.com',
    'testbook.com',
    'jagranjosh.com',
    'selfstudys.com',
    'doubtnut.com',
    'quora.com',
    'medium.com',
    'github.com'
];

export const getOfficialBoardRegistry = (boardKey?: string): IOfficialBoardSource => {
    const key = (boardKey || 'gseb').toLowerCase().trim();
    if (TIER_1_NATIONAL_BOARDS[key]) return TIER_1_NATIONAL_BOARDS[key];
    if (TIER_2_STATE_BOARDS[key]) return TIER_2_STATE_BOARDS[key];
    
    // Fuzzy matching for state keys
    if (key.includes('cbse') || key.includes('central')) return TIER_1_NATIONAL_BOARDS.cbse;
    if (key.includes('ncert')) return TIER_1_NATIONAL_BOARDS.ncert;
    if (key.includes('gseb') || key.includes('gujarat')) return TIER_2_STATE_BOARDS.gseb;
    if (key.includes('mah') || key.includes('balbharati')) return TIER_2_STATE_BOARDS.maharashtra;
    if (key.includes('up') || key.includes('uttar pradesh')) return TIER_2_STATE_BOARDS.up;
    if (key.includes('mp') || key.includes('madhya pradesh')) return TIER_2_STATE_BOARDS.mp;
    if (key.includes('raj') || key.includes('rajasthan')) return TIER_2_STATE_BOARDS.rajasthan;
    if (key.includes('kar') || key.includes('karnataka')) return TIER_2_STATE_BOARDS.karnataka;
    if (key.includes('tn') || key.includes('tamil')) return TIER_2_STATE_BOARDS.tamilnadu;
    if (key.includes('tel') || key.includes('telangana')) return TIER_2_STATE_BOARDS.telangana;
    if (key.includes('ap') || key.includes('andhra')) return TIER_2_STATE_BOARDS.andhra;
    if (key.includes('wb') || key.includes('bengal')) return TIER_2_STATE_BOARDS.westbengal;
    if (key.includes('bihar')) return TIER_2_STATE_BOARDS.bihar;
    if (key.includes('ker') || key.includes('kerala')) return TIER_2_STATE_BOARDS.kerala;
    if (key.includes('pun') || key.includes('punjab')) return TIER_2_STATE_BOARDS.punjab;
    if (key.includes('har') || key.includes('haryana')) return TIER_2_STATE_BOARDS.haryana;
    if (key.includes('cg') || key.includes('chhattisgarh')) return TIER_2_STATE_BOARDS.chhattisgarh;
    if (key.includes('odi') || key.includes('odisha')) return TIER_2_STATE_BOARDS.odisha;
    if (key.includes('ass') || key.includes('assam')) return TIER_2_STATE_BOARDS.assam;
    if (key.includes('jhk') || key.includes('jharkhand')) return TIER_2_STATE_BOARDS.jharkhand;

    // Default Fallback
    return TIER_1_NATIONAL_BOARDS.ncert;
};
