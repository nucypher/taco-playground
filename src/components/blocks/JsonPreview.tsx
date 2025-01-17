'use client';

import React from 'react';
import ConditionValidator from './ConditionValidator';

interface JsonPreviewProps {
  condition: any;
}

const JsonPreview: React.FC<JsonPreviewProps> = ({ condition }) => {
  const formattedJson = condition ? JSON.stringify(condition, null, 2) : '';

  return (
    <div className="h-full flex flex-col">
      <div className="bg-gray-900 flex-1 overflow-hidden flex flex-col">
        <div className="flex justify-between items-center px-4 py-2 bg-gray-800">
          <h3 className="text-white text-sm font-medium">Condition JSON</h3>
          <div className="flex items-center gap-4">
            <ConditionValidator condition={condition} />
            <button
              onClick={() => navigator.clipboard.writeText(formattedJson)}
              className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded transition-colors"
            >
              Copy
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