import { sqlite } from '../src/drivers/sqlite'
import schema from './schema'

const { createOne } = sqlite(schema)

const l = await createOne.raw('users', {
   name: 'John Doe',
   age: 30,
})
