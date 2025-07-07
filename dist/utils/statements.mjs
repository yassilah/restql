import { normalizeColumns, wrap, join, normalizeOperationValue, getAllJoinClauses, getOrderByClauses, getWhereClauses } from './helpers.mjs';

function select(schema, table, columns) {
  return `SELECT ${normalizeColumns(schema, table, columns)}`;
}
function update(table) {
  return `UPDATE ${wrap(table)}`;
}
function remove(table) {
  return `DELETE FROM ${wrap(table)}`;
}
function insert(table) {
  return `INSERT INTO ${wrap(table)}`;
}
function values(item) {
  return `(${join(Object.keys(item), ", ")}) VALUES (${join(Object.values(item).map(normalizeOperationValue), ", ")})`;
}
function set(item) {
  return `SET ${join(Object.entries(item).map(([key, value]) => `${wrap(key)} = ${normalizeOperationValue(value)}`), ", ")}`;
}
function from(table) {
  return `FROM ${wrap(table)}`;
}
function limit(limit2) {
  return limit2 !== void 0 ? `LIMIT ${limit2}` : "";
}
function offset(offset2) {
  return offset2 !== void 0 ? `OFFSET ${offset2}` : "";
}
function joins(schema, table, params) {
  return join(getAllJoinClauses(schema, table, params), " ");
}
function groupBy(schema, table, columns) {
  return !columns?.length ? "" : `GROUP BY ${normalizeColumns(schema, table, columns)}`;
}
function orderBy(schema, table, columns) {
  return !columns?.length ? "" : `ORDER BY ${getOrderByClauses(schema, table, columns)}`;
}
function where(schema, table, where2) {
  return where2 ? `WHERE ${getWhereClauses(schema, table, where2)}` : "";
}

export { from, groupBy, insert, joins, limit, offset, orderBy, remove, select, set, update, values, where };
