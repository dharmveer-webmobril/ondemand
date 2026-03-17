import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    useCallback,
    ReactNode,
  } from 'react';
  import { io, Socket } from 'socket.io-client';
  import NetInfo from '@react-native-community/netinfo';
  import { useSelector } from 'react-redux';
  import { RootState } from '@store/index';
  
  const SOCKET_URL = 'https://indoredev.webmobrildemo.com:10054';
  
  interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    joinConversation: (conversationId: string, bookingId: string) => void;
    leaveConversation: (conversationId: string, bookingId: string) => void;
    emit: (event: string, data?: any) => void;
    on: (event: string, callback: (...args: any[]) => void) => void;
    off: (event: string, callback?: (...args: any[]) => void) => void;
    disconnect: () => void;
  }
  
  const SocketContext = createContext<SocketContextType | undefined>(
    undefined
  );
  
  interface Props {
    children: ReactNode;
  }
  
  export const SocketProvider = ({ children }: Props) => {
    const { token, userId } = useSelector(
      (state: RootState) => state.auth
    );
  
  const socketRef = useRef<Socket | null>(null);
    const activeRooms = useRef<Set<string>>(new Set());
    const eventMap = useRef<Map<string, Set<Function>>>(new Map());
    const isConnectingRef = useRef(false);

    const [isConnected, setIsConnected] = useState(false);

    // ==============================
    // CONNECT FUNCTION
    // ==============================

    const connectSocket = useCallback(() => {
      if (!token || !userId) return;
      if (socketRef.current?.connected) return;
      if (isConnectingRef.current) return;

      // Clear existing socket before creating a new one (prevents multiple instances)
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }

      isConnectingRef.current = true;

      const socket = io(SOCKET_URL, {
        auth: {
          token,
          userId,
          userType: 'customer',
        },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        timeout: 20000,
      });
  
      socketRef.current = socket;
  
      socket.on('connect', () => {
        isConnectingRef.current = false;
        console.log('[Socket] Connected:', socket.id);
        setIsConnected(true);

        // Rejoin rooms after reconnect
        activeRooms.current.forEach((room) => {
          const [conversationId, bookingId] = room.split(':');
          socket.emit('chat:join-conversation', {
            conversationId,
            bookingId,
          });
        });
      });

      socket.on('disconnect', (reason) => {
        console.log('[Socket] Disconnected:', reason);
        setIsConnected(false);
      });

      socket.on('connect_error', (err) => {
        isConnectingRef.current = false;
        console.log('[Socket] Error:', err.message);
        setIsConnected(false);
      });
    }, [token, userId]);
  
    // ==============================
    // AUTO CONNECT / DISCONNECT
    // ==============================
  
    useEffect(() => {
      if (token && userId) {
        connectSocket();
      } else {
        socketRef.current?.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
    }, [token, userId, connectSocket]);
  
    // ==============================
    // NETWORK LISTENER
    // ==============================

    useEffect(() => {
      const unsubscribe = NetInfo.addEventListener((state) => {
        if (!state.isConnected) return;
        // Only reconnect if we had a socket that is now disconnected (avoid duplicate connections)
        if (socketRef.current && !socketRef.current.connected && !isConnectingRef.current) {
          console.log('[Socket] Network reconnected → reconnecting');
          socketRef.current.connect();
        }
      });

      return unsubscribe;
    }, []);
  
    // ==============================
    // ROOM FUNCTIONS
    // ==============================
  
    const joinConversation = useCallback(
      (conversationId: string, bookingId: string) => {
        if (!socketRef.current) return;
  
        const room = `${conversationId}:${bookingId}`;
  
        if (activeRooms.current.has(room)) return;
  
        socketRef.current.emit('chat:join-conversation', {
          conversationId,
          bookingId,
        });
  
        activeRooms.current.add(room);
        console.log('---------joined conversation--------', room);
      },
      []
    );
  
    const leaveConversation = useCallback(
      (conversationId: string, bookingId: string) => {
        if (!socketRef.current) return;
  
        const room = `${conversationId}:${bookingId}`;
  
        socketRef.current.emit('chat:leave-conversation', {
          conversationId,
          bookingId,
        });
  
        activeRooms.current.delete(room);
      },
      []
    );
  
    // ==============================
    // SAFE EMIT
    // ==============================
  
    const emit = useCallback((event: string, data?: any) => {
      if (!socketRef.current?.connected) {
        console.log('[Socket] Cannot emit, not connected');
        return;
      }
  
      socketRef.current.emit(event, data);
    }, []);
  
    // ==============================
    // SAFE LISTENER
    // ==============================
  
    const on = useCallback(
      (event: string, callback: (...args: any[]) => void) => {
        if (!socketRef.current) return;
  
        if (!eventMap.current.has(event)) {
          eventMap.current.set(event, new Set());
        }
  
        eventMap.current.get(event)?.add(callback);
        socketRef.current.on(event, callback);
      },
      []
    );
  
    const off = useCallback(
      (event: string, callback?: (...args: any[]) => void) => {
        if (!socketRef.current) return;
  
        if (callback) {
          socketRef.current.off(event, callback);
          eventMap.current.get(event)?.delete(callback);
        } else {
          socketRef.current.removeAllListeners(event);
          eventMap.current.delete(event);
        }
      },
      []
    );
  
    // ==============================
    // DISCONNECT
    // ==============================
  
    const disconnect = useCallback(() => {
      activeRooms.current.clear();
      eventMap.current.clear();
      socketRef.current?.removeAllListeners();
      socketRef.current?.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }, []);
  
    return (
      <SocketContext.Provider
        value={{
          socket: socketRef.current,
          isConnected,
          joinConversation,
          leaveConversation,
          emit,
          on,
          off,
          disconnect,
        }}
      >
        {children}
      </SocketContext.Provider>
    );
  };
  
  export const useSocket = () => {
    const context = useContext(SocketContext);
  
    if (!context) {
      throw new Error('useSocket must be used inside SocketProvider');
    }
  
    return context;
  };
  