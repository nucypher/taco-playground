'use client';

import React from 'react';
import { BLOCK_CATEGORIES } from './BlockTypes';
import DraggableBlock from './DraggableBlock';
import { AVAILABLE_BLOCKS } from './BlockDefinitions';

const BlockPalette: React.FC = () => {
  return (
    <div className="h-full p-4">
      <h3 className="text-lg font-medium mb-4 sticky top-0 bg-gray-50 py-2">Blocks</h3>
      
      <div className="space-y-6">
        {Object.values(BLOCK_CATEGORIES).map((category) => {
          const blocksInCategory = AVAILABLE_BLOCKS.filter(block => block.category === category);

          return (
            <div key={category} className="space-y-2">
              <h4 className="text-sm font-medium text-gray-500 uppercase sticky top-12 bg-gray-50 py-1">
                {category}
              </h4>
              <div className="grid gap-2">
                {blocksInCategory.map((block) => (
                  <DraggableBlock 
                    key={block.id} 
                    block={block}
                    isWorkspaceBlock={false}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BlockPalette; 