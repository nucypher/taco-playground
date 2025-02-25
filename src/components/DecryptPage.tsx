'use client';

import React, { useState } from 'react';
import DecryptionPanel from './DecryptionPanel';
import ErrorPanel from './ErrorPanel';
import Header from './layout/Header';
import { domains } from '@nucypher/taco';

const DecryptPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    // Automatically clear error after 10 seconds
    setTimeout(() => setError(null), 10000);
  };

  const handleClearError = () => {
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Header variant="decrypt" />
      <main className="flex-1 p-4">
        <div className="max-w-[1600px] mx-auto space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <DecryptionPanel 
              messageKit={null}
              ciphertext=""
              onError={handleError}
              settings={{
                domain: domains.DEVNET,
                ritualId: 27
              }}
            />
          </div>
        </div>
      </main>
      <ErrorPanel error={error} onClear={handleClearError} />
    </div>
  );
};

export default DecryptPage; 