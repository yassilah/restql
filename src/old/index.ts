import { getQuery } from "ufo"
import { sqlite } from "./old/drivers/sqlite"
import { QueryStringToQueryParams } from "./helper"


/**
 * Turns a URL into a raw SQL string.
 */
export function createInstance(options: Options = {}) {
    const driver = options.driver || sqlite(options.schema)
    return (url: string, options: Options = { driver }) => toRawSQL(url, options)
}

/**
 * Turns a URL into a raw SQL string.
 */
export function toRawSQL<U extends string>(url: U, options: Options = {}) {
    const driver = options.driver || sqlite(options.schema)
    return driver(toQueryParams(url, options.limit))
}


/**
 * Turns a URL into a query params object.
 */
export function toQueryParams<U extends string>(url: U, limit = 0) {
    const params = getQuery(url.toString())
    
    if (typeof params.from !== 'string') {
        throw new Error('Wrong or missing "from" parameter.')
    }

    const from = String(params.from)

    const queryParams: QueryParams = {
        from,
        select: [],
        join: [],
        where: {},
        orderBy: params.orderBy ? (Array.isArray(params.orderBy) ? params.orderBy : [params.orderBy]) : [],
        limit: params.limit ? Number(params.limit) : limit,
        offset: params.offset ? Number(params.offset) : 0,
        groupBy: params.groupBy ? (Array.isArray(params.groupBy) ? params.groupBy : [params.groupBy]) : [],
    }

    queryParams.where = createWhereConditions(parseWhereConditions(params.where), from, queryParams.join)

    const select = Array.isArray(params.select) ? params.select : [params.select]

    for (const item of select) {
        if (item.includes('.')) {
            const tables = item.split('.').slice(0, -1)
            if (tables[0] !== from) {
                queryParams.join.push(tables)
            }
        }

        queryParams.select.push(item)
    }

    queryParams.join = queryParams.join.sort((a, b) => b.length - a.length).filter((value, index, self) => {
        return self.findIndex(v => v[0] === value[0]) === index
    })

    return queryParams as QueryStringToQueryParams<U>
}

/**
 * Parse where conditions.
 */
function parseWhereConditions(raw: string | string[]) {
    if (!raw) return {}
        
    if (Array.isArray(raw)) {
        return raw.map(parseWhereConditions)
    }
    
    return  JSON.parse(raw)
}

    

/**
 * Create where conditionTree.
 */
function createWhereConditions(raw: Record<string, any>, rootTable: string, joins: Join = [], current: ConditionTree = {}, logicalOperator?: LogicalOperator): ConditionTree {
    for (const [key, value] of Object.entries(raw)) {
        if (key === '$and' || key === '$or') {
            if (logicalOperator) {
                current[logicalOperator] ??= []
                current[logicalOperator].push({ [key]: [] })
                value.forEach(item => createWhereConditions(item, rootTable, joins, current[logicalOperator].at(-1), key as LogicalOperator))
            } else {
                value.forEach(item => createWhereConditions(item, rootTable, joins, current, key as LogicalOperator))
            }
            
        } else {
            const operator = key as Operator
            const [column, ...values] = value
            const columnParts = column.split('.')
            
            if (columnParts.length > 2) {
                joins.push(columnParts.slice(0, -1))
            }

            const condition: Condition = {
                column,
                operator,
                value: values.length > 1 ? values : values[0]
            }

            if (logicalOperator) {
                current[logicalOperator] ??= []
                current[logicalOperator].push(condition)
            } else {
                current['$and'] ??= []
                current['$and'].push(condition)
            }
        }
    }

    return current
}

export interface Options {
    driver?: (params: QueryParams) => string
    schema?: Schema
    limit?: number
}

export interface QueryParams {
    from: string
    select: string[]
    where: ConditionTree
    join: Join
    orderBy: string[]
    limit: number
    offset: number
    groupBy: string[]
}
export type LogicalOperator = 'and' | 'or'
export type JoinType = 'inner' | 'left' | 'right' | 'full'
export type Join = string[][]
export type OrderByDirection = 'asc' | 'desc'
export type _Operator = 'eq' | 'eq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in' | 'between' 
export type Operator = `$${_Operator}` | `$n${_Operator}`
export type Value = string | number | boolean | Value[]
export type ConditionTree = {
    $and?: (ConditionTree | Condition)[]
    $or?: (ConditionTree | Condition)[]
}
export type Condition = {
    column: string
    operator: Operator
    value?: Value
}
export interface Schema {
    [key: string]: TableSchema
}

export interface TableSchema {
    columns?: ColumnSchema[]
    relations?: {
        [key: string]: {
            table?: string
            through?: string
            fromKey?: string
            toKey?: string
        }
    }
}
export interface ColumnSchema {
    type: string
    key: string
}
