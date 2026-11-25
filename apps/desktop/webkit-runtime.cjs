"use strict";

// Runs a real WebKit engine (via Playwright) in the Electron main process and
// streams JPEG frames to the renderer. Input is forwarded as touch/wheel/keys.

const FRAME_INTERVAL_MS = 100;
const JPEG_QUALITY = 84;
const NAVIGATION_TIMEOUT_MS = 30000;
const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);
const NAMED_KEYS = new Set([
  "Backspace", "Delete", "Enter", "Tab", "Escape",
  "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"
]);

function toSafeUrl(input) {
  const url = new URL(String(input));
  if (!ALLOWED_PROTOCOLS.has(url.protocol)) {
    throw new Error("Only http and https addresses are supported.");
  }
  return url.toString();
}

function finite(value, name) {
  if (typeof value !== "number" || !Number.isFinite(value)) throw new Error(`Invalid ${name}.`);
  return value;
}

function clampInt(value, name, min, max) {
  return Math.min(max, Math.max(min, Math.round(finite(value, name))));
}

function firstLine(error) {
  return String(error && error.message ? error.message : error).split("\n")[0];
}

function createWebKitRuntime({ onFrame, onState }) {
  let browser = null;
  let context = null;
  let page = null;
  let captureToken = 0;
  let captureTimer = null;
  let queue = Promise.resolve();

  // Lifecycle calls run one at a time so start/stop never interleave.
  function serial(task) {
    const run = queue.then(task);
    queue = run.catch(() => undefined);
    return run;
  }

  function requirePage() {
    if (!page) throw new Error("No WebKit session is running.");
    return page;
  }

  async function publishState() {
    const currentPage = page;
    const currentBrowser = browser;
    if (!currentPage || !currentBrowser || currentPage.isClosed()) return;

    try {
      const title = await currentPage.title().catch(() => "");
      // A navigation or teardown may replace the page while title() is pending.
      if (page !== currentPage || browser !== currentBrowser || currentPage.isClosed()) return;
      onState({
        url: currentPage.url(),
        title,
        engineVersion: currentBrowser.version()
      });
    } catch {
      // Ignore state updates from pages that are closing or being replaced.
    }
  }

  function beginCapture() {
    const token = ++captureToken;
    const tick = async () => {
      if (token !== captureToken || !page) return;
      try {
        const buffer = await page.screenshot({ type: "jpeg", quality: JPEG_QUALITY, scale: "device" });
        if (token === captureToken) onFrame(buffer.toString("base64"));
      } catch {
        // The page can be mid-navigation; skip this frame.
      }
      if (token === captureToken) captureTimer = setTimeout(tick, FRAME_INTERVAL_MS);
    };
    void tick();
  }

  async function teardown() {
    captureToken += 1;
    clearTimeout(captureTimer);
    const current = browser;
    browser = null;
    context = null;
    page = null;
    if (current) await current.close().catch(() => undefined);
  }

  function wire(mainPage) {
    mainPage.on("framenavigated", (frame) => {
      if (frame === mainPage.mainFrame()) void publishState();
    });
    mainPage.on("load", () => void publishState());
    // Single-tab model: links that open a new window navigate the main page.
    context.on("page", async (popup) => {
      await popup.waitForLoadState("domcontentloaded").catch(() => undefined);
      const target = popup.url();
      await popup.close().catch(() => undefined);
      if (page === mainPage && /^https?:/i.test(target)) {
        await mainPage.goto(target, { timeout: NAVIGATION_TIMEOUT_MS }).catch(() => undefined);
      }
    });
  }

  function start(options) {
    return serial(async () => {
      await teardown();
      const width = clampInt(options.width, "width", 200, 1600);
      const height = clampInt(options.height, "height", 200, 3200);
      const deviceScaleFactor = clampInt(options.deviceScaleFactor, "deviceScaleFactor", 1, 4);
      const userAgent = String(options.userAgent || "");

      let webkit;
      try {
        ({ webkit } = require("playwright"));
      } catch {
        throw new Error("The playwright package is not installed. Run `pnpm install`.");
      }

      try {
        browser = await webkit.launch({ headless: true });
      } catch (error) {
        throw new Error(
          "Playwright WebKit could not start. Run `pnpm setup:webkit` " +
          "(on WSL/Linux also `pnpm exec playwright install-deps webkit`). " +
          `Details: ${firstLine(error)}`
        );
      }

      context = await browser.newContext({
        userAgent,
        viewport: { width, height },
        deviceScaleFactor,
        isMobile: true,
        hasTouch: true,
        locale: "en-US"
      });
      page = await context.newPage();
      wire(page);
      beginCapture();

      if (options.url) {
        await page.goto(toSafeUrl(options.url), { waitUntil: "domcontentloaded", timeout: NAVIGATION_TIMEOUT_MS })
          .catch(() => undefined);
      }
      await publishState();
      return { engineVersion: browser.version() };
    });
  }

  function stop() {
    return serial(teardown);
  }

  async function navigate(url) {
    await requirePage().goto(toSafeUrl(url), { waitUntil: "domcontentloaded", timeout: NAVIGATION_TIMEOUT_MS });
  }

  async function goBack() { await requirePage().goBack(); }
  async function goForward() { await requirePage().goForward(); }
  async function reload() { await requirePage().reload({ timeout: NAVIGATION_TIMEOUT_MS }); }

  async function resize(size) {
    await requirePage().setViewportSize({
      width: clampInt(size.width, "width", 200, 1600),
      height: clampInt(size.height, "height", 200, 3200)
    });
  }

  async function input(event) {
    const target = requirePage();
    switch (event && event.type) {
      case "tap":
        await target.touchscreen.tap(finite(event.x, "x"), finite(event.y, "y"));
        break;
      case "scroll":
        await target.mouse.move(finite(event.x, "x"), finite(event.y, "y"));
        await target.mouse.wheel(finite(event.dx, "dx"), finite(event.dy, "dy"));
        break;
      case "drag": {
        const x = finite(event.x, "x");
        const y = finite(event.y, "y");
        const dx = finite(event.dx, "dx");
        const dy = finite(event.dy, "dy");
        await target.evaluate(({ x, y, dx, dy }) => {
          const start = document.elementFromPoint(x, y);
          let scrollable = start;
          while (scrollable && scrollable !== document.documentElement) {
            const style = getComputedStyle(scrollable);
            const canScrollY = /(auto|scroll)/.test(style.overflowY) && scrollable.scrollHeight > scrollable.clientHeight;
            const canScrollX = /(auto|scroll)/.test(style.overflowX) && scrollable.scrollWidth > scrollable.clientWidth;
            if (canScrollY || canScrollX) break;
            scrollable = scrollable.parentElement;
          }
          const targetElement = scrollable && scrollable !== document.documentElement
            ? scrollable
            : document.scrollingElement;
          if (targetElement) {
            targetElement.scrollTop -= dy;
            targetElement.scrollLeft -= dx;
          }
        }, { x, y, dx, dy });
        break;
      }
      case "key":
        if (NAMED_KEYS.has(event.key)) await target.keyboard.press(event.key);
        else if (typeof event.key === "string" && [...event.key].length === 1) await target.keyboard.type(event.key);
        else throw new Error("Unsupported key.");
        break;
      default:
        throw new Error("Unsupported input event.");
    }
  }

  return { start, stop, navigate, goBack, goForward, reload, resize, input };
}

module.exports = { createWebKitRuntime };
