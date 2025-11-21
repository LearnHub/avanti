/**
 * Folder listing utilities
 */

/**
 * Format file size for display (SI units: 1 KB = 1000 bytes)
 */
function formatSize(bytes) {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const k = 1000
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + units[i]
}

/**
 * Generate HTML for directory listing
 * @param {string} currentPath - The current directory path
 * @param {Array<{name: string, stat: import('fs').Stats}>} fileStats - Array of file/directory info
 * @returns {string} HTML string
 */
export function renderFolderListing(currentPath, fileStats) {
  const parentPath = currentPath === '/' ? null : currentPath.split('/').slice(0, -1).join('/') || '/'

  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Index of ${currentPath}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 1200px; margin: 2rem auto; padding: 0 1rem; }
    h1 { border-bottom: 1px solid #ddd; padding-bottom: 0.5rem; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 0.5rem; border-bottom: 2px solid #ddd; }
    td { padding: 0.5rem; border-bottom: 1px solid #eee; }
    tr:hover { background: #f5f5f5; }
    a { color: #0066cc; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .icon { display: inline-block; width: 1.2rem; text-align: center; margin-right: 0.5rem; }
    .size { text-align: right; }
    .date { color: #666; }
  </style>
</head>
<body>
  <h1>Index of ${currentPath}</h1>
  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th class="size">Size</th>
        <th>Modified</th>
      </tr>
    </thead>
    <tbody>`

  // Add parent directory link
  if (parentPath !== null) {
    html += `
      <tr>
        <td><a href="${parentPath === '/' ? '/' : parentPath + '/'}"><span class="icon">📁</span>..</a></td>
        <td class="size">-</td>
        <td class="date">-</td>
      </tr>`
  }

  // Add files and directories
  for (const { name, stat } of fileStats) {
    const isDir = stat.isDirectory()
    const icon = isDir ? '📁' : '📄'
    const href = (currentPath === '/' ? '/' : currentPath + '/') + name + (isDir ? '/' : '')
    const size = isDir ? '-' : formatSize(stat.size)
    const modified = stat.mtime.toLocaleString()

    html += `
      <tr>
        <td><a href="${href}"><span class="icon">${icon}</span>${name}${isDir ? '/' : ''}</a></td>
        <td class="size">${size}</td>
        <td class="date">${modified}</td>
      </tr>`
  }

  html += `
    </tbody>
  </table>
</body>
</html>`

  return html
}
