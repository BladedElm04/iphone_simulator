# Architecture

## Product boundary

iPhone Simulator is a Windows-first desktop client for managing iOS testing environments. It does not emulate iOS and does not execute App Store applications on Windows or WSL.

The Electron application owns the desktop experience. Actual iOS execution is delegated to a compatible runtime:

- **Apple Simulator runtime:** runs on macOS through Xcode.
- **Cloud device providers:** remote simulators or real iPhones, subject to provider capabilities and account limits.
- **Legacy compatibility runtime:** touchHLE can run a limited subset of early 32-bit iPhone OS apps; it is not a modern iOS simulator and does not provide App Store access.
- **Local web preview:** a responsive interface preview only; it is not an iOS runtime.

## Application layers

- `src/app` and `src/features`: user interface and workflows.
- `src/core/runtime`: provider-neutral runtime contracts and registry.
- `src/providers`: provider-specific adapters.
- `apps/desktop`: Electron main process and secure desktop lifecycle.
- `apps/mac-bridge`: planned optional macOS companion for Xcode Simulator and paired devices.

## Runtime contract

Every execution provider must implement the shared `RuntimeAdapter` contract. The UI must consume capabilities and session state from that contract rather than assuming every provider supports the same operations.

A provider must report unsupported capabilities explicitly. In particular, App Store installation, IPA installation, Simulator build upload, screenshots, touch input, and live video must not be inferred from a generic "connected" state.

## Planned provider support

| Provider | Purpose | Platform / constraints |
|---|---|---|
| Playwright WebKit | Real WebKit engine with iPhone viewport and touch input | Windows, Linux; not the iOS port |
| Local Web Preview | Responsive website preview | Windows, Linux, macOS; not native iOS |
| Apple Simulator | Execute Simulator-compatible builds | macOS + Xcode required |
| Appetize | Hosted iOS Simulator sessions | Provider plan and supported build format apply |
| BrowserStack App Live | Real-device sessions, App Store and IPA workflows | Cloud account and paid-plan limits may apply |
| touchHLE | Selected early 32-bit iPhone OS apps | Legacy decrypted app binaries only; not modern iOS or App Store |
| Mac Bridge | Connect this desktop client to a user's Mac | Optional companion; requires macOS and Xcode |

## Security boundaries

- Keep Electron context isolation enabled, Node integration disabled, and sandboxing enabled.
- Do not expose provider API keys to the renderer.
- Provider credentials must be stored by the desktop main process or an OS credential store, never in browser local storage.
- Validate uploaded file type and size before sending files to a provider.
- Use a narrow preload bridge for privileged desktop operations.
- Never claim that a session is an iOS device unless a real simulator or device provider confirms it.

## Important file distinctions

- `.app` built for an iOS Simulator is not the same artifact as a device `.ipa`.
- An IPA is not directly executable by Windows or WSL.
- App Store installation requires a compatible Apple device or a provider that explicitly supports that workflow.
