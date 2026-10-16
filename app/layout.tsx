import type { Metadata } from "next";
import { DM_Sans, Manrope } from "next/font/google";
import "./globals.css";

/**
 * Fonts are self-hosted at build time by next/font — no request to
 * fonts.googleapis.com at runtime. This removes a render-blocking
 * stylesheet, eliminates the flash of unstyled text, and means the
 * site renders identically even if Google Fonts is slow or blocked.
 */
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

// REPLACE with your real domain once the site is live, e.g.
// metadataBase: new URL("https://smartnest.in")
const siteUrl = "https://smartnest.example";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "SmartNest | Intelligent Living, Beautifully Connected",
  description:
    "Discover premium KNX smart home automation with SmartNest. Thoughtfully integrated lighting, climate, curtains and security for modern living.",
  applicationName: "SmartNest",
  keywords: [
    "KNX",
    "smart home",
    "home automation",
    "smart villa",
    "lighting control",
    "home automation Chennai",
    "KNX integrator India",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "SmartNest",
    title: "SmartNest | Intelligent Living, Beautifully Connected",
    description:
      "Premium KNX smart home automation — lighting, climate, curtains and security, thoughtfully integrated.",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "SmartNest | Intelligent Living, Beautifully Connected",
    description:
      "Premium KNX smart home automation — lighting, climate, curtains and security, thoughtfully integrated.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${manrope.variable}`}>
      <body>
        {/* Safety net: `motion` renders entrance animations with an inline
            opacity:0 start state. If JavaScript never runs, those blocks would
            stay invisible. This forces them visible for no-JS visitors. */}
        <noscript>
          <style>{`[style*="opacity:0"], [style*="opacity: 0"]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
