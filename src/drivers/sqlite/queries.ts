import type { Trim } from 'type-fest'
import type { CleanJoin } from '@/types/helpers'
import type { ConditionTree } from '@/types/params'
import type { FieldName, PrimaryKeyValue, Schema, TableName } from '@/types/schema'
import type { Item, WhereWithPrimaryKey } from '@/utils/helpers'
import type { From, GroupBy, Insert, Joins, Limit, Offset, OrderBy, Remove, Select, Set, Update, Values, Where } from '@/utils/statements'
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
      ], ' ')) as FindOneRaw<S, T, K, P>
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
      ], ' ')) as FindRaw<S, T, P>
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
      ], ' ')) as RemoveRaw<S, T, P>
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
      ], ' ')) as RemoveOneRaw<S, T, K, P>
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
      ], ' ')) as UpdateRaw<S, T, I, P>
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
      ], ' ')) as UpdateOneRaw<S, T, K, I, P>
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
      ], ' ')) as CreateOneRaw<S, T, I>
   }
}

export interface FindParams<S extends Schema = Schema, T extends TableName<S> = TableName<S>> {
   columns?: FieldName<S, T>[]
   where?: ConditionTree<S, T>
   orderBy?: `${'' | '-'}${FieldName<S, T>}`[]
   groupBy?: FieldName<S, T>[]
   limit?: number
   offset?: number
}

export type FindOneParams<S extends Schema = Schema, T extends TableName<S> = TableName<S>> = Pick<FindParams<S, T>, 'columns' | 'where'>

export type RemoveParams<S extends Schema = Schema, T extends TableName<S> = TableName<S>> = Pick<FindParams<S, T>, 'where'>

export type RemoveOneParams<S extends Schema = Schema, T extends TableName<S> = TableName<S>> = Pick<FindParams<S, T>, 'where'>

export type UpdateParams<S extends Schema = Schema, T extends TableName<S> = TableName<S>> = Pick<FindParams<S, T>, 'where'>

export type UpdateOneParams<S extends Schema = Schema, T extends TableName<S> = TableName<S>> = Pick<FindParams<S, T>, 'where'>

export type CreateOneRaw<S extends Schema, T extends TableName<S>, I extends Partial<Item<S, T>>> = Trim<CleanJoin<[
   Insert<T>,
   Values<S, T, I>,
], ' '>>

export type UpdateOneRaw<S extends Schema, T extends TableName<S>, K extends PrimaryKeyValue<S, T>, I extends Partial<Item<S, T>>, P extends UpdateOneParams<S, T>> = Trim<CleanJoin<[
   Update<T>,
   Set<S, T, I>,
   Where<S, T, WhereWithPrimaryKey<S, T, K, P>>,
], ' '>>

export type UpdateRaw<S extends Schema, T extends TableName<S>, I extends Partial<Item<S, T>>, P extends UpdateParams<S, T>> = Trim<CleanJoin<[
   Update<T>,
   Set<S, T, I>,
   Where<S, T, P['where']>,
], ' '>>

export type RemoveRaw<S extends Schema, T extends TableName<S>, P extends RemoveParams<S, T>> = Trim<CleanJoin<[
   Remove<T>,
   Where<S, T, P['where']>,
], ' '>>

export type RemoveOneRaw<S extends Schema, T extends TableName<S>, K extends PrimaryKeyValue<S, T>, P extends RemoveOneParams<S, T>> = Trim<CleanJoin<[
   Remove<T>,
   Where<S, T, WhereWithPrimaryKey<S, T, K, P>>,
], ' '>>

export type FindRaw<S extends Schema, T extends TableName<S>, P extends FindParams<S, T>> = Trim<CleanJoin<[
   Select<S, T, P['columns']>,
   From<S, T>,
   Joins<S, T, P>,
   Where<S, T, P['where']>,
   GroupBy<S, T, P['groupBy']>,
   OrderBy<S, T, P['orderBy']>,
   Limit<P['limit']>,
   Offset<P['offset']>,
], ' '>>

export type FindOneRaw<S extends Schema, T extends TableName<S>, K extends PrimaryKeyValue<S, T>, P extends FindOneParams<S, T>> = Trim<CleanJoin<[
   Select<S, T, P['columns']>,
   From<S, T>,
   Joins<S, T, P>,
   Where<S, T, WhereWithPrimaryKey<S, T, K, P>>,
], ' '>>
