export type BlockType = 'condition' | 'operator' | 'value' | 'property';

export type OperatorType = 'and' | 'or' | 'not' | 'greater-than' | 'less-than';
export type ConditionType = 
  | 'erc721-ownership' 
  | 'erc1155-balance' 
  | 'erc20-balance'
  | 'time-lock'
  | 'time-range'
  | 'chain-id';

export interface Block {
  id: string;
  type: 'condition' | 'operator' | 'value';
  category: 'conditions' | 'operators' | 'values';
  label: string;
  inputType?: string;
  value?: string;
  inputs?: BlockInput[];
  properties?: {
    chain?: number;
    comparator?: string;
    [key: string]: any;
  };
}

export interface BlockInput {
  id: string;
  type: string[];
  label: string;
  connected?: Block;
}

export const BLOCK_CATEGORIES = {
  CONDITIONS: 'Conditions',
  OPERATORS: 'Operators',
  VALUES: 'Values',
  PROPERTIES: 'Properties'
} as const; 