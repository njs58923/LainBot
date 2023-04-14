import WebSocket from 'ws';

interface EventHandlers {
  [event: string]: (payload: any) => void;
}

class EventClient {
  private host: string;
  private port: number;
  private eventHandlers: EventHandlers;
  private support_list

  constructor(host = 'localhost', port = 9001) {
    this.host = host;
    this.port = port;
    this.eventHandlers = {};
    this.support_list = ["audio_text"]
  }

  on(event: string, handler: (payload: any) => void) {
    this.eventHandlers[event] = handler;
    this.support_list.push(event)
  }

  emit(event: string, payload: any) {
    const eventData = { event, payload };
    this.websocket.send(JSON.stringify(eventData));
  }

  websocket: WebSocket

  async start(onListen=()=>{}): Promise<void> {
    //@ts-ignore
    return new Promise((resolve, reject) => {
      try {
        this.websocket = new WebSocket(`ws://${this.host}:${this.port}`,);
  
        this.websocket.on('open', () => {
          onListen();
          this.websocket.on('message', (data: WebSocket.Data) => {
            const eventData = JSON.parse(data.toString());
            const { event, payload } = eventData;
  
            if (this.eventHandlers[event]) {
              this.eventHandlers[event](payload);
            } else {
              console.log(`Evento desconocido: ${event}`);
            }
          });
  
          this.websocket.on('close', () => {
            console.log('Conexión cerrada correctamente.');
            resolve();
          });
  
          this.websocket.on('error', (error: Error) => {
            console.log('Error en la conexión WebSocket:', error);
            resolve();
          });
          
          this.emit('support', {'list': this.support_list})
        });
      } catch (error) {
        console.log(error)
        resolve();
      }
    });
  }
}

export = EventClient;
