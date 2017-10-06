'use babel';

import runGitCommand from './runCommand';

async function email() {
  let gitEmail: string;
  try {
    gitEmail = (await runGitCommand('/', `config --global user.email`)) as string;
  } catch (e) {
    throw e;
  }
  if (gitEmail.length > 0) {
    return gitEmail.trim();
  }
  throw new Error('Git config did not return an email');
}

export default email;
