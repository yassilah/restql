import { createDatabase } from "db0";
import { QueryParams } from "@/types/params";
import { PrimaryKeyValue, Schema, TableName } from "@/types/schema";
import type { Item } from "./utils/helpers";
import nodeSqlite3Connector from "db0/connectors/sqlite3";

import { raw as _findRaw } from "./find";
import { raw as _findOneRaw, type QueryParams as FindOneParams } from "./find-one";
import { raw as _updateRaw, type QueryParams as UpdateParams } from "./update";
import { raw as _updateOneRaw, type QueryParams as UpdateOneParams} from "./update-one";
import { raw as _removeRaw, type QueryParams as RemoveParams } from "./remove";
import { raw as _removeOneRaw, type QueryParams as RemoveOneParams } from "./remove-one";
import { raw as _createOneRaw } from "./create-one";

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

    const update = <T extends TableName<S>, const I extends Partial<Item<S, T>>, const P extends UpdateParams<S, T>>(table: T, item: I, params: P) => {
        return db.sql`${_updateRaw(schema, table, item, params)}`;
    }

    const updateRaw = <T extends TableName<S>, const I extends Partial<Item<S, T>>, const P extends UpdateParams<S, T>>(table: T, item: I, params: P) => {
        return _updateRaw(schema, table, item, params);
    }

    const updateOne = <T extends TableName<S>, const K extends PrimaryKeyValue<S, T>, const I extends Partial<Item<S, T>>, const P extends UpdateOneParams<S, T>>(table: T, primaryKey: K, item: I, params: P) => {
        return db.sql`${_updateOneRaw(schema, table, primaryKey, item, params)}`;
    }

    const updateOneRaw = <T extends TableName<S>, const K extends PrimaryKeyValue<S, T>, const I extends Partial<Item<S, T>>, const P extends UpdateOneParams<S, T>>(table: T, primaryKey: K, item: I, params: P) => {
        return _updateOneRaw(schema, table, primaryKey, item, params);
    }

    const remove = <T extends TableName<S>, const P extends RemoveParams<S, T>>(table: T, params: P) => {
        return db.sql`${_removeRaw(schema, table, params)}`;
    }

    const removeRaw = <T extends TableName<S>, const P extends RemoveParams<S, T>>(table: T, params: P) => {
        return _removeRaw(schema, table, params);
    }

    const removeOne = <T extends TableName<S>, const K extends PrimaryKeyValue<S, T>, const P extends RemoveOneParams<S, T>>(table: T, primaryKey: K, params: P) => {
        return db.sql`${_removeOneRaw(schema, table, primaryKey, params)}`;
    }

    const removeOneRaw = <T extends TableName<S>, const K extends PrimaryKeyValue<S, T>, const P extends RemoveOneParams<S, T>>(table: T, primaryKey: K, params: P) => {
        return _removeOneRaw(schema, table, primaryKey, params);
    }

    const createOne = <T extends TableName<S>, const I extends Partial<Item<S, T>>>(table: T, item: I) => {
        return db.sql`${_createOneRaw(schema, table, item)}`;
    }

    const createOneRaw = <T extends TableName<S>, const I extends Partial<Item<S, T>>>(table: T, item: I) => {
        return _createOneRaw(schema, table, item);
    }


    return {
        find: Object.assign(find, { raw: findRaw }),
        findOne: Object.assign(findOne, { raw: findOneRaw }),
        update: Object.assign(update, { raw: updateRaw }),
        updateOne: Object.assign(updateOne, { raw: updateOneRaw }),
        remove: Object.assign(remove, { raw: removeRaw }),
        removeOne: Object.assign(removeOne, { raw: removeOneRaw }),
        createOne: Object.assign(createOne, { raw: createOneRaw }),
    }
}

/**
 * Create a default SQLite database instance using the `better-sqlite3` connector.
 */
function createDefaultDb() {
    return createDatabase(nodeSqlite3Connector({ cwd: process.cwd() }))
}