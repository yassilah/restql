import type { QueryParams } from "@/types/params"
import type { FieldName, Schema, TableName } from "@/types/schema"
import { getAllJoinClauses, getOrderByClauses, getWhereClauses, Join, join, normalizeColumns, NormalizedColumns, OrderByClauses, WhereClauses, wrap } from "./helpers"


/**
 * SQL Select statement for the specified table and columns.
 */
export function select<S extends Schema, T extends TableName<S>, C extends FieldName<S, T>[] | undefined>(schema: S, table: T, columns?: C) {
    return `SELECT ${normalizeColumns(schema, table, columns)}` as const
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