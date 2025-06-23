import { QueryParams } from "."

type UnwrapArrayString<T extends string, A extends unknown[] = []> = T extends `${infer B},${infer C}` ? UnwrapArrayString<C, [...A, B]> : T extends `${infer B}` ? [...A, B] : A

type UnwrapWhereArrayString<T extends string, A extends unknown[] = []> = T extends `${infer K}:[${infer B},${infer C}]${infer D}` ? 
    UnwrapWhereArrayString<D, [...A, {
    column: B
    operator: K,
    value: UnwrapArrayString<C>
}]> 
: A


type QueryWhere<V extends string, O = {}> = V extends `${string}$${infer K}:${infer Rest}` ?
        K extends 'and' | 'or' ?  O & { [key in K as `$${key}`]: QueryWhere<Rest> } 
        : V extends `${string}{${infer K}:[${infer S}]${infer Rest}` ? 
            UnwrapWhereArrayString<`${K}:[${S}]`>
        : QueryWhere<Rest, O> 
: O

type QueryPartToQueryParam<T extends string, O = {}, R extends string = ''> = T extends `${infer K}=${infer V}` ? 
    K extends 'from' | 'offset' | 'limit' ? 
        _QueryStringToQueryParams<R, O & { [key in K]: V }>
    : K extends 'select' | 'groupBy' | 'orderBy' ?
        K extends keyof O ?
            O[K] extends unknown[] ? _QueryStringToQueryParams<R, Omit<O, K> & { [key in K]: [...O[K], V] }> : never
        : _QueryStringToQueryParams<R, O & { [key in K]: [V] }>
    : K extends 'where' ? 
        _QueryStringToQueryParams<R, O & { where: QueryWhere<V> }>
    : O
: O 

type _QueryStringToQueryParams<T extends string, O = {}> = 
    T extends `${string}?${infer A}` ? 
        _QueryStringToQueryParams<A, O> : 
            T extends `${infer A}&${infer B}` ? 
                QueryPartToQueryParam<A, O, B> : 
                    QueryPartToQueryParam<T, O>


export type QueryStringToQueryParams<T extends string, O = {}> = _QueryStringToQueryParams<T, O> extends infer U ? Prettify<Omit<QueryParams, keyof U> & U> : never

type NestedObject<T, S = {}> = T extends keyof S ? Record<T, S[T]> :
    T extends `${infer K}.${infer V}` ?
        K extends keyof S ?
            Extract<S[K], object> extends infer SS ? Record<K, NestedObject<V, SS>>
            : never
        : never
    : never

type _QueryStringResult<T extends string, S extends object = {}> = QueryStringToQueryParams<T> extends infer Q ? 
    'from' extends keyof Q ?  {
            [K in keyof S]: K extends Q['from'] ? 
                'select' extends keyof Q ? 
                    Q['select'] extends (infer KK)[] ? 
                        NestedObject<KK, S[K]> 
                    : {}
                : {}
            : {}
        }[keyof S] : never
: never

type QueryStringResult<T extends string, S extends object = {}> = Prettify<UnionToIntersection<_QueryStringResult<T, S>>>

type SQLSelect<Query extends string, Key extends string, KK extends string> =  Query extends `SELECT ${infer U} FROM ${infer V}` ? 
    `SELECT ${U}, \`${Key}\`.\`${KK}\` FROM ${V}` : `SELECT \`${Key}\`.\`${KK}\` ${Query}`

type SQLInnerJoin<Query extends string, Key extends string, AA extends string, A extends string> = Query extends `${string}INNER JOIN \`${AA}\`${string}` ? Query : `${Query} INNER JOIN \`${AA}\` ON \`${AA}\`.\`id\` = \`${Key}\`.\`${A}\``

type QueryToSQLSelect<Select extends unknown[], Schema extends object, Query extends string, Key extends keyof Schema, OKey extends keyof Schema> = 
    Key extends string ? 
        Select extends [infer KK, ...infer Rest] ?
            KK extends string ? 
                KK extends `${infer A}.${infer B}` ?
                    A extends keyof Schema[Key] ? 
                        { [K in keyof Schema]: Schema[K] extends Schema[Key][A] ? K : never }[keyof Schema] extends infer AA ?
                            AA extends keyof Schema ?
                                AA extends OKey ? never : AA extends string ? 
                                    QueryToSQLSelect<[B, ...Rest], Schema, SQLInnerJoin<Query, Key, AA, A>, AA, OKey>
                                : never
                        : never
                    : never
                    : A extends keyof Schema[OKey] ? QueryToSQLSelect<Select, Schema, Query, OKey, OKey> : never
            : QueryToSQLSelect<Rest, Schema, SQLSelect<Query, Key, KK>, Key, OKey>
        : never
    : Query
: Query

type QueryToSQL<Params extends Record<string, any>, Schema extends object = {}, Query extends string = '', Key extends keyof Schema = keyof Schema> = 
 Params['from'] extends keyof Schema ?
    Params['from'] extends string ?
        QueryToSQL<Omit<Params, 'from'>, Schema, `FROM \`${Params['from']}\``, Params['from']>
    : Query
: Params['select'] extends unknown[] ? 
    QueryToSQLSelect<Params['select'], Schema, Query, Key, Key> 
: Query

type QueryStringSQL<T extends string, S extends object = {}> = QueryToSQL<QueryStringToQueryParams<T>, S>

type UnionToIntersection<T> =
    (T extends any ? (k: T) => void : never) extends
    (k: infer I) => void
        ? I
        : never

type Prettify<T> = {
[K in keyof T]: T[K] extends object ? Prettify<T[K]> : T[K]
} & {};

export function createInstance<S extends object>() {
    async function get<U extends string>(url: U) {
         const res = await fetch(url)
         const data = await res.json() 
         return data as QueryStringResult<U, S>
    }

    function query<U extends string>(_url: U) {
        return '' as QueryStringSQL<U, S>
    }

    return { get, query }
}