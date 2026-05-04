import { Server } from "socket.io";
import http from 'http';

let io: Server;

export function initSocket(server: http.Server) {
    io = new Server(server, {
        cors: { origin: "*" }
    });
    return io;
}

export function getIO(): Server {
    if (!io) return null;
    return io;
}