#!/usr/bin/env node
/**
 * Avanti - simple local HTTPS hosting
 */

import https from 'https'
import fs from 'fs'
import path from 'path'
import mime from 'mime-types'
import { execSync } from 'child_process'

export const version = '0.1.0'

const CERT_URL = 'https://cert.avncloud.com'
const CERT_PASSPHRASE = 'avnlan'
const CERT_CACHE_DIR = path.join(process.env.HOME || process.env.USERPROFILE, '.avanti')
const CERT_PATH = path.join(CERT_CACHE_DIR, 'cert.p12')

/**
 * Get local IP address (macOS/Linux)
 */
function getLocalIP() {
  try {
    // Try macOS ipconfig first
    const ip = execSync('ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null',
      { encoding: 'utf-8' }).trim()
    if (ip) return ip
  } catch (e) {
    // Silently try next method
  }

  try {
    // Try Linux ip command
    const output = execSync('ip route get 1 2>/dev/null | grep -oP "src \\K\\S+"',
      { encoding: 'utf-8' }).trim()
    if (output) return output
  } catch (e) {
    // Silently fail
  }

  return null
}

/**
 * Download certificate from avncloud.com
 */
async function downloadCertificate(verbose = false) {
  if (verbose) console.log('Downloading certificate from', CERT_URL)

  const response = await fetch(CERT_URL)
  if (!response.ok) {
    throw new Error(`Failed to download certificate: ${response.statusText}`)
  }

  const buffer = await response.arrayBuffer()

  // Ensure cache directory exists
  if (!fs.existsSync(CERT_CACHE_DIR)) {
    fs.mkdirSync(CERT_CACHE_DIR, { recursive: true })
  }

  fs.writeFileSync(CERT_PATH, Buffer.from(buffer))
  if (verbose) console.log('Certificate cached at', CERT_PATH)

  return Buffer.from(buffer)
}

/**
 * Get certificate (from cache or download)
 */
async function getCertificate(verbose = false) {
  // Check if cached certificate exists and is less than 24 hours old
  if (fs.existsSync(CERT_PATH)) {
    const stats = fs.statSync(CERT_PATH)
    const age = Date.now() - stats.mtimeMs
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours

    if (age < maxAge) {
      if (verbose) console.log('Using cached certificate')
      return fs.readFileSync(CERT_PATH)
    }
  }

  return await downloadCertificate(verbose)
}


/**
 * Start HTTPS server
 */
export async function serve(options = {}) {
  const {
    port = 8443,
    dir = process.cwd(),
    verbose = false
  } = options

  const localIP = getLocalIP()
  if (!localIP) {
    throw new Error('Failed to detect local IP address')
  }

  const url = `https://${localIP.replace(/\./g, '-')}.avnlan.link:${port}/`

  const certBuffer = await getCertificate(verbose)

  const serverOptions = {
    pfx: certBuffer,
    passphrase: CERT_PASSPHRASE
  }

  const server = https.createServer(serverOptions, (req, res) => {
    try {
      // Parse URL and remove query string
      let filePath = decodeURIComponent(req.url.split('?')[0])

      // Default to index.html for directory requests
      if (filePath === '/') {
        filePath = '/index.html'
      }

      // Construct full file path
      const fullPath = path.join(dir, filePath)

      // Prevent directory traversal attacks
      if (!fullPath.startsWith(dir)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' })
        res.end('Forbidden')
        return
      }

      // Check if file exists
      fs.stat(fullPath, (err, stats) => {
        if (err || !stats.isFile()) {
          res.writeHead(404, { 'Content-Type': 'text/plain' })
          res.end('Not Found')
          if (verbose) console.log('404:', filePath)
          return
        }

        // Serve the file
        const mimeType = mime.lookup(fullPath) || 'application/octet-stream'
        res.writeHead(200, { 'Content-Type': mimeType })

        const fileStream = fs.createReadStream(fullPath)
        fileStream.pipe(res)

        if (verbose) console.log('200:', filePath)
      })
    } catch (error) {
      console.error('Request handler error:', error)
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'text/plain' })
        res.end('Internal Server Error')
      }
    }
  })

  return new Promise((resolve, reject) => {
    server.listen(port, '0.0.0.0', () => {
      if (verbose) {
        console.log(`Avanti HTTPS server running at https://localhost:${port}/`)
        console.log(`Serving files from: ${dir}`)
        console.log(`Network URL: ${url}`)
      } else {
        console.log(url)
      }

      resolve({ server, url })
    })

    server.on('error', reject)
  })
}

export default {
  version,
  serve
}

// CLI mode - run server if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  // Parse command line arguments
  const args = process.argv.slice(2)
  const options = {}

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]

    if (arg === '--port' || arg === '-p') {
      options.port = parseInt(args[++i], 10)
    } else if (arg === '--dir' || arg === '-d') {
      options.dir = args[++i]
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
Avanti - Simple Local HTTPS Hosting

Usage: avanti [options]

Options:
  -p, --port <number>    Port to listen on (default: 8443)
  -d, --dir <path>       Directory to serve (default: current directory)
  -v, --verbose          Show detailed logging
  -h, --help             Show this help message

Examples:
  avanti
  avanti --port 3000
  avanti --dir ./public
  avanti --verbose
  avanti -p 3000 -d ./public -v
      `)
      process.exit(0)
    }
  }

  serve(options).catch(err => {
    console.error('Failed to start server:', err)
    process.exit(1)
  })
}
