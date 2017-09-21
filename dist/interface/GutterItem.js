'use babel';
import GutterResizeHandle from './GutterResizeHandle';
import { Emitter } from 'atom';
import ReactDOM from 'preact-compat';
import React from 'preact-compat';
import Item from '../components/GutterItem';
class GutterItem {
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
    setIndicator(value) {
        this.inidcatorColor = value;
        this.itemElement.style['border-right'] = `4px solid ${value}`;
    }
    mouseEnterListener(event) {
        this.emitter.emit('mouseEnter', event);
        this.itemElement.addEventListener('mouseleave', this.boundMouseLeaveListener);
    }
    mouseLeaveListener(event) {
        this.emitter.emit('mouseLeave', event);
        this.itemElement.removeEventListener('mouseleave', this.boundMouseLeaveListener);
    }
    element() {
        const item = React.createElement(Item, {
            commit: this.data,
            emitter: this.emitter,
        });
        ReactDOM.render(item, this.contentElement);
        return this.itemElement;
    }
}
export default GutterItem;
