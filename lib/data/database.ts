'use babel';

import low from 'lowdb';

// import LocalStorage from 'lowdb/adapters/LocalStorage';
// const adapter = new LocalStorage('stepsize-blame:db');

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
    repoMetadata: {},
    pullRequests: [],
    pullRequestsCommitsPivot: {},
    githubIssues: [],
    jiraIssues: [],
  })
  .write();

export default db;
