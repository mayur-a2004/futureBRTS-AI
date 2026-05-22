import logging
import json
import requests
import time
from bs4 import BeautifulSoup
from duckduckgo_search import DDGS
from core.cortex import intelligence
from core.veil import veil
from rich.console import Console

logger = logging.getLogger(__name__)
console = Console()

class OmniSifter:
    """
    Infinite Research Mechanism.
    If data isn't found locally, it searches globally using Agentic Recursive Scraping.
    """
    
    def __init__(self, query: str):
        self.query = query
        self.raw_intelligence = []

    def scrape_recursive(self, depth=2):
        """
        [TITAN DISCOVERY MODE]
        Recursive Research across Socials, Marketplaces, and Search.
        """
        console.print(f"[bold gold1]🔱 TITAN DISCOVERY ACTIVATED:[/bold gold1] [white]{self.query}[/white]")
        
        # Determine if query is a Brand or URL
        is_url = self.query.startswith("http")
        brand_name = self.query if not is_url else self.query.split("//")[-1].split(".")[0]

        with DDGS() as ddgs:
            # Stage 1: Social Media Discovery & Sentiment
            social_queries = [
                f"{brand_name} instagram profile",
                f"{brand_name} tiktok viral videos",
                f"{brand_name} youtube channel stats",
                f"{brand_name} advertisement campaigns google ads"
            ]
            for sq in social_queries:
                self._execute_search(ddgs, sq, category="social")

            # Stage 2: Marketplace Dominance
            market_queries = [
                f"{brand_name} products on amazon",
                f"{brand_name} flipkart listings price",
                f"{brand_name} reviews quality"
            ]
            for mq in market_queries:
                self._execute_search(ddgs, mq, category="marketplace")

            # Stage 3: Deep Technical & SEO Research
            self._execute_search(ddgs, self.query, category="core")
            
            # Logic: If data density is low, go deeper into technical documentation or news
            if len(self.raw_intelligence) < 5:
                depth_queries = [f"{brand_name} news funding", f"{brand_name} technical architecture stack"]
                for dq in depth_queries:
                    self._execute_search(ddgs, dq, category="intel")

    def _execute_search(self, ddgs, q, category="general"):
        try:
            results = list(ddgs.text(q, max_results=5))
            for r in results:
                url = r.get('href')
                try:
                    headers = veil.anonymize_request(url)
                    resp = requests.get(url, timeout=7, headers=headers)
                    if resp.status_code == 200:
                        soup = BeautifulSoup(resp.text, 'lxml')
                        
                        # --- SUPREME DATA EXTRACTION ---
                        html_content = str(resp.text).lower()
                        
                        # Detect Tech Stack & Marketing
                        detected_tech = [v for k, v in {
                            'react': 'React.js', 'next.js': 'Next.js', 'wordpress': 'WordPress',
                            'shopify': 'Shopify', 'webflow': 'Webflow'
                        }.items() if k in html_content]
                        
                        marketing_tags = [v for k, v in {
                            'fbevents.js': 'Meta Pixel', 'adsbygoogle': 'Google Ads',
                            'googletagmanager': 'GTM', 'gtag': 'GA4'
                        }.items() if k in html_content]

                        # Heuristic: Estimation of Spend & Activity
                        activity_signals = {
                            "social_frequency": html_content.count('post') + html_content.count('video'),
                            "keyword_richness": len(soup.find_all(['h1', 'h2', 'h3'])),
                            "is_ad_heavy": 'sponsored' in html_content or 'advertisement' in html_content
                        }

                        for junk in soup(["script", "style", "nav", "footer"]): junk.extract()
                        clean_text = " ".join(soup.get_text().split()[:1000])
                        
                        self.raw_intelligence.append({
                            "category": category,
                            "source": url, 
                            "data": clean_text,
                            "tech_stack": list(set(detected_tech)),
                            "marketing_tags": marketing_tags,
                            "signals": activity_signals,
                            "timestamp": time.time()
                        })
                except Exception: continue
        except Exception as e:
            logger.error(f"Titan Search failed for {q}: {e}")

    def synthesize(self):
        """
        [BRAIN-X MASTER ENGINE]
        Synthesizes Global Intelligence using AI, ML Logic, and Strategic Prediction.
        """
        if not self.raw_intelligence:
            return {"error": "Neural Void"}

        synthesis_prompt = f"""
        [TITAN BUSINESS COMMANDER - SUPREME STRATEGIC MODE]
        Target: {self.query}
        Dataset Size: {len(self.raw_intelligence)} Nodes Extracted.

        TASK: 
        Execute a 100% fidelity analysis across 6 Industrial Pillars. 
        Use ML logic, DS prediction, and Competitive Game Theory.

        PILLARS TO ANALYZE:
        1. SEO GROWTH ENGINE: Keyword rankings, backlink intent, on-page forensic audit.
        2. SCALING STRATEGY: Market trajectory, expansion gaps, ROI-focused scaling roadmap.
        3. KPI DELIVERY ENGINE: Hard metrics (CTR, ROI estimates, conversion patterns).
        4. NICHE DOMINANCE: Competition level, unique selling points vs you.
        5. AI TREND PULSE: How they use AI/SOTA models in their stack.
        6. TECH ARCHITECTURE: Scalability, performance grade, industrial tech stack.

        MANDATORY FIELDS:
        - "marketing_spend_est": Heuristic estimate based on ad presence.
        - "trending_hashtags": Viral signal discovery.
        - "ranking_keywords": Specific keywords they dominate.
        - "peak_activity_time": When they are most viral/active.
        - "actionable_attack_plan": 5-step concrete roadmap to beat them.

        OUTPUT ENTIRELY IN VALID JSON.
        """
        
        return intelligence.think(synthesis_prompt, "You are the Supreme Strategic Commander.", force_json=True)

def run(config, prompt):
    query = config.get("prompt", prompt or config.get("command", ""))
    sifter = OmniSifter(query)
    sifter.scrape_recursive(depth=1)
    final_output = sifter.synthesize()
    
    result_data = {"summary": final_output}
    try:
        if isinstance(final_output, str):
            if "{" in final_output and "}" in final_output:
                clean_json = final_output.strip()
                if "```json" in clean_json:
                    clean_json = clean_json.split("```json")[1].split("```")[0].strip()
                result_data = json.loads(clean_json)
        else:
            result_data = final_output
    except:
        pass

    return {
        "status": "completed",
        "extracted_text": final_output if isinstance(final_output, str) else json.dumps(final_output),
        "intelligence_nodes": sifter.raw_intelligence, # ✅ Pass raw nodes for backend storage
        "result": {
            **result_data,
            "fidelity": "Supreme_Legend_V5",
            "scraping_mode": "Recursive_Omni"
        }
    }

def scrape(url: str) -> dict:
    console.print(f"[bold cyan]🕸️ SCRAPE TRIGGERED:[/bold cyan] {url}")
    try:
        headers = veil.anonymize_request(url)
        resp = requests.get(url, timeout=10, headers=headers)
        
        if resp.status_code == 200:
            soup = BeautifulSoup(resp.text, 'lxml')
            
            # --- MINING (TECH & SEO) ---
            html_content = str(resp.text).lower()
            detected_tech = []
            if 'react' in html_content: detected_tech.append('React.js')
            if 'next.js' in html_content: detected_tech.append('Next.js')
            if 'googletagmanager' in html_content: detected_tech.append('GTM')
            if 'stripe' in html_content: detected_tech.append('Stripe')

            seo_score = 0
            if soup.title: seo_score += 25
            if soup.find('meta', attrs={'name': 'description'}): seo_score += 25
            if soup.h1: seo_score += 25
            if 'canonical' in html_content: seo_score += 25

            # Clean up
            for script in soup(["script", "style", "nav", "footer"]):
                script.extract()
            
            title = soup.title.string if soup.title else url
            text = soup.get_text()
            clean_text = "\n".join([line.strip() for line in text.splitlines() if line.strip()][:100])
            
            return {
                "status": "completed",
                "extracted_text": clean_text,
                "intelligence_nodes": [{
                    "source": url,
                    "data": clean_text[:500],
                    "tech_stack": detected_tech,
                    "seo_score": seo_score
                }],
                "result": {
                    "metadata": {"title": title, "seo_score": seo_score, "tech": detected_tech},
                    "url": url
                }
            }
        else:
             return {"status": "failed", "error": f"HTTP {resp.status_code}"}
             
    except Exception as e:
        return {"status": "failed", "error": str(e)}
