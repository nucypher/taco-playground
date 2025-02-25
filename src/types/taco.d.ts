import { Provider } from '@ethersproject/providers';
import { Signer } from '@ethersproject/abstract-signer';
import { ThresholdMessageKit } from '@nucypher/taco';

// Define our own types that match what's in the @nucypher/taco package
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

export interface ConditionContext {
  address?: string;
  chain?: number;
  [key: string]: unknown;
}

// Declare the module augmentation without exports
declare module '@nucypher/taco' {
  // These functions are already exported by the package
  // We're just adding type information
  const encrypt: (
    provider: Provider,
    domain: string,
    message: string | Uint8Array,
    condition: TacoCondition,
    threshold: number,
    signer: Signer,
    options?: TacoOptions
  ) => Promise<ThresholdMessageKit>;

  const decrypt: (
    provider: Provider,
    domain: string,
    messageKit: ThresholdMessageKit,
    conditionContext?: ConditionContext,
    options?: TacoOptions
  ) => Promise<Uint8Array>;
} 