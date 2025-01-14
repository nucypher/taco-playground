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
    } finally {
      setIsDecrypting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Decrypt Message</h2>
      
      <div className="space-y-4">
        {messageKit && (
          <button
            onClick={handleDecrypt}
            disabled={isDecrypting}
            className="w-full bg-purple-500 text-white p-2 rounded hover:bg-purple-600 disabled:bg-gray-300"
          >
            {isDecrypting ? 'Decrypting...' : 'Attempt Decryption'}
          </button>
        )}

        {decryptedMessage && (
          <div>
            <h3 className="font-medium mb-2">Decrypted Message:</h3>
            <div className="p-3 bg-gray-100 rounded">
              {decryptedMessage}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DecryptionPanel; 