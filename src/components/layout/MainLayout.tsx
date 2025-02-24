'use client';

import React from 'react';
import Link from 'next/link';
import BlockSidebar from '../blocks/BlockSidebar';
import WalletButton from '../WalletButton';
import { ethers } from 'ethers';
import Header from './Header';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const handleConnect = (provider: ethers.providers.Web3Provider) => {
    console.log('Connected to wallet', provider);
  };

  return (
    <div className="min-h-screen flex flex-col bg-black">
      {/* Full-width Header */}
      <Header variant="playground" />

      {/* Content Area with Sidebar */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-96 border-r border-white/10 bg-black">
          <BlockSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <main className="p-4 bg-black">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout; 