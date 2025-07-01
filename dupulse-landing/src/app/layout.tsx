import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "DUPulse Early Access",
  description: "Durham's Student Life, One Pulse Away.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#F5F5F5" />
      </head>
      <body className={inter.variable} style={{ background: '#F5F5F5' }}>
        {children}
      </body>
    </html>
  );
}
