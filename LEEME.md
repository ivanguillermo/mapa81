# Corrección de Mapa 81: tablero 9×9

Estos son los tres archivos que debes reemplazar en la raíz de tu repositorio `ivanguillermo/mapa81`:

- `app.js`: genera las 81 celdas, coloca el objetivo en E5, refleja los ocho subplanes en el bloque central y muestra las 64 tareas en los ocho bloques exteriores. Los clics sobre una tarea abren el subplan y la tarea correspondiente.
- `styles.css`: presenta la cuadrícula real de 9×9 con desplazamiento horizontal en pantallas pequeñas.
- `sw.js`: cambia la versión de caché para que GitHub Pages deje de servir la versión anterior.

No reemplaces `index.html` ni los demás archivos.

## Cómo aplicar el cambio desde GitHub en el navegador

Para cada archivo (`app.js`, `styles.css`, `sw.js`):
1. Abre `https://github.com/ivanguillermo/mapa81`.
2. Haz clic en el archivo y luego en el icono del lápiz (**Edit this file**).
3. Abre el archivo correspondiente de esta carpeta en un editor de texto, selecciona todo y copia.
4. En el editor de GitHub, selecciona todo el contenido anterior y pega el nuevo.
5. Pulsa **Commit changes** para guardar.
6. Repite con los otros dos archivos.

Cuando hayas guardado los tres, abre `https://ivanguillermo.github.io/mapa81/` y haz una recarga forzada (`Ctrl+Shift+R`). Si la cuadrícula aún no cambia, cierra la pestaña y vuelve a abrir la página después de unos segundos.

Los datos guardados en `localStorage` conservan el formato anterior, así que los proyectos existentes deberían seguir apareciendo. Como precaución, antes de probar puedes exportar el PDF del proyecto actual.
