<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# BIGBROTHER frontend

Interfaz React/Vite de Agent Reach Dashboard. Consume la API local de Python que sirve `../server.py`; no usa Gemini ni requiere claves de IA.

## Desarrollo

1. En una terminal, inicia el backend desde `dashboard`:

   ```powershell
   $python = Join-Path $env:USERPROFILE '.agent-reach-venv\Scripts\python.exe'
   & $python .\server.py
   ```

2. En otra terminal, desde `dashboard\frontend`, instala dependencias una vez y levanta Vite:

   ```powershell
   npm install
   npm run dev
   ```

   Abre `http://127.0.0.1:3000`. Vite reenvía `/api` al backend en `127.0.0.1:8765`.

## Producción local

```powershell
npm run build
```

El servidor Python sirve `dist` automáticamente cuando existe. Abre `http://127.0.0.1:8765`.
