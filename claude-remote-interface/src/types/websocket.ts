/**
 * WebSocket Communication Types
 * Real-time communication layer for Claude Code Remote interface
 */

export interface WebSocketMessage {
  id: string;
  type: WebSocketMessageType;
  payload: any;
  timestamp: Date;
  sender: MessageSender;
  target?: string;
  correlationId?: string;
}

export enum WebSocketMessageType {
  // Connection Management
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  PING = 'ping',
  PONG = 'pong',
  
  // Claude Code Communication
  CLAUDE_MESSAGE = 'claude_message',
  CLAUDE_RESPONSE = 'claude_response',
  CLAUDE_ERROR = 'claude_error',
  CLAUDE_STATUS = 'claude_status',
  
  // Command Execution
  COMMAND_EXECUTE = 'command_execute',
  COMMAND_OUTPUT = 'command_output',
  COMMAND_ERROR = 'command_error',
  COMMAND_COMPLETE = 'command_complete',
  
  // Agent Coordination
  AGENT_MESSAGE = 'agent_message',
  AGENT_STATUS_UPDATE = 'agent_status_update',
  AGENT_TASK_ASSIGNMENT = 'agent_task_assignment',
  AGENT_TASK_UPDATE = 'agent_task_update',
  AGENT_COORDINATION = 'agent_coordination',
  
  // Ultrathink Analysis
  ANALYSIS_REQUEST = 'analysis_request',
  ANALYSIS_UPDATE = 'analysis_update',
  ANALYSIS_COMPLETE = 'analysis_complete',
  
  // File Operations
  FILE_READ = 'file_read',
  FILE_WRITE = 'file_write',
  FILE_DELETE = 'file_delete',
  FILE_LIST = 'file_list',
  FILE_WATCH = 'file_watch',
  
  // Project Management
  PROJECT_STATUS = 'project_status',
  PROJECT_UPDATE = 'project_update',
  GIT_OPERATION = 'git_operation',
  
  // System Events
  SYSTEM_STATUS = 'system_status',
  ERROR = 'error',
  NOTIFICATION = 'notification'
}

export interface MessageSender {
  type: SenderType;
  id: string;
  name: string;
}

export enum SenderType {
  USER = 'user',
  CLAUDE = 'claude',
  AGENT = 'agent',
  SYSTEM = 'system'
}

export interface ConnectionState {
  status: ConnectionStatus;
  endpoint: string;
  lastPing?: Date;
  latency?: number;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
  error?: ConnectionError;
}

export enum ConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error'
}

export interface ConnectionError {
  code: number;
  message: string;
  timestamp: Date;
  recoverable: boolean;
}

/**
 * Claude Code Integration Types
 */
export interface ClaudeSession {
  id: string;
  status: ClaudeSessionStatus;
  workingDirectory: string;
  environment: Record<string, string>;
  activeTask?: string;
  history: ClaudeInteraction[];
  metadata: SessionMetadata;
}

export enum ClaudeSessionStatus {
  INITIALIZING = 'initializing',
  READY = 'ready',
  BUSY = 'busy',
  WAITING = 'waiting',
  ERROR = 'error',
  TERMINATED = 'terminated'
}

export interface ClaudeInteraction {
  id: string;
  type: InteractionType;
  input: string;
  output?: string;
  status: InteractionStatus;
  startTime: Date;
  endTime?: Date;
  metadata?: Record<string, any>;
}

export enum InteractionType {
  COMMAND = 'command',
  QUESTION = 'question',
  CODE_REVIEW = 'code_review',
  FILE_OPERATION = 'file_operation',
  ANALYSIS = 'analysis'
}

export enum InteractionStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export interface SessionMetadata {
  created: Date;
  lastActive: Date;
  totalInteractions: number;
  successfulInteractions: number;
  tags: string[];
}

/**
 * File System Operations
 */
export interface FileOperation {
  id: string;
  type: FileOperationType;
  path: string;
  content?: string;
  options?: FileOperationOptions;
  result?: FileOperationResult;
}

export enum FileOperationType {
  READ = 'read',
  WRITE = 'write',
  DELETE = 'delete',
  MOVE = 'move',
  COPY = 'copy',
  LIST = 'list',
  WATCH = 'watch',
  SEARCH = 'search'
}

export interface FileOperationOptions {
  encoding?: string;
  recursive?: boolean;
  filter?: string;
  backup?: boolean;
  overwrite?: boolean;
}

export interface FileOperationResult {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: Record<string, any>;
}

export interface FileSystemItem {
  name: string;
  path: string;
  type: FileSystemItemType;
  size?: number;
  modified?: Date;
  permissions?: string;
  children?: FileSystemItem[];
}

export enum FileSystemItemType {
  FILE = 'file',
  DIRECTORY = 'directory',
  SYMLINK = 'symlink'
}

/**
 * Project Management Types
 */
export interface ProjectInfo {
  id: string;
  name: string;
  path: string;
  type: ProjectType;
  status: ProjectStatus;
  git?: GitInfo;
  dependencies?: DependencyInfo[];
  scripts?: Record<string, string>;
  metadata: ProjectMetadata;
}

export enum ProjectType {
  NODE = 'node',
  PYTHON = 'python',
  REACT = 'react',
  VUE = 'vue',
  ANGULAR = 'angular',
  NEXT = 'next',
  SVELTE = 'svelte',
  GOLANG = 'golang',
  RUST = 'rust',
  UNKNOWN = 'unknown'
}

export enum ProjectStatus {
  HEALTHY = 'healthy',
  ISSUES = 'issues',
  ERROR = 'error',
  NOT_INITIALIZED = 'not_initialized'
}

export interface GitInfo {
  branch: string;
  status: GitStatus;
  remoteUrl?: string;
  lastCommit?: GitCommit;
  uncommittedChanges: number;
}

export interface GitStatus {
  clean: boolean;
  ahead: number;
  behind: number;
  staged: number;
  modified: number;
  untracked: number;
}

export interface GitCommit {
  hash: string;
  message: string;
  author: string;
  date: Date;
}

export interface DependencyInfo {
  name: string;
  version: string;
  type: DependencyType;
  outdated: boolean;
  vulnerabilities?: number;
}

export enum DependencyType {
  PRODUCTION = 'production',
  DEVELOPMENT = 'development',
  PEER = 'peer',
  OPTIONAL = 'optional'
}

export interface ProjectMetadata {
  created: Date;
  lastAnalyzed: Date;
  framework?: string;
  language: string;
  linesOfCode?: number;
  testCoverage?: number;
}

/**
 * Real-time Event Types
 */
export interface RealTimeEvent {
  id: string;
  type: EventType;
  source: string;
  data: any;
  timestamp: Date;
  severity: EventSeverity;
}

export enum EventType {
  FILE_CHANGED = 'file_changed',
  COMMAND_EXECUTED = 'command_executed',
  AGENT_STATUS_CHANGED = 'agent_status_changed',
  TASK_UPDATED = 'task_updated',
  ERROR_OCCURRED = 'error_occurred',
  NOTIFICATION = 'notification',
  SYSTEM_EVENT = 'system_event'
}

export enum EventSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

/**
 * WebSocket Manager Configuration
 */
export interface WebSocketConfig {
  endpoint: string;
  protocols?: string[];
  reconnect: boolean;
  maxReconnectAttempts: number;
  reconnectDelay: number;
  heartbeatInterval: number;
  timeout: number;
  authentication?: AuthConfig;
}

export interface AuthConfig {
  type: AuthType;
  token?: string;
  credentials?: Record<string, string>;
}

export enum AuthType {
  NONE = 'none',
  TOKEN = 'token',
  BASIC = 'basic',
  OAUTH = 'oauth'
}