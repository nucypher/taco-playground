'use client';

import React, { useState } from 'react';
import { encrypt, domains, conditions } from '@nucypher/taco';
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

  const createCondition = (conditionData: any) => {
    // Helper to ensure we use a valid chain ID
    const getValidChainId = (chain: number) => {
      const validChains = [137, 80002, 11155111, 1];
      const chainId = validChains.find(id => id === chain);
      if (!chainId) {
        throw new Error(`Invalid chain ID. Must be one of: ${validChains.join(', ')}`);
      }
      return chainId;
    };

    switch (conditionData.conditionType) {
      case 'time':
        // Time conditions use RpcCondition with eth_getBalance
        console.log('Creating time condition from:', conditionData);
        // Extract only the properties we need and ensure chain is a literal number
        const { chain, returnValueTest } = conditionData;
        const validChain = getValidChainId(chain);
        console.log('Using chain ID:', validChain, 'type:', typeof validChain);
        
        // Create a proper time condition with all required fields
        const timeCondition = new conditions.base.rpc.RpcCondition({
          chain: validChain,
          method: 'eth_getBalance',
          parameters: ['0x0000000000000000000000000000000000000000', 'latest'],
          returnValueTest: {
            comparator: returnValueTest?.comparator || '>=',
            value: returnValueTest?.value || 0
          }
        });
        console.log('Created time condition with full details:', {
          condition: timeCondition,
          schema: timeCondition.schema,
          value: timeCondition.value
        });
        return timeCondition;

      case 'contract':
      case 'erc20':
      case 'erc721':
      case 'erc1155':
        // All token-related conditions use ContractCondition
        return new conditions.base.contract.ContractCondition({
          contractAddress: conditionData.contractAddress,
          chain: getValidChainId(conditionData.chain),
          standardContractType: conditionData.standardContractType,
          method: conditionData.method || 'balanceOf',
          parameters: conditionData.parameters || [':userAddress'],
          returnValueTest: {
            comparator: conditionData.returnValueTest?.comparator || '>',
            value: conditionData.returnValueTest?.value || 0
          }
        });

      case 'rpc':
        return new conditions.base.rpc.RpcCondition({
          chain: getValidChainId(conditionData.chain),
          method: conditionData.method || 'eth_getBalance',
          parameters: conditionData.parameters || [':userAddress', 'latest'],
          returnValueTest: {
            comparator: conditionData.returnValueTest?.comparator || '>=',
            value: conditionData.returnValueTest?.value || 0
          }
        });

      case 'compound':
        // Process each operand recursively
        console.log('Processing compound condition:', conditionData);
        const operands = conditionData.operands.map((operand: any) => {
          console.log('Processing operand:', operand);
          const processedOperand = createCondition(operand);
          console.log('Processed operand:', processedOperand);
          return processedOperand.value; // Extract the value from the condition
        });

        console.log('Creating compound condition with operands:', operands);
        // Create compound condition
        const compoundCondition = new conditions.compound.CompoundCondition({
          operator: conditionData.operator,
          operands: operands.map((operand: { chain: number; returnValueTest?: { comparator: string; value: any } }) => ({
            ...operand,
            chain: getValidChainId(operand.chain), // Ensure chain is a valid number
            method: 'eth_getBalance', // Ensure method is set
            parameters: ['0x0000000000000000000000000000000000000000', 'latest'], // Ensure parameters are set
            returnValueTest: {
              comparator: operand.returnValueTest?.comparator || '>=',
              value: operand.returnValueTest?.value || 0
            }
          }))
        });
        console.log('Created compound condition:', compoundCondition);
        return compoundCondition;

      default:
        throw new Error(`Unsupported condition type: ${conditionData.conditionType}`);
    }
  };

  const handleEncrypt = async () => {
    if (!condition || !message) return;
    setError('');

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

      // Create a proper Taco condition object from the JSON
      const tacoCondition = createCondition(condition);
      console.log('Created Taco condition:', tacoCondition);

      const messageKit = await encrypt(
        provider,
        domains.TESTNET,
        message,
        tacoCondition, // Use the created Taco condition object
        6, // Ritual ID #6
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