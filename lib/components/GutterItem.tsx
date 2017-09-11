'use babel';

import React from 'react';
import TooltipContainer from './TooltipContainer';

interface IGutterItemProps {
  text: string;
}

class GutterItem extends React.Component<IGutterItemProps, any> {

  tooltip() {
    return (
      <div className="layer-tooltip">
        <p>{this.props.text}</p>
      </div>
    );
  }

  render() {
    return (
      <TooltipContainer ref={(el) => this.tooltipContainer = el} tooltipContent={this.tooltip()}>
        {this.props.text}
      </TooltipContainer>
    );
  }

}

export default GutterItem;
