'use client';

import dynamic from 'next/dynamic';

// Use dynamic import to avoid hydration issues with Web3 components
const TacoPlayground = dynamic(
  () => import('../components/TacoPlayground'),
  { ssr: false }
);

export default function Home() {
  return <TacoPlayground />;
}
