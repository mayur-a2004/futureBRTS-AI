import MinervaOfficialCurriculum from '../models/minerva_official_curriculum.model';
import { getOfficialBoardRegistry } from '../official_curriculum_registry';

export const seedOfficialCurriculumDatabase = async () => {
    try {
        console.log('🌱 Checking Official Government Curriculum Database...');

        const gsebRegistry = getOfficialBoardRegistry('gseb');
        const ncertRegistry = getOfficialBoardRegistry('ncert');

        const initialCurriculums: any[] = [
            // ─────────────────────────────────────────────
            // CLASS 3 MATHEMATICS (GSEB / NCERT Gujarati & English Medium)
            // ─────────────────────────────────────────────
            {
                board: 'gseb',
                medium: 'gujarati',
                class_level: '3',
                subject: 'mathematics',
                textbook_name: 'ધોરણ 3 ગણિત-ગમ્મત (Mathematics)',
                reference_source: 'Gujarat Council of Educational Research and Training (GCERT / GSSTB)',
                official_book_url: 'https://gsstb.gujarat.gov.in/std-3-maths',
                official_pdf_url: 'https://gsstb.gujarat.gov.in/pdf/std3_maths.pdf',
                official_chapter_index_url: 'https://gcert.gujarat.gov.in/curriculum/std3/maths',
                official_syllabus_url: 'https://gcert.gujarat.gov.in/syllabus/std3',
                chapters: [
                    { chapter_number: 1, chapter_name: 'પ્રકરણ 1: ક્યાંથી જોવું? (Where to Look From)' },
                    { chapter_number: 2, chapter_name: 'પ્રકરણ 2: સંખ્યાની ગમ્મત (Fun with Numbers)' },
                    { chapter_number: 3, chapter_name: 'પ્રકરણ 3: આપો અને લો (Give and Take)' },
                    { chapter_number: 4, chapter_name: 'પ્રકરણ 4: લાંબુ અને ટૂંકું (Long and Short)' },
                    { chapter_number: 5, chapter_name: 'પ્રકરણ 5: આકાર અને ભાત (Shapes and Designs)' },
                    { chapter_number: 6, chapter_name: 'પ્રકરણ 6: આપ-લેની ગમ્મત (Fun with Give and Take)' },
                    { chapter_number: 7, chapter_name: 'પ્રકરણ 7: સમય વહી જાય છે (Time Goes On)' },
                    { chapter_number: 8, chapter_name: 'પ્રકરણ 8: કોણ ભારે છે? (Who is Heavier?)' },
                    { chapter_number: 9, chapter_name: 'પ્રકરણ 9: કેટલા વખત? (How Many Times?)' },
                    { chapter_number: 10, chapter_name: 'પ્રકરણ 10: ભાતની પેટર્ન (Play with Patterns)' },
                    { chapter_number: 11, chapter_name: 'પ્રકરણ 11: જગ અને મગ (Jugs and Mugs)' },
                    { chapter_number: 12, chapter_name: 'પ્રકરણ 12: આપણે સરખા ભાગે વહેંચી શકીએ? (Can We Share?)' },
                    { chapter_number: 13, chapter_name: 'પ્રકરણ 13: સ્માર્ટ ચાર્ટ (Smart Charts)' },
                    { chapter_number: 14, chapter_name: 'પ્રકરણ 14: રૂપિયા અને પૈસા (Rupees and Paise)' }
                ]
            },

            // ─────────────────────────────────────────────
            // CLASS 7 MATHEMATICS (GSEB / NCERT Gujarati & English Medium)
            // ─────────────────────────────────────────────
            {
                board: 'gseb',
                medium: 'gujarati',
                class_level: '7',
                subject: 'mathematics',
                textbook_name: 'ધોરણ 7 ગણિત (Mathematics)',
                reference_source: 'GCERT / GSSTB',
                official_book_url: 'https://gsstb.gujarat.gov.in/std-7-maths',
                official_pdf_url: 'https://gsstb.gujarat.gov.in/pdf/std7_maths.pdf',
                official_chapter_index_url: 'https://gcert.gujarat.gov.in/curriculum/std7/maths',
                official_syllabus_url: 'https://gcert.gujarat.gov.in/syllabus/std7',
                chapters: [
                    { chapter_number: 1, chapter_name: 'પ્રકરણ 1: પૂર્ણાંક સંખ્યાઓ (Integers)' },
                    { chapter_number: 2, chapter_name: 'પ્રકરણ 2: અપૂર્ણાંક અને દશાંશ સંખ્યાઓ (Fractions and Decimals)' },
                    { chapter_number: 3, chapter_name: 'પ્રકરણ 3: માહિતીનું નિયામન (Data Handling)' },
                    { chapter_number: 4, chapter_name: 'પ્રકરણ 4: સાદા સમીકરણ (Simple Equations)' },
                    { chapter_number: 5, chapter_name: 'પ્રકરણ 5: રેખા અને ખૂણા (Lines and Angles)' },
                    { chapter_number: 6, chapter_name: 'પ્રકરણ 6: ત્રિકોણ અને તેના ગુણધર્મો (The Triangle and its Properties)' },
                    { chapter_number: 7, chapter_name: 'પ્રકરણ 7: ત્રિકોણની એકરૂપતા (Congruence of Triangles)' },
                    { chapter_number: 8, chapter_name: 'પ્રકરણ 8: રાશીઓની સરખામણી (Comparing Quantities)' },
                    { chapter_number: 9, chapter_name: 'પ્રકરણ 9: સંમેય સંખ્યાઓ (Rational Numbers)' },
                    { chapter_number: 10, chapter_name: 'પ્રકરણ 10: પ્રાયોગિક ભૂમિતિ (Practical Geometry)' },
                    { chapter_number: 11, chapter_name: 'પ્રકરણ 11: પરિમિતિ અને ક્ષેત્રફળ (Perimeter and Area)' },
                    { chapter_number: 12, chapter_name: 'પ્રકરણ 12: બીજગણિતીય પદાવલી (Algebraic Expressions)' },
                    { chapter_number: 13, chapter_name: 'પ્રકરણ 13: ઘાત અને ઘાતાંક (Exponents and Powers)' },
                    { chapter_number: 14, chapter_name: 'પ્રકરણ 14: સિમિતિ (Symmetry)' }
                ]
            },

            // ─────────────────────────────────────────────
            // CLASS 8 MATHEMATICS (GSEB / NCERT Gujarati & English Medium)
            // ─────────────────────────────────────────────
            {
                board: 'gseb',
                medium: 'gujarati',
                class_level: '8',
                subject: 'mathematics',
                textbook_name: 'ધોરણ 8 ગણિત (Mathematics)',
                reference_source: 'GCERT / GSSTB',
                official_book_url: 'https://gsstb.gujarat.gov.in/std-8-maths',
                official_pdf_url: 'https://gsstb.gujarat.gov.in/pdf/std8_maths.pdf',
                official_chapter_index_url: 'https://gcert.gujarat.gov.in/curriculum/std8/maths',
                official_syllabus_url: 'https://gcert.gujarat.gov.in/syllabus/std8',
                chapters: [
                    { chapter_number: 1, chapter_name: 'પ્રકરણ 1: સંમેય સંખ્યાઓ (Rational Numbers)' },
                    { chapter_number: 2, chapter_name: 'પ્રકરણ 2: એકચલ રેખીય સમીકરણ (Linear Equations in One Variable)' },
                    { chapter_number: 3, chapter_name: 'પ્રકરણ 3: ચતુષ્કોણની સમજ (Understanding Quadrilaterals)' },
                    { chapter_number: 4, chapter_name: 'પ્રકરણ 4: પ્રાયોગિક ભૂમિતિ (Practical Geometry)' },
                    { chapter_number: 5, chapter_name: 'પ્રકરણ 5: માહિતીનું નિયામન (Data Handling)' },
                    { chapter_number: 6, chapter_name: 'પ્રકરણ 6: વર્ગ અને વર્ગમૂળ (Squares and Square Roots)' },
                    { chapter_number: 7, chapter_name: 'પ્રકરણ 7: ઘન અને ઘનમૂળ (Cubes and Cube Roots)' },
                    { chapter_number: 8, chapter_name: 'પ્રકરણ 8: રાશિઓની સરખામણી (Comparing Quantities)' },
                    { chapter_number: 9, chapter_name: 'પ્રકરણ 9: બેજિક પદાવલીઓ અને નિત્યસમ (Algebraic Expressions)' },
                    { chapter_number: 10, chapter_name: 'પ્રકરણ 10: ઘનાકારોનું પ્રત્યક્ષીકરણ (Visualising Solid Shapes)' },
                    { chapter_number: 11, chapter_name: 'પ્રકરણ 11: ક્ષેત્રફળ અને માપન (Mensuration)' },
                    { chapter_number: 12, chapter_name: 'પ્રકરણ 12: ઘાત અને ઘાતાંક (Exponents and Powers)' },
                    { chapter_number: 13, chapter_name: 'પ્રકરણ 13: સમપ્રમાણ અને વ્યસ્ત પ્રમાણ (Direct & Inverse Proportions)' },
                    { chapter_number: 14, chapter_name: 'પ્રકરણ 14: અવયવીકરણ (Factorisation)' },
                    { chapter_number: 15, chapter_name: 'પ્રકરણ 15: આલેખનો પરિચય (Introduction to Graphs)' }
                ]
            },

            // ─────────────────────────────────────────────
            // CLASS 10 MATHEMATICS (GSEB / NCERT Gujarati & English Medium)
            // ─────────────────────────────────────────────
            {
                board: 'gseb',
                medium: 'gujarati',
                class_level: '10',
                subject: 'mathematics',
                textbook_name: 'ધોરણ 10 ગણિત (Mathematics)',
                reference_source: 'GCERT / GSSTB',
                official_book_url: 'https://gsstb.gujarat.gov.in/std-10-maths',
                official_pdf_url: 'https://gsstb.gujarat.gov.in/pdf/std10_maths.pdf',
                official_chapter_index_url: 'https://gcert.gujarat.gov.in/curriculum/std10/maths',
                official_syllabus_url: 'https://gcert.gujarat.gov.in/syllabus/std10',
                chapters: [
                    { chapter_number: 1, chapter_name: 'પ્રકરણ 1: વાસ્તવિક સંખ્યાઓ (Real Numbers)' },
                    { chapter_number: 2, chapter_name: 'પ્રકરણ 2: બહુપદીઓ (Polynomials)' },
                    { chapter_number: 3, chapter_name: 'પ્રકરણ 3: દ્વિચલ રેખીય સમીકરણ યુગ્મ (Pair of Linear Equations)' },
                    { chapter_number: 4, chapter_name: 'પ્રકરણ 4: દ્વિઘાત સમીકરણ (Quadratic Equations)' },
                    { chapter_number: 5, chapter_name: 'પ્રકરણ 5: સમાંતર શ્રેણી (Arithmetic Progressions)' },
                    { chapter_number: 6, chapter_name: 'પ્રકરણ 6: ત્રિકોણ (Triangles)' },
                    { chapter_number: 7, chapter_name: 'પ્રકરણ 7: યામ ભૂમિતિ (Coordinate Geometry)' },
                    { chapter_number: 8, chapter_name: 'પ્રકરણ 8: ત્રિકોણમિતિનો પરિચય (Introduction to Trigonometry)' },
                    { chapter_number: 9, chapter_name: 'પ્રકરણ 9: ત્રિકોણમિતિના ઉપયોગો (Applications of Trigonometry)' },
                    { chapter_number: 10, chapter_name: 'પ્રકરણ 10: વર્તુળ (Circles)' },
                    { chapter_number: 11, chapter_name: 'પ્રકરણ 11: વર્તુળ સંબંધિત ક્ષેત્રફળ (Areas Related to Circles)' },
                    { chapter_number: 12, chapter_name: 'પ્રકરણ 12: પૃષ્ઠફળ અને ઘનફળ (Surface Areas and Volumes)' },
                    { chapter_number: 13, chapter_name: 'પ્રકરણ 13: આંકડાશાસ્ત્ર (Statistics)' },
                    { chapter_number: 14, chapter_name: 'પ્રકરણ 14: સંભાવના (Probability)' }
                ]
            },

            // ─────────────────────────────────────────────
            // CLASS 11 COMMERCE GUJARATI (GSEB)
            // ─────────────────────────────────────────────
            {
                board: 'gseb',
                medium: 'gujarati',
                class_level: '11_commerce',
                subject: 'gujarati',
                textbook_name: 'ધોરણ 11 ગુજરાતી (પ્રથમ ભાષા)',
                reference_source: 'GCERT / GSSTB',
                official_book_url: 'https://gsstb.gujarat.gov.in/std-11-gujarati',
                official_pdf_url: 'https://gsstb.gujarat.gov.in/pdf/std11_gujarati.pdf',
                official_chapter_index_url: 'https://gcert.gujarat.gov.in/curriculum/std11/gujarati',
                official_syllabus_url: 'https://gcert.gujarat.gov.in/syllabus/std11',
                chapters: [
                    { chapter_number: 1, chapter_name: 'પ્રકરણ 1: જાગને જાદવા (પદ - નરસિંહ મહેતા)' },
                    { chapter_number: 2, chapter_name: 'પ્રકરણ 2: ખરી મા (વાર્તા - મહાશ્વેતા દેવી)' },
                    { chapter_number: 3, chapter_name: 'પ્રકરણ 3: નાવિક વળતો બોલિયો (પદ - ભાલણ)' },
                    { chapter_number: 4, chapter_name: 'પ્રકરણ 4: પોસ્ટ ઑફિસ (વાર્તા - ધૂમકેતુ)' },
                    { chapter_number: 5, chapter_name: 'પ્રકરણ 5: પરાજયની જીત (ખંડકાવ્ય - સુરેશ જોષી)' },
                    { chapter_number: 6, chapter_name: 'પ્રકરણ 6: સુન્દરીની શોધ (આત્મકથાખંડ - જયશંકર \'સુન્દરી\')' },
                    { chapter_number: 7, chapter_name: 'પ્રકરણ 7: વનમાં ચાંદલિયો ઊગ્યો (લોકગીત)' },
                    { chapter_number: 8, chapter_name: 'પ્રકરણ 8: બુરાઈના દ્વાર પરથી (નવલિકા - ઝવેરચંદ મેઘાણી)' },
                    { chapter_number: 9, chapter_name: 'પ્રકરણ 9: ચક્રવાકમિથુન (ખંડકાવ્ય - કાન્ત)' },
                    { chapter_number: 10, chapter_name: 'પ્રકરણ 10: બે લઘુકથાઓ (ઠેસ & સાચો રસ્તો)' },
                    { chapter_number: 11, chapter_name: 'પ્રકરણ 11: ભવિષ્યવેત્તા (હાસ્ય વાર્તા)' },
                    { chapter_number: 12, chapter_name: 'પ્રકરણ 12: ધોરણ 11 ગુજરાતી વ્યાકરણ & લેખન (સમાસ, કહેવતો, વિચારવિસ્તાર)' }
                ]
            },

            // ─────────────────────────────────────────────
            // CLASS 12 COMMERCE GUJARATI (GSEB)
            // ─────────────────────────────────────────────
            {
                board: 'gseb',
                medium: 'gujarati',
                class_level: '12_commerce',
                subject: 'gujarati',
                textbook_name: 'ધોરણ 12 ગુજરાતી (પ્રથમ ભાષા)',
                reference_source: 'GCERT / GSSTB',
                official_book_url: 'https://gsstb.gujarat.gov.in/std-12-gujarati',
                official_pdf_url: 'https://gsstb.gujarat.gov.in/pdf/std12_gujarati.pdf',
                official_chapter_index_url: 'https://gcert.gujarat.gov.in/curriculum/std12/gujarati',
                official_syllabus_url: 'https://gcert.gujarat.gov.in/syllabus/std12',
                chapters: [
                    { chapter_number: 1, chapter_name: 'પ્રકરણ 1: ક્રોધી સ્વભાવને જીતવો ને (પદ - ગંગાસતી)' },
                    { chapter_number: 2, chapter_name: 'પ્રકરણ 2: કુસુમનું કઠણ તપ (નવલકથાખંડ - ગોવર્ધનરામ ત્રિપાઠી)' },
                    { chapter_number: 3, chapter_name: 'પ્રકરણ 3: એમ ઉગાર્યો ચંદ્રહાસ (આખ્યાનખંડ - પ્રેમાનંદ)' },
                    { chapter_number: 4, chapter_name: 'પ્રકરણ 4: સત્યાગ્રહાશ્રમ (આત્મકથાખંડ - વિનોબા ભાબે)' },
                    { chapter_number: 5, chapter_name: 'પ્રકરણ 5: થીગડું (વાર્તા - સુરેશ જોષી)' },
                    { chapter_number: 6, chapter_name: 'પ્રકરણ 6: ઉછીનું માંગનારાઓ (હાસ્ય નિબંધ - નટવરલાલ બૂચ)' },
                    { chapter_number: 7, chapter_name: 'પ્રકરણ 7: શ્યામ રંગ સમીપે (પદ - દયારામ)' },
                    { chapter_number: 8, chapter_name: 'પ્રકરણ 8: અમરનાથની યાત્રાએ (પ્રવાસ નિબંધ - વિનોદિની નીલકંઠ)' },
                    { chapter_number: 9, chapter_name: 'પ્રકરણ 9: ભવના અબોલા (લોકગીત)' },
                    { chapter_number: 10, chapter_name: 'પ્રકરણ 10: યુધિષ્ઠિર યુદ્ધવિષાદ (નાટ્યાંશ - ઉમાશંકર જોશી)' },
                    { chapter_number: 11, chapter_name: 'પ્રકરણ 11: ઉર્મિલા (ખંડકાવ્ય - કવિ કાન્ત)' },
                    { chapter_number: 12, chapter_name: 'પ્રકરણ 12: પુંજા મેજરની લગની (વાર્તા - રઘુવીર ચૌધરી)' },
                    { chapter_number: 13, chapter_name: 'પ્રકરણ 13: મહાત્માના માણસ (વાર્તા - ધીરુબેન પટેલ)' },
                    { chapter_number: 14, chapter_name: 'પ્રકરણ 14: છેલ્લું દર્શન (સોનેટ - નિરંજન ભગત)' },
                    { chapter_number: 15, chapter_name: 'પ્રકરણ 15: ધોરણ 12 ગુજરાતી વ્યાકરણ & લેખન (સંયોજકો, વાક્યરૂપાંતર, વિચારવિસ્તાર)' }
                ]
            }
        ];

        for (const item of initialCurriculums) {
            await MinervaOfficialCurriculum.findOneAndUpdate(
                {
                    board: item.board.toLowerCase(),
                    medium: item.medium.toLowerCase(),
                    class_level: item.class_level.toLowerCase(),
                    subject: item.subject.toLowerCase()
                },
                item,
                { upsert: true, new: true }
            );
        }

        console.log('✅ Official Government Curriculum Database Seeded Successfully!');
    } catch (err) {
        console.error('❌ Error seeding Official Curriculum Database:', err);
    }
};
