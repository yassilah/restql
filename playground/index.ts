import sqlite from '@/drivers/sqlite'
import schema from './schema'

const { createOne } = sqlite(schema)

const l = await createOne('users', {
   name: 'Yassi',
})
