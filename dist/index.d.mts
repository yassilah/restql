import { S as Schema, T as TableName, Q as QueryParams, I as Item, a as TableDefinition } from './shared/restql.Cg9JqUZs.mjs';
import * as db0 from 'db0';
import { Database } from 'db0';
import 'type-fest/source/union-to-tuple';
import 'type-fest';
import 'type-fest/source/join';

/**
 * Define a schema for the database.
 */
declare function defineSchema<const S extends Schema>(schema: S): S;
/**
 * Define a driver for the database.
 */
declare function defineDriver<R extends DriverOptions, S extends Schema>(create: (schema: S) => R, defautlDb: () => Database): (schema: S, db?: Database<db0.Connector<unknown>>) => {
    find: (<T extends TableName<S>, P extends QueryParams<S, T>>(table: T, params: P) => Promise<Item<S, T, P["columns"]>[]>) & {
        raw: R["findRaw"];
    };
    findOne: (<T extends TableName<S>, K extends Item<S, T>["id"], P extends QueryParams<S, T>>(table: T, primaryKey: K, params?: P) => Promise<Item<S, T, P["columns"]> | null>) & {
        raw: R["findOneRaw"];
    };
    update: (<T extends TableName<S>, P extends QueryParams<S, T>>(table: T, item: Partial<Item<S, T, P["columns"]>>, params?: P) => Promise<Item<S, T, P["columns"]>>) & {
        raw: R["updateRaw"];
    };
    updateOne: (<T extends TableName<S>, K extends Item<S, T>["id"], P extends QueryParams<S, T>>(table: T, primaryKey: K, item: Partial<Item<S, T, P["columns"]>>, params?: P) => Promise<Item<S, T, P["columns"]> | null>) & {
        raw: R["updateOneRaw"];
    };
    createOne: (<T extends TableName<S>>(table: T, item: Partial<Item<S, T>>) => Promise<TableDefinition<S, T, false>>) & {
        raw: R["createOneRaw"];
    };
    remove: (<T extends TableName<S>, P extends QueryParams<S, T>>(table: T, params: P) => Promise<TableDefinition<S, T, false>[]>) & {
        raw: R["removeRaw"];
    };
    removeOne: (<T extends TableName<S>, K extends Item<S, T>["id"], P extends QueryParams<S, T>>(table: T, primaryKey: K, params?: P) => Promise<TableDefinition<S, T, false> | null>) & {
        raw: R["removeOneRaw"];
    };
    db: Database<db0.Connector<unknown>>;
    schema: S;
    setDatabase: (newDb: Database) => /*elided*/ any;
};
interface DriverOptions {
    findRaw: (table: string, params: object) => string;
    findOneRaw: (table: string, primaryKey: any, params: object) => string;
    updateRaw: (table: string, item: object, params: object) => string;
    updateOneRaw: (table: string, primaryKey: any, item: object, params: object) => string;
    removeRaw: (table: string, params: object) => string;
    removeOneRaw: (table: string, primaryKey: any, params: object) => string;
    createOneRaw: (table: string, item: object) => string;
}

export { defineDriver, defineSchema };
export type { DriverOptions };
