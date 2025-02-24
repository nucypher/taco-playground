import { Provider } from '@ethersproject/providers';
import { Signer } from '@ethersproject/abstract-signer';
import { ThresholdMessageKit } from '@nucypher/taco';

declare module '@nucypher/taco' {
  interface TacoOptions {
    porterUri?: string;
  }

  interface EncryptFunction {
    (
      provider: Provider,
      domain: string,
      message: string | Uint8Array,
      condition: any,
      threshold: number,
      signer: Signer,
      options?: TacoOptions
    ): Promise<ThresholdMessageKit>;
  }

  interface DecryptFunction {
    (
      provider: Provider,
      domain: string,
      messageKit: ThresholdMessageKit,
      conditionContext?: any,
      options?: TacoOptions
    ): Promise<Uint8Array>;
  }

  export const encrypt: EncryptFunction;
  export const decrypt: DecryptFunction;
} 