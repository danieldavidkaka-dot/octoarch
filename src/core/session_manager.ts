import { ConversationManager } from './conversation';
import { Logger } from '../utils/logger';

export interface SessionData {
    manager: ConversationManager;
    lastActive: number;
}

export class SessionManager {
    private static instance: SessionManager | null = null;
    private sessions: Map<string, SessionData> = new Map();
    private readonly SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 horas

    private constructor() {}

    public static getInstance(): SessionManager {
        if (!this.instance) {
            this.instance = new SessionManager();
        }
        return this.instance;
    }

    private cleanStaleSessions() {
        const now = Date.now();
        for (const [key, session] of this.sessions.entries()) {
            if (now - session.lastActive > this.SESSION_TTL_MS) {
                this.sessions.delete(key);
                Logger.info(`🧹 [Garbage Collector] Sesión expirada limpiada de RAM: ${key}`);
            }
        }
    }

    public getSession(sessionId: string): ConversationManager {
        this.cleanStaleSessions();
        
        if (!this.sessions.has(sessionId)) {
            this.sessions.set(sessionId, { manager: new ConversationManager(), lastActive: Date.now() });
            Logger.info(`🧠 Nueva sesión cognitiva creada para: ${sessionId}`);
        }
        
        const sessionData = this.sessions.get(sessionId)!;
        sessionData.lastActive = Date.now();
        return sessionData.manager;
    }
}