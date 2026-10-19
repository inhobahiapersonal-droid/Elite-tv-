// Cloudflare Worker proxy for /api/xtream and /api/xtream/test
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': '*',
        },
      });
    }

    // Resolve target DNS from header, query param, or env fallback
    const targetDns = (
      request.headers.get('x-xtream-dns') ||
      url.searchParams.get('dns') ||
      env?.XTREAM_DNS ||
      ''
    ).trim().replace(/\/+$/, '');

    // Endpoint: /api/xtream/test
    if (url.pathname === '/api/xtream/test') {
      if (!targetDns) {
        return new Response(
          JSON.stringify({
            online: false,
            error: 'Nenhum DNS Xtream informado. Configure seu DNS Xtream no painel da Elite TV.',
          }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      }

      const validUrl = targetDns.startsWith('http://') || targetDns.startsWith('https://')
        ? targetDns
        : `http://${targetDns}`;

      const pingUrl = new URL(`${validUrl}/player_api.php`);
      const startTime = Date.now();

      try {
        const response = await fetch(pingUrl.toString(), {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
          },
        });

        const latency = Date.now() - startTime;
        return new Response(
          JSON.stringify({
            online: true,
            latency,
            dns: targetDns,
            status: response.status,
            message: `DNS online e respondendo (${latency}ms)`,
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({
            online: false,
            dns: targetDns,
            error: err?.message || 'Falha ao conectar com o servidor Xtream',
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      }
    }

    // Intercept /api/xtream
    if (url.pathname === '/api/xtream') {
      if (!targetDns) {
        return new Response(
          JSON.stringify({
            error: 'No DNS configured',
            message: 'Configure seu DNS Xtream no painel da Elite TV.',
          }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      }

      const validUrl = targetDns.startsWith('http://') || targetDns.startsWith('https://')
        ? targetDns
        : `http://${targetDns}`;

      const targetUrl = new URL(`${validUrl}/player_api.php`);

      // Forward query parameters except internal 'dns'
      for (const [key, value] of url.searchParams.entries()) {
        if (key !== 'dns') {
          targetUrl.searchParams.set(key, value);
        }
      }

      try {
        const response = await fetch(targetUrl.toString(), {
          method: request.method,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
          },
        });

        const newHeaders = new Headers(response.headers);
        newHeaders.set('Access-Control-Allow-Origin', '*');
        newHeaders.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        newHeaders.set('Access-Control-Allow-Headers', '*');

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders,
        });
      } catch (err) {
        return new Response(
          JSON.stringify({
            error: 'Worker Proxy Error',
            message: err?.message || 'Falha ao conectar com o servidor Xtream',
            dns: targetDns,
          }),
          {
            status: 502,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      }
    }

    return new Response('Not found', { status: 404 });
  },
};
