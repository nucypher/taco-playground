'use client';

import React, { useState } from 'react';
import ConditionValidator from './ConditionValidator';

interface JsonPreviewProps {
  condition: any;
}

const JsonPreview: React.FC<JsonPreviewProps> = ({ condition }) => {
  const [copied, setCopied] = useState(false);
  const formattedJson = condition ? JSON.stringify(condition, null, 2) : '';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(formattedJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
  };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-gray-900 flex-1 overflow-hidden flex flex-col">
        <div className="flex justify-between items-center px-4 py-2 bg-gray-800">
          <h3 className="text-white text-sm font-medium">Condition JSON</h3>
          <div className="flex items-center gap-4">
            <ConditionValidator condition={condition} />
            <button
              onClick={handleCopy}
              className={`
                px-2 py-1 rounded text-xs transition-all duration-200
                flex items-center gap-1.5
                ${copied 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
                }
              `}
            >
              {copied ? (
                <>
                  <svg 
                    className="w-3 h-3" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M5 13l4 4L19 7" 
                    />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg 
                    className="w-3 h-3" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" 
                    />
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>
        </div>
        <div className="p-4 flex-1 overflow-auto">
          <pre className="text-green-400 text-sm font-mono">
            {formattedJson || '// Drag blocks to generate condition JSON'}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default JsonPreview; 