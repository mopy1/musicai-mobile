import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'musicai_access_token';
const REFRESH_TOKEN_KEY = 'musicai_refresh_token';

let memoryAccessToken: string | null = null;
let memoryRefreshToken: string | null = null;

export async function getStoredTokens(): Promise<{ access: string | null; refresh: string | null }> {
  if (memoryAccessToken && memoryRefreshToken) {
    return { access: memoryAccessToken, refresh: memoryRefreshToken };
  }
  const [access, refresh] = await Promise.all([
    SecureStore.getItemAsync(ACCESS_TOKEN_KEY).catch(() => null),
    SecureStore.getItemAsync(REFRESH_TOKEN_KEY).catch(() => null),
  ]);
  memoryAccessToken = access;
  memoryRefreshToken = refresh;
  return { access, refresh };
}

export async function saveStoredTokens(access: string, refresh: string): Promise<void> {
  memoryAccessToken = access;
  memoryRefreshToken = refresh;
  await Promise.all([
    SecureStore.setItemAsync(ACCESS_TOKEN_KEY, access),
    SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refresh),
  ]);
}

export async function clearStoredTokens(): Promise<void> {
  memoryAccessToken = null;
  memoryRefreshToken = null;
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY).catch(() => undefined),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY).catch(() => undefined),
  ]);
}
