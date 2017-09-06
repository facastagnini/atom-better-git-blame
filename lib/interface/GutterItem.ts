import GutterResizeHandle from './GutterResizeHandle';

export default class GutterItem {

  itemElement: HTMLDivElement;
  contentElement: HTMLDivElement;

  constructor() {
    this.itemElement = document.createElement('div');
    this.itemElement.className = 'pull-request';
    this.itemElement.style['width'] = '100px';

    this.contentElement = document.createElement('div');
    this.itemElement.appendChild(this.contentElement);

    const resizeHandle = new GutterResizeHandle();
    this.itemElement.appendChild(resizeHandle.element());
  }

  public setBackground(value) {
    this.itemElement.style['background'] = value;
  }

  public setContent(value) {
    this.contentElement.innerHTML = value;
  }

  public element() {
    return this.itemElement;
  }

}
