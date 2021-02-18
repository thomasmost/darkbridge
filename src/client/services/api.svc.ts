import { toast } from 'react-toastify';
export interface ApiResultSuccess<TData> {
  data: TData;
  error?: null;
}
export interface ApiResultFailure {
  data?: null;
  error: Error;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function apiRequest<TData = any>(
  path: string,
  accept: 'text' | 'json',
  request?: RequestInit,
): Promise<ApiResultSuccess<TData> | ApiResultFailure> {
  const apiEndpoint = `/api/${path}`;
  const requestInfo: RequestInit = {
    ...(request || {}),
  };
  try {
    const response = await fetch(apiEndpoint, requestInfo);
    if (response.status === 401) {
      toast.error('Please log in again...');
      location.assign('/login');
      return {
        error: new Error('Session Expired'),
      };
    }
    if (response.status === 500) {
      throw new Error('Unexpected');
    }
    const data = (await (accept === 'json'
      ? response.json()
      : response.text())) as TData;
    return {
      data,
    };
  } catch (error) {
    toast.error(`Request Failed with ${error}`);
    return {
      error,
    };
  }
}
