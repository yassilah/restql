import type { Item } from './utils/helpers'
import type { ConditionTree } from '@/types/params'
import type { Schema, TableName } from '@/types/schema'
import { join, trim } from './utils/helpers'
import { set, update, where } from './utils/statements'

/**
 * Write a SQL query to find records in a table with specified parameters.
 */
export function raw<S extends Schema, T extends TableName<S>, const I extends Partial<Item<S, T>>, const P extends QueryParams<S, T>>(schema: S, table: T, item: I, params: P) {
   return trim(join([
      update(table),
      set(item),
      where(schema, table, params.where as P['where']),
   ], ' '))
}

export interface QueryParams<S extends Schema = Schema, F extends TableName<S> = TableName<S>> {
   where?: ConditionTree<S, F>
}
