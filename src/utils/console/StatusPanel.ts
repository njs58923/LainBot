import { BoxElement } from ".";
import blessed from 'blessed';

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



}