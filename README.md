# Avanti - Simple Local HTTPS Hosting

Avanti runs a HTTPS server locally with no certificate management or external servers.

## Usage

Use it from the command line or as a nodejs project dependency by following [these instructions](npm/README.md).

## How it works

Avanti uses a wildcard SSL certificate for the `*.avnlan.link` domain. 

A custom DNS service resolves IP-formatted subdomains like `192-168-1-21.avnlan.link` to local network IP addresses like `192.168.1.21`.

This allows any device on your local network to access the development server over HTTPS without certificate warnings.

### Security

TL;DR: Don't use avanti for production hosting.

To make this system work we need to distribute the private half of an SSL certificate.
This means that communication between your development machine and other devices should be considered insecure,
but as you will typically have physical access to all the devices involved this isn't really a problem.

Compare it to something like [ngrok](https://ngrok.com/docs/getting-started),
which on the face of it seems secure because the private key stays private,
but in reality the ngrok servers can inspect your traffic and could even inject malicious content.
In fact with avanti the data never leaves your LAN, which is actually more secure.

## Caveats

### Legacy routers

Some routers, usually domestic ones, refuse to resolve private network addresses.
This is because there are historical threat vectors that targeted unsecured local devices from your browser.
This isn't possible in modern browsers anymore due to initiatives like [PNA](https://wicg.github.io/private-network-access/) and [LNA](https://wicg.github.io/local-network-access/), but the routers have yet to catch up.

To get around this you will need to take control of your own DNS settings.

### Public access

One advantage ngrok has over avanti is that the URLs can be accessed publicly.

It would actually be possible to share public links if you punched a hole in your firewall; let us know if this is something you are interested in doing.
