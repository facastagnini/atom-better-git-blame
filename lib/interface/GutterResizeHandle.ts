import StyleHelper from './StyleHelper';
import { Emitter } from 'atom';

export default class GutterResizeHandle {

  handleElement: HTMLDivElement;
  initialPosition: number;
  boundMouseDownListener: EventListener;
  boundMouseUpListener: EventListener;
  boundMouseMoveListener: EventListener;
  emitter: Emitter

  constructor() {
    this.handleElement = document.createElement('div');
    const style = new StyleHelper(this.handleElement.style);
    style.setStyle({
      position: 'absolute',
      width: '4px',
      background: 'transparent',
      right: 0,
      top: 0,
      bottom: 0,
      cursor: 'col-resize'
    });
    this.emitter = new Emitter();
    this.boundMouseDownListener = this.mouseDownListener.bind(this);
    this.boundMouseUpListener = this.mouseUpListener.bind(this);
    this.boundMouseMoveListener = this.mouseMoveListener.bind(this);
    this.handleElement.addEventListener('mousedown', this.boundMouseDownListener)
  }

  private mouseDownListener(event: MouseEvent) {
    this.initialPosition = event.screenX;
    console.log(this.handleElement);
    document.addEventListener('mouseup', this.boundMouseUpListener);
    document.addEventListener('mousemove', this.boundMouseMoveListener);
    this.emitter.emit('resizeHandleClicked', event.screenX)
  }

  private mouseUpListener() {
    document.removeEventListener('mousemove', this.boundMouseMoveListener)
    document.removeEventListener('mouseup', this.boundMouseUpListener);
    this.emitter.emit('resizeHandleReleased', event.screenX)
  }

  private mouseMoveListener(event: MouseEvent) {
    this.emitter.emit('resizeHandleDragged', event.screenX - this.initialPosition)
  }

  public element() {
    return this.handleElement;
  }

}
