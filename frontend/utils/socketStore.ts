import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

type SocketState = {
    socket: Socket;
    isConnected: boolean;

    connect : (token: string) => void;
    disconnect : () => void;
}

const SOCKET_URL = ""; //URGENT A REMPLACER PAR BACKEND

export const useSocketStore = create<SocketState>((set, get) => ({
    socket : null,
    isConnected : false,

    connect : (token : string) => {
        if (get().socket?.connected) return;

        const socket = io(SOCKET_URL, {
            auth : {token},
            transports : ['websocket']
        })

        socket.on('connect', () => set ({isConnected : true}));
        socket.on('disconnect',() => set({isConnected : false}));

        set ({socket});
    },
    disconnect: () => {
        get().socket?.disconnect();
        set({ socket: null, isConnected : false});
    },
}))