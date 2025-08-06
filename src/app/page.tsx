export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-5xl font-bold sm:text-6xl tracking-tight mb-6">
        Domus AI
      </h1>
      <p className="text-lg sm:text-xl max-w-2xl text-center mb-8">
        Powerful real estate insights, intelligent automation, and research at your fingertips.
      </p>
      <div className="flex gap-4 flex-wrap justify-center">
        <a
          href="https://vercel.com"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200"
        >
          Get Started
        </a>
        <a
          href="#"
          className="px-6 py-3 border border-white rounded-lg font-semibold hover:bg-white hover:text-black"
        >
          Learn More
        </a>
      </div>
    </main>
  );
}
