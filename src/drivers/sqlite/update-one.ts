import type { QueryParams } from "./update"
import type { PrimaryKeyValue, Schema, TableName } from "@/types/schema";
import { addPrimaryKeyCondition, Item, join, trim } from "./utils/helpers";
import { where, update, set } from "./utils/statements";

/**
 * Write a SQL query to find records in a table with specified parameters.
 */
export function raw<S extends Schema, T extends TableName<S>, const K extends PrimaryKeyValue<S, T>, const I extends Partial<Item<S, T>>, const P extends QueryParams<S, T>>(schema: S, table: T, key: K, item: I, params?: P) {
    const whereClause = addPrimaryKeyCondition(schema, table, key, params);

    return trim(join([
        update(table),
        set(item),
        where(schema, table, whereClause)
    ], ' '))
}

export { QueryParams } from "./update";
