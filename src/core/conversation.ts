export interface Message {
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: number;
}

export class ConversationManager {
  private history: Message[] = [];
  private readonly MAX_HISTORY = 20; // Límite de mensajes para no saturar

  add(role: 'user' | 'model' | 'system', content: string) {
    this.history.push({
      role,
      content,
      timestamp: Date.now()
    });

    // Poda automática si excede el límite
    if (this.history.length > this.MAX_HISTORY) {
      // Mantenemos el mensaje de sistema (índice 0) y borramos los antiguos
      const systemMsg = this.history[0];
      const recent = this.history.slice(this.history.length - (this.MAX_HISTORY - 1));
      this.history = [systemMsg, ...recent];
    }
  }

  getHistory(): Message[] {
    return this.history;
  }

  clear() {
    this.history = [];
  }
  
  getLastUserMessage(): string | undefined {
    const userMsgs = this.history.filter(m => m.role === 'user');
    return userMsgs[userMsgs.length - 1]?.content;
  }
}