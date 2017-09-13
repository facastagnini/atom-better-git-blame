'use babel';

import GitHelper from '../GitHelper';
import StepsizeHelper from '../StepsizeHelper';
import GutterRange from '../GutterRange';
import db from './database';
import _ from 'lodash';

export async function getBlameForFile(filePath: string) {
  let existing = db
    .get('blames')
    .find({ path: filePath })
    .value();
  if (existing && Date.now() - existing.fetchedAt < 1000) {
    return existing;
  }
  const blame = await GitHelper.getGitBlameOutput(filePath);
  db
    .get('blames')
    .remove({ path: filePath })
    .write();
  db
    .get('blames')
    .push({
      path: filePath,
      lines: blame,
      fetchedAt: new Date(),
    })
    .write();
  return db
    .get('blames')
    .find({ path: filePath })
    .value();
}

export async function getCommitsForFile(filePath: string) {
  let existing = db
    .get('fileCommits')
    .find({ path: filePath })
    .value();
  if (existing && Date.now() - existing.fetchedAt < 1000) {
    return existing;
  }
  const blame = await getBlameForFile(filePath);
  const repoPath = await getRepoRootPath(filePath);
  const commits = blame.lines.reduce((acc, line) => {
    const parsed = GitHelper.parseBlameLine(line);
    parsed.repoPath = repoPath;
    if (acc[parsed.commitHash]) {
      return acc;
    }
    acc[parsed.commitHash] = parsed;
    return acc;
  }, {});
  db
    .get('fileCommits')
    .remove({ path: filePath })
    .write();
  db
    .get('fileCommits')
    .push({
      path: filePath,
      commits,
      fetchedAt: new Date(),
    })
    .write();
  loadCommits(
    repoPath,
    _.filter(
      _.map(commits, 'commitHash'),
      hash => hash.substr(0, 6) !== '000000'
    )
  );
  return db
    .get('fileCommits')
    .find({ path: filePath })
    .value();
}

export async function getGutterRangesForFile(filePath: string) {
  const blame = await getBlameForFile(filePath);
  let lineRanges = [];
  for (let i = 0; i < blame.lines.length; i++) {
    const line = blame.lines[i];
    const commitHash = line.split(' ')[0];
    // Build array of ranges
    if (lineRanges.length == 0) {
      // No ranges exist
      lineRanges.push(new GutterRange(i, commitHash));
    } else {
      const currentRange: GutterRange = lineRanges[lineRanges.length - 1]; // Get last range
      if (currentRange.identifier === commitHash) {
        currentRange.incrementRange();
      } else {
        // Add new range
        lineRanges.push(new GutterRange(i, commitHash));
      }
    }
  }
  return {
    path: filePath,
    ranges: _.groupBy(lineRanges, 'identifier'),
    fetchedAt: new Date(),
  };
}

export async function getFirstCommitDateForRepo(filePath: string) {
  return getRepoRootPath(filePath).then(async repoPath => {
    const cached = db
      .get('startDates')
      .get(repoPath)
      .value();
    if (cached) {
      return cached;
    }
    const date = await GitHelper.getFirstCommitDateForRepo(repoPath);
    db
      .get('startDates')
      .set(filePath, date)
      .write();
    return date;
  });
}

async function loadCommits(filePath, hashes) {
  const commits = await GitHelper.getCommit(filePath, hashes);
  commits.map(commit => {
    const toWrite = {
      commitHash: commit.hash,
      ...commit,
      fetchedAt: new Date(),
    };
    db.get('commitMessages').push(toWrite);
  });
  db.write();
}

export async function getCommit(filePath, hash) {
  let existing = db
    .get('commitMessages')
    .find({ commitHash: hash })
    .value();
  if (existing) {
    return existing;
  }
  const commit = await GitHelper.getCommit(filePath, [hash]);
  const toWrite = {
    commitHash: hash,
    ...commit[0],
    fetchedAt: new Date(),
  };
  db
    .get('commitMessages')
    .push(toWrite)
    .write();
  return toWrite;
}

export async function getRepoRootPath(filePath: string) {
  let cached = db.get(`rootPaths.${filePath}`).value();
  if (cached) {
    return cached;
  }
  let rootPath = await GitHelper.getRepoRootPath(filePath);
  db
    .get('rootPaths')
    .set(filePath, rootPath)
    .write();
  console.log(rootPath);
  return rootPath;
}

export async function getRepoMetadata(filePath: string) {
  let rootPath = await getRepoRootPath(filePath);
  let cached = db
    .get('repoMetadata')
    .find({
      rootPath: rootPath,
    })
    .value();
  if (cached) {
    return cached;
  }
  const remotes = await GitHelper.getRepoRemotes(rootPath);
  const metadata = GitHelper.extractRepoMetadataFromRemotes(remotes);
  const toWrite = {
    rootPath: rootPath,
    ...metadata,
    fetchedAt: new Date(),
  };
  db
    .get('repoMetadata')
    .push(toWrite)
    .write();
  return toWrite;
}
