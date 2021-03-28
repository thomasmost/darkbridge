import { toast } from 'react-toastify';
export interface ApiResultSuccess<TData> {
  data: TData;
  error?: null;
}
export interface ApiResultFailure {
  data?: null;
  error: Error;
}

const routineErrorCodes = [400, 405, 409];

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
    } else if (routineErrorCodes.includes(response.status)) {
      const errorMessage = await response.text();
      toast.error(errorMessage);
      return {
        error: new Error('errorMessage'),
      };
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function postRequest<TBody, TData = any>(
  path: string,
  accept: 'text' | 'json',
  body: TBody,
): Promise<ApiResultSuccess<TData> | ApiResultFailure> {
  if (typeof body === 'string') {
    throw Error('A POST request body should be an object');
  }
  const putRequest = {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify(body),
  };
  return apiRequest<TData>(path, accept, putRequest);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function putRequest<TBody = any, TData = any>(
  path: string,
  accept: 'text' | 'json',
  body: TBody,
): Promise<ApiResultSuccess<TData> | ApiResultFailure> {
  if (typeof body === 'string') {
    throw Error('A PUT request body should be an object');
  }
  const putRequest = {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'PUT',
    body: JSON.stringify(body),
  };
  return apiRequest<TData>(path, accept, putRequest);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getRequest<TData = any>(
  path: string,
): Promise<ApiResultSuccess<TData> | ApiResultFailure> {
  return apiRequest<TData>(path, 'json');
}
