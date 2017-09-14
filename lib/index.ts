'use babel';

let startTime = window.performance.now();
import IEditor = AtomCore.IEditor;

import SelectionWatcher from './SelectionWatcher';
import StepsizeOutgoing from './StepsizeOutgoing';
import { CompositeDisposable } from 'atom';
import GutterView from './interface/GutterView';
import * as ColorScale from './ColourScale';
import repoRemotes from './git/remotes';

let disposables = new CompositeDisposable();
let outgoing: StepsizeOutgoing;
let gutters: Array<GutterView>;

export const config = {
  colorScale: {
    title: 'Gutter Color Scale',
    description:
      'Preset scales for coloring commits based on age. (requires editor reload)',
    type: 'string',
    default: 'RoyalPomegranate',
    enum: [
      'RoyalPomegranate',
      'ChocolateMint',
      'VioletApple',
      'AffairGoblin',
      'GoldDaisy',
      'PoppyLochmara',
      'PersianSteel',
    ],
  },
  parallelGitProcessing: {
    title: 'Use parallel processing for Git commands',
    description: 'Can improve performance on multi-core machines, if the gutter is slow try disabling this',
    type: 'boolean',
    default: true,
  }
};

export function activate(state) {
  disposables.add(
    atom.commands.add('atom-workspace', {
      'layer-atom:toggle': () => toggleGutterView(),
    })
  );
  enableLayerSearch();
  console.log('Layer activation time:', window.performance.now() - startTime);
}

async function layerEditorObserver(editor: IEditor) {
  let watcher = new SelectionWatcher(editor);
  watcher.onSelection(function() {
    const event = outgoing.buildSelectionEvent(editor);
    outgoing.send(event);
  });
}

function enableLayerSearch() {
  outgoing = new StepsizeOutgoing();
  atom.workspace.observeTextEditors(layerEditorObserver);
}

function toggleGutterView() {
  const editor = atom.workspace.getActiveTextEditor();
  new GutterView(editor);
  ColorScale.setEditor(editor);
}

export function deactivate() {
  disposables.dispose();
  return;
}

export function serialize() {
  return {};
}
