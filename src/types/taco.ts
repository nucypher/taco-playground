import { Provider } from '@ethersproject/providers';
import { Signer } from 'ethers';

export type ChainId = 1 | 137 | 80002 | 11155111;

export type Comparator = '==' | '>' | '<' | '>=' | '<=' | '!=';

export interface ReturnValueTest {
  comparator: Comparator;
  value: string | number;
  index?: number;
}

export interface BaseCondition {
  chain: ChainId;
  returnValueTest: ReturnValueTest;
}

export interface TimeCondition extends BaseCondition {
  conditionType: 'time';
  method: 'blocktime';
}

export interface ContractCondition extends BaseCondition {
  conditionType: 'contract';
  contractAddress: string;
  standardContractType?: 'ERC20' | 'ERC721';
  method: string;
  parameters: unknown[];
  functionAbi?: {
    name: string;
    inputs: { type: string }[];
    outputs: { type: string }[];
  };
}

export interface RpcCondition extends BaseCondition {
  conditionType: 'rpc';
  method: 'eth_getBalance';
  parameters: [':userAddress' | string, 'latest'];
}

export interface CompoundCondition {
  conditionType: 'compound';
  operator: 'and' | 'or' | 'not';
  operands: (TimeCondition | ContractCondition | RpcCondition | CompoundCondition)[];
}

export type TacoCondition = TimeCondition | ContractCondition | RpcCondition | CompoundCondition;

export interface MessageKit {
  capsule: string;
  ciphertext: string;
  conditions: TacoCondition;
}

export interface Web3Context {
  provider: Provider | null;
  signer: Signer | null;
  address: string | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
} 