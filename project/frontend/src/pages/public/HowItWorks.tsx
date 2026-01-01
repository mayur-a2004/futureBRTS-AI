import { CheckCircle, User, Link as LinkIcon, Edit3 } from "lucide-react"

export default function HowItWorks() {
    return (
        <div className="py-24 px-6 max-w-5xl mx-auto text-white">
            <div className="text-center mb-20 space-y-6">
                <h1 className="text-5xl font-black">How It Works</h1>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto font-medium">
                    A complex system hidden behind a simple interface. We take your unstructured ambition and turn it into a structured plan.
                </p>
            </div>

            <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:w-0.5 before:-translate-x-px before:h-full before:bg-white/10 md:before:mx-auto md:before:translate-x-0">
                <Step
                    num="01"
                    title="Create Your Account"
                    desc="Sign up securely to access your personal workspace. We keep your data private and focused on your growth."
                    icon={<User />}
                />
                <Step
                    num="02"
                    title="Define Your North Star"
                    desc="Tell the system what you want. 'I want to be a Senior React Developer' or 'I want to launch a SaaS in 3 months'."
                    icon={<Edit3 />}
                />
                <Step
                    num="03"
                    title="Engine Analysis"
                    desc="Our predictive engine analyzes current market requirements versus your current profile to find the gap."
                    icon={<LinkIcon />}
                />
                <Step
                    num="04"
                    title="Execute & Track"
                    desc="You get a generated roadmap. Check off items as you complete them. The system adapts if you get stuck."
                    icon={<CheckCircle />}
                />
            </div>
        </div>
    )
}

function Step({ num, title, desc, icon }: any) {
    return (
        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/20 bg-[#050505] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
            </div>

            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-8 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-indigo-500/30 transition-all">
                <div className="flex items-center gap-4 mb-4">
                    <div className="text-indigo-400">{icon}</div>
                    <span className="text-2xl font-black text-white/10">{num}</span>
                </div>
                <h3 className="text-xl font-bold mb-2">{title}</h3>
                <p className="text-gray-400 font-medium leading-relaxed">{desc}</p>
            </div>
        </div>
    )
}
