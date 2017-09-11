import StepsizeHelper from './StepsizeHelper';
import GitHelper from './GitHelper';

const dataCache = {};

async function getRepoMetadata() {
  let remotes = await GitHelper.getRepoRemotes(this.editor.getPath());
  return GitHelper.extractRepoMetadataFromRemotes(remotes);
}

export async function getIntegrationData(blame) {
  const response = await StepsizeHelper.fetchIntegrationData(
    await getRepoMetadata(),
    GitHelper.getHashesFromBlame(blame)
  );
  return response;
}

export function getPrForCommit(commitHash) {
  if (this.pullRequests) {
    const searchArray = transformedPullRequestArray();
    const found = _.find(searchArray, obj => obj.hashes.includes(commitHash));
    if (found) {
      return this.pullRequests[found.number];
    }
  }
  return null;
}

function transformedPullRequestArray() {
  return _.reduce(
    this.pullRequests,
    (acc: Array<{ number: number; hashes: string[] }>, pullRequest, key) => {
      acc.push({
        number: key,
        hashes: _.map(pullRequest.commits, 'commitHash'),
      });
      return acc;
    },
    []
  );
}
