// Minerva AI Service — All AI calls for the education system
import { getProviderResponse } from '../../shared/services/openai.service';

// ─────────────────────────────────────────────
// HELPER: Safe JSON parse
// ─────────────────────────────────────────────
const safeJsonParse = (str: string): any => {
    let s = str.replace(/```json/g, '').replace(/```/g, '').trim();
    const first = s.indexOf('{');
    const last = s.lastIndexOf('}');
    if (first !== -1 && last !== -1) s = s.substring(first, last + 1);
    try { return JSON.parse(s); } catch { return null; }
};

// ─────────────────────────────────────────────
// SYSTEM PROMPT — Minerva Tutor Persona
// ─────────────────────────────────────────────
const MINERVA_PERSONA = (studentProfile: any) => `
You are FUTURE EDUCATION OS — an intelligent, warm, and expert AI education tutor.
You are the student's personal tutor, like a senior friend who teaches them everything.

STUDENT PROFILE:
- Name: ${studentProfile?.name || 'Student'}
- Level: ${studentProfile?.grade_level || 'class_10'}
- Board: ${studentProfile?.board || 'CBSE'}
- Medium: ${studentProfile?.medium || 'English'}
- Language Preference: ${studentProfile?.language_preference || 'english'}
- Weak Subjects: ${studentProfile?.weak_subjects?.join(', ') || 'none specified'}

YOUR RULES:
1. Talk like a caring senior/tutor — warm, encouraging, never robotic.
2. BY DEFAULT, communicate in ENGLISH.
3. If the student speaks or asks to speak in another language (like Hindi, Hinglish, Hinglish mixed, Marathi, Gujarati, etc.), IMMEDIATELY switch and communicate in that language.
4. Explain everything in an extremely simple, clear, and easy-to-understand way. Avoid high-level technical jargon unless you first explain it with a concrete everyday example.
5. FILE/IMAGE UPLOAD AWARENESS: If the user's message contains '[Uploaded File: ...]' and 'Extracted Content: ...', this represents the text parsed (via OCR) from their uploaded textbook photo or handwritten notes. You must teach, explain, and tutor strictly according to that specific material. Clean up any OCR typos or garbled words, refer to the image content in your reply, explain it in 100% simple terms with a real-life analogy, and walk through it step-by-step.
6. NEVER give boring text-only answers — always include simple examples, analogies.
7. Always end with what the student should do NEXT.
8. Keep responses precise, clear, and professional. Avoid massive walls of text.
9. If the student sends a simple greeting or short greeting message, reply with a warm, polite, and very concise greeting (1-2 sentences maximum).
`;

const DEEP_STUDY_PERSONA = (studentProfile: any) => `
You are FUTURE EDUCATION OS in DEEP STUDY MODE — an exceptionally patient, warm, interactive, and master-class personal teacher.
The student has activated Deep Study mode because they want to learn with absolute peace of mind ("sukoon ke sath") and extreme detailing ("best bariki ke sath"), feeling exactly as if a real, caring teacher is sitting right in front of them at their study table.

STUDENT PROFILE:
- Name: ${studentProfile?.name || 'Student'}
- Level: ${studentProfile?.grade_level || 'class_10'}
- Board: ${studentProfile?.board || 'CBSE'}
- Medium: ${studentProfile?.medium || 'English'}

YOUR RULES FOR DEEP STUDY MODE:
1. Adopt the persona of a world-class, ultra-patient personal mentor. Speak with a very reassuring, warm, encouraging, and calm tone (e.g., "Dekho ${studentProfile?.name || 'Student'}, bilkul chill ho kar samajhte hain...", "Koi jaldi nahi hai, sukoon se aaram se padhenge").
2. Explain everything in a 100% simple, clear, and easy-to-understand way. Avoid high-level technical jargon. Break down every complex concept into its fundamental "first principles" (absolute bariki ke sath) so a 10-year-old can easily understand.
3. FILE/IMAGE UPLOAD AWARENESS: If the user's message contains '[Uploaded File: ...]' and 'Extracted Content: ...', this represents the text parsed (via OCR) from their uploaded textbook photo or notes page. You must teach, explain, and walk through strictly according to that specific material. Acknowledge their image/file, clean up OCR spelling mistakes, explain the topics shown in that image step-by-step, and connect them with practical, day-to-day real-world analogies.
4. Do not rush. Walk through the concept step-by-step. Use vivid, day-to-day real-world analogies, stories, and historical context.
5. Communicate in friendly, natural Hinglish (or English/Hindi as preferred by the user), making them feel completely relaxed, safe, and secure. Use personal addresses like "tum" or "aap" and "beta" or "dost" naturally.
6. BE DYNAMICALLY INTERACTIVE (Not a text-dumper): Avoid throwing massive monologues of information all at once. Break the explanation into small digestible sections. Explain one section, give an analogy, and then check in:
   - Ask a small, friendly, low-pressure question to test their understanding before moving forward.
   - Example: "Kya yeh part clear hua? Ek bar tum mujhe batao ki isse tum kya samjhe, fir hum iske formula par chalenge!"
7. Structure the layout beautifully using clean markdown, bold key terms, and code blocks for formulas or definitions. Keep it highly readable and visually premium.
8. Always encourage and never judge. If the student makes a mistake, guide them gently to the correct answer with a smile in your words ("Koi baat nahi, mistakes se hi toh hum seekhte hain! Aise dekho...").
9. CURATED YOUTUBE VIDEO LINKS: At the end of your explanation (or in a logical place), always provide 1-2 curated YouTube search links in markdown format, e.g. \`[📺 Watch Video Lesson: Topic Name](https://www.youtube.com/results?search_query=...)\` with appropriate query terms (like topic, subject, and board/medium) so the student can easily click to watch a video explanation.
`;

// ─────────────────────────────────────────────
// 1. DETECT INTENT from student message
// ─────────────────────────────────────────────
export const detectStudentIntent = async (
    message: string,
    studentProfile: any
): Promise<any> => {
    const messages = [
        {
            role: 'system',
            content: `You are an education intent detector for Indian students.
Analyze the student's message and return a JSON object.

Return ONLY valid JSON:
{
    "intent": "learn_topic" | "create_session" | "upload_content" | "get_homework" | "generate_exam" | "ask_doubt" | "continue_session" | "onboarding" | "general_chat",
    "subject": "detected subject or null",
    "topic": "specific topic or null",
    "grade_level": "class_1 to phd or exam type (upsc/ssc/jee/neet/banking) or null",
    "board": "cbse | icse | maharashtra_ssc | up_board | gseb | rbse | mpbse | tnbse | kseeb | wbbse | pseb | hbse | general | null",
    "state": "state name or null",
    "medium": "hindi | english | marathi | gujarati | tamil | kannada | bengali | punjabi | null",
    "education_type": "school | college | competitive | professional | govt_exam | null",
    "language": "hi | en | mr | gu | ta | null",
    "confidence": 0.0 to 1.0,
    "needs_onboarding": true | false
}

Examples:
- "Mujhe class 10 physics padni hai" → learn_topic, class_10, school, cbse
- "Maharashtra board SSC science" → learn_topic, class_10, school, maharashtra_ssc
- "UPSC ke liye Indian Polity" → learn_topic, null, upsc, general, govt_exam
- "JEE ke liye calculus" → learn_topic, mathematics, jee, cbse, competitive
- "Aaj ka homework do" → get_homework
- "Exam generate karo" → generate_exam`
        },
        { role: 'user', content: `Student message: "${message}"\nStudent grade level: ${studentProfile?.grade_level || 'unknown'}\nStudent board: ${studentProfile?.board || 'unknown'}` }
    ];

    const res = await getProviderResponse(messages, { jsonMode: true, maxTokens: 500, temperature: 0.2 });
    const text = res?.choices?.[0]?.message?.content || '{}';
    return safeJsonParse(text) || { intent: 'general_chat', confidence: 0.5 };
};

// ─────────────────────────────────────────────
// 2. CHAT RESPONSE — conversational reply
// ─────────────────────────────────────────────
export const getMinervaChat = async (
    message: string,
    studentProfile: any,
    chatHistory: any[],
    context?: string,
    deep_study?: boolean
): Promise<{ reply: string; content_type: string; metadata: any }> => {
    const history = chatHistory.slice(-6).map(m => ({
        role: m.role === 'student' ? 'user' : 'assistant',
        content: m.content
    }));

    const persona = deep_study ? DEEP_STUDY_PERSONA(studentProfile) : MINERVA_PERSONA(studentProfile);

    const messages = [
        { role: 'system', content: persona + (context ? `\n\nCONTEXT: ${context}` : '') },
        ...history,
        { role: 'user', content: message }
    ];

    const res = await getProviderResponse(messages, { maxTokens: 1200, temperature: 0.75 });
    const reply = res?.choices?.[0]?.message?.content || 'Main samajh nahi paya. Kya aap dobara bata sakte ho?';
    return { reply, content_type: 'text', metadata: null };
};

// ─────────────────────────────────────────────
// 3. GENERATE ROADMAP from topic/content
// ─────────────────────────────────────────────
export const generateRoadmap = async (
    subject: string,
    topic: string,
    grade_level: string,
    board: string,
    medium: string,
    source_content?: string,
    language: string = 'english'
): Promise<any> => {
    const boardLabel = getBoardLabel(board);
    const gradeLabel = getGradeLabel(grade_level);

    const messages = [
        {
            role: 'system',
            content: `You are an expert Indian education curriculum designer.
Create a detailed topic roadmap for the given subject/topic.
Board: ${boardLabel}, Grade: ${gradeLabel}, Medium: ${medium}, Target Language: ${language}

Return ONLY valid JSON:
{
    "title": "Session title",
    "subject": "subject name",
    "estimated_hours": number,
    "board_pattern": "brief note about this board's exam pattern",
    "nodes": [
        {
            "order_index": 1,
            "title": "Topic name",
            "chapter": "Chapter name if applicable",
            "topic": "Main topic",
            "subtopic": "Specific subtopic",
            "priority": "HIGH" | "MEDIUM" | "LOW",
            "priority_reason": "Why this is important for exam",
            "board_relevance": "How this topic appears in board exams",
            "exam_weightage_percent": 0-100,
            "difficulty": "basic" | "intermediate" | "advanced",
            "estimated_time_minutes": number,
            "key_points": ["point1", "point2", "point3"],
            "key_formulas": ["formula1", "formula2"]
        }
    ]
}

RULES:
- HIGH priority = most likely to appear in ${boardLabel} exam (60% of nodes)
- MEDIUM = moderate importance (30%)  
- LOW = good to know (10%)
- First node should always be UNLOCKED, rest LOCKED initially
- Order from fundamental to advanced
- For government exams (UPSC/SSC/JEE/NEET), follow their exact syllabus pattern
- For state boards, follow that state's specific curriculum
- Include 5-15 nodes depending on topic depth
- IMPORTANT: Generate ALL text fields in the JSON (including title, board_pattern, chapter, topic, subtopic, priority_reason, board_relevance, key_points, key_formulas) in the target language: ${language}. If target language is Hinglish, write them in natural Romanized Hindi.`
        },
        {
            role: 'user',
            content: `Create roadmap for:
Subject: ${subject}
Topic: ${topic || subject}
${source_content ? `Content to extract from:\n${source_content.substring(0, 2000)}` : ''}`
        }
    ];

    const res = await getProviderResponse(messages, { jsonMode: true, maxTokens: 3000, temperature: 0.3 });
    const text = res?.choices?.[0]?.message?.content || '{}';
    return safeJsonParse(text);
};

// ─────────────────────────────────────────────
// 4. GENERATE TOPIC CONTENT (Learn page)
// ─────────────────────────────────────────────
export const generateTopicContent = async (
    node: any,
    studentProfile: any,
    sessionLanguage?: string
): Promise<any> => {
    const lang = sessionLanguage || studentProfile?.language_preference || 'hinglish';
    const board = getBoardLabel(studentProfile?.board || 'cbse');
    const grade = getGradeLabel(studentProfile?.grade_level || 'class_10');

    const messages = [
        {
            role: 'system',
            content: `You are MINERVA, an expert tutor. Generate complete learning content for a topic.
Language: ${lang} | Board: ${board} | Grade: ${grade}

Return ONLY valid JSON:
{
    "explanation_simple": "Simple 3-4 line explanation like talking to a 10-year-old. Use analogies.",
    "explanation_detailed": "Full detailed theory (500-800 words). Include: definition, concept, how it works, why it matters. Use ${lang}.",
    "real_world_example": "A vivid real-life example or story that makes the concept stick. 100-150 words.",
    "key_points": ["5-8 key takeaway bullet points"],
    "key_formulas": ["any formulas or rules, empty array if none"],
    "memory_trick": "A clever mnemonic or trick to remember this topic",
    "board_specific_note": "What to specifically focus on for ${board} exam format",
    "youtube_queries": ["3 specific YouTube search queries to find best videos for this topic in ${lang}"],
    "micro_tasks": [
        {
            "type": "text_answer" | "fill_blank" | "mcq" | "numerical",
            "prompt": "Task question/instruction",
            "options": ["A", "B", "C", "D"] (for MCQ only),
            "correct_answer": "Expected answer or key points",
            "marks": 2-10,
            "difficulty": "easy" | "medium" | "hard",
            "is_homework": false
        }
    ],
    "homework_tasks": [
        {
            "type": "text_answer" | "fill_blank" | "mcq" | "numerical",
            "prompt": "Homework question",
            "correct_answer": "Expected answer",
            "marks": 2-10,
            "difficulty": "medium" | "hard",
            "is_homework": true
        }
    ]
}

RULES:
- explanation_simple (Story): MUST be a highly creative, engaging, and simple story or real-life analogy. Explain the core concept using a completely non-technical metaphor (e.g., explaining traffic congestion for resistance, or water flow for current). It must feel like an interesting story, not a textbook paragraph, so that the student can understand it intuitively.
- explanation_detailed (Theory/Concept): MUST be a detailed, technical, and comprehensive breakdown (500-800 words) in ${lang}. Include formal definitions, equations/derivations (if applicable), working mechanisms, applications, and strict syllabus-aligned concepts. This MUST be completely distinct in content and tone from the simple story analogy.
- micro_tasks: Generate 3-4 progressive tasks (easy, medium, hard). Ensure tasks are completely unique with no duplicate prompts, covering diverse aspects of the topic (e.g. one conceptual question, one MCQ, one problem-solving task).
- homework_tasks: Generate 2-3 tasks, slightly harder than micro_tasks, ensuring completely unique questions.
- youtube_queries: specific enough to find real educational videos
- Key formulas: include in proper format (e.g., "F = ma (Force = mass × acceleration)")`
        },
        {
            role: 'user',
            content: `Generate learning content for:
Title: ${node.title}
Chapter: ${node.chapter}
Topic: ${node.topic}
Subtopic: ${node.subtopic}
Difficulty: ${node.difficulty}
Key Points provided: ${node.key_points?.join(', ')}
Key Formulas: ${node.key_formulas?.join(', ')}
Board Relevance: ${node.board_relevance}`
        }
    ];

    const res = await getProviderResponse(messages, { jsonMode: true, maxTokens: 4000, temperature: 0.5 });
    const text = res?.choices?.[0]?.message?.content || '{}';
    return safeJsonParse(text);
};

// ─────────────────────────────────────────────
// 5. GRADE STUDENT ANSWER
// ─────────────────────────────────────────────
export const gradeStudentAnswer = async (
    task: any,
    studentAnswer: string,
    language: string
): Promise<{ score: number; feedback: string; correction: string; passed: boolean }> => {
    const messages = [
        {
            role: 'system',
            content: `You are a fair and encouraging teacher grading a student's answer.
Language to respond in: ${language}

Return ONLY valid JSON:
{
    "score": 0-100,
    "feedback": "Warm, encouraging feedback in ${language}. What they did right, what to improve.",
    "correction": "The correct/ideal answer explanation",
    "passed": true if score >= 60
}

RULES:
- Score 90-100: Excellent, near perfect
- Score 70-89: Good, minor gaps
- Score 50-69: Partial understanding
- Score below 50: Needs revision
- Be ENCOURAGING even for low scores. Never demotivate.
- Feedback should feel like a warm teacher, not a machine.`
        },
        {
            role: 'user',
            content: `Task: ${task.prompt}
Expected Answer: ${task.correct_answer || 'Open-ended'}
Task Type: ${task.type}
Subject: ${task.subject}
Topic: ${task.topic_title}
Student's Answer: ${studentAnswer}`
        }
    ];

    const res = await getProviderResponse(messages, { jsonMode: true, maxTokens: 600, temperature: 0.4 });
    const text = res?.choices?.[0]?.message?.content || '{}';
    const parsed = safeJsonParse(text);
    return {
        score: parsed?.score || 0,
        feedback: parsed?.feedback || 'Answer recorded.',
        correction: parsed?.correction || '',
        passed: parsed?.passed || false
    };
};

// ─────────────────────────────────────────────
// 6. GENERATE EXAM PAPER
// ─────────────────────────────────────────────
export const generateExamPaper = async (
    session: any,
    weakNodes: any[],
    strongNodes: any[],
    examType: string,
    totalMarks: number,
    board: string,
    grade: string
): Promise<any> => {
    const boardLabel = getBoardLabel(board);
    const gradeLabel = getGradeLabel(grade);

    // Build weak topic list for weighted generation
    const weakTopics = weakNodes.slice(0, 5).map(n => n.title).join(', ');
    const strongTopics = strongNodes.slice(0, 3).map(n => n.title).join(', ');
    const allTopics = [...weakNodes, ...strongNodes].map(n => n.title).join(', ');

    const messages = [
        {
            role: 'system',
            content: `You are an expert exam paper generator for Indian education boards.
Board: ${boardLabel} | Grade: ${gradeLabel} | Exam Type: ${examType} | Total Marks: ${totalMarks}

Return ONLY valid JSON:
{
    "title": "Exam title",
    "instructions": "General exam instructions",
    "duration_minutes": number,
    "sections": [
        {
            "section_name": "Section A",
            "section_type": "mcq" | "short_answer" | "long_answer" | "fill_blank",
            "marks_per_question": number,
            "total_questions": number,
            "section_marks": number,
            "questions": [
                {
                    "question_number": 1,
                    "type": "mcq" | "short" | "long" | "fill_blank" | "true_false",
                    "question": "Question text",
                    "options": ["A", "B", "C", "D"] (MCQ only),
                    "marks": number,
                    "topic": "topic this question is from",
                    "difficulty": "easy" | "medium" | "hard",
                    "expected_answer": "Model answer / key points"
                }
            ]
        }
    ]
}

RULES:
- Follow exact ${boardLabel} exam paper format
- Weak topics: ${weakTopics} → 60% questions from here
- Strong topics: ${strongTopics} → 20% questions from here
- Mixed topics: 20% from other covered topics
- Section A: MCQ (1 mark each) — 20% of total marks
- Section B: Short Answer (2-3 marks) — 40% of total marks
- Section C: Long Answer (5 marks) — 40% of total marks
- Questions should be board-standard quality
- Include questions at different difficulty levels`
        },
        {
            role: 'user',
            content: `Generate ${examType} exam paper.
All covered topics: ${allTopics}
Total marks: ${totalMarks}`
        }
    ];

    const res = await getProviderResponse(messages, { jsonMode: true, maxTokens: 4000, temperature: 0.4 });
    const text = res?.choices?.[0]?.message?.content || '{}';
    return safeJsonParse(text);
};

// ─────────────────────────────────────────────
// 7. ONBOARDING — Quick profile from chat
// ─────────────────────────────────────────────
export const extractProfileFromChat = async (message: string): Promise<any> => {
    const messages = [
        {
            role: 'system',
            content: `Extract student profile from their message. Return ONLY valid JSON:
{
    "grade_level": "class_1|class_2|...|class_10|class_11|class_12|graduation|masters|phd|jee|neet|upsc|ssc|banking|railway|ca|cs|iti|polytechnic|null",
    "education_type": "school|college|competitive|professional|govt_exam|null",
    "board": "cbse|icse|maharashtra_ssc|up_board|gseb|rbse|mpbse|tnbse|kseeb|wbbse|pseb|hbse|general|null",
    "state": "state name or null",
    "medium": "hindi|english|marathi|gujarati|tamil|kannada|bengali|punjabi|null",
    "subject": "main subject they want to study or null",
    "language_preference": "hinglish|hindi|english|regional",
    "confidence": 0.0-1.0
}`
        },
        { role: 'user', content: message }
    ];

    const res = await getProviderResponse(messages, { jsonMode: true, maxTokens: 400, temperature: 0.1 });
    const text = res?.choices?.[0]?.message?.content || '{}';
    return safeJsonParse(text) || {};
};

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
export const getBoardLabel = (board: string): string => {
    const labels: Record<string, string> = {
        cbse: 'CBSE (Central Board)',
        icse: 'ICSE/ISC',
        maharashtra_ssc: 'Maharashtra SSC/HSC Board',
        up_board: 'UP Board (UPMSP)',
        gseb: 'Gujarat Board (GSEB)',
        rbse: 'Rajasthan Board (RBSE)',
        mpbse: 'MP Board (MPBSE)',
        tnbse: 'Tamil Nadu Board (Samacheer)',
        kseeb: 'Karnataka Board (KSEEB)',
        wbbse: 'West Bengal Board (WBBSE)',
        pseb: 'Punjab Board (PSEB)',
        hbse: 'Haryana Board (HBSE)',
        bseb: 'Bihar Board (BSEB)',
        general: 'General',
        upsc: 'UPSC Civil Services',
        ssc: 'SSC (Staff Selection)',
        banking: 'Banking Exams (IBPS/SBI)',
        railway: 'Railway (RRB)',
        jee: 'JEE Mains & Advanced',
        neet: 'NEET UG/PG',
        gate: 'GATE',
        cat: 'CAT/MBA Entrance',
        ca: 'CA (ICAI)',
        cs: 'CS (ICSI)',
    };
    return labels[board] || board.toUpperCase();
};

export const getGradeLabel = (grade: string): string => {
    const labels: Record<string, string> = {
        class_1: 'Class 1', class_2: 'Class 2', class_3: 'Class 3',
        class_4: 'Class 4', class_5: 'Class 5', class_6: 'Class 6',
        class_7: 'Class 7', class_8: 'Class 8', class_9: 'Class 9',
        class_10: 'Class 10', class_11: 'Class 11', class_12: 'Class 12',
        graduation: 'Graduation (UG)', masters: 'Post Graduation (PG)',
        phd: 'PhD / Research', jee: 'JEE Aspirant', neet: 'NEET Aspirant',
        upsc: 'UPSC Aspirant', ssc: 'SSC Aspirant', banking: 'Banking Aspirant',
        railway: 'Railway Aspirant', gate: 'GATE Aspirant', cat: 'CAT Aspirant',
        ca: 'CA Student', cs: 'CS Student', iti: 'ITI Student',
        polytechnic: 'Polytechnic Student',
    };
    return labels[grade] || grade;
};

// ─────────────────────────────────────────────
// 8. GENERATE STUDENT STUDY MATERIAL (E-Builder)
// ─────────────────────────────────────────────
export const generateStudentStudyMaterial = async (
    subject: string,
    title: string,
    type: string, // 'summary' | 'flashcards' | 'cheatsheet' | 'essay'
    language: string,
    grade_level: string,
    board: string
): Promise<any> => {
    let systemInstruction = "";
    if (type === 'flashcards') {
        systemInstruction = `You are an expert tutor. Create a list of 8-12 interactive flashcards for the topic.
Format: JSON array of objects: [{"term": "concept name", "definition": "clear concise explanation"}]
Language: ${language} | Grade: ${grade_level} | Board: ${board}

Return ONLY a valid JSON array. Do not put markdown wrapping or code blocks around it.`;
    } else if (type === 'cheatsheet') {
        systemInstruction = `You are an expert tutor. Create a high-yield exam cheatsheet for the topic.
Include key formulas, quick definitions, laws, and common board-exam tips.
Format: Markdown. Keep it structured and bulleted.
Language: ${language} | Grade: ${grade_level} | Board: ${board}`;
    } else if (type === 'essay') {
        systemInstruction = `You are an expert tutor. Create a detailed study guide or essay outline for the topic.
Format: Markdown with clean heading structure (H1, H2, H3).
Language: ${language} | Grade: ${grade_level} | Board: ${board}`;
    } else { // summary / revision notes
        systemInstruction = `You are an expert tutor. Create comprehensive yet clear revision notes for the topic.
Format: Markdown with bullet points, brief examples, and analogies.
Language: ${language} | Grade: ${grade_level} | Board: ${board}`;
    }

    const messages = [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: `Create study material of type: "${type}" for the Course/Topic: "${title}" (Subject: "${subject}")` }
    ];

    const res = await getProviderResponse(messages, {
        jsonMode: type === 'flashcards',
        maxTokens: 3000,
        temperature: 0.5
    });

    const content = res?.choices?.[0]?.message?.content || '';
    if (type === 'flashcards') {
        return safeJsonParse(content) || [];
    }
    return content;
};

// ─── TRANSLATE CONTENT ────────────────────────
export const translateContent = async (
    text: string,
    targetLanguage: string
): Promise<string> => {
    if (!text || !text.trim()) return '';

    const messages = [
        {
            role: 'system',
            content: `You are an expert multi-lingual educational translator.
Translate the user's provided educational text into ${targetLanguage}.

RULES:
1. Preserve all markdown structure, code blocks, lists, links, inline equations, and bold text exactly as they are in the source.
2. Only translate the prose and explanations.
3. Keep standard English technical terms (like Resistor, Current, Gravity, Mitochondria) in English script or phonetic script if they are commonly used that way (e.g. if translating to Hinglish or Hindi, you can use "resistor" or "current" directly instead of translating them to Sanskrit/pure Hindi terms like "प्रतिरोधक").
4. Return ONLY the translated markdown text. Do not add any greetings, preambles, or markdown wrapping. Just output the translation itself.`
        },
        {
            role: 'user',
            content: text
        }
    ];

    const res = await getProviderResponse(messages, {
        maxTokens: 3500,
        temperature: 0.3
    });

    return res?.choices?.[0]?.message?.content || text;
};

// ─────────────────────────────────────────────
// 9. GRADE EXAM WRITTEN ANSWERS IN BULK
// ─────────────────────────────────────────────
export const gradeExamWrittenAnswers = async (
    questionsAndAnswers: {
        question_number: number;
        question: string;
        expected_answer?: string;
        student_answer: string;
        marks: number;
        topic: string;
    }[],
    language: string
): Promise<Record<number, { obtained_marks: number; feedback: string; correction: string }>> => {
    if (questionsAndAnswers.length === 0) return {};

    const messages = [
        {
            role: 'system',
            content: `You are an expert exam evaluator grading student written answers for academic exams.
You will receive a list of questions, expected reference answers, student answers, and maximum marks.
Evaluate each answer carefully, award realistic obtained marks (0 to max marks), and provide constructive, warm feedback in ${language}.
Also provide a short ideal correction/explanation for any points they missed.

Return ONLY a valid JSON object matching this schema:
{
    "grades": {
        "1": {
            "obtained_marks": number,
            "feedback": "Warm feedback text",
            "correction": "Ideal answer explanation"
        }
    }
}
Note: The keys of "grades" should be the question_number as strings (e.g. "1", "2").
Ensure strict adherence to JSON formatting. Return nothing else.`
        },
        {
            role: 'user',
            content: `Grade the following answers:
${JSON.stringify(questionsAndAnswers, null, 2)}`
        }
    ];

    try {
        const res = await getProviderResponse(messages, { jsonMode: true, maxTokens: 2500, temperature: 0.3 });
        const text = res?.choices?.[0]?.message?.content || '{}';
        const parsed = safeJsonParse(text);
        return parsed?.grades || {};
    } catch (err) {
        console.error('[gradeExamWrittenAnswers Error]', err);
        return {};
    }
};


