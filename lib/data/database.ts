'use babel';

import low from 'lowdb';
import fs from 'fs';

import Memory from 'lowdb/adapters/Memory';
const adapter = new Memory();

const db = low(adapter);

db
  .defaults({
    commitMessages: {},
    blames: [],
    fileCommits: [],
    rootPaths: {},
    startDates: {},
    repoMetadata: {},
    pullRequests: [],
    pullRequestsCommitsPivot: {},
    issues: [],
  })
  .write();

window.layerCacheDump = function(path: string = __dirname) {
  let savePath = `${path}/layer-${Date.now()}.json`;
  fs.writeFileSync(savePath, JSON.stringify(db));
  console.log('Cache dumped to', savePath);
};

export default db;
