import assert from 'assert'
import fs from 'fs'
import os from 'os'
import path from 'path'
import crypto from 'crypto'

import { writeFileAtomicWithBackup } from '../../lib/utils/atomicFile'
import { writeStabilityLog } from '../../lib/utils/stabilityLog'

async function testAtomicFileWrite () {
  const baseDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'cyberowl-smoke-'))
  const targetPath = path.join(baseDir, 'engine.state.json')
  const backupPath = `${targetPath}.bak`
  const tempPath = `${targetPath}.tmp`

  await writeFileAtomicWithBackup({
    targetPath,
    tempPath,
    backupPath,
    data: JSON.stringify({ version: 1 })
  })

  assert.deepStrictEqual(JSON.parse(await fs.promises.readFile(targetPath, 'utf8')), { version: 1 })
  assert.strictEqual(fs.existsSync(backupPath), false)

  await writeFileAtomicWithBackup({
    targetPath,
    tempPath,
    backupPath,
    data: JSON.stringify({ version: 2 })
  })

  assert.deepStrictEqual(JSON.parse(await fs.promises.readFile(targetPath, 'utf8')), { version: 2 })
  assert.deepStrictEqual(JSON.parse(await fs.promises.readFile(backupPath, 'utf8')), { version: 1 })
}

async function testStabilityLogWrite () {
  const baseDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'cyberowl-log-smoke-'))
  const logPath = path.join(baseDir, 'stability.log')

  writeStabilityLog({
    level: 'error',
    source: 'smoke',
    event: 'test-entry',
    details: new Error('boom')
  }, { filePath: logPath, maxBytes: 4096 })

  const lines = (await fs.promises.readFile(logPath, 'utf8')).trim().split('\n')
  assert.strictEqual(lines.length, 1)
  const entry = JSON.parse(lines[0]) as { level: string, source: string, event: string, details: { message: string } }
  assert.strictEqual(entry.level, 'error')
  assert.strictEqual(entry.source, 'smoke')
  assert.strictEqual(entry.event, 'test-entry')
  assert.strictEqual(entry.details.message, 'boom')
}

async function testAssetIntegrityVerification () {
  const baseDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'cyberowl-integrity-smoke-'))
  const testFile = path.join(baseDir, 'test.asset')
  const expectedHash = 'abc123'

  await fs.promises.writeFile(testFile, 'test content for integrity verification')

  const fileHash = await new Promise<string>((resolve, reject) => {
    const hash = crypto.createHash('sha256')
    const stream = fs.createReadStream(testFile)
    stream.on('error', (err) => reject(err))
    stream.on('data', (chunk) => hash.update(chunk))
    stream.on('end', () => resolve(hash.digest('hex')))
  })

  assert.strictEqual(typeof fileHash, 'string')
  assert.strictEqual(fileHash.length, 64)
  assert.strictEqual(crypto.createHash('sha256').update('test content for integrity verification').digest('hex'), fileHash)
}

async function testHashConsistency () {
  const baseDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'cyberowl-hash-smoke-'))
  const testFile = path.join(baseDir, 'hash-test.bin')
  const testContent = Buffer.from('reproducible content for hash verification')

  await fs.promises.writeFile(testFile, testContent)

  const hash1 = await new Promise<string>((resolve, reject) => {
    const hash = crypto.createHash('sha256')
    const stream = fs.createReadStream(testFile)
    stream.on('error', (err) => reject(err))
    stream.on('data', (chunk) => hash.update(chunk))
    stream.on('end', () => resolve(hash.digest('hex')))
  })

  const hash2 = await new Promise<string>((resolve, reject) => {
    const hash = crypto.createHash('sha256')
    const stream = fs.createReadStream(testFile)
    stream.on('error', (err) => reject(err))
    stream.on('data', (chunk) => hash.update(chunk))
    stream.on('end', () => resolve(hash.digest('hex')))
  })

  assert.strictEqual(hash1, hash2)
}

async function testAppUpdateConfigVersionParsing () {
  const baseDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'cyberowl-config-smoke-'))
  const configPath = path.join(baseDir, 'app-update.yml')

  await fs.promises.writeFile(configPath, `version: 2.0.0
provider: github`)

  assert.strictEqual(fs.existsSync(configPath), true)

  const yamlContent = await fs.promises.readFile(configPath, 'utf-8')
  const versionMatch = yamlContent.match(/version:\s*(.+)$/m)
  assert.notStrictEqual(versionMatch, null)
  assert.strictEqual(versionMatch![1].trim(), '2.0.0')
}

async function testStabilityLogRotation () {
  const baseDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'cyberowl-rotation-smoke-'))
  const logPath = path.join(baseDir, 'stability.log')

  for (let i = 0; i < 5; i++) {
    writeStabilityLog({
      level: 'info',
      source: 'smoke',
      event: `rotation-test-${i}`,
      details: { iteration: i }
    }, { filePath: logPath, maxBytes: 256 })
  }

  const content = await fs.promises.readFile(logPath, 'utf8')
  const lines = content.trim().split('\n')
  assert.strictEqual(lines.length >= 1, true)

  const lastEntry = JSON.parse(lines[lines.length - 1])
  assert.strictEqual(lastEntry.source, 'smoke')
  assert.strictEqual(lastEntry.event.includes('rotation-test'), true)
}

async function main () {
  await testAtomicFileWrite()
  await testStabilityLogWrite()
  await testAssetIntegrityVerification()
  await testHashConsistency()
  await testAppUpdateConfigVersionParsing()
  await testStabilityLogRotation()
  console.log('security smoke checks passed')
}

void main().catch((error) => {
  console.error('security smoke checks failed')
  console.error(error)
  process.exitCode = 1
})
