import { AsyncLocalStorage } from 'async_hooks';

export const asyncLocalStorage: AsyncLocalStorage<{
  request_id: string;
}> = new AsyncLocalStorage();
