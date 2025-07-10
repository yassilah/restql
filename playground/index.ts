import instance from '@/drivers/sqlite'
import schema from './schema'

const { find } = instance(schema)

const user = await find('users', {
   columns: ['name', 'id'],
   where: {
      id: {
         $eq: 1,
      },
      $and: [{
         name: {
            $like: '%John%',
         },
      }],
   },
})
