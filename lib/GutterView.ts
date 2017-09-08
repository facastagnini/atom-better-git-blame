'use babel';

import { CompositeDisposable } from 'atom';
import StepsizeHelper from './StepsizeHelper';
import GitHelper from './GitHelper';
import _ from 'lodash';
import moment from 'moment';
import GutterRange from './GutterRange';
import GutterItem from './interface/GutterItem';
import { colorScale } from './ColourScale';
import IEditor = AtomCore.IEditor;
import IDisplayBufferMarker = AtomCore.IDisplayBufferMarker;
import Decoration = AtomCore.Decoration;

class GutterView {

  private editor: IEditor;
  private pullRequests: Array<any>;
  private commits: { [prop: string]: any };
  private blame: Array<string>;
  private ranges: { [prop: string]: Array<GutterRange>};
  private width: number;
  private boundResizeListener: EventListener;
  private previousResize: number = 0;
  private firstCommitDate: Date;
  private markers: { [prop: string]: Array<IDisplayBufferMarker>} = {};

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
    this.getIntegrationData();
  }

  private buildMarkersForRanges(){
    for(const identifier in this.ranges){
      const ranges = this.ranges[identifier];
      this.markers[identifier] = ranges.map((range) => this.editor.markBufferRange(range.toAtomRange()));
    }
  }

  private drawGutter() {
    this.buildMarkersForRanges();
    let decorations : Decoration[] = [];
    for(const identifier in this.markers){
      const commit = this.commits[identifier];
      const date = commit.commitedAt;
      const formattedDate = moment(date).format('YYYY-MM-DD');
      const author = commit.author;
      const commitDay = Math.floor((((date - this.firstCommitDate.getTime()) / 1000) / 3600) / 24);
      this.markers[identifier].map((marker) => {
        const item = new GutterItem(commit);
        item.resizeEmitter.on('resizeHandleDragged', this.boundResizeListener);
        item.resizeEmitter.on('resizeHandleReleased', () => {
          this.previousResize = 0;
        });
        item.setIndicator('#3b3b3b'); // Set default indicator colour to display if calculations take a while
        colorScale(this.editor).then((scale) => {
          if(scale[commitDay]){
            const color = scale[commitDay].rgb().fade(0.2).string();
            item.setIndicator(color);
          }
        });
        item.setContent(`${formattedDate} ${author}`);
        this.editor.decorateMarker(marker, {
          type: 'gutter',
          class: `layer-gutter`,
          gutterName: 'layer',
          item: item.element(),
        });
        item.emitter.on('mouseEnter', () => {
          console.log(this.getPrForCommit(identifier));
          decorations.map((decoration) => decoration.destroy());
          this.markers[identifier].map((marker) => {
            decorations.push(this.editor.decorateMarker(marker, {
              type: 'line',
              class: 'line-highlight layer-highlight'
            }))
          };
        });
        item.emitter.on('mouseLeave', () => {
          decorations.map((decoration) => decoration.destroy());
        })
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
      this.ranges = this.buildCommitGutterRanges();
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
      await this.getRepoMetadata(),
      GitHelper.getHashesFromBlame(await this.getGitBlame()),
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
    return _.reduce(this.pullRequests, (acc: Array<{ number: number, hashes: string[] }>,
     pullRequest,
     key
    ) => {
      acc.push({
        number: key,
        hashes: _.map(pullRequest.commits, 'commitHash'),
      });
      return acc;
    }, []);
  }

  getPrForCommit(commitHash){
    if(this.pullRequests){
      const searchArray = this.transformedPullRequestArray();
      const found = _.find(searchArray, (obj) => obj.hashes.includes(commitHash));
      if(found){
        return this.pullRequests[found.number];
      }
    }
    return null;
  }

  buildCommitGutterRanges() {
    let lineRanges = [];
    for (let i = 0; i < this.blame.length; i++) {
      const line = this.blame[i];
      const commitHash = line.split(' ')[0];
      // Build array of ranges
      if (lineRanges.length == 0) { // No ranges exist
        lineRanges.push(new GutterRange(i, commitHash));
      } else {
        const currentRange : GutterRange = lineRanges[lineRanges.length - 1]; // Get last range
        if (currentRange.identifier === commitHash) {
          currentRange.incrementRange();
        } else { // Add new range
          lineRanges.push(new GutterRange(i, commitHash));
        }
      }
    }
    return _.groupBy(lineRanges, 'identifier');
  }

}

export default GutterView
