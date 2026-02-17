import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../../utils/i18n';

// Definición de tipos para los mensajes
export interface Log {
  id: number;
  text: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  sender: 'user' | 'system';
  timestamp: string;
}

export const useTerminal = () => {
  const { t } = useLanguage();
  
  // --- ESTADOS ---
  const [input, setInput] = useState('');
  const [logs, setLogs] = useState<Log[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  // Historial de comandos (para flecha arriba/abajo)
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Referencias para WebSocket y Timers
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Generador de hora actual HH:MM:SS
  const getTimestamp = () => {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
  };

  // Simulación de escritura (Efecto Matrix) para respuestas
  const simulateTyping = useCallback(async (text: string, type: Log['type'] = 'info') => {
    setIsTyping(true);
    // Delay dinámico: más texto = más tiempo (pero con tope)
    const delay = Math.min(text.length * 2 + 50, 800); 
    await new Promise(r => setTimeout(r, delay));
    
    setLogs(prev => [...prev, { 
      id: Date.now(), 
      text, 
      type, 
      sender: 'system', 
      timestamp: getTimestamp() 
    }]);
    setIsTyping(false);
  }, []);

  // --- 🔗 CONEXIÓN WEBSOCKET (HYDRA LINK) ---
  const connectToBrain = useCallback(() => {
    // Evitar conectar si ya estamos conectados
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    // Intentar conectar al puerto del backend
    const ws = new WebSocket('ws://localhost:18789');

    ws.onopen = () => {
      console.log('🟢 [FRONTEND] Conectado al Cerebro (Puerto 18789)');
      setIsConnected(true);
      
      // Mensaje inicial de sistema
      setLogs(prev => [...prev, { 
        id: Date.now(), 
        text: '🟢 SYSTEM ONLINE: Uplink established with Neural Core [Port: 18789]', 
        type: 'system', // Usa el color Cyan que definimos
        sender: 'system', 
        timestamp: getTimestamp() 
      }]);
    };

    ws.onmessage = async (event) => {
      try {
        const response = JSON.parse(event.data);
        
        if (response.type === 'response') {
          // Respuesta normal de la IA
          await simulateTyping(response.content, 'info');
        } else if (response.type === 'error') {
          // Error reportado por el backend
          await simulateTyping(`❌ KERNEL ERROR: ${response.content}`, 'error');
        }
      } catch (e) {
        // Si no es JSON válido
        console.log('Mensaje crudo:', event.data);
      }
    };

    ws.onclose = () => {
      console.log('🔴 [FRONTEND] Desconectado');
      setIsConnected(false);
      wsRef.current = null;
      
      // Reintentar conexión automáticamente en 3 segundos
      reconnectTimeoutRef.current = setTimeout(connectToBrain, 3000);
    };

    ws.onerror = (err) => {
      // Los errores de conexión se manejan en onclose
      if (wsRef.current) wsRef.current.close();
    };

    wsRef.current = ws;
  }, [simulateTyping]);

  // Iniciar conexión al cargar la página
  useEffect(() => {
    connectToBrain();
    
    // Limpieza al salir de la página
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, [connectToBrain]);

  // --- 🎮 MANEJO DE COMANDOS ---
  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const cmd = input.trim();
    
    // 1. Mostrar lo que el usuario escribió
    setLogs(prev => [...prev, { 
      id: Date.now(), 
      text: cmd, 
      type: 'info', 
      sender: 'user', 
      timestamp: getTimestamp() 
    }]);

    // 2. Guardar en historial y limpiar input
    setHistory(prev => [...prev, cmd]);
    setHistoryIndex(-1);
    setInput('');

    // --- COMANDOS LOCALES (Funcionan sin internet) ---
    if (cmd.toLowerCase() === 'clear') {
      setLogs([]);
      return;
    }
    if (cmd.toLowerCase() === 'help') {
      await simulateTyping('AVAILABLE COMMANDS: deploy, status, clear, whoami, <prompt>', 'warning');
      return;
    }

    // --- ENVÍO AL CEREBRO ---
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      // Enviamos el mensaje estructurado
      wsRef.current.send(JSON.stringify({ 
        type: 'agent:turn', 
        data: { message: cmd } 
      }));
    } else {
      // Fallback si el backend está apagado
      await simulateTyping('⚠️ CONNECTION ERROR: Neural Core offline. Run "npm run dev" in backend.', 'error');
    }
  };

  // --- NAVEGACIÓN HISTORIAL (Flechas) ---
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex = historyIndex + 1;
        if (newIndex < history.length) {
            setHistoryIndex(newIndex);
            setInput(history[history.length - 1 - newIndex]);
        }
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  return {
    input, setInput,
    logs, setLogs,
    isConnected,
    isTyping,
    handleCommand,
    handleKeyDown
  };
};