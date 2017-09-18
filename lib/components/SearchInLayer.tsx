'use babel';

import React from 'preact-compat';
import * as ConfigManager from '../ConfigManager';

interface ISearchInLayerProps {
  onClick: Function;
  onMouseEnter: Function;
  onMouseLeave: Function;
}

class SearchInLayer extends React.PureComponent<ISearchInLayerProps, any>{
  render() {
    if(ConfigManager.get('searchInLayerEnabled')){
      return (
        <div className="section">
          <div className="section-icon">
            <div className="icon icon-search" />
          </div>
          <div className="section-content">
            <h1 className="section-title">
              Search in&nbsp;
              <img className="layer-icon" src="atom://layer-atom/assets/stepsize-logo.png" width="16" height="16" alt=""/>&nbsp;
              <span className="white">Layer</span>
            </h1>
            <p className="section-body">
              View complete history of the code block
              <span
                className="layer-button btn btn-default icon icon-link-external"
                onClick={this.props.onClick}
                onMouseEnter={this.props.onMouseEnter}
                onMouseLeave={this.props.onMouseLeave}
              >
              Open
            </span>
            </p>
          </div>
        </div>
      )
    }
    return (
      <div className="section powered-by">
        <div className="section-content">
          <p className="section-body">
            Powered by&nbsp;
            <img className="layer-icon" src="atom://layer-atom/assets/stepsize-logo.png" width="16" height="16" alt=""/>
            <a href="https://stepsize.com">stepsize</a>
          </p>
        </div>
      </div>
    )
  }
}

export default SearchInLayer;
