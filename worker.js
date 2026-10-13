// Cloudflare Worker proxy for /api/xtream
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

    // Intercept /api/xtream
    if (url.pathname === '/api/xtream') {
      const defaultDns = env?.VITE_XTREAM_DNS || 'http://dgaura.top';
      const cleanDns = defaultDns.replace(/\/+$/, '');
      const targetUrl = new URL(`${cleanDns}/player_api.php`);

      // Forward all query parameters
      for (const [key, value] of url.searchParams.entries()) {
        targetUrl.searchParams.set(key, value);
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
            dns: cleanDns,
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
