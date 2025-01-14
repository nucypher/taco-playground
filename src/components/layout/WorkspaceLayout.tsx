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
    <div className="grid grid-cols-12 gap-4 h-[600px]">
      <div className="col-span-8 bg-white rounded-lg shadow-sm overflow-hidden">
        {workspace}
      </div>
      <div className="col-span-4 bg-white rounded-lg shadow-sm overflow-hidden">
        {preview}
      </div>
    </div>
  );
};

export default WorkspaceLayout; 