'use babel';

import StepsizeHelper from '../stepsize/StepsizeHelper';
import * as GitData from './GitData';
import db from './database';
import _ from 'lodash';
import GitHelper from '../git/GitHelper';
import * as IntegrationNotification from '../interface/IntegrationNotification';

let pendingRequests = {};

export async function getIntegrationDataForFile(filePath: string) {
  const repoPath = await GitData.getRepoRootPath(filePath);
  const metadata = await GitData.getRepoMetadata(repoPath);
  const blame = await GitData.getBlameForFile(filePath);
  if (!pendingRequests[repoPath]) {
    pendingRequests[repoPath] = StepsizeHelper.fetchIntegrationData(
      metadata,
      GitHelper.getHashesFromBlame(blame.lines)
    )
      .then(response => {
        return processIntegrationData(response);
      })
      .catch(e => console.info(e));
  }
  const response = await pendingRequests[repoPath];
  delete pendingRequests[repoPath];
  return response;
}

async function processIntegrationData(data) {
  const issues = data.issues;
  db
    .get('issues')
    .merge(issues)
    .uniqBy('key')
    .write();
  const pullRequests = data.pullRequests;
  pullRequestsCommitsPivot(pullRequests);
  for (const pullRequestIdx of Object.keys(pullRequests)) {
    const pullRequest = pullRequests[pullRequestIdx];
    const existingPullRequest = db
      .get('pullRequests')
      .find({ number: pullRequest.number })
      .value();
    if (existingPullRequest) {
      continue;
    }
    const toWrite = { ...pullRequest };
    toWrite.commitCount = toWrite.commits.length;
    toWrite.relatedIssueKeys = data.pullRequestToIssues[pullRequestIdx].map(idx => issues[idx].key);
    db
      .get('pullRequests')
      .push(toWrite)
      .write();
  }
  for (const commit of data.commits) {
    GitData.updateCommit(commit.commitHash, { buildStatus: commit.buildStatus });
  }
  IntegrationNotification.checkIntegrationDataRetrieved(pullRequests, issues);
  return db.get('pullRequests').value();
}

function pullRequestsCommitsPivot(pullRequests) {
  const pivot = !pullRequests
    ? {}
    : pullRequests.reduce((acc, pullRequest) => {
        acc[pullRequest.number] = pullRequest.commits.map(commit => commit.commitHash);
        return acc;
      }, {});
  db
    .get('pullRequestsCommitsPivot')
    .merge(pivot)
    .uniq()
    .write();
  return db.get('pullRequestsCommitsPivot').value();
}

export async function getPullRequestsForCommit(filePath: string, commitHash: string) {
  if (pendingRequests[filePath]) {
    await pendingRequests[filePath];
  }
  const results = db
    .get('pullRequestsCommitsPivot')
    .reduce((acc, hashes, prNumber) => {
      if (hashes.includes(commitHash)) {
        acc.push(prNumber);
      }
      return acc;
    }, [])
    .value();
  return results.map(number => {
    return db
      .get('pullRequests')
      .find({ number: parseInt(number) })
      .value();
  });
}

export async function getCommitsForPullRequest(
  filePath: string,
  pullRequestNumber: string | number
) {
  if (pendingRequests[filePath]) {
    await pendingRequests[filePath];
  }
  return db
    .get('pullRequestsCommitsPivot')
    .get(pullRequestNumber)
    .value();
}

export async function getIssue(filePath: string, issueKey: string | number) {
  if (pendingRequests[filePath]) {
    await pendingRequests[filePath];
  }
  return db
    .get('issues')
    .find({ key: issueKey })
    .value();
}
