import WebSocket from 'ws';

// Conectamos al puerto donde está escuchando Octoarch
const ws = new WebSocket('ws://localhost:18789');

ws.on('open', () => {
    console.log('🔌 Conectado al cerebro (Puerto 18789)');
    
    // Le enviamos un comando real
    const payload = {
        type: 'agent:turn', 
        data: { message: 'Hola Octoarch. Analiza tu entorno y dime qué proyectos recuerdas de tu memoria.' }
    };
    
    console.log('📤 Enviando mensaje de prueba...');
    ws.send(JSON.stringify(payload));
});

ws.on('message', (data) => {
    const response = JSON.parse(data.toString());
    console.log('\n ================= RESPUESTA DE OCTOARCH =================');
    // Si la respuesta viene como texto directo o dentro de un objeto
    console.log(response.text || response.content || response); 
    console.log('============================================================\n');
    ws.close();
});

ws.on('error', (err) => {
    console.error('❌ Error de conexión:', err.message);
});