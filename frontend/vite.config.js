import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'

export default defineConfig(({ mode }) => {
    // Загружаем переменные окружения
    const env = loadEnv(mode, process.cwd(), '')

    return {
        plugins: [react(), tailwindcss()],
        server: {
            https: {
                key: fs.readFileSync(env.VITE_SSL_KEY),
                cert: fs.readFileSync(env.VITE_SSL_CERT)
            },
            host: true,
            port: 5173
        }
    }
})
