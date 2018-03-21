'use babel';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import StepsizeHelper from '../stepsize/StepsizeHelper';
import * as GitData from './GitData';
import db from './database';
import GitHelper from '../git/GitHelper';
import * as IntegrationNotification from '../interface/IntegrationNotification';
let pendingRequests = {};
export function getIntegrationDataForFile(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        const repoPath = yield GitData.getRepoRootPath(filePath);
        const metadata = yield GitData.getRepoMetadata(repoPath);
        const blame = yield GitData.getBlameForFile(filePath);
        if (!pendingRequests[repoPath]) {
            pendingRequests[repoPath] = StepsizeHelper.fetchIntegrationData(metadata, GitHelper.getHashesFromBlame(blame.lines)).then(response => {
                return processIntegrationData(response);
            }).catch(e => console.info(e));
        }
        const response = yield pendingRequests[repoPath];
        delete pendingRequests[repoPath];
        return response;
    });
}
function processIntegrationData(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const issues = data.issues;
        db
            .get('issues')
            .merge(issues)
            .uniqBy('key')
            .write();
        const pullRequests = data.pullRequests;
        pullRequestsCommitsPivot(pullRequests);
        for (const pullRequestIdx of Object.keys(pullRequests)) {
            const pullRequest = pullRequests[pullRequestIdx];
            const existingPullRequest = db
                .get('pullRequests')
                .find({ number: pullRequest.number })
                .value();
            if (existingPullRequest) {
                continue;
            }
            const toWrite = Object.assign({}, pullRequest);
            toWrite.commitCount = toWrite.commits.length;
            toWrite.relatedIssueKeys = data.pullRequestToIssues[pullRequestIdx].map(idx => issues[idx].key);
            db
                .get('pullRequests')
                .push(toWrite)
                .write();
        }
        for (const commit of data.commits) {
            GitData.updateCommit(commit.commitHash, { buildStatus: commit.buildStatus });
        }
        IntegrationNotification.checkIntegrationDataRetrieved(pullRequests, issues);
        return db.get('pullRequests').value();
    });
}
function pullRequestsCommitsPivot(pullRequests) {
    const pivot = !pullRequests ? {} : pullRequests.reduce((acc, pullRequest) => {
        acc[pullRequest.number] = pullRequest.commits.map(commit => commit.commitHash);
        return acc;
    }, {});
    db
        .get('pullRequestsCommitsPivot')
        .merge(pivot)
        .uniq()
        .write();
    return db.get('pullRequestsCommitsPivot').value();
}
export function getPullRequestsForCommit(filePath, commitHash) {
    return __awaiter(this, void 0, void 0, function* () {
        if (pendingRequests[filePath]) {
            yield pendingRequests[filePath];
        }
        const results = db
            .get('pullRequestsCommitsPivot')
            .reduce((acc, hashes, prNumber) => {
            if (hashes.includes(commitHash)) {
                acc.push(prNumber);
            }
            return acc;
        }, [])
            .value();
        return results.map(number => {
            return db
                .get('pullRequests')
                .find({ number: parseInt(number) })
                .value();
        });
    });
}
export function getCommitsForPullRequest(filePath, pullRequestNumber) {
    return __awaiter(this, void 0, void 0, function* () {
        if (pendingRequests[filePath]) {
            yield pendingRequests[filePath];
        }
        return db
            .get('pullRequestsCommitsPivot')
            .get(pullRequestNumber)
            .value();
    });
}
export function getIssue(filePath, issueKey) {
    return __awaiter(this, void 0, void 0, function* () {
        if (pendingRequests[filePath]) {
            yield pendingRequests[filePath];
        }
        return db
            .get('issues')
            .find({ key: issueKey })
            .value();
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW50ZWdyYXRpb25EYXRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vbGliL2RhdGEvSW50ZWdyYXRpb25EYXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQzs7Ozs7Ozs7O0FBRVosT0FBTyxjQUFjLE1BQU0sNEJBQTRCLENBQUM7QUFDeEQsT0FBTyxLQUFLLE9BQU8sTUFBTSxXQUFXLENBQUM7QUFDckMsT0FBTyxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBRTVCLE9BQU8sU0FBUyxNQUFNLGtCQUFrQixDQUFDO0FBQ3pDLE9BQU8sS0FBSyx1QkFBdUIsTUFBTSxzQ0FBc0MsQ0FBQztBQUVoRixJQUFJLGVBQWUsR0FBRyxFQUFFLENBQUM7QUFFekIsTUFBTSxvQ0FBMEMsUUFBZ0I7O1FBQzlELE1BQU0sUUFBUSxHQUFHLE1BQU0sT0FBTyxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN6RCxNQUFNLFFBQVEsR0FBRyxNQUFNLE9BQU8sQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDekQsTUFBTSxLQUFLLEdBQUcsTUFBTSxPQUFPLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3RELEVBQUUsQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMvQixlQUFlLENBQUMsUUFBUSxDQUFDLEdBQUcsY0FBYyxDQUFDLG9CQUFvQixDQUM3RCxRQUFRLEVBQ1IsU0FBUyxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FDMUMsQ0FBQyxJQUFJLENBQUMsUUFBUTtnQkFDYixNQUFNLENBQUMsc0JBQXNCLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDMUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDakMsQ0FBQztRQUNELE1BQU0s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QUFDLENBQUMsQ0FBQztZQUM5QixNQUFNLGVBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNsQyxDQUFDO1FBQ0QsTUFBTSxDQUFDLEVBQUU7YUFDTixHQUFHLENBQUMsUUFBUSxDQUFDO2FBQ2IsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxDQUFDO2FBQ3ZCLEtBQUssRUFBRSxDQUFDO0lBQ2IsQ0FBQztDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCBTdGVwc2l6ZUhlbHBlciBmcm9tICcuLi9zdGVwc2l6ZS9TdGVwc2l6ZUhlbHBlcic7XG5pbXBvcnQgKiBhcyBHaXREYXRhIGZyb20gJy4vR2l0RGF0YSc7XG5pbXBvcnQgZGIgZnJvbSAnLi9kYXRhYmFzZSc7XG5pbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IEdpdEhlbHBlciBmcm9tICcuLi9naXQvR2l0SGVscGVyJztcbmltcG9ydCAqIGFzIEludGVncmF0aW9uTm90aWZpY2F0aW9uIGZyb20gJy4uL2ludGVyZmFjZS9JbnRlZ3JhdGlvbk5vdGlmaWNhdGlvbic7XG5cbmxldCBwZW5kaW5nUmVxdWVzdHMgPSB7fTtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEludGVncmF0aW9uRGF0YUZvckZpbGUoZmlsZVBhdGg6IHN0cmluZykge1xuICBjb25zdCByZXBvUGF0aCA9IGF3YWl0IEdpdERhdGEuZ2V0UmVwb1Jvb3RQYXRoKGZpbGVQYXRoKTtcbiAgY29uc3QgbWV0YWRhdGEgPSBhd2FpdCBHaXREYXRhLmdldFJlcG9NZXRhZGF0YShyZXBvUGF0aCk7XG4gIGNvbnN0IGJsYW1lID0gYXdhaXQgR2l0RGF0YS5nZXRCbGFtZUZvckZpbGUoZmlsZVBhdGgpO1xuICBpZiAoIXBlbmRpbmdSZXF1ZXN0c1tyZXBvUGF0aF0pIHtcbiAgICBwZW5kaW5nUmVxdWVzdHNbcmVwb1BhdGhdID0gU3RlcHNpemVIZWxwZXIuZmV0Y2hJbnRlZ3JhdGlvbkRhdGEoXG4gICAgICBtZXRhZGF0YSxcbiAgICAgIEdpdEhlbHBlci5nZXRIYXNoZXNGcm9tQmxhbWUoYmxhbWUubGluZXMpXG4gICAgKS50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgIHJldHVybiBwcm9jZXNzSW50ZWdyYXRpb25EYXRhKHJlc3BvbnNlKTtcbiAgICB9KS5jYXRjaChlID0+IGNvbnNvbGUuaW5mbyhlKSk7XG4gIH1cbiAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBwZW5kaW5nUmVxdWVzdHNbcmVwb1BhdGhdO1xuICBkZWxldGUgcGVuZGluZ1JlcXVlc3RzW3JlcG9QYXRoXTtcbiAgcmV0dXJuIHJlc3BvbnNlO1xufVxuXG5hc3luYyBmdW5jdGlvbiBwcm9jZXNzSW50ZWdyYXRpb25EYXRhKGRhdGEpIHtcbiAgY29uc3QgaXNzdWVzID0gZGF0YS5pc3N1ZXM7XG4gIGRiXG4gICAgLmdldCgnaXNzdWVzJylcbiAgICAubWVyZ2UoaXNzdWVzKVxuICAgIC51bmlxQnkoJ2tleScpXG4gICAgLndyaXRlKCk7XG4gIGNvbnN0IHB1bGxSZXF1ZXN0cyA9IGRhdGEucHVsbFJlcXVlc3RzO1xuICBwdWxsUmVxdWVzdHNDb21taXRzUGl2b3QocHVsbFJlcXVlc3RzKTtcbiAgZm9yIChjb25zdCBwdWxsUmVxdWVzdElkeCBvZiBPYmplY3Qua2V5cyhwdWxsUmVxdWVzdHMpKSB7XG4gICAgY29uc3QgcHVsbFJlcXVlc3QgPSBwdWxsUmVxdWVzdHNbcHVsbFJlcXVlc3RJZHhdO1xuICAgIGNvbnN0IGV4aXN0aW5nUHVsbFJlcXVlc3QgPSBkYlxuICAgICAgLmdldCgncHVsbFJlcXVlc3RzJylcbiAgICAgIC5maW5kKHsgbnVtYmVyOiBwdWxsUmVxdWVzdC5udW1iZXIgfSlcbiAgICAgIC52YWx1ZSgpO1xuICAgIGlmIChleGlzdGluZ1B1bGxSZXF1ZXN0KSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgY29uc3QgdG9Xcml0ZSA9IHsgLi4ucHVsbFJlcXVlc3QgfTtcbiAgICB0b1dyaXRlLmNvbW1pdENvdW50ID0gdG9Xcml0ZS5jb21taXRzLmxlbmd0aDtcbiAgICB0b1dyaXRlLnJlbGF0ZWRJc3N1ZUtleXMgPSBkYXRhLnB1bGxSZXF1ZXN0VG9Jc3N1ZXNbcHVsbFJlcXVlc3RJZHhdLm1hcChpZHggPT4gaXNzdWVzW2lkeF0ua2V5KTtcbiAgICBkYlxuICAgICAgLmdldCgncHVsbFJlcXVlc3RzJylcbiAgICAgIC5wdXNoKHRvV3JpdGUpXG4gICAgICAud3JpdGUoKTtcbiAgfVxuICBmb3IgKGNvbnN0IGNvbW1pdCBvZiBkYXRhLmNvbW1pdHMpIHtcbiAgICBHaXREYXRhLnVwZGF0ZUNvbW1pdChjb21taXQuY29tbWl0SGFzaCwgeyBidWlsZFN0YXR1czogY29tbWl0LmJ1aWxkU3RhdHVzIH0pO1xuICB9XG4gIEludGVncmF0aW9uTm90aWZpY2F0aW9uLmNoZWNrSW50ZWdyYXRpb25EYXRhUmV0cmlldmVkKHB1bGxSZXF1ZXN0cywgaXNzdWVzKTtcbiAgcmV0dXJuIGRiLmdldCgncHVsbFJlcXVlc3RzJykudmFsdWUoKTtcbn1cblxuZnVuY3Rpb24gcHVsbFJlcXVlc3RzQ29tbWl0c1Bpdm90KHB1bGxSZXF1ZXN0cykge1xuICBjb25zdCBwaXZvdCA9ICFwdWxsUmVxdWVzdHMgPyB7fSA6IHB1bGxSZXF1ZXN0cy5yZWR1Y2UoKGFjYywgcHVsbFJlcXVlc3QpID0+IHtcbiAgICBhY2NbcHVsbFJlcXVlc3QubnVtYmVyXSA9IHB1bGxSZXF1ZXN0LmNvbW1pdHMubWFwKGNvbW1pdCA9PiBjb21taXQuY29tbWl0SGFzaCk7XG4gICAgcmV0dXJuIGFjYztcbiAgfSwge30pO1xuICBkYlxuICAgIC5nZXQoJ3B1bGxSZXF1ZXN0c0NvbW1pdHNQaXZvdCcpXG4gICAgLm1lcmdlKHBpdm90KVxuICAgIC51bmlxKClcbiAgICAud3JpdGUoKTtcbiAgcmV0dXJuIGRiLmdldCgncHVsbFJlcXVlc3RzQ29tbWl0c1Bpdm90JykudmFsdWUoKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFB1bGxSZXF1ZXN0c0ZvckNvbW1pdChmaWxlUGF0aDogc3RyaW5nLCBjb21taXRIYXNoOiBzdHJpbmcpIHtcbiAgaWYgKHBlbmRpbmdSZXF1ZXN0c1tmaWxlUGF0aF0pIHtcbiAgICBhd2FpdCBwZW5kaW5nUmVxdWVzdHNbZmlsZVBhdGhdO1xuICB9XG4gIGNvbnN0IHJlc3VsdHMgPSBkYlxuICAgIC5nZXQoJ3B1bGxSZXF1ZXN0c0NvbW1pdHNQaXZvdCcpXG4gICAgLnJlZHVjZSgoYWNjLCBoYXNoZXMsIHByTnVtYmVyKSA9PiB7XG4gICAgICBpZiAoaGFzaGVzLmluY2x1ZGVzKGNvbW1pdEhhc2gpKSB7XG4gICAgICAgIGFjYy5wdXNoKHByTnVtYmVyKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBhY2M7XG4gICAgfSwgW10pXG4gICAgLnZhbHVlKCk7XG4gIHJldHVybiByZXN1bHRzLm1hcChudW1iZXIgPT4ge1xuICAgIHJldHVybiBkYlxuICAgICAgLmdldCgncHVsbFJlcXVlc3RzJylcbiAgICAgIC5maW5kKHsgbnVtYmVyOiBwYXJzZUludChudW1iZXIpIH0pXG4gICAgICAudmFsdWUoKTtcbiAgfSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRDb21taXRzRm9yUHVsbFJlcXVlc3QoXG4gIGZpbGVQYXRoOiBzdHJpbmcsXG4gIHB1bGxSZXF1ZXN0TnVtYmVyOiBzdHJpbmcgfCBudW1iZXJcbikge1xuICBpZiAocGVuZGluZ1JlcXVlc3RzW2ZpbGVQYXRoXSkge1xuICAgIGF3YWl0IHBlbmRpbmdSZXF1ZXN0c1tmaWxlUGF0aF07XG4gIH1cbiAgcmV0dXJuIGRiXG4gICAgLmdldCgncHVsbFJlcXVlc3RzQ29tbWl0c1Bpdm90JylcbiAgICAuZ2V0KHB1bGxSZXF1ZXN0TnVtYmVyKVxuICAgIC52YWx1ZSgpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0SXNzdWUoZmlsZVBhdGg6IHN0cmluZywgaXNzdWVLZXk6IHN0cmluZyB8IG51bWJlcikge1xuICBpZiAocGVuZGluZ1JlcXVlc3RzW2ZpbGVQYXRoXSkge1xuICAgIGF3YWl0IHBlbmRpbmdSZXF1ZXN0c1tmaWxlUGF0aF07XG4gIH1cbiAgcmV0dXJuIGRiXG4gICAgLmdldCgnaXNzdWVzJylcbiAgICAuZmluZCh7IGtleTogaXNzdWVLZXkgfSlcbiAgICAudmFsdWUoKTtcbn1cbiJdfQ==