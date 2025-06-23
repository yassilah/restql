import { sqlite } from "../src/drivers/sqlite"
import schema from "./schema"

const { find } = sqlite(schema)


const sql = find.sql('countries', {
  'where': {
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
  orderBy: ['-cities.name'],
  limit: 10,
  offset: 5,
})