'use babel';

import React from 'preact-compat';

interface IBuildStatusProps {
  status: {
    state: string;
    contexts?: Array<any>
  }
}

class BuildStatus extends React.PureComponent<IBuildStatusProps, object> {

  private getStatus() : string | null {
    if (this.props.status) {
      return this.props.status.state;
    }
    return null;
  }

  private static renderIcon(status) : JSX.Element {
    switch (status) {
      case 'SUCCESS':
        return <i className="icon icon-check" style={{ color: '#2cbe4e' }} />;
      case 'FAILURE':
        return <i className="icon icon-x" style={{ color: '#cb2431' }} />;
      default:
        return null;
    }
  }

  render() {
    return (
      <span className="build-status">
        {BuildStatus.renderIcon(this.getStatus())}
      </span>
    );
  }
}

export default BuildStatus
