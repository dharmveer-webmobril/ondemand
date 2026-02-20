# Socket Service

A singleton socket service for managing WebSocket connections with automatic reconnection and room management.

## Features

- ✅ Singleton pattern - single connection instance across the app
- ✅ Automatic reconnection on connection loss
- ✅ Network state monitoring
- ✅ Room/conversation management
- ✅ Event listener tracking and cleanup
- ✅ Connection status checking
- ✅ Proper cleanup on screen unmount

## Usage

### Basic Setup in a Screen Component

```typescript
import React, { useEffect, useRef } from 'react';
import { useRoute } from '@react-navigation/native';
import socketService from '@services/socket/socketService';

export default function ChatScreen() {
  const route = useRoute<any>();
  const conversationId = route.params?.conversationId;
  const bookingId = route.params?.bookingId;

  // Refs to track handlers for cleanup
  const newMessageHandlerRef = useRef<((data: any) => void) | null>(null);

  useEffect(() => {
    // Connect if not already connected
    if (!socketService.getConnectionStatus()) {
      socketService.connect();
    }

    // Set connection callbacks
    socketService.setConnectionCallbacks({
      onConnect: () => {
        console.log('Socket connected');
        // Join conversation room
        if (conversationId && bookingId) {
          socketService.joinConversation(conversationId, bookingId);
        }
      },
      onDisconnect: () => {
        console.log('Socket disconnected');
      },
      onReconnect: (attemptNumber) => {
        console.log('Reconnected after', attemptNumber, 'attempts');
        // Rejoin room after reconnection
        if (conversationId && bookingId) {
          socketService.joinConversation(conversationId, bookingId);
        }
      },
    });

    // Join conversation room if IDs are available
    if (conversationId && bookingId && socketService.getConnectionStatus()) {
      socketService.joinConversation(conversationId, bookingId);
    }

    // Listen for new messages
    newMessageHandlerRef.current = (data: any) => {
      console.log('New message:', data);
      // Handle new message
    };

    socketService.on('chat:new-message', newMessageHandlerRef.current);

    // Cleanup on unmount
    return () => {
      // Remove listeners
      if (newMessageHandlerRef.current) {
        socketService.off('chat:new-message', newMessageHandlerRef.current);
      }

      // Leave conversation room
      if (conversationId && bookingId) {
        socketService.leaveConversation(conversationId, bookingId);
      }

      // Clear connection callbacks
      socketService.clearConnectionCallbacks();
    };
  }, [conversationId, bookingId]);

  // Send a message
  const sendMessage = (text: string) => {
    if (socketService.getConnectionStatus() && conversationId && bookingId) {
      socketService.emit('chat:send-message', {
        conversationId,
        bookingId,
        text,
        timestamp: new Date().toISOString(),
      });
    }
  };

  return (
    // Your component JSX
  );
}
```

## API Reference

### Connection Methods

#### `connect()`
Connect to the socket server. Automatically uses auth token from Redux store.

```typescript
socketService.connect();
```

#### `disconnect()`
Disconnect socket and cleanup all listeners and rooms.

```typescript
socketService.disconnect();
```

#### `getConnectionStatus(): boolean`
Check if socket is currently connected.

```typescript
const isConnected = socketService.getConnectionStatus();
```

### Room Management

#### `joinConversation(conversationId: string, bookingId: string)`
Join a conversation room. Automatically rejoins on reconnection.

```typescript
socketService.joinConversation('conv-123', 'booking-456');
```

#### `leaveConversation(conversationId: string, bookingId: string)`
Leave a conversation room.

```typescript
socketService.leaveConversation('conv-123', 'booking-456');
```

### Event Handling

#### `on(event: string, callback: Function)`
Subscribe to a socket event.

```typescript
socketService.on('chat:new-message', (data) => {
  console.log('New message:', data);
});
```

#### `off(event: string, callback?: Function)`
Unsubscribe from a socket event. If callback is not provided, removes all listeners for that event.

```typescript
// Remove specific listener
socketService.off('chat:new-message', handler);

// Remove all listeners for event
socketService.off('chat:new-message');
```

#### `emit(event: string, data?: any)`
Emit an event to the server.

```typescript
socketService.emit('chat:send-message', {
  conversationId: 'conv-123',
  bookingId: 'booking-456',
  text: 'Hello!',
});
```

### Connection Callbacks

#### `setConnectionCallbacks(callbacks: ConnectionCallbacks)`
Set callbacks for connection events.

```typescript
socketService.setConnectionCallbacks({
  onConnect: () => console.log('Connected'),
  onDisconnect: () => console.log('Disconnected'),
  onReconnect: (attemptNumber) => console.log('Reconnected'),
  onError: (error) => console.error('Error:', error),
});
```

#### `clearConnectionCallbacks()`
Clear all connection callbacks.

```typescript
socketService.clearConnectionCallbacks();
```

## Common Socket Events

Based on your backend implementation:

- `chat:new-message` - New message received
- `chat:message-sent` - Message sent confirmation
- `chat:joined` - Joined conversation room confirmation
- `chat:left` - Left conversation room confirmation
- `chat:error` - Chat-related errors
- `conversation:updated` - Conversation updated (for inbox list)
- `message:read` - Message read receipt
- `message:edited` - Message edited

## Important Notes

1. **Always cleanup**: Always remove event listeners and leave rooms in the cleanup function of `useEffect`.

2. **Connection status**: Check connection status before emitting events.

3. **Reconnection**: The service automatically handles reconnection and rejoins active rooms.

4. **Network monitoring**: The service monitors network state and attempts to reconnect when network is restored.

5. **Singleton**: Only one socket connection exists at a time. Multiple screens can use the same instance.

6. **Auth**: The service automatically uses the auth token from Redux store. Make sure user is authenticated before connecting.
