'use babel';

import SelectionWatcher from './SelectionWatcher';
import StepsizeOutgoing from './StepsizeOutgoing';

export function activate(state) {
  let outgoing = new StepsizeOutgoing();
  atom.workspace.observeTextEditors((editor) => {
    let watcher = new SelectionWatcher(editor);
    watcher.onSelection(function(selections){
      const event = outgoing.buildEvent(editor, 'selection');
      console.log(event);
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
