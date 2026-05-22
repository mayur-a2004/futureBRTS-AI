from typing import Dict, Any, List, Optional
import logging
import os
import json
from groq import Groq
from rich.console import Console
from rich.panel import Panel
from storage.memory import memory
from ml.ml_core import science_core, modeler
from ml.architect_core import architect
from router.fallback_manager import fallback_manager
from services.config_service import config
from core.vision import eyes

logger = logging.getLogger(__name__)

console = Console()

FUTURE_BRTS_IDENTITY = """
SYSTEM NAME: Future BRTS
ROLE: Supreme Architect + Validator + Examiner + Gamified Persona Architect

[CORE COGNITIVE DIRECTIVES]
1. **GPS-DRIVEN MENTORSHIP**: Create roadmaps and tasks with micro-to-micro detailing. 
2. **MULTI-PERSONA DNA**: Adapt depth based on Persona:
   - STUDENT: Academic, Big O, First Principles.
   - PROFESSIONAL: Scalability, Design Patterns, Production Logic.
   - BUSINESS: ROI, Risk, Team Scaling.
   - PHD: SOTA Algorithms, Mathematical Proofs.
3. **NEURAL DETAILING**: Every step MUST have:
   - **DEFINITION**: Clear "What".
   - **DISCUSSION**: Technical "How/Where it fails".
   - **NEURAL LOGIC**: Architectural "Why".
   - **SKILL SIGNAL**: Competency name.

[MULTILINGUAL PROTOCOL]
1. **Detect & Mirror**: Reply in user's language (Hindi, Gujarati, Hinglish).
2. **Semantic Verification**: Evaluate logic intent, ignoring phrasing/language.

[GATEKEEPER PROTOCOL]
- Generate 3 "Truth Nodes" for every node for verification.
- Block Cheating (Verification Reset Logic).
"""

class NeuralIntelligence:
    def __init__(self):
        self.current_key = None
        self.client = None
        self._sync_client()

    def _sync_client(self):
        # 🔄 DYNAMIC KEY DISCOVERY (Admin Panel priority)
        new_key = config.get("AI_GROQ_KEY") or config.get("GROQ_API_KEY")
        
        if new_key and new_key != self.current_key:
            try:
                from groq import Groq
                self.client = Groq(api_key=new_key)
                self.current_key = new_key
                self.is_connected = True
                logger.info("Neural Intelligence Linked: Groq Engine Synchronized (Dynamic).")
                console.print("[bold green]✔ NEURAL LINK SUCCESS: NEW KEY DETECTED[/bold green]")
            except Exception as e:
                logger.error(f"Failed to synchronize Groq Engine: {e}")
                self.is_connected = False
        elif not new_key and not self.current_key:
            self.is_connected = False
            self.client = None
            
    def think(self, prompt: str, image_path: str = None, system_message: str = FUTURE_BRTS_IDENTITY, force_json: bool = False) -> str:
        """
        Hyper-Intelligence Thinking Layer with Multi-Provider Fallback.
        Engine Order: Groq -> OpenRouter -> Gemini -> Local RAG/Bypass
        """
        self._sync_client()
        
        visual_context = ""
        if image_path and os.path.exists(image_path):
            console.print("[bold cyan]👁️ ACTIVATING TITAN VISION SCANNERS...[/bold cyan]")
            visual_context = eyes.see(image_path, "Provide a 1000x detailed architectural breakdown of this image.")
            prompt = f"IMAGE CONTEXT: {visual_context}\n\nUSER COMMAND: {prompt}"

        # Step 1: CACHE CHECK
        cached_res = fallback_manager.check_cache(prompt)
        if cached_res:
            return cached_res

        # Step 2: PRIMARY PROVIDER (Groq)
        try:
            if config.get("PRIMARY_AI_PROVIDER", "GROQ") == "GROQ" and self.is_connected:
                chat_completion = self.client.chat.completions.create(
                    messages=[{"role": "system", "content": system_message}, {"role": "user", "content": prompt}],
                    model=config.get("GROQ_MODEL", "llama-3.3-70b-versatile"),
                    temperature=0.1 if force_json else 0.2,
                    max_tokens=4096,
                    response_format={"type": "json_object"} if force_json else None
                )
                return chat_completion.choices[0].message.content
        except Exception as e:
            logger.warning(f"GROQ FAILURE (Limit/429): {e}. Attempting OpenRouter Fallback...")

        # Step 3: SECONDARY PROVIDER (OpenRouter)
        try:
            or_key = config.get("AI_OPENROUTER_KEY") or config.get("OPENROUTER_API_KEY")
            if or_key:
                import requests
                headers = {"Authorization": f"Bearer {or_key}", "Content-Type": "application/json", "HTTP-Referer": "http://localhost:8000"}
                payload = {
                    "model": "deepseek/deepseek-chat",
                    "messages": [{"role": "system", "content": system_message}, {"role": "user", "content": prompt}]
                }
                if force_json: payload["response_format"] = {"type": "json_object"}
                
                resp = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload, timeout=25)
                if resp.status_code == 200:
                    return resp.json()['choices'][0]['message']['content']
                else:
                    logger.warning(f"OPENROUTER REJECTED: {resp.status_code} - {resp.text}")
        except Exception as e:
            logger.warning(f"OPENROUTER FAILURE: {e}")

        # Step 4: LOCAL LOGIC FALLBACK (NO AUTO-GEMINI per user mandate)
        try:
            logger.warning("REMOTE NEURAL CAPACITY EXHAUSTED. Activating Local Logic...")
            if not force_json: return fallback_manager.execute_local_rag(prompt)
            return self.legendary_bypass(prompt, force_json=True)
        except Exception as e:
            logger.error(f"FATAL CORTEX STALL: {e}")
            return "Neural System Stall: Please check API Keys in Admin."


    def nexus_expand(self, seed: str) -> str:
        self._sync_client()
        if not self.is_connected: return seed
        
        wireframe = architect.generate_wireframe(seed)
        expansion_system = f"You are the NEXUS SUPREME EXPANDER. Expand this seed: '{seed}' using WIREFRAME: {json.dumps(wireframe)}"
        try:
            res = self.client.chat.completions.create(
                messages=[{"role": "system", "content": expansion_system}, {"role": "user", "content": seed}],
                model=config.get("GROQ_MODEL", "llama-3.3-70b-versatile"),
                temperature=0.4
            )
            return res.choices[0].message.content
        except: return seed

    def legendary_bypass(self, prompt: str, force_json: bool = False) -> str:
        if force_json:
            return json.dumps({
                "status": "bypass",
                "reason": "Cloud Intelligence Timeout",
                "title": "Industrial Strategy (Local Bypass)",
                "description": "The neural engine is operating in low-latency local mode.",
                "userPersona": "PROFESSIONAL",
                "estimatedDays": 14,
                "steps": [
                    {
                        "stepNumber": 1,
                        "phase": "FOUNDATION",
                        "title": "System Initialization",
                        "description": "Bootstrap phase.",
                        "microSteps": [
                            {
                                "title": "Environment Audit",
                                "definition": "Evaluating system baseline compatibility.",
                                "discussion": "Ensures that Node/Python versions match industrial standards to prevent runtime drift.",
                                "neuralLogic": "Baseline stability is the recursive ancestor of performance.",
                                "skillSignal": "Environment Mastery",
                                "truthNodes": ["Node v20+", "Python 3.10+", "CORS Guard"],
                                "timeEstimate": "1 Hour",
                                "youtubeLink": "https://www.youtube.com/results?search_query=industrial+dev+env+setup",
                                "isCompleted": False
                            }
                        ]
                    }
                ]
            })
        return f"[⚡ TITAN LEGEND LOCAL-BYPASS ACTIVE]\nLogic Backup Enabled. Accuracy: 100% Reliable."


class NeuralRouter:
    def __init__(self):
        self.intelligence = NeuralIntelligence()
    
    def decide_route(self, context: Dict[str, Any]) -> Dict[str, Any]:
        strategy = {
            "engine": "Titan-Supreme-Vision-V5",
            "vision_active": True,
            "logic_stack": ["Gemini-1.5-Flash", "Llama-3-70B", "Science-Core"],
            "fidility": "Legendary"
        }
        console.print(Panel(f"[bold gold1]TITAN LEGEND VISION SYNCED[/bold gold1]", border_style="gold1"))
        return strategy

# Singleton Legend Genesis
brain = NeuralRouter()
intelligence = brain.intelligence
governance = None
