import * as _ from 'lodash';

export default class StyleHelper {

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
