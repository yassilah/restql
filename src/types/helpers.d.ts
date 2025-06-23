
export type ArrayToList<T extends any[], S extends string = ', '> = 
    T extends [] ? '' : 
        T extends [infer U] ? 
            U extends string ? U : 
            '' 
        : T extends [infer U, ...infer Rest] ? 
            U extends string ? 
                U extends '' ?
                    ArrayToList<Rest, S> :
                ArrayToList<Rest, S> extends '' ? 
                    U : 
                `${U}${S}${ArrayToList<Rest, S>}` 
            : ArrayToList<Rest, S> 
        : ''
        
export type PrependArrayItems<T extends any[], U extends string> =  T extends (infer R)[] ? R extends string ? PrependString<R, U>[] : never : never

export type PrependString<T extends string, U extends string> = `${U}${T}`

export type UniqueArray<T extends any[]> = 
    T extends [] ? [] : 
        T extends [infer U, ...infer Rest] ?
            U extends string ? 
                U extends Rest[number] ?
                    UniqueArray<Rest>
                : [U, ...UniqueArray<Rest>]
            : UniqueArray<Rest>
        : []

export type Prettify<T> = { 
    [K in keyof T]: T[K] extends object ? T[K] extends { [Symbol.toPrimitive]: any } ? T[K] : Prettify<T[K]> : T[K]
} & {}

type UnionToIntersection<U> = 
  (U extends any ? (k: U) => void : never) extends 
  (k: infer I) => void ? I : never;

type LastOf<T> = 
  UnionToIntersection<
    T extends any ? (x: T) => void : never
  > extends (x: infer Last) => void ? Last : never;

type Push<T extends any[], V> = [...T, V];

export type UnionToTuple<T, L = LastOf<T>> = 
  [T] extends [never] 
    ? [] 
    : Push<UnionToTuple<Exclude<T, L>>, L>;

export type FlattenArray<T extends any[]> = T extends [infer First, ...infer Rest] ? 
    First extends any[] ?
        [...FlattenArray<First>, ...FlattenArray<Rest>]
    : [First, ...FlattenArray<Rest>]
: T;