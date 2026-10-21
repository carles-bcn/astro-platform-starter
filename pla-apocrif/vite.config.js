import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const apiPort = Number(process.env.PORT) || 3001;

export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        host: '127.0.0.1',
        port: 5173,
        // La clau només viu al servidor Express: el navegador parla amb /api.
        proxy: { '/api': `http://127.0.0.1:${apiPort}` }
    }
});
