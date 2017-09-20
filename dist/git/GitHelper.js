'use babel';
import { uniq } from 'lodash';
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
    static extractRepoMetadataFromRemotes(remotes) {
        if (!Array.isArray(remotes) || remotes.length === 0)
            return {};
        let parsedUrl;
        try {
            parsedUrl = GitUrlParse(remotes[0].url);
        }
        catch (error) {
            return {};
        }
        const repoMetadata = {
            repoName: parsedUrl.name,
            repoOwner: parsedUrl.owner,
            repoSource: parsedUrl.source,
            repoRootUrl: parsedUrl.toString('https').replace('.git', ''),
        };
        if (repoMetadata.repoSource === 'github.com' ||
            repoMetadata.repoSource === 'gitlab.com') {
            repoMetadata.repoCommitUrl = `${repoMetadata.repoRootUrl}/commit`;
        }
        else if (repoMetadata.repoSource === 'bitbucket.org') {
            repoMetadata.repoCommitUrl = `${repoMetadata.repoRootUrl}/commits`;
        }
        return repoMetadata;
    }
    static getHashesFromBlame(blame) {
        return uniq(blame.map(line => {
            return line.split(' ')[0];
        }));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2l0SGVscGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vbGliL2dpdC9HaXRIZWxwZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFDO0FBRVosT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLFFBQVEsQ0FBQztBQUM5QixPQUFPLFdBQVcsTUFBTSxlQUFlLENBQUM7QUFFeEM7SUFDRTs7Ozs7Ozs7T0FRRztJQUNILE1BQU0sQ0FBQyw4QkFBOEIsQ0FDbkMsT0FBbUI7UUFFbkIsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDO1lBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztRQUMvRCxJQUFJLFNBQVMsQ0FBQztRQUNkLElBQUksQ0FBQztZQUNILFNBQVMsR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzFDLENBQUM7UUFBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ2YsTUFBTSxDQUFDLEVBQUUsQ0FBQztRQUNaLENBQUM7UUFDRCxNQUFNLFlBQVksR0FBNEI7WUFDNUMsUUFBUSxFQUFFLFNBQVMsQ0FBQyxJQUFJO1lBQ3hCLFNBQVMsRUFBRSxTQUFTLENBQUMsS0FBSztZQUMxQixVQUFVLEVBQUUsU0FBUyxDQUFDLE1BQU07WUFDNUIsV0FBVyxFQUFFLFNBQVMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUM7U0FDN0QsQ0FBQztRQUNGLEVBQUUsQ0FBQyxDQUNELFlBQVksQ0FBQyxVQUFVLEtBQUssWUFBWTtZQUN4QyxZQUFZLENBQUMsVUFBVSxLQUFLLFlBQzlCLENBQUMsQ0FBQyxDQUFDO1lBQ0QsWUFBWSxDQUFDLGFBQWEsR0FBRyxHQUFHLFlBQVksQ0FBQyxXQUFXLFNBQVMsQ0FBQztRQUNwRSxDQUFDO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxVQUFVLEtBQUssZUFBZSxDQUFDLENBQUMsQ0FBQztZQUN2RCxZQUFZLENBQUMsYUFBYSxHQUFHLEdBQUcsWUFBWSxDQUFDLFdBQVcsVUFBVSxDQUFDO1FBQ3JFLENBQUM7UUFDRCxNQUFNLENBQUMsWUFBWSxDQUFDO0lBQ3RCLENBQUM7SUFFRCxNQUFNLENBQUMsa0JBQWtCLENBQUMsS0FBb0I7UUFDNUMsTUFBTSxDQUFDLElBQUksQ0FDVCxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUk7WUFDWixNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1QixDQUFDLENBQUMsQ0FDSCxDQUFDO0lBQ0osQ0FBQztJQUVELE1BQU0sQ0FBQyxjQUFjLENBQUMsU0FBUztRQUM3Qjs7Ozs7c0tBSzhKO1FBQzlKLE1BQU0sVUFBVSxHQUFHLHdJQUF3SSxDQUFDO1FBQzVKLE1BQU0sT0FBTyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDNUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ2IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN2QixNQUFNLElBQUksS0FBSyxDQUFDLDJCQUEyQixDQUFDLENBQUM7UUFDL0MsQ0FBQztRQUNELE1BQU0sQ0FBQztZQUNMLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFO1lBQzdCLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFO1lBQzNCLGtCQUFrQixFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUU7WUFDckMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUU7WUFDN0IsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUU7WUFDekIsVUFBVSxFQUFFLElBQUksSUFBSSxDQUNsQixHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQ2pFO1lBQ0QsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7U0FDakIsQ0FBQztJQUNKLENBQUM7Q0FDRjtBQUVELGVBQWUsU0FBUyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCB7IHVuaXEgfSBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IEdpdFVybFBhcnNlIGZyb20gJ2dpdC11cmwtcGFyc2UnO1xuXG5jbGFzcyBHaXRIZWxwZXIge1xuICAvKipcbiAgICogZXh0cmFjdFJlcG9NZXRhZGF0YUZyb21SZW1vdGVzKCkgZ2V0cyBzb21lIGRldGFpbHMgYWJvdXQgdGhlIHJlcG8gZnJvbSB0aGUgcmVtb3RlIFVSTHMuXG4gICAqIFNwZWNpZmljYWxseSwgd2UgZ2V0IHRoZSByZXBvJ3Mgb3JpZ2luIChpLmUuIGNvZGUgaG9zdGluZyBzZXJ2aWNlKSwgaXRzIG5hbWUsIGl0cyBvd25lciwgYW5kIGl0c1xuICAgKiByb290ICYgY29tbWl0IFVSTHMuIFRoZXNlIGRldGFpbHMgYXJlIHVzZWQgbGF0ZXIgdG8gYXVnbWVudCBjb21taXQtbGV2ZWwgY29kZSBzZWFyY2ggcmVzdWx0cyB3aXRoXG4gICAqIGRhdGEgZnJvbSBjb2RlIGhvc3RpbmcgJiBwcm9qZWN0IG1hbmFnZW1lbnQgaW50ZWdyYXRpb25zLlxuICAgKlxuICAgKiBAcGFyYW0gICB7QXJyYXk8YW55Pn0gcmVtb3RlcyAgQXJyYXkgb2YgcmVtb3RlIFVSTHMgb2YgdGhlIGZvcm0geyB1cmwsIG5hbWUsIHR5cGUgfVxuICAgKiBAcmV0dXJucyB7T2JqZWN0fSAgICAgT2JqZWN0IGNvbnRhaW5pbmcgdGhlIGV4dHJhY3QgcmVwbyBtZXRhZGF0YVxuICAgKi9cbiAgc3RhdGljIGV4dHJhY3RSZXBvTWV0YWRhdGFGcm9tUmVtb3RlcyhcbiAgICByZW1vdGVzOiBBcnJheTxhbnk+XG4gICk6IHsgW3Byb3A6IHN0cmluZ106IGFueSB9IHtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkocmVtb3RlcykgfHwgcmVtb3Rlcy5sZW5ndGggPT09IDApIHJldHVybiB7fTtcbiAgICBsZXQgcGFyc2VkVXJsO1xuICAgIHRyeSB7XG4gICAgICBwYXJzZWRVcmwgPSBHaXRVcmxQYXJzZShyZW1vdGVzWzBdLnVybCk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG4gICAgY29uc3QgcmVwb01ldGFkYXRhOiB7IFtwcm9wOiBzdHJpbmddOiBhbnkgfSA9IHtcbiAgICAgIHJlcG9OYW1lOiBwYXJzZWRVcmwubmFtZSxcbiAgICAgIHJlcG9Pd25lcjogcGFyc2VkVXJsLm93bmVyLFxuICAgICAgcmVwb1NvdXJjZTogcGFyc2VkVXJsLnNvdXJjZSxcbiAgICAgIHJlcG9Sb290VXJsOiBwYXJzZWRVcmwudG9TdHJpbmcoJ2h0dHBzJykucmVwbGFjZSgnLmdpdCcsICcnKSxcbiAgICB9O1xuICAgIGlmIChcbiAgICAgIHJlcG9NZXRhZGF0YS5yZXBvU291cmNlID09PSAnZ2l0aHViLmNvbScgfHxcbiAgICAgIHJlcG9NZXRhZGF0YS5yZXBvU291cmNlID09PSAnZ2l0bGFiLmNvbSdcbiAgICApIHtcbiAgICAgIHJlcG9NZXRhZGF0YS5yZXBvQ29tbWl0VXJsID0gYCR7cmVwb01ldGFkYXRhLnJlcG9Sb290VXJsfS9jb21taXRgO1xuICAgIH0gZWxzZSBpZiAocmVwb01ldGFkYXRhLnJlcG9Tb3VyY2UgPT09ICdiaXRidWNrZXQub3JnJykge1xuICAgICAgcmVwb01ldGFkYXRhLnJlcG9Db21taXRVcmwgPSBgJHtyZXBvTWV0YWRhdGEucmVwb1Jvb3RVcmx9L2NvbW1pdHNgO1xuICAgIH1cbiAgICByZXR1cm4gcmVwb01ldGFkYXRhO1xuICB9XG5cbiAgc3RhdGljIGdldEhhc2hlc0Zyb21CbGFtZShibGFtZTogQXJyYXk8c3RyaW5nPikge1xuICAgIHJldHVybiB1bmlxKFxuICAgICAgYmxhbWUubWFwKGxpbmUgPT4ge1xuICAgICAgICByZXR1cm4gbGluZS5zcGxpdCgnICcpWzBdO1xuICAgICAgfSlcbiAgICApO1xuICB9XG5cbiAgc3RhdGljIHBhcnNlQmxhbWVMaW5lKGJsYW1lTGluZSkge1xuICAgIC8qXG4gICAgICAgICAgICAgICAgICAgICAgICBDb21taXQgSGFzaCAgICAgT3JpZ2luYWwgTGluZSBOdW1iZXIgICAgICAgICAgICAgICBEYXRlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUaW1lem9uZSBPZmZzZXQgICAgICAgICAgICAgICBMaW5lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBeICAgICBGaWxlIFBhdGggICAgXiAgICAgICBBdXRob3IgICAgICAgICAgICAgIF4gICAgICAgICAgICAgICAgICAgICAgICAgICBUaW1lICAgICAgICAgICAgICAgICAgICAgXiAgICAgICAgICBMaW5lIE51bWJlciAgIF5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgICAgICAgICBeICAgICAgICB8ICAgICAgICAgIF4gICAgICAgICAgICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXiAgICAgICAgICAgICAgICAgICAgICB8ICAgICAgICAgICAgICAgXiAgICAgICAgfFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAgICAgICAgIHwgICAgICAgIHwgICAgICAgICAgfCAgICAgICAgICAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgIHwgICAgICAgICAgICAgICB8ICAgICAgICB8XG4gICAgICAgICAgICAgICAgICAgICAgICAgfC0tLS0tLS0tLXwgIHwtLS18ICAgfC0tLS0tLXwgICAgfC0tfCAgIHwtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLXwgIHwtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLXwgIHwtLS0tLS0tLS0tLS18ICAgfC0tLS0tLS0tfHwtLS0tfCAgKi9cbiAgICBjb25zdCBibGFtZVJlZ2V4ID0gL14oW2EtejAtOV0rKVxccyhcXFMrKVxccysoWzAtOV0rKVxcc1xcKCguKylcXHMrKFswLTldezR9LVswLTldezJ9LVswLTldezJ9KVxccyhbMC05XXsyfTpbMC05XXsyfTpbMC05XXsyfSlcXHMoWystXVswLTldezR9KVxccysoWzAtOV0rKVxcKSguK3wkKS87XG4gICAgY29uc3QgbWF0Y2hlZCA9IGJsYW1lTGluZS5tYXRjaChibGFtZVJlZ2V4KTtcbiAgICBpZiAoIW1hdGNoZWQpIHtcbiAgICAgIGNvbnNvbGUubG9nKGJsYW1lTGluZSk7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb3VsZG4ndCBwYXJzZSBibGFtZSBsaW5lXCIpO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgY29tbWl0SGFzaDogbWF0Y2hlZFsxXS50cmltKCksXG4gICAgICBmaWxlUGF0aDogbWF0Y2hlZFsyXS50cmltKCksXG4gICAgICBvcmlnaW5hbExpbmVOdW1iZXI6IG1hdGNoZWRbM10udHJpbSgpLFxuICAgICAgbGluZU51bWJlcjogbWF0Y2hlZFs4XS50cmltKCksXG4gICAgICBhdXRob3I6IG1hdGNoZWRbNF0udHJpbSgpLFxuICAgICAgY29tbWl0ZWRBdDogbmV3IERhdGUoXG4gICAgICAgIGAke21hdGNoZWRbNV0udHJpbSgpfSAke21hdGNoZWRbNl0udHJpbSgpfSAke21hdGNoZWRbN10udHJpbSgpfWBcbiAgICAgICksXG4gICAgICBsaW5lOiBtYXRjaGVkWzldLFxuICAgIH07XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgR2l0SGVscGVyO1xuIl19