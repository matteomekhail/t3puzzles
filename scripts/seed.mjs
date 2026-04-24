import { readFileSync, existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'

const LOCAL = resolve('convex/seed.answers.local.json')
const EXAMPLE = resolve('convex/seed.answers.example.json')

if (!existsSync(LOCAL)) {
  console.error(
    `\n  Missing ${LOCAL}.\n\n` +
      `  Copy the example and fill in real answers:\n` +
      `    cp ${EXAMPLE} ${LOCAL}\n` +
      `    # then edit ${LOCAL}\n`,
  )
  process.exit(1)
}

const answers = JSON.parse(readFileSync(LOCAL, 'utf8'))
if (!Array.isArray(answers) || answers.some((a) => typeof a !== 'string')) {
  console.error(`  ${LOCAL} must be an array of strings.`)
  process.exit(1)
}

const force = process.argv.includes('--force')
const args = JSON.stringify({ answers, ...(force ? { force: true } : {}) })

const result = spawnSync(
  'npx',
  ['convex', 'run', 'puzzles:seed', args],
  { stdio: 'inherit', shell: process.platform === 'win32' },
)
process.exit(result.status ?? 1)
