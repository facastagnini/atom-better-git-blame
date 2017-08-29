
import IEditor = AtomCore.IEditor;

export default class SelectionWatcher {

  editor: IEditor;

  constructor(editor: IEditor){
    this.editor = editor;
    this.watchSelections();
  }

  watchSelections() {
    this.editor.onDidChangeSelectionRange(() => {
      let selectionRanges = this.editor.selections.map((selection) => {
        return selection.getBufferRange();
      });
      console.log(selectionRanges);
    });
  }

}
