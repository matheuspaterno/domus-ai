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
        {/* reCAPTCHA v3 */}
        <script
          dangerouslySetInnerHTML={{ __html: `window.__grecaptchaOnLoad = function(){}` }}
        />
        <script async defer src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}&onload=__grecaptchaOnLoad`}></script>
        <ParticlesClient />
        <div className="flex flex-col min-h-screen">
          <header className="fixed top-0 left-0 right-0 w-full z-50 bg-gray-900/80 backdrop-blur-md text-white/6">
            <div className="max-w-6xl w-full mx-auto flex items-center gap-4 p-4">
              <a href="/" aria-label="Domus AI Home" className="flex items-center gap-4">
                <div className="relative h-10 sm:h-12 md:h-14 w-44 sm:w-56 md:w-64">
                  <Image
                    src="/Domus%20AI%20logo.png"
                    alt="Domus AI logo"
                    fill
                    sizes="(max-width: 640px) 176px, (max-width: 768px) 224px, 256px"
                    className="object-contain"
                    priority
                  />
                </div>
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