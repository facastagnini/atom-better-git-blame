'use babel';

import GitHelper from '../git/GitHelper';
import gitBlame from '../git/blame';
import gitShow from '../git/show';
import gitRemotes from '../git/remotes';
import getFirstCommitDate from '../git/firstCommitDate';
import findRepoRoot from '../git/findRepoRoot';
import GutterRange from '../interface/GutterRange';
import db from './database';
import _ from 'lodash';

const blamePromises = {};
export async function getBlameForFile(filePath: string) {
  let existing = db
    .get('blames')
    .find({ path: filePath })
    .value();
  if (existing && Date.now() - existing.fetchedAt < 1000) {
    return existing;
  }
  if (!blamePromises[filePath]) {
    blamePromises[filePath] = gitBlame(filePath);
  }
  const blame = await blamePromises[filePath];
  db
    .get('blames')
    .remove({ path: filePath })
    .write();
  db
    .get('blames')
    .push({
      path: filePath,
      lines: blame.replace(/\s+$/, '').split('\n'),
      fetchedAt: new Date(),
    })
    .write();
  delete blamePromises[filePath];
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
    _.filter(_.map(commits, 'commitHash'), hash => hash.substr(0, 6) !== '000000')
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

const firstDatePromises = {};
export async function getFirstCommitDateForRepo(filePath: string) {
  return getRepoRootPath(filePath).then(async repoPath => {
    const cached = db
      .get('startDates')
      .get(repoPath)
      .value();
    if (cached) {
      return cached;
    }
    if (!firstDatePromises[filePath]) {
      firstDatePromises[filePath] = getFirstCommitDate(repoPath);
    }
    const date = await firstDatePromises[filePath];
    db
      .get('startDates')
      .set(filePath, date)
      .write();
    delete firstDatePromises[filePath];
    return date;
  });
}

let loadPromise: Promise<void>;
async function loadCommits(filePath: string, hashes: string[]) {
  if (loadPromise) {
    await loadPromise;
  }
  loadPromise = gitShow(filePath, hashes);
  const commits = await loadPromise;
  for (const i in commits) {
    const commit = commits[i];
    if (commit) {
      const toWrite = {
        commitHash: commit.hash,
        ...commit,
        fetchedAt: new Date(),
      };
      db
        .get('commitMessages')
        .set(commit.hash, toWrite)
        .write();
    }
  }
}

const commitPromises = {};
export async function getCommit(filePath: string, hash: string) {
  if (loadPromise) {
    await loadPromise;
  }
  let existing = db
    .get('commitMessages')
    .get(hash)
    .value();
  if (existing) {
    return existing;
  }
  if (!commitPromises[hash]) {
    commitPromises[hash] = gitShow(filePath, [hash]);
  }
  const commit = await commitPromises[hash];
  const toWrite = {
    commitHash: hash,
    ...commit[0],
    fetchedAt: new Date(),
  };
  db
    .get('commitMessages')
    .set(commit.hash, toWrite)
    .write();
  delete commitPromises[hash];
  return toWrite;
}

export function updateCommit(hash: string, data) {
  db
    .get('commitMessages')
    .get(hash)
    .assign(data)
    .write();
  return db
    .get('commitMessages')
    .get(hash)
    .value();
}

export async function getRepoRootPath(filePath: string) {
  let cached = db.get(`rootPaths.${filePath}`).value();
  if (cached) {
    return cached;
  }
  let rootPath = findRepoRoot(filePath);
  db
    .get('rootPaths')
    .set(filePath, rootPath)
    .write();
  return rootPath;
}

const metadataPromises = {};
export async function getRepoMetadata(repoPath: string) {
  let cached = db
    .get('repoMetadata')
    .find({
      rootPath: repoPath,
    })
    .value();
  if (cached) {
    return cached;
  }
  if (!metadataPromises[repoPath]) {
    metadataPromises[repoPath] = gitRemotes(repoPath);
  }
  const remotes = await metadataPromises[repoPath];
  const metadata = GitHelper.extractRepoMetadataFromRemotes(remotes);
  const toWrite = {
    rootPath: repoPath,
    ...metadata,
    fetchedAt: new Date(),
  };
  db
    .get('repoMetadata')
    .push(toWrite)
    .write();
  delete metadataPromises[repoPath];
  return toWrite;
}
