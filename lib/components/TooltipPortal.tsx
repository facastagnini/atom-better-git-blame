'use babel';

import React from 'react';
import ReactDOM from 'react-dom';

interface ITooltipPortalProps {
  parent: HTMLSpanElement;
  mouseEnter: any;
  mouseLeave: any;
}

class TooltipPortal extends React.Component<ITooltipPortalProps, any> {

  portal: HTMLDivElement;

  componentDidMount () {
    this.portal = document.createElement('div');
    document.body.appendChild(this.portal);
    this.renderTooltipContent(this.props);
  }

  componentWillUnmount () {
    ReactDOM.unmountComponentAtNode(this.portal);
  }

  getTooltipStyle() {
    let rect = this.props.parent.getBoundingClientRect();
    return {
      top: rect.top,
      left: rect.right,
      transform: 'translate3d(-90%, -102%, 0)',
      position: 'absolute',
      zIndex: 100,
    }
  }

  renderTooltipContent(props) {
    ReactDOM.render(<div
      style={this.getTooltipStyle()}
      onMouseEnter={this.props.mouseEnter}
      onMouseLeave={this.props.mouseLeave}
    >
      {props.children}
      </div>, this.portal);
  }

  render() {
    return null
  }

}

export default TooltipPortal;
