'use babel';

import * as childProcess from 'child_process';

function runGitCommand(
  repoPath: string,
  command: string,
  shell: boolean = false
) {
  return new Promise((resolve, reject) => {
    const args = command.split(' ');
    const child = childProcess.spawn('git', args, { cwd: repoPath, shell });

    child.on('error', error => {
      console.error(command);
      return reject(error);
    });

    child.on('exit', exitCode => {
      if (exitCode !== 0 && exitCode !== 128) {
        console.error(command);
        return reject(
          new Error(`Git exited with unexpected code: ${exitCode}`)
        );
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
