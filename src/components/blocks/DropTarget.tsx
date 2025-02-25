import React, { useCallback } from 'react';
import { useDrop } from 'react-dnd';
import { DragItem } from './types';

interface DropTargetProps {
  inputId: string;
  parentInputId?: string;
  isWorkspaceBlock: boolean;
  onDrop: (inputId: string, item: DragItem, parentInputId?: string) => DropResult | void;
  children: React.ReactNode;
  className?: string;
}

interface DropResult {
  handled?: boolean;
}

export const DropTarget: React.FC<DropTargetProps> = ({
  inputId,
  parentInputId,
  isWorkspaceBlock,
  onDrop,
  children,
  className = '',
}) => {
  const [{ isOver, canDrop }, dropRef] = useDrop<DragItem, DropResult, { isOver: boolean; canDrop: boolean }>(() => ({
    accept: 'block',
    hover(item: DragItem, monitor) {
      // When hovering over a valid drop target, prevent propagation
      if (monitor.isOver({ shallow: true }) && monitor.canDrop()) {
        monitor.getItem();  // This is needed to ensure hover state is tracked
      }
    },
    canDrop: (item: DragItem) => {
      if (!isWorkspaceBlock) return false;
      
      // For value inputs (chain, contractAddress, etc), only accept value blocks
      if (inputId.includes('chain') || 
          inputId.includes('contractAddress') || 
          inputId.includes('timestamp') || 
          inputId.includes('balance') || 
          inputId.includes('tokenId')) {
        return item.type === 'value';
      }
      
      // For operator inputs (condition-1, condition-2, etc), accept conditions and operators
      // This is the key fix - check if the inputId starts with 'condition-' to identify operator inputs
      if (inputId.startsWith('condition-')) {
        return item.type === 'condition' || item.type === 'operator';
      }
      
      // For other inputs, accept conditions and operators
      return item.type === 'condition' || item.type === 'operator';
    },
    drop: (item: DragItem, monitor) => {
      // Only handle the drop if this is the immediate target
      if (!monitor.isOver({ shallow: true })) {
        return;
      }

      // If this target can handle the drop, do it and stop propagation
      if (monitor.canDrop()) {
        const result = onDrop(inputId, item, parentInputId);
        // If onDrop returns a result with handled: true, return it to stop propagation
        if (result && result.handled) {
          return result;
        }
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
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
        ${isOver && canDrop ? 'border-white/20 bg-white/10 scale-[1.02]' : ''}
        ${!canDrop ? 'border-white/5 bg-white/5' : ''}
        ${canDrop && !isOver ? 'border-white/10 border-dashed' : ''}
      `}
    >
      {children}
    </div>
  );
}; 
