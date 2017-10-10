'use babel';

import uuid from 'uuid-v4';
import * as https from 'https';
import * as childProcess from 'child_process';
import IRange = TextBuffer.IRange;

class StepsizeHelper {
  public static rangesToSelectedLineNumbers(ranges: Array<IRange>) {
    if (ranges) {
      return ranges
        .map(range => {
          let numbers = [];
          for (let i = range.start.row; i < range.end.row; i = i + 1) {
            numbers.push(i + 1);
          }
          return numbers;
        })
        .reduce((acc, val) => {
          return acc.concat(val);
        }, []);
    }
    return [];
  }

  public static async fetchIntegrationData(repoMetadata, commitHashes): Promise<any> {
    const payload = {
      searchId: uuid(),
      repoName: repoMetadata.repoName,
      repoOwner: repoMetadata.repoOwner,
      repoSource: repoMetadata.repoSource,
      commitHashes,
    };
    return new Promise((resolve, reject) => {
      let responseData = '';
      const req = https.request(
        {
          hostname: 'production-layer.stepsize.com',
          path: '/augment-code-search-results',
          method: 'POST',
          headers: {
            'User-Agent': 'Better-Git-Blame-Atom',
            'Content-Type': 'application/json',
          },
        },
        function(response) {
          let code = response.statusCode;
          response.on('data', function(chunk) {
            responseData += chunk;
          });
          response.on('end', function() {
            if (code < 400) {
              resolve(JSON.parse(responseData));
            } else {
              reject(responseData);
            }
          });
        }
      );
      req.on('error', function(error) {
        reject(error.message);
      });
      req.write(JSON.stringify(payload));
      req.end();
    });
  }

  public static checkLayerInstallation(): Promise<void> {
    return new Promise((resolve, reject) => {
      childProcess.exec("ls | grep 'Layer.app'", { cwd: '/Applications' }, err => {
        if (err) {
          return reject(new Error('Could not detect Layer installation'));
        }
        resolve();
      });
    });
  }

  public static checkLayerRunning(): Promise<void> {
    return new Promise((resolve, reject) => {
      childProcess.exec('pgrep Layer', { cwd: '/' }, err => {
        if (err) {
          return reject(new Error("No process with name 'Layer' is running"));
        }
        resolve();
      });
    });
  }

  /**
   * This function retrieves the status object that will be used to display the build status of the PR.
   * We follow GitHub's behaviour and use the potentialMergeCommit's status when it exists (it is a setting
   * that can be activated). Otherwise, we use the status of the most recent commit on the PR.
   *
   * For a merged PR, this most recent commit is the second entry in the PR's commits array (the first commit
   * in the array is the merge commit).
   *
   * For non-merged PRs, the latest commit will be the first entry in the commits array.
   *
   * @returns {IStatus}  Build status for the PR
   */
  public static getStatusObject(pullRequest) {
    const pr = pullRequest;
    if (pr.potentialMergeCommit && pr.potentialMergeCommit.status !== null) {
      return pr.potentialMergeCommit.status;
    } else if (pr.state === 'MERGED' && pr.commits.length > 0) {
      if (pr.commits.length > 1) {
        return pr.commits[1].status;
      }
      // In some circumstances, a PR can be merged and have a single commit (the merge commit is absent).
      // See issue #31 for more details on when that happens.
      return pr.commits[0].status;
    } else if (pr.commits.length > 0) {
      return pr.commits[0].status;
    }
    return { state: 'UNKNOWN' };
  }
}

export default StepsizeHelper;
