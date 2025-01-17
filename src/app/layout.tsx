import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TACo Playground",
  description: "Build and test threshold access control conditions",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="bg-gray-950">
      <body className={`${inter.className} bg-gray-950`}>
        {children}
      </body>
    </html>
  );
}
