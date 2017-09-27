'use babel';

import IEditor = AtomCore.IEditor;
import IDisplayBufferMarker = AtomCore.IDisplayBufferMarker;
import IGutterView = AtomCore.IGutterView;
import Decoration = AtomCore.Decoration;
import { CompositeDisposable, Range } from 'atom';
import _ from 'lodash';
import * as childProcess from 'child_process';
import GutterRange from './GutterRange';
import GutterItem from './GutterItem';
import { colorScale } from './ColourScale';
import * as GitData from '../data/GitData';
import * as IntegrationData from '../data/IntegrationData';
import CodeSelector from '../stepsize/CodeSelector';
import StepsizeOutgoing from '../stepsize/StepsizeOutgoing';
import * as ConfigManager from '../ConfigManager';
import * as Analytics from '../stepsize/Analytics';

class GutterView {
  private editor: IEditor;
  private gutter: IGutterView;
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
  private integrationData: any;
  private overlayHack: HTMLElement;

  constructor(editor: IEditor, outgoing: StepsizeOutgoing) {
    this.editor = editor;
    this.outgoing = outgoing;
    this.gutter = this.editor.addGutter({ name: 'layer' });
    this.setGutterWidth(ConfigManager.get('defaultWidth'));
    this.boundResizeListener = this.resizeListener.bind(this);
    this.fetchGutterData()
      .then(() => {
        this.drawGutter();
      })
      .catch(e => {
        console.error(e);
      });
    this.codeSelector = new CodeSelector(this.editor);
    return this.gutter;
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
        const markers = this.markers[identifier];
        for (const i in markers) {
          const marker = markers[i];
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
            this.handleLayerSearch(item, marker);
            if (ConfigManager.get('highlightPullRequestOnHover')) {
              this.highlightPullRequestForCommit(identifier);
            }
          });
          item.emitter.on('mouseLeave', () => {
            this.removeHighlight();
            this.removeOverlayOverflowHack();
          });
        }
      });
    }
  }

  handleResizes(item) {
    item.resizeEmitter.on('resizeHandleDragged', this.boundResizeListener);
    item.resizeEmitter.on('resizeHandleReleased', () => {
      this.previousResize = 0;
    });
  }

  searchInLayerClickHandler(codeFold) {
    return () => {
      Analytics.track('Search in Layer clicked');
      const range = new Range([codeFold.start, 0], [codeFold.end + 1, 0]);
      const event = this.outgoing.buildEvent(
        this.editor,
        [range],
        'selection',
        true
      );
      this.outgoing.send(event, () => {
        childProcess.exec('open -a Layer');
      });
    };
  }

  handleLayerSearch(item, marker) {
    const codeFold = this.codeSelector.getFoldForRange(marker.getBufferRange());
    if (codeFold) {
      item.emitter.on(
        'clickedSearch',
        _.debounce(this.searchInLayerClickHandler(codeFold), 250, {
          leading: true,
        })
      );
      item.emitter.on('mouseEnterLayerSearch', () => {
        this.removeHighlight();
        this.highlightMarker(codeFold.marker);
      });
      item.emitter.on('mouseLeaveLayerSearch', () => {
        this.removeHighlight();
      });
    }
  }

  highlightCommit(
    commitHash: string,
    labelContent = `<span class="icon icon-git-commit"></span><span class="highlight-label">${commitHash.substr(
      0,
      6
    )}</span>`,
    customClasses = ''
  ) {
    const markers = this.markers[commitHash];
    if (!markers) return;
    for (const i in markers) {
      const marker = markers[i];
      const decoration = this.editor.decorateMarker(marker, {
        type: 'line',
        class: `line-highlight layer-highlight ${customClasses}`,
      });
      this.highlightDecorations.push(decoration);
      if (ConfigManager.get('displayHighlightLabels')) {
        const label = document.createElement('div');
        label.style['width'] = '100%';
        label.style['height'] = '19px';
        label.style['opacity'] = '0.5';
        label.innerHTML = labelContent;
        const labelDecoration = this.editor.decorateMarker(marker, {
          type: 'overlay',
          class: 'label-highlight',
          position: 'tail',
          avoidOverflow: false,
          item: label,
        });
        this.highlightDecorations.push(labelDecoration);
      }
    }
  }

  async highlightPullRequestForCommit(commitHash) {
    this.overlayOverflowHack();
    await this.integrationData;
    let pullRequests = await IntegrationData.getPullRequestsForCommit(
      this.editor.getPath(),
      commitHash
    );
    if (pullRequests.length > 0) {
      let commits = await IntegrationData.getCommitsForPullRequest(
        this.editor.getPath(),
        pullRequests[0].number
      );
      if (commits) {
        commits = commits.filter(hash => hash != commitHash);
        commits.map(hash => {
          this.highlightCommit(
            hash,
            `<span class="icon icon-git-pull-request"></span><span class="highlight-label">#${pullRequests[0]
              .number}</span>`,
            'pr-line-highlight'
          );
        });
      }
    }
  }

  overlayOverflowHack() {
    this.overlayHack = document.createElement('style');
    document.head.appendChild(this.overlayHack);
    this.overlayHack.innerHTML = `
      .tab-bar, .status-bar {
        z-index: 6;
      }
    `;
  }

  removeOverlayOverflowHack() {
    if (this.overlayHack) {
      this.overlayHack.remove();
    }
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
    this.integrationData = IntegrationData.getIntegrationDataForFile(filePath);
    let commits = await GitData.getCommitsForFile(filePath);
    this.commits = commits.commits;
    let ranges = await GitData.getGutterRangesForFile(filePath);
    this.ranges = ranges.ranges;
    let date = await GitData.getFirstCommitDateForRepo(filePath);
    this.firstCommitDate = new Date(date);
  }
}

export default GutterView;
