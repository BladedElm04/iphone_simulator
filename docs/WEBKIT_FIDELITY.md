# WebKit Fidelity

The Safari app renders pages with a real WebKit engine through Playwright when
the desktop app is running. This page describes what that gives you and what it
does not.

## What is reproduced

- The WebKit engine (layout, CSS, JavaScript, Web APIs as implemented by the
  Playwright WebKit build).
- The device's logical viewport (for example 402 x 874 for iPhone 16 Pro), so
  media queries and `window.innerWidth` match the device instead of the small
  on-screen preview.
- Device scale factor, a Mobile Safari user agent, touch events, and the mobile
  viewport meta tag behavior (`isMobile`).

## What is not reproduced

Playwright's WebKit builds for Windows and Linux are different ports from the
one that ships on iOS. Expect differences in:

- Native PDF rendering, including PDFs inside `iframe`, `embed`, and `object`.
- `env(safe-area-inset-*)` (always `0` here), dynamic toolbars, and `100vh` /
  `100dvh` behavior.
- Media codecs and autoplay policy, form autofill, and the on-screen keyboard
  resizing the viewport.
- Rubber-band scrolling, text-size adjustment, and Intelligent Tracking
  Prevention details.

The application labels the active engine at all times. A page that falls back to
Chromium is marked as "not WebKit".

## Testing PDFs for iOS

iOS Safari does not embed PDFs the way desktop and Android browsers do. A
viewer that relies on `iframe`, `embed`, or `object` pointing at a PDF commonly
shows only the first page or cannot scroll. Rendering the pages with
[PDF.js](https://mozilla.github.io/pdf.js/) into `canvas` elements is the
portable approach. Because this simulator cannot reproduce iOS PDF handling,
confirm PDF behavior on a real device or a hosted real-device provider.

## Setup

```bash
pnpm install
pnpm setup:webkit
# WSL / Linux only: system libraries required by WebKit
pnpm exec playwright install-deps webkit
```
