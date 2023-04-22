import { v4 as uuidv4 } from 'uuid';
import WebSocket from 'ws';
import { promisify } from 'util';
import { EventEmitter } from 'events';
import { app } from '../../..';

export class EventClient {
  host: string;
  port: number;
  eventHandlers: Record<string, (payload: any) => Promise<any>>;
  supportList: string[];
  callbacks: Record<string, (value: any) => void>;
  websocket: WebSocket

  constructor(host = 'localhost', port = 9001) {
    this.host = host;
    this.port = port;
    this.eventHandlers = {};
    this.supportList = ["audio_text"];
    this.callbacks = {};
  }

  on(event: string, handler: (payload: any) => any) {
    this.eventHandlers[event] = handler;
    this.supportList.push(event);
  }

  async start(onListen: () => void = () => { }) {
    app.logs.print('Socket: Conectando...')

    while (true) {
      try {
        await this.connect(onListen);
        app.logs.print('Socket: Desconectado!')
      } catch (error) {
        console.error('Socket: Evento critico, ', error);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  async updateSupportList() {
    while (true) {
      try {
        const result = await this.emit('support', { list: this.supportList });
        if (result) {
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 250));
      } catch (error) {
        console.error('Evento critico: ', error);
      }
    }
  }

  async connect(onListen: () => void) {
    const uri = `ws://${this.host}:${this.port}`;
    this.websocket = new WebSocket(uri, {
      maxPayload: 64 * 1024 * 1024, // 100 MB
    });

    return new Promise((connect_close, connect_error) => {
      this.websocket.on('open', async () => {

        this.websocket.on('message', async (data: WebSocket.Data) => {
          const event_data = JSON.parse(data.toString());
          const { event, payload, callback } = event_data;

          // app.logs.print("🔹⬇️ event:", event)
          // app.logs.print("🔹⬇️ callback:", callback)
          // app.logs.print("🔹⬇️ payload:", payload)

          try {
            if (this.callbacks[event]) {
              this.callbacks[event](payload);
              delete this.callbacks[event];
            } else if (this.eventHandlers[event]) {
              const result = await this.eventHandlers[event](payload);
              if (callback) await this.emit(callback, result);
            } else {
              app.logs.print(`Evento desconocido: ${event}`);
            }
          } catch (error) {
            console.error('Evento critico: ', error);
          }
        });

        this.websocket.on('close', () => {
          app.logs.print('Conexión cerrada correctamente.');
          connect_close('Conexión cerrada correctamente.');
        });

        this.websocket.on('error', (error: Error) => {
          app.logs.print('Error en la conexión WebSocket:', error);
          connect_error(error);
        });

        app.logs.print('Socket: Conectado!')
        await this.updateSupportList();

        onListen()
      })
    })

  }

  async emit(event: string, payload: any, wait: boolean = true): Promise<any> {
    const result = /^(\w*:[\w\d\-]*)(?:\:(\d*))?$/.exec(event)
    const callback = result ? `${result[1]}:${parseInt(result[2] || "0") + 1}` : `${event}:${uuidv4()}`;
    const event_data = { event, payload, callback };
    this.callbacks[callback] = promisify(EventEmitter.prototype.once).bind(this);
    this.websocket.send(JSON.stringify(event_data));
    if (!wait) return undefined;
    return await new Promise((resolve) => {
      this.callbacks[callback] = resolve;
    });
  }
}