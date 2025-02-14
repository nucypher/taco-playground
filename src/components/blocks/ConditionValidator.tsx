'use client';

import React from 'react';
import { conditions } from '@nucypher/taco';

// Define supported chains (can be moved to a shared constants file)
const SUPPORTED_CHAINS = [
  { id: 137, name: 'Polygon Mainnet' },
  { id: 80002, name: 'Polygon Amoy' },
  { id: 11155111, name: 'Sepolia' },
  { id: 1, name: 'Ethereum Mainnet' }
] as const;

type Comparator = '==' | '>' | '<' | '>=' | '<=' | '!=';
type StandardContractType = 'ERC20' | 'ERC721';

interface ReturnValueTest {
  comparator: Comparator;
  value: any;
  index?: number;
}

interface BaseCondition {
  conditionType: string;
  chain: number;
  returnValueTest: ReturnValueTest;
}

interface TimeCondition extends BaseCondition {
  conditionType: 'time';
  method: 'blocktime';
}

interface ContractCondition extends BaseCondition {
  conditionType: 'contract';
  contractAddress: string;
  standardContractType?: StandardContractType;
  method: string;
  parameters: any[];
}

interface CompoundCondition {
  conditionType: 'compound';
  operator: 'and' | 'or';
  operands: TacoCondition[];
}

type TacoCondition = TimeCondition | ContractCondition | CompoundCondition;

interface ConditionValidatorProps {
  condition: TacoCondition;
}

const ConditionValidator: React.FC<ConditionValidatorProps> = ({ condition }) => {
  const validateCondition = (cond: TacoCondition): boolean => {
    if (!cond) return false;

    try {
      // Handle compound conditions
      if (cond.conditionType === 'compound') {
        if (!cond.operator || !cond.operands || !Array.isArray(cond.operands)) {
          return false;
        }
        // Validate each operand recursively
        return cond.operands.every(operand => validateCondition(operand));
      }

      // Validate chain ID for all non-compound conditions
      if ('chain' in cond && !SUPPORTED_CHAINS.some(chain => chain.id === cond.chain)) {
        console.error(`Unsupported chain ID: ${cond.chain}`);
        return false;
      }

      // Validate based on condition type
      switch (cond.conditionType) {
        case 'time': {
          new conditions.base.time.TimeCondition({
            chain: cond.chain,
            method: cond.method,
            returnValueTest: cond.returnValueTest
          });
          return true;
        }

        case 'contract': {
          if (!cond.contractAddress || !cond.method) {
            return false;
          }
          new conditions.base.contract.ContractCondition({
            chain: cond.chain,
            contractAddress: cond.contractAddress,
            standardContractType: cond.standardContractType,
            method: cond.method,
            parameters: cond.parameters,
            returnValueTest: cond.returnValueTest
          });
          return true;
        }

        default: {
          const _exhaustiveCheck: never = cond;
          console.error(`Unknown condition type: ${cond.conditionType}`);
          return false;
        }
      }
    } catch (error) {
      console.error('Validation error:', error);
      return false;
    }
  };

  const isValid = React.useMemo(() => {
    console.log('Validating condition:', condition);
    return validateCondition(condition);
  }, [condition]);

  return (
    <div className="flex items-center gap-2">
      {isValid ? (
        <>
          <svg 
            className="w-5 h-5 text-green-500" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 13l4 4L19 7" 
            />
          </svg>
          <span className="text-sm text-green-500">Valid condition</span>
        </>
      ) : (
        <>
          <svg 
            className="w-5 h-5 text-red-500" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M6 18L18 6M6 6l12 12" 
            />
          </svg>
          <span className="text-sm text-red-500">Invalid condition</span>
        </>
      )}
    </div>
  );
};

export default ConditionValidator; 