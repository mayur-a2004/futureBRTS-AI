import React, { useState } from 'react';
import { StepProcessLoader, Student360DossierCard, IStudent360Data } from './CopilotRichRenderers';
import { FeeAnalyticsWidget, IFeeData, ActionableButtonRow } from './EnterpriseCopilotCards';

export interface IMessage {
  id: string;
  sender: 'USER' | 'COPILOT';
  text?: string;
  executionSteps?: string[];
  uiComponent?: 'Student360DossierCard' | 'FeeAnalyticsWidget' | 'ActionableButtonRow';
  dataPayload?: any;
}

export const ErpCopilotWidget: React.FC<{ tenantId?: string; userRole?: string }> = ({ 
  tenantId = 'mount_carmel_school', 
  userRole = 'PRINCIPAL' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<IMessage[]>([
    {
      id: 'msg-1',
      sender: 'COPILOT',
      text: '🤖 Welcome to Future Education ERP AI Copilot! Connected to secondary ERP database (futurebilder_erp). Ask me for 360° student reports, fee audits, or practice assignments.'
    }
  ]);

  const handleSend = async () => {
    if (!prompt.trim() || loading) return;
    const userQuery = prompt.trim();
    setPrompt('');

    const userMsg: IMessage = { id: `u-${Date.now()}`, sender: 'USER', text: userQuery };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch('/api/v1/copilot/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userQuery,
          tenantId,
          userRole
        })
      });

      const data = await res.json();

      if (data.success) {
        const copilotMsg: IMessage = {
          id: `c-${Date.now()}`,
          sender: 'COPILOT',
          text: data.summaryText,
          executionSteps: data.executionSteps,
          uiComponent: data.uiComponent,
          dataPayload: data.dataPayload
        };
        setMessages(prev => [...prev, copilotMsg]);
      } else {
        setMessages(prev => [...prev, {
          id: `err-${Date.now()}`,
          sender: 'COPILOT',
          text: '❌ Error querying ERP Dual-DB engine.'
        }]);
      }
    } catch (err: any) {
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        sender: 'COPILOT',
        text: `❌ Connection Error: ${err.message}`
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[999999] w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-500 text-white font-bold text-2xl shadow-2xl hover:scale-110 transition-all flex items-center justify-center border-2 border-white/20 active:scale-95"
      >
        🤖
      </button>

      {/* Main Copilot Sidebar Chat Container */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-[999999] w-[420px] h-[620px] max-w-[92vw] max-h-[82vh] bg-slate-950/95 border border-indigo-500/30 rounded-3xl shadow-2xl backdrop-blur-2xl flex flex-col overflow-hidden text-white font-sans animate-slide-up">
          {/* Header */}
          <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-lg">
                🤖
              </div>
              <div>
                <h3 className="font-bold text-sm text-indigo-300">ERP AI Copilot</h3>
                <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  futurebilder_erp Sync Active
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white font-bold px-2 text-lg"
            >
              ✕
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
            {messages.map(msg => (
              <div key={msg.id} className={`flex flex-col ${msg.sender === 'USER' ? 'items-end' : 'items-start'}`}>
                {msg.text && (
                  <div className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                    msg.sender === 'USER' 
                      ? 'bg-indigo-600 text-white rounded-br-xs' 
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-xs'
                  }`}>
                    {msg.text}
                  </div>
                )}

                {/* Render Multi-step Stepper if available */}
                {msg.executionSteps && msg.executionSteps.length > 0 && (
                  <StepProcessLoader steps={msg.executionSteps} />
                )}

                {/* Render Rich Component Cards */}
                {msg.uiComponent === 'Student360DossierCard' && msg.dataPayload && (
                  <Student360DossierCard data={msg.dataPayload as IStudent360Data} />
                )}

                {msg.uiComponent === 'FeeAnalyticsWidget' && msg.dataPayload && (
                  <FeeAnalyticsWidget data={msg.dataPayload as IFeeData} />
                )}

                {msg.uiComponent === 'ActionableButtonRow' && msg.dataPayload?.actionButtons && (
                  <ActionableButtonRow buttons={msg.dataPayload.actionButtons} />
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono p-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
                Querying dual-database context...
              </div>
            )}
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-slate-900/90 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask Copilot (e.g. 360 report for Aarav, Fee audit)..."
              className="flex-1 bg-slate-800/80 border border-slate-700/60 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
            />
            <button
              onClick={handleSend}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};
