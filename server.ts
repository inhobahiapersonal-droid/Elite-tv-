import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory fallback for Xtream DNS configuration on the server
let serverXtreamDns: string = '';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

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

  // Settings endpoint: get or set Xtream DNS configured from Admin panel
  app.get('/api/settings/dns', (_req: Request, res: Response) => {
    return res.json({ dns: serverXtreamDns });
  });

  app.post('/api/settings/dns', (req: Request, res: Response) => {
    const rawDns = req.body?.dns || '';
    serverXtreamDns = String(rawDns).trim().replace(/\/+$/, '');
    return res.json({ success: true, dns: serverXtreamDns });
  });

  // Connection test endpoint for validating if DNS is reachable
  app.all('/api/xtream/test', async (req: Request, res: Response) => {
    try {
      const targetDns = (
        (req.headers['x-xtream-dns'] as string) ||
        (req.query.dns as string) ||
        req.body?.dns ||
        serverXtreamDns ||
        ''
      ).trim().replace(/\/+$/, '');

      if (!targetDns) {
        return res.status(400).json({
          online: false,
          error: 'Nenhum DNS Xtream informado. Configure seu DNS Xtream no painel da Elite TV.'
        });
      }

      // Ensure valid URL scheme
      const validUrlStr = targetDns.startsWith('http://') || targetDns.startsWith('https://')
        ? targetDns
        : `http://${targetDns}`;

      const pingUrl = new URL(`${validUrlStr}/player_api.php`);
      const startTime = Date.now();

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(pingUrl.toString(), {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*'
        },
        signal: controller.signal
      });

      clearTimeout(timeout);
      const latency = Date.now() - startTime;

      return res.json({
        online: true,
        latency,
        dns: targetDns,
        status: response.status,
        message: `DNS online e respondendo (${latency}ms)`
      });
    } catch (err: any) {
      return res.json({
        online: false,
        error: err?.name === 'AbortError'
          ? 'Tempo limite de resposta excedido (timeout 6s). Verifique a porta do servidor.'
          : (err?.message || 'Falha ao conectar com o servidor Xtream')
      });
    }
  });

  // Proxy endpoint: /api/xtream -> forwards to configured target DNS/player_api.php
  app.all('/api/xtream', async (req: Request, res: Response) => {
    try {
      // Resolve target DNS from request header, query param, body, or server config
      const headerDns = req.headers['x-xtream-dns'] as string;
      const queryDns = req.query.dns as string;
      const bodyDns = req.body?.dns as string;
      const rawTarget = (headerDns || queryDns || bodyDns || serverXtreamDns || '').trim().replace(/\/+$/, '');

      if (!rawTarget) {
        return res.status(400).json({
          error: 'No DNS configured',
          message: 'Configure seu DNS Xtream no painel de administração da Elite TV.'
        });
      }

      const validTarget = rawTarget.startsWith('http://') || rawTarget.startsWith('https://')
        ? rawTarget
        : `http://${rawTarget}`;

      const targetUrl = new URL(`${validTarget}/player_api.php`);

      // Forward parameters, skipping internal 'dns' control param
      const combinedParams: Record<string, any> = { ...req.query, ...req.body };
      delete combinedParams.dns;

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
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
