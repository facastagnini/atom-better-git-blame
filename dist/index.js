'use babel';
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
let outgoing;
let gutters = new Map();
export const config = ConfigManager.getConfig();
export function activate(state) {
    disposables.add(atom.commands.add('atom-workspace', {
        'better-git-blame:toggle': () => toggleGutterView(),
    }));
    if (os.platform() === 'darwin' && ConfigManager.get('searchInLayerEnabled')) {
        enableLayerSearch();
    }
    else {
        ConfigManager.set('searchInLayerEnabled', false);
    }
    Analytics.init();
}
async function layerEditorObserver(editor) {
    let watcher = new SelectionWatcher(editor);
    watcher.onSelection(function () {
        const event = outgoing.buildSelectionEvent(editor);
        outgoing.send(event);
    });
}
function enableLayerSearch() {
    StepsizeHelper.checkLayerInstallation()
        .then(() => {
        outgoing = new StepsizeOutgoing();
        atom.workspace.observeTextEditors(layerEditorObserver);
    })
        .catch(() => {
        ConfigManager.set('searchInLayerEnabled', false);
    });
}
function toggleGutterView() {
    const editor = atom.workspace.getActiveTextEditor();
    if (editor) {
        const gutter = gutters.get(editor);
        if (gutter) {
            if (gutter.isVisible()) {
                Analytics.track('Gutter hidden');
                gutter.hide();
            }
            else {
                Analytics.track('Gutter shown');
                gutter.show();
            }
        }
        else {
            Analytics.track('Gutter shown');
            gutters.set(editor, new GutterView(editor, outgoing));
            ColorScale.setEditor(editor);
        }
    }
}
export function deactivate() {
    disposables.dispose();
}
