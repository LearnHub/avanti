# Avanti for Node.js

A minimal Node.js library for serving static files over HTTPS with automatic certificate management and local network access.

See https://github.com/LearnHub/avanti for details about how it works.

## Usage

### As a node project script

Install in devDependencies
```bash
npm install --save-dev @avncloud/avanti
```

Update package.json
```json
{
  "scripts": {
    "start": "avanti"
  }
}
```

Then run `npm run start` and browse the URL it gives you:
```bash
% npm run start

> coolproject@1.0.0 start
> avanti

https://192-168-1-21.avnlan.link:8443/
```

### As a local CLI tool

Install in devDependencies:
```bash
npm install --save-dev @avncloud/avanti
```

Run from project folder to start serving files:
```bash
npx avanti
```

Get more command line options using the help option:
```bash
npx avanti --help

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
```

### As a global CLI tool

Install globally:
```bash
npm install -g @avncloud/avanti
```

Run from anywhere:
```bash
avanti
```

Uninstall globally:
```bash
npm uninstall -g @avncloud/avanti
```

### As a library

Install in dependencies:
```bash
npm install @avncloud/avanti
```

```javascript
import { serve } from '@avncloud/avanti'

const { server, url } = await serve({
  port: 8443,
  dir: './public'
})

console.log('Network URL:', url)
// e.g., https://192-168-1-21.avnlan.link:8443/
```

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

Avanti is provided by [Avantis Education](https://www.avantiseducation.com/) as-is and without any guarantees or obligations.
