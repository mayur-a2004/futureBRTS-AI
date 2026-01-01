export default function Privacy() {
    return (
        <div className="py-24 px-6 max-w-3xl mx-auto text-white">
            <h1 className="text-4xl font-black mb-2">Privacy Policy</h1>
            <p className="text-gray-500 font-mono text-sm mb-12 uppercase tracking-wider">Last Updated: December 25, 2025</p>

            <div className="space-y-12 text-gray-300 leading-relaxed">
                <section className="space-y-4">
                    <p className="text-lg font-medium text-white">
                        At FutureBuilder, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your information when you use our roadmap building services.
                    </p>
                </section>

                <section className="space-y-4">
                    <h3 className="text-xl font-bold text-white border-b border-white/10 pb-4 mb-4">1. Information We Collect</h3>
                    <p>We strictly collect only the information necessary to generate your career roadmap:</p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-400">
                        <li><strong>Account Information:</strong> Name, email address, and password.</li>
                        <li><strong>Profile Data:</strong> Current skills, educational background, and career goals.</li>
                        <li><strong>Usage Data:</strong> How you interact with your generated roadmaps and tasks.</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h3 className="text-xl font-bold text-white border-b border-white/10 pb-4 mb-4">2. How We Use Your Data</h3>
                    <p>Your data is used solely for the following purposes:</p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-400">
                        <li>To generate and personalize your learning path using our intelligence engine.</li>
                        <li>To track your progress and adjust recommendations.</li>
                        <li>To communicate with you regarding account updates.</li>
                    </ul>
                    <p className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-300 text-sm font-medium mt-4">
                        We do not sell your personal data to third parties, advertisers, or data brokers.
                    </p>
                </section>

                <section className="space-y-4">
                    <h3 className="text-xl font-bold text-white border-b border-white/10 pb-4 mb-4">3. Data Security</h3>
                    <p>
                        We implement industry-standard encryption (AES-256) and security measures to protect your account information.
                        Our database is hosted in secure, isolated environments.
                    </p>
                </section>

                <section className="space-y-4">
                    <h3 className="text-xl font-bold text-white border-b border-white/10 pb-4 mb-4">4. Your Rights</h3>
                    <p>You have the right to request access to your data, request corrections, or request complete deletion of your account and associated data. You can exercise these rights at any time via your settings dashboard.</p>
                </section>

                <section className="space-y-4">
                    <h3 className="text-xl font-bold text-white border-b border-white/10 pb-4 mb-4">5. Contact Us</h3>
                    <p>If you have questions about this policy, please contact <a href="mailto:privacy@futurebuilder.com" className="text-indigo-400 hover:underline">privacy@futurebuilder.com</a>.</p>
                </section>
            </div>
        </div>
    )
}
