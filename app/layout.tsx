import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mark Aston | Voice Over Actor | SAG-AFTRA",
  description:
    "The Voice of Mark Aston. SAG-AFTRA voice over talent based in Atlanta, GA. Commercial, narration, character, and broadcast voice work for CBS, Disney, Coca-Cola, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
