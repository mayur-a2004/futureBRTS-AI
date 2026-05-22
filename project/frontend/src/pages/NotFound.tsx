import { Button } from "@/components/ui/Button"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"

export default function NotFound() {
    return (
        <div className="min-h-screen bg-transparent text-white flex flex-col items-center justify-center p-6 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black opacity-50 pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative z-10"
            >
                <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 mb-4 animate-pulse">404</h1>
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-widest mb-4">Node Disconnected</h2>
                <p className="text-gray-500 max-w-sm mx-auto mb-10 text-sm md:text-base font-medium">
                    The tactical node you are requesting does not exist in our current simulation. Return to base.
                </p>
                <Link to="/">
                    <Button size="lg" className="px-10 py-6 rounded-2xl bg-indigo-600 hover:bg-white hover:text-black transition-all font-black uppercase tracking-widest text-xs">Re-Route to Home</Button>
                </Link>
            </motion.div>
        </div>
    )
}
