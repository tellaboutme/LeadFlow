// Lighthouse CI against the production build, on the same isolated
// test-mode backend/DB pattern as the Playwright E2E config (a dedicated
// port + SQLite file, mocked external providers, never the dev DB).
import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const frontendDir = path.resolve(__dirname, '..')
const backendDir = path.resolve(frontendDir, '../backend')

const BACKEND_PORT = 8098
const FRONTEND_PORT = 4198

function spawnProcess(command, args, options) {
  const child = spawn(command, args, { stdio: 'inherit', shell: true, ...options })
  return child
}

async function waitForUrl(url, timeoutMs = 60_000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url)
      if (res.ok) return
    } catch {
      // not up yet
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  throw new Error(`Timed out waiting for ${url}`)
}

async function run(command, args, options) {
  return new Promise((resolve, reject) => {
    const child = spawnProcess(command, args, options)
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${command} exited with ${code}`))))
  })
}

async function main() {
  console.log('Running migrations against the Lighthouse test DB...')
  await run('uv', ['run', 'alembic', 'upgrade', 'head'], {
    cwd: backendDir,
    env: { ...process.env, DATABASE_URL: 'sqlite:///./data/lighthouse.db' },
  })

  console.log('Starting backend (test mode, mocked providers)...')
  const backend = spawnProcess('uv', ['run', 'uvicorn', 'app.main:app', '--port', String(BACKEND_PORT)], {
    cwd: backendDir,
    env: {
      ...process.env,
      ENVIRONMENT: 'test',
      AI_PROVIDER: 'mock',
      TELEGRAM_PROVIDER: 'mock',
      DATABASE_URL: 'sqlite:///./data/lighthouse.db',
    },
  })

  console.log('Building the production frontend bundle...')
  await run('npm', ['run', 'build'], { cwd: frontendDir })

  console.log('Starting the preview server...')
  const frontend = spawnProcess('npm', ['run', 'preview', '--', '--port', String(FRONTEND_PORT), '--strictPort'], {
    cwd: frontendDir,
    env: { ...process.env, E2E_BACKEND_PORT: String(BACKEND_PORT) },
  })

  try {
    await waitForUrl(`http://localhost:${BACKEND_PORT}/api/v1/health`)
    await waitForUrl(`http://localhost:${FRONTEND_PORT}`)
    await new Promise((resolve) => setTimeout(resolve, 500)) // let the reset-triggering seed settle

    await fetch(`http://localhost:${BACKEND_PORT}/api/v1/testing/reset`, { method: 'POST' })

    console.log('Running Lighthouse CI...')
    await run(
      'npx',
      [
        'lhci',
        'autorun',
        `--collect.url=http://localhost:${FRONTEND_PORT}/`,
        `--collect.url=http://localhost:${FRONTEND_PORT}/leads`,
        `--collect.url=http://localhost:${FRONTEND_PORT}/settings`,
        '--collect.numberOfRuns=1',
        '--upload.target=filesystem',
        '--upload.outputDir=./lighthouseci',
      ],
      { cwd: frontendDir },
    )
  } finally {
    frontend.kill()
    backend.kill()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
