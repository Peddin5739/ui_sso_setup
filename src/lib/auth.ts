import {
  PublicClientApplication,
  type AccountInfo,
  type Configuration,
} from '@azure/msal-browser';

const API_SCOPE =
  import.meta.env.VITE_API_SCOPE || 'api://YOUR_API_APP_CLIENT_ID/access_as_user';
export const LOGIN_SCOPES = [API_SCOPE];
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
const TENANT_ID = import.meta.env.VITE_AZURE_TENANT_ID || 'common';
const AUTHORITY =
  import.meta.env.VITE_AZURE_AUTHORITY ||
  `https://login.microsoftonline.com/${TENANT_ID}/v2.0`;

const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID || 'YOUR_CLIENT_ID',
    authority: AUTHORITY,
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);

export const getActiveAccount = (): AccountInfo | undefined =>
  msalInstance.getAllAccounts()[0];

export const getAccessToken = async (): Promise<string> => {
  const account = getActiveAccount();

  if (!account) {
    throw new Error('User is not signed in.');
  }

  try {
    const response = await msalInstance.acquireTokenSilent({
      account,
      scopes: [API_SCOPE],
    });

    return response.accessToken;
  } catch (silentError) {
    console.warn('Silent token acquisition failed; trying interactive login.', silentError);

    const popupResponse = await msalInstance.acquireTokenPopup({
      account,
      scopes: [API_SCOPE],
    });

    return popupResponse.accessToken;
  }
};

export const apiFetch = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const accessToken = await getAccessToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = (data && (data.message as string)) || 'Request to the API failed.';
    throw new Error(message);
  }

  return data as T;
};
