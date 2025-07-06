import type { Schema } from '@/types/schema'
import { createDatabase } from 'db0'
import connector from 'db0/connectors/mysql2'
import { createOneRaw, findOneRaw, findRaw, removeOneRaw, removeRaw, updateOneRaw, updateRaw } from '@/drivers/sqlite/queries'
import { defineDriver } from '@/index'

export default defineDriver(<S extends Schema>(schema: S) => ({
   findRaw: findRaw(schema),
   findOneRaw: findOneRaw(schema),
   updateRaw: updateRaw(schema),
   updateOneRaw: updateOneRaw(schema),
   createOneRaw: createOneRaw(schema),
   removeOneRaw: removeOneRaw(schema),
   removeRaw: removeRaw(schema),
}), () => createDatabase(connector({ })))
