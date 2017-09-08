'use babel';

import * as _ from 'lodash';

class StyleHelper {
  sheet: CSSStyleDeclaration;

  constructor(sheet) {
    this.sheet = sheet;
  }

  public setStyle(style) {
    _.map(style, (value, attribute) => {
      this.sheet[attribute] = value;
    });
  }
}

export default StyleHelper;
