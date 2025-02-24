import { Provider } from '@ethersproject/providers';
import { Signer } from '@ethersproject/abstract-signer';
import { ThresholdMessageKit } from '@nucypher/taco';

export interface TacoOptions {
  porterUri?: string;
}

export type EncryptFunction = (
  provider: Provider,
  domain: string,
  message: string | Uint8Array,
  condition: any,
  threshold: number,
  signer: Signer,
  options?: TacoOptions
) => Promise<ThresholdMessageKit>;

export type DecryptFunction = (
  provider: Provider,
  domain: string,
  messageKit: ThresholdMessageKit,
  conditionContext?: any,
  options?: TacoOptions
) => Promise<Uint8Array>; 