'use client';

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

interface WalletButtonProps {
  onConnect: (provider: ethers.providers.Web3Provider) => void;
}

const WalletButton: React.FC<WalletButtonProps> = ({ onConnect }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Try to connect automatically when component mounts
  useEffect(() => {
    const autoConnect = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          
          // Check if we already have access (i.e. user previously connected)
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            setIsConnected(true);
            setAddress(accounts[0]);
            onConnect(provider);
          }
        } catch (err) {
          console.error('Auto-connect error:', err);
          // Don't show error for auto-connect failures
        }
      }
    };

    autoConnect();
  }, [onConnect]);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (args: unknown[]) => {
        const accounts = args as string[];
        if (accounts.length > 0) {
          setIsConnected(true);
          setAddress(accounts[0]);
        } else {
          setIsConnected(false);
          setAddress('');
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, []);

  const handleConnect = async () => {
    setError('');
    
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      
      // Request account access
      const accounts = await provider.send("eth_requestAccounts", []);
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      setIsConnected(true);
      setAddress(accounts[0]);
      onConnect(provider);

    } catch (err) {
      console.error('Connection error:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setAddress('');
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        {!isConnected ? (
          <button
            onClick={handleConnect}
            className="px-4 py-2 rounded-lg font-medium transition-all duration-200
              bg-white/5 text-white border border-white/10
              hover:bg-white/10 hover:border-white/20
              focus:outline-none focus:ring-1 focus:ring-white/20"
          >
            Connect Wallet
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/60 font-mono">
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
            <button
              onClick={handleDisconnect}
              className="px-4 py-2 rounded-lg font-medium transition-all duration-200
                bg-white/5 text-white border border-white/10
                hover:bg-white/10 hover:border-white/20
                focus:outline-none focus:ring-1 focus:ring-white/20"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-400 font-mono">{error}</p>
      )}
    </div>
  );
};

export default WalletButton; 