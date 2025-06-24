import { createDatabase } from "db0";
import { QueryParams } from "@/types/params";
import { PrimaryKeyValue, Schema, TableName } from "@/types/schema";
import { raw as _findRaw } from "./find";
import { raw as _findOneRaw } from "./find-one";
import type { Item } from "./utils/helpers";
import nodeSqlite3Connector from "db0/connectors/sqlite3";
import type { QueryParams as FindOneParams } from "./find-one";

/**
 * Create a SQLite database instance with the default connector.
 */
export const sqlite = <const S extends Schema>(schema: S, db = createDefaultDb()) => {
    const find = <T extends TableName<S>, const P extends QueryParams<S, T>>(table: T, params: P) => {
        return db.sql<Item<S, T, P['columns']>[]>`${_findRaw(schema, table, params)}`;
    }

    const findRaw = <T extends TableName<S>, const P extends QueryParams<S, T>>(table: T, params: P) => {
        return _findRaw(schema, table, params);
    }

    const findOne = <T extends TableName<S>, const K extends PrimaryKeyValue<S, T>, const P extends FindOneParams<S, T>>(table: T, primaryKey: K, params: P) => {
        return db.sql<Item<S, T, P['columns']>>`${_findOneRaw(schema, table, primaryKey, params)}`;
    }

    const findOneRaw = <T extends TableName<S>, const K extends PrimaryKeyValue<S, T>, const P extends FindOneParams<S, T>>(table: T, primaryKey: K, params: P) => {
        return _findOneRaw(schema, table, primaryKey, params);
    }


    return {
        find: Object.assign(find, { raw: findRaw }),
        findOne: Object.assign(findOne, { raw: findOneRaw }),
    }
}

/**
 * Create a default SQLite database instance using the `better-sqlite3` connector.
 */
function createDefaultDb() {
    return createDatabase(nodeSqlite3Connector({ cwd: process.cwd() }))
}