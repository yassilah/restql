import type { FieldName, PrimaryKey, PrimaryKeyValue, Schema, TableName } from "@/types/schema";
import { join, trim } from "./utils/helpers";
import { from,  joins, select, where } from "./utils/statements";
import { ConditionTree } from "@/types/params";

/**
 * Write a SQL query to find records in a table with specified parameters.
 */
export function raw<S extends Schema, T extends TableName<S>, const K extends PrimaryKeyValue<S, T>, const P extends QueryParams<S, T>>(schema: S, table: T, primaryKey: K, params: P) {
    const key = Object.entries(schema[table].columns).find(([_, v]) => v.primaryKey)?.[0] as PrimaryKey<S, T>;
    params.where = params.where || {};
    Object.assign(params.where, { [key]: {  $eq: primaryKey  } });

    return trim(join([
        select(schema, table, params.columns as P['columns']),
        from(table),
        joins(schema, table, params),
        where(schema, table, params.where as P['where'] & Record<PrimaryKey<S, T>, { $eq: K }>)
    ], ' '))
}

export interface QueryParams<S extends Schema = Schema, F extends TableName<S> = TableName<S>> {
    columns?: FieldName<S, F>[]
    where?: ConditionTree<S, F>
}
