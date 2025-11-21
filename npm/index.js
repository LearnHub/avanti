/**
 * Avanti - simple local HTTPS hosting
 */

import https from 'https'
import fs from 'fs'
import path from 'path'
import mime from 'mime-types'

export const version = '0.1.0'

const CERT_URL = 'https://cert.avncloud.com'
const CERT_PASSPHRASE = 'avnlan'
const CERT_CACHE_DIR = path.join(process.env.HOME || process.env.USERPROFILE, '.avanti')
const CERT_PATH = path.join(CERT_CACHE_DIR, 'cert.p12')

/**
 * Download certificate from avncloud.com
 */
async function downloadCertificate() {
  console.log('Downloading certificate from', CERT_URL)

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
  console.log('Certificate cached at', CERT_PATH)

  return Buffer.from(buffer)
}

/**
 * Get certificate (from cache or download)
 */
async function getCertificate() {
  // Check if cached certificate exists and is less than 24 hours old
  if (fs.existsSync(CERT_PATH)) {
    const stats = fs.statSync(CERT_PATH)
    const age = Date.now() - stats.mtimeMs
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours

    if (age < maxAge) {
      console.log('Using cached certificate')
      return fs.readFileSync(CERT_PATH)
    }
  }

  return await downloadCertificate()
}


/**
 * Start HTTPS server
 */
export async function serve(options = {}) {
  const {
    port = 8443,
    host = 'localhost',
    dir = process.cwd(),
    passphrase = ''
  } = options

  const certBuffer = await getCertificate()

  const serverOptions = {
    pfx: certBuffer,
    passphrase: passphrase
  }

  const server = https.createServer(serverOptions, (req, res) => {
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
        console.log('404:', filePath)
        return
      }

      // Serve the file
      const mimeType = mime.lookup(fullPath) || 'application/octet-stream'
      res.writeHead(200, { 'Content-Type': mimeType })

      const fileStream = fs.createReadStream(fullPath)
      fileStream.pipe(res)

      console.log('200:', filePath)
    })
  })

  return new Promise((resolve, reject) => {
    server.listen(port, host, () => {
      console.log(`Avanti HTTPS server running at https://${host}:${port}/`)
      console.log(`Serving files from: ${dir}`)
      resolve(server)
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
  serve({ passphrase: CERT_PASSPHRASE }).catch(err => {
    console.error('Failed to start server:', err)
    process.exit(1)
  })
}
