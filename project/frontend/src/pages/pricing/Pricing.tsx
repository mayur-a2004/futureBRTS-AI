import { useState } from "react"
import { motion } from "framer-motion"
import { Check, Zap, Star } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Link } from "react-router-dom"

export default function Pricing() {
    const [isAnnual, setIsAnnual] = useState(true)

    const plans = [
        {
            name: "Starter",
            price: isAnnual ? "0" : "0",
            description: "Perfect for students starting their career journey.",
            features: [
                "Basic Profile Builder",
                "3 Resume Templates",
                "Job Repository Access",
                "Community Support"
            ],
            icon: <Star className="w-6 h-6 text-indigo-400" />,
            cta: "Get Started Free",
            popular: false
        },
        {
            name: "Pro",
            price: isAnnual ? "12" : "15",
            description: "Unlock advanced AI tools and career predictions.",
            features: [
                "Advanced AI Resume Builder",
                "Unlimited Templates",
                "Career Prediction Engine",
                "Skill Gap Analysis",
                "Verified Badge",
                "Priority Support"
            ],
            icon: <Zap className="w-6 h-6 text-purple-400" />,
            cta: "Upgrade to Pro",
            popular: true
        },
        {
            name: "Institution",
            price: "Custom",
            description: "For universities and coding bootcamps.",
            features: [
                "Admin Dashboard",
                "Student Analytics",
                "Batch Resume Export",
                "Custom Branding",
                "API Access",
                "Dedicated Manager"
            ],
            icon: <Star className="w-6 h-6 text-blue-400" />,
            cta: "Contact Sales",
            popular: false
        }
    ]

    return (
        <div className="min-h-screen bg-black text-white font-sans overflow-hidden relative">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-96 bg-indigo-900/20 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-24">
                <div className="text-center mb-16">
                    <Link to="/" className="text-sm font-medium text-indigo-400 mb-4 inline-block hover:underline">← Back to Home</Link>
                    <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-6">Simple, Transparent Pricing</h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">Invest in your future. Choose the plan that fits your career goals.</p>

                    {/* Toggle */}
                    <div className="flex items-center justify-center gap-4 mt-8">
                        <span className={`text-sm ${!isAnnual ? 'text-white font-bold' : 'text-gray-400'}`}>Monthly</span>
                        <button
                            onClick={() => setIsAnnual(!isAnnual)}
                            className="w-14 h-7 bg-gray-800 rounded-full relative p-1 transition-colors hover:bg-gray-700"
                        >
                            <div className={`w-5 h-5 bg-indigo-500 rounded-full transition-transform ${isAnnual ? 'translate-x-7' : 'translate-x-0'}`} />
                        </button>
                        <span className={`text-sm ${isAnnual ? 'text-white font-bold' : 'text-gray-400'}`}>Yearly <span className="text-indigo-400 text-xs ml-1">(Save 20%)</span></span>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {plans.map((plan, idx) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`relative p-8 rounded-2xl border ${plan.popular ? 'border-indigo-500/50 bg-indigo-900/10' : 'border-gray-800 bg-gray-900/50'} backdrop-blur-sm flex flex-col`}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 right-0 bg-indigo-500 text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">MOST POPULAR</div>
                            )}

                            <div className="mb-6">
                                <div className="w-12 h-12 bg-gray-800/50 rounded-lg flex items-center justify-center mb-4">
                                    {plan.icon}
                                </div>
                                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                                <p className="text-gray-400 text-sm h-10">{plan.description}</p>
                            </div>

                            <div className="mb-6">
                                <span className="text-4xl font-bold text-white">${plan.price}</span>
                                {plan.price !== "Custom" && <span className="text-gray-400"> / {isAnnual ? 'mo' : 'mo'}</span>}
                            </div>

                            <ul className="flex-1 space-y-4 mb-8">
                                {plan.features.map((feature, fIdx) => (
                                    <li key={fIdx} className="flex items-center gap-3 text-sm text-gray-300">
                                        <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-auto pt-6">
                                <Link to="/checkout" className="block w-full">
                                    <Button
                                        className={`w-full ${plan.popular ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-800 hover:bg-gray-700'}`}
                                        size="lg"
                                    >
                                        {plan.cta}
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )
}
