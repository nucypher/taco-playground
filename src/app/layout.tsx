import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TACo Playground",
  description: "Build and test Threshold Access Control conditions",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_PATH 
      ? `https://${process.env.VERCEL_URL}${process.env.NEXT_PUBLIC_BASE_PATH}`
      : `https://${process.env.VERCEL_URL || 'localhost:3000'}`
  ),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-gray-950">
      <body className={`${inter.className} bg-gray-950`}>
        {children}
      </body>
    </html>
  );
}
