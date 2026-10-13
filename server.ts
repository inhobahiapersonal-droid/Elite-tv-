import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const DEFAULT_XTREAM_DNS = process.env.VITE_XTREAM_DNS || 'http://dgaura.top';
  const targetDns = (process.env.VITE_XTREAM_DNS || DEFAULT_XTREAM_DNS).replace(/\/+$/, '');

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Global CORS middleware for API endpoints
  app.use((req: Request, res: Response, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', '*');
    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }
    next();
  });

  // Proxy endpoint: /api/xtream -> http://dgaura.top/player_api.php
  app.all('/api/xtream', async (req: Request, res: Response) => {
    try {
      // Build player_api.php target URL
      const currentDns = (process.env.VITE_XTREAM_DNS || targetDns).replace(/\/+$/, '');
      const targetUrl = new URL(`${currentDns}/player_api.php`);

      // Forward all query parameters (e.g. username, password, action)
      const combinedParams: Record<string, any> = { ...req.query, ...req.body };
      for (const [key, val] of Object.entries(combinedParams)) {
        if (val !== undefined && val !== null) {
          targetUrl.searchParams.set(key, String(val));
        }
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(targetUrl.toString(), {
        method: req.method === 'POST' ? 'POST' : 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const contentType = response.headers.get('content-type') || 'application/json';
      const text = await response.text();

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', '*');
      res.setHeader('Content-Type', contentType);
      return res.status(response.status).send(text);
    } catch (err: any) {
      console.error('Erro no proxy /api/xtream:', err?.message || err);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', '*');
      return res.status(502).json({
        error: 'Proxy Error',
        message: err?.message || 'Falha ao conectar com o servidor Xtream',
        dns: targetDns,
      });
    }
  });

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Development mode: Vite middleware handles client app
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve built static files
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT} (DNS: ${targetDns})`);
  });
}

startServer();
