import type { CreateOneRawFn, FindOneRawFn, FindRawFn, RemoveOneRawFn, RemoveRawFn, UpdateOneRawFn, UpdateRawFn } from './queries'
import type { Schema } from '@/types/schema'
import { createDatabase } from 'db0'
import connector from 'db0/connectors/sqlite3'
import { defineDriver } from '@/index'
import { createOneRaw, findOneRaw, findRaw, removeOneRaw, removeRaw, updateOneRaw, updateRaw } from './queries'

export default defineDriver(<S extends Schema>(schema: S) => ({
   findRaw: findRaw(schema) as FindRawFn<S>,
   findOneRaw: findOneRaw(schema) as FindOneRawFn<S>,
   updateRaw: updateRaw(schema) as UpdateRawFn<S>,
   updateOneRaw: updateOneRaw(schema) as UpdateOneRawFn<S>,
   createOneRaw: createOneRaw(schema) as CreateOneRawFn<S>,
   removeOneRaw: removeOneRaw(schema) as RemoveOneRawFn<S>,
   removeRaw: removeRaw(schema) as RemoveRawFn<S>,
}), () => createDatabase(connector({ cwd: process.cwd() })))
