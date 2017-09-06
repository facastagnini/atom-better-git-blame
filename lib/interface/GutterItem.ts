import GutterResizeHandle from './GutterResizeHandle';
import StyleHelper from './StyleHelper';
import { Emitter } from 'atom';

export default class GutterItem {

  itemElement: HTMLDivElement;
  contentElement: HTMLDivElement;
  resizeEmitter: Emitter;

  constructor() {
    this.itemElement = document.createElement('div');
    this.itemElement.className = 'layer-gutter-item';
    const style = new StyleHelper(this.itemElement.style);
    this.itemElement.style['width'] = '100%';

    this.contentElement = document.createElement('div');
    this.itemElement.appendChild(this.contentElement);

    const resizeHandle = new GutterResizeHandle();
    this.resizeEmitter = resizeHandle.emitter;
    this.itemElement.appendChild(resizeHandle.element());
  }

  public setIndicator(value) {
    this.itemElement.style['border-right'] = `4px solid ${value}`;
  }

  public setContent(value) {
    this.contentElement.innerHTML = value;
  }

  public element() {
    return this.itemElement;
  }

}
