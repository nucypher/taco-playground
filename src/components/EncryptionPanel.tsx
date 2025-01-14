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

  const handleEncrypt = async () => {
    if (!condition || !message) return;

    try {
      setIsEncrypting(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);

      const messageKit = await encrypt(
        provider,
        domains.TESTNET,
        message,
        condition,
        'your-ritual-id',
        provider.getSigner()
      );

      onMessageKitGenerated(messageKit);
    } catch (error) {
      console.error('Encryption error:', error);
    } finally {
      setIsEncrypting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Encrypt Message</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-2 border rounded"
            rows={4}
            placeholder="Enter your secret message..."
          />
        </div>

        <button
          onClick={handleEncrypt}
          disabled={!condition || !message || isEncrypting}
          className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:bg-gray-300"
        >
          {isEncrypting ? 'Encrypting...' : 'Encrypt Message'}
        </button>
      </div>
    </div>
  );
};

export default EncryptionPanel; 