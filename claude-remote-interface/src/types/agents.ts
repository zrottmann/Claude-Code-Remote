/**
 * Agent Swarm Coordination Types
 * Defines the core types for multi-agent systems with specialized roles
 */

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  status: AgentStatus;
  capabilities: AgentCapability[];
  currentTask?: AgentTask;
  performance: AgentPerformance;
  metadata: AgentMetadata;
}

export enum AgentType {
  PLANNER = 'planner',
  CODER = 'coder', 
  TESTER = 'tester',
  SECURITY_CHECKER = 'security_checker',
  GITHUB_PUSHER = 'github_pusher',
  DIGITALOCEAN_DEPLOYER = 'digitalocean_deployer',
  ULTRATHINK = 'ultrathink',
  COORDINATOR = 'coordinator'
}

export enum AgentStatus {
  IDLE = 'idle',
  ACTIVE = 'active',
  BUSY = 'busy',
  ERROR = 'error',
  OFFLINE = 'offline'
}

export enum AgentCapability {
  // Planning & Analysis
  REQUIREMENT_ANALYSIS = 'requirement_analysis',
  TASK_BREAKDOWN = 'task_breakdown',
  DEPENDENCY_MAPPING = 'dependency_mapping',
  ARCHITECTURE_DESIGN = 'architecture_design',
  
  // Development
  CODE_GENERATION = 'code_generation',
  CODE_REVIEW = 'code_review',
  REFACTORING = 'refactoring',
  BUG_FIXING = 'bug_fixing',
  
  // Testing
  UNIT_TESTING = 'unit_testing',
  INTEGRATION_TESTING = 'integration_testing',
  E2E_TESTING = 'e2e_testing',
  PERFORMANCE_TESTING = 'performance_testing',
  
  // Security
  VULNERABILITY_SCANNING = 'vulnerability_scanning',
  SECURITY_AUDIT = 'security_audit',
  PENETRATION_TESTING = 'penetration_testing',
  COMPLIANCE_CHECK = 'compliance_check',
  
  // DevOps
  CI_CD_MANAGEMENT = 'cicd_management',
  DEPLOYMENT = 'deployment',
  MONITORING = 'monitoring',
  ROLLBACK = 'rollback',
  
  // Advanced Reasoning
  DEEP_ANALYSIS = 'deep_analysis',
  PATTERN_RECOGNITION = 'pattern_recognition',
  DECISION_MAKING = 'decision_making',
  LEARNING = 'learning'
}

export interface AgentTask {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignedAgent: string;
  dependencies: string[];
  estimatedDuration: number; // in minutes
  actualDuration?: number;
  startTime?: Date;
  completionTime?: Date;
  result?: TaskResult;
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium', 
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export interface TaskResult {
  success: boolean;
  output: string;
  artifacts: Artifact[];
  metrics: TaskMetrics;
  recommendations?: string[];
}

export interface Artifact {
  id: string;
  type: ArtifactType;
  name: string;
  path?: string;
  content?: string;
  metadata: Record<string, any>;
}

export enum ArtifactType {
  CODE_FILE = 'code_file',
  TEST_FILE = 'test_file',
  DOCUMENTATION = 'documentation',
  CONFIG_FILE = 'config_file',
  REPORT = 'report',
  DEPLOYMENT_SCRIPT = 'deployment_script'
}

export interface AgentPerformance {
  tasksCompleted: number;
  tasksSucceeded: number;
  tasksFailed: number;
  averageTaskDuration: number;
  successRate: number;
  qualityScore: number;
  lastActive: Date;
}

export interface AgentMetadata {
  version: string;
  created: Date;
  lastUpdated: Date;
  configuration: Record<string, any>;
  tags: string[];
}

export interface TaskMetrics {
  executionTime: number;
  memoryUsage?: number;
  linesOfCodeGenerated?: number;
  testsGenerated?: number;
  issuesFound?: number;
  securityIssues?: number;
}

/**
 * Ultrathink Analysis Types
 */
export interface UltrathinkAnalysis {
  id: string;
  query: string;
  context: AnalysisContext;
  steps: ReasoningStep[];
  conclusion: AnalysisConclusion;
  confidence: number; // 0-1
  timestamp: Date;
  duration: number; // in ms
}

export interface AnalysisContext {
  projectId?: string;
  files: string[];
  dependencies: string[];
  environment: string;
  constraints: string[];
  requirements: string[];
}

export interface ReasoningStep {
  id: string;
  type: ReasoningType;
  title: string;
  description: string;
  evidence: Evidence[];
  conclusion: string;
  confidence: number;
  duration: number;
}

export enum ReasoningType {
  PROBLEM_DECOMPOSITION = 'problem_decomposition',
  PATTERN_ANALYSIS = 'pattern_analysis',
  DEPENDENCY_ANALYSIS = 'dependency_analysis',
  RISK_ASSESSMENT = 'risk_assessment',
  SOLUTION_EVALUATION = 'solution_evaluation',
  OPTIMIZATION = 'optimization'
}

export interface Evidence {
  type: EvidenceType;
  source: string;
  content: string;
  relevance: number; // 0-1
  reliability: number; // 0-1
}

export enum EvidenceType {
  CODE_ANALYSIS = 'code_analysis',
  DOCUMENTATION = 'documentation',
  TEST_RESULTS = 'test_results',
  PERFORMANCE_METRICS = 'performance_metrics',
  SECURITY_SCAN = 'security_scan',
  USER_FEEDBACK = 'user_feedback'
}

export interface AnalysisConclusion {
  summary: string;
  recommendations: Recommendation[];
  nextSteps: string[];
  risks: Risk[];
  opportunities: Opportunity[];
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  impact: ImpactLevel;
  effort: EffortLevel;
  rationale: string;
}

export enum ImpactLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum EffortLevel {
  MINIMAL = 'minimal',
  LOW = 'low', 
  MEDIUM = 'medium',
  HIGH = 'high',
  EXTENSIVE = 'extensive'
}

export interface Risk {
  id: string;
  title: string;
  description: string;
  probability: number; // 0-1
  impact: ImpactLevel;
  mitigation: string;
}

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  value: number; // 0-1
  effort: EffortLevel;
  timeline: string;
}

/**
 * Agent Swarm Communication Types
 */
export interface AgentMessage {
  id: string;
  from: string;
  to: string | string[]; // single agent or broadcast
  type: MessageType;
  content: MessageContent;
  timestamp: Date;
  priority: MessagePriority;
  requiresResponse: boolean;
  correlationId?: string;
}

export enum MessageType {
  TASK_ASSIGNMENT = 'task_assignment',
  TASK_UPDATE = 'task_update',
  TASK_COMPLETION = 'task_completion',
  COLLABORATION_REQUEST = 'collaboration_request',
  INFORMATION_SHARING = 'information_sharing',
  ERROR_REPORT = 'error_report',
  COORDINATION = 'coordination'
}

export interface MessageContent {
  title: string;
  body: string;
  data?: Record<string, any>;
  attachments?: Artifact[];
}

export enum MessagePriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

/**
 * Swarm Coordination Types
 */
export interface SwarmState {
  agents: Map<string, Agent>;
  tasks: Map<string, AgentTask>;
  activeCoordination: CoordinationSession[];
  performance: SwarmPerformance;
}

export interface CoordinationSession {
  id: string;
  title: string;
  participants: string[];
  objective: string;
  status: CoordinationStatus;
  messages: AgentMessage[];
  startTime: Date;
  endTime?: Date;
}

export enum CoordinationStatus {
  INITIALIZING = 'initializing',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export interface SwarmPerformance {
  totalTasks: number;
  completedTasks: number;
  successRate: number;
  averageTaskTime: number;
  resourceUtilization: number;
  coordinationEfficiency: number;
}