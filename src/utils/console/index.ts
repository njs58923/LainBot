import blessed from 'blessed';

// @ts-ignore
export const BoxElement = blessed.widget.box as any as typeof blessed.Widgets.BoxElement

import { MensajesPanel } from './MensajesPanel';
import { StatusPanel } from './StatusPanel';
import { LogsPanel } from './LogsPanel';





export class ConsolaManager {
    screen: blessed.Widgets.Screen

    messages: MensajesPanel
    status: StatusPanel
    logs: LogsPanel

    constructor() {

        this.screen = blessed.screen({
            smartCSR: true
        });

        this.screen.title = 'LainBot v0.1';

        this.messages = new MensajesPanel({
            top: '0%',
            left: '0%',
            width: '60%',
            height: '90%',
        })
        this.screen.append(this.messages)

        this.status = new StatusPanel({
            top: '0%',
            left: '60%',
            width: '40%',
            height: '30%',
        })
        this.screen.append(this.status)

        this.logs = new LogsPanel({
            top: '30%',
            left: '60%',
            width: '40%',
            height: '60%',
        })
        this.screen.append(this.logs)

        this.messages.focus();

        // var icon = blessed.image({
        //     parent: box,
        //     top: 0,
        //     left: 0,
        //     type: 'overlay',
        //     width: 'shrink',
        //     height: 'shrink',
        //     file: __dirname + '/my-program-icon.png',
        //     search: false
        // });


        this.screen.key(['escape', 'q', 'C-c'], function (ch, key) {
            return process.exit(0);
        });

        // Render the screen.
        this.screen.render();
    }

}