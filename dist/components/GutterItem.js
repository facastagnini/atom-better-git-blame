'use babel';
import React from 'preact-compat';
import moment from 'moment';
import TooltipContainer from './TooltipContainer';
import * as GitData from '../data/GitData';
import * as IntegrationData from '../data/IntegrationData';
import SearchInLayer from './SearchInLayer';
import * as ConfigManager from '../ConfigManager';
import BuildStatus from './BuildStatus';
import * as Analytics from '../stepsize/Analytics';
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
            this.fetchCommitData();
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
                // Refresh the commit data
                this.fetchCommitData();
            });
        }
    }
    fetchCommitData() {
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
    clickHandler(label) {
        return () => {
            Analytics.track(`Clicked link`, { label });
        };
    }
    tooltip() {
        const commitedDate = moment(this.state.commit.commitedAt).format('D MMM');
        return (React.createElement("div", { className: "layer-tooltip" },
            React.createElement("div", { className: "section" },
                React.createElement("div", { className: "section-icon" },
                    React.createElement("div", { className: "icon icon-git-commit" })),
                React.createElement("div", { className: "section-content" },
                    React.createElement("h1", { className: "section-title" },
                        React.createElement("a", { onClick: this.clickHandler('Commit title'), href: `${this.state.metadata.repoCommitUrl}/${this.state.commit.commitHash}` }, this.state.commit.subject)),
                    React.createElement(BuildStatus, { status: this.state.commit.status }),
                    React.createElement("p", { className: "section-body" },
                        React.createElement("code", null,
                            React.createElement("a", { onClick: this.clickHandler('Commit hash'), href: `${this.state.metadata.repoCommitUrl}/${this.state.commit.commitHash}` }, this.state.commit.commitHash.substr(0, 6))),
                        " by ",
                        this.state.commit.author,
                        " committed on ",
                        commitedDate),
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
                            this.state.commit.filesChanged)))),
            this.state.pullRequests.map((pullRequest) => {
                const verb = pullRequest.state.toLowerCase();
                return (React.createElement("div", { className: "section" },
                    React.createElement("div", { className: "section-icon" },
                        React.createElement("div", { className: "icon icon-git-pull-request" })),
                    React.createElement("div", { className: "section-content" },
                        React.createElement("h1", { className: "section-title" },
                            React.createElement("a", { onClick: this.clickHandler('Pull Request title'), href: pullRequest.url }, pullRequest.title)),
                        React.createElement(BuildStatus, { status: pullRequest.status }),
                        React.createElement("p", { className: "section-body" },
                            React.createElement("code", null,
                                React.createElement("a", { onClick: this.clickHandler('Pull Request number'), href: pullRequest.url },
                                    "#",
                                    pullRequest.number)),
                            " by ",
                            pullRequest.author.login,
                            " ",
                            verb,
                            " on ",
                            moment(pullRequest.createdAt).format('D MMM')),
                        React.createElement("span", { className: "section-status" },
                            React.createElement("span", { title: "Total Commits" },
                                React.createElement("i", { className: "icon icon-git-commit" }),
                                pullRequest.commitCount)))));
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
                            React.createElement("a", { onClick: this.clickHandler('Issue title'), href: issue.url }, issue.title)),
                        React.createElement("p", { className: "section-body" },
                            React.createElement("i", { className: `icon ${issueIcon}` }),
                            React.createElement("code", null,
                                React.createElement("a", { onClick: this.clickHandler('Issue number'), href: issue.url },
                                    "#",
                                    issue.number)),
                            " by ",
                            issue.author.login),
                        React.createElement("span", { className: "section-status" }, issue.state.toLowerCase()))));
            }),
            this.state.jiraIssues.map((issue) => {
                return (React.createElement("div", { className: "section" },
                    React.createElement("div", { className: "section-icon" },
                        React.createElement("div", { className: "icon stepsize-icon-jira" })),
                    React.createElement("div", { className: "section-content" },
                        React.createElement("h1", { className: "section-title" },
                            React.createElement("a", { onClick: this.clickHandler('Jira ticket title'), href: issue.url }, issue.summary)),
                        React.createElement("p", { className: "section-body" },
                            React.createElement("img", { className: "icon", src: issue.issueType.iconUrl, alt: issue.issueType.name }),
                            React.createElement("code", null,
                                React.createElement("a", { onClick: this.clickHandler('Jira ticket key'), href: issue.url }, issue.key)),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR3V0dGVySXRlbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9jb21wb25lbnRzL0d1dHRlckl0ZW0udHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLFdBQVcsQ0FBQztBQUVaLE9BQU8sS0FBSyxNQUFNLGVBQWUsQ0FBQztBQUNsQyxPQUFPLE1BQU0sTUFBTSxRQUFRLENBQUM7QUFDNUIsT0FBTyxnQkFBZ0IsTUFBTSxvQkFBb0IsQ0FBQztBQUNsRCxPQUFPLEtBQUssT0FBTyxNQUFNLGlCQUFpQixDQUFDO0FBQzNDLE9BQU8sS0FBSyxlQUFlLE1BQU0seUJBQXlCLENBQUM7QUFDM0QsT0FBTyxhQUFhLE1BQU0saUJBQWlCLENBQUM7QUFDNUMsT0FBTyxLQUFLLGFBQWEsTUFBTSxrQkFBa0IsQ0FBQztBQUNsRCxPQUFPLFdBQVcsTUFBTSxlQUFlLENBQUM7QUFDeEMsT0FBTyxLQUFLLFNBQVMsTUFBTSx1QkFBdUIsQ0FBQztBQWNuRCxnQkFBaUIsU0FBUSxLQUFLLENBQUMsU0FBZ0M7SUFFN0QsWUFBWSxHQUFHLEtBQUs7UUFDbEIsS0FBSyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUM7UUFDaEIsSUFBSSxDQUFDLEtBQUssR0FBRztZQUNYLE1BQU0sRUFBRSxFQUFFO1lBQ1YsWUFBWSxFQUFFLEVBQUU7WUFDaEIsVUFBVSxFQUFFLEVBQUU7WUFDZCxZQUFZLEVBQUUsRUFBRTtZQUNoQixRQUFRLEVBQUUsRUFBRTtTQUNiLENBQUE7SUFDSCxDQUFDO0lBRUQsa0JBQWtCO1FBQ2hCLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUMsQ0FBQyxDQUFDO1FBQzNDLEVBQUUsQ0FBQSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxLQUFLLFFBQVEsQ0FBQyxDQUFBLENBQUM7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UUFDWCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztRQUNqQyxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDO1FBQy9CLE1BQU0sYUFBYSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7UUFDakYsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUM3QixNQUFNLENBQUMsR0FBRyxhQUFhLElBQUksTUFBTSxFQUFFLENBQUE7SUFDckMsQ0FBQztJQUVELE1BQU07UUFDSixFQUFFLENBQUEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsS0FBSyxRQUFRLENBQUMsQ0FBQSxDQUFDO1lBQ3hELE1BQU0sQ0FBQyxDQUNMLGlDQUNHLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FDakIsQ0FDUCxDQUFDO1FBQ0osQ0FBQztRQUNELE1BQU0sQ0FBQyxDQUNMLG9CQUFDLGdCQUFnQixJQUNmLGNBQWMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFFdEMsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUNKLENBQ3BCLENBQUM7SUFDSixDQUFDO0NBRUY7QUFFRCxlQUFlLFVBQVUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IElFbWl0dGVyIH0gZnJvbSAnZW1pc3NhcnknO1xuXG4ndXNlIGJhYmVsJztcblxuaW1wb3J0IFJlYWN0IGZyb20gJ3ByZWFjdC1jb21wYXQnO1xuaW1wb3J0IG1vbWVudCBmcm9tICdtb21lbnQnO1xuaW1wb3J0IFRvb2x0aXBDb250YWluZXIgZnJvbSAnLi9Ub29sdGlwQ29udGFpbmVyJztcbmltcG9ydCAqIGFzIEdpdERhdGEgZnJvbSAnLi4vZGF0YS9HaXREYXRhJztcbmltcG9ydCAqIGFzIEludGVncmF0aW9uRGF0YSBmcm9tICcuLi9kYXRhL0ludGVncmF0aW9uRGF0YSc7XG5pbXBvcnQgU2VhcmNoSW5MYXllciBmcm9tICcuL1NlYXJjaEluTGF5ZXInO1xuaW1wb3J0ICogYXMgQ29uZmlnTWFuYWdlciBmcm9tICcuLi9Db25maWdNYW5hZ2VyJztcbmltcG9ydCBCdWlsZFN0YXR1cyBmcm9tICcuL0J1aWxkU3RhdHVzJztcbmltcG9ydCAqIGFzIEFuYWx5dGljcyBmcm9tICcuLi9zdGVwc2l6ZS9BbmFseXRpY3MnO1xuXG5pbnRlcmZhY2UgSUd1dHRlckl0ZW1Qcm9wcyB7XG4gIGNvbW1pdDogYW55O1xuICBlbWl0dGVyOiBJRW1pdHRlcjtcbn1cblxuaW50ZXJmYWNlIElHdXR0ZXJJdGVtU3RhdGUge1xuICBjb21taXQ6IGFueTtcbiAgcHVsbFJlcXVlc3RzOiBhbnk7XG4gIGppcmFJc3N1ZXM6IGFueTtcbiAgZ2l0aHViSXNzdWVzOiBhbnk7XG59XG5cbmNsYXNzIEd1dHRlckl0ZW0gZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8SUd1dHRlckl0ZW1Qcm9wcywgYW55PiB7XG5cbiAgY29uc3RydWN0b3IoLi4ucHJvcHMpe1xuICAgIHN1cGVyKC4uLnByb3BzKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgY29tbWl0OiB7fSxcbiAgICAgIHB1bGxSZXF1ZXN0czogW10sXG4gICAgICBqaXJhSXNzdWVzOiBbXSxcbiAgICAgIGdpdGh1Yklzc3VlczogW10sXG4gICAgICBtZXRhZGF0YToge30sXG4gICAgfVxuICB9XG5cbiAgY29tcG9uZW50V2lsbE1vdW50KCl7XG4gICAgdGhpcy5zZXRTdGF0ZSh7Y29tbWl0OiB0aGlzLnByb3BzLmNvbW1pdH0pO1xuICAgIGlmKHRoaXMucHJvcHMuY29tbWl0LmNvbW1pdEhhc2guc3Vic3RyKDAsNikgIT09ICcwMDAwMDAnKXtcbiAgICAgIHRoaXMuZmV0Y2hDb21taXREYXRhKCk7XG4gICAgICBHaXREYXRhLmdldFJlcG9NZXRhZGF0YSh0aGlzLnByb3BzLmNvbW1pdC5yZXBvUGF0aClcbiAgICAgICAgLnRoZW4oKG1ldGFkYXRhKSA9PiB7XG4gICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAuLi50aGlzLnN0YXRlLFxuICAgICAgICAgICAgbWV0YWRhdGFcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKXtcbiAgICBpZih0aGlzLnByb3BzLmNvbW1pdC5jb21taXRIYXNoLnN1YnN0cigwLDYpICE9PSAnMDAwMDAwJykge1xuICAgICAgSW50ZWdyYXRpb25EYXRhXG4gICAgICAgIC5nZXRQdWxsUmVxdWVzdHNGb3JDb21taXQoXG4gICAgICAgICAgYCR7dGhpcy5zdGF0ZS5jb21taXQucmVwb1BhdGh9YCxcbiAgICAgICAgICB0aGlzLnN0YXRlLmNvbW1pdC5jb21taXRIYXNoXG4gICAgICAgIClcbiAgICAgICAgLnRoZW4oKHB1bGxSZXF1ZXN0cykgPT4ge1xuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgLi4udGhpcy5zdGF0ZSxcbiAgICAgICAgICAgIHB1bGxSZXF1ZXN0czogcHVsbFJlcXVlc3RzXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcHVsbFJlcXVlc3RzLm1hcCh0aGlzLmdldElzc3Vlc0ZvclB1bGxSZXF1ZXN0LmJpbmQodGhpcykpO1xuICAgICAgICAgIC8vIFJlZnJlc2ggdGhlIGNvbW1pdCBkYXRhXG4gICAgICAgICAgdGhpcy5mZXRjaENvbW1pdERhdGEoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgZmV0Y2hDb21taXREYXRhKCl7XG4gICAgaWYodGhpcy5wcm9wcy5jb21taXQuY29tbWl0SGFzaC5zdWJzdHIoMCw2KSAhPT0gJzAwMDAwMCcpe1xuICAgICAgR2l0RGF0YS5nZXRDb21taXQodGhpcy5wcm9wcy5jb21taXQucmVwb1BhdGgsIHRoaXMucHJvcHMuY29tbWl0LmNvbW1pdEhhc2gpXG4gICAgICAgIC50aGVuKChjb21taXQpID0+IHtcbiAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIC4uLnRoaXMuc3RhdGUsXG4gICAgICAgICAgICBjb21taXQgOiB7XG4gICAgICAgICAgICAgIC4uLnRoaXMuc3RhdGUuY29tbWl0LFxuICAgICAgICAgICAgICAuLi5jb21taXRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgZ2V0SXNzdWVzRm9yUHVsbFJlcXVlc3QocHVsbFJlcXVlc3Qpe1xuICAgIGNvbnN0IGppcmFJc3N1ZXMgPSBbXTtcbiAgICBjb25zdCBnaXRodWJJc3N1ZXMgPSBbXTtcbiAgICBhd2FpdCBwdWxsUmVxdWVzdC5yZWxhdGVkR2l0SHViSXNzdWVzLm1hcChhc3luYyAoaXNzdWVOdW1iZXIpID0+IHtcbiAgICAgIGNvbnN0IGlzc3VlID0gYXdhaXQgSW50ZWdyYXRpb25EYXRhLmdldElzc3VlKHRoaXMuc3RhdGUuY29tbWl0LnJlcG9QYXRoLCBpc3N1ZU51bWJlcik7XG4gICAgICBnaXRodWJJc3N1ZXMucHVzaChpc3N1ZSk7XG4gICAgfSk7XG4gICAgYXdhaXQgcHVsbFJlcXVlc3QucmVsYXRlZEppcmFJc3N1ZXMubWFwKGFzeW5jIChpc3N1ZUtleSkgPT4ge1xuICAgICAgY29uc3QgaXNzdWUgPSBhd2FpdCBJbnRlZ3JhdGlvbkRhdGEuZ2V0SXNzdWUodGhpcy5zdGF0ZS5jb21taXQucmVwb1BhdGgsIGlzc3VlS2V5KTtcbiAgICAgIGppcmFJc3N1ZXMucHVzaChpc3N1ZSk7XG4gICAgfSk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAuLi50aGlzLnN0YXRlLFxuICAgICAgZ2l0aHViSXNzdWVzOiBnaXRodWJJc3N1ZXMsXG4gICAgICBqaXJhSXNzdWVzOiBqaXJhSXNzdWVzLFxuICAgIH0pO1xuICB9XG5cbiAgY2xpY2tMYXllclNlYXJjaCgpe1xuICAgIHRoaXMucHJvcHMuZW1pdHRlci5lbWl0KCdjbGlja2VkU2VhcmNoJyk7XG4gIH1cblxuICBtb3VzZUVudGVyTGF5ZXJTZWFyY2goKXtcbiAgICB0aGlzLnByb3BzLmVtaXR0ZXIuZW1pdCgnbW91c2VFbnRlckxheWVyU2VhcmNoJyk7XG4gIH1cblxuICBtb3VzZUxlYXZlTGF5ZXJTZWFyY2goKXtcbiAgICB0aGlzLnByb3BzLmVtaXR0ZXIuZW1pdCgnbW91c2VMZWF2ZUxheWVyU2VhcmNoJyk7XG4gIH1cblxuICBjbGlja0hhbmRsZXIobGFiZWwpe1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBBbmFseXRpY3MudHJhY2soYENsaWNrZWQgbGlua2AsIHtsYWJlbH0pO1xuICAgIH07XG4gIH1cblxuICB0b29sdGlwKCkge1xuICAgIGNvbnN0IGNvbW1pdGVkRGF0ZSA9IG1vbWVudCh0aGlzLnN0YXRlLmNvbW1pdC5jb21taXRlZEF0KS5mb3JtYXQoJ0QgTU1NJyk7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwibGF5ZXItdG9vbHRpcFwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInNlY3Rpb25cIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInNlY3Rpb24taWNvblwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJpY29uIGljb24tZ2l0LWNvbW1pdFwiIC8+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzZWN0aW9uLWNvbnRlbnRcIj5cbiAgICAgICAgICAgIDxoMSBjbGFzc05hbWU9XCJzZWN0aW9uLXRpdGxlXCI+XG4gICAgICAgICAgICAgIDxhIG9uQ2xpY2s9e3RoaXMuY2xpY2tIYW5kbGVyKCdDb21taXQgdGl0bGUnKX0gaHJlZj17YCR7dGhpcy5zdGF0ZS5tZXRhZGF0YS5yZXBvQ29tbWl0VXJsfS8ke3RoaXMuc3RhdGUuY29tbWl0LmNvbW1pdEhhc2h9YH0+XG4gICAgICAgICAgICAgICAge3RoaXMuc3RhdGUuY29tbWl0LnN1YmplY3R9XG4gICAgICAgICAgICAgIDwvYT5cbiAgICAgICAgICAgIDwvaDE+XG4gICAgICAgICAgICA8QnVpbGRTdGF0dXMgc3RhdHVzPXt0aGlzLnN0YXRlLmNvbW1pdC5zdGF0dXN9Lz5cbiAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInNlY3Rpb24tYm9keVwiPlxuICAgICAgICAgICAgICA8Y29kZT5cbiAgICAgICAgICAgICAgICA8YSBvbkNsaWNrPXt0aGlzLmNsaWNrSGFuZGxlcignQ29tbWl0IGhhc2gnKX0gaHJlZj17YCR7dGhpcy5zdGF0ZS5tZXRhZGF0YS5yZXBvQ29tbWl0VXJsfS8ke3RoaXMuc3RhdGUuY29tbWl0LmNvbW1pdEhhc2h9YH0+XG4gICAgICAgICAgICAgICAgICB7dGhpcy5zdGF0ZS5jb21taXQuY29tbWl0SGFzaC5zdWJzdHIoMCw2KX1cbiAgICAgICAgICAgICAgICA8L2E+XG4gICAgICAgICAgICAgIDwvY29kZT4gYnkge3RoaXMuc3RhdGUuY29tbWl0LmF1dGhvcn0gY29tbWl0dGVkIG9uIHtjb21taXRlZERhdGV9XG4gICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJzZWN0aW9uLXN0YXR1c1wiPlxuICAgICAgICAgICAgICAgIDxzcGFuIHRpdGxlPVwiSW5zZXJ0aW9uc1wiIGNsYXNzTmFtZT1cImdyZWVuXCI+K3t0aGlzLnN0YXRlLmNvbW1pdC5pbnNlcnRpb25zfSZuYnNwOzwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8c3BhbiB0aXRsZT1cIkRlbGV0aW9uc1wiIGNsYXNzTmFtZT1cInJlZFwiPi17dGhpcy5zdGF0ZS5jb21taXQuZGVsZXRpb25zfSZuYnNwOzwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8c3BhbiB0aXRsZT1cIkZpbGVzIENoYW5nZWRcIj48aSBjbGFzc05hbWU9XCJpY29uIGljb24tZGlmZlwiIC8+e3RoaXMuc3RhdGUuY29tbWl0LmZpbGVzQ2hhbmdlZH08L3NwYW4+XG4gICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIHt0aGlzLnN0YXRlLnB1bGxSZXF1ZXN0cy5tYXAoKHB1bGxSZXF1ZXN0KSA9PiB7XG4gICAgICAgICAgY29uc3QgdmVyYiA9IHB1bGxSZXF1ZXN0LnN0YXRlLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic2VjdGlvblwiPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInNlY3Rpb24taWNvblwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiaWNvbiBpY29uLWdpdC1wdWxsLXJlcXVlc3RcIiAvPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzZWN0aW9uLWNvbnRlbnRcIj5cbiAgICAgICAgICAgICAgICA8aDEgY2xhc3NOYW1lPVwic2VjdGlvbi10aXRsZVwiPlxuICAgICAgICAgICAgICAgICAgPGEgb25DbGljaz17dGhpcy5jbGlja0hhbmRsZXIoJ1B1bGwgUmVxdWVzdCB0aXRsZScpfSBocmVmPXtwdWxsUmVxdWVzdC51cmx9PlxuICAgICAgICAgICAgICAgICAgICB7cHVsbFJlcXVlc3QudGl0bGV9XG4gICAgICAgICAgICAgICAgICA8L2E+XG4gICAgICAgICAgICAgICAgPC9oMT5cbiAgICAgICAgICAgICAgICA8QnVpbGRTdGF0dXMgc3RhdHVzPXtwdWxsUmVxdWVzdC5zdGF0dXN9Lz5cbiAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJzZWN0aW9uLWJvZHlcIj5cbiAgICAgICAgICAgICAgICAgIDxjb2RlPlxuICAgICAgICAgICAgICAgICAgICA8YSBvbkNsaWNrPXt0aGlzLmNsaWNrSGFuZGxlcignUHVsbCBSZXF1ZXN0IG51bWJlcicpfSBocmVmPXtwdWxsUmVxdWVzdC51cmx9PlxuICAgICAgICAgICAgICAgICAgICAgICN7cHVsbFJlcXVlc3QubnVtYmVyfVxuICAgICAgICAgICAgICAgICAgICA8L2E+XG4gICAgICAgICAgICAgICAgICA8L2NvZGU+IGJ5IHtwdWxsUmVxdWVzdC5hdXRob3IubG9naW59IHt2ZXJifSBvbiB7bW9tZW50KHB1bGxSZXF1ZXN0LmNyZWF0ZWRBdCkuZm9ybWF0KCdEIE1NTScpfVxuICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJzZWN0aW9uLXN0YXR1c1wiPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiB0aXRsZT1cIlRvdGFsIENvbW1pdHNcIj48aSBjbGFzc05hbWU9XCJpY29uIGljb24tZ2l0LWNvbW1pdFwiIC8+e3B1bGxSZXF1ZXN0LmNvbW1pdENvdW50fTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICApXG4gICAgICAgIH0pfVxuICAgICAgICB7dGhpcy5zdGF0ZS5naXRodWJJc3N1ZXMubWFwKChpc3N1ZSkgPT4ge1xuICAgICAgICAgIGxldCBpc3N1ZUljb24gPSAnaWNvbiBpY29uLWlzc3VlLW9wZW5lZCBncmVlbic7XG4gICAgICAgICAgaWYoaXNzdWUuc3RhdGUgPT09ICdDTE9TRUQnKXtcbiAgICAgICAgICAgIGlzc3VlSWNvbiA9ICdpY29uIGljb24taXNzdWUtY2xvc2VkIHJlZCdcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic2VjdGlvblwiPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInNlY3Rpb24taWNvblwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiaWNvbiBpY29uLWlzc3VlLW9wZW5lZFwiIC8+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInNlY3Rpb24tY29udGVudFwiPlxuICAgICAgICAgICAgICAgIDxoMSBjbGFzc05hbWU9XCJzZWN0aW9uLXRpdGxlXCI+XG4gICAgICAgICAgICAgICAgICA8YSBvbkNsaWNrPXt0aGlzLmNsaWNrSGFuZGxlcignSXNzdWUgdGl0bGUnKX0gaHJlZj17aXNzdWUudXJsfT57aXNzdWUudGl0bGV9PC9hPlxuICAgICAgICAgICAgICAgIDwvaDE+XG4gICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwic2VjdGlvbi1ib2R5XCI+XG4gICAgICAgICAgICAgICAgICA8aSBjbGFzc05hbWU9e2BpY29uICR7aXNzdWVJY29ufWB9IC8+XG4gICAgICAgICAgICAgICAgICA8Y29kZT5cbiAgICAgICAgICAgICAgICAgICAgPGEgb25DbGljaz17dGhpcy5jbGlja0hhbmRsZXIoJ0lzc3VlIG51bWJlcicpfSBocmVmPXtpc3N1ZS51cmx9PiN7aXNzdWUubnVtYmVyfTwvYT5cbiAgICAgICAgICAgICAgICAgIDwvY29kZT4gYnkge2lzc3VlLmF1dGhvci5sb2dpbn1cbiAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwic2VjdGlvbi1zdGF0dXNcIj57aXNzdWUuc3RhdGUudG9Mb3dlckNhc2UoKX08L3NwYW4+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgKVxuICAgICAgICB9KX1cbiAgICAgICAge3RoaXMuc3RhdGUuamlyYUlzc3Vlcy5tYXAoKGlzc3VlKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic2VjdGlvblwiPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInNlY3Rpb24taWNvblwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiaWNvbiBzdGVwc2l6ZS1pY29uLWppcmFcIiAvPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzZWN0aW9uLWNvbnRlbnRcIj5cbiAgICAgICAgICAgICAgICA8aDEgY2xhc3NOYW1lPVwic2VjdGlvbi10aXRsZVwiPlxuICAgICAgICAgICAgICAgICAgPGEgb25DbGljaz17dGhpcy5jbGlja0hhbmRsZXIoJ0ppcmEgdGlja2V0IHRpdGxlJyl9IGhyZWY9e2lzc3VlLnVybH0+e2lzc3VlLnN1bW1hcnl9PC9hPlxuICAgICAgICAgICAgICAgIDwvaDE+XG4gICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwic2VjdGlvbi1ib2R5XCI+XG4gICAgICAgICAgICAgICAgICA8aW1nIGNsYXNzTmFtZT1cImljb25cIiBzcmM9e2lzc3VlLmlzc3VlVHlwZS5pY29uVXJsfSBhbHQ9e2lzc3VlLmlzc3VlVHlwZS5uYW1lfS8+XG4gICAgICAgICAgICAgICAgICA8Y29kZT5cbiAgICAgICAgICAgICAgICAgICAgPGEgb25DbGljaz17dGhpcy5jbGlja0hhbmRsZXIoJ0ppcmEgdGlja2V0IGtleScpfSBocmVmPXtpc3N1ZS51cmx9Pntpc3N1ZS5rZXl9PC9hPlxuICAgICAgICAgICAgICAgICAgPC9jb2RlPiBjcmVhdGVkIGJ5IHtpc3N1ZS5jcmVhdG9yLmRpc3BsYXlOYW1lfSAmIGFzc2lnbmVkIHRvIHtpc3N1ZS5hc3NpZ25lZS5kaXNwbGF5TmFtZSB8fCAnTm9ib2R5J31cbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInNlY3Rpb24tc3RhdHVzXCIgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6IGAke2lzc3VlLnN0YXR1cy5zdGF0dXNDYXRlZ29yeS5jb2xvck5hbWV9YFxuICAgICAgICAgICAgICAgICAgfX0+e2lzc3VlLnN0YXR1cy5uYW1lLnRvTG93ZXJDYXNlKCl9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICApXG4gICAgICAgIH0pfVxuICAgICAgICA8U2VhcmNoSW5MYXllclxuICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuY2xpY2tMYXllclNlYXJjaC5iaW5kKHRoaXMpfVxuICAgICAgICAgIG9uTW91c2VFbnRlcj17dGhpcy5tb3VzZUVudGVyTGF5ZXJTZWFyY2guYmluZCh0aGlzKX1cbiAgICAgICAgICBvbk1vdXNlTGVhdmU9e3RoaXMubW91c2VMZWF2ZUxheWVyU2VhcmNoLmJpbmQodGhpcyl9XG4gICAgICAgIC8+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgZm9ybWF0dGVkVGV4dCgpIHtcbiAgICBjb25zdCBjb21taXQgPSB0aGlzLnByb3BzLmNvbW1pdDtcbiAgICBjb25zdCBkYXRlID0gY29tbWl0LmNvbW1pdGVkQXQ7XG4gICAgY29uc3QgZm9ybWF0dGVkRGF0ZSA9IG1vbWVudChkYXRlKS5mb3JtYXQoQ29uZmlnTWFuYWdlci5nZXQoJ2d1dHRlckRhdGVGb3JtYXQnKSk7XG4gICAgY29uc3QgYXV0aG9yID0gY29tbWl0LmF1dGhvcjtcbiAgICByZXR1cm4gYCR7Zm9ybWF0dGVkRGF0ZX0gJHthdXRob3J9YFxuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGlmKHRoaXMuc3RhdGUuY29tbWl0LmNvbW1pdEhhc2guc3Vic3RyKDAsNikgPT09ICcwMDAwMDAnKXtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxkaXY+XG4gICAgICAgICAge3RoaXMuZm9ybWF0dGVkVGV4dCgpfVxuICAgICAgICA8L2Rpdj5cbiAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiAoXG4gICAgICA8VG9vbHRpcENvbnRhaW5lclxuICAgICAgICB0b29sdGlwQ29udGVudD17dGhpcy50b29sdGlwLmJpbmQodGhpcyl9XG4gICAgICA+XG4gICAgICAgIHt0aGlzLmZvcm1hdHRlZFRleHQoKX1cbiAgICAgIDwvVG9vbHRpcENvbnRhaW5lcj5cbiAgICApO1xuICB9XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgR3V0dGVySXRlbTtcbiJdfQ==