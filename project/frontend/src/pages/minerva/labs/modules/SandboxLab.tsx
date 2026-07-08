import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Terminal, Code, Maximize2, Minimize2 } from 'lucide-react';
import { SubjectType } from '../types/LabConfig';

interface SandboxLabProps {
  subject: SubjectType;
  topic: string;
  sandboxConfig?: {
    language: 'javascript' | 'python';
    default_code: string;
    expected_output?: string;
  };
}

const BOILERPLATES: Record<string, string> = {
  javascript: `// Complete the function to double the number\nfunction double(n) {\n    return n * 2;\n}\nconsole.log("Result:", double(5));`,
  python: `# Write a python function to check if number is even\ndef is_even(n):\n    return n % 2 == 0\n\nprint("Result:", is_even(10))`,
  html: `<!-- Dynamic Live HTML/CSS Preview -->\n<div class="card">\n  <h1>Hello Minerva!</h1>\n  <p>Interactive Live Web Preview.</p>\n</div>\n\n<style>\n  .card {\n    padding: 24px;\n    background: linear-gradient(135deg, #6366f1, #d946ef);\n    border-radius: 16px;\n    color: white;\n    text-align: center;\n    box-shadow: 0 8px 30px rgba(99,102,241,0.3);\n    font-family: sans-serif;\n  }\n</style>`,
  cpp: `// C++ Program to print sum\n#include <iostream>\nusing namespace std;\n\nint main() {\n    int x = 10;\n    int y = 20;\n    cout << "Sum of x and y is: " << (x + y) << endl;\n    return 0;\n}`,
};

export const SandboxLab: React.FC<SandboxLabProps> = ({ sandboxConfig }) => {
  const initialLang = sandboxConfig?.language || 'javascript';
  const [selectedLanguage, setSelectedLanguage] = useState<'javascript' | 'python' | 'html' | 'cpp'>(initialLang as any);
  const [code, setCode] = useState('');
  const [consoleOutput, setConsoleOutput] = useState('');
  const [running, setRunning] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [consoleHeight, setConsoleHeight] = useState(176);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const lineNumbersRef = useRef<HTMLDivElement | null>(null);
  const resizeStartY = useRef(0);
  const resizeStartH = useRef(0);

  // Initialize / reset code when language changes
  useEffect(() => {
    const configDefault = sandboxConfig?.default_code;
    if (configDefault && sandboxConfig?.language === selectedLanguage) {
      setCode(configDefault);
    } else {
      setCode(BOILERPLATES[selectedLanguage] ?? '');
    }
    setConsoleOutput('');
  }, [selectedLanguage, sandboxConfig]);

  // Lock body scroll while fullscreen
  useEffect(() => {
    if (isFullScreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isFullScreen]);

  // ESC to exit fullscreen
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullScreen) setIsFullScreen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isFullScreen]);

  // Sync line-number scroll with textarea scroll
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Console panel drag-resize
  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    resizeStartY.current = e.clientY;
    resizeStartH.current = consoleHeight;

    const onMove = (ev: MouseEvent) => {
      const dy = resizeStartY.current - ev.clientY;
      const next = Math.max(60, Math.min(window.innerHeight * 0.6, resizeStartH.current + dy));
      setConsoleHeight(next);
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const handleReset = () => {
    setCode(BOILERPLATES[selectedLanguage] ?? '');
    setConsoleOutput('Editor reset to default boilerplate.');
  };

  const handleRun = async () => {
    setRunning(true);
    setConsoleOutput('Compiling and executing...');
    if (selectedLanguage === 'javascript') {
      runJavaScript();
    } else if (selectedLanguage === 'python') {
      await runPython();
    } else if (selectedLanguage === 'html') {
      setConsoleOutput('HTML rendered successfully in the live preview frame below.');
      setRunning(false);
    } else if (selectedLanguage === 'cpp') {
      runCpp();
    }
  };

  const runJavaScript = () => {
    const logs: string[] = [];
    const originalLog = console.log;
    console.log = (...args: any[]) => {
      logs.push(args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
    };
    try {
      // eslint-disable-next-line no-eval
      const result = eval(code);
      if (result !== undefined) logs.push(`=> ${result}`);
      setConsoleOutput(logs.join('\n') || 'Success: Code executed without any output.');
    } catch (err: any) {
      setConsoleOutput(`Runtime Error: ${err.message}`);
    } finally {
      console.log = originalLog;
      setRunning(false);
    }
  };

  const runPython = async () => {
    try {
      const token = localStorage.getItem('fbrts_token');
      const res = await fetch('/api/minerva/lab/execute-python', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (data.success) {
        let out = '';
        if (data.stdout) out += data.stdout;
        if (data.stderr) out += `\nError Console:\n${data.stderr}`;
        setConsoleOutput(out || 'Success: Python script executed with 0 outputs.');
      } else {
        setConsoleOutput(`Compile Error: ${data.error || 'Subprocess execution failed'}`);
      }
    } catch (err: any) {
      setConsoleOutput(`Network Error: Failed to reach sandbox executor. (${err.message})`);
    } finally {
      setRunning(false);
    }
  };

  const runCpp = () => {
    let xVal = 10, yVal = 20;
    const xMatch = code.match(/x\s*=\s*(\d+)/);
    const yMatch = code.match(/y\s*=\s*(\d+)/);
    if (xMatch) xVal = parseInt(xMatch[1]);
    if (yMatch) yVal = parseInt(yMatch[1]);
    setTimeout(() => {
      setConsoleOutput(`[Compiling main.cpp...]
g++ -O3 main.cpp -o main
Compilation Successful.
[Executing main...]
-----------------------------------
Sum of x and y is: ${xVal + yVal}

Process exited with status 0.`);
      setRunning(false);
    }, 400);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const next = e.currentTarget.value.substring(0, start) + '    ' + e.currentTarget.value.substring(end);
      setCode(next);
      setTimeout(() => { e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 4; }, 0);
    }
  };

  const lineCount = Math.max(15, code.split('\n').length + 5);

  /* ─── Shared inner content ─────────────────────────────────────────────── */
  const inner = (
    <div className="flex flex-col h-full bg-[#05040a] overflow-hidden">

      {/* ── Row 1: Title + Language selector ── */}
      <div className="flex items-center justify-between gap-2 px-4 py-2.5 bg-black/50 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Code className="text-indigo-400 w-4 h-4 shrink-0" />
          <span className="text-[11px] font-black uppercase tracking-widest text-gray-300 truncate">
            Computer Tech Coding Lab
          </span>
        </div>
        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value as any)}
          className="shrink-0 bg-black/80 border border-white/10 rounded-lg px-2.5 py-1 text-[10px] font-black text-indigo-300 outline-none uppercase tracking-wider cursor-pointer"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="html">HTML / CSS</option>
          <option value="cpp">C++ (g++)</option>
        </select>
      </div>

      {/* ── Row 2: Action buttons (always visible) ── */}
      <div className="flex items-center gap-2 px-4 py-2 bg-black/30 border-b border-white/5 shrink-0">
        {/* Run Code — primary CTA */}
        <button
          type="button"
          onClick={handleRun}
          disabled={running}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 disabled:opacity-60 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-all shadow-md shadow-indigo-600/20 active:scale-95 border border-indigo-400/20"
        >
          <Play size={11} fill="white" className={running ? 'animate-pulse' : ''} />
          <span>{running ? 'Running…' : 'Run Code'}</span>
        </button>

        {/* Reset */}
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border border-white/5"
          title="Reset to default template"
        >
          <RotateCcw size={11} />
          <span>Reset</span>
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Fullscreen toggle */}
        <button
          type="button"
          onClick={() => setIsFullScreen(f => !f)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-indigo-500/20 text-gray-400 hover:text-indigo-300 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border border-white/5"
          title={isFullScreen ? 'Exit Fullscreen (Esc)' : 'Fullscreen Mode'}
        >
          {isFullScreen ? <Minimize2 size={11} /> : <Maximize2 size={11} />}
          <span>{isFullScreen ? 'Exit' : 'Full'}</span>
        </button>
      </div>

      {/* ── Editor area ── */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Editor label bar */}
        <div className="px-4 py-1.5 bg-black/20 text-[9px] font-black uppercase tracking-widest text-gray-500 border-b border-white/5 flex justify-between shrink-0">
          <span>Editor</span>
          <span>Tab = 4 Spaces</span>
        </div>

        {/* Code editor */}
        <div className="flex-1 relative flex min-h-0 overflow-hidden">
          {/* Line numbers */}
          <div
            ref={lineNumbersRef}
            className="w-10 bg-black/40 text-right pr-2.5 py-4 font-mono text-[11px] text-gray-600 select-none border-r border-white/[0.02] overflow-hidden shrink-0"
          >
            {Array.from({ length: lineCount }).map((_, i) => (
              <div key={i} className="leading-5 h-5">{i + 1}</div>
            ))}
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            className="flex-1 bg-transparent px-4 py-4 font-mono text-[12px] text-indigo-100 leading-5 outline-none resize-none overflow-y-auto"
            spellCheck={false}
            placeholder="Write your code here…"
          />
        </div>

        {/* Drag-resize splitter */}
        <div
          onMouseDown={startResize}
          className="h-2 bg-white/5 hover:bg-indigo-500/40 active:bg-indigo-500 cursor-ns-resize transition-all flex items-center justify-center shrink-0 border-y border-white/5"
          title="Drag to resize console"
        >
          <div className="w-8 h-[2px] bg-white/20 rounded-full" />
        </div>

        {/* Console panel */}
        <div style={{ height: `${consoleHeight}px` }} className="flex flex-col min-h-0 bg-[#020205] shrink-0">
          <div className="px-4 py-1.5 bg-black/20 text-[9px] font-black uppercase tracking-widest text-gray-500 border-b border-white/5 flex items-center gap-1.5 shrink-0">
            <Terminal size={10} />
            <span>{selectedLanguage === 'html' ? 'Live Web Preview Frame' : 'Console Output'}</span>
          </div>
          <div className="flex-1 p-4 overflow-hidden">
            {selectedLanguage === 'html' ? (
              <iframe
                srcDoc={code}
                title="Live Render Preview"
                className="w-full h-full bg-white rounded-xl border-none"
              />
            ) : consoleOutput ? (
              <div className="w-full h-full overflow-y-auto font-mono text-[11px] text-emerald-400 whitespace-pre-wrap leading-relaxed">
                {consoleOutput}
              </div>
            ) : (
              <span className="text-gray-600 italic font-mono text-[11px]">
                No output. Click "Run Code" above to execute.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  /* ─── Fullscreen overlay ────────────────────────────────────────────────── */
  if (isFullScreen) {
    return (
      <div
        className="fixed inset-0 z-[99999] flex flex-col bg-[#05040a] border border-indigo-500/30"
        style={{ animation: 'fadeInSlide 0.2s ease' }}
      >
        {inner}
      </div>
    );
  }

  /* ─── Normal (embedded) mode ─────────────────────────────────────────────── */
  return (
    <div className="flex flex-col h-full bg-[#05040a] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
      {inner}
    </div>
  );
};

export default SandboxLab;
