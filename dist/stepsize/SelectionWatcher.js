'use babel';
import { CompositeDisposable } from 'atom';
import { debounce } from 'lodash';
class SelectionWatcher {
    constructor(editor) {
        this.subscriptions = new CompositeDisposable();
        this.editor = editor;
        this.subscriptions.add(this.editor.onDidChangeSelectionRange(() => {
            this.getSelections();
        }));
    }
    onSelection(selectionsCallback) {
        if (typeof selectionsCallback === 'function') {
            this.selectionHandler = debounce(selectionsCallback, 200);
        }
        else {
            throw new Error('Event listeners must supply a callback');
        }
    }
    getSelections() {
        let selectionRanges = this.editor.selections.map(selection => {
            return selection.getBufferRange();
        });
        this.selectionHandler(selectionRanges);
    }
}
export default SelectionWatcher;
