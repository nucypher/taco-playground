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
        ${isOver ? 'border-green-400 bg-green-900/30 scale-105' : ''}
        ${!canDrop ? 'border-red-400 bg-red-900/30' : ''}
        ${canDrop && !isOver ? 'border-blue-400 border-dashed' : ''}
      `}
    >
      {children}
    </div>
  );
}; 
