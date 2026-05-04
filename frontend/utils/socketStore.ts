import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

/**
 * Représente les données et les méthodes que propose le store  
 */
type SocketState = {
    socket: Socket | null;
    isConnected: boolean;

    connect: (token: string) => void;
    disconnect: () => void;

    emit : (event: string, payload?:any) => void;

    on: (event: string, callback: (...args: any[]) => void) => void;
    off: (event: string, callback?: (...args: any[]) => void) => void;
}

/**
 * URL pour les sockets 
 */
const SOCKET_URL = "https://unisson.qbert.fr/";

/**
 * Store de gestion des sockets 
 * 
 * Propose les méthodes de bases necessaires à l'implémentation de sockets. 
 */
export const useSocketStore = create<SocketState>((set, get) => ({
    socket : null,
    isConnected : false,

    /**
     * Gère la connexion des sockets au backend 
     * 
     * @param token : appToken pour le backend 
     */
    connect : (token : string) => {
        const existing = get().socket;

        if (existing?.connected) return;

        const socket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket'],
        });

        socket.on('connect', () => {
            set({ isConnected: true });
        });
        socket.on('disconnect', (reason) => {
            set({ isConnected: false });
            if (reason !== 'io server disconnect') {
                socket.connect();
            }
        });
        socket.on('connect_error', (err) => {
            console.error("Socket error:", err.message);
        });

        set({ socket });
    },

    /**
     * Permet la déconnexion des sockets  
     */
    disconnect: () => {
        const socket = get().socket;
        socket?.disconnect();

        set({
            socket: null,
            isConnected: false,
        });
    },

    /**
     * Emission d'un message à destination du backen 
     * 
     * @param event : string d'evenement 
     * @param payload : données à transmettre, type dépend du contexte
     */
    emit: (event, payload) => {
        get().socket?.emit(event, payload);
    },

    /**
     * 
     */
    on: (event, callback) => {
        get().socket?.on(event, callback);
    },

    off: (event, callback) => {
        get().socket?.off(event, callback);
    },

}))