'use client';

import React, { useState, useEffect } from 'react';
import { conditions, decrypt, domains } from '@nucypher/taco';
import { EIP4361AuthProvider } from '@nucypher/taco-auth';
import { ethers } from 'ethers';

interface DecryptionPanelProps {
  messageKit: any;
}

const DecryptionPanel: React.FC<DecryptionPanelProps> = ({ messageKit }) => {
  const [decryptedMessage, setDecryptedMessage] = useState('');
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState('');
  const [customCiphertext, setCustomCiphertext] = useState('');
  const [activeMessageKit, setActiveMessageKit] = useState<any>(null);

  // Update active message kit when prop changes
  useEffect(() => {
    if (messageKit) {
      const messageKitString = btoa(JSON.stringify(messageKit));
      setCustomCiphertext(messageKitString);
      setActiveMessageKit(messageKit);
      setError('');
    }
  }, [messageKit]);

  const handleCustomCiphertextChange = (text: string) => {
    setCustomCiphertext(text);
    try {
      if (text.trim() === '') {
        setActiveMessageKit(null);
        setError('');
        return;
      }
      // Try to parse the input as a messageKit
      const parsedMessageKit = JSON.parse(atob(text));
      setActiveMessageKit(parsedMessageKit);
      setError('');
    } catch (e) {
      setActiveMessageKit(null);
      setError('Invalid ciphertext format. Please provide a valid base64-encoded messageKit.');
    }
  };

  const handleClear = () => {
    setCustomCiphertext('');
    setActiveMessageKit(null);
    setDecryptedMessage('');
    setError('');
  };

  const handleDecrypt = async () => {
    if (!activeMessageKit) return;
    setError('');
    setDecryptedMessage('');

    try {
      setIsDecrypting(true);

      if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      
      const accounts = await provider.send("eth_requestAccounts", []);
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const signer = provider.getSigner();
      const userAddress = await signer.getAddress();
      console.log('User address:', userAddress);

      // Create the condition context from the message kit
      const conditionContext = conditions.context.ConditionContext.fromMessageKit(activeMessageKit);

      // Create auth provider for contract conditions
      const authProvider = new EIP4361AuthProvider(
        provider,
        signer,
        {
          domain: window.location.hostname,
          uri: window.location.origin
        }
      );

      // Add auth provider for contract condition parameters BEFORE getting parameters
      conditionContext.addAuthProvider(':userAddress', authProvider);

      // Now get the parameters after setting up auth
      const contextParams = await conditionContext.toContextParameters();
      console.log('Required context parameters:', contextParams);

      // Log the setup for debugging
      console.log('Starting decryption with:', {
        userAddress,
        contextParams,
        activeMessageKit
      });

      const decrypted = await decrypt(
        provider,
        domains.TESTNET,
        activeMessageKit,
        conditionContext
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
    <div className="space-y-6 p-6 bg-black border border-white/10 rounded-lg">
      <div className="flex justify-between items-center border-b border-white/10 pb-4">
        <h3 className="text-sm font-medium text-white tracking-wide uppercase">Decrypt Message</h3>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-white/80">
              Ciphertext
            </label>
            {(customCiphertext || decryptedMessage) && (
              <button
                onClick={handleClear}
                className="px-2 py-1 text-xs bg-white/5 text-white/60 rounded
                  hover:bg-white/10 hover:text-white/80 transition-all duration-200
                  flex items-center gap-1.5"
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                  />
                </svg>
                <span>Clear</span>
              </button>
            )}
          </div>
          <div className="relative group">
            <textarea
              value={customCiphertext}
              onChange={(e) => handleCustomCiphertextChange(e.target.value)}
              placeholder="Paste encrypted message here..."
              className="w-full h-24 px-3 py-2 bg-white/5 text-white border border-white/10 rounded-lg
                placeholder-white/30 font-mono text-sm
                focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20
                transition-all duration-200"
            />
            {customCiphertext && (
              <button
                onClick={() => navigator.clipboard.writeText(customCiphertext)}
                className="absolute top-2 right-2 p-2 text-white/40 hover:text-white/80
                  hover:bg-white/10 rounded-lg transition-all duration-200
                  opacity-0 group-hover:opacity-100"
                title="Copy to clipboard"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" 
                  />
                </svg>
              </button>
            )}
          </div>
          {activeMessageKit && (
            <p className="mt-2 text-xs text-green-400">
              ✓ Valid ciphertext
            </p>
          )}
        </div>

        <button
          onClick={handleDecrypt}
          disabled={!activeMessageKit || isDecrypting}
          className="w-full px-4 py-3 bg-white/5 text-white rounded-lg font-medium
            border border-white/10 transition-all duration-200
            hover:bg-white/10 hover:border-white/20
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white/5 disabled:hover:border-white/10
            focus:outline-none focus:ring-1 focus:ring-white/20"
        >
          <div className="flex items-center justify-center space-x-2">
            {isDecrypting && (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            <span>{isDecrypting ? 'Decrypting...' : 'Decrypt Message'}</span>
          </div>
        </button>

        {decryptedMessage && (
          <div className="p-4 bg-white/5 border border-white/10 rounded-lg space-y-2">
            <label className="block text-sm font-medium text-white/80">
              Decrypted Message
            </label>
            <p className="text-white font-mono text-sm break-all bg-black/50 p-3 rounded border border-white/5">
              {decryptedMessage}
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
          <p className="text-sm text-red-400 font-mono">{error}</p>
        </div>
      )}
    </div>
  );
};

export default DecryptionPanel; 