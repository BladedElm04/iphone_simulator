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
