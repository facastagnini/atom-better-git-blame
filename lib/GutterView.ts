import IEditor = AtomCore.IEditor;

'use babel';

import { CompositeDisposable } from 'atom';
import StepsizeHelper from './StepsizeHelper';
import GitHelper from './GitHelper';
import * as _ from 'lodash';
import * as moment from 'moment';
import GutterRange from './GutterRange';
import GutterItem from './interface/GutterItem';

export default class GutterView {

  private editor: IEditor;
  private pullRequests;
  private commits;
  private metadata;
  private blame;
  private ranges;
  private width;
  private boundResizeListener;
  private previousResize: number = 0;
  private firstCommitDate: Date;

  constructor(editor) {
    this.editor = editor;
    this.editor.addGutter({ name: 'layer' });
    this.setGutterWidth(210);
    this.boundResizeListener = this.resizeListener.bind(this);
    Promise.all([
      GitHelper.getFirstCommitDateForRepo(editor.getPath()),
      this.fetchGutterData()
    ]).then((results) => {
      this.firstCommitDate = results[0];
      this.drawGutter();
    }).catch((e) => {
      throw e;
    })
  }

  private drawGutter() {
    const totalDays = (((Date.now() - this.firstCommitDate) / 1000) / 3600) / 24;
    console.log(totalDays);
    const uniqueIdentifiers = _.uniq(_.map(this.ranges, 'identifier'))
    const colourMultiplier = 255 / (uniqueIdentifiers.length);
    const itemColours = uniqueIdentifiers.reduce((acc, identifier, index) => {
      acc[identifier] = `rgba(${Math.round(index * colourMultiplier)}, 70, 70, 0.7)`;
      return acc;
    }, {});

    for (let i = 0; i < this.ranges.length; i++) {
      const range = this.ranges[i];
      const item = new GutterItem();
      item.resizeEmitter.on('resizeHandleDragged', this.boundResizeListener)
      item.resizeEmitter.on('resizeHandleReleased', () => {
        this.previousResize = 0;
      })
      item.setIndicator(itemColours[range.identifier]);
      const date = moment(this.commits[range.identifier].commitedAt).format('YYYY-MM-DD');
      const author = this.commits[range.identifier].author;
      item.setContent(`${date} ${author}`);
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

  resizeListener(resizeOffset) {
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
    const metadata = this.getRepoMetadata();
    const blame = this.getGitBlame();

    // Execute the async functions together in parallel 🏃💨
    const metadataAndBlame = [await metadata, await blame];
    try {
      const response = await StepsizeHelper.fetchIntegrationData(
        metadataAndBlame[0],
        GitHelper.getHashesFromBlame(metadataAndBlame[1]),
      );
      this.metadata = metadataAndBlame[0];
      this.blame = metadataAndBlame[1];
      this.pullRequests = response.data.pullRequests;
      this.ranges = this.buildGutterRanges();
      this.commits = this.blame.reduce((acc, line) => {
        const parsed = GitHelper.parseBlameLine(line);
        if(acc[parsed.commitHash]){
          return acc;
        }
        acc[parsed.commitHash] = parsed;
        return acc;
      }, {});
    } catch (e) {
      throw e;
    }
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
    return _.reduce(this.pullRequests, (acc, pullRequest, key) => {
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
