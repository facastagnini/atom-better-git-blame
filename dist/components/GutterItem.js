'use babel';
import React from 'preact-compat';
import moment from 'moment';
import TooltipContainer from './TooltipContainer';
import * as GitData from '../data/GitData';
import * as IntegrationData from '../data/IntegrationData';
import SearchInLayer from './SearchInLayer';
import * as ConfigManager from '../ConfigManager';
class GutterItem extends React.Component {
    constructor(...props) {
        super(...props);
        this.state = {
            commit: {},
            pullRequests: [],
            jiraIssues: [],
            githubIssues: [],
            metadata: {},
        };
    }
    componentWillMount() {
        this.setState({ commit: this.props.commit });
        if (this.props.commit.commitHash.substr(0, 6) !== '000000') {
            GitData.getCommit(this.props.commit.repoPath, this.props.commit.commitHash)
                .then((commit) => {
                this.setState({
                    ...this.state,
                    commit: {
                        ...this.state.commit,
                        ...commit
                    }
                });
            });
            GitData.getRepoMetadata(this.props.commit.repoPath)
                .then((metadata) => {
                this.setState({
                    ...this.state,
                    metadata
                });
            });
        }
    }
    componentDidMount() {
        if (this.props.commit.commitHash.substr(0, 6) !== '000000') {
            IntegrationData
                .getPullRequestsForCommit(`${this.state.commit.repoPath}`, this.state.commit.commitHash)
                .then((pullRequests) => {
                this.setState({
                    ...this.state,
                    pullRequests: pullRequests
                });
                pullRequests.map(this.getIssuesForPullRequest.bind(this));
            });
        }
    }
    async getIssuesForPullRequest(pullRequest) {
        const jiraIssues = [];
        const githubIssues = [];
        await pullRequest.relatedGitHubIssues.map(async (issueNumber) => {
            const issue = await IntegrationData.getIssue(this.state.commit.repoPath, issueNumber);
            githubIssues.push(issue);
        });
        await pullRequest.relatedJiraIssues.map(async (issueKey) => {
            const issue = await IntegrationData.getIssue(this.state.commit.repoPath, issueKey);
            jiraIssues.push(issue);
        });
        this.setState({
            ...this.state,
            githubIssues: githubIssues,
            jiraIssues: jiraIssues,
        });
    }
    clickLayerSearch() {
        this.props.emitter.emit('clickedSearch');
    }
    mouseEnterLayerSearch() {
        this.props.emitter.emit('mouseEnterLayerSearch');
    }
    mouseLeaveLayerSearch() {
        this.props.emitter.emit('mouseLeaveLayerSearch');
    }
    tooltip() {
        const commitedDate = moment(this.state.commit.commitedAt).format('D MMM');
        return (React.createElement("div", { className: "layer-tooltip" },
            React.createElement("div", { className: "section" },
                React.createElement("div", { className: "section-icon" },
                    React.createElement("div", { className: "icon icon-git-commit" })),
                React.createElement("div", { className: "section-content" },
                    React.createElement("h1", { className: "section-title" },
                        React.createElement("a", { href: `${this.state.metadata.repoCommitUrl}/${this.state.commit.commitHash}` }, this.state.commit.subject)),
                    React.createElement("p", { className: "section-body" },
                        React.createElement("code", null,
                            React.createElement("a", { href: `${this.state.metadata.repoCommitUrl}/${this.state.commit.commitHash}` }, this.state.commit.commitHash.substr(0, 6))),
                        " by ",
                        this.state.commit.author,
                        " committed on ",
                        commitedDate,
                        React.createElement("span", { className: "section-status" },
                            React.createElement("span", { title: "Insertions", className: "green" },
                                "+",
                                this.state.commit.insertions,
                                "\u00A0"),
                            React.createElement("span", { title: "Deletions", className: "red" },
                                "-",
                                this.state.commit.deletions,
                                "\u00A0"),
                            React.createElement("span", { title: "Files Changed" },
                                React.createElement("i", { className: "icon icon-diff" }),
                                this.state.commit.filesChanged))))),
            this.state.pullRequests.map((pullRequest) => {
                const verb = pullRequest.state.toLowerCase();
                return (React.createElement("div", { className: "section" },
                    React.createElement("div", { className: "section-icon" },
                        React.createElement("div", { className: "icon icon-git-pull-request" })),
                    React.createElement("div", { className: "section-content" },
                        React.createElement("h1", { className: "section-title" },
                            React.createElement("a", { href: pullRequest.url }, pullRequest.title)),
                        React.createElement("p", { className: "section-body" },
                            React.createElement("code", null,
                                React.createElement("a", { href: pullRequest.url },
                                    "#",
                                    pullRequest.number)),
                            " by ",
                            pullRequest.author.login,
                            " ",
                            verb,
                            " on ",
                            moment(pullRequest.createdAt).format('D MMM'),
                            React.createElement("span", { className: "section-status" },
                                React.createElement("span", { title: "Total Commits" },
                                    React.createElement("i", { className: "icon icon-git-commit" }),
                                    pullRequest.commitCount))))));
            }),
            this.state.githubIssues.map((issue) => {
                let issueIcon = 'icon icon-issue-opened green';
                if (issue.state === 'CLOSED') {
                    issueIcon = 'icon icon-issue-closed red';
                }
                return (React.createElement("div", { className: "section" },
                    React.createElement("div", { className: "section-icon" },
                        React.createElement("div", { className: "icon icon-issue-opened" })),
                    React.createElement("div", { className: "section-content" },
                        React.createElement("h1", { className: "section-title" },
                            React.createElement("a", { href: issue.url }, issue.title)),
                        React.createElement("p", { className: "section-body" },
                            React.createElement("i", { className: `icon ${issueIcon}` }),
                            React.createElement("code", null,
                                React.createElement("a", { href: issue.url },
                                    "#",
                                    issue.number)),
                            " by ",
                            issue.author.login,
                            React.createElement("span", { className: "section-status" }, issue.state.toLowerCase())))));
            }),
            this.state.jiraIssues.map((issue) => {
                return (React.createElement("div", { className: "section" },
                    React.createElement("div", { className: "section-icon" },
                        React.createElement("div", { className: "icon stepsize-icon-jira" })),
                    React.createElement("div", { className: "section-content" },
                        React.createElement("h1", { className: "section-title" },
                            React.createElement("a", { href: issue.url }, issue.summary)),
                        React.createElement("p", { className: "section-body" },
                            React.createElement("img", { className: "icon", src: issue.issueType.iconUrl, alt: issue.issueType.name }),
                            React.createElement("code", null,
                                React.createElement("a", { href: issue.url }, issue.key)),
                            " created by ",
                            issue.creator.displayName,
                            " & assigned to ",
                            issue.assignee.displayName || 'Nobody',
                            React.createElement("span", { className: "section-status", style: {
                                    color: `${issue.status.statusCategory.colorName}`
                                } }, issue.status.name.toLowerCase())))));
            }),
            React.createElement(SearchInLayer, { onClick: this.clickLayerSearch.bind(this), onMouseEnter: this.mouseEnterLayerSearch.bind(this), onMouseLeave: this.mouseLeaveLayerSearch.bind(this) })));
    }
    formattedText() {
        const commit = this.props.commit;
        const date = commit.commitedAt;
        const formattedDate = moment(date).format(ConfigManager.get('gutterDateFormat'));
        const author = commit.author;
        return `${formattedDate} ${author}`;
    }
    render() {
        if (this.state.commit.commitHash.substr(0, 6) === '000000') {
            return (React.createElement("div", null, this.formattedText()));
        }
        return (React.createElement(TooltipContainer, { tooltipContent: this.tooltip.bind(this) }, this.formattedText()));
    }
}
export default GutterItem;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR3V0dGVySXRlbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9jb21wb25lbnRzL0d1dHRlckl0ZW0udHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLFdBQVcsQ0FBQztBQUVaLE9BQU8sS0FBSyxNQUFNLGVBQWUsQ0FBQztBQUNsQyxPQUFPLE1BQU0sTUFBTSxRQUFRLENBQUM7QUFDNUIsT0FBTyxnQkFBZ0IsTUFBTSxvQkFBb0IsQ0FBQztBQUNsRCxPQUFPLEtBQUssT0FBTyxNQUFNLGlCQUFpQixDQUFDO0FBQzNDLE9BQU8sS0FBSyxlQUFlLE1BQU0seUJBQXlCLENBQUM7QUFDM0QsT0FBTyxhQUFhLE1BQU0saUJBQWlCLENBQUM7QUFDNUMsT0FBTyxLQUFLLGFBQWEsTUFBTSxrQkFBa0IsQ0FBQztBQWNsRCxnQkFBaUIsU0FBUSxLQUFLLENBQUMsU0FBZ0M7SUFFN0QsWUFBWSxHQUFHLEtBQUs7UUFDbEIsS0FBSyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUM7UUFDaEIsSUFBSSxDQUFDLEtBQUssR0FBRztZQUNYLE1BQU0sRUFBRSxFQUFFO1lBQ1YsWUFBWSxFQUFFLEVBQUU7WUFDaEIsVUFBVSxFQUFFLEVBQUU7WUFDZCxZQUFZLEVBQUUsRUFBRTtZQUNoQixRQUFRLEVBQUUsRUFBRTtTQUNiLENBQUE7SUFDSCxDQUFDO0lBRUQsa0JBQWtCO1FBQ2hCLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUMsQ0FBQyxDQUFDO1FBQzNDLEVBQUUsQ0FBQSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxLQUFLLFFBQVEsQ0FBQyxDQUFBLENBQUM7WUFDeEQsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsSUFB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LEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7UUFDakMsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQztRQUMvQixNQUFNLGFBQWEsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO1FBQ2pGLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7UUFDN0IsTUFBTSxDQUFDLEdBQUcsYUFBYSxJQUFJLE1BQU0sRUFBRSxDQUFBO0lBQ3JDLENBQUM7SUFFRCxNQUFNO1FBQ0osRUFBRSxDQUFBLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEtBQUssUUFBUSxDQUFDLENBQUEsQ0FBQztZQUN4RCxNQUFNLENBQUMsQ0FDTCxpQ0FDRyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQ2pCLENBQ1AsQ0FBQztRQUNKLENBQUM7UUFDRCxNQUFNLENBQUMsQ0FDTCxvQkFBQyxnQkFBZ0IsSUFDZixjQUFjLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBRXRDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FDSixDQUNwQixDQUFDO0lBQ0osQ0FBQztDQUVGO0FBRUQsZUFBZSxVQUFVLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJRW1pdHRlciB9IGZyb20gJ2VtaXNzYXJ5JztcblxuJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCBSZWFjdCBmcm9tICdwcmVhY3QtY29tcGF0JztcbmltcG9ydCBtb21lbnQgZnJvbSAnbW9tZW50JztcbmltcG9ydCBUb29sdGlwQ29udGFpbmVyIGZyb20gJy4vVG9vbHRpcENvbnRhaW5lcic7XG5pbXBvcnQgKiBhcyBHaXREYXRhIGZyb20gJy4uL2RhdGEvR2l0RGF0YSc7XG5pbXBvcnQgKiBhcyBJbnRlZ3JhdGlvbkRhdGEgZnJvbSAnLi4vZGF0YS9JbnRlZ3JhdGlvbkRhdGEnO1xuaW1wb3J0IFNlYXJjaEluTGF5ZXIgZnJvbSAnLi9TZWFyY2hJbkxheWVyJztcbmltcG9ydCAqIGFzIENvbmZpZ01hbmFnZXIgZnJvbSAnLi4vQ29uZmlnTWFuYWdlcic7XG5cbmludGVyZmFjZSBJR3V0dGVySXRlbVByb3BzIHtcbiAgY29tbWl0OiBhbnk7XG4gIGVtaXR0ZXI6IElFbWl0dGVyO1xufVxuXG5pbnRlcmZhY2UgSUd1dHRlckl0ZW1TdGF0ZSB7XG4gIGNvbW1pdDogYW55O1xuICBwdWxsUmVxdWVzdHM6IGFueTtcbiAgamlyYUlzc3VlczogYW55O1xuICBnaXRodWJJc3N1ZXM6IGFueTtcbn1cblxuY2xhc3MgR3V0dGVySXRlbSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxJR3V0dGVySXRlbVByb3BzLCBhbnk+IHtcblxuICBjb25zdHJ1Y3RvciguLi5wcm9wcyl7XG4gICAgc3VwZXIoLi4ucHJvcHMpO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBjb21taXQ6IHt9LFxuICAgICAgcHVsbFJlcXVlc3RzOiBbXSxcbiAgICAgIGppcmFJc3N1ZXM6IFtdLFxuICAgICAgZ2l0aHViSXNzdWVzOiBbXSxcbiAgICAgIG1ldGFkYXRhOiB7fSxcbiAgICB9XG4gIH1cblxuICBjb21wb25lbnRXaWxsTW91bnQoKXtcbiAgICB0aGlzLnNldFN0YXRlKHtjb21taXQ6IHRoaXMucHJvcHMuY29tbWl0fSk7XG4gICAgaWYodGhpcy5wcm9wcy5jb21taXQuY29tbWl0SGFzaC5zdWJzdHIoMCw2KSAhPT0gJzAwMDAwMCcpe1xuICAgICAgR2l0RGF0YS5nZXRDb21taXQodGhpcy5wcm9wcy5jb21taXQucmVwb1BhdGgsIHRoaXMucHJvcHMuY29tbWl0LmNvbW1pdEhhc2gpXG4gICAgICAgIC50aGVuKChjb21taXQpID0+IHtcbiAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIC4uLnRoaXMuc3RhdGUsXG4gICAgICAgICAgICBjb21taXQgOiB7XG4gICAgICAgICAgICAgIC4uLnRoaXMuc3RhdGUuY29tbWl0LFxuICAgICAgICAgICAgICAuLi5jb21taXRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICBHaXREYXRhLmdldFJlcG9NZXRhZGF0YSh0aGlzLnByb3BzLmNvbW1pdC5yZXBvUGF0aClcbiAgICAgICAgLnRoZW4oKG1ldGFkYXRhKSA9PiB7XG4gICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAuLi50aGlzLnN0YXRlLFxuICAgICAgICAgICAgbWV0YWRhdGFcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKXtcbiAgICBpZih0aGlzLnByb3BzLmNvbW1pdC5jb21taXRIYXNoLnN1YnN0cigwLDYpICE9PSAnMDAwMDAwJykge1xuICAgICAgSW50ZWdyYXRpb25EYXRhXG4gICAgICAgIC5nZXRQdWxsUmVxdWVzdHNGb3JDb21taXQoXG4gICAgICAgICAgYCR7dGhpcy5zdGF0ZS5jb21taXQucmVwb1BhdGh9YCxcbiAgICAgICAgICB0aGlzLnN0YXRlLmNvbW1pdC5jb21taXRIYXNoXG4gICAgICAgIClcbiAgICAgICAgLnRoZW4oKHB1bGxSZXF1ZXN0cykgPT4ge1xuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgLi4udGhpcy5zdGF0ZSxcbiAgICAgICAgICAgIHB1bGxSZXF1ZXN0czogcHVsbFJlcXVlc3RzXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcHVsbFJlcXVlc3RzLm1hcCh0aGlzLmdldElzc3Vlc0ZvclB1bGxSZXF1ZXN0LmJpbmQodGhpcykpXG4gICAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGdldElzc3Vlc0ZvclB1bGxSZXF1ZXN0KHB1bGxSZXF1ZXN0KXtcbiAgICBjb25zdCBqaXJhSXNzdWVzID0gW107XG4gICAgY29uc3QgZ2l0aHViSXNzdWVzID0gW107XG4gICAgYXdhaXQgcHVsbFJlcXVlc3QucmVsYXRlZEdpdEh1Yklzc3Vlcy5tYXAoYXN5bmMgKGlzc3VlTnVtYmVyKSA9PiB7XG4gICAgICBjb25zdCBpc3N1ZSA9IGF3YWl0IEludGVncmF0aW9uRGF0YS5nZXRJc3N1ZSh0aGlzLnN0YXRlLmNvbW1pdC5yZXBvUGF0aCwgaXNzdWVOdW1iZXIpO1xuICAgICAgZ2l0aHViSXNzdWVzLnB1c2goaXNzdWUpO1xuICAgIH0pO1xuICAgIGF3YWl0IHB1bGxSZXF1ZXN0LnJlbGF0ZWRKaXJhSXNzdWVzLm1hcChhc3luYyAoaXNzdWVLZXkpID0+IHtcbiAgICAgIGNvbnN0IGlzc3VlID0gYXdhaXQgSW50ZWdyYXRpb25EYXRhLmdldElzc3VlKHRoaXMuc3RhdGUuY29tbWl0LnJlcG9QYXRoLCBpc3N1ZUtleSk7XG4gICAgICBqaXJhSXNzdWVzLnB1c2goaXNzdWUpO1xuICAgIH0pO1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgLi4udGhpcy5zdGF0ZSxcbiAgICAgIGdpdGh1Yklzc3VlczogZ2l0aHViSXNzdWVzLFxuICAgICAgamlyYUlzc3VlczogamlyYUlzc3VlcyxcbiAgICB9KTtcbiAgfVxuXG4gIGNsaWNrTGF5ZXJTZWFyY2goKXtcbiAgICB0aGlzLnByb3BzLmVtaXR0ZXIuZW1pdCgnY2xpY2tlZFNlYXJjaCcpO1xuICB9XG5cbiAgbW91c2VFbnRlckxheWVyU2VhcmNoKCl7XG4gICAgdGhpcy5wcm9wcy5lbWl0dGVyLmVtaXQoJ21vdXNlRW50ZXJMYXllclNlYXJjaCcpO1xuICB9XG5cbiAgbW91c2VMZWF2ZUxheWVyU2VhcmNoKCl7XG4gICAgdGhpcy5wcm9wcy5lbWl0dGVyLmVtaXQoJ21vdXNlTGVhdmVMYXllclNlYXJjaCcpO1xuICB9XG5cbiAgdG9vbHRpcCgpIHtcbiAgICBjb25zdCBjb21taXRlZERhdGUgPSBtb21lbnQodGhpcy5zdGF0ZS5jb21taXQuY29tbWl0ZWRBdCkuZm9ybWF0KCdEIE1NTScpO1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImxheWVyLXRvb2x0aXBcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzZWN0aW9uXCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzZWN0aW9uLWljb25cIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiaWNvbiBpY29uLWdpdC1jb21taXRcIiAvPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic2VjdGlvbi1jb250ZW50XCI+XG4gICAgICAgICAgICA8aDEgY2xhc3NOYW1lPVwic2VjdGlvbi10aXRsZVwiPlxuICAgICAgICAgICAgICA8YSBocmVmPXtgJHt0aGlzLnN0YXRlLm1ldGFkYXRhLnJlcG9Db21taXRVcmx9LyR7dGhpcy5zdGF0ZS5jb21taXQuY29tbWl0SGFzaH1gfT5cbiAgICAgICAgICAgICAgICB7dGhpcy5zdGF0ZS5jb21taXQuc3ViamVjdH1cbiAgICAgICAgICAgICAgPC9hPlxuICAgICAgICAgICAgPC9oMT5cbiAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInNlY3Rpb24tYm9keVwiPlxuICAgICAgICAgICAgICA8Y29kZT5cbiAgICAgICAgICAgICAgICA8YSBocmVmPXtgJHt0aGlzLnN0YXRlLm1ldGFkYXRhLnJlcG9Db21taXRVcmx9LyR7dGhpcy5zdGF0ZS5jb21taXQuY29tbWl0SGFzaH1gfT5cbiAgICAgICAgICAgICAgICAgIHt0aGlzLnN0YXRlLmNvbW1pdC5jb21taXRIYXNoLnN1YnN0cigwLDYpfVxuICAgICAgICAgICAgICAgIDwvYT5cbiAgICAgICAgICAgICAgPC9jb2RlPiBieSB7dGhpcy5zdGF0ZS5jb21taXQuYXV0aG9yfSBjb21taXR0ZWQgb24ge2NvbW1pdGVkRGF0ZX1cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwic2VjdGlvbi1zdGF0dXNcIj5cbiAgICAgICAgICAgICAgICA8c3BhbiB0aXRsZT1cIkluc2VydGlvbnNcIiBjbGFzc05hbWU9XCJncmVlblwiPit7dGhpcy5zdGF0ZS5jb21taXQuaW5zZXJ0aW9uc30mbmJzcDs8L3NwYW4+XG4gICAgICAgICAgICAgICAgPHNwYW4gdGl0bGU9XCJEZWxldGlvbnNcIiBjbGFzc05hbWU9XCJyZWRcIj4te3RoaXMuc3RhdGUuY29tbWl0LmRlbGV0aW9uc30mbmJzcDs8L3NwYW4+XG4gICAgICAgICAgICAgICAgPHNwYW4gdGl0bGU9XCJGaWxlcyBDaGFuZ2VkXCI+PGkgY2xhc3NOYW1lPVwiaWNvbiBpY29uLWRpZmZcIiAvPnt0aGlzLnN0YXRlLmNvbW1pdC5maWxlc0NoYW5nZWR9PC9zcGFuPlxuICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICA8L3A+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICB7dGhpcy5zdGF0ZS5wdWxsUmVxdWVzdHMubWFwKChwdWxsUmVxdWVzdCkgPT4ge1xuICAgICAgICAgIGNvbnN0IHZlcmIgPSBwdWxsUmVxdWVzdC5zdGF0ZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInNlY3Rpb25cIj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzZWN0aW9uLWljb25cIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImljb24gaWNvbi1naXQtcHVsbC1yZXF1ZXN0XCIgLz5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic2VjdGlvbi1jb250ZW50XCI+XG4gICAgICAgICAgICAgICAgPGgxIGNsYXNzTmFtZT1cInNlY3Rpb24tdGl0bGVcIj48YSBocmVmPXtwdWxsUmVxdWVzdC51cmx9PntwdWxsUmVxdWVzdC50aXRsZX08L2E+PC9oMT5cbiAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJzZWN0aW9uLWJvZHlcIj5cbiAgICAgICAgICAgICAgICAgIDxjb2RlPlxuICAgICAgICAgICAgICAgICAgICA8YSBocmVmPXtwdWxsUmVxdWVzdC51cmx9PlxuICAgICAgICAgICAgICAgICAgICAgICN7cHVsbFJlcXVlc3QubnVtYmVyfVxuICAgICAgICAgICAgICAgICAgICA8L2E+XG4gICAgICAgICAgICAgICAgICA8L2NvZGU+IGJ5IHtwdWxsUmVxdWVzdC5hdXRob3IubG9naW59IHt2ZXJifSBvbiB7bW9tZW50KHB1bGxSZXF1ZXN0LmNyZWF0ZWRBdCkuZm9ybWF0KCdEIE1NTScpfVxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwic2VjdGlvbi1zdGF0dXNcIj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gdGl0bGU9XCJUb3RhbCBDb21taXRzXCI+PGkgY2xhc3NOYW1lPVwiaWNvbiBpY29uLWdpdC1jb21taXRcIiAvPntwdWxsUmVxdWVzdC5jb21taXRDb3VudH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIClcbiAgICAgICAgfSl9XG4gICAgICAgIHt0aGlzLnN0YXRlLmdpdGh1Yklzc3Vlcy5tYXAoKGlzc3VlKSA9PiB7XG4gICAgICAgICAgbGV0IGlzc3VlSWNvbiA9ICdpY29uIGljb24taXNzdWUtb3BlbmVkIGdyZWVuJztcbiAgICAgICAgICBpZihpc3N1ZS5zdGF0ZSA9PT0gJ0NMT1NFRCcpe1xuICAgICAgICAgICAgaXNzdWVJY29uID0gJ2ljb24gaWNvbi1pc3N1ZS1jbG9zZWQgcmVkJ1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzZWN0aW9uXCI+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic2VjdGlvbi1pY29uXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJpY29uIGljb24taXNzdWUtb3BlbmVkXCIgLz5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic2VjdGlvbi1jb250ZW50XCI+XG4gICAgICAgICAgICAgICAgPGgxIGNsYXNzTmFtZT1cInNlY3Rpb24tdGl0bGVcIj48YSBocmVmPXtpc3N1ZS51cmx9Pntpc3N1ZS50aXRsZX08L2E+PC9oMT5cbiAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJzZWN0aW9uLWJvZHlcIj5cbiAgICAgICAgICAgICAgICAgIDxpIGNsYXNzTmFtZT17YGljb24gJHtpc3N1ZUljb259YH0gLz5cbiAgICAgICAgICAgICAgICAgIDxjb2RlPjxhIGhyZWY9e2lzc3VlLnVybH0+I3tpc3N1ZS5udW1iZXJ9PC9hPjwvY29kZT4gYnkge2lzc3VlLmF1dGhvci5sb2dpbn1cbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInNlY3Rpb24tc3RhdHVzXCI+e2lzc3VlLnN0YXRlLnRvTG93ZXJDYXNlKCl9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICApXG4gICAgICAgIH0pfVxuICAgICAgICB7dGhpcy5zdGF0ZS5qaXJhSXNzdWVzLm1hcCgoaXNzdWUpID0+IHtcbiAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzZWN0aW9uXCI+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic2VjdGlvbi1pY29uXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJpY29uIHN0ZXBzaXplLWljb24tamlyYVwiIC8+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInNlY3Rpb24tY29udGVudFwiPlxuICAgICAgICAgICAgICAgIDxoMSBjbGFzc05hbWU9XCJzZWN0aW9uLXRpdGxlXCI+PGEgaHJlZj17aXNzdWUudXJsfT57aXNzdWUuc3VtbWFyeX08L2E+PC9oMT5cbiAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJzZWN0aW9uLWJvZHlcIj5cbiAgICAgICAgICAgICAgICAgIDxpbWcgY2xhc3NOYW1lPVwiaWNvblwiIHNyYz17aXNzdWUuaXNzdWVUeXBlLmljb25Vcmx9IGFsdD17aXNzdWUuaXNzdWVUeXBlLm5hbWV9Lz5cbiAgICAgICAgICAgICAgICAgIDxjb2RlPjxhIGhyZWY9e2lzc3VlLnVybH0+e2lzc3VlLmtleX08L2E+PC9jb2RlPiBjcmVhdGVkIGJ5IHtpc3N1ZS5jcmVhdG9yLmRpc3BsYXlOYW1lfSAmIGFzc2lnbmVkIHRvIHtpc3N1ZS5hc3NpZ25lZS5kaXNwbGF5TmFtZSB8fCAnTm9ib2R5J31cbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInNlY3Rpb24tc3RhdHVzXCIgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6IGAke2lzc3VlLnN0YXR1cy5zdGF0dXNDYXRlZ29yeS5jb2xvck5hbWV9YFxuICAgICAgICAgICAgICAgICAgfX0+e2lzc3VlLnN0YXR1cy5uYW1lLnRvTG93ZXJDYXNlKCl9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICApXG4gICAgICAgIH0pfVxuICAgICAgICA8U2VhcmNoSW5MYXllclxuICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuY2xpY2tMYXllclNlYXJjaC5iaW5kKHRoaXMpfVxuICAgICAgICAgIG9uTW91c2VFbnRlcj17dGhpcy5tb3VzZUVudGVyTGF5ZXJTZWFyY2guYmluZCh0aGlzKX1cbiAgICAgICAgICBvbk1vdXNlTGVhdmU9e3RoaXMubW91c2VMZWF2ZUxheWVyU2VhcmNoLmJpbmQodGhpcyl9XG4gICAgICAgIC8+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgZm9ybWF0dGVkVGV4dCgpIHtcbiAgICBjb25zdCBjb21taXQgPSB0aGlzLnByb3BzLmNvbW1pdDtcbiAgICBjb25zdCBkYXRlID0gY29tbWl0LmNvbW1pdGVkQXQ7XG4gICAgY29uc3QgZm9ybWF0dGVkRGF0ZSA9IG1vbWVudChkYXRlKS5mb3JtYXQoQ29uZmlnTWFuYWdlci5nZXQoJ2d1dHRlckRhdGVGb3JtYXQnKSk7XG4gICAgY29uc3QgYXV0aG9yID0gY29tbWl0LmF1dGhvcjtcbiAgICByZXR1cm4gYCR7Zm9ybWF0dGVkRGF0ZX0gJHthdXRob3J9YFxuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGlmKHRoaXMuc3RhdGUuY29tbWl0LmNvbW1pdEhhc2guc3Vic3RyKDAsNikgPT09ICcwMDAwMDAnKXtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxkaXY+XG4gICAgICAgICAge3RoaXMuZm9ybWF0dGVkVGV4dCgpfVxuICAgICAgICA8L2Rpdj5cbiAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiAoXG4gICAgICA8VG9vbHRpcENvbnRhaW5lclxuICAgICAgICB0b29sdGlwQ29udGVudD17dGhpcy50b29sdGlwLmJpbmQodGhpcyl9XG4gICAgICA+XG4gICAgICAgIHt0aGlzLmZvcm1hdHRlZFRleHQoKX1cbiAgICAgIDwvVG9vbHRpcENvbnRhaW5lcj5cbiAgICApO1xuICB9XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgR3V0dGVySXRlbTtcbiJdfQ==