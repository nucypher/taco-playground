export type BlockType = 'condition' | 'operator' | 'value' | 'property';

export type OperatorType = 'and' | 'or' | 'not' | 'greater-than' | 'less-than';
export type ConditionType = 
  | 'customABIMultipleParameters'
  | 'TStaking'
  | 'SubscriptionManagerPayment'
  | 'ERC721_ownership'
  | 'ERC721_balance'
  | 'ERC20_balance'
  | 'ETH_balance'
  | 'specific_wallet_address'
  | 'timestamp';

export type BlockCategory = 'conditions' | 'operators' | 'values';

export interface Block {
  id: string;
  type: string;
  category?: string;
  label: string;
  inputs?: BlockInput[];
  properties?: Record<string, unknown>;
  isTemplate?: boolean;
  value?: string;
  inputType?: string;
  placeholder?: string;
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

export const BLOCK_CATEGORIES = {
  CONDITIONS: 'conditions',
  OPERATORS: 'operators',
  VALUES: 'values'
} as const; 