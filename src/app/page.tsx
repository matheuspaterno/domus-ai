import WaitlistSignup from './components/WaitlistSignup'
import AISection from './components/AISection'

export default function Home() {
  return (
    <div className="relative z-10 max-w-5xl mx-auto px-6 py-24">
      {/* Hero Section */}
      <section className="mb-16 text-center">
        <h1 className="text-6xl sm:text-7xl font-extrabold tracking-tight leading-tight bg-gradient-to-r from-white via-gray-300 to-gray-200 bg-clip-text text-transparent">
          Domus AI
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
          Powerful real estate insights, intelligent automation, and research — instantly.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <a
            href="#features"
            className="inline-block rounded-lg bg-white/10 hover:bg-white/20 border border-white/6 px-5 py-3 text-sm font-medium text-white transition"
          >
            Explore Features
          </a>
          <a
            href="#waitlist"
            className="inline-block rounded-lg bg-blue-600 hover:bg-blue-700 px-5 py-3 text-sm font-medium text-white transition"
          >
            Join Waitlist
          </a>
        </div>
      </section>

      {/* About (glass) */}
      <section className="max-w-full mb-12 w-full bg-white/3 backdrop-blur-md border border-white/6 rounded-xl p-10">
        <h2 className="text-3xl font-semibold mb-4 text-white">About</h2>
        <p className="text-gray-300 leading-relaxed">
          Domus AI builds the future of real estate research and automation. Whether you're an agent,
          investor, or homeowner, Domus delivers AI-powered insights to help you make smarter decisions —
          from neighborhood trends to lead discovery and lien alerts.
        </p>
      </section>

      {/* AI tools (client) */}
      <div className="w-full mb-12">
        <AISection />
      </div>

      {/* Upcoming Features */}
      <section id="features" className="max-w-full mb-12 w-full bg-white/3 backdrop-blur-md border border-white/6 rounded-xl p-10">
        <h2 className="text-3xl font-semibold mb-6 text-white">Upcoming Features</h2>

        <ul className="list-disc list-inside text-gray-300 space-y-3 text-left max-w-2xl">
          <li>MLS data lookup and title / lien alerts</li>
          <li>Investor growth scores based on real-world trends</li>
          <li>AI-powered property research and lead scraping</li>
          <li>Tokenized access, real estate NFTs, and clean title verification</li>
        </ul>

        {/* Twitter AI agent (separate block) */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-gray-300">
            Make sure to check the Domus AI agent on Twitter for the latest analysis —
            <a
              href="https://twitter.com/Domus_AI"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-blue-400 underline"
            >
              @Domus_AI
            </a>
          </p>
          <a
            href="https://twitter.com/Domus_AI"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-md bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm font-medium text-white"
          >
            Visit the Agent on Twitter
          </a>
        </div>
      </section>

      {/* Waitlist Section */}
      <section id="waitlist" className="mt-8">
        <h2 className="text-3xl font-bold mb-4 text-center text-white">Join the Waitlist</h2>
        <p className="text-center text-gray-300 mb-6 max-w-2xl mx-auto">
          Be the first to access Domus AI Beta and explore smarter real estate research.
        </p>
        <div className="flex justify-center">
          <div className="w-full max-w-xl">
            <WaitlistSignup />
          </div>
        </div>
      </section>
    </div>
  );
}
