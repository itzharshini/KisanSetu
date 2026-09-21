import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

function geminiMitraApiPlugin(): Plugin {
  return {
    name: 'gemini-mitra-api',
    configureServer(server) {
      server.middlewares.use('/api/mitra-chat', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end('Method Not Allowed');
          return;
        }

        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const payload = JSON.parse(body || '{}');
            const apiKey = process.env.GEMINI_API_KEY;

            if (!apiKey) {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, reason: 'NO_API_KEY' }));
              return;
            }

            // Lazy import @google/genai SDK
            const { GoogleGenAI } = await import('@google/genai');
            const ai = new GoogleGenAI({ apiKey });

            const targetLang =
              payload.language === 'ta'
                ? 'Tamil (தமிழ்)'
                : payload.language === 'hi'
                ? 'Hindi (हिन्दी)'
                : 'Indian English';

            const systemInstruction = `You are "KisanSetu Mitra", a warm, empathetic, and respectful rural agricultural procurement companion for Indian farmers.
Target Language: ${targetLang}.
CRITICAL OPERATIONAL RULES:
- Ground your response STRICTLY in the factual application data provided below. Do NOT hallucinate queue positions, tokens, or prices.
- Length: strictly 1 to 3 short, easy-to-read sentences.
- Avoid technical words (no "latency", "throughput", "utilization index", "algorithm").
- Use respectful greetings (e.g. "Vanakkam!", "Namaste!").
- If the farmer asks in Tamil (e.g. "என் slot எப்போது?"), reply in natural, clear Tamil.
- If the farmer asks in Hindi (e.g. "मेरा स्लॉट कब है?"), reply in natural, clear Hindi.

Real Operational State:
${JSON.stringify(payload.context || {}, null, 2)}`;

            const historyLines = (payload.history || []).map(
              (h: any) => `${h.role === 'user' ? 'Farmer' : 'Mitra'}: ${h.text}`
            );
            const userPrompt = [...historyLines, `Farmer: ${payload.query}`].join('\n');

            const response = await ai.models.generateContent({
              model: 'gemini-3.8-flash',
              contents: userPrompt,
              config: {
                systemInstruction,
                temperature: 0.3,
                maxOutputTokens: 220
              }
            });

            const replyText = response.text?.trim() || '';

            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                success: true,
                replyText,
                source: 'gemini',
                intent: payload.intent
              })
            );
          } catch (err: any) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: err?.message || 'Server error' }));
          }
        });
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), geminiMitraApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâ€”file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
