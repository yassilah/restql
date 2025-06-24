import type { UnionToTuple, UniqueArray } from "../../types/helpers";
import type { QueryParams } from "../../types/params";
import type { FieldName, Relation, RelationDefinition, Schema, TableName } from "../../types/schema";

/**
 * Wraps a string in backticks to be used as an identifier in SQL queries.
 */
export function wrap<T extends string>(value: T) {
    return `\`${value}\`` as const
}

/**
 * Join a list of strings with a separator.
 */
export function join<const T extends string[], S extends string>(arr: T, separator: S = ', ' as S) {
    return arr.join(separator) as Join<T, S>;
}

/**
 * Trim whitespace from the start and end of a string.
 */
export function trim<T extends string>(value: T) {
    return value.trim() as Trim<T>
}

/**
 * Prepends a string with another string.
 */
export function prepend<T extends string, P extends string>(value: T, prefix: P) {
    return `${prefix}${value}` as Prepend<T, P>
}

/**
 * Append a string with another string.
 */
export function append<T extends string, P extends string>(value: T, suffix: P) {
    return `${value}${suffix}` as Append<T, P>
}

/**
 * Unprepend a string from another string.
 */
export function unprepend<T extends string, P extends string>(value: T, prefix: P) {
    return (value.startsWith(prefix) ? value.slice(prefix.length) : value) as Unprepend<T, P>;
}

/**
 * Unappend a string from another string.
 */
export function unappend<T extends string, P extends string>(value: T, suffix: P) {
    return (value.endsWith(suffix) ? value.slice(0, -suffix.length) : value) as Unappend<T, P>;
}

/**
 * Normalizes a column name to ensure it is properly formatted for SQL queries.
 */
export function normalizeColumn<S extends Schema, T extends TableName<S>, const C extends string>(schema: S, table: T, col: C) {
    return col.split('.').reduce((acc, part) => {
        if (schema[table]?.relations?.[part]) {
            table = schema[table].relations?.[part].table as T;
            return `${acc}.${wrap(part)}`;
        }
        return `${acc}.${wrap(part)}`;
    }, wrap(table)) as NormalizedColumn<S, T, C>;
}

/**
 * Normalizes a list of columns for SQL queries.
 */
export function normalizeColumns<S extends Schema, T extends TableName<S>, F extends string[] | undefined>(schema: S, table: T, columns?: F) {
    return join(columns?.map(col => normalizeColumn(schema, table, col)) ?? ['*']) as Join<NormalizedColumns<S, T, F>, ', '>;
}

/**
 * Get relation information for a column in the specified schema and table.
 */
export function getRelationInfo<S extends Schema, T extends TableName<S>, C extends string>(schema: S, table: T, col: C) {
    const parts = col.split('.');
    const relationInfo = [{
        fromTable: table,
        fromKey: '',
        toTable: '',
        toKey: ''
    }] as Relation<S, T, C>

    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const info = relationInfo[relationInfo.length - 1];
        const relation = schema[info.fromTable]?.relations?.[part];
        if (!relation) return 
        info.toTable = relation.table;
        info.toKey = relation.toKey;
        info.fromKey = relation.fromKey;
        relationInfo.push({
            fromTable: info.fromTable as T,
            fromKey: '',
            toTable: '',
            toKey: '',
        } as never);
    }

    return relationInfo
}

/**
 * Get join clauses for the specified query.
 */
export function getJoinClause<R extends Relation<any, any, any>[number]>(relation: R) {
    const toTable = relation.toTable as R['toTable'];
    const fromTable = relation.fromTable as R['fromTable'];
    const fromKey = relation.fromKey as R['fromKey'];
    const toKey = relation.toKey as R['toKey'];
    return `INNER JOIN ${wrap(toTable)} ON ${wrap(toTable)}.${wrap(toKey)} = ${wrap(fromTable)}.${wrap(fromKey)}` as const
 }

/**
 * Get join clauses for the specified query.
 */
export function getJoinClauses<S extends Schema, T extends TableName<S>, C extends FieldName<S, T>>(schema: S, table: T, col: C) {
    const info = getRelationInfo(schema, table, col)

    if (!info) return '' as const

    return [...new Set(info.map(getJoinClause))] as JoinClauses<S, T, C>
 }

 /**
  * Get all unique fields.
  */
export function getAllFields<S extends Schema, T extends TableName<S>, P extends QueryParams<S, T>>(_schema: S, _table: T, params: P) {
    const fields = [
        ...(params.columns ?? []),
        ...(params.groupBy ?? []),
        ...(params.orderBy ?? []).map(col => unprepend(col, '-'))
    ]
    return [...new Set(fields)] as UniqueArray<UnionToTuple<
        (P['columns'] extends string[] ? P['columns'][number] : never) |
        (P['groupBy'] extends string[] ? P['groupBy'][number] : never) |
        (P['orderBy'] extends string[] ? Unprepend<P['orderBy'][number], '-'> : never)
    >>;
}


/**
 * Get all joins for the specified query.
 */
export function getAllJoinClauses<S extends Schema, T extends TableName<S>, P extends QueryParams<S, T>>(schema: S, table: T, params: P) {
    const fields = getAllFields(schema, table, params)

    return fields.flatMap((col) => getJoinClauses(schema, table, col)) as JoinClauses<S, T, typeof fields[number]>;
}


export type NormalizedColumn<S extends Schema, T extends TableName<S>, C extends string> = 
    C extends '*' ?  `${Wrap<T>}.${C}` :
    C extends `${infer K}.${infer V}` ? K extends keyof S[T]['relations']
        ? S[T]['relations'][K] extends { table: infer R }
            ? R extends string ? NormalizedColumn<S, R, V> : never
        : never
    : never
: `${Wrap<T>}.${Wrap<C>}`;

export type NormalizedColumns<S extends Schema, T extends TableName<S>, F extends string[] | undefined, Wildcard extends boolean = true> = 
    F extends string[] ? UnionToTuple<NormalizedColumn<S, T, F[number]>> : Wildcard extends true ? [NormalizedColumn<S, T, '*'>] : []

export type Join<T extends unknown[], S extends string = ', '> = 
    T extends [infer First, ...infer Rest] ? 
        Rest extends [] ? 
            `${First & string}` : 
        Rest extends string[] ?
            `${First & string}${S}${Join<Rest, S>}` 
        : ''
: ''; 

export type Wrap<T extends string> = ReturnType<typeof wrap<T>>;

export type Trim<T extends string> = T extends `${infer Start}  ${infer End}` ?
    Trim<`${Start} ${End}`> :
    T extends `${infer Start} ` ? Trim<Start> :
    T extends ` ${infer End}` ?  Trim<End> :
    T

export type Unprepend<T extends string, P extends string> = T extends `${P}${infer R}` ? R : T;

export type Unappend<T extends string, P extends string> = T extends `${infer R}${P}` ? R : T;

export type Prepend<T extends string, P extends string> = `${P}${T}`;

export type Append<T extends string, P extends string> = `${T}${P}`;

export type JoinClauses<S extends Schema, T extends TableName<S>, C extends FieldName<S, T>> = UniqueArray<UnionToTuple<
    Relation<S, T, C> extends (infer U)[] ? 
        U extends RelationDefinition<any, any, any> ? 
            ReturnType<typeof getJoinClause<U>>
        : never
    : never
>>