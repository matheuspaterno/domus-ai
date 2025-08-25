import WaitlistSignup from './components/WaitlistSignup'
import AISection from './components/AISection'

export default function Home() {
  return (
    <div className="relative z-10 max-w-6xl mx-auto px-6 py-24">
      {/* Hero Section */}
      <section className="mb-16 text-center">
        <h1 className="text-6xl sm:text-7xl font-extrabold tracking-tight leading-tight hero-title">
          Domus AI
        </h1>
        <p className="mt-6 text-lg sm:text-xl hero-sub max-w-3xl mx-auto">
          Powerful real estate insights, intelligent automation, and research.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <a href="#waitlist" className="btn-primary">Contact an Agent</a>
        </div>
      </section>

  {/* About (glass) */}
  <div className="ai-container mt-[15px] mb-12">
        <section className="glass-card p-10">
          <h2 className="text-3xl font-semibold mb-4 text-white">About</h2>
          <p className="text-gray-300 leading-relaxed">
            Domus AI builds the future of real estate research and automation. Whether you're an agent,
            investor, or homeowner, Domus delivers AI-powered insights to help you make smarter decisions, 
            from neighborhood trends to lead discovery and lien alerts.
          </p>
        </section>
      </div>

      {/* Interact with Domus (AI tools) */}
      <div className="ai-container mb-12">
        <section className="glass-card p-10">
          <h2 className="text-3xl font-semibold mb-4 text-white">Interact with Domus</h2>
          <p className="text-gray-300 leading-relaxed mb-6">Ask Domus questions, analyze properties, or get quick market snapshots — all powered by AI.</p>
          <AISection />
        </section>
      </div>

      {/* Upcoming Features */}
      <div className="ai-container mb-12">
        <section id="features" className="glass-card p-10">
          <h2 className="text-3xl font-semibold mb-6 text-white">Upcoming Features</h2>

          <ul className="list-disc list-inside text-gray-300 space-y-[10px] text-left max-w-2xl">
            <li>MLS data lookup and title / lien alerts</li>
            <li>Investor growth scores based on real-world trends</li>
            <li>AI-powered property research and lead scraping</li>
            <li>Tokenized access, real estate NFTs, and clean title verification</li>
          </ul>

        </section>
      </div>
      {/* Waitlist Section */}
      <section id="waitlist" className="mt-8">
        <div className="ai-container mb-8">
          <section className="glass-card p-6">
            <p className="text-gray-300 mb-0">
              Follow the Domus AI agent on Twitter for the latest real estate insights. You can also ask Domus
              questions by tagging it on posts — it will automatically reply in a few minutes —{' '}
              <a
                href="https://twitter.com/Domus_AI"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline"
              >
                @Domus_AI
              </a>
            </p>
          </section>
        </div>

  <div className="ai-container mt-[15px] mb-8">
        <h2 className="text-3xl font-bold mb-4 text-center text-white">Contact a Real Estate Agent</h2>
        <p className="text-center text-gray-300 mb-6">
          We will send you an email asking for your details, compile your preferences, and use Domus AI to find the Real Estate Agent that fits you best in your area.
        </p>
      </div>

      <div className="ai-container">
        <div className="flex justify-center">
          <div className="w-full">
            <WaitlistSignup />
          </div>
        </div>
      </div>
      </section>
    </div>
  );
}
