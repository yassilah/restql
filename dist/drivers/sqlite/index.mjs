import { createDatabase } from 'db0';
import connector from 'db0/connectors/sqlite3';
import { defineDriver } from '../../index.mjs';
import { removeRaw, removeOneRaw, createOneRaw, updateOneRaw, updateRaw, findOneRaw, findRaw } from './queries.mjs';
import '../../utils/helpers.mjs';
import '../../utils/statements.mjs';

const sqlite = defineDriver((schema) => ({
  findRaw: findRaw(schema),
  findOneRaw: findOneRaw(schema),
  updateRaw: updateRaw(schema),
  updateOneRaw: updateOneRaw(schema),
  createOneRaw: createOneRaw(),
  removeOneRaw: removeOneRaw(schema),
  removeRaw: removeRaw(schema)
}), () => createDatabase(connector({ cwd: process.cwd() })));

export { sqlite as default };
