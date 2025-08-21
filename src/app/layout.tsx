import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Image from "next/image";
import ParticlesClient from "./components/ParticlesClient";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Domus AI",
  description: "Smarter Real Estate Decisions",
  icons: {
    icon: [
      { url: "/domus.png", sizes: "32x32", type: "image/png" },
      { url: "/domusfav.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/domusfav.png",
    apple: "/domusfav.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* explicit favicons to override defaults (cache-bust with ?v=1) */}
        <link rel="icon" href="/domusfav.png?v=1" sizes="32x32" />
        <link rel="shortcut icon" href="/domusfav.png?v=1" />
        <link rel="apple-touch-icon" href="/domusfav.png?v=1" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className={`${inter.className} bg-black text-white scroll-smooth`}>
        <ParticlesClient />

        <div className="flex flex-col min-h-screen">
          {/* sticky header so banner stays visible on scroll */}
          <header className="sticky top-0 z-50 bg-gray-900/90 backdrop-blur-sm text-white">
            <div className="max-w-6xl mx-auto flex items-center gap-4 p-4">
              <a href="/" className="flex items-center gap-4">
                <Image
                  src="/domus.png"
                  alt="Domus AI"
                  width={48}
                  height={48}
                  className="rounded-md"
                />
                <span className="text-2xl font-bold">Domus AI</span>
              </a>
            </div>
          </header>

          {/* add top padding so page content isn't hidden behind the sticky header */}
          <main className="relative z-10 flex-grow pt-20">{children}</main>

          <footer className="bg-gray-800 text-white p-4 text-center">
            <p>&copy; {new Date().getFullYear()} Domus AI. All rights reserved.</p>
          </footer>
        </div>
      </body>
    </html>
  );
}