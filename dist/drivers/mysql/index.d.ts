import * as db0 from 'db0';
import { FindRawFn, FindOneRawFn, UpdateRawFn, UpdateOneRawFn, CreateOneRawFn, RemoveRawFn, RemoveOneRawFn } from '../sqlite/queries.js';
import { S as Schema, T as TableName, Q as QueryParams, I as Item, a as TableDefinition } from '../../shared/restql.Cg9JqUZs.js';
import 'type-fest';
import '../../utils/statements.js';
import 'type-fest/source/union-to-tuple';
import 'type-fest/source/join';

declare const _default: <S extends Schema>(schema: S) => {
    find: (<T extends TableName<S>, P extends QueryParams<S, T>>(table: T, params: P) => Promise<Item<S, T, P["columns"]>[]>) & {
        raw: FindRawFn<S>;
    };
    findOne: (<T extends TableName<S>, K extends TableDefinition<S, T, false>["id"], P_1 extends QueryParams<S, T>>(table: T, primaryKey: K, params?: P_1 | undefined) => Promise<Item<S, T, P_1["columns"]> | null>) & {
        raw: FindOneRawFn<S>;
    };
    update: (<T extends TableName<S>, P_2 extends QueryParams<S, T>>(table: T, item: Partial<Item<S, T, P_2["columns"]>>, params?: P_2 | undefined) => Promise<Item<S, T, P_2["columns"]>>) & {
        raw: UpdateRawFn<S>;
    };
    updateOne: (<T extends TableName<S>, K_1 extends TableDefinition<S, T, false>["id"], P_3 extends QueryParams<S, T>>(table: T, primaryKey: K_1, item: Partial<Item<S, T, P_3["columns"]>>, params?: P_3 | undefined) => Promise<Item<S, T, P_3["columns"]> | null>) & {
        raw: UpdateOneRawFn<S>;
    };
    createOne: (<T extends TableName<S>>(table: T, item: Partial<TableDefinition<S, T, false>>) => Promise<TableDefinition<S, T, false>>) & {
        raw: CreateOneRawFn<S>;
    };
    remove: (<T extends TableName<S>, P_4 extends QueryParams<S, T>>(table: T, params: P_4) => Promise<TableDefinition<S, T, false>[]>) & {
        raw: RemoveRawFn<S>;
    };
    removeOne: (<T extends TableName<S>, K_2 extends TableDefinition<S, T, false>["id"], P_5 extends QueryParams<S, T>>(table: T, primaryKey: K_2, params?: P_5 | undefined) => Promise<TableDefinition<S, T, false> | null>) & {
        raw: RemoveOneRawFn<S>;
    };
    db: db0.Database<db0.Connector<unknown>>;
    schema: S;
    setDatabase: (newDb: db0.Database) => /*elided*/ any;
};

export { _default as default };
