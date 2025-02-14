'use client';

import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import BlockPalette from './blocks/BlockPalette';
import BlockWorkspace from './blocks/BlockWorkspace';
import { TacoCondition } from '../types/taco';

interface ConditionBuilderProps {
  onConditionChange: (condition: TacoCondition | null) => void;
}

const ConditionBuilder: React.FC<ConditionBuilderProps> = ({ onConditionChange }) => {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid grid-cols-12 gap-6 h-full">
        <div className="col-span-3 bg-gray-50 rounded-lg overflow-hidden">
          <div className="h-full overflow-y-auto">
            <BlockPalette />
          </div>
        </div>
        
        <div className="col-span-9 h-full">
          <BlockWorkspace onConditionChange={onConditionChange} />
        </div>
      </div>
    </DndProvider>
  );
};

export default ConditionBuilder; 