import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found | SmartNest",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "0 24px",
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 9,
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: "2.4px",
          color: "var(--muted)",
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "var(--green)",
            boxShadow: "0 0 13px #1687ff80",
          }}
        />
        ERROR 404
      </span>

      <h1
        style={{
          font: '500 clamp(38px, 6vw, 68px)/1.12 var(--font-heading)',
          letterSpacing: "-3px",
          margin: "24px 0 16px",
        }}
      >
        This page isn&apos;t
        <br />
        <span style={{ color: "var(--green)" }}>connected yet.</span>
      </h1>

      <p style={{ color: "var(--muted)", maxWidth: 460, lineHeight: 1.7 }}>
        The page you were looking for doesn&apos;t exist or may have moved.
        Let&apos;s get you back to something useful.
      </p>

      <Link
        href="/"
        style={{
          marginTop: 32,
          display: "inline-flex",
          alignItems: "center",
          gap: 9,
          padding: "14px 22px",
          border: "1px solid #1687ff69",
          borderRadius: 3,
          color: "var(--green)",
          fontWeight: 600,
        }}
      >
        Back to SmartNest home ↗
      </Link>
    </main>
  );
}
