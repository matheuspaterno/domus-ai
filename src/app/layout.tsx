import "./globals.css";
import { Inter } from "next/font/google";
import ParticlesBackground from "./components/ParticlesBackground";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Domus AI",
  description: "Real estate analytics powered by AI",
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
