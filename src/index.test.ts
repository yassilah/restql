import {  withQuery } from "ufo"
import { toQueryParams } from "."
import {  expect, test } from "vitest"

test('toQueryParams', () => {    
    const url = withQuery('https://test.com', {
        from: 'table',
        select: ['id', 'name'],
        where: [{
            $and: [{
                $eq: ['id', 1],
            }, {
                $eq: ['name', 'test']
            }]
        }]
    })

    expect(toQueryParams(url)).toMatchObject({
        select: ['id', 'name'],
        from: 'table',
        where: {
            $and: [{
                column: 'id',
                operator: '$eq',
                value: 1
            }, {
                column: 'name',
                operator: '$eq',
                value: 'test'
            }]
        },
        join: [],
        orderBy: [],
        limit: 0,
        offset: 0,
        groupBy: [] 
    })
})