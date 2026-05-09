'use client';

import { io, Socket } from 'socket.io-client';
import { useEffect, useRef, useState } from 'react';

const SOCKET_URL = typeof window !== 'undefined'
  ? `http://${window.location.hostname}:3001/chat`
  : 'http://localhost:3001/chat';

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  return socket;
}

export function connectSocket(token: string): Socket {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('Chat socket connected');
  });

  socket.on('disconnect', () => {
    console.log('Chat socket disconnected');
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function useSocket() {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const s = connectSocket(token);
    socketRef.current = s;

    s.on('connect', () => setConnected(true));
    s.on('disconnect', () => setConnected(false));

    if (s.connected) setConnected(true);

    return () => {
      s.off('connect');
      s.off('disconnect');
    };
  }, []);

  return { socket: socketRef.current, connected };
}
