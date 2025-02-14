'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { Block } from './BlockTypes';
import { TacoCondition } from '../../types/taco';
import DraggableBlock from './DraggableBlock';
import { blocksToJson } from './blockUtils';

interface BlockWorkspaceProps {
  onConditionChange: (condition: TacoCondition | null) => void;
}

interface DragItem extends Omit<Block, 'id'> {
  id: string;
  isTemplate: boolean;
}

const BlockWorkspace: React.FC<BlockWorkspaceProps> = ({ onConditionChange }) => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [dropError, setDropError] = useState<string>('');
  const prevJsonRef = useRef<string>('');

  // Clear error message after a delay
  useEffect(() => {
    if (dropError) {
      const timer = setTimeout(() => setDropError(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [dropError]);

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

  const handleClear = () => {
    setBlocks([]);
    setDropError('');
    prevJsonRef.current = '';
    onConditionChange(null);
  };

  // Helper function to check if a block is connected to an operator
  const isBlockConnectedToOperator = (blockId: string): boolean => {
    return blocks.some(block => 
      block.type === 'operator' && 
      block.inputs?.some(input => input.connected?.id === blockId)
    );
  };

  // Helper function to count standalone condition blocks
  const getStandaloneConditionCount = (): number => {
    return blocks.filter(block => 
      block.type === 'condition' && !isBlockConnectedToOperator(block.id)
    ).length;
  };

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'block',
    canDrop: (item: DragItem) => {
      // Always allow operator blocks
      if (item.type === 'operator' && item.isTemplate) {
        return true;
      }

      // For condition blocks, only allow if there are no standalone conditions
      if (item.type === 'condition' && item.isTemplate) {
        const standaloneConditions = getStandaloneConditionCount();
        if (standaloneConditions > 0) {
          setDropError('Use an operator block (AND/OR) to combine multiple conditions');
          return false;
        }
        return true;
      }

      return false;
    },
    drop: (item: DragItem, monitor) => {
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
  }), [blocks]);

  const elementRef = useRef<HTMLDivElement>(null);
  drop(elementRef);

  return (
    <div className="space-y-3 bg-black border border-white/10 rounded-lg p-6 flex flex-col flex-1">
      <div className="flex justify-between items-center border-b border-white/10 pb-4">
        <h3 className="text-sm font-medium text-white tracking-wide uppercase">
          Workspace
        </h3>
        {blocks.length > 0 && (
          <button
            onClick={handleClear}
            className="px-3 py-1.5 bg-white/5 text-white rounded-lg text-sm font-medium
              border border-white/10 transition-all duration-200
              hover:bg-white/10 hover:border-white/20
              focus:outline-none focus:ring-1 focus:ring-white/20
              flex items-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
              />
            </svg>
            <span>Clear Workspace</span>
          </button>
        )}
      </div>

      <div
        ref={elementRef}
        className={`
          flex-1 min-h-[400px] p-4 rounded-lg overflow-y-auto
          bg-black border transition-all duration-200
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
          ${isOver && canDrop ? 'border-white/20 bg-white/5' : 'border-white/10'}
          ${isOver && !canDrop ? 'border-red-500/20 bg-red-500/5' : ''}
          ${!isOver && canDrop ? 'border-white/20 border-dashed' : ''}
        `}
      >
        <div className="space-y-4 min-w-full">
          {blocks.map((block) => (
            <DraggableBlock
              key={block.id}
              block={block}
              isWorkspaceBlock={true}
              onBlockUpdate={handleBlockUpdate}
            />
          ))}
          {blocks.length === 0 && (
            <div className="text-center text-white/40 py-8">
              Drag condition or operator blocks here
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {dropError && (
        <div className="mt-3 p-3 bg-red-500/5 border border-red-500/20 rounded-lg
          text-red-400 text-sm font-medium animate-fade-in">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{dropError}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockWorkspace; 