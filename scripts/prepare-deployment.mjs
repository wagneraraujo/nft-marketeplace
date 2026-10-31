import {
  readFile,
  readdir,
  mkdir,
  copyFile,
  writeFile,
  mkdtemp,
} from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { tmpdir } from 'node:os'

const root = fileURLToPath(new URL('../', import.meta.url))
const sourceCommit = process.argv[2]
if (!/^[a-f0-9]{40}$/.test(sourceCommit ?? ''))
  throw new Error('Provide the reviewed commit SHA as the first argument.')
const output = await mkdtemp(join(tmpdir(), 'kurio-deployment-'))
const source = join(output, 'source')
const paths = [
  'package.json',
  'yarn.lock',
  'index.html',
  'vite.config.ts',
  'vercel.json',
  'scripts/preload-mocks.mjs',
]
for (const name of await readdir(root))
  if (/^tsconfig.*\.json$/.test(name)) paths.push(name)
async function collect(directory) {
  for (const entry of await readdir(join(root, directory), {
    withFileTypes: true,
  })) {
    if (entry.name.startsWith('.')) continue
    const path = join(directory, entry.name)
    if (entry.isDirectory()) await collect(path)
    else if (entry.isFile()) paths.push(path)
    else throw new Error(`Unsupported source entry: ${path}`)
  }
}
await collect('src')
await collect('public')
const files = []
const manifest = []
for (const path of paths.sort()) {
  const bytes = await readFile(join(root, path))
  const target = join(source, path)
  await mkdir(dirname(target), { recursive: true })
  await copyFile(join(root, path), target)
  files.push({ file: path, data: bytes.toString('base64'), encoding: 'base64' })
  manifest.push({
    file: path,
    bytes: bytes.length,
    sha256: createHash('sha256').update(bytes).digest('hex'),
  })
}
const settings = {
  framework: 'vite',
  nodeVersion: '24.x',
  installCommand: 'yarn install --frozen-lockfile',
  buildCommand: 'VITE_ENABLE_MOCKS=true yarn build',
  outputDirectory: 'dist',
}
const candidate = {
  teamId: 'team_AaVPcIFMVz2BYzyg6va5Q0Zj',
  projectName: 'kurio-nft-marketplace',
  environment: 'preview',
  sourceCommit,
  sourceMode: 'working-tree allowlist; file hashes are authoritative',
  settings,
  fileCount: files.length,
  totalBytes: manifest.reduce((sum, file) => sum + file.bytes, 0),
  excludes: [
    '.env*',
    '.git',
    'node_modules',
    'docs',
    'reports',
    'browser state',
    'operational/test scripts',
  ],
  files: manifest,
}
await writeFile(
  join(output, 'manifest.json'),
  JSON.stringify(candidate, null, 2) + '\n',
)
await writeFile(
  join(output, 'deployment.json'),
  JSON.stringify({
    teamId: candidate.teamId,
    requestBody: {
      name: candidate.projectName,
      projectSettings: settings,
      files,
      meta: { sourceCommit, purpose: 'Kurio challenge preview' },
    },
  }),
)
console.log(
  JSON.stringify(
    {
      directory: output,
      sourceDirectory: source,
      manifestPath: join(output, 'manifest.json'),
      payloadPath: join(output, 'deployment.json'),
      fileCount: candidate.fileCount,
      totalBytes: candidate.totalBytes,
    },
    null,
    2,
  ),
)
