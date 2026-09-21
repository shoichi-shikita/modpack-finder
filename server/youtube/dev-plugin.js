import { handleYouTube } from './handler.js';

// The same Request/Response handler as Pages Functions; no second backend to deploy.
export function youtubeDevPlugin(env) {
  return { name: 'youtube-api', configureServer(server) {
    server.middlewares.use('/api/youtube', async (req, res) => {
      const chunks = []; let size = 0;
      for await (const chunk of req) { size += chunk.length; if (size > 16000) { res.writeHead(413); res.end(); return; } chunks.push(chunk); }
      const controller = new AbortController();
      res.on('close', () => controller.abort());
      const request = new Request(`http://${req.headers.host}/api/youtube`, { method: req.method, headers: req.headers, signal: controller.signal, ...(req.method !== 'GET' && req.method !== 'HEAD' ? { body: Buffer.concat(chunks) } : {}) });
      const result = await handleYouTube(request, env);
      res.writeHead(result.status, Object.fromEntries(result.headers)); res.end(await result.text());
    });
  } };
}
