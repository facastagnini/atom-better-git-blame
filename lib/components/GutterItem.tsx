'use babel';

import React from 'react';
import TooltipContainer from './TooltipContainer';
import moment from 'moment';

interface IGutterItemProps {
  commit: any;
}

class GutterItem extends React.Component<IGutterItemProps, any> {

  tooltip() {
    let commit = this.props.commit;
    return (
      <div className="layer-tooltip">
        <div className="section">
          <div className="section-icon">
            <div className="icon icon-git-pull-request" />
          </div>
          <div className="section-content">
            <h1 className="section-title">Register global shortcut on app launch</h1>
            <p className="section-body"><code>e9e1c58</code> by nomeyer committed on 24 Jan</p>
          </div>
        </div>
        <div className="section">
          <div className="section-icon">
            <div className="icon icon-git-commit" />
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

  mouseEnter() {
    let commit = this.props.commit;
    console.log(commit);
  }

  render() {
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
