'use babel';

import runGitCommand from './runCommand';
import findRepoRoot from './findRepoRoot'

async function getRepoRemotes(filePath: string){
  const repoRoot = findRepoRoot(filePath);
  try {
    const remotes = await runGitCommand(repoRoot, 'remote -v',);
    if(remotes === ''){
      return [];
    }
    return remotes
      .trim()
      .split('\n')
      .map(remote => {
        const matchedRemote = remote.match(/(.+)\t(.+)\s\((.+)\)/);
        return {
          name: matchedRemote[1],
          url: matchedRemote[2],
          type: matchedRemote[3],
        };
      });
  } catch (e) {
    throw e
  }
}

export default getRepoRemotes;
