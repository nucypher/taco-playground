'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { Block } from './BlockTypes';
import DraggableBlock from './DraggableBlock';
import { blocksToJson } from './blockUtils';

interface BlockWorkspaceProps {
  onConditionChange: (condition: any) => void;
}

const BlockWorkspace: React.FC<BlockWorkspaceProps> = ({ onConditionChange }) => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const prevJsonRef = useRef<string>('');

  // Generate JSON whenever blocks change
  useEffect(() => {
    const json = blocksToJson(blocks);
    if (json === null) return;

    // Convert to string for comparison
    const jsonString = JSON.stringify(json);
    
    console.log('BlockWorkspace: Generating JSON', {
      blocks,
      json,
      jsonString,
      prevJson: prevJsonRef.current
    });
    
    // Only update if the JSON has actually changed
    if (jsonString !== prevJsonRef.current) {
      console.log('BlockWorkspace: JSON changed, updating');
      prevJsonRef.current = jsonString;
      onConditionChange(json);
    }
  }, [blocks, onConditionChange]);

  const handleBlockUpdate = useCallback((updatedBlock: Block) => {
    console.log('BlockWorkspace: Handling block update', {
      updatedBlock,
      currentBlocks: blocks
    });
    
    setBlocks(prev => 
      prev.map(block => 
        block.id === updatedBlock.id ? updatedBlock : block
      )
    );
  }, [blocks]);

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'block',
    canDrop: (item: any) => {
      // Allow both condition and operator blocks in the workspace
      return (item.type === 'condition' || item.type === 'operator') && item.isTemplate;
    },
    drop: (item: any, monitor) => {
      if (monitor.canDrop() && item.isTemplate) {
        setBlocks(prev => {
          // Create a deep copy of the block to ensure properties are preserved
          const newBlock = JSON.parse(JSON.stringify({
            id: item.id,
            type: item.type,
            category: item.category,
            label: item.label,
            inputs: item.inputs,
            properties: item.properties,
            isTemplate: false,
          }));
          
          return [...prev, newBlock];
        });
      }
      
      return { dropped: true };
    },
    collect: monitor => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }), []);

  const elementRef = useRef<HTMLDivElement>(null);
  drop(elementRef);

  return (
    <div
      ref={elementRef}
      className={`
        min-h-[400px] p-4 rounded-lg
        ${isOver && canDrop ? 'bg-gray-800' : 'bg-gray-900'}
        ${isOver && !canDrop ? 'bg-red-900/20' : ''}
        ${!isOver && canDrop ? 'bg-gray-900 border-2 border-dashed border-gray-700' : ''}
      `}
    >
      <div className="space-y-4">
        {blocks.map((block) => (
          <DraggableBlock
            key={block.id}
            block={block}
            isWorkspaceBlock={true}
            onBlockUpdate={handleBlockUpdate}
          />
        ))}
        {blocks.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            Drag condition or operator blocks here
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockWorkspace; 