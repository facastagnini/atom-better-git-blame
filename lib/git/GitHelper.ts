'use babel';

import _ from 'lodash';
import GitUrlParse from 'git-url-parse';

class GitHelper {
  /**
   * extractRepoMetadataFromRemotes() gets some details about the repo from the remote URLs.
   * Specifically, we get the repo's origin (i.e. code hosting service), its name, its owner, and its
   * root & commit URLs. These details are used later to augment commit-level code search results with
   * data from code hosting & project management integrations.
   *
   * @param   {Array<any>} remotes  Array of remote URLs of the form { url, name, type }
   * @returns {Object}     Object containing the extract repo metadata
   */
  static extractRepoMetadataFromRemotes(remotes: Array<any>): { [prop: string]: any } {
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
    if (repoMetadata.repoSource === 'github.com' || repoMetadata.repoSource === 'gitlab.com') {
      repoMetadata.repoCommitUrl = `${repoMetadata.repoRootUrl}/commit`;
    } else if (repoMetadata.repoSource === 'bitbucket.org') {
      repoMetadata.repoCommitUrl = `${repoMetadata.repoRootUrl}/commits`;
    }
    return repoMetadata;
  }

  static getHashesFromBlame(blame: Array<string>) {
    return _.uniq(
      blame.map(line => {
        return line.split(' ')[0];
      })
    );
  }

  static parseBlameLine(blameLine) {
    /*
                        Commit Hash     Original Line Number               Date                                            Timezone Offset               Line
                              ^     File Path    ^       Author              ^                           Time                     ^          Line Number   ^
                              |         ^        |          ^                |                             ^                      |               ^        |
                              |         |        |          |                |                             |                      |               |        |
                         |---------|  |---|   |------|    |--|   |--------------------------|  |--------------------------|  |------------|   |--------||----|  */
    const blameRegex = /^([a-z0-9]+)\s(\S+)\s+([0-9]+)\s\((.+)\s+([0-9]{4}-[0-9]{2}-[0-9]{2})\s([0-9]{2}:[0-9]{2}:[0-9]{2})\s([+-][0-9]{4})\s+([0-9]+)\)(.+|$)/;
    const matched = blameLine.match(blameRegex);
    if (!matched) {
      console.log(blameLine);
      throw new Error("Couldn't parse blame line");
    }
    return {
      commitHash: matched[1].trim(),
      filePath: matched[2].trim(),
      originalLineNumber: matched[3].trim(),
      lineNumber: matched[8].trim(),
      author: matched[4].trim(),
      commitedAt: new Date(`${matched[5].trim()} ${matched[6].trim()} ${matched[7].trim()}`),
      line: matched[9],
    };
  }
}

export default GitHelper;
