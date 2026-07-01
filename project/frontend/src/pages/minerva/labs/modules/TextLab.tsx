import React, { useMemo } from 'react';
import { SubjectType, SUBJECT_COLORS, SUBJECT_ICONS } from '../types/LabConfig';

export interface TextLabProps {
  content: string;
  topic: string;
  subject: SubjectType;
  grade?: string;
  board?: string;
}

// Parse inline bold/italic/code
function parseInline(text: string): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  // Split by bold (**text**), italic (*text*), inline code (`code`)
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      result.push(text.slice(last, match.index));
    }
    const token = match[0];
    if (token.startsWith('**')) {
      result.push(
        <strong key={match.index} className="font-semibold text-white">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('*')) {
      result.push(
        <em key={match.index} className="italic text-white/80">
          {token.slice(1, -1)}
        </em>
      );
    } else if (token.startsWith('`')) {
      result.push(
        <code
          key={match.index}
          className="bg-white/10 text-indigo-300 font-mono text-sm px-1.5 py-0.5 rounded"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    last = match.index + token.length;
  }
  if (last < text.length) {
    result.push(text.slice(last));
  }
  return result;
}

// Detect if a line looks like a formula
function isFormula(line: string): boolean {
  return (
    /[=+\-*/^∫∑√π∞≈≤≥×÷]/.test(line) &&
    line.trim().length > 2 &&
    line.trim().length < 120 &&
    !line.trim().startsWith('#') &&
    !line.trim().startsWith('-') &&
    !line.trim().startsWith('•')
  );
}

interface ParsedBlock {
  type: 'h1' | 'h2' | 'h3' | 'bullet' | 'formula' | 'paragraph' | 'divider';
  content: string;
}

function parseContent(raw: string): ParsedBlock[] {
  const lines = raw.split('\n');
  const blocks: ParsedBlock[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) continue;

    if (trimmed.startsWith('### ')) {
      blocks.push({ type: 'h3', content: trimmed.slice(4) });
    } else if (trimmed.startsWith('## ')) {
      blocks.push({ type: 'h2', content: trimmed.slice(3) });
    } else if (trimmed.startsWith('# ')) {
      blocks.push({ type: 'h1', content: trimmed.slice(2) });
    } else if (trimmed === '---' || trimmed === '***') {
      blocks.push({ type: 'divider', content: '' });
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
      blocks.push({ type: 'bullet', content: trimmed.slice(2) });
    } else if (isFormula(trimmed)) {
      blocks.push({ type: 'formula', content: trimmed });
    } else {
      blocks.push({ type: 'paragraph', content: trimmed });
    }
  }

  return blocks;
}

const TextLab: React.FC<TextLabProps> = ({ content, topic, subject, grade, board }) => {
  const colors = SUBJECT_COLORS[subject] ?? SUBJECT_COLORS.biology;
  const icon = SUBJECT_ICONS[subject] ?? '📚';

  const blocks = useMemo(() => parseContent(content || ''), [content]);

  const gradientBorder = useMemo(() => {
    const accentMap: Record<SubjectType, string> = {
      biology:     'from-green-500 to-emerald-400',
      chemistry:   'from-cyan-500 to-teal-400',
      physics:     'from-orange-500 to-red-400',
      mathematics: 'from-indigo-500 to-purple-400',
      statistics:  'from-purple-500 to-violet-400',
      accounting:  'from-amber-500 to-yellow-400',
      geography:   'from-emerald-500 to-green-400',
      economics:   'from-yellow-500 to-amber-400',
    };
    return accentMap[subject] ?? 'from-indigo-500 to-purple-400';
  }, [subject]);

  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-white/30">
        <span className="text-4xl mb-2">📄</span>
        <span className="text-sm">No content available</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0 h-full">
      {/* Top gradient accent bar */}
      <div className={`h-1 w-full rounded-t-xl bg-gradient-to-r ${gradientBorder} flex-shrink-0`} />

      {/* Header */}
      <div className="flex items-start gap-3 p-4 pb-2 bg-white/3 border-b border-white/5">
        <div className="flex items-center gap-2 flex-1 flex-wrap">
          {/* Subject badge */}
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${colors.badge}`}>
            <span>{icon}</span>
            <span className="capitalize">{subject}</span>
          </span>

          {/* Grade tag */}
          {grade && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-white/5 border border-white/10 text-white/50">
              {grade}
            </span>
          )}

          {/* Board tag */}
          {board && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-white/5 border border-white/10 text-white/50 uppercase tracking-wide">
              {board}
            </span>
          )}
        </div>
      </div>

      {/* Topic heading */}
      <div className="px-4 pt-3 pb-2">
        <h2 className={`text-lg font-bold ${colors.text} leading-snug`}>{topic}</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3 custom-scrollbar">
        {blocks.map((block, idx) => {
          switch (block.type) {
            case 'h1':
              return (
                <h2 key={idx} className="text-xl font-bold text-white mt-4 first:mt-0 leading-snug">
                  {parseInline(block.content)}
                </h2>
              );
            case 'h2':
              return (
                <h3 key={idx} className={`text-base font-semibold ${colors.text} mt-3 first:mt-0`}>
                  {parseInline(block.content)}
                </h3>
              );
            case 'h3':
              return (
                <h4 key={idx} className="text-sm font-semibold text-white/80 mt-2 first:mt-0 uppercase tracking-wide">
                  {parseInline(block.content)}
                </h4>
              );
            case 'bullet':
              return (
                <div key={idx} className="flex items-start gap-2">
                  <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-current ${colors.text}`} />
                  <span className="text-sm text-white/75 leading-relaxed">
                    {parseInline(block.content)}
                  </span>
                </div>
              );
            case 'formula':
              return (
                <div
                  key={idx}
                  className="relative flex items-center gap-3 px-4 py-3 my-2 rounded-xl bg-indigo-950/60 border border-indigo-500/30 backdrop-blur-sm overflow-hidden"
                >
                  {/* Left accent */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-400 to-purple-500 rounded-l-xl" />
                  <span className="text-base select-none">🔣</span>
                  <code className="font-mono text-indigo-200 text-sm tracking-wide flex-1">
                    {block.content}
                  </code>
                </div>
              );
            case 'divider':
              return (
                <div key={idx} className="border-t border-white/8 my-2" />
              );
            case 'paragraph':
            default:
              return (
                <p key={idx} className="text-sm text-white/70 leading-relaxed">
                  {parseInline(block.content)}
                </p>
              );
          }
        })}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 999px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
};

export default TextLab;
