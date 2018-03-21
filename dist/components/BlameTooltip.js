'use babel';
import React from 'preact-compat';
import moment from 'moment';
import AgeSection from './AgeSection';
import BuildStatus from './BuildStatus';
import SearchInLayer from './SearchInLayer';
import * as ConfigManager from '../ConfigManager';
import * as Analytics from '../stepsize/Analytics';
import * as IntegrationNotification from '../interface/IntegrationNotification';
class BlameTooltip extends React.PureComponent {
    constructor(...props) {
        super(...props);
        Analytics.track('Tooltip shown', { type: 'blame' });
        IntegrationNotification.trackTooltipShown();
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
    render() {
        const commitedDate = moment(this.props.commit.commitedAt).format('D MMM');
        return (React.createElement("div", { className: "layer-tooltip" },
            React.createElement("div", { className: "section" },
                React.createElement("div", { className: "section-icon" },
                    React.createElement("div", { className: "icon icon-git-commit" })),
                React.createElement("div", { className: "section-content" },
                    React.createElement("h1", { className: "section-title" },
                        React.createElement("a", { onClick: this.clickHandler('Commit title'), href: `${this.props.metadata.repoCommitUrl}/${this.props.commit.commitHash}` }, this.props.commit.subject)),
                    React.createElement(BuildStatus, { buildStatus: this.props.commit.buildStatus }),
                    React.createElement("p", { className: "section-body" },
                        React.createElement("code", null,
                            React.createElement("a", { onClick: this.clickHandler('Commit hash'), href: `${this.props.metadata.repoCommitUrl}/${this.props.commit.commitHash}` }, this.props.commit.commitHash.substr(0, 6))),
                        " by ",
                        this.props.commit.author,
                        " committed on ",
                        commitedDate),
                    React.createElement("span", { className: "section-status" },
                        React.createElement("span", { title: "Insertions", className: "green" },
                            "+",
                            this.props.commit.insertions,
                            "\u00A0"),
                        React.createElement("span", { title: "Deletions", className: "red" },
                            "-",
                            this.props.commit.deletions,
                            "\u00A0"),
                        React.createElement("span", { title: "Files Changed" },
                            React.createElement("i", { className: "icon icon-diff" }),
                            this.props.commit.filesChanged)))),
            this.props.pullRequests.map((pullRequest) => {
                const actor = pullRequest.author.username || pullRequest.author.name;
                const verb = pullRequest.state === 'Open' ? 'opened' : pullRequest.state.toLowerCase();
                const verbedAt = verb === 'merged' ? pullRequest.mergedAt : pullRequest.createdAt;
                return (React.createElement("div", { className: "section" },
                    React.createElement("div", { className: "section-icon" },
                        React.createElement("div", { className: "icon icon-git-pull-request" })),
                    React.createElement("div", { className: "section-content" },
                        React.createElement("h1", { className: "section-title" },
                            React.createElement("a", { onClick: this.clickHandler('Pull Request title'), href: pullRequest.url }, pullRequest.title)),
                        React.createElement(BuildStatus, { buildStatus: pullRequest.buildStatus }),
                        React.createElement("p", { className: "section-body" },
                            React.createElement("code", null,
                                React.createElement("a", { onClick: this.clickHandler('Pull Request number'), href: pullRequest.url },
                                    pullRequest.source === 'GitLab' ? '!' : '#',
                                    pullRequest.number)),
                            " by ",
                            actor,
                            " ",
                            verb,
                            " on ",
                            moment(verbedAt).format('D MMM')),
                        React.createElement("span", { className: "section-status" },
                            React.createElement("span", { title: "Total Commits" },
                                React.createElement("i", { className: "icon icon-git-commit" }),
                                pullRequest.commitCount)))));
            }),
            this.props.issues.map((issue) => {
                const assignee = issue.assignees && issue.assignees[0] ? issue.assignees[0].username : null;
                if (issue.source === 'GitHub' || issue.source === 'GitLab') {
                    let issueIcon = 'icon icon-issue-opened green';
                    if (issue.state === 'Closed') {
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
                                        issue.key)),
                                " created by ",
                                issue.author.username || issue.author.name,
                                assignee ? ` & assigned to ${assignee}` : ''),
                            React.createElement("span", { className: "section-status" }, issue.state === 'Opened' ? 'open' : issue.state))));
                }
                else if (issue.source === 'Jira') {
                    return (React.createElement("div", { className: "section" },
                        React.createElement("div", { className: "section-icon" },
                            React.createElement("div", { className: "icon stepsize-icon-jira" })),
                        React.createElement("div", { className: "section-content" },
                            React.createElement("h1", { className: "section-title" },
                                React.createElement("a", { onClick: this.clickHandler('Jira ticket title'), href: issue.url }, issue.title)),
                            React.createElement("p", { className: "section-body" },
                                React.createElement("img", { className: "icon", src: issue.type.iconUrl, alt: issue.type.name }),
                                React.createElement("code", null,
                                    React.createElement("a", { onClick: this.clickHandler('Jira ticket key'), href: issue.url }, issue.key)),
                                " created by ",
                                issue.author.username,
                                assignee ? ` & assigned to ${assignee}` : '',
                                React.createElement("span", { className: "section-status", style: {
                                        color: `${issue.state.colour}`
                                    } }, issue.state.name)))));
                }
            }),
            !ConfigManager.get('displayAgeSection') ?
                null :
                React.createElement("div", { className: "section" },
                    React.createElement("div", { className: "section-icon" },
                        React.createElement("div", { className: "icon icon-clock" })),
                    React.createElement("div", { className: "section-content" },
                        React.createElement(AgeSection, { commitDay: this.props.commitDay, firstCommitDate: this.props.firstCommitDate, commit: this.props.commit }))),
            React.createElement(SearchInLayer, { onClick: this.clickLayerSearch.bind(this), onMouseEnter: this.mouseEnterLayerSearch.bind(this), onMouseLeave: this.mouseLeaveLayerSearch.bind(this) })));
    }
}
export default BlameTooltip;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmxhbWVUb29sdGlwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vbGliL2NvbXBvbmVudHMvQmxhbWVUb29sdGlwLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUM7QUFFWixPQUFPLEtBQUssTUFBTSxlQUFlLENBQUM7QUFDbEMsT0FBTyxNQUFNLE1BQU0sUUFBUSxDQUFDO0FBQzVCLE9BQU8sVUFBVSxNQUFNLGNBQWMsQ0FBQztBQUN0QyxPQUFPLFdBQVcsTUFBTSxlQUFlLENBQUM7QUFDeEMsT0FBTyxhQUFhLE1BQU0saUJBQWlCLENBQUM7QUFDNUMsT0FBTyxLQUFLLGFBQWEsTUFBTSxrQkFBa0IsQ0FBQztBQUNsRCxPQUFPLEtBQUssU0FBUyxNQUFNLHVCQUF1QixDQUFDO0FBQ25ELE9BQU8sS0FBSyx1QkFBdUIsTUFBTSxzQ0FBc0MsQ0FBQztBQVloRixrQkFBbUIsU0FBUSxLQUFLLENBQUMsYUFBeUM7SUFFeEUsWUFBWSxHQUFHLEtBQVk7UUFDekIsS0FBSyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUM7UUFDaEIsU0FBUyxDQUFDLEtBQUssQ0FBQyxlQUFlLEVBQUUsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUNwRCx1QkFBdUIsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0lBQzlDLENBQUM7SUFFRCxnQkFBZ0I7UUFDZCxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDM0MsQ0FBQztJQUVELHFCQUFxQjtRQUNuQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsQ0FBQztJQUNuRCxDQUFDO0lBRUQscUJBQXFCO1FBQ25CLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0lBQ25ELENBQUM7SUFFRCxZQUFZLENBQUMsS0FBSztR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LG1CQUFtQixDQUFDO2dCQUNyQyxJQUFJO2dCQUNKLDZCQUFLLFNBQVMsRUFBQyxTQUFTO29CQUN0Qiw2QkFBSyxTQUFTLEVBQUMsY0FBYzt3QkFDM0IsNkJBQUssU0FBUyxFQUFDLGlCQUFpQixHQUFHLENBQy9CO29CQUNOLDZCQUFLLFNBQVMsRUFBQyxpQkFBaUI7d0JBQzlCLG9CQUFDLFVBQVUsSUFDVCxTQUFTLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQy9CLGVBQWUsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsRUFDM0MsTUFBTSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUN6QixDQUNFLENBQ0Y7WUFFVixvQkFBQyxhQUFhLElBQ1osT0FBTyxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQ3pDLFlBQVksRUFBRSxJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUNuRCxZQUFZLEVBQUUsSUFBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FDbkQsQ0FDRSxDQUNQLENBQUM7SUFDSixDQUFDO0NBQ0Y7QUFFRCxlQUFlLFlBQVksQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncHJlYWN0LWNvbXBhdCc7XG5pbXBvcnQgbW9tZW50IGZyb20gJ21vbWVudCc7XG5pbXBvcnQgQWdlU2VjdGlvbiBmcm9tICcuL0FnZVNlY3Rpb24nO1xuaW1wb3J0IEJ1aWxkU3RhdHVzIGZyb20gJy4vQnVpbGRTdGF0dXMnO1xuaW1wb3J0IFNlYXJjaEluTGF5ZXIgZnJvbSAnLi9TZWFyY2hJbkxheWVyJztcbmltcG9ydCAqIGFzIENvbmZpZ01hbmFnZXIgZnJvbSAnLi4vQ29uZmlnTWFuYWdlcic7XG5pbXBvcnQgKiBhcyBBbmFseXRpY3MgZnJvbSAnLi4vc3RlcHNpemUvQW5hbHl0aWNzJztcbmltcG9ydCAqIGFzIEludGVncmF0aW9uTm90aWZpY2F0aW9uIGZyb20gJy4uL2ludGVyZmFjZS9JbnRlZ3JhdGlvbk5vdGlmaWNhdGlvbic7XG5cbmludGVyZmFjZSBJQmxhbWVUb29sdGlwUHJvcHMge1xuICBlbWl0dGVyOiBhbnlcbiAgY29tbWl0OiBhbnlcbiAgY29tbWl0RGF5OiBudW1iZXJcbiAgZmlyc3RDb21taXREYXRlOiBEYXRlXG4gIHB1bGxSZXF1ZXN0czogYW55XG4gIGlzc3VlczogQXJyYXk8YW55PlxuICBtZXRhZGF0YTogYW55XG59XG5cbmNsYXNzIEJsYW1lVG9vbHRpcCBleHRlbmRzIFJlYWN0LlB1cmVDb21wb25lbnQ8SUJsYW1lVG9vbHRpcFByb3BzLCBvYmplY3Q+IHtcblxuICBjb25zdHJ1Y3RvciguLi5wcm9wczogYW55W10pIHtcbiAgICBzdXBlciguLi5wcm9wcyk7XG4gICAgQW5hbHl0aWNzLnRyYWNrKCdUb29sdGlwIHNob3duJywgeyB0eXBlOiAnYmxhbWUnIH0pO1xuICAgIEludGVncmF0aW9uTm90aWZpY2F0aW9uLnRyYWNrVG9vbHRpcFNob3duKCk7XG4gIH1cblxuICBjbGlja0xheWVyU2VhcmNoKCl7XG4gICAgdGhpcy5wcm9wcy5lbWl0dGVyLmVtaXQoJ2NsaWNrZWRTZWFyY2gnKTtcbiAgfVxuXG4gIG1vdXNlRW50ZXJMYXllclNlYXJjaCgpe1xuICAgIHRoaXMucHJvcHMuZW1pdHRlci5lbWl0KCdtb3VzZUVudGVyTGF5ZXJTZWFyY2gnKTtcbiAgfVxuXG4gIG1vdXNlTGVhdmVMYXllclNlYXJjaCgpe1xuICAgIHRoaXMucHJvcHMuZW1pdHRlci5lbWl0KCdtb3VzZUxlYXZlTGF5ZXJTZWFyY2gnKTtcbiAgfVxuXG4gIGNsaWNrSGFuZGxlcihsYWJlbCl7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIEFuYWx5dGljcy50cmFjayhgQ2xpY2tlZCBsaW5rYCwge2xhYmVsfSk7XG4gICAgfTtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCBjb21taXRlZERhdGUgPSBtb21lbnQodGhpcy5wcm9wcy5jb21taXQuY29tbWl0ZWRBdCkuZm9ybWF0KCdEIE1NTScpO1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImxheWVyLXRvb2x0aXBcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzZWN0aW9uXCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzZWN0aW9uLWljb25cIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiaWNvbiBpY29uLWdpdC1jb21taXRcIiAvPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic2VjdGlvbi1jb250ZW50XCI+XG4gICAgICAgICAgICA8aDEgY2xhc3NOYW1lPVwic2VjdGlvbi10aXRsZVwiPlxuICAgICAgICAgICAgICA8YSBvbkNsaWNrPXt0aGlzLmNsaWNrSGFuZGxlcignQ29tbWl0IHRpdGxlJyl9IGhyZWY9e2Ake3RoaXMucHJvcHMubWV0YWRhdGEucmVwb0NvbW1pdFVybH0vJHt0aGlzLnByb3BzLmNvbW1pdC5jb21taXRIYXNofWB9PlxuICAgICAgICAgICAgICAgIHt0aGlzLnByb3BzLmNvbW1pdC5zdWJqZWN0fVxuICAgICAgICAgICAgICA8L2E+XG4gICAgICAgICAgICA8L2gxPlxuICAgICAgICAgICAgPEJ1aWxkU3RhdHVzIGJ1aWxkU3RhdHVzPXt0aGlzLnByb3BzLmNvbW1pdC5idWlsZFN0YXR1c30vPlxuICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwic2VjdGlvbi1ib2R5XCI+XG4gICAgICAgICAgICAgIDxjb2RlPlxuICAgICAgICAgICAgICAgIDxhIG9uQ2xpY2s9e3RoaXMuY2xpY2tIYW5kbGVyKCdDb21taXQgaGFzaCcpfSBocmVmPXtgJHt0aGlzLnByb3BzLm1ldGFkYXRhLnJlcG9Db21taXRVcmx9LyR7dGhpcy5wcm9wcy5jb21taXQuY29tbWl0SGFzaH1gfT5cbiAgICAgICAgICAgICAgICAgIHt0aGlzLnByb3BzLmNvbW1pdC5jb21taXRIYXNoLnN1YnN0cigwLDYpfVxuICAgICAgICAgICAgICAgIDwvYT5cbiAgICAgICAgICAgICAgPC9jb2RlPiBieSB7dGhpcy5wcm9wcy5jb21taXQuYXV0aG9yfSBjb21taXR0ZWQgb24ge2NvbW1pdGVkRGF0ZX1cbiAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInNlY3Rpb24tc3RhdHVzXCI+XG4gICAgICAgICAgICAgICAgPHNwYW4gdGl0bGU9XCJJbnNlcnRpb25zXCIgY2xhc3NOYW1lPVwiZ3JlZW5cIj4re3RoaXMucHJvcHMuY29tbWl0Lmluc2VydGlvbnN9Jm5ic3A7PC9zcGFuPlxuICAgICAgICAgICAgICAgIDxzcGFuIHRpdGxlPVwiRGVsZXRpb25zXCIgY2xhc3NOYW1lPVwicmVkXCI+LXt0aGlzLnByb3BzLmNvbW1pdC5kZWxldGlvbnN9Jm5ic3A7PC9zcGFuPlxuICAgICAgICAgICAgICAgIDxzcGFuIHRpdGxlPVwiRmlsZXMgQ2hhbmdlZFwiPjxpIGNsYXNzTmFtZT1cImljb24gaWNvbi1kaWZmXCIgLz57dGhpcy5wcm9wcy5jb21taXQuZmlsZXNDaGFuZ2VkfTwvc3Bhbj5cbiAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAge3RoaXMucHJvcHMucHVsbFJlcXVlc3RzLm1hcCgocHVsbFJlcXVlc3QpID0+IHtcbiAgICAgICAgICBjb25zdCBhY3RvciA9IHB1bGxSZXF1ZXN0LmF1dGhvci51c2VybmFtZSB8fCBwdWxsUmVxdWVzdC5hdXRob3IubmFtZTtcbiAgICAgICAgICBjb25zdCB2ZXJiID0gcHVsbFJlcXVlc3Quc3RhdGUgPT09ICdPcGVuJyA/ICdvcGVuZWQnIDogcHVsbFJlcXVlc3Quc3RhdGUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICBjb25zdCB2ZXJiZWRBdCA9IHZlcmIgPT09ICdtZXJnZWQnID8gcHVsbFJlcXVlc3QubWVyZ2VkQXQgOiBwdWxsUmVxdWVzdC5jcmVhdGVkQXQ7XG4gICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic2VjdGlvblwiPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInNlY3Rpb24taWNvblwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiaWNvbiBpY29uLWdpdC1wdWxsLXJlcXVlc3RcIiAvPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzZWN0aW9uLWNvbnRlbnRcIj5cbiAgICAgICAgICAgICAgICA8aDEgY2xhc3NOYW1lPVwic2VjdGlvbi10aXRsZVwiPlxuICAgICAgICAgICAgICAgICAgPGEgb25DbGljaz17dGhpcy5jbGlja0hhbmRsZXIoJ1B1bGwgUmVxdWVzdCB0aXRsZScpfSBocmVmPXtwdWxsUmVxdWVzdC51cmx9PlxuICAgICAgICAgICAgICAgICAgICB7cHVsbFJlcXVlc3QudGl0bGV9XG4gICAgICAgICAgICAgICAgICA8L2E+XG4gICAgICAgICAgICAgICAgPC9oMT5cbiAgICAgICAgICAgICAgICA8QnVpbGRTdGF0dXMgYnVpbGRTdGF0dXM9e3B1bGxSZXF1ZXN0LmJ1aWxkU3RhdHVzfS8+XG4gICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwic2VjdGlvbi1ib2R5XCI+XG4gICAgICAgICAgICAgICAgICA8Y29kZT5cbiAgICAgICAgICAgICAgICAgICAgPGEgb25DbGljaz17dGhpcy5jbGlja0hhbmRsZXIoJ1B1bGwgUmVxdWVzdCBudW1iZXInKX0gaHJlZj17cHVsbFJlcXVlc3QudXJsfT5cbiAgICAgICAgICAgICAgICAgICAgICB7cHVsbFJlcXVlc3Quc291cmNlID09PSAnR2l0TGFiJyA/ICchJyA6ICcjJ317cHVsbFJlcXVlc3QubnVtYmVyfVxuICAgICAgICAgICAgICAgICAgICA8L2E+XG4gICAgICAgICAgICAgICAgICA8L2NvZGU+IGJ5IHthY3Rvcn0ge3ZlcmJ9IG9uIHttb21lbnQodmVyYmVkQXQpLmZvcm1hdCgnRCBNTU0nKX1cbiAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwic2VjdGlvbi1zdGF0dXNcIj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gdGl0bGU9XCJUb3RhbCBDb21taXRzXCI+PGkgY2xhc3NOYW1lPVwiaWNvbiBpY29uLWdpdC1jb21taXRcIiAvPntwdWxsUmVxdWVzdC5jb21taXRDb3VudH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgKVxuICAgICAgICB9KX1cbiAgICAgICAge3RoaXMucHJvcHMuaXNzdWVzLm1hcCgoaXNzdWUpID0+IHtcbiAgICAgICAgICBjb25zdCBhc3NpZ25lZSA9IGlzc3VlLmFzc2lnbmVlcyAmJiBpc3N1ZS5hc3NpZ25lZXNbMF0gPyBpc3N1ZS5hc3NpZ25lZXNbMF0udXNlcm5hbWUgOiBudWxsO1xuICAgICAgICAgIGlmIChpc3N1ZS5zb3VyY2UgPT09ICdHaXRIdWInIHx8IGlzc3VlLnNvdXJjZSA9PT0gJ0dpdExhYicpIHtcbiAgICAgICAgICAgIGxldCBpc3N1ZUljb24gPSAnaWNvbiBpY29uLWlzc3VlLW9wZW5lZCBncmVlbic7XG4gICAgICAgICAgICBpZiAoaXNzdWUuc3RhdGUgPT09ICdDbG9zZWQnKSB7XG4gICAgICAgICAgICAgIGlzc3VlSWNvbiA9ICdpY29uIGljb24taXNzdWUtY2xvc2VkIHJlZCdcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic2VjdGlvblwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic2VjdGlvbi1pY29uXCI+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImljb24gaWNvbi1pc3N1ZS1vcGVuZWRcIiAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic2VjdGlvbi1jb250ZW50XCI+XG4gICAgICAgICAgICAgICAgICA8aDEgY2xhc3NOYW1lPVwic2VjdGlvbi10aXRsZVwiPlxuICAgICAgICAgICAgICAgICAgICA8YSBvbkNsaWNrPXt0aGlzLmNsaWNrSGFuZGxlcignSXNzdWUgdGl0bGUnKX0gaHJlZj17aXNzdWUudXJsfT57aXNzdWUudGl0bGV9PC9hPlxuICAgICAgICAgICAgICAgICAgPC9oMT5cbiAgICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInNlY3Rpb24tYm9keVwiPlxuICAgICAgICAgICAgICAgICAgICA8aSBjbGFzc05hbWU9e2BpY29uICR7aXNzdWVJY29ufWB9IC8+XG4gICAgICAgICAgICAgICAgICAgIDxjb2RlPlxuICAgICAgICAgICAgICAgICAgICAgIDxhIG9uQ2xpY2s9e3RoaXMuY2xpY2tIYW5kbGVyKCdJc3N1ZSBudW1iZXInKX0gaHJlZj17aXNzdWUudXJsfT4je2lzc3VlLmtleX08L2E+XG4gICAgICAgICAgICAgICAgICAgIDwvY29kZT4gY3JlYXRlZCBieSB7aXNzdWUuYXV0aG9yLnVzZXJuYW1lIHx8IGlzc3VlLmF1dGhvci5uYW1lfXthc3NpZ25lZSA/IGAgJiBhc3NpZ25lZCB0byAke2Fzc2lnbmVlfWAgOiAnJ31cbiAgICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInNlY3Rpb24tc3RhdHVzXCI+e2lzc3VlLnN0YXRlID09PSAnT3BlbmVkJyA/ICdvcGVuJyA6IGlzc3VlLnN0YXRlfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApXG4gICAgICAgICAgfSBlbHNlIGlmIChpc3N1ZS5zb3VyY2UgPT09ICdKaXJhJykge1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzZWN0aW9uXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzZWN0aW9uLWljb25cIj5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiaWNvbiBzdGVwc2l6ZS1pY29uLWppcmFcIiAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic2VjdGlvbi1jb250ZW50XCI+XG4gICAgICAgICAgICAgICAgICA8aDEgY2xhc3NOYW1lPVwic2VjdGlvbi10aXRsZVwiPlxuICAgICAgICAgICAgICAgICAgICA8YSBvbkNsaWNrPXt0aGlzLmNsaWNrSGFuZGxlcignSmlyYSB0aWNrZXQgdGl0bGUnKX0gaHJlZj17aXNzdWUudXJsfT57aXNzdWUudGl0bGV9PC9hPlxuICAgICAgICAgICAgICAgICAgPC9oMT5cbiAgICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInNlY3Rpb24tYm9keVwiPlxuICAgICAgICAgICAgICAgICAgICA8aW1nIGNsYXNzTmFtZT1cImljb25cIiBzcmM9e2lzc3VlLnR5cGUuaWNvblVybH0gYWx0PXtpc3N1ZS50eXBlLm5hbWV9Lz5cbiAgICAgICAgICAgICAgICAgICAgPGNvZGU+XG4gICAgICAgICAgICAgICAgICAgICAgPGEgb25DbGljaz17dGhpcy5jbGlja0hhbmRsZXIoJ0ppcmEgdGlja2V0IGtleScpfSBocmVmPXtpc3N1ZS51cmx9Pntpc3N1ZS5rZXl9PC9hPlxuICAgICAgICAgICAgICAgICAgICA8L2NvZGU+IGNyZWF0ZWQgYnkge2lzc3VlLmF1dGhvci51c2VybmFtZX17YXNzaWduZWUgPyBgICYgYXNzaWduZWQgdG8gJHthc3NpZ25lZX1gIDogJyd9XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInNlY3Rpb24tc3RhdHVzXCIgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICAgICAgICBjb2xvcjogYCR7aXNzdWUuc3RhdGUuY29sb3VyfWBcbiAgICAgICAgICAgICAgICAgICAgfX0+e2lzc3VlLnN0YXRlLm5hbWV9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIClcbiAgICAgICAgICB9XG4gICAgICAgIH0pfVxuICAgICAgICB7XG4gICAgICAgICAgIUNvbmZpZ01hbmFnZXIuZ2V0KCdkaXNwbGF5QWdlU2VjdGlvbicpID9cbiAgICAgICAgICAgIG51bGwgOlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzZWN0aW9uXCI+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic2VjdGlvbi1pY29uXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJpY29uIGljb24tY2xvY2tcIiAvPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzZWN0aW9uLWNvbnRlbnRcIj5cbiAgICAgICAgICAgICAgICA8QWdlU2VjdGlvblxuICAgICAgICAgICAgICAgICAgY29tbWl0RGF5PXt0aGlzLnByb3BzLmNvbW1pdERheX1cbiAgICAgICAgICAgICAgICAgIGZpcnN0Q29tbWl0RGF0ZT17dGhpcy5wcm9wcy5maXJzdENvbW1pdERhdGV9XG4gICAgICAgICAgICAgICAgICBjb21taXQ9e3RoaXMucHJvcHMuY29tbWl0fVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIH1cbiAgICAgICAgPFNlYXJjaEluTGF5ZXJcbiAgICAgICAgICBvbkNsaWNrPXt0aGlzLmNsaWNrTGF5ZXJTZWFyY2guYmluZCh0aGlzKX1cbiAgICAgICAgICBvbk1vdXNlRW50ZXI9e3RoaXMubW91c2VFbnRlckxheWVyU2VhcmNoLmJpbmQodGhpcyl9XG4gICAgICAgICAgb25Nb3VzZUxlYXZlPXt0aGlzLm1vdXNlTGVhdmVMYXllclNlYXJjaC5iaW5kKHRoaXMpfVxuICAgICAgICAvPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBCbGFtZVRvb2x0aXBcbiJdfQ==