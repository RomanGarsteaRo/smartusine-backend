import { Injectable, OnModuleInit } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import type { Server, WebSocket } from 'ws';
import * as url from 'node:url';


type Channel =
    | '/scheduling/statusTask'
    | '/scheduling/statusBlue'
    | '/scheduling/newTasks'
    | '/scheduling/countTasks';

@WebSocketGateway()
@Injectable()
export class SchedulingGateway implements OnModuleInit {
    @WebSocketServer() server!: Server;

    private channels = new Map<Channel, Set<WebSocket>>([
        ['/scheduling/statusTask', new Set()],
        ['/scheduling/statusBlue', new Set()],
        ['/scheduling/newTasks', new Set()],
        ['/scheduling/countTasks', new Set()],
    ]);

    onModuleInit() {
        this.server.on('connection', (socket: WebSocket, req) => {
            const path = (url.parse(req.url || '').pathname || '') as Channel;

            // accept doar canalele cunoscute
            if (!this.channels.has(path)) {
                socket.close(1008, 'Unknown channel');
                return;
            }

            // înscrie clientul în canal
            this.channels.get(path)!.add(socket);

            // heartbeat (evită zombie sockets)
            (socket as any).isAlive = true;
            socket.on('pong', () => ((socket as any).isAlive = true));

            socket.on('close', () => this.channels.get(path)!.delete(socket));
            socket.on('error', () => this.channels.get(path)!.delete(socket));
        });

        // ping periodic
        const interval = setInterval(() => {
            this.server.clients.forEach((ws: any) => {
                if (!ws.isAlive) return ws.terminate();
                ws.isAlive = false;
                ws.ping();
            });
        }, 30000);
        // @ts-ignore – optional: curățare la shutdown
        this.server.on('close', () => clearInterval(interval));
    }

    private broadcast<T>(channel: Channel, payload: T) {
        const data = JSON.stringify(payload ?? {});
        for (const ws of this.channels.get(channel) || []) {
            if (ws.readyState === ws.OPEN) ws.send(data);
        }
    }

    // expune metode simple pe care le poate apela orice serviciu
    emitStatusChanged(task: any) {
        this.broadcast('/scheduling/statusTask', task);
    }
    emitStatusBlueChanged() {
        this.broadcast('/scheduling/statusBlue', { ok: true, ts: Date.now() });
    }
    emitNewTasks() {
        this.broadcast('/scheduling/newTasks', { ok: true, ts: Date.now() });
    }
    emitCountTasksChanged(task: any) {
        this.broadcast('/scheduling/countTasks', task);
    }
}