export interface SmartBoardStep {
    stepNumber: number;
    title: string;
    explanation: string;
    latexOrFormula: string;
}

/**
 * Cleans LaTeX and Markdown tags for pristine chalk blackboard rendering
 */
export const cleanMathText = (str: string): string => {
    if (!str) return '';
    return str
        .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)') // \frac{a}{b} -> (a / b)
        .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')               // \sqrt{x} -> √(x)
        .replace(/\\pm/g, '±')
        .replace(/\\times/g, '×')
        .replace(/\\cdot/g, '·')
        .replace(/\\degree/g, '°')
        .replace(/\\theta/g, 'θ')
        .replace(/\\pi/g, 'π')
        .replace(/\\alpha/g, 'α')
        .replace(/\\beta/g, 'β')
        .replace(/\\Delta/g, 'Δ')
        .replace(/\\text\{([^}]+)\}/g, '$1')
        .replace(/[\*#`_]/g, '')                               // Remove **, ##, `, _
        .replace(/\$\$/g, '')
        .replace(/\$/g, '')
        .replace(/\s+/g, ' ')
        .trim();
};

export const parseMessageToSmartBoardSteps = (
    content: string, 
    fallbackTitle: string = 'Maths / Science Solution'
): { title: string; steps: SmartBoardStep[] } => {
    if (!content) {
        return {
            title: fallbackTitle,
            steps: [
                { 
                    stepNumber: 1, 
                    title: 'Step 1: Given Parameters & Core Concept Setup', 
                    explanation: `Identify given values and core equations for ${fallbackTitle}.`, 
                    latexOrFormula: `Given: ${fallbackTitle} ==> Core Equation: f(x) = ...` 
                },
                { 
                    stepNumber: 2, 
                    title: 'Step 2: Step-by-Step Value Substitution', 
                    explanation: 'Substitute known quantities into core formula and expand terms.', 
                    latexOrFormula: 'Step 2: Substitute Values & Perform Algebraic Expansion' 
                },
                { 
                    stepNumber: 3, 
                    title: 'Step 3: Intermediate Calculations & Simplification', 
                    explanation: 'Calculate intermediate steps and simplify algebraic terms.', 
                    latexOrFormula: 'Step 3: Simplify Terms & Combine Like Terms' 
                },
                { 
                    stepNumber: 4, 
                    title: 'Step 4: Final Verified Solution & Result Box', 
                    explanation: 'Verify final calculations and state conclusion with proper units.', 
                    latexOrFormula: 'Final Verified Result ✅' 
                }
            ]
        };
    }

    // 1. Universal Pre-processing: Inject line breaks (\n) before Step markers if text is continuous
    let normalizedContent = content
        .replace(/(?<!^)(\bStep \d+:?|\b\d+[\.\)]\s+[A-Z]|\bPhase \d+:?|\bSection \d+:?|\bDerivation \d+:?|\bJournal Entry \d+:?|\bGiven:?|\bSolution:?|\bResult:?|\bFinal Answer:?)/gi, '\n$1');

    const rawLines = normalizedContent.split('\n').map(l => l.trim()).filter(Boolean);

    // 2. Extract Clean Dynamic Topic Title from First Lines or Header
    let extractedTitle = fallbackTitle;
    const headerLine = rawLines.find(l => l.startsWith('#') || l.startsWith('**Topic') || l.startsWith('Title:') || l.startsWith('Question:'));
    if (headerLine) {
        extractedTitle = cleanMathText(headerLine.replace(/^(#+|\*\*Topic:?|Title:?|Question:?)\s*/i, ''));
    } else if (rawLines.length > 0) {
        extractedTitle = cleanMathText(rawLines[0].slice(0, 60));
        // Remove 'To evaluate this expression' generic intros from title
        if (extractedTitle.toLowerCase().startsWith('to evaluate') || extractedTitle.toLowerCase().startsWith('let\'s break')) {
            extractedTitle = fallbackTitle;
        }
    }
    if (!extractedTitle || extractedTitle.length < 3) {
        extractedTitle = fallbackTitle;
    }

    // 3. Partition Lines into Dynamic Step Blocks
    const stepBlocks: { title?: string; lines: string[] }[] = [];
    let currentBlock: { title?: string; lines: string[] } | null = null;

    rawLines.forEach((line) => {
        const cleanLine = cleanMathText(line);
        if (!cleanLine) return;

        const isStepHeader = /^(\*\*Step \d+:?|Step \d+:?|\d+[\.\)]|Phase \d+:?|Section \d+:?|Given:?|Solution:?|Result:?|Derivation \d+:?|Journal Entry \d+:?|Transaction \d+:?|Year \d+:?)/i.test(line);

        if (isStepHeader || !currentBlock) {
            if (currentBlock) {
                stepBlocks.push(currentBlock);
            }
            const headerMatch = cleanLine.match(/^(Step \d+:?|\d+[\.\)]|Phase \d+:?|Section \d+:?|Given:?|Solution:?|Result:?|Derivation \d+:?|Journal Entry \d+:?|Transaction \d+:?|Year \d+:?)\s*(.*)/i);
            const titleText = headerMatch && headerMatch[2] ? headerMatch[2].slice(0, 60) : cleanLine.slice(0, 60);
            currentBlock = {
                title: titleText || 'Teacher Blackboard Step',
                lines: [cleanLine]
            };
        } else {
            currentBlock.lines.push(cleanLine);
        }
    });

    if (currentBlock) {
        stepBlocks.push(currentBlock);
    }

    // 4. UNLIMITED DYNAMIC STEP GENERATION (1 to 20+ steps based on content depth)
    const steps: SmartBoardStep[] = [];

    if (stepBlocks.length > 0) {
        stepBlocks.forEach((b, idx) => {
            const num = idx + 1;
            const fullText = b.lines.map(cleanMathText).join(' ');
            
            // Extract calculation equation line if present, else fallback to block title/text
            const formulaLine = b.lines.map(cleanMathText).find(l => l.includes('=') || l.includes('×') || l.includes('÷') || l.includes('+') || l.includes('-') || l.includes('√') || l.includes('/') || l.includes('±') || l.includes('→')) || b.lines[0] || fullText;
            
            steps.push({
                stepNumber: num,
                title: `Step ${num}: ${b.title || 'Teacher Blackboard Step'}`,
                explanation: fullText,
                latexOrFormula: formulaLine
            });
        });
    } else {
        // Fallback for single block
        const mathLines = rawLines.map(cleanMathText).filter(l => l.includes('=') || l.includes('+') || l.includes('-') || l.includes('√') || l.includes('/') || l.includes('×') || l.includes('±'));
        
        steps.push({
            stepNumber: 1,
            title: 'Step 1: Given Data & Concept Setup',
            explanation: cleanMathText(rawLines[0]) || `Set up problem parameters for ${extractedTitle}`,
            latexOrFormula: mathLines[0] || cleanMathText(rawLines[0]) || `Topic: ${extractedTitle}`
        });

        steps.push({
            stepNumber: 2,
            title: 'Step 2: Step-by-Step Derivation & Calculation',
            explanation: rawLines.slice(1, Math.max(2, rawLines.length - 1)).map(cleanMathText).join(' ') || 'Apply rules of algebra and arithmetic step-by-step.',
            latexOrFormula: mathLines[1] || mathLines[0] || 'Step 2: Substitute & Calculate'
        });

        steps.push({
            stepNumber: 3,
            title: 'Step 3: Final Verified Answer & Result Box',
            explanation: cleanMathText(rawLines[rawLines.length - 1]) || 'State final evaluated value and check against standard solution format.',
            latexOrFormula: mathLines[mathLines.length - 1] || 'Final Verified Result ✅'
        });
    }

    return { title: extractedTitle, steps };
};
