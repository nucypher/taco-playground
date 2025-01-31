'use client';

import React, { useState, useCallback } from 'react';
import { Block, BLOCK_CATEGORIES } from './BlockTypes';
import DraggableBlock from './DraggableBlock';
import { AVAILABLE_BLOCKS } from './BlockDefinitions';

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
    isTemplate: true
  }), []);

  return (
    <div className="border-b border-gray-700 last:border-b-0">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-100 hover:bg-gray-800"
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
    <div className="h-full flex flex-col bg-gray-900">
      <div className="border-b border-gray-700 px-3 py-3 bg-gray-800">
        <h3 className="text-sm font-semibold text-gray-100">Blocks</h3>
        <p className="text-xs text-gray-400 mt-1">Drag blocks to build conditions</p>
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

export default BlockSidebar; 