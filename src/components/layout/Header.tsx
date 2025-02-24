import React from 'react';
import Link from 'next/link';
import WalletButton from '../WalletButton';
import { ethers } from 'ethers';

interface HeaderProps {
  variant?: 'playground' | 'decrypt';
}

const Header: React.FC<HeaderProps> = ({ variant = 'playground' }) => {
  const handleConnect = (provider: ethers.providers.Web3Provider) => {
    console.log('Connected to wallet', provider);
  };

  return (
    <header className="bg-black border-b border-white/10 px-4 py-3">
      <div className="max-w-[1600px] mx-auto flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            {variant === 'playground' ? 'TACo Playground' : 'TACo Decryption'}
          </h1>
          {variant === 'playground' && (
            <p className="text-sm text-white/60">
              Build and test threshold access control conditions
            </p>
          )}
        </div>
        <div className="flex items-center gap-4">
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