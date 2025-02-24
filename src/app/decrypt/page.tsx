'use client';

import dynamic from 'next/dynamic';

// Use dynamic import to avoid hydration issues with Web3 components
const DecryptPage = dynamic(
  () => import('../../components/DecryptPage'),
  { ssr: false }
);

export default function Decrypt() {
  return <DecryptPage />;
} 