import { useState } from 'react';
import Card from '@/components/ui/Card';
import { Button } from "@/components/ui/Button"
import Canvas from './Canvas';

export default function PromptWorkspace({ onSaveOverwrite }: { onSaveOverwrite?: (nodes: any[]) => void }) {
    const [nodes, setNodes] = useState<any[]>([]);

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col gap-4 animate-in fade-in duration-500">

            {/* Header Toolbar */}
            <div className="flex justify-between items-center bg-gray-900/80 p-4 rounded-xl border border-gray-800">
                <div>
                    <h1 className="text-xl font-bold text-white">Project Blueprint Builder</h1>
                    <p className="text-xs text-gray-500">Design your system architecture visually.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" size="sm">Reset</Button>
                    <Button
                        size="sm"
                        onClick={() => onSaveOverwrite && onSaveOverwrite(nodes)}
                    >
                        Save Blueprint
                    </Button>
                </div>
            </div>

            {/* Main Workspace */}
            <div className="flex-1 flex gap-4 overflow-hidden">

                {/* Components Toolbar */}
                <Card className="w-64 flex flex-col gap-4 overflow-y-auto hidden md:flex">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Components</h3>
                    {['Database', 'Server', 'Client', 'API Gateway', 'Microservice', 'Auth Service', 'Queue', 'Load Balancer'].map(item => (
                        <div key={item} className="p-3 bg-gray-800 rounded-lg border border-gray-700 cursor-grab hover:bg-gray-700 hover:border-indigo-500 transition text-sm font-medium text-gray-300">
                            {item}
                        </div>
                    ))}
                </Card>

                {/* Canvas Area */}
                <div className="flex-1 bg-gray-900 rounded-2xl border border-gray-800 relative overflow-hidden shadow-inner flex flex-col">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                    <Canvas nodes={nodes} onNodesChange={setNodes} />

                    {/* Floating Controls */}
                    <div className="absolute bottom-4 right-4 flex gap-2">
                        <Button variant="secondary" size="sm" className="bg-black/50 backdrop-blur">+ Zoom In</Button>
                        <Button variant="secondary" size="sm" className="bg-black/50 backdrop-blur">- Zoom Out</Button>
                    </div>
                </div>

                {/* Properties Panel */}
                <Card className="w-64 hidden xl:block">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Properties</h3>
                    <div className="text-sm text-gray-400 text-center py-10">
                        Select a node to edit properties.
                    </div>
                </Card>

            </div>
        </div>
    );
}
