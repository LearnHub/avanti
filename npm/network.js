/**
 * Network utilities
 */

import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

/**
 * Get local IP address (macOS/Linux/Windows)
 * @returns {Promise<string|null>} Local IP address or null if not found
 */
export async function getLocalIP() {
  // Try macOS ipconfig first
  try {
    const { stdout } = await execAsync('ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null',
      { encoding: 'utf-8' })
    const ip = stdout.trim()
    if (ip) return ip
  } catch (e) {
    // Silently try next method
  }

  // Try Linux ip command
  try {
    const { stdout } = await execAsync('ip route get 1 2>/dev/null | grep -oP "src \\K\\S+"',
      { encoding: 'utf-8' })
    const output = stdout.trim()
    if (output) return output
  } catch (e) {
    // Silently try next method
  }

  // Try Windows ipconfig
  try {
    const { stdout } = await execAsync('ipconfig',
      { encoding: 'utf-8' })

    // Look for IPv4 Address in the output
    const match = stdout.match(/IPv4 Address[.\s]*:\s*(\d+\.\d+\.\d+\.\d+)/i)
    if (match && match[1]) {
      const ip = match[1]
      // Exclude loopback addresses
      if (!ip.startsWith('127.')) {
        return ip
      }
    }
  } catch (e) {
    // Silently fail
  }

  return null
}
