'use client';

import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Block } from './BlockTypes';
import ValueBlock from './ValueBlock';

interface DraggableBlockProps {
  block: Block;
  index?: number;
  moveBlock?: (dragIndex: number, hoverIndex: number) => void;
  isWorkspaceBlock?: boolean;
  onConnect?: (sourceBlock: Block, targetBlock: Block, inputId: string) => void;
  onRemove?: (blockId: string) => void;
  onValueChange?: (blockId: string, value: string) => void;
  onPropertyChange?: (blockId: string, property: string, value: any) => void;
}

const BLOCK_COLORS = {
  condition: 'bg-purple-700',
  operator: 'bg-blue-700',
  value: 'bg-green-700',
  property: 'bg-orange-700',
};

const RemoveButton: React.FC<{ onRemove: () => void }> = ({ onRemove }) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onRemove();
    }}
    className="absolute -top-2 -right-2 bg-red-600 text-gray-100 w-5 h-5 rounded-full 
      flex items-center justify-center opacity-0 group-hover:opacity-100 
      transition-opacity hover:bg-red-700 z-10"
    aria-label="Remove block"
  >
    ×
  </button>
);

const InputSlot: React.FC<{
  input: Block['inputs'][0];
  onConnect: (sourceBlock: Block, targetBlock: Block, inputId: string) => void;
  parentBlock: Block;
  onRemove?: (blockId: string) => void;
  onValueChange?: (blockId: string, value: string) => void;
}> = ({ input, onConnect, parentBlock, onRemove, onValueChange }) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'block',
    canDrop: (item: Block) => !input.connected && input.type.includes(item.type),
    drop: (item: Block & { isWorkspaceBlock?: boolean }) => {
      const sourceBlock = item.id.includes('-template') 
        ? { ...item, id: item.id.replace('-template', '') + `-${Date.now()}` }
        : item;
      
      onConnect(sourceBlock, parentBlock, input.id);
      return { dropped: true };
    },
    collect: monitor => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }), [input, onConnect, parentBlock]);

  return (
    <div
      ref={drop}
      className={`
        bg-gray-800/40 px-2 py-1 rounded min-w-[60px] min-h-[30px]
        ${!input.connected ? 'border-2 border-dashed border-gray-600' : ''}
        ${isOver && canDrop ? 'ring-2 ring-gray-300' : ''}
      `}
    >
      {input.connected ? (
        <DraggableBlock 
          block={input.connected} 
          isWorkspaceBlock={true}
          onConnect={onConnect}
          onRemove={onRemove}
          onValueChange={onValueChange}
        />
      ) : (
        <span className="text-gray-400">{input.label}</span>
      )}
    </div>
  );
};

// Define supported chains
const SUPPORTED_CHAINS = [
  { id: 137, name: 'Polygon Mainnet' },
  { id: 80002, name: 'Polygon Amoy' },
  { id: 11155111, name: 'Sepolia' },
  { id: 1, name: 'Ethereum Mainnet' }
] as const;

const DraggableBlock: React.FC<DraggableBlockProps> = ({ 
  block, 
  index,
  moveBlock,
  isWorkspaceBlock = false,
  onConnect,
  onRemove,
  onValueChange,
  onPropertyChange
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'block',
    item: () => {
      if (block.id.includes('-template')) {
        return {
          ...block,
          id: block.id.replace('-template', '') + `-${Date.now()}`,
          isWorkspaceBlock: false,
          index
        };
      }
      return { ...block, index, isWorkspaceBlock };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [block, index, isWorkspaceBlock]);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'block',
    hover: (item: any, monitor) => {
      if (moveBlock && typeof index === 'number' && typeof item.index === 'number') {
        if (!ref.current) return;
        const dragIndex = item.index;
        const hoverIndex = index;

        if (dragIndex === hoverIndex) return;

        const hoverBoundingRect = ref.current?.getBoundingClientRect();
        const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
        const clientOffset = monitor.getClientOffset();
        const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

        if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
        if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

        moveBlock(dragIndex, hoverIndex);
        item.index = hoverIndex;
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  }), [block, index, moveBlock]);

  const handleRemove = () => {
    onRemove?.(block.id);
  };

  const handleValueChange = (value: string) => {
    onValueChange?.(block.id, value);
  };

  if (block.type === 'value') {
    return (
      <div 
        ref={drag} 
        className={`
          ${!isWorkspaceBlock ? 'cursor-move' : ''} 
          relative group
          ${isDragging ? 'opacity-50' : 'opacity-100'}
        `}
      >
        {isWorkspaceBlock && onRemove && (
          <RemoveButton onRemove={handleRemove} />
        )}
        <ValueBlock 
          block={block} 
          isPreview={isWorkspaceBlock} 
          onChange={handleValueChange}
        />
      </div>
    );
  }

  // For non-value blocks, apply drag and drop separately
  drag(ref);
  drop(ref);

  return (
    <div
      ref={ref}
      className={`
        ${BLOCK_COLORS[block.type]} text-white p-3 rounded-lg relative group
        ${!isWorkspaceBlock ? 'cursor-move shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all' : ''}
        ${isDragging ? 'opacity-50' : 'opacity-100'}
        ${isOver ? 'ring-2 ring-white' : ''}
      `}
    >
      {!isWorkspaceBlock && onRemove && (
        <RemoveButton onRemove={handleRemove} />
      )}
      <div className="flex items-center space-x-2">
        <span>{block.label}</span>
        {block.inputs?.map((input) => (
          <InputSlot
            key={input.id}
            input={input}
            onConnect={onConnect}
            parentBlock={block}
            onRemove={onRemove}
            onValueChange={onValueChange}
          />
        ))}
      </div>

      {block.type === 'condition' && block.id.startsWith('timelock') && (
        <div className="flex items-center gap-2 mt-2 p-2 bg-gray-800/50 rounded">
          <label className="text-sm text-gray-400">Chain:</label>
          <select
            value={block.properties?.chain || 80002}
            onChange={(e) => onPropertyChange?.(block.id, 'chain', parseInt(e.target.value))}
            className="flex-1 px-2 py-1 text-sm bg-gray-800 border border-gray-700 rounded"
          >
            {SUPPORTED_CHAINS.map(chain => (
              <option key={chain.id} value={chain.id}>
                {chain.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default DraggableBlock; 