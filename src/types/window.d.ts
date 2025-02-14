import { ExternalProvider } from '@ethersproject/providers';

interface EthereumProvider extends ExternalProvider {
  on(event: string, listener: (args: unknown[]) => void): void;
  removeListener(event: string, listener: (args: unknown[]) => void): void;
  request<T = unknown>(args: { method: string; params?: unknown[] }): Promise<T>;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
} 