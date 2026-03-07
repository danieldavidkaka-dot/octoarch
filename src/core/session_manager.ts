import { ConversationManager } from './conversation';
import { Logger } from '../utils/logger';
import { createClient, SupabaseClient } from '@supabase/supabase-js'; // 🐘 Importamos Supabase
import { env } from '../config/env'; // 🔐 Importamos las variables de entorno

export interface SessionData {
    manager: ConversationManager;
    lastActive: number;
}

export class SessionManager {
    private static instance: SessionManager | null = null;
    private sessions: Map<string, SessionData> = new Map();
    private readonly SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 horas

    // 🐘 Cliente de Supabase
    private supabase: SupabaseClient;

    private constructor() {
        // Inicializamos la conexión a la base de datos en cuanto el servidor arranca
        this.supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
        Logger.info('🐘 Conexión a Supabase (Memoria Infinita) inicializada.');
    }

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

    /**
     * 💾 NUEVO: Método asíncrono para guardar un mensaje en Supabase
     * No bloquea el hilo principal, así que OctoArch seguirá respondiendo rápido.
     */
    public async saveMessageToCloud(sessionId: string, role: 'user' | 'assistant', content: string, clientId: string = 'daniel_admin') {
        try {
            const { error } = await this.supabase
                .from('chat_memory')
                .insert([
                    {
                        client_id: clientId,
                        session_id: sessionId,
                        role: role,
                        content: content
                    }
                ]);

            if (error) {
                Logger.error(`❌ Error guardando memoria en Supabase: ${error.message}`);
            }
        } catch (err) {
            Logger.error(`❌ Error inesperado con Supabase: ${err}`);
        }
    }

    /**
     * ☁️ NUEVO: Recupera el historial de la nube y lo inyecta en la RAM
     */
    public async loadHistoryFromCloud(sessionId: string, manager: ConversationManager, clientId: string = 'daniel_admin') {
        // Si ya hay mensajes en RAM, no hacemos nada (la sesión ya estaba activa)
        if (manager.getHistory().length > 0) return;

        try {
            const { data, error } = await this.supabase
                .from('chat_memory')
                .select('*')
                .eq('session_id', sessionId)
                .eq('client_id', clientId)
                .order('created_at', { ascending: false }) // Traemos los más recientes
                .limit(manager.KEEP_RECENT); // Traemos exactamente los que caben en la RAM

            if (error) {
                Logger.error(`❌ Error leyendo Supabase: ${error.message}`);
                return;
            }

            if (data && data.length > 0) {
                // Supabase los devuelve del más nuevo al más viejo. 
                // Los invertimos (.reverse) para que la IA los lea en orden cronológico correcto.
                const cloudHistory = data.reverse().map(row => ({
                    // Convertimos 'assistant' de Supabase a 'model' para Gemini
                    role: (row.role === 'assistant' || row.role === 'model') ? 'model' : 'user', 
                    content: row.content,
                    timestamp: new Date(row.created_at).getTime()
                })) as any; // Se hace un type casting rápido para coincidir con la interfaz
                
                manager.loadHistory(cloudHistory);
                Logger.info(`☁️ Memoria restaurada de Supabase para ${sessionId} (${cloudHistory.length} msgs)`);
            }
        } catch (err) {
            Logger.error(`❌ Error inesperado con Supabase al leer: ${err}`);
        }
    }
}