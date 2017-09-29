'use babel';

import React from 'preact-compat';
import moment from 'moment';
import * as ConfigManager from '../ConfigManager';

interface IAgeTooltipProps {
  firstCommitDate: Date
  commitDay: number
  commit: any
}

class AgeTooltip extends React.PureComponent<IAgeTooltipProps, object> {

  totalDays: number;
  pointPosition: number;

  componentWillMount() {
    this.totalDays = (Date.now() - new Date(this.props.firstCommitDate).getTime()) / 1000 / 3600 / 24;
    this.pointPosition = (this.props.commitDay / this.totalDays) * 100;
  }

  render() {
    let pointAlign = 'center';
    let pointTransform = 'translateX(-50%) translateX(2px)';
    if(this.pointPosition < 20) {
      pointTransform = 'translateX(-6px)';
      pointAlign = 'left';
    }
    if(this.pointPosition > 70) {
      pointTransform = 'translateX(-100%) translateX(6px)';
      pointAlign = 'right';
    }
    return (
      <div className="layer-tooltip">
        <div className="age-graph">
          <div className="markers">
            <div className="start">
              <div className="start-inner">
                <h3>Repo Created</h3>
              </div>
            </div>
            <div className="end">
              <div className="end-inner">
                <h3>Today</h3>
              </div>
            </div>
          </div>
          <div className="rail">
            <div className="tick" style={{
              left: `${this.pointPosition}%`,
            }} />
          </div>
          <div className="markers">
            <div className="point" style={{
              marginLeft: `${this.pointPosition}%`,
              textAlign: pointAlign,
              transform: pointTransform,
            }}>
              <i className="icon icon-git-commit" />
              <p>{moment(this.props.commit.commitedAt).fromNow()}</p>
              <code>
                {moment(this.props.commit.commitedAt).format(ConfigManager.get('gutterDateFormat'))}
              </code>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default AgeTooltip
