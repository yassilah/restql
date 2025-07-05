import type { Join } from 'type-fest'

export type CleanJoin<T extends unknown[], S extends string = ', '>
    = T extends [] ? ''
       : T extends [infer U]
          ? U extends string ? U
             : ''
          : T extends [infer U, ...infer Rest]
             ? U extends string
                ? U extends ''
                   ? CleanJoin<Rest, S>
                   : CleanJoin<Rest, S> extends ''
                      ? U
                      : Join<[U, CleanJoin<Rest, S>], S>
                : CleanJoin<Rest, S>
             : ''

export type UniqueArray<T extends any[]>
    = T extends [] ? []
       : T extends [infer U, ...infer Rest]
          ? U extends string
             ? U extends Rest[number]
                ? UniqueArray<Rest>
                : [U, ...UniqueArray<Rest>]
             : UniqueArray<Rest>
          : []
