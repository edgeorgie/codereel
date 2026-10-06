import type { Metadata } from "next";
import { Inter_Tight, JetBrains_Mono, Unbounded } from "next/font/google";
import "./globals.css";

const display = Unbounded({ variable: "--font-display", subsets: ["latin"] });
const body = Inter_Tight({ variable: "--font-body", subsets: ["latin"] });
const mono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "codereel",
  description: "Turn code into short animated videos in your browser. 16:9, 9:16, 1:1 and 4:5.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
