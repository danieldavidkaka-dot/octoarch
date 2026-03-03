# 🛡️ Política de Seguridad de OctoArch

La seguridad de la información y la integridad de los sistemas empresariales son la máxima prioridad en el desarrollo de OctoArch. Nos tomamos muy en serio cualquier vulnerabilidad que pueda afectar el entorno local, la ejecución de herramientas o el procesamiento de datos.

## 📌 Versiones Soportadas

Actualmente, solo las versiones más recientes reciben parches de seguridad y actualizaciones de la arquitectura base.

| Versión | Soporte de Seguridad | Notas |
| :--- | :--- | :--- |
| **v4.8.x** | ✅ Soportada | Arquitectura actual con RBAC y FileValidator. |
| **v4.5.x** | ⚠️ Limitada | Solo parches críticos. |
| **< v4.4** | ❌ No Soportada | Por favor, actualiza a la v4.8+. |

## 🕵️‍♂️ Cómo Reportar una Vulnerabilidad

**Por favor, NO abras un "Issue" público para reportar un fallo de seguridad.** Hacerlo público antes de que exista un parche pone en riesgo a todos los usuarios de OctoArch.

Si descubres una vulnerabilidad (ej. un bypass en el sistema de roles RBAC, una inyección de comandos en la terminal, o un fallo en la validación de archivos forenses), repórtalo de manera privada:

1. **Vía GitHub:** Ve a la pestaña **Security** > **Advisories** y haz clic en "Report a vulnerability" (Reportar una vulnerabilidad) para crear un reporte privado.
2. **Vía Email:** Envía un correo directo al mantenedor principal del proyecto con los detalles técnicos y los pasos para reproducir el fallo.

### ⏱️ ¿Qué puedes esperar?
Nos comprometemos a investigar todos los reportes legítimos. Recibirás un acuse de recibo en un plazo de 48 horas, seguido de una evaluación técnica y un cronograma estimado para el lanzamiento del parche (Hotfix).

## 🧬 Alcance de la Seguridad (Scope)

Nuestro modelo de amenazas considera críticos los siguientes componentes:
* **AgentExecutor (RBAC):** Escalamiento de privilegios no autorizado (ej. Rol `CHAT` ejecutando comandos `DEV`).
* **FileValidator:** Evasión de escáner de "Magic Numbers" o inyección de malware disfrazado de imágenes/documentos.
* **Prompt Injection:** Intentos de forzar al LLM a revelar variables de entorno (`env.ts`) o credenciales (`tokens.json`).

Cualquier hallazgo en estas áreas será tratado con la máxima severidad. ¡Gracias por ayudarnos a mantener OctoArch como una fortaleza impenetrable! 🐙