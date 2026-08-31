import { neon } from '@neondatabase/serverless';

let client: ReturnType<typeof neon> | null = null;

/** Creates the Neon HTTP client only when a route actually needs it. */
export function getNeonClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not configured');
  }
  client ??= neon(connectionString);
  return client;
}

export function isDatabaseError(error: unknown): boolean {
  return error instanceof Error && /connection terminated|connection reset|socket/i.test(error.message);
}
