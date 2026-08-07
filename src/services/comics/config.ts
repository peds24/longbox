import { MissingCredentialsError } from './types';

export function getMetronCredentials(): { username: string; password: string } {
  const username = process.env.EXPO_PUBLIC_METRON_USERNAME;
  const password = process.env.EXPO_PUBLIC_METRON_PASSWORD;

  if (!username) throw new MissingCredentialsError('EXPO_PUBLIC_METRON_USERNAME');
  if (!password) throw new MissingCredentialsError('EXPO_PUBLIC_METRON_PASSWORD');

  return { username, password };
}
