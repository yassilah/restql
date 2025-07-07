function defineSchema(schema) {
  return schema;
}
function defineDriver(create, defautlDb) {
  return (schema, db = defautlDb()) => {
    const result = create(schema);
    const findRaw = result.findRaw;
    const findOneRaw = result.findOneRaw;
    const updateRaw = result.updateRaw;
    const updateOneRaw = result.updateOneRaw;
    const createOneRaw = result.createOneRaw;
    const removeRaw = result.removeRaw;
    const removeOneRaw = result.removeOneRaw;
    const find = (table, params) => {
      return db.sql`${findRaw(table, params)}`;
    };
    const findOne = (table, primaryKey, params) => {
      return db.sql`${findOneRaw(table, primaryKey, params || {})}`;
    };
    const update = (table, item, params) => {
      return db.sql`${updateRaw(table, item, params || {})}`;
    };
    const updateOne = (table, primaryKey, item, params) => {
      return db.sql`${updateOneRaw(table, primaryKey, item, params || {})}`;
    };
    const createOne = (table, item) => {
      return db.sql`${createOneRaw(table, item)}`;
    };
    const remove = (table, params) => {
      return db.sql`${removeRaw(table, params)}`;
    };
    const removeOne = (table, primaryKey, params) => {
      return db.sql`${removeOneRaw(table, primaryKey, params || {})}`;
    };
    return {
      find: Object.assign(find, { raw: findRaw }),
      findOne: Object.assign(findOne, { raw: findOneRaw }),
      update: Object.assign(update, { raw: updateRaw }),
      updateOne: Object.assign(updateOne, { raw: updateOneRaw }),
      createOne: Object.assign(createOne, { raw: createOneRaw }),
      remove: Object.assign(remove, { raw: removeRaw }),
      removeOne: Object.assign(removeOne, { raw: removeOneRaw }),
      db,
      schema
    };
  };
}

export { defineDriver, defineSchema };
