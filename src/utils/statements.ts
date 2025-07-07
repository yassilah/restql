import type { UnionToTuple } from 'type-fest'
import type { AllFields, Item, JoinClauses, Normalize, NormalizedColumns, OrderByClauses, WhereClauses, Wrap } from './helpers'
import type { CleanJoin } from '@/types/helpers'
import type { QueryParams } from '@/types/params'
import type { FieldName, Schema, TableName } from '@/types/schema'
import { getAllJoinClauses, getOrderByClauses, getWhereClauses, join, normalizeColumns, normalizeOperationValue, wrap } from './helpers'

/**
 * SQL Select statement for the specified table and columns.
 */
export function select<S extends Schema, T extends TableName<S>, C extends FieldName<S, T>[] | undefined>(schema: S, table: T, columns?: C): Select<S, T, C> {
   return `SELECT ${normalizeColumns(schema, table, columns)}`
}

/**
 * SQL Update statement for the specified table.
 */
export function update<T extends TableName<Schema>>(table: T): Update<T> {
   return `UPDATE ${wrap(table)}`
}

/**
 * SQL Remove statement for the specified table.
 */
export function remove<T extends TableName<Schema>>(table: T): Remove<T> {
   return `DELETE FROM ${wrap(table)}`
}

/**
 * SQL Insert statement for the specified table.
 */
export function insert<T extends TableName<Schema>>(table: T): Insert<T> {
   return `INSERT INTO ${wrap(table)}`
}

/**
 * SQL Values statement for the specified item.
 */
export function values<S extends Schema, T extends TableName<S>, I extends Partial<Item<S, T>>>(item: I): Values<S, T, I> {
   return `(${join(Object.keys(item), ', ')}) VALUES (${join(Object.values(item).map(normalizeOperationValue), ', ')})` as Values<S, T, I>
}

/**
 * SQL Set statement for the specified table and item.
 */
export function set<S extends Schema, T extends TableName<S>, I extends Partial<Item<S, T>>>(item: I): Set<S, T, I> {
   return `SET ${join(Object.entries(item).map(([key, value]) => `${wrap(key)} = ${normalizeOperationValue(value)}`), ', ')}` as Set<S, T, I>
}

/**
 * SQL From statement for the specified table.
 */
export function from<S extends Schema, T extends TableName<S>>(table: T): From<S, T> {
   return `FROM ${wrap(table)}`
}

/**
 * SQL Limit statement for the specified query parameters.
 */
export function limit<L extends QueryParams['limit']>(limit: L): Limit<L> {
   return (limit !== undefined ? `LIMIT ${limit}` : '') as Limit<L>
}

/**
 * SQL Offset statement for the specified query parameters.
 */
export function offset<O extends QueryParams['offset']>(offset: O): Offset<O> {
   return (offset !== undefined ? `OFFSET ${offset}` : '') as Offset<O>
}

/**
 * SQL Joins for the specified table and query parameters.
 */
export function joins<S extends Schema, T extends TableName<S>, P extends QueryParams<S, T>>(schema: S, table: T, params: P): Joins<S, T, P> {
   return join(getAllJoinClauses(schema, table, params), ' ') as unknown as Joins<S, T, P>
}

/**
 * SQL Group By statement for the specified query parameters.
 */
export function groupBy<S extends Schema, T extends TableName<S>, C extends QueryParams<S, T>['groupBy']>(schema: S, table: T, columns?: C): GroupBy<S, T, C> {
   return (!columns?.length ? '' : `GROUP BY ${normalizeColumns(schema, table, columns)}`) as GroupBy<S, T, C>
}

/**
 * Get order by clauses for the specified query parameters.
 */
export function orderBy<S extends Schema, T extends TableName<S>, C extends QueryParams<S, T>['orderBy']>(schema: S, table: T, columns?: C): OrderBy<S, T, C> {
   return (!columns?.length ? '' : `ORDER BY ${getOrderByClauses(schema, table, columns)}`) as OrderBy<S, T, C>
}

/**
 * SQL Where statement for the specified query parameters.
 */
export function where<S extends Schema, T extends TableName<S>, W extends QueryParams<S, T>['where']>(schema: S, table: T, where: W): Where<S, T, W> {
   return (where ? `WHERE ${getWhereClauses(schema, table, where)}` : '') as Where<S, T, W>
}

export type Insert<T extends TableName<Schema>> = `INSERT INTO ${Wrap<T>}`

export type Select<S extends Schema, T extends TableName<S>, C extends FieldName<S, T>[] | undefined> = `SELECT ${CleanJoin<NormalizedColumns<S, T, C>>}`

export type Update<T extends TableName<Schema>> = `UPDATE ${Wrap<T>}`

export type Remove<T extends TableName<Schema>> = `DELETE FROM ${Wrap<T>}`

export type Values<S extends Schema, T extends TableName<S>, I extends Partial<Item<S, T>>> = `(${CleanJoin<UnionToTuple<{ [K in keyof I]: Wrap<K & string> }[keyof I]>>}) VALUES (${CleanJoin<UnionToTuple<{ [K in keyof I]: Normalize<I[K]> }[keyof I]>, ', '>})`

export type Set<S extends Schema, T extends TableName<S>, I extends Partial<Item<S, T>>> = `SET ${CleanJoin<UnionToTuple<{ [K in keyof I]: `${Wrap<K & string>} = ${Normalize<I[K]>}` }[keyof I]>>}`

export type From<S extends Schema, T extends TableName<S>> = `FROM ${Wrap<T>}`

export type Limit<L extends QueryParams['limit']> = L extends number ? `LIMIT ${L}` : ''

export type Offset<O extends QueryParams['offset']> = O extends number ? `OFFSET ${O}` : ''

export type Joins<S extends Schema, T extends TableName<S>, P extends QueryParams<S, T>> = CleanJoin<JoinClauses<S, T, AllFields<S, T, P>[number]>, ' '>

export type GroupBy<S extends Schema, T extends TableName<S>, C extends QueryParams<S, T>['groupBy']> = C extends string[]
   ? `GROUP BY ${CleanJoin<NormalizedColumns<S, T, C>>}` : ''

export type OrderBy<S extends Schema, T extends TableName<S>, C extends QueryParams<S, T>['orderBy']> = C extends string[]
   ? `ORDER BY ${CleanJoin<OrderByClauses<S, T, C>>}` : ''

export type Where<S extends Schema, T extends TableName<S>, W extends QueryParams<S, T>['where']> = W extends Record<string, any> ? `WHERE ${WhereClauses<S, T, W>}` : ''
