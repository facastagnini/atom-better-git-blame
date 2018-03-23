'use babel';

import React from 'preact-compat';
import moment from 'moment';
import AgeSection from './AgeSection';
import BuildStatus from './BuildStatus';
import SearchInLayer from './SearchInLayer';
import * as ConfigManager from '../ConfigManager';
import * as Analytics from '../stepsize/Analytics';
import * as IntegrationNotification from '../interface/IntegrationNotification';

interface IBlameTooltipProps {
  emitter: any
  commit: any
  commitDay: number
  firstCommitDate: Date
  pullRequests: any
  issues: Array<any>
  metadata: any
}

class BlameTooltip extends React.PureComponent<IBlameTooltipProps, object> {

  constructor(...props: any[]) {
    super(...props);
    Analytics.track('Tooltip shown', { type: 'blame' });
    IntegrationNotification.trackTooltipShown();
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

  clickHandler(label){
    return () => {
      Analytics.track(`Clicked link`, {label});
    };
  }

  render() {
    const commitedDate = moment(this.props.commit.commitedAt).format('D MMM');
    return (
      <div className="layer-tooltip">
        <div className="section">
          <div className="section-icon">
            <div className="icon icon-git-commit" />
          </div>
          <div className="section-content">
            <h1 className="section-title">
              <a onClick={this.clickHandler('Commit title')} href={`${this.props.metadata.repoCommitUrl}/${this.props.commit.commitHash}`}>
                {this.props.commit.subject}
              </a>
            </h1>
            <BuildStatus buildStatus={this.props.commit.buildStatus}/>
            <p className="section-body">
              <code>
                <button
                  class='commit-hash-link'
                  title='Copy commit hash to clipboard'
                  onClick={() => {
                    this.clickHandler('Commit hash');
                    atom.clipboard.write(this.props.commit.commitHash);
                    const notif = atom.notifications.addSuccess(
                      'Copied commit hash to your clipboard!',
                      { dismissable: true }
                    );
                    setTimeout(() => notif.dismiss(), 800);
                  }}
                >
                  {this.props.commit.commitHash.substr(0,6)}
                </button>
              </code> by {this.props.commit.author} committed on {commitedDate}
            </p>
            <span className="section-status">
                <span title="Insertions" className="green">+{this.props.commit.insertions}&nbsp;</span>
                <span title="Deletions" className="red">-{this.props.commit.deletions}&nbsp;</span>
                <span title="Files Changed"><i className="icon icon-diff" />{this.props.commit.filesChanged}</span>
              </span>
          </div>
        </div>
        {this.props.pullRequests.map((pullRequest) => {
          const actor = pullRequest.author.username || pullRequest.author.name;
          const verb = pullRequest.state === 'Open' ? 'opened' : pullRequest.state.toLowerCase();
          const verbedAt = verb === 'merged' ? pullRequest.mergedAt : pullRequest.createdAt;
          return (
            <div className="section">
              <div className="section-icon">
                <div className="icon icon-git-pull-request" />
              </div>
              <div className="section-content">
                <h1 className="section-title">
                  <a onClick={this.clickHandler('Pull Request title')} href={pullRequest.url}>
                    {pullRequest.title}
                  </a>
                </h1>
                <BuildStatus buildStatus={pullRequest.buildStatus}/>
                <p className="section-body">
                  <code>
                    <a onClick={this.clickHandler('Pull Request number')} href={pullRequest.url}>
                      {pullRequest.source === 'GitLab' ? '!' : '#'}{pullRequest.number}
                    </a>
                  </code> by {actor} {verb} on {moment(verbedAt).format('D MMM')}
                </p>
                <span className="section-status">
                    <span title="Total Commits"><i className="icon icon-git-commit" />{pullRequest.commitCount}</span>
                  </span>
              </div>
            </div>
          )
        })}
        {this.props.issues.map((issue) => {
          const assignee = issue.assignees && issue.assignees[0] ? issue.assignees[0].username : null;
          if (issue.source === 'GitHub' || issue.source === 'GitLab') {
            let issueIcon = 'icon icon-issue-opened green';
            if (issue.state === 'Closed') {
              issueIcon = 'icon icon-issue-closed red'
            }
            return (
              <div className="section">
                <div className="section-icon">
                  <div className="icon icon-issue-opened" />
                </div>
                <div className="section-content">
                  <h1 className="section-title">
                    <a onClick={this.clickHandler('Issue title')} href={issue.url}>{issue.title}</a>
                  </h1>
                  <p className="section-body">
                    <i className={`icon ${issueIcon}`} />
                    <code>
                      <a onClick={this.clickHandler('Issue number')} href={issue.url}>#{issue.key}</a>
                    </code> created by {issue.author.username || issue.author.name}{assignee ? ` & assigned to ${assignee}` : ''}
                  </p>
                  <span className="section-status">{issue.state === 'Opened' ? 'open' : issue.state}</span>
                </div>
              </div>
            )
          } else if (issue.source === 'Jira') {
            return (
              <div className="section">
                <div className="section-icon">
                  <div className="icon stepsize-icon-jira" />
                </div>
                <div className="section-content">
                  <h1 className="section-title">
                    <a onClick={this.clickHandler('Jira ticket title')} href={issue.url}>{issue.title}</a>
                  </h1>
                  <p className="section-body">
                    <img className="icon" src={issue.type.iconUrl} alt={issue.type.name}/>
                    <code>
                      <a onClick={this.clickHandler('Jira ticket key')} href={issue.url}>{issue.key}</a>
                    </code> created by {issue.author.username}{assignee ? ` & assigned to ${assignee}` : ''}
                    <span className="section-status" style={{
                      color: `${issue.state.colour}`
                    }}>{issue.state.name}</span>
                  </p>
                </div>
              </div>
            )
          }
        })}
        {
          !ConfigManager.get('displayAgeSection') ?
            null :
            <div className="section">
              <div className="section-icon">
                <div className="icon icon-clock" />
              </div>
              <div className="section-content">
                <AgeSection
                  commitDay={this.props.commitDay}
                  firstCommitDate={this.props.firstCommitDate}
                  commit={this.props.commit}
                />
              </div>
            </div>
        }
        <SearchInLayer
          onClick={this.clickLayerSearch.bind(this)}
          onMouseEnter={this.mouseEnterLayerSearch.bind(this)}
          onMouseLeave={this.mouseLeaveLayerSearch.bind(this)}
        />
      </div>
    );
  }
}

export default BlameTooltip
