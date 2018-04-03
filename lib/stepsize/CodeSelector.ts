'use babel';

import IRange = TextBuffer.IRange;
import IEditor = AtomCore.IEditor;
import _ from 'lodash';

class CodeSelector {
  private editor: IEditor;
  private codeFolds: Array<any> = [];

  constructor(editor: IEditor) {
    this.editor = editor;
    this.calculateCodeFolds();
  }

  private calculateCodeFolds() {
    this.getFoldStarts();
    this.getFoldEnds();
  }

  private getFoldStarts() {
    for (let i = 0; i < this.editor.getLineCount(); i++) {
      if (this.editor.isFoldableAtBufferRow(i)) {
        let codeFold = {
          start: i,
          indentation: this.editor.indentationForBufferRow(i),
        };
        this.codeFolds.push(codeFold);
      }
    }
  }

  private getFoldEnds() {
    for (let i in this.codeFolds) {
      const codeFold = this.codeFolds[i];
      const startIndent = codeFold.indentation;
      let foldEnd = parseInt(codeFold.start);
      let indentation = this.safeIndentationForRow(++foldEnd);
      let skipLine = false;
      while ((indentation !== undefined && indentation > startIndent) || skipLine) {
        const nextLineText = this.editor.lineTextForBufferRow(foldEnd + 1);
        if (nextLineText) {
          skipLine = nextLineText.match(/^\s+$/) || nextLineText.length === 0;
        }
        indentation = this.safeIndentationForRow(++foldEnd);
      }
      codeFold.end = foldEnd;
      codeFold.marker = this.editor.markBufferRange([[codeFold.start, 0], [foldEnd, 9001]]);
    }
  }

  // editor.indentationForBufferRow throws when the row number is too large. From what I can tell this
  // shouldn't happen given how this.codeFolds is built by getFoldStarts, but apparently it does (see #30)
  private safeIndentationForRow(row: number): number {
    let indentation;
    try {
      indentation = this.editor.indentationForBufferRow(row);
    } catch (error) {}
    return indentation;
  }

  public getFoldForRange(range: IRange) {
    const startRow = range.start.row;
    const endRow = range.end.row;
    // Start checking for folds near the middle of the range
    let checkRow = endRow - Math.ceil((endRow - startRow) / 2);
    // Store the current search results end row and fold for comparison and return;
    let foldEnd = endRow;
    let fold;
    // Store a fold to use if we cant find the exact one we want
    let fallbackFold;
    do {
      if (this.editor.isFoldableAtBufferRow(checkRow)) {
        fold = _.find(this.codeFolds, { start: checkRow });
        if (fold) {
          if (!fallbackFold || checkRow >= startRow) {
            fallbackFold = fold;
          }
          foldEnd = fold.end;
        }
      }
      checkRow--;
    } while (foldEnd <= endRow && checkRow > 0);
    if (foldEnd > endRow) {
      return fold;
    } else {
      return fallbackFold;
    }
  }
}

export default CodeSelector;
