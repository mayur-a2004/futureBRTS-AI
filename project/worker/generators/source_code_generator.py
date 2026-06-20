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
        react_ui = f"""import React, {{ useState, useEffect, useRef }} from 'react';
import {{ Zap, Shield, Cpu, Globe, ArrowRight, Activity, Database, Lock, Menu, X, Sparkles, Layout, Box, Layers, Trash2, Edit, Plus, Search, Filter, Settings, User, LogOut, Bell, Check, Info }} from 'lucide-react';

/**
 * {project_name} | High-Fidelity UI Node
 * Architected by FutureBRTS Titan v6.0 (Antigravity Edition)
 */
export default function App() {{
  const [activePage, setActivePage] = useState('home');
  const [isLoaded, setIsLoaded] = useState(false);
  const [records, setRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Form State
  const [currentRecord, setCurrentRecord] = useState({{ id: '', title: '', category: 'General', status: 'Active', description: '' }});
  const [isEditMode, setIsEditMode] = useState(false);
  const [formError, setFormError] = useState('');
  
  const dialogRef = useRef(null);

  useEffect(() => {{
    setIsLoaded(true);
    // Load initial CRUD records from localStorage
    const saved = localStorage.getItem('antigravity_records_{project_slug}');
    if (saved) {{
      try {{
        setRecords(JSON.parse(saved));
      }} catch (e) {{
        initializeDefaultRecords();
      }}
    }} else {{
      initializeDefaultRecords();
    }}
  }}, []);

  const initializeDefaultRecords = () => {{
    const defaults = [
      {{ id: '1', title: 'Data Node Alpha', category: 'Infrastructure', status: 'Active', description: 'Core data ingestion hub for telemetry.' }},
      {{ id: '2', title: 'Security Shield', category: 'Vault', status: 'Active', description: 'AES-X encryption key management pipeline.' }},
      {{ id: '3', title: 'ML Parser Core', category: 'Intelligence', status: 'Standby', description: 'Natural language semantic parsing module.' }},
      {{ id: '4', title: 'Web Gateway', category: 'Network', status: 'Active', description: 'High-performance API edge gateway router.' }}
    ];
    setRecords(defaults);
    localStorage.setItem('antigravity_records_{project_slug}', JSON.stringify(defaults));
  }};

  const saveRecordsToStorage = (updated) => {{
    setRecords(updated);
    localStorage.setItem('antigravity_records_{project_slug}', JSON.stringify(updated));
  }};

  // CRUD Actions
  const handleOpenAddModal = () => {{
    setCurrentRecord({{ id: '', title: '', category: 'General', status: 'Active', description: '' }});
    setIsEditMode(false);
    setFormError('');
    dialogRef.current?.showModal();
  }};

  const handleOpenEditModal = (rec) => {{
    setCurrentRecord(rec);
    setIsEditMode(true);
    setFormError('');
    dialogRef.current?.showModal();
  }};

  const handleDeleteRecord = (id) => {{
    const updated = records.filter(r => r.id !== id);
    saveRecordsToStorage(updated);
  }};

  const handleSaveRecord = (e) => {{
    e.preventDefault();
    if (!currentRecord.title.trim()) {{
      setFormError('Title is required.');
      return;
    }}
    
    let updated;
    if (isEditMode) {{
      updated = records.map(r => r.id === currentRecord.id ? currentRecord : r);
    }} else {{
      const newRec = {{
        ...currentRecord,
        id: Date.now().toString()
      }};
      updated = [...records, newRec];
    }}
    saveRecordsToStorage(updated);
    dialogRef.current?.close();
  }};

  // Filtering
  const filteredRecords = records.filter(r => {{
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = statusFilter === 'all' || r.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  }});

  return (
    <div className="min-h-screen bg-[#030712] text-[#f8fafc] font-sans selection:bg-indigo-500/30 overflow-x-hidden relative">
      
      {{\/* Decorative Glow Elements *\/}}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      {{\/* Navigation Layer *\/}}
      <nav className="fixed top-0 w-full z-[100] backdrop-blur-2xl bg-black/40 border-b border-white/5 px-8 py-4 flex justify-between items-center glass-nav">
        <div className="flex items-center gap-4 group cursor-pointer" onClick={{() => setActivePage('home')}}>
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:rotate-12 transition-all">
            <Zap size={{20}} className="fill-white text-white" />
          </div>
          <h1 className="text-xl font-black uppercase italic tracking-tighter bg-gradient-to-r from-white via-gray-300 to-gray-600 bg-clip-text text-transparent poppins">
            {project_name}
          </h1>
        </div>
        
        {{\/* Navigation Tabs *\/}}
        <div className="hidden lg:flex items-center gap-10">
          {{['Home', 'Dashboard', 'Vault'].map((item) => (
            <button 
              key={{item}} 
              onClick={{() => setActivePage(item.toLowerCase())}}
              className={{`text-[10px] font-black uppercase tracking-[0.2em] transition-all ${{activePage === item.toLowerCase() ? 'text-indigo-400 glow-text' : 'text-gray-500 hover:text-white'}}`}}>
              {{item}}
            </button>
          ))}}
          
          {{\/* Native Popover User Dropdown *\/}}
          <div className="relative">
            <button 
              {{...{{ popovertarget: "user-profile-menu" }}}}
              className="w-10 h-10 rounded-full border border-indigo-500/30 flex items-center justify-center bg-indigo-500/5 hover:bg-indigo-500/20 transition-all">
              <User size={{18}} className="text-indigo-400" />
            </button>
            
            <div 
              id="user-profile-menu" 
              {{...{{ popover: "auto" }}}} 
              className="p-6 w-64 text-left border border-white/10 rounded-xl bg-[#090d16]/95 backdrop-blur-2xl text-white">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">U</div>
                <div>
                  <h4 className="text-sm font-bold">Admin Agent</h4>
                  <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider font-bold">Superuser Node</span>
                </div>
              </div>
              <ul className="space-y-2">
                <li>
                  <button onClick={{() => {{ setActivePage('vault'); document.getElementById('user-profile-menu')?.hidePopover(); }}}} className="w-full text-left py-2 px-3 hover:bg-white/5 rounded-lg text-xs font-semibold flex items-center gap-2">
                    <Lock size={{14}} className="text-gray-400" /> Secure Vault
                  </button>
                </li>
                <li>
                  <button onClick={{() => {{ setActivePage('dashboard'); document.getElementById('user-profile-menu')?.hidePopover(); }}}} className="w-full text-left py-2 px-3 hover:bg-white/5 rounded-lg text-xs font-semibold flex items-center gap-2">
                    <Activity size={{14}} className="text-gray-400" /> Operational Stats
                  </button>
                </li>
                <li className="border-t border-white/5 pt-2 mt-2">
                  <button className="w-full text-left py-2 px-3 hover:bg-red-500/10 text-red-400 rounded-lg text-xs font-semibold flex items-center gap-2">
                    <LogOut size={{14}} /> LogOut Node
                  </button>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </nav>

      {{\/* Main Content Area *\/}}
      <main className={{`pt-24 min-h-[calc(100vh-180px)] transition-all duration-1000 ${{isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}}`}}>
        
        {{activePage === 'home' && (
          <section className="pt-20 pb-20 px-8 max-w-7xl mx-auto">
            <div className="space-y-8 max-w-4xl">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-500/5 border border-indigo-500/20 rounded-full">
                <Sparkles size={{14}} className="text-indigo-400" />
                <span className="text-[9px] font-black text-indigo-300 uppercase tracking-widest">Industrial Protocol V6.0 Active</span>
              </div>
              <h2 className="text-6xl lg:text-[100px] font-black leading-[0.9] tracking-tighter italic uppercase">
                Divine <br /> <span className="text-indigo-500">Antigravity</span> <br /> Dashboard.
              </h2>
              <p className="text-xl text-gray-400 leading-relaxed max-w-2xl font-medium italic">
                {vision}
              </p>
              <div className="flex gap-6 pt-4">
                <button onClick={{() => setActivePage('dashboard')}} className="px-10 py-5 bg-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-500/30 hover:bg-indigo-700 transition-all hover:scale-[1.02]">
                  Explore Node Dashboard
                </button>
                <button onClick={{() => setActivePage('vault')}} className="px-10 py-5 bg-white/5 border border-white/10 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all hover:scale-[1.02]">
                  Vault Access
                </button>
              </div>
            </div>
            
            <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[2.5rem] hover:border-indigo-500/30 transition-all glass-panel">
                <div className="mb-6"><Activity className="text-indigo-400" size={{32}} /></div>
                <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">System_Uptime</h4>
                <p className="text-4xl font-black tracking-tighter italic">99.998%</p>
              </div>
              <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[2.5rem] hover:border-indigo-500/30 transition-all glass-panel">
                <div className="mb-6"><Database className="text-emerald-400" size={{32}} /></div>
                <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">DB_Nexus_Ping</h4>
                <p className="text-4xl font-black tracking-tighter italic">1.24ms</p>
              </div>
              <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[2.5rem] hover:border-indigo-500/30 transition-all glass-panel">
                <div className="mb-6"><Shield className="text-purple-400" size={{32}} /></div>
                <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">Security_Protocol</h4>
                <p className="text-4xl font-black tracking-tighter italic">AES-256</p>
              </div>
            </div>
          </section>
        )}}

        {{activePage === 'dashboard' && (
          <section className="py-12 px-8 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-8">
              <div>
                <h2 className="text-4xl font-black uppercase italic tracking-tighter poppins">Telemetry_Dashboard</h2>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">Manage system nodes and live data repositories</p>
              </div>
              <button 
                onClick={{handleOpenAddModal}}
                className="px-6 py-4 bg-indigo-600 text-white text-[10px] font-[1000] uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/10">
                <Plus size={{14}} /> Add New Node
              </button>
            </div>

            {{\/* Filter and Search Bar *\/}}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={{16}} />
                <input 
                  type="text" 
                  placeholder="Search telemetry records..." 
                  value={{searchQuery}}
                  onChange={{(e) => setSearchQuery(e.target.value)}}
                  className="w-full bg-white/[0.02] border border-white/5 rounded-xl py-3 pl-12 pr-4 text-xs font-medium input-glass"
                />
              </div>
              <div className="flex gap-2">
                {{['all', 'active', 'standby'].map(f => (
                  <button
                    key={{f}}
                    onClick={{() => setStatusFilter(f)}}
                    className={{`flex-1 py-3 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${{statusFilter === f ? 'bg-white text-black border-white' : 'bg-white/[0.02] text-gray-400 border-white/5 hover:border-white/20'}}`}}>
                    {{f}}
                  </button>
                ))}}
              </div>
            </div>

            {{\/* Records Data Table *\/}}
            <div className="glass-panel overflow-hidden border border-white/5 rounded-2xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.01]">
                    <th className="py-4 px-6 text-[10px] font-black uppercase tracking-wider text-gray-500">Node Name</th>
                    <th className="py-4 px-6 text-[10px] font-black uppercase tracking-wider text-gray-500">Category</th>
                    <th className="py-4 px-6 text-[10px] font-black uppercase tracking-wider text-gray-500">Status</th>
                    <th className="py-4 px-6 text-[10px] font-black uppercase tracking-wider text-gray-500">Description</th>
                    <th className="py-4 px-6 text-[10px] font-black uppercase tracking-wider text-gray-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {{filteredRecords.length > 0 ? (
                    filteredRecords.map(r => (
                      <tr key={{r.id}} className="hover:bg-white/[0.01] transition-colors group">
                        <td className="py-4 px-6 font-bold text-sm text-indigo-400">{{r.title}}</td>
                        <td className="py-4 px-6 text-xs text-gray-400">{{r.category}}</td>
                        <td className="py-4 px-6">
                          <span className={{`inline-block px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-wider ${{r.status.toLowerCase() === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}}`}}>
                            {{r.status}}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-xs text-gray-500 max-w-xs truncate">{{r.description}}</td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex justify-end gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button onClick={{() => handleOpenEditModal(r)}} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-all">
                              <Edit size={{14}} />
                            </button>
                            <button onClick={{() => handleDeleteRecord(r.id)}} className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400 transition-all">
                              <Trash2 size={{14}} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={{5}} className="py-12 text-center text-xs text-gray-600 font-bold uppercase tracking-widest">
                        No operational nodes detected.
                      </td>
                    </tr>
                  )}}
                </tbody>
              </table>
            </div>
          </section>
        )}}

        {{activePage === 'vault' && (
          <section className="py-24 px-8 text-center animate-in zoom-in duration-500">
            <div className="max-w-2xl mx-auto p-16 bg-white/[0.01] border-2 border-dashed border-white/5 rounded-[3rem] space-y-8 hover:border-indigo-500/20 transition-all glass-panel">
              <Lock size={{48}} className="mx-auto text-indigo-500/40 animate-pulse" />
              <h2 className="text-3xl font-black uppercase tracking-widest poppins italic text-white">Neural_Vault</h2>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider leading-relaxed">
                Secure local storage database links active. All records in this workspace are isolated in this browser environment.
              </p>
              <div className="flex justify-center gap-4 pt-4">
                <button onClick={{() => alert("Vault connection secured: 128-bit local keys verified.")}} className="px-8 py-4 bg-white text-black text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-600 hover:text-white transition-all">
                  Sync Cryptographic Keys
                </button>
                <button onClick={{initializeDefaultRecords}} className="px-8 py-4 bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-red-500 hover:text-white transition-all">
                  Reset Node Database
                </button>
              </div>
            </div>
          </section>
        )}}

      </main>

      {{\/* CRUD native dialog element with Backdrop animation & starting style *\/}}
      <dialog 
        ref={{dialogRef}}
        className="w-full max-w-lg bg-[#090d16] border border-white/10 rounded-2xl p-8 text-white relative shadow-2xl glass-panel">
        
        <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-6">
          <h3 className="text-lg font-black uppercase italic tracking-tighter">
            {{isEditMode ? 'Modify Operational Node' : 'Register New Node'}}
          </h3>
          <button 
            onClick={{() => dialogRef.current?.close()}} 
            className="p-1 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-all">
            <X size={{16}} />
          </button>
        </div>

        <form onSubmit={{handleSaveRecord}} className="space-y-6">
          {{formError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-lg">
              {{formError}}
            </div>
          )}}
          
          <div className="space-y-1">
            <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Node Name</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Ingestion Hub"
              value={{currentRecord.title}}
              onChange={{(e) => setCurrentRecord({{ ...currentRecord, title: e.target.value }})}}
              className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-xs font-medium focus:outline-none focus:border-indigo-500 input-glass input-field"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Category</label>
              <select
                value={{currentRecord.category}}
                onChange={{(e) => setCurrentRecord({{ ...currentRecord, category: e.target.value }})}}
                className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-xs font-medium focus:outline-none focus:border-indigo-500 input-glass">
                <option value="General">General</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Vault">Vault</option>
                <option value="Intelligence">Intelligence</option>
                <option value="Network">Network</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Operational Status</label>
              <select
                value={{currentRecord.status}}
                onChange={{(e) => setCurrentRecord({{ ...currentRecord, status: e.target.value }})}}
                className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-xs font-medium focus:outline-none focus:border-indigo-500 input-glass">
                <option value="Active">Active</option>
                <option value="Standby">Standby</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Node Purpose / Description</label>
            {{\/* Auto-resizing textarea via field-sizing: content *\/}}
            <textarea 
              placeholder="Provide a detailed telemetry purpose description..."
              value={{currentRecord.description}}
              onChange={{(e) => setCurrentRecord({{ ...currentRecord, description: e.target.value }})}}
              className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-xs font-medium focus:outline-none focus:border-indigo-500 input-glass auto-textarea"
            />
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-white/5">
            <button 
              type="button" 
              onClick={{() => dialogRef.current?.close()}} 
              className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-6 py-3 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all btn-primary">
              {{isEditMode ? 'Update Node' : 'Launch Node'}}
            </button>
          </div>
        </form>
      </dialog>

      <footer className="py-12 border-t border-white/5 text-center">
        <p className="text-[9px] font-black uppercase tracking-[0.5em] text-gray-700 italic">
          Google Antigravity Engine V6.0 — Industrial Certified Node
        </p>
      </footer>
    </div>
  );
}}
"""

        # [C] NEXT.JS SUPREME SCAFFOLD
        next_ui = f"""'use client';
import React, {{ useState, useEffect, useRef }} from 'react';
import {{ Zap, Shield, Cpu, Globe, ArrowRight, Activity, Database, Lock, Menu, X, Sparkles, Layout, Box, Layers, Trash2, Edit, Plus, Search, Filter, Settings, User, LogOut, Bell, Check, Info }} from 'lucide-react';

export default function Home() {{
  const [activePage, setActivePage] = useState('home');
  const [isLoaded, setIsLoaded] = useState(false);
  const [records, setRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Form State
  const [currentRecord, setCurrentRecord] = useState({{ id: '', title: '', category: 'General', status: 'Active', description: '' }});
  const [isEditMode, setIsEditMode] = useState(false);
  const [formError, setFormError] = useState('');
  
  const dialogRef = useRef(null);

  useEffect(() => {{
    setIsLoaded(true);
    // Load initial CRUD records from localStorage
    const saved = localStorage.getItem('antigravity_records_{project_slug}');
    if (saved) {{
      try {{
        setRecords(JSON.parse(saved));
      }} catch (e) {{
        initializeDefaultRecords();
      }}
    }} else {{
      initializeDefaultRecords();
    }}
  }}, []);

  const initializeDefaultRecords = () => {{
    const defaults = [
      {{ id: '1', title: 'Data Node Alpha', category: 'Infrastructure', status: 'Active', description: 'Core data ingestion hub for telemetry.' }},
      {{ id: '2', title: 'Security Shield', category: 'Vault', status: 'Active', description: 'AES-X encryption key management pipeline.' }},
      {{ id: '3', title: 'ML Parser Core', category: 'Intelligence', status: 'Standby', description: 'Natural language semantic parsing module.' }},
      {{ id: '4', title: 'Web Gateway', category: 'Network', status: 'Active', description: 'High-performance API edge gateway router.' }}
    ];
    setRecords(defaults);
    localStorage.setItem('antigravity_records_{project_slug}', JSON.stringify(defaults));
  }};

  const saveRecordsToStorage = (updated) => {{
    setRecords(updated);
    localStorage.setItem('antigravity_records_{project_slug}', JSON.stringify(updated));
  }};

  // CRUD Actions
  const handleOpenAddModal = () => {{
    setCurrentRecord({{ id: '', title: '', category: 'General', status: 'Active', description: '' }});
    setIsEditMode(false);
    setFormError('');
    dialogRef.current?.showModal();
  }};

  const handleOpenEditModal = (rec) => {{
    setCurrentRecord(rec);
    setIsEditMode(true);
    setFormError('');
    dialogRef.current?.showModal();
  }};

  const handleDeleteRecord = (id) => {{
    const updated = records.filter(r => r.id !== id);
    saveRecordsToStorage(updated);
  }};

  const handleSaveRecord = (e) => {{
    e.preventDefault();
    if (!currentRecord.title.trim()) {{
      setFormError('Title is required.');
      return;
    }}
    
    let updated;
    if (isEditMode) {{
      updated = records.map(r => r.id === currentRecord.id ? currentRecord : r);
    }} else {{
      const newRec = {{
        ...currentRecord,
        id: Date.now().toString()
      }};
      updated = [...records, newRec];
    }}
    saveRecordsToStorage(updated);
    dialogRef.current?.close();
  }};

  // Filtering
  const filteredRecords = records.filter(r => {{
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = statusFilter === 'all' || r.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  }});

  return (
    <div className="min-h-screen bg-[#030712] text-[#f8fafc] font-sans selection:bg-indigo-500/30 overflow-x-hidden relative">
      {{\/* Decorative Glow Elements *\/}}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      {{\/* Navigation Layer *\/}}
      <nav className="fixed top-0 w-full z-[100] backdrop-blur-2xl bg-black/40 border-b border-white/5 px-8 py-4 flex justify-between items-center glass-nav">
        <div className="flex items-center gap-4 group cursor-pointer" onClick={{() => setActivePage('home')}}>
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:rotate-12 transition-all">
            <Zap size={{20}} className="fill-white text-white" />
          </div>
          <h1 className="text-xl font-black uppercase italic tracking-tighter bg-gradient-to-r from-white via-gray-300 to-gray-600 bg-clip-text text-transparent poppins">
            {project_name}
          </h1>
        </div>
        
        {{\/* Navigation Tabs *\/}}
        <div className="hidden lg:flex items-center gap-10">
          {{['Home', 'Dashboard', 'Vault'].map((item) => (
            <button 
              key={{item}} 
              onClick={{() => setActivePage(item.toLowerCase())}}
              className={{`text-[10px] font-black uppercase tracking-[0.2em] transition-all ${{activePage === item.toLowerCase() ? 'text-indigo-400 glow-text' : 'text-gray-500 hover:text-white'}}`}}>
              {{item}}
            </button>
          ))}}
          
          {{\/* Native Popover User Dropdown *\/}}
          <div className="relative">
            <button 
              {{...{{ popovertarget: "next-user-profile-menu" }}}}
              className="w-10 h-10 rounded-full border border-indigo-500/30 flex items-center justify-center bg-indigo-500/5 hover:bg-indigo-500/20 transition-all">
              <User size={{18}} className="text-indigo-400" />
            </button>
            
            <div 
              id="next-user-profile-menu" 
              {{...{{ popover: "auto" }}}} 
              className="p-6 w-64 text-left border border-white/10 rounded-xl bg-[#090d16]/95 backdrop-blur-2xl text-white">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">U</div>
                <div>
                  <h4 className="text-sm font-bold">Admin Agent</h4>
                  <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider font-bold">Superuser Node</span>
                </div>
              </div>
              <ul className="space-y-2">
                <li>
                  <button onClick={{() => {{ setActivePage('vault'); document.getElementById('next-user-profile-menu')?.hidePopover(); }}}} className="w-full text-left py-2 px-3 hover:bg-white/5 rounded-lg text-xs font-semibold flex items-center gap-2">
                    <Lock size={{14}} className="text-gray-400" /> Secure Vault
                  </button>
                </li>
                <li>
                  <button onClick={{() => {{ setActivePage('dashboard'); document.getElementById('next-user-profile-menu')?.hidePopover(); }}}} className="w-full text-left py-2 px-3 hover:bg-white/5 rounded-lg text-xs font-semibold flex items-center gap-2">
                    <Activity size={{14}} className="text-gray-400" /> Operational Stats
                  </button>
                </li>
                <li className="border-t border-white/5 pt-2 mt-2">
                  <button className="w-full text-left py-2 px-3 hover:bg-red-500/10 text-red-400 rounded-lg text-xs font-semibold flex items-center gap-2">
                    <LogOut size={{14}} /> LogOut Node
                  </button>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </nav>

      {{\/* Main Content Area *\/}}
      <main className={{`pt-24 min-h-[calc(100vh-180px)] transition-all duration-1000 ${{isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}}`}}>
        
        {{activePage === 'home' && (
          <section className="pt-20 pb-20 px-8 max-w-7xl mx-auto">
            <div className="space-y-8 max-w-4xl">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-500/5 border border-indigo-500/20 rounded-full">
                <Sparkles size={{14}} className="text-indigo-400" />
                <span className="text-[9px] font-black text-indigo-300 uppercase tracking-widest">Industrial Protocol V6.0 Active</span>
              </div>
              <h2 className="text-6xl lg:text-[100px] font-black leading-[0.9] tracking-tighter italic uppercase">
                Divine <br /> <span className="text-indigo-500">Antigravity</span> <br /> Dashboard.
              </h2>
              <p className="text-xl text-gray-400 leading-relaxed max-w-2xl font-medium italic">
                {vision}
              </p>
              <div className="flex gap-6 pt-4">
                <button onClick={{() => setActivePage('dashboard')}} className="px-10 py-5 bg-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-500/30 hover:bg-indigo-700 transition-all hover:scale-[1.02]">
                  Explore Node Dashboard
                </button>
                <button onClick={{() => setActivePage('vault')}} className="px-10 py-5 bg-white/5 border border-white/10 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all hover:scale-[1.02]">
                  Vault Access
                </button>
              </div>
            </div>
            
            <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[2.5rem] hover:border-indigo-500/30 transition-all glass-panel">
                <div className="mb-6"><Activity className="text-indigo-400" size={{32}} /></div>
                <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">System_Uptime</h4>
                <p className="text-4xl font-black tracking-tighter italic">99.998%</p>
              </div>
              <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[2.5rem] hover:border-indigo-500/30 transition-all glass-panel">
                <div className="mb-6"><Database className="text-emerald-400" size={{32}} /></div>
                <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">DB_Nexus_Ping</h4>
                <p className="text-4xl font-black tracking-tighter italic">1.24ms</p>
              </div>
              <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[2.5rem] hover:border-indigo-500/30 transition-all glass-panel">
                <div className="mb-6"><Shield className="text-purple-400" size={{32}} /></div>
                <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">Security_Protocol</h4>
                <p className="text-4xl font-black tracking-tighter italic">AES-256</p>
              </div>
            </div>
          </section>
        )}}

        {{activePage === 'dashboard' && (
          <section className="py-12 px-8 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-8">
              <div>
                <h2 className="text-4xl font-black uppercase italic tracking-tighter poppins">Telemetry_Dashboard</h2>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">Manage system nodes and live data repositories</p>
              </div>
              <button 
                onClick={{handleOpenAddModal}}
                className="px-6 py-4 bg-indigo-600 text-white text-[10px] font-[1000] uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/10">
                <Plus size={{14}} /> Add New Node
              </button>
            </div>

            {{\/* Filter and Search Bar *\/}}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={{16}} />
                <input 
                  type="text" 
                  placeholder="Search telemetry records..." 
                  value={{searchQuery}}
                  onChange={{(e) => setSearchQuery(e.target.value)}}
                  className="w-full bg-white/[0.02] border border-white/5 rounded-xl py-3 pl-12 pr-4 text-xs font-medium input-glass"
                />
              </div>
              <div className="flex gap-2">
                {{['all', 'active', 'standby'].map(f => (
                  <button
                    key={{f}}
                    onClick={{() => setStatusFilter(f)}}
                    className={{`flex-1 py-3 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${{statusFilter === f ? 'bg-white text-black border-white' : 'bg-white/[0.02] text-gray-400 border-white/5 hover:border-white/20'}}`}}>
                    {{f}}
                  </button>
                ))}}
              </div>
            </div>

            {{\/* Records Data Table *\/}}
            <div className="glass-panel overflow-hidden border border-white/5 rounded-2xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.01]">
                    <th className="py-4 px-6 text-[10px] font-black uppercase tracking-wider text-gray-500">Node Name</th>
                    <th className="py-4 px-6 text-[10px] font-black uppercase tracking-wider text-gray-500">Category</th>
                    <th className="py-4 px-6 text-[10px] font-black uppercase tracking-wider text-gray-500">Status</th>
                    <th className="py-4 px-6 text-[10px] font-black uppercase tracking-wider text-gray-500">Description</th>
                    <th className="py-4 px-6 text-[10px] font-black uppercase tracking-wider text-gray-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {{filteredRecords.length > 0 ? (
                    filteredRecords.map(r => (
                      <tr key={{r.id}} className="hover:bg-white/[0.01] transition-colors group">
                        <td className="py-4 px-6 font-bold text-sm text-indigo-400">{{r.title}}</td>
                        <td className="py-4 px-6 text-xs text-gray-400">{{r.category}}</td>
                        <td className="py-4 px-6">
                          <span className={{`inline-block px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-wider ${{r.status.toLowerCase() === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}}`}}>
                            {{r.status}}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-xs text-gray-500 max-w-xs truncate">{{r.description}}</td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex justify-end gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button onClick={{() => handleOpenEditModal(r)}} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-all">
                              <Edit size={{14}} />
                            </button>
                            <button onClick={{() => handleDeleteRecord(r.id)}} className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400 transition-all">
                              <Trash2 size={{14}} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={{5}} className="py-12 text-center text-xs text-gray-600 font-bold uppercase tracking-widest">
                        No operational nodes detected.
                      </td>
                    </tr>
                  )}}
                </tbody>
              </table>
            </div>
          </section>
        )}}

        {{activePage === 'vault' && (
          <section className="py-24 px-8 text-center animate-in zoom-in duration-500">
            <div className="max-w-2xl mx-auto p-16 bg-white/[0.01] border-2 border-dashed border-white/5 rounded-[3rem] space-y-8 hover:border-indigo-500/20 transition-all glass-panel">
              <Lock size={{48}} className="mx-auto text-indigo-500/40 animate-pulse" />
              <h2 className="text-3xl font-black uppercase tracking-widest poppins italic text-white">Neural_Vault</h2>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider leading-relaxed">
                Secure local storage database links active. All records in this workspace are isolated in this browser environment.
              </p>
              <div className="flex justify-center gap-4 pt-4">
                <button onClick={{() => alert("Vault connection secured: 128-bit local keys verified.")}} className="px-8 py-4 bg-white text-black text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-600 hover:text-white transition-all">
                  Sync Cryptographic Keys
                </button>
                <button onClick={{initializeDefaultRecords}} className="px-8 py-4 bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-red-500 hover:text-white transition-all">
                  Reset Node Database
                </button>
              </div>
            </div>
          </section>
        )}}

      </main>

      {{\/* CRUD native dialog element with Backdrop animation & starting style *\/}}
      <dialog 
        ref={{dialogRef}}
        className="w-full max-w-lg bg-[#090d16] border border-white/10 rounded-2xl p-8 text-white relative shadow-2xl glass-panel">
        
        <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-6">
          <h3 className="text-lg font-black uppercase italic tracking-tighter">
            {{isEditMode ? 'Modify Operational Node' : 'Register New Node'}}
          </h3>
          <button 
            onClick={{() => dialogRef.current?.close()}} 
            className="p-1 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-all">
            <X size={{16}} />
          </button>
        </div>

        <form onSubmit={{handleSaveRecord}} className="space-y-6">
          {{formError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-lg">
              {{formError}}
            </div>
          )}}
          
          <div className="space-y-1">
            <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Node Name</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Ingestion Hub"
              value={{currentRecord.title}}
              onChange={{(e) => setCurrentRecord({{ ...currentRecord, title: e.target.value }})}}
              className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-xs font-medium focus:outline-none focus:border-indigo-500 input-glass input-field"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Category</label>
              <select
                value={{currentRecord.category}}
                onChange={{(e) => setCurrentRecord({{ ...currentRecord, category: e.target.value }})}}
                className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-xs font-medium focus:outline-none focus:border-indigo-500 input-glass">
                <option value="General">General</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Vault">Vault</option>
                <option value="Intelligence">Intelligence</option>
                <option value="Network">Network</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Operational Status</label>
              <select
                value={{currentRecord.status}}
                onChange={{(e) => setCurrentRecord({{ ...currentRecord, status: e.target.value }})}}
                className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-xs font-medium focus:outline-none focus:border-indigo-500 input-glass">
                <option value="Active">Active</option>
                <option value="Standby">Standby</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Node Purpose / Description</label>
            {{\/* Auto-resizing textarea via field-sizing: content *\/}}
            <textarea 
              placeholder="Provide a detailed telemetry purpose description..."
              value={{currentRecord.description}}
              onChange={{(e) => setCurrentRecord({{ ...currentRecord, description: e.target.value }})}}
              className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-xs font-medium focus:outline-none focus:border-indigo-500 input-glass auto-textarea"
            />
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-white/5">
            <button 
              type="button" 
              onClick={{() => dialogRef.current?.close()}} 
              className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-6 py-3 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all btn-primary">
              {{isEditMode ? 'Update Node' : 'Launch Node'}}
            </button>
          </div>
        </form>
      </dialog>

      <footer className="py-12 border-t border-white/5 text-center">
        <p className="text-[9px] font-black uppercase tracking-[0.5em] text-gray-700 italic">
          Google Antigravity Engine V6.0 — Industrial Certified Node
        </p>
      </footer>
    </div>
  );
}}
"""

        # [D] VANILLA HTML SUPREME SCAFFOLD
        vanilla_ui = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{project_name} | Antigravity Console</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Poppins:wght@700;900&display=swap" rel="stylesheet">
    <style>
        body {{ font-family: 'Inter', sans-serif; background: #030712; color: #f8fafc; overflow-x: hidden; scroll-behavior: smooth; }}
        .glass-panel {{ background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3); }}
        .glass-nav {{ background: rgba(3, 7, 18, 0.6); backdrop-filter: blur(16px); border-bottom: 1px solid rgba(255,255,255,0.08); }}
        
        /* Custom Scrollbar */
        ::-webkit-scrollbar {{ width: 6px; height: 6px; }}
        ::-webkit-scrollbar-track {{ background: rgba(15, 23, 42, 0.5); }}
        ::-webkit-scrollbar-thumb {{ background: rgba(99, 102, 241, 0.3); border-radius: 9999px; }}
        ::-webkit-scrollbar-thumb:hover {{ background: rgba(99, 102, 241, 0.6); }}

        /* Dialog entry and backdrop discrete animations */
        dialog {{ transition: opacity 0.3s, transform 0.3s, display 0.3s allow-discrete; opacity: 0; transform: translateY(20px) scale(0.95); }}
        dialog[open] {{ opacity: 1; transform: translateY(0) scale(1); }}
        @starting-style {{ dialog[open] {{ opacity: 0; transform: translateY(20px) scale(0.95); }} }}
        
        dialog::backdrop {{ background-color: rgba(0, 0, 0, 0.65); backdrop-filter: blur(8px); transition: opacity 0.3s, display 0.3s allow-discrete; opacity: 0; }}
        dialog[open]::backdrop {{ opacity: 1; }}
        @starting-style {{ dialog[open]::backdrop {{ opacity: 0; }} }}

        /* Native Popover Styling and transitions */
        [popover] {{ margin: 0; border: 1px solid rgba(255, 255, 255, 0.08); background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(16px); border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5); opacity: 0; transform: scale(0.95); transition: opacity 0.2s, transform 0.2s, display 0.2s allow-discrete; }}
        [popover]:popover-open {{ opacity: 1; transform: scale(1); }}
        @starting-style {{ [popover]:popover-open {{ opacity: 0; transform: scale(0.95); }} }}

        /* User Invalid CSS form validation */
        .input-field:user-invalid {{ border-color: #ef4444 !important; box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2) !important; }}

        /* Textarea Auto Resizing */
        .auto-textarea {{ field-sizing: content; min-height: 4lh; max-height: 10lh; }}
    </style>
</head>
<body class="selection:bg-indigo-500/30">
    <nav class="fixed top-0 w-full z-50 glass-nav px-10 py-4 flex justify-between items-center">
        <div class="flex items-center gap-4">
            <div class="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center"><i data-lucide="zap" class="fill-white text-white"></i></div>
            <h1 class="text-2xl font-black italic tracking-tighter uppercase poppins tracking-tighter">{project_name}</h1>
        </div>
        <div class="hidden md:flex gap-12 text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 items-center">
            <a href="#home" class="hover:text-indigo-400">Home</a>
            <a href="#dashboard" class="hover:text-indigo-400">Dashboard</a>
            
            <!-- Popover trigger -->
            <button popovertarget="user-popover" class="w-10 h-10 rounded-full border border-indigo-500/30 flex items-center justify-center bg-indigo-500/5 hover:bg-indigo-500/20 transition-all">
                <i data-lucide="user" class="text-indigo-400 w-4 h-4"></i>
            </button>
            <div popover id="user-popover" class="p-6 w-64 text-left border border-white/10 rounded-xl bg-[#090d16]/95 backdrop-blur-2xl text-white">
                <div class="flex items-center gap-3 border-b border-white/10 pb-4 mb-4">
                    <div class="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">U</div>
                    <div>
                        <h4 class="text-sm font-bold">Admin Agent</h4>
                        <span class="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Superuser Node</span>
                    </div>
                </div>
                <ul class="space-y-2">
                    <li><a href="#dashboard" class="w-full text-left py-2 px-3 hover:bg-white/5 rounded-lg text-xs font-semibold flex items-center gap-2"><i data-lucide="activity" class="text-gray-400 w-4 h-4"></i> Telemetry</a></li>
                    <li><a href="#home" class="w-full text-left py-2 px-3 hover:bg-white/5 rounded-lg text-xs font-semibold flex items-center gap-2"><i data-lucide="lock" class="text-gray-400 w-4 h-4"></i> Secure Lock</a></li>
                </ul>
            </div>
        </div>
    </nav>

    <main class="max-w-7xl mx-auto px-10">
        <section id="home" class="pt-60 pb-20 space-y-12">
            <div class="inline-flex items-center gap-3 px-4 py-2 bg-indigo-500/5 border border-indigo-500/20 rounded-full">
                <i data-lucide="sparkles" class="text-indigo-400 w-4 h-4"></i>
                <span class="text-[9px] font-black text-indigo-300 uppercase tracking-widest">Industrial Protocol V6.0 Active</span>
            </div>
            <h2 class="text-7xl lg:text-[140px] font-black leading-[0.8] tracking-tighter italic uppercase poppins">
                Supreme <br> <span class="text-indigo-500">Neural</span> <br> Build.
            </h2>
            <p class="text-2xl text-gray-500 italic max-w-2xl leading-relaxed">{vision}</p>
            <div class="flex gap-8 pt-10">
                <button onclick="openAddModal()" class="px-12 py-6 bg-white text-black font-black uppercase tracking-widest rounded-3xl hover:bg-indigo-600 hover:text-white transition-all hover:scale-[1.02]">Start_Node_Mission</button>
                <a href="#dashboard" class="px-12 py-6 glass-panel font-black uppercase tracking-widest rounded-3xl flex items-center justify-center border border-white/10 hover:bg-white/10 transition-all hover:scale-[1.02]">Dossier_V6</a>
            </div>
        </section>

        <section id="dashboard" class="py-40 border-t border-white/5 space-y-12">
            <div class="flex justify-between items-center border-b border-white/5 pb-8">
                <div>
                    <h2 class="text-5xl font-black uppercase italic tracking-tighter poppins">Telemetry Nodes</h2>
                    <p class="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">Manage system nodes and live data repositories</p>
                </div>
                <button onclick="openAddModal()" class="px-6 py-4 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/10">
                    <i data-lucide="plus" class="w-4 h-4"></i> Register Node
                </button>
            </div>

            <div class="glass-panel overflow-hidden border border-white/5 rounded-2xl">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="border-b border-white/5 bg-white/[0.01]">
                            <th class="py-4 px-6 text-[10px] font-black uppercase tracking-wider text-gray-500">Node Name</th>
                            <th class="py-4 px-6 text-[10px] font-black uppercase tracking-wider text-gray-500">Category</th>
                            <th class="py-4 px-6 text-[10px] font-black uppercase tracking-wider text-gray-500">Status</th>
                            <th class="py-4 px-6 text-[10px] font-black uppercase tracking-wider text-gray-500">Description</th>
                            <th class="py-4 px-6 text-[10px] font-black uppercase tracking-wider text-gray-500 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="records-tbody" class="divide-y divide-white/5">
                        <!-- CRUD nodes rendered dynamically -->
                    </tbody>
                </table>
            </div>
        </section>
    </main>

    <!-- Dialog for Node CRUD -->
    <dialog id="node-dialog" class="w-full max-w-lg bg-[#090d16] border border-white/10 rounded-2xl p-8 text-white relative shadow-2xl glass-panel">
        <div class="flex justify-between items-center border-b border-white/10 pb-4 mb-6">
            <h3 class="text-lg font-black uppercase italic tracking-tighter poppins">Register New Node</h3>
            <button onclick="document.getElementById('node-dialog').close()" class="p-1 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-all">
                <i data-lucide="x" class="w-4 h-4"></i>
            </button>
        </div>

        <form id="node-form" class="space-y-6">
            <div class="space-y-1">
                <label class="text-[9px] font-black text-gray-600 uppercase tracking-widest">Node Name</label>
                <input type="text" id="node-title" required placeholder="e.g. Ingestion Hub" class="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-xs font-medium focus:outline-none focus:border-indigo-500 input-glass input-field" />
            </div>

            <div class="grid grid-cols-2 gap-6">
                <div class="space-y-1">
                    <label class="text-[9px] font-black text-gray-600 uppercase tracking-widest">Category</label>
                    <select id="node-category" class="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-xs font-medium focus:outline-none focus:border-indigo-500 input-glass">
                        <option value="General">General</option>
                        <option value="Infrastructure">Infrastructure</option>
                        <option value="Vault">Vault</option>
                        <option value="Intelligence">Intelligence</option>
                        <option value="Network">Network</option>
                    </select>
                </div>
                <div class="space-y-1">
                    <label class="text-[9px] font-black text-gray-600 uppercase tracking-widest">Operational Status</label>
                    <select id="node-status" class="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-xs font-medium focus:outline-none focus:border-indigo-500 input-glass">
                        <option value="Active">Active</option>
                        <option value="Standby">Standby</option>
                    </select>
                </div>
            </div>

            <div class="space-y-1">
                <label class="text-[9px] font-black text-gray-600 uppercase tracking-widest">Node Purpose / Description</label>
                <textarea id="node-description" placeholder="Provide a detailed telemetry purpose description..." class="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-xs font-medium focus:outline-none focus:border-indigo-500 input-glass auto-textarea"></textarea>
            </div>

            <div class="flex justify-end gap-4 pt-4 border-t border-white/5">
                <button type="button" onclick="document.getElementById('node-dialog').close()" class="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Cancel</button>
                <button type="submit" class="px-6 py-3 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all">Launch Node</button>
            </div>
        </form>
    </dialog>

    <footer class="py-20 border-t border-white/5 text-center text-[10px] font-black uppercase tracking-[0.8em] text-gray-800 italic">
        Project Synthesized by Titan Node v6.0 (Antigravity)
    </footer>

    <script>
        // Init LocalStorage CRUD
        let records = [];
        const storageKey = 'antigravity_records_vanilla_{project_slug}';
        
        function initRecords() {{
            const saved = localStorage.getItem(storageKey);
            if (saved) {{
                try {{ records = JSON.parse(saved); }} catch(e) {{ loadDefaults(); }}
            }} else {{
                loadDefaults();
            }}
            renderRecords();
        }}

        function loadDefaults() {{
            records = [
                {{ id: '1', title: 'Data Node Alpha', category: 'Infrastructure', status: 'Active', description: 'Core data ingestion hub for telemetry.' }},
                {{ id: '2', title: 'Security Shield', category: 'Vault', status: 'Active', description: 'AES-X encryption key management pipeline.' }},
                {{ id: '3', title: 'ML Parser Core', category: 'Intelligence', status: 'Standby', description: 'Natural language semantic parsing module.' }}
            ];
            saveRecords();
        }}

        function saveRecords() {{
            localStorage.setItem(storageKey, JSON.stringify(records));
        }}

        function renderRecords() {{
            const tbody = document.getElementById('records-tbody');
            if (!tbody) return;
            tbody.innerHTML = '';
            
            records.forEach(r => {{
                const tr = document.createElement('tr');
                tr.className = 'hover:bg-white/[0.01] transition-colors border-b border-white/5';
                tr.innerHTML = `
                    <td class="py-4 px-6 font-bold text-sm text-indigo-400">\${{r.title}}</td>
                    <td class="py-4 px-6 text-xs text-gray-400">\${{r.category}}</td>
                    <td class="py-4 px-6">
                        <span class="inline-block px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-wider \${{r.status.toLowerCase() === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}}">
                            \${{r.status}}
                        </span>
                    </td>
                    <td class="py-4 px-6 text-xs text-gray-500 max-w-xs truncate">\${{r.description}}</td>
                    <td class="py-4 px-6 text-right">
                        <button onclick="deleteRecord('\${{r.id}}')" class="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400 transition-all">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            }});
            lucide.createIcons();
        }}

        function deleteRecord(id) {{
            records = records.filter(r => r.id !== id);
            saveRecords();
            renderRecords();
        }}

        function openAddModal() {{
            document.getElementById('node-title').value = '';
            document.getElementById('node-description').value = '';
            document.getElementById('node-dialog').showModal();
        }}

        function saveNode(e) {{
            e.preventDefault();
            const title = document.getElementById('node-title').value.trim();
            const category = document.getElementById('node-category').value;
            const status = document.getElementById('node-status').value;
            const description = document.getElementById('node-description').value.trim();
            
            if (!title) return;
            
            records.push({{
                id: Date.now().toString(),
                title,
                category,
                status,
                description
            }});
            
            saveRecords();
            renderRecords();
            document.getElementById('node-dialog').close();
        }}

        window.onload = function() {{
            initRecords();
            document.getElementById('node-form').addEventListener('submit', saveNode);
        }}
    </script>
</body>
</html>"""

        # Custom index.css stylesheet content
        index_css_content = """@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg: #030712;
  --bg-gradient-1: #0f172a;
  --bg-gradient-2: #1e1b4b;
  --accent: #6366f1;
  --accent-glow: rgba(99, 102, 241, 0.4);
  --glass: rgba(255, 255, 255, 0.03);
  --glass-border: rgba(255, 255, 255, 0.08);
}
body {
  background-color: var(--bg);
  background-image:
    radial-gradient(ellipse at top right, var(--bg-gradient-2) 0%, transparent 60%),
    radial-gradient(ellipse at bottom left, var(--bg-gradient-1) 0%, transparent 60%);
  background-attachment: fixed;
  color: #f8fafc;
}
.glass-panel {
  background: var(--glass);
  backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
}
.glass-nav {
  background: rgba(3, 7, 18, 0.6);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--glass-border);
}
.glow-text { text-shadow: 0 0 20px var(--accent-glow); }

/* Scrollbar */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.3); border-radius: 9999px; }
::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,0.6); }

/* Dialog starting-style entrance animations */
dialog {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
  transition: opacity 0.3s, transform 0.3s, display 0.3s allow-discrete;
}
dialog[open] {
  opacity: 1;
  transform: translateY(0) scale(1);
}
@starting-style {
  dialog[open] {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
}
dialog::backdrop {
  background-color: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(8px);
  transition: opacity 0.3s, display 0.3s allow-discrete;
  opacity: 0;
}
dialog[open]::backdrop {
  opacity: 1;
}
@starting-style {
  dialog[open]::backdrop {
    opacity: 0;
  }
}

/* Popover discrete entry transitions */
[popover] {
  margin: 0;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(16px);
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
  opacity: 0;
  transform: scale(0.95);
  transition: opacity 0.2s, transform 0.2s, display 0.2s allow-discrete;
}
[popover]:popover-open {
  opacity: 1;
  transform: scale(1);
}
@starting-style {
  [popover]:popover-open {
    opacity: 0;
    transform: scale(0.95);
  }
}

/* User invalid feedback input rules */
.input-field:user-invalid {
  border-color: #ef4444 !important;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2) !important;
}

/* Textarea auto-sizing */
.auto-textarea {
  field-sizing: content;
  min-height: 4lh;
  max-height: 10lh;
}
"""

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
            _write_zip_file(zf, f"{fe}/src/index.css", index_css_content)
            _write_zip_file(zf, f"{fe}/index.html", f"<!DOCTYPE html><html><head><script src='https://cdn.tailwindcss.com'></script></head><body><div id='root'></div><script type='module' src='/src/main.jsx'></script></body></html>")
            
        elif "next" in stack:
            fe = f"{project_slug}/frontend"
            _write_zip_file(zf, f"{fe}/package.json", '{"dependencies":{"next":"latest","react":"latest","react-dom":"latest","lucide-react":"latest"}}')
            _write_zip_file(zf, f"{fe}/app/page.tsx", next_ui)
            # Layout includes custom styled css inline block for Next.js build
            _write_zip_file(zf, f"{fe}/app/layout.tsx", f"export default function Layout({{ children }}) {{ return (<html><head><script src='https://cdn.tailwindcss.com'></script><style>{{index_css_content}}</style></head><body>{{children}}</body></html>); }}")

        else:
            # FALLBACK TO SUPREME VANILLA
            _write_zip_file(zf, f"{project_slug}/index.html", vanilla_ui)
            _write_zip_file(zf, f"{project_slug}/styles.css", "/* High-Fidelity Styling Injected via Tailwind CDN and inline head styles */")
            _write_zip_file(zf, f"{project_slug}/script.js", "// Neural Logic Active")

    return filepath
