'use client';

import React, { useState } from 'react';
import { encrypt, domains, conditions, ThresholdMessageKit } from '@nucypher/taco';
import { ethers } from 'ethers';
import { TacoCondition } from '../types/taco';

interface EncryptionPanelProps {
  condition: TacoCondition | null;
  onMessageKitGenerated: (messageKit: ThresholdMessageKit) => void;
  onError: (error: string) => void;
}

const EncryptionPanel: React.FC<EncryptionPanelProps> = ({ 
  condition,
  onMessageKitGenerated,
  onError
}) => {
  const [message, setMessage] = useState('');
  const [isEncrypting, setIsEncrypting] = useState(false);

  const handleEncrypt = async () => {
    if (!condition || !message) return;

    try {
      setIsEncrypting(true);
      
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      
      const accounts = await provider.send("eth_requestAccounts", []);
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const signer = provider.getSigner();

      console.log('Using condition:', JSON.stringify(condition, null, 2));

      // Create the appropriate condition instance based on type
      let tacoCondition;
      if (condition.conditionType === 'compound') {
        tacoCondition = new conditions.compound.CompoundCondition(condition);
      } else if (condition.conditionType === 'rpc') {
        tacoCondition = new conditions.base.rpc.RpcCondition(condition);
      } else if (condition.conditionType === 'contract') {
        tacoCondition = new conditions.base.contract.ContractCondition(condition);
      } else if (condition.conditionType === 'time') {
        tacoCondition = new conditions.base.time.TimeCondition(condition);
      } else {
        throw new Error(`Unsupported condition type: ${condition.conditionType}`);
      }

      const messageKit = await encrypt(
        provider,
        domains.TESTNET,
        message,
        tacoCondition,
        6,
        signer
      );

      onMessageKitGenerated(messageKit);
    } catch (error) {
      console.error('Encryption error:', error);
      onError(error instanceof Error ? error.message : 'Failed to encrypt message');
    } finally {
      setIsEncrypting(false);
    }
  };

  const handleClear = () => {
    setMessage('');
  };

  return (
    <div className="space-y-6 p-6 bg-black border border-white/10 rounded-lg">
      <div className="flex justify-between items-center border-b border-white/10 pb-4">
        <h3 className="text-sm font-medium text-white tracking-wide uppercase">Encrypt Message</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter message to encrypt..."
            className="w-full h-24 px-3 py-2 bg-white/5 text-white border border-white/10 rounded-lg
              placeholder-white/30 font-mono text-sm
              focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20
              transition-all duration-200"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleEncrypt}
            disabled={!message || !condition || isEncrypting}
            className="flex-1 px-4 py-3 bg-white/5 text-white rounded-lg font-medium
              border border-white/10 transition-all duration-200
              hover:bg-white/10 hover:border-white/20
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white/5 disabled:hover:border-white/10
              focus:outline-none focus:ring-1 focus:ring-white/20"
          >
            <div className="flex items-center justify-center space-x-2">
              {isEncrypting && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              <span>{isEncrypting ? 'Encrypting...' : 'Encrypt Message'}</span>
            </div>
          </button>

          <button
            onClick={handleClear}
            disabled={isEncrypting || !message}
            className="px-4 py-3 bg-white/5 text-white rounded-lg font-medium
              border border-white/10 transition-all duration-200
              hover:bg-white/10 hover:border-white/20
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white/5 disabled:hover:border-white/10
              focus:outline-none focus:ring-1 focus:ring-white/20"
          >
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Clear</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EncryptionPanel; 