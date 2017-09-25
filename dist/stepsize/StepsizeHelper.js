'use babel';
import * as uuid from 'uuid';
import * as https from 'https';
import childProcess from 'child_process';
class StepsizeHelper {
    static rangesToSelectedLineNumbers(ranges) {
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
    static async fetchIntegrationData(repoMetadata, commitHashes) {
        const payload = {
            searchId: uuid.v4(),
            repoName: repoMetadata.repoName,
            repoOwner: repoMetadata.repoOwner,
            repoSource: repoMetadata.repoSource,
            commitHashes,
        };
        return new Promise((resolve, reject) => {
            let responseData = '';
            const req = https.request({
                hostname: 'production-layer.stepsize.com',
                path: '/augment-code-search-results',
                method: 'POST',
                headers: {
                    'User-Agent': 'Layer-Client',
                    'Content-Type': 'application/json',
                },
            }, function (response) {
                let code = response.statusCode;
                response.on('data', function (chunk) {
                    responseData += chunk;
                });
                response.on('end', function () {
                    if (code < 400) {
                        resolve(JSON.parse(responseData));
                    }
                    else {
                        reject(responseData);
                    }
                });
            });
            req.on('error', function (error) {
                reject(error.message);
            });
            req.write(JSON.stringify(payload));
            req.end();
        });
    }
    static checkLayerInstallation() {
        return new Promise((resolve, reject) => {
            childProcess.exec("ls | grep 'Layer.app'", { cwd: '/Applications' }, err => {
                if (err) {
                    return reject(new Error('Could not detect Layer installation'));
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
    static getStatusObject(pullRequest) {
        const pr = pullRequest;
        if (pr.potentialMergeCommit && pr.potentialMergeCommit.status !== null) {
            return pr.potentialMergeCommit.status;
        }
        else if (pr.state === 'MERGED' && pr.commits.length > 0) {
            if (pr.commits.length > 1) {
                return pr.commits[1].status;
            }
            // In some circumstances, a PR can be merged and have a single commit (the merge commit is absent).
            // See issue #31 for more details on when that happens.
            return pr.commits[0].status;
        }
        else if (pr.commits.length > 0) {
            return pr.commits[0].status;
        }
        return { state: 'UNKNOWN' };
    }
}
export default StepsizeHelper;
