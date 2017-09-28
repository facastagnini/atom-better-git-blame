'use babel';

import runGitCommand from './runCommand';
import findRepoRoot from './findRepoRoot';

async function email() {
  let gitEmail : string;
  try {
    gitEmail = await runGitCommand('/', `config --global user.email`) as string;
  } catch (e) {
    throw e;
  }
  return gitEmail.trim();
}

export default email;
