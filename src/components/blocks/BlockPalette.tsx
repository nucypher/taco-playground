'use client';

import React from 'react';
import { Block, BLOCK_CATEGORIES } from './BlockTypes';
import DraggableBlock from './DraggableBlock';

const AVAILABLE_BLOCKS: Block[] = [
  // NFT Conditions
  {
    id: 'erc721-ownership',
    type: 'condition',
    category: BLOCK_CATEGORIES.CONDITIONS,
    label: 'ERC721 Ownership',
    inputs: [
      { id: 'contract', type: ['value'], label: 'Contract Address' },
      { id: 'tokenId', type: ['value'], label: 'Token ID' },
      { id: 'chain', type: ['value'], label: 'Chain ID' },
    ],
  },
  {
    id: 'erc1155-balance',
    type: 'condition',
    category: BLOCK_CATEGORIES.CONDITIONS,
    label: 'ERC1155 Balance',
    inputs: [
      { id: 'contract', type: ['value'], label: 'Contract Address' },
      { id: 'tokenId', type: ['value'], label: 'Token ID' },
      { id: 'minBalance', type: ['value'], label: 'Min Balance' },
      { id: 'chain', type: ['value'], label: 'Chain ID' },
    ],
  },
  // Token Conditions
  {
    id: 'erc20-balance',
    type: 'condition',
    category: BLOCK_CATEGORIES.CONDITIONS,
    label: 'ERC20 Balance',
    inputs: [
      { id: 'contract', type: ['value'], label: 'Token Address' },
      { id: 'minBalance', type: ['value'], label: 'Min Balance' },
      { id: 'chain', type: ['value'], label: 'Chain ID' },
    ],
  },
  // Time Conditions
  {
    id: 'time-lock',
    type: 'condition',
    category: BLOCK_CATEGORIES.CONDITIONS,
    label: 'Time Lock',
    inputs: [
      { id: 'timestamp', type: ['value'], label: 'Unix Timestamp' },
    ],
  },
  // Chain Conditions
  {
    id: 'chain-id',
    type: 'condition',
    category: BLOCK_CATEGORIES.CONDITIONS,
    label: 'Chain ID Match',
    inputs: [
      { id: 'chainId', type: ['value'], label: 'Chain ID' },
    ],
  },
  // Value Blocks
  {
    id: 'contract-address',
    type: 'value',
    category: BLOCK_CATEGORIES.VALUES,
    label: 'Contract Address',
    inputType: 'text',
    placeholder: '0x...',
    value: '',
  },
  {
    id: 'token-id',
    type: 'value',
    category: BLOCK_CATEGORIES.VALUES,
    label: 'Token ID',
    inputType: 'number',
    placeholder: 'Enter token ID',
    value: '',
  },
  {
    id: 'balance',
    type: 'value',
    category: BLOCK_CATEGORIES.VALUES,
    label: 'Balance',
    inputType: 'number',
    placeholder: 'Enter amount',
    value: '',
  },
  {
    id: 'chain-id-value',
    type: 'value',
    category: BLOCK_CATEGORIES.VALUES,
    label: 'Chain ID',
    inputType: 'number',
    placeholder: '1 for Ethereum',
    value: '1',
  },
  {
    id: 'timestamp',
    type: 'value',
    category: BLOCK_CATEGORIES.VALUES,
    label: 'Timestamp',
    inputType: 'number',
    placeholder: 'Unix timestamp',
    value: '',
  },
  // Logic Operators
  {
    id: 'and',
    type: 'operator',
    category: BLOCK_CATEGORIES.OPERATORS,
    label: 'AND',
    inputs: [
      { id: 'left', type: ['condition'], label: 'Condition' },
      { id: 'right', type: ['condition'], label: 'Condition' },
    ],
  },
  {
    id: 'or',
    type: 'operator',
    category: BLOCK_CATEGORIES.OPERATORS,
    label: 'OR',
    inputs: [
      { id: 'left', type: ['condition'], label: 'Condition' },
      { id: 'right', type: ['condition'], label: 'Condition' },
    ],
  },
  {
    id: 'not',
    type: 'operator',
    category: BLOCK_CATEGORIES.OPERATORS,
    label: 'NOT',
    inputs: [
      { id: 'condition', type: ['condition'], label: 'Condition' },
    ],
  },
];

// Update the blockUtils.ts to handle these new condition types
const BlockPalette: React.FC = () => {
  return (
    <div className="h-full p-4">
      <h3 className="text-lg font-medium mb-4 sticky top-0 bg-gray-50 py-2">Blocks</h3>
      
      <div className="space-y-6">
        {Object.values(BLOCK_CATEGORIES).map((category) => (
          <div key={category} className="space-y-2">
            <h4 className="text-sm font-medium text-gray-500 uppercase sticky top-12 bg-gray-50 py-1">
              {category}
            </h4>
            <div className="grid gap-2">
              {AVAILABLE_BLOCKS.filter((block) => block.category === category).map((block) => (
                <DraggableBlock key={block.id} block={block} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlockPalette; 