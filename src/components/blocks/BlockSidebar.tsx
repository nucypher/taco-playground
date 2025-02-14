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
    <div className="border-b border-white/10 last:border-b-0">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium 
          text-white/80 hover:bg-white/5 transition-colors"
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
    [BLOCK_CATEGORIES.OPERATORS]: true,
    [BLOCK_CATEGORIES.VALUES]: true,
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
    <div className="h-full flex flex-col bg-black">
      <div className="border-b border-white/10 px-3 py-3">
        <h3 className="text-sm font-medium text-white tracking-wide uppercase">Blocks</h3>
        <p className="text-xs text-white/60 mt-1">Drag blocks to build conditions</p>
      </div>
      <div className="flex-1 overflow-y-auto
        scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-white/10
        hover:scrollbar-thumb-white/20
        [&::-webkit-scrollbar]:w-2
        [&::-webkit-scrollbar-track]:bg-white/5
        [&::-webkit-scrollbar-thumb]:bg-white/10
        [&::-webkit-scrollbar-thumb]:rounded-full
        [&::-webkit-scrollbar-thumb]:border-2
        [&::-webkit-scrollbar-thumb]:border-transparent
        [&::-webkit-scrollbar-thumb]:bg-clip-padding
        [&::-webkit-scrollbar-thumb]:hover:bg-white/20
      ">
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