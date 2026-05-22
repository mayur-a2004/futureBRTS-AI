import React, { useState } from "react"
import { motion } from "framer-motion"
import { Send, Bot, Sparkles, Copy, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/Button"

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function PromptWorkspace() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        // Mock AI Response
        setTimeout(() => {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "I've analyzed your request. Here's a suggested tech stack and project structure:\n\n**Frontend:** React + Vite + Tailwind\n**Backend:** Node.js + Express\n**Database:** PostgreSQL\n\nWould you like me to generate the initial boilerplate code?"
            }]);
            setIsTyping(false);
        }, 1500);
    };

    return (
        <div className="h-[calc(100vh-6rem)] grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {/* Chat Area */}
            <div className="lg:col-span-2 flex flex-col bg-gray-900/30 border border-gray-800 rounded-2xl overflow-hidden backdrop-blur-sm">
                <header className="p-4 border-b border-gray-800 bg-gray-900/50 flex justify-between items-center">
                    <div className="flex items-center gap-2 font-bold text-white">
                        <Bot className="text-indigo-400" /> AI Architect
                    </div>
                    <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white"><RefreshCw size={14} /> Reset</Button>
                </header>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'assistant' ? 'bg-indigo-600' : 'bg-gray-700'}`}>
                                {msg.role === 'assistant' ? <Bot size={16} /> : <div className="text-xs font-bold">ME</div>}
                            </div>
                            <div className={`p-4 rounded-2xl max-w-[80%] text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'assistant' ? 'bg-gray-800 text-gray-200' : 'bg-indigo-600/20 text-indigo-100 border border-indigo-500/30'
                                }`}>
                                {msg.content}
                            </div>
                        </motion.div>
                    ))}
                    {isTyping && (
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0"><Bot size={16} /></div>
                            <div className="flex gap-1 items-center p-4 bg-gray-800 rounded-2xl">
                                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-gray-900 border-t border-gray-800">
                    <form onSubmit={handleSend} className="relative">
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="Describe your idea (e.g., 'A Kanban board for designers')..."
                            className="w-full bg-black border border-gray-700 rounded-xl pl-4 pr-12 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white placeholder-gray-500 transition-all font-medium"
                        />
                        <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white transition-colors">
                            <Send size={16} />
                        </button>
                    </form>
                </div>
            </div>

            {/* Sidebar / Suggestions */}
            <div className="space-y-6">
                <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-2xl">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><Sparkles className="text-yellow-400" /> Suggested Prompts</h3>
                    <div className="space-y-3">
                        {[
                            "Build a portfolio with dark mode",
                            "Create a task manager API with Node.js",
                            "Explain React useEffect hook",
                            "Generate a CSS grid layout"
                        ].map((prompt, i) => (
                            <button
                                key={i}
                                onClick={() => setInput(prompt)}
                                className="w-full text-left text-sm p-3 rounded-lg bg-gray-800 hover:bg-indigo-900/30 hover:border-indigo-500/50 border border-transparent transition-all text-gray-300 hover:text-white"
                            >
                                {prompt}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border border-indigo-500/30 p-6 rounded-2xl">
                    <h3 className="font-bold mb-2 text-indigo-200">Pro Tip</h3>
                    <p className="text-sm text-indigo-300/80 mb-4">Be specific about the frameworks you want to use for better results.</p>
                    <div className="p-3 bg-black/40 rounded border border-indigo-500/20 font-mono text-xs text-indigo-400 flex justify-between items-center group cursor-pointer hover:bg-black/60 transition-colors">
                        "Use Shadcn UI for components"
                        <Copy size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </div>
            </div>
        </div>
    )
}
