'use babel';

import runGitCommand from './runCommand';
import findRepoRoot from './findRepoRoot'

async function getRepoRemotes(filePath: string){
  const repoRoot = findRepoRoot(filePath);
  try {
    const remotes = await runGitCommand(repoRoot, 'remote -v');
    if(remotes === ''){
      return [];
    }
    return remotes
      .substring(0, remotes.length - 1)
      .split('\n')
      .map(remote => {
        const splitRemote = remote.split('\t');
        let [name, url, type] = [undefined, undefined, undefined];
        if (splitRemote.length > 0) {
          name = splitRemote[0];
          url = splitRemote[1].split(' ')[0];
          type = splitRemote[1].split(' ')[1];
          type = type.substring(1, type.length - 1);
        }
        return { name, url, type };
      });
  } catch (e) {
    throw e
  }
}

export default getRepoRemotes;
