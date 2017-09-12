'use babel';

import low from 'lowdb';
import Memory from 'lowdb/adapters/Memory';

const adapter = new Memory();
const db = low(adapter);

db
  .defaults({
    commitMessages: [],
    blames: [],
    fileCommits: [],
    rootPaths: {},
    startDates: {},
  })
  .write();

export default db;
