'use client';

import React, { useState, useEffect } from 'react';
import ConditionValidator from './ConditionValidator';
import { TacoCondition } from '../../types/taco';

interface JsonPreviewProps {
  condition: TacoCondition | null;
}

const JsonPreview: React.FC<JsonPreviewProps> = ({ condition }) => {
  const [copied, setCopied] = useState(false);
  const formattedJson = condition ? JSON.stringify(condition, null, 2) : '';

  useEffect(() => {
    console.log('JsonPreview received condition:', condition);
    console.log('Formatted JSON:', formattedJson);
  }, [condition, formattedJson]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(formattedJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
  };

  return (
    <div className="h-full flex flex-col bg-black">
      <div className="border-b border-white/5 px-3 py-3">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="text-sm font-medium text-white tracking-wide uppercase">JSON Preview</h3>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 font-mono text-sm">
        <pre className="text-white/80">
          {condition ? JSON.stringify(condition, null, 2) : 'No condition defined'}
        </pre>
      </div>
    </div>
  );
};

export default JsonPreview; 