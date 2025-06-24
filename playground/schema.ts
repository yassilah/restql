import { defineSchema } from "../src";

export default defineSchema({
    cities: {
        relations: {
            country: {
                table: 'countries',
                fromKey: 'id', 
                toKey: 'country'
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
                fromKey: 'region', 
                toKey: 'id' 
            },
            cities: {
                table: 'cities',
                fromKey: 'id',
                toKey: 'country'
            },
        },
        columns: {
            code: { type: 'varchar', primaryKey: true, notNull: true },
            name: { type: 'text', notNull: true },
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
                fromKey: 'id', 
                toKey: 'region'
            },
            planet: {
                table: 'planets',
                fromKey: 'planet', 
                toKey: 'id'
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
                fromKey: 'id', 
                toKey: 'region'
            }
        }
    }
})