import { MotionProvider } from "@/components/MotionProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TechRepubliQ — Built by humans. Priced once.",
  description:
    "A build-and-launch platform. Describe your project, get one upfront price, and a human team designs, builds, and launches it. No tokens mid-build.",
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;600;700&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const saved = localStorage.getItem('techrepubliq-theme');
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  const theme = saved || (prefersDark ? 'dark' : 'light');
                  document.documentElement.setAttribute('data-theme', theme);
                  document.documentElement.classList.add(theme);
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <ThemeProvider>
          <MotionProvider>
            <Nav />
            <main className="min-h-screen pt-20">{children}</main>
            <Footer />
          </MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
