import { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
const pdfParse = require('pdf-parse');
const Tesseract = require('tesseract.js');
import { callGroqAI, callGeminiAI } from '../collage_project/multi_agent.service';
import ExamPaper from '../../models/exam_paper.model';

const error = (res: Response, message: string, code: string) => res.status(400).json({ status: 'error', message, code });
const success = (res: Response, message: string, data: any) => res.status(200).json({ status: 'success', message, data });

export const examGeneratorController = {
    generateExam: async (req: Request, res: Response) => {
        try {
            const { 
                subject, board, standard, stream, examScope, chapter, topic, marks, difficulty,
                sourceType = 'file', pastedText = '', inputMode = 'syllabus'
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
                        textContent = parsedPdf.text.trim();
                    } else if (pdfFile.mimetype.startsWith('image/')) {
                        console.log("Starting OCR for primary image file...");
                        const { data: { text } } = await Tesseract.recognize(pdfFile.path, 'eng');
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

            if (textContent.length > 20000) {
                textContent = textContent.substring(0, 20000) + '...';
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

            let prompt = `You are an Expert Academic Examiner and Paper Setter for ${board} board, ${standard} standard.`;

            if (inputMode === 'old_paper') {
                prompt += `
                
SMART LANGUAGE DETECTION:
Analyze the language of the Past/Old Question Paper below (e.g. Hindi, Gujarati, English). You MUST generate the entire Exam Question Paper and the detailed solutions/answers exactly in that same language.

Your task is to:
1. Identify all questions in the provided Past/Old Question Paper.
2. Formulate a set of Highly Important Predicted Questions (similar in type, style, syllabus scope, and marks weightage to the old paper) to prepare the student.
3. Solve all predicted questions with comprehensive, detailed answers.

Parameters:
- Board: ${board}
- Subject: ${subject}
- Standard: ${standard}
${stream ? `- Stream: ${stream}` : ''}
- Total Marks: ${marks}
- Difficulty: ${difficulty}

Past/Old Question Paper Content:
"""
${textContent}
"""
`;
            } else {
                prompt += `

SMART LANGUAGE DETECTION: 
Analyze the language of the Syllabus/Textbook Material below (e.g. Hindi, Gujarati, English). You MUST generate the entire Exam Question Paper exactly in that same language. Do NOT translate the output to English if the input is in Hindi or Gujarati. Use the same language for the JSON structure values (like questions, options, section names) as the input material.

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
2. The JSON MUST follow this exact structure:
{
  "title": "${inputMode === 'old_paper' ? `Important Predicted Paper: ${subject}` : `Exam Paper: ${subject}`}",
  "subject": "${subject}",
  "standard": "${standard}",
  "marks": "${marks}",
  "sections": [
    {
      "sectionName": "Section A: Multiple Choice Questions",
      "questions": [
        { "question": "What is...", "options": ["A", "B", "C", "D"], "answer": "A", "marks": 1 }
      ]
    },
    {
      "sectionName": "Section B: Descriptive Questions",
      "questions": [
        { "question": "Explain...", "answer": "Detailed answer here...", "marks": 5 }
      ]
    }
  ]
}
${referenceText ? '3. DO NOT change the sections count, questions count, or marks allocation. Strictly use the structure parsed from the Reference Exam Format.' : '3. Adjust the number of sections and questions based on the Total Marks and Difficulty.'}
4. CRITICAL MARKS REQUIREMENT: The sum of all individual question marks MUST equal exactly ${marks}. Do not generate a paper with 49 or 51 marks if 50 is requested. Mathematically verify that the distribution perfectly sums to ${marks}.
5. ONLY return the JSON. No markdown wrappers, no conversational text.`;

            // Completely bypass Groq and ONLY use Gemini 2.5 Flash for exams
            console.log("Routing Exam Generator strictly to Gemini 2.5 Flash...");
            const rawAiResponse = await callGeminiAI(prompt);
            
            if (!rawAiResponse) {
                return error(res, "Gemini AI failed to generate the exam. Please try again.", "AI_ERROR");
            }

            // Clean AI response to extract JSON
            let jsonStr = rawAiResponse;
            const match = rawAiResponse.match(/\{[\s\S]*\}/);
            if (match) {
                jsonStr = match[0];
            }
            
            let generatedPaper;
            try {
                generatedPaper = JSON.parse(jsonStr);
            } catch (e) {
                console.error("AI JSON Parse Error. Raw string:", jsonStr);
                return error(res, "AI generated an invalid format. Please try again.", "AI_ERROR");
            }

            const newExam = new ExamPaper({
                subject,
                board,
                standard,
                examScope: inputMode === 'old_paper' ? 'Old Paper Solution' : examScope,
                chapter,
                topic,
                marks,
                difficulty,
                fileName: pdfFile ? pdfFile.originalname : 'Pasted Text Input',
                filePath: pdfFile ? pdfFile.path : 'N/A',
                referenceFileName: referenceFile ? referenceFile.originalname : undefined,
                referenceFilePath: referenceFile ? referenceFile.path : undefined,
                generatedPaper
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
                    doc.font('Helvetica-Bold').fontSize(13).text(section.sectionName, { underline: true });
                    doc.moveDown(0.5);
                    
                    if (section.questions) {
                        section.questions.forEach((q: any, qIdx: number) => {
                            // Question text and marks
                            doc.font('Helvetica-Bold').fontSize(10).text(`Q${qIdx + 1}. `, { continued: true });
                            doc.font('Helvetica').text(`${q.question} `, { continued: true });
                            doc.font('Helvetica-Bold').text(`[Marks: ${q.marks || 1}]`, { align: 'right' });
                            doc.moveDown(0.3);
                            
                            // MCQ Options if present
                            if (q.options && q.options.length > 0) {
                                q.options.forEach((opt: string, optIdx: number) => {
                                    const optionLetter = String.fromCharCode(65 + optIdx);
                                    doc.font('Helvetica').fontSize(10).text(`  (${optionLetter}) ${opt}`);
                                    doc.moveDown(0.2);
                                });
                            }
                            
                            // Show Answers if Answer Key mode is active
                            if (isAnswerKey && q.answer) {
                                doc.moveDown(0.2);
                                doc.font('Helvetica-Bold').fontSize(10).fillColor('#10b981').text("Answer/Explanation: ", { continued: true });
                                doc.font('Helvetica-Oblique').fillColor('#1e293b').text(q.answer);
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
