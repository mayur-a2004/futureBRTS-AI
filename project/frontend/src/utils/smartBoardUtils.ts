export interface SmartBoardStep {
    stepNumber: number;
    title: string;
    explanation: string;
    latexOrFormula: string;
}

export const parseMessageToSmartBoardSteps = (
    content: string, 
    fallbackTitle: string = 'Maths / Physics Problem'
): { title: string; steps: SmartBoardStep[] } => {
    if (!content) {
        return {
            title: fallbackTitle,
            steps: [
                { stepNumber: 1, title: 'Step 1: Problem Setup', explanation: `Setup equations for ${fallbackTitle}`, latexOrFormula: `Topic: ${fallbackTitle}` },
                { stepNumber: 2, title: 'Step 2: Substitution & Evaluation', explanation: 'Substitute values and simplify terms.', latexOrFormula: 'Step 2: Apply Mathematical Formulas' },
                { stepNumber: 3, title: 'Step 3: Final Verification', explanation: 'Verify result and state conclusion.', latexOrFormula: 'Final Verified Answer ✅' }
            ]
        };
    }

    const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
    const steps: SmartBoardStep[] = [];
    let currentStep: SmartBoardStep | null = null;
    let stepCount = 0;

    lines.forEach((line) => {
        const cleanLine = line.replace(/[\*#`_]/g, '');
        const isStepHeader = /^(\*\*Step \d+:?|Step \d+:?|\d+[\.\)]|Phase \d+:?)/i.test(line);

        if (isStepHeader || (steps.length === 0 && currentStep === null)) {
            if (currentStep) {
                steps.push(currentStep);
            }
            stepCount++;
            const headerText = cleanLine.replace(/^Step \d+:?\s*/i, '').slice(0, 55);
            currentStep = {
                stepNumber: stepCount,
                title: `Step ${stepCount}: ${headerText || 'Mathematical Calculation'}`,
                explanation: cleanLine,
                latexOrFormula: (cleanLine.includes('=') || cleanLine.includes('+') || cleanLine.includes('-') || cleanLine.includes('∫') || cleanLine.includes('√'))
                    ? cleanLine
                    : `Step ${stepCount}: Formula Derivation & Analysis`
            };
        } else if (currentStep) {
            currentStep.explanation += ' ' + cleanLine;
            if (cleanLine.includes('=') || cleanLine.includes('\\') || cleanLine.includes('+') || cleanLine.includes('-') || cleanLine.includes('∫') || cleanLine.includes('√')) {
                currentStep.latexOrFormula = cleanLine;
            }
        }
    });

    if (currentStep) {
        steps.push(currentStep);
    }

    // Ensure at least 3 steps
    if (steps.length < 3) {
        while (steps.length < 3) {
            const nextIdx = steps.length + 1;
            steps.push({
                stepNumber: nextIdx,
                title: `Step ${nextIdx}: Verification & Final Output`,
                explanation: `Verify step ${nextIdx} calculations and check against board exam standards.`,
                latexOrFormula: `Step ${nextIdx}: Final Simplified Expression ✅`
            });
        }
    }

    return { title: fallbackTitle, steps };
};
