import WebSocket from 'ws';
import readline from 'readline';

const WS_URL = 'ws://localhost:18789';
let ws: WebSocket | null = null;
let reconnectInterval = 1000;
const MAX_RECONNECT_INTERVAL = 30000;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function connect() {
    ws = new WebSocket(WS_URL);

    ws.on('open', () => {
        console.log('\n🟢 CONECTADO A OCTOARCH V3.0');
        reconnectInterval = 1000; // Reset timer
        promptUser();
    });

    ws.on('message', (data) => {
        try {
            const response = JSON.parse(data.toString());
            if (response.type === 'response') {
                console.log('\n OCTOARCH:');
                console.log(response.content);
                console.log('──────────────────────────────────────────────────');
                promptUser();
            } else if (response.type === 'error') {
                console.error('\n❌ ERROR REMOTO:', response.content);
                promptUser();
            }
        } catch (e) {
            console.log('\n📩 MENSAJE RAW:', data.toString());
            promptUser();
        }
    });

    ws.on('error', (err) => {
        // Silenciar errores de conexión para no ensuciar la consola en reintentos
    });

    ws.on('close', () => {
        console.log(`\n🔴 Desconectado. Reintentando en ${reconnectInterval/1000}s...`);
        setTimeout(connect, reconnectInterval);
        reconnectInterval = Math.min(reconnectInterval * 2, MAX_RECONNECT_INTERVAL);
    });
}

function promptUser() {
    rl.question('tú > ', (input) => {
        if (!input.trim()) {
            promptUser();
            return;
        }
        if (input.toLowerCase() === 'salir') {
            process.exit(0);
        }
        
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'agent:turn', data: { message: input } }));
        } else {
            console.log('⚠️ Esperando conexión...');
            promptUser();
        }
    });
}

// Iniciar
console.log('🚀 Iniciando Cliente Octoarch...');
connect();