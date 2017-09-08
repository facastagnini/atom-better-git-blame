'use babel';

import React from 'react';
import LayerTooltip from './LayerTooltip';

interface IGutterItemProps {
  text: string;
}

class GutterItem extends React.Component<IGutterItemProps, any> {

  render() {
    return (
      <LayerTooltip>
        {this.props.text}
      </LayerTooltip>
    )
  }

}

export default GutterItem;
