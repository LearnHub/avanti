# Avanti - Simple Local HTTPS Hosting

A minimal Node.js library for serving static files over HTTPS with automatic certificate management and local network access.

## Features

- 🔒 Automatic HTTPS certificate management from avncloud.com
- 🌐 Network access with avnlan.link wildcard DNS
- 📱 Perfect for WebXR and VR headset development
- 🚀 Zero configuration - just run and go
- 📦 Minimal dependencies

## Installation

```bash
npm install avanti
```

## Quick Start

### As a CLI tool

```bash
npx avanti
```

Or add to your `package.json`:

```json
{
  "scripts": {
    "serve": "avanti"
  }
}
```

Then run: `npm run serve`

### As a library

```javascript
import { serve } from 'avanti'

const { server, url } = await serve({
  port: 8443,
  dir: './public',
  passphrase: 'avnlan'
})

console.log('Network URL:', url)
// e.g., https://192-168-1-21.avnlan.link:8443/
```

## API

### `serve(options)`

Starts an HTTPS server serving static files.

**Options:**
- `port` (number, optional): Port to listen on. Defaults to `8443`.
- `dir` (string, optional): Directory to serve files from. Defaults to current directory.
- `passphrase` (string, optional): Certificate passphrase. Defaults to `''`.

**Returns:** Promise resolving to an object with:
- `server`: The HTTPS server instance
- `url`: The avnlan.link network URL (e.g., `https://192-168-1-21.avnlan.link:8443/`)

## How it works

Avanti downloads a wildcard SSL certificate from cert.avncloud.com that covers `*.avnlan.link` domains. The avnlan.link DNS service automatically resolves IP-based subdomains (e.g., `192-168-1-21.avnlan.link`) to your local network IP address (`192.168.1.21`).

This allows VR headsets and mobile devices on your local network to access your development server over HTTPS without certificate warnings.

## License

MIT
