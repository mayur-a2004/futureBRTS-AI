import os
import json
import re
import zipfile
import datetime

PROJECTS_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "backend", "projects"))
os.makedirs(PROJECTS_ROOT, exist_ok=True)

def _write_zip_file(zf: zipfile.ZipFile, path: str, content: str):
    zf.writestr(path, content.strip() + "\n")

def generate_source_zip(
    project_name: str,
    category: str,
    field: str,
    project_type: str,
    tech_stack: str,
    vision: str,
    ai_content: str,
    job_id: str,
    images: None
) -> str:
    """
    TITAN SUPREME FRONTEND-FIRST ENGINE v6.0 (ANTIGRAVITY).
    Focuses 100% on high-fidelity, professional frontend generation.
    Backend & Database logic is preserved as COMMENTS for developer reference.
    Supports React, Next.js, and Vanilla HTML/CSS/JS dynamically.
    """
    safe_name = re.sub(r'[^\w\s-]', '', project_name).strip().replace(' ', '_')
    filename  = f"SourceCode_{safe_name}_{job_id[:8]}.zip"
    filepath  = os.path.join(PROJECTS_ROOT, job_id, filename)
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    project_slug = safe_name.lower().replace(" ", "_")
    
    stack = tech_stack.lower()

    # Helper for AI logic extraction
    def get_logic_block(lang, marker):
        pattern = rf"```{lang}\s*({marker}.*?)```" if marker else rf"```{lang}(.*?)```"
        match = re.search(pattern, ai_content, re.DOTALL | re.IGNORECASE)
        if match:
            return match.group(1).strip()
        return None

    with zipfile.ZipFile(filepath, 'w', zipfile.ZIP_DEFLATED) as zf:
        # --- 0. Master Blueprint Loader ---
        _write_zip_file(zf, f"{project_slug}/README.md", f"""
# {project_name} 🔱
> **TITAN SUPREME FRONTEND BUILD v6.0 (ANTIGRAVITY EDITION)**

## 📊 Mission Overview
- **Project Vision:** {vision}
- **High-Fidelity Stack:** {tech_stack}
- **Tier:** {category}
- **Status:** Frontend Fully Operational | Backend/DB Preserved as Comments

## 🚀 Deployment Strategy (Frontend Only)
1. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 📂 Industrial Architecture
- `/frontend`: High-Fidelity Responsive UI Components (Complete & Ready).
- `/backend`: [INACTIVE] Backend skeletons and API protocols preserved for future development.
- `/docs`: Project vision and technical specs.
""")

        # --- 1. Visual Assets Injection ---
        if images:
            for key, path in images.items():
                if os.path.exists(path):
                    target_asset = f"{project_slug}/frontend/public/assets/{os.path.basename(path)}"
                    zf.write(path, target_asset)

        # --- 2. MULTI-STACK SCAFFOLD REGISTRY ---
        
        # [A] BACKEND SKELETON (COMMENTED OUT AS PER REQUEST)
        be_commented = f"""/**
 * TITAN SUPREME BACKEND PROTOCOL (INACTIVE)
 * Project: {project_name}
 * 
 * NOTE: This backend logic is preserved for reference. 
 * To activate, a developer must uncomment the routes and configure the DB.
 */

/*
const express = require('express');
const mongoose = require('mongoose');
const app = express();

// Database Connectivity (Preserved)
// mongoose.connect(process.env.DB_URI);

app.get('/api/status', (req, res) => {{
    res.json({{ status: 'NEURAL_LINK_STANDBY', mission: '{project_name}' }});
}});

// app.listen(5000);
*/
"""

        # [B] REACT SUPREME SCAFFOLD
        react_ui = f"""import React, {{ useState, useEffect }} from 'react';
import {{ Zap, Shield, Cpu, Globe, ArrowRight, Activity, Database, Lock, Menu, X, Sparkles, Layout, Box, Layers }} from 'lucide-react';

/**
 * {project_name} | High-Fidelity UI Node
 * Architected by FutureBRTS Titan v6.0
 */
export default function App() {{
  const [activePage, setActivePage] = useState('home');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {{ setIsLoaded(true); }}, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Navigation Layer */}
      <nav className="fixed top-0 w-full z-[100] backdrop-blur-2xl bg-black/40 border-b border-white/5 px-8 py-5 flex justify-between items-center">
        <div className="flex items-center gap-4 group cursor-pointer" onClick={{() => setActivePage('home')}}>
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:rotate-12 transition-all">
            <Zap size={{20}} className="fill-white" />
          </div>
          <h1 className="text-xl font-black uppercase italic tracking-tighter bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
            {project_name}
          </h1>
        </div>
        <div className="hidden lg:flex items-center gap-10">
          {{['Home', 'Solutions', 'Ecosystem', 'Vault'].map((item) => (
            <button 
                key={{item}} 
                onClick={{() => setActivePage(item.toLowerCase())}}
                className={{`text-[10px] font-black uppercase tracking-[0.2em] transition-all ${{activePage === item.toLowerCase() ? 'text-indigo-400' : 'text-gray-500 hover:text-white'}}`}}>
              {{item}}
            </button>
          ))}}
          <button className="px-6 py-2.5 bg-white text-black text-[10px] font-[1000] uppercase tracking-widest rounded-xl hover:bg-indigo-600 hover:text-white transition-all">
            Initiate_Sync
          </button>
        </div>
      </nav>

      <main className={{`transition-all duration-1000 ${{isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}}`}}>
        {{activePage === 'home' && <HeroSection vision="{vision}" />}}
        {{activePage === 'solutions' && <SolutionsSection />}}
        {{activePage === 'ecosystem' && <EcosystemSection />}}
        {{activePage === 'vault' && <VaultSection />}}
      </main>

      <footer className="py-20 border-t border-white/5 text-center">
        <p className="text-[9px] font-black uppercase tracking-[0.5em] text-gray-800 italic">
            Genesis Neural Architecture v6.0 — Industrial Build Certified
        </p>
      </footer>
    </div>
  );
}}

function HeroSection({{ vision }}) {{
    return (
        <section className="pt-40 pb-20 px-8 max-w-7xl mx-auto">
            <div className="space-y-12 max-w-4xl">
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-500/5 border border-indigo-500/20 rounded-full">
                    <Sparkles size={{14}} className="text-indigo-400" />
                    <span className="text-[9px] font-black text-indigo-300 uppercase tracking-widest">Industrial Protocol Active</span>
                </div>
                <h2 className="text-7xl lg:text-[120px] font-black leading-[0.85] tracking-tighter italic uppercase">
                    Architecting <br /> <span className="text-indigo-500">Future</span> Nodes.
                </h2>
                <p className="text-xl text-gray-400 leading-relaxed max-w-2xl font-medium italic">
                    {{vision}}
                </p>
                <div className="flex gap-6">
                    <button className="px-10 py-5 bg-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-500/30"> Deploy Mission </button>
                    <button className="px-10 py-5 bg-white/5 border border-white/10 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all"> Documentation </button>
                </div>
            </div>
            <div className="mt-40 grid grid-cols-1 md:grid-cols-3 gap-8">
                <MetricCard title="System_Uptime" value="99.99%" icon={{<Activity className="text-indigo-400" />}} />
                <MetricCard title="Data_Sync" value="1.2ms" icon={{<Database className="text-emerald-400" />}} />
                <MetricCard title="Security_Tier" value="AES-X" icon={{<Lock className="text-pink-400" />}} />
            </div>
        </section>
    );
}}

function MetricCard({{ title, value, icon }}) {{
    return (
        <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[2.5rem] group hover:border-indigo-500/30 transition-all">
            <div className="mb-6"> {{icon}} </div>
            <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2"> {{title}} </h4>
            <p className="text-4xl font-black tracking-tighter italic"> {{value}} </p>
        </div>
    );
}}

function SolutionsSection() {{
    return (
        <div className="py-40 px-8 text-center space-y-8 animate-in fade-in zoom-in duration-700">
            <h2 className="text-5xl font-black uppercase italic tracking-tighter">Mission_Solutions</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                {{[1,2,3,4].map(i => (
                    <div key={{i}} className="aspect-square bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 flex flex-col justify-between items-start group hover:bg-indigo-500/5 transition-all">
                        <Box size={{32}} className="text-gray-700 group-hover:text-indigo-500 transition-colors" />
                        <div className="text-left">
                            <h5 className="font-black text-xl italic mb-2 uppercase">Module_{{i}}</h5>
                            <p className="text-xs text-gray-500 font-bold uppercase">Optimized Industrial Logic</p>
                        </div>
                    </div>
                ))}}
            </div>
        </div>
    );
}}

function EcosystemSection() {{
    return (
        <div className="py-40 px-8 max-w-7xl mx-auto flex flex-col lg:flex-row gap-20 items-center animate-in slide-in-from-bottom duration-1000">
            <div className="flex-1 space-y-8">
                <h2 className="text-5xl font-black uppercase italic tracking-tighter">Global Ecosystem</h2>
                <p className="text-gray-500 leading-relaxed font-medium">Distributed ledger technology providing zero-latency synchronization across planetary industrial nodes. Our ecosystem is built for infinite horizontal scalability.</p>
                <div className="space-y-4">
                    {{['Neural Syncing', 'Encrypted Transport', 'Data Sovereignty'].map(t => (
                        <div key={{t}} className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-indigo-400">
                            <ArrowRight size={{14}} /> {{t}}
                        </div>
                    ))}}
                </div>
            </div>
            <div className="flex-1 w-full aspect-video bg-indigo-600/10 border border-indigo-500/20 rounded-[3rem] relative overflow-hidden group">
                 <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent animate-pulse" />
                 <div className="absolute inset-0 flex items-center justify-center">
                    <Globe size={{120}} className="text-indigo-500 opacity-30 group-hover:scale-125 transition-transform duration-1000" />
                 </div>
            </div>
        </div>
    );
}}

function VaultSection() {{
    return (
        <div className="py-40 px-8 text-center">
            <div className="max-w-2xl mx-auto p-20 bg-white/[0.01] border-2 border-dashed border-white/5 rounded-[4rem] space-y-10 hover:border-indigo-500/20 transition-all">
                <Lock size={{64}} className="mx-auto text-gray-800" />
                <h2 className="text-3xl font-black uppercase tracking-widest">Neural_Vault</h2>
                <p className="text-gray-600 text-sm font-bold uppercase tracking-widest leading-loose">Secure storage protocols active. Please authenticate via industrial node to access mission artifacts.</p>
                <button className="px-12 py-5 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-600 hover:text-white transition-all">Authorize_Session</button>
            </div>
        </div>
    );
}}
"""

        # [C] NEXT.JS SUPREME SCAFFOLD
        next_ui = f"""// TITAN SUPREME NEXT.JS GENERATOR v6.0
import {{ Zap, Activity, Shield, Globe }} from 'lucide-react';

export default function Home() {{
  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30">
      <nav className="p-10 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center gap-4">
            <Zap className="text-indigo-500" />
            <h1 className="text-2xl font-black italic tracking-tighter uppercase">{project_name}</h1>
        </div>
        <div className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-700">Next.js_Titan_Node</div>
      </nav>
      
      <section className="py-40 px-10 max-w-7xl mx-auto space-y-12 text-center">
        <h2 className="text-8xl font-black italic tracking-tighter uppercase leading-none">
            Visionary <br /> <span className="text-indigo-500">Business</span> Scalability.
        </h2>
        <p className="text-2xl text-gray-500 italic max-w-3xl mx-auto">{vision}</p>
        <div className="flex justify-center gap-10 pt-20">
            <Metric title="Sync" value="99%" />
            <Metric title="Load" value="1.2ms" />
            <Metric title="Security" value="AES-X" />
        </div>
      </section>
    </main>
  );
}}

function Metric({{ title, value }}) {{
    return (
        <div className="space-y-2">
            <div className="text-4xl font-black italic tracking-tighter text-white">{{value}}</div>
            <div className="text-[9px] font-black text-gray-700 uppercase tracking-widest">{{title}}</div>
        </div>
    );
}}
"""

        # [D] VANILLA HTML SUPREME SCAFFOLD
        vanilla_ui = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{project_name} | Titan Supreme</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap" rel="stylesheet">
    <style>
        body {{ font-family: 'Inter', sans-serif; background: #050505; color: white; overflow-x: hidden; scroll-behavior: smooth; }}
        .hud-border {{ border: 1px solid rgba(255,255,255,0.05); }}
        .hud-glass {{ background: rgba(255,255,255,0.02); backdrop-filter: blur(20px); }}
    </style>
</head>
<body class="selection:bg-indigo-500/30">
    <nav class="fixed top-0 w-full z-50 hud-glass hud-border px-10 py-6 flex justify-between items-center">
        <div class="flex items-center gap-4">
            <div class="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center"><i data-lucide="zap" class="fill-white"></i></div>
            <h1 class="text-2xl font-black italic tracking-tighter uppercase">{project_name}</h1>
        </div>
        <div class="hidden md:flex gap-12 text-[10px] font-black uppercase tracking-[0.4em] text-gray-600">
            <a href="#home" class="hover:text-indigo-400">Home</a>
            <a href="#intel" class="hover:text-indigo-400">Intel</a>
            <a href="#deploy" class="hover:text-indigo-400">Deploy</a>
        </div>
    </nav>

    <main class="max-w-7xl mx-auto px-10">
        <section id="home" class="pt-60 pb-40 space-y-12">
            <h2 class="text-7xl lg:text-[140px] font-black leading-[0.8] tracking-tighter italic uppercase">
                Supreme <br> <span class="text-indigo-500">Neural</span> <br> Build.
            </h2>
            <p class="text-2xl text-gray-500 italic max-w-2xl leading-relaxed">{vision}</p>
            <div class="flex gap-8 pt-10">
                <button class="px-12 py-6 bg-white text-black font-black uppercase tracking-widest rounded-3xl hover:bg-indigo-600 hover:text-white transition-all">Start_Mission</button>
                <button class="px-12 py-6 hud-border hud-glass font-black uppercase tracking-widest rounded-3xl">Dossier_V6</button>
            </div>
        </section>

        <section id="intel" class="py-40 grid grid-cols-1 md:grid-cols-3 gap-10 border-t border-white/5">
            <div class="p-16 hud-glass hud-border rounded-[4rem] space-y-8">
                <i data-lucide="activity" class="text-indigo-400"></i>
                <h3 class="text-[10px] font-black text-gray-600 uppercase tracking-widest">Network_Sync</h3>
                <p class="text-5xl font-black italic tracking-tighter">99.9%</p>
            </div>
            <div class="p-16 hud-glass hud-border rounded-[4rem] space-y-8">
                <i data-lucide="shield" class="text-emerald-400"></i>
                <h3 class="text-[10px] font-black text-gray-600 uppercase tracking-widest">Encryption</h3>
                <p class="text-5xl font-black italic tracking-tighter">AES-X</p>
            </div>
            <div class="p-16 hud-glass hud-border rounded-[4rem] space-y-8">
                <i data-lucide="cpu" class="text-purple-400"></i>
                <h3 class="text-[10px] font-black text-gray-600 uppercase tracking-widest">Logic_Node</h3>
                <p class="text-5xl font-black italic tracking-tighter">TITAN</p>
            </div>
        </section>
    </main>

    <footer class="py-20 border-t border-white/5 text-center text-[10px] font-black uppercase tracking-[0.8em] text-gray-800 italic">
        Project Synthesized by Titan Node v6.0 (Antigravity)
    </footer>

    <script>lucide.createIcons();</script>
</body>
</html>"""

        # --- 3. BUNDLE EXECUTION ---
        
        # ALWAYS BUNDLE BACKEND (COMMENTED)
        _write_zip_file(zf, f"{project_slug}/backend/server.js", be_commented)
        _write_zip_file(zf, f"{project_slug}/backend/db_config.js", "// Database protocol preserved in server.js comments")

        # DYNAMIC FRONTEND BUNDLE
        if "react" in stack or "mern" in stack:
            fe = f"{project_slug}/frontend"
            _write_zip_file(zf, f"{fe}/package.json", '{"name":"titan-client","version":"1.0.0","dependencies":{"react":"^18.2.0","react-dom":"^18.2.0","lucide-react":"^0.263.1","framer-motion":"^10.12.16"}}')
            _write_zip_file(zf, f"{fe}/src/App.jsx", react_ui)
            _write_zip_file(zf, f"{fe}/src/main.jsx", "import React from 'react'; import ReactDOM from 'react-dom/client'; import App from './App'; import './index.css'; ReactDOM.createRoot(document.getElementById('root')).render(<App />);")
            _write_zip_file(zf, f"{fe}/src/index.css", "@tailwind base; @tailwind components; @tailwind utilities;")
            _write_zip_file(zf, f"{fe}/index.html", f"<!DOCTYPE html><html><head><script src='https://cdn.tailwindcss.com'></script></head><body><div id='root'></div><script type='module' src='/src/main.jsx'></script></body></html>")
            
        elif "next" in stack:
            fe = f"{project_slug}/frontend"
            _write_zip_file(zf, f"{fe}/package.json", '{"dependencies":{"next":"latest","react":"latest","react-dom":"latest","lucide-react":"latest"}}')
            _write_zip_file(zf, f"{fe}/app/page.tsx", next_ui)
            _write_zip_file(zf, f"{fe}/app/layout.tsx", "export default function Layout({ children }) { return (<html><head><script src='https://cdn.tailwindcss.com'></script></head><body>{children}</body></html>); }")

        else:
            # FALLBACK TO SUPREME VANILLA
            _write_zip_file(zf, f"{project_slug}/index.html", vanilla_ui)
            _write_zip_file(zf, f"{project_slug}/styles.css", "/* High-Fidelity Styling Injected via Tailwind CDN */")
            _write_zip_file(zf, f"{project_slug}/script.js", "// Neural Logic Active")

    return filepath
