# Avanti - Simple Local HTTPS Hosting

Avanti runs a HTTPS server locally with no certificate management or external servers.

## Usage

Use it from the command line or as a developer dependency from your nodejs projects by following [these instructions](npm/README.md).

## How it works

Avanti downloads a wildcard SSL certificate from cert.avncloud.com that covers `*.avnlan.link` domains. 

The avnlan.link DNS service automatically resolves IP-based subdomains (e.g. `192-168-1-21.avnlan.link`) to local network IP address `192.168.1.21`.

This allows VR headsets and mobile devices on your local network to access your development server over HTTPS without certificate warnings.

