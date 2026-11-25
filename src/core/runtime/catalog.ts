import type {
  RuntimeDescriptor,
  RuntimeId
} from "./types";

export const runtimeCatalog: RuntimeDescriptor[] = [
  {
    id: "local-web-preview",
    name: "Local Web Preview",
    description: "Preview responsive websites inside the desktop client.",
    availability: "available",
    capabilities: ["web-preview", "keyboard-input"],
    requirements: [],
    limitation:
      "This is a browser preview, not iOS, Safari, WebKit, or native app execution."
  },
  {
    id: "playwright-webkit",
    name: "WebKit Engine (Playwright)",
    description: "Render websites with a real WebKit engine using an iPhone viewport, user agent, and touch input.",
    availability: "not-configured",
    capabilities: ["web-preview", "touch-input", "keyboard-input", "screenshot"],
    requirements: ["Playwright WebKit browser (pnpm setup:webkit)", "Linux system libraries on WSL (playwright install-deps webkit)"],
    limitation:
      "This is the WebKit engine, not iOS or Safari. Playwright's Windows and Linux builds are not the iOS port, so iOS-specific behavior (PDF handling, safe-area insets, dynamic toolbars, media codecs) is not reproduced."
  },
  {
    id: "apple-simulator",
    name: "Apple Simulator",
    description: "Run iOS Simulator builds using Apple's Simulator runtime.",
    availability: "unsupported-on-host",
    capabilities: [
      "simulator-app-install",
      "touch-input",
      "keyboard-input",
      "screenshot",
      "device-logs"
    ],
    requirements: ["macOS", "Xcode", "An installed iOS Simulator runtime"],
    limitation:
      "The official iOS Simulator runs on macOS. Windows and WSL cannot host it."
  },
  {
    id: "appetize",
    name: "Appetize",
    description: "Run supported iOS Simulator builds in a hosted environment.",
    availability: "not-configured",
    capabilities: ["simulator-app-install", "touch-input", "screenshot", "video-stream"],
    requirements: ["Appetize account", "Provider API credentials"],
    limitation:
      "Supported artifact formats, usage quotas, and features depend on the provider plan."
  },
  {
    id: "touchhle-legacy",
    name: "touchHLE (Legacy Apps)",
    description: "Experimental compatibility for selected early 32-bit iPhone OS applications.",
    availability: "planned",
    capabilities: ["legacy-ipa-run"],
    requirements: ["A compatible decrypted 32-bit app binary", "touchHLE runtime"],
    limitation:
      "Only a small subset of early iPhone OS 2.x, 3.x, and iOS 4.0.x apps is supported. It cannot run modern 64-bit iOS apps or install from the App Store."
  },
  {
    id: "browserstack",
    name: "BrowserStack App Live",
    description: "Test applications on hosted real iOS devices.",
    availability: "not-configured",
    capabilities: [
      "ipa-install",
      "app-store-install",
      "touch-input",
      "keyboard-input",
      "screenshot",
      "video-stream"
    ],
    requirements: ["BrowserStack account", "Provider subscription or eligible trial"],
    limitation:
      "App Store and IPA workflows depend on provider availability, account permissions, and plan limits."
  }
];

export function getRuntimeDescriptor(id: RuntimeId): RuntimeDescriptor | undefined {
  return runtimeCatalog.find((runtime) => runtime.id === id);
}

export function getAvailableRuntimes(): RuntimeDescriptor[] {
  return runtimeCatalog.filter((runtime) => runtime.availability === "available");
}
