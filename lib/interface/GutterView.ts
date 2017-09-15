'use babel';

import IEditor = AtomCore.IEditor;
import IDisplayBufferMarker = AtomCore.IDisplayBufferMarker;
import Decoration = AtomCore.Decoration;
import { CompositeDisposable, Range } from 'atom';
import GutterRange from '../GutterRange';
import GutterItem from './GutterItem';
import { colorScale } from '../ColourScale';
import * as GitData from '../data/GitData';
import * as IntegrationData from '../data/IntegrationData';
import CodeSelector from '../CodeSelector';
import StepsizeOutgoing from '../StepsizeOutgoing';
import robot from 'robotjs';

class GutterView {
  private editor: IEditor;
  private commits: { [prop: string]: any };
  private ranges: { [prop: string]: Array<GutterRange> };
  private width: number;
  private boundResizeListener: EventListener;
  private previousResize: number = 0;
  private firstCommitDate: Date;
  private markers: { [prop: string]: Array<IDisplayBufferMarker> } = {};
  private highlightDecorations: Array<Decoration> = [];
  private codeSelector: CodeSelector;
  private outgoing: StepsizeOutgoing;

  constructor(editor: IEditor, outgoing: StepsizeOutgoing) {
    this.editor = editor;
    this.outgoing = outgoing;
    this.editor.addGutter({ name: 'layer' });
    this.setGutterWidth(210);
    this.boundResizeListener = this.resizeListener.bind(this);
    this.fetchGutterData()
      .then(() => {
        this.drawGutter();
      })
      .catch(e => {
        throw e;
      });
    this.codeSelector = new CodeSelector(this.editor);
  }

  private buildMarkersForRanges() {
    for (const identifier in this.ranges) {
      const ranges = this.ranges[identifier];
      this.markers[identifier] = ranges.map(range =>
        this.editor.markBufferRange(range.toAtomRange())
      );
    }
  }

  private drawGutter() {
    this.buildMarkersForRanges();
    for (const identifier in this.markers) {
      const commit = this.commits[identifier];
      const date = commit.commitedAt;
      const commitDay = Math.floor(
        (date - this.firstCommitDate.getTime()) / 1000 / 3600 / 24
      );
      colorScale(this.editor).then(scale => {
        this.markers[identifier].map(marker => {
          const item = new GutterItem(commit);
          this.handleResizes(item);
          item.setIndicator('#3b3b3b'); // Set default indicator colour to display if calculations take a while
          if (scale[commitDay]) {
            const color = scale[Math.floor(commitDay)]
              .rgb()
              .fade(0.2)
              .string();
            item.setIndicator(color);
          }
          this.editor.decorateMarker(marker, {
            type: 'gutter',
            class: `layer-gutter`,
            gutterName: 'layer',
            item: item.element(),
          });
          item.emitter.on('mouseEnter', () => {
            this.highlightCommit(identifier);
          });
          item.emitter.on('mouseLeave', () => {
            this.removeHighlight();
          });
          this.handleLayerSearch(item, marker);
        });
      });
    }
  }

  handleResizes(item) {
    item.resizeEmitter.on('resizeHandleDragged', this.boundResizeListener);
    item.resizeEmitter.on('resizeHandleReleased', () => {
      this.previousResize = 0;
    });
  }

  handleLayerSearch(item, marker) {
    const codeFold = this.codeSelector.getFoldForRange(marker.getBufferRange());
    if (codeFold) {
      item.emitter.on('clickedSearch', () => {
        const range = new Range([codeFold.start, 0], [codeFold.end + 1, 0]);
        const event = this.outgoing.buildEvent(
          this.editor,
          [range],
          'selection'
        );
        this.outgoing.send(event, () => {
          robot.keyTap('s', 'control');
        });
      });
      item.emitter.on('mouseEnterLayerSearch', () => {
        this.removeHighlight();
        this.highlightMarker(codeFold.marker);
      });
      item.emitter.on('mouseLeaveLayerSearch', () => {
        this.removeHighlight();
      });
    }
  }

  highlightCommit(commitHash: string) {
    this.highlightDecorations.map(decoration => decoration.destroy());
    this.markers[commitHash].map(marker => {
      this.highlightDecorations.push(
        this.editor.decorateMarker(marker, {
          type: 'line',
          class: 'line-highlight layer-highlight',
        })
      );
    });
  }

  highlightMarker(marker) {
    this.highlightDecorations.map(decoration => decoration.destroy());
    this.highlightDecorations.push(
      this.editor.decorateMarker(marker, {
        type: 'line',
        class: 'line-highlight layer-highlight',
      })
    );
  }

  removeHighlight() {
    this.highlightDecorations.map(decoration => decoration.destroy());
  }

  resizeListener(resizeOffset: number) {
    this.setGutterWidth(this.width + (resizeOffset - this.previousResize));
    this.previousResize = resizeOffset;
  }

  static gutterStyle() {
    const sheet = document.createElement('style');
    sheet.type = 'text/css';
    sheet.id = 'layer-gutter-style';
    return sheet;
  }

  setGutterWidth(width: number) {
    this.width = Math.max(50, Math.min(width, 500));
    let sheet = document.getElementById('layer-gutter-style');
    if (!sheet) {
      sheet = GutterView.gutterStyle();
      document.head.appendChild(sheet);
    }
    sheet.innerHTML = `
      atom-text-editor .gutter[gutter-name="layer"] {
        width: ${this.width}px
      }
    `;
  }

  private async fetchGutterData() {
    const filePath = this.editor.getPath();
    IntegrationData.getIntegrationDataForFile(filePath);
    let commits = await GitData.getCommitsForFile(filePath);
    this.commits = commits.commits;
    let ranges = await GitData.getGutterRangesForFile(filePath);
    this.ranges = ranges.ranges;
    let date = await GitData.getFirstCommitDateForRepo(filePath);
    this.firstCommitDate = new Date(date);
  }
}

export default GutterView;
