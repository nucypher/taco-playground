'use client';

import React, { useState } from 'react';
import { encrypt, domains } from '@nucypher/taco';
import { ethers } from 'ethers';

interface EncryptionPanelProps {
  condition: any;
  onMessageKitGenerated: (messageKit: any) => void;
}

const EncryptionPanel: React.FC<EncryptionPanelProps> = ({ 
  condition,
  onMessageKitGenerated 
}) => {
  const [message, setMessage] = useState('');
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [error, setError] = useState('');

  const handleEncrypt = async () => {
    if (!condition || !message) return;
    setError('');

    try {
      setIsEncrypting(true);
      
      // Check if MetaMask is installed
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      
      // Request account access
      const accounts = await provider.send("eth_requestAccounts", []);
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const signer = provider.getSigner();
      const messageKit = await encrypt(
        provider,
        domains.TESTNET,
        message,
        condition,
        "6", // Ritual ID #6
        signer
      );

      onMessageKitGenerated(messageKit);
    } catch (error: any) {
      console.error('Encryption error:', error);
      setError(error.message || 'Failed to encrypt message');
    } finally {
      setIsEncrypting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-100">Encrypt Message</h3>
      </div>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter message to encrypt..."
            className="w-full h-24 px-3 py-2 bg-gray-800 text-gray-100 border border-gray-700 rounded-md 
              placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          onClick={handleEncrypt}
          disabled={!message || !condition}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md font-medium
            hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isEncrypting ? 'Encrypting...' : 'Encrypt Message'}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-900/50 border border-red-700 rounded-md">
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}
    </div>
  );
};

export default EncryptionPanel; 