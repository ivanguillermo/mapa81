# Mapa 81 — PWA inicial

PWA para organizar un objetivo central, ocho subplanes y 64 casillas.

## Incluye
- Crear/editar título del proyecto, término central y descripción.
- Ocho subplanes con título y descripción; ocho casillas por subplan.
- Edición de casillas, descripciones y estado completado.
- Guardado automático local con `localStorage`.
- Mapa visual completo y progreso de 64 casillas.
- Exportación del mapa a PNG.
- Exportación a PDF mediante la función de impresión del navegador: selecciona “Guardar como PDF”.
- Manifiesto, service worker y sugerencias opcionales con Gemini.

## Ejecutar
Necesitas Node.js 20 o superior.
1. En esta carpeta, ejecuta `npm install`.
2. Copia `.env.example` a `.env`.
3. Coloca tu clave en `GEMINI_API_KEY` dentro de `.env`.
4. Ejecuta `npm start`.
5. Abre http://localhost:3000

Sin clave, el editor funciona; solo las sugerencias de IA estarán deshabilitadas.

## Seguridad y publicación
No incluyas la clave API en `app.js`, HTML ni archivos publicados. `.env` es privado y no debe subirse a GitHub. GitHub Pages solo sirve archivos estáticos y no ejecuta `server.js`. Para tener IA online, despliega el servidor Node en un hosting backend, configura `GEMINI_API_KEY` como variable de entorno y cambia en `app.js` la ruta `/api/suggest` por la URL HTTPS del backend si está en otro dominio. En ese caso también configura CORS para permitir únicamente el origen de tu PWA.

Antes de abrir la app al público, añade límites de uso y controles contra abuso de la API.

## Limitaciones del prototipo
- Un proyecto guardado por navegador; borrar sus datos puede eliminarlo.
- Sin cuentas, sincronización ni importar/exportar proyectos en JSON.
- El PDF usa la ventana de impresión.
- La instalación PWA requiere HTTPS o localhost.
- Incluye un endpoint Gemini básico; antes de un despliegue público conviene añadir validación más estricta, CORS, límites de peticiones y manejo de cuotas.
