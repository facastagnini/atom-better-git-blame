'use babel';

import runGitCommand from './runCommand';
import findRepoRoot from './findRepoRoot';
import os from 'os';
import _ from 'lodash';

const cpuCount = os.cpus().length;
async function show(filePath, hashes) {
  const useParallel = atom.config.get('layer-atom.parallelGitProcessing');
  let processCount = 1;
  if (useParallel) {
    processCount = cpuCount / 2;
  }

  let repoRoot = findRepoRoot(filePath);
  if (!repoRoot) {
    throw new Error('File does not exist inside a git repo');
  }
  const chunkSize = Math.ceil(hashes.length / processCount);
  const chunkedHashes = _.chunk(hashes, chunkSize);
  const promises = chunkedHashes.map(hashes => {
    return runGitCommand(
      repoRoot,
      `show -s --format=%H%n%ce%n%cn%n%B%n=@END@= ${hashes.join(' ')}`
    );
  });

  return Promise.all(promises).then(results => {
    const parsed = results.map(result => {
      const commits = result.split('=@END@=');
      let parsedCommits = [];
      for (const i in commits) {
        const lines = commits[i].trim().split('\n');
        parsedCommits.push({
          hash: lines.shift(),
          email: lines.shift(),
          author: lines.shift(),
          subject: lines.shift(),
          message: lines.join('\n'),
        });
      }
      parsedCommits.pop();
      return parsedCommits;
    });
    return [].concat.apply([], parsed);
  });
}

export default show;
