import { Provider } from '@ethersproject/providers';
import { Signer } from '@ethersproject/abstract-signer';
import { ThresholdMessageKit } from '@nucypher/taco';

export interface TacoOptions {
  porterUri?: string;
}

export interface TacoCondition {
  conditionType: string;
  chain?: number;
  method?: string;
  parameters?: Record<string, unknown>;
  returnValueTest?: Record<string, unknown>;
  [key: string]: unknown;
}

export type EncryptFunction = (
  provider: Provider,
  domain: string,
  message: string | Uint8Array,
  condition: TacoCondition,
  threshold: number,
  signer: Signer,
  options?: TacoOptions
) => Promise<ThresholdMessageKit>;

export interface ConditionContext {
  address?: string;
  chain?: number;
  [key: string]: unknown;
}

export type DecryptFunction = (
  provider: Provider,
  domain: string,
  messageKit: ThresholdMessageKit,
  conditionContext?: ConditionContext,
  options?: TacoOptions
) => Promise<Uint8Array>; 