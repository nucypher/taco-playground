'use client';

import React, { useState, useCallback } from 'react';
import { Block, BLOCK_CATEGORIES } from './BlockTypes';
import DraggableBlock from './DraggableBlock';

interface CategorySectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  blocks: Block[];
}

const CategorySection: React.FC<CategorySectionProps> = ({
  title,
  isOpen,
  onToggle,
  blocks,
}) => {
  // Generate a stable template ID for each block
  const getTemplateBlock = useCallback((block: Block) => ({
    ...block,
    id: `${block.id}-template`,
    isTemplate: true // Add a flag to identify template blocks
  }), []);

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
      >
        <span>{title}</span>
        <span className="transform transition-transform duration-200">
          {isOpen ? '−' : '+'}
        </span>
      </button>
      {isOpen && (
        <div className="px-3 py-2 space-y-2">
          {blocks.map((block) => (
            <DraggableBlock
              key={block.id}
              block={getTemplateBlock(block)}
              isWorkspaceBlock={false}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const BlockSidebar: React.FC = () => {
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    [BLOCK_CATEGORIES.CONDITIONS]: true,
    [BLOCK_CATEGORIES.VALUES]: true,
    [BLOCK_CATEGORIES.OPERATORS]: true,
  });

  const toggleCategory = (category: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const categorizedBlocks = Object.values(BLOCK_CATEGORIES).map(category => ({
    category,
    blocks: AVAILABLE_BLOCKS.filter(block => block.category === category)
  }));

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-gray-200 px-3 py-3 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-900">Blocks</h3>
        <p className="text-xs text-gray-500 mt-1">Drag blocks to build conditions</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        {categorizedBlocks.map(({ category, blocks }) => (
          <CategorySection
            key={category}
            title={category}
            blocks={blocks}
            isOpen={openCategories[category]}
            onToggle={() => toggleCategory(category)}
          />
        ))}
      </div>
    </div>
  );
};

export const AVAILABLE_BLOCKS: Block[] = [
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
  {
    id: 'time-range',
    type: 'condition',
    category: BLOCK_CATEGORIES.CONDITIONS,
    label: 'Time Range',
    inputs: [
      { id: 'startTime', type: ['value'], label: 'Start Time' },
      { id: 'endTime', type: ['value'], label: 'End Time' },
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

  // Comparison Operators
  {
    id: 'greater-than',
    type: 'operator',
    category: BLOCK_CATEGORIES.OPERATORS,
    label: 'Greater Than',
    inputs: [
      { id: 'value', type: ['value'], label: 'Value' },
      { id: 'threshold', type: ['value'], label: 'Threshold' },
    ],
  },
  {
    id: 'less-than',
    type: 'operator',
    category: BLOCK_CATEGORIES.OPERATORS,
    label: 'Less Than',
    inputs: [
      { id: 'value', type: ['value'], label: 'Value' },
      { id: 'threshold', type: ['value'], label: 'Threshold' },
    ],
  },

  // Logic Operators
  {
    id: 'and',
    type: 'operator',
    category: BLOCK_CATEGORIES.OPERATORS,
    label: 'AND',
    inputs: [
      { id: 'left', type: ['condition', 'operator'], label: 'Condition' },
      { id: 'right', type: ['condition', 'operator'], label: 'Condition' },
    ],
  },
  {
    id: 'or',
    type: 'operator',
    category: BLOCK_CATEGORIES.OPERATORS,
    label: 'OR',
    inputs: [
      { id: 'left', type: ['condition', 'operator'], label: 'Condition' },
      { id: 'right', type: ['condition', 'operator'], label: 'Condition' },
    ],
  },
  {
    id: 'not',
    type: 'operator',
    category: BLOCK_CATEGORIES.OPERATORS,
    label: 'NOT',
    inputs: [
      { id: 'condition', type: ['condition', 'operator'], label: 'Condition' },
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
  {
    id: 'threshold',
    type: 'value',
    category: BLOCK_CATEGORIES.VALUES,
    label: 'Threshold',
    inputType: 'number',
    placeholder: 'Enter threshold value',
    value: '',
  },
];

export default BlockSidebar; 