import { createDatabase } from 'db0';
import connector from 'db0/connectors/mysql2';
import sqlite from '../sqlite/index.mjs';
import 'db0/connectors/sqlite3';
import '../../index.mjs';
import '../sqlite/queries.mjs';
import '../../utils/helpers.mjs';
import '../../utils/statements.mjs';

const index = (schema) => sqlite(schema, createDatabase(connector({})));

export { index as default };
