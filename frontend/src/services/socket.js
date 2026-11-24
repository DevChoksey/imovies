import { io } from 'socket.io-client';
import { isEndpointReachable } from './api';

const rawSocketUrl = import.meta.env.VITE_SOCKET_URL;
const CAN_CONNECT_SOCKET = isEndpointReachable(rawSocketUrl);
const SOCKET_URL = rawSocketUrl || 'http://localhost:5000';

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: CAN_CONNECT_SOCKET,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export const connectSocket = () => {
  if (CAN_CONNECT_SOCKET && !socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};
