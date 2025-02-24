import React, { useCallback } from 'react';
import { useDrop } from 'react-dnd';
import { DragItem } from './types';

interface DropTargetProps {
  inputId: string;
  parentInputId?: string;
  isWorkspaceBlock: boolean;
  onDrop: (inputId: string, item: DragItem, parentInputId?: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const DropTarget: React.FC<DropTargetProps> = ({
  inputId,
  parentInputId,
  isWorkspaceBlock,
  onDrop,
  children,
  className = '',
}) => {
  const [{ isOver, canDrop }, dropRef] = useDrop<DragItem, void, { isOver: boolean; canDrop: boolean }>(() => ({
    accept: 'block',
    canDrop: (item: DragItem) => {
      if (!isWorkspaceBlock) return false;
      
      // For value inputs, only accept value blocks
      if (inputId.includes('chain') || inputId.includes('contractAddress')) {
        return item.type === 'value';
      }
      
      // For operator inputs, accept conditions and operators
      return item.type === 'condition' || item.type === 'operator';
    },
    drop: (item: DragItem) => {
      onDrop(inputId, item, parentInputId);
      return undefined;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }), [inputId, parentInputId, isWorkspaceBlock, onDrop]);

  const setRef = useCallback((element: HTMLDivElement | null) => {
    dropRef(element);
  }, [dropRef]);

  return (
    <div
      ref={setRef}
      data-input-id={inputId}
      data-parent-input-id={parentInputId}
      className={`
        ${className}
        ${isOver ? 'border-white/20 bg-white/10 scale-[1.02]' : ''}
        ${!canDrop ? 'border-white/5 bg-white/5' : ''}
        ${canDrop && !isOver ? 'border-white/10 border-dashed' : ''}
      `}
    >
      {children}
    </div>
  );
}; 
