export interface BroadcastMessage {
    type: string;
    payload: unknown;
}

type MessageHandler<T = unknown> = (payload: T) => void;

export class BroadcastApi {
    private socket: WebSocket | null = null;
    private messageHandlers: Map<string, Set<MessageHandler<unknown>>> = new Map();
    private url = 'ws://localhost:5000/ws';
    
    connect(): Promise<void> {
        console.log("connecting to WebSocket server...");
        return new Promise((resolve, reject) => {
            if (this.isConnected()) {
                resolve();
                return;
            }

            this.socket = new WebSocket(this.url);
            
            this.socket.onopen = () => {
                console.log('WebSocket connection established');
                resolve();
            };
            
            this.socket.onerror = (error) => {
                console.error('WebSocket error:', error);
                reject(error);
            };
            
            this.socket.onclose = () => {
                console.log('WebSocket connection closed');
                this.socket = null;
            };
            
            this.socket.onmessage = (event) => {
                try {
                    const message: BroadcastMessage = JSON.parse(event.data);
                    this.handleMessage(message);
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };
        });
    }

    constructor() {
        this.connect()
    }

    private handleMessage(message: BroadcastMessage): void {
        const { type, payload } = message;
        const handlers = this.messageHandlers.get(type);
        
        if (handlers) {
            handlers.forEach(handler => {
                try {
                    handler(payload);
                } catch (error) {
                    console.error(`Error in handler for message type "${type}":`, error);
                }
            });
        }
    }

    on<T = unknown>(type: string, handler: MessageHandler<T>): void {
        if (!this.messageHandlers.has(type)) {
            this.messageHandlers.set(type, new Set());
        }
        
        this.messageHandlers.get(type)!.add(handler as MessageHandler<unknown>);
    }

    off<T = unknown>(type: string, handler: MessageHandler<T>): void {
        const handlers = this.messageHandlers.get(type);
        if (handlers) {
            handlers.delete(handler as MessageHandler<unknown>);
        }
    }

    disconnect(): void {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.close();
        }
        this.socket = null;
    }

    isConnected(): boolean {
        return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
    }
}

// Export default instance
export default new BroadcastApi();