import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Terminal, Code } from 'lucide-react';
import { SubjectType, SUBJECT_COLORS } from '../types/LabConfig';

interface SandboxLabProps {
  subject: SubjectType;
  topic: string;
  sandboxConfig?: {
    language: 'javascript' | 'python';
    default_code: string;
    expected_output?: string;
  };
}

export const SandboxLab: React.FC<SandboxLabProps> = ({
  subject,
  topic,
  sandboxConfig
}) => {
  const lang = sandboxConfig?.language || 'javascript';
  const defaultCode = sandboxConfig?.default_code || (lang === 'javascript' 
    ? `// Complete the function to double the number\nfunction double(n) {\n    return n * 2;\n}\nconsole.log(double(5));`
    : `# Write a python function to check if number is even\ndef is_even(n):\n    return n % 2 == 0\n\nprint(is_even(10))\n`);

  const [code, setCode] = useState(defaultCode);
  const [consoleOutput, setConsoleOutput] = useState('');
  const [running, setRunning] = useState(false);

  useEffect(() => {
    setCode(defaultCode);
    setConsoleOutput('');
  }, [sandboxConfig, defaultCode]);

  const handleReset = () => {
    setCode(defaultCode);
    setConsoleOutput('Editor reset to default boilerplate.');
  };

  const handleRun = async () => {
    if (lang === 'javascript') {
      runJavaScript();
    } else {
      await runPython();
    }
  };

  const runJavaScript = () => {
    setRunning(true);
    const logs: string[] = [];
    const originalLog = console.log;
    
    // Intercept console.log
    console.log = (...args: any[]) => {
      logs.push(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' '));
    };

    try {
      // Execute sandboxed eval
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
    setRunning(true);
    setConsoleOutput('Spawning secure Python sandbox worker...');
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

  return (
    <div className="flex flex-col h-full bg-[#05040a] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
      <div className="flex justify-between items-center px-6 py-4 border-b border-white/5 bg-black/40">
        <div className="flex items-center gap-2">
          <Code className="text-indigo-400 w-4 h-4" />
          <span className="text-xs font-black uppercase tracking-widest text-gray-300">
            Interactive Code Sandbox ({lang.toUpperCase()})
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all"
            title="Reset code template"
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>
          <button
            onClick={handleRun}
            disabled={running}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all shadow-md shadow-indigo-600/10 active:scale-95"
          >
            <Play size={12} fill="white" className={running ? 'animate-pulse' : ''} />
            <span>{running ? 'Running...' : 'Run Code'}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-rows-3 md:grid-rows-1 md:grid-cols-2 overflow-hidden">
        <div className="row-span-2 md:row-span-1 border-b md:border-b-0 md:border-r border-white/5 flex flex-col min-h-0">
          <div className="px-4 py-2 bg-black/20 text-[9px] font-black uppercase tracking-widest text-gray-500 border-b border-white/5 flex justify-between">
            <span>Editor</span>
            <span>Tab = 4 Spaces</span>
          </div>
          <div className="flex-1 relative flex min-h-0">
            <div className="w-10 bg-black/40 text-right pr-2.5 py-4 font-mono text-[11px] text-gray-600 select-none border-r border-white/[0.02]">
              {Array.from({ length: Math.max(15, code.split('\n').length + 5) }).map((_, i) => (
                <div key={i} className="leading-5 h-5">{i + 1}</div>
              ))}
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent px-4 py-4 font-mono text-[12px] text-indigo-100 leading-5 outline-none resize-none overflow-y-auto"
              spellCheck={false}
              placeholder="Write your code here..."
            />
          </div>
        </div>

        <div className="flex flex-col min-h-0 bg-[#020205]">
          <div className="px-4 py-2 bg-black/20 text-[9px] font-black uppercase tracking-widest text-gray-500 border-b border-white/5 flex items-center gap-1.5">
            <Terminal size={10} />
            <span>Console Output</span>
          </div>
          <div className="flex-1 p-4 overflow-y-auto font-mono text-[11px] text-emerald-400 whitespace-pre-wrap leading-relaxed select-text selection:bg-emerald-950">
            {consoleOutput ? (
              consoleOutput
            ) : (
              <span className="text-gray-600 italic">No output. Click "Run Code" above to execute.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default SandboxLab;
