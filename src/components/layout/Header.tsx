import React from 'react';
import Link from 'next/link';
import WalletButton from '../WalletButton';
import { ethers } from 'ethers';
import Image from 'next/image';

interface HeaderProps {
  variant?: 'playground' | 'decrypt';
  onOpenSettings?: () => void;
}

const Header: React.FC<HeaderProps> = ({ variant = 'playground', onOpenSettings }) => {
  const handleConnect = (provider: ethers.providers.Web3Provider) => {
    console.log('Connected to wallet', provider);
  };

  return (
    <header className="bg-black border-b border-white/10">
      <div className="flex justify-between items-center px-6 py-3">
        <div className="flex items-center gap-4">
          <Image
            src="/TACo-logo.avif"
            alt="TACo Logo"
            width={32}
            height={32}
            className="rounded"
          />
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              {variant === 'playground' ? 'TACo Playground' : 'TACo Decryption'}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {variant === 'playground' && (
            <button
              onClick={onOpenSettings}
              className="p-2 text-white/60 hover:text-white/80 transition-colors rounded-lg
                hover:bg-white/5 focus:outline-none focus:ring-1 focus:ring-white/10"
              aria-label="Open settings"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          )}
          {variant === 'playground' ? (
            <Link 
              href="/decrypt"
              className="px-4 py-2 bg-white/5 text-white rounded-lg text-sm font-medium
                border border-white/5 transition-all duration-200
                hover:bg-white/10 hover:border-white/10
                focus:outline-none focus:ring-1 focus:ring-white/10"
            >
              Decrypt Only
            </Link>
          ) : (
            <Link 
              href="/"
              className="px-4 py-2 bg-white/5 text-white rounded-lg text-sm font-medium
                border border-white/5 transition-all duration-200
                hover:bg-white/10 hover:border-white/10
                focus:outline-none focus:ring-1 focus:ring-white/10"
            >
              Go to Playground
            </Link>
          )}
          <WalletButton onConnect={handleConnect} />
        </div>
      </div>
    </header>
  );
};

export default Header; 