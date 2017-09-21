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
                hostname: 'development-stable-layer.stepsize.com',
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RlcHNpemVIZWxwZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9saWIvc3RlcHNpemUvU3RlcHNpemVIZWxwZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFDO0FBRVosT0FBTyxLQUFLLElBQUksTUFBTSxNQUFNLENBQUM7QUFDN0IsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUM7QUFDL0IsT0FBTyxZQUFZLE1BQU0sZUFBZSxDQUFDO0FBR3pDO0lBQ1MsTUFBTSxDQUFDLDJCQUEyQixDQUFDLE1BQXFCO1FBQzdELEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDWCxNQUFNLENBQUMsTUFBTTtpQkFDVixHQUFHLENBQUMsS0FBSztnQkFDUixJQUFJLE9BQU8sR0FBRyxFQUFFLENBQUM7Z0JBQ2pCLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO29CQUMzRCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDdEIsQ0FBQztnQkFDRCxNQUFNLENBQUMsT0FBTyxDQUFDO1lBQ2pCLENBQUMsQ0FBQztpQkFDRCxNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRztnQkFDZixNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN6QixDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDWCxDQUFDO1FBQ0QsTUFBTSxDQUFDLEVBQUUsQ0FBQztJQUNaLENBQUM7SUFFTSxNQUFNLENBQUMsS0FBSyxDQUFDLG9CQUFvQixDQUN0QyxZQUFZLEVBQ1osWUFBWTtRQUVaLE1BQU0sT0FBTyxHQUFHO1lBQ2QsUUFBUSxFQUFFLElB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QixNQUFNLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7WUFDOUIsQ0FBQztZQUNELG1HQUFtRztZQUNuRyx1REFBdUQ7WUFDdkQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO1FBQzlCLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNqQyxNQUFNLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7UUFDOUIsQ0FBQztRQUNELE1BQU0sQ0FBQyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsQ0FBQztJQUM5QixDQUFDO0NBQ0Y7QUFFRCxlQUFlLGNBQWMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgKiBhcyB1dWlkIGZyb20gJ3V1aWQnO1xuaW1wb3J0ICogYXMgaHR0cHMgZnJvbSAnaHR0cHMnO1xuaW1wb3J0IGNoaWxkUHJvY2VzcyBmcm9tICdjaGlsZF9wcm9jZXNzJztcbmltcG9ydCBJUmFuZ2UgPSBUZXh0QnVmZmVyLklSYW5nZTtcblxuY2xhc3MgU3RlcHNpemVIZWxwZXIge1xuICBwdWJsaWMgc3RhdGljIHJhbmdlc1RvU2VsZWN0ZWRMaW5lTnVtYmVycyhyYW5nZXM6IEFycmF5PElSYW5nZT4pIHtcbiAgICBpZiAocmFuZ2VzKSB7XG4gICAgICByZXR1cm4gcmFuZ2VzXG4gICAgICAgIC5tYXAocmFuZ2UgPT4ge1xuICAgICAgICAgIGxldCBudW1iZXJzID0gW107XG4gICAgICAgICAgZm9yIChsZXQgaSA9IHJhbmdlLnN0YXJ0LnJvdzsgaSA8IHJhbmdlLmVuZC5yb3c7IGkgPSBpICsgMSkge1xuICAgICAgICAgICAgbnVtYmVycy5wdXNoKGkgKyAxKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIG51bWJlcnM7XG4gICAgICAgIH0pXG4gICAgICAgIC5yZWR1Y2UoKGFjYywgdmFsKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIGFjYy5jb25jYXQodmFsKTtcbiAgICAgICAgfSwgW10pO1xuICAgIH1cbiAgICByZXR1cm4gW107XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGFzeW5jIGZldGNoSW50ZWdyYXRpb25EYXRhKFxuICAgIHJlcG9NZXRhZGF0YSxcbiAgICBjb21taXRIYXNoZXNcbiAgKTogUHJvbWlzZTxhbnk+IHtcbiAgICBjb25zdCBwYXlsb2FkID0ge1xuICAgICAgc2VhcmNoSWQ6IHV1aWQudjQoKSxcbiAgICAgIHJlcG9OYW1lOiByZXBvTWV0YWRhdGEucmVwb05hbWUsXG4gICAgICByZXBvT3duZXI6IHJlcG9NZXRhZGF0YS5yZXBvT3duZXIsXG4gICAgICByZXBvU291cmNlOiByZXBvTWV0YWRhdGEucmVwb1NvdXJjZSxcbiAgICAgIGNvbW1pdEhhc2hlcyxcbiAgICB9O1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBsZXQgcmVzcG9uc2VEYXRhID0gJyc7XG4gICAgICBjb25zdCByZXEgPSBodHRwcy5yZXF1ZXN0KFxuICAgICAgICB7XG4gICAgICAgICAgaG9zdG5hbWU6ICdkZXZlbG9wbWVudC1zdGFibGUtbGF5ZXIuc3RlcHNpemUuY29tJyxcbiAgICAgICAgICBwYXRoOiAnL2F1Z21lbnQtY29kZS1zZWFyY2gtcmVzdWx0cycsXG4gICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgJ1VzZXItQWdlbnQnOiAnTGF5ZXItQ2xpZW50JyxcbiAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICBsZXQgY29kZSA9IHJlc3BvbnNlLnN0YXR1c0NvZGU7XG4gICAgICAgICAgcmVzcG9uc2Uub24oJ2RhdGEnLCBmdW5jdGlvbihjaHVuaykge1xuICAgICAgICAgICAgcmVzcG9uc2VEYXRhICs9IGNodW5rO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJlc3BvbnNlLm9uKCdlbmQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmIChjb2RlIDwgNDAwKSB7XG4gICAgICAgICAgICAgIHJlc29sdmUoSlNPTi5wYXJzZShyZXNwb25zZURhdGEpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJlamVjdChyZXNwb25zZURhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICApO1xuICAgICAgcmVxLm9uKCdlcnJvcicsIGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgIHJlamVjdChlcnJvci5tZXNzYWdlKTtcbiAgICAgIH0pO1xuICAgICAgcmVxLndyaXRlKEpTT04uc3RyaW5naWZ5KHBheWxvYWQpKTtcbiAgICAgIHJlcS5lbmQoKTtcbiAgICB9KTtcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgY2hlY2tMYXllckluc3RhbGxhdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY2hpbGRQcm9jZXNzLmV4ZWMoXG4gICAgICAgIFwibHMgfCBncmVwICdMYXllci5hcHAnXCIsXG4gICAgICAgIHsgY3dkOiAnL0FwcGxpY2F0aW9ucycgfSxcbiAgICAgICAgZXJyID0+IHtcbiAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KG5ldyBFcnJvcignQ291bGQgbm90IGRldGVjdCBMYXllciBpbnN0YWxsYXRpb24nKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfVxuICAgICAgKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIGZ1bmN0aW9uIHJldHJpZXZlcyB0aGUgc3RhdHVzIG9iamVjdCB0aGF0IHdpbGwgYmUgdXNlZCB0byBkaXNwbGF5IHRoZSBidWlsZCBzdGF0dXMgb2YgdGhlIFBSLlxuICAgKiBXZSBmb2xsb3cgR2l0SHViJ3MgYmVoYXZpb3VyIGFuZCB1c2UgdGhlIHBvdGVudGlhbE1lcmdlQ29tbWl0J3Mgc3RhdHVzIHdoZW4gaXQgZXhpc3RzIChpdCBpcyBhIHNldHRpbmdcbiAgICogdGhhdCBjYW4gYmUgYWN0aXZhdGVkKS4gT3RoZXJ3aXNlLCB3ZSB1c2UgdGhlIHN0YXR1cyBvZiB0aGUgbW9zdCByZWNlbnQgY29tbWl0IG9uIHRoZSBQUi5cbiAgICpcbiAgICogRm9yIGEgbWVyZ2VkIFBSLCB0aGlzIG1vc3QgcmVjZW50IGNvbW1pdCBpcyB0aGUgc2Vjb25kIGVudHJ5IGluIHRoZSBQUidzIGNvbW1pdHMgYXJyYXkgKHRoZSBmaXJzdCBjb21taXRcbiAgICogaW4gdGhlIGFycmF5IGlzIHRoZSBtZXJnZSBjb21taXQpLlxuICAgKlxuICAgKiBGb3Igbm9uLW1lcmdlZCBQUnMsIHRoZSBsYXRlc3QgY29tbWl0IHdpbGwgYmUgdGhlIGZpcnN0IGVudHJ5IGluIHRoZSBjb21taXRzIGFycmF5LlxuICAgKlxuICAgKiBAcmV0dXJucyB7SVN0YXR1c30gIEJ1aWxkIHN0YXR1cyBmb3IgdGhlIFBSXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGdldFN0YXR1c09iamVjdChwdWxsUmVxdWVzdCkge1xuICAgIGNvbnN0IHByID0gcHVsbFJlcXVlc3Q7XG4gICAgaWYgKHByLnBvdGVudGlhbE1lcmdlQ29tbWl0ICYmIHByLnBvdGVudGlhbE1lcmdlQ29tbWl0LnN0YXR1cyAhPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHByLnBvdGVudGlhbE1lcmdlQ29tbWl0LnN0YXR1cztcbiAgICB9IGVsc2UgaWYgKHByLnN0YXRlID09PSAnTUVSR0VEJyAmJiBwci5jb21taXRzLmxlbmd0aCA+IDApIHtcbiAgICAgIGlmIChwci5jb21taXRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgcmV0dXJuIHByLmNvbW1pdHNbMV0uc3RhdHVzO1xuICAgICAgfVxuICAgICAgLy8gSW4gc29tZSBjaXJjdW1zdGFuY2VzLCBhIFBSIGNhbiBiZSBtZXJnZWQgYW5kIGhhdmUgYSBzaW5nbGUgY29tbWl0ICh0aGUgbWVyZ2UgY29tbWl0IGlzIGFic2VudCkuXG4gICAgICAvLyBTZWUgaXNzdWUgIzMxIGZvciBtb3JlIGRldGFpbHMgb24gd2hlbiB0aGF0IGhhcHBlbnMuXG4gICAgICByZXR1cm4gcHIuY29tbWl0c1swXS5zdGF0dXM7XG4gICAgfSBlbHNlIGlmIChwci5jb21taXRzLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiBwci5jb21taXRzWzBdLnN0YXR1cztcbiAgICB9XG4gICAgcmV0dXJuIHsgc3RhdGU6ICdVTktOT1dOJyB9O1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFN0ZXBzaXplSGVscGVyO1xuIl19