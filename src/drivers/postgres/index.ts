import type { Schema } from '@/types/schema'
import { createDatabase } from 'db0'
import connector from 'db0/connectors/postgresql'
import sqlite from '../sqlite'

export default <S extends Schema>(schema: S) => sqlite(schema, createDatabase(connector({ })))
