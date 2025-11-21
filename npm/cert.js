/**
 * Certificate management utilities
 */

import fsp from 'node:fs/promises'
import path from 'path'

const CERT_URL = 'https://cert.avncloud.com'
const CERT_PASSPHRASE = 'avnlan'
const CERT_CACHE_DIR = path.join(process.env.HOME || process.env.USERPROFILE, '.avanti')
const CERT_PATH = path.join(CERT_CACHE_DIR, 'cert.p12')

/**
 * Download certificate from avncloud.com
 */
async function downloadCertificate() {
  const response = await fetch(CERT_URL)
  if (!response.ok) {
    throw new Error(`Failed to download certificate: ${response.statusText}`)
  }

  const certBuffer = Buffer.from(await response.arrayBuffer())

  // Ensure cache directory exists
  await fsp.mkdir(CERT_CACHE_DIR, { recursive: true })
  await fsp.writeFile(CERT_PATH, certBuffer)

  return certBuffer
}

/**
 * Get certificate (from cache or download)
 * @returns {Promise<Buffer>} Certificate buffer
 */
export async function getCertificate() {
  // Check if cached certificate exists and is less than 24 hours old
  try {
    const stats = await fsp.stat(CERT_PATH)
    const age = Date.now() - stats.mtimeMs
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours

    if (age < maxAge) {
      return await fsp.readFile(CERT_PATH)
    }
  } catch {
    // File doesn't exist, download it
  }

  return downloadCertificate()
}

/**
 * Get certificate passphrase
 * @returns {string} Certificate passphrase
 */
export function getCertificatePassphrase() {
  return CERT_PASSPHRASE
}
