import { trim, join, addPrimaryKeyCondition } from '../utils/helpers.mjs';
import { remove, where, insert, values, update, set, select, from, joins, groupBy, orderBy, limit, offset } from '../utils/statements.mjs';

function findOneRaw(schema) {
  return (table, key, params) => {
    const whereClause = addPrimaryKeyCondition(schema, table, key, params);
    return trim(join([
      select(schema, table, params.columns),
      from(table),
      joins(schema, table, params),
      where(schema, table, whereClause)
    ], " "));
  };
}
function findRaw(schema) {
  return (table, params) => {
    return trim(join([
      select(schema, table, params.columns),
      from(table),
      joins(schema, table, params),
      where(schema, table, params.where),
      groupBy(schema, table, params.groupBy),
      orderBy(schema, table, params.orderBy),
      limit(params.limit),
      offset(params.offset)
    ], " "));
  };
}
function removeRaw(schema) {
  return (table, params) => {
    return trim(join([
      remove(table),
      where(schema, table, params.where)
    ], " "));
  };
}
function removeOneRaw(schema) {
  return (table, key, params) => {
    const whereClause = addPrimaryKeyCondition(schema, table, key, params);
    return trim(join([
      remove(table),
      where(schema, table, whereClause)
    ], " "));
  };
}
function updateRaw(schema) {
  return (table, item, params) => {
    return trim(join([
      update(table),
      set(item),
      where(schema, table, params.where)
    ], " "));
  };
}
function updateOneRaw(schema) {
  return (table, key, item, params) => {
    const whereClause = addPrimaryKeyCondition(schema, table, key, params);
    return trim(join([
      update(table),
      set(item),
      where(schema, table, whereClause)
    ], " "));
  };
}
function createOneRaw(_schema) {
  return (table, item) => {
    return trim(join([
      insert(table),
      values(item)
    ], " "));
  };
}

export { removeOneRaw as a, updateRaw as b, createOneRaw as c, findRaw as d, findOneRaw as f, removeRaw as r, updateOneRaw as u };
