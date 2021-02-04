import { clientTokenStore } from '../clientTokenStore';

export function authorizedFetch(path: string, request?: RequestInit) {
  const token = clientTokenStore.get();
  const apiEndpoint = `/api/${path}`;
  const requestInfo: RequestInit = {
    ...(request || {}),
    headers: {
      ...(request?.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  };
  return fetch(apiEndpoint, requestInfo).then(function (response) {
    if (response.status === 401) {
      clientTokenStore.clear();
      window.location.replace('/login');
      return;
    }
    return response.json();
  });
}
