
import blessed from 'blessed';
import { BoxElement } from '.';

export class LogsPanel extends BoxElement {
    constructor(options?: blessed.Widgets.BoxOptions) {
        super({
            content: '',
            tags: true,
            label: " Logs ",
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
            scrollbar: {
                ch: ' ',
                inverse: true,
            } as any,
            scrollable: true,
            alwaysScroll: true,
            keys: true,
            vi: true,
            mouse: true,
            ...options
        })

        // this.on('focus', function (data) {
        //     this.setContent('AAAAAAA');
        //     this.render();
        // });

        // this.key('enter', (ch, key) => {
        //     this.setContent('{right}Even different {black-fg}content{/black-fg}.{/right}\n');
        //     this.setLine(1, 'bar');
        //     this.insertLine(1, 'foo');
        //     this.screen.render();
        // });
    }

    logs: { value: string, createAt: number }[] = []

    print(...args: any[]) {
        const value = args.map(i => {
            if (typeof i == "string") return i;
            if (typeof i == "number") return i;
            if (typeof i == "boolean") return i;
            if (typeof i == "object") return JSON.stringify(i);
            return `Tipo no valido (${typeof i})`
        }).join(" ")

        this.logs.push({ value, createAt: Date.now() })
        this.setContent(this.logs.map(i => `${new Date(i.createAt).toLocaleString()}: ${i.value}`).join("\n"))
        this.setScrollPerc(100);
        this.screen.render()
    }
}