#!/usr/bin/env node
/**
 * Simple smoke test for avanti
 */

import { serve, version } from './index.js'
import https from 'https'

console.log('Running avanti smoke tests...\n')

let passed = 0
let failed = 0

function test(name, fn) {
  try {
    fn()
    console.log(`✓ ${name}`)
    passed++
  } catch (error) {
    console.error(`✗ ${name}`)
    console.error(`  ${error.message}`)
    failed++
  }
}

async function testAsync(name, fn) {
  try {
    await fn()
    console.log(`✓ ${name}`)
    passed++
  } catch (error) {
    console.error(`✗ ${name}`)
    console.error(`  ${error.message}`)
    failed++
  }
}

// Test 1: Check version export
test('version is exported', () => {
  if (!version) throw new Error('version is not exported')
  if (typeof version !== 'string') throw new Error('version is not a string')
})

// Test 2: Check serve function is exported
test('serve function is exported', () => {
  if (!serve) throw new Error('serve is not exported')
  if (typeof serve !== 'function') throw new Error('serve is not a function')
})

// Test 3: Start server and verify it works
await testAsync('server starts and responds to requests', async () => {
  const { server, url } = await serve({ port: 0 }) // Port 0 = random available port

  if (!server) throw new Error('server not returned')
  if (!url) throw new Error('url not returned')

  // Get the actual port that was assigned
  const address = server.address()
  const port = address.port

  // Make a test request to the server (expect 404 since we're not serving any files)
  const testUrl = `https://localhost:${port}/`

  await new Promise((resolve, reject) => {
    const req = https.get(testUrl, { rejectUnauthorized: false }, (res) => {
      // We expect 404 since there's no index.html in the test directory
      if (res.statusCode !== 404 && res.statusCode !== 200) {
        reject(new Error(`Unexpected status code: ${res.statusCode}`))
      } else {
        resolve()
      }
    })

    req.on('error', (err) => {
      // Ignore certificate errors for this test
      if (err.code === 'CERT_HAS_EXPIRED' || err.code === 'DEPTH_ZERO_SELF_SIGNED_CERT') {
        resolve()
      } else {
        reject(err)
      }
    })

    req.setTimeout(5000, () => {
      reject(new Error('Request timeout'))
    })
  })

  // Close server
  await new Promise((resolve) => server.close(resolve))
})

// Test 4: Verify server accepts custom options
await testAsync('server accepts custom port option', async () => {
  const { server } = await serve({ port: 0 })
  const address = server.address()

  if (!address || !address.port) {
    throw new Error('server did not bind to a port')
  }

  await new Promise((resolve) => server.close(resolve))
})

// Summary
console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed > 0 ? 1 : 0)
