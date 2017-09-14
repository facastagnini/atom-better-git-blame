'use babel';

import * as childProcess from 'child_process';

function runGitCommand(
  repoPath: string,
  command: string,
  shell: boolean = false
) {
  const arguments = command.split(' ');
  const child = childProcess.spawn('git', arguments, { cwd: repoPath, shell });

  child.on('error', error => {
    throw error;
  });

  child.on('exit', exitCode => {
    if (exitCode !== 0) {
      throw new Error(`Git exited with unexpected code: ${exitCode}`);
    }
  });

  let stdOutPromise = new Promise((resolve, reject) => {
    let stdOut = '';
    child.stdout.on('data', data => (stdOut += data));
    child.stdout.on('end', () => resolve(stdOut));
    child.stdout.on('error', error => reject(error));
  });

  let stdErrPromise = new Promise((resolve, reject) => {
    let stdErr = '';
    child.stderr.on('data', data => (stdErr += data));
    child.stderr.on('end', () => resolve(stdErr));
    child.stderr.on('error', error => reject(error));
  });

  return new Promise((resolve, reject) => {
    Promise.all([stdOutPromise, stdErrPromise])
      .then(results => {
        const stdOut = results[0];
        const stdErr = results[1];
        if (stdErr !== '') {
          return reject(new Error(stdErr));
        }
        return resolve(stdOut);
      })
      .catch(err => {
        reject(err);
      });
  });
}

export default runGitCommand;
