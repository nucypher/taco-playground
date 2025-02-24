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

interface DropResult {
  handled?: boolean;
  dropped?: boolean;
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
    
    // Only update if the JSON has actually changed
    if (jsonString !== prevJsonRef.current) {
      prevJsonRef.current = jsonString;
      onConditionChange(json);
    }
  }, [blocks, onConditionChange]);

  const handleBlockUpdate = useCallback((updatedBlock: Block) => {
    setBlocks(prev => 
      prev.map(block => 
        block.id === updatedBlock.id ? updatedBlock : block
      )
    );
  }, []);

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

  const elementRef = useRef<HTMLDivElement>(null);

  const [{ isOver, canDrop }, drop] = useDrop<DragItem, DropResult, { isOver: boolean; canDrop: boolean }>(() => ({
    accept: 'block',
    canDrop: (item: DragItem, monitor) => {
      // Check if the drop was already handled by a nested target
      const dropResult = monitor.getDropResult<DropResult>();
      if (dropResult?.handled) {
        return false;
      }

      // Only allow drops directly on the workspace (not on nested drop targets)
      const isDirectDrop = monitor.isOver({ shallow: true });
      if (!isDirectDrop) return false;

      // Check if we're dropping inside an operator or condition
      const target = monitor.getClientOffset();
      if (target) {
        const element = document.elementFromPoint(target.x, target.y);
        if (element?.closest('[data-block-type="operator"], [data-block-type="condition"]')) {
          return false;
        }
      }

      // Always allow operator blocks at the root level
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
      // Check if the drop was handled by a nested target
      const dropResult = monitor.getDropResult<DropResult>();
      if (dropResult?.handled) {
        return dropResult;
      }

      // Only handle drops directly on the workspace
      if (!monitor.isOver({ shallow: true })) {
        return;
      }

      // Check if we're dropping inside an operator or condition
      const target = monitor.getClientOffset();
      if (target) {
        const element = document.elementFromPoint(target.x, target.y);
        if (element?.closest('[data-block-type="operator"], [data-block-type="condition"]')) {
          return;
        }
      }

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
        
        return { dropped: true, handled: true };
      }
    },
    collect: monitor => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  }), [blocks]);

  drop(elementRef);

  return (
    <div className="space-y-3 bg-black border border-white/5 rounded-lg p-6 flex flex-col flex-1">
      <div className="flex justify-between items-center border-b border-white/10 -mx-6 px-6 py-4 -mt-6 bg-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/5 rounded-lg border border-white/10">
            <svg className="w-5 h-5 text-taco" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm0 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10-10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zm0 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-white tracking-wide uppercase">Workspace</h3>
        </div>
        {blocks.length > 0 && (
          <button
            onClick={handleClear}
            className="px-3 py-1.5 bg-white/5 text-white rounded-lg text-sm font-medium
              border border-white/5 transition-all duration-200
              hover:bg-white/10 hover:border-white/10
              focus:outline-none focus:ring-1 focus:ring-white/10
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
          ${isOver && canDrop ? 'border-white/10 bg-white/5' : 'border-white/5'}
          ${isOver && !canDrop ? 'border-red-500/10 bg-red-500/5' : ''}
          ${!isOver && canDrop ? 'border-white/10 border-dashed' : ''}
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
            <div className="flex items-center justify-center h-full min-h-[200px]">
              <div className="text-white/40 text-sm font-medium">
                Drag condition or operator blocks here
              </div>
            </div>
          )}
        </div>
      </div>

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