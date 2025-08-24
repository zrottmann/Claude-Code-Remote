/**
 * Main Application Types
 * Core types for Claude Code Remote Interface
 */

import { Agent, AgentTask, SwarmState } from './agents';
import { WebSocketMessage, ClaudeSession, ProjectInfo } from './websocket';

export * from './agents';
export * from './websocket';

/**
 * Application State Types
 */
export interface AppState {
  user: User | null;
  sessions: ClaudeSession[];
  activeSession: string | null;
  agents: SwarmState;
  projects: ProjectInfo[];
  activeProject: string | null;
  ui: UIState;
  settings: AppSettings;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  preferences: UserPreferences;
  subscription: Subscription;
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  DEVELOPER = 'developer',
  TEAM_LEAD = 'team_lead'
}

export interface UserPreferences {
  theme: Theme;
  language: string;
  notifications: NotificationSettings;
  editor: EditorSettings;
  agents: AgentPreferences;
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system'
}

export interface NotificationSettings {
  taskCompleted: boolean;
  agentErrors: boolean;
  systemUpdates: boolean;
  emailDigest: boolean;
  pushNotifications: boolean;
}

export interface EditorSettings {
  fontSize: number;
  fontFamily: string;
  theme: string;
  tabSize: number;
  wordWrap: boolean;
  minimap: boolean;
  lineNumbers: boolean;
}

export interface AgentPreferences {
  autoAssignTasks: boolean;
  preferredAgents: string[];
  maxConcurrentTasks: number;
  analysisDepth: AnalysisDepth;
}

export enum AnalysisDepth {
  SHALLOW = 'shallow',
  STANDARD = 'standard', 
  DEEP = 'deep',
  EXHAUSTIVE = 'exhaustive'
}

export interface Subscription {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  validUntil: Date;
  features: SubscriptionFeature[];
}

export enum SubscriptionPlan {
  FREE = 'free',
  PRO = 'pro',
  TEAM = 'team',
  ENTERPRISE = 'enterprise'
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  PENDING = 'pending'
}

export enum SubscriptionFeature {
  UNLIMITED_SESSIONS = 'unlimited_sessions',
  ADVANCED_AGENTS = 'advanced_agents',
  TEAM_COLLABORATION = 'team_collaboration',
  PRIORITY_SUPPORT = 'priority_support',
  CUSTOM_INTEGRATIONS = 'custom_integrations',
  ANALYTICS = 'analytics'
}

/**
 * UI State Types  
 */
export interface UIState {
  sidebarOpen: boolean;
  activePanel: Panel;
  modal: ModalState | null;
  notifications: Notification[];
  loading: LoadingState;
  errors: ErrorState[];
}

export enum Panel {
  CHAT = 'chat',
  AGENTS = 'agents',
  FILES = 'files',
  PROJECTS = 'projects',
  SETTINGS = 'settings',
  ANALYTICS = 'analytics'
}

export interface ModalState {
  type: ModalType;
  props: Record<string, any>;
  dismissible: boolean;
}

export enum ModalType {
  CREATE_SESSION = 'create_session',
  ADD_AGENT = 'add_agent',
  PROJECT_SETTINGS = 'project_settings',
  USER_PROFILE = 'user_profile',
  CONFIRM_ACTION = 'confirm_action'
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actions?: NotificationAction[];
}

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error'
}

export interface NotificationAction {
  label: string;
  action: () => void;
  style: ActionStyle;
}

export enum ActionStyle {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  DANGER = 'danger'
}

export interface LoadingState {
  global: boolean;
  sessions: boolean;
  agents: boolean;
  projects: boolean;
  operations: Set<string>;
}

export interface ErrorState {
  id: string;
  type: ErrorType;
  message: string;
  details?: string;
  timestamp: Date;
  resolved: boolean;
}

export enum ErrorType {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AGENT = 'agent',
  FILE_SYSTEM = 'file_system',
  APPLICATION = 'application'
}

/**
 * Application Settings
 */
export interface AppSettings {
  general: GeneralSettings;
  connectivity: ConnectivitySettings;
  security: SecuritySettings;
  performance: PerformanceSettings;
  experimental: ExperimentalSettings;
}

export interface GeneralSettings {
  autoSave: boolean;
  autoReconnect: boolean;
  logLevel: LogLevel;
  maxHistoryEntries: number;
  defaultWorkingDirectory: string;
}

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

export interface ConnectivitySettings {
  websocketEndpoint: string;
  timeout: number;
  maxRetries: number;
  heartbeatInterval: number;
  compression: boolean;
}

export interface SecuritySettings {
  requireAuth: boolean;
  sessionTimeout: number;
  allowRemoteConnections: boolean;
  encryptCommunication: boolean;
  auditLog: boolean;
}

export interface PerformanceSettings {
  maxConcurrentOperations: number;
  cacheSize: number;
  optimizeMemory: boolean;
  enableProfiling: boolean;
}

export interface ExperimentalSettings {
  enableBetaFeatures: boolean;
  advancedAgentCoordination: boolean;
  realTimeCollaboration: boolean;
  aiAssistance: boolean;
}

/**
 * API Response Types
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata?: ResponseMetadata;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  stack?: string;
}

export interface ResponseMetadata {
  timestamp: Date;
  requestId: string;
  duration: number;
  version: string;
}

/**
 * Event Handler Types
 */
export type EventHandler<T = any> = (data: T) => void;
export type AsyncEventHandler<T = any> = (data: T) => Promise<void>;

export interface EventSubscription {
  event: string;
  handler: EventHandler;
  once?: boolean;
}

/**
 * Component Props Types
 */
export interface BaseComponentProps {
  className?: string;
  id?: string;
  testId?: string;
}

export interface InteractiveComponentProps extends BaseComponentProps {
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}

/**
 * Utility Types
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type Status = 'idle' | 'loading' | 'success' | 'error';
export type Size = 'sm' | 'md' | 'lg' | 'xl';
export type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';

/**
 * Configuration Types
 */
export interface Config {
  app: AppConfig;
  api: ApiConfig;
  websocket: WebSocketConfig;
  auth: AuthConfig;
  features: FeatureConfig;
}

export interface AppConfig {
  name: string;
  version: string;
  environment: Environment;
  debug: boolean;
  baseUrl: string;
}

export enum Environment {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production'
}

export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  rateLimiting: boolean;
}

export interface WebSocketConfig {
  url: string;
  protocols: string[];
  reconnect: ReconnectConfig;
}

export interface ReconnectConfig {
  enabled: boolean;
  maxAttempts: number;
  delay: number;
  backoff: number;
}

export interface AuthConfig {
  provider: AuthProvider;
  clientId: string;
  redirectUrl: string;
  scopes: string[];
}

export enum AuthProvider {
  APPWRITE = 'appwrite',
  FIREBASE = 'firebase',
  SUPABASE = 'supabase',
  CUSTOM = 'custom'
}

export interface FeatureConfig {
  agents: boolean;
  ultrathink: boolean;
  fileOperations: boolean;
  gitIntegration: boolean;
  realTimeCollaboration: boolean;
  analytics: boolean;
}