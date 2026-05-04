import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { useGroupStore } from './groupStore';
import { useAuthStore } from './authStore';

/**
 * Représente les données et les méthodes que proposent le store  
 */
type SocketState = {
    socket: Socket | null;
    isConnected: boolean;
    queue: QueuedEvent[];

    connect: (token: string) => void;
    disconnect: () => void;

    emit : (event: string, payload?:any) => void;

    on: (event: string, callback: (...args: any[]) => void) => void;
    off: (event: string, callback?: (...args: any[]) => void) => void;
}

/**
 * Représente un évènement mis en cache lorsqu'on est offline
 */
type QueuedEvent = {
    event: string;
    payload?: any;
};

/**
 * URL pour les sockets 
 */
const SOCKET_URL = "https://unisson.qbert.fr";

/**
 * Store de gestion des sockets 
 * 
 * Propose les méthodes de bases necessaires à l'implémentation de sockets. 
 */
export const useSocketStore = create<SocketState>((set, get) => ({
    socket : null,
    isConnected : false,
    queue: [] as QueuedEvent[],

    /**
     * Gère la connexion des sockets au backend 
     * 
     * @param token : appToken pour le backend 
     */
    connect : (token : string) => {
        const existing = get().socket;

        if (existing?.connected) return;

        if (existing) {
            existing.removeAllListeners();
            existing.disconnect();
        }

        const socket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 700,
        });

        socket.on('connect', () => {
            set({ isConnected: true });
            const queue = get().queue;
            queue.forEach(({event, payload}) => {
                socket.emit(event, payload);
            });
            const userId = useAuthStore.getState().userInfo?.id;
            if (userId) {
                socket.emit("join:user", {userId});
            }
            const groupId = useGroupStore.getState().eventsGroupId;
            if (groupId) {
                socket.emit("join:group", {groupId});
            }
        });
        socket.on('disconnect', (reason) => {
            set({ isConnected: false });
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

        socket?.removeAllListeners();
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
        const socket = get().socket;

        if (socket?.connected) {
            socket.emit(event, payload);
        } else {
            set((state) => ({
                queue: [...state.queue, { event, payload }]
            }));
        }
    },

    /**
     * Permet d'attendre un évenement envoyé par le backend pour y réagir 
     * 
     * @param event : string d'evenement 
     * @param callback : handler attendu pour réagir à l'event
     */
    on: (event, callback) => {
        get().socket?.on(event, callback);
    },

    /**
     * Permet de se désabonner d'un évent
     * 
     * @param event : string d'evenement
     * @param callback : handler
     */
    off: (event, callback) => {
        if (callback)
            get().socket?.off(event, callback);
        else
            get().socket?.off(event);
    },

}))