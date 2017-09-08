'use babel';

import * as childProcess from 'child_process';
import * as path from 'path';
import { uniq } from 'lodash';
import * as GitUrlParse from 'git-url-parse';

class GitHelper {
  /**
   * getGitBlameOutput() takes the selected line numbers, converts them to git blame formatted line
   * ranges and retrieves the git blame output for them.
   *
   * The layer plugins can return the last line of a file (corresponding to the EOF char) if the user
   * selects the end of a file to be included. Git blame will throw an error if we try to blame this
   * EOF line. We work around it by trying to re-run the function with the last line (
   * corresponding to the EOF char) of the selected lines deleted when git blame thinks we're out of
   * the file's line range. Note: when that happens, we modify the original selectedLineNumbers
   * variable in order for the rest of the function to proceed without errors.
   *
   * @param   {Object}   dirPath              Directory of the file selected by the user
   * @param   {Object}   relFilePath          Rel path to the file from the fileDir
   * @param   {Number[]} selectedLineNumbers  Line numbers array returned by the plugin
   * @returns {String[]} git blame output data
   */
  static getGitBlameOutput(
    absolutePath,
    selectedLineNumbers,
    retryOnOutOfRange = true
  ): Promise<Array<string>> {
    const dirPath = path.dirname(absolutePath);
    const relFilePath = path.relative(dirPath, absolutePath);
    const blameRanges = GitHelper.convertLineNumbersToBlameRangeFormat(
      selectedLineNumbers
    );
    const gitArgs = [
      'blame', // the git command to run
      '--show-number', // show the original line number in the commit
      '--show-name', // show original file name - git sometimes adds them automatically, so we
      // include this option to have a consistent output across files
      '-l', // display the full hash
      '--root', // do not display the start caret for boundary commits
      ...blameRanges, // range to blame
      '--', // to pass the file path
      relFilePath,
    ];
    return new Promise((resolve, reject) => {
      let [stdoutOutput, stderrOutput, stdoutEnd, stderrEnd] = [
        '',
        '',
        false,
        false,
      ];
      const child = childProcess.spawn('git', gitArgs, { cwd: dirPath });

      // Define the function to complete the promise if we're ready (i.e. stdout & stderr both ended)
      const completePromiseIfReady = () => {
        if (stdoutEnd && stderrEnd) {
          if (stderrOutput !== '') {
            const errorMsg = stderrOutput.toString().trim();
            if (
              errorMsg ===
              'fatal: Not a git repository (or any of the parent directories): .git'
            ) {
              reject(new Error(`${dirPath}/${relFilePath} is not git-tracked`));
            } else if (
              errorMsg.includes('fatal: file ') &&
              errorMsg.includes(' has only ') &&
              errorMsg.includes(' lines')
            ) {
              if (retryOnOutOfRange) {
                // we re-run this function once with the last line ommitted if we get the
                // "out-of-bound error" which might indicate we're trying to run git blame on the
                // EOF character line.
                selectedLineNumbers.pop();
                resolve(
                  GitHelper.getGitBlameOutput(
                    absolutePath,
                    selectedLineNumbers,
                    false
                  )
                );
              } else {
                reject(
                  new Error(
                    `The selected lines ranges ${blameRanges} are not in the range of the file.`
                  )
                );
              }
            } else {
              reject(new Error(`Unexpected error: ${stderrOutput}`));
            }
          }
          resolve(
            stdoutOutput === ''
              ? []
              : stdoutOutput.replace(/\s+$/, '').split('\n')
          );
        }
      };

      // Collect the output streamed back from the child process
      child.stdout.on('data', data => (stdoutOutput += data));
      child.stderr.on('data', data => (stderrOutput += data));

      // Resolve or reject the promise when a pipe is closed, as long as the other pipe is closed too
      child.stdout.on('end', () => {
        stdoutEnd = true;
        completePromiseIfReady();
      });
      child.stderr.on('end', () => {
        stderrEnd = true;
        completePromiseIfReady();
      });

      // Check for any unexpected exit codes
      child.on('exit', code => {
        if (code !== 0 && code !== 128)
          reject(new Error(`Unexpected exit code: ${code}`));
      });

      // We don't expect any errors here since the path has been validated
      child.on('error', error =>
        reject(new Error(`Unexpected error: ${error}`))
      );
    });
  }

  static getFirstCommitDateForRepo(repoPath: string): Promise<Date> {
    return new Promise((resolve, reject) => {
      const dirPath = repoPath;
      const args = [
        '-c',
        'git log --reverse --date-order --pretty=%ad | head -n 1',
      ];
      const child = childProcess.spawn('sh', args, { cwd: dirPath });
      let stdOut = '';
      let stdErr = '';
      let date;
      child.stdout.on('data', data => {
        stdOut = stdOut + data;
      });
      child.stderr.on('data', data => {
        stdErr = stdErr + data;
      });
      child.on('exit', () => {
        if (stdErr.length > 0) {
          return reject(
            new Error(
              'Could not fetch first commit date, make sure you supply a git repo path'
            )
          );
        } else {
          try {
            date = new Date(stdOut);
          } catch (e) {
            return reject(e);
          }
          return resolve(date);
        }
      });
    });
  }

  /**
   * convertLineNumbersToBlameRangeFormat() is a routine to convert line numbers into string formatted
   * ranges necessary for git blame.
   *
   * Also converts individual lines into ranges, i.e [3, 4, 6] -> ['-L3,4', '-L6,6']
   * Assumes that there is at least one line in the selected lines.
   *
   * @param   {Number[]}  selectedLineNumbers  Line numbers array returned by the plugin
   * @returns {String[]}  Array of git blame formated ranges
   */
  static convertLineNumbersToBlameRangeFormat(
    selectedLineNumbers: Array<number>
  ) {
    const lineRanges = [];
    let left = selectedLineNumbers[0];
    let right = selectedLineNumbers[0] - 1;
    selectedLineNumbers.forEach(lineNumber => {
      if (lineNumber === right + 1) right = lineNumber;
      else {
        lineRanges.push(`-L${left},${right}`);
        left = lineNumber;
        right = lineNumber;
      }
    });
    lineRanges.push(`-L${left},${right}`);
    return lineRanges;
  }

  /**
   * getRepoRemotes() returns a git repo's fetch & pull remotes, if any, given the directory path of
   * any file in the repo
   *
   * Note: this function doesn't validate the file path. Compose this function with `validateFilePath`
   * if needed.
   * It also expects that it's known a priori that this directory is inside the repo, or at least its
   * root.
   *
   * @param   {String}   absolutePath  Absolute path to a directory of a file presumably in a git repo
   * @returns {Object[]} Array of { name, url, type } for each of the repo's remotes
   */
  static getRepoRemotes(absolutePath: string) {
    const fileDir = path.dirname(absolutePath);
    return new Promise((resolve, reject) => {
      const child = childProcess.spawn('git', ['remote', '-v'], {
        cwd: fileDir,
      });
      let remotes = '';
      child.stdout.on('data', data => (remotes += data));
      child.stdout.on('end', () => {
        if (remotes !== '') {
          resolve(
            remotes
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
              })
          );
        } else {
          resolve([]);
        }
      });
      child.stderr.on('data', data =>
        reject(new Error(`getRepoRemotes(0) unexpected stderr: ${data}`))
      );
      child.on('exit', code => {
        if (code !== 0 && code !== 128)
          reject(new Error(`getRepoRemotes(1) unexpected exit code: ${code}`));
      });
      child.on('error', error =>
        reject(
          new Error(
            `getRepoRemotes(2) unexpected error with message "${error.message}" & stack trace ${error.stack}`
          )
        )
      );
    });
  }

  /**
   * extractRepoMetadataFromRemotes() gets some details about the repo from the remote URLs.
   * Specifically, we get the repo's origin (i.e. code hosting service), its name, its owner, and its
   * root & commit URLs. These details are used later to augment commit-level code search results with
   * data from code hosting & project management integrations.
   *
   * @param   {Array<any>} remotes  Array of remote URLs of the form { url, name, type }
   * @returns {Object}     Object containing the extract repo metadata
   */
  static extractRepoMetadataFromRemotes(
    remotes: Array<any>
  ): { [prop: string]: any } {
    if (!Array.isArray(remotes) || remotes.length === 0) return {};
    let parsedUrl;
    try {
      parsedUrl = GitUrlParse(remotes[0].url);
    } catch (error) {
      return {};
    }
    const repoMetadata: { [prop: string]: any } = {
      repoName: parsedUrl.name,
      repoOwner: parsedUrl.owner,
      repoSource: parsedUrl.source,
      repoRootUrl: parsedUrl.toString('https').replace('.git', ''),
    };
    if (
      repoMetadata.repoSource === 'github.com' ||
      repoMetadata.repoSource === 'gitlab.com'
    ) {
      repoMetadata.repoCommitUrl = `${repoMetadata.repoRootUrl}/commit`;
    } else if (repoMetadata.repoSource === 'bitbucket.org') {
      repoMetadata.repoCommitUrl = `${repoMetadata.repoRootUrl}/commits`;
    }
    return repoMetadata;
  }

  static getHashesFromBlame(blame: Array<string>) {
    return uniq(
      blame.map(line => {
        return line.split(' ')[0];
      })
    );
  }

  static parseBlameLine(blameLine) {
    /*
                        Commit Hash     Original Line Number               Date                                            Timezone Offset                 Line
                              ^     File Path    ^       Author              ^                           Time                     ^          Line Number     ^
                              |         ^        |          ^                |                             ^                      |               ^          |
                              |         |        |          |                |                             |                      |               |          |
                         |---------|  |---|   |------|    |--|   |--------------------------|  |--------------------------|  |------------|   |--------|  |----|    */
    const blameRegex = /^([a-z0-9]+)\s(\S+)\s+([0-9]+)\s\((.+)\s+([0-9]{4}-[0-9]{2}-[0-9]{2})\s([0-9]{2}:[0-9]{2}:[0-9]{2})\s([+-][0-9]{4})\s+([0-9]+)\)\s(.+|$)/;
    const matched = blameLine.match(blameRegex);
    if (!matched) {
      throw new Error("Couldn't parse blame line");
    }
    return {
      commitHash: matched[1].trim(),
      filePath: matched[2].trim(),
      originalLineNumber: matched[3].trim(),
      lineNumber: matched[8].trim(),
      author: matched[4].trim(),
      commitedAt: new Date(
        `${matched[5].trim()} ${matched[6].trim()} ${matched[7].trim()}`
      ),
      line: matched[9],
    };
  }

  /**
   * getRepoRootPath() returns a git repo's root path based on a path to a file in the repo
   *
   * Note: this function doesn't validate the file path. Compose this function with `validateFilePath`
   * if needed.
   * It also expects that it's known a priori that this file is indeed in a git repo.
   *
   * Note: we originally used `git rev-parse --show-toplevel` but changed it to use `--show-cdup` with
   * some additional gymnastics because this doesn't resolve symlinks (which can lead to issues, see
   * https://github.com/Stepsize/layer_desktop/issues/92).
   *
   * @param   {String} filePath  Absolute path to a file in the git repo
   * @returns {String} Absolute path to the repo's root directory
   */
  static getRepoRootPath(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const fileDir = path.parse(filePath).dir;
      childProcess.exec(
        `cd ${fileDir} && echo $(cd $(git rev-parse --show-cdup) .; pwd)`,
        (error, stdout, stderr) => {
          if (error)
            reject(
              new Error(
                `getRepoRootPath(0) unexpected error with message: "${error.message}" & stack trace "${error.stack}"`
              )
            );
          else if (stderr)
            reject(new Error(`getRepoRootPath(1) unexpected error: ${stderr}`));
          resolve(stdout.trim());
        }
      );
    });
  }
}

export default GitHelper;
