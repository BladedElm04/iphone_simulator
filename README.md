# iPhone Simulator

An open-source, Windows-first desktop client for managing mobile web previews and real iOS testing environments.

> **Important:** This application does not emulate iOS. Windows and WSL cannot run Apple's official iOS Simulator or execute arbitrary App Store apps locally. Real iOS execution must be delegated to macOS/Xcode, a compatible cloud simulator, or hosted physical iPhones.

## Project status

**Early development — UI prototype and runtime foundation**

- iPhone-inspired device preview and desktop workspace
- Interactive home screen, app placeholders, Control Center, and lock-screen preview
- Embedded website preview (not Safari or WebKit)
- Provider-neutral runtime contracts and capability catalog
- Planned Apple Simulator, Appetize, and BrowserStack integrations

The current device shell is a visual interface preview. It must not be treated as a running iOS device. The runtime catalog reports this distinction and describes the requirements and limitations of each planned execution provider.

## Runtime strategy

| Runtime | What it provides | Requirements |
|---|---|---|
| Local Web Preview | Responsive website preview | Windows, Linux, or macOS |
| Apple Simulator | Native iOS Simulator app testing | macOS and Xcode |
| Appetize | Hosted sessions for supported Simulator builds | Provider account and available quota |
| BrowserStack App Live | Hosted real iPhones, including supported IPA and App Store workflows | Provider account; ongoing use may require a paid plan |

A Simulator-built `.app` and a device `.ipa` are different artifacts. Neither can be launched directly by Windows or WSL as a native iOS application.

## Tech stack

- React, TypeScript, and Vite
- Electron for the desktop shell
- pnpm
- Playwright planned for web-preview automation

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

## Roadmap and architecture

- [Roadmap](docs/ROADMAP.md)
- [Architecture](docs/ARCHITECTURE.md)

## Principles

- English-only UI, documentation, identifiers, and code comments.
- TypeScript-first development.
- Keep privileged desktop capabilities isolated from web content.
- Never report a preview as a real iOS runtime.
- Keep provider-specific behavior behind shared runtime contracts.
- Prefer small, testable modules over a monolithic implementation.

## License

MIT — see [LICENSE](LICENSE).
