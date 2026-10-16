import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('.', import.meta.url))

// موقع متعدد الصفحات: لكل صفحة ملف HTML مستقل (/، /apply/، /about/، /contact/)،
// فتعمل المسارات على أي استضافة ثابتة دون إعدادات إعادة توجيه.
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: `${root}index.html`,
        apply: `${root}apply/index.html`,
        about: `${root}about/index.html`,
        contact: `${root}contact/index.html`,
      },
    },
  },
})
