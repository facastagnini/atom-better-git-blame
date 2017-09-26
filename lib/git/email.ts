'use babel';

import runGitCommand from './runCommand';
import findRepoRoot from './findRepoRoot';

async function email() {
  return runGitCommand('/', `config --global user.email`);
}

export default email;
