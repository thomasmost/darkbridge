import { Logger } from 'tslog';
import { asyncLocalStorage } from '../node_hooks';

const kirk = new Logger({
  name: 'Server',
  requestId: (): string => {
    return asyncLocalStorage.getStore()?.request_id as string;
  },
});
export { kirk };
