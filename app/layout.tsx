import type { Metadata } from "next";
import "./fonts.css";

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
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "SmartNest — intelligent KNX smart home automation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SmartNest | Intelligent Living, Beautifully Connected",
    description:
      "Premium KNX smart home automation — lighting, climate, curtains and security, thoughtfully integrated.",
    images: ["/og-image.jpg"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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
