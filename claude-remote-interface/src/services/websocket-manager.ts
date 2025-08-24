/**
 * WebSocket Communication Manager
 * Real-time communication layer for Claude Code Remote interface
 */

import {
  WebSocketMessage,
  WebSocketMessageType,
  ConnectionState,
  ConnectionStatus,
  MessageSender,
  SenderType,
  ClaudeSession,
  FileOperation,
  ProjectInfo
} from '../types';

export class WebSocketManager {
  private socket: WebSocket | null = null;
  private connectionState: ConnectionState;
  private messageQueue: WebSocketMessage[] = [];
  private eventListeners: Map<string, Function[]> = new Map();
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private messageHandlers: Map<WebSocketMessageType, Function> = new Map();

  constructor(private endpoint: string) {
    this.connectionState = {
      status: ConnectionStatus.DISCONNECTED,
      endpoint,
      reconnectAttempts: 0,
      maxReconnectAttempts: 5
    };

    this.initializeMessageHandlers();
  }

  /**
   * Establish WebSocket connection
   */
  async connect(): Promise<void> {
    if (this.connectionState.status === ConnectionStatus.CONNECTED) {
      console.log('🔌 [WebSocket] Already connected');
      return;
    }

    console.log(`🔌 [WebSocket] Connecting to ${this.endpoint}...`);
    
    try {
      this.connectionState.status = ConnectionStatus.CONNECTING;
      this.emit('status:connecting', { endpoint: this.endpoint });

      this.socket = new WebSocket(this.endpoint);
      
      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
      this.socket.onerror = this.handleError.bind(this);

      // Wait for connection to establish
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 10000);

        const cleanup = () => {
          clearTimeout(timeout);
          this.off('status:connected', resolve);
          this.off('status:error', reject);
        };

        this.once('status:connected', () => {
          cleanup();
          resolve();
        });

        this.once('status:error', (error) => {
          cleanup();
          reject(error);
        });
      });

    } catch (error) {
      console.error('🚨 [WebSocket] Connection failed:', error);
      this.connectionState.status = ConnectionStatus.ERROR;
      this.connectionState.error = {
        code: 1000,
        message: error.message,
        timestamp: new Date(),
        recoverable: true
      };
      
      this.emit('status:error', { error });
      throw error;
    }
  }

  /**
   * Disconnect WebSocket connection
   */
  disconnect(): void {
    console.log('🔌 [WebSocket] Disconnecting...');
    
    this.clearTimers();
    
    if (this.socket) {
      this.socket.close(1000, 'User requested disconnect');
    }
    
    this.connectionState.status = ConnectionStatus.DISCONNECTED;
    this.emit('status:disconnected', { code: 1000 });
  }

  /**
   * Send message through WebSocket
   */
  async sendMessage(
    type: WebSocketMessageType,
    payload: any,
    target?: string
  ): Promise<void> {
    const message: WebSocketMessage = {
      id: this.generateMessageId(),
      type,
      payload,
      timestamp: new Date(),
      sender: {
        type: SenderType.USER,
        id: 'user-001',
        name: 'User'
      },
      target
    };

    if (this.isConnected()) {
      try {
        this.socket!.send(JSON.stringify(message));
        this.emit('message:sent', message);
        console.log(`📤 [WebSocket] Message sent: ${type}`);
      } catch (error) {
        console.error('🚨 [WebSocket] Failed to send message:', error);
        this.queueMessage(message);
      }
    } else {
      console.log('📥 [WebSocket] Queueing message (not connected)');
      this.queueMessage(message);
    }
  }

  /**
   * Send Claude command
   */
  async sendClaudeMessage(message: string, sessionId?: string): Promise<void> {
    await this.sendMessage(WebSocketMessageType.CLAUDE_MESSAGE, {
      message,
      sessionId: sessionId || 'default',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send command execution request
   */
  async sendCommand(command: string, sessionId?: string, options?: any): Promise<void> {
    await this.sendMessage(WebSocketMessageType.COMMAND_EXECUTE, {
      command,
      sessionId: sessionId || 'default',
      options: options || {},
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Request file operation
   */
  async requestFileOperation(operation: FileOperation): Promise<void> {
    await this.sendMessage(operation.type as any, {
      operation,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Request ultrathink analysis
   */
  async requestAnalysis(query: string, context: any): Promise<void> {
    await this.sendMessage(WebSocketMessageType.ANALYSIS_REQUEST, {
      query,
      context,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send agent coordination message
   */
  async sendAgentMessage(
    targetAgent: string,
    messageType: string,
    data: any
  ): Promise<void> {
    await this.sendMessage(WebSocketMessageType.AGENT_MESSAGE, {
      targetAgent,
      messageType,
      data,
      timestamp: new Date().toISOString()
    });
  }

  // Event handling
  private handleOpen(): void {
    console.log('✅ [WebSocket] Connection established');
    
    this.connectionState.status = ConnectionStatus.CONNECTED;
    this.connectionState.reconnectAttempts = 0;
    delete this.connectionState.error;
    
    this.startHeartbeat();
    this.processQueuedMessages();
    
    this.emit('status:connected', { endpoint: this.endpoint });
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      console.log(`📨 [WebSocket] Message received: ${message.type}`);
      
      // Update connection latency if ping response
      if (message.type === WebSocketMessageType.PONG) {
        const latency = Date.now() - new Date(message.timestamp).getTime();
        this.connectionState.latency = latency;
        this.connectionState.lastPing = new Date();
      }

      // Handle message with appropriate handler
      const handler = this.messageHandlers.get(message.type);
      if (handler) {
        handler(message);
      }

      this.emit('message:received', message);
      this.emit(`message:${message.type.toLowerCase()}`, message);

    } catch (error) {
      console.error('🚨 [WebSocket] Failed to parse message:', error);
    }
  }

  private handleClose(event: CloseEvent): void {
    console.log(`🔌 [WebSocket] Connection closed: ${event.code} - ${event.reason}`);
    
    this.clearTimers();
    this.connectionState.status = ConnectionStatus.DISCONNECTED;
    
    this.emit('status:disconnected', { 
      code: event.code, 
      reason: event.reason 
    });

    // Attempt reconnection if not intentional disconnect
    if (event.code !== 1000 && this.connectionState.reconnectAttempts < this.connectionState.maxReconnectAttempts) {
      this.attemptReconnection();
    }
  }

  private handleError(event: Event): void {
    console.error('🚨 [WebSocket] Connection error:', event);
    
    const error = {
      code: 0,
      message: 'WebSocket connection error',
      timestamp: new Date(),
      recoverable: true
    };

    this.connectionState.status = ConnectionStatus.ERROR;
    this.connectionState.error = error;
    
    this.emit('status:error', { error });
  }

  /**
   * Initialize message handlers for different message types
   */
  private initializeMessageHandlers(): void {
    // Claude responses
    this.messageHandlers.set(WebSocketMessageType.CLAUDE_RESPONSE, (message) => {
      this.emit('claude:response', message.payload);
    });

    this.messageHandlers.set(WebSocketMessageType.CLAUDE_ERROR, (message) => {
      this.emit('claude:error', message.payload);
    });

    this.messageHandlers.set(WebSocketMessageType.CLAUDE_STATUS, (message) => {
      this.emit('claude:status', message.payload);
    });

    // Command execution
    this.messageHandlers.set(WebSocketMessageType.COMMAND_OUTPUT, (message) => {
      this.emit('command:output', message.payload);
    });

    this.messageHandlers.set(WebSocketMessageType.COMMAND_ERROR, (message) => {
      this.emit('command:error', message.payload);
    });

    this.messageHandlers.set(WebSocketMessageType.COMMAND_COMPLETE, (message) => {
      this.emit('command:complete', message.payload);
    });

    // Agent coordination
    this.messageHandlers.set(WebSocketMessageType.AGENT_STATUS_UPDATE, (message) => {
      this.emit('agent:status', message.payload);
    });

    this.messageHandlers.set(WebSocketMessageType.AGENT_TASK_UPDATE, (message) => {
      this.emit('agent:task-update', message.payload);
    });

    // Ultrathink analysis
    this.messageHandlers.set(WebSocketMessageType.ANALYSIS_UPDATE, (message) => {
      this.emit('analysis:update', message.payload);
    });

    this.messageHandlers.set(WebSocketMessageType.ANALYSIS_COMPLETE, (message) => {
      this.emit('analysis:complete', message.payload);
    });

    // File operations
    this.messageHandlers.set(WebSocketMessageType.FILE_READ, (message) => {
      this.emit('file:read', message.payload);
    });

    this.messageHandlers.set(WebSocketMessageType.FILE_WRITE, (message) => {
      this.emit('file:write', message.payload);
    });

    // Project management
    this.messageHandlers.set(WebSocketMessageType.PROJECT_STATUS, (message) => {
      this.emit('project:status', message.payload);
    });

    this.messageHandlers.set(WebSocketMessageType.PROJECT_UPDATE, (message) => {
      this.emit('project:update', message.payload);
    });

    // System events
    this.messageHandlers.set(WebSocketMessageType.SYSTEM_STATUS, (message) => {
      this.emit('system:status', message.payload);
    });

    this.messageHandlers.set(WebSocketMessageType.ERROR, (message) => {
      this.emit('error', message.payload);
    });

    this.messageHandlers.set(WebSocketMessageType.NOTIFICATION, (message) => {
      this.emit('notification', message.payload);
    });
  }

  /**
   * Attempt to reconnect to WebSocket
   */
  private attemptReconnection(): void {
    if (this.connectionState.reconnectAttempts >= this.connectionState.maxReconnectAttempts) {
      console.error('🚨 [WebSocket] Max reconnection attempts reached');
      return;
    }

    const delay = Math.pow(2, this.connectionState.reconnectAttempts) * 1000; // Exponential backoff
    this.connectionState.reconnectAttempts++;
    
    console.log(`🔄 [WebSocket] Attempting reconnection ${this.connectionState.reconnectAttempts}/${this.connectionState.maxReconnectAttempts} in ${delay}ms`);
    
    this.connectionState.status = ConnectionStatus.RECONNECTING;
    this.emit('status:reconnecting', { 
      attempt: this.connectionState.reconnectAttempts,
      maxAttempts: this.connectionState.maxReconnectAttempts,
      delay 
    });

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch((error) => {
        console.error('🚨 [WebSocket] Reconnection failed:', error);
      });
    }, delay);
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected()) {
        this.sendMessage(WebSocketMessageType.PING, { 
          timestamp: Date.now() 
        });
      }
    }, 30000); // 30 seconds
  }

  /**
   * Clear all timers
   */
  private clearTimers(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Queue message for sending when connection is restored
   */
  private queueMessage(message: WebSocketMessage): void {
    this.messageQueue.push(message);
    
    // Limit queue size to prevent memory issues
    if (this.messageQueue.length > 100) {
      this.messageQueue.shift();
    }
  }

  /**
   * Process queued messages when connection is restored
   */
  private processQueuedMessages(): void {
    console.log(`📤 [WebSocket] Processing ${this.messageQueue.length} queued messages`);
    
    while (this.messageQueue.length > 0 && this.isConnected()) {
      const message = this.messageQueue.shift();
      if (message) {
        try {
          this.socket!.send(JSON.stringify(message));
          this.emit('message:sent', message);
        } catch (error) {
          console.error('🚨 [WebSocket] Failed to send queued message:', error);
          // Re-queue the message
          this.messageQueue.unshift(message);
          break;
        }
      }
    }
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public API methods
  public isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  public getConnectionState(): ConnectionState {
    return { ...this.connectionState };
  }

  public getQueuedMessageCount(): number {
    return this.messageQueue.length;
  }

  public clearMessageQueue(): void {
    this.messageQueue = [];
  }

  // Event emitter methods
  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }

  public on(event: string, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }

  public off(event: string, listener: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  public once(event: string, listener: Function): void {
    const onceWrapper = (data: any) => {
      this.off(event, onceWrapper);
      listener(data);
    };
    this.on(event, onceWrapper);
  }

  public removeAllListeners(event?: string): void {
    if (event) {
      this.eventListeners.delete(event);
    } else {
      this.eventListeners.clear();
    }
  }
}

/**
 * WebSocket Manager Factory
 */
export class WebSocketManagerFactory {
  private static instances: Map<string, WebSocketManager> = new Map();

  static getInstance(endpoint: string): WebSocketManager {
    if (!this.instances.has(endpoint)) {
      this.instances.set(endpoint, new WebSocketManager(endpoint));
    }
    return this.instances.get(endpoint)!;
  }

  static destroyInstance(endpoint: string): void {
    const instance = this.instances.get(endpoint);
    if (instance) {
      instance.disconnect();
      instance.removeAllListeners();
      this.instances.delete(endpoint);
    }
  }

  static destroyAllInstances(): void {
    this.instances.forEach((instance, endpoint) => {
      this.destroyInstance(endpoint);
    });
  }
}

// Export default WebSocket manager instance
export const defaultWebSocketManager = WebSocketManagerFactory.getInstance('ws://localhost:8080/ws');