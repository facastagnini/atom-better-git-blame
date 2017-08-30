
import IEditor = AtomCore.IEditor;
import { debounce } from 'lodash';

export default class SelectionWatcher {

  editor: IEditor;
  selectionHandler: Function;

  constructor(editor: IEditor){
    this.editor = editor;
    this.watchSelections();
  }

  onSelection(selectionsCallback){
    if(typeof selectionsCallback === 'function'){
      this.selectionHandler = debounce(selectionsCallback, 200);
    } else {
      throw new Error('Event listeners must supply a callback');
    }
  }

  watchSelections() {
    this.editor.onDidChangeSelectionRange(() => {
      let selectionRanges = this.editor.selections.map((selection) => {
        return selection.getBufferRange();
      });
      this.selectionHandler(selectionRanges);
    });
  }

}
