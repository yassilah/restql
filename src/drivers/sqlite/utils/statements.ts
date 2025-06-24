import type { QueryParams } from "@/types/params"
import type { FieldName, Schema, TableName } from "@/types/schema"
import { getAllJoinClauses, getOrderByClauses, getWhereClauses, Item, Join, join, Normalize, normalizeColumns, NormalizedColumns, normalizeOperationValue, OrderByClauses, WhereClauses, Wrap, wrap } from "./helpers"
import { UnionToTuple } from "@/types/helpers"

/**
 * SQL Select statement for the specified table and columns.
 */
export function select<S extends Schema, T extends TableName<S>, C extends FieldName<S, T>[] | undefined>(schema: S, table: T, columns?: C) {
    return `SELECT ${normalizeColumns(schema, table, columns)}` as const
}

/**
 * SQL Update statement for the specified table.
 */
export function update<T extends TableName<Schema>>(table: T) {
    return `UPDATE ${wrap(table)}` as const
}

/**
 * SQL Remove statement for the specified table.
 */
export function remove<T extends TableName<Schema>>(table: T) {
    return `DELETE FROM ${wrap(table)}` as const
}

/**
 * SQL Insert statement for the specified table.
 */
export function insert<T extends TableName<Schema>>(table: T) {
    return `INSERT INTO ${wrap(table)}` as const
}

/**
 * SQL Values statement for the specified item.
 */
export function values<S extends Schema, T extends TableName<S>, I extends Partial<Item<S, T>>>(item: I) {
    return `(${join(Object.keys(item), ', ')}) VALUES (${join(Object.values(item).map(normalizeOperationValue), ', ')})` as `(${Join<UnionToTuple<{ [K in keyof I]: Wrap<K & string> }[keyof I]>>}) VALUES (${Join<UnionToTuple<{ [K in keyof I]: Normalize<I[K]> }[keyof I]>>})`
}

/**
 * SQL Set statement for the specified table and item.
 */
export function set<S extends Schema, T extends TableName<S>, I extends Partial<Item<S, T>>>(item: I) {
    return `SET ${join(Object.entries(item).map(([key, value]) => `${wrap(key)} = ${normalizeOperationValue(value)}`), ', ')}` as `SET ${Join<UnionToTuple<{ 
        [K in keyof I]: `${Wrap<K & string>} = ${Normalize<I[K]>}` 
    }[keyof I]>>}`
}

/**
 * SQL From statement for the specified table.
 */
export function from<S extends Schema, T extends TableName<S>>(table: T) {
    return `FROM ${wrap(table)}` as const
}

/**
 * SQL Limit statement for the specified query parameters.
 */
export function limit<L extends QueryParams['limit']>(limit: L) {
    return (limit !== undefined ? `LIMIT ${limit}` : '') as L extends number ? `LIMIT ${L}` : ''
}

/**
 * SQL Offset statement for the specified query parameters.
 */
export function offset<O extends QueryParams['offset']>(offset: O) {
    return (offset !== undefined ? `OFFSET ${offset}` : '') as O extends number ? `OFFSET ${O}` : ''
}

/**
 * SQL Joins for the specified table and query parameters.
 */
export function joins<S extends Schema, T extends TableName<S>, P extends QueryParams<S, T>>(schema: S, table: T, params: P) {
    return join(getAllJoinClauses(schema, table, params), ' ')
}

/**
 * SQL Group By statement for the specified query parameters.
 */
export function groupBy<S extends Schema, T extends TableName<S>, C extends QueryParams<S, T>['groupBy']>(schema: S, table: T, columns?: C) {
    return (!columns?.length ? '' : `GROUP BY ${normalizeColumns(schema, table, columns)}`) as C extends string[] ?
        `GROUP BY ${Join<NormalizedColumns<S, T, C>>}` : ''
}

/**
 * Get order by clauses for the specified query parameters.
 */
export function orderBy<S extends Schema, T extends TableName<S>, C extends QueryParams<S, T>['orderBy']>(schema: S, table: T, columns?: C) {
    return (!columns?.length ? '' : `ORDER BY ${getOrderByClauses(schema, table, columns)}`) as C extends string[] ?
        `ORDER BY ${Join<OrderByClauses<S, T, C>>}` : ''
}

/**
 * SQL Where statement for the specified query parameters.
 */
export function where<S extends Schema, T extends TableName<S>, W extends QueryParams<S, T>['where']>(schema: S, table: T, where: W) {
    return (where ? `WHERE ${getWhereClauses(schema, table, where)}` : '') as W extends Record<string, any> ?
        `WHERE ${WhereClauses<S, T, W>}` : ''
}