import IGutterView = AtomCore.IGutterView;

'use babel';

let startTime = window.performance.now();
import IEditor = AtomCore.IEditor;

import SelectionWatcher from './SelectionWatcher';
import StepsizeOutgoing from './StepsizeOutgoing';
import StepsizeHelper from './StepsizeHelper';
import { CompositeDisposable } from 'atom';
import GutterView from './interface/GutterView';
import os from 'os';

import * as ColorScale from './ColourScale';

let disposables = new CompositeDisposable();
let outgoing: StepsizeOutgoing;
let gutters: Map<IEditor, IGutterView> = new Map();

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
    description:
      'Can improve performance on multi-core machines, if the gutter is slow try disabling this',
    type: 'boolean',
    default: true,
  },
  searchInLayerEnabled: {
    title: 'Enable Search in Layer (macOS Only)',
    description:
      'Send code selection events to the Layer desktop app for more detailed search results',
    type: 'boolean',
    default: true,
  },
};

export function activate(state) {
  console.log(os.platform());
  disposables.add(
    atom.commands.add('atom-workspace', {
      'layer-atom:toggle': () => toggleGutterView(),
    })
  );
  if (atom.config.get('layer-atom.searchInLayerEnabled') && os.platform() === 'darwin') {
    enableLayerSearch();
  } else {
    atom.config.set('layer-atom.searchInLayerEnabled', false);
  }
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
  StepsizeHelper.checkLayerInstallation().then(() => {
    outgoing = new StepsizeOutgoing();
    atom.workspace.observeTextEditors(layerEditorObserver);
  }).catch(() => {
    atom.config.set('layer-atom.searchInLayerEnabled', false);
  });
}

function toggleGutterView() {
  const editor = atom.workspace.getActiveTextEditor();
  const gutter = gutters.get(editor);
  if (gutter) {
    if (gutter.isVisible()) {
      gutter.hide();
    } else {
      gutter.show();
    }
  } else {
    gutters.set(editor, new GutterView(editor, outgoing));
    ColorScale.setEditor(editor);
  }
}

export function deactivate() {
  disposables.dispose();
  return;
}

export function serialize() {
  return {};
}
