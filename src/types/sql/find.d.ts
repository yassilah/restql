import type { Condition, ConditionTree, QueryParams, Value } from "../params"
import type { ColumnName, RelationFromKey, RelationName, RelationTableName, RelationToKey, Schema, TableDefinition, TableName } from "../schema"
import type { UniqueArray, ArrayToList, Prettify, UnionToTuple, FlattenArray } from "../helpers.d"

// Helper: Get SQL column name for nested relations
type DeepRelationSelect<S extends Schema, Table extends TableName<S>, T extends string> =
    T extends `${infer K}.${infer V}`
        ? K extends keyof S[Table]['relations']
            ? S[Table]['relations'][K] extends { table: infer T2 }
                ? T2 extends string
                    ? DeepRelationSelect<S, T2, V>
                    : never
                : never
            : never
        : `\`${Table}\`.\`${T}\``

// Helper: Build SQL select columns
type _QueryParamsToSQLSelect<S extends Schema, F extends TableName<S>, P extends QueryParams<S, F>, L extends string[], C extends string[] = []> =
    L extends [infer T, ...infer Rest]
        ? T extends string
            ? Rest extends string[]
                ? _QueryParamsToSQLSelect<S, F, P, Rest, [...C, DeepRelationSelect<S, F, T>]>
                : never
            : never
        : C

type QueryParamsToSQLSelect<S extends Schema, F extends TableName<S>, P extends QueryParams<S, F>> =
    P['columns'] extends string[]
        ? ArrayToList<UniqueArray<_QueryParamsToSQLSelect<S, F, P, P['columns']>>>
        : '*'

// Helper: Build JOINs for relations
type RelationJoin<S extends Schema, Table extends TableName<S>, R extends string> =
    R extends keyof S[Table]['relations']
        ? S[Table]['relations'][R] extends { table: infer T, fromKey: infer FK, toKey: infer TK }
            ? T extends string
                ? FK extends string
                    ? TK extends string
                        ? [T, `INNER JOIN \`${T}\` ON \`${T}\`.\`${FK}\` = \`${Table}\`.\`${TK}\``]
                        : never
                    : never
                : never
            : never
        : never

type DeepRelationJoin<S extends Schema, T extends TableName<S>, K extends string, L extends string[] = []> =
    K extends `${infer V}.${infer U}`
        ? RelationJoin<S, T, V> extends [infer T2, infer R]
            ? T2 extends string
                ? R extends string
                    ? DeepRelationJoin<S, T2, U, [...L, R]>
                    : L
                : L
            : L
        : L

type AllColumnsFromWhere<S extends Schema, T extends TableName<S>, W extends any, F extends string[] = []> = 
    W extends Record<infer U, any> ? 
        U extends '$and' | '$or' ? AllColumnsFromWhere<S, T, W[U][number], F>
        : U extends string ?
            [...F, U]
        : F
    : F

type AllColumnsFromOrderBy<O> = O extends (infer U)[]
    ? U extends `-${infer T}` ? [T] : U extends string ? [U] : []
    : []

type AllColumns<S extends Schema, T extends TableName<S>, P extends QueryParams<S, T>> = UniqueArray<FlattenArray<UnionToTuple<[
    ...(P['columns'] extends string[] ? P['columns'] : []),
    ...(P['groupBy'] extends string[] ? P['groupBy'] : []),
    ...AllColumnsFromOrderBy<P['orderBy']>,
    ...AllColumnsFromWhere<S, T, P['where']>
]>>>

type _QueryParamsToSQLJoins<S extends Schema, T extends TableName<S>, L extends string[], J extends string[] = []> =
    L extends [infer First, ...infer Rest]
        ? First extends string
            ? Rest extends string[]
                ? _QueryParamsToSQLJoins<S, T, Rest, DeepRelationJoin<S, T, First, J>>
                : J
            : J
        : J

type QueryParamsToSQLJoins<S extends Schema, F extends TableName<S>, P extends QueryParams<S, F>> = AllColumns<S, F, P> extends infer U ?  U extends string[] ? ArrayToList<UniqueArray<_QueryParamsToSQLJoins<S, F, U>>, ' '> : '' : ''

type QueryParamsToSQLLimit<S extends Schema, P extends QueryParams<S, any>> =
    P['limit'] extends number ? `LIMIT ${P['limit']}` : ''

type QueryParamsToSQLOffset<S extends Schema, P extends QueryParams<S, any>> =
    P['offset'] extends number ? `OFFSET ${P['offset']}` : ''

type OrderByWithoutDirection<P extends string[]> =
    P extends (infer U)[]
        ? U extends `-${infer T}` ? T[] : U[]
        : never

type _QueryParamsToSQLOrderBy<S extends Schema, F extends TableName<S>, P extends QueryParams<S, F>> = ArrayToList<UnionToTuple<P['orderBy'] extends (infer U)[]
    ? U extends `-${infer T}` ? `${ColumnSqlName<S, F, T>} DESC` : 
        U extends string ? 
            `${ColumnSqlName<S, F, U>} ASC`
        : never
    : never>>

type QueryParamsToSQLOrderBy<S extends Schema, F extends TableName<S>, P extends QueryParams<S, F>> = P['orderBy'] extends string[] ? `ORDER BY ${_QueryParamsToSQLOrderBy<S, F, P>}` : ''


// Helper: Map columns to result item type
type _QueryParamsToItem<S extends Schema, T extends TableName<S>, SS extends string[], I = {}> =
    SS extends [infer U, ...infer Rest]
        ? I & {
            [K in U as U extends `${infer A}.${string}` ? A : U extends string ? U : never]:
                U extends string
                    ? U extends `${infer A}.${infer B}`
                        ? A extends RelationName<S, T>
                            ? RelationFromKey<S, T, A> extends ColumnName<S, T> ? 
                                _QueryParamsToItem<S, RelationTableName<S, T, A>, [B]> :
                                _QueryParamsToItem<S, RelationTableName<S, T, A>, [B]>[]
                            : never
                        : U extends keyof TableDefinition<S, T>
                            ? TableDefinition<S, T>[U]
                            : never
                    : never
        } & (Rest extends string[] ? _QueryParamsToItem<S, T, Rest> : {})
        : I

type QueryParamsToItem<S extends Schema, T extends TableName<S>, SS extends QueryParams<S, T>['columns']> =
    SS extends string[] ? Prettify<_QueryParamsToItem<S, T, SS>> : TableDefinition<S, T, false>

// WHERE clause helpers
type _QueryParamsToSqlWhereColumn<F extends string, C extends Condition> =
    ArrayToList<UnionToTuple<{
        [CC in keyof C]: `${F} ${OperatorToSQL<CC, C[CC]>}`
    }[keyof C]>, ' AND '>

type ColumnSqlName<S extends Schema, T extends TableName<S>, F extends string> =
    F extends `${infer R}.${infer U}`
        ? R extends RelationName<S, T>
            ? ColumnSqlName<S, RelationTableName<S, T, R>, U>
            : never
        : F extends ColumnName<S, T>
            ? `\`${T}\`.\`${F}\``
            : never

type _QueryParamsToSQLWhere<S extends Schema, T extends TableName<S>, C extends any, F extends string = '', W extends string = ''> =
    C extends Condition
        ? _QueryParamsToSqlWhereColumn<F, C>
        : C extends Record<string, any>
            ? ArrayToList<[
                W,
                ...UnionToTuple<`(${{
                    [K in keyof C]:
                        K extends '$and'
                            ? ArrayToList<[W, ...UnionToTuple<`(${_QueryParamsToSQLWhere<S, T, C['$and'][number], F>})`>], ' AND '>
                            : K extends '$or'
                                ? ArrayToList<[W, ...UnionToTuple<`(${_QueryParamsToSQLWhere<S, T, C['$or'][number], F>})`>], ' OR '>
                                : K extends string
                                    ? _QueryParamsToSQLWhere<S, T, C[K], ColumnSqlName<S, T, K>>
                                    : never
                }[keyof C]})`>
            ], ' AND '>
            : W

type QueryParamsToSQLWhere<S extends Schema, F extends TableName<S>, P extends QueryParams<S, F>> =
    P['where'] extends ConditionTree<S, F>
        ? `WHERE ${_QueryParamsToSQLWhere<S, F, P['where']>}`
        : ''

export type QueryParamsToSQL<S extends Schema, F extends TableName<S>, P extends QueryParams<S, F>> =
    ArrayToList<[
        `SELECT ${QueryParamsToSQLSelect<S, F, P>}`,
        `FROM ${F}`,
        QueryParamsToSQLJoins<S, F, P>,
        QueryParamsToSQLWhere<S, F, P>,
        QueryParamsToSQLOrderBy<S, F, P>,
        QueryParamsToSQLLimit<S, P>,
        QueryParamsToSQLOffset<S, P>
    ], ' '>

export interface FindFunction<S extends Schema> {
    <T extends TableName<S>, const P extends QueryParams<S, T>>(table: T, params: P): Promise<QueryParamsToItem<S, T, P['columns']>[]>
    sql: <T extends TableName<S>, const P extends QueryParams<S, T>>(table: T, params: P) => QueryParamsToSQL<S, T, P>
}

export type Normalize<T> =
    T extends string ? `'${T}'`
    : T extends number | bigint | boolean | null | undefined ? `${T}`
    : never

export type OperatorToSQL<O extends string, V extends Value> =
    O extends '$eq' ? `= ${Normalize<V>}` :
    O extends '$neq' ? `!= ${Normalize<V>}` :
    O extends '$gt' ? `> ${Normalize<V>}` :
    O extends '$gte' ? `>= ${Normalize<V>}` :
    O extends '$lt' ? `< ${Normalize<V>}` :
    O extends '$lte' ? `<= ${Normalize<V>}` :
    O extends '$like' ? `LIKE ${Normalize<V>}` :
    O extends '$nlike' ? `NOT LIKE ${Normalize<V>}` :
    O extends '$in' ? V extends any[] ? `IN (${ArrayToList<V>})` : never :
    O extends '$nin' ? V extends any[] ? `NOT IN (${ArrayToList<V>})` : never :
    O extends '$between' ? V extends any[] ? `BETWEEN ${Normalize<V[0]>} AND ${Normalize<V[1]>}` : never :
    O extends '$nbetween' ? V extends any[] ? `NOT BETWEEN ${Normalize<V[0]>} AND ${Normalize<V[1]>}` : never
    : never