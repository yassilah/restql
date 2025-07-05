import type { PrependString } from './helpers'
import type { FieldName, Schema, TableName } from './schema'

export interface QueryParams<S extends Schema = Schema, F extends TableName<S> = TableName<S>> {
   columns?: FieldName<S, F>[]
   where?: ConditionTree<S, F>
   orderBy?: PrependString<FieldName<S, F>, '' | '-'>[]
   groupBy?: FieldName<S, F>[]
   limit?: number
   offset?: number
}

export type LogicalOperator = 'and' | 'or'
export type JoinType = 'INNER' | 'LEFT' | 'RIGHT' | 'FULL'
export type OrderByDirection = 'asc' | 'desc'
type _Operator = 'eq' | 'eq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in' | 'between'
export type Operator = {
   [O in _Operator]: O extends 'gt' | 'lt' | 'gte' | 'lte' ? `$${O}` : `$${O}` | `$n${O}`
}[_Operator]
export type Value = string | number | boolean | Value[]

export type Condition = {
   [O in Operator]?: Value
}

export type ConditionTree<S extends Schema = Schema, F extends TableName<S> = TableName<S>> = {
   [K in FieldName<S, F>]?: Condition
} & {
   $and?: ConditionTree<S, F>[]
   $or?: ConditionTree<S, F>[]
}
