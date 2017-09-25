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
              <img className="layer-icon" src="atom://better-git-blame/assets/layer-logo-secondary-64.png" height="16" alt=""/>
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
          <p className="section-body" style={{ maxWidth: '100%' }}>
            Powered by&nbsp;
            <a href="https://stepsize.com"><img className="layer-icon" src="atom://better-git-blame/assets/stepsize-logo-secondary-64.png" height="16" alt=""/></a>
          </p>
        </div>
      </div>
    )
  }
}

export default SearchInLayer;
