'use client';

import React from 'react';

interface WorkspaceLayoutProps {
  workspace: React.ReactNode;
  preview: React.ReactNode;
}

const WorkspaceLayout: React.FC<WorkspaceLayoutProps> = ({ 
  workspace, 
  preview 
}) => {
  return (
    <div className="grid grid-cols-12 gap-2 min-h-[calc(100vh-200px)]">
      <div className="col-span-7 bg-white/[0.02] rounded-lg border border-white/10 overflow-auto flex flex-col
        shadow-xl shadow-black/20 backdrop-blur-sm">
        {workspace}
      </div>
      <div className="col-span-5 bg-white/[0.02] rounded-lg border border-white/10 overflow-auto
        shadow-xl shadow-black/20 backdrop-blur-sm">
        {preview}
      </div>
    </div>
  );
};

export default WorkspaceLayout; 