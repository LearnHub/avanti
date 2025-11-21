# Avanti for Node.js

A minimal Node.js library for serving static files over HTTPS with automatic certificate management and local network access.

## Installation

```bash
npm install --save-dev avanti
```

## Usage

### As a project script

```json
{
  "scripts": {
    "start": "avanti"
  }
}
```

Then run: `npm run start`

### As a CLI tool

```bash
npx avanti
```

### As a library

```javascript
import { serve } from 'avanti'

const { server, url } = await serve({
  port: 8443,
  dir: './public'
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

**Returns:** Promise resolving to an object with:
- `server`: The HTTPS server instance
- `url`: The avnlan.link network URL (e.g., `https://192-168-1-21.avnlan.link:8443/`)

## License

MIT
