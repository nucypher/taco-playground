import { Block, BLOCK_CATEGORIES } from './BlockTypes';

export const AVAILABLE_BLOCKS: Block[] = [
  // Operator Blocks
  {
    id: 'and-operator',
    type: 'operator',
    category: BLOCK_CATEGORIES.OPERATORS,
    label: 'AND',
    inputs: [
      { id: 'condition-1', type: ['condition', 'operator'], label: 'Add Condition' }
    ],
    properties: {
      conditionType: 'compound',
      operator: 'and',
      operands: []
    }
  },
  {
    id: 'or-operator',
    type: 'operator',
    category: BLOCK_CATEGORIES.OPERATORS,
    label: 'OR',
    inputs: [
      { id: 'condition-1', type: ['condition', 'operator'], label: 'Add Condition' }
    ],
    properties: {
      conditionType: 'compound',
      operator: 'or',
      operands: []
    }
  },
  {
    id: 'not-operator',
    type: 'operator',
    category: BLOCK_CATEGORIES.OPERATORS,
    label: 'NOT',
    inputs: [
      { id: 'condition-1', type: ['condition', 'operator'], label: 'Condition to Negate' }
    ],
    properties: {
      conditionType: 'compound',
      operator: 'not',
      operands: [],
      maxInputs: 1
    }
  },

  // Time Conditions
  {
    id: 'timestamp',
    type: 'condition',
    category: BLOCK_CATEGORIES.CONDITIONS,
    label: 'Time Lock',
    inputs: [
      { 
        id: 'chain', 
        type: ['value'], 
        label: 'Chain ID', 
        inputType: 'number',
        placeholder: 'Enter 1, 137, 80002, or 11155111'
      },
      { 
        id: 'minTimestamp', 
        type: ['value'], 
        label: 'Minimum Timestamp', 
        inputType: 'number',
        placeholder: 'Unix timestamp in seconds'
      },
    ],
    properties: {
      conditionType: 'time'
    }
  },

  // Token Conditions
  {
    id: 'erc20-balance',
    type: 'condition',
    category: BLOCK_CATEGORIES.CONDITIONS,
    label: 'ERC20 Balance',
    inputs: [
      { id: 'contractAddress', type: ['value'], label: 'Token Address' },
      { 
        id: 'chain', 
        type: ['value'], 
        label: 'Chain ID', 
        inputType: 'number',
        placeholder: 'Enter 1, 137, 80002, or 11155111'
      },
      { id: 'minBalance', type: ['value'], label: 'Min Balance', inputType: 'number' },
    ],
    properties: {
      conditionType: 'contract',
      standardContractType: 'ERC20',
      method: 'balanceOf',
      parameters: [':userAddress'],
      returnValueTest: {
        comparator: '>',
        value: 0
      }
    }
  },
  {
    id: 'erc721-ownership',
    type: 'condition',
    category: BLOCK_CATEGORIES.CONDITIONS,
    label: 'ERC721 Ownership',
    inputs: [
      { id: 'contractAddress', type: ['value'], label: 'Contract Address' },
      { id: 'tokenId', type: ['value'], label: 'Token ID', inputType: 'number' },
      { id: 'chain', type: ['value'], label: 'Chain ID', inputType: 'number' },
    ],
    properties: {
      conditionType: 'contract',
      standardContractType: 'ERC721',
      method: 'ownerOf',
      returnValueTest: {
        comparator: '=',
        value: ':userAddress'
      }
    }
  },
  {
    id: 'erc1155-balance',
    type: 'condition',
    category: BLOCK_CATEGORIES.CONDITIONS,
    label: 'ERC1155 Balance',
    inputs: [
      { id: 'contractAddress', type: ['value'], label: 'Contract Address' },
      { id: 'tokenId', type: ['value'], label: 'Token ID', inputType: 'number' },
      { id: 'chain', type: ['value'], label: 'Chain ID', inputType: 'number' },
      { id: 'minBalance', type: ['value'], label: 'Min Balance', inputType: 'number' },
    ],
    properties: {
      conditionType: 'contract',
      standardContractType: 'ERC1155',
      method: 'balanceOf',
      returnValueTest: {
        comparator: '>',
        value: 0
      }
    }
  },

  // Native Token Conditions
  {
    id: 'eth-balance',
    type: 'condition',
    category: BLOCK_CATEGORIES.CONDITIONS,
    label: 'ETH Balance',
    inputs: [
      { id: 'chain', type: ['value'], label: 'Chain ID', inputType: 'number' },
      { id: 'minBalance', type: ['value'], label: 'Min Balance (Wei)', inputType: 'number' },
    ],
    properties: {
      conditionType: 'rpc',
      method: 'eth_getBalance',
      parameters: [':userAddress', 'latest'],
    }
  },

  // Custom Contract Conditions
  {
    id: 'custom-contract',
    type: 'condition',
    category: BLOCK_CATEGORIES.CONDITIONS,
    label: 'Custom Contract Call',
    inputs: [
      { id: 'contractAddress', type: ['value'], label: 'Contract Address' },
      { id: 'method', type: ['value'], label: 'Method Name' },
      { id: 'chain', type: ['value'], label: 'Chain ID', inputType: 'number' },
      { id: 'parameters', type: ['value'], label: 'Parameters (JSON)' },
      { id: 'abi', type: ['value'], label: 'Function ABI (JSON)' },
    ],
    properties: {
      conditionType: 'contract',
    }
  }
]; 