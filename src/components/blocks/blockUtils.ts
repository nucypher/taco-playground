import { Block } from './BlockTypes';

interface JsonCondition {
  operator?: 'and' | 'or' | 'not';
  conditionType?: string;
  operands?: JsonCondition[];
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

    // Handle operator blocks differently
    if (block.type === 'operator') {
      // Find all connected conditions
      const connectedConditions = block.inputs
        ?.filter(input => input.connected)
        .map(input => input.connected)
        .filter((block): block is Block => block !== undefined) || [];

      // Process each connected condition
      condition.operands = connectedConditions
        .map(connectedBlock => processBlock(connectedBlock))
        .filter((condition): condition is JsonCondition => condition !== null);

      // Remove any left/right properties that might exist
      const anyCondition = condition as any;
      delete anyCondition.left;
      delete anyCondition.right;

      return condition;
    }

    // Process inputs for condition blocks
    block.inputs?.forEach(input => {
      // Check for direct value first, then fall back to connected value
      const value = input.value || input.connected?.value;
      if (!value && value !== '0') {  // Allow zero as a valid value
        return;
      }

      switch (input.id) {
        case 'contractAddress':
          condition.contractAddress = value.trim();
          break;
        case 'chain':
          const chainId = parseInt(value);
          if (!isNaN(chainId) && [1, 137, 80002, 11155111].includes(chainId)) {
            // Ensure chain is a literal number
            condition.chain = Number(chainId);
          } else {
            // If the chain ID is not valid, remove it from the condition
            delete condition.chain;
          }
          break;
        case 'minBalance':
          const balance = parseFloat(value);
          if (!isNaN(balance)) {
            condition.returnValueTest = {
              comparator: '>',
              value: balance
            };
          }
          break;
        case 'timestamp':
        case 'minTimestamp':
          const timestamp = parseInt(value);
          if (!isNaN(timestamp)) {
            // Clear out any unwanted properties
            delete condition.parameters;
            condition.conditionType = 'time';
            condition.method = 'blocktime';
            condition.returnValueTest = {
              comparator: '>=',
              value: timestamp
            };
          }
          break;
        case 'tokenId':
          if (condition.parameters) {
            condition.parameters = condition.parameters.map(p => 
              p === ':tokenId' ? value : p
            );
          } else {
            condition.parameters = [value];
          }
          break;
        case 'method':
          condition.method = value;
          break;
        case 'parameters':
          try {
            condition.parameters = JSON.parse(value);
          } catch (e) {
            console.error('Failed to parse parameters:', e);
          }
          break;
        case 'functionAbi':
          try {
            condition.functionAbi = JSON.parse(value);
          } catch (e) {
            console.error('Failed to parse function ABI:', e);
          }
          break;
      }
    });

    // For timestamp blocks, ensure chain is set to 1 only if no chain input was provided
    if (condition.standardContractType === 'timestamp') {
      const chainInput = block.inputs?.find(input => input.id === 'chain');
      const chainValue = chainInput?.value || chainInput?.connected?.value;
      if (!chainValue && chainValue !== '0') {
        condition.chain = 1;
      }
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
    conditionType: 'compound',
    operator: 'and',
    operands: conditions
  };
};

export const formatJson = (json: any): string => {
  if (!json) return '';
  return JSON.stringify(json, null, 2);
}; 