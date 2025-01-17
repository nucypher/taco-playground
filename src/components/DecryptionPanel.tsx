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
  const [walletAddress, setWalletAddress] = useState('');
  const [error, setError] = useState('');

  const handleDecrypt = async () => {
    if (!messageKit) return;

    try {
      setIsDecrypting(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);

      const conditionContext = conditions.context.ConditionContext.fromMessageKit(messageKit);
      
      const authProvider = new EIP4361AuthProvider(
        provider,
        provider.getSigner(),
      );
      conditionContext.addAuthProvider(USER_ADDRESS_PARAM_DEFAULT, authProvider);

      const decrypted = await decrypt(
        provider,
        domains.TESTNET,
        messageKit,
        conditionContext,
      );

      setDecryptedMessage(new TextDecoder().decode(decrypted));
    } catch (error) {
      console.error('Decryption error:', error);
      setError('An error occurred while decrypting the message.');
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
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Wallet Address
          </label>
          <input
            type="text"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            placeholder="0x..."
            className="w-full px-3 py-2 bg-gray-800 text-gray-100 border border-gray-700 rounded-md 
              placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          onClick={handleDecrypt}
          disabled={!messageKit || !walletAddress}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md font-medium
            hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Decrypt Message
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