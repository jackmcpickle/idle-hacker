import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const usersTable = sqliteTable('users_table', {
    id: int().primaryKey({ autoIncrement: true }),
    name: text().notNull(),
    email: text().notNull().unique(),
    publicName: text(),
    hackerAlias: text(),
    createdAt: int({ mode: 'timestamp' })
        .notNull()
        .$defaultFn(() => new Date()),
});

export const sessionsTable = sqliteTable('sessions_table', {
    id: text().primaryKey(),
    userId: int()
        .notNull()
        .references(() => usersTable.id, { onDelete: 'cascade' }),
    expiresAt: int({ mode: 'timestamp' }).notNull(),
    createdAt: int({ mode: 'timestamp' })
        .notNull()
        .$defaultFn(() => new Date()),
});

export const magicLinksTable = sqliteTable('magic_links_table', {
    token: text().primaryKey(),
    email: text().notNull(),
    expiresAt: int({ mode: 'timestamp' }).notNull(),
    usedAt: int({ mode: 'timestamp' }),
    createdAt: int({ mode: 'timestamp' })
        .notNull()
        .$defaultFn(() => new Date()),
});

export const gameStatesTable = sqliteTable('game_states_table', {
    id: int().primaryKey({ autoIncrement: true }),
    userId: int()
        .notNull()
        .unique()
        .references(() => usersTable.id, { onDelete: 'cascade' }),
    state: text({ mode: 'json' }).notNull(),
    updatedAt: int({ mode: 'timestamp' })
        .notNull()
        .$defaultFn(() => new Date()),
});

export const pinCodesTable = sqliteTable('pin_codes_table', {
    id: int().primaryKey({ autoIncrement: true }),
    email: text().notNull(),
    pin: text().notNull(),
    expiresAt: int({ mode: 'timestamp' }).notNull(),
    usedAt: int({ mode: 'timestamp' }),
    createdAt: int({ mode: 'timestamp' })
        .notNull()
        .$defaultFn(() => new Date()),
});
