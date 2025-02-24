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
          } else {
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
          }

          // Update the parent input with the modified connected block
          parentInput.connected = connectedBlock;
          onBlockUpdate(updatedBlock);
        }
      }
    } else if (block.type === 'operator') {
      const input = updatedBlock.inputs?.find((input: BlockInput) => input.id === inputId);
      if (input) {
        if (item.type === 'value') {
          // For value blocks, just set the value directly
          input.value = item.value;
        } else if (!input.connected) {
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
        }
        onBlockUpdate(updatedBlock);
      }
    } else if (block.type === 'condition') {
      // Handle direct drops into condition inputs
      const input = updatedBlock.inputs?.find((input: BlockInput) => input.id === inputId);
      if (input && item.type === 'value') {
        // For value blocks, just set the value directly
        input.value = item.value;
        onBlockUpdate(updatedBlock);
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
    
    console.log('Handling value change:', {
      inputId,
      value,
      parentPath,
      currentBlock: block
    });

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

  const renderConnectedBlock = (connectedBlock: Block, parentPath: string[]) => {
    if (connectedBlock.type === 'operator') {
      // Render nested operator block
      return (
        <div className="mt-2 bg-black border border-white/5 rounded-lg p-3
          transition-all duration-200 hover:border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400" />
            <div className="font-medium text-sm">{connectedBlock.label}</div>
          </div>
          {connectedBlock.inputs && connectedBlock.inputs.length > 0 && (
            <div className="mt-3 space-y-3">
              {connectedBlock.inputs.map((input) => (
                <div key={input.id} className="space-y-1.5">
                  <label className="text-xs text-white/60 font-medium">
                    {input.label}
                  </label>
                  <DropTarget
                    inputId={input.id}
                    parentInputId={parentPath[parentPath.length - 1]}
                    isWorkspaceBlock={isWorkspaceBlock}
                    onDrop={handleDrop}
                    className="flex-1 px-3 py-2 text-sm rounded-lg
                      transition-all duration-200 ease-in-out
                      bg-white/5 border border-white/10
                      hover:border-white/20"
                  >
                    {input.connected ? (
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          {renderConnectedBlock(input.connected, [...parentPath, input.id])}
                        </div>
                        {isWorkspaceBlock && (
                          <button
                            onClick={() => handleRemoveCondition(input.id)}
                            className="ml-2 p-1 rounded-full text-white/40 hover:text-white/80
                              hover:bg-white/10 transition-colors duration-200"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="text-white/40 text-sm">
                        Drop condition or operator here
                      </div>
                    )}
                  </DropTarget>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (connectedBlock.type === 'condition') {
      return (
        <div className="mt-2 bg-black border border-white/5 rounded-lg p-3
          transition-all duration-200 hover:border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-400" />
            <div className="font-medium text-sm">{connectedBlock.label}</div>
          </div>
          {connectedBlock.inputs && connectedBlock.inputs.length > 0 && (
            <div className="mt-3 space-y-3">
              {connectedBlock.inputs.map((input) => (
                <div key={input.id} className="space-y-1.5">
                  <label className="text-xs text-white/60 font-medium">
                    {input.label}
                  </label>
                  <DropTarget
                    inputId={input.id}
                    isWorkspaceBlock={isWorkspaceBlock}
                    onDrop={handleDrop}
                    className="flex-1"
                  >
                    <input
                      type={input.inputType || 'text'}
                      className="w-full px-3 py-2 text-sm bg-white/5 rounded-lg
                        border border-white/5 text-white placeholder-white/30
                        transition-all duration-200
                        focus:border-white/20 focus:ring-1 focus:ring-white/10
                        hover:border-white/10"
                      value={input.value || ''}
                      onChange={(e) => handleValueChange(input.id, e)}
                      onClick={(e) => e.stopPropagation()}
                      placeholder={input.placeholder || `Enter ${input.label.toLowerCase()}...`}
                    />
                  </DropTarget>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    return (
      <div className="text-sm text-white/80">
        {connectedBlock.label}
      </div>
    );
  };

  return (
    <div
      ref={combineRefs(elementRef, drag)}
      className={`
        relative
        ${block.type === 'condition' ? 'bg-black border border-white/10' : ''}
        ${block.type === 'operator' ? 'bg-black border border-white/10' : ''}
        ${block.type === 'value' ? 'bg-black border border-white/10' : ''}
        text-white p-4 rounded-lg cursor-move
        transition-all duration-200 ease-in-out
        hover:border-white/20 hover:shadow-[0_0_10px_rgba(255,255,255,0.05)]
        active:scale-[0.98]
        ${isDragging ? 'opacity-50 shadow-lg rotate-2' : 'opacity-100'}
      `}
    >
      <div className="flex items-center gap-2">
        {/* Block Type Indicator */}
        <div className={`
          w-2 h-2 rounded-full
          ${block.type === 'condition' ? 'bg-purple-400' : ''}
          ${block.type === 'operator' ? 'bg-blue-400' : ''}
          ${block.type === 'value' ? 'bg-emerald-400' : ''}
        `} />
        <div className="font-medium tracking-wide text-sm">
          {block.label}
          {block.type === 'value' && block.value && (
            <span className="ml-2 text-white/60 font-mono text-xs truncate max-w-[120px] inline-block align-bottom">
              {block.value.length > 12 
                ? `${block.value.slice(0, 6)}...${block.value.slice(-4)}`
                : block.value}
            </span>
          )}
        </div>
      </div>

      {(block.type === 'condition' || block.type === 'operator') && block.inputs && block.inputs.length > 0 && (
        <div className="mt-3 space-y-3">
          {block.inputs.map((input) => (
            <div key={input.id} className="space-y-1.5">
              <label className="text-xs text-white/60 font-medium">
                {input.label}
              </label>
              {block.type === 'operator' ? (
                <DropTarget
                  inputId={input.id}
                  isWorkspaceBlock={isWorkspaceBlock}
                  onDrop={handleDrop}
                  className="flex-1 px-3 py-2 text-sm rounded-lg
                    transition-all duration-200 ease-in-out
                    bg-white/5 border border-white/10
                    hover:border-white/20"
                >
                  {input.connected ? (
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        {renderConnectedBlock(input.connected, [input.id])}
                      </div>
                      {isWorkspaceBlock && (
                        <button
                          onClick={() => handleRemoveCondition(input.id)}
                          className="ml-2 p-1 rounded-full text-white/40 hover:text-white/80
                            hover:bg-white/10 transition-colors duration-200"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="text-white/40 text-sm">
                      Drop condition or operator here
                    </div>
                  )}
                </DropTarget>
              ) : (
                <div className="flex-1">
                  <DropTarget
                    inputId={input.id}
                    isWorkspaceBlock={isWorkspaceBlock}
                    onDrop={handleDrop}
                    className="flex-1"
                  >
                    <input
                      type={input.inputType || 'text'}
                      className="w-full px-3 py-2 text-sm bg-white/5 rounded-lg
                        border border-white/5 text-white placeholder-white/30
                        transition-all duration-200
                        focus:border-white/20 focus:ring-1 focus:ring-white/10
                        hover:border-white/10"
                      value={input.value || ''}
                      onChange={(e) => handleValueChange(input.id, e)}
                      onClick={(e) => e.stopPropagation()}
                      placeholder={input.placeholder || `Enter ${input.label.toLowerCase()}...`}
                    />
                  </DropTarget>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DraggableBlock; 