export interface Message {
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: number;
}

export class ConversationManager {
  private history: Message[] = [];
  private rollingSummary: string = ""; 
  
  public readonly MAX_HISTORY = 20; 
  public readonly KEEP_RECENT = 8;  

  add(role: 'user' | 'model' | 'system', content: string) {
    this.history.push({
      role,
      content,
      timestamp: Date.now()
    });
  }

  // ☁️ NUEVO: Método para inyectar la memoria desde Supabase
  loadHistory(messages: Message[]) {
    // Solo inyectamos si la RAM está vacía, para no duplicar mensajes
    if (this.history.length === 0) {
        this.history = messages;
    }
  }

  needsCompression(): boolean {
    return this.history.length > this.MAX_HISTORY;
  }

  getMessagesToCompress(): Message[] {
    return this.history.slice(0, this.history.length - this.KEEP_RECENT);
  }

  applyCompression(newSummary: string) {
    this.rollingSummary = newSummary;
    this.history = this.history.slice(this.history.length - this.KEEP_RECENT);
  }

  getHistory(): Message[] {
    const fullHistory: Message[] = [];
    
    if (this.rollingSummary !== "") {
        fullHistory.push({
            role: 'user',
            content: `[MEMORIA A CORTO PLAZO - RESUMEN DE LA CONVERSACIÓN ANTERIOR]:\n${this.rollingSummary}`,
            timestamp: 0
        });
        fullHistory.push({
            role: 'model',
            content: `Entendido. Mantendré este contexto previo en mente para continuar la conversación.`,
            timestamp: 1
        });
    }
    
    return fullHistory.concat(this.history);
  }

  clear() {
    this.history = [];
    this.rollingSummary = "";
  }
  
  getLastUserMessage(): string | undefined {
    const userMsgs = this.history.filter(m => m.role === 'user');
    return userMsgs[userMsgs.length - 1]?.content;
  }
}