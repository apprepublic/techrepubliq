import { Inter, Inter_Tight, JetBrains_Mono } from "next/font/google";
import { MotionProvider } from "@/components/MotionProvider";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import type { Metadata } from "next";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500"],
  display: "swap",
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  weight: ["600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TechRepubliQ — Software Development & AI Automation Agency",
  description:
    "Describe what you need, receive an AI-assisted quote, and get your project delivered. Premium software development and AI automation services.",
  icons: {
    icon: "/favicon.png",
    apple: "/assets/logo-light.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${interTight.variable} ${jetbrainsMono.variable} font-body bg-paper text-ink antialiased`}
      >
        <MotionProvider>
          <Nav />
          <main className="min-h-screen pt-20">{children}</main>
          <Footer />
        </MotionProvider>
      </body>
    </html>
  );
}