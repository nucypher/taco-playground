'use client';

import React, { useState } from 'react';
import { TacoCondition } from '../../types/taco';

interface JsonPreviewProps {
  condition: TacoCondition | null;
}

const JsonPreview: React.FC<JsonPreviewProps> = ({ condition }) => {
  const [copySuccess, setCopySuccess] = useState(false);

  // Format the JSON for display
  const formattedJson = condition ? JSON.stringify(condition, null, 2) : '';

  const handleCopy = async () => {
    if (!formattedJson) return;
    
    try {
      await navigator.clipboard.writeText(formattedJson);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center border-b border-white/10 px-6 py-4 bg-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/5 rounded-lg border border-white/10">
            <svg className="w-5 h-5 text-taco" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-white tracking-wide uppercase">JSON Preview</h3>
        </div>
        {copySuccess && (
          <div className="text-xs text-taco flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Copied!</span>
          </div>
        )}
      </div>
      <div className="flex-1 overflow-auto p-4 bg-black/30 relative group">
        {condition ? (
          <>
            <pre className="text-white/70 text-sm font-mono whitespace-pre-wrap">
              {formattedJson}
            </pre>
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 p-2 text-white/40 hover:text-white/80
                hover:bg-white/10 rounded-lg transition-all duration-200
                opacity-0 group-hover:opacity-100"
              title="Copy to clipboard"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
            </button>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-white/40 text-sm">
              No condition created yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JsonPreview; 