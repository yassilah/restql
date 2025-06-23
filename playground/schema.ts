import { defineSchema } from "../src";

export default defineSchema({
    cities: {
        relations: {
            country: {
                table: 'countries',
                fromKey: 'country', 
                toKey: 'id'
            }
        },
        columns: {
            id: { type: 'uuid', primaryKey: true, notNull: true },
            name: { type: 'text', notNull: true },
            country: { type: 'uuid', notNull: true }
        }
    },
    countries: {
        relations: {
            region: {
                table: 'regions',
                fromKey: 'id', 
                toKey: 'region' 
            },
            cities: {
                table: 'cities',
                fromKey: 'country',
                toKey: 'id'
            },
        },
        columns: {
            id: { type: 'uuid', primaryKey: true, notNull: true },
            name: { type: 'text', notNull: true },
            code: { type: 'varchar', unique: true, notNull: true },
            region: { type: 'uuid', notNull: true },
            created_at: { type: 'timestamptz', default: 'now()', notNull: true },
        },
    },
    users: {
        columns: {
            id: { type: 'uuid', primaryKey: true, notNull: true },
            name: { type: 'text', notNull: true },
            email: { type: 'varchar', unique: true, notNull: true },
            createdAt: { type: 'timestamptz', default: 'now()', notNull: true }
        }
    },
    regions: {
        columns: {
            id: { type: 'uuid', primaryKey: true, notNull: true },
            name: { type: 'text', notNull: true },
            planet: { type: 'uuid', notNull: true }
        },
        relations: {
            countries: {
                table: 'countries',
                fromKey: 'region', 
                toKey: 'id'
            },
            planet: {
                table: 'planets',
                fromKey: 'id', 
                toKey: 'planet'
            }
        }   
    },
    planets: {
        columns: {
            id: { type: 'int8', primaryKey: true, notNull: true },
            name: { type: 'text', notNull: true },
            type: { type: 'text', notNull: true }
        },
        relations: {
            regions: {
                table: 'regions',
                fromKey: 'planet', toKey: 'id'
            }
        }
    }
})