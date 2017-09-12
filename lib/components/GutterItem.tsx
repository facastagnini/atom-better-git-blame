'use babel';

import React from 'react';
import TooltipContainer from './TooltipContainer';
import moment from 'moment';
import * as GitData from '../data/GitData';
import * as IntegrationData from '../data/IntegrationData';

interface IGutterItemProps {
  commit: any;
}

interface IGutterItemState {
  commit: any;
}

class GutterItem extends React.Component<IGutterItemProps, any> {

  componentWillMount(){
    this.setState({commit: this.props.commit});
    if(this.props.commit.commitHash.substr(0,6) !== '000000'){
      GitData.getCommit(this.props.commit.repoPath, this.props.commit.commitHash).then((commit) => {
        this.setState({
          ...this.state,
          commit : {
            ...this.state.commit,
            ...commit
          }
        });
      });
      IntegrationData
        .getIntegrationDataForFile(`${this.props.commit.repoPath}/${this.props.commit.filePath}`)
        .then((integrationData) => {
          console.log(integrationData);
      })
    }
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
            <h1 className="section-title">{this.state.commit.subject}</h1>
            <p className="section-body">
              <code>{this.state.commit.commitHash.substr(0,6)}</code> by {this.state.commit.author} committed on {commitedDate}
            </p>
          </div>
        </div>
        <div className="section">
          <div className="section-icon">
            <div className="icon icon-git-pull-request" />
          </div>
          <div className="section-content">
            <h1 className="section-title">Implement global shortcut to focus/unfocus...</h1>
            <p className="section-body"><code>#25</code> by nomeyer merged on 25 Jan</p>
          </div>
        </div>
        <div className="section">
          <div className="section-icon">
            <div className="icon icon-link" />
          </div>
          <div className="section-content">
            <h1 className="section-title">Implement a non-configurable global keyboard...</h1>
            <p className="section-body">STEP-510 by nomeyer & assigned to nomeyer</p>
          </div>
        </div>
        <div className="section">
          <div className="section-icon">
            <div className="icon icon-link" />
          </div>
          <div className="section-content">
            <h1 className="section-title">Global keyboard shortcut to search triggers...</h1>
            <p className="section-body">#36 by jaredburgess & assigned to nomeyer</p>
          </div>
        </div>
      </div>
    );
  }

  formattedText() {
    const commit = this.props.commit;
    const date = commit.commitedAt;
    const formattedDate = moment(date).format('YYYY-MM-DD');
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
        tooltipContent={this.tooltip()}
        onMouseEnter={this.mouseEnter}
      >
        {this.formattedText()}
      </TooltipContainer>
    );
  }

}

export default GutterItem;
