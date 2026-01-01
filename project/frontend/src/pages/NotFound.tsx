import { Button } from "@/components/ui/Button"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"

export default function NotFound() {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black opacity-50 pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative z-10"
            >
                <h1 className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 mb-4">404</h1>
                <h2 className="text-3xl font-bold mb-4">Page Not Found</h2>
                <p className="text-gray-400 max-w-md mx-auto mb-8">
                    The future you are looking for hasn't been built yet. Or maybe the URL is just wrong.
                </p>
                <Link to="/">
                    <Button size="lg" className="px-8">Back to Home</Button>
                </Link>
            </motion.div>
        </div>
    )
}
