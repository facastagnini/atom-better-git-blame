'use babel';

import { CompositeDisposable } from 'atom';
import SelectionWatcher from './selectionWatcher';

let subscriptions = null;
export function activate(state) {
  this.subscriptions = new CompositeDisposable();
  atom.workspace.observeTextEditors((editor) => {
    console.log(editor);
    let watcher = new SelectionWatcher(editor)
  });
}

export function deactivate() {
  this.subscriptions.dispose();
}

export function serialize() {
  return {};
}
