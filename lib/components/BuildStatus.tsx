'use babel';

import React from 'preact-compat';
import * as Analytics from '../stepsize/Analytics';

enum EBuildStatusState {
  Success = 'Success',
  Failure = 'Failure',
  Unknown = 'Unknown',
}

interface IBuildStatusProps {
  buildStatus: {
    state: EBuildStatusState;
    buildSources: Array<{
      state: EBuildStatusState;
      description: string;
      url: string;
      duration?: number;
    }>;
  }
}

class BuildStatus extends React.PureComponent<IBuildStatusProps, object> {

  private getStatus() : string | null {
    if (this.props.buildStatus) {
      return this.props.buildStatus.state;
    }
    return null;
  }

  private static renderIcon(state: string) : JSX.Element | null {
    switch (state) {
      case EBuildStatusState.Success:
        return <i className="icon icon-check" style={{ color: '#2cbe4e' }} />;
      case EBuildStatusState.Failure:
        return <i className="icon icon-x" style={{ color: '#cb2431' }} />;
      default:
        return null;
    }
  }

  clickHandler(label: string){
    return () => {
      Analytics.track(`Clicked link`, {label});
    };
  }


  render() {
    if(this.props.buildStatus){
      return (
        <a
          onClick={this.clickHandler('Build status')}
          href={this.props.buildStatus.buildSources[0].url}
          className="build-status"
          title={this.props.buildStatus.buildSources[0].description}
        >
          {BuildStatus.renderIcon(this.getStatus())}
        </a>
      );
    }
    return null;
  }
}

export default BuildStatus
