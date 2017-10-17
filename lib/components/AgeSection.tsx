'use babel';

import React from 'preact-compat';
import moment from 'moment';
import * as ConfigManager from '../ConfigManager';
import * as ColorScale from '../interface/ColourScale';
import * as Analytics from '../stepsize/Analytics';
import * as IntegrationNotification from '../interface/IntegrationNotification';

interface IAgeSectionProps {
  firstCommitDate: Date
  commitDay: number
  commit: any
}

interface IAgeSectionState {
  gradient: Array<string>;
}

class AgeSection extends React.PureComponent<IAgeSectionProps, IAgeSectionState> {

  totalDays: number;
  pointPosition: number;
  state: any;

  constructor(...props: any[]){
    super(...props);
    this.state = {
      gradient: ['#000']
    }
    Analytics.track('Tooltip shown', { type: 'age' });
    IntegrationNotification.trackTooltipShown();
  }

  async componentWillMount() {
    this.totalDays = (Date.now() - new Date(this.props.firstCommitDate).getTime()) / 1000 / 3600 / 24;
    this.pointPosition = (this.props.commitDay / this.totalDays) * 100;
    const gradient = await ColorScale.colorScale(atom.workspace.getActiveTextEditor());
    this.setState({
      gradient: gradient.map((color) => {
        return color.hsl().string();
      })
    });
  }

  render() {
    let pointAlign = 'center';
    let pointTransform = 'translateX(-50%) translateX(1px)';
    if(this.pointPosition < 20) {
      pointTransform = 'translateX(-5px)';
      pointAlign = 'left';
    }
    if(this.pointPosition > 70) {
      pointTransform = 'translateX(-100%) translateX(8px)';
      pointAlign = 'right';
    }
    const gradient = this.state.gradient.join(',');
    return (
      <div className="age-graph">
        <div className="markers tight">
          <div className="start">
            <div className="start-inner">
              <h1 title={moment(this.props.firstCommitDate).format(ConfigManager.get('gutterDateFormat'))}>
                Repo Created
              </h1>
            </div>
          </div>
          <div className="end">
            <div className="end-inner">
              <h1>Today</h1>
            </div>
          </div>
        </div>
        <div className="rail" style={{
          background: `linear-gradient(90deg, ${gradient})`
        }}>
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
    )
  }
}

export default AgeSection
