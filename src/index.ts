import type { Schema } from './types/schema'

export function defineSchema<const S extends Schema>(schema: S): S {
   return schema
}
