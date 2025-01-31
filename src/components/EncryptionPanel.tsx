'use client';

import React, { useState } from 'react';
import { encrypt, domains, conditions } from '@nucypher/taco';
import { ethers } from 'ethers';

interface EncryptionPanelProps {
  condition: any;
  onMessageKitGenerated: (messageKit: any) => void;
}

// Helper function to parse Zod validation errors
const parseValidationError = (errorMessage: string) => {
  try {
    // Extract the JSON part from the error message
    const jsonStr = errorMessage.replace('Invalid condition: ', '');
    const errorData = JSON.parse(jsonStr);

    // Function to extract unique chain validation errors
    const extractChainErrors = (errors: any[]): Set<number> => {
      const chainValues = new Set<number>();
      errors.forEach(error => {
        if (error.issues) {
          error.issues.forEach((issue: any) => {
            if (issue.unionErrors) {
              issue.unionErrors.forEach((unionError: any) => {
                if (unionError.issues) {
                  unionError.issues.forEach((chainIssue: any) => {
                    if (chainIssue.expected && typeof chainIssue.expected === 'number') {
                      chainValues.add(chainIssue.expected);
                    }
                  });
                }
              });
            } else if (issue.expected && typeof issue.expected === 'number') {
              chainValues.add(issue.expected);
            }
          });
        }
      });
      return chainValues;
    };

    // Extract validation issues
    const validationIssues = new Set<string>();
    const chainValues = extractChainErrors(errorData);

    if (chainValues.size > 0) {
      validationIssues.add(`Chain must be one of: ${Array.from(chainValues).join(', ')}`);
    }

    // Add other validation issues
    const addIssues = (error: any) => {
      if (error.issues) {
        error.issues.forEach((issue: any) => {
          if (issue.message && !issue.message.includes('Invalid literal value')) {
            // Clean up the message
            let message = issue.message;
            if (issue.expected) {
              message = `Expected ${issue.expected}`;
              if (issue.received) {
                message += `, received ${issue.received}`;
              }
            }
            if (issue.path && issue.path.length > 0) {
              message += ` at ${issue.path.join('.')}`;
            }
            validationIssues.add(message);
          }
          if (issue.unionErrors) {
            issue.unionErrors.forEach((unionError: any) => addIssues(unionError));
          }
        });
      }
    };

    errorData.forEach(addIssues);

    // If no issues were found, add the original error message
    if (validationIssues.size === 0) {
      validationIssues.add(errorMessage);
    }

    return Array.from(validationIssues);
  } catch (e) {
    console.error('Error parsing validation error:', e);
    // If parsing fails, return the original error message
    return [errorMessage];
  }
};

const EncryptionPanel: React.FC<EncryptionPanelProps> = ({ 
  condition,
  onMessageKitGenerated 
}) => {
  const [message, setMessage] = useState('');
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleEncrypt = async () => {
    if (!condition || !message) return;
    setErrors([]);

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

      console.log('Starting encryption with condition:', condition);

      const signer = provider.getSigner();

      // Create a TACo condition based on the condition type
      let tacoCondition;
      try {
        if (condition.conditionType === 'compound') {
          // Process compound conditions (AND/OR)
          const processedOperands = await Promise.all(condition.operands.map(async (operand: any) => {
            if (operand.standardContractType === 'timestamp') {
              return new conditions.base.time.TimeCondition({
                chain: operand.chain,
                method: 'blocktime',
                returnValueTest: operand.returnValueTest
              });
            } else if (operand.standardContractType === 'ERC20') {
              return new conditions.base.contract.ContractCondition({
                chain: operand.chain,
                contractAddress: operand.contractAddress,
                standardContractType: 'ERC20',
                method: 'balanceOf',
                parameters: [':userAddress'],
                returnValueTest: operand.returnValueTest
              });
            }
            throw new Error(`Unsupported condition type: ${operand.standardContractType}`);
          }));

          if (condition.operator === 'and') {
            tacoCondition = new conditions.compound.CompoundCondition({
              operator: 'and',
              operands: processedOperands
            });
          } else if (condition.operator === 'or') {
            tacoCondition = new conditions.compound.CompoundCondition({
              operator: 'or',
              operands: processedOperands
            });
          } else {
            throw new Error('Unsupported compound operator');
          }
        } else if (condition.standardContractType === 'timestamp') {
          tacoCondition = new conditions.base.time.TimeCondition({
            chain: condition.chain,
            method: 'blocktime',
            returnValueTest: condition.returnValueTest
          });
        } else if (condition.standardContractType === 'ERC20') {
          tacoCondition = new conditions.base.contract.ContractCondition({
            chain: condition.chain,
            contractAddress: condition.contractAddress,
            standardContractType: 'ERC20',
            method: 'balanceOf',
            parameters: [':userAddress'],
            returnValueTest: condition.returnValueTest
          });
        } else {
          throw new Error(`Unsupported condition type: ${condition.standardContractType}`);
        }
      } catch (conditionError: any) {
        console.error('Condition creation error:', conditionError);
        if (conditionError.message.includes('Invalid condition:')) {
          setErrors(parseValidationError(conditionError.message));
        } else {
          setErrors([conditionError.message]);
        }
        return;
      }

      const messageKit = await encrypt(
        provider,
        domains.TESTNET,
        message,
        tacoCondition,
        6, // Ritual ID #6 (as number)
        signer
      );

      onMessageKitGenerated(messageKit);
    } catch (error: any) {
      console.error('Encryption error:', error);
      if (typeof error === 'object' && error.message) {
        if (error.message.includes('Invalid condition:')) {
          setErrors(parseValidationError(error.message));
        } else {
          setErrors([error.message]);
        }
      } else {
        setErrors(['Failed to encrypt message']);
      }
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

      {errors.length > 0 && (
        <div className="p-3 bg-red-900/50 border border-red-700 rounded-md space-y-1">
          {errors.map((error, index) => (
            <p key={index} className="text-sm text-red-200">
              • {error}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default EncryptionPanel; 