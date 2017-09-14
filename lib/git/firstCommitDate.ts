'use babel';

import findRepoRoot from './findRepoRoot';
import runGitCommand from './runCommand';

async function getFirstCommitDate(filePath) {
  const repoRoot = findRepoRoot(filePath);
  try {
    const firstCommit = await runGitCommand(
      repoRoot,
      'log --reverse --date-order --pretty=%ad | head -n 1',
      true
    );
    return new Date(firstCommit);
  } catch (e) {
    throw e;
  }
}

export default getFirstCommitDate;
