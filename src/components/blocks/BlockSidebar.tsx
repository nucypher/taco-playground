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

  const getIcon = () => {
    switch (title) {
      case BLOCK_CATEGORIES.CONDITIONS:
        return (
          <svg className="w-5 h-5 text-taco" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
              d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5M15 15l5.25 5.25" />
          </svg>
        );
      case BLOCK_CATEGORIES.OPERATORS:
        return (
          <svg className="w-5 h-5 text-taco" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
              d="M3.75 9h16.5m-16.5 6.75h16.5" />
          </svg>
        );
      case BLOCK_CATEGORIES.VALUES:
        return (
          <svg className="w-5 h-5 text-taco" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
              d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
            <path strokeLinecap="round" strokeWidth={1.5} d="M6 6h.008v.008H6V6z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="border-b border-white/5 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full bg-white/5 border-b border-white/10 px-6 py-3"
      >
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-white/5 rounded-lg border border-white/10">
            {getIcon()}
          </div>
          <div className="flex items-center justify-between w-full">
            <h3 className="text-xs font-medium text-white tracking-wide uppercase">{title}</h3>
            <span className="text-white/60 transform transition-transform duration-200">
              {isOpen ? '−' : '+'}
            </span>
          </div>
        </div>
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
    [BLOCK_CATEGORIES.CONDITIONS]: false,
    [BLOCK_CATEGORIES.OPERATORS]: false,
    [BLOCK_CATEGORIES.VALUES]: false,
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
      <div className="bg-white/5 border-b border-white/10 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/5 rounded-lg border border-white/10">
            <svg className="w-5 h-5 text-taco" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm0 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10-10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zm0 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-white tracking-wide uppercase">Blocks</h3>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto
        scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-white/5
        hover:scrollbar-thumb-white/10
        [&::-webkit-scrollbar]:w-2
        [&::-webkit-scrollbar-track]:bg-white/5
        [&::-webkit-scrollbar-thumb]:bg-white/5
        [&::-webkit-scrollbar-thumb]:rounded-full
        [&::-webkit-scrollbar-thumb]:border-2
        [&::-webkit-scrollbar-thumb]:border-transparent
        [&::-webkit-scrollbar-thumb]:bg-clip-padding
        [&::-webkit-scrollbar-thumb]:hover:bg-white/10
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