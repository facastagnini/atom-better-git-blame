import IEditor = AtomCore.IEditor;

'use babel';

import SelectionWatcher from './SelectionWatcher';
import StepsizeOutgoing from './StepsizeOutgoing';
import GutterView from './GutterView';

export function activate(state) {
  let outgoing = new StepsizeOutgoing();
  atom.workspace.observeTextEditors(async (editor: IEditor) => {
    new GutterView(editor);
    let watcher = new SelectionWatcher(editor);
    watcher.onSelection(function (selections) {
      const event = outgoing.buildSelectionEvent(editor);
      outgoing.send(event);
    });
  });
}

export function deactivate() {
  return;
}

export function serialize() {
  return {};
}
