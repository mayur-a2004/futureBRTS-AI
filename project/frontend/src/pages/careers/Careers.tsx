import { motion } from "framer-motion"
import { Search, MapPin, Briefcase, DollarSign, Sparkles, Building2 } from "lucide-react"
import { Button } from "@/components/ui/Button"

const jobs = [
    {
        id: 1,
        title: "Frontend Engineer",
        company: "TechFlow",
        location: "Remote",
        type: "Full-time",
        salary: "$80k - $120k",
        match: 92,
        logo: "TF",
        tags: ["React", "TypeScript", "Tailwind"]
    },
    {
        id: 2,
        title: "Junior React Developer",
        company: "StartUp Inc",
        location: "New York, NY",
        type: "Hybrid",
        salary: "$70k - $90k",
        match: 88,
        logo: "S",
        tags: ["React", "JavaScript", "CSS"]
    },
    {
        id: 3,
        title: "Web Developer Intern",
        company: "Creative Agency",
        location: "London, UK",
        type: "Internship",
        salary: "$30k - $40k",
        match: 75,
        logo: "CA",
        tags: ["HTML", "CMS", "Design"]
    }
]

export default function Careers() {
    return (
        <div className="text-white">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">Career Explorer</h1>
                    <p className="text-gray-400">AI-curated opportunities based on your profile.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="border-gray-700">Saved Jobs</Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700">Auto-Apply (Pro)</Button>
                </div>
            </div>

            {/* Search */}
            <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search by role, company, or skills..."
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
            </div>

            {/* Job Grid */}
            <div className="grid gap-4">
                {jobs.map((job, idx) => (
                    <motion.div
                        key={job.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-gray-900/50 border border-gray-800 p-6 rounded-xl hover:bg-gray-900 hover:border-indigo-500/30 transition-all group"
                    >
                        <div className="flex flex-col md:flex-row justify-between gap-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center font-bold text-xl text-gray-400">
                                    {job.logo}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg group-hover:text-indigo-400 transition-colors">{job.title}</h3>
                                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                                        <Building2 className="w-4 h-4" /> {job.company}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {job.tags.map(tag => (
                                            <span key={tag} className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-300 border border-gray-700">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-start md:items-end gap-2 min-w-[140px]">
                                {job.match > 90 && (
                                    <div className="flex items-center gap-1 text-xs font-bold text-indigo-400 bg-indigo-900/20 px-2 py-1 rounded-full mb-2">
                                        <Sparkles className="w-3 h-3" /> {job.match}% Match
                                    </div>
                                )}
                                <div className="text-sm text-gray-400 flex items-center gap-2">
                                    <MapPin className="w-4 h-4" /> {job.location}
                                </div>
                                <div className="text-sm text-gray-400 flex items-center gap-2">
                                    <Briefcase className="w-4 h-4" /> {job.type}
                                </div>
                                <div className="text-sm font-bold text-white flex items-center gap-2 mt-auto">
                                    <DollarSign className="w-4 h-4 text-green-400" /> {job.salary}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-800 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-xs text-gray-500">Posted 2 days ago</span>
                            <div className="flex gap-3">
                                <Button variant="ghost" size="sm" className="hover:text-white">Preview</Button>
                                <Button size="sm" className="bg-white text-black hover:bg-gray-200">Apply Now</Button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
