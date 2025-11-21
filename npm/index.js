#!/usr/bin/env node
/**
 * Avanti - simple local HTTPS hosting
 */

import https from 'https'
import fs from 'fs'
import fsp from 'node:fs/promises'
import path from 'path'
import mime from 'mime-types'
import { renderFolderListing } from './folder.js'
import { getCertificate, getCertificatePassphrase } from './cert.js'
import { getLocalIP } from './network.js'

export const version = '0.2.2'

const HELP_TEXT = `
Avanti - Simple Local HTTPS Hosting

Usage: avanti [options]

Options:
  -p, --port <number>    Port to listen on (default: 8443)
  -d, --dir <path>       Directory to serve (default: current directory)
  -h, --help             Show this help message

Examples:
  avanti
  avanti --port 3000
  avanti --dir ./public
  avanti -p 3000 -d ./public
`

/**
 * Start HTTPS server
 */
export async function serve(options = {}) {
  const {
    port = 8443,
    dir = process.cwd()
  } = options

  const localIP = await getLocalIP()
  if (!localIP) {
    throw new Error('Failed to detect local IP address')
  }

  const url = `https://${localIP.replace(/\./g, '-')}.avnlan.link:${port}/`

  const certBuffer = await getCertificate()

  const serverOptions = {
    pfx: certBuffer,
    passphrase: getCertificatePassphrase()
  }

  const server = https.createServer(serverOptions, async (req, res) => {
    try {
      // Parse URL and remove query string
      let filePath = decodeURIComponent(req.url.split('?')[0])

      // Construct full file path
      const fullPath = path.join(dir, filePath)

      // Prevent directory traversal attacks
      if (!fullPath.startsWith(dir)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' })
        res.end('Forbidden')
        return
      }

      // Check if path exists
      let stats
      try {
        stats = await fsp.stat(fullPath)
      } catch {
        res.writeHead(404, { 'Content-Type': 'text/plain' })
        res.end('Not Found')
        return
      }

      // Handle directories
      if (stats.isDirectory()) {
        // Try to serve index.html from the directory
        const indexPath = path.join(fullPath, 'index.html')
        try {
          const indexStats = await fsp.stat(indexPath)
          if (indexStats.isFile()) {
            const mimeType = 'text/html'
            res.writeHead(200, { 'Content-Type': mimeType })
            const fileStream = fs.createReadStream(indexPath)
            fileStream.pipe(res)
            return
          }
        } catch {
          // No index.html, show directory listing
        }

        // Generate directory listing
        const files = await fsp.readdir(fullPath)
        const fileStats = await Promise.all(
          files.map(async (file) => {
            const filePath = path.join(fullPath, file)
            const stat = await fsp.stat(filePath)
            return { name: file, stat }
          })
        )

        // Sort: directories first, then files, both alphabetically
        fileStats.sort((a, b) => {
          if (a.stat.isDirectory() && !b.stat.isDirectory()) return -1
          if (!a.stat.isDirectory() && b.stat.isDirectory()) return 1
          return a.name.localeCompare(b.name)
        })

        // Generate HTML listing
        const currentPath = filePath === '/' ? '/' : filePath
        const html = renderFolderListing(currentPath, fileStats)

        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.end(html)
        return
      }

      // Serve regular files
      const mimeType = mime.lookup(fullPath) || 'application/octet-stream'
      res.writeHead(200, { 'Content-Type': mimeType })

      const fileStream = fs.createReadStream(fullPath)
      fileStream.pipe(res)
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
if (import.meta.main) {
  // Parse command line arguments
  const args = process.argv.slice(2)
  const options = {}

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]

    if (arg === '--port' || arg === '-p') {
      options.port = parseInt(args[++i], 10)
    } else if (arg === '--dir' || arg === '-d') {
      options.dir = args[++i]
    } else if (arg === '--help' || arg === '-h') {
      console.log(HELP_TEXT)
      process.exit(0)
    } else {
      console.error(`Error: Unknown option '${arg}'`)
      console.error('')
      console.log(HELP_TEXT)
      process.exit(1)
    }
  }

  serve(options).then(result => {
    console.log(result.url) 
  }).catch(err => {
    console.error('Failed to start server:', err)
    process.exit(1)
  })
}
