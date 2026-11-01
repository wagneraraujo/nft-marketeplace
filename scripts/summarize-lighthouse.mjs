import assert from 'node:assert/strict'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = resolve(process.argv[2] ?? 'lighthouse/reports/kurio-final')
const results = []
let origin
let buildManifestSha256
for (const page of ['home', 'detail']) {
  for (const profile of ['mobile', 'desktop']) {
    const report = JSON.parse(
      await readFile(`${root}/${page}-${profile}/summary.json`, 'utf8'),
    )
    assert.equal(report.results.length, 1)
    const result = report.results[0]
    assert.equal(result.page, page)
    assert.equal(result.profile, profile)
    assert.equal(result.runs.length, 3)
    assert.match(report.buildManifestSha256, /^[a-f0-9]{64}$/)
    origin ??= report.origin
    buildManifestSha256 ??= report.buildManifestSha256
    assert.equal(report.origin, origin, 'Audit origins differ')
    assert.equal(
      report.buildManifestSha256,
      buildManifestSha256,
      'Build changed during audit',
    )
    results.push(result)
  }
}
await writeFile(
  `${root}/summary.json`,
  JSON.stringify(
    { date: new Date().toISOString(), origin, buildManifestSha256, results },
    null,
    2,
  ) + '\n',
)
for (const result of results)
  console.log(
    `${result.page}/${result.profile}: ${JSON.stringify(result.median)}`,
  )
