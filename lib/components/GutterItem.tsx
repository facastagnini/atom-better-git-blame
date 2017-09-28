'use babel';

import React from 'preact-compat';
import moment from 'moment';
import TooltipContainer from './TooltipContainer';
import * as GitData from '../data/GitData';
import * as IntegrationData from '../data/IntegrationData';
import * as ConfigManager from '../ConfigManager';
import BlameTooltip from './BlameTooltip';

interface IGutterItemProps {
  commit: any;
  emitter: any;
  inidcatorColor: string;
  firstCommitDate: Date;
  commitDay: number;
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
          pullRequests.map(this.getIssuesForPullRequest.bind(this));
          // Refresh the commit data
          this.fetchCommitData();
        });
    }
  }

  fetchCommitData(){
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

  tooltip(){
    return (
      <BlameTooltip
        emitter={this.props.emitter}
        commit={this.state.commit}
        pullRequests={this.state.pullRequests}
        githubIssues={this.state.githubIssues}
        jiraIssues={this.state.jiraIssues}
        metadata={this.state.metadata}
      />
    )
  }

  formattedText() {
    const commit = this.props.commit;
    const date = commit.commitedAt;
    const formattedDate = moment(date).format(ConfigManager.get('gutterDateFormat'));
    let author = commit.author;
    if(ConfigManager.get('truncateGutterNames')){
      const splitAuthor = author.split(' ');
      if(splitAuthor.length > 1){
        const lastName = splitAuthor.pop();
        const initials = splitAuthor.map((part) => {
          return part[0].toUpperCase()
        }).join(' ');
        author = `${initials}. ${lastName}`;
      }
    }
    return `${formattedDate} ${author}`
  }

  ageTooltip(){
    const totalDays = (Date.now() - new Date(this.props.firstCommitDate).getTime()) / 1000 / 3600 / 24;
    const pointPosition = (this.props.commitDay / totalDays) * 100;
    console.log(pointPosition, totalDays);
    return (
      <div className="layer-tooltip">
        <div className="age-graph">
          <div className="markers">
            <div className="start">
              <div className="start-inner">
                <h3>Repo Created</h3>
                <code>
                  {moment(this.props.firstCommitDate).format(ConfigManager.get('gutterDateFormat'))}
                </code>
              </div>
            </div>
            <div className="end">
              <div className="end-inner">
                <h3>Today</h3>
                <code>{moment(Date.now()).format(ConfigManager.get('gutterDateFormat'))}</code>
              </div>
            </div>
          </div>
          <div className="rail">
          </div>
          <div className="markers">
            <div className="point" style={{marginLeft: `${pointPosition}%`}}>
              <i className="icon icon-git-commit" /> <br />
              <h3>{moment(this.props.commit.commitedAt).fromNow()}</h3>
              <code>
                {moment(this.props.commit.commitedAt).format(ConfigManager.get('gutterDateFormat'))}
              </code>
            </div>
          </div>
        </div>
      </div>
    )
  }

  render() {
    if(this.state.commit.commitHash.substr(0,6) === '000000'){
      return (
        <div className="gutter-text">
          {this.formattedText()}
        </div>
      );
    }
    return (
      <div>
        <TooltipContainer
          className="gutter-text"
          tooltipContent={this.tooltip.bind(this)}
        >
          {this.formattedText()}
        </TooltipContainer>
        <TooltipContainer
          style={{background: this.props.inidcatorColor}}
          className="gutter-age"
          tooltipContent={this.ageTooltip.bind(this)}
        />
      </div>
    );
  }

}

export default GutterItem;
