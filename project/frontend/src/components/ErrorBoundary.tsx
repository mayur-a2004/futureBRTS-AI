// 👉 Global Error Boundary component for React stability
// 👉 Isse hum ensure karte hain ki app crash hone par blank screen na dikhe

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(_: Error): State {
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-10 text-center">
                    <h1 className="text-4xl font-black mb-4">Something went wrong.</h1>
                    <p className="text-gray-500 mb-8">Don't worry, our engineers are on it. Please refresh the page.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-8 py-4 bg-white text-black font-bold rounded-xl"
                    >
                        Refresh Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
