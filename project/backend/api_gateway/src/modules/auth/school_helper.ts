import UdiseSchool from './udise_school.model';

export const upsertSchoolToUdiseDatabase = async (data: {
    schoolName: string;
    city?: string;
    district?: string;
    state?: string;
    fullAddress?: string;
    board?: string;
    udiseCode?: string;
    isTeacher?: boolean;
}) => {
    if (!data.schoolName || !data.schoolName.trim()) return;

    try {
        const sName = data.schoolName.trim();
        const city = (data.city || 'Ahmedabad').replace(/\s*\([^)]*\)/g, '').trim();
        const district = (data.district || city).replace(/\s*\([^)]*\)/g, '').trim();
        const state = data.state || 'Gujarat';
        const fullAddress = data.fullAddress || `${sName}, ${city}, ${state}`;
        const board = data.board || 'GSEB';

        let udiseCode = data.udiseCode;
        if (!udiseCode || udiseCode.length !== 11) {
            const hashStr = (sName + city).toLowerCase().replace(/[^a-z0-9]/g, '');
            let hashNum = 0;
            for (let i = 0; i < hashStr.length; i++) {
                hashNum = (hashNum << 5) - hashNum + hashStr.charCodeAt(i);
                hashNum |= 0;
            }
            udiseCode = `24${String(Math.abs(hashNum)).padStart(9, '0').slice(0, 9)}`;
        }

        const incField = data.isTeacher ? { teacherCount: 1 } : { studentCount: 1 };

        await UdiseSchool.updateOne(
            {
                $or: [
                    { udiseCode: udiseCode },
                    { schoolName: { $regex: new RegExp(`^${sName.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}$`, 'i') }, city: { $regex: new RegExp(city, 'i') } }
                ]
            },
            {
                $set: {
                    udiseCode: udiseCode,
                    schoolName: sName,
                    state: state,
                    district: district,
                    city: city,
                    fullAddress: fullAddress,
                    board: board,
                    isCustom: true
                },
                $inc: incField
            },
            { upsert: true }
        );
        console.log(`[UdiseAutoSave] Saved/Updated school "${sName}" in city "${city}"`);
    } catch (err) {
        console.error('[UdiseAutoSave] Error saving school:', err);
    }
};
