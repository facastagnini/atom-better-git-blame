'use babel';

import GutterResizeHandle from './GutterResizeHandle';
import { Emitter } from 'atom';
import ReactDOM from 'preact-compat';
import React from 'preact-compat';

import Item from '../components/GutterItem';

class GutterItem {
  itemElement: HTMLDivElement;
  contentElement: HTMLDivElement;
  resizeEmitter: Emitter;
  emitter: Emitter;
  boundMouseEnterListener: EventListener;
  boundMouseLeaveListener: EventListener;
  data: any;
  inidcatorColor: string;

  constructor(data) {
    this.data = data;
    this.itemElement = document.createElement('div');
    this.itemElement.className = 'layer-gutter-item';
    this.itemElement.style['width'] = '100%';

    this.contentElement = document.createElement('div');
    this.itemElement.appendChild(this.contentElement);

    const resizeHandle = new GutterResizeHandle();
    this.resizeEmitter = resizeHandle.emitter;
    this.itemElement.appendChild(resizeHandle.element());

    this.emitter = new Emitter();
    this.boundMouseEnterListener = this.mouseEnterListener.bind(this);
    this.boundMouseLeaveListener = this.mouseLeaveListener.bind(this);
    this.itemElement.addEventListener('mouseenter', this.boundMouseEnterListener);
  }

  public setIndicator(value) {
    this.inidcatorColor = value;
  }

  public mouseEnterListener(event: MouseEvent) {
    this.emitter.emit('mouseEnter', event);
    this.itemElement.addEventListener('mouseleave', this.boundMouseLeaveListener);
  }

  public mouseLeaveListener(event: MouseEvent) {
    this.emitter.emit('mouseLeave', event);
    this.itemElement.removeEventListener('mouseleave', this.boundMouseLeaveListener);
  }

  public element() {
    const item = React.createElement(Item, {
      commit: this.data.commit,
      firstCommitDate: this.data.firstCommitDate,
      commitDay: this.data.commitDay,
      emitter: this.emitter,
      inidcatorColor: this.inidcatorColor,
    });
    ReactDOM.render(item, this.contentElement);
    return this.itemElement;
  }
}

export default GutterItem;
