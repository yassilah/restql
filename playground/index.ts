import { sqlite } from "../src/drivers/sqlite"
import schema from "./schema"

const { find } = sqlite(schema)

const sql = await find('countries', {
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
        '$neq': 'Europe'
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
