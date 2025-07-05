import type { ConditionTree } from '@/types/params'
import type { FieldName, PrimaryKeyValue, Schema, TableName } from '@/types/schema'
import { addPrimaryKeyCondition, join, trim } from './utils/helpers'
import { from, joins, select, where } from './utils/statements'

/**
 * Write a SQL query to find records in a table with specified parameters.
 */
export function raw<S extends Schema, T extends TableName<S>, const K extends PrimaryKeyValue<S, T>, const P extends QueryParams<S, T>>(schema: S, table: T, key: K, params: P) {
   const whereClause = addPrimaryKeyCondition(schema, table, key, params)

   return trim(join([
      select(schema, table, params.columns as P['columns']),
      from(table),
      joins(schema, table, params),
      where(schema, table, whereClause),
   ], ' '))
}

export interface QueryParams<S extends Schema = Schema, F extends TableName<S> = TableName<S>> {
   columns?: FieldName<S, F>[]
   where?: ConditionTree<S, F>
}
