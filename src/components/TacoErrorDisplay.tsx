import React from 'react';
import { parseTacoDecryptionError } from '../utils/errorParser';

interface TacoErrorDisplayProps {
  errorMessage: string;
}

const TacoErrorDisplay: React.FC<TacoErrorDisplayProps> = ({ errorMessage }) => {
  // Parse the error message
  const nodeErrors = parseTacoDecryptionError(errorMessage);
  
  // If no TACo-specific errors were found, just display the original message
  if (nodeErrors.length === 1 && nodeErrors[0].nodeAddress === 'Unknown') {
    return (
      <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-300">
        <p className="font-medium mb-2">Decryption Error</p>
        <p className="text-sm opacity-90">{errorMessage}</p>
      </div>
    );
  }
  
  // Group errors by error message for better organization
  const errorsByMessage: Record<string, typeof nodeErrors> = {};
  
  nodeErrors.forEach(error => {
    if (!errorsByMessage[error.errorMessage]) {
      errorsByMessage[error.errorMessage] = [];
    }
    errorsByMessage[error.errorMessage].push(error);
  });
  
  return (
    <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-300">
      <p className="font-medium mb-3">Decryption Failed: Threshold of responses not met</p>
      
      {Object.entries(errorsByMessage).map(([message, errors], index) => (
        <div key={index} className="mb-4 last:mb-0">
          <p className="text-sm font-medium mb-2 text-red-200">{message}</p>
          <div className="bg-red-950/50 rounded p-2">
            <p className="text-xs mb-1 opacity-70">Failed nodes:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {errors.map((error, i) => (
                <div key={i} className="text-xs bg-red-950/50 p-2 rounded border border-red-500/20 font-mono">
                  {error.nodeAddress}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TacoErrorDisplay; 