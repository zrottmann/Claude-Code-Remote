/**
 * Appwrite Client Service
 * Authentication, database, and real-time integration for Claude Code Remote
 */

import { 
  Client, 
  Account, 
  Databases, 
  Storage, 
  Functions,
  Realtime,
  Permission,
  Role,
  ID,
  Query
} from 'appwrite';

import { 
  User, 
  UserRole, 
  ClaudeSession, 
  ProjectInfo,
  AgentTask,
  SwarmState 
} from '../types';

export class AppwriteClient {
  private client: Client;
  private account: Account;
  private databases: Databases;
  private storage: Storage;
  private functions: Functions;
  private realtime: Realtime;

  private readonly databaseId = 'claude-remote-db';
  private readonly collectionsConfig = {
    users: 'users',
    sessions: 'claude-sessions',
    projects: 'projects',
    tasks: 'agent-tasks',
    analyses: 'ultrathink-analyses',
    swarmStates: 'swarm-states'
  };

  constructor(
    private endpoint: string = 'https://nyc.cloud.appwrite.io/v1',
    private projectId: string = process.env.VITE_APPWRITE_PROJECT_ID || ''
  ) {
    this.client = new Client();
    this.client
      .setEndpoint(this.endpoint)
      .setProject(this.projectId);

    this.account = new Account(this.client);
    this.databases = new Databases(this.client);
    this.storage = new Storage(this.client);
    this.functions = new Functions(this.client);
    this.realtime = new Realtime(this.client);

    console.log('🔗 [Appwrite] Client initialized');
  }

  /**
   * Authentication Methods
   */
  async login(email: string, password: string): Promise<User> {
    try {
      console.log('🔐 [Appwrite] Logging in user...');
      
      const session = await this.account.createEmailSession(email, password);
      const accountData = await this.account.get();
      
      // Get or create user document
      const user = await this.getOrCreateUserDocument(accountData);
      
      console.log('✅ [Appwrite] User logged in successfully');
      return user;
      
    } catch (error) {
      console.error('🚨 [Appwrite] Login failed:', error);
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  async register(email: string, password: string, name: string): Promise<User> {
    try {
      console.log('📝 [Appwrite] Registering new user...');
      
      const account = await this.account.create(ID.unique(), email, password, name);
      await this.login(email, password);
      
      const user = await this.getOrCreateUserDocument(account);
      
      console.log('✅ [Appwrite] User registered successfully');
      return user;
      
    } catch (error) {
      console.error('🚨 [Appwrite] Registration failed:', error);
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  async logout(): Promise<void> {
    try {
      console.log('🔐 [Appwrite] Logging out user...');
      await this.account.deleteSession('current');
      console.log('✅ [Appwrite] User logged out successfully');
    } catch (error) {
      console.error('🚨 [Appwrite] Logout failed:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const accountData = await this.account.get();
      const user = await this.getUserDocument(accountData.$id);
      return user;
    } catch (error) {
      console.log('ℹ️ [Appwrite] No authenticated user');
      return null;
    }
  }

  async createOAuthSession(provider: string, successUrl?: string, failureUrl?: string): Promise<void> {
    try {
      console.log(`🔐 [Appwrite] Creating OAuth session with ${provider}...`);
      
      this.account.createOAuth2Session(
        provider as any,
        successUrl || `${window.location.origin}/auth/success`,
        failureUrl || `${window.location.origin}/auth/error`
      );
    } catch (error) {
      console.error('🚨 [Appwrite] OAuth session creation failed:', error);
      throw error;
    }
  }

  /**
   * Database Operations - Users
   */
  private async getOrCreateUserDocument(accountData: any): Promise<User> {
    try {
      // Try to get existing user document
      const existingUser = await this.getUserDocument(accountData.$id);
      if (existingUser) {
        return existingUser;
      }
    } catch (error) {
      // User document doesn't exist, create it
    }

    // Create new user document
    const userData: Partial<User> = {
      id: accountData.$id,
      email: accountData.email,
      name: accountData.name,
      role: UserRole.USER,
      preferences: {
        theme: 'dark' as any,
        language: 'en',
        notifications: {
          taskCompleted: true,
          agentErrors: true,
          systemUpdates: true,
          emailDigest: false,
          pushNotifications: true
        },
        editor: {
          fontSize: 14,
          fontFamily: 'Monaco',
          theme: 'vs-dark',
          tabSize: 2,
          wordWrap: true,
          minimap: true,
          lineNumbers: true
        },
        agents: {
          autoAssignTasks: true,
          preferredAgents: [],
          maxConcurrentTasks: 3,
          analysisDepth: 'standard' as any
        }
      },
      subscription: {
        plan: 'free' as any,
        status: 'active' as any,
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        features: []
      }
    };

    const document = await this.databases.createDocument(
      this.databaseId,
      this.collectionsConfig.users,
      accountData.$id,
      userData
    );

    return this.mapDocumentToUser(document);
  }

  private async getUserDocument(userId: string): Promise<User | null> {
    try {
      const document = await this.databases.getDocument(
        this.databaseId,
        this.collectionsConfig.users,
        userId
      );
      return this.mapDocumentToUser(document);
    } catch (error) {
      return null;
    }
  }

  private mapDocumentToUser(document: any): User {
    return {
      id: document.$id,
      email: document.email,
      name: document.name,
      avatar: document.avatar,
      role: document.role || UserRole.USER,
      preferences: document.preferences || {},
      subscription: document.subscription || {}
    } as User;
  }

  /**
   * Database Operations - Claude Sessions
   */
  async createClaudeSession(session: Partial<ClaudeSession>): Promise<ClaudeSession> {
    try {
      console.log('💾 [Appwrite] Creating Claude session...');
      
      const document = await this.databases.createDocument(
        this.databaseId,
        this.collectionsConfig.sessions,
        ID.unique(),
        {
          ...session,
          created: new Date().toISOString(),
          updated: new Date().toISOString()
        }
      );

      console.log('✅ [Appwrite] Claude session created');
      return this.mapDocumentToSession(document);
      
    } catch (error) {
      console.error('🚨 [Appwrite] Failed to create session:', error);
      throw error;
    }
  }

  async getClaudeSessions(userId?: string): Promise<ClaudeSession[]> {
    try {
      console.log('📄 [Appwrite] Fetching Claude sessions...');
      
      const queries = userId ? [Query.equal('userId', userId)] : [];
      
      const response = await this.databases.listDocuments(
        this.databaseId,
        this.collectionsConfig.sessions,
        queries
      );

      return response.documents.map(this.mapDocumentToSession);
      
    } catch (error) {
      console.error('🚨 [Appwrite] Failed to fetch sessions:', error);
      return [];
    }
  }

  async updateClaudeSession(sessionId: string, updates: Partial<ClaudeSession>): Promise<ClaudeSession> {
    try {
      const document = await this.databases.updateDocument(
        this.databaseId,
        this.collectionsConfig.sessions,
        sessionId,
        {
          ...updates,
          updated: new Date().toISOString()
        }
      );

      return this.mapDocumentToSession(document);
      
    } catch (error) {
      console.error('🚨 [Appwrite] Failed to update session:', error);
      throw error;
    }
  }

  async deleteClaudeSession(sessionId: string): Promise<void> {
    try {
      await this.databases.deleteDocument(
        this.databaseId,
        this.collectionsConfig.sessions,
        sessionId
      );
      console.log('✅ [Appwrite] Session deleted');
    } catch (error) {
      console.error('🚨 [Appwrite] Failed to delete session:', error);
      throw error;
    }
  }

  private mapDocumentToSession(document: any): ClaudeSession {
    return {
      id: document.$id,
      status: document.status,
      workingDirectory: document.workingDirectory,
      environment: document.environment || {},
      activeTask: document.activeTask,
      history: document.history || [],
      metadata: document.metadata || {}
    };
  }

  /**
   * Database Operations - Projects
   */
  async createProject(project: Partial<ProjectInfo>): Promise<ProjectInfo> {
    try {
      console.log('💾 [Appwrite] Creating project...');
      
      const document = await this.databases.createDocument(
        this.databaseId,
        this.collectionsConfig.projects,
        ID.unique(),
        {
          ...project,
          created: new Date().toISOString(),
          updated: new Date().toISOString()
        }
      );

      console.log('✅ [Appwrite] Project created');
      return this.mapDocumentToProject(document);
      
    } catch (error) {
      console.error('🚨 [Appwrite] Failed to create project:', error);
      throw error;
    }
  }

  async getProjects(userId?: string): Promise<ProjectInfo[]> {
    try {
      console.log('📄 [Appwrite] Fetching projects...');
      
      const queries = userId ? [Query.equal('userId', userId)] : [];
      
      const response = await this.databases.listDocuments(
        this.databaseId,
        this.collectionsConfig.projects,
        queries
      );

      return response.documents.map(this.mapDocumentToProject);
      
    } catch (error) {
      console.error('🚨 [Appwrite] Failed to fetch projects:', error);
      return [];
    }
  }

  private mapDocumentToProject(document: any): ProjectInfo {
    return {
      id: document.$id,
      name: document.name,
      path: document.path,
      type: document.type,
      status: document.status,
      git: document.git,
      dependencies: document.dependencies || [],
      scripts: document.scripts || {},
      metadata: document.metadata || {}
    };
  }

  /**
   * Database Operations - Agent Tasks
   */
  async saveAgentTask(task: AgentTask): Promise<AgentTask> {
    try {
      const document = await this.databases.createDocument(
        this.databaseId,
        this.collectionsConfig.tasks,
        ID.unique(),
        {
          ...task,
          created: new Date().toISOString(),
          updated: new Date().toISOString()
        }
      );

      return this.mapDocumentToTask(document);
      
    } catch (error) {
      console.error('🚨 [Appwrite] Failed to save task:', error);
      throw error;
    }
  }

  async getAgentTasks(status?: string): Promise<AgentTask[]> {
    try {
      const queries = status ? [Query.equal('status', status)] : [];
      
      const response = await this.databases.listDocuments(
        this.databaseId,
        this.collectionsConfig.tasks,
        queries
      );

      return response.documents.map(this.mapDocumentToTask);
      
    } catch (error) {
      console.error('🚨 [Appwrite] Failed to fetch tasks:', error);
      return [];
    }
  }

  private mapDocumentToTask(document: any): AgentTask {
    return {
      id: document.$id,
      title: document.title,
      description: document.description,
      priority: document.priority,
      status: document.status,
      assignedAgent: document.assignedAgent,
      dependencies: document.dependencies || [],
      estimatedDuration: document.estimatedDuration,
      actualDuration: document.actualDuration,
      startTime: document.startTime ? new Date(document.startTime) : undefined,
      completionTime: document.completionTime ? new Date(document.completionTime) : undefined,
      result: document.result
    };
  }

  /**
   * Real-time Subscriptions
   */
  subscribeToSessions(callback: (payload: any) => void): () => void {
    console.log('🔔 [Appwrite] Subscribing to session updates...');
    
    const unsubscribe = this.realtime.subscribe(
      `databases.${this.databaseId}.collections.${this.collectionsConfig.sessions}.documents`,
      callback
    );

    return unsubscribe;
  }

  subscribeToTasks(callback: (payload: any) => void): () => void {
    console.log('🔔 [Appwrite] Subscribing to task updates...');
    
    const unsubscribe = this.realtime.subscribe(
      `databases.${this.databaseId}.collections.${this.collectionsConfig.tasks}.documents`,
      callback
    );

    return unsubscribe;
  }

  subscribeToProjects(callback: (payload: any) => void): () => void {
    console.log('🔔 [Appwrite] Subscribing to project updates...');
    
    const unsubscribe = this.realtime.subscribe(
      `databases.${this.databaseId}.collections.${this.collectionsConfig.projects}.documents`,
      callback
    );

    return unsubscribe;
  }

  /**
   * Storage Operations
   */
  async uploadFile(file: File, bucket: string = 'default'): Promise<string> {
    try {
      console.log('📁 [Appwrite] Uploading file...');
      
      const response = await this.storage.createFile(bucket, ID.unique(), file);
      
      console.log('✅ [Appwrite] File uploaded successfully');
      return response.$id;
      
    } catch (error) {
      console.error('🚨 [Appwrite] File upload failed:', error);
      throw error;
    }
  }

  async downloadFile(fileId: string, bucket: string = 'default'): Promise<URL> {
    try {
      const url = this.storage.getFileDownload(bucket, fileId);
      return url;
    } catch (error) {
      console.error('🚨 [Appwrite] File download failed:', error);
      throw error;
    }
  }

  /**
   * Functions (Serverless)
   */
  async executeFunction(functionId: string, data?: any): Promise<any> {
    try {
      console.log(`⚡ [Appwrite] Executing function: ${functionId}...`);
      
      const response = await this.functions.createExecution(
        functionId,
        JSON.stringify(data || {}),
        false // Not async
      );

      console.log('✅ [Appwrite] Function executed successfully');
      return JSON.parse(response.response);
      
    } catch (error) {
      console.error('🚨 [Appwrite] Function execution failed:', error);
      throw error;
    }
  }

  /**
   * Health Check
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.account.get();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Configuration
   */
  getConfig() {
    return {
      endpoint: this.endpoint,
      projectId: this.projectId,
      databaseId: this.databaseId,
      collections: this.collectionsConfig
    };
  }

  /**
   * Cleanup
   */
  dispose(): void {
    // Clean up any active subscriptions or connections
    console.log('🧹 [Appwrite] Cleaning up client...');
  }
}

// Export singleton instance
export const appwriteClient = new AppwriteClient();