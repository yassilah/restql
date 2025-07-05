import type { QueryParams } from '@/types/params'
import type { Schema, TableName } from '@/types/schema'
import { join, trim } from './utils/helpers'
import { from, groupBy, joins, limit, offset, orderBy, select, where } from './utils/statements'
/**
 * Write a SQL query to find records in a table with specified parameters.
 */
export function raw<S extends Schema, T extends TableName<S>, const P extends QueryParams<S, T>>(schema: S, table: T, params: P) {
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
