import { io, Socket } from 'socket.io-client';
import { store } from '@store/index';
import NetInfo from '@react-native-community/netinfo';

// Base URL from axios instance (remove /api for socket)
const BASE_URL = 'http://52.22.241.165:10054';
const SOCKET_URL = BASE_URL.replace('/api', '');

interface ConnectionCallbacks {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onReconnect?: (attemptNumber: number) => void;
  onError?: (error: Error) => void;
}

class SocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private isConnecting: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private connectionCallbacks: ConnectionCallbacks = {};
  private activeRooms: Set<string> = new Set();
  private eventListeners: Map<string, Set<Function>> = new Map();
  private networkUnsubscribe: (() => void) | null = null;

  constructor() {
    this.setupNetworkListener();
  }

  /**
   * Setup network listener to handle network state changes
   */
  private setupNetworkListener() {
    this.networkUnsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected && !this.isConnected && !this.isConnecting) {
        console.log('[SocketService] Network reconnected, attempting to reconnect socket...');
        this.connect();
      } else if (!state.isConnected && this.isConnected) {
        console.log('[SocketService] Network disconnected');
        this.isConnected = false;
      }
    });
  }

  /**
   * Get current connection status
   */
  public getConnectionStatus(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  /**
   * Get socket instance (null if not connected)
   */
  public getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * Connect to socket server
   */
  public connect(): void {
    // Prevent multiple simultaneous connection attempts
    if (this.isConnecting || (this.socket?.connected && this.isConnected)) {
      console.log('[SocketService] Already connected or connecting');
      return;
    }

    const authState = store.getState().auth;
    const { token, userId } = authState;

    if (!token || !userId) {
      console.error('[SocketService] Cannot connect: Missing token or userId');
      return;
    }

    this.isConnecting = true;

    try {
      // Map role to userType for backend
      // const userTypeMap: Record<string, string> = {
      //   'service-provider': 'serviceProvider',
      //   'customer': 'customer',
      // };
      // const mappedUserType = userType || userTypeMap[userType || ''] || 'customer';

      console.log('[SocketService] Connecting to:', SOCKET_URL);

      this.socket = io(SOCKET_URL, {
        auth: {
          token: token,
          userId: userId,
          userType: 'serviceProvider',
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: this.maxReconnectAttempts,
        transports: ['websocket', 'polling'],
        timeout: 20000,
      });

      this.setupEventListeners();
    } catch (error) {
      console.error('[SocketService] Error creating socket connection:', error);
      this.isConnecting = false;
      this.connectionCallbacks.onError?.(error as Error);
    }
  }

  /**
   * Setup socket event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('[SocketService] Socket connected:', this.socket?.id);
      this.isConnected = true;
      this.isConnecting = false;
      this.reconnectAttempts = 0;

      // Rejoin all active rooms after reconnection
      this.activeRooms.forEach(roomId => {
        const [conversationId, bookingId] = roomId.split(':');
        if (conversationId && bookingId) {
          this.joinConversation(conversationId, bookingId);
        }
      });

      this.connectionCallbacks.onConnect?.();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[SocketService] Socket disconnected:', reason);
      this.isConnected = false;
      this.isConnecting = false;
      this.connectionCallbacks.onDisconnect?.();
    });

    this.socket.on('connect_error', (error) => {
      console.error('[SocketService] Socket connection error:', error.message);
      this.isConnected = false;
      this.isConnecting = false;
      this.connectionCallbacks.onError?.(error);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('[SocketService] Socket reconnected after', attemptNumber, 'attempts');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.connectionCallbacks.onReconnect?.(attemptNumber);
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('[SocketService] Reconnection attempt:', attemptNumber);
      this.reconnectAttempts = attemptNumber;
    });

    this.socket.on('reconnect_failed', () => {
      console.error('[SocketService] Reconnection failed after', this.maxReconnectAttempts, 'attempts');
      this.isConnecting = false;
    });

    // Listen for connection confirmation
    this.socket.on('connected', (data) => {
      console.log('[SocketService] Socket connection confirmed:', data);
    });

    // Listen for chat join confirmation
    this.socket.on('chat:joined', (data) => {
      console.log('[SocketService] Joined conversation room:', data);
    });

    // Listen for chat leave confirmation
    this.socket.on('chat:left', (data) => {
      console.log('[SocketService] Left conversation room:', data);
    });
  }

  /**
   * Join a conversation room
   */
  public joinConversation(conversationId: string, bookingId: string): void {
    if (!conversationId || !bookingId) {
      console.error('[SocketService] Cannot join conversation: conversationId and bookingId are required');
      return;
    }

    const roomId = `${conversationId}:${bookingId}`;

    if (this.activeRooms.has(roomId)) {
      console.log('[SocketService] Already in room:', roomId);
      return;
    }

    if (this.socket && this.socket.connected) {
      this.socket.emit('chat:join-conversation', { conversationId, bookingId });
      this.activeRooms.add(roomId);
      console.log('[SocketService] Joining conversation room:', conversationId, 'for booking:', bookingId);
    } else {
      // Wait for connection then join
      if (this.socket) {
        const joinHandler = () => {
          if (this.socket?.connected) {
            this.socket.emit('chat:join-conversation', { conversationId, bookingId });
            this.activeRooms.add(roomId);
            console.log('[SocketService] Joined conversation room after reconnect:', conversationId);
            this.socket.off('connect', joinHandler);
          }
        };
        this.socket.once('connect', joinHandler);
      } else {
        console.warn('[SocketService] Socket not initialized. Connecting first...');
        this.connect();
        // Retry after connection
        setTimeout(() => {
          if (this.socket?.connected) {
            this.joinConversation(conversationId, bookingId);
          }
        }, 1000);
      }
    }
  }

  /**
   * Leave a conversation room
   */
  public leaveConversation(conversationId: string, bookingId: string): void {
    if (!conversationId || !bookingId) {
      console.error('[SocketService] Cannot leave conversation: conversationId and bookingId are required');
      return;
    }

    const roomId = `${conversationId}:${bookingId}`;

    if (this.socket && this.socket.connected) {
      this.socket.emit('chat:leave-conversation', { conversationId, bookingId });
      this.activeRooms.delete(roomId);
      console.log('[SocketService] Left conversation room:', conversationId);
    }
  }

  /**
   * Subscribe to an event with automatic cleanup tracking
   */
  public on(event: string, callback: Function): void {
    if (!this.socket) {
      console.warn('[SocketService] Socket not initialized. Call connect() first.');
      return;
    }

    // Track listener for cleanup
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)?.add(callback);

    this.socket.on(event, callback as any);
  }

  /**
   * Unsubscribe from an event
   */
  public off(event: string, callback?: Function): void {
    if (!this.socket) return;

    if (callback) {
      this.socket.off(event, callback as any);
      this.eventListeners.get(event)?.delete(callback);
    } else {
      // Remove all listeners for this event
      this.socket.removeAllListeners(event);
      this.eventListeners.delete(event);
    }
  }

  /**
   * Emit an event
   */
  public emit(event: string, data?: any): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('[SocketService] Cannot emit: Socket not connected');
    }
  }

  /**
   * Set connection callbacks
   */
  public setConnectionCallbacks(callbacks: ConnectionCallbacks): void {
    this.connectionCallbacks = { ...this.connectionCallbacks, ...callbacks };
  }

  /**
   * Clear connection callbacks
   */
  public clearConnectionCallbacks(): void {
    this.connectionCallbacks = {};
  }

  /**
   * Disconnect socket and cleanup
   */
  public disconnect(): void {
    // Leave all active rooms
    this.activeRooms.forEach(roomId => {
      const [conversationId, bookingId] = roomId.split(':');
      if (conversationId && bookingId) {
        this.leaveConversation(conversationId, bookingId);
      }
    });

    // Remove all event listeners
    this.eventListeners.forEach((callbacks, event) => {
      callbacks.forEach(callback => {
        this.socket?.off(event, callback as any);
      });
    });
    this.eventListeners.clear();

    // Disconnect socket
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }

    // Cleanup network listener
    if (this.networkUnsubscribe) {
      this.networkUnsubscribe();
      this.networkUnsubscribe = null;
    }

    // Reset state
    this.isConnected = false;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.activeRooms.clear();
    this.connectionCallbacks = {};

    console.log('[SocketService] Socket disconnected and cleaned up');
  }

  /**
   * Cleanup all listeners for a specific screen/component
   * Useful when leaving a screen
   */
  public cleanupListeners(events: string[]): void {
    events.forEach(event => {
      this.off(event);
    });
  }
}

// Export singleton instance
export default new SocketService();
