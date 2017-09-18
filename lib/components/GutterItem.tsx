import { IEmitter } from 'emissary';

'use babel';

import React from 'preact-compat';
import moment from 'moment';
import TooltipContainer from './TooltipContainer';
import * as GitData from '../data/GitData';
import * as IntegrationData from '../data/IntegrationData';
import SearchInLayer from './SearchInLayer';
import * as ConfigManager from '../ConfigManager';

interface IGutterItemProps {
  commit: any;
  emitter: IEmitter;
}

interface IGutterItemState {
  commit: any;
  pullRequests: any;
  jiraIssues: any;
  githubIssues: any;
}

class GutterItem extends React.Component<IGutterItemProps, any> {

  constructor(...props){
    super(...props);
    this.state = {
      commit: {},
      pullRequests: [],
      jiraIssues: [],
      githubIssues: [],
      metadata: {},
    }
  }

  componentWillMount(){
    this.setState({commit: this.props.commit});
    if(this.props.commit.commitHash.substr(0,6) !== '000000'){
      GitData.getCommit(this.props.commit.repoPath, this.props.commit.commitHash)
        .then((commit) => {
          this.setState({
            ...this.state,
            commit : {
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

  componentDidMount(){
    if(this.props.commit.commitHash.substr(0,6) !== '000000') {
      IntegrationData
        .getPullRequestsForCommit(
          `${this.state.commit.repoPath}`,
          this.state.commit.commitHash
        )
        .then((pullRequests) => {
          this.setState({
            ...this.state,
            pullRequests: pullRequests
          });
          pullRequests.map(this.getIssuesForPullRequest.bind(this))
        });
    }
  }

  async getIssuesForPullRequest(pullRequest){
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

  clickLayerSearch(){
    this.props.emitter.emit('clickedSearch');
  }

  mouseEnterLayerSearch(){
    this.props.emitter.emit('mouseEnterLayerSearch');
  }

  mouseLeaveLayerSearch(){
    this.props.emitter.emit('mouseLeaveLayerSearch');
  }

  tooltip() {
    const commitedDate = moment(this.state.commit.commitedAt).format('D MMM');
    return (
      <div className="layer-tooltip">
        <div className="section">
          <div className="section-icon">
            <div className="icon icon-git-commit" />
          </div>
          <div className="section-content">
            <h1 className="section-title">
              <a href={`${this.state.metadata.repoCommitUrl}/${this.state.commit.commitHash}`}>
                {this.state.commit.subject}
              </a>
            </h1>
            <p className="section-body">
              <code>
                <a href={`${this.state.metadata.repoCommitUrl}/${this.state.commit.commitHash}`}>
                  {this.state.commit.commitHash.substr(0,6)}
                </a>
              </code> by {this.state.commit.author} committed on {commitedDate}
              <span className="section-status">
                <span title="Insertions" className="green">+{this.state.commit.insertions}&nbsp;</span>
                <span title="Deletions" className="red">-{this.state.commit.deletions}&nbsp;</span>
                <span title="Files Changed"><i className="icon icon-diff" />{this.state.commit.filesChanged}</span>
              </span>
            </p>
          </div>
        </div>
        {this.state.pullRequests.map((pullRequest) => {
          const verb = pullRequest.state.toLowerCase();
          return (
            <div className="section">
              <div className="section-icon">
                <div className="icon icon-git-pull-request" />
              </div>
              <div className="section-content">
                <h1 className="section-title"><a href={pullRequest.url}>{pullRequest.title}</a></h1>
                <p className="section-body">
                  <code>
                    <a href={pullRequest.url}>
                      #{pullRequest.number}
                    </a>
                  </code> by {pullRequest.author.login} {verb} on {moment(pullRequest.createdAt).format('D MMM')}
                  <span className="section-status">
                    <span title="Total Commits"><i className="icon icon-git-commit" />{pullRequest.commitCount}</span>
                  </span>
                </p>
              </div>
            </div>
          )
        })}
        {this.state.githubIssues.map((issue) => {
          let issueIcon = 'icon icon-issue-opened green';
          if(issue.state === 'CLOSED'){
            issueIcon = 'icon icon-issue-closed red'
          }
          return (
            <div className="section">
              <div className="section-icon">
                <div className="icon icon-link" />
              </div>
              <div className="section-content">
                <h1 className="section-title"><a href={issue.url}>{issue.title}</a></h1>
                <p className="section-body">
                  <i className={`icon ${issueIcon}`} />
                  <code><a href={issue.url}>#{issue.number}</a></code> by {issue.author.login}
                  <span className="section-status">{issue.state.toLowerCase()}</span>
                </p>
              </div>
            </div>
          )
        })}
        {this.state.jiraIssues.map((issue) => {
          return (
            <div className="section">
              <div className="section-icon">
                <div className="icon icon-link" />
              </div>
              <div className="section-content">
                <h1 className="section-title"><a href={issue.url}>{issue.summary}</a></h1>
                <p className="section-body">
                  <i style={{
                    background: '#1CA7EC',
                    borderRadius: '2px',
                    color: '#FFFFFF',
                    marginRight: '4px',
                    verticalAlign: 'middle',
                    paddingTop: '1px',
                    textAlign: 'center'
                  }} className={`icon icon-check`} />
                  <code><a href={issue.url}>{issue.key}</a></code> created by {issue.creator.displayName} & assigned to {issue.assignee.displayName || 'Nobody'}
                  <span className="section-status">{issue.status.name.toLowerCase()}</span>
                </p>
              </div>
            </div>
          )
        })}
        <SearchInLayer
          onClick={this.clickLayerSearch.bind(this)}
          onMouseEnter={this.mouseEnterLayerSearch.bind(this)}
          onMouseLeave={this.mouseLeaveLayerSearch.bind(this)}
        />
      </div>
    );
  }

  formattedText() {
    const commit = this.props.commit;
    const date = commit.commitedAt;
    const formattedDate = moment(date).format(ConfigManager.get('gutterDateFormat'));
    const author = commit.author;
    return `${formattedDate} ${author}`
  }

  render() {
    if(this.state.commit.commitHash.substr(0,6) === '000000'){
      return (
        <div>
          {this.formattedText()}
        </div>
      );
    }
    return (
      <TooltipContainer
        tooltipContent={this.tooltip.bind(this)}
      >
        {this.formattedText()}
      </TooltipContainer>
    );
  }

}

export default GutterItem;
