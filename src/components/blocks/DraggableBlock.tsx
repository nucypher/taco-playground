'use client';

import React, { useRef, useState } from 'react';
import { useDrag, useDrop, ConnectDragSource } from 'react-dnd';
import { Block, BlockInput } from './BlockTypes';

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
  // Local state for template blocks in the palette
  const [templateValue, setTemplateValue] = useState<string>(block.value || '');

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'block',
    item: () => {
      // Create a new block with a timestamp suffix for workspace blocks
      const newId = isWorkspaceBlock ? block.id : `${block.id}-${Date.now()}`;
      
      // Create a deep copy of the entire block
      const newBlock = JSON.parse(JSON.stringify({
        id: newId,
        type: block.type,
        category: block.category,
        label: block.label,
        inputs: block.inputs,
        properties: block.properties,
        value: isWorkspaceBlock ? block.value : templateValue,
        inputType: block.inputType,
        isTemplate: !isWorkspaceBlock,
      }));
      
      return newBlock;
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [block, isWorkspaceBlock, templateValue]);

  const elementRef = useRef<HTMLDivElement>(null);
  drag(elementRef);

  // Create drop handlers for each input slot
  const createInputDropRef = (inputId: string) => {
    const [{ isOver, canDrop }, drop] = useDrop(() => ({
      accept: 'block',
      canDrop: (item: any) => {
        // Only allow dropping value blocks into condition inputs
        return item.type === 'value' && block.type === 'condition' && isWorkspaceBlock;
      },
      drop: (item: any) => {
        if (!onBlockUpdate) return;

        // Create a deep copy of the current block
        const updatedBlock = JSON.parse(JSON.stringify(block));
        
        // Find the input to update
        const input = updatedBlock.inputs?.find((input: BlockInput) => input.id === inputId);
        if (input) {
          // Update the connected block info
          input.connected = {
            id: item.id,
            type: item.type,
            label: item.label,
            value: item.value || '',
            inputType: item.inputType,
          };
        }

        // Call the update handler with the modified block
        onBlockUpdate(updatedBlock);
        return { dropped: true };
      },
      collect: monitor => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }), [block, inputId, onBlockUpdate]);

    return { drop, isOver, canDrop };
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (isWorkspaceBlock) {
      if (!onBlockUpdate) return;
      
      let processedValue = value;
      
      // Convert to number if it's a number input
      if (block.inputType === 'number') {
        const num = parseFloat(value);
        if (!isNaN(num)) {
          processedValue = num.toString();
        }
      }
      
      const updatedBlock = { 
        ...block, 
        value: processedValue 
      };
      onBlockUpdate(updatedBlock);
    } else {
      // For template blocks in the palette, just update local state
      setTemplateValue(value);
    }
  };

  const handleConnectedValueChange = (inputId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onBlockUpdate || !isWorkspaceBlock) return;

    const value = e.target.value;
    const updatedBlock = JSON.parse(JSON.stringify(block));
    const input = updatedBlock.inputs?.find((i: BlockInput) => i.id === inputId);
    
    if (input?.connected) {
      let processedValue = value;
      
      // Convert to number if it's a number input
      if (input.connected.inputType === 'number') {
        const num = parseFloat(value);
        if (!isNaN(num)) {
          processedValue = num.toString();
        }
      }
      
      input.connected.value = processedValue;
      onBlockUpdate(updatedBlock);
    }
  };

  return (
    <div
      ref={elementRef}
      className={`
        ${block.type === 'condition' ? 'bg-purple-700' : ''}
        ${block.type === 'operator' ? 'bg-blue-700' : ''}
        ${block.type === 'value' ? 'bg-green-700' : ''}
        text-white p-3 rounded-lg cursor-move
        transition-all duration-200 ease-in-out
        hover:scale-[1.02] hover:shadow-lg
        active:scale-95
        ${isDragging ? 'opacity-50 scale-105 rotate-2' : 'opacity-100'}
      `}
    >
      <div className="font-medium">{block.label}</div>
      {block.type === 'value' && (
        <div className="mt-2">
          <input
            type={block.inputType || 'text'}
            placeholder={block.placeholder || 'Enter value'}
            className="w-full px-2 py-1 text-sm bg-gray-800 rounded border border-gray-600 text-white
              transition-colors duration-200
              focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            value={isWorkspaceBlock ? (block.value || '') : templateValue}
            onChange={handleValueChange}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
      {block.type === 'condition' && block.inputs && block.inputs.length > 0 && (
        <div className="mt-2 space-y-2">
          {block.inputs.map((input) => {
            const { drop: dropRef, isOver, canDrop } = createInputDropRef(input.id);
            const dropElement = (element: HTMLDivElement | null) => {
              if (dropRef && element) {
                dropRef(element);
              }
            };
            
            return (
              <div key={input.id} className="flex items-center space-x-2">
                <label className="text-sm text-gray-300">{input.label}:</label>
                <div
                  ref={dropElement}
                  className={`
                    flex-1 px-2 py-1 text-sm rounded border
                    transition-all duration-200 ease-in-out
                    ${input.connected 
                      ? 'bg-gray-700 border-gray-500' 
                      : 'bg-gray-800 border-gray-600'}
                    ${isWorkspaceBlock ? 'cursor-pointer' : ''}
                    ${isOver && canDrop ? 'border-green-400 bg-green-900/30 scale-105' : ''}
                    ${isOver && !canDrop ? 'border-red-400 bg-red-900/30' : ''}
                    ${!isOver && canDrop ? 'border-blue-400 border-dashed' : ''}
                    hover:border-opacity-100
                  `}
                >
                  {input.connected ? (
                    <div className="flex justify-between items-center">
                      <div className="flex-1 flex items-center">
                        <span className="text-gray-400 mr-2">{input.connected.label}:</span>
                        <input
                          type={input.connected.inputType || 'text'}
                          className="flex-1 bg-transparent border-none p-0 text-white focus:outline-none
                            focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded"
                          value={input.connected.value || ''}
                          onChange={(e) => handleConnectedValueChange(input.id, e)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      {isWorkspaceBlock && (
                        <button
                          onClick={() => {
                            if (!onBlockUpdate) return;
                            const updatedBlock = JSON.parse(JSON.stringify(block));
                            const targetInput = updatedBlock.inputs?.find((i: BlockInput) => i.id === input.id);
                            if (targetInput) {
                              targetInput.connected = undefined;
                            }
                            onBlockUpdate(updatedBlock);
                          }}
                          className="text-xs text-gray-400 hover:text-white ml-2
                            transition-colors duration-200
                            hover:bg-red-500/20 rounded-full p-1"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className={`
                      text-gray-400
                      ${isOver && canDrop ? 'text-green-300' : ''}
                      ${!isOver && canDrop ? 'text-blue-300' : ''}
                    `}>
                      Drop value here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DraggableBlock; 