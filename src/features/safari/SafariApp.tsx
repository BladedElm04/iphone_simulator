import { useCallback, useEffect, useRef, useState } from "react";
import type { ComponentType, HTMLAttributes, KeyboardEvent, PointerEvent, WheelEvent } from "react";
import { ArrowLeft, ArrowRight, ExternalLink, Lock, RotateCw, Search } from "lucide-react";
import { getWebKitBridge } from "../../core/desktop/bridge";
import type { WebKitState } from "../../core/desktop/bridge";
import type { DeviceProfile } from "../../core/devices/profiles";
import { resolveAddress } from "./address";

type ElectronWebviewProps = HTMLAttributes<HTMLElement> & { src: string; partition: string; webpreferences: string };
const ElectronWebview = "webview" as unknown as ComponentType<ElectronWebviewProps>;

const HOME_URL = "https://example.com";
const TAP_SLOP_PX = 6;
const SCROLL_INTERVAL_MS = 16;

type Engine = "starting" | "webkit" | "fallback";
type Orientation = "portrait" | "landscape";

interface SafariAppProps {
  profile: DeviceProfile;
  orientation: Orientation;
}

interface Gesture {
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  lastSentAt: number;
  dragging: boolean;
}

/**
 * Page viewport in CSS points. The width is the device's logical width and the
 * height follows the on-screen aspect ratio, so the stream is never stretched.
 */
function computeViewport(element: HTMLElement, profile: DeviceProfile, orientation: Orientation) {
  const width = orientation === "portrait" ? profile.width : profile.height;
  const rect = element.getBoundingClientRect();
  const height = Math.max(200, Math.round((rect.height / Math.max(rect.width, 1)) * width));
  return { width, height };
}

export function SafariApp({ profile, orientation }: SafariAppProps) {
  const bridge = getWebKitBridge();
  const surfaceRef = useRef<HTMLDivElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const viewport = useRef({ width: profile.width, height: profile.height });
  const gesture = useRef<Gesture | null>(null);
  const currentUrl = useRef(HOME_URL);

  const [engine, setEngine] = useState<Engine>(bridge ? "starting" : "fallback");
  const [engineVersion, setEngineVersion] = useState("");
  const [frame, setFrame] = useState<string | null>(null);
  const [address, setAddress] = useState(HOME_URL);
  const [error, setError] = useState<string | null>(null);
  const [fallbackUrl, setFallbackUrl] = useState(HOME_URL);
  const [fallbackKey, setFallbackKey] = useState(0);

  const handleState = useCallback((state: WebKitState) => {
    currentUrl.current = state.url;
    if (document.activeElement !== addressRef.current) setAddress(state.url);
  }, []);

  // Start (or restart) the WebKit session whenever the device changes.
  useEffect(() => {
    if (!bridge || !surfaceRef.current) return;
    let cancelled = false;
    const size = computeViewport(surfaceRef.current, profile, orientation);
    viewport.current = size;
    setEngine("starting");
    setFrame(null);
    const offFrame = bridge.onFrame(setFrame);
    const offState = bridge.onState(handleState);

    void bridge
      .start({ ...size, userAgent: profile.userAgent, deviceScaleFactor: profile.deviceScaleFactor, url: currentUrl.current })
      .then((result) => {
        if (cancelled) return;
        if (result.ok) {
          setEngine("webkit");
          setEngineVersion(result.engineVersion ?? "");
          setError(null);
        } else {
          setEngine("fallback");
          setFallbackUrl(currentUrl.current);
          setError(result.error);
        }
      });

    return () => {
      cancelled = true;
      offFrame();
      offState();
      void bridge.stop();
    };
    // Orientation changes are handled by the resize effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bridge, profile, handleState]);

  useEffect(() => {
    if (engine !== "webkit" || !bridge || !surfaceRef.current) return;
    const size = computeViewport(surfaceRef.current, profile, orientation);
    viewport.current = size;
    void bridge.resize(size);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orientation, engine]);

  const navigate = () => {
    const target = resolveAddress(address);
    if (!target) return;
    setAddress(target);
    currentUrl.current = target;
    if (engine === "webkit" && bridge) {
      void bridge.navigate(target).then((result) => setError(result.ok ? null : result.error));
    } else {
      setFallbackUrl(target);
      setFallbackKey((value) => value + 1);
    }
  };

  const reload = () => {
    if (engine === "webkit" && bridge) void bridge.reload();
    else setFallbackKey((value) => value + 1);
  };

  const toPage = (clientX: number, clientY: number) => {
    const rect = surfaceRef.current!.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * viewport.current.width,
      y: ((clientY - rect.top) / rect.height) * viewport.current.height
    };
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.focus();
    gesture.current = {
      startX: event.clientX, startY: event.clientY, lastX: event.clientX, lastY: event.clientY,
      lastSentAt: 0, dragging: false
    };
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const current = gesture.current;
    if (!current || !bridge) return;
    if (!current.dragging && Math.hypot(event.clientX - current.startX, event.clientY - current.startY) > TAP_SLOP_PX) {
      current.dragging = true;
    }
    const now = performance.now();
    if (!current.dragging || now - current.lastSentAt < SCROLL_INTERVAL_MS) return;
    const to = toPage(event.clientX, event.clientY);
    const from = toPage(current.lastX, current.lastY);
    void bridge.input({ type: "scroll", x: to.x, y: to.y, dx: from.x - to.x, dy: from.y - to.y });
    current.lastX = event.clientX;
    current.lastY = event.clientY;
    current.lastSentAt = now;
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const current = gesture.current;
    gesture.current = null;
    if (!current || current.dragging || !bridge) return;
    const point = toPage(event.clientX, event.clientY);
    void bridge.input({ type: "tap", ...point });
  };

  const onWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (!bridge) return;
    const point = toPage(event.clientX, event.clientY);
    void bridge.input({ type: "scroll", ...point, dx: event.deltaX, dy: event.deltaY });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!bridge || event.metaKey || event.ctrlKey || event.altKey) return;
    event.preventDefault();
    void bridge.input({ type: "key", key: event.key });
  };

  const interactive = engine === "webkit";
  const badge = engine === "starting"
    ? "Starting WebKit…"
    : engine === "webkit"
      ? `WebKit ${engineVersion} via Playwright — engine only, not iOS Safari`
      : bridge ? "Chromium preview — not WebKit" : "Browser iframe preview — not WebKit";

  return (
    <div className="browser-app">
      <div className="browser-address">
        <button onClick={() => void bridge?.goBack()} disabled={!interactive} aria-label="Back"><ArrowLeft size={14} /></button>
        <button onClick={() => void bridge?.goForward()} disabled={!interactive} aria-label="Forward"><ArrowRight size={14} /></button>
        <Lock size={12} />
        <input
          ref={addressRef}
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          onKeyDown={(event) => { if (event.key === "Enter") navigate(); }}
          aria-label="Website address"
        />
        <button onClick={navigate} aria-label="Go to website"><Search size={14} /></button>
        <button onClick={reload} aria-label="Reload website"><RotateCw size={14} /></button>
      </div>
      <div className={`browser-engine ${engine}`}>{badge}</div>
      {error && <div className="browser-error" title={error}>{error}</div>}
      <div className="browser-content">
        {bridge ? (
          <div
            ref={surfaceRef}
            className="webkit-surface"
            tabIndex={0}
            onPointerDown={interactive ? onPointerDown : undefined}
            onPointerMove={interactive ? onPointerMove : undefined}
            onPointerUp={interactive ? onPointerUp : undefined}
            onWheel={interactive ? onWheel : undefined}
            onKeyDown={interactive ? onKeyDown : undefined}
          >
            {interactive && frame && <img src={`data:image/jpeg;base64,${frame}`} alt="WebKit page" draggable={false} />}
            {engine === "starting" && <span className="webkit-starting">Starting WebKit…</span>}
            {engine === "fallback" && (
              <ElectronWebview
                key={fallbackKey}
                className="browser-viewport"
                src={fallbackUrl}
                partition="persist:iphone-simulator-browser"
                webpreferences="contextIsolation=yes,nodeIntegration=no,sandbox=yes"
              />
            )}
          </div>
        ) : (
          <>
            <iframe key={fallbackKey} className="browser-viewport" src={fallbackUrl} title="Website preview" />
            <div className="browser-note">
              <span>Some websites block embedded previews. Run the desktop app for a real WebKit engine.</span>
              <button onClick={() => window.open(fallbackUrl, "_blank", "noopener,noreferrer")}><ExternalLink size={13} />Open website</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
