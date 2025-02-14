'use client';

import React, { useState, useEffect } from 'react';
import { initialize } from '@nucypher/taco';

interface TacoProviderProps {
  children: React.ReactNode;
}

const TacoProvider: React.FC<TacoProviderProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const init = async () => {
      try {
        await initialize();
        setIsInitialized(true);
      } catch (err) {
        console.error('Failed to initialize TACo:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize TACo');
      }
    };

    init();
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Failed to initialize TACo: {error}</div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-lg">Initializing TACo...</div>
      </div>
    );
  }

  return <>{children}</>;
};

export default TacoProvider; 