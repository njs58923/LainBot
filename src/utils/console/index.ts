import blessed from 'blessed';

// @ts-ignore
export const BoxElement = blessed.widget.box as any as typeof blessed.Widgets.BoxElement

import { MensajesPanel } from './MensajesPanel';
import { StatusPanel } from './StatusPanel';
import { LogsPanel } from './LogsPanel';
// import { GraphCPUPanel } from './GraphCPU';





export class ConsolaManager {
    screen: blessed.Widgets.Screen

    messages: MensajesPanel
    status: StatusPanel
    // cpu: GraphCPUPanel
    logs: LogsPanel

    constructor() {

        this.screen = blessed.screen({
            title: 'LainBot v0.1',
            smartCSR: true,
            mouse: true,
        });

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

        // this.cpu = new GraphCPUPanel({
        //     top: '0%',
        //     left: '80%',
        //     width: '20%',
        //     height: '35%',
        // })
        // this.screen.append(this.cpu)

        this.logs = new LogsPanel({
            top: '30%',
            left: '60%',
            width: '40%',
            height: '60%',
        })
        this.screen.append(this.logs)

        this.messages.focus();

        this.screen.key(['tab'], () => {
            let boxs = [this.messages, this.status, this.logs]
            let newIndex = boxs.findIndex(b => b === this.screen.focused) + 1
            if (newIndex >= boxs.length) newIndex = 0;
            boxs[newIndex].focus()
        });

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