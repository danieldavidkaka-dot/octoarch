export interface Message {
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: number;
}

export class ConversationManager {
  private history: Message[] = [];
  private rollingSummary: string = ""; // 🧠 Nuevo: Memoria comprimida
  
  private readonly MAX_HISTORY = 20; // Cuándo disparamos la compresión
  private readonly KEEP_RECENT = 8;  // Cuántos mensajes intactos dejamos

  add(role: 'user' | 'model' | 'system', content: string) {
    this.history.push({
      role,
      content,
      timestamp: Date.now()
    });
  }

  // 🛡️ Verifica si el historial alcanzó el punto crítico
  needsCompression(): boolean {
    return this.history.length > this.MAX_HISTORY;
  }

  // 🛡️ Extrae los mensajes viejos que deben ser resumidos
  getMessagesToCompress(): Message[] {
    return this.history.slice(0, this.history.length - this.KEEP_RECENT);
  }

  // 🛡️ Aplica el resumen y recorta los mensajes viejos
  applyCompression(newSummary: string) {
    this.rollingSummary = newSummary;
    this.history = this.history.slice(this.history.length - this.KEEP_RECENT);
  }

  getHistory(): Message[] {
    const fullHistory: Message[] = [];
    
    // Si existe un resumen, lo inyectamos asegurando la alternancia de roles para Gemini
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