import { motion } from "framer-motion"
import { CheckCircle, ArrowRight, Download } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Link } from "react-router-dom"
import { useState, useEffect } from "react"

export default function Success() {
    const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight })

    useEffect(() => {
        const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight })
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden">
            {/* Simple CSS Confetti Mock */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ y: -20, x: Math.random() * windowSize.width, opacity: 1, rotate: 0 }}
                        animate={{ y: windowSize.height + 20, rotate: 360 }}
                        transition={{ duration: Math.random() * 2 + 2, repeat: Infinity, ease: "linear" }}
                        className="absolute w-2 h-2 bg-indigo-500 rounded-full opacity-50"
                        style={{ backgroundColor: ['#6366f1', '#ec4899', '#10b981', '#f59e0b'][Math.floor(Math.random() * 4)] }}
                    />
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", duration: 0.8 }}
                className="max-w-md w-full text-center space-y-8 relative z-10"
            >
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(34,197,94,0.5)]">
                    <CheckCircle className="w-12 h-12 text-white" />
                </div>

                <div>
                    <h1 className="text-4xl font-bold mb-4">Payment Successful!</h1>
                    <p className="text-gray-400 text-lg">
                        Welcome to FutureBRTS Pro. Your account has been upgraded and all features are unlocked.
                    </p>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-left space-y-4">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Transaction ID</span>
                        <span className="font-mono">#TXN-883492</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Amount Paid</span>
                        <span className="font-bold">$158.40</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Plan</span>
                        <span>Pro (Yearly)</span>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <Link to="/dashboard">
                        <Button size="lg" className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-lg">
                            Go to Dashboard <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </Link>
                    <Button variant="outline" className="w-full border-gray-800 text-gray-400 hover:text-white">
                        <Download className="mr-2 w-4 h-4" /> Download Receipt
                    </Button>
                </div>
            </motion.div>
        </div>
    )
}
