// 👉 Global Error Boundary component for React stability
// 👉 Isse hum ensure karte hain ki app crash hone par blank screen na dikhe

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-10 text-center">
                    <h1 className="text-4xl font-black mb-4">Something went wrong.</h1>
                    <p className="text-gray-500 mb-4">Don't worry, our engineers are on it. Please refresh the page.</p>
                    {this.state.error && (
                        <div className="max-w-3xl text-left bg-zinc-900 border border-red-500/30 p-6 rounded-lg font-mono text-xs text-red-400 mb-8 overflow-auto max-h-96">
                            <strong className="text-sm">Error Details:</strong>
                            <p className="mt-1 font-bold">{this.state.error.message}</p>
                            {this.state.error.stack && (
                                <pre className="mt-3 text-[10px] text-zinc-500 whitespace-pre-wrap">{this.state.error.stack}</pre>
                            )}
                        </div>
                    )}
                    <button
                        onClick={() => window.location.reload()}
                        className="px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition"
                    >
                        Refresh Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
