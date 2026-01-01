export default function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`bg-gray-900/50 backdrop-blur-xl border border-gray-800 p-6 rounded-2xl hover:border-gray-700 transition-all duration-300 shadow-xl ${className}`}>
            {children}
        </div>
    );
}
