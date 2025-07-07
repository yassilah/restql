import sqlite from 'restql/drivers/sqlite'
import schema from './schema'

const { find } = sqlite(schema)

const l = await find.raw('countries', {
   columns: ['code', 'region.name'],
})
