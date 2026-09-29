import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { cloudflare } from '@cloudflare/vite-plugin'

// https://vite.dev/config/
// 로컬 개발은 기본적으로 Cloudflare 계정 없이 동작합니다 (AI 질문창은 로컬에서 응답하지 않음).
// AI까지 실제로 확인하려면: CF_REMOTE=1 npm run dev  (wrangler login + workers.dev 서브도메인 필요)
export default defineConfig({
  plugins: [react(), cloudflare({ remoteBindings: process.env.CF_REMOTE === '1' })],
})
