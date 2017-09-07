import IEditor = AtomCore.IEditor;

'use babel';

import { CompositeDisposable } from 'atom';
import StepsizeHelper from './StepsizeHelper';
import GitHelper from './GitHelper';
import * as _ from 'lodash';
import * as moment from 'moment';
import GutterRange from './GutterRange';
import GutterItem from './interface/GutterItem';
import { colorScale } from './ColourScale';
import IEditor = AtomCore.IEditor;

export default class GutterView {

  private editor: IEditor;
  private pullRequests: Array<any>;
  private commits: { [prop: string]: any };
  private metadata: any;
  private blame: Array<string>;
  private ranges: Array<any>;
  private width: number;
  private boundResizeListener: EventListener;
  private previousResize: number = 0;
  private firstCommitDate: Date;

  constructor(editor: IEditor) {
    this.editor = editor;
    this.editor.addGutter({ name: 'layer' });
    this.setGutterWidth(210);
    this.boundResizeListener = this.resizeListener.bind(this);
    Promise.all([
      GitHelper.getRepoRootPath(this.editor.getPath()).then((repoPath) => {
        return GitHelper.getFirstCommitDateForRepo(repoPath)
      }),
      this.fetchGutterData(),
    ]).then((results) => {
      this.firstCommitDate = results[0];
      this.drawGutter();
    }).catch((e) => {
      throw e;
    });
  }

  private drawGutter() {
    for (let i = 0; i < this.ranges.length; i++) {
      const range = this.ranges[i];
      const item = new GutterItem();
      item.resizeEmitter.on('resizeHandleDragged', this.boundResizeListener);
      item.resizeEmitter.on('resizeHandleReleased', () => {
        this.previousResize = 0;
      });
      const date = this.commits[range.identifier].commitedAt;
      const formattedDate = moment(date).format('YYYY-MM-DD');
      const author = this.commits[range.identifier].author;
      const commitDay = Math.floor((((date - this.firstCommitDate.getTime()) / 1000) / 3600) / 24);
      item.setIndicator('#3b3b3b'); // Set default indicator colour to display if calculations take a while
      colorScale(this.editor).then((scale) => {
        if(scale[commitDay]){
          const color = scale[commitDay].rgb().string();
          item.setIndicator(color);
        }
      });
      item.setContent(`${formattedDate} ${author}`);
      let marker = this.editor.markBufferRange(range.toAtomRange());
      const oddEven = i % 2 === 0 ? 'layer-even' : 'layer-odd';
      let decoration = this.editor.decorateMarker(marker, {
        type: 'gutter',
        class: `layer-gutter ${oddEven}`,
        gutterName: 'layer',
        item: item.element(),
      });
    }
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
    const blame = await this.getGitBlame();
    try {
      this.blame = blame;
      this.ranges = this.buildGutterRanges();
      this.commits = this.blame.reduce((acc, line) => {
        const parsed = GitHelper.parseBlameLine(line);
        if (acc[parsed.commitHash]) {
          return acc;
        }
        acc[parsed.commitHash] = parsed;
        return acc;
      }, {});
    } catch (e) {
      throw e;
    }
  }

  private async getIntegrationData() {
    const response = await StepsizeHelper.fetchIntegrationData(
      this.blame,
      GitHelper.getHashesFromBlame(await this.getRepoMetadata()),
    );
    this.pullRequests = response.data.pullRequests;
    return response;
  }

  private async getRepoMetadata() {
    let remotes = await GitHelper.getRepoRemotes(this.editor.getPath());
    return GitHelper.extractRepoMetadataFromRemotes(remotes);
  }

  private async getGitBlame() {
    return await GitHelper.getGitBlameOutput(
      this.editor.getPath(),
      StepsizeHelper.rangesToSelectedLineNumbers([this.editor.getBuffer().getRange()]),
    );
  }

  private transformedPullRequestArray() {
    return _.reduce(this.pullRequests, (acc: Array<{ number: string, hashes: string[] }>,
                                        pullRequest,
                                        key) => {
      acc.push({
        number: key,
        hashes: _.map(pullRequest.commits, 'commitHash'),
      });
      return acc;
    }, []);
  }

  buildGutterRanges() {
    const pullRequests = this.transformedPullRequestArray();
    let lineRanges = [];

    for (let i = 0; i < this.blame.length; i++) {
      const line = this.blame[i];
      const commitHash = line.split(' ')[0];

      // Build array of ranges
      if (lineRanges.length == 0) { // No ranges exist
        lineRanges.push(new GutterRange(i, commitHash));
      } else {
        const currentRange = lineRanges[lineRanges.length - 1]; // Get last range
        if (currentRange.identifier === commitHash) {
          currentRange.incrementRange();
        } else { // Add new range
          lineRanges.push(new GutterRange(i, commitHash));
        }
      }
    }

    return lineRanges;
  }

}
