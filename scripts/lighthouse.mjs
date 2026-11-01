import lighthouse from 'lighthouse'
import { launch } from 'chrome-launcher'
import { chromium } from '@playwright/test'
import { mkdir, writeFile, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { createHash } from 'node:crypto'
const origin = process.env.AUDIT_URL ?? 'http://127.0.0.1:4173'
const output = resolve(process.env.AUDIT_OUTPUT ?? 'lighthouse/reports')
const pages = [
  ['home', '/'],
  ['detail', '/nfts/nft-1'],
]
const profiles = ['mobile', 'desktop']
if (
  process.env.AUDIT_PAGE &&
  !pages.some(([name]) => name === process.env.AUDIT_PAGE)
)
  throw new Error('AUDIT_PAGE must be home or detail')
if (process.env.AUDIT_PROFILE && !profiles.includes(process.env.AUDIT_PROFILE))
  throw new Error('AUDIT_PROFILE must be mobile or desktop')
await mkdir(output, { recursive: true })
const buildManifestSha256 = createHash('sha256')
  .update(await readFile('dist/.vite/manifest.json'))
  .digest('hex')
const results = []
for (const [name, path] of pages.filter(
  ([name]) => !process.env.AUDIT_PAGE || name === process.env.AUDIT_PAGE,
))
  for (const profile of profiles.filter(
    (profile) =>
      !process.env.AUDIT_PROFILE || profile === process.env.AUDIT_PROFILE,
  )) {
    const runs = []
    for (let run = 1; run <= 3; run++) {
      const chrome = await launch({
        chromePath: chromium.executablePath(),
        chromeFlags: ['--headless', '--no-sandbox', '--disable-dev-shm-usage'],
      })
      try {
        const result = await lighthouse(origin + path, {
          port: chrome.port,
          output: ['html', 'json'],
          logLevel: 'error',
          onlyCategories: [
            'performance',
            'accessibility',
            'best-practices',
            'seo',
          ],
          ...(profile === 'desktop'
            ? {
                formFactor: 'desktop',
                screenEmulation: {
                  mobile: false,
                  width: 1440,
                  height: 1000,
                  deviceScaleFactor: 1,
                  disabled: false,
                },
                throttling: {
                  rttMs: 40,
                  throughputKbps: 10240,
                  cpuSlowdownMultiplier: 1,
                },
              }
            : {}),
        })
        if (!result) throw new Error('Lighthouse returned no result')
        await writeFile(
          `${output}/${name}-${profile}-${run}.html`,
          result.report[0],
        )
        await writeFile(
          `${output}/${name}-${profile}-${run}.json`,
          result.report[1],
        )
        const { lhr } = result
        const scores = Object.fromEntries(
          Object.entries(lhr.categories).map(([key, value]) => [
            key,
            Math.round(value.score * 100),
          ]),
        )
        const metrics = Object.fromEntries(
          [
            'largest-contentful-paint',
            'cumulative-layout-shift',
            'total-blocking-time',
          ].map((key) => [key, lhr.audits[key].numericValue]),
        )
        runs.push({ ...scores, ...metrics })
        console.log(`${name}/${profile} ${run}/3 ${JSON.stringify(scores)}`)
      } finally {
        await chrome.kill()
      }
    }
    const median = Object.fromEntries(
      Object.keys(runs[0]).map((key) => [
        key,
        runs.map((run) => run[key]).sort((a, b) => a - b)[1],
      ]),
    )
    results.push({ page: name, profile, runs, median })
  }
await writeFile(
  `${output}/summary.json`,
  JSON.stringify(
    {
      date: new Date().toISOString(),
      node: process.version,
      platform: process.platform,
      origin,
      buildManifestSha256,
      results,
    },
    null,
    2,
  ),
)
console.log(`Reports: ${output}/summary.json`)
