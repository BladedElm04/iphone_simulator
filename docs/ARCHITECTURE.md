# Architecture

## Current structure

- `src/`: shared React interface used by Vite and Electron.
- `apps/desktop/`: Electron main process and desktop lifecycle.
- `docs/`: architecture decisions and development roadmap.

## Planned modules

As the codebase grows, extract stable capabilities into workspace packages:

- `packages/device-engine`: device profiles, viewport, orientation, and input abstractions.
- `packages/app-runtime`: app registry, launch lifecycle, and persistence.
- `packages/browser-engine`: browser sessions and navigation policies.
- `packages/shared`: shared domain types and validation.

## Security boundaries

The Electron renderer must not receive direct Node.js access. Keep context isolation enabled, Node integration disabled, and sandboxing enabled. Add a narrow preload bridge only when privileged desktop capabilities are required.

The web build cannot provide arbitrary local-file access or native iOS runtime functionality. Those capabilities require explicit platform integrations.
