import type { QueryParams } from "../types/params"
import type { Schema } from "../types/schema"
import type { FindFunction } from "../types/sql/find"

export function sqlite<const S extends Schema>(schema: S) {
    const find = function (table: string, params: QueryParams<S>) {
        // const { select, where = {}, orderBy, limit, offset, groupBy } = params

        // const blocks: string[] =  []
        
        // blocks.push(`SELECT ${select.map(item => normalizeColumn(item, from, schema)).join(', ')}`)
        // blocks.push(`FROM ${wrap(from)}`)

        // if (join.length) {
        //    blocks.push(...join.flatMap(addJoinClauses(schema, from)))
        // }

        // blocks.push(addWhereClauses(where, from, schema, true))

        // if (groupBy.length) {
        //     blocks.push(`GROUP BY ${groupBy.map(item => normalizeColumn(item, from, schema)).join(', ')}`)
        // }

        // if (orderBy.length) {
        //     blocks.push(`ORDER BY ${orderBy.map(item => {
        //         const dir = item.startsWith('-') ? 'DESC' : 'ASC'
        //         const col = normalizeColumn(dir === 'DESC' ? item.slice(1) : item, from, schema)
        //         return [col, dir].join(' ')
        //     }).join(', ')}`)
        // }

        // if (limit) {
        //     blocks.push(`LIMIT ${limit}`)
        // }

        // if (offset) {
        //     blocks.push(`OFFSET ${offset}`)
        // }

        // return blocks.join(' ').trim()
    } as FindFunction<S>

    Object.assign(find.prototype, {
        sql(table: string, params: QueryParams<S>) {
            return ''
        }
    })

    return { find }
}


/**
 * Normalize column.
 */
function normalizeColumn(col: string, table: string, schema: Schema = {}) {
    return col.includes('.') ? normalizeRelations(col, table, schema).map(wrap).join('.') : `${wrap(table)}.${wrap(col)}`
}

/**
 * Wrap value with backticks.
 */
function wrap(value: string) {
    return `\`${value}\``
}

/**
 * Normalize relations.
 */
function normalizeRelations(col: string, rootTable: string, schema: Schema = {}) {
    let cols = col.split('.')
    cols = (cols.length < 3 ? [rootTable, ...cols] : cols)

    const [table, column] = cols.reduce((acc, col, index) => {
        const tableName = acc[index - 1] ?? rootTable
        const relation = schema[tableName]?.relations?.[col] ?? {}
        const relatedTable = relation.table ?? col
        return acc.concat(relatedTable)
    }, [] as string[]).slice(-2)

    return [table, column]
}

/**
 * Add join clauses.
 */
function addJoinClauses(schema: Record<string, any>, rootTable: string) {
    return (tables: string[]) => {
        const joins: string[] = []

        for (let i = 0; i < tables.length; i++) {
            const fromTable = tables[i - 1] ?? rootTable
            const table = tables[i]
            const relation = schema[fromTable]?.relations?.[table] ?? {}
            const toTable = (relation.through ? relation.through : relation.table) ?? table
            const fromKey = relation.fromKey ?? 'id'
            const toKey = (relation.through ? schema[table]?.relations?.[fromTable]?.toKey : relation.toKey) ?? 'id'

            joins.push(
                `INNER JOIN ${wrap(toTable)} ON ${normalizeColumn(fromKey, fromTable)} = ${normalizeColumn(toKey, toTable)}`
            )

            if (relation.through) {
                joins.push(
                    `INNER JOIN ${wrap(table)} ON ${normalizeColumn(relation.toKey, toTable)} = ${normalizeColumn(relation.fromKey, table)}`
                )
            }

            if (relation.table) {
                tables[i] = relation.table
            }
        }

        return joins
    }
}

/**
 * Add nested where clauses.
 */
function addWhereClauses(where: ConditionTree | Condition, rootTable: string, schema: Schema = {}, root = false) {
    const blocks: string[] = []

    if ('$and' in where || '$or' in where) {
        if (where.$and) {
            const conditions = where.$and.map((condition) => {
                return 'column' in condition ? addWhereCondition(condition, rootTable, schema) : addWhereClauses(condition, rootTable, schema)
            })
            blocks.push(`(${conditions.join(' AND ')})`)
        }
        
        if (where.$or) {
        const conditions =  where.$or.map((condition) => {
            return 'column' in condition ? addWhereCondition(condition,rootTable,  schema) : addWhereClauses(condition, rootTable, schema)
            })
            blocks.push(`(${conditions.join(' OR ')})`)
        }
    } else if (Object.keys(where).length) {
        blocks.push(addWhereCondition(where as Condition, rootTable, schema))
    }

    return blocks.length ? `${root ? 'WHERE ' : ''}${blocks.join(' AND ')}` : ''
}

/**
 * Add where condition.
 */
function addWhereCondition(condition: Condition, rootTable: string, schema: Schema = {}) {
    const { column, operator, value } = condition
    return `${normalizeColumn(column, rootTable, schema)} ${SQLITE_OPERATORS[operator](value)}`
}

/**
 * SQLite operators.
 */
const SQLITE_OPERATORS = {
    '$eq': (value: unknown) => value === null ? 'IS NULL' : typeof value === 'string' ? `= '${value}'` : `= ${value}`,
    '$neq': (value: unknown) => value === null ? 'IS NOT NULL' : typeof value === 'string' ? `!= '${value}'` : `!== ${value}`,
    '$gt': (value: unknown) => `> ${value}`,
    '$gte': (value: unknown) => `>= ${value}`,
    '$lt': (value: unknown) => `< ${value}`,
    '$lte': (value: unknown) => `<= ${value}`,
    '$like': (value: unknown) => `LIKE '${value}'`, 
    '$in': (value: unknown[]) => `IN (${value.map(v => typeof v === 'string' ? `'${v}'` : v).join(', ')})`,
    '$between': (value: unknown[]) => `BETWEEN ${value[0]} AND ${value[1]}`,
}