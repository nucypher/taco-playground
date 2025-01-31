'use client';

import React, { useRef, useCallback } from 'react';
import { useDrag } from 'react-dnd';
import { Block, BlockInput } from './BlockTypes';
import { DropTarget } from './DropTarget';

interface DraggableBlockProps {
  block: Block;
  isWorkspaceBlock?: boolean;
  onBlockUpdate?: (updatedBlock: Block) => void;
  onBlockRemove?: (blockId: string) => void;
}

const DraggableBlock: React.FC<DraggableBlockProps> = ({ 
  block,
  isWorkspaceBlock = false,
  onBlockUpdate,
  onBlockRemove,
}) => {
  const elementRef = useRef<HTMLDivElement>(null);

  const handleDrop = useCallback((inputId: string, item: any, parentInputId?: string) => {
    if (!onBlockUpdate) return;

    const updatedBlock = JSON.parse(JSON.stringify(block));
    
    if (parentInputId) {
      // Handle drops into nested conditions
      const parentInput = updatedBlock.inputs?.find((input: BlockInput) => input.id === parentInputId);
      if (parentInput?.connected) {
        const connectedBlock = parentInput.connected;
        const targetInput = connectedBlock.inputs?.find((input: BlockInput) => input.id === inputId);
        if (targetInput) {
          // Preserve any existing values and properties
          targetInput.value = targetInput.value || '';
          targetInput.inputType = targetInput.inputType || 'text';
          parentInput.connected = connectedBlock;
          onBlockUpdate(updatedBlock);
        }
      }
    } else if (block.type === 'operator') {
      const input = updatedBlock.inputs?.find((input: BlockInput) => input.id === inputId);
      if (input && !input.connected) {
        const droppedBlock = JSON.parse(JSON.stringify(item));
        droppedBlock.isTemplate = false;

        // Initialize values for all inputs in the dropped condition
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
        if (lastInput?.id === inputId) {
          updatedBlock.inputs.push({
            id: `condition-${Date.now()}`,
            type: ['condition', 'operator'],
            label: 'Add Condition'
          });
        }
        onBlockUpdate(updatedBlock);

        // If the dropped block was from the workspace, remove it from its original location
        if (!item.isTemplate && onBlockRemove) {
          onBlockRemove(item.id);
        }
      }
    }
  }, [block, onBlockUpdate, onBlockRemove]);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'block',
    item: () => {
      const newId = isWorkspaceBlock ? block.id : `${block.id}-${Date.now()}`;
      const newBlock = JSON.parse(JSON.stringify({
        id: newId,
        type: block.type,
        category: block.category,
        label: block.label,
        inputs: block.inputs,
        properties: block.properties,
        isTemplate: !isWorkspaceBlock,
      }));
      return newBlock;
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [block, isWorkspaceBlock]);

  // Combine refs utility
  const combineRefs = useCallback((...refs: any[]) => {
    return (element: HTMLDivElement) => {
      refs.forEach((ref) => {
        if (typeof ref === 'function') {
          ref(element);
        } else if (ref) {
          (ref as React.MutableRefObject<any>).current = element;
        }
      });
    };
  }, []);

  const handleValueChange = (inputId: string, e: React.ChangeEvent<HTMLInputElement>, parentInputId?: string) => {
    if (!onBlockUpdate || !isWorkspaceBlock) return;

    const value = e.target.value;
    const updatedBlock = JSON.parse(JSON.stringify(block));
    
    console.log('Handling value change:', {
      inputId,
      value,
      parentInputId,
      currentBlock: block
    });
    
    if (parentInputId) {
      // Handle inputs in connected blocks
      const parentInput = updatedBlock.inputs?.find((i: BlockInput) => i.id === parentInputId);
      console.log('Found parent input:', parentInput);
      
      if (parentInput?.connected) {
        const connectedBlock = parentInput.connected;
        console.log('Connected block:', connectedBlock);
        
        const targetInput = connectedBlock.inputs?.find((i: BlockInput) => i.id === inputId);
        console.log('Target input:', targetInput);
        
        if (targetInput) {
          let processedValue = value;
          
          // Convert to number if it's a number input
          if (targetInput.inputType === 'number') {
            const num = parseFloat(value);
            if (!isNaN(num)) {
              processedValue = num.toString();
            }
          }
          
          // Create a new connected block with updated inputs
          const updatedConnectedBlock = {
            ...connectedBlock,
            inputs: connectedBlock.inputs?.map((input: BlockInput) => 
              input.id === inputId 
                ? { ...input, value: processedValue }
                : input
            )
          };
          
          // Update the parent input with the new connected block
          parentInput.connected = updatedConnectedBlock;
          
          console.log('Updated connected block:', updatedConnectedBlock);
          console.log('Final block state:', updatedBlock);
          
          onBlockUpdate(updatedBlock);
        }
      }
    } else {
      // Handle top-level inputs
      const input = updatedBlock.inputs?.find((i: BlockInput) => i.id === inputId);
      if (input) {
        let processedValue = value;
        
        // Convert to number if it's a number input
        if (input.inputType === 'number') {
          const num = parseFloat(value);
          if (!isNaN(num)) {
            processedValue = num.toString();
          }
        }
        
        input.value = processedValue;
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

  const renderConnectedBlock = (connectedBlock: Block, parentInputId: string) => {
    if (connectedBlock.type === 'condition') {
      return (
        <div className="mt-2 bg-purple-700/50 rounded p-2 border border-purple-500/30">
          <div className="font-medium text-sm">{connectedBlock.label}</div>
          {connectedBlock.inputs && connectedBlock.inputs.length > 0 && (
            <div className="mt-2 space-y-2">
              {connectedBlock.inputs.map((input) => (
                <div key={input.id} className="flex items-center space-x-2">
                  <label className="text-sm text-gray-300">{input.label}:</label>
                  <input
                    type={input.inputType || 'text'}
                    className="w-full px-2 py-1 text-sm bg-gray-800 rounded border border-gray-600 text-white
                      transition-colors duration-200
                      focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    value={input.value || ''}
                    onChange={(e) => handleValueChange(input.id, e, parentInputId)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    return (
      <div className="text-sm text-gray-300">
        {connectedBlock.label}
      </div>
    );
  };

  return (
    <div
      ref={combineRefs(elementRef, drag)}
      className={`
        ${block.type === 'condition' ? 'bg-purple-700' : ''}
        ${block.type === 'operator' ? 'bg-blue-700' : ''}
        text-white p-3 rounded-lg cursor-move
        transition-all duration-200 ease-in-out
        hover:scale-[1.02] hover:shadow-lg
        active:scale-95
        ${isDragging ? 'opacity-50 scale-105 rotate-2' : 'opacity-100'}
      `}
    >
      <div className="font-medium">{block.label}</div>
      {(block.type === 'condition' || block.type === 'operator') && block.inputs && block.inputs.length > 0 && (
        <div className="mt-2 space-y-2">
          {block.inputs.map((input) => (
            <div key={input.id} className="flex items-center space-x-2">
              <label className="text-sm text-gray-300">{input.label}:</label>
              {block.type === 'operator' ? (
                <DropTarget
                  inputId={input.id}
                  isWorkspaceBlock={isWorkspaceBlock}
                  onDrop={handleDrop}
                  className="flex-1 px-2 py-1 text-sm rounded border
                    transition-all duration-200 ease-in-out
                    bg-gray-800 border-gray-600
                    hover:border-opacity-100"
                >
                  {input.connected ? (
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        {renderConnectedBlock(input.connected, input.id)}
                      </div>
                      {isWorkspaceBlock && (
                        <button
                          onClick={() => handleRemoveCondition(input.id)}
                          className="text-xs text-gray-400 hover:text-white ml-2
                            transition-colors duration-200
                            hover:bg-red-500/20 rounded-full p-1"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-400">
                      Drop condition here
                    </div>
                  )}
                </DropTarget>
              ) : (
                <div className="flex-1">
                  <input
                    type={input.inputType || 'text'}
                    className="w-full px-2 py-1 text-sm bg-gray-800 rounded border border-gray-600 text-white
                      transition-colors duration-200
                      focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    value={input.value || ''}
                    onChange={(e) => handleValueChange(input.id, e)}
                    onClick={(e) => e.stopPropagation()}
                  />
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