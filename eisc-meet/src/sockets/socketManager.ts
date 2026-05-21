import { io } from "socket.io-client";
import { auth } from "../services/firebase/firebase.config";

const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";

export const socket = io(socketUrl, {
    autoConnect: false,
});

export const connectSocket = async () => {
    const token = await auth.currentUser?.getIdToken();

    if (!token) {
        return false;
    }

    socket.auth = { token };

    if (!socket.connected) {
        socket.connect();
    }

    return true;
};

export const disconnectSocket = () => {
    socket.disconnect();
}
