# Avanti - Simple Local HTTPS Hosting

Avanti runs a HTTPS server locally with no certificate management or external servers.

## Usage

Use it from the command line or as a developer dependency from your nodejs projects by following [these instructions](npm/README.md).

## How it works

Avanti downloads a wildcard SSL certificate from cert.avncloud.com that covers the `*.avnlan.link` domains. 

The avnlan.link DNS service automatically resolves IP-based subdomains (e.g. `192-168-1-21.avnlan.link`) to local network IP address `192.168.1.21`.

This allows other devices on your local network to access your development server over HTTPS without certificate warnings.

## Caveats

Some routers, usually domestic ones, refuse to resolve private network addresses.
This is because there are historical threat vectors that could attack unsecured local devices from your browser.
This isn't possible in modern browsers anymore due to initiatives like [PNA](https://wicg.github.io/private-network-access/) and [LNA](https://wicg.github.io/local-network-access/), but the routers have yet to catch up.

To get around this you will need to take control of your own DNS.


