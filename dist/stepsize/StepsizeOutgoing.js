'use babel';
import { createSocket } from 'dgram';
import fs from 'fs';
import StepsizeHelper from './StepsizeHelper';
class StepsizeOutgoing {
    constructor() {
        this.readyTries = 1;
        // sendError - sends error message to Stepsize
        this.sendError = data => {
            let editor = atom.workspace.getActiveTextEditor();
            if (!editor) {
                return;
            }
            let event = {
                source: 'atom',
                action: 'error',
                filename: fs.realpathSync(editor.getPath()),
                selected: JSON.stringify(data),
                plugin_id: this.pluginId,
            };
            this.send(event);
        };
        this.pluginId = 'atom_v0.0.2';
        this.DEBUG = false;
        this.UDP_HOST = '127.0.0.1';
        this.UDP_PORT = 49369;
        this.OUTGOING_SOCK = createSocket('udp4');
        this.layerReady = false;
        this.OUTGOING_SOCK.on('message', msg => {
            const parsedMessage = JSON.parse(msg);
            if (parsedMessage.type === 'ready' &&
                parsedMessage.source.name === 'Layer') {
                this.layerReady = true;
                if (this.cachedMessage) {
                    this.send(this.cachedMessage);
                }
                clearInterval(this.readyInterval);
            }
        });
    }
    checkLayerIsReady() {
        if (this.layerReady) {
            return;
        }
        this.sendReady();
        this.readyCheckTimer();
    }
    readyCheckTimer() {
        this.readyRetryTimer = 3 * (Math.pow(this.readyTries / 10, 2) + 1);
        this.readyInterval = setTimeout(() => {
            this.readyTries++;
            this.sendReady();
            this.readyCheckTimer();
        }, this.readyRetryTimer * 1000);
    }
    send(event, callback) {
        if (!this.layerReady && event.type !== 'ready') {
            this.checkLayerIsReady();
            this.cachedMessage = event;
            if (callback) {
                callback();
            }
            return;
        }
        let msg = JSON.stringify(event);
        this.OUTGOING_SOCK.send(msg, 0, msg.length, this.UDP_PORT, this.UDP_HOST, callback);
    }
    sendReady() {
        const event = {
            type: 'ready',
            source: { name: 'BetterGitBlame', version: '0.1.0' },
        };
        this.send(event);
    }
    buildSelectionEvent(editor) {
        const ranges = editor.selections.map(selection => {
            return selection.getBufferRange();
        });
        return this.buildEvent(editor, ranges, 'selection');
    }
    buildEvent(editor, ranges, action, shouldPerformSearch = false) {
        const selectedLineNumbers = StepsizeHelper.rangesToSelectedLineNumbers(ranges);
        return {
            source: 'atom',
            action: action,
            filename: editor.getPath() || null,
            plugin_id: this.pluginId,
            selectedLineNumbers,
            shouldPerformSearch: shouldPerformSearch,
        };
    }
}
export default StepsizeOutgoing;
