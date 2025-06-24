import type { QueryParams } from "./remove"
import type { PrimaryKeyValue, Schema, TableName } from "@/types/schema";
import { addPrimaryKeyCondition, join, trim } from "./utils/helpers";
import { where, remove } from "./utils/statements";

/**
 * Write a SQL query to find records in a table with specified parameters.
 */
export function raw<S extends Schema, T extends TableName<S>, const K extends PrimaryKeyValue<S, T>, const P extends QueryParams<S, T>>(schema: S, table: T, key: K,  params?: P) {
    const whereClause = addPrimaryKeyCondition(schema, table, key, params);

    return trim(join([
        remove(table),
        where(schema, table, whereClause)
    ], ' '))
}

export { QueryParams } from "./remove";
