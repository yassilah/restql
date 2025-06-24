import { Prettify } from "./helpers"

export interface Schema {
    [table: string]: {
        columns: {
            [column: string]: {
                type: ColumnTypes
                primaryKey?: boolean
                unique?: boolean
                notNull?: boolean
                default?: string | number | boolean | null
            }
        }
        relations?: {
            [relation: string]: {
                table: string
                fromKey: string
                toKey: string
            }
        }
    }
}

type TableDefinition<S extends Schema, T extends TableName<S>, R extends boolean = true> = {
    [C in ColumnName<S, T>]: ColumnTypeToTsType<S[T]['columns'][C]['type']>
} & (R extends true ? {
    [R in RelationName<S, T>]?: TableDefinition<S, RelationTableName<S, T, R>>
} : {})

export type Definition<S extends Schema, R extends boolean = true> = Prettify<{
    [K in TableName<S>]: TableDefinition<S, K, R>
}>

export type TableName<S extends Schema = Schema> = keyof S & string;

export type ColumnName<S extends Schema, T extends TableName<S>> = keyof S[T]['columns'] & string;

type RelationName<S extends Schema, T extends TableName<S>> = keyof NonNullable<S[T]['relations']> & string;

type RelationTableName<S extends Schema, T extends TableName<S>, C extends RelationName<S, T>> =
    C extends keyof NonNullable<S[T]['relations']> ? NonNullable<S[T]['relations']>[C]['table'] : never;

type RelationDefinition<S extends Schema, T extends TableName<S>, C extends RelationName<S, T>> = {
    fromTable: T
    toTable: NonNullable<S[T]['relations']>[C]['table']
    fromKey: NonNullable<S[T]['relations']>[C]['fromKey']
    toKey: NonNullable<S[T]['relations']>[C]['toKey']
}

export type Relation<S extends Schema, T extends TableName<S>, C extends FieldName<S, T>, D extends RelationDefinition<any, any, any>[] = []> =
    C extends `${infer A}.${infer B}.${infer C}` ?
        Relation<S, RelationTableName<S, T, A>, `${B}.${C}` & FieldName, [...D, RelationDefinition<S, T, A>]> :
    C extends `${infer A}.${string}` ?
        [...D, RelationDefinition<S, T, A>] :
    C extends RelationName<S, T> ? 
        [...D, RelationDefinition<S, T, C>] 
: never

export type FieldName<S extends Schema = Schema, F extends TableName<S> = TableName<S>, FF extends TableName<S> = F> =
    Exclude<ColumnName<S, F>, RelationName<S, F>> | {
        [K in RelationName<S, F>]: K extends string
        ? RelationTableName<S, F, K> extends FF
        ? never
        : RelationTableName<S, F, K> extends string
        ? `${K}.${FieldName<S, RelationTableName<S, F, K>, FF | K>}`
        : never
        : never
    }[RelationName<S, F>]

type ColumnTypes = 'text' | 'float4' | 'boolean' | 'date' | 'json' | 'int4' | 'int8' | 'timestamptz' | 'uuid' | 'varchar' | 'timestamp' | 'numeric';

type ColumnTypeToTsType<T extends ColumnTypes> =
    T extends 'text' ? string :
    T extends 'float4' ? number :
    T extends 'boolean' ? boolean :
    T extends 'date' ? Date :
    T extends 'json' ? Record<string, any> :
    T extends 'int4' ? number :
    T extends 'int8' ? bigint :
    T extends 'timestamptz' ? Date :
    T extends 'uuid' ? string :
    T extends 'varchar' ? string :
    T extends 'timestamp' ? Date :
    T extends 'numeric' ? number : never;
