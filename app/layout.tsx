import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SmartNest | Intelligent Living, Beautifully Connected",
  description:
    "Discover premium KNX smart home automation with SmartNest. Thoughtfully integrated lighting, climate, curtains and security for modern living.",
  applicationName: "SmartNest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
