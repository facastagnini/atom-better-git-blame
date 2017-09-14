'use babel';

import React from 'preact-compat';
import ReactDOM from 'preact-compat';

interface ITooltipPortalProps {
  parent: HTMLSpanElement;
  mouseEnter: any;
  mouseLeave: any;
}

class TooltipPortal extends React.PureComponent<ITooltipPortalProps, any> {

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
      transform: 'translateY(-102%) translateX(-92%)',
      webkitFontSmoothing: 'subpixel-antialiased',
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
