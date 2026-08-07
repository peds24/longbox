import { MissingCredentialsError } from './types';

export function getMetronCredentials(): { username: string; password: string } {
  const username = process.env.EXPO_PUBLIC_METRON_USERNAME;
  const password = process.env.EXPO_PUBLIC_METRON_PASSWORD;

  if (!username) throw new MissingCredentialsError('EXPO_PUBLIC_METRON_USERNAME');
  if (!password) throw new MissingCredentialsError('EXPO_PUBLIC_METRON_PASSWORD');

  return { username, password };
}

/** Google Books works unauthenticated too (lower quota) — the key is optional, never required. */
export function getGoogleBooksApiKey(): string | undefined {
  return process.env.EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY;
}
