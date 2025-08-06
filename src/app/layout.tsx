import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ParticlesBackground from "./components/ParticlesBackground";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Domus AI",
  description: "Smarter Real Estate Decisions",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black text-white`}>
        <ParticlesBackground />
        <main className="relative z-10">{children}</main>
      </body>
    </html>
  );
}
