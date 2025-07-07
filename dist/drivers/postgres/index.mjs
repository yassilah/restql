import { createDatabase } from 'db0';
import connector from 'db0/connectors/postgresql';
import { r as removeRaw, a as removeOneRaw, c as createOneRaw, u as updateOneRaw, b as updateRaw, f as findOneRaw, d as findRaw } from '../../shared/restql.BupLIFpo.mjs';
import { defineDriver } from '../../index.mjs';
import '../../utils/helpers.mjs';
import '../../utils/statements.mjs';

const index = defineDriver((schema) => ({
  findRaw: findRaw(schema),
  findOneRaw: findOneRaw(schema),
  updateRaw: updateRaw(schema),
  updateOneRaw: updateOneRaw(schema),
  createOneRaw: createOneRaw(),
  removeOneRaw: removeOneRaw(schema),
  removeRaw: removeRaw(schema)
}), () => createDatabase(connector({})));

export { index as default };
