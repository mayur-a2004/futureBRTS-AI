import MinervaOfficialCurriculum from '../models/minerva_official_curriculum.model';
import { fetchOfficialCurriculumFromSource, IOfficialSourceResult } from './official_source.service';

const curriculumCache = new Map<string, { timestamp: number; data: any }>();
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour TTL

export interface IResolverResult {
    found: boolean;
    error?: string;
    board: string;
    medium: string;
    class_level: string;
    subject: string;
    bookTitle: string;
    edition: string;
    isbn?: string;
    officialBookUrl: string;
    officialPdfUrl: string;
    officialSyllabusUrl: string;
    referenceSource: string;
    official_source: string;
    official_url: string;
    last_verified: string;
    source_type: string;
    chapters: { chapter_number: number; chapter_name: string; official_pdf_url?: string }[];
    cacheHit: boolean;
}

export const resolveOfficialCurriculum = async (
    board: string,
    medium: string,
    classLevel: string,
    subject: string,
    bookParam?: string
): Promise<IResolverResult> => {
    const b = (board || '').toLowerCase().trim();
    const med = (medium || '').toLowerCase().trim();
    const std = (classLevel || '').toLowerCase().trim();
    const sub = (subject || '').toLowerCase().trim();
    const book = (bookParam || 'default').toLowerCase().trim();

    const cacheKey = `curriculum:${b}:${med}:${std}:${sub}:${book}`;

    // 1. Check Cache
    const cached = curriculumCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
        console.log(`[CurriculumIntelligenceEngine] CACHE HIT | Key: ${cacheKey} | Board: ${b} | Medium: ${med} | Class: ${std} | Subject: ${sub} | Book: ${book} | Source: ${cached.data.official_source} | Verified: ${cached.data.last_verified} | Returned Chapters: ${cached.data.chapters.length}`);
        return { ...cached.data, cacheHit: true };
    }

    console.log(`[CurriculumIntelligenceEngine] CACHE MISS | Querying DB (board=${b}, medium=${med}, class_level=${std}, subject=${sub})`);

    // 2. Query MongoDB with STRICT 4-FIELD FILTER (Board, Medium, Class, Subject)
    const dbRecord = await MinervaOfficialCurriculum.findOne({
        board: b,
        medium: med,
        class_level: std,
        subject: sub
    }).lean();

    if (dbRecord && dbRecord.chapters && dbRecord.chapters.length > 0) {
        const result: IResolverResult = {
            found: true,
            board: b,
            medium: med,
            class_level: std,
            subject: sub,
            bookTitle: dbRecord.textbook_name,
            edition: dbRecord.textbook_edition || '2024-2025 Official Edition',
            isbn: dbRecord.isbn || '',
            officialBookUrl: dbRecord.official_book_url,
            officialPdfUrl: dbRecord.official_pdf_url,
            officialSyllabusUrl: dbRecord.official_syllabus_url,
            referenceSource: dbRecord.reference_source,
            official_source: dbRecord.reference_source,
            official_url: dbRecord.official_book_url || dbRecord.official_syllabus_url,
            last_verified: dbRecord.updatedAt ? new Date(dbRecord.updatedAt).toISOString() : new Date().toISOString(),
            source_type: 'Official Government Education Portal',
            chapters: dbRecord.chapters.map((ch: any) => ({
                chapter_number: ch.chapter_number,
                chapter_name: ch.chapter_name,
                official_pdf_url: ch.official_pdf_url || dbRecord.official_pdf_url
            })),
            cacheHit: false
        };

        curriculumCache.set(cacheKey, { timestamp: Date.now(), data: result });
        console.log(`[CurriculumIntelligenceEngine] DB MATCH | Board: ${b} | Medium: ${med} | Class: ${std} | Subject: ${sub} | Source: ${result.official_source} | URL: ${result.official_url} | Chapters: ${result.chapters.length}`);
        return result;
    }

    // 3. Query Official Source Service (8-Tier Priority)
    console.log(`[CurriculumIntelligenceEngine] DB MISS | Resolving Official Sources for Board: ${b} | Medium: ${med} | Class: ${std} | Subject: ${sub}`);
    const sourceResult: IOfficialSourceResult | null = await fetchOfficialCurriculumFromSource(b, med, std, sub);

    if (sourceResult && sourceResult.found && sourceResult.chapters.length > 0) {
        const newRecord = {
            board: b,
            medium: med,
            class_level: std,
            subject: sub,
            textbook_name: sourceResult.bookTitle,
            textbook_edition: sourceResult.edition,
            isbn: sourceResult.isbn || '',
            official_book_url: sourceResult.officialBookUrl,
            official_pdf_url: sourceResult.officialPdfUrl,
            official_chapter_index_url: sourceResult.officialBookUrl,
            official_syllabus_url: sourceResult.officialSyllabusUrl,
            reference_source: sourceResult.sourceName,
            chapters: sourceResult.chapters
        };

        try {
            await MinervaOfficialCurriculum.findOneAndUpdate(
                { board: b, medium: med, class_level: std, subject: sub },
                newRecord,
                { upsert: true, new: true }
            );
            console.log(`[CurriculumIntelligenceEngine] OFFICIAL SOURCE SAVED TO DB | Key: ${cacheKey}`);
        } catch (dbSaveErr: any) {
            console.error(`[CurriculumIntelligenceEngine DB Save Error]:`, dbSaveErr.message);
        }

        const result: IResolverResult = {
            found: true,
            board: b,
            medium: med,
            class_level: std,
            subject: sub,
            bookTitle: sourceResult.bookTitle,
            edition: sourceResult.edition,
            isbn: sourceResult.isbn,
            officialBookUrl: sourceResult.officialBookUrl,
            officialPdfUrl: sourceResult.officialPdfUrl,
            officialSyllabusUrl: sourceResult.officialSyllabusUrl,
            referenceSource: sourceResult.sourceName,
            official_source: sourceResult.sourceName,
            official_url: sourceResult.officialBookUrl || sourceResult.officialSyllabusUrl,
            last_verified: new Date().toISOString(),
            source_type: 'Official Government Education Portal',
            chapters: sourceResult.chapters,
            cacheHit: false
        };

        curriculumCache.set(cacheKey, { timestamp: Date.now(), data: result });
        return result;
    }

    // 4. Strict Error Output if Official Source Unavailable
    console.warn(`[CurriculumIntelligenceEngine] OFFICIAL CURRICULUM UNAVAILABLE | Board: ${b} | Medium: ${med} | Class: ${std} | Subject: ${sub}`);
    return {
        found: false,
        error: "Official curriculum unavailable.",
        board: b,
        medium: med,
        class_level: std,
        subject: sub,
        bookTitle: "",
        edition: "",
        officialBookUrl: "",
        officialPdfUrl: "",
        officialSyllabusUrl: "",
        referenceSource: "",
        official_source: "None",
        official_url: "None",
        last_verified: new Date().toISOString(),
        source_type: "None",
        chapters: [],
        cacheHit: false
    };
};

export const clearCurriculumCache = () => {
    curriculumCache.clear();
    console.log('[CurriculumIntelligenceEngine] Cache Purged Completely.');
};
