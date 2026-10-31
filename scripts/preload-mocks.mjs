import { readFile, writeFile } from 'node:fs/promises'
// The demo must wait for MSW; fetching its module in parallel avoids a late network waterfall.
const manifest = JSON.parse(await readFile('dist/.vite/manifest.json', 'utf8'))
const entry = manifest['src/mocks/browser.ts']
if (entry) {
  const html = await readFile('dist/index.html', 'utf8')
  await writeFile(
    'dist/index.html',
    html.replace(
      '</head>',
      `<link rel="modulepreload" href="/${entry.file}" />\n  </head>`,
    ),
  )
}
