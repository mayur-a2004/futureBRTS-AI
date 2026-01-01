import { Users, Target, Globe, Rocket } from "lucide-react"

export default function About() {
    return (
        <div className="py-24 px-6 max-w-7xl mx-auto space-y-32">
            {/* Mission */}
            <section className="text-center max-w-4xl mx-auto space-y-8">
                <h1 className="text-5xl font-black tracking-tight mb-6">Building the Workforce of Tomorrow</h1>
                <p className="text-xl text-gray-400 font-medium leading-relaxed">
                    FutureBuilder was created to solve a singular problem: <strong>The Career Navigation Gap.</strong>
                    Too many students and professionals have the potential but lack the map. We enable clarity through intelligence.
                </p>
            </section>

            {/* Values */}
            <section className="grid md:grid-cols-3 gap-8">
                <ValueCard
                    icon={<Target />}
                    title="Precision"
                    desc="We believe in specific, actionable advice. No vague 'network more' suggestions. We give you a checklist."
                />
                <ValueCard
                    icon={<Users />}
                    title="Access"
                    desc="High-quality career planning shouldn't be reserved for the elite. We are democratizing strategy."
                />
                <ValueCard
                    icon={<Globe />}
                    title="Adaptability"
                    desc="The market changes fast. Your roadmap should too. We build plans that evolve with the world."
                />
            </section>

            {/* Origin Story */}
            <section className="flex flex-col md:flex-row items-center gap-16">
                <div className="flex-1 space-y-6">
                    <h2 className="text-3xl font-bold">Why We Started</h2>
                    <p className="text-gray-400 font-medium leading-relaxed">
                        In 2025, the job market became more complex than ever. Skills were expiring faster, and university curriculums couldn't keep up.
                        Students were graduating with debt and confusion.
                    </p>
                    <p className="text-gray-400 font-medium leading-relaxed">
                        We asked a simple question: <strong>What if you could GPS your career?</strong>
                        Just like you navigate traffic, you should be able to navigate skill gaps. That is FutureBuilder.
                    </p>
                </div>
                <div className="flex-1 p-8 rounded-3xl bg-white/[0.03] border border-white/5 flex items-center justify-center">
                    <Rocket size={64} className="text-indigo-500 opacity-80" />
                </div>
            </section>
        </div>
    )
}

function ValueCard({ icon, title, desc }: any) {
    return (
        <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
            <div className="text-indigo-400 w-10 h-10 mb-6">{icon}</div>
            <h3 className="text-xl font-bold mb-3">{title}</h3>
            <p className="text-gray-400 font-medium leading-relaxed">{desc}</p>
        </div>
    )
}
