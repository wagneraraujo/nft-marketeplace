import { readFile, writeFile } from 'node:fs/promises'

// MSW starts before React. Preload its static dependencies and the initial public
// route in parallel, while keeping requests/fixtures inside the mock boundary.
const manifest = JSON.parse(await readFile('dist/.vite/manifest.json', 'utf8'))
let html = await readFile('dist/index.html', 'utf8')
const discovered = new Set(
  [...html.matchAll(/(?:href|src)="\/([^"]+)"/g)].map((match) => match[1]),
)
function dependencies(key, files = new Set()) {
  const entry = manifest[key]
  if (!entry || files.has(entry.file)) return files
  files.add(entry.file)
  for (const imported of entry.imports ?? []) dependencies(imported, files)
  return files
}
const mockFiles = [...dependencies('src/mocks/browser.ts')].filter(
  (file) => file.endsWith('.js') && !discovered.has(file),
)
for (const file of mockFiles) discovered.add(file)
const routeFiles = (key) =>
  [...dependencies(key)].filter(
    (file) => file.endsWith('.js') && !discovered.has(file),
  )
const home = routeFiles('src/routes/index.tsx?tsr-split=component')
const detail = routeFiles('src/routes/nfts.$id.tsx?tsr-split=component')
const links = mockFiles
  .map((file) => `<link rel="modulepreload" href="/${file}" />`)
  .join('\n')
const routePreload = `<script>
(() => {
  const path = location.pathname;
  if (['/', '/login', '/register'].includes(path)) {
    for (const [href, media] of [['/figma/f545d.svg', '(max-width: 700px)'], ['/figma/dc76c.svg', '(min-width: 701px)']]) {
      const image = document.createElement('link');
      image.rel = 'preload'; image.as = 'image'; image.href = href; image.media = media;
      document.head.append(image);
    }
    const portrait = document.createElement('link');
    portrait.rel = 'preload'; portrait.as = 'image'; portrait.fetchPriority = 'high';
    portrait.imageSrcset = [320,640,960,1254].map(width => '/figma/responsive/8f387-' + width + '.webp ' + width + 'w').join(', ');
    portrait.imageSizes = '(max-width: 700px) 138px, (max-width: 1100px) 45vw, 450px';
    document.head.append(portrait);
  }
  const files = ['/', '/login', '/register'].includes(path) ? ${JSON.stringify(home)} : /^\\/nfts\\/[^/]+$/.test(path) ? ${JSON.stringify(detail)} : [];
  for (const file of files) {
    const link = document.createElement('link');
    link.rel = 'modulepreload'; link.crossOrigin = 'anonymous'; link.href = '/' + file;
    document.head.append(link);
  }
})();
</script>`
html = html.replace('</head>', `${links}\n${routePreload}\n</head>`)
await writeFile('dist/index.html', html)
