'use babel';

let startTime = window.performance.now();
import IEditor = AtomCore.IEditor;

import SelectionWatcher from './SelectionWatcher';
import StepsizeOutgoing from './StepsizeOutgoing';
import { CompositeDisposable } from 'atom';
import GutterView from './GutterView';
import * as ColorScale from './ColourScale';

let disposables = new CompositeDisposable();
let outgoing : StepsizeOutgoing;

export function activate(state) {
  disposables.add(atom.commands.add('atom-workspace', {
    'layer-atom:toggle' : () => toggleGutterView()
  }));
  enableLayerSearch();
  console.log('Layer activation time:', window.performance.now() - startTime);
}

async function layerEditorObserver(editor: IEditor){
  let watcher = new SelectionWatcher(editor);
  watcher.onSelection(function () {
    const event = outgoing.buildSelectionEvent(editor);
    outgoing.send(event);
  });
}

function enableLayerSearch(){
  outgoing = new StepsizeOutgoing();
  atom.workspace.observeTextEditors(layerEditorObserver);
}

function toggleGutterView(){
  const editor = atom.workspace.getActiveTextEditor();
  ColorScale.setEditor(editor).then(() => {
    new GutterView(editor);
  });
}

export function deactivate() {
  disposables.dispose();
  return;
}

export function serialize() {
  return {};
}
