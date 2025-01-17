'use client';

import React, { useState, useEffect } from 'react';
import { BrowserProvider } from 'ethers';
import { EthereumProvider } from '@walletconnect/ethereum-provider';

interface WalletButtonProps {
  onConnect: (provider: BrowserProvider) => void;
}

const WalletButton: React.FC<WalletButtonProps> = ({ onConnect }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [wcProvider, setWcProvider] = useState<EthereumProvider | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initProvider = async () => {
      const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
      
      if (!projectId) {
        setError('WalletConnect Project ID not configured');
        setIsInitializing(false);
        return;
      }

      try {
        const provider = await EthereumProvider.init({
          projectId,
          chains: [1, 5], // Mainnet and Goerli
          showQrModal: true,
          methods: [
            'eth_sendTransaction',
            'eth_signTransaction',
            'eth_sign',
            'personal_sign',
            'eth_signTypedData',
          ],
          events: ['chainChanged', 'accountsChanged'],
          metadata: {
            name: 'TACo Playground',
            description: 'TACo Playground Application',
            url: window.location.origin,
            icons: ['https://walletconnect.com/walletconnect-logo.png']
          },
        });

        setWcProvider(provider);
        setError('');

        provider.on('connect', async (e: any) => {
          console.log('Connected:', e);
          await handleConnection(provider);
        });

        provider.on('disconnect', () => {
          console.log('Disconnected');
          setIsConnected(false);
          setAddress('');
        });

        // Check if already connected
        if (provider.session) {
          await handleConnection(provider);
        }

      } catch (err: any) {
        console.error('Failed to initialize provider:', err);
        setError(err.message || 'Failed to initialize wallet connection');
      } finally {
        setIsInitializing(false);
      }
    };

    initProvider();

    return () => {
      if (wcProvider) {
        wcProvider.removeListener('connect', () => {});
        wcProvider.removeListener('disconnect', () => {});
      }
    };
  }, []);

  const handleConnection = async (provider: EthereumProvider) => {
    try {
      const ethersProvider = new BrowserProvider(provider as any);
      const accounts = await provider.enable();
      
      if (accounts && accounts.length > 0) {
        setIsConnected(true);
        setAddress(accounts[0]);
        onConnect(ethersProvider);
        setError('');
      }
    } catch (err: any) {
      console.error('Connection error:', err);
      setError(err.message || 'Failed to connect wallet');
    }
  };

  const handleConnect = async () => {
    setError('');
    
    try {
      if (!wcProvider) {
        throw new Error('Wallet connection not initialized');
      }

      if (!wcProvider.session) {
        await wcProvider.connect();
      } else {
        await handleConnection(wcProvider);
      }

    } catch (err: any) {
      console.error('Connection error:', err);
      setError(err.message || 'Failed to connect wallet');
    }
  };

  const handleDisconnect = async () => {
    try {
      if (wcProvider && wcProvider.session) {
        await wcProvider.disconnect();
      }
      setIsConnected(false);
      setAddress('');
    } catch (err: any) {
      console.error('Disconnect error:', err);
      setError(err.message || 'Failed to disconnect wallet');
    }
  };

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center">
        <span className="text-sm text-gray-400">Initializing wallet connection...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        {!isConnected ? (
          <button
            onClick={handleConnect}
            disabled={!wcProvider}
            className="px-4 py-2 rounded-md font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Connect Wallet
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-300">
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
            <button
              onClick={handleDisconnect}
              className="px-4 py-2 rounded-md font-medium transition-colors bg-green-600 hover:bg-green-700 text-white"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default WalletButton; 