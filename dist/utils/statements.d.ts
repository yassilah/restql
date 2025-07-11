import { UnionToTuple } from 'type-fest';
import { S as Schema, T as TableName, F as FieldName, C as CleanJoin, N as NormalizedColumns, n as Wrap, I as Item, o as Normalize, Q as QueryParams, p as JoinClauses, A as AllFields, q as OrderByClauses, r as WhereClauses } from '../shared/restql.BMfI9CK7.js';
import 'type-fest/source/union-to-tuple';
import 'type-fest/source/join';

/**
 * SQL Select statement for the specified table and columns.
 */
declare function select<S extends Schema, T extends TableName<S>, C extends FieldName<S, T>[] | undefined>(schema: S, table: T, columns?: C): Select<S, T, C>;
/**
 * SQL Update statement for the specified table.
 */
declare function update<T extends TableName<Schema>>(table: T): Update<T>;
/**
 * SQL Remove statement for the specified table.
 */
declare function remove<T extends TableName<Schema>>(table: T): Remove<T>;
/**
 * SQL Insert statement for the specified table.
 */
declare function insert<T extends TableName<Schema>>(table: T): Insert<T>;
/**
 * SQL Values statement for the specified item.
 */
declare function values<S extends Schema, T extends TableName<S>, I extends Partial<Item<S, T>>>(item: I): Values<S, T, I>;
/**
 * SQL Set statement for the specified table and item.
 */
declare function set<S extends Schema, T extends TableName<S>, I extends Partial<Item<S, T>>>(item: I): Set<S, T, I>;
/**
 * SQL From statement for the specified table.
 */
declare function from<S extends Schema, T extends TableName<S>>(table: T): From<S, T>;
/**
 * SQL Limit statement for the specified query parameters.
 */
declare function limit<L extends QueryParams['limit']>(limit: L): Limit<L>;
/**
 * SQL Offset statement for the specified query parameters.
 */
declare function offset<O extends QueryParams['offset']>(offset: O): Offset<O>;
/**
 * SQL Joins for the specified table and query parameters.
 */
declare function joins<S extends Schema, T extends TableName<S>, P extends QueryParams<S, T>>(schema: S, table: T, params: P): Joins<S, T, P>;
/**
 * SQL Group By statement for the specified query parameters.
 */
declare function groupBy<S extends Schema, T extends TableName<S>, C extends QueryParams<S, T>['groupBy']>(schema: S, table: T, columns?: C): GroupBy<S, T, C>;
/**
 * Get order by clauses for the specified query parameters.
 */
declare function orderBy<S extends Schema, T extends TableName<S>, C extends QueryParams<S, T>['orderBy']>(schema: S, table: T, columns?: C): OrderBy<S, T, C>;
/**
 * SQL Where statement for the specified query parameters.
 */
declare function where<S extends Schema, T extends TableName<S>, W extends QueryParams<S, T>['where']>(schema: S, table: T, where: W): Where<S, T, W>;
type Insert<T extends TableName<Schema>> = `INSERT INTO ${Wrap<T>}`;
type Select<S extends Schema, T extends TableName<S>, C extends FieldName<S, T>[] | undefined> = `SELECT ${CleanJoin<NormalizedColumns<S, T, C>>}`;
type Update<T extends TableName<Schema>> = `UPDATE ${Wrap<T>}`;
type Remove<T extends TableName<Schema>> = `DELETE FROM ${Wrap<T>}`;
type Values<S extends Schema, T extends TableName<S>, I extends Partial<Item<S, T>>> = `(${CleanJoin<UnionToTuple<{
    [K in keyof I]: Wrap<K & string>;
}[keyof I]>>}) VALUES (${CleanJoin<UnionToTuple<{
    [K in keyof I]: Normalize<I[K]>;
}[keyof I]>, ', '>})`;
type Set<S extends Schema, T extends TableName<S>, I extends Partial<Item<S, T>>> = `SET ${CleanJoin<UnionToTuple<{
    [K in keyof I]: `${Wrap<K & string>} = ${Normalize<I[K]>}`;
}[keyof I]>>}`;
type From<S extends Schema, T extends TableName<S>> = `FROM ${Wrap<T>}`;
type Limit<L extends QueryParams['limit']> = L extends number ? `LIMIT ${L}` : '';
type Offset<O extends QueryParams['offset']> = O extends number ? `OFFSET ${O}` : '';
type Joins<S extends Schema, T extends TableName<S>, P extends QueryParams<S, T>> = CleanJoin<JoinClauses<S, T, AllFields<S, T, P>[number]>, ' '>;
type GroupBy<S extends Schema, T extends TableName<S>, C extends QueryParams<S, T>['groupBy']> = C extends string[] ? `GROUP BY ${CleanJoin<NormalizedColumns<S, T, C>>}` : '';
type OrderBy<S extends Schema, T extends TableName<S>, C extends QueryParams<S, T>['orderBy']> = C extends string[] ? `ORDER BY ${CleanJoin<OrderByClauses<S, T, C>>}` : '';
type Where<S extends Schema, T extends TableName<S>, W extends QueryParams<S, T>['where']> = W extends Record<string, any> ? `WHERE ${WhereClauses<S, T, W>}` : '';

export { from, groupBy, insert, joins, limit, offset, orderBy, remove, select, set, update, values, where };
export type { From, GroupBy, Insert, Joins, Limit, Offset, OrderBy, Remove, Select, Set, Update, Values, Where };
