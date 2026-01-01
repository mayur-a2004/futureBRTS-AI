import { Button } from "@/components/ui/Button"
import { Mail, MessageSquare, MapPin } from "lucide-react"

export default function Contact() {
    return (
        <div className="py-24 px-6 max-w-4xl mx-auto text-white">
            <div className="text-center mb-20 space-y-6">
                <h1 className="text-5xl font-black">Contact Us</h1>
                <p className="text-xl text-gray-400 font-medium">We'd love to hear from you. Whether you have a question about features, pricing, or need a demo.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-8">
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold">Get in Touch</h3>
                        <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-indigo-500/30 transition-all">
                            <Mail className="w-6 h-6 text-indigo-400 mb-4" />
                            <h4 className="font-bold mb-1">Email Support</h4>
                            <p className="text-gray-400 text-sm mb-3">For general inquiries and account support.</p>
                            <a href="mailto:support@futurebuilder.com" className="text-indigo-400 font-bold text-sm tracking-widest uppercase hover:underline">support@futurebuilder.com</a>
                        </div>

                        <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-purple-500/30 transition-all">
                            <MessageSquare className="w-6 h-6 text-purple-400 mb-4" />
                            <h4 className="font-bold mb-1">Partnerships</h4>
                            <p className="text-gray-400 text-sm mb-3">For universities and enterprise sales.</p>
                            <a href="mailto:partners@futurebuilder.com" className="text-purple-400 font-bold text-sm tracking-widest uppercase hover:underline">partners@futurebuilder.com</a>
                        </div>
                        <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10">
                            <MapPin className="w-6 h-6 text-gray-400 mb-4" />
                            <h4 className="font-bold mb-1">Headquarters</h4>
                            <p className="text-gray-400 text-sm">San Francisco, CA<br />Remote First Team</p>
                        </div>
                    </div>
                </div>

                <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5">
                    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                        <div className="space-y-2">
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500">Name</label>
                            <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-gray-700" placeholder="John Doe" />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500">Email</label>
                            <input type="email" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-gray-700" placeholder="john@example.com" />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500">Subject</label>
                            <select className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors">
                                <option className="bg-zinc-900">General Inquiry</option>
                                <option className="bg-zinc-900">Support</option>
                                <option className="bg-zinc-900">Partnership</option>
                                <option className="bg-zinc-900">Feedback</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500">Message</label>
                            <textarea rows={4} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-gray-700" placeholder="How can we help?" />
                        </div>
                        <Button className="w-full bg-white text-black font-black uppercase tracking-widest text-xs py-4 hover:bg-gray-200">Send Message</Button>
                    </form>
                </div>
            </div>
        </div>
    )
}
