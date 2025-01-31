import { Block, BLOCK_CATEGORIES } from './BlockTypes';

export const AVAILABLE_BLOCKS: Block[] = [
  // Time Conditions
  {
    id: 'time-lock-template',
    type: 'condition',
    category: BLOCK_CATEGORIES.CONDITIONS,
    label: 'Time Lock',
    inputs: [
      { id: 'chain', type: ['value'], label: 'Chain ID' },
      { id: 'timestamp', type: ['value'], label: 'Unix Timestamp' }
    ],
    properties: {
      conditionType: 'contract',
      contractAddress: '',
      standardContractType: 'timestamp',
      method: 'eth_getBlockByNumber',
      parameters: ['latest'],
      returnValueTest: {
        comparator: '>=',
        value: null
      }
    }
  },
  {
    id: 'timestamp',
    type: 'condition',
    category: BLOCK_CATEGORIES.CONDITIONS,
    label: 'Timestamp',
    inputs: [
      { id: 'chain', type: ['value'], label: 'Chain ID' },
      { id: 'minTimestamp', type: ['value'], label: 'Minimum Timestamp' },
    ],
    properties: {
      conditionType: 'contract',
      standardContractType: 'timestamp',
      method: 'eth_getBlockByNumber',
      parameters: ['latest'],
      returnValueTest: {
        comparator: '>=',
        value: null
      }
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
      { id: 'chain', type: ['value'], label: 'Chain ID' },
      { id: 'minBalance', type: ['value'], label: 'Min Balance' },
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
      { id: 'tokenId', type: ['value'], label: 'Token ID' },
      { id: 'chain', type: ['value'], label: 'Chain ID' },
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
      { id: 'tokenId', type: ['value'], label: 'Token ID' },
      { id: 'chain', type: ['value'], label: 'Chain ID' },
      { id: 'minBalance', type: ['value'], label: 'Min Balance' },
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
      { id: 'chain', type: ['value'], label: 'Chain ID' },
      { id: 'minBalance', type: ['value'], label: 'Min Balance (Wei)' },
    ],
    properties: {
      conditionType: 'contract',
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
      { id: 'chain', type: ['value'], label: 'Chain ID' },
      { id: 'parameters', type: ['value'], label: 'Parameters (JSON)' },
      { id: 'abi', type: ['value'], label: 'Function ABI (JSON)' },
    ],
    properties: {
      conditionType: 'contract',
    }
  },

  // Value Blocks
  {
    id: 'address',
    type: 'value',
    category: BLOCK_CATEGORIES.VALUES,
    label: 'Address',
    inputType: 'text',
    placeholder: '0x...',
    value: '',
  },
  {
    id: 'number',
    type: 'value',
    category: BLOCK_CATEGORIES.VALUES,
    label: 'Number',
    inputType: 'number',
    value: '',
  },
]; 