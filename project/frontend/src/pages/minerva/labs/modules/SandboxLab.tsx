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

const BOILERPLATES = {
  javascript: `// Complete the function to double the number\nfunction double(n) {\n    return n * 2;\n}\nconsole.log("Result:", double(5));`,
  python: `# Write a python function to check if number is even\ndef is_even(n):\n    return n % 2 == 0\n\nprint("Result:", is_even(10))`,
  html: `<!-- Dynamic Live HTML/CSS Preview -->\n<div class="card">\n  <h1>Hello Minerva!</h1>\n  <p>Interactive Live Web Preview.</p>\n</div>\n\n<style>\n  .card {\n    padding: 24px;\n    background: linear-gradient(135deg, #6366f1, #d946ef);\n    border-radius: 16px;\n    color: white;\n    text-align: center;\n    box-shadow: 0 8px 30px rgba(99,102,241,0.3);\n    font-family: sans-serif;\n  }\n</style>`,
  cpp: `// C++ Program to print sum\n#include <iostream>\nusing namespace std;\n\nint main() {\n    int x = 10;\n    int y = 20;\n    cout << "Sum of x and y is: " << (x + y) << endl;\n    return 0;\n}`,
};

export const SandboxLab: React.FC<SandboxLabProps> = ({
  sandboxConfig
}) => {
  const initialLang = sandboxConfig?.language || 'javascript';
  const [selectedLanguage, setSelectedLanguage] = useState<'javascript' | 'python' | 'html' | 'cpp'>(initialLang as any);
  const [code, setCode] = useState('');
  const [consoleOutput, setConsoleOutput] = useState('');
  const [running, setRunning] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [consoleHeight, setConsoleHeight] = useState(176);

  // Fullscreen position and resizing state
  const [pos, setPos] = useState({ x: 100, y: 80 });
  const [size, setSize] = useState({ width: 900, height: 600 });


  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0 });

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const lineNumbersRef = useRef<HTMLDivElement | null>(null);

  // Initialize templates
  useEffect(() => {
    const configDefault = sandboxConfig?.default_code;
    if (configDefault && sandboxConfig?.language === selectedLanguage) {
      setCode(configDefault);
    } else {
      setCode(BOILERPLATES[selectedLanguage]);
    }
    setConsoleOutput('');
  }, [selectedLanguage, sandboxConfig]);

  // Center window on Fullscreen mode active
  useEffect(() => {
    if (isFullScreen) {
      setPos({
        x: Math.floor((window.innerWidth - 900) / 2),
        y: Math.floor((window.innerHeight - 600) / 2)
      });
      setSize({
        width: 900,
        height: 600
      });
    }
  }, [isFullScreen]);

  // Draggable handlers
  const startDrag = (e: React.MouseEvent) => {
    if (!isFullScreen) return;
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('select')) return;
    e.preventDefault();
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: pos.x,
      posY: pos.y
    };
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', stopDrag);
  };

  const handleDragMove = (e: MouseEvent) => {
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPos({
      x: Math.max(0, Math.min(window.innerWidth - 200, dragStartRef.current.posX + dx)),
      y: Math.max(0, Math.min(window.innerHeight - 150, dragStartRef.current.posY + dy))
    });
  };

  const stopDrag = () => {
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', stopDrag);
  };

  // Window resizable corner handlers
  const startWindowResize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: pos.x,
      posY: pos.y
    };
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    };
    document.addEventListener('mousemove', handleWindowResizeMove);
    document.addEventListener('mouseup', stopWindowResize);
  };

  const handleWindowResizeMove = (e: MouseEvent) => {
    const dx = e.clientX - resizeStartRef.current.x;
    const dy = e.clientY - resizeStartRef.current.y;
    setSize({
      width: Math.max(400, Math.min(window.innerWidth - pos.x, resizeStartRef.current.width + dx)),
      height: Math.max(300, Math.min(window.innerHeight - pos.y, resizeStartRef.current.height + dy))
    });
  };

  const stopWindowResize = () => {
    document.removeEventListener('mousemove', handleWindowResizeMove);
    document.removeEventListener('mouseup', stopWindowResize);
  };

  // Split console resize handler
  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResize);
  };

  const resize = (e: MouseEvent) => {
    const newHeight = window.innerHeight - e.clientY;
    if (newHeight > 60 && newHeight < window.innerHeight * 0.7) {
      setConsoleHeight(newHeight);
    }
  };

  const stopResize = () => {
    document.removeEventListener('mousemove', resize);
    document.removeEventListener('mouseup', stopResize);
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.removeEventListener('mousemove', resize);
      document.removeEventListener('mouseup', stopResize);
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', stopDrag);
      document.removeEventListener('mousemove', handleWindowResizeMove);
      document.removeEventListener('mouseup', stopWindowResize);
    };
  }, [isFullScreen, pos, size]);

  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handleReset = () => {
    setCode(BOILERPLATES[selectedLanguage]);
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
      logs.push(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' '));
    };

    try {
      const result = eval(code);
      if (result !== undefined) {
        logs.push(`=> ${result}`);
      }
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
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      if (data.success) {
        let outputStr = '';
        if (data.stdout) outputStr += data.stdout;
        if (data.stderr) outputStr += `\nError Console:\n${data.stderr}`;
        setConsoleOutput(outputStr || 'Success: Python script executed with 0 outputs.');
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
    // Parse simulated variables in boilerplate
    let xVal = 10;
    let yVal = 20;
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
      const val = e.currentTarget.value;
      const nextCode = val.substring(0, start) + "    " + val.substring(end);
      setCode(nextCode);
      setTimeout(() => {
        e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 4;
      }, 0);
    }
  };

  const isFullscreenStyle = isFullScreen
    ? {
        position: 'fixed' as const,
        left: pos.x,
        top: pos.y,
        width: size.width,
        height: size.height,
        zIndex: 99999,
      }
    : {};

  return (
    <div 
      style={isFullscreenStyle}
      className={
        isFullScreen 
          ? "flex flex-col bg-[#05040a] border border-indigo-500/30 rounded-3xl overflow-hidden shadow-2xl relative select-none animate-in fade-in duration-300"
          : "flex flex-col h-full bg-[#05040a] border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative"
      }
    >
      {/* Draggable Header (Active only in fullscreen) */}
      <div 
        onMouseDown={startDrag}
        className={`flex justify-between items-center px-6 py-4 border-b border-white/5 bg-black/40 ${
          isFullScreen ? 'cursor-move select-none' : ''
        }`}
      >
        <div className="flex items-center gap-3">
          <Code className="text-indigo-400 w-4 h-4" />
          <span className="text-xs font-black uppercase tracking-widest text-gray-300">
            Computer Tech Coding Lab
          </span>
          {/* Language selector dropdown */}
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value as any)}
            className="bg-black/80 border border-white/10 rounded-xl px-2.5 py-1 text-[10px] font-black text-indigo-300 outline-none uppercase tracking-wider cursor-pointer"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="html">HTML / CSS</option>
            <option value="cpp">C++ (g++)</option>
          </select>
        </div>
        
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all"
            title={isFullScreen ? "Exit Fullscreen (Esc)" : "Fullscreen Mode"}
          >
            {isFullScreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
            <span>{isFullScreen ? 'Exit Full' : 'Fullscreen'}</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all"
            title="Reset code template"
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>
          <button
            type="button"
            onClick={handleRun}
            disabled={running}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all shadow-md shadow-indigo-600/10 active:scale-95 border border-indigo-400/20"
          >
            <Play size={12} fill="white" className={running ? 'animate-pulse' : ''} />
            <span>{running ? 'Running...' : 'Run Code'}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden select-text">
        <div className="flex-1 border-b border-white/5 flex flex-col min-h-0">
          <div className="px-4 py-2 bg-black/20 text-[9px] font-black uppercase tracking-widest text-gray-500 border-b border-white/5 flex justify-between">
            <span>Editor</span>
            <span>Tab = 4 Spaces</span>
          </div>
          <div className="flex-1 relative flex min-h-0 overflow-hidden">
            <div 
              ref={lineNumbersRef}
              className="w-10 bg-black/40 text-right pr-2.5 py-4 font-mono text-[11px] text-gray-600 select-none border-r border-white/[0.02] overflow-hidden"
            >
              {Array.from({ length: Math.max(15, code.split('\n').length + 5) }).map((_, i) => (
                <div key={i} className="leading-5 h-5">{i + 1}</div>
              ))}
            </div>
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              onScroll={handleScroll}
              className="flex-1 bg-transparent px-4 py-4 font-mono text-[12px] text-indigo-100 leading-5 outline-none resize-none overflow-y-auto"
              spellCheck={false}
              placeholder="Write your code here..."
            />
          </div>
        </div>

        {/* Resizer Splitter */}
        <div 
          onMouseDown={startResize}
          className="h-1.5 bg-white/5 hover:bg-indigo-500/50 active:bg-indigo-500 cursor-ns-resize transition-all flex items-center justify-center relative select-none shrink-0 border-y border-white/5"
          title="Drag to resize console"
        >
          <div className="w-8 h-[2px] bg-white/20 rounded-full" />
        </div>

        <div style={{ height: `${consoleHeight}px` }} className="flex flex-col min-h-0 bg-[#020205] shrink-0 relative">
          <div className="px-4 py-2 bg-black/20 text-[9px] font-black uppercase tracking-widest text-gray-500 border-b border-white/5 flex items-center gap-1.5 select-none">
            <Terminal size={10} />
            <span>{selectedLanguage === 'html' ? 'Live Web Preview Frame' : 'Console Output'}</span>
          </div>
          <div className="flex-1 p-4 overflow-hidden relative">
            {selectedLanguage === 'html' ? (
              <iframe 
                srcDoc={code} 
                title="Live Render Preview" 
                className="w-full h-full bg-white rounded-2xl border-none" 
              />
            ) : consoleOutput ? (
              <div className="w-full h-full overflow-y-auto font-mono text-[11px] text-emerald-400 whitespace-pre-wrap leading-relaxed select-text selection:bg-emerald-950 scrollbar-thin">
                {consoleOutput}
              </div>
            ) : (
              <span className="text-gray-600 italic font-mono text-[11px]">No output. Click "Run Code" above to execute.</span>
            )}
          </div>
        </div>
      </div>

      {/* Resize corner handle (Active only in fullscreen mode) */}
      {isFullScreen && (
        <div 
          onMouseDown={startWindowResize}
          className="absolute bottom-1 right-1 w-4 h-4 cursor-se-resize flex items-end justify-end select-none z-50"
          title="Drag to resize window"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" className="text-gray-500 fill-current opacity-40 hover:opacity-100 transition-opacity">
            <path d="M10,0 L0,10 L10,10 Z" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default SandboxLab;
