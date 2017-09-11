'use babel';

import React from 'react';
import ReactDOM from 'react-dom';

interface ITooltipPortalProps {
  parent: HTMLSpanElement;
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
      transform: 'translate3d(-90%, -110%, 0)',
      position: 'absolute',
      zIndex: 10,
    }
  }

  renderTooltipContent(props) {
    ReactDOM.render(<div style={this.getTooltipStyle()}>{props.children}</div>, this.portal);
  }

  render() {
    return null
  }

}

export default TooltipPortal;
