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
    <div className="grid grid-cols-12 gap-4 min-h-[600px]">
      <div className="col-span-8 bg-white/[0.02] rounded-lg border border-white/10 overflow-hidden flex flex-col
        shadow-xl shadow-black/20 backdrop-blur-sm">
        {workspace}
      </div>
      <div className="col-span-4 bg-white/[0.02] rounded-lg border border-white/10 overflow-hidden
        shadow-xl shadow-black/20 backdrop-blur-sm">
        {preview}
      </div>
    </div>
  );
};

export default WorkspaceLayout; 