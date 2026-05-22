import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { logger } from '../shared/utils/logger';

export class SocketService {
    private static io: Server;

    public static init(httpServer: HttpServer) {
        this.io = new Server(httpServer, {
            cors: {
                origin: "*", // Allow all for dev
                methods: ["GET", "POST"]
            }
        });

        this.io.on('connection', (socket: Socket) => {
            logger.info(`Socket Connected: ${socket.id}`);

            socket.on('join_session', (sessionId: string) => {
                socket.join(sessionId);
                logger.info(`Socket ${socket.id} joined session ${sessionId}`);
            });

            socket.on('disconnect', () => {
                logger.info(`Socket Disconnected: ${socket.id}`);
            });
        });
    }

    public static emit(event: string, data: any) {
        if (!this.io) return;
        this.io.emit(event, data);
    }

    public static emitToSession(sessionId: string, event: string, data: any) {
        if (!this.io) return;
        this.io.to(sessionId).emit(event, data);
    }
}
