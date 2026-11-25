export interface WebKitStartOptions {
  userAgent: string;
  width: number;
  height: number;
  deviceScaleFactor: number;
  url?: string;
}

export interface WebKitState {
  url: string;
  title: string;
  engineVersion: string;
}

export type WebKitResult = { ok: true; engineVersion?: string } | { ok: false; error: string };

export type WebKitInput =
  | { type: "tap"; x: number; y: number }
  | { type: "scroll"; x: number; y: number; dx: number; dy: number }
  | { type: "key"; key: string };

export interface WebKitBridge {
  start(options: WebKitStartOptions): Promise<WebKitResult>;
  stop(): Promise<WebKitResult>;
  navigate(url: string): Promise<WebKitResult>;
  goBack(): Promise<WebKitResult>;
  goForward(): Promise<WebKitResult>;
  reload(): Promise<WebKitResult>;
  resize(size: { width: number; height: number }): Promise<WebKitResult>;
  input(event: WebKitInput): Promise<WebKitResult>;
  onFrame(listener: (base64Jpeg: string) => void): () => void;
  onState(listener: (state: WebKitState) => void): () => void;
}

declare global {
  interface Window {
    desktopRuntime?: { isElectron: boolean; webkit?: WebKitBridge };
  }
}

/** Returns the WebKit bridge exposed by the Electron preload, if running in the desktop app. */
export function getWebKitBridge(): WebKitBridge | undefined {
  return window.desktopRuntime?.webkit;
}
