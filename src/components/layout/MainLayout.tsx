'use client';

import React from 'react';
import BlockSidebar from '../blocks/BlockSidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex">
      {/* Fixed Sidebar - increased to w-96 (384px) */}
      <div className="w-96 fixed left-0 top-0 h-screen border-r border-gray-200 bg-white">
        <BlockSidebar />
      </div>

      {/* Main Content - adjusted margin to ml-96 */}
      <div className="flex-1 ml-96">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="max-w-[1600px] mx-auto">
            <h1 className="text-xl font-bold text-gray-900">TACo Playground</h1>
            <p className="text-sm text-gray-600">
              Build and test threshold access control conditions
            </p>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout; 