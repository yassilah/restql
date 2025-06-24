import schema from "../../../playground/schema";
import type { QueryParams } from "../../types/params";
import type { Schema, TableName, FieldName } from "./../../types/schema";
import { getAllJoinClauses, getOrderByClauses, Join, join, normalizeColumns,  NormalizedColumns, OrderByClauses,  trim,  wrap } from "./helpers";

export function find<S extends Schema, T extends TableName<S>, const P extends QueryParams<S, T>>(schema: S, table: T, params: P) {
   return trim(join([
        select(schema, table, params.columns as P['columns']), 
        from(table), 
        joins(schema, table, params),
        groupBy(schema, table, params.groupBy as P['groupBy']),
        orderBy(schema, table, params.orderBy as P['orderBy']),
        limit(params.limit as P['limit']),
        offset(params.offset as P['offset']),
    ], ' '))
}

function select<S extends Schema, T extends TableName<S>, C extends FieldName<S, T>[] | undefined>(schema: S, table: T, columns?: C) {
    return `SELECT ${normalizeColumns(schema, table, columns)}` as const
}

function from<S extends Schema, T extends TableName<S>>(table: T) {
    return `FROM ${wrap(table)}` as const
}

function limit<L extends QueryParams['limit']>(limit: L) {
    return (limit !== undefined ? `LIMIT ${limit}` : '') as L extends number ? `LIMIT ${L}` : ''
}

function offset<O extends QueryParams['offset']>(offset: O) {
    return (offset !== undefined ? `OFFSET ${offset}` : '') as O extends number ? `OFFSET ${O}` : ''
}

function joins<S extends Schema, T extends TableName<S>, P extends QueryParams<S, T>>(schema: S, table: T, params: P) {
    return join(getAllJoinClauses(schema, table, params), ' ')
}

function groupBy<S extends Schema, T extends TableName<S>, C extends QueryParams<S, T>['groupBy']>(schema: S, table: T, columns?: C) {
    return (!columns?.length ? '' : `GROUP BY ${normalizeColumns(schema, table, columns)}`) as C extends string[] ? 
        `GROUP BY ${Join<NormalizedColumns<S, T, C>>}` : ''
}

function orderBy<S extends Schema, T extends TableName<S>, C extends QueryParams<S, T>['orderBy']>(schema: S, table: T, columns?: C) {
    return (!columns?.length ? '' : `ORDER BY ${getOrderByClauses(schema, table, columns)}`) as C extends string[] ?
        `ORDER BY ${Join<OrderByClauses<S, T, C>>}` : ''
}



const url = find(schema, 'countries', {
    columns: ['name', 'id'],
    orderBy: ['-region.id', 'cities.name'],
    groupBy: ['region.name'],
    limit: 10,
    offset: 5,
})