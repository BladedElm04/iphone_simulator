export type RuntimeId =
  | "local-web-preview"
  | "apple-simulator"
  | "appetize"
  | "browserstack";

export type RuntimeAvailability =
  | "available"
  | "not-configured"
  | "unsupported-on-host"
  | "planned";

export type RuntimeCapability =
  | "web-preview"
  | "simulator-app-install"
  | "ipa-install"
  | "app-store-install"
  | "touch-input"
  | "keyboard-input"
  | "screenshot"
  | "video-stream"
  | "device-logs";

export interface RuntimeDescriptor {
  id: RuntimeId;
  name: string;
  description: string;
  availability: RuntimeAvailability;
  capabilities: RuntimeCapability[];
  requirements: string[];
  limitation?: string;
}

export interface RuntimeSession {
  id: string;
  runtimeId: RuntimeId;
  status: "starting" | "running" | "stopping" | "stopped" | "failed";
  deviceName?: string;
  startedAt?: string;
  error?: string;
}

export interface RuntimeAdapter {
  readonly descriptor: RuntimeDescriptor;
  checkAvailability(): Promise<RuntimeAvailability>;
  startSession(options?: Record<string, unknown>): Promise<RuntimeSession>;
  stopSession(sessionId: string): Promise<void>;
}
