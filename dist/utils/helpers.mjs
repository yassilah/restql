const OPERATORS = {
  $eq: (value) => `= ${normalizeOperationValue(value)}`,
  $neq: (value) => `!= ${normalizeOperationValue(value)}`,
  $gt: (value) => `> ${value}`,
  $gte: (value) => `>= ${value}`,
  $lt: (value) => `< ${value}`,
  $lte: (value) => `<= ${value}`,
  $like: (value) => `LIKE ${normalizeOperationValue(value)}`,
  $nlike: (value) => `NOT LIKE ${normalizeOperationValue(value)}`,
  $in: (value) => `IN (${join(value.map(normalizeOperationValue), ", ")})`,
  $nin: (value) => `NOT IN (${join(value.map(normalizeOperationValue), ", ")})`,
  $between: (value) => `BETWEEN ${value[0]} AND ${value[1]}`,
  $nbetween: (value) => `NOT BETWEEN ${value[0]} AND ${value[1]}`
};
function getPrimaryKey(schema, table) {
  return Object.entries(schema[table].columns).find(([_, v]) => v.primaryKey)?.[0];
}
function addPrimaryKeyCondition(schema, table, key, params = {}) {
  const primaryKey = getPrimaryKey(schema, table);
  if (!primaryKey) throw new Error(`Primary key not found for table ${table}`);
  params.where ??= {};
  Object.assign(params.where, { [primaryKey]: { $eq: key } });
  return params.where;
}
function wrap(value) {
  return `\`${value}\``;
}
function unique(arr) {
  return [...new Set(arr)];
}
function join(arr, separator = ", ") {
  return arr.join(separator);
}
function trim(value) {
  return value.trim();
}
function prepend(value, prefix) {
  return `${prefix}${value}`;
}
function unprepend(value, prefix) {
  return value.startsWith(prefix) ? value.slice(prefix.length) : value;
}
function normalizeColumn(schema, table, col) {
  return col.split(".").reduce((_, part) => {
    if (schema[table]?.relations?.[part]) {
      table = schema[table].relations?.[part].table;
    }
    return `${wrap(table)}.${wrap(part)}`;
  }, "");
}
function normalizeColumns(schema, table, columns) {
  return join(columns?.map((col) => normalizeColumn(schema, table, col)) ?? ["*"]);
}
function getRelationInfo(schema, table, col) {
  const parts = col.split(".");
  const relationInfo = [];
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const info = relationInfo[relationInfo.length - 1];
    const fromTable = info?.toTable ?? table;
    const relation = schema[fromTable]?.relations?.[part];
    if (!relation) break;
    relationInfo.push({
      fromTable,
      fromKey: relation.fromKey,
      toTable: relation.table,
      toKey: relation.toKey
    });
  }
  return relationInfo;
}
function getJoinClause(relation) {
  const toTable = relation.toTable;
  const fromTable = relation.fromTable;
  const fromKey = relation.fromKey;
  const toKey = relation.toKey;
  return `INNER JOIN ${wrap(toTable)} ON ${wrap(toTable)}.${wrap(toKey)} = ${wrap(fromTable)}.${wrap(fromKey)}`;
}
function getJoinClauses(schema, table, col) {
  const info = getRelationInfo(schema, table, col);
  if (!info) return "";
  return unique(info.map(getJoinClause));
}
function getAllFields(_schema, _table, params) {
  return unique([
    ...params.columns ?? [],
    ...params.groupBy ?? [],
    ...(params.orderBy ?? []).map((col) => unprepend(col, "-"))
  ]);
}
function getAllJoinClauses(schema, table, params) {
  const fields = getAllFields(schema, table, params);
  return unique(fields.flatMap((col) => getJoinClauses(schema, table, col)));
}
function getOrderByClauses(schema, table, columns) {
  if (!columns?.length) return "";
  return columns.map((col) => {
    const normalizedCol = normalizeColumn(schema, table, col);
    return col.startsWith("-") ? `${normalizedCol} DESC` : `${normalizedCol} ASC`;
  });
}
function getWhereClauses(schema, table, condition) {
  return join(Object.entries(condition).flatMap(([key, value]) => {
    if (key === "$and" && Array.isArray(value)) {
      return `(${join(value.flatMap((v) => getWhereClauses(schema, table, v)), " AND ")})`;
    } else if (key === "$or" && Array.isArray(value)) {
      return `(${join(value.flatMap((v) => getWhereClauses(schema, table, v)), " OR ")})`;
    } else if (!Array.isArray(value) && typeof value === "object") {
      const column = normalizeColumn(schema, table, key);
      return Object.entries(value).flatMap(([operator, val]) => {
        if (operator in OPERATORS) {
          const fn = OPERATORS[operator];
          return `${column} ${fn(val)}`;
        }
        return getWhereClauses(schema, table, { [operator]: val });
      });
    }
    return [];
  }), " AND ");
}
function normalizeOperationValue(value) {
  return typeof value === "string" ? `'${value}'` : value;
}

export { OPERATORS, addPrimaryKeyCondition, getAllFields, getAllJoinClauses, getJoinClause, getJoinClauses, getOrderByClauses, getPrimaryKey, getRelationInfo, getWhereClauses, join, normalizeColumn, normalizeColumns, normalizeOperationValue, prepend, trim, unique, unprepend, wrap };
