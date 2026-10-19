# BIGBROTHER

Dashboard local de búsqueda con frontend Pulso. Usa extractos y fuentes enlazadas, sin modelos ni API de IA de pago. Algunos canales sociales requieren sesión local de Chrome.

## Ejecutar

Requiere Python 3.10 o posterior y Node.js 20.19+ (o 22.12+). YouTube usa `yt-dlp`, instalado en el mismo intérprete que ejecuta el servidor:

```powershell
py -3 -m pip install yt-dlp
```

```powershell
$python = Join-Path $env:USERPROFILE '.agent-reach-venv\Scripts\python.exe'
& $python -m pip install yt-dlp
Push-Location .\frontend
npm install
npm run build
Pop-Location
& $python .\server.py
```

Abre `http://127.0.0.1:8765`. El servidor sirve `frontend/dist` si ya fue compilado; para desarrollo, ejecuta también `npm run dev` desde `frontend` y abre `http://127.0.0.1:3000`. Detén cada proceso con `Ctrl+C` en su terminal.

## Fuentes

- Google News RSS: noticias y publicaciones recientes.
- Hacker News Algolia Search API: artículos compartidos en su comunidad tecnológica.
- Wikipedia en español: referencias enciclopédicas.
- YouTube mediante yt-dlp: búsqueda pública de videos, sin descargar los videos.
- Resumen de YouTube: extrae subtítulos públicos en español (o inglés como respaldo), limpia el VTT y selecciona fragmentos localmente; no usa transcripción de pago. Solo funciona si el video tiene subtítulos disponibles.
- Bilibili: búsqueda pública de videos, con relevancia dependiente del idioma y la región.
- Instagram Explore mediante OpenCLI: muestra el Explore personalizado de la cuenta en la sesión existente de Chrome; no es una clasificación de tendencias global.
- Reddit mediante OpenCLI: búsqueda de publicaciones, reutilizando una sesión de Chrome ya iniciada en Reddit.
- X/Twitter mediante twitter-cli/OpenCLI, Facebook mediante OpenCLI y XiaoHongShu mediante OpenCLI cuando Doctor detecta el backend disponible y la sesión correspondiente.

Las fuentes se consultan en paralelo y pueden fallar o limitar solicitudes de forma independiente. Ningún buscador cubre todo internet; los resultados son una muestra de estas fuentes abiertas.

El resumen selecciona fragmentos de los resultados. Las palabras clave, años, porcentajes y cantidades se extraen localmente con reglas simples; no se generan hechos y conviene verificar cifras en la fuente original. La búsqueda se envía a los proveedores públicos para obtener resultados. El dashboard no guarda historial ni envía datos a un modelo.

Instagram, Reddit, Facebook, X y XiaoHongShu permanecen condicionados a lo que indique `agent-reach doctor --json`. OpenCLI requiere extensión de Chrome y sesión iniciada manualmente. El dashboard nunca inicia sesión ni extrae cookies. YouTube funciona con metadatos públicos; los subtítulos y el resumen se obtienen a petición.

## GitHub Pages

La acción de `.github/workflows/pages.yml` publica la interfaz desde `main` en `https://martin-lopez25.github.io/bigbrother/`. GitHub Pages solo aloja archivos estáticos: las búsquedas y los resúmenes requieren el servidor Python ejecutándose localmente con Agent Reach instalado. La página pública no puede acceder por sí sola a la sesión de Chrome ni al daemon OpenCLI.