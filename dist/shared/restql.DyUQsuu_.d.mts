import * as type_fest_source_union_to_tuple from 'type-fest/source/union-to-tuple';
import { EmptyObject, Simplify, Join, Trim, UnionToTuple } from 'type-fest';
import { JoinableItem } from 'type-fest/source/join';

interface Schema {
   [table: string]: {
      columns: {
         [column: string]: {
            type: ColumnTypes
            primaryKey?: boolean
            unique?: boolean
            notNull?: boolean
            default?: string | number | boolean | null
         }
      }
      relations?: {
         [relation: string]: {
            table: string
            fromKey: string
            toKey: string
         }
      }
   }
}

type TableDefinition<S extends Schema, T extends TableName<S>, R extends boolean = true> = {
   [C in ColumnName<S, T>]: ColumnTypeToTsType<S[T]['columns'][C]['type']>
} & (R extends true ? {
   [R in RelationName<S, T>]?: TableDefinition<S, RelationTableName<S, T, R>>
} : EmptyObject)

type Definition<S extends Schema, R extends boolean = true> = Simplify<{
   [K in TableName<S>]: TableDefinition<S, K, R>
}>

type TableName<S extends Schema = Schema> = keyof S & string

type ColumnName<S extends Schema, T extends TableName<S>> = keyof S[T]['columns'] & string

type RelationName<S extends Schema, T extends TableName<S>> = keyof NonNullable<S[T]['relations']> & string

type RelationTableName<S extends Schema, T extends TableName<S>, C extends RelationName<S, T>>
    = C extends keyof NonNullable<S[T]['relations']> ? NonNullable<S[T]['relations']>[C]['table'] : never

interface RelationDefinition<S extends Schema, T extends TableName<S>, C extends RelationName<S, T> | string> {
   fromTable: T
   toTable: NonNullable<S[T]['relations']>[C]['table']
   fromKey: NonNullable<S[T]['relations']>[C]['fromKey']
   toKey: NonNullable<S[T]['relations']>[C]['toKey']
}

type Relation<S extends Schema, T extends TableName<S>, C extends FieldName<S, T> | string, D extends RelationDefinition<any, any, any>[] = []>
    = C extends `${infer A}.${infer B}.${infer C}`
       ? Relation<S, RelationTableName<S, T, A>, `${B}.${C}`, [...D, RelationDefinition<S, T, A>]>
       : C extends `${infer A}.${string}`
          ? [...D, RelationDefinition<S, T, A>]
          : C extends RelationName<S, T>
             ? [...D, RelationDefinition<S, T, C>]
             : D

type FieldName<S extends Schema = Schema, F extends TableName<S> = TableName<S>, FF extends TableName<S> = F>
   = Exclude<ColumnName<S, F>, RelationName<S, F>> | {
      [K in RelationName<S, F>]: K extends string
         ? RelationTableName<S, F, K> extends FF
            ? never
            : RelationTableName<S, F, K> extends string
               ? `${K}.${FieldName<S, RelationTableName<S, F, K>, FF | K>}`
               : never
         : never
   }[RelationName<S, F>]

type ColumnTypes = 'text' | 'float4' | 'boolean' | 'date' | 'json' | 'int4' | 'int8' | 'timestamptz' | 'uuid' | 'varchar' | 'timestamp' | 'numeric'

type ColumnTypeToTsType<T extends ColumnTypes>
    = T extends 'text' ? string
       : T extends 'float4' ? number
          : T extends 'boolean' ? boolean
             : T extends 'date' ? Date
                : T extends 'json' ? Record<string, any>
                   : T extends 'int4' ? number
                      : T extends 'int8' ? bigint
                         : T extends 'timestamptz' ? Date
                            : T extends 'uuid' ? string
                               : T extends 'varchar' ? string
                                  : T extends 'timestamp' ? Date
                                     : T extends 'numeric' ? number : never

type PrimaryKey<S extends Schema, T extends TableName<S>> = {
   [K in keyof S[T]['columns']]: S[T]['columns'][K]['primaryKey'] extends true ? K : never
}[keyof S[T]['columns']]

type PrimaryKeyValue<S extends Schema, T extends TableName<S>> = PrimaryKey<S, T> extends keyof Definition<S>[T] ? Definition<S>[T][PrimaryKey<S, T>] : never

interface QueryParams<S extends Schema = Schema, F extends TableName<S> = TableName<S>> {
   columns?: FieldName<S, F>[]
   where?: ConditionTree<S, F>
   orderBy?: `${'' | '-'}${FieldName<S, F>}`[]
   groupBy?: FieldName<S, F>[]
   limit?: number
   offset?: number
}
type _Operator = 'eq' | 'eq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in' | 'between'
type Operator = {
   [O in _Operator]: O extends 'gt' | 'lt' | 'gte' | 'lte' ? `$${O}` : `$${O}` | `$n${O}`
}[_Operator]
type Value = string | number | boolean | Value[]

type Condition = {
   [O in Operator]?: Value
}

type ConditionTree<S extends Schema = Schema, F extends TableName<S> = TableName<S>> = {
   [K in FieldName<S, F>]?: Condition
} & {
   $and?: ConditionTree<S, F>[]
   $or?: ConditionTree<S, F>[]
}

type RemoveEmpty<T extends unknown[]> = T extends [infer U, ...infer Rest] ? (U extends '' ? RemoveEmpty<Rest> : [U, ...RemoveEmpty<Rest>]) : []

type CleanJoin<T extends unknown[], S extends string = ', '> = Join<UniqueArray<RemoveEmpty<T>>, S>

type UniqueArray<T extends any[]>
    = T extends [] ? []
       : T extends [infer U, ...infer Rest]
          ? U extends string
             ? U extends Rest[number]
                ? UniqueArray<Rest>
                : [U, ...UniqueArray<Rest>]
             : UniqueArray<Rest>
          : []

/**
 * SQL Operators.
 */
declare const OPERATORS: {
    $eq: (value: unknown) => string;
    $neq: (value: unknown) => string;
    $gt: (value: unknown) => string;
    $gte: (value: unknown) => string;
    $lt: (value: unknown) => string;
    $lte: (value: unknown) => string;
    $like: (value: unknown) => string;
    $nlike: (value: unknown) => string;
    $in: (value: unknown[]) => string;
    $nin: (value: unknown[]) => string;
    $between: (value: unknown[]) => string;
    $nbetween: (value: unknown[]) => string;
};
/**
 * Get primaryKey
 */
declare function getPrimaryKey<S extends Schema, T extends TableName<S>>(schema: S, table: T): PrimaryKey<S, T> | undefined;
/**
 * Add a primary key condition to the where clause.
 */
declare function addPrimaryKeyCondition<S extends Schema, T extends TableName<S>, const K extends PrimaryKeyValue<S, T>, const P extends QueryParams<S, T>>(schema: S, table: T, key: K, params?: P): WhereWithPrimaryKey<S, T, K, P>;
/**
 * Wraps a string in backticks to be used as an identifier in SQL queries.
 */
declare function wrap<T extends string>(value: T): `\`${T}\``;
/**
 * Unique array type that ensures all elements are unique.
 */
declare function unique<T extends unknown[]>(arr: T): UniqueArray<T>;
/**
 * Join a list of strings with a separator.
 */
declare function join<const T extends JoinableItem[], S extends string>(arr: T, separator?: S): CleanJoin<T, S>;
/**
 * Trim whitespace from the start and end of a string.
 */
declare function trim<T extends string>(value: T): Trim<T>;
/**
 * Prepends a string with another string.
 */
declare function prepend<T extends string, P extends string>(value: T, prefix: P): Prepend<T, P>;
/**
 * Unprepend a string from another string.
 */
declare function unprepend<T extends string, P extends string>(value: T, prefix: P): Unprepend<T, P>;
/**
 * Normalizes a column name to ensure it is properly formatted for SQL queries.
 */
declare function normalizeColumn<S extends Schema, T extends TableName<S>, const C extends string>(schema: S, table: T, col: C): NormalizedColumn<S, T, C>;
/**
 * Normalizes a list of columns for SQL queries.
 */
declare function normalizeColumns<S extends Schema, T extends TableName<S>, F extends string[] | undefined>(schema: S, table: T, columns?: F): CleanJoin<NormalizedColumns<S, T, F>, ", ">;
/**
 * Get relation information for a column in the specified schema and table.
 */
declare function getRelationInfo<S extends Schema, T extends TableName<S>, C extends string>(schema: S, table: T, col: C): Relation<S, T, C>;
/**
 * Get join clauses for the specified query.
 */
declare function getJoinClause<R extends Relation<any, any, any>[number]>(relation: R): `INNER JOIN \`${R["toTable"]}\` ON \`${R["toTable"]}\`.\`${R["toKey"]}\` = \`${R["fromTable"]}\`.\`${R["fromKey"]}\``;
/**
 * Get join clauses for the specified query.
 */
declare function getJoinClauses<S extends Schema, T extends TableName<S>, C extends FieldName<S, T>>(schema: S, table: T, col: C): "" | UniqueArray<UnionToTuple<Relation<S, T, C, []> extends (infer U)[] ? U extends RelationDefinition<any, any, any> ? `INNER JOIN \`${U["toTable"]}\` ON \`${U["toTable"]}\`.\`${U["toKey"]}\` = \`${U["fromTable"]}\`.\`${U["fromKey"]}\`` : never : never, type_fest_source_union_to_tuple.LastOfUnion<Relation<S, T, C, []> extends (infer U)[] ? U extends RelationDefinition<any, any, any> ? `INNER JOIN \`${U["toTable"]}\` ON \`${U["toTable"]}\`.\`${U["toKey"]}\` = \`${U["fromTable"]}\`.\`${U["fromKey"]}\`` : never : never>>>;
/**
 * Get all unique fields.
 */
declare function getAllFields<S extends Schema, T extends TableName<S>, P extends QueryParams<S, T>>(_schema: S, _table: T, params: P): AllFields<S, T, P>;
/**
 * Get all joins for the specified query.
 */
declare function getAllJoinClauses<S extends Schema, T extends TableName<S>, P extends QueryParams<S, T>>(schema: S, table: T, params: P): JoinClauses<S, T, AllFields<S, T, P>[number]>;
/**
 * Get order by clauses for the specified query.
 */
declare function getOrderByClauses<S extends Schema, T extends TableName<S>, C extends QueryParams<S, T>['orderBy']>(schema: S, table: T, columns?: C): "" | UniqueArray<UnionToTuple<C extends (infer U)[] ? U extends string ? OrderByClause<S, T, U> : never : never, type_fest_source_union_to_tuple.LastOfUnion<C extends (infer U)[] ? U extends string ? OrderByClause<S, T, U> : never : never>>>;
/**
 * Get where clause.
 */
declare function getWhereClauses<S extends Schema, T extends TableName<S>, const C extends Condition | ConditionTree<S, T>>(schema: S, table: T, condition: C): WhereClauses<S, T, C>;
/**
 * Stringify operator value if necessary
 */
declare function normalizeOperationValue<V>(value: V): Normalize<V>;
type NormalizedColumn<S extends Schema, T extends TableName<S>, C extends string> = C extends '*' ? `${Wrap<T>}.${C}` : C extends `${infer K}.${infer V}` ? K extends keyof S[T]['relations'] ? S[T]['relations'][K] extends {
    table: infer R;
} ? R extends string ? NormalizedColumn<S, R, V> : never : never : never : `${Wrap<T>}.${Wrap<C>}`;
type NormalizedColumns<S extends Schema, T extends TableName<S>, F extends string[] | undefined, Wildcard extends boolean = true> = F extends string[] ? UnionToTuple<NormalizedColumn<S, T, F[number]>> : Wildcard extends true ? [NormalizedColumn<S, T, '*'>] : [];
type Wrap<T extends string> = ReturnType<typeof wrap<T>>;
type Unprepend<T extends string, P extends string> = T extends `${P}${infer R}` ? R : T;
type Prepend<T extends string, P extends string> = `${P}${T}`;
type JoinClauses<S extends Schema, T extends TableName<S>, C extends FieldName<S, T>> = UniqueArray<UnionToTuple<Relation<S, T, C> extends (infer U)[] ? U extends RelationDefinition<any, any, any> ? ReturnType<typeof getJoinClause<U>> : never : never>>;
type OrderByClause<S extends Schema, T extends TableName<S>, C extends string> = C extends `-${infer K}` ? `${NormalizedColumn<S, T, K>} DESC` : `${NormalizedColumn<S, T, C>} ASC`;
type OrderByClauses<S extends Schema, T extends TableName<S>, C extends string[] | undefined> = UniqueArray<UnionToTuple<C extends (infer U)[] ? U extends string ? OrderByClause<S, T, U> : never : never>>;
type Normalize<T> = T extends string ? `'${T}'` : T extends number | bigint | boolean | null | undefined ? `${T}` : never;
type NormalizeArray<T extends unknown[]> = T extends [infer U, ...infer Last] ? [Normalize<U>, ...NormalizeArray<Last>] : [];
type OperatorToSQL<O extends keyof typeof OPERATORS, V> = O extends '$eq' ? `= ${Normalize<V>}` : O extends '$neq' ? `!= ${Normalize<V>}` : O extends '$gt' ? `> ${Normalize<V>}` : O extends '$gte' ? `>= ${Normalize<V>}` : O extends '$lt' ? `< ${Normalize<V>}` : O extends '$lte' ? `<= ${Normalize<V>}` : O extends '$like' ? `LIKE ${Normalize<V>}` : O extends '$nlike' ? `NOT LIKE ${Normalize<V>}` : O extends '$in' ? V extends any[] ? `IN (${CleanJoin<NormalizeArray<V>>})` : never : O extends '$nin' ? V extends any[] ? `NOT IN (${CleanJoin<NormalizeArray<V>>})` : never : O extends '$between' ? V extends any[] ? `BETWEEN ${Normalize<V[0]>} AND ${Normalize<V[1]>}` : never : O extends '$nbetween' ? V extends any[] ? `NOT BETWEEN ${Normalize<V[0]>} AND ${Normalize<V[1]>}` : never : never;
type WhereColumnClause<F extends string, C extends Condition> = CleanJoin<UnionToTuple<{
    [CC in keyof C]: CC extends keyof typeof OPERATORS ? `${F} ${OperatorToSQL<CC, C[CC]>}` : never;
}[keyof C]> extends infer U extends JoinableItem[] ? U : never, ' AND '>;
type WhereClauses<S extends Schema, T extends TableName<S>, C extends Condition | ConditionTree<S, T>, F extends string = '', W extends string = ''> = C extends Condition ? WhereColumnClause<F, C> : C extends Record<string, any> ? CleanJoin<[
    W,
    ...UnionToTuple<{
        [K in keyof C]: K extends '$and' ? `(${CleanJoin<[W, ...UnionToTuple<WhereClauses<S, T, C['$and'][number], F>>], ' AND '>})` : K extends '$or' ? `(${CleanJoin<[W, ...UnionToTuple<WhereClauses<S, T, C['$or'][number], F>>], ' OR '>})` : K extends string ? WhereClauses<S, T, C[K], NormalizedColumn<S, T, K>> : never;
    }[keyof C]>
], ' AND '> : W;
type _Item<S extends Schema, T extends TableName<S>, C extends string[], I = EmptyObject> = C extends [infer U, ...infer Rest] ? I & {
    [K in U as U extends `${infer A}.${string}` ? A : U extends string ? U : never]: U extends string ? U extends `${infer A}.${infer B}` ? A extends RelationName<S, T> ? _Item<S, RelationTableName<S, T, A>, [B]> : never : U extends keyof TableDefinition<S, T> ? TableDefinition<S, T>[U] : never : never;
} & (Rest extends string[] ? _Item<S, T, Rest> : EmptyObject) : I;
type Item<S extends Schema, T extends TableName<S>, C extends QueryParams<S, T>['columns'] | undefined = undefined> = C extends string[] ? Simplify<_Item<S, T, C>> : TableDefinition<S, T, false>;
type WhereWithPrimaryKey<S extends Schema, T extends TableName<S>, K extends PrimaryKeyValue<S, T>, P extends QueryParams<S, T>> = P['where'] & Record<PrimaryKey<S, T>, {
    $eq: K;
}>;
type AllFields<S extends Schema, T extends TableName<S>, P extends QueryParams<S, T>> = UniqueArray<UnionToTuple<(P['columns'] extends string[] ? P['columns'][number] : never) | (P['groupBy'] extends string[] ? P['groupBy'][number] : never) | (P['orderBy'] extends string[] ? Unprepend<P['orderBy'][number], '-'> : never)>>;

export { normalizeOperationValue as B, OPERATORS as i, getPrimaryKey as j, addPrimaryKeyCondition as k, join as l, unprepend as m, normalizeColumn as n, normalizeColumns as o, prepend as p, getRelationInfo as q, getJoinClause as r, getJoinClauses as s, trim as t, unique as u, getAllFields as v, wrap as w, getAllJoinClauses as x, getOrderByClauses as y, getWhereClauses as z };
export type { AllFields as A, ConditionTree as C, NormalizedColumn as D, Prepend as E, FieldName as F, OrderByClause as G, NormalizeArray as H, Item as I, JoinClauses as J, OperatorToSQL as K, WhereColumnClause as L, NormalizedColumns as N, OrderByClauses as O, PrimaryKeyValue as P, QueryParams as Q, RemoveEmpty as R, Schema as S, TableName as T, UniqueArray as U, WhereWithPrimaryKey as W, TableDefinition as a, Relation as b, Unprepend as c, RelationDefinition as d, Normalize as e, CleanJoin as f, Wrap as g, WhereClauses as h };
