import WaitlistSignup from './components/WaitlistSignup'
export default function Home() {
  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-16 text-center">
      {/* Hero Section */}
      <section className="mb-20">
        <h1 className="text-5xl font-bold sm:text-6xl">Domus AI</h1>
        <p className="mt-4 text-lg sm:text-xl max-w-2xl">
          Powerful real estate insights, intelligent automation, and research at your fingertips.
        </p>
        
      </section>

      {/* About Section */}
      <section className="max-w-3xl mb-20">
        <h2 className="text-3xl font-semibold mb-4">About</h2>
        <p className="text-gray-300">
          Domus AI is building the future of real estate research and automation. Whether you're an agent, investor, or curious homeowner,
          Domus delivers AI-powered insights to help you make smarter decisions. From neighborhood trends to lead discovery and lien alerts,
          we combine data and automation in one intelligent platform.
        </p>
      </section>

      {/* Upcoming Features Section */}
      <section className="max-w-3xl mb-20">
        <h2 className="text-3xl font-semibold mb-4">Upcoming Features</h2>
        <ul className="list-disc list-inside text-gray-300 space-y-2 text-left">
          <li>MLS data lookups and title/lien alerts</li>
          <li>Investor growth scores based on real-world trends</li>
          <li>AI-powered property research and lead scraping</li>
          <li>Twitter-based real estate assistant</li>
          <li>Tokenized access, real estate NFTs, and clean title verification</li>
        </ul>
      </section>
      {/* Waitlist Section */}
      <section className="mt-20">
  <h2 className="text-3xl font-bold mb-4 text-center">Join the Waitlist</h2>
  <p className="text-center text-gray-300 mb-6">
    Be the first to access Domus AI Beta and explore the future of real estate research.
  </p>
  <WaitlistSignup />
</section>



    </div>
  );
}
