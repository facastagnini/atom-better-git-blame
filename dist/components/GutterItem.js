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
