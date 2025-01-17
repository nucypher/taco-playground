'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { Block } from './BlockTypes';
import DraggableBlock from './DraggableBlock';
import { blocksToJson } from './blockUtils';

interface BlockWorkspaceProps {
  onConditionChange: (condition: any) => void;
}

const BlockWorkspace: React.FC<BlockWorkspaceProps> = ({ onConditionChange }) => {
  const [blocks, setBlocks] = useState<Block[]>([]);

  useEffect(() => {
    const json = blocksToJson(blocks);
    onConditionChange(json);
  }, [blocks, onConditionChange]);

  const moveBlock = useCallback((dragIndex: number, hoverIndex: number) => {
    setBlocks(prevBlocks => {
      const updatedBlocks = [...prevBlocks];
      const [removed] = updatedBlocks.splice(dragIndex, 1);
      updatedBlocks.splice(hoverIndex, 0, removed);
      return updatedBlocks;
    });
  }, []);

  const connectBlocks = useCallback((sourceBlock: Block, targetBlock: Block, inputId: string) => {
    setBlocks(prev => {
      // First, find all blocks in the workspace (including nested ones)
      const findAllBlocks = (blocks: Block[]): Block[] => {
        return blocks.reduce((acc: Block[], block) => {
          acc.push(block);
          if (block.inputs) {
            block.inputs.forEach(input => {
              if (input.connected) {
                acc.push(...findAllBlocks([input.connected]));
              }
            });
          }
          return acc;
        }, []);
      };

      const allBlocks = findAllBlocks(prev);
      
      // Remove the source block if it exists anywhere in the workspace
      const sourceBlockExists = allBlocks.find(b => b.id === sourceBlock.id);
      let updatedBlocks = sourceBlockExists 
        ? prev.map(block => removeBlockFromInputs(block, sourceBlock.id))
            .filter(block => block.id !== sourceBlock.id)
        : [...prev];

      // Update the target block's inputs
      updatedBlocks = updatedBlocks.map(block => {
        if (block.id === targetBlock.id) {
          return {
            ...block,
            inputs: block.inputs?.map(input => 
              input.id === inputId ? { ...input, connected: sourceBlock } : input
            ),
          };
        }
        return updateNestedBlocks(block, targetBlock.id, sourceBlock, inputId);
      });

      return updatedBlocks;
    });
  }, []);

  // Helper function to remove a block from any inputs
  const removeBlockFromInputs = (block: Block, blockIdToRemove: string): Block => {
    if (!block.inputs) return block;
    return {
      ...block,
      inputs: block.inputs.map(input => ({
        ...input,
        connected: input.connected?.id === blockIdToRemove 
          ? undefined 
          : input.connected 
            ? removeBlockFromInputs(input.connected, blockIdToRemove)
            : undefined
      }))
    };
  };

  // Helper function to update nested blocks
  const updateNestedBlocks = (block: Block, targetId: string, sourceBlock: Block, inputId: string): Block => {
    if (!block.inputs) return block;
    return {
      ...block,
      inputs: block.inputs.map(input => ({
        ...input,
        connected: input.connected 
          ? input.connected.id === targetId
            ? {
                ...input.connected,
                inputs: input.connected.inputs?.map(nestedInput =>
                  nestedInput.id === inputId 
                    ? { ...nestedInput, connected: sourceBlock }
                    : nestedInput
                )
              }
            : updateNestedBlocks(input.connected, targetId, sourceBlock, inputId)
          : undefined
      }))
    };
  };

  const [{ isOver }, drop] = useDrop<Block & { isWorkspaceBlock?: boolean; index?: number }, void, { isOver: boolean }>(() => ({
    accept: 'block',
    drop: (item, monitor) => {
      const didDrop = monitor.didDrop();
      if (didDrop) {
        return;
      }

      // If it's a workspace block being reordered, don't add it again
      if (item.isWorkspaceBlock && typeof item.index === 'number') {
        return;
      }

      // Only add new non-value blocks when dropping directly on the workspace
      if (!item.isWorkspaceBlock && monitor.isOver({ shallow: true }) && item.type !== 'value') {
        // Create a new block instance by removing the -template suffix and adding timestamp
        const baseId = item.id.replace('-template', '');
        const newBlock = { 
          ...item, 
          id: `${baseId}-${Date.now()}` 
        };
        setBlocks(prev => [...prev, newBlock]);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }) && !monitor.getItem()?.type === 'value',
    }),
  }));

  const removeBlock = useCallback((blockId: string) => {
    setBlocks(prev => {
      const updatedBlocks = prev.map(block => ({
        ...block,
        inputs: block.inputs?.map(input => ({
          ...input,
          connected: input.connected?.id === blockId ? undefined : input.connected
        }))
      }));

      const filteredBlocks = updatedBlocks.filter(block => block.id !== blockId);
      return filteredBlocks;
    });
  }, []);

  const handleValueChange = useCallback((blockId: string, value: string) => {
    setBlocks(prev => {
      const updatedBlocks = prev.map(block => {
        if (block.id === blockId) {
          return { ...block, value };
        }
        if (block.inputs) {
          return {
            ...block,
            inputs: block.inputs.map(input => {
              if (input.connected?.id === blockId) {
                return {
                  ...input,
                  connected: { ...input.connected, value }
                };
              }
              return input;
            })
          };
        }
        return block;
      });
      return updatedBlocks;
    });
  }, []);

  return (
    <div
      ref={drop}
      className={`
        h-full overflow-y-auto p-4
        ${isOver ? 'bg-gray-800' : 'bg-gray-900'}
        transition-colors duration-200
      `}
    >
      <div className="space-y-3">
        {blocks.map((block, index) => (
          <DraggableBlock 
            key={block.id} 
            block={block}
            index={index}
            moveBlock={moveBlock}
            isWorkspaceBlock={true}
            onConnect={connectBlocks}
            onRemove={removeBlock}
            onValueChange={handleValueChange}
          />
        ))}
        {blocks.length === 0 && (
          <div className="flex flex-col items-center justify-center h-[500px] text-gray-500">
            <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <p>Drag blocks here to build your condition</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockWorkspace; 