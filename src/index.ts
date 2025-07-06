import type { Database } from 'db0'
import type { QueryParams } from './types/params'
import type { Schema, TableName } from './types/schema'
import type { Item } from './utils/helpers'

/**
 * Define a schema for the database.
 */
export function defineSchema<const S extends Schema>(schema: S): S {
   return schema
}

/**
 * Define a driver for the database.
 */
export function defineDriver<R extends DriverDefintion, S extends Schema>(create: (schema: S) => R, defautlDb: () => Database) {
   return (schema: S, db = defautlDb()) => {
      const result = create(schema)
      const findRaw = result.findRaw as R['findRaw']
      const findOneRaw = result.findOneRaw as R['findOneRaw']
      const updateRaw = result.updateRaw as R['updateRaw']
      const updateOneRaw = result.updateOneRaw as R['updateOneRaw']
      const createOneRaw = result.createOneRaw as R['createOneRaw']
      const removeRaw = result.removeRaw as R['removeRaw']
      const removeOneRaw = result.removeOneRaw as R['removeOneRaw']

      const find = <T extends TableName<S>, P extends QueryParams<S, T>>(table: T, params: P) => {
         return db.sql<Item<S, T, P['columns']>[]>`${findRaw(table, params)}`
      }

      const findOne = <T extends TableName<S>, K extends Item<S, T>['id'], P extends QueryParams<S, T>>(table: T, primaryKey: K, params?: P) => {
         return db.sql<Item<S, T, P['columns']> | null>`${findOneRaw(table, primaryKey, params || {})}`
      }

      const update = <T extends TableName<S>, P extends QueryParams<S, T>>(table: T, item: Partial<Item<S, T, P['columns']>>, params?: P) => {
         return db.sql<Item<S, T, P['columns']>>`${updateRaw(table, item, params || {})}`
      }

      const updateOne = <T extends TableName<S>, K extends Item<S, T>['id'], P extends QueryParams<S, T>>(table: T, primaryKey: K, item: Partial<Item<S, T, P['columns']>>, params?: P) => {
         return db.sql<Item<S, T, P['columns']> | null>`${updateOneRaw(table, primaryKey, item, params || {})}`
      }

      const createOne = <T extends TableName<S>>(table: T, item: Partial<Item<S, T>>) => {
         return db.sql<Item<S, T>>`${createOneRaw(table, item)}`
      }

      const remove = <T extends TableName<S>, P extends QueryParams<S, T>>(table: T, params: P) => {
         return db.sql<Item<S, T>[]>`${removeRaw(table, params)}`
      }

      const removeOne = <T extends TableName<S>, K extends Item<S, T>['id'], P extends QueryParams<S, T>>(table: T, primaryKey: K, params?: P) => {
         return db.sql<Item<S, T> | null>`${removeOneRaw(table, primaryKey, params || {})}`
      }

      return {
         find: Object.assign(find, { raw: findRaw }),
         findOne: Object.assign(findOne, { raw: findOneRaw }),
         update: Object.assign(update, { raw: updateRaw }),
         updateOne: Object.assign(updateOne, { raw: updateOneRaw }),
         createOne: Object.assign(createOne, { raw: createOneRaw }),
         remove: Object.assign(remove, { raw: removeRaw }),
         removeOne: Object.assign(removeOne, { raw: removeOneRaw }),
         db,
         schema,
      }
   }
}

interface DriverDefintion {
   findRaw: (table: string, params: object) => string
   findOneRaw: (table: string, primaryKey: any, params: object) => string
   updateRaw: (table: string, item: object, params: object) => string
   updateOneRaw: (table: string, primaryKey: any, item: object, params: object) => string
   removeRaw: (table: string, params: object) => string
   removeOneRaw: (table: string, primaryKey: any, params: object) => string
   createOneRaw: (table: string, item: object) => string
}
