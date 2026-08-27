import type { Metadata } from "next";
import { Geist_Mono, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const notoSansJp = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AgniDrishti | AI Industrial Fire Detection & Thermal Intelligence",
  description:
    "Next-generation geospatial operational intelligence platform for industrial thermal anomaly classification, flare detection, and explainable AI insights.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${notoSansJp.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col bg-background text-foreground"
        style={{
          fontFamily:
            '"Yu Gothic Medium", "Yu Gothic", var(--font-noto-sans-jp), "Noto Sans JP", "Hiragino Kaku Gothic ProN", sans-serif',
        }}
      >
        {children}
      </body>
    </html>
  );
}
