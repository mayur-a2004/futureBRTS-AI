import { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
const pdfParse = require('pdf-parse');
const Tesseract = require('tesseract.js');
import { getProviderResponse } from '../../shared/services/openai.service';
import ExamPaper from '../../models/exam_paper.model';

const error = (res: Response, message: string, code: string) => res.status(400).json({ status: 'error', message, code });
const success = (res: Response, message: string, data: any) => res.status(200).json({ status: 'success', message, data });

const extractSmartContent = (fullText: string, examScope: string, chapter: string, topic: string, targetLength: number = 30000): string => {
    const textLength = fullText.length;
    if (textLength <= targetLength + 1000) {
        return fullText;
    }

    if (examScope === 'Chapter Wise' && chapter) {
        const cleanChapter = chapter.trim();
        let index = fullText.toLowerCase().indexOf(cleanChapter.toLowerCase());
        
        if (index === -1) {
            const simplified = cleanChapter.replace(/chapter\s*\d+\s*[:.-]?/i, '').trim();
            if (simplified.length > 3) {
                index = fullText.toLowerCase().indexOf(simplified.toLowerCase());
            }
        }

        if (index !== -1) {
            console.log(`[SmartExtract] Chapter "${cleanChapter}" found in text. Extracting segment starting at index ${index}...`);
            return fullText.substring(index, Math.min(textLength, index + targetLength));
        }
    }

    if (examScope === 'Specific Topic' && topic) {
        const cleanTopic = topic.trim();
        const index = fullText.toLowerCase().indexOf(cleanTopic.toLowerCase());
        if (index !== -1) {
            console.log(`[SmartExtract] Topic "${cleanTopic}" found in text. Extracting segment around index ${index}...`);
            const start = Math.max(0, index - 1500);
            return fullText.substring(start, Math.min(textLength, start + targetLength));
        }
    }

    console.log(`[SmartExtract] Sampling textbook segments across ${textLength} characters for Full Subject exam...`);
    const numSamples = 8;
    const sampleSize = Math.floor(targetLength / numSamples);
    const step = Math.floor((textLength - sampleSize) / numSamples);
    
    let sampledText = "";
    for (let i = 0; i < numSamples; i++) {
        const start = i * step;
        sampledText += `\n--- Segment ${i+1} ---\n`;
        sampledText += fullText.substring(start, start + sampleSize);
    }
    return sampledText;
};

export const examGeneratorController = {
    generateExam: async (req: Request, res: Response) => {
        try {
            const { 
                subject, board, standard, stream, examScope, chapter, topic, marks, difficulty,
                sourceType = 'file', pastedText = '', inputMode = 'syllabus',
                blueprint, language
            } = req.body;
            
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };
            const pdfFile = files?.pdfFile?.[0];
            const referenceFile = files?.referenceFile?.[0];

            if (!subject || !board || !standard || !examScope || !marks || !difficulty) {
                return error(res, "Missing required parameters (subject, board, standard, examScope, marks, difficulty).", "VALIDATION_FAILED");
            }

            let textContent = "";

            if (sourceType === 'text') {
                if (!pastedText || pastedText.trim().length < 10) {
                    return error(res, "Please paste the old exam paper or syllabus text content.", "VALIDATION_FAILED");
                }
                textContent = pastedText.trim();
            } else {
                if (!pdfFile) {
                    return error(res, "Please upload a Syllabus PDF, Old Question Paper, or Image file.", "VALIDATION_FAILED");
                }

                // Read uploaded file (PDF or Image)
                try {
                    if (pdfFile.mimetype === 'application/pdf') {
                        const dataBuffer = fs.readFileSync(pdfFile.path);
                        const parsedPdf = await pdfParse(dataBuffer);
                        
                        // Enforce page count limit of max 20 pages
                        if (parsedPdf.numpages > 20) {
                            return error(res, `Uploaded PDF has too many pages (${parsedPdf.numpages} pages). Maximum allowed is 20 pages.`, "LIMIT_EXCEEDED");
                        }
                        
                        textContent = parsedPdf.text.trim();
                    } else if (pdfFile.mimetype.startsWith('image/')) {
                        console.log("Starting OCR for primary image file (eng+hin+guj)...");
                        let text = "";
                        try {
                            const result = await Tesseract.recognize(pdfFile.path, 'eng+hin+guj');
                            text = result.data.text;
                        } catch (ocrErr) {
                            console.warn("Primary image multi-language OCR failed, falling back to English:", ocrErr);
                            const result = await Tesseract.recognize(pdfFile.path, 'eng');
                            text = result.data.text;
                        }
                        textContent = text.trim();
                        console.log("OCR completed on primary image.");
                    } else {
                        return error(res, "Unsupported file format. Please upload a PDF or an Image.", "VALIDATION_FAILED");
                    }
                } catch (err: any) {
                    console.error("File Parse Error:", err);
                    return error(res, `Failed to parse file: ${err.message}`, "PARSE_ERROR");
                }
            }

            if (textContent.length < 20) {
                return error(res, "Provided study material or old paper content contains too little text. Please provide more content.", "PARSE_ERROR");
            }

            if (inputMode === 'syllabus') {
                textContent = extractSmartContent(textContent, examScope, chapter, topic, 30000);
            } else {
                if (textContent.length > 30000) {
                    textContent = textContent.substring(0, 30000) + '...';
                }
            }

            // Handle Reference File if provided
            let referenceText = "";
            if (referenceFile) {
                try {
                    if (referenceFile.mimetype === 'application/pdf') {
                        const refBuffer = fs.readFileSync(referenceFile.path);
                        const parsedRef = await pdfParse(refBuffer);
                        referenceText = parsedRef.text.trim();
                    } else if (referenceFile.mimetype.startsWith('image/')) {
                        console.log("Starting OCR for reference image (eng+hin+guj)...");
                        let text = "";
                        try {
                            const result = await Tesseract.recognize(referenceFile.path, 'eng+hin+guj');
                            text = result.data.text;
                        } catch (ocrErr) {
                            console.warn("Multi-language OCR failed, falling back to English:", ocrErr);
                            const result = await Tesseract.recognize(referenceFile.path, 'eng');
                            text = result.data.text;
                        }
                        referenceText = text.trim();
                        console.log("OCR completed on reference image.");
                    }
                } catch (e) {
                    console.error("Reference file parse error:", e);
                }
                
                if (referenceText.length > 5000) {
                    referenceText = referenceText.substring(0, 5000) + '...';
                }
            }

            // Parse blueprint parameters if sent
            let blueprintObj: any = null;
            if (blueprint) {
                try {
                    blueprintObj = typeof blueprint === 'string' ? JSON.parse(blueprint) : blueprint;
                } catch (e) {
                    console.error("Failed to parse blueprint:", e);
                }
            }

            let blueprintInstructions = "";
            let sectionsList: any[] = [];
            if (blueprintObj) {
                if (blueprintObj.mcq > 0) {
                    sectionsList.push({
                        sectionName: "Section A: Multiple Choice Questions (1 Mark each)",
                        qCount: blueprintObj.mcq,
                        marksPerQ: 1,
                        type: 'mcq'
                    });
                }
                if (blueprintObj.true_false > 0) {
                    sectionsList.push({
                        sectionName: "Section B: True or False Questions (1 Mark each)",
                        qCount: blueprintObj.true_false,
                        marksPerQ: 1,
                        type: 'true_false'
                    });
                }
                if (blueprintObj.blank > 0) {
                    sectionsList.push({
                        sectionName: "Section C: Fill in the Blanks (1 Mark each)",
                        qCount: blueprintObj.blank,
                        marksPerQ: 1,
                        type: 'blank'
                    });
                }
                if (blueprintObj.q1 > 0) {
                    sectionsList.push({
                        sectionName: "Section D: Very Short Answer Questions (1 Mark each)",
                        qCount: blueprintObj.q1,
                        marksPerQ: 1,
                        type: 'descriptive'
                    });
                }
                if (blueprintObj.q2 > 0) {
                    sectionsList.push({
                        sectionName: "Section E: Short Answer Questions (2 Marks each)",
                        qCount: blueprintObj.q2,
                        marksPerQ: 2,
                        type: 'descriptive'
                    });
                }
                if (blueprintObj.q3 > 0) {
                    sectionsList.push({
                        sectionName: "Section F: Medium Answer Questions (3 Marks each)",
                        qCount: blueprintObj.q3,
                        marksPerQ: 3,
                        type: 'descriptive'
                    });
                }
                if (blueprintObj.q4 > 0) {
                    sectionsList.push({
                        sectionName: "Section G: Long Answer Questions (4 Marks each)",
                        qCount: blueprintObj.q4,
                        marksPerQ: 4,
                        type: 'descriptive'
                    });
                }
                if (blueprintObj.q5 > 0) {
                    sectionsList.push({
                        sectionName: "Section H: Essay Type / Very Long Answer Questions (5 Marks each)",
                        qCount: blueprintObj.q5,
                        marksPerQ: 5,
                        type: 'descriptive'
                    });
                }

                blueprintInstructions = `
CRITICAL STRUCTURE REQUIREMENT (BLUEPRINT):
You MUST structure the exam paper exactly into these sections and generate the exact number of questions as specified:
${sectionsList.map((sec, idx) => `
${idx + 1}. Section Name: "${sec.sectionName}"
   - Question Count: Generate exactly ${sec.qCount} questions.
   - Marks: Each question in this section must be exactly ${sec.marksPerQ} marks.
   - Type: ${sec.type === 'mcq' ? 'Multiple Choice (exactly 4 unique options A, B, C, D)' : sec.type === 'true_false' ? 'True/False (no options array, set answer to "True" or "False")' : sec.type === 'blank' ? 'Fill in the Blanks (include a blank line like "_______" in the question text)' : 'Descriptive Q&A (no options array, output detailed key-points and full answer description in the "answer" field)'}
`).join('\n')}
`;
            }

            const targetLanguage = language && language !== 'Auto-Detect' ? language : 'Auto-detect';

            let languageInstruction = "";
            if (targetLanguage === 'Auto-detect') {
                languageInstruction = `Analyze the language of the Syllabus/Textbook Material below. You MUST generate the entire Exam Question Paper, section names, questions, options, answers, and solutions in that exact same language (e.g. Hindi, Gujarati, English). Do not translate.`;
            } else {
                languageInstruction = `You MUST generate the entire Exam Question Paper, section names, questions, options, answers, and solutions strictly in the "${targetLanguage}" language. If "${targetLanguage}" is Gujarati, translate the textbook content and write all questions/explanations strictly in Gujarati script. If "${targetLanguage}" is Hindi, translate and write strictly in Hindi script. DO NOT output in English or mix Roman script.`;
            }

            let prompt = `You are an Expert Academic Examiner and Paper Setter for ${board} board, ${standard} standard.

STRICT SOURCE GROUNDING & DETAILED EXTRACTION:
1. Parse the uploaded Syllabus/Textbook Material to identify the actual Board, Standard, and Subject. Even if the parameters dropdown specifies a different Board/Standard/Subject, you MUST override them and generate the exam paper directly on the topics and subject of the uploaded PDF material.
2. Every single question must be generated STRICTLY from the provided material. Do not use external facts, out-of-syllabus chapters, or external topics.
3. LANGUAGE REQUIREMENT: ${languageInstruction}
`;

            if (inputMode !== 'old_paper') {
                prompt += `\n${blueprintInstructions}\n`;
            }

            if (inputMode === 'old_paper') {
                prompt += `
Your task is to:
1. Extract and solve the provided Past/Old Question Paper. You MUST extract every single question present in the provided Past/Old Question Paper exactly. Do NOT generate new, alternative, or predicted questions.
2. For each extracted question, solve it completely. The solution MUST be detailed, step-by-step, showing all calculations, formulas, reasoning, and complete working. Do NOT provide short answers, single words, or simple option letters (like A, B, C, D) for the answers.
3. For Multiple Choice Questions, you MUST extract the actual question text and the original four options (e.g. ["Option A text", "Option B text", "Option C text", "Option D text"]). In the "answer" field, you MUST write the correct option text PLUS the complete, detailed working and explanation of why it is correct. DO NOT just write "A" or "B" or "C" or "D".
4. Retain all original section names, question order, and original marks. The sum of marks should equal the total marks of the original question paper.

Parameters:
- Board: ${board}
- Subject: ${subject}
- Standard: ${standard}
${stream ? `- Stream: ${stream}` : ''}
- Difficulty: ${difficulty}

Past/Old Question Paper Content:
"""
${textContent}
"""
`;
            } else {
                prompt += `
Your task is to generate a formal Exam Question Paper based ONLY on the provided Syllabus/Textbook material.

Parameters:
- Board: ${board}
- Subject: ${subject}
- Standard: ${standard}
${stream ? `- Stream: ${stream}` : ''}
- Exam Scope: ${examScope}
${examScope === 'Chapter Wise' ? `- Chapter Focus: ${chapter}` : ''}
${examScope === 'Specific Topic' ? `- Topic Focus: ${topic}` : ''}
- Total Marks: ${marks}
- Difficulty: ${difficulty}

Syllabus/Textbook Material:
"""
${textContent}
"""
`;
            }

            if (referenceText) {
                prompt += `
Reference Exam Format:
"""
${referenceText}
"""
IMPORTANT: The user has provided a Reference Exam template/format. You MUST strictly follow the exact structure, section distribution, and style of the Reference Exam.
Specifically:
1. Identify all sections in the Reference Exam (e.g. "Section A", "Section B", "Part I"). Keep the same section names and the same number of sections.
2. For each section, count the number of questions. Your generated paper MUST have the exact same number of questions in each section.
3. Keep the exact same marks allocation per question in each section (e.g. if Q1-Q10 are 1 mark each in the template, your Q1-Q10 must be 1 mark each).
4. Match the question types (e.g. MCQs, fill-in-the-blanks, true/false, short answers, long numericals) of each section.
Do NOT deviate from this template format. Regenerate questions matching these constraints using the syllabus material provided above.
`;
            }

            prompt += `
Instructions:
1. Generate a structured JSON response containing the exact questions.
2. EVERY question generated MUST be completely unique. DO NOT duplicate questions or repeat similar questions across sections.
3. For MCQ questions, EVERY option (A, B, C, D) MUST be completely unique and distinct. NEVER repeat the same option/text multiple times for a question.
4. The JSON MUST follow this exact structure:
{
  "title": "${inputMode === 'old_paper' ? `Solved Paper: ${subject}` : `Exam Paper: ${subject}`}",
  "subject": "Detected Subject (e.g. Science)",
  "standard": "Detected Standard (e.g. Class 10)",
  "board": "Detected Board (e.g. GSEB)",
  "marks": "${inputMode === 'old_paper' ? 'Detected Total Marks' : marks}",
  "sections": [
    {
      "sectionName": "Section A: Multiple Choice Questions",
      "questions": [
        { 
          "question": "What is...", 
          "options": ["Option 1 text", "Option 2 text", "Option 3 text", "Option 4 text"], 
          "answer": "Option 1 text - detailed step-by-step complete solution and explanation. NEVER write just A or B or C or D.", 
          "marks": 1 
        }
      ]
    }
  ]
}
`;

            if (inputMode === 'old_paper') {
                prompt += `
5. Extract every single question from the provided old question paper.
6. For every question, write the complete, detailed step-by-step solution in the "answer" field. Show all working, logic, and proof.
7. ONLY return the JSON. No markdown wrappers, no conversational text.`;
            } else {
                prompt += `
5. ${referenceText ? 'DO NOT change the sections count, questions count, or marks allocation. Strictly use the structure parsed from the Reference Exam Format.' : 'Adjust the number of sections and questions based on the Total Marks and Difficulty.'}
6. CRITICAL MARKS REQUIREMENT: The sum of all individual question marks MUST equal exactly ${marks}. Do not generate a paper with 49 or 51 marks if 50 is requested. Mathematically verify that the distribution perfectly sums to ${marks}.
7. ONLY return the JSON. No markdown wrappers, no conversational text.`;
            }

            let rawAiResponse = "";
            let lastError = "";

            // Use the unified provider (NVIDIA → Groq → OpenRouter → Gemini)
            try {
                console.log("[ExamGen] Routing to Unified AI Provider chain...");
                const messages = [{ role: 'user', content: prompt }];
                const aiData = await getProviderResponse(messages, {
                    maxTokens: 8192,
                    temperature: 0.5,
                    taskType: 'logic'
                });
                if (aiData?.choices?.[0]?.message?.content) {
                    rawAiResponse = aiData.choices[0].message.content;
                }
            } catch (e: any) {
                console.error("[ExamGen] All AI providers failed:", e.message);
                lastError = e.message || "All AI providers failed";
            }

            if (!rawAiResponse) {
                let friendlyError = "Failed to generate the exam paper. All AI services are currently unavailable. Please try again in a few minutes.";
                if (lastError.includes("rate_limit_exceeded") || lastError.includes("429")) {
                    friendlyError = "AI Rate Limit Exceeded: The AI service is busy. Please wait 1 minute and try again.";
                } else if (lastError.includes("413")) {
                    friendlyError = "The document context is too large. Please select a specific 'Chapter' or 'Topic' to reduce size.";
                } else if (lastError.includes("401") || lastError.includes("API key not valid")) {
                    friendlyError = "AI Authorization Error: Server API keys need to be updated. Please contact support.";
                }
                return error(res, friendlyError, "AI_ERROR");
            }

            // Clean AI response to extract JSON
            let jsonStr = rawAiResponse;
            const match = rawAiResponse.match(/\{[\s\S]*\}/);
            if (match) {
                jsonStr = match[0];
            } else if (rawAiResponse.includes("Unavailable") || rawAiResponse.includes("offline") || !rawAiResponse.trim().startsWith('{')) {
                return error(res, rawAiResponse, "AI_ERROR");
            }
            
            let generatedPaper;
            try {
                generatedPaper = JSON.parse(jsonStr);
            } catch (e) {
                console.error("AI JSON Parse Error. Raw string:", jsonStr);
                if (rawAiResponse.length > 50 && !rawAiResponse.trim().startsWith('{')) {
                    return error(res, rawAiResponse, "AI_ERROR");
                }
                return error(res, "AI generated an invalid format. Please try again.", "AI_ERROR");
            }

            // Auto-detect subject metadata from generated paper
            const detectedSubject = generatedPaper.subject || subject;
            const detectedStandard = generatedPaper.standard || standard;
            const detectedBoard = generatedPaper.board || board;

            const newExam = new ExamPaper({
                subject: detectedSubject,
                board: detectedBoard,
                standard: detectedStandard,
                examScope: inputMode === 'old_paper' ? 'Old Paper Solution' : examScope,
                chapter,
                topic,
                marks,
                difficulty,
                fileName: pdfFile ? pdfFile.originalname : 'Pasted Text Input',
                filePath: pdfFile ? pdfFile.path : 'N/A',
                referenceFileName: referenceFile ? referenceFile.originalname : undefined,
                referenceFilePath: referenceFile ? referenceFile.path : undefined,
                blueprint: blueprintObj,
                language: targetLanguage,
                generatedPaper,
                creatorId: (req as any).user?.id || (req as any).user?._id
            });

            await newExam.save();

            success(res, "Exam paper generated successfully", { exam: newExam });
        } catch (err: any) {
            console.error("Exam Generator Error:", err);
            error(res, err.message, "SERVER_ERROR");
        }
    },
    
    getExams: async (req: Request, res: Response) => {
        try {
            const exams = await ExamPaper.find().sort({ createdAt: -1 });
            success(res, "Exams retrieved", { exams });
        } catch(err: any) {
            error(res, err.message, "SERVER_ERROR");
        }
    },
    
    downloadPdf: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { mode } = req.query; // 'question' or 'answer'
            
            const exam = await ExamPaper.findById(id);
            if (!exam) return error(res, "Exam paper not found", "NOT_FOUND");
            
            const paper = exam.generatedPaper;
            const isAnswerKey = mode === 'answer';
            
            // Create PDF Document using PDFKit
            const PDFDocument = require('pdfkit');
            const doc = new PDFDocument({ margin: 50, bufferPages: true });
            
            const filename = `${exam.subject}_${exam.standard}_${isAnswerKey ? 'AnswerKey' : 'QuestionPaper'}.pdf`;
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            
            doc.pipe(res);
            
            // Header Section
            doc.font('Helvetica-Bold').fontSize(22).text(exam.board.toUpperCase() + " BOARD", { align: 'center' });
            doc.moveDown(0.2);
            doc.fontSize(14).text(`CLASS: ${exam.standard} | SUBJECT: ${exam.subject}`, { align: 'center' });
            doc.moveDown(0.2);
            doc.fontSize(12).text(`Time Allowed: 3 Hours | Maximum Marks: ${exam.marks}`, { align: 'center' });
            doc.moveDown(0.2);
            doc.fontSize(11).text(isAnswerKey ? "OFFICIAL ANSWER KEY & EVALUATION SHEET" : "QUESTION PAPER", { align: 'center', underline: true });
            doc.moveDown(1.5);
            
            // Thin divider line
            doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#334155').stroke();
            doc.moveDown(1);
            
            // General Instructions
            doc.font('Helvetica-Bold').fontSize(11).text("General Instructions:");
            doc.font('Helvetica').fontSize(10);
            doc.text("1. All questions are compulsory.");
            doc.text("2. Write your answers clearly and show all steps where applicable.");
            doc.text(isAnswerKey ? "3. Evaluators should check step-by-step marking guidelines." : "3. Marks for each question are indicated against it.");
            doc.moveDown(1.5);
            
            // Render Sections and Questions
            if (paper && paper.sections) {
                for (const section of paper.sections) {
                    // Page break safeguard for section header
                    if (doc.y > 680) {
                        doc.addPage();
                    }
                    doc.font('Helvetica-Bold').fontSize(12).text(section.sectionName, { underline: true });
                    doc.moveDown(0.6);
                    
                    if (section.questions) {
                        section.questions.forEach((q: any, qIdx: number) => {
                            // Estimate total height of this question block to prevent awkward splits
                            let estimatedHeight = 35; // base question line wrap
                            if (q.options && q.options.length > 0) estimatedHeight += q.options.length * 15;
                            if (isAnswerKey && q.answer) estimatedHeight += 40;

                            if (doc.y + estimatedHeight > 700) {
                                doc.addPage();
                            }

                            // Write Question Text and Marks in a single wrapped block
                            const questionText = `Q${qIdx + 1}. ${q.question}   [Marks: ${q.marks || 1}]`;
                            doc.font('Helvetica-Bold').fontSize(10).text(questionText, { width: 500, align: 'left' });
                            doc.moveDown(0.3);
                            
                            // MCQ Options if present
                            if (q.options && q.options.length > 0) {
                                q.options.forEach((opt: string, optIdx: number) => {
                                    const optionLetter = String.fromCharCode(65 + optIdx);
                                    doc.font('Helvetica').fontSize(10).text(`      (${optionLetter}) ${opt}`, { width: 480 });
                                    doc.moveDown(0.2);
                                });
                            }
                            
                            // True/False options if present (no options array, but answer is True/False/સત્ય/અસત્ય etc)
                            const ansStr = String(q.answer || '').trim().toLowerCase();
                            const isTFQuestion = (!q.options || q.options.length === 0) && (
                                ansStr === 'true' || ansStr === 'false' || 
                                ansStr === 'સાચું' || ansStr === 'ખોટું' || 
                                ansStr === 'सत्य' || ansStr === 'असत्य'
                            );
                            if (isTFQuestion) {
                                const isGujarati = String(exam.language).toLowerCase() === 'gujarati' || 
                                                 (exam.generatedPaper && String(exam.generatedPaper.title).includes('ગુજરાતી')) ||
                                                 ansStr === 'સાચું' || ansStr === 'ખોટું';
                                const isHindi = String(exam.language).toLowerCase() === 'hindi' || ansStr === 'सत्य' || ansStr === 'असत्य';
                                
                                let tfLabel = "      (A) True      (B) False";
                                if (isGujarati) tfLabel = "      (A) સાચું      (B) ખોટું";
                                else if (isHindi) tfLabel = "      (A) सत्य      (B) असत्य";
                                
                                doc.font('Helvetica').fontSize(10).text(tfLabel, { width: 480 });
                                doc.moveDown(0.2);
                            }
                            
                            // Show Answers if Answer Key mode is active
                            if (isAnswerKey && q.answer) {
                                doc.moveDown(0.2);
                                doc.font('Helvetica-Bold').fontSize(10).fillColor('#10b981').text("   Answer/Explanation: ", { continued: true });
                                doc.font('Helvetica-Oblique').fillColor('#1e293b').text(q.answer, { width: 470 });
                                doc.fillColor('#000000');
                                doc.moveDown(0.5);
                            } else {
                                doc.moveDown(0.5);
                            }
                        });
                    }
                    doc.moveDown(1);
                }
            }
            
            // Buffering for Watermarks and Footer Page Numbers on all pages
            const pages = doc.bufferedPageRange();
            for (let i = 0; i < pages.count; i++) {
                doc.switchToPage(i);
                
                // Opacity-backed watermark
                doc.save();
                doc.fontSize(40).fillColor('#cbd5e1').opacity(0.15);
                doc.rotate(45, { origin: [300, 400] });
                doc.text("FUTURE BRTS AI", 120, 380, { align: 'center' });
                doc.restore();
                
                // Footer
                doc.save();
                doc.fontSize(9).fillColor('#64748b');
                doc.text(`Page ${i + 1} of ${pages.count}`, 50, 750, { align: 'center' });
                doc.restore();
            }
            
            doc.end();
        } catch (err: any) {
            console.error("PDF Export Error:", err);
            res.status(500).json({ status: 'error', message: err.message });
        }
    },
    
    updateExam: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { generatedPaper } = req.body;
            
            if (!generatedPaper) {
                return error(res, "Missing generatedPaper body payload.", "VALIDATION_FAILED");
            }
            
            const exam = await ExamPaper.findById(id);
            if (!exam) {
                return error(res, "Exam paper not found.", "NOT_FOUND");
            }
            
            if (generatedPaper.subject) exam.subject = generatedPaper.subject;
            if (generatedPaper.board) exam.board = generatedPaper.board;
            if (generatedPaper.standard) exam.standard = generatedPaper.standard;
            if (generatedPaper.marks) exam.marks = String(generatedPaper.marks);
            
            exam.generatedPaper = generatedPaper;
            exam.markModified('generatedPaper');
            
            await exam.save();
            success(res, "Exam paper updated successfully", { exam });
        } catch (err: any) {
            console.error("Exam Update Error:", err);
            error(res, err.message, "SERVER_ERROR");
        }
    }
};
