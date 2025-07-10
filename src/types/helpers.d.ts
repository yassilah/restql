import type { Join } from 'type-fest'

type RemoveEmpty<T extends unknown[]> = T extends [infer U, ...infer Rest] ? (U extends '' ? RemoveEmpty<Rest> : [U, ...RemoveEmpty<Rest>]) : []

export type CleanJoin<T extends unknown[], S extends string = ', '> = Join<UniqueArray<RemoveEmpty<T>>, S>

export type UniqueArray<T extends any[]>
    = T extends [] ? []
       : T extends [infer U, ...infer Rest]
          ? U extends string
             ? U extends Rest[number]
                ? UniqueArray<Rest>
                : [U, ...UniqueArray<Rest>]
             : UniqueArray<Rest>
          : []

export type Simplify<T> = {
   [K in keyof T]: T[K] extends object ? Simplify<T[K]> : T[K]
} & {}
