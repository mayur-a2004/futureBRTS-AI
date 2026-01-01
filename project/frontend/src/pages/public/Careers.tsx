import { Button } from "@/components/ui/Button"
import { ExternalLink, Hammer, Heart, Zap } from "lucide-react"

export default function Careers() {
    return (
        <div className="py-24 px-6 max-w-5xl mx-auto text-center text-white space-y-20">
            {/* Header */}
            <div className="space-y-6">
                <h1 className="text-5xl font-black">Join the Mission</h1>
                <p className="text-xl text-gray-400 max-w-3xl mx-auto font-medium leading-relaxed">
                    We are building the intelligence layer for human potential.
                    If you love complex problems, clean code, and helping people grow, you belong here.
                </p>
            </div>

            {/* Values */}
            <div className="grid md:grid-cols-3 gap-8 text-left">
                <ValueBlock icon={<Hammer />} title="Builders First" desc="We respect craft. We ship fast but we don't break things that matter." />
                <ValueBlock icon={<Zap />} title="High Energy" desc="We are a small, tight-knit team moving at high velocity." />
                <ValueBlock icon={<Heart />} title="User Obsessed" desc="Every line of code should help a user achieve their dream." />
            </div>

            {/* Jobs */}
            <div className="text-left space-y-8">
                <h2 className="text-3xl font-bold">Open Positions</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <JobCard
                        role="Senior Frontend Engineer"
                        dept="Engineering"
                        loc="Remote"
                    />
                    <JobCard
                        role="Product Designer"
                        dept="Design"
                        loc="Remote"
                    />
                    <JobCard
                        role="Growth Marketing Lead"
                        dept="Marketing"
                        loc="New York / Remote"
                    />
                    <JobCard
                        role="Full Stack Developer"
                        dept="Engineering"
                        loc="Remote"
                    />
                </div>
            </div>

            <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-12">
                <h3 className="text-2xl font-bold mb-4">Don't see your role?</h3>
                <p className="text-gray-500 mb-8 font-medium">
                    We are always looking for exceptional talent. If you think you can help us build the future, talk to us.
                </p>
                <Button className="bg-white text-black font-bold px-8 py-3 rounded-full hover:bg-gray-200 uppercase tracking-widest text-xs" onClick={() => window.open('mailto:careers@futurebuilder.com')}>
                    Email Your Portfolio
                </Button>
            </div>
        </div>
    )
}

function ValueBlock({ icon, title, desc }: any) {
    return (
        <div className="space-y-3">
            <div className="text-indigo-400">{icon}</div>
            <h3 className="text-lg font-bold">{title}</h3>
            <p className="text-gray-500 text-sm font-medium">{desc}</p>
        </div>
    )
}

function JobCard({ role, dept, loc }: any) {
    return (
        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all cursor-pointer group">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-bold mb-1 group-hover:text-indigo-400 text-white transition-colors">{role}</h3>
                    <div className="text-xs text-gray-500 font-mono space-x-2 uppercase tracking-wider">
                        <span>{dept}</span>
                        <span>•</span>
                        <span>{loc}</span>
                    </div>
                </div>
                <ExternalLink className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
            </div>
        </div>
    )
}
