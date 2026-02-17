// src/utils/i18n.ts
// ESTA ES LA VERSIÓN "SALVAVIDAS" - SIN LÓGICA, SOLO TEXTO

// 1. Definimos los textos en Español (Hardcoded)
const translations = {
  nav: { capabilities: 'Capacidades', architecture: 'Arquitectura', benchmarks: 'Métricas', terminal: 'Terminal', access: 'Acceso', api_key: 'CLAVE_API' },
  hero: { system_online: 'SISTEMA_V3.0_ONLINE', title_suffix: 'ARCH', subtitle: 'La primera Mente Colmena Autónoma diseñada para autorreplicar software.', establishing: 'Estableciendo enlace...', button_init: 'INICIAR', button_manifesto: 'LEER', cam_feed: 'CAM_04', live: 'VIVO' },
  quickstart: { title: 'Inicialización', subtitle: 'Despliega el kernel en segundos.' },
  testimonials: { title: 'Feedback' },
  capabilities: { label: 'MODULOS', title_core: 'Capacidades', title_suffix: 'Centrales', modules_loaded: 'CARGADOS: 6/6', status: 'ESTADO: OPTIMO' },
  architecture: { label: '// Arquitectura', title_swarm: 'Inteligencia', title_intelligence: 'de Enjambre', description: '> OctoArch opera como una mente descentralizada.', layer1: 'Capa 1', layer2: 'Capa 2', layer3: 'Capa 3' },
  benchmarks: { title: 'Métricas', subtitle: '// Dataset: SWE-bench (2026)', metric: 'Éxito', chart_title: 'Visualización' },
  terminal: { 
    title: 'Interfaz de Comando', 
    subtitle: 'Interacción directa con el Kernel OctoArch',
    init: 'Kernel OctoArch v2.4.0 inicializado',
    secure: 'Conexión segura: 192.168.x.x',
    help_prompt: 'Escribe "help" para ver comandos.',
    cmd_help: 'Comandos: [deploy] [status] [clear] [audit]',
    cmd_deploy_init: 'Iniciando despliegue...',
    cmd_deploy_alloc: 'Asignando nodos...',
    cmd_deploy_success: 'Éxito. Hash: #9A2F',
    cmd_status_nominal: 'SISTEMA: NOMINAL',
    cmd_status_stats: 'CPU: 34% | RAM: 12GB',
    cmd_audit_scan: 'Escaneando...',
    cmd_audit_clean: 'Limpio.',
    cmd_whoami: 'root@octoarch',
    cmd_error_sudo: 'Permiso denegado.',
    cmd_not_found: 'comando no encontrado'
  },
  pricing: { title: 'Planes', subtitle: '// Recursos escalables', plan_dev: 'Dev', plan_startup: 'Startup', plan_enterprise: 'Empresa', cta_start: 'Empezar', cta_deploy: 'Desplegar', cta_contact: 'Ventas' }
};

// 2. Exportamos 't' directamente para quien lo importe como { t }
export const t = translations;

// 3. Exportamos el hook falso para quien lo use como const { t } = useLanguage()
export const useLanguage = () => {
  return { t: translations };
};

// 4. Exportamos un Provider falso por si acaso App.tsx lo está buscando
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};
import React from 'react';