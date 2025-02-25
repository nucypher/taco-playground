import './globals.css';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'TACo Playground',
  description: 'Build and test threshold access control conditions',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_PATH 
      ? `https://${process.env.VERCEL_URL}${process.env.NEXT_PUBLIC_BASE_PATH}`
      : `https://${process.env.VERCEL_URL || 'localhost:3000'}`
  ),
  icons: [
    {
      rel: 'icon',
      url: '/TACo-logo.avif',
      type: 'image/avif'
    },
    {
      rel: 'icon',
      url: '/favicon.ico'
    }
  ]
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" className="bg-gray-950">
      <body className={`${inter.className} bg-gray-950`}>
        {children}
      </body>
    </html>
  );
}
