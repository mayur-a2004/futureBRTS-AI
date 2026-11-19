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

    // 1. Universal Pre-processing: Split continuous text into distinct lines on bullets, steps, numbers, or colons
    let normalizedContent = content
        .replace(/(?<!^)(\bStep \d+:?|\b\d+[\.\)]\s+|\bPhase \d+:?|\bSection \d+:?|\bPoint \d+:?|[-*•]\s+|\bGiven:?|\bSolution:?|\bResult:?|\bFinal Answer:?)/gi, '\n$1');

    const rawLines = normalizedContent
        .split('\n')
        .map(l => l.trim().replace(/^[-*•]\s*/, '')) // Remove leading bullet markers
        .filter(Boolean);

    // 2. Extract Clean Dynamic Topic Title from First Lines or Header
    let extractedTitle = fallbackTitle;
    const headerLine = rawLines.find(l => l.startsWith('#') || l.startsWith('**Topic') || l.startsWith('Title:') || l.startsWith('Question:'));
    if (headerLine) {
        extractedTitle = cleanMathText(headerLine.replace(/^(#+|\*\*Topic:?|Title:?|Question:?)\s*/i, ''));
    } else if (rawLines.length > 0) {
        extractedTitle = cleanMathText(rawLines[0].slice(0, 60));
        if (extractedTitle.toLowerCase().startsWith('to evaluate') || extractedTitle.toLowerCase().startsWith('let\'s break')) {
            extractedTitle = fallbackTitle;
        }
    }
    if (!extractedTitle || extractedTitle.length < 3) {
        extractedTitle = fallbackTitle;
    }

    // 3. Partition Lines into Individual Dynamic Step Cards (One Step Card per Bullet Point / Logical Point)
    const steps: SmartBoardStep[] = [];

    rawLines.forEach((line, idx) => {
        const cleanLine = cleanMathText(line);
        if (!cleanLine || cleanLine.length < 2) return;

        // Extract formula/calculation equation line if present
        const hasFormula = cleanLine.includes('=') || cleanLine.includes('×') || cleanLine.includes('÷') || 
                           cleanLine.includes('+') || cleanLine.includes('-') || cleanLine.includes('√') || 
                           cleanLine.includes('/') || cleanLine.includes('±') || cleanLine.includes('→');

        // Extract a clean title for this specific point card
        let pointTitle = cleanLine.replace(/^(Step \d+:?|\d+[\.\)]\s*|Phase \d+:?|Section \d+:?|Point \d+:?|Given:?|Solution:?|Result:?)\s*/i, '');
        if (pointTitle.length > 55) {
            const firstClause = pointTitle.split(/[:.?,]/)[0];
            pointTitle = firstClause.length > 5 ? firstClause : pointTitle.slice(0, 55);
        }

        const stepNum = steps.length + 1;
        steps.push({
            stepNumber: stepNum,
            title: `Step ${stepNum}: ${pointTitle.trim() || 'Core Concept Point'}`,
            explanation: cleanLine,
            latexOrFormula: hasFormula ? cleanLine : `Key Insight: ${pointTitle.trim()}`
        });
    });

    // Fallback if no steps were parsed
    if (steps.length === 0) {
        steps.push({
            stepNumber: 1,
            title: 'Step 1: Given Data & Concept Setup',
            explanation: cleanMathText(rawLines[0]) || `Set up problem parameters for ${extractedTitle}`,
            latexOrFormula: cleanMathText(rawLines[0]) || `Topic: ${extractedTitle}`
        });
        steps.push({
            stepNumber: 2,
            title: 'Step 2: Step-by-Step Derivation & Solution',
            explanation: rawLines.map(cleanMathText).join(' ') || 'Apply core principles step-by-step.',
            latexOrFormula: 'Step 2: Solution Evaluation ✅'
        });
    }

    return { title: extractedTitle, steps };
};
