import { S as Schema, T as TableName, F as FieldName, C as ConditionTree } from './restql.DyUQsuu_.js';

interface FindParams<S extends Schema = Schema, T extends TableName<S> = TableName<S>> {
    columns?: FieldName<S, T>[];
    where?: ConditionTree<S, T>;
    orderBy?: `${'' | '-'}${FieldName<S, T>}`[];
    groupBy?: FieldName<S, T>[];
    limit?: number;
    offset?: number;
}
type FindOneParams<S extends Schema = Schema, T extends TableName<S> = TableName<S>> = Pick<FindParams<S, T>, 'columns' | 'where'>;
type RemoveParams<S extends Schema = Schema, T extends TableName<S> = TableName<S>> = Pick<FindParams<S, T>, 'where'>;
type RemoveOneParams<S extends Schema = Schema, T extends TableName<S> = TableName<S>> = Pick<FindParams<S, T>, 'where'>;
type UpdateParams<S extends Schema = Schema, T extends TableName<S> = TableName<S>> = Pick<FindParams<S, T>, 'where'>;
type UpdateOneParams<S extends Schema = Schema, T extends TableName<S> = TableName<S>> = Pick<FindParams<S, T>, 'where'>;

export type { FindParams as F, RemoveParams as R, UpdateParams as U, FindOneParams as a, UpdateOneParams as b, RemoveOneParams as c };
