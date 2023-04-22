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
                }
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
    }

    setMessages(message: Message[]) {
        let render = "";
        render += "# Mensajes"
        render += "\n\n"
        message.forEach((m, i) => {
            if ((i + 1) % 2) render += "\n"
            if (i != 0) render += "\n"
            render += `${m.role}: ${m.content}`
        })
        this.setContent(render)
        this.screen.render()
    }
}