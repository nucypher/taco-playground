import { Block } from './BlockTypes';

interface JsonCondition {
  type?: string;
  operator?: string;
  value?: any;
  returnValueTest?: any;
  left?: JsonCondition;
  right?: JsonCondition;
  condition?: JsonCondition;
  [key: string]: any;
}

export const blocksToJson = (blocks: Block[]): any => {
  const processBlock = (block: Block): JsonCondition | null => {
    if (!block) return null;

    switch (block.type) {
      case 'condition': {
        if (block.id.startsWith('timelock')) {
          const timestampInput = block.inputs?.find(i => i.id === 'returnValueTest');
          if (timestampInput?.connected) {
            const condition = {
              chain: block.properties?.chain || 1,
              returnValueTest: {
                comparator: block.properties?.comparator || '>=',
                value: parseInt(timestampInput.connected.value || '0')
              }
            };
            console.log('Generated timelock condition:', condition);
            return condition;
          }
        }

        // ... handle other condition types ...
        return null;
      }

      case 'operator': {
        const operator: JsonCondition = {
          type: 'operator',
          operator: block.id.split('-')[0], // Get base type without timestamp
        };

        // Handle different operator types
        switch (block.id.split('-')[0]) {
          case 'and':
          case 'or': {
            const left = block.inputs?.find(i => i.id === 'left')?.connected;
            const right = block.inputs?.find(i => i.id === 'right')?.connected;
            if (left) operator.left = processBlock(left);
            if (right) operator.right = processBlock(right);
            break;
          }
          case 'not': {
            const condition = block.inputs?.find(i => i.id === 'condition')?.connected;
            if (condition) operator.condition = processBlock(condition);
            break;
          }
          case 'greater-than':
          case 'less-than': {
            const value = block.inputs?.find(i => i.id === 'value')?.connected;
            const threshold = block.inputs?.find(i => i.id === 'threshold')?.connected;
            if (value) operator.value = value.type === 'value' ? value.value : processBlock(value);
            if (threshold) operator.threshold = threshold.type === 'value' ? threshold.value : processBlock(threshold);
            break;
          }
        }

        return operator;
      }

      case 'value':
        return block.value;

      default:
        return null;
    }
  };

  // Process only top-level blocks
  const topLevelBlocks = blocks.filter(block => {
    const isConnected = blocks.some(b => 
      b.inputs?.some(input => input.connected?.id === block.id)
    );
    return !isConnected;
  });

  if (topLevelBlocks.length === 0) return null;
  if (topLevelBlocks.length === 1) return processBlock(topLevelBlocks[0]);

  // If multiple top-level blocks, combine them with AND
  return {
    operator: 'and',
    left: processBlock(topLevelBlocks[0]),
    right: topLevelBlocks.length === 2 
      ? processBlock(topLevelBlocks[1])
      : blocksToJson(topLevelBlocks.slice(1))
  };
};

export const formatJson = (json: any): string => {
  if (!json) return '';
  return JSON.stringify(json, null, 2);
}; 