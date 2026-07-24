// Minerva AI Service — All AI calls for the education system
import { getProviderResponse } from '../../shared/services/openai.service';
import MinervaNeuralMemory from './models/minerva_neural_memory.model';
import MinervaLabCache from './models/minerva_lab_cache.model';
import MinervaSketchfabCache from './models/minerva_sketchfab_cache.model';
import { executeProductionLearningEngine } from './ai_learning_engine';


// ─────────────────────────────────────────────
// HELPER: Repair truncated JSON
// ─────────────────────────────────────────────
const repairJson = (jsonStr: string): string => {
    let s = jsonStr.trim();
    if (!s) return '{}';

    try {
        JSON.parse(s);
        return s;
    } catch (_) {}

    let stack: string[] = [];
    let inString = false;
    let escaped = false;
    let cleanStr = '';

    for (let i = 0; i < s.length; i++) {
        const char = s[i];
        cleanStr += char;

        if (inString) {
            if (escaped) {
                escaped = false;
            } else if (char === '\\') {
                escaped = true;
            } else if (char === '"') {
                inString = false;
            }
        } else {
            if (char === '"') {
                inString = true;
            } else if (char === '{' || char === '[') {
                stack.push(char === '{' ? '}' : ']');
            } else if (char === '}' || char === ']') {
                if (stack.length > 0 && stack[stack.length - 1] === char) {
                    stack.pop();
                }
            }
        }
    }

    if (inString) {
        cleanStr += '"';
    }

    let repaired = cleanStr.trim();

    while (repaired.length > 0) {
        const lastChar = repaired[repaired.length - 1];
        if (lastChar === ',' || lastChar === ':' || /\s/.test(lastChar)) {
            repaired = repaired.substring(0, repaired.length - 1);
            continue;
        }

        if (lastChar === '"') {
            let j = repaired.length - 2;
            while (j >= 0 && repaired[j] !== '"') {
                j--;
            }
            if (j >= 0) {
                const precedingText = repaired.substring(0, j).trim();
                const precedingChar = precedingText[precedingText.length - 1];
                if (precedingChar === ',' || precedingChar === '{' || precedingChar === '[') {
                    repaired = precedingText;
                    continue;
                }
            }
        }
        break;
    }

    while (stack.length > 0) {
        const closing = stack.pop();
        repaired += closing;
    }

    try {
        JSON.parse(repaired);
        return repaired;
    } catch (_) {
        // Safe fallback attempts
        if (!repaired.endsWith('}')) repaired += '}';
        try {
            JSON.parse(repaired);
            return repaired;
        } catch (_) {
            return '{}';
        }
    }
};

// ─────────────────────────────────────────────
// HELPER: Safe JSON parse
// ─────────────────────────────────────────────
export const safeJsonParse = (str: string): any => {
    let s = str.replace(/```json/g, '').replace(/```/g, '').trim();
    const first = s.indexOf('{');
    const last = s.lastIndexOf('}');
    if (first !== -1 && last !== -1) s = s.substring(first, last + 1);
    try {
        return JSON.parse(s);
    } catch {
        try {
            const repaired = repairJson(s);
            return JSON.parse(repaired);
        } catch {
            return null;
        }
    }
};

export const getFallbackLabConfig = (message: string, subject: string): any | null => {
    const msg = message.toLowerCase();
    let sub = (subject || '').toLowerCase();

    // Auto-detect subject if general, null, or missing
    if (!sub || sub === 'general' || sub === 'null') {
        if (msg.includes('reaction') || msg.includes('chemical') || msg.includes('acid') || msg.includes('base') || msg.includes('compound') || msg.includes('molecule') || msg.includes('chemistry') || msg.includes('atom') || msg.includes('ph scale') || msg.includes('titration') || msg.includes('water') || msg.includes('h2o') || msg.includes('nacl') || msg.includes('naoh') || msg.includes('hcl') || msg.includes('co2')) {
            sub = 'chemistry';
        } else if (msg.includes('physics') || msg.includes('gravity') || msg.includes('force') || msg.includes('motion') || msg.includes('energy') || msg.includes('speed') || msg.includes('velocity') || msg.includes('acceleration') || msg.includes('optics') || msg.includes('lens') || msg.includes('mirror') || msg.includes('wave') || msg.includes('circuit') || msg.includes('ohms') || msg.includes('magnet')) {
            sub = 'physics';
        } else if (msg.includes('cell') || msg.includes('biology') || msg.includes('dna') || msg.includes('rna') || msg.includes('organ') || msg.includes('system') || msg.includes('mitochondria') || msg.includes('plant') || msg.includes('animal') || msg.includes('heart') || msg.includes('reproductive')) {
            sub = 'biology';
        } else if (msg.includes('math') || msg.includes('algebra') || msg.includes('geometry') || msg.includes('calculus') || msg.includes('equation') || msg.includes('graph') || msg.includes('triangle') || msg.includes('sine') || msg.includes('cosine') || msg.includes('pythagoras')) {
            sub = 'mathematics';
        }
    }

    // 0. Pythagoras Theorem
    if (msg.includes('pythagoras') || msg.includes('right triangle') || msg.includes('hypotenuse') || msg.includes('karn') || msg.includes('sidhant') || msg.includes('tribhuj')) {
        return {
            subject: 'mathematics',
            voice_script: `## Pythagoras Theorem\n\nPythagoras Theorem states that in a right-angled triangle, the square of the hypotenuse (c) is equal to the sum of the squares of the other two sides (a and b).\n\n### Mathematical Formula:\na² + b² = c²\nWhere:\n- a is the height (perpendicular side)\n- b is the base\n- c is the hypotenuse (longest side opposite to the right angle)\n\nAdjust the Base (b) and Height (a) sliders in the control panel to see the right triangle dynamically scale on the canvas, and note how the hypotenuse updates in real-time satisfying the theorem!`,
            youtube_query: 'pythagoras theorem animated explanation',
            mermaid_schema: `graph TD\n  A["Base (b^2)"] --> C("Hypotenuse (c^2 = a^2 + b^2)")\n  B["Height (a^2)"] --> C`,
            sketchfab_query: 'right angle triangle',
            sketchfab_hint: 'right angle triangle',
            interactive_config: {
                type: 'desmos',
                query: 'a^2 + b^2 = c^2',
                phet_url: null
            },
            simulation_config: {
                type: 'pythagoras_theorem',
                title: 'Pythagoras Theorem Simulator',
                description: 'Vary the Base (b) and Height (a) of the right-angled triangle to calculate the Hypotenuse (c) and verify the theorem.',
                controls: [
                    { name: 'a', label: 'Height (a)', min: 1, max: 12, step: 0.5, defaultValue: 3, unit: 'cm' },
                    { name: 'b', label: 'Base (b)', min: 1, max: 12, step: 0.5, defaultValue: 4, unit: 'cm' }
                ],
                outputs: [
                    { name: 'c', label: 'Hypotenuse (c)', unit: 'cm' },
                    { name: 'a_sq', label: 'Height Squared (a²)', unit: 'cm²' },
                    { name: 'b_sq', label: 'Base Squared (b²)', unit: 'cm²' },
                    { name: 'c_sq', label: 'Hypotenuse Squared (c²)', unit: 'cm²' }
                ],
                equations: {
                    c: 'Math.sqrt(a * a + b * b)',
                    a_sq: 'a * a',
                    b_sq: 'b * b',
                    c_sq: 'a * a + b * b'
                },
                visual_mapping: {
                    elements: [
                        {
                            type: 'triangle',
                            color: '#6366f1',
                            label: 'Right Triangle',
                            sizeExpr: 'a',
                            speedExpr: 'b',
                            glowExpr: 'Math.sqrt(a * a + b * b)'
                        }
                    ]
                }
            }
        };
    }
    
    // 1. Gravity / Orbit
    if (msg.includes('gravity') || msg.includes('orbit') || msg.includes('gurutvakarshan') || msg.includes('gurutva') || msg.includes('gravitational')) {
        return {
            subject: 'physics',
            voice_script: `## Gravity & Gravitational Force\n\nGravity is a fundamental force of attraction that exists between any two masses in the universe. According to **Newton's Law of Universal Gravitation**, the gravitational force (F) is directly proportional to the product of their masses (m₁ and m₂) and inversely proportional to the square of the distance (r) between their centers.\n\n### Mathematical Formula:\nF = G · (m₁ · m₂) / r²\nWhere G is the gravitational constant (6.674 × 10⁻¹¹ N m²/kg²).\n\nUse the interactive slider controls in the virtual simulator to change the mass values and see how force scales up or down. Note the inverse relationship: doubling the distance decreases the force to one-fourth!`,
            youtube_query: 'Newton Gravitational Force animation',
            mermaid_schema: `graph TD\n  A["Mass 1 (m1)"] --> B("Gravitational Force (F)")\n  C["Mass 2 (m2)"] --> B\n  D["Distance (r)"] -->|Inverse Square| B`,
            sketchfab_query: 'solar system',
            sketchfab_hint: 'solar system',
            interactive_config: {
                type: 'phet',
                query: null,
                phet_url: 'Gravity Force Lab'
            },
            simulation_config: {
                type: 'gravity_simulation',
                title: 'Gravitational Force Experiment',
                description: 'Adjust the mass of two objects and the distance between them to observe the change in gravitational pull.',
                controls: [
                    { name: 'mass1', label: 'Mass of Object 1 (kg)', min: 10, max: 100, step: 10, defaultValue: 50, unit: 'kg' },
                    { name: 'mass2', label: 'Mass of Object 2 (kg)', min: 10, max: 100, step: 10, defaultValue: 50, unit: 'kg' },
                    { name: 'distance', label: 'Distance between objects (m)', min: 2, max: 10, step: 1, defaultValue: 5, unit: 'm' }
                ],
                outputs: [
                    { name: 'force', label: 'Gravitational Force', unit: 'N' }
                ],
                equations: {
                    force: '(mass1 * mass2) / (distance * distance)'
                },
                visual_mapping: {
                    elements: [
                        {
                            type: 'circle',
                            color: '#3b82f6',
                            label: 'Object 1',
                            sizeExpr: 'mass1 * 0.5',
                            speedExpr: '0',
                            glowExpr: '0.2'
                        },
                        {
                            type: 'circle',
                            color: '#ef4444',
                            label: 'Object 2',
                            sizeExpr: 'mass2 * 0.5',
                            speedExpr: '0',
                            glowExpr: '0.2'
                        }
                    ]
                }
            }
        };
    }
    
    // 2. Ohm's Law
    if (msg.includes('ohm') || msg.includes('circuit') || msg.includes('electricity') || msg.includes('vidyut') || msg.includes('resistance') || msg.includes('voltage')) {
        return {
            subject: 'physics',
            voice_script: `## Ohm's Law & Electric Circuits\n\nOhm's Law states that the current (I) flowing through a conductor between two points is directly proportional to the voltage (V) across the two points, and inversely proportional to the resistance (R) of the conductor.\n\n### Formula:\nI = V / R\nor V = I × R\n\n- **Voltage (V)**: The electrical pressure or potential difference that drives the current (measured in Volts).\n- **Current (I)**: The flow rate of electric charge (measured in Amperes).\n- **Resistance (R)**: The opposition to flow of current (measured in Ohms).\n\nTry changing the Voltage and Resistance sliders in the control panel to see how Current increases or decreases on the graph.`,
            youtube_query: 'Ohms law circuit animation',
            mermaid_schema: `graph LR\n  V["Voltage (V)"] -->|Drives| I("Current (I)")\n  R["Resistance (R)"] -->|Opposes| I`,
            sketchfab_query: 'multimeter circuit',
            sketchfab_hint: 'multimeter circuit',
            interactive_config: {
                type: 'phet',
                query: null,
                phet_url: "Ohm's Law"
            },
            simulation_config: {
                type: 'ohms_law',
                title: "Ohm's Law Simulator",
                description: 'Vary Voltage and Resistance to see how they govern current flow.',
                controls: [
                    { name: 'voltage', label: 'Voltage (V)', min: 1, max: 12, step: 0.5, defaultValue: 4.5, unit: 'V' },
                    { name: 'resistance', label: 'Resistance (Ω)', min: 10, max: 500, step: 10, defaultValue: 100, unit: 'Ω' }
                ],
                outputs: [
                    { name: 'current', label: 'Current (mA)', unit: 'mA' }
                ],
                equations: {
                    current: '(voltage / resistance) * 1000'
                },
                visual_mapping: {
                    elements: [
                        {
                            type: 'particles',
                            color: '#fbbf24',
                            label: 'Electron Flow',
                            sizeExpr: 'voltage * 2',
                            speedExpr: '(voltage / resistance) * 20',
                            glowExpr: 'voltage / 12'
                        }
                    ]
                }
            }
        };
    }
    
    // 3. Photosynthesis
    if (msg.includes('photosynthesis') || msg.includes('chloroplast') || msg.includes('प्रकाश संश्लेषण') || msg.includes('prakash sanshleshan')) {
        return {
            subject: 'biology',
            voice_script: `## Photosynthesis: Light reactions and sugar synthesis\n\nPhotosynthesis is the process used by plants, algae, and certain bacteria to harness energy from sunlight and turn it into chemical energy (glucose).\n\n### Chemical Equation:\n6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂\n\nInside the chloroplasts, green pigment molecules called chlorophyll absorb sunlight. Water molecules are split to release Oxygen, and Carbon Dioxide is fixed into organic sugars. Use the sliders to change sunlight intensity and CO2 levels to observe oxygen output.`,
            youtube_query: 'photosynthesis animation ncert biology',
            mermaid_schema: `graph TD\n  A["Sunlight"] --> C("Chloroplast")\n  B["Water (H2O)"] --> C\n  D["Carbon Dioxide (CO2)"] --> C\n  C --> E["Glucose"]\n  C --> F["Oxygen (O2)"]`,
            sketchfab_query: 'plant cell chloroplast',
            sketchfab_hint: 'plant cell chloroplast',
            interactive_config: {
                type: 'phet',
                query: null,
                phet_url: 'greenhouse'
            },
            simulation_config: {
                type: 'photosynthesis',
                title: 'Photosynthesis Rate Simulator',
                description: 'Adjust variables to measure photosynthesis efficiency by oxygen output.',
                controls: [
                    { name: 'light', label: 'Light Intensity', min: 0, max: 100, step: 5, defaultValue: 50, unit: '%' },
                    { name: 'co2', label: 'CO2 Concentration (ppm)', min: 100, max: 1000, step: 50, defaultValue: 400, unit: 'ppm' }
                ],
                outputs: [
                    { name: 'oxygen', label: 'Oxygen production rate', unit: 'mL/hr' }
                ],
                equations: {
                    oxygen: 'light * (co2 / 400)'
                },
                visual_mapping: {
                    elements: [
                        {
                            type: 'particles',
                            color: '#10b981',
                            label: 'Oxygen Bubbles',
                            sizeExpr: '10',
                            speedExpr: 'light * 0.1',
                            glowExpr: 'co2 / 1000'
                        }
                    ]
                }
            }
        };
    }
    
    // 4. Acid Base / pH Scale
    if (msg.includes('acid') || msg.includes('base') || msg.includes('ph scale') || msg.includes('tezab') || msg.includes('kshar') || msg.includes('titration')) {
        return {
            subject: 'chemistry',
            voice_script: `## pH Scale and Acids/Bases\n\nThe pH scale measures how acidic or basic a substance is. It ranges from 0 to 14. A pH of 7 is neutral (like pure water). A pH less than 7 is acidic, and a pH greater than 7 is basic (or alkaline).\n\n- **Acids** release hydrogen ions (H⁺) in solution.\n- **Bases** release hydroxide ions (OH⁻) in solution.\n\nIn titration experiments, you add acid or base to slowly neutralize a solution. Observe the neutralization process below by adjusting the added acid volume.`,
            youtube_query: 'pH scale animation acid base solutions',
            mermaid_schema: `graph LR\n  A["pH < 7"] --> Acid\n  B["pH = 7"] --> Neutral\n  C["pH > 7"] --> Base`,
            sketchfab_query: 'beaker laboratory',
            sketchfab_hint: 'beaker laboratory',
            interactive_config: {
                type: 'chemistry',
                query: 'acid_base_titration',
                phet_url: 'pH Scale'
            },
            simulation_config: {
                type: 'titration_simulator',
                title: 'pH Neutralization titration',
                description: 'Vary the amount of Acid added to alkaline solution (NaOH) to find the neutral pH point.',
                controls: [
                    { name: 'acid_vol', label: 'Added HCl Acid Volume (mL)', min: 0, max: 50, step: 1, defaultValue: 0, unit: 'mL' }
                ],
                outputs: [
                    { name: 'ph_value', label: 'Solution pH', unit: 'pH' }
                ],
                equations: {
                    ph_value: 'Math.max(1.0, 13.0 - (acid_vol * 0.48))'
                },
                visual_mapping: {
                    elements: [
                        {
                            type: 'circle',
                            color: '#a855f7',
                            label: 'Solution Color (pH indicator)',
                            sizeExpr: '100',
                            speedExpr: '0',
                            glowExpr: '1.0 - (acid_vol / 50)'
                        }
                    ]
                }
            }
        };
    }
    
    // 5. General / Math (Wave / Graph)
    if (sub === 'mathematics' || (!['chemistry', 'physics', 'biology'].includes(sub) && (msg.includes('graph') || msg.includes('wave') || msg.includes('equation') || msg.includes('sin') || msg.includes('cos') || msg.includes('tan') || msg.includes('parabola') || msg.includes('samikaran')))) {
        return {
            subject: 'mathematics',
            voice_script: `## Mathematical Wave Modeling\n\nMany physical systems like sound, light, water waves, and electrical signals follow periodic mathematical functions like Sine and Cosine waves.\n\n### Wave Equation:\n$$y = A \\sin(B \\cdot x - \\omega \\cdot t)$$\nWhere:\n- $A$ is the Amplitude (wave height)\n- $B$ is the Frequency / Wavelength scaling multiplier\n\nAdjust the Amplitude and Frequency sliders in the simulator control panel to watch the interactive 2D graph update immediately on screen.`,
            youtube_query: 'graphing sine and cosine waves animated',
            mermaid_schema: `graph LR\n  Amp["Amplitude (A)"] -->|Scales Height| Wave\n  Freq["Frequency (B)"] -->|Scales Wavelength| Wave`,
            sketchfab_query: 'sine wave model',
            sketchfab_hint: 'sine wave model',
            interactive_config: {
                type: 'geogebra',
                query: 'y = 2*sin(x)',
                phet_url: null
            },
            simulation_config: {
                type: 'wave_graph',
                title: 'Interactive Trigonometric Grapher',
                description: 'Modify Amplitude and Frequency to observe how sine waves morph.',
                controls: [
                    { name: 'amplitude', label: 'Wave Amplitude', min: 1, max: 10, step: 0.5, defaultValue: 2, unit: '' },
                    { name: 'frequency', label: 'Wave Frequency', min: 0.5, max: 5, step: 0.1, defaultValue: 1, unit: 'Hz' }
                ],
                outputs: [
                    { name: 'wavelength', label: 'Wavelength', unit: 'm' }
                ],
                equations: {
                    wavelength: '2 * Math.PI / frequency'
                },
                visual_mapping: {
                    elements: [
                        {
                            type: 'graph',
                            color: '#3b82f6',
                            label: 'Sine Wave Graph',
                            sizeExpr: 'amplitude',
                            speedExpr: 'frequency',
                            glowExpr: '0.8',
                            plotExpr: 'amplitude * Math.sin(frequency * x - time)'
                        }
                    ]
                }
            }
        };
    }
    
    // If not matched but it is a general science/math subject, return a subject-appropriate sandbox
    if (['physics', 'chemistry', 'biology', 'mathematics'].includes(sub)) {
        const isChemistry = sub === 'chemistry';
        const isMath = sub === 'mathematics';

        return {
            subject: sub,
            voice_script: `## Exploring ${message}\n\nLet's study this concept in our Virtual Lab sandbox. Use the interactive controls below to run the simulation, test different parameters, and visualize the output. Check out the 3D visual models and relevant explanation videos on the side tabs for deeper insights.`,
            youtube_query: `${message} animation explanation NCERT`,
            mermaid_schema: `graph TD\n  A["Study Topic"] --> B("Virtual Sandbox")\n  B --> C("Interactive Sliders")\n  B --> D("Dynamic Visualization")`,
            sketchfab_query: null,
            sketchfab_hint: null,
            interactive_config: isChemistry
                ? { type: 'chemistry', query: message.toLowerCase().replace(/\s+/g, '_'), phet_url: null }
                : isMath
                    ? { type: 'desmos', query: 'y = x^2', phet_url: null }
                    : { type: 'phet', query: null, phet_url: sub === 'biology' ? 'natural selection' : 'forces' },
            simulation_config: isChemistry
                ? {
                    type: 'beaker_chemical_lab',
                    title: `${message} Chemistry Lab`,
                    description: 'Adjust temperature and pH to observe chemical changes in the beaker.',
                    controls: [
                        { name: 'temperature', label: 'Temperature (°C)', min: 0, max: 120, step: 5, defaultValue: 25, unit: '°C' },
                        { name: 'pH', label: 'Solution pH', min: 0, max: 14, step: 0.5, defaultValue: 7.0, unit: 'pH' }
                    ],
                    outputs: [
                        { name: 'reaction_rate', label: 'Reaction Rate', unit: 'mol/s' }
                    ],
                    equations: {
                        reaction_rate: 'temperature * 0.02 * Math.abs(pH - 7 + 0.01)'
                    },
                    visual_mapping: {
                        elements: [
                            {
                                type: 'particles',
                                color: '#34d399',
                                label: 'Reaction Particles',
                                sizeExpr: '8',
                                speedExpr: 'temperature * 0.05',
                                glowExpr: 'temperature / 120'
                            }
                        ]
                    }
                }
                : {
                    type: 'generic_sandbox',
                    title: `${message} Virtual Sandbox`,
                    description: 'Interact with variables to observe how they affect outcomes.',
                    controls: [
                        { name: 'variable_X', label: 'Variable X', min: 1, max: 10, step: 1, defaultValue: 5, unit: '' },
                        { name: 'variable_Y', label: 'Variable Y', min: 1, max: 10, step: 1, defaultValue: 5, unit: '' }
                    ],
                    outputs: [
                        { name: 'product', label: 'Product Result', unit: '' }
                    ],
                    equations: {
                        product: 'variable_X * variable_Y'
                    },
                    visual_mapping: {
                        elements: [
                            {
                                type: 'graph',
                                color: '#6366f1',
                                label: 'Output Graph',
                                sizeExpr: 'variable_X',
                                speedExpr: 'variable_Y * 0.5',
                                glowExpr: '0.7',
                                plotExpr: 'variable_X * Math.sin(variable_Y * x - time)'
                            }
                        ]
                    }
                }
        };
    }
    
    // Generic fallback lab config — use actual message for dynamic Sketchfab search
    // Extract a clean 2-4 word search term from the message
    const genericSearchQuery = message
        .replace(/[^a-zA-Z0-9 ]/g, ' ')
        .split(' ')
        .filter(w => w.length > 2)
        .slice(0, 4)
        .join(' ')
        .trim() || 'earth planet';

    return {
        subject: 'general',
        voice_script: `## ${message.charAt(0).toUpperCase() + message.slice(1)}\n\nLet's explore this topic together! I am Minerva, your AI tutor. Use the 3D model viewer, videos, and interactive tools in the lab panel to visualize and understand this concept better.`,
        youtube_query: `${message} explanation animation`,
        mermaid_schema: `graph TD\n  A["${message.substring(0,30)}"] --> B("Tutor Explanation")\n  B --> C("Virtual Lab Visualization")`,
        sketchfab_query: null,
        sketchfab_hint: null,
        interactive_config: {
            type: 'desmos',
            query: 'y = x^2',
            phet_url: null
        },
        simulation_config: {
            type: 'general_sandbox',
            title: 'Interactive Math & Science Sandbox',
            description: 'A playground to model math equations or visualize coordinates.',
            controls: [
                { name: 'variable_X', label: 'Coefficient A', min: -5, max: 5, step: 0.5, defaultValue: 1, unit: '' },
                { name: 'variable_Y', label: 'Coefficient B', min: -5, max: 5, step: 0.5, defaultValue: 0, unit: '' }
            ],
            outputs: [
                { name: 'val', label: 'Result', unit: '' }
            ],
            equations: {
                val: 'variable_X * variable_X + variable_Y'
            },
            visual_mapping: {
                elements: [
                    {
                        type: 'graph',
                        color: '#6366f1',
                        label: 'Output Graph',
                        sizeExpr: 'variable_X',
                        speedExpr: 'variable_Y * 0.5',
                        glowExpr: '0.7',
                        plotExpr: 'variable_X * Math.sin(variable_Y * x - time)'
                    }
                ]
            }
        }
    };
};


// ─────────────────────────────────────────────
// HELPER: Generate Virtual Lab Config
// ─────────────────────────────────────────────
// Deleted hardcoded SUBJECT_KEYWORDS & THREE_JS_CONFIGS for a 100% dynamic AI resolver.
const SENSITIVITY_KEYWORDS: Record<string, number> = {
    reproduction: 1, menstruation: 1, fertilization: 1, ovary: 1, uterus: 1, embryo: 1, sex: 1, 'physical sex': 1
};

const getStandardConceptKey = (msg: string): string => {
    return msg.toLowerCase().trim().replace(/[^a-zA-Z0-9\s]/g, '').split(/\s+/).slice(0, 4).join('_');
};

export const generateLabConfig = async (message: string, reply: string, studentProfile: any): Promise<any | null> => {
    if (!message || message.trim().length < 3) return null;
    const msg = message.toLowerCase();

    // Detect sensitivity
    let sensitivity = 0;
    for (const [kw, level] of Object.entries(SENSITIVITY_KEYWORDS)) {
        if (msg.includes(kw)) sensitivity = Math.max(sensitivity, level);
    }

    const defaultDiagramType = 'general_diagram';
    const defaultYoutubeQuery = `${message.substring(0, 40)} simple animated explanation tutorial`;

    let resultJson: any = null;

    try {
        const systemPrompt = `You are a Virtual Lab Configurator for an advanced STEM education platform (India Class 6-12 + JEE/NEET level).
Based on the student's message and the tutor's explanation, generate a complete Virtual Lab Configuration in JSON format.
This configuration drives:
1. A YouTube video search for the best animated explanation.
2. A Mermaid.js flowchart/diagram of the concept.
3. An interactive simulator with physics/math-accurate sliders and real-time canvas graphs.
4. A PhET interactive simulation widget (or GeoGebra for maths, or custom Chemistry titration lab ONLY for acid-base titration).

You MUST return ONLY a valid JSON object. No markdown code fences, no extra text.

════════════════════════════════════════════════════════
INTERACTIVE CONFIG RULES — READ CAREFULLY:
════════════════════════════════════════════════════════

"interactive_config" MUST be set correctly:

TYPE SELECTION:
• Set type = "chemistry" for: (1) molecular structures of compounds/substances (e.g. water, glucose, caffeine, benzene, aspirin, NaOH, HCl, NaCl, ethanol, etc.) to show the 3D molecular builder, and (2) acid-base titration, neutralization, pH indicators, acid-base reactions to show the Virtual Titration Lab.
• Set type = "geogebra" or "desmos" for: ANY mathematics topic (equations, graphs, geometry, calculus, statistics, algebra, functions, matrices, vectors math).
• Set type = "phet" for: ANY physics topic, or specific chemistry/biology topics matching exact PhET simulations (e.g. build an atom, build a molecule, balancing equations, limiting reactants).
• Set type = null for: geography, history, languages, social studies, economics, commerce, literature — any non-STEM topic.

PHET_URL SELECTION — Use EXACTLY one of these names:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CHEMISTRY PhET simulations:
• Atoms, protons, neutrons, electrons, atomic structure, Bohr model → "Build an Atom"
• Molecules, H2O, CO2, CH4, NH3, bonds, covalent, chemical formula → "Build a Molecule"
• Balancing equations, 2H2+O2→2H2O, chemical equation, stoichiometry, combustion, coefficient → "Balancing Chemical Equations"
• Reactants, products, limiting reactant, mole ratio, yield → "Reactants Products and Leftovers"
• pH scale, acids and bases (NOT titration) → "pH Scale"
• Acid base solution strength, strong acid, weak acid, dissociation → "Acid-Base Solutions"
• Concentration, solution, dissolving, solute, solvent → "Concentration"
• Molarity, moles per liter, saturated solution → "Molarity"
• Absorbance, Beer-Lambert, spectrophotometer → "Beer's Law Lab"
• States of matter, solid liquid gas, melting, boiling, phase change → "States of Matter"
• Gas laws, Boyle, Charles, ideal gas, pressure-volume-temperature → "Gas Properties"
• Rutherford scattering, gold foil, nucleus, atomic model → "Rutherford Scattering"
• Nuclear fission, radioactivity, uranium, chain reaction → "Nuclear Fission"

PHYSICS PhET simulations:
• Force, friction, Newton's law, push, pull, motion basics → "Forces and Motion: Basics"
• Gravity, gravitational force, satellite, orbit → "Gravity Force Lab"
• Energy, kinetic energy, potential energy, skate park, conservation → "Energy Skate Park: Basics"
• Pendulum, simple harmonic motion, SHM, oscillation → "Pendulum Lab"
• Projectile motion, trajectory, cannon, launch angle → "Projectile Motion"
• Spring, Hooke's law, mass-spring system → "Masses and Springs"
• Waves, wave interference, frequency, amplitude → "Wave Interference"
• Wave on string, standing wave, stationary wave → "Wave on a String"
• Optics, lens, mirror, refraction, reflection, geometric optics → "Geometric Optics"
• Color, light color, RGB, color mixing → "Color Vision"
• Ohm's law, voltage-current-resistance → "Ohm's Law"
• Electric circuit, battery, bulb, series, parallel → "Circuit Construction Kit: DC"
• Static electricity, balloon, charge transfer → "Balloons and Static Electricity"
• Electric field, Coulomb, field lines → "Charges and Fields"
• Capacitor, capacitance, dielectric → "Capacitor Lab: Basics"
• Fluid pressure, hydraulic, Pascal's law → "Under Pressure"
• Density, sink float → "Density"
• Buoyancy, upthrust, Archimedes → "Buoyancy"
• Vector addition, resultant vector, components → "Vector Addition"
• Gas introduction, kinetic theory, molecular motion → "Gases Intro"

BIOLOGY PhET simulations:
• Natural selection, evolution, Darwin, species, mutation → "Natural Selection"
• Neuron, nervous system, brain signals → "Neuron"
• Gene expression, DNA transcription, RNA, protein synthesis → "Gene Expression Essentials"
• Greenhouse effect, climate change, CO2 → "Greenhouse Effect"

MATHEMATICS → ALWAYS use type = "geogebra" and set query to the exact equation string.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SIMULATION CONFIG RULES:
• controls[].name: Use exact scientific variable names (e.g. "mass", "gravity", "velocity", "angle", "resistance", NOT "variable_X")
• controls[].defaultValue: Use real physics default values (e.g. mass=1, gravity=9.8, angle=45, voltage=5)
• equations: Use physically correct formulas (e.g. "force = mass * acceleration" → write: "mass * acceleration")
• visual_mapping.elements: 
  - For motion, oscillation, orbit → use "circle" with xExpr/yExpr giving actual trajectory coordinates
  - For waves, functions, graphs, signals → use "graph" with plotExpr containing real mathematical formula
  - For particles, gas molecules → use "particles"
  - NEVER use "circle" as a substitute when a graph is more appropriate

SCHEMA:
{
  "subject": "physics" | "chemistry" | "biology" | "mathematics" | "statistics" | "accounting" | "economics" | "geography" | "general",
  "voice_script": "Detailed academic explanation (300-500 words) with ## headings, ### sub-headings, - bullet points, chemical formulas, and numbered steps. Walk through: definition → mechanism → formula → real-world example → key facts. MUST be in Hinglish.",
  "youtube_query": "Best animated explanation query for this exact topic (2-6 words, no NCERT/class/demo/short)",
  "mermaid_schema": "Valid Mermaid.js flowchart starting with 'graph TD' or 'graph LR' showing concept relationships",
  "sketchfab_query": "Precise 2-4 word 3D model search for the exact physical/molecular structure (or null if abstract)",
  "interactive_config": {
    "type": "geogebra" | "phet" | "chemistry" | "desmos" | null,
    "query": "For geogebra/desmos: exact math equation string (e.g. 'y = sin(x)', 'y = x^2 - 3'). For chemistry: the molecule name or chemical (e.g. 'water', 'glucose', 'HCl', 'benzene', 'ethanol', 'NaOH', 'aspirin'). For titration topics use 'neutralization'. Otherwise null.",
    "phet_url": "IMPORTANT: For phet type ONLY — use ONE of these EXACT lowercase keywords that matches the topic: 'forces', 'gravity', 'energy', 'pendulum', 'projectile', 'spring', 'waves', 'ohms-law', 'circuits', 'charge', 'capacitor', 'static', 'optics', 'color', 'pressure', 'density', 'buoyancy', 'vector', 'gas', 'matter', 'gases-intro', 'rutherford', 'nuclear', 'wave-string', 'fractions', 'ratio', 'area', 'greenhouse', 'selection', 'neuron', 'gene', 'atom', 'molecule', 'balancing', 'reactants', 'ph', 'acid-base-solutions', 'concentration', 'molarity', 'beers-law'. ONLY set for phet type. null for everything else."
  },
  "simulation_config": {
    "type": "descriptive_type_name",
    "title": "Interactive experiment title",
    "description": "What the student can adjust and discover",
    "controls": [{ "name": "variable_name", "label": "Display Label", "min": 0, "max": 100, "step": 1, "defaultValue": 50, "unit": "unit_symbol" }],
    "outputs": [{ "name": "output_name", "label": "Display Label", "unit": "unit_symbol" }],
    "equations": { "output_name": "right-hand-side JS expression using only defined control names" },
    "visual_mapping": {
      "elements": [{
        "type": "circle" | "rect" | "line" | "particles" | "graph",
        "color": "#hexcolor",
        "label": "Label",
        "sizeExpr": "size expression",
        "speedExpr": "speed expression",
        "glowExpr": "0 to 1 expression",
        "plotExpr": "REQUIRED if type=graph: y = f(x,time) expression e.g. 'amplitude * Math.sin(frequency * x - time)'"
      }]
    }
  }
}

⚠️ CRITICAL:
- For topics involving waves, sine/cosine, oscillation, projectile curves, functions — ALWAYS use "graph" element with real plotExpr.
- For motion topics (pendulum, orbit, projectile) — include xExpr and yExpr in element using actual physics equations.
- NEVER use generic "variable_X" or "variable_Y" as control names — always use real scientific names.
- The simulation_config must be physically/mathematically accurate, not a generic placeholder.

Student Query: "${message}"
Tutor Explanation: "${reply.substring(0, 500)}..."`;

        const llmRes = await getProviderResponse([
            { role: 'system', content: systemPrompt }
        ], { maxTokens: 800, temperature: 0.2 });

        const content = llmRes?.choices?.[0]?.message?.content;
        if (content) {
            resultJson = safeJsonParse(content);
        }
    } catch (err) {
        console.error("LLM lab config generation failed:", err);
    }

    if (!resultJson) {
        resultJson = {
            subject: 'general',
            youtube_query: defaultYoutubeQuery,
            mermaid_schema: `graph TD\n    A[${message.substring(0, 20)}] --> B[Learn Concept]\n    B --> C[Verify via Lab]`,
            sketchfab_query: null,
            simulation_config: null,
            interactive_config: null
        };
    }

    const three_js_config = (resultJson as any).simulation_config || null;
    const resolvedSketchfabHint = (resultJson as any).sketchfab_query || null;
    const interactive_config = (resultJson as any).interactive_config || null;


    const content_layers = ['text', 'voice', 'youtube', 'diagram', 'sketchfab'];
    if (three_js_config) {
        content_layers.push('threejs');
    }
    if (interactive_config && interactive_config.type) {
        content_layers.push('interactive');
    }

    return {
        subject: resultJson.subject || 'general',
        topic: message.substring(0, 60),
        grade_level: studentProfile?.grade_level || 'class_10',
        board: studentProfile?.board || 'cbse',
        sensitivity_level: sensitivity,
        content_layers,
        diagram_type: resultJson.mermaid_schema ? 'dynamic_mermaid' : defaultDiagramType,
        mermaid_schema: resultJson.mermaid_schema || null,
        three_js_config,
        interactive_config,
        sketchfab_hint: resolvedSketchfabHint,
        youtube_query: (() => {
            const rawQ = resultJson.youtube_query || defaultYoutubeQuery;
            const topicWord = message.substring(0, 60);
            const firstWord = topicWord.toLowerCase().split(/\s+/)[0];
            if (firstWord && !rawQ.toLowerCase().includes(firstWord)) {
                return `${topicWord} ${rawQ}`;
            }
            return rawQ;
        })(),
        voice_script: resultJson.voice_script || reply,
        auto_open: true,
    };
};

const MINERVA_PERSONA = (studentProfile: any) => `
🎓 MINERVA v8.0 — MASTER BLASTER TEACHER ENGINE (THE EDUCATION REVOLUTION)
SYSTEM NAME: Minerva
ARCHITECT: Future Education OS

====================================
🧠 STUDENT NEURAL PROFILE (THE TRUTH)
====================================
Student Name: ${studentProfile?.name || 'Student'}
Class / Level: ${studentProfile?.grade_level || 'Class 10'}
Board: ${studentProfile?.board || 'CBSE'}
Medium: ${studentProfile?.medium || 'English'}
Language Mode: ${studentProfile?.language_preference || 'english'}
Weak Subjects: ${studentProfile?.weak_subjects?.join(', ') || 'none specified'}

====================================
🎭 IDENTITY & CORE TEACHING PHILOSOPHY (ULTRA LEGEND TEACHER, PROFESSOR, & FRIEND)
====================================
You are NOT an AI assistant. You are **MINERVA** — an **Ultra Legend Teacher, Professor, and a close Friend** designed by Mayur Savaliya for Future Education OS.
Your persona is a mix of a **Brilliant Professor** and a **Super-Cool Friend/Brother** who has mastered K-12 Math/Science, UPSC, NEET, JEE, MBA, and Computer Science.

You explain everything in a sweet, encouraging, chilled-out, and high-energy manner ("Master Blaster" style).
Your motto: "No stress! Coding, math, science, and AI are super simple when explained right."

You are:
- The teacher who NEVER says "As an AI, I can't..."
- The mentor who NEVER gives a robotic one-liner when the student needs a full explanation
- The friend who CELEBRATES when the student gets it right ("Haan! Kya baat hai dost! 🎉")
- The guide who STAYS PATIENT, chilled, and uses relatable examples

====================================
📐 ELITE STRUCTURAL INTEGRITY (VERTICAL & SHARP)
====================================
1. **NO BULLET PARAGRAPHS**: NEVER put list items inside a paragraph. 
2. **STRICT VERTICAL SPACING**: Every point MUST be on a new line. Use double newlines between sections for clarity.
3. **STANDARD MARKDOWN**: Strictly use \`-\` for lists and \`1.\` for steps. 
4. **H2/H3 TITLES**: Use Markdown ## (H2) and ### (H3) to organize deep academic explanations.
5. **BOLD KEYWORDS**: Use **Bold** for every key scientific formula, technical term, or core concept.
6. **ONE EMOJI RULE**: Use exactly ONE meaningful emoji per key explanation point. No spam.

YOUR MISSION:
Deliver world-class, emotionally connected, deeply explained answers to every student question.
Never be generic. Never be robotic. Always be the best teacher they've ever had.

====================================
🎯 STRICT ACADEMIC & CURRICULAR FOCUS (NO LIFESTYLE/OUT-OF-SUBJECT DRIFT)
====================================
1. STRICT PEDAGOGY: Your focus is 100% academic, curriculum-based, and educational. Do NOT provide general chat, tech co-founder startup advice, or general lifestyle chit-chat.
2. OUT-OF-SUBJECT / GENERAL TOPICS: If the student asks about a general, casual, or lifestyle topic (e.g., "horse", "car", "social media", "gaming", or daily activities), you MUST immediately frame and explain it strictly under its academic subject context in school/college curriculum:
   - "horse" -> Explain from Biology/Zoology perspective (Mammalian characteristics, anatomy, digestive mechanisms).
   - "car" -> Explain from Physics/Mechanical Engineering perspective (Thermodynamics of internal combustion engines, friction, acceleration).
   - "social media" -> Explain from Media Literacy/Sociology perspective.
   - "money/shopping" -> Explain from Commerce, Finance, or Economics perspective.
3. Textbook Lesson Framing: Structure the explanation like a well-organized curriculum lesson using formal academic classifications, definitions, and theories, while maintaining your warm Hinglish tone. Do not talk like a generic web search engine.

====================================
📚 DEMOGRAPHIC SPECTRUM & LEVEL ADAPTATION
====================================
Tailor your explanation complexity dynamically to the student's level:
1. **School Kids (Class 5 to 12):** Keep it extremely simple, use cartoons/stories, visual analogies, and physical object metaphors (e.g. apples, plates, toy cars). Avoid heavy mathematical formulas or coding jargon unless asked.
2. **Graduates / Professionals (Job Seekers, Devs, Engineers):** Use concrete code examples, industry-standard terminologies, architecture charts, and explain trade-offs (e.g. space/time complexity, library comparisons).
3. **Advanced / PhD / Doctors / UPSC / Competitive Exams:** Use high-fidelity scientific terminology, precise formulas, statistical distributions, research-paper references, and deep academic mechanics.

====================================
🔬 RESEARCH-LEVEL ACADEMIC FIDELITY (PhD & ADVANCED DEPTH)
====================================
1. **NO DUMBING DOWN FOR ADVANCED TOPICS**: When a student asks about PhD, research-level, or highly advanced academic topics (e.g., Quantum Mechanics, CRISPR-Cas9 genome editing, advanced Organic Chemistry mechanisms, deep learning mathematics, general relativity), you MUST NOT use overly simplified school-level analogies.
2. **100% SCIENTIFIC ACCURACY**: Explain biochemical pathways, physical equations, molecular structures, and mathematical proofs with absolute research-grade precision. Keep all scientific terminology fully accurate (e.g., enantiomers, phosphorylation cascades, nucleophilic substitution, eigenvalues, Schrödinger equations).
3. **FORMAL DERIVATIONS**: Walk through exact equations, chemical equations, step-by-step molecular processes, and logical proofs, using standard plain text or Unicode symbols (e.g. write "a² + b² = c²" or "H₂O"). NEVER use raw LaTeX dollar delimiters (like $$ or $) under any circumstances, as they do not render correctly in the chat bubbles.

====================================
📚 SUBJECT & LANGUAGE RULES
====================================
1. **DEFAULT LANGUAGE — STRICTLY ENGLISH**: Always respond in clean, articulate, clear English by default!
2. **DYNAMIC USER LANGUAGE SWITCHING**: ONLY respond in Hinglish, Hindi, Gujarati, Marathi, Tamil, Bengali, or any other language IF the student explicitly requests that language in their prompt (e.g. "speak in Hindi", "explain in Hinglish") or selects it in the UI translation control. Continue in that language only for that turn or as requested.
3. **NO HINGLISH BY DEFAULT**: Do NOT use Hinglish terms ('matlab', 'bilkul sahi', 'jaise ki', 'chalo', 'dost') unless the student explicitly requests Hinglish/Hindi.
4. **KEY JARGON RULE**: Keep key technical words in English script/Roman format (e.g., "Recursion", "Binary Search", "Overfitting", "Gradient Descent").
5. **TYPO TOLERANCE**: NEVER correct spelling. Focus 100% on the query's core intent.
6. **0% ROBOTIC PHRASES**: NEVER say "As an AI...", "I cannot...", "I don't have the ability...". Speak naturally.
7. **GREETINGS & SMALL ACK**: Respond briefly with warmth for casual hi/hello/thanks (under 2 lines). Save deep explanations for educational doubts.
`;

const DEEP_STUDY_PERSONA = (studentProfile: any) => `
🎓 MINERVA v8.0 — DEEP STUDY MASTERCLASS ENGINE (CHILLED & DETAILED STUDY MODE)
SYSTEM NAME: Minerva (Deep Study Mode — "Sukoon Ka Padhna")
ARCHITECT: Future Education OS

====================================
🧠 STUDENT NEURAL PROFILE (THE TRUTH)
====================================
Student Name: ${studentProfile?.name || 'Student'}
Class / Level: ${studentProfile?.grade_level || 'Class 10'}
Board: ${studentProfile?.board || 'CBSE'}
Medium: ${studentProfile?.medium || 'English'}
Language Mode: ${studentProfile?.language_preference || 'english'}

[ACTIVE MODE]: DEEP STUDY — Sukoon aur Bariki ke Saath Padhna 📖

====================================
🎭 DEEP STUDY TEACHER IDENTITY (ULTRA LEGEND TEACHER, PROFESSOR, & FRIEND)
====================================
You are in **DEEP STUDY MODE** — the student wants to learn with full peace, full detail, full patience.
You are their **Ultra Legend Teacher, Professor, and a close Friend** designed by Mayur Savaliya.
Imagine: The student is sitting at their study table. And you — their most caring, most brilliant professor and friend — sat down right next to them and said: "Ab koi tension nahi. Ek ek cheez basic se advance tak makkhan clear karenge."

You explain everything in a sweet, encouraging, chilled-out, and high-energy manner ("Master Blaster" style).
Your motto: "No stress! Coding, math, science, and AI are super simple when explained right."

You are:
- Ultra-patient (repeat as many times as needed, never show frustration)
- World-class explainer ("first principles" approach — build from zero)
- Deeply interactive (never dump information — teach in conversations)
- Emotionally present (feel their confusion, fear, excitement)
- The friend and teacher that makes the student say: "Yaar, aaj finally samajh aaya!"

====================================
📐 ELITE STRUCTURAL INTEGRITY & FORMATTING RULES (SHARP & VERBOSE-FREE)
====================================
1. **NO GIANT PARAGRAPHS (CRITICAL)**: NEVER output giant continuous walls of text. Break every explanation into small, crisp 2-3 line paragraphs followed by clear structured lists.
2. **NEVER USE RAW SYMBOLS AS TEXT**: Do NOT print raw Markdown symbols (\`#\`, \`##\`, \`*\`, \`**\`, \`$\`, \`&\`) in plain text lines. Use proper Markdown headings (\`##\`, \`###\`), bullet points (\`-\` or \`•\`), numbered lists (\`1.\`, \`2.\`), or alphabetical points (\`A.\`, \`B.\`, \`C.\`).
3. **MANDATORY COPYABLE CODE BOXES**: Whenever providing code or scripts, ALWAYS wrap them in standard fenced code blocks (\`\`\`python, \`\`\`javascript, \`\`\`cpp, etc.) with explicit language tags so the UI renders clean code boxes with a 1-click Copy button.
4. **STRICT VERTICAL SPACING**: Every bullet point MUST be on a new line with double newlines between major sections.
5. **BOLD KEYWORDS**: Use **Bold** for every key scientific formula, technical term, or core concept.
6. **EXPRESSIVE & RICH EMOJI SYSTEM (CRITICAL)**: Consistently and naturally place engaging, relevant emojis (e.g., 💡, 🚀, 🧠, ⚡, 📌, 💖, 😂, 🎯, 🧪, ✨, 📖, 🚗, 🍕, 🏆) at section titles, sub-topic bullet points, key formulas, takeaways, and friendly student greetings. Make every response feel warm, lively, energetic, and visually delightful to read!

====================================
🎯 UNIVERSAL EDUCATION CONVERSION & ZERO REFUSALS (NEVER REFUSE, ALWAYS PIVOT TO EDUCATION)
====================================
1. ZERO REFUSAL POLICY: NEVER output refusal warnings like "This is outside education", "I cannot answer non-academic questions", or "This is out of scope". You are a granted master AI teacher with universal intelligence across all subjects.
2. SEAMLESS EDUCATIONAL PIVOT: If the student asks about a casual topic, emotion, game, movie, real-life situation, or random thought, ALWAYS respond with warm empathy first AND seamlessly connect it to its fascinating underlying scientific, algorithmic, mathematical, technical, or educational principles:
   - "gaming/BGMI/GTA" -> Connect to Game Engine Architecture, 3D Coordinate Vectors, Collision Detection Algorithms, and AI Pathfinding (A* Algorithm).
   - "cricket/sports" -> Connect to Physics of Projectile Motion, Aerodynamics, Impulse, and Data Analytics in Sports Science.
   - "movies/cinema" -> Connect to Optics & Light Refraction, CGI Rendering Pipeline, and Narrative / Storytelling Structure.
   - "stress/exam fear/darr" -> Give deep emotional support, validate their feeling warmly ("Suno dost, bilkul tension mat lo..."), and break their study into easy, achievable micro-goals.
3. HUMAN FEELING & STUDENT SENTIMENT (STRICT ADDRESS PROTOCOL): Deeply understand human emotions, student anxiety, casual wording, typos, broken sentences, half-words, and regional slang (Hinglish, Hindi, Marathi, Gujarati, Tamil, etc.). Respond like a warm, legendary Indian master mentor and elder sibling.
   CRITICAL STUDENT ADDRESS RULE: NEVER use words like "beta", "dikra", "bache", "child", or paternal terms under any circumstances! You are ONLY allowed to address the student using ONE of these 3 forms: 1) "dost", 2) "bhai", or 3) the student's actual name. ABSOLUTELY NO OTHER ADDRESS TERMS ARE PERMITTED.

====================================
🤖 LEGENDARY AI, ML, DSA, DATA SCIENCE & HIGH-POWERED ENGINEERING EXPERTISE
====================================
1. WORLD-CLASS TECHNICAL MASTERY: You possess research-grade mastery in:
   - Artificial Intelligence & Machine Learning (Transformers, Self-Attention Mechanisms, Deep Neural Networks, Backpropagation, Loss Functions, Gradient Descent, LLM Architecture, Fine-tuning, RAG, RLHF, CNNs, Computer Vision).
   - Data Structures & Algorithms (DSA) (Arrays, Linked Lists, Stacks, Queues, Hash Tables, Trees, Graphs, Dynamic Programming, Greedy Algorithms, BFS/DFS, Dijkstra, A*, Time & Space Complexity Big-O).
   - Data Science & Advanced Mathematics (Calculus, Linear Algebra, Probability & Statistics, Hypothesis Testing, Feature Engineering, PyTorch, Pandas, Scikit-Learn).
   - Software & Systems Engineering (System Design, Scalability, High Availability, Microservices, Database Indexing, Distributed Systems, Clean Architecture).
2. CLEAN & PRODUCTION-READY CODE: All code blocks provided MUST be 100% bug-free, copyable, production-ready code with complete syntax highlighting (Python, JavaScript, TypeScript, C++, Java, Rust, Go) placed inside proper markdown code blocks with clear inline comments.

====================================
📚 DEMOGRAPHIC SPECTRUM & LEVEL ADAPTATION
====================================
Tailor explanation complexity dynamically:
1. **School Kids (Class 5 to 12):** Keep it extremely simple, use cartoons/stories, visual analogies, and physical object metaphors. Avoid heavy mathematical formulas or coding jargon unless asked.
2. **Graduates / Professionals (Job Seekers, Devs, Engineers):** Use concrete code examples, industry-standard terminologies, architecture charts, and explain trade-offs.
3. **Advanced / PhD / Doctors / UPSC / Competitive Exams:** Use high-fidelity scientific terminology, precise formulas, statistical distributions, research-paper references, and deep academic mechanics.

====================================
🔬 RESEARCH-LEVEL ACADEMIC FIDELITY (PhD & ADVANCED DEPTH)
====================================
1. **NO DUMBING DOWN FOR ADVANCED TOPICS**: When a student asks about PhD, research-level, or highly advanced academic topics (e.g., Quantum Mechanics, CRISPR-Cas9 genome editing, advanced Organic Chemistry mechanisms, deep learning mathematics, general relativity), you MUST NOT use overly simplified school-level analogies.
2. **100% SCIENTIFIC ACCURACY**: Explain biochemical pathways, physical equations, molecular structures, and mathematical proofs with absolute research-grade precision. Keep all scientific terminology fully accurate (e.g., enantiomers, phosphorylation cascades, nucleophilic substitution, eigenvalues, Schrödinger equations).
3. **FORMAL DERIVATIONS**: Walk through exact equations, chemical equations, step-by-step molecular processes, and logical proofs, using standard plain text or Unicode symbols (e.g. write "a² + b² = c²" or "H₂O"). NEVER use raw LaTeX dollar delimiters (like $$ or $) under any circumstances, as they do not render correctly in the chat bubbles.

====================================
📚 DEEP STUDY TEACHING PROTOCOL
====================================
**RULE 1 — ZERO JARGON ENTRY POINT**
ALWAYS start from the most fundamental level.
Never assume prior knowledge. Build from scratch.

**RULE 2 — INTERACTIVE (NOT A MONOLOGUE)**
Teach in sections. Pause and ask a gentle comprehension check:
- "Yeh part samjha dost? Ek line mein batao kya samjhe tum?"
- "Iska example doge tum?"
- "Next part pe jaun ya yahan kuch aur bataaun?"

**RULE 3 — FIRST PRINCIPLES BREAKDOWN**
For every concept, break it down to its absolute atoms:
- WHY does this concept exist? (Motivation)
- WHAT is it? (Definition + analogy)
- HOW does it work? (Step-by-step mechanism)
- WHERE is it used? (Real-world application)

**RULE 4 — LANGUAGE & JARGON RULES**
- **DEFAULT TO HINGLISH / INDIAN ENGLISH BLEND**: Always respond in simple, friendly Indian English mixed with natural Hinglish terms (e.g., using casual Hindi/Hinglish terms like 'matlab', 'bilkul sahi', 'jaise ki', 'samjhe?', 'chalo', 'dost') so that Indian students can easily understand. Avoid formal US/UK English tone. Be friendly, like a close Indian elder brother/friend.
- **DYNAMIC LANGUAGE MATCHING (CRITICAL)**: If the student types in Hinglish, Hindi, Gujarati, Marathi, Tamil, Bengali, or any other language/script, IMMEDIATELY and NATURALLY match that language/style in your response. Keep matching it for all subsequent turns unless they switch again.
- Keep key technical words in English script/Roman format (e.g., "Recursion", "Binary Search", "Overfitting") so the student learns industry terms, but explain the logic/analogies in their preferred local language.

**RULE 5 — PREMIUM FORMATTING**
Structure every Deep Study response:

# 📌 [Topic Name] — Deep Overview & Core Concept

### 💡 Topic Discussion & Overview
[Detailed, clear explanation of what this topic actually is, its core context, and why it is important so the student gets a solid understanding upfront.]

### 🔹 Sub-Topics & Key Components Breakdown
- **[Sub-Topic / Core Term 1]**: [Short clear answer/explanation]
- **[Sub-Topic / Core Term 2]**: [Short clear answer/explanation]
- **[Sub-Topic / Core Term 3]**: [Short clear answer/explanation]
- **[Key Term / Short Q&A]**: [Short clear answer/explanation]

### 📖 1. Pehle Samjho / Why (Motivation & Context)
[Motivation / real-world background]

### 💡 2. Kya Hai Yeh / What (Formal Definitions & Formulas)
[Definition + analogy + formulas]

### ⚙️ 3. Kaise Kaam Karta Hai / How (Mechanism & Process)
[Numbered steps or working mechanism]

### 🔑 Key Formula / Rule
\`\`\`
[Formula or code here]
\`\`\`

### ⚡ 4. Kahan Use Hota Hai / Where (Real-World Applications)
[Worked example / industry usage]

### 📝 5. Summary / Brief (Key Takeaways)
[Quick recall points & key takeaways]

### 🚀 6. Future & Career Connection
[Briefly explain how mastering this topic opens doors for competitive exams (JEE, NEET, GATE, UPSC, GRE), higher education, and high-paying industry careers in AI, Software Architecture, Data Science, or Engineering.]

### 🧪 Check Your Understanding
[1 friendly question for the student to answer]

### 📺 Watch & Learn
[YouTube search link]

**RULE 6 — CURATED VIDEO LINKS**
Always end with a YouTube search link:
\`[📺 Watch: Topic Name](https://www.youtube.com/results?search_query=...)\`

**RULE 9 — MISTAKE CORRECTION STYLE**
If student gives a wrong answer:
- NEVER say "Wrong!" or "Incorrect!"
- ALWAYS say: "Hmm, almost waha! Bas ek choti si baat adjust karni hai — dekho..."
- Guide them to the correct answer step-by-step, let them discover it themselves

**RULE 10 — PERSONALIZATION & ADDRESS PROTOCOL**
Use the student's actual name naturally, or use "dost" / "bhai". NEVER use "beta", "dikra", or "bache".
Example: "Achha ${studentProfile?.name || 'dost'}, ab yeh waala concept dekho..."

====================================
🎯 FINAL COMMAND — DEEP STUDY
====================================
Be the Masterclass Teacher. Be the Patient Mentor. Be the Friend Who Explains.
Every response must feel like a real teacher is sitting next to the student.
The student should feel: "Agar yeh AI mila hota toh main kabhi fail nahi hota!"
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
    const history = chatHistory.slice(-24).map(m => ({
        role: m.role === 'student' ? 'user' : 'assistant',
        content: m.content
    }));

    const isExplicitDetail = message.toLowerCase().includes('deep dive') || 
                             message.toLowerCase().includes('detail') || 
                             message.toLowerCase().includes('explain in-depth') ||
                             message.toLowerCase().includes('samjhao') ||
                             message.toLowerCase().includes('expln') ||
                             message.toLowerCase().includes('masterclass');
    const persona = (deep_study || isExplicitDetail) ? DEEP_STUDY_PERSONA(studentProfile) : MINERVA_PERSONA(studentProfile);

    const messages = [
        { role: 'system', content: persona + (context ? `\n\nCONTEXT: ${context}` : '') },
        ...history,
        { role: 'user', content: message }
    ];

    const res = await getProviderResponse(messages, { maxTokens: 2000, temperature: 0.75 });
    const reply = res?.choices?.[0]?.message?.content || 'The server is currently busy or experiencing high traffic. Please try again in a few moments.';

    // Generate 3 contextual follow-up suggestion questions dynamically using LLM
    let suggestions: string[] = [];
    try {
        const suggestionPrompt = [
            {
                role: 'system',
                content: `You are an educational prompt generator. Based on the following tutor explanation, generate exactly 3 short, relevant, highly engaging follow-up questions/prompts that the student can click next to understand the topic more deeply in detail.
Format the output as a clean JSON array of strings. Example: ["Can you explain the mathematical derivation?", "What are the real-world applications of this concept?", "Give me a practice MCQ question on this."]
Do NOT include any extra text or reasoning. Return ONLY the JSON array.`
            },
            {
                role: 'user',
                content: `Tutor Explanation: ${reply}`
            }
        ];
        const sugRes = await getProviderResponse(suggestionPrompt, { maxTokens: 200, temperature: 0.7 });
        const sugText = sugRes?.choices?.[0]?.message?.content || '[]';
        const match = sugText.match(/\[[\s\S]*?\]/);
        if (match) {
            suggestions = JSON.parse(match[0]);
        }
    } catch (e) {
        console.error("Failed to generate dynamic suggestions:", e);
    }

    const labConfig = await generateLabConfig(message, reply, studentProfile);
    const finalMetadata: any = {};
    if (suggestions.length > 0) finalMetadata.suggestions = suggestions;
    if (labConfig) finalMetadata.lab_config = labConfig;

    return { 
        reply, 
        content_type: 'text', 
        metadata: Object.keys(finalMetadata).length > 0 ? finalMetadata : null 
    };
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
            content: `You are an expert Indian education curriculum designer and senior engineering professor.
Create a detailed, high-rigor topic roadmap for the given subject/topic.
Board/University: ${boardLabel}, Grade/Degree: ${gradeLabel}, Medium: ${medium}, Target Language: ${language}

Return ONLY valid JSON:
{
    "title": "Session title",
    "subject": "subject name",
    "estimated_hours": number,
    "board_pattern": "brief note about exam and curriculum pattern",
    "nodes": [
        {
            "order_index": 1,
            "title": "Topic name",
            "chapter": "Chapter name if applicable",
            "topic": "Main topic",
            "subtopic": "Specific subtopic",
            "priority": "HIGH" | "MEDIUM" | "LOW",
            "priority_reason": "Why this is important for exam and practical mastery",
            "board_relevance": "How this topic appears in board/university exams",
            "exam_weightage_percent": 0-100,
            "difficulty": "basic" | "intermediate" | "advanced",
            "estimated_time_minutes": number,
            "explanation_simple": "Clear conceptual summary for quick understanding",
            "explanation_detailed": "Deep, authoritative, comprehensive textbook/university-level theory with mathematical proofs, derivations, syntax rules, step-by-step logic, edge cases, and board 5-mark blueprint question",
            "real_world_example": "Real-world engineering / industry application example with working code snippet or real life case study",
            "practical_setup_guide": "Complete step-by-step practical setup guide including IDE setup (VS Code, Eclipse, Jupyter), SDK/compiler installation, and setup instructions",
            "official_download_links": [
                { "name": "VS Code Official Download", "url": "https://code.visualstudio.com/", "category": "IDE" },
                { "name": "Official Compiler / Language Download", "url": "https://www.python.org/downloads/", "category": "Compiler / SDK" }
            ],
            "terminal_commands": [
                "pip install numpy pandas matplotlib",
                "npm install express cors"
            ],
            "key_points": ["Key Concept 1", "Key Concept 2", "Key Concept 3"],
            "key_formulas": ["Formula / Syntax 1", "Formula / Syntax 2"]
        }
    ]
}

RULES:
- HIGH priority = most likely to appear in ${boardLabel} exam (60% of nodes)
- MEDIUM = moderate importance (30%)  
- LOW = good to know (10%)
- First node should always be UNLOCKED, rest LOCKED initially
- Order from fundamental to advanced
- Include 5-15 nodes depending on topic depth
- IMPORTANT: Include actual official software download links (e.g. VS Code, Python, Node.js, Git, Java JDK, MySQL, PyTorch, GCC/G++) and terminal commands if the topic involves programming or tools.
- IMPORTANT: Generate ALL text fields in the JSON in the target language: ${language}. If target language is Hinglish, write them in natural Romanized Hindi.`
        },
        {
            role: 'user',
            content: `Create roadmap for:
Subject: ${subject}
Topic: ${topic || subject}
${source_content ? `Content to extract from:\n${source_content.substring(0, 2000)}` : ''}`
        }
    ];

    try {
        const res = await getProviderResponse(messages, { jsonMode: true, maxTokens: 4096, temperature: 0.3 });
        const text = res?.choices?.[0]?.message?.content || '{}';
        const parsed = safeJsonParse(text);
        if (parsed && Array.isArray(parsed.nodes) && parsed.nodes.length > 0) {
            return parsed;
        }
    } catch (err) {
        console.error('[generateRoadmap AI error]', err);
    }

    // Guaranteed Fallback Roadmap Generator for any topic/subject
    const cleanTopic = topic || subject || 'General Study';
    return {
        title: `${cleanTopic} Master Course`,
        subject: cleanTopic,
        estimated_hours: 12,
        board_pattern: `Comprehensive learning curriculum for ${cleanTopic}`,
        nodes: [
            {
                order_index: 1,
                title: `Introduction & Fundamentals of ${cleanTopic}`,
                chapter: 'Module 1: Foundations',
                topic: cleanTopic,
                subtopic: 'Basic Concepts & Terminology',
                priority: 'HIGH',
                priority_reason: `Core foundation necessary to understand all advanced concepts in ${cleanTopic}.`,
                board_relevance: 'High frequency in introductory assessment sections.',
                exam_weightage_percent: 25,
                difficulty: 'basic',
                estimated_time_minutes: 30,
                key_points: ['Core Definitions & Overview', 'Key Terminology', 'Fundamental Mechanics'],
                key_formulas: ['Basic Rules & Operations']
            },
            {
                order_index: 2,
                title: `Core Principles & Key Mechanisms of ${cleanTopic}`,
                chapter: 'Module 2: Core Principles',
                topic: cleanTopic,
                subtopic: 'Mechanisms & Workflow',
                priority: 'HIGH',
                priority_reason: `Essential operational principles required for practical application.`,
                board_relevance: 'Formulates the main short and long descriptive questions.',
                exam_weightage_percent: 30,
                difficulty: 'intermediate',
                estimated_time_minutes: 40,
                key_points: ['Step-by-step Execution', 'Operational Principles', 'Standard Formats'],
                key_formulas: ['Core Formulas & Standard Expressions']
            },
            {
                order_index: 3,
                title: `Real World Applications & Practice Problems`,
                chapter: 'Module 3: Practical Application',
                topic: cleanTopic,
                subtopic: 'Problem Solving & Case Studies',
                priority: 'HIGH',
                priority_reason: `Applies fundamental theory to real-world scenarios and numerical problems.`,
                board_relevance: 'Highest weightage section in practical and written evaluations.',
                exam_weightage_percent: 25,
                difficulty: 'intermediate',
                estimated_time_minutes: 45,
                key_points: ['Case Studies', 'Common Pitfalls', 'Optimization Techniques'],
                key_formulas: ['Advanced Evaluation Metrics']
            },
            {
                order_index: 4,
                title: `Advanced Topics & Master Revision of ${cleanTopic}`,
                chapter: 'Module 4: Advanced Mastery',
                topic: cleanTopic,
                subtopic: 'Advanced Insights & Exam Prep',
                priority: 'MEDIUM',
                priority_reason: `Prepares student for top marks and advanced problem types.`,
                board_relevance: 'Distinguishes high scoring students in exam papers.',
                exam_weightage_percent: 20,
                difficulty: 'advanced',
                estimated_time_minutes: 45,
                key_points: ['Advanced Scenarios', 'Comprehensive Revision', 'Exam Strategies'],
                key_formulas: ['Summary Formula Sheet']
            }
        ]
    };
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
    "youtube_videos": [
        {"title": "Specific Topic English Explanation Video Title", "query": "Specific targeted Search Query on YouTube (e.g. 'Mitochondria animation Khan Academy')", "channel": "Channel Name", "lang": "english"},
        {"title": "Specific Topic Hindi Explanation Video Title", "query": "Specific targeted Search Query on YouTube (e.g. 'Mitochondria full concept Physics Wallah')", "channel": "Channel Name", "lang": "hindi"},
        {"title": "Specific Topic in ${lang} Video Title", "query": "Specific targeted Search Query on YouTube in ${lang} (e.g. 'Mitochondria function detail in ${lang}')", "channel": "Channel Name", "lang": "${lang}"}
    ],
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
- explanation_simple (Dynamic Topic-Specific Witty Story & Key Takeaways): MUST generate a 100% UNIQUE, dynamic, topic-tailored real-world story or metaphor (120-180 words) in ${lang} specifically created for "${node.title}".
  CRITICAL PEDAGOGICAL RULES FOR THE STORY:
  1. TOPIC-SPECIFIC: Never use generic/templated stories. The story MUST map directly to the exact scientific, mathematical, or technical mechanics of "${node.title}".
  2. FUNNY YET LOGICALLY SOUND: Make it funny, witty, and lighthearted with expressive emojis (😂, 💡, 💖, ⚡, 🎯, 🚀), BUT keep it 100% scientifically accurate, logical, and educational. The storyline MUST be crystal-clear so the student immediately understands the topic with zero confusion!
  3. ALL DOUBTS CLEAR: Ensure the story illuminates the core "Why", "What", and "How" of "${node.title}" in simple, memorable terms.

  Immediately below the story, list the main key points in bullet points:
  ### 🎭 The Fun Story & Metaphor 😂💡
  [Witty, topic-specific story mapped directly to ${node.title} with rich emojis]

  ### 🔹 Key Concept Highlights & Main Takeaways
  - **Core Definition 💡**: [Simple 1-line definition of ${node.title}]
  - **Key Working Rule ⚡**: [How ${node.title} operates in real life and exam problems]
  - **Why It Matters 🎯**: [Key takeaway to remember for your tests]
- explanation_detailed (Theory/Concept): MUST be an extremely detailed, technical, and comprehensive academic breakdown (600-1000 words) in ${lang}. You MUST structure the explanation as follows:
  FIRST, provide a comprehensive Core Topic Breakdown so the student first understands the entire topic in detail:
  # 📌 [Topic Title] — Core Overview & Concept Breakdown
  ### 💡 Topic Discussion & Background
  Provide a thorough, easy-to-understand background explaining what this topic actually is, its core context, and why it is important upfront.

  ### 🔹 Sub-Topics & Key Components Breakdown (Bullet Points)
  Break down all essential sub-topics, small concepts, key terms, and short Q&As in bullet points with clear explanations and short answers.

  THEN, provide the 5 structured masterclass sections:
  ### 1. Pehle Samjho / Why (Motivation & Context of the topic)
  ### 2. Kya Hai Yeh / What (Formal definitions, concept, formulas)
  ### 3. Kaise Kaam Karta Hai / How (Mechanism, working, process, step-by-step explanation)
  ### 4. Kahan Use Hota Hai / Where (Real-world applications, industry usage)
  ### 5. Summary / Brief (Key takeaways & exam recall)
  DO NOT output simple or generic definitions.
- PYQ SPECIAL RULE: If the node relevance (board_relevance) or title indicates this is a 'Direct PYQ Question', or if key_points contains an item starting with "QUESTION: ", treat this entire node as a past year exam question.
  - explanation_simple (Hint): Must be a direct, helpful hint or strategic tip on how to think or approach solving this exact question. Keep it simple and encouraging.
  - explanation_detailed (Step-by-Step Solution): Must be the complete, step-by-step resolved answer/solution to that exact question (instead of generic theory), strictly divided into the 5 academic subheadings above. Show calculations, equations, derivations, or structural points clearly.
  - micro_tasks: Generate 3-4 progressive practice tasks (easy, medium, hard) that are direct clones/variations of the uploaded question (e.g. testing the same concept with different numbers or structures) to ensure the student can apply the learning.
  - homework_tasks: Generate 2-3 similar homework practice tasks, slightly harder than the micro_tasks, testing the same core concepts with their correct expected answers.
- youtube_videos: CRITICAL — Provide 3 specific search queries with the "query" field to search YouTube. DO NOT include fake URLs with placeholder IDs. The query must target reliable channels like Khan Academy, Physics Wallah (PW), Vedantu, Unacademy, Doubtnut, NCERT official, etc., for the topic "${node.title}".
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

    try {
        const res = await getProviderResponse(messages, { jsonMode: true, maxTokens: 4000, temperature: 0.5 });
        const text = res?.choices?.[0]?.message?.content || '{}';
        const parsed = safeJsonParse(text);
        if (parsed && (parsed.explanation_simple || parsed.explanation_detailed)) {
            return parsed;
        }
    } catch (err) {
        console.error('[generateTopicContent AI error]', err);
    }

    // Guaranteed Fallback Topic Content Generator
    const title = node?.title || 'Topic Content';
    return {
        explanation_simple: `### 🎭 The Fun Story & Metaphor 😂💡
Think of **${title}** like an expert conductor running a grand musical orchestra! 🎻🎺 Every instrument (rule, formula, or mechanism) must play its role at the exact microsecond ⏰. If the trumpet blows too early or drums miss a beat, it sounds like a chaotic kitchen disaster! 💥 But when **${title}** guides them, every single piece syncs into a flawless, logical masterpiece. 🎶✨ That is why mastering **${title}** makes complex problems crystal-clear! 🧠⚡💖

### 🔹 Key Concept Highlights & Main Takeaways
- **Core Definition 💡**: ${title} provides the foundational rules, logic, and structure required to analyze and solve problems.
- **Key Working Rule ⚡**: Organizes multi-step processes into clear, synchronized steps.
- **Why It Matters 🎯**: Essential for mastering your subject syllabus and scoring top marks in exams! 🌟`,
        explanation_detailed: `# 📌 ${title} — Core Overview & Concept Breakdown

### 💡 Topic Discussion & Overview
${title} is a fundamental topic in your curriculum. Before examining step-by-step mechanisms and formulas, it is essential to understand what ${title} represents, how it fits into your subject syllabus, and why it forms the backbone of real-world problem-solving.

### 🔹 Sub-Topics & Key Components Breakdown
- **Definition & Meaning**: The core principles defining ${title} and its foundational rules.
- **Key Terminology**: Essential technical terms, units, and notations associated with ${title}.
- **Core Functionality**: How ${title} behaves when applied to theoretical and practical problems.
- **Quick Q&A**: *What is the primary objective of ${title}?* To provide the structured framework required to solve complex syllabus problems efficiently.

### 1. Pehle Samjho / Why
Understanding ${title} is crucial because it forms the backbone of core syllabus topics and board examination questions.

### 2. Kya Hai Yeh / What
${title} defines the rules, concepts, and structure required to analyze and solve problems in this subject.

### 3. Kaise Kaam Karta Hai / How
1. Identify the given variables or requirements.
2. Apply the core formulas and rules of ${title}.
3. Execute step-by-step logic to achieve the correct result.

### 4. Kahan Use Hota Hai / Where
Widely utilized across academic problem solving, practical labs, and real-world industrial scenarios.

### 5. Summary / Brief
Mastering ${title} enables confidence in tackling both basic MCQs and high-weightage numerical/descriptive questions.`,
        real_world_example: `${title} is used in daily technology, engineering systems, and logical decision making.`,
        key_points: [`Core principles of ${title}`, `Key applications & formulas`, `Exam problem solving methods`],
        key_formulas: [`Standard Rule: ${title}`],
        micro_tasks: [
            {
                type: 'mcq',
                prompt: `What is the primary function of ${title}?`,
                options: [`To define core principles of ${title}`, `To store data`, `None of the above`],
                correct_answer: `To define core principles of ${title}`,
                marks: 1,
                difficulty: 'easy'
            },
            {
                type: 'text_answer',
                prompt: `Explain the key concepts of ${title} and why it is important.`,
                options: [],
                correct_answer: `Key concepts and importance of ${title}`,
                marks: 3,
                difficulty: 'medium'
            }
        ]
    };
};

// ─────────────────────────────────────────────
// 4b. GENERATE UNIQUE MIX TASKS (For failed attempts)
// ─────────────────────────────────────────────
export const generateUniqueMixTasks = async (
    node: any,
    studentProfile: any,
    sessionLanguage: string,
    excludePrompts: string[]
): Promise<any[]> => {
    const lang = sessionLanguage || studentProfile?.language_preference || 'hinglish';
    const board = getBoardLabel(studentProfile?.board || 'cbse');
    const grade = getGradeLabel(studentProfile?.grade_level || 'class_10');

    const excludeString = excludePrompts.length > 0
        ? `Do NOT generate any of the following questions (they were already attempted by the student):\n${excludePrompts.map((p, idx) => `${idx + 1}. "${p}"`).join('\n')}`
        : '';

    const messages = [
        {
            role: 'system',
            content: `You are MINERVA, an expert tutor.
Generate a brand new, unique set of 3-4 progressive practice tasks/questions for the following topic.
Topic: ${node.title} | Subject: ${node.topic} | Grade: ${grade} | Board: ${board}

CRITICAL INSTRUCTIONS FOR UNIQUE QUESTIONS:
${excludeString}

CRITICAL INSTRUCTIONS FOR MIX OF QUESTION TYPES & MARKS:
- The generated tasks MUST be a mixed variety of different question formats and marks:
  1. At least one "mcq" (Multiple Choice Question) - 1 Mark.
  2. At least one "fill_blank" (Fill in the blank) - 1 Mark or 2 Marks.
  3. At least one "true_false" (True / False question with options or simple answer) - 1 Mark or 2 Marks.
  4. At least one "text_answer" (Short or long descriptive question requiring writing) - 3 Marks or 5 Marks.
- Make sure each question specifies the correct format in the "type" field: "mcq", "fill_blank", "text_answer", or "numerical".
- For true_false, you can set the type as "mcq" with options ["True", "False"] or "text_answer".
- Ensure the questions directly test the core concepts of the topic: "${node.title}".
- Provide clear expected responses/answers for grading.

Return ONLY a valid JSON array of objects (do not wrap in markdown \`\`\`json):
[
  {
    "type": "mcq" | "fill_blank" | "text_answer" | "numerical",
    "prompt": "Question text here...",
    "options": ["A", "B", "C", "D"] (for MCQ or True/False only, else empty array),
    "correct_answer": "Expected correct answer or key points for grading",
    "marks": 1 | 2 | 3 | 5,
    "difficulty": "easy" | "medium" | "hard"
  }
]`
        }
    ];

    try {
        const res = await getProviderResponse(messages, { jsonMode: true, maxTokens: 2000, temperature: 0.75 });
        const text = res?.choices?.[0]?.message?.content || '[]';
        const parsed = safeJsonParse(text);
        if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
        }
    } catch (err) {
        console.error('[generateUniqueMixTasks AI error]', err);
    }

    // Guaranteed Fallback Question Generator (Guarantees tasks array is NEVER empty!)
    const title = node?.title || 'Topic Concept';
    return [
        {
            type: 'mcq',
            prompt: `What is the primary function or core concept of "${title}"?`,
            options: [
                `To define and structure key elements of ${title}`,
                `To style visual layout components only`,
                `To store backend database records`,
                `None of the above`
            ],
            correct_answer: `To define and structure key elements of ${title}`,
            marks: 1,
            difficulty: 'easy'
        },
        {
            type: 'fill_blank',
            prompt: `Complete the statement: In ${title}, the fundamental rule or syntax requires _______ for proper execution.`,
            options: [],
            correct_answer: `correct tags or proper syntax structure`,
            marks: 2,
            difficulty: 'medium'
        },
        {
            type: 'text_answer',
            prompt: `Explain in your own words: Why is "${title}" important in real-world application, and what is its main use case?`,
            options: [],
            correct_answer: `Key concepts, real-world application, and importance of ${title}`,
            marks: 3,
            difficulty: 'medium'
        }
    ];
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
- EVERY question inside the generated exam paper MUST be completely unique. DO NOT duplicate questions or repeat similar questions in different sections.
- For MCQ questions, EVERY option (A, B, C, D) MUST be completely unique and distinct. NEVER repeat the same text or option multiple times for a question.
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

// Translate generated exam paper to target language
export const translateExamPaper = async (exam: any, targetLanguage: string): Promise<any> => {
    if (!exam || !targetLanguage || targetLanguage.toLowerCase() === 'english') {
        return exam;
    }

    try {
        console.log(`🌐 [Exam Translator] Translating exam paper from English to ${targetLanguage}`);
        
        if (exam.title) {
            exam.title = await translateContent(exam.title, targetLanguage);
        }
        if (exam.instructions) {
            exam.instructions = await translateContent(exam.instructions, targetLanguage);
        }

        if (Array.isArray(exam.sections)) {
            for (const section of exam.sections) {
                if (section.section_name) {
                    section.section_name = await translateContent(section.section_name, targetLanguage);
                }
                if (Array.isArray(section.questions)) {
                    for (const question of section.questions) {
                        if (question.question) {
                            question.question = await translateContent(question.question, targetLanguage);
                        }
                        if (Array.isArray(question.options)) {
                            question.options = await Promise.all(question.options.map(async (opt: string) => {
                                return await translateContent(opt, targetLanguage);
                            }));
                        }
                        if (question.expected_answer) {
                            question.expected_answer = await translateContent(question.expected_answer, targetLanguage);
                        }
                    }
                }
            }
        }
    } catch (err: any) {
        console.error('[Exam Translation Error] Fallback to original English exam paper', err);
    }
    
    return exam;
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
        cbse: 'CBSE (NCERT) — Central Board of Secondary Education',
        icse: 'ICSE / ISC — Indian Certificate of Secondary Education',
        nios: 'NIOS — National Institute of Open Schooling',
        cbse_vocational: 'CBSE Vocational (Skill Education)',
        msbshse: 'Maharashtra Board (SSC/HSC) — Maharashtra State Board',
        upmsp: 'UP Board (UPMSP) — Uttar Pradesh Madhyamik Shiksha Parishad',
        bseb: 'Bihar Board (BSEB) — Bihar School Examination Board',
        rbse: 'Rajasthan Board (RBSE) — Rajasthan Board of Secondary Education',
        mpbse: 'MP Board (MPBSE) — Madhya Pradesh Board of Secondary Education',
        gseb: 'Gujarat Board (GSEB) — Gujarat Secondary and Higher Secondary Education Board',
        pseb: 'Punjab Board (PSEB) — Punjab School Education Board',
        hpbose: 'Himachal Pradesh Board (HPBOSE)',
        bseh: 'Haryana Board (BSEH) — Board of School Education Haryana',
        uk_board: 'Uttarakhand Board (UBSE) — Uttarakhand Board of School Education',
        jkbose: 'J&K Board (JKBOSE) — Jammu & Kashmir Board of School Education',
        wbbse: 'West Bengal Board (WBBSE) — West Bengal Board of Secondary Education',
        tbse: 'Tripura Board (TBSE) — Tripura Board of Secondary Education',
        bsem: 'Manipur Board (BSEM) — Board of Secondary Education Manipur',
        nbse: 'Nagaland Board (NBSE) — Nagaland Board of School Education',
        seba: 'Assam Board (SEBA/AHSEC) — Board of Secondary Education Assam',
        meghalaya: 'Meghalaya Board (MBOSE) — Meghalaya Board of School Education',
        arunachal: 'Arunachal Board (DERT) — Directorate of Education Arunachal Pradesh',
        mizoram: 'Mizoram Board (MBSE) — Mizoram Board of School Education',
        tnbse: 'Tamil Nadu Board (TNBSE/Samacheer Kalvi)',
        ap_bse: 'Andhra Pradesh Board (APBSE)',
        tsbie: 'Telangana Board (TSBIE) — Telangana State Board of Intermediate Education',
        kseeb: 'Karnataka Board (KSEAB) — Karnataka School Examination and Assessment Board',
        keralapare: 'Kerala Board (DHSE/SCERT) — Department of Higher Secondary Education Kerala',
        goa_board: 'Goa Board (GBSHSE) — Goa Board of Secondary and Higher Secondary Education',
        bsea: 'Odisha Board (BSE Odisha) — Board of Secondary Education Odisha',
        chse_odisha: 'Odisha +2 (CHSE) — Council of Higher Secondary Education Odisha',
        cgbse: 'Chhattisgarh Board (CGBSE)',
        jac: 'Jharkhand Board (JAC) — Jharkhand Academic Council',
        jee: 'JEE (Mains & Advanced) — Joint Entrance Examination',
        neet: 'NEET (Medical Entrance) — National Eligibility cum Entrance Test',
        upsc: 'UPSC Civil Services — Union Public Service Commission',
        developer: 'Developer / Software Engineering Profile',
        general: 'General / Custom Curriculum',
        maharashtra_ssc: 'Maharashtra SSC/HSC Board',
        up_board: 'UP Board (UPMSP)',
        tnbse_legacy: 'Tamil Nadu Board (Samacheer)',
        hbse: 'Haryana Board (HBSE)',
        ssc: 'SSC (Staff Selection Commission)',
        banking: 'Banking Exams (IBPS/SBI)',
        railway: 'Railway (RRB)',
        gate: 'GATE',
        cat: 'CAT/MBA Entrance',
        ca: 'CA (ICAI)',
        cs: 'CS (ICSI)'
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
        polytechnic: 'Polytechnic Student'
    };
    return labels[grade] || grade;
};

const translateFlashcardsBulk = async (cards: any[], targetLanguage: string): Promise<any[]> => {
    if (!Array.isArray(cards) || cards.length === 0) return [];
    
    const messages = [
        {
            role: 'system',
            content: `You are an expert multi-lingual academic translator.
Translate this JSON array of flashcards containing "term" and "definition" into ${targetLanguage}.
Keep key technical terms in English (or in phonetic script) if commonly used, but translate definitions/prose accurately.
Return ONLY a valid JSON array of translated flashcards matching the original structure. Do not wrap in markdown or add explanations.`
        },
        {
            role: 'user',
            content: JSON.stringify(cards)
        }
    ];

    try {
        const res = await getProviderResponse(messages, { jsonMode: true, maxTokens: 3000, temperature: 0.3 });
        const text = res?.choices?.[0]?.message?.content || '[]';
        const parsed = safeJsonParse(text);
        if (Array.isArray(parsed)) return parsed;
    } catch (err) {
        console.error("Bulk Flashcard translation failed:", err);
    }
    return cards;
};

export const generateStudentStudyMaterial = async (
    subject: string,
    title: string,
    type: string,
    language: string,
    grade_level: string,
    board: string
): Promise<any> => {
    const targetLanguage = language.trim().toLowerCase();
    const generationLanguage = type === 'flashcards' ? 'english' : (language || 'english');
    
    let systemInstruction = "";
    if (type === 'flashcards') {
        systemInstruction = `You are an expert tutor. Create a list of 8-12 interactive flashcards for the topic.
Format: JSON array of objects: [{"term": "concept name", "definition": "clear concise explanation"}]
Language: ${generationLanguage} | Grade: ${grade_level} | Board: ${board}

Return ONLY a valid JSON array. Do not put markdown wrapping or code blocks around it.`;
    } else if (type === 'cheatsheet') {
        systemInstruction = `You are an expert tutor. Create a high-yield exam cheatsheet for the topic.
Include key formulas, quick definitions, laws, and common board-exam tips.
Format: Markdown. Keep it structured and bulleted.
Language: ${generationLanguage} | Grade: ${grade_level} | Board: ${board}
CRITICAL: Do NOT repeat the same formulas or sections. Ensure each point adds new value.`;
    } else if (type === 'essay') {
        systemInstruction = `You are an expert tutor. Create a detailed study guide or essay outline for the topic.
Format: Markdown with clean heading structure (H1, H2, H3).
Language: ${generationLanguage} | Grade: ${grade_level} | Board: ${board}
CRITICAL: Do NOT duplicate or repeat paragraphs or sections under different heading levels. Each heading (e.g. H3 vs H4) MUST contain completely unique, distinct content. Do NOT pad length by cloning sentences.`;
    } else {
        systemInstruction = `You are an expert tutor. Create comprehensive yet clear revision notes for the topic.
Format: Markdown with bullet points, brief examples, and analogies.
Language: ${generationLanguage} | Grade: ${grade_level} | Board: ${board}
CRITICAL: Do NOT repeat paragraphs or sentences. Keep it clean and concise. Each section must introduce new insights.`;
    }

    const messages = [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: `Create study material of type: "${type}" for the Course/Topic: "${title}" (Subject: "${subject}")` }
    ];

    const res = await getProviderResponse(messages, {
        jsonMode: type === 'flashcards',
        maxTokens: 3000,
        temperature: 0.3
    });

    let content = res?.choices?.[0]?.message?.content || '';

    if (targetLanguage !== 'english' && content) {
        if (type === 'flashcards') {
            console.log(`🌐 [E-Builder Bulk Translator] Translating flashcards in one single call to ${language}`);
            let parsed = safeJsonParse(content);
            if (parsed && !Array.isArray(parsed) && Array.isArray(parsed.flashcards)) {
                parsed = parsed.flashcards;
            }
            if (Array.isArray(parsed)) {
                return await translateFlashcardsBulk(parsed, language);
            }
            return [];
        }
    }

    if (type === 'flashcards') {
        let parsed = safeJsonParse(content);
        if (parsed && !Array.isArray(parsed) && Array.isArray(parsed.flashcards)) {
            parsed = parsed.flashcards;
        }
        if (Array.isArray(parsed)) {
            return parsed.map((item: any) => {
                const term = String(item.term || item.front || item.concept || item.word || item.question || '').trim();
                const definition = String(item.definition || item.back || item.explanation || item.desc || item.description || item.answer || '').trim();
                return { term, definition };
            }).filter(item => item.term.length > 0 && item.definition.length > 0);
        }
        return [];
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

// ─────────────────────────────────────────────
// 10. GENERATE ROADMAP FROM PREVIOUS YEAR PAPER (PYQ)
// ─────────────────────────────────────────────
export const generatePYQRoadmap = async (
    fileName: string,
    extractedText: string,
    studentQuery: string,
    grade_level: string,
    board: string,
    medium: string,
    language: string = 'english'
): Promise<any> => {
    const boardLabel = getBoardLabel(board);
    const gradeLabel = getGradeLabel(grade_level);

    const messages = [
        {
            role: 'system',
            content: `You are an expert exam curriculum designer and academic evaluator.
Analyze the provided Previous Year Question (PYQ) Paper or Exam Paper.
Create a structured preparation path where each node corresponds to a specific question or key topic found in the paper.

Return ONLY valid JSON:
{
    "title": "PYQ Prep: [Subject Name] ([Year/Exam if detected])",
    "subject": "Subject Name",
    "estimated_hours": number,
    "board_pattern": "Brief analysis of the exam format from this paper",
    "nodes": [
        {
            "order_index": 1,
            "title": "Q1: [Brief Question Summary or Topic]",
            "chapter": "Name of chapter/unit this belongs to",
            "topic": "Main academic topic",
            "subtopic": "Specific subtopic",
            "priority": "HIGH",
            "priority_reason": "Question direct from uploaded paper",
            "board_relevance": "Direct PYQ Question from: ${fileName}",
            "exam_weightage_percent": number,
            "difficulty": "basic" | "intermediate" | "advanced",
            "estimated_time_minutes": number,
            "key_points": [
                "QUESTION: [Full actual question text extracted from the paper]",
                "MARKS: [Marks allocated if visible, or null]"
            ],
            "key_formulas": ["Any key formulas required to solve this"]
        }
    ]
}

RULES:
- Parse all questions from the extracted paper text. If there are too many (e.g. >15), group related questions together or select the most critical 10-15 high-weightage questions. Do not omit crucial details.
- Calculate node priority dynamically: Set 'HIGH' for long answer questions or questions with high marks (>= 5 marks), 'MEDIUM' for short answer questions (2-4 marks), and 'LOW' for 1-mark/basic questions.
- Maintain the order from basic/first questions to advanced/final questions.
- Write ALL JSON fields in the target language: ${language}. For Hinglish, use Romanized Hindi.
- In key_points, the first item must strictly start with "QUESTION: " followed by the exact question from the paper, so the learning engine knows this is a PYQ node.`
        },
        {
            role: 'user',
            content: `Document Name: ${fileName}
Extracted Paper Text:
"""
${extractedText.substring(0, 15000)}
"""

Student Instruction: ${studentQuery}`
        }
    ];

    const res = await getProviderResponse(messages, { jsonMode: true, maxTokens: 4096, temperature: 0.3 });
    const text = res?.choices?.[0]?.message?.content || '{}';
    return safeJsonParse(text);
};

const getMinervaResponseFormattingInstruction = (userMessage: string, userName?: string): string => {
    const lowMsg = userMessage.toLowerCase().trim();
    
    // 1. Casual Chat / Greetings / Acknowledgment
    const isGreeting = /^(hi|hello|hey|hyy?|how are you|hey there|good morning|good evening|pranam|namaste)/i.test(lowMsg);
    const isTinyAck = /^(ok|okay|thanks?|thx|yes|ya|yup|hm+m?|h|han|ji|perfect|noted|done|thank you)$/i.test(lowMsg) || (lowMsg.length <= 3 && !/^\d+$/.test(lowMsg));
    
    if (isGreeting || isTinyAck) {
        return `
====================================
🎯 CASUAL CHAT MODE (STRICT LIMITS)
====================================
The student has sent a greeting, procedural acknowledgment, or short social message.
1. **STRICT LIMIT**: Respond with exactly ONE sentence or line (maximum 15-20 words).
2. **TONE**: Warm, friendly, teacher/elder-brotherly, and helpful. ALWAYS address the student as "${userName || 'Student'}". Example: "Hey **${userName || 'Student'}**, how are you doing today? Ready to learn something legendary?"
3. **FORMAT**: Keep it simple. NEVER use H2/H3 headings, bullet lists, or bold lists here.
4. **NO OVERHEAD**: Do NOT append any long [SUMMARY] or suggestions. Keep it clean and short.
`;
    }

    // 2. Technical Academic Questions (Maths, Physics, Chemistry, Biology)
    const academicKeywords = [
        'math', 'solve', 'calculate', 'formula', 'equation', 'reaction', 'chemistry', 'physics', 
        'biology', 'photosynthesis', 'pythagoras', 'gravity', 'electric', 'circuit', 'atom', 'molecule',
        'cell', 'dna', 'rna', 'protein', 'enzyme', 'organelle', 'deriv', 'proof', 'theorem', 'sum',
        'algebra', 'geometry', 'calculus', 'integration', 'differentiation', 'force', 'velocity', 'acid', 'base', 'lab'
    ];
    const isAcademic = academicKeywords.some(kw => lowMsg.includes(kw));

    // 3. Explicit Detail Request (including typos like detila, detilas, detal)
    const detailKeywords = ['detail', 'explain in-depth', 'samjhao', 'long', 'discuss', 'explain fully', 'deep dive', 'step by step', 'sikhau', 'detila', 'detilas', 'detal', 'samjav'];
    const isDetailRequest = detailKeywords.some(kw => lowMsg.includes(kw));

    if (isAcademic || isDetailRequest) {
        return `
====================================
🔬 DEEP TECHNICAL ACADEMIC & DETAILED MODE (EXHAUSTIVE & DETAILED)
====================================
The student is asking an academic/technical question or has requested detailed info.
1. **LENGTH**: Provide a VERY DETAILED, long, and comprehensive masterclass explanation.
2. **STRUCTURE**:
   - Use H2 (##) and H3 (###) titles to organize the sections logically.
   - Use standard Markdown bullets (\`-\`) and numbered steps (\`1.\`) for mechanisms or steps.
   - Highlight key terms in **bold**.
   - NEVER put list items inside a paragraph. Put every point on a new line with double newlines between sections.
3. **CONTENT**:
   - Mix clear descriptions with step-by-step mathematical calculations, derivations, chemical formulas, and biological processes.
   - Write equations in plain text/Unicode (e.g. use subscripts like H₂O, superscripts like x², arrows like →, etc.) without LaTeX dollar signs ($ or $$).
   - Use real-world analogies where helpful.
`;
    }

    // 4. Default: Normal Questions (Medium length, simple structure)
    return `
====================================
ℹ️ MEDIUM DETAIL EXPLANATION MODE (NORMAL)
====================================
The student has asked a general question.
1. **LENGTH**: Medium-length response (1 to 2 concise, clear paragraphs).
2. **FORMAT**: Clean paragraphs, no heavy list structures unless naturally required. Explain with analogies.
`;
};

const getDemographicConfig = (studentProfile: any): { temperature: number; maxTokens: number } => {
    const grade = (studentProfile?.grade_level || 'class_10').toLowerCase();
    if (
        grade.includes('phd') || 
        grade.includes('masters') || 
        grade.includes('graduation') || 
        grade.includes('professional') || 
        grade.includes('govt_exam') ||
        grade.includes('jee') || 
        grade.includes('neet') || 
        grade.includes('upsc') || 
        grade.includes('gate') || 
        grade.includes('cat')
    ) {
        return { temperature: 0.15, maxTokens: 3000 };
    }
    return { temperature: 0.8, maxTokens: 2500 };
};

const LEARNING_CONFIRMATIONS = [
    'samajh', 'samaj gya', 'clear', 'makkhan', 'makan', 'aha', 'great example', 
    'nice explanation', 'perfect explanation', 'thank you bhaiya', 'thanks bhaiya',
    'got it', 'understand', 'undrstnd', 'badiya', 'awesome', 'smjh gaya', 'smjh gya',
    'samajh gaya', 'samajh gya', 'samaj gaya', 'samaj gya'
];

export const processSelfLearningFeedback = async (
    studentMessage: string,
    previousReply: string,
    studentProfile: any
): Promise<void> => {
    const msg = studentMessage.toLowerCase();
    const hasConfirmation = LEARNING_CONFIRMATIONS.some(keyword => msg.includes(keyword));
    
    if (!hasConfirmation) return;

    try {
        const messages = [
            {
                role: 'system',
                content: `You are an educational feedback processor.
Analyze the student's confirmation and the teacher's previous reply.
Extract:
1. The exact key topic being explained (e.g., "Recursion", "Gradient Descent", "Binary Search", "Arteries") - keep it short (1-3 words).
2. The exact analogy or key explanation style used in the reply that made it click for the student.

Return ONLY a valid JSON object:
{
    "topic": "Key topic name",
    "analogy": "The detailed analogy or explanation style that worked"
}`
            },
            {
                role: 'user',
                content: `Teacher's Reply: "${previousReply.substring(0, 1500)}"\nStudent's Confirmation: "${studentMessage}"`
            }
        ];

        const res = await getProviderResponse(messages, { jsonMode: true, maxTokens: 500, temperature: 0.2 });
        const text = res?.choices?.[0]?.message?.content || '{}';
        const parsed = safeJsonParse(text);
        
        if (parsed?.topic && parsed?.analogy) {
            const studentLevel = studentProfile?.grade_level || 'class_10';
            const language = studentProfile?.language_preference || 'hinglish';
            
            await MinervaNeuralMemory.findOneAndUpdate(
                { 
                    topic: parsed.topic.trim().toLowerCase(), 
                    studentLevel, 
                    language 
                },
                { 
                    $inc: { successCount: 1 },
                    $setOnInsert: { 
                        analogy: parsed.analogy.trim(),
                        isGlobal: true 
                    } 
                },
                { upsert: true, new: true }
            );
            console.log(`🧠 [Neural Learning] Learnt new explanation/analogy for "${parsed.topic}" at level "${studentLevel}"!`);
        }
    } catch (err) {
        console.error("Failed to process self-learning feedback:", err);
    }
};

export const getCombinedMinervaResponse = async (
    message: string,
    studentProfile: any,
    chatHistory: any[],
    deep_study?: boolean,
    forceLab?: boolean,
    imageBase64?: string | null,
    imageMimeType?: string | null,
    rawQuery?: string,
    response_mode?: string
): Promise<{
    intent: any;
    reply: string;
    content_type: string;
    metadata: any;
}> => {
    try {
        const result = await executeProductionLearningEngine(
            message,
            studentProfile,
            chatHistory,
            deep_study,
            forceLab,
            rawQuery,
            imageBase64,
            imageMimeType
        );

        const finalMetadata: any = {};
        if (result.suggestions && result.suggestions.length > 0) {
            finalMetadata.suggestions = result.suggestions;
        }
        if (result.lab_config) {
            finalMetadata.lab_config = result.lab_config;
        }

        return {
            intent: result.intent,
            reply: result.reply,
            content_type: 'text',
            metadata: Object.keys(finalMetadata).length > 0 ? finalMetadata : null
        };
    } catch (err) {
        console.error("Combined Minerva response failed, using fallback:", err);
        return {
            intent: { intent: 'general_chat', confidence: 0.5 },
            reply: 'The server is currently busy or experiencing high traffic. Please try again in a few moments.',
            content_type: 'text',
            metadata: null
        };
    }
};

export const appealExamGrading = async (
    question: string,
    expectedAnswer: string,
    studentAnswer: string,
    currentMarks: number,
    totalMarks: number,
    studentReason: string
): Promise<{ approved: boolean; new_marks: number; appeal_feedback: string }> => {
    const messages = [
        {
            role: 'system',
            content: `You are an expert, empathetic, and objective Academic Appeals Committee member.
A student has submitted an appeal regarding the grading of their exam question.
Analyze the details and determine if the appeal is valid. If the original AI grading was too harsh or missed valid points explained by the student, approve the appeal and award the correct marks (between 0 and totalMarks).
Otherwise, reject the appeal and explain why the original grading was correct.

Return ONLY a valid JSON object:
{
    "approved": true | false,
    "new_marks": number (must be >= currentMarks and <= totalMarks),
    "appeal_feedback": "Empathic, friendly Hinglish explanation of the decision (e.g. why marks were added, or why the original score is correct)."
}`
        },
        {
            role: 'user',
            content: `Question: "${question}"
Expected Answer: "${expectedAnswer}"
Student's Answer: "${studentAnswer}"
Currently Awarded Marks: ${currentMarks} / ${totalMarks}
Student's Reason for Appeal: "${studentReason}"`
        }
    ];

    try {
        const res = await getProviderResponse(messages, { jsonMode: true, maxTokens: 800, temperature: 0.3 });
        const text = res?.choices?.[0]?.message?.content || '{}';
        const parsed = safeJsonParse(text) || {};
        return {
            approved: parsed.approved === true,
            new_marks: Math.min(totalMarks, Math.max(currentMarks, Number(parsed.new_marks) || currentMarks)),
            appeal_feedback: parsed.appeal_feedback || 'Appeal processed.'
        };
    } catch (err) {
        console.error("AI Grading Appeal failed:", err);
        return {
            approved: false,
            new_marks: currentMarks,
            appeal_feedback: 'System connection error during grading appeal evaluation. Original marks maintained.'
        };
    }
};

export const getParentGuidanceTip = async (
    studentName: string,
    stats: {
        level: number;
        xp: number;
        totalSessions: number;
        completedSessions: number;
        totalNodes: number;
        completedNodes: number;
        totalExams: number;
        averageScore: number;
    }
): Promise<string> => {
    const messages = [
        {
            role: 'system',
            content: `You are an AI child education counselor.
Based on the child's academic performance statistics provided below, generate a personalized, warm, encouraging, and highly actionable study tip / guidance advice for their parent.
Keep it strictly under 100 words. Write in professional, friendly Hinglish (target audience is an Indian parent).`
        },
        {
            role: 'user',
            content: `Student Name: ${studentName}
Current Level: ${stats.level} (XP: ${stats.xp})
Learning Sessions: ${stats.completedSessions} completed out of ${stats.totalSessions} total
Curriculum Nodes: ${stats.completedNodes} mastered out of ${stats.totalNodes} total
Exams Attempted: ${stats.totalExams}
Average Exam Score: ${stats.averageScore}%`
        }
    ];

    try {
        const res = await getProviderResponse(messages, { maxTokens: 400, temperature: 0.7 });
        return res?.choices?.[0]?.message?.content?.trim() || "Encourage daily practice to reinforce key concepts.";
    } catch (err) {
        console.error("AI Parent Guidance generation failed:", err);
        return "Encourage daily practice to reinforce key concepts.";
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// 3D MODEL RETRIEVAL ENGINE v2.0
// Future Education OS — Scientific 3D Model Search System
// Implements: Multi-Search · Quality Scoring · Semantic Verification ·
//             Confidence Thresholds · No Random Fallback · No Hardcoding
// ═══════════════════════════════════════════════════════════════════════════
export const validateAndResolveSketchfabModel = async (rawQuery: string): Promise<any> => {
    const cleanQuery = rawQuery.trim();
    if (!cleanQuery) return null;

    const LOG = (msg: string) => console.log(`[3D Engine v2.0] ${msg}`);

    // ──────────────────────────────────────────────────────────────────────
    // DIRECT UID CHECK: If query is already a 32-character hex Sketchfab UID
    // ──────────────────────────────────────────────────────────────────────
    if (/^[a-fA-F0-9]{32}$/.test(cleanQuery)) {
        LOG(`[DIRECT UID] Query is already a valid Sketchfab UID: "${cleanQuery}"`);
        return {
            model_id: cleanQuery,
            name: '3D Model',
            viewer_url: `https://sketchfab.com/models/${cleanQuery}`,
            thumbnail: null,
            confidence: 100,
            score: 100
        };
    }

    // ──────────────────────────────────────────────────────────────────────
    // DATABASE CACHE CHECK: If query already cached in DB, return it instantly
    // ──────────────────────────────────────────────────────────────────────
    try {
        const cached = await MinervaSketchfabCache.findOne({ query: cleanQuery.toLowerCase() });
        if (cached && cached.validated) {
            LOG(`[CACHE HIT] Returning cached 3D model for "${cleanQuery}": "${cached.model_id}"`);
            if (cached.model_id) {
                return {
                    model_id: cached.model_id,
                    name: cached.name,
                    viewer_url: cached.viewer_url,
                    thumbnail: cached.thumbnail,
                    confidence: cached.is_3d_possible ? 100 : 0,
                    score: cached.is_3d_possible ? 100 : 0
                };
            }
            return null; // Cached as not found
        }
    } catch (cacheErr) {
        console.error("[3D Engine Cache] Lookup error:", cacheErr);
    }

    // ──────────────────────────────────────────────────────────────────────
    // STEP 1-3: INTENT DETECTION · KEYWORD GENERATION · SYNONYM EXPANSION
    // ──────────────────────────────────────────────────────────────────────
    let primaryObject = '';
    let searchKeywords: string[] = [];
    let is3dPossible = false;
    let subjectArea = 'general';

    try {
        const intentRes = await getProviderResponse([
            {
                role: 'system',
                content: `You are the Intent Engine for a 3D Educational Model Search System used in schools.

TASK: Analyze the student's topic and generate optimized Sketchfab search keywords.

RULES:
1. Extract the PRIMARY physical/scientific object (NOT the student's raw sentence).
   - DISAMBIGUATION: Human biological organs and anatomy MUST be prefixed with "human" (e.g., "human leg", "human heart", "human brain", "human skeleton", "human muscle system") to avoid matching table legs, cartoon hearts, or animal organs.
   - "How does photosynthesis work?" → primary_object: "chloroplast"
   - "Explain kidney function" → primary_object: "human kidney"
   - "what is leg ?" → primary_object: "human leg anatomy"
   - "What is water molecule?" → primary_object: "water molecule H2O"
2. Generate 8-10 DIFFERENT keyword variations (2-4 words each) for multi-search.
   Include: scientific synonyms, anatomical terms, chemical names, related structures.
3. NEVER use the student's full sentence as a keyword. Extract the core object.
4. Determine if the topic has a PHYSICAL 3D model. Set is_3d_possible=false for:
   - Abstract concepts: democracy, grammar, AI, algorithms, history events, emotions
   - Pure math: equations, proofs, theorems (only formulas, no physical object)
   - General subjects: "science", "physics", "biology" (no specific object)

SYNONYM EXPANSION EXAMPLES:
- Kidney → ["human kidney anatomy", "renal system", "nephron kidney", "kidney cross section", "urinary anatomy", "glomerulus kidney", "renal cortex", "kidney medulla"]
- Heart → ["human heart anatomy", "cardiac anatomy", "heart chambers", "cardiovascular anatomy", "heart cross section", "cardiac muscle"]
- Leg → ["human leg anatomy", "human skeleton leg", "leg bone femur", "human leg muscles", "leg skeletal anatomy"]
- Photosynthesis → ["chloroplast", "plant chloroplast", "leaf cell anatomy", "photosynthesis organelle", "plant cell biology", "thylakoid membrane", "stroma chloroplast"]
- Water molecule → ["water molecule H2O", "water molecular structure", "H2O chemistry model", "molecular model water", "water chemical bond"]
- Gravity → ["gravity force simulation", "gravitational field", "orbital mechanics"] (physics, not anatomy)

Return ONLY valid JSON (no markdown):
{
  "is_3d_possible": boolean,
  "primary_object": "exact scientific name of the main educational object" | null,
  "subject": "biology" | "chemistry" | "physics" | "engineering" | "geology" | "astronomy" | "medicine" | "general",
  "search_keywords": ["keyword1", "keyword2", ..., "keyword10"]
}`
            },
            { role: 'user', content: `Student topic: "${cleanQuery}"` }
        ], { jsonMode: true, maxTokens: 500, temperature: 0.05 });

        const intentText = intentRes?.choices?.[0]?.message?.content || '{}';
        const intentParsed = safeJsonParse(intentText) || {};

        is3dPossible = intentParsed.is_3d_possible !== false;
        primaryObject = intentParsed.primary_object || cleanQuery.split(' ').slice(0, 3).join(' ');
        subjectArea = intentParsed.subject || 'general';
        searchKeywords = Array.isArray(intentParsed.search_keywords) && intentParsed.search_keywords.length > 0
            ? intentParsed.search_keywords.slice(0, 10)
            : [primaryObject, `${primaryObject} anatomy`, `${primaryObject} model`];

        LOG(`Topic: "${cleanQuery}" → Primary: "${primaryObject}", 3D Possible: ${is3dPossible}, Keywords: [${searchKeywords.join(' | ')}]`);

        if (!is3dPossible) {
            LOG(`Abstract topic — no 3D model possible for "${cleanQuery}".`);
            return null;
        }
    } catch (err) {
        console.error("[3D Engine v2.0] Intent extraction failed:", err);
        primaryObject = cleanQuery.split(' ').slice(0, 3).join(' ');
        searchKeywords = [primaryObject, `${primaryObject} anatomy`, `${primaryObject} model`, `${primaryObject} scientific`];
        is3dPossible = true;
    }

    // ──────────────────────────────────────────────────────────────────────
    // STEP 5: REJECTION FILTER — Never allow gaming/fantasy/cartoon assets
    // ──────────────────────────────────────────────────────────────────────
    const BANNED_TERMS = new Set([
        'game', 'gaming', 'minecraft', 'roblox', 'fortnite', 'warcraft', 'valorant',
        'stylized', 'fantasy', 'sci-fi', 'scifi', 'science fiction',
        'character', 'toy', 'weapon', 'sword', 'gun', 'cartoon', 'anime',
        'fan art', 'fanart', 'creature', 'monster', 'dragon', 'mech', 'robot',
        'decoration', 'decorative', 'fictional', 'low-poly', 'lowpoly', 'voxel',
        'chibi', 'npc', 'avatar', 'cosplay', 'prop', 'asset pack', 'game asset',
        'fps', 'rpg', 'mmorpg', 'dungeon', 'wizard', 'elf', 'orc', 'goblin',
        'zombie', 'vampire', 'werewolf', 'alien', 'spaceship', 'ufo',
        'furry', 'dnd', 'dungeons', 'league of legends', 'overwatch'
    ]);

    const ALLOWED_EDUCATIONAL_TERMS = new Set([
        'anatomy', 'biology', 'chemistry', 'physics', 'medical', 'scientific',
        'educational', 'museum', 'research', 'laboratory', 'industrial', 'mechanical',
        'engineering', 'molecule', 'cell', 'organ', 'system', 'structure',
        'model', 'cross section', 'diagram', 'specimen', 'clinical', 'pathology'
    ]);

    const isRejected = (item: any): boolean => {
        const title = (item.name || '').toLowerCase();
        const desc = (item.description || '').toLowerCase();
        const tags = (item.tags || []).map((t: any) => (t.name || t || '').toLowerCase()).join(' ');
        const allText = `${title} ${desc} ${tags}`;

        // Hard reject if banned terms found
        for (const term of BANNED_TERMS) {
            if (allText.includes(term)) return true;
        }

        // Also reject models with 0 likes AND very low view count (junk models)
        if ((item.likeCount || 0) === 0 && (item.viewCount || 0) < 20) return true;

        return false;
    };

    // ──────────────────────────────────────────────────────────────────────
    // STEP 4: MULTI-SEARCH — Search all keywords simultaneously
    // ──────────────────────────────────────────────────────────────────────
    const candidatesMap = new Map<string, any>();
    let searchRound = 1;

    const runMultiSearch = async (keywords: string[]): Promise<void> => {
        const fetch = (await import('node-fetch')).default;
        const HEADERS = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' };

        const promises = keywords.map(async (keyword) => {
            // Search by likes (most popular)
            const urlLikes = `https://api.sketchfab.com/v3/search?type=models&sort_by=-likeCount&q=${encodeURIComponent(keyword)}`;
            // Search by relevance
            const urlRel = `https://api.sketchfab.com/v3/search?type=models&sort_by=-relevance&q=${encodeURIComponent(keyword)}`;

            for (const url of [urlLikes, urlRel]) {
                try {
                    const res = await fetch(url, { headers: HEADERS });
                    const data: any = await res.json();
                    if (data?.results) {
                        data.results.forEach((item: any) => {
                            if (!item.uid || item.isAgeRestricted) return;
                            if (!isRejected(item)) {
                                candidatesMap.set(item.uid, item);
                            }
                        });
                    }
                } catch (e) { /* silent fail per keyword */ }
            }
        });

        await Promise.all(promises);
        LOG(`Round ${searchRound}: ${candidatesMap.size} candidates after filtering (from ${keywords.length} keywords)`);
        searchRound++;
    };

    // Primary search round
    try {
        await runMultiSearch(searchKeywords);
    } catch (err) {
        console.error("[3D Engine v2.0] Primary multi-search failed:", err);
    }

    // STEP 10/13: If not enough candidates, expand search and retry
    if (candidatesMap.size < 5) {
        LOG(`Expanding search — only ${candidatesMap.size} candidates found, generating more keywords...`);
        const expandedKeywords = [
            `${primaryObject} anatomy scientific`,
            `${primaryObject} educational 3d`,
            `${primaryObject} medical model`,
            `${subjectArea} ${primaryObject}`,
            `${primaryObject} cross section`,
            `${primaryObject} detailed`,
        ];
        try {
            await runMultiSearch(expandedKeywords);
        } catch (err) {
            console.error("[3D Engine v2.0] Expanded search failed:", err);
        }
    }

    const candidates = Array.from(candidatesMap.values()).slice(0, 20);

    if (candidates.length === 0) {
        LOG(`No scientifically verified 3D model exists for "${primaryObject}". Returning null.`);
        return null;
    }

    // ──────────────────────────────────────────────────────────────────────
    // STEP 6+7+8: QUALITY SCORING + SEMANTIC VERIFICATION (Top 10)
    // ──────────────────────────────────────────────────────────────────────
    // Take top 10 most-liked candidates for AI evaluation
    const top10 = candidates
        .sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))
        .slice(0, 10);

    LOG(`Evaluating top ${top10.length} candidates for "${primaryObject}"...`);

    let bestModelId: string | null = null;
    let bestScore = 0;
    let bestConfidence = 0;
    let bestReason = '';

    try {
        const candidateDetails = top10.map(c => ({
            uid: c.uid,
            title: c.name || '',
            description: (c.description || '').substring(0, 250),
            tags: (c.tags || []).map((t: any) => t.name || t).slice(0, 20),
            like_count: c.likeCount || 0,
            view_count: c.viewCount || 0,
            face_count: c.faceCount || 0,
        }));

        const scoringRes = await getProviderResponse([
            {
                role: 'system',
                content: `You are a Scientific 3D Model Validator for a school educational platform.

REQUESTED EDUCATIONAL OBJECT: "${primaryObject}"
STUDENT TOPIC: "${cleanQuery}"
SUBJECT: ${subjectArea}

Evaluate EVERY candidate model using this exact scoring system (total = 100 points):

SCORING RUBRIC:
1. Title Match (0-20): Does the title directly name "${primaryObject}" or an equivalent scientific term?
2. Tag Match (0-20): Do the tags confirm scientific/educational content related to "${primaryObject}"?
3. Description Match (0-15): Does the description confirm scientific/anatomical accuracy?
4. Educational Quality (0-15): Is it clearly for students/science (NOT gaming/fantasy/cartoon)?
5. Scientific Accuracy (0-15): Is it anatomically, chemically, or physically accurate?
6. Popularity (0-5): like_count > 100 = 5pts, > 50 = 3pts, > 10 = 2pts, else 1pt
7. Geometry Quality (0-5): face_count > 100000 = 5pts, > 10000 = 3pts, else 2pts
8. Thumbnail Quality (0-5): assume 3pts unless you can tell it's poor from title/description
9. Creator Reputation (0-5): Named/institutional creator = 5pts, anonymous = 2pts

INSTANT REJECTION (score = 0) — reject if the model:
- Is a game asset, character, weapon, toy, cartoon, anime, fantasy, sci-fi, decoration
- Does NOT represent "${primaryObject}" in any meaningful way
- Has completely unrelated title AND tags
- Is clearly a low-quality non-educational model
- CONTEXT MATCH FAILURE: If the topic is human biology/anatomy/medicine, reject any models representing invertebrates (like snails, insects, shells), animals, or household/abstract items (like table legs, chair legs, cartoon hearts). It MUST represent the human anatomical structure.

CONFIDENCE THRESHOLD: Only recommend models with score ≥ 70 and confidence ≥ 70%.

SEMANTIC VERIFICATION: For each model ask "Does this actually represent '${primaryObject}' for educational use?" — YES or NO.

Return ONLY valid JSON:
{
  "evaluations": [
    {
      "uid": "model uid",
      "score": 0-100,
      "semantic_match": true|false,
      "semantic_confidence": 0-100,
      "reject_reason": "reason if rejected" | null
    }
  ],
  "best_uid": "uid of highest scoring model with score≥70 and semantic_match=true" | null,
  "best_score": number,
  "best_confidence": number,
  "reason": "why this model was selected OR why none were selected"
}`
            },
            { role: 'user', content: `Candidates to evaluate: ${JSON.stringify(candidateDetails)}` }
        ], { jsonMode: true, maxTokens: 800, temperature: 0.05 });

        const scoringText = scoringRes?.choices?.[0]?.message?.content || '{}';
        const scoringParsed = safeJsonParse(scoringText) || {};

        bestModelId = scoringParsed.best_uid || null;
        bestScore = scoringParsed.best_score || 0;
        bestConfidence = scoringParsed.best_confidence || 0;
        bestReason = scoringParsed.reason || '';

        LOG(`Scoring complete — Best: "${bestModelId}", Score: ${bestScore}/100, Confidence: ${bestConfidence}%, Reason: ${bestReason}`);

        // ──────────────────────────────────────────────────────────────────
        // STEP 9: CONFIDENCE THRESHOLDS (Cascading Relaxation: 85 -> 80 -> 75 -> 70)
        // ──────────────────────────────────────────────────────────────────
        let confirmedModel = null;
        for (const threshold of [85, 80, 75, 70]) {
            if (bestModelId && bestScore >= threshold && bestConfidence >= threshold) {
                const match = candidates.find(c => c.uid === bestModelId);
                if (match) {
                    confirmedModel = match;
                    LOG(`✅ CONFIRMED (Threshold ${threshold}%): "${match.name}" — Score: ${bestScore}/100, Confidence: ${bestConfidence}%`);
                    break;
                }
            }
        }

        if (confirmedModel) {
            const resultObj = {
                model_id: confirmedModel.uid,
                name: confirmedModel.name,
                viewer_url: confirmedModel.viewerUrl,
                thumbnail: confirmedModel.thumbnails?.images?.[0]?.url || null,
                confidence: bestConfidence,
                score: bestScore,
            };

            // Save success to Cache
            try {
                await MinervaSketchfabCache.findOneAndUpdate(
                    { query: cleanQuery.toLowerCase() },
                    {
                        english_concept: primaryObject,
                        is_3d_possible: true,
                        model_id: resultObj.model_id,
                        name: resultObj.name,
                        viewer_url: resultObj.viewer_url,
                        thumbnail: resultObj.thumbnail,
                        validated: true
                    },
                    { upsert: true, new: true }
                );
                LOG(`[CACHE SAVE] Saved resolved model for "${cleanQuery}" to database cache.`);
            } catch (saveErr) {
                console.error("[3D Engine Cache] Save error:", saveErr);
            }

            return resultObj;
        }

        LOG(`❌ No scientifically verified model found for "${primaryObject}" above 70%. Score: ${bestScore}/100, Confidence: ${bestConfidence}%. Returning null.`);

        // Cache the empty result (no model found)
        try {
            await MinervaSketchfabCache.findOneAndUpdate(
                { query: cleanQuery.toLowerCase() },
                {
                    english_concept: primaryObject,
                    is_3d_possible: false,
                    model_id: null,
                    name: null,
                    viewer_url: null,
                    thumbnail: null,
                    validated: true
                },
                { upsert: true, new: true }
            );
            LOG(`[CACHE SAVE] Cached empty result for "${cleanQuery}" to database cache.`);
        } catch (saveErr) {
            console.error("[3D Engine Cache] Save error:", saveErr);
        }

    } catch (valErr) {
        console.error("[3D Engine v2.0] Scoring/Verification step failed:", valErr);
    }

    return null;
};

export const searchSketchfabModelsList = async (query: string): Promise<any[]> => {
    const cleanQuery = query.trim();
    if (!cleanQuery) return [];

    const LOG = (msg: string) => console.log(`[3D Search List] ${msg}`);
    LOG(`Searching for: "${cleanQuery}"`);

    try {
        const fetch = (await import('node-fetch')).default;
        const HEADERS = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' };
        
        // No category/education filter — search ALL of Sketchfab for exactly what user typed
        // isEmbeddable=true ensures returned models can actually be loaded in the iframe viewer
        const url = `https://api.sketchfab.com/v3/search?type=models&sort_by=-relevance&count=50&isEmbeddable=true&q=${encodeURIComponent(cleanQuery)}`;
        const res = await fetch(url, { headers: HEADERS });
        const data: any = await res.json();
        
        if (data && data.results) {
            // Split query into keywords, filter out common stop words
            const stopWords = new Set(['a', 'an', 'the', '3d', 'model', 'of', 'and', 'with', 'for', 'in', 'on', 'at', 'by', 'to', 'from', 'free']);
            const queryWords = cleanQuery.toLowerCase()
                .replace(/[^a-z0-9\s]/g, '')
                .split(/\s+/)
                .filter(w => w.length > 1 && !stopWords.has(w));

            const scoredResults = data.results.map((item: any) => {
                const nameLower = (item.name || '').toLowerCase();
                
                // Calculate match score
                let matchCount = 0;
                let exactSubstringMatch = false;

                if (queryWords.length > 0) {
                    queryWords.forEach(word => {
                        if (nameLower.includes(word)) {
                            matchCount++;
                        }
                    });
                    if (nameLower.includes(cleanQuery.toLowerCase())) {
                        exactSubstringMatch = true;
                    }
                } else {
                    if (nameLower.includes(cleanQuery.toLowerCase())) {
                        matchCount = 1;
                    }
                }

                // Final relevance score
                const relevanceScore = (matchCount * 10) + (exactSubstringMatch ? 15 : 0) + (item.viewCount ? Math.min(item.viewCount / 5000, 5) : 0);

                return {
                    uid: item.uid,
                    name: item.name,
                    viewerUrl: item.viewerUrl,
                    viewCount: item.viewCount || 0,
                    user: {
                        username: item.user?.username || '',
                        displayName: item.user?.displayName || item.user?.username || ''
                    },
                    thumbnails: {
                        images: (item.thumbnails?.images || []).map((img: any) => ({
                            url: img.url || null,
                            width: img.width || 0,
                            height: img.height || 0
                        }))
                    },
                    relevanceScore,
                    matchCount
                };
            });

            // Filter: require at least one query keyword to match in the model title (if keywords exist)
            let filtered = scoredResults;
            if (queryWords.length > 0) {
                filtered = scoredResults.filter((r: any) => r.matchCount > 0);
                if (filtered.length === 0) {
                    filtered = scoredResults; // Fallback to unfiltered if too strict
                }
            }

            // Sort by relevance score descending
            filtered.sort((a: any, b: any) => b.relevanceScore - a.relevanceScore);

            return filtered.map((r: any) => ({
                uid: r.uid,
                name: r.name,
                viewerUrl: r.viewerUrl,
                viewCount: r.viewCount,
                user: r.user,
                thumbnails: r.thumbnails
            }));
        }
    } catch (err) {
        console.error('[3D Search List] Error searching Sketchfab:', err);
    }
    return [];
};

export const searchYoutubeVideosList = async (query: string): Promise<any[]> => {
    try {
        const cleanQuery = query.trim();
        if (!cleanQuery) return [];

        // Append educational keywords to guarantee educational lessons rather than random videos
        let finalQuery = cleanQuery;
        const lowerQ = finalQuery.toLowerCase();
        if (!lowerQ.includes('animation') && !lowerQ.includes('explanation') && !lowerQ.includes('lecture') && !lowerQ.includes('tutorial') && !lowerQ.includes('lesson') && !lowerQ.includes('class')) {
            finalQuery = `${finalQuery} educational explanation animation lesson`;
        }

        const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(finalQuery)}`;
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9'
            }
        });
        const html = await response.text();
        const videos: any[] = [];
        
        // Match ytInitialData JSON
        const jsonRegex = /var ytInitialData = ({.*?});/;
        const match = html.match(jsonRegex);
        
        if (match && match[1]) {
            try {
                const data = JSON.parse(match[1]);
                const contents = data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents;
                
                if (contents && Array.isArray(contents)) {
                    for (const contentItem of contents) {
                        const video = contentItem.videoRenderer;
                        if (video && video.videoId) {
                            const videoId = video.videoId;
                            const title = video.title?.runs?.[0]?.text || 'Educational Video';
                            const channel = video.ownerText?.runs?.[0]?.text || 'YouTube Creator';
                            const duration = video.lengthText?.simpleText || '';
                            const views = video.viewCountText?.simpleText || '';
                            
                            // Educational relevance check
                            const titleLower = title.toLowerCase();
                            const channelLower = channel.toLowerCase();
                            
                            // Check if title or channel contains educational terms
                            const eduTerms = ['education', 'educational', 'animation', 'explanation', 'lesson', 'lecture', 'tutorial', 'class', 'learn', 'academy', 'study', 'school', 'science', 'math', 'concept', 'explain', 'visual', 'animated', 'ncert', 'cbse'];
                            const isEdu = eduTerms.some(term => titleLower.includes(term) || channelLower.includes(term));
                            
                            if (videoId !== 'dQw4w9WgXcQ' && isEdu) {
                                videos.push({
                                    id: videoId,
                                    title,
                                    channel,
                                    duration,
                                    views,
                                    url: `https://www.youtube.com/watch?v=${videoId}`,
                                    thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
                                });
                            }
                        }
                    }
                }
            } catch (_) {}
        }
        
        // Regex fallback if JSON fails or filters too aggressively
        if (videos.length === 0) {
            const videoIdRegex = /"videoId":"([a-zA-Z0-9_-]{11})"/g;
            let m;
            const seen = new Set();
            while ((m = videoIdRegex.exec(html)) !== null && videos.length < 12) {
                const id = m[1];
                if (id !== 'dQw4w9WgXcQ' && !seen.has(id)) {
                    seen.add(id);
                    videos.push({
                        id,
                        title: 'Educational Lesson',
                        channel: 'YouTube Video',
                        duration: '',
                        views: '',
                        url: `https://www.youtube.com/watch?v=${id}`,
                        thumbnail: `https://img.youtube.com/vi/${id}/mqdefault.jpg`
                    });
                }
            }
        }
        
        return videos;
    } catch (e) {
        console.error("[YouTube search list error]", e);
        return [];
    }
};
