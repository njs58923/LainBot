import blessed from 'blessed';
import { BoxElement } from ".";
import { Message } from '../../resources/context';

export class MensajesPanel extends BoxElement {
    constructor(options?: blessed.Widgets.BoxOptions) {
        super({
            content: '',
            tags: true,
            label: " Mensajes ",
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

        // this.key('enter', function (ch, key) {
        //     this.setContent('{right}Even different {black-fg}content{/black-fg}.{/right}\n');
        //     this.setLine(1, 'bar');
        //     this.insertLine(1, 'foo');
        //     this.render();
        // });
    }

    setMessages(message: Message[]) {
        let render = "";
        message.forEach((m, i) => {
            if (i != 0) {
                render += "\n"
                if ((i + 1) % 2) render += "\n"
            }
            render += `${m.role.trim()}: ${m.content.trim()}`
        })
        this.setContent(render)
        this.setScrollPerc(100);
        this.render()
        this.screen.render()
    }
}