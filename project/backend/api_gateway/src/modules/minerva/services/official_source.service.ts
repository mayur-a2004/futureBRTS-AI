import { getProviderResponse } from '../../../shared/services/openai.service';
import { IOfficialBoardSource, getOfficialBoardRegistry, ALLOWED_SOURCES, STRICTLY_FORBIDDEN_SOURCES } from '../official_curriculum_registry';

export interface IOfficialSourceResult {
    found: boolean;
    priority: number;
    sourceName: string;
    bookTitle: string;
    edition: string;
    isbn?: string;
    officialBookUrl: string;
    officialPdfUrl: string;
    officialSyllabusUrl: string;
    chapters: { chapter_number: number; chapter_name: string; official_pdf_url?: string }[];
}

export const fetchOfficialCurriculumFromSource = async (
    board: string,
    medium: string,
    classLevel: string,
    subject: string
): Promise<IOfficialSourceResult | null> => {
    const registry = getOfficialBoardRegistry(board);
    
    // Validate domain whitelist
    const isAllowed = ALLOWED_SOURCES.some(allowed => 
        registry.officialWebsite.includes(allowed) || 
        registry.textbooksUrl.includes(allowed) || 
        registry.syllabusUrl.includes(allowed)
    );

    if (!isAllowed) {
        console.warn(`[OfficialSourceService] Domain not in allowed whitelist: ${registry.officialWebsite}`);
    }

    const systemPrompt = `ROLE: You are the Official Government Source Resolver of Future Education OS.
PRIMARY OBJECTIVE: Retrieve the official government textbook chapter index for:
- Board: ${registry.name} (${registry.officialWebsite})
- Medium: ${medium}
- Class/Standard: ${classLevel}
- Subject: ${subject}

OFFICIAL SOURCE PRIORITY:
1. Official Board (${registry.officialWebsite})
2. Official SCERT (${registry.officialWebsite})
3. Official State Textbook Corporation (${registry.textbooksUrl})
4. NCERT (https://ncert.ncert.org.in)
5. DIKSHA (https://diksha.gov.in)
6. ePathshala (https://epathshala.nic.in)
7. NIOS (https://nios.ac.in)
8. CISCE (https://cisce.org)

STRICTLY FORBIDDEN: Wikipedia, Byju's, Vedantu, PW, Toppr, Testbook, Quora, Blogs, Medium, AI-invented memory syllabus.

Return ONLY valid JSON:
{
    "found": true,
    "priority": 1,
    "sourceName": "${registry.name}",
    "bookTitle": "Official Textbook Name",
    "edition": "2024-2025 Official Edition",
    "officialBookUrl": "${registry.textbooksUrl}",
    "officialPdfUrl": "${registry.textbooksUrl}",
    "officialSyllabusUrl": "${registry.syllabusUrl}",
    "chapters": [
        { "chapter_number": 1, "chapter_name": "Exact Chapter 1 Title" },
        { "chapter_number": 2, "chapter_name": "Exact Chapter 2 Title" }
    ]
}

If no official government textbook index exists, return ONLY JSON: { "found": false, "error": "Official curriculum not found." }`;

    try {
        const aiRes = await Promise.race([
            getProviderResponse([{ role: 'system', content: systemPrompt }], { jsonMode: true, temperature: 0.1 }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Official Source Resolver Timeout')), 12000))
        ]) as any;

        const content = aiRes?.choices?.[0]?.message?.content || aiRes?.message || aiRes?.output;
        if (content) {
            const parsed = JSON.parse(content);
            if (parsed && parsed.found && Array.isArray(parsed.chapters) && parsed.chapters.length > 0) {
                return {
                    found: true,
                    priority: parsed.priority || 1,
                    sourceName: parsed.sourceName || registry.name,
                    bookTitle: parsed.bookTitle || `Official ${board.toUpperCase()} Class ${classLevel} ${subject}`,
                    edition: parsed.edition || '2024-2025 Official Edition',
                    isbn: parsed.isbn || '',
                    officialBookUrl: parsed.officialBookUrl || registry.textbooksUrl,
                    officialPdfUrl: parsed.officialPdfUrl || registry.textbooksUrl,
                    officialSyllabusUrl: parsed.officialSyllabusUrl || registry.syllabusUrl,
                    chapters: parsed.chapters.map((ch: any, idx: number) => ({
                        chapter_number: ch.chapter_number || (idx + 1),
                        chapter_name: typeof ch === 'string' ? ch : ch.chapter_name,
                        official_pdf_url: ch.official_pdf_url || parsed.officialPdfUrl || registry.textbooksUrl
                    }))
                };
            }
        }
    } catch (err: any) {
        console.error(`[OfficialSourceService Error] ${board}/${medium}/${classLevel}/${subject}:`, err.message);
    }

    return null;
};
