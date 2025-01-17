'use client';

import React from 'react';
import BlockSidebar from '../blocks/BlockSidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex bg-gray-950">
      {/* Fixed Sidebar - now with dark border */}
      <div className="w-96 fixed left-0 top-0 h-screen border-r border-gray-700 bg-gray-900">
        <BlockSidebar />
      </div>

      {/* Main Content - adjusted margin to ml-96 */}
      <div className="flex-1 ml-96">
        {/* Header - now dark */}
        <header className="bg-gray-900 border-b border-gray-700 px-4 py-3">
          <div className="max-w-[1600px] mx-auto">
            <h1 className="text-xl font-bold text-gray-100">TACo Playground</h1>
            <p className="text-sm text-gray-400">
              Build and test threshold access control conditions
            </p>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-4 bg-gray-950">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout; 