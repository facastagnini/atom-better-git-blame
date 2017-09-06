import StyleHelper from './StyleHelper';

export default class GutterResizeHandle {

  handleElement: HTMLDivElement;

  constructor() {
    this.handleElement = document.createElement('div');
    const style = new StyleHelper(this.handleElement.style);
    style.setStyle({
      position: 'absolute',
      width: '2px',
      background: 'blue';
    right: 0;
    top: 0;
    bottom: 0;
  })
  }

  onClick() {
    return this.handleElement.onclick;
  }

  public element() {
    return this.handleElement;
  }

}
