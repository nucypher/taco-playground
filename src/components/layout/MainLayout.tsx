'use client';

import React from 'react';
import BlockSidebar from '../blocks/BlockSidebar';
import Header from './Header';

interface MainLayoutProps {
  children: React.ReactNode;
  onOpenSettings: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, onOpenSettings }) => {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      {/* Full-width Header */}
      <Header variant="playground" onOpenSettings={onOpenSettings} />

      {/* Content Area with Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-96 border-r border-white/10 bg-black h-full">
          <BlockSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <main className="px-3 pt-2 pb-3 bg-black w-full min-h-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout; 