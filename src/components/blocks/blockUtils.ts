import { Block } from './BlockTypes';

interface JsonCondition {
  operator?: 'and' | 'or' | 'not';
  left?: JsonCondition;
  right?: JsonCondition;
  condition?: JsonCondition;
  returnValueTest?: {
    comparator: string;
    value: string | number;
  };
  chain?: number;
  contractAddress?: string;
  standardContractType?: string;
  method?: string;
  parameters?: any[];
  functionAbi?: {
    name: string;
    inputs: { type: string }[];
    outputs: { type: string }[];
  };
}

export const blocksToJson = (blocks: Block[]): any => {
  const processBlock = (block: Block): JsonCondition | null => {
    if (!block || !block.properties) {
      return null;
    }

    // Start with the properties
    const condition: JsonCondition = {
      ...block.properties
    };

    // Process inputs
    block.inputs?.forEach(input => {
      if (!input.connected?.value) {
        return;
      }

      const connectedValue = input.connected?.value;
      if (!connectedValue) {
        return;
      }

      switch (input.id) {
        case 'contractAddress':
          condition.contractAddress = connectedValue;
          break;
        case 'chain':
          condition.chain = parseInt(connectedValue);
          break;
        case 'minBalance':
          condition.returnValueTest = {
            comparator: '>',
            value: connectedValue
          };
          break;
        case 'timestamp':
          if (condition.returnValueTest) {
            condition.returnValueTest.value = parseInt(connectedValue);
          } else {
            condition.returnValueTest = {
              comparator: '>=',
              value: parseInt(connectedValue)
            };
          }
          break;
        case 'tokenId':
          if (condition.parameters) {
            condition.parameters = condition.parameters.map(p => 
              p === ':tokenId' ? connectedValue : p
            );
          } else {
            condition.parameters = [connectedValue];
          }
          break;
        case 'method':
          condition.method = connectedValue;
          break;
        case 'parameters':
          try {
            condition.parameters = JSON.parse(connectedValue);
          } catch (e) {
            console.error('Failed to parse parameters:', e);
          }
          break;
        case 'functionAbi':
          try {
            condition.functionAbi = JSON.parse(connectedValue);
          } catch (e) {
            console.error('Failed to parse function ABI:', e);
          }
          break;
      }
    });

    // Ensure chain is set to 1 if not specified for timestamp blocks
    if (condition.standardContractType === 'timestamp' && !condition.chain) {
      condition.chain = 1;
    }

    return condition;
  };

  // Process only top-level blocks
  const topLevelBlocks = blocks.filter(block => {
    const isConnected = blocks.some(b => 
      b.inputs?.some(input => input.connected?.id === block.id)
    );
    return !isConnected;
  });

  if (topLevelBlocks.length === 0) return null;
  if (topLevelBlocks.length === 1) {
    return processBlock(topLevelBlocks[0]) || null;
  }

  // If multiple top-level blocks, combine them with AND
  const conditions = topLevelBlocks
    .map(block => processBlock(block))
    .filter(condition => condition !== null);

  if (conditions.length === 0) return null;
  if (conditions.length === 1) return conditions[0];

  return {
    operator: 'and',
    left: conditions[0],
    right: conditions.length === 2 
      ? conditions[1]
      : blocksToJson(topLevelBlocks.slice(1))
  };
};

export const formatJson = (json: any): string => {
  if (!json) return '';
  return JSON.stringify(json, null, 2);
}; 