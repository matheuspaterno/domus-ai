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
    icon: "/domusfav.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black text-white scroll-smooth`}>
        <ParticlesClient />
        <div className="flex flex-col min-h-screen">
          <header className="fixed top-0 left-0 right-0 w-full z-50 bg-gray-900/80 backdrop-blur-md text-white/6">
            <div className="max-w-6xl w-full mx-auto flex items-center gap-4 p-4">
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

          <main className="relative z-10 flex-grow pt-24">{children}</main>

          <footer className="bg-gray-800 text-white p-4 text-center">
            <p>&copy; {new Date().getFullYear()} Domus AI. All rights reserved.</p>
          </footer>
        </div>
      </body>
    </html>
  );
}