'use babel';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Range } from 'atom';
import _ from 'lodash';
import * as childProcess from 'child_process';
import GutterItem from './GutterItem';
import { colorScale } from './ColourScale';
import * as GitData from '../data/GitData';
import * as IntegrationData from '../data/IntegrationData';
import CodeSelector from '../stepsize/CodeSelector';
import * as ConfigManager from '../ConfigManager';
import * as Analytics from '../stepsize/Analytics';
import * as IntegrationNotification from '../interface/IntegrationNotification';
class GutterView {
    constructor(editor, outgoing) {
        this.previousResize = 0;
        this.markers = {};
        this.highlightDecorations = [];
        this.editor = editor;
        this.outgoing = outgoing;
        this.gutter = this.editor.addGutter({ name: 'layer' });
        this.setGutterWidth(ConfigManager.get('defaultWidth'));
        this.boundResizeListener = this.resizeListener.bind(this);
        this.codeSelector = new CodeSelector(this.editor);
        GitData.getRepoRootPath(this.editor.getPath())
            .then(repoRootPath => GitData.getRepoMetadata(repoRootPath))
            .then(metadata => this.anonymousRepoMetadata = Analytics.anonymiseRepoMetadata(metadata))
            .then(() => this.fetchGutterData())
            .then(() => this.drawGutter())
            .then(() => {
            Analytics.track('Gutter shown', this.anonymousRepoMetadata);
            IntegrationNotification.handleGutterShown();
        })
            .catch(err => console.error(err));
        return this;
    }
    toggle() {
        if (this.gutter.isVisible()) {
            this.gutter.hide();
            Analytics.track('Gutter hidden', this.anonymousRepoMetadata);
        }
        else {
            this.gutter.show();
            Analytics.track('Gutter shown', this.anonymousRepoMetadata);
            IntegrationNotification.handleGutterShown();
        }
    }
    buildMarkersForRanges() {
        for (const identifier in this.ranges) {
            const ranges = this.ranges[identifier];
            this.markers[identifier] = ranges.map(range => this.editor.markBufferRange(range.toAtomRange()));
        }
    }
    drawGutter() {
        this.buildMarkersForRanges();
        for (const identifier in this.markers) {
            const commit = this.commits[identifier];
            const date = commit.commitedAt;
            const commitDay = Math.floor((date - this.firstCommitDate.getTime()) / 1000 / 3600 / 24);
            colorScale(this.editor).then(scale => {
                const markers = this.markers[identifier];
                for (const i in markers) {
                    const marker = markers[i];
                    const item = new GutterItem({
                        commit,
                        commitDay: commitDay,
                        firstCommitDate: this.firstCommitDate,
                    });
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
            const event = this.outgoing.buildEvent(this.editor, [range], 'selection', true);
            this.outgoing.send(event, () => {
                childProcess.exec('open -a Layer');
            });
        };
    }
    handleLayerSearch(item, marker) {
        const codeFold = this.codeSelector.getFoldForRange(marker.getBufferRange());
        if (codeFold) {
            item.emitter.on('clickedSearch', _.debounce(this.searchInLayerClickHandler(codeFold), 250, {
                leading: true,
            }));
            item.emitter.on('mouseEnterLayerSearch', () => {
                this.removeHighlight();
                this.highlightMarker(codeFold.marker);
            });
            item.emitter.on('mouseLeaveLayerSearch', () => {
                this.removeHighlight();
            });
        }
    }
    highlightCommit(commitHash, labelContent = `<span class="icon icon-git-commit"></span><span class="highlight-label">${commitHash.substr(0, 6)}</span>`, customClasses = '') {
        const markers = this.markers[commitHash];
        if (!markers)
            return;
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
    highlightPullRequestForCommit(commitHash) {
        return __awaiter(this, void 0, void 0, function* () {
            this.overlayOverflowHack();
            yield this.integrationData;
            let pullRequests = yield IntegrationData.getPullRequestsForCommit(this.editor.getPath(), commitHash);
            if (pullRequests.length > 0) {
                let commits = yield IntegrationData.getCommitsForPullRequest(this.editor.getPath(), pullRequests[0].number);
                if (commits) {
                    commits = commits.filter(hash => hash != commitHash);
                    commits.map(hash => {
                        this.highlightCommit(hash, `<span class="icon icon-git-pull-request"></span><span class="highlight-label">#${pullRequests[0]
                            .number}</span>`, 'pr-line-highlight');
                    });
                }
            }
        });
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
        this.highlightDecorations.push(this.editor.decorateMarker(marker, {
            type: 'line',
            class: 'line-highlight layer-highlight',
        }));
    }
    removeHighlight() {
        this.highlightDecorations.map(decoration => decoration.destroy());
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
    setGutterWidth(width) {
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
    fetchGutterData() {
        return __awaiter(this, void 0, void 0, function* () {
            const filePath = this.editor.getPath();
            this.integrationData = IntegrationData.getIntegrationDataForFile(filePath);
            let commits = yield GitData.getCommitsForFile(filePath);
            this.commits = commits.commits;
            let ranges = yield GitData.getGutterRangesForFile(filePath);
            this.ranges = ranges.ranges;
            let date = yield GitData.getFirstCommitDateForRepo(filePath);
            this.firstCommitDate = new Date(date);
        });
    }
}
export default GutterView;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR3V0dGVyVmlldy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9pbnRlcmZhY2UvR3V0dGVyVmlldy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUM7Ozs7Ozs7OztBQU1aLE9BQU8sRUFBdUIsS0FBSyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQ2xELE9BQU8sQ0FBQyxNQUFNLFFBQVEsQ0FBQztBQUN2QixPQUFPLEtBQUssWUFBWSxNQUFNLGVBQWUsQ0FBQztBQUU5QyxPQUFPLFVBQVUsTUFBTSxjQUFjLENBQUM7QUFDdEMsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEtBQUssT0FBTyxNQUFNLGlCQUFpQixDQUFDO0FBQzNDLE9BQU8sS0FBSyxlQUFlLE1BQU0seUJBQXlCLENBQUM7QUFDM0QsT0FBTyxZQUFZLE1BQU0sMEJBQTBCLENBQUM7QUFFcEQsT0FBTyxLQUFLLGFBQWEsTUFBTSxrQkFBa0IsQ0FBQztBQUNsRCxPQUFPLEtBQUssU0FBUyxNQUFNLHVCQUF1QixDQUFDO0FBQ25ELE9BQU8sS0FBSyx1QkFBdUIsTUFBTSxzQ0FBc0MsQ0FBQztBQUVoRjtJQWlCRSxZQUFZLE1BQWUsRUFBRSxRQUEwQjtRQVYvQyxtQkFBYyxHQUFXLENBQUMsQ0FBQztRQUczQixZQUFPLEdBQW9ELEVBQUUsQ0FBQztRQUM5RCx5QkFBb0IsR0FBc0IsRUFBRSxDQUFDO1FBT25ELElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUN2RCxJQUFJLENBQUMsY0FBYyxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztRQUN2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RUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ1gsS0FBSyxHQUFHLFVBQVUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNqQyxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNuQyxDQUFDO1FBQ0QsS0FBSyxDQUFDLFNBQVMsR0FBRzs7aUJBRUwsSUFBSSxDQUFDLEtBQUs7O0tBRXRCLENBQUM7SUFDSixDQUFDO0lBRWEsZUFBZTs7WUFDM0IsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUN2QyxJQUFJLENBQUMsZUFBZSxHQUFHLGVBQWUsQ0FBQyx5QkFBeUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUMzRSxJQUFJLE9BQU8sR0FBRyxNQUFNLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN4RCxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUM7WUFDL0IsSUFBSSxNQUFNLEdBQUcsTUFBTSxPQUFPLENBQUMsc0JBQXNCLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDNUQsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO1lBQzVCLElBQUksSUFBSSxHQUFHLE1BQU0sT0FBTyxDQUFDLHlCQUF5QixDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzdELElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDeEMsQ0FBQztLQUFBO0NBQ0Y7QUFFRCxlQUFlLFVBQVUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgSUVkaXRvciA9IEF0b21Db3JlLklFZGl0b3I7XG5pbXBvcnQgSURpc3BsYXlCdWZmZXJNYXJrZXIgPSBBdG9tQ29yZS5JRGlzcGxheUJ1ZmZlck1hcmtlcjtcbmltcG9ydCBJR3V0dGVyVmlldyA9IEF0b21Db3JlLklHdXR0ZXJWaWV3O1xuaW1wb3J0IERlY29yYXRpb24gPSBBdG9tQ29yZS5EZWNvcmF0aW9uO1xuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSwgUmFuZ2UgfSBmcm9tICdhdG9tJztcbmltcG9ydCBfIGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgKiBhcyBjaGlsZFByb2Nlc3MgZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQgR3V0dGVyUmFuZ2UgZnJvbSAnLi9HdXR0ZXJSYW5nZSc7XG5pbXBvcnQgR3V0dGVySXRlbSBmcm9tICcuL0d1dHRlckl0ZW0nO1xuaW1wb3J0IHsgY29sb3JTY2FsZSB9IGZyb20gJy4vQ29sb3VyU2NhbGUnO1xuaW1wb3J0ICogYXMgR2l0RGF0YSBmcm9tICcuLi9kYXRhL0dpdERhdGEnO1xuaW1wb3J0ICogYXMgSW50ZWdyYXRpb25EYXRhIGZyb20gJy4uL2RhdGEvSW50ZWdyYXRpb25EYXRhJztcbmltcG9ydCBDb2RlU2VsZWN0b3IgZnJvbSAnLi4vc3RlcHNpemUvQ29kZVNlbGVjdG9yJztcbmltcG9ydCBTdGVwc2l6ZU91dGdvaW5nIGZyb20gJy4uL3N0ZXBzaXplL1N0ZXBzaXplT3V0Z29pbmcnO1xuaW1wb3J0ICogYXMgQ29uZmlnTWFuYWdlciBmcm9tICcuLi9Db25maWdNYW5hZ2VyJztcbmltcG9ydCAqIGFzIEFuYWx5dGljcyBmcm9tICcuLi9zdGVwc2l6ZS9BbmFseXRpY3MnO1xuaW1wb3J0ICogYXMgSW50ZWdyYXRpb25Ob3RpZmljYXRpb24gZnJvbSAnLi4vaW50ZXJmYWNlL0ludGVncmF0aW9uTm90aWZpY2F0aW9uJztcblxuY2xhc3MgR3V0dGVyVmlldyB7XG4gIHByaXZhdGUgZWRpdG9yOiBJRWRpdG9yO1xuICBwcml2YXRlIGd1dHRlcjogSUd1dHRlclZpZXc7XG4gIHByaXZhdGUgY29tbWl0czogeyBbcHJvcDogc3RyaW5nXTogYW55IH07XG4gIHByaXZhdGUgcmFuZ2VzOiB7IFtwcm9wOiBzdHJpbmddOiBBcnJheTxHdXR0ZXJSYW5nZT4gfTtcbiAgcHJpdmF0ZSB3aWR0aDogbnVtYmVyO1xuICBwcml2YXRlIGJvdW5kUmVzaXplTGlzdGVuZXI6IEV2ZW50TGlzdGVuZXI7XG4gIHByaXZhdGUgcHJldmlvdXNSZXNpemU6IG51bWJlciA9IDA7XG4gIHByaXZhdGUgZmlyc3RDb21taXREYXRlOiBEYXRlO1xuICBwcml2YXRlIGFub255bW91c1JlcG9NZXRhZGF0YTogQW5hbHl0aWNzLklBbm9ueW1vdXNSZXBvTWV0YWRhdGE7XG4gIHByaXZhdGUgbWFya2VyczogeyBbcHJvcDogc3RyaW5nXTogQXJyYXk8SURpc3BsYXlCdWZmZXJNYXJrZXI+IH0gPSB7fTtcbiAgcHJpdmF0ZSBoaWdobGlnaHREZWNvcmF0aW9uczogQXJyYXk8RGVjb3JhdGlvbj4gPSBbXTtcbiAgcHJpdmF0ZSBjb2RlU2VsZWN0b3I6IENvZGVTZWxlY3RvcjtcbiAgcHJpdmF0ZSBvdXRnb2luZzogU3RlcHNpemVPdXRnb2luZztcbiAgcHJpdmF0ZSBpbnRlZ3JhdGlvbkRhdGE6IGFueTtcbiAgcHJpdmF0ZSBvdmVybGF5SGFjazogSFRNTEVsZW1lbnQ7XG5cbiAgY29uc3RydWN0b3IoZWRpdG9yOiBJRWRpdG9yLCBvdXRnb2luZzogU3RlcHNpemVPdXRnb2luZykge1xuICAgIHRoaXMuZWRpdG9yID0gZWRpdG9yO1xuICAgIHRoaXMub3V0Z29pbmcgPSBvdXRnb2luZztcbiAgICB0aGlzLmd1dHRlciA9IHRoaXMuZWRpdG9yLmFkZEd1dHRlcih7IG5hbWU6ICdsYXllcicgfSk7XG4gICAgdGhpcy5zZXRHdXR0ZXJXaWR0aChDb25maWdNYW5hZ2VyLmdldCgnZGVmYXVsdFdpZHRoJykpO1xuICAgIHRoaXMuYm91bmRSZXNpemVMaXN0ZW5lciA9IHRoaXMucmVzaXplTGlzdGVuZXIuYmluZCh0aGlzKTtcbiAgICB0aGlzLmNvZGVTZWxlY3RvciA9IG5ldyBDb2RlU2VsZWN0b3IodGhpcy5lZGl0b3IpO1xuICAgIEdpdERhdGEuZ2V0UmVwb1Jvb3RQYXRoKHRoaXMuZWRpdG9yLmdldFBhdGgoKSlcbiAgICAgIC50aGVuKHJlcG9Sb290UGF0aCA9PiBHaXREYXRhLmdldFJlcG9NZXRhZGF0YShyZXBvUm9vdFBhdGgpKVxuICAgICAgLnRoZW4obWV0YWRhdGEgPT4gdGhpcy5hbm9ueW1vdXNSZXBvTWV0YWRhdGEgPSBBbmFseXRpY3MuYW5vbnltaXNlUmVwb01ldGFkYXRhKG1ldGFkYXRhKSlcbiAgICAgIC50aGVuKCgpID0+IHRoaXMuZmV0Y2hHdXR0ZXJEYXRhKCkpXG4gICAgICAudGhlbigoKSA9PiB0aGlzLmRyYXdHdXR0ZXIoKSlcbiAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgQW5hbHl0aWNzLnRyYWNrKCdHdXR0ZXIgc2hvd24nLCB0aGlzLmFub255bW91c1JlcG9NZXRhZGF0YSk7XG4gICAgICAgIEludGVncmF0aW9uTm90aWZpY2F0aW9uLmhhbmRsZUd1dHRlclNob3duKCk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGVyciA9PiBjb25zb2xlLmVycm9yKGVycikpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcHVibGljIHRvZ2dsZSgpIHtcbiAgICBpZiAodGhpcy5ndXR0ZXIuaXNWaXNpYmxlKCkpIHtcbiAgICAgIHRoaXMuZ3V0dGVyLmhpZGUoKTtcbiAgICAgIEFuYWx5dGljcy50cmFjaygnR3V0dGVyIGhpZGRlbicsIHRoaXMuYW5vbnltb3VzUmVwb01ldGFkYXRhKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5ndXR0ZXIuc2hvdygpO1xuICAgICAgQW5hbHl0aWNzLnRyYWNrKCdHdXR0ZXIgc2hvd24nLCB0aGlzLmFub255bW91c1JlcG9NZXRhZGF0YSk7XG4gICAgICBJbnRlZ3JhdGlvbk5vdGlmaWNhdGlvbi5oYW5kbGVHdXR0ZXJTaG93bigpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYnVpbGRNYXJrZXJzRm9yUmFuZ2VzKCkge1xuICAgIGZvciAoY29uc3QgaWRlbnRpZmllciBpbiB0aGlzLnJhbmdlcykge1xuICAgICAgY29uc3QgcmFuZ2VzID0gdGhpcy5yYW5nZXNbaWRlbnRpZmllcl07XG4gICAgICB0aGlzLm1hcmtlcnNbaWRlbnRpZmllcl0gPSByYW5nZXMubWFwKHJhbmdlID0+XG4gICAgICAgIHRoaXMuZWRpdG9yLm1hcmtCdWZmZXJSYW5nZShyYW5nZS50b0F0b21SYW5nZSgpKVxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGRyYXdHdXR0ZXIoKSB7XG4gICAgdGhpcy5idWlsZE1hcmtlcnNGb3JSYW5nZXMoKTtcbiAgICBmb3IgKGNvbnN0IGlkZW50aWZpZXIgaW4gdGhpcy5tYXJrZXJzKSB7XG4gICAgICBjb25zdCBjb21taXQgPSB0aGlzLmNvbW1pdHNbaWRlbnRpZmllcl07XG4gICAgICBjb25zdCBkYXRlID0gY29tbWl0LmNvbW1pdGVkQXQ7XG4gICAgICBjb25zdCBjb21taXREYXkgPSBNYXRoLmZsb29yKChkYXRlIC0gdGhpcy5maXJzdENvbW1pdERhdGUuZ2V0VGltZSgpKSAvIDEwMDAgLyAzNjAwIC8gMjQpO1xuICAgICAgY29sb3JTY2FsZSh0aGlzLmVkaXRvcikudGhlbihzY2FsZSA9PiB7XG4gICAgICAgIGNvbnN0IG1hcmtlcnMgPSB0aGlzLm1hcmtlcnNbaWRlbnRpZmllcl07XG4gICAgICAgIGZvciAoY29uc3QgaSBpbiBtYXJrZXJzKSB7XG4gICAgICAgICAgY29uc3QgbWFya2VyID0gbWFya2Vyc1tpXTtcbiAgICAgICAgICBjb25zdCBpdGVtID0gbmV3IEd1dHRlckl0ZW0oe1xuICAgICAgICAgICAgY29tbWl0LFxuICAgICAgICAgICAgY29tbWl0RGF5OiBjb21taXREYXksXG4gICAgICAgICAgICBmaXJzdENvbW1pdERhdGU6IHRoaXMuZmlyc3RDb21taXREYXRlLFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHRoaXMuaGFuZGxlUmVzaXplcyhpdGVtKTtcbiAgICAgICAgICBpdGVtLnNldEluZGljYXRvcignIzNiM2IzYicpOyAvLyBTZXQgZGVmYXVsdCBpbmRpY2F0b3IgY29sb3VyIHRvIGRpc3BsYXkgaWYgY2FsY3VsYXRpb25zIHRha2UgYSB3aGlsZVxuICAgICAgICAgIGlmIChzY2FsZVtjb21taXREYXldKSB7XG4gICAgICAgICAgICBjb25zdCBjb2xvciA9IHNjYWxlW01hdGguZmxvb3IoY29tbWl0RGF5KV1cbiAgICAgICAgICAgICAgLnJnYigpXG4gICAgICAgICAgICAgIC5mYWRlKDAuMilcbiAgICAgICAgICAgICAgLnN0cmluZygpO1xuICAgICAgICAgICAgaXRlbS5zZXRJbmRpY2F0b3IoY29sb3IpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmVkaXRvci5kZWNvcmF0ZU1hcmtlcihtYXJrZXIsIHtcbiAgICAgICAgICAgIHR5cGU6ICdndXR0ZXInLFxuICAgICAgICAgICAgY2xhc3M6IGBsYXllci1ndXR0ZXJgLFxuICAgICAgICAgICAgZ3V0dGVyTmFtZTogJ2xheWVyJyxcbiAgICAgICAgICAgIGl0ZW06IGl0ZW0uZWxlbWVudCgpLFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGl0ZW0uZW1pdHRlci5vbignbW91c2VFbnRlcicsICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuaGlnaGxpZ2h0Q29tbWl0KGlkZW50aWZpZXIpO1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVMYXllclNlYXJjaChpdGVtLCBtYXJrZXIpO1xuICAgICAgICAgICAgaWYgKENvbmZpZ01hbmFnZXIuZ2V0KCdoaWdobGlnaHRQdWxsUmVxdWVzdE9uSG92ZXInKSkge1xuICAgICAgICAgICAgICB0aGlzLmhpZ2hsaWdodFB1bGxSZXF1ZXN0Rm9yQ29tbWl0KGlkZW50aWZpZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGl0ZW0uZW1pdHRlci5vbignbW91c2VMZWF2ZScsICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlSGlnaGxpZ2h0KCk7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZU92ZXJsYXlPdmVyZmxvd0hhY2soKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgaGFuZGxlUmVzaXplcyhpdGVtKSB7XG4gICAgaXRlbS5yZXNpemVFbWl0dGVyLm9uKCdyZXNpemVIYW5kbGVEcmFnZ2VkJywgdGhpcy5ib3VuZFJlc2l6ZUxpc3RlbmVyKTtcbiAgICBpdGVtLnJlc2l6ZUVtaXR0ZXIub24oJ3Jlc2l6ZUhhbmRsZVJlbGVhc2VkJywgKCkgPT4ge1xuICAgICAgdGhpcy5wcmV2aW91c1Jlc2l6ZSA9IDA7XG4gICAgfSk7XG4gIH1cblxuICBzZWFyY2hJbkxheWVyQ2xpY2tIYW5kbGVyKGNvZGVGb2xkKSB7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIEFuYWx5dGljcy50cmFjaygnU2VhcmNoIGluIExheWVyIGNsaWNrZWQnKTtcbiAgICAgIGNvbnN0IHJhbmdlID0gbmV3IFJhbmdlKFtjb2RlRm9sZC5zdGFydCwgMF0sIFtjb2RlRm9sZC5lbmQgKyAxLCAwXSk7XG4gICAgICBjb25zdCBldmVudCA9IHRoaXMub3V0Z29pbmcuYnVpbGRFdmVudCh0aGlzLmVkaXRvciwgW3JhbmdlXSwgJ3NlbGVjdGlvbicsIHRydWUpO1xuICAgICAgdGhpcy5vdXRnb2luZy5zZW5kKGV2ZW50LCAoKSA9PiB7XG4gICAgICAgIGNoaWxkUHJvY2Vzcy5leGVjKCdvcGVuIC1hIExheWVyJyk7XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG5cbiAgaGFuZGxlTGF5ZXJTZWFyY2goaXRlbSwgbWFya2VyKSB7XG4gICAgY29uc3QgY29kZUZvbGQgPSB0aGlzLmNvZGVTZWxlY3Rvci5nZXRGb2xkRm9yUmFuZ2UobWFya2VyLmdldEJ1ZmZlclJhbmdlKCkpO1xuICAgIGlmIChjb2RlRm9sZCkge1xuICAgICAgaXRlbS5lbWl0dGVyLm9uKFxuICAgICAgICAnY2xpY2tlZFNlYXJjaCcsXG4gICAgICAgIF8uZGVib3VuY2UodGhpcy5zZWFyY2hJbkxheWVyQ2xpY2tIYW5kbGVyKGNvZGVGb2xkKSwgMjUwLCB7XG4gICAgICAgICAgbGVhZGluZzogdHJ1ZSxcbiAgICAgICAgfSlcbiAgICAgICk7XG4gICAgICBpdGVtLmVtaXR0ZXIub24oJ21vdXNlRW50ZXJMYXllclNlYXJjaCcsICgpID0+IHtcbiAgICAgICAgdGhpcy5yZW1vdmVIaWdobGlnaHQoKTtcbiAgICAgICAgdGhpcy5oaWdobGlnaHRNYXJrZXIoY29kZUZvbGQubWFya2VyKTtcbiAgICAgIH0pO1xuICAgICAgaXRlbS5lbWl0dGVyLm9uKCdtb3VzZUxlYXZlTGF5ZXJTZWFyY2gnLCAoKSA9PiB7XG4gICAgICAgIHRoaXMucmVtb3ZlSGlnaGxpZ2h0KCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBoaWdobGlnaHRDb21taXQoXG4gICAgY29tbWl0SGFzaDogc3RyaW5nLFxuICAgIGxhYmVsQ29udGVudCA9IGA8c3BhbiBjbGFzcz1cImljb24gaWNvbi1naXQtY29tbWl0XCI+PC9zcGFuPjxzcGFuIGNsYXNzPVwiaGlnaGxpZ2h0LWxhYmVsXCI+JHtjb21taXRIYXNoLnN1YnN0cihcbiAgICAgIDAsXG4gICAgICA2XG4gICAgKX08L3NwYW4+YCxcbiAgICBjdXN0b21DbGFzc2VzID0gJydcbiAgKSB7XG4gICAgY29uc3QgbWFya2VycyA9IHRoaXMubWFya2Vyc1tjb21taXRIYXNoXTtcbiAgICBpZiAoIW1hcmtlcnMpIHJldHVybjtcbiAgICBmb3IgKGNvbnN0IGkgaW4gbWFya2Vycykge1xuICAgICAgY29uc3QgbWFya2VyID0gbWFya2Vyc1tpXTtcbiAgICAgIGNvbnN0IGRlY29yYXRpb24gPSB0aGlzLmVkaXRvci5kZWNvcmF0ZU1hcmtlcihtYXJrZXIsIHtcbiAgICAgICAgdHlwZTogJ2xpbmUnLFxuICAgICAgICBjbGFzczogYGxpbmUtaGlnaGxpZ2h0IGxheWVyLWhpZ2hsaWdodCAke2N1c3RvbUNsYXNzZXN9YCxcbiAgICAgIH0pO1xuICAgICAgdGhpcy5oaWdobGlnaHREZWNvcmF0aW9ucy5wdXNoKGRlY29yYXRpb24pO1xuICAgICAgaWYgKENvbmZpZ01hbmFnZXIuZ2V0KCdkaXNwbGF5SGlnaGxpZ2h0TGFiZWxzJykpIHtcbiAgICAgICAgY29uc3QgbGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgbGFiZWwuc3R5bGVbJ3dpZHRoJ10gPSAnMTAwJSc7XG4gICAgICAgIGxhYmVsLnN0eWxlWydoZWlnaHQnXSA9ICcxOXB4JztcbiAgICAgICAgbGFiZWwuc3R5bGVbJ29wYWNpdHknXSA9ICcwLjUnO1xuICAgICAgICBsYWJlbC5pbm5lckhUTUwgPSBsYWJlbENvbnRlbnQ7XG4gICAgICAgIGNvbnN0IGxhYmVsRGVjb3JhdGlvbiA9IHRoaXMuZWRpdG9yLmRlY29yYXRlTWFya2VyKG1hcmtlciwge1xuICAgICAgICAgIHR5cGU6ICdvdmVybGF5JyxcbiAgICAgICAgICBjbGFzczogJ2xhYmVsLWhpZ2hsaWdodCcsXG4gICAgICAgICAgcG9zaXRpb246ICd0YWlsJyxcbiAgICAgICAgICBhdm9pZE92ZXJmbG93OiBmYWxzZSxcbiAgICAgICAgICBpdGVtOiBsYWJlbCxcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuaGlnaGxpZ2h0RGVjb3JhdGlvbnMucHVzaChsYWJlbERlY29yYXRpb24pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGhpZ2hsaWdodFB1bGxSZXF1ZXN0Rm9yQ29tbWl0KGNvbW1pdEhhc2gpIHtcbiAgICB0aGlzLm92ZXJsYXlPdmVyZmxvd0hhY2soKTtcbiAgICBhd2FpdCB0aGlzLmludGVncmF0aW9uRGF0YTtcbiAgICBsZXQgcHVsbFJlcXVlc3RzID0gYXdhaXQgSW50ZWdyYXRpb25EYXRhLmdldFB1bGxSZXF1ZXN0c0ZvckNvbW1pdChcbiAgICAgIHRoaXMuZWRpdG9yLmdldFBhdGgoKSxcbiAgICAgIGNvbW1pdEhhc2hcbiAgICApO1xuICAgIGlmIChwdWxsUmVxdWVzdHMubGVuZ3RoID4gMCkge1xuICAgICAgbGV0IGNvbW1pdHMgPSBhd2FpdCBJbnRlZ3JhdGlvbkRhdGEuZ2V0Q29tbWl0c0ZvclB1bGxSZXF1ZXN0KFxuICAgICAgICB0aGlzLmVkaXRvci5nZXRQYXRoKCksXG4gICAgICAgIHB1bGxSZXF1ZXN0c1swXS5udW1iZXJcbiAgICAgICk7XG4gICAgICBpZiAoY29tbWl0cykge1xuICAgICAgICBjb21taXRzID0gY29tbWl0cy5maWx0ZXIoaGFzaCA9PiBoYXNoICE9IGNvbW1pdEhhc2gpO1xuICAgICAgICBjb21taXRzLm1hcChoYXNoID0+IHtcbiAgICAgICAgICB0aGlzLmhpZ2hsaWdodENvbW1pdChcbiAgICAgICAgICAgIGhhc2gsXG4gICAgICAgICAgICBgPHNwYW4gY2xhc3M9XCJpY29uIGljb24tZ2l0LXB1bGwtcmVxdWVzdFwiPjwvc3Bhbj48c3BhbiBjbGFzcz1cImhpZ2hsaWdodC1sYWJlbFwiPiMke3B1bGxSZXF1ZXN0c1swXVxuICAgICAgICAgICAgICAubnVtYmVyfTwvc3Bhbj5gLFxuICAgICAgICAgICAgJ3ByLWxpbmUtaGlnaGxpZ2h0J1xuICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIG92ZXJsYXlPdmVyZmxvd0hhY2soKSB7XG4gICAgdGhpcy5vdmVybGF5SGFjayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG4gICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZCh0aGlzLm92ZXJsYXlIYWNrKTtcbiAgICB0aGlzLm92ZXJsYXlIYWNrLmlubmVySFRNTCA9IGBcbiAgICAgIC50YWItYmFyLCAuc3RhdHVzLWJhciB7XG4gICAgICAgIHotaW5kZXg6IDY7XG4gICAgICB9XG4gICAgYDtcbiAgfVxuXG4gIHJlbW92ZU92ZXJsYXlPdmVyZmxvd0hhY2soKSB7XG4gICAgaWYgKHRoaXMub3ZlcmxheUhhY2spIHtcbiAgICAgIHRoaXMub3ZlcmxheUhhY2sucmVtb3ZlKCk7XG4gICAgfVxuICB9XG5cbiAgaGlnaGxpZ2h0TWFya2VyKG1hcmtlcikge1xuICAgIHRoaXMuaGlnaGxpZ2h0RGVjb3JhdGlvbnMubWFwKGRlY29yYXRpb24gPT4gZGVjb3JhdGlvbi5kZXN0cm95KCkpO1xuICAgIHRoaXMuaGlnaGxpZ2h0RGVjb3JhdGlvbnMucHVzaChcbiAgICAgIHRoaXMuZWRpdG9yLmRlY29yYXRlTWFya2VyKG1hcmtlciwge1xuICAgICAgICB0eXBlOiAnbGluZScsXG4gICAgICAgIGNsYXNzOiAnbGluZS1oaWdobGlnaHQgbGF5ZXItaGlnaGxpZ2h0JyxcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuXG4gIHJlbW92ZUhpZ2hsaWdodCgpIHtcbiAgICB0aGlzLmhpZ2hsaWdodERlY29yYXRpb25zLm1hcChkZWNvcmF0aW9uID0+IGRlY29yYXRpb24uZGVzdHJveSgpKTtcbiAgfVxuXG4gIHJlc2l6ZUxpc3RlbmVyKHJlc2l6ZU9mZnNldDogbnVtYmVyKSB7XG4gICAgdGhpcy5zZXRHdXR0ZXJXaWR0aCh0aGlzLndpZHRoICsgKHJlc2l6ZU9mZnNldCAtIHRoaXMucHJldmlvdXNSZXNpemUpKTtcbiAgICB0aGlzLnByZXZpb3VzUmVzaXplID0gcmVzaXplT2Zmc2V0O1xuICB9XG5cbiAgc3RhdGljIGd1dHRlclN0eWxlKCkge1xuICAgIGNvbnN0IHNoZWV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgICBzaGVldC50eXBlID0gJ3RleHQvY3NzJztcbiAgICBzaGVldC5pZCA9ICdsYXllci1ndXR0ZXItc3R5bGUnO1xuICAgIHJldHVybiBzaGVldDtcbiAgfVxuXG4gIHNldEd1dHRlcldpZHRoKHdpZHRoOiBudW1iZXIpIHtcbiAgICB0aGlzLndpZHRoID0gTWF0aC5tYXgoNTAsIE1hdGgubWluKHdpZHRoLCA1MDApKTtcbiAgICBsZXQgc2hlZXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbGF5ZXItZ3V0dGVyLXN0eWxlJyk7XG4gICAgaWYgKCFzaGVldCkge1xuICAgICAgc2hlZXQgPSBHdXR0ZXJWaWV3Lmd1dHRlclN0eWxlKCk7XG4gICAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHNoZWV0KTtcbiAgICB9XG4gICAgc2hlZXQuaW5uZXJIVE1MID0gYFxuICAgICAgYXRvbS10ZXh0LWVkaXRvciAuZ3V0dGVyW2d1dHRlci1uYW1lPVwibGF5ZXJcIl0ge1xuICAgICAgICB3aWR0aDogJHt0aGlzLndpZHRofXB4XG4gICAgICB9XG4gICAgYDtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgZmV0Y2hHdXR0ZXJEYXRhKCkge1xuICAgIGNvbnN0IGZpbGVQYXRoID0gdGhpcy5lZGl0b3IuZ2V0UGF0aCgpO1xuICAgIHRoaXMuaW50ZWdyYXRpb25EYXRhID0gSW50ZWdyYXRpb25EYXRhLmdldEludGVncmF0aW9uRGF0YUZvckZpbGUoZmlsZVBhdGgpO1xuICAgIGxldCBjb21taXRzID0gYXdhaXQgR2l0RGF0YS5nZXRDb21taXRzRm9yRmlsZShmaWxlUGF0aCk7XG4gICAgdGhpcy5jb21taXRzID0gY29tbWl0cy5jb21taXRzO1xuICAgIGxldCByYW5nZXMgPSBhd2FpdCBHaXREYXRhLmdldEd1dHRlclJhbmdlc0ZvckZpbGUoZmlsZVBhdGgpO1xuICAgIHRoaXMucmFuZ2VzID0gcmFuZ2VzLnJhbmdlcztcbiAgICBsZXQgZGF0ZSA9IGF3YWl0IEdpdERhdGEuZ2V0Rmlyc3RDb21taXREYXRlRm9yUmVwbyhmaWxlUGF0aCk7XG4gICAgdGhpcy5maXJzdENvbW1pdERhdGUgPSBuZXcgRGF0ZShkYXRlKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBHdXR0ZXJWaWV3O1xuIl19