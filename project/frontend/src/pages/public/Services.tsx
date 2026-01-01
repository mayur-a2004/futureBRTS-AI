import { Briefcase, BookOpen, Target, Cpu, BarChart, GraduationCap } from "lucide-react"

export default function Services() {
    return (
        <div className="py-24 px-6 max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
                <h1 className="text-5xl font-black mb-6">Our Services</h1>
                <p className="text-xl text-gray-400 font-medium">
                    We provide structured intelligence for every stage of your journey.
                    From campus to corner office, we have a roadmap engine for you.
                </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <ServiceCard
                    icon={<GraduationCap />}
                    title="Student Roadmaps"
                    desc="For university students. Input your major and target role. Get a semester-by-semester plan of projects, internships, and skills."
                />
                <ServiceCard
                    icon={<BookOpen />}
                    title="Exam Planning"
                    desc="For competitive exam aspirants. structured timelines, revision slots, and resource allocation to maximize your score."
                />
                <ServiceCard
                    icon={<Target />}
                    title="Career Transitions"
                    desc="Moving from Marketing to Tech? Or Sales to Product? We identify your transferrable skills and map the gap."
                />
                <ServiceCard
                    icon={<Cpu />}
                    title="Skill Upgrades"
                    desc="For professionals staying relevant. Identify the exact tools and frameworks trending in your industry right now."
                />
                <ServiceCard
                    icon={<BarChart />}
                    title="Project Guidance"
                    desc="Don't just watch tutorials. Build real things. We suggest portfolios projects that actually impress recruiters."
                />
                <ServiceCard
                    icon={<Briefcase />}
                    title="Business Strategy"
                    desc="For entrepreneurs. Map out your MVP, validation checks, and go-to-market strategy in a linear timeline."
                />
            </div>
        </div>
    )
}

function ServiceCard({ icon, title, desc }: any) {
    return (
        <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-indigo-500/50 transition-all text-white group">
            <div className="text-indigo-400 w-10 h-10 mb-4 group-hover:scale-110 transition-transform">{icon}</div>
            <h3 className="text-xl font-bold mb-3">{title}</h3>
            <p className="text-gray-400 leading-relaxed font-medium">{desc}</p>
        </div>
    )
}
