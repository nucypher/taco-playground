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
}

const BLOCK_COLORS = {
  condition: 'bg-purple-500',
  operator: 'bg-blue-500',
  value: 'bg-green-500',
  property: 'bg-orange-500',
};

const RemoveButton: React.FC<{ onRemove: () => void }> = ({ onRemove }) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onRemove();
    }}
    className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full 
      flex items-center justify-center opacity-0 group-hover:opacity-100 
      transition-opacity hover:bg-red-600 z-10"
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
        bg-white/20 px-2 py-1 rounded min-w-[60px] min-h-[30px]
        ${!input.connected ? 'border-2 border-dashed border-white/30' : ''}
        ${isOver && canDrop ? 'ring-2 ring-white' : ''}
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
        <span className="text-white/60">{input.label}</span>
      )}
    </div>
  );
};

const DraggableBlock: React.FC<DraggableBlockProps> = ({ 
  block, 
  index,
  moveBlock,
  isWorkspaceBlock = false,
  onConnect,
  onRemove,
  onValueChange,
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
    </div>
  );
};

export default DraggableBlock; 