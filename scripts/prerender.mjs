// يولّد HTML الصفحات مسبقًا بعد البناء، فيظهر المحتوى قبل تحميل JavaScript
// ويبقى مقروءًا لمحركات البحث. ثم يحذف حزمة الخادم المؤقتة.
import { readFile, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const { pages } = await import(pathToFileURL(`${root}.ssr/entry-server.js`).href)

for (const [file, render] of Object.entries(pages)) {
  const path = `${root}dist/${file}`
  const html = await readFile(path, 'utf8')
  if (!html.includes('<!--app-->')) throw new Error(`Missing <!--app--> placeholder in ${file}`)
  await writeFile(path, html.replace('<!--app-->', render()))
  console.log(`prerendered ${file}`)
}

await rm(`${root}.ssr`, { recursive: true, force: true })
