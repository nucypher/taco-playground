'use client';

import React, { useRef, useCallback } from 'react';
import { useDrag } from 'react-dnd';
import { Block, BlockInput } from './BlockTypes';
import { DropTarget } from './DropTarget';
import { DragItem, DragRef } from './types';

interface DraggableBlockProps {
  block: Block;
  isWorkspaceBlock?: boolean;
  onBlockUpdate?: (updatedBlock: Block) => void;
}

const DraggableBlock: React.FC<DraggableBlockProps> = ({ 
  block,
  isWorkspaceBlock = false,
  onBlockUpdate,
}) => {
  const elementRef = useRef<HTMLDivElement>(null);

  const handleDrop = useCallback((inputId: string, item: DragItem, parentInputId?: string) => {
    if (!onBlockUpdate) return;

    const updatedBlock = JSON.parse(JSON.stringify(block));
    
    if (parentInputId) {
      // Handle drops into nested conditions
      const parentInput = updatedBlock.inputs?.find((input: BlockInput) => input.id === parentInputId);
      if (parentInput?.connected) {
        const connectedBlock = parentInput.connected;
        const targetInput = connectedBlock.inputs?.find((input: BlockInput) => input.id === inputId);
        if (targetInput) {
          if (item.type === 'value') {
            // For value blocks, just set the value directly
            targetInput.value = item.value;
            // Update the parent input with the modified connected block
            parentInput.connected = connectedBlock;
            onBlockUpdate(updatedBlock);
            return { handled: true }; // Return early after handling value drop
          }

          // Create a new block from the dropped item
          const droppedBlock = JSON.parse(JSON.stringify(item)) as Block;
          droppedBlock.isTemplate = false;

          // Initialize values for all inputs in the dropped block
          if (droppedBlock.inputs) {
            droppedBlock.inputs = droppedBlock.inputs.map((input: BlockInput) => ({
              ...input,
              value: input.value || '',
              inputType: input.inputType || 'text'
            }));
          }

          // Connect the dropped block
          targetInput.connected = droppedBlock;

          // If this is an operator block, add a new input slot if needed
          if (connectedBlock.type === 'operator') {
            const connectedCount = connectedBlock.inputs?.filter((input: BlockInput) => input.connected).length || 0;
            const maxInputs = connectedBlock.properties?.maxInputs;
            const lastInput = connectedBlock.inputs?.[connectedBlock.inputs.length - 1];

            if (lastInput?.id === inputId && (!maxInputs || connectedCount < maxInputs)) {
              connectedBlock.inputs.push({
                id: `condition-${Date.now()}`,
                type: ['condition', 'operator'],
                label: 'Add Condition'
              });
            }
          }

          // Update the parent input with the modified connected block
          parentInput.connected = connectedBlock;
          onBlockUpdate(updatedBlock);
          return { handled: true }; // Return after handling nested drop
        }
      }
    } else if (block.type === 'operator') {
      const input = updatedBlock.inputs?.find((input: BlockInput) => input.id === inputId);
      if (input) {
        if (item.type === 'value') {
          // For value blocks, just set the value directly
          input.value = item.value;
          onBlockUpdate(updatedBlock);
          return { handled: true }; // Return early after handling value drop
        }

        if (!input.connected) {
          const droppedBlock = JSON.parse(JSON.stringify(item)) as Block;
          droppedBlock.isTemplate = false;

          // Initialize values for all inputs in the dropped block
          if (droppedBlock.inputs) {
            droppedBlock.inputs = droppedBlock.inputs.map((input: BlockInput) => ({
              ...input,
              value: input.value || '',
              inputType: input.inputType || 'text'
            }));
          }

          input.connected = droppedBlock;

          const connectedCount = updatedBlock.inputs?.filter((input: BlockInput) => input.connected).length || 0;
          input.label = `Condition ${connectedCount}`;

          const lastInput = updatedBlock.inputs?.[updatedBlock.inputs.length - 1];
          const maxInputs = updatedBlock.properties?.maxInputs;
          
          // Only add new input slot if we haven't reached maxInputs (if specified)
          if (lastInput?.id === inputId && 
              (!maxInputs || connectedCount < maxInputs)) {
            updatedBlock.inputs.push({
              id: `condition-${Date.now()}`,
              type: ['condition', 'operator'],
              label: 'Add Condition'
            });
          }
          onBlockUpdate(updatedBlock);
          return { handled: true }; // Return after handling operator drop
        }
      }
    } else if (block.type === 'condition') {
      // Handle direct drops into condition inputs
      const input = updatedBlock.inputs?.find((input: BlockInput) => input.id === inputId);
      if (input && item.type === 'value') {
        // For value blocks, just set the value directly
        input.value = item.value;
        onBlockUpdate(updatedBlock);
        return { handled: true }; // Return early after handling value drop
      }
    }
  }, [block, onBlockUpdate]);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'block',
    item: () => {
      const newId = isWorkspaceBlock ? block.id : `${block.id}-${Date.now()}`;
      const newBlock: DragItem = {
        id: newId,
        type: block.type,
        category: block.category,
        label: block.label,
        inputs: block.inputs,
        properties: block.properties,
        value: block.value,
        isTemplate: !isWorkspaceBlock,
      };
      return newBlock;
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [block, isWorkspaceBlock]);

  // Combine refs utility
  const combineRefs = useCallback((...refs: DragRef[]) => {
    return (element: HTMLDivElement | null) => {
      refs.forEach((ref) => {
        if (typeof ref === 'function') {
          ref(element);
        } else if (ref && 'current' in ref) {
          ref.current = element;
        }
      });
    };
  }, []);

  const handleValueChange = (inputId: string, e: React.ChangeEvent<HTMLInputElement>, parentPath?: string[]) => {
    if (!onBlockUpdate || !isWorkspaceBlock) return;

    const value = e.target.value;
    const updatedBlock = JSON.parse(JSON.stringify(block));
    
    // Helper function to find and update nested input following a path
    const findAndUpdateInput = (currentBlock: Block, targetInputId: string, path: string[]): boolean => {
      if (path.length === 0) {
        // We've reached the target level, look for our input
        const directInput = currentBlock.inputs?.find((input: BlockInput) => input.id === targetInputId);
        if (directInput) {
          directInput.value = value;
          return true;
        }
        return false;
      }

      // Get the next input in the path
      const nextInputId = path[0];
      const nextInput = currentBlock.inputs?.find((input: BlockInput) => input.id === nextInputId);
      
      if (nextInput?.connected) {
        // Continue down the path
        return findAndUpdateInput(nextInput.connected, targetInputId, path.slice(1));
      }
      
      return false;
    };
    
    if (parentPath && parentPath.length > 0) {
      // Find the input by following the parent path
      if (findAndUpdateInput(updatedBlock, inputId, parentPath)) {
        onBlockUpdate(updatedBlock);
      }
    } else {
      // Handle top-level inputs
      const input = updatedBlock.inputs?.find((input: BlockInput) => input.id === inputId);
      if (input) {
        input.value = value;
        onBlockUpdate(updatedBlock);
      }
    }
  };

  const handleRemoveCondition = (inputId: string) => {
    if (!onBlockUpdate) return;
    const updatedBlock = JSON.parse(JSON.stringify(block));
    
    if (block.type === 'operator' && updatedBlock.inputs) {
      // Remove the connection
      const targetInput = updatedBlock.inputs.find((input: BlockInput) => input.id === inputId);
      if (targetInput) {
        targetInput.connected = undefined;
      }

      // Filter out empty slots except the last one
      const nonEmptyInputs = updatedBlock.inputs.filter((input: BlockInput) => input.connected);
      const lastEmptyInput = {
        id: `condition-${Date.now()}`,
        type: ['condition', 'operator'],
        label: 'Add Condition'
      };

      // Rebuild the inputs array with renumbered conditions
      updatedBlock.inputs = [
        ...nonEmptyInputs.map((input: BlockInput, index: number) => ({
          ...input,
          label: `Condition ${index + 1}`
        })),
        lastEmptyInput
      ];
    }

    onBlockUpdate(updatedBlock);
  };

  return (
    <div
      ref={combineRefs(elementRef, drag)}
      className={`
        relative
        ${isDragging ? 'opacity-50' : ''}
        ${isWorkspaceBlock ? 'cursor-move' : 'cursor-grab'}
      `}
      data-block-type={block.type}
    >
      <div className={`
        bg-white/[0.03] border border-white/10 rounded-lg p-3
        transition-all duration-200 hover:border-white/20 hover:bg-white/[0.06]
        shadow-lg shadow-black/20
        ${block.type === 'operator' ? 'bg-opacity-30' : ''}
      `}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`
              w-1.5 h-1.5 rounded-full
              ${block.type === 'condition' ? 'bg-purple-400/70' : ''}
              ${block.type === 'operator' ? 'bg-blue-400/70' : ''}
              ${block.type === 'value' ? 'bg-green-400/70' : ''}
            `} />
            <span className="text-sm text-white/70">{block.label}</span>
          </div>
        </div>

        {block.inputs && block.inputs.length > 0 && (
          <div className="mt-3 space-y-3 pt-2 border-t border-white/5">
            {block.inputs.map((input: BlockInput, index) => {
              if (input.type?.includes('operator') || input.type?.includes('condition')) {
                return (
                  <div key={input.id} className={`
                    ${index !== 0 ? 'pt-3 border-t border-white/5' : ''}
                  `}>
                    <DropTarget
                      inputId={input.id}
                      isWorkspaceBlock={isWorkspaceBlock}
                      onDrop={handleDrop}
                      className="border rounded-lg transition-all duration-200"
                    >
                      {input.connected ? (
                        <div className="relative group">
                          <DraggableBlock
                            block={input.connected}
                            isWorkspaceBlock={isWorkspaceBlock}
                            onBlockUpdate={(updatedBlock) => {
                              const newBlock = JSON.parse(JSON.stringify(block));
                              const targetInput = newBlock.inputs?.find((i: BlockInput) => i.id === input.id);
                              if (targetInput) {
                                targetInput.connected = updatedBlock;
                                onBlockUpdate?.(newBlock);
                              }
                            }}
                          />
                          {isWorkspaceBlock && (
                            <button
                              onClick={() => handleRemoveCondition(input.id)}
                              className="absolute -right-1.5 -top-1.5 p-1 bg-red-500/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            >
                              <svg className="w-2.5 h-2.5 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="p-2.5 text-sm text-white/30">{input.label}</div>
                      )}
                    </DropTarget>
                  </div>
                );
              }

              // Only render input fields for direct condition blocks
              if (block.type === 'condition') {
                return (
                  <div key={input.id} className={`
                    ${index !== 0 ? 'pt-3 border-t border-white/5' : ''}
                  `}>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs text-white/50">{input.label}</span>
                      <input
                        type={input.inputType || 'text'}
                        value={input.value || ''}
                        onChange={(e) => handleValueChange(input.id, e)}
                        autoComplete="off"
                        data-form-type="other"
                        className="w-full px-2 py-1.5 text-sm bg-black/30 border border-white/5 rounded 
                          focus:outline-none focus:border-white/20 placeholder-white/20"
                        placeholder={`Enter ${input.label.toLowerCase()}`}
                      />
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DraggableBlock; 