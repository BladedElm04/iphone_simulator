# Roadmap

## 0.1 — Interface prototype
- [x] Device shell and home screen
- [x] App grid and dock
- [x] Basic built-in app overlays
- [x] Device model selector
- [x] Lock screen and Control Center prototype
- [x] Interactive Control Center connectivity and Focus toggles
- [x] Interactive Settings app with connectivity, display, privacy, notifications, and device information

## 0.2 — Browser preview
- [x] Embedded website preview
- [x] URL navigation
- [x] Portrait and landscape orientation controls
- [x] Separate Electron Chromium webview for desktop navigation
- [ ] Browser history and session isolation
- [x] Back/forward navigation and address synchronization
- [x] Device viewport profiles
- [x] WebKit engine via Playwright with Chromium fallback

> The current device shell is a UI preview. It is not iOS, Safari, WebKit, or a native application runtime. Some websites block iframe embedding.

## 0.3 — Runtime foundation
- [ ] Define provider-neutral runtime and session contracts
- [ ] Add runtime capability discovery
- [ ] Add explicit provider connection states and error reporting
- [ ] Add session lifecycle manager
- [ ] Add secure desktop credential storage

## 0.4 — Free-first cloud runtime
- [ ] Research and implement Appetize integration for supported Simulator builds
- [ ] Upload and validate Simulator-compatible `.app` artifacts
- [ ] Display provider session stream and lifecycle
- [ ] Clearly display free-plan quotas and provider limitations

## 0.5 — Local Apple runtime
- [ ] Design Mac Bridge protocol
- [ ] Build optional macOS companion
- [ ] Discover Xcode and installed Simulator runtimes
- [ ] Launch and control Simulator sessions
- [ ] Investigate paired physical iPhone support

## 0.6 — Real-device provider
- [ ] Evaluate BrowserStack App Live integration
- [ ] Support provider-approved IPA upload workflow
- [ ] Support App Store installation where provider permits
- [ ] Display account, trial, and subscription restrictions

## 0.7 — Developer tools
- [ ] Playwright integration for web preview
- [ ] Console and network inspection
- [x] Touch, scroll, and keyboard input forwarding
- [ ] Screenshot capture and session recording

## 0.8 — Desktop distribution
- [ ] Validate Windows installer
- [ ] macOS packaging
- [ ] Linux packaging
- [ ] Update strategy
