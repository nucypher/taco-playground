export type BlockType = 'condition' | 'operator' | 'value' | 'property';

export type OperatorType = 'and' | 'or' | 'not' | 'greater-than' | 'less-than';
export type ConditionType = 
  | 'customABIMultipleParameters'
  | 'TStaking'
  | 'SubscriptionManagerPayment'
  | 'ERC1155_balance'
  | 'ERC1155_balance_batch'
  | 'ERC721_ownership'
  | 'ERC721_balance'
  | 'ERC20_balance'
  | 'ETH_balance'
  | 'specific_wallet_address'
  | 'timestamp';

export type BlockCategory = 'conditions' | 'operators' | 'values' | 'properties';

export interface Block {
  id: string;
  type: string;
  category?: string;
  label: string;
  inputs?: BlockInput[];
  properties?: Record<string, any>;
  isTemplate?: boolean;
  value?: string;
}

export interface BlockInput {
  id: string;
  type: string | string[];
  label: string;
  connected?: Block;
  value?: string;
  inputType?: string;
  placeholder?: string;
}

export interface TacoCondition {
  conditionType: string;
  contractAddress: string;
  standardContractType?: string;
  chain: number;
  method: string;
  parameters: any[];
  functionAbi?: {
    inputs: {
      internalType: string;
      name: string;
      type: string;
    }[];
    name: string;
    outputs: {
      internalType: string;
      name: string;
      type: string;
    }[];
    stateMutability: string;
    type: string;
    constant?: boolean;
  };
  returnValueTest: {
    comparator: string;
    value: any;
    index?: number;
  };
}

export const BLOCK_CATEGORIES = {
  CONDITIONS: 'conditions',
  OPERATORS: 'operators',
  VALUES: 'values',
  PROPERTIES: 'properties'
} as const; 