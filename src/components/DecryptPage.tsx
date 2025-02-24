'use client';

import React, { useState } from 'react';
import DecryptionPanel from './DecryptionPanel';
import ErrorPanel from './ErrorPanel';
import Header from './layout/Header';

const DecryptPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleClearError = () => {
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Header variant="decrypt" />
      <div className="p-8">
        <div className="max-w-[1600px] mx-auto space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <DecryptionPanel 
              messageKit={null}
              onError={handleError}
            />
          </div>
        </div>
      </div>

      {error && (
        <ErrorPanel 
          error={error} 
          onClear={handleClearError}
        />
      )}
    </div>
  );
};

export default DecryptPage; 