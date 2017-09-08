'use babel';

import React from 'react';

interface ILayerTooltipProps {
  children: any;
}

interface ILayerTooltipState {
  show: boolean;
}

class LayerTooltip extends React.Component<ILayerTooltipProps, ILayerTooltipState> {

  state: ILayerTooltipState;

  constructor(props : ILayerTooltipProps) {
    super(props);
    this.state = {
      show: false
    };
  }

  renderTooltip(){
    return (
      <div>
        <h1>TOOLTIP</h1>
      </div>
    )
  }

  render() {
    return (
      <span>
        {this.props.children}
      </span>
    )
  }

}

export default LayerTooltip;
