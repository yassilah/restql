import { QueryParams } from "../../types/params";
import { Schema, TableName } from "../../types/schema";
import { find, findRaw } from "./find";

export const sqlite = <const S extends Schema>(schema: S) => {
    const _find = <T extends TableName<S>, const P extends QueryParams<S, T>>(table: T, params: P) => {
        return find(schema, table, params);
    }

    const _findRaw = <T extends TableName<S>, const P extends QueryParams<S, T>>(table: T, params: P) => {
        return findRaw(schema, table, params);
    }

    return {
        find: Object.assign(_find, { raw: _findRaw })
    }
}
