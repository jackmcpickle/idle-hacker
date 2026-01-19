import { drizzle, type LibSQLDatabase } from 'drizzle-orm/libsql/web';
import { createClient } from '@libsql/client/web';
import * as schema from '@/db/schema';

export function createDb(
    url: string,
    authToken: string,
): LibSQLDatabase<typeof schema> {
    const client = createClient({ url, authToken });
    return drizzle({ client, schema });
}

export type Database = LibSQLDatabase<typeof schema>;
