import { BoxElement } from ".";
import blessed from 'blessed';
import os from 'os';
import { getNvidiaInfo } from "./utils/gpu";
var osu = require('node-os-utils')

export class StatusPanel extends BoxElement {
    constructor(options?: blessed.Widgets.BoxOptions) {
        super({
            content: '',
            tags: true,
            label: " Estatus ",
            border: {
                type: 'line'
            },
            style: {
                fg: 'white',
                bg: 'black',
                border: {
                    fg: '#f0f0f0'
                },
                hover: {
                    bg: 'green'
                },
                focus: {
                    border: {
                        fg: 'red',
                    },
                },
            },
            ...options
        })



        // this.on('focus', function (data) {
        //     this.setContent('AAAAAAA');
        //     this.render();
        // });

        this.key('enter', function (ch, key) {
            this.setContent('{right}Even different {black-fg}content{/black-fg}.{/right}\n');
            this.setLine(1, 'bar');
            this.insertLine(1, 'foo');
            this.render();
        });

        setInterval(() => this.update(), 1000);
        setInterval(() => this.NvidiaInfo(), 3000);
    }

    async NvidiaInfo() {
        const info = await getNvidiaInfo();
        const used = parseInt(info["memory.used"].trim()) / 1000;
        const total = parseInt(info["memory.total"].trim()) / 1000;
        this.obj = Object.assign(this.obj, {
            ["\n" + info.name.trim()]: "",
            " - Uso (%)": info["utilization.gpu"],
            " - Temperatura": info["temperature.gpu"] + "°",
            " - Memoria": `${used.toFixed(2)} GB / ${total.toFixed(2)} GB (${((used / total) * 100).toFixed(1)} %)`,
            " - Driver version": info.driver_version,
        })
        this.updateByObj()
    }

    obj: Record<string, any> = {};
    async update() {
        this.obj["CPU (%)"] = (await osu.cpu.usage()).toFixed(1)

        const mem = await osu.mem.info()
        this.obj["Memoria"] = `${(mem.usedMemMb / 1000).toFixed(1)} GB / ${(mem.totalMemMb / 1000).toFixed(1)} GB (${100 - mem.freeMemPercentage} %)`

        this.updateByObj()
    }

    updateByObj() {
        this.setContent(Object.entries(this.obj).map(([key, value]) => `${key}: ${value}`).join("\n"))
        // this.setScrollPerc(100);
        this.screen.render()
    }
}