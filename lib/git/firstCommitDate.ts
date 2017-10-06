'use babel';

import findRepoRoot from './findRepoRoot';
import runGitCommand from './runCommand';
import os from 'os';

async function getFirstCommitDate(filePath) {
  const repoRoot = findRepoRoot(filePath);

  let command = 'log --reverse --date-order --pretty=%ad | head -n 1';
  if (os.platform() === 'win32') {
    command = 'log --reverse --date-order --pretty=%ad | Select -First 1';
  }
  try {
    const firstCommit = await runGitCommand(repoRoot, command, true);
    return new Date(firstCommit);
  } catch (e) {
    throw e;
  }
}

export default getFirstCommitDate;
