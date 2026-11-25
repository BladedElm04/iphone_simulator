import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import {
  Activity, AppWindow, Battery, Bell, Bluetooth, Camera, ChevronLeft, Compass,
  Folder, Globe, Image, Lock, Map, MessageCircle, Music2, Phone,
  Settings, Smartphone, Sun, Timer, Wifi, X
} from "lucide-react";
import { defaultDeviceName, deviceProfiles, getDeviceProfile } from "./core/devices/profiles";
import { SafariApp } from "./features/safari/SafariApp";
import { SettingsApp } from "./features/settings/SettingsApp";
import type { SystemSettingsState } from "./features/settings/SettingsApp";
import { NativeApps, type NativeAppId } from "./features/native/NativeApps";

type AppId = "safari" | "settings" | "photos" | "files" | "phone" | "messages" | "camera" | "music" | "maps";

const apps: { id: AppId; name: string; icon: typeof Globe; color: string }[] = [
  { id: "safari", name: "Safari", icon: Compass, color: "linear-gradient(145deg,#64d5ff,#0878d1)" },
  { id: "messages", name: "Messages", icon: MessageCircle, color: "linear-gradient(145deg,#67e878,#12a83b)" },
  { id: "photos", name: "Photos", icon: Image, color: "linear-gradient(145deg,#fff,#e6e6ed)" },
  { id: "camera", name: "Camera", icon: Camera, color: "linear-gradient(145deg,#555,#111)" },
  { id: "settings", name: "Settings", icon: Settings, color: "linear-gradient(145deg,#aeb7c2,#58616e)" },
  { id: "files", name: "Files", icon: Folder, color: "linear-gradient(145deg,#6fc9ff,#2874d7)" },
  { id: "phone", name: "Phone", icon: Phone, color: "linear-gradient(145deg,#67e878,#12a83b)" },
  { id: "music", name: "Music", icon: Music2, color: "linear-gradient(145deg,#ff7a91,#d91b42)" },
  { id: "maps", name: "Maps", icon: Map, color: "linear-gradient(145deg,#8bd17c,#287c58)" }
];

function StatusBar({
  time,
  batteryPercentage,
  batteryLevel,
  wifi
}: {
  time: string;
  batteryPercentage: boolean;
  batteryLevel: number | null;
  wifi: boolean;
}) {
  return (
    <div className="status-bar">
      <span>{time}</span>
      <div className="status-icons">
        <Wifi size={15} className={wifi ? "" : "system-icon-muted"} />
        {batteryPercentage && batteryLevel !== null && <span>{batteryLevel}%</span>}
        <Battery size={18} />
      </div>
    </div>
  );
}

function AppIcon({ item, onOpen }: { item: typeof apps[number]; onOpen: () => void }) {
  const Icon = item.icon;
  return (
    <button className="app-icon" onClick={onOpen} aria-label={`Open ${item.name}`}>
      <span className="app-icon-art" style={{ background: item.color }}><Icon size={27} strokeWidth={1.8} /></span>
      <span>{item.name}</span>
    </button>
  );
}

export default function App() {
  const [activeApp, setActiveApp] = useState<AppId | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [islandExpanded, setIslandExpanded] = useState(false);
  const [timerEndsAt, setTimerEndsAt] = useState<number | null>(null);
  const [appSwitcherOpen, setAppSwitcherOpen] = useState(false);
  const [homePage, setHomePage] = useState(0);
  const [volume, setVolume] = useState(70);
  const homeSwipe = useRef<number | null>(null);
  const [recentApps, setRecentApps] = useState<AppId[]>([]);
  const [notificationCenter, setNotificationCenter] = useState(false);
  const [notifications, setNotifications] = useState<{ id: number; title: string; body: string; time: string }[]>([]);
  const screenGesture = useRef<{ x: number; y: number; edge: "top" | "bottom" } | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    type BatteryManagerLike = EventTarget & { level: number };
    const batteryNavigator = navigator as Navigator & {
      getBattery?: () => Promise<BatteryManagerLike>;
    };
    if (!batteryNavigator.getBattery) return;

    let battery: BatteryManagerLike | null = null;
    const updateBattery = () => {
      if (battery) setBatteryLevel(Math.round(battery.level * 100));
    };

    void batteryNavigator.getBattery().then((result) => {
      battery = result;
      updateBattery();
      battery.addEventListener("levelchange", updateBattery);
    }).catch(() => setBatteryLevel(null));

    return () => {
      battery?.removeEventListener("levelchange", updateBattery);
    };
  }, []);

  const timerSeconds = timerEndsAt === null ? 0 : Math.max(0, Math.ceil((timerEndsAt - now.getTime()) / 1000));
  const timerLabel = `${Math.floor(timerSeconds / 60)}:${String(timerSeconds % 60).padStart(2, "0")}`;
  useEffect(() => {
    if (timerEndsAt !== null && timerSeconds === 0) {
      setTimerEndsAt(null);
      setIslandExpanded(false);
      setNotifications((current) => [{ id: Date.now(), title: "Timer", body: "Your timer has finished.", time: "Now" }, ...current]);
    }
  }, [timerEndsAt, timerSeconds]);

  const timeLabel = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit"
  }).format(now);
  const dateLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric"
  }).format(now);
  const [device, setDevice] = useState(defaultDeviceName);
  const profile = getDeviceProfile(device);
  const [controlCenter, setControlCenter] = useState(false);
  const [locked, setLocked] = useState(false);
  const [deviceMenu, setDeviceMenu] = useState(false);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [systemSettings, setSystemSettings] = useState<SystemSettingsState>(() => {
    const defaults: SystemSettingsState = { airplaneMode: false, wifi: true, bluetooth: true, focus: false, darkAppearance: true, locationServices: true, batteryPercentage: true, brightness: 80 };
    try {
      const saved = window.localStorage.getItem("iphone-simulator-settings");
      return saved ? { ...defaults, ...JSON.parse(saved) as Partial<SystemSettingsState> } : defaults;
    } catch {
      return defaults;
    }
  });

  useEffect(() => {
    try { window.localStorage.setItem("iphone-simulator-settings", JSON.stringify(systemSettings)); } catch { /* Storage may be unavailable in restricted environments. */ }
  }, [systemSettings]);

  const updateSystemSetting = <K extends keyof SystemSettingsState>(key: K, value: SystemSettingsState[K]) => {
    setSystemSettings((current) => {
      const next = { ...current, [key]: value };
      if (key === "airplaneMode" && value === true) {
        next.wifi = false;
        next.bluetooth = false;
      }
      return next;
    });
  };

  const handleScreenPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const y = event.clientY - rect.top;
    screenGesture.current = y <= 24 ? { x: event.clientX - rect.left, y, edge: "top" } : y >= rect.height - 18 ? { x: event.clientX - rect.left, y, edge: "bottom" } : null;
  };

  const handleScreenPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = screenGesture.current;
    screenGesture.current = null;
    if (!start) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const deltaY = event.clientY - rect.top - start.y;
    if (start.edge === "top" && deltaY > 35) {
      if (start.x > rect.width * 0.55) setControlCenter(true);
      else setNotificationCenter(true);
      setAppSwitcherOpen(false);
    } else if (start.edge === "bottom" && deltaY < -35) {
      setAppSwitcherOpen(true);
      setNotificationCenter(false);
      setControlCenter(false);
    } else if (start.edge === "top" && deltaY < -35) {
      setNotificationCenter(false);
      setControlCenter(false);
    }
  };

  const openApp = (id: AppId) => {
    setActiveApp(id);
    setRecentApps((current) => [id, ...current.filter((item) => item !== id)]);
    setControlCenter(false);
    setAppSwitcherOpen(false);
    setNotificationCenter(false);
  };

  const closeApp = (id: AppId) => {
    setRecentApps((current) => current.filter((item) => item !== id));
    if (activeApp === id) setActiveApp(null);
  };

  const activeName = apps.find((item) => item.id === activeApp)?.name;
  const nativeAppIds: NativeAppId[] = ["photos", "files", "phone", "messages", "camera", "music", "maps"];
  const nativeApp = activeApp && nativeAppIds.includes(activeApp as NativeAppId) ? activeApp as NativeAppId : "photos";

  return (
    <main className="workspace">
      <header className="toolbar">
        <div className="brand-mark"><Smartphone size={19} /></div>
        <div className="brand-copy"><strong>iPhone Simulator</strong><span>Device testing environment</span></div>
        <div className="toolbar-spacer" />
        <div className="device-picker-wrap">
          <button className="device-picker" onClick={() => setDeviceMenu(!deviceMenu)}>
            <Smartphone size={14} />{device}<span className="chevron">⌄</span>
          </button>
          {deviceMenu && <div className="device-menu">
            {deviceProfiles.map(({ name }) => (
              <button key={name} onClick={() => { setDevice(name); setDeviceMenu(false); }}>
                {name}{device === name && <span>✓</span>}
              </button>
            ))}
          </div>}
        </div>
        <span className="toolbar-divider" />
        <span className="build-label">PREVIEW 0.1.0</span>
      </header>

      <section className="stage">
        <div className="stage-heading">
          <div><span className="eyebrow">DEVICE PREVIEW</span><h1>{device}</h1><p>Interface preview — no iOS runtime connected</p></div>
          <div className="stage-status"><span className="online-dot" />UI preview only</div>
        </div>

        <div className="device-area">
          <div className={`device-frame ${orientation} model-${profile.id}`} style={{ width: orientation === "portrait" ? 302 : 625, "--device-aspect-ratio": orientation === "portrait" ? `${profile.width} / ${profile.height}` : `${profile.height} / ${profile.width}` } as CSSProperties}>
            <div className="device-bezel">
              <div className="screen" style={{ filter: `brightness(${systemSettings.brightness}%)` }} onPointerDown={handleScreenPointerDown} onPointerUp={handleScreenPointerUp}>
                <div className="wallpaper" />
                <StatusBar
                  time={timeLabel}
                  batteryPercentage={systemSettings.batteryPercentage}
                  batteryLevel={batteryLevel}
                  wifi={systemSettings.wifi && !systemSettings.airplaneMode}
                />
                {profile.hasDynamicIsland ? <button
                  className={`dynamic-island${islandExpanded && timerEndsAt !== null ? " expanded" : ""}${timerEndsAt !== null ? " has-activity" : ""}`}
                  onClick={() => { if (timerEndsAt !== null) setIslandExpanded((value) => !value); }}
                  aria-label={timerEndsAt !== null ? "Show timer activity" : "Dynamic Island"}
                  aria-expanded={islandExpanded && timerEndsAt !== null}
                >
                  <span className="island-camera" />
                  {timerEndsAt !== null && (
                    <span className="island-content">
                      <span className="island-activity-icon"><Timer size={15} /></span>
                      <span className="island-activity-copy">
                        <strong>{timerLabel}</strong>
                        {islandExpanded && <small>Timer · Running</small>}
                      </span>
                    </span>
                  )}
                </button> : <div className="device-notch" aria-hidden="true" />}

                {locked ? (
                  <div className="lock-screen" onClick={() => setLocked(false)}>
                    <span>{dateLabel}</span><strong>{timeLabel}</strong><small>Tap to unlock</small>
                  </div>
                ) : (
                  <div className="home-screen" onPointerDown={(event) => { homeSwipe.current = event.clientX; }} onPointerUp={(event) => { if (homeSwipe.current === null) return; const delta = event.clientX - homeSwipe.current; homeSwipe.current = null; if (Math.abs(delta) > 35) setHomePage((page) => Math.max(0, Math.min(1, page + (delta < 0 ? 1 : -1)))); }}>
                    <div className="home-date"><span>{dateLabel}</span><strong>{timeLabel}</strong></div>
                    <div className="widget-row">
                      <div className="weather-widget system-widget"><span>CONNECTIVITY</span><strong>{systemSettings.wifi && !systemSettings.airplaneMode ? "Wi-Fi" : "Offline"}</strong><small>{systemSettings.bluetooth ? "Bluetooth on" : "Bluetooth off"}</small><b><Wifi size={20} /></b></div>
                      <div className="calendar-widget"><span>{new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(now).toUpperCase()}</span><strong>{now.getDate()}</strong><small>{systemSettings.focus ? "Focus enabled" : "No focus active"}</small></div>
                    </div>
                    <div className="app-grid">{apps.slice(homePage * 6, homePage * 6 + 6).map((item) => <AppIcon key={item.id} item={item} onOpen={() => openApp(item.id)} />)}</div>
                    <div className="home-page-dots">{[0, 1].map((page) => <button key={page} className={homePage === page ? "active" : ""} onClick={() => setHomePage(page)} aria-label={`Home page ${page + 1}`} />)}</div>
                    <div className="dock">{apps.slice(0, 4).map((item) => <AppIcon key={item.id} item={item} onOpen={() => openApp(item.id)} />)}</div>
                  </div>
                )}

                <div className="native-app-host" style={{ display: activeApp && nativeAppIds.includes(activeApp as NativeAppId) ? "flex" : "none" }}>
                  <header className="app-window-header"><button onClick={() => setActiveApp(null)} aria-label="Back to Home"><ChevronLeft size={18} /></button><strong>{activeName}</strong><button onClick={() => setActiveApp(null)} aria-label="Close app"><X size={17} /></button></header>
                  <NativeApps app={nativeApp} dark={systemSettings.darkAppearance} volume={volume} />
                  <button className="app-home-indicator" onClick={() => setActiveApp(null)} aria-label="Return to Home" />
                </div>

                {(activeApp === "safari" || activeApp === "settings") && (
                  <section className="app-window">
                    <header className="app-window-header">
                      <button onClick={() => setActiveApp(null)} aria-label="Back to Home"><ChevronLeft size={18} /></button>
                      <strong>{activeName}</strong>
                      <button onClick={() => setActiveApp(null)} aria-label="Close app"><X size={17} /></button>
                    </header>
                    {activeApp === "safari" ? (
                      <SafariApp profile={profile} orientation={orientation} />
                    ) : activeApp === "settings" ? (
                      <SettingsApp settings={systemSettings} onChange={updateSystemSetting} />
                    ) : null}
                    <button className="app-home-indicator" onClick={() => setActiveApp(null)} aria-label="Return to Home" />
                  </section>
                )}

                {appSwitcherOpen && (
                  <section className="app-switcher">
                    <header><strong>App Switcher</strong><button onClick={() => setAppSwitcherOpen(false)} aria-label="Close App Switcher"><X size={16} /></button></header>
                    {recentApps.length === 0 ? (
                      <p className="app-switcher-empty">No recently opened apps</p>
                    ) : (
                      <div className="app-switcher-cards">
                        {recentApps.map((id) => {
                          const item = apps.find((candidate) => candidate.id === id)!;
                          const Icon = item.icon;
                          return (
                            <article className="app-switcher-card" key={id}>
                              <button className="app-switcher-preview" onClick={() => openApp(id)}>
                                <span className="app-switcher-card-icon" style={{ background: item.color }}><Icon size={22} /></span>
                                <strong>{item.name}</strong>
                                <small>{id === "safari" ? "Web browser" : id === "settings" ? "System settings" : "App preview"}</small>
                              </button>
                              <button className="app-switcher-close" onClick={() => closeApp(id)} aria-label={"Close " + item.name}><X size={13} /></button>
                            </article>
                          );
                        })}
                      </div>
                    )}
                    <button className="app-switcher-home" onClick={() => { setActiveApp(null); setAppSwitcherOpen(false); }}>Home Screen</button>
                  </section>
                )}

                {notificationCenter && (
                  <section className="notification-center">
                    <header><strong>Notification Center</strong><button onClick={() => setNotificationCenter(false)} aria-label="Close Notification Center"><X size={16} /></button></header>
                    {notifications.length === 0 ? <div className="notification-empty"><Bell size={25} /><strong>No Notifications</strong><span>New notifications will appear here</span></div> : notifications.map((item) => <article className="notification-card" key={item.id}><div><Bell size={14} /><strong>{item.title}</strong><small>{item.time}</small></div><p>{item.body}</p></article>)}
                    {notifications.length > 0 && <button className="clear-notifications" onClick={() => setNotifications([])}>Clear All</button>}
                  </section>
                )}

                {controlCenter && (
                  <section className="control-center">
                    <div className="control-heading"><strong>Control Center</strong><button onClick={() => setControlCenter(false)} aria-label="Close Control Center"><X size={16} /></button></div>
                    <div className="control-grid">
  <button className={systemSettings.wifi ? "active" : ""} onClick={() => updateSystemSetting("wifi", !systemSettings.wifi)}><Wifi />Wi-Fi<span>{systemSettings.wifi ? "On" : "Off"}</span></button>
  <button className={systemSettings.bluetooth ? "active" : ""} onClick={() => updateSystemSetting("bluetooth", !systemSettings.bluetooth)}><Bluetooth />Bluetooth<span>{systemSettings.bluetooth ? "On" : "Off"}</span></button>
  <button className={systemSettings.focus ? "active" : ""} onClick={() => updateSystemSetting("focus", !systemSettings.focus)}><Activity />Focus<span>{systemSettings.focus ? "On" : "Off"}</span></button>
  <button className={systemSettings.airplaneMode ? "active" : ""} onClick={() => updateSystemSetting("airplaneMode", !systemSettings.airplaneMode)}><Smartphone />Airplane Mode<span>{systemSettings.airplaneMode ? "On" : "Off"}</span></button>
</div>
                    <div className="control-actions">
                      {timerEndsAt === null ? (
                        <button className="lock-button" onClick={() => { setTimerEndsAt(Date.now() + 60000); setIslandExpanded(true); setNotifications((current) => [{ id: Date.now(), title: "Timer", body: "A 1-minute timer has started.", time: "Now" }, ...current]); }}> <Timer size={14} /> Start 1-minute timer</button>
                      ) : (
                        <button className="lock-button" onClick={() => { setTimerEndsAt(null); setIslandExpanded(false); }}>Stop Timer</button>
                      )}
                      <label className="control-brightness"><Sun size={15} /><input aria-label="Display brightness" type="range" min="10" max="100" value={systemSettings.brightness} onChange={(event) => updateSystemSetting("brightness", Number(event.target.value))} /></label>
                      <label className="control-brightness"><span aria-hidden="true">−</span><input aria-label="System volume" type="range" min="0" max="100" value={volume} onChange={(event) => setVolume(Number(event.target.value))} /><span aria-hidden="true">+</span></label>
                      <button className="lock-button" onClick={() => { setLocked(true); setControlCenter(false); setIslandExpanded(false); setActiveApp(null); }}>Lock Device</button>
                    </div>
                  </section>
                )}
                <button className="home-indicator" onClick={() => { setActiveApp(null); setControlCenter(false); setIslandExpanded(false); }} aria-label="Return to Home" />
              </div>
            </div>
          </div>
          <div className="device-caption"><span className="caption-dot" />Live preview <i />{device}<i />{orientation === "portrait" ? "Portrait" : "Landscape"}</div>
        </div>
      </section>

      <aside className="inspector">
        <div className="inspector-title"><span>DEVICE CONTROLS</span><Settings size={16} /></div>
        <section className="inspector-section"><h3>Device</h3>
          <div className="detail-row"><span>Model</span><strong>{device}</strong></div>
          <div className="detail-row"><span>Orientation</span><strong>{orientation === "portrait" ? "Portrait" : "Landscape"}</strong></div>
          <div className="detail-row"><span>Appearance</span><strong>Dark wallpaper</strong></div>
          <div className="detail-row"><span>Display scale</span><strong>100%</strong></div>
        </section>
        <section className="inspector-section"><h3>Quick Actions</h3>
          <button className="control-button" onClick={() => setControlCenter(!controlCenter)}><Activity size={16} />Control Center</button>
          <button className="control-button" onClick={() => { setNotificationCenter(!notificationCenter); setControlCenter(false); }}><Bell size={16} />Notifications</button>
          <button className="control-button" onClick={() => { setActiveApp(null); setControlCenter(false); setAppSwitcherOpen(true); }}><AppWindow size={16} />App Switcher</button>
          <button className="control-button" onClick={() => setOrientation((value) => value === "portrait" ? "landscape" : "portrait")}><Smartphone size={16} />Rotate Device</button>
          <button className="control-button" onClick={() => { setLocked(!locked); setActiveApp(null); }}><Lock size={16} />{locked ? "Unlock Device" : "Lock Device"}</button>
          <button className="control-button" onClick={() => { setActiveApp(null); setControlCenter(false); setIslandExpanded(false); setLocked(false); }}><AppWindow size={16} />Go to Home Screen</button>
        </section>
        <section className="inspector-section"><h3>Runtime Status</h3><div className="runtime-status"><span className="online-dot" />Preview running</div><p>This preview does not boot iOS or execute native iOS apps. Connect a supported runtime to test real applications.</p></section>
        <footer className="inspector-footer"><span>iPhone Simulator</span><span>Build 0.1.0</span></footer>
      </aside>
    </main>
  );
}
