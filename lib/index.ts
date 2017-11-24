'use babel';

import IEditor = AtomCore.IEditor;
import SelectionWatcher from './stepsize/SelectionWatcher';
import StepsizeOutgoing from './stepsize/StepsizeOutgoing';
import StepsizeHelper from './stepsize/StepsizeHelper';
import { CompositeDisposable } from 'atom';
import GutterView from './interface/GutterView';
import os from 'os';
import * as ConfigManager from './ConfigManager';
import * as ColorScale from './interface/ColourScale';
import * as Analytics from './stepsize/Analytics';

let disposables = new CompositeDisposable();
let outgoing: StepsizeOutgoing;
let gutters: Map<IEditor, GutterView> = new Map();

export const config = ConfigManager.getConfig();

export function activate(state) {
  disposables.add(
    atom.commands.add('atom-workspace', {
      'better-git-blame:toggle': () => toggleGutterView(),
    })
  );
  if (os.platform() === 'darwin') {
    enableLayerSearch();
  } else {
    ConfigManager.set('searchInLayerEnabled', false);
  }
  Analytics.init();
}

async function layerEditorObserver(editor: IEditor) {
  let watcher = new SelectionWatcher(editor);
  watcher.onSelection(function() {
    const event = outgoing.buildSelectionEvent(editor);
    outgoing.send(event);
  });
}

function enableLayerSearch() {
  StepsizeHelper.checkLayerInstallation()
    .then(() => {
      ConfigManager.set('searchInLayerEnabled', true);
      outgoing = new StepsizeOutgoing();
      atom.workspace.observeTextEditors(layerEditorObserver);
    })
    .catch(e => {
      ConfigManager.set('searchInLayerEnabled', false);
    });
}

function toggleGutterView() {
  const editor = atom.workspace.getActiveTextEditor();
  if (editor) {
    const gutter = gutters.get(editor);
    if (gutter) {
      gutter.toggle();
    } else {
      gutters.set(editor, new GutterView(editor, outgoing));
      ColorScale.setEditor(editor);
    }
  }
}

export function deactivate() {
  disposables.dispose();
}
