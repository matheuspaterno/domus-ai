import WaitlistSignup from './components/WaitlistSignup'
import AISection from './components/AISection'
import Image from 'next/image'
// import Roadmap from './components/Roadmap'

export default function Home() {
  return (
    <div className="relative z-10 max-w-6xl mx-auto px-6 py-24">
      {/* Hero Section */}
      <section className="mb-16 text-center">
        <div className="flex justify-center">
          <div className="mx-auto w-40 sm:w-56 md:w-72 lg:w-96 xl:w-[28rem]">
            <Image
              src="/Domus%20AI%20logo.png"
              alt="Domus AI logo"
              width={800}
              height={200}
              priority
              sizes="(max-width: 640px) 160px, (max-width: 768px) 224px, (max-width: 1024px) 288px, (max-width: 1280px) 384px, 448px"
              style={{ width: '100%', height: 'auto' }}
            />
          </div>
        </div>
        <p className="mt-6 text-lg sm:text-xl hero-sub max-w-3xl mx-auto">
          Powerful real estate insights, connecting you with the right real estate agent.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <a href="#waitlist" className="btn-primary">Contact an Agent</a>
        </div>
      </section>

  {/* About (glass) */}
  <div className="ai-container mt-[15px] mb-12">
        <section className="glass-card p-10">
          <h2 className="text-3xl font-semibold mb-4 text-white"></h2>
          <p className="text-gray-300 leading-relaxed">
            Domus AI builds the future of real estate research and automation. Whether you're a seller,
            investor, or a first time homebuyer. Domus delivers AI-powered insights to help you make smarter decisions,
            and instantly connect you with trusted real estate professionals tailored to you.
          </p>
        </section>
      </div>

      {/* Interact with Domus (AI tools) */}
      <div className="ai-container mb-12">
        <section className="glass-card p-10">
          <h2 className="text-3xl font-semibold mb-4 text-white">Interact with Domus</h2>
          <p className="text-gray-300 leading-relaxed mb-6">Ask Domus questions, analyze properties, or get quick market snapshots — Not Financial Advice.</p>
          <AISection />
        </section>
      </div>

     
      {/** Roadmap banner commented out for lead-gen focus
      <div className="ai-container mb-12">
        <section id="roadmap" className="glass-card p-10">
          <h2 className="text-3xl font-semibold mb-6 text-white">Roadmap</h2>
          <Roadmap />
        </section>
      </div>
      */}
      {/* Waitlist Section */}
      <section id="waitlist" className="mt-8">
        <div className="ai-container mb-8">
          
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
