'use client';

import React from 'react';
import BlockSidebar from '../blocks/BlockSidebar';
import WalletButton from '../WalletButton';
import { ethers } from 'ethers';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const handleConnect = (provider: ethers.providers.Web3Provider) => {
    console.log('Connected to wallet', provider);
  };

  return (
    <div className="min-h-screen flex bg-black">
      {/* Fixed Sidebar */}
      <div className="w-96 fixed left-0 top-0 h-screen border-r border-white/10 bg-black">
        <BlockSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-96">
        {/* Header */}
        <header className="bg-black border-b border-white/10 px-4 py-3">
          <div className="max-w-[1600px] mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">TACo Playground</h1>
              <p className="text-sm text-white/60">
                Build and test threshold access control conditions
              </p>
            </div>
            <WalletButton onConnect={handleConnect} />
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-4 bg-black">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout; 