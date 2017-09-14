'use babel';

import runGitCommand from './runCommand';
import findRepoRoot from './findRepoRoot';
import path from 'path';

async function blame(filePath){
  let repoRoot = findRepoRoot(filePath);
  if(!repoRoot){
    throw new Error('File does not exist inside a git repo');
  }
  const relPath = path.relative(repoRoot, filePath);
  return runGitCommand(repoRoot, `blame --show-number --show-name -l --root ${relPath}`)
}

export default blame;
