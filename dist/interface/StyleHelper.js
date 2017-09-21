'use babel';
import * as _ from 'lodash';
class StyleHelper {
    constructor(sheet) {
        this.sheet = sheet;
    }
    setStyle(style) {
        _.map(style, (value, attribute) => {
            this.sheet[attribute] = value;
        });
    }
}
export default StyleHelper;
