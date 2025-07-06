import type { ConditionTree } from '@/types/params'
import type { FieldName, PrimaryKeyValue, Schema, TableName } from '@/types/schema'
import type { Item } from '@/utils/helpers'
import { addPrimaryKeyCondition, join, trim } from '@/utils/helpers'
import { from, groupBy, insert, joins, limit, offset, orderBy, remove, select, set, update, values, where } from '@/utils/statements'

/**
 * Write a SQL query to find a single record in a table with specified parameters.
 */
export function findOneRaw<const S extends Schema>(schema: S) {
   return <T extends TableName<S>, const K extends PrimaryKeyValue<S, T>, const P extends FindOneParams<S, T>>(table: T, key: K, params: P) => {
      const whereClause = addPrimaryKeyCondition(schema, table, key, params)

      return trim(join([
         select(schema, table, params.columns as P['columns']),
         from(table),
         joins(schema, table, params),
         where(schema, table, whereClause),
      ], ' '))
   }
}

/**
 * Write a SQL query to find records in a table with specified parameters.
 */
export function findRaw<const S extends Schema>(schema: S) {
   return <T extends TableName<S>, const P extends FindParams<S, T>>(table: T, params: P) => {
      return trim(join([
         select(schema, table, params.columns as P['columns']),
         from(table),
         joins(schema, table, params),
         where(schema, table, params.where as P['where']),
         groupBy(schema, table, params.groupBy as P['groupBy']),
         orderBy(schema, table, params.orderBy as P['orderBy']),
         limit(params.limit as P['limit']),
         offset(params.offset as P['offset']),
      ], ' '))
   }
}

/**
 * Write a SQL query to remove records from a table with specified parameters.
 */
export function removeRaw<const S extends Schema>(schema: S) {
   return <T extends TableName<S>, const P extends RemoveParams<S, T>>(table: T, params: P) => {
      return trim(join([
         remove(table),
         where(schema, table, params.where as P['where']),
      ], ' '))
   }
}

/**
 * Write a SQL query to remove a single record from a table with specified parameters.
 */
export function removeOneRaw<const S extends Schema>(schema: S) {
   return <T extends TableName<S>, const K extends PrimaryKeyValue<S, T>, const P extends RemoveOneParams<S, T>>(table: T, key: K, params?: P) => {
      const whereClause = addPrimaryKeyCondition(schema, table, key, params)

      return trim(join([
         remove(table),
         where(schema, table, whereClause),
      ], ' '))
   }
}

/**
 * Write a SQL query to update records in a table with specified parameters.
 */
export function updateRaw<const S extends Schema>(schema: S) {
   return <T extends TableName<S>, const I extends Partial<Item<S, T>>, const P extends UpdateParams<S, T>>(table: T, item: I, params: P) => {
      return trim(join([
         update(table),
         set(item),
         where(schema, table, params.where as P['where']),
      ], ' '))
   }
}

/**
 * Write a SQL query to update a single record in a table with specified parameters.
 */
export function updateOneRaw<const S extends Schema>(schema: S) {
   return <T extends TableName<S>, const K extends PrimaryKeyValue<S, T>, const I extends Partial<Item<S, T>>, const P extends UpdateOneParams<S, T>>(table: T, key: K, item: I, params?: P) => {
      const whereClause = addPrimaryKeyCondition(schema, table, key, params)

      return trim(join([
         update(table),
         set(item),
         where(schema, table, whereClause),
      ], ' '))
   }
}

/**
 * Write a SQL query to create a single record in a table.
 */
export function createOneRaw<const S extends Schema>(_schema: S) {
   return <T extends TableName<S>, const I extends Partial<Item<S, T>>>(table: T, item: I) => {
      return trim(join([
         insert(table),
         values(item),
      ], ' '))
   }
}

export interface FindParams<S extends Schema = Schema, F extends TableName<S> = TableName<S>> {
   columns?: FieldName<S, F>[]
   where?: ConditionTree<S, F>
   orderBy?: `${'' | '-'}${FieldName<S, F>}`[]
   groupBy?: FieldName<S, F>[]
   limit?: number
   offset?: number
}

export type FindOneParams<S extends Schema = Schema, F extends TableName<S> = TableName<S>> = Pick<FindParams<S, F>, 'columns' | 'where'>

export type RemoveParams<S extends Schema = Schema, F extends TableName<S> = TableName<S>> = Pick<FindParams<S, F>, 'where'>

export type RemoveOneParams<S extends Schema = Schema, F extends TableName<S> = TableName<S>> = Pick<FindParams<S, F>, 'where'>

export type UpdateParams<S extends Schema = Schema, F extends TableName<S> = TableName<S>> = Pick<FindParams<S, F>, 'where'>

export type UpdateOneParams<S extends Schema = Schema, F extends TableName<S> = TableName<S>> = Pick<FindParams<S, F>, 'where'>
