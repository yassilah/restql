import type { Schema, TableName } from "@/types/schema";
import { Item, join, trim } from "./utils/helpers";
import { insert, values } from "./utils/statements";

/**
 * Write a SQL query to find records in a table with specified parameters.
 */
export function raw<S extends Schema, T extends TableName<S>, const I extends Partial<Item<S, T>>>(_schema: S, table: T, item: I) {
    return trim(join([
        insert(table),
        values(item),
    ], ' '))
}