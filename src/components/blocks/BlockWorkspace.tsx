'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { Block } from './BlockTypes';
import DraggableBlock from './DraggableBlock';
import PresetButtons from './PresetButtons';
import { blocksToJson } from './blockUtils';

interface BlockWorkspaceProps {
  onConditionChange: (condition: any) => void;
}

const BlockWorkspace: React.FC<BlockWorkspaceProps> = ({ onConditionChange }) => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const json = blocksToJson(blocks);
    console.log('Generated JSON:', json);
    onConditionChange(json);
  }, [blocks, onConditionChange]);

  // Helper function to check if a block is connected to any other block
  const isBlockConnected = useCallback((blockId: string, blocks: Block[]): boolean => {
    return blocks.some(block => 
      block.inputs?.some(input => input.connected?.id === blockId)
    );
  }, []);

  // Get top-level (unconnected) blocks
  const getTopLevelBlocks = useCallback((blocks: Block[]): Block[] => {
    return blocks.filter(block => !isBlockConnected(block.id, blocks));
  }, [isBlockConnected]);

  const handleAddPresetBlocks = useCallback((newBlocks: Block[]) => {
    console.log('Adding preset blocks:', newBlocks);
    setBlocks(prevBlocks => {
      const topLevelBlocks = getTopLevelBlocks(prevBlocks);
      const hasTopLevelCondition = topLevelBlocks.some(block => 
        block.type === 'condition' || block.type === 'operator'
      );

      // If there's already a top-level condition and we're trying to add another
      if (hasTopLevelCondition && newBlocks[0].type === 'condition') {
        setError('Please use an operator block to combine multiple conditions');
        return prevBlocks;
      }

      setError(''); // Clear any existing error
      const updatedBlocks = [...prevBlocks, ...newBlocks];
      console.log('Updated blocks:', updatedBlocks);
      return updatedBlocks;
    });
  }, [getTopLevelBlocks]);

  // Also update the drop handling to prevent multiple top-level conditions
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'block',
    drop: (item: Block & { isTemplate?: boolean }) => {
      if (!item.isTemplate) return;

      setBlocks(prevBlocks => {
        const topLevelBlocks = getTopLevelBlocks(prevBlocks);
        const hasTopLevelCondition = topLevelBlocks.some(block => 
          block.type === 'condition' || block.type === 'operator'
        );

        if (hasTopLevelCondition && item.type === 'condition') {
          setError('Please use an operator block to combine multiple conditions');
          return prevBlocks;
        }

        setError('');
        const newBlock = {
          ...item,
          id: item.id.replace('-template', '') + `-${Date.now()}`
        };
        return [...prevBlocks, newBlock];
      });
    },
    collect: monitor => ({
      isOver: monitor.isOver(),
    }),
  }), [getTopLevelBlocks]);

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

  const handleClearWorkspace = useCallback(() => {
    setBlocks([]);
    setError('');
  }, []);

  return (
    <div className="h-full flex flex-col">
      <PresetButtons 
        onAddBlocks={handleAddPresetBlocks} 
        onClearWorkspace={handleClearWorkspace}
      />
      {error && (
        <div className="px-4 py-2 bg-red-900/50 border-b border-red-700">
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}
      <div
        ref={drop}
        className={`
          flex-1 overflow-y-auto p-4
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
              <p>Drag blocks here or use presets above</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlockWorkspace; 