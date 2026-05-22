import { useState } from "react"
import { motion } from "framer-motion"
import { CreditCard, Lock, CheckCircle, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { useNavigate } from "react-router-dom"

export default function Checkout() {
    const navigate = useNavigate()
    const [method, setMethod] = useState<'card' | 'upi'>('card')
    const [processing, setProcessing] = useState(false)

    const handlePayment = () => {
        setProcessing(true)
        setTimeout(() => {
            navigate("/checkout/success")
        }, 2000)
    }

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-4xl grid md:grid-cols-2 bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden"
            >
                {/* Order Summary */}
                <div className="p-8 bg-gray-800/50 border-r border-gray-800">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold">P</div>
                        <span className="font-bold text-xl">FutureBRTS Pro</span>
                    </div>

                    <div className="space-y-4 mb-8">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Pro Plan (Yearly)</span>
                            <span>$144.00</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Tax</span>
                            <span>$14.40</span>
                        </div>
                        <div className="h-px bg-gray-700 my-4" />
                        <div className="flex justify-between font-bold text-xl">
                            <span>Total</span>
                            <span>$158.40</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                            <CheckCircle className="text-green-400 w-4 h-4" /> 30-day money-back guarantee
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                            <CheckCircle className="text-green-400 w-4 h-4" /> Secure SSL Encryption
                        </div>
                    </div>
                </div>

                {/* Payment Form */}
                <div className="p-8">
                    <h2 className="text-xl font-bold mb-6">Payment Details</h2>

                    {/* Method Toggle */}
                    <div className="flex p-1 bg-gray-800 rounded-lg mb-6">
                        <button
                            onClick={() => setMethod('card')}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${method === 'card' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                        >
                            <CreditCard size={16} /> Card (Stripe)
                        </button>
                        <button
                            onClick={() => setMethod('upi')}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${method === 'upi' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Smartphone size={16} /> UPI (Razorpay)
                        </button>
                    </div>

                    <div className="space-y-4">
                        {method === 'card' ? (
                            <>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Card Number</label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                                        <input type="text" placeholder="0000 0000 0000 0000" className="w-full bg-gray-950 border border-gray-800 rounded-lg py-3 pl-10 pr-4 outline-none focus:border-indigo-500 transition-colors" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Expiry</label>
                                        <input type="text" placeholder="MM/YY" className="w-full bg-gray-950 border border-gray-800 rounded-lg py-3 px-4 outline-none focus:border-indigo-500 transition-colors" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">CVC</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                                            <input type="text" placeholder="123" className="w-full bg-gray-950 border border-gray-800 rounded-lg py-3 pl-10 pr-4 outline-none focus:border-indigo-500 transition-colors" />
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">UPI ID</label>
                                <div className="relative">
                                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                                    <input type="text" placeholder="username@upi" className="w-full bg-gray-950 border border-gray-800 rounded-lg py-3 pl-10 pr-4 outline-none focus:border-indigo-500 transition-colors" />
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Open your UPI app to approve the request.</p>
                            </div>
                        )}

                        <Button
                            onClick={handlePayment}
                            disabled={processing}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 py-6 text-lg mt-6"
                        >
                            {processing ? "Processing..." : `Pay $158.40`}
                        </Button>

                        <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-4">
                            <Lock size={12} /> Payments processed securely by {method === 'card' ? 'Stripe' : 'Razorpay'}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
