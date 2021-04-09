import { useState } from 'react';
import { ApiResultSuccess, ApiResultFailure } from './services/api.svc';

export function useBlockingRequest() {
  const [isRequestPending, setRequestPending] = useState<boolean>(false);
  const [lastError, setError] = useState<string>('');
  const [hasSucceeded, setHasSucceeded] = useState<boolean>(false);

  function blockFor<TData = unknown, TArgs extends Array<unknown> = unknown[]>(
    requestHandler: (
      ...args: TArgs
    ) => Promise<ApiResultSuccess<TData> | ApiResultFailure>,
  ) {
    return (...args: TArgs) => {
      if (isRequestPending) {
        return;
      }
      setRequestPending(true);
      const promise = requestHandler(...args);
      promise.then((result) => {
        setRequestPending(false);
        if (result.error) {
          setError(result.error?.message);
        } else {
          setHasSucceeded(true);
        }
        return result;
      });
      return promise;
    };
  }

  return { isRequestPending, lastError, hasSucceeded, blockFor };
}
