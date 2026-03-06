import { io } from 'socket.io-client';
import { API_BASE_URL } from '../api/apiClient';

const SOCKET_URL = API_BASE_URL.replace('/api/v1', '');

const socket = io(SOCKET_URL, {
  withCredentials: true,
  transports: ['websocket', 'polling'],
  autoConnect: false,
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
  if (
    error.message === 'xhr poll error' ||
    error.message.includes('401') ||
    error.message.includes('403')
  ) {
    console.warn(
      'Socket authentication failed. Make sure you are logged in and session cookies are valid.',
    );
  }
});

export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export default socket;
