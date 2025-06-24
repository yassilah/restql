import { sqlite } from "../src/drivers/sqlite"
import schema from "./schema"

const { find, findOne } = sqlite(schema)

const item = await findOne('countries', 'FRA', {
  columns: ['name', 'region.planet.type', 'region.name'],
  where: {
    'region.name': {
        '$nin': ['Europe', 'cool']
      }
  }
})

const sql = await find.raw('countries', {
  columns: ['name', 'region.planet.type', 'region.name'],
  where: {
    'region.name': {
      '$like': '%some-region-name%'
    },
    'region.planet.name': {
      '$like': '%some-planet-name%'
    },
    $or: [{
      'name': {
        '$like': '%some-country-name%'
      },
      'region.name': {
        '$nin': ['Europe']
      }
    }, {
      'code': {
          '$neq': 'FRA'
        }
    }]
  },
  orderBy: ['cities.name', 'region.planet.id'],
  limit: 10,
  offset: 5,
})
