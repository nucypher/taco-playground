'use client';

import React, { useState, useEffect } from 'react';
import { conditions, decrypt, initialize, ThresholdMessageKit } from '@nucypher/taco';
import { EIP4361AuthProvider, USER_ADDRESS_PARAM_DEFAULT } from '@nucypher/taco-auth';
import { ethers } from 'ethers';
import CiphertextDisplay from './CiphertextDisplay';
import { SettingsConfig } from './Settings';

interface DecryptionPanelProps {
  messageKit: ThresholdMessageKit | null;
  ciphertext: string;
  onError: (error: string) => void;
  settings: SettingsConfig;
}

const DecryptionPanel: React.FC<DecryptionPanelProps> = ({ 
  messageKit, 
  ciphertext,
  onError,
  settings
}) => {
  const [decryptedMessage, setDecryptedMessage] = useState('');
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [customCiphertext, setCustomCiphertext] = useState('');
  const [activeMessageKit, setActiveMessageKit] = useState<ThresholdMessageKit | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize TACo when component mounts
  useEffect(() => {
    const initTaco = async () => {
      try {
        await initialize();
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize TACo:', error);
        onError('Failed to initialize encryption library');
      }
    };
    initTaco();
  }, [onError]);

  // Update active message kit and ciphertext when props change
  useEffect(() => {
    if (messageKit && ciphertext) {
      setCustomCiphertext(ciphertext);
      setActiveMessageKit(messageKit);
    }
  }, [messageKit, ciphertext]);

  const handleCustomCiphertextChange = (text: string) => {
    setCustomCiphertext(text);
    try {
      if (text.trim() === '') {
        setActiveMessageKit(null);
        return;
      }

      // Convert base64 back to bytes
      const binaryString = atob(text);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Create a ThresholdMessageKit from the bytes
      const parsedMessageKit = ThresholdMessageKit.fromBytes(bytes);
      console.log('Parsed message kit:', parsedMessageKit);

      setActiveMessageKit(parsedMessageKit);
    } catch (error) {
      console.error('Error parsing message kit:', error);
      setActiveMessageKit(null);
      onError('Invalid ciphertext format. Please provide a valid base64-encoded message kit.');
    }
  };

  const handleClear = () => {
    setCustomCiphertext('');
    setActiveMessageKit(null);
    setDecryptedMessage('');
  };

  const handleDecrypt = async () => {
    if (!activeMessageKit || !isInitialized) return;
    setDecryptedMessage('');

    try {
      setIsDecrypting(true);
      console.log('Starting decryption with message kit:', activeMessageKit);

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

      // Create the condition context only if needed
      let conditionContext;
      try {
        conditionContext = conditions.context.ConditionContext.fromMessageKit(activeMessageKit);
        
        if (conditionContext) {
          // Create auth provider for contract conditions
          const authProvider = new EIP4361AuthProvider(
            provider,
            signer,
            {
              domain: window.location.hostname,
              uri: window.location.origin
            }
          );

          // Add auth provider for :userAddress parameter
          conditionContext.addAuthProvider(USER_ADDRESS_PARAM_DEFAULT, authProvider);

          // Now get the parameters after setting up auth
          const contextParams = await conditionContext.toContextParameters();
          console.log('Required context parameters:', contextParams);
        }
      } catch {
        console.log('No conditions found in message kit, proceeding with direct decryption');
        conditionContext = undefined;
      }

      // Log the setup for debugging
      console.log('Starting decryption with:', {
        userAddress,
        activeMessageKit,
        hasConditions: !!conditionContext
      });

      const decrypted = await decrypt(
        provider,
        settings.domain,
        activeMessageKit,
        conditionContext // This will be undefined if there are no conditions, which is fine
      );

      setDecryptedMessage(new TextDecoder().decode(decrypted));
    } catch (error) {
      console.error('Decryption error:', error);
      onError(error instanceof Error ? error.message : 'Failed to decrypt message');
    } finally {
      setIsDecrypting(false);
    }
  };

  return (
    <div className="space-y-6 p-6 bg-white/[0.02] border border-white/10 rounded-lg shadow-xl shadow-black/20 backdrop-blur-sm">
      <div className="flex justify-between items-center border-b border-white/10 -mx-6 px-6 py-4 -mt-6 bg-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/5 rounded-lg border border-white/10">
            <svg className="w-5 h-5 text-taco" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-white tracking-wide uppercase">Decrypt</h3>
        </div>
        {!!activeMessageKit && (
          <div className="flex items-center gap-2 text-xs text-taco">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
            </svg>
            <span>Valid ciphertext</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <CiphertextDisplay
          ciphertext={customCiphertext}
          onChange={handleCustomCiphertextChange}
          onClear={handleClear}
        />

        <button
          onClick={handleDecrypt}
          disabled={!activeMessageKit || isDecrypting || !isInitialized}
          className="w-full px-4 py-3 bg-white/5 text-white rounded-lg font-medium
            border border-white/5 transition-all duration-200
            hover:bg-white/10 hover:border-white/10
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white/5 disabled:hover:border-white/5
            focus:outline-none focus:ring-1 focus:ring-white/10"
        >
          <div className="flex items-center justify-center space-x-2">
            {isDecrypting && (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            <span>{isDecrypting ? 'Decrypting...' : 'Decrypt'}</span>
          </div>
        </button>

        {decryptedMessage && (
          <div className="p-4 bg-white/5 border border-white/5 rounded-lg space-y-2">
            <label className="block text-sm font-medium text-white/80">
              Cleartext
            </label>
            <p className="text-white font-mono text-sm break-all bg-black/50 p-3 rounded border border-white/5">
              {decryptedMessage}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DecryptionPanel; 