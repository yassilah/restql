import { withQuery } from "ufo";
import { describe, expect, it, test } from "vitest";
import { createInstance, toQueryParams, toRawSQL } from "..";
import { sqlite } from "./sqlite";

describe("sqlite", () => {
    it ('should create a sqlite query', () => {
        const url = withQuery('https://test.com', {
            from: 'table',
            select: ['id', 'name'],
            where: {
                $and: [{
                    $eq: ['id', 1],
                }, {
                    $eq: ['name', 'test']
                }]
            }
        })


        expect(toRawSQL(url, {
            driver: sqlite()
        })).toMatch("SELECT `table`.`id`, `table`.`name` FROM `table` WHERE (`table`.`id` = 1 AND `table`.`name` = 'test')")
    })


    it ('should create a more complex sqlite query with nested conditions', () => {
        const url = withQuery('https://test.com', {
            from: 'table',
            select: ['id', 'name'],
            where: {
                $and: [{
                    $eq: ['id', 1],
                }, {
                    $eq: ['name', 'test']
                }],
                $or: [{
                    $eq: ['id', 2],
                }, {
                    $and: [{
                        $eq: ['id', 3],
                    }, {
                        $eq: ['name', 'test2']
                    }]
                }]
            }
        })

        expect(toRawSQL(url, {
            driver: sqlite()
        })).toMatch("SELECT `table`.`id`, `table`.`name` FROM `table` WHERE (`table`.`id` = 1 AND `table`.`name` = 'test') AND (`table`.`id` = 2 OR (`table`.`id` = 3 AND `table`.`name` = 'test2'))")
    })

    it ('should create a sqlite query with group by', () => {
        const url = withQuery('https://test.com', {
            from: 'table',
            select: ['id', 'name'],
            groupBy: ['id'],
            where: {
                $and: [{
                    $eq: ['id', 1],
                }, {
                    $eq: ['name', 'test']
                }]
            }
        })

        expect(toRawSQL(url, {
            driver: sqlite()
        })).toMatch("SELECT `table`.`id`, `table`.`name` FROM `table` WHERE (`table`.`id` = 1 AND `table`.`name` = 'test') GROUP BY `table`.`id`")
    })

    it ('should create a sqlite query with order by', () => {
        const url = withQuery('https://test.com', {
            from: 'table',
            select: ['id', 'name'],
            orderBy: ['id', '-name'],
            where: {
                $and: [{
                    $eq: ['id', 1],
                }, {
                    $eq: ['name', 'test']
                }]
            }
        })

        expect(toRawSQL(url, {
            driver: sqlite()
        })).toMatch("SELECT `table`.`id`, `table`.`name` FROM `table` WHERE (`table`.`id` = 1 AND `table`.`name` = 'test') ORDER BY `table`.`id` ASC, `table`.`name` DESC")
    })

    it ('should create a sqlite query with limit', () => {
        const url = withQuery('https://test.com', {
            from: 'table',
            select: ['id', 'name'],
            limit: 10,
            where: {
                $and: [{
                    $eq: ['id', 1],
                }, {
                    $eq: ['name', 'test']
                }]
            }
        })

        expect(toRawSQL(url, {
            driver: sqlite()
        })).toMatch("SELECT `table`.`id`, `table`.`name` FROM `table` WHERE (`table`.`id` = 1 AND `table`.`name` = 'test') LIMIT 10")
    })

    it ('should create a sqlite query with offset', () => {
        const url = withQuery('https://test.com', {
            from: 'table',
            select: ['id', 'name'],
            offset: 10,
            where: {
                $and: [{
                    $eq: ['id', 1],
                }, {
                    $eq: ['name', 'test']
                }]
            }
        })

        expect(toRawSQL(url, {
            driver: sqlite()
        })).toMatch("SELECT `table`.`id`, `table`.`name` FROM `table` WHERE (`table`.`id` = 1 AND `table`.`name` = 'test') OFFSET 10")
    })

    it ('should create a sqlite query with joins', () => {
        const url = withQuery('https://test.com', {
            from: 'table',
            select: ['id', 'name', 'table2.id', 'table2.foo'],
            where: {
                $and: [{
                    $eq: ['id', 1],
                }, {
                    $eq: ['name', 'test']
                }, {
                    $or: [{
                        $eq: ['table2.foo', 'bar']
                    }, {
                        $eq: ['table2.foo', 'baz']
                    }]
                }]
            }
        })

        expect(toRawSQL(url, {
            driver: sqlite()
        })).toMatch("SELECT `table`.`id`, `table`.`name`, `table2`.`id`, `table2`.`foo` FROM `table` INNER JOIN `table2` ON `table`.`id` = `table2`.`id` WHERE (`table`.`id` = 1 AND `table`.`name` = 'test' AND (`table2`.`foo` = 'bar' OR `table2`.`foo` = 'baz'))")
    })

    it ('should create a sqlite query with nested joins', () => {
        const url = withQuery('https://test.com', {
            from: 'table',
            select: ['id', 'name', 'table2.id', 'table2.foo', 'table2.table3.id', 'table2.table3.bar'],
            where: {
                $and: [{
                    $eq: ['id', 1],
                }, {
                    $eq: ['name', 'test']
                }, {
                    $or: [{
                        $eq: ['table2.foo', 'bar']
                    }, {
                        $eq: ['table2.foo', 'baz']
                    }]
                }]
            }
        })

        expect(toRawSQL(url, {
            driver: sqlite()
        })).toMatch("SELECT `table`.`id`, `table`.`name`, `table2`.`id`, `table2`.`foo`, `table3`.`id`, `table3`.`bar` FROM `table` INNER JOIN `table2` ON `table`.`id` = `table2`.`id` INNER JOIN `table3` ON `table2`.`id` = `table3`.`id` WHERE (`table`.`id` = 1 AND `table`.`name` = 'test' AND (`table2`.`foo` = 'bar' OR `table2`.`foo` = 'baz'))")
    })


    it ('should create a sqlite query with a schema', () => {
        const schema = {
            projects: {
                relations: {
                    countries: {
                        through: 'projects_countries',
                        fromKey: 'id',
                        toKey: 'countries_id'
                    }
                }
            },
            countries: {
                relations: {
                    projects: {
                        through: 'projects_countries',
                        fromKey: 'id',
                        toKey: 'projects_id'
                    },
                    region: {
                        table: 'regions',
                        fromKey: 'region',
                        toKey: 'id'
                    }
                }
            },
            regions: {
                relations: {
                    countries: {
                        table: 'countries',
                        fromKey: 'id',
                        toKey: 'region'
                    },
                    continent: {
                        table: 'continents',
                        fromKey: 'continent',
                        toKey: 'id'
                    }
                }
            },
            continents: {
                relations: {
                    regions: {
                        table: 'regions',
                        fromKey: 'id',
                        toKey: 'continent'
                    },
                    planet: {
                        table: 'planets',
                        fromKey: 'planet',
                        toKey: 'id'
                    }
                }
            },
            planets: {
                relations: {
                    continents: {
                        table: 'continents',
                        fromKey: 'id',
                        toKey: 'planet'
                    }
                }
            }
        }

        const toSql = createInstance({
            driver: sqlite(schema)
        })

        expect(toSql(withQuery('https://test.com', {
                from: 'projects',
                select: ['id', 'name', 'countries.name', 'countries.region.name']
            })
        )).toMatch("SELECT `projects`.`id`, `projects`.`name`, `countries`.`name`, `regions`.`name` FROM `projects` INNER JOIN `projects_countries` ON `projects`.`id` = `projects_countries`.`projects_id` INNER JOIN `countries` ON `projects_countries`.`countries_id` = `countries`.`id` INNER JOIN `regions` ON `countries`.`region` = `regions`.`id`")

        expect(toSql(withQuery('https://test.com', {
            from: 'projects',
            select: ['countries.name'],
            where: {
                $eq: ['countries.region.name', 'Africa'],
                $neq: ['countries.name', 'France']
            }
        })
        )).toMatch("SELECT `countries`.`name` FROM `projects` INNER JOIN `projects_countries` ON `projects`.`id` = `projects_countries`.`projects_id` INNER JOIN `countries` ON `projects_countries`.`countries_id` = `countries`.`id` INNER JOIN `regions` ON `countries`.`region` = `regions`.`id` WHERE (`regions`.`name` = 'Africa' AND `countries`.`name` != 'France')")
    

        expect(toSql(withQuery('https://test.com', {
            from: 'projects',
            select: ['id', 'countries.name'],
            where: {
                $eq: ['countries.region.continent.planet.name', 'Earth'],
            }
        })
        )).toMatch("SELECT `projects`.`id`, `countries`.`name` FROM `projects` INNER JOIN `projects_countries` ON `projects`.`id` = `projects_countries`.`projects_id` INNER JOIN `countries` ON `projects_countries`.`countries_id` = `countries`.`id` INNER JOIN `regions` ON `countries`.`region` = `regions`.`id` INNER JOIN `continents` ON `regions`.`continent` = `continents`.`id` INNER JOIN `planets` ON `continents`.`planet` = `planets`.`id` WHERE (`planets`.`name` = 'Earth')")
        })


})