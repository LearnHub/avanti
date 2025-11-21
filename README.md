# Avanti - Simple Local HTTPS Hosting

Avanti runs a HTTPS server locally with no certificate management or external servers.

## Usage

Use it from the command line or as a developer dependency from your nodejs projects by following [these instructions](npm/README.md).

## How it works

Avanti downloads a wildcard SSL certificate from cert.avncloud.com that covers the `*.avnlan.link` domains. 

The avnlan.link custom DNS service resolves IP-formatted subdomains like `192-168-1-21.avnlan.link` to local network IP address like `192.168.1.21`.

This allows other devices on your local network to access your development server over HTTPS without certificate warnings.

### Security

TL;DR: Don't host use avanti for production hosting.

To make this system work we need to distribute the private part of the SSL certificate.
This means that communication between your development machine and other devices should be considered insecure,
but as you will typically have physical access to all the devices involved this isn't really a problem.

Compare it something like [ngrok](https://ngrok.com/docs/getting-started),
which on the face of it seems secure because the private key stays private,
but in reality the ngrok server can inspect the traffic and could even inject malicious content.
In fact with avanti the data never leaves you LAN, which reduces any threat significantly.

## Caveats

### Legacy routers

Some routers, usually domestic ones, refuse to resolve private network addresses.
This is because there are historical threat vectors that could attack unsecured local devices from your browser.
This isn't possible in modern browsers anymore due to initiatives like [PNA](https://wicg.github.io/private-network-access/) and [LNA](https://wicg.github.io/local-network-access/), but the routers have yet to catch up.

To get around this you will need to take control of your own DNS.

### Public access

One advantage ngrok has over avanti is that the access URL can be shared publicly.
It would be possible to share public links if you punched a hole in your firewall; let us know if this is something you are interested in doing.
