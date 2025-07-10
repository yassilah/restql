import instance from '@/drivers/sqlite'
import schema from './schema'

const { find } = instance(schema)

const user = await find('countries', {
   columns: ['name', 'region.name', 'region.planet.name'],
})
