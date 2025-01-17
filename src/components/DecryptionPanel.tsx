'use client';

import React, { useState } from 'react';
import { conditions, decrypt, domains } from '@nucypher/taco';
import { EIP4361AuthProvider, USER_ADDRESS_PARAM_DEFAULT } from '@nucypher/taco-auth';
import { ethers } from 'ethers';

interface DecryptionPanelProps {
  messageKit: any;
}

const DecryptionPanel: React.FC<DecryptionPanelProps> = ({ messageKit }) => {
  const [decryptedMessage, setDecryptedMessage] = useState('');
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState('');

  const handleDecrypt = async () => {
    if (!messageKit) return;
    setError('');

    try {
      setIsDecrypting(true);

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
      const conditionContext = conditions.context.ConditionContext.fromMessageKit(messageKit);
      
      const authProvider = new EIP4361AuthProvider(
        provider,
        signer
      );
      conditionContext.addAuthProvider(USER_ADDRESS_PARAM_DEFAULT, authProvider);

      const decrypted = await decrypt(
        provider,
        domains.TESTNET,
        messageKit,
        conditionContext,
      );

      setDecryptedMessage(new TextDecoder().decode(decrypted));
    } catch (error: any) {
      console.error('Decryption error:', error);
      setError(error.message || 'Failed to decrypt message');
    } finally {
      setIsDecrypting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-100">Decrypt Message</h3>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleDecrypt}
          disabled={!messageKit}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md font-medium
            hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isDecrypting ? 'Decrypting...' : 'Decrypt Message'}
        </button>
      </div>

      {decryptedMessage && (
        <div className="p-3 bg-gray-800 border border-gray-700 rounded-md">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Decrypted Message
          </label>
          <p className="text-gray-100">{decryptedMessage}</p>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-900/50 border border-red-700 rounded-md">
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}
    </div>
  );
};

export default DecryptionPanel; 