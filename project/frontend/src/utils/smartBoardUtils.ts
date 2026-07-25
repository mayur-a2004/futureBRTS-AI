export interface SmartBoardStep {
    stepNumber: number;
    title: string;
    explanation: string;
    latexOrFormula: string;
}

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
                    title: 'Step 1: Given Parameters & Formula Setup', 
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
                    title: 'Step 4: Final Verified Solution & Result', 
                    explanation: 'Verify final calculations and state conclusion with proper units.', 
                    latexOrFormula: 'Final Answer: Verified Result ✅' 
                }
            ]
        };
    }

    const rawLines = content.split('\n').map(l => l.trim()).filter(Boolean);
    const stepBlocks: { title?: string; lines: string[] }[] = [];
    let currentBlock: { title?: string; lines: string[] } | null = null;

    rawLines.forEach((line) => {
        const cleanLine = line.replace(/[\*#`_]/g, '').trim();
        if (!cleanLine) return;

        const isStepHeader = /^(\*\*Step \d+:?|Step \d+:?|\d+[\.\)]|Phase \d+:?|Section \d+:?)/i.test(line);

        if (isStepHeader || !currentBlock) {
            if (currentBlock) {
                stepBlocks.push(currentBlock);
            }
            const headerMatch = cleanLine.match(/^(Step \d+:?|\d+[\.\)]|Phase \d+:?)\s*(.*)/i);
            const titleText = headerMatch && headerMatch[2] ? headerMatch[2].slice(0, 50) : cleanLine.slice(0, 50);
            currentBlock = {
                title: titleText || 'Mathematical Operation',
                lines: [cleanLine]
            };
        } else {
            currentBlock.lines.push(cleanLine);
        }
    });

    if (currentBlock) {
        stepBlocks.push(currentBlock);
    }

    // Convert stepBlocks into 3 to 5 structured SmartBoardSteps
    const steps: SmartBoardStep[] = [];

    if (stepBlocks.length >= 3 && stepBlocks.length <= 5) {
        stepBlocks.forEach((b, idx) => {
            const num = idx + 1;
            const fullText = b.lines.join(' ');
            const formulaLine = b.lines.find(l => l.includes('=') || l.includes('+') || l.includes('-') || l.includes('∫') || l.includes('√') || l.includes('/') || l.includes('\\')) || fullText;
            steps.push({
                stepNumber: num,
                title: `Step ${num}: ${b.title || 'Teacher Explanation'}`,
                explanation: fullText,
                latexOrFormula: formulaLine
            });
        });
    } else if (stepBlocks.length < 3) {
        // Group content into 3 logical steps
        const mathLines = rawLines.filter(l => l.includes('=') || l.includes('+') || l.includes('-') || l.includes('√') || l.includes('/') || l.includes('\\'));
        
        steps.push({
            stepNumber: 1,
            title: 'Step 1: Given Data & Concept Setup',
            explanation: rawLines[0] || `Set up problem parameters for ${fallbackTitle}`,
            latexOrFormula: mathLines[0] || rawLines[0] || `Topic: ${fallbackTitle}`
        });

        steps.push({
            stepNumber: 2,
            title: 'Step 2: Step-by-Step Derivation & Calculation',
            explanation: rawLines.slice(1, Math.max(2, rawLines.length - 1)).join(' ') || 'Apply rules of algebra and arithmetic step-by-step.',
            latexOrFormula: mathLines[1] || mathLines[0] || 'Step 2: Substitute & Calculate'
        });

        steps.push({
            stepNumber: 3,
            title: 'Step 3: Final Verified Answer & Board Box',
            explanation: rawLines[rawLines.length - 1] || 'State final evaluated value and check against standard solution format.',
            latexOrFormula: mathLines[mathLines.length - 1] || 'Final Verified Output ✅'
        });
    } else {
        // More than 5 steps -> Merge into 4 crisp, teacher blackboard steps
        const chunkSize = Math.ceil(stepBlocks.length / 4);
        for (let i = 0; i < 4; i++) {
            const chunk = stepBlocks.slice(i * chunkSize, (i + 1) * chunkSize);
            if (chunk.length === 0) break;

            const num = i + 1;
            const combinedText = chunk.flatMap(c => c.lines).join(' ');
            const formulaLine = chunk.flatMap(c => c.lines).find(l => l.includes('=') || l.includes('+') || l.includes('-') || l.includes('∫') || l.includes('√')) || combinedText;
            
            let defaultTitle = 'Derivation & Execution';
            if (num === 1) defaultTitle = 'Given Parameters & Formula Identification';
            if (num === 2) defaultTitle = 'Step-by-Step Value Substitution';
            if (num === 3) defaultTitle = 'Algebraic Simplification';
            if (num === 4) defaultTitle = 'Final Verified Output';

            steps.push({
                stepNumber: num,
                title: `Step ${num}: ${chunk[0].title || defaultTitle}`,
                explanation: combinedText,
                latexOrFormula: formulaLine
            });
        }
    }

    return { title: fallbackTitle, steps };
};

