# iPhone Simulator

An open-source, cross-platform iPhone-inspired environment for web application testing.

> **Compatibility note:** This project recreates selected mobile-device interactions for development and testing. It is not Apple's iOS, does not include proprietary Apple software, and does not run native iOS `.ipa` applications. Native iOS testing requires Apple's official tooling and supported hardware.

## Project status

**Early development — UI prototype**

- Responsive simulator workspace
- iPhone-inspired home screen, status bar, Dynamic Island, and dock
- Interactive built-in app placeholders
- Device profile selector
- Control Center and lock-screen interactions
- Web and Electron desktop entry points

The in-simulator browser now supports website navigation through an embedded browser frame. Some websites block iframe embedding through their security headers, so this preview is not a replacement for a full browser engine. The workspace supports portrait and landscape device orientations.

## Tech stack

- React, TypeScript, and Vite
- Electron for the desktop shell
- Playwright for planned browser automation
- pnpm workspaces

## Requirements

- Node.js 20+
- pnpm 9+

## Development

```bash
pnpm install
pnpm dev:web
```

Open [http://localhost:5174](http://localhost:5174).

Run the Electron shell:

```bash
pnpm dev:desktop
```

Build:

```bash
pnpm build:web
pnpm build:desktop
```

## Roadmap

See [docs/ROADMAP.md](docs/ROADMAP.md) and [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Principles

- English-only UI, documentation, identifiers, and code comments.
- TypeScript-first development.
- Keep privileged desktop capabilities isolated from web content.
- Be explicit about browser-engine and native iOS compatibility limitations.
- Prefer small, testable modules over a monolithic simulator implementation.

## License

MIT — see [LICENSE](LICENSE).
