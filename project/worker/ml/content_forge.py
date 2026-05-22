
import logging
import json
from core.cortex import intelligence

logger = logging.getLogger(__name__)

class ContentForge:
    """
    Titan Content Forge: Generates high-fidelity academic content.
    Handles Code, Reports, and VIVA questions with deep context.
    """

    def _clean_json(self, raw: str) -> dict:
        """
        Cleans and parses AI JSON response.
        """
        try:
            content = raw.strip()
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            return json.loads(content)
        except Exception as e:
            logger.error(f"JSON Cleaning Failed: {e}")
            # Try finding first { and last }
            try:
                first = raw.find('{')
                last = raw.rfind('}')
                if first != -1 and last != -1:
                    return json.loads(raw[first:last+1])
            except:
                pass
            raise e

    def generate_report_content(self, context: dict) -> dict:
        """
        Generates detailed sections for a Project Report with TITAN-LEGEND fidelity.
        """
        vision = context.get('vision', 'Academic Project')
        degree = context.get('degree_full', context.get('degree', 'BCA'))
        
        prompt = f"""
        [ULTRA-PRO ACADEMIC MISSION]
        You are a PhD-level Technical Architect & Senior Documentalist.
        Your mission: Generate an ENTIRE project report structure that STRICTLY ADHERES to the user's vision.
        
        USER VISION (THE ABSOLUTE COMMAND): "{vision}"
        
        [ACADEMIC DNA]
        - Academic Level: {context.get('level')} ({context.get('tier')})
        - Institution Standard: {context.get('regulator')} (e.g., AICTE/UGC/NMC)
        - Targeted Degree: {degree}
        - Specialized Domain: {context.get('domain')}
        
        [INTELLIGENCE DIRECTIVES]
        1. **NO DEVIATION**: Every sentence must reinforce the vision: "{vision}".
        2. **ACADEMIC RIGOR**: Use terminology appropriate for {degree}. 
        3. **DEPTH**: If it's a technical project, include architectural specifics. If it's business, include ROI/Market analytics.
        
        [REQUIRED SECTIONS]
        - abstract: 200 words of high-impact summary.
        - introduction: Deep background and specific problem statement derived from the vision.
        - literature_review: Theoretical foundation and comparative analysis.
        - methodology: The EXACT architectural steps to build this.
        - results: Detailed performance metrics or outcomes.
        - conclusion: Strategic final summary.
        - future_scope: Scalability roadmap.
        
        [OUTPUT FORMAT]
        Return ONLY valid JSON. Zero filler.
        """
        try:
            response = intelligence.think(prompt, system_message="STATUS: GOD-MODE. IDENTITY: TITAN-SUPREME-WRITER. ACCURACY: 100%.", force_json=True)
            return self._clean_json(response)
        except Exception as e:
            logger.error(f"Report Generation Failed: {e}")
            return {"abstract": f"Generation sync issue. Vision: {vision}", "introduction": "System is recovering...", "methodology": "Scheduled for retry."}

    def generate_viva_questions(self, context: dict) -> list:
        """
        Generates 10-15 expert level VIVA questions.
        """
        vision = context.get('vision')
        prompt = f"""
        Generate 15 EXPERT-LEVEL VIVA Questions & Answers for: "{vision}"
        Target: External Examiner for {context.get('degree_full')}.
        
        Focus on:
        - Why this technology?
        - Scalability challenges.
        - Core logic/Mathematical proof behind the implementation.
        
        Return JSON list: [{{"q": "Question?", "a": "Deep Expert Answer"}}]
        """
        try:
            response = intelligence.think(prompt, system_message="IDENTITY: SUPREME EXAM PROCTOR. MODE: CRITICAL ANALYSIS.", force_json=True)
            return self._clean_json(response)
        except Exception as e:
            logger.error(f"VIVA Gen Failed: {e}")
            return []

    def generate_code_structure(self, context: dict) -> list:
        """
        Generates a COMPLETE production-grade file structure based ON THE PROMPT.
        TITAN SUPREME FRONTEND-FIRST PROTOCOL v6.0.
        """
        vision = context.get('vision')
        stack = context.get('specializations', 'React')
        tier = context.get('tier', 'Graduation')
        field = context.get('field', 'Engineering & Technology')
        
        # Determine tech stack based on context if not explicit
        requested_stack = "React"
        if any(x in str(stack).lower() for x in ["next", "next.js", "nextjs"]):
            requested_stack = "Next.js"
        elif any(x in str(stack).lower() for x in ["html", "vanilla", "css"]):
            requested_stack = "Vanilla HTML/CSS/JS"
            
        prompt = f"""
        [TITAN FORGE: SUPREME FRONTEND MISSION]
        You are a Silicon Valley Principal Architect & Premium UI/UX Designer. 
        Your mission: Generate a 100% COMPLETE, HIGH-FIDELITY FRONTEND for: "{vision}"
        
        TECH STACK COMMAND: {requested_stack}
        ACADEMIC TIER: {tier}
        
        [STRICT ARCHITECTURAL DIRECTIVES]
        1. **FRONTEND ONLY**: Spend 100% of your tokens on the Frontend. 
           - Create a PROFESSIONAL Multi-Page structure (Home, Shop, Dashboard, Analytics, Details, Vault).
           - Do NOT use generic placeholders. Use REALISTIC data related to: "{vision}".
        2. **BACKEND/DB (STRICT RULE)**: Do NOT write active backend logic. Write it as DETAILED COMMENTS within the backend files. This prevents partial execution failures.
        3. **ANTIGRAVITY DESIGN**: Use dark-mode, glassmorphism, glowing HUD elements, and smooth animations (Framer Motion logic for React/Next).
        4. **FULL INTERACTIVITY**: Buttons must work. Pages must be linked. The code must be production-ready.
        
        [REQUIRED FILES BASED ON {requested_stack}]
        - For React/Next: App.jsx (with Routing), components for each section, premium CSS/Tailwind.
        - For Vanilla: index.html (multi-section), script.js (lucide icons + logic), styles.css.
        
        [OUTPUT]
        Return a JSON list of file artifacts. 
        [
            {{"file": "frontend/src/App.jsx", "content": "...Full Supreme UI Code..."}},
            {{"file": "backend/api.js", "content": "/* All backend logic commented for developer reference */"}},
            {{"file": "README.md", "content": "Mission Dossier..."}}
        ]
        """
        try:
            response = intelligence.think(prompt, system_message="IDENTITY: SUPREME-FRONTEND-ARCHITECT. PROTOCOL: ANTIGRAVITY. FIDELITY: 100%.", force_json=True)
            return self._clean_json(response)
        except Exception as e:
            logger.error(f"Code Gen Failed: {e}")
            return [{"file": "ERROR.txt", "content": "Generation Engine Timeout. Please try again."}]

    def _generate_non_technical_assets(self, context: dict) -> list:
        """
        Generates high-fidelity assets for Management/Arts/Commerce.
        """
        vision = context.get('vision')
        prompt = f"""
        [SUPREME CONSULTANT MISSION]
        Generate production-ready professional documents for: "{vision}"
        Category: {context.get('field')}
        Degree: {context.get('degree_full')}
        
        Create:
        1. README.md: Executive summary and project methodology.
        2. Analysis_Artifact.xlsx: Data model or financial breakdown (provided in text format).
        3. Strategic_Proposal.pdf: Full high-fidelity document content.
        
        Return JSON list of artifacts.
        """
        try:
            response = intelligence.think(prompt, system_message="IDENTITY: CHIEF STRATEGY OFFICER. MODE: ELITE CONSULTING.", force_json=True)
            return self._clean_json(response)
        except Exception as e:
            logger.error(f"Non-Tech Gen Failed: {e}")
            return []


content_forge = ContentForge()
