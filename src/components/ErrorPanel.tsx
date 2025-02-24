import React from 'react';

interface ErrorPanelProps {
  error: string | null;
  onClear?: () => void;
}

interface ParsedErrorItem {
  message: string;
  code: string | number;
  path: string[];
}

const ErrorPanel: React.FC<ErrorPanelProps> = ({ error, onClear }) => {
  if (!error) return null;

  // Try to parse the error if it's a JSON string
  let parsedError = error;
  try {
    if (error.includes('[{')) {
      const errorObj = JSON.parse(error.substring(error.indexOf('['))) as ParsedErrorItem[];
      parsedError = errorObj.map(err => (
        `${err.message} (${err.code}) at ${err.path.join('.')}`
      )).join('\n');
    }
  } catch (e) {
    // If parsing fails, use the original error message
    console.log('Error parsing error message:', e);
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-red-500/10 p-4">
      <div className="max-w-[1600px] mx-auto">
        <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <svg 
                className="w-5 h-5 text-red-400 mt-0.5" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
              <h3 className="text-sm font-medium text-red-400">Error</h3>
            </div>
            {onClear && (
              <button
                onClick={onClear}
                className="text-red-400 hover:text-red-300 transition-colors duration-200"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <pre className="mt-2 text-sm font-mono text-red-400 whitespace-pre-wrap break-all">
            {parsedError}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default ErrorPanel; 