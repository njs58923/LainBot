import { Message } from "../resources/context";
// import readline from 'readline';

export class Console {
    lastRender = null;
    constructor() {
        process.stdout.on('resize', () => {
            console.log('Tamaño de la consola actualizado:', this.getConsoleSize());
        });
    }

    getConsoleSize() {
        const columns = process.stdout.columns;
        const rows = process.stdout.rows;
        return { columns, rows };
    }

    render(message: Message[]) {
        // // process.stdout.write('\u001B[2J\u001B[0;0f');
        // if (this.lastRender) {
        //     const lineCount = this.lastRender.split(/\r\n|\r|\n/).length;
        //     // Borrar y mover el cursor a cada línea
        //     for (let i = 0; i < lineCount; i++) {
        //         readline.clearLine(process.stdout, 0);
        //         if (i < lineCount - 1) {
        //             readline.moveCursor(process.stdout, 0, -1);
        //         }
        //     }
        //     readline.cursorTo(process.stdout, 0, null);
        // }

        // let render = "";

        // render += "# Mensajes"
        // render += "\n\n"
        // message.forEach((m, i) => {
        //     if ((i + 1) % 2) render += "\n"
        //     if (i != 0) render += "\n"
        //     render += `${m.role}: ${m.content}`
        // })
        // this.lastRender = render;
        // process.stdout.write(render);
    }
}

export const con = new Console()