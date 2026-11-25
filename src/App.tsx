import { useEffect, useState } from "react";
import {
  Activity, AppWindow, BatteryFull, Bluetooth, Camera, ChevronLeft, Compass,
  Folder, Globe, Image, Lock, MessageCircle, Music2, Phone,
  Settings, Signal, Smartphone, Wifi, X
} from "lucide-react";
import { defaultDeviceName, deviceProfiles, getDeviceProfile } from "./core/devices/profiles";
import { SafariApp } from "./features/safari/SafariApp";
import { SettingsApp } from "./features/settings/SettingsApp";
import type { SystemSettingsState } from "./features/settings/SettingsApp";

type AppId = "safari" | "settings" | "photos" | "files" | "phone" | "messages" | "camera" | "music";

const apps: { id: AppId; name: string; icon: typeof Globe; color: string }[] = [
  { id: "safari", name: "Safari", icon: Compass, color: "linear-gradient(145deg,#64d5ff,#0878d1)" },
  { id: "messages", name: "Messages", icon: MessageCircle, color: "linear-gradient(145deg,#67e878,#12a83b)" },
  { id: "photos", name: "Photos", icon: Image, color: "linear-gradient(145deg,#fff,#e6e6ed)" },
  { id: "camera", name: "Camera", icon: Camera, color: "linear-gradient(145deg,#555,#111)" },
  { id: "settings", name: "Settings", icon: Settings, color: "linear-gradient(145deg,#aeb7c2,#58616e)" },
  { id: "files", name: "Files", icon: Folder, color: "linear-gradient(145deg,#6fc9ff,#2874d7)" },
  { id: "phone", name: "Phone", icon: Phone, color: "linear-gradient(145deg,#67e878,#12a83b)" },
  { id: "music", name: "Music", icon: Music2, color: "linear-gradient(145deg,#ff7a91,#d91b42)" }
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
        <Signal size={15} />
        <Wifi size={15} className={wifi ? "" : "system-icon-muted"} />
        {batteryPercentage && <span>{batteryLevel === null ? "—" : `${batteryLevel}%`}</span>}
        <BatteryFull size={18} />
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
  const [systemSettings, setSystemSettings] = useState<SystemSettingsState>({
    airplaneMode: false,
    wifi: true,
    bluetooth: true,
    focus: false,
    darkAppearance: true,
    locationServices: true,
    batteryPercentage: true,
    brightness: 80
  });

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

  const openApp = (id: AppId) => {
    setActiveApp(id);
    setControlCenter(false);
  };

  const activeName = apps.find((item) => item.id === activeApp)?.name;

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
          <div className={`device-frame ${orientation}`}>
            <div className="device-bezel">
              <div className="screen" style={{ filter: `brightness(${systemSettings.brightness}%)` }}>
                <div className="wallpaper" />
                <StatusBar
                  time={timeLabel}
                  batteryPercentage={systemSettings.batteryPercentage}
                  batteryLevel={batteryLevel}
                  wifi={systemSettings.wifi && !systemSettings.airplaneMode}
                />
                <button
                  className={`dynamic-island${islandExpanded ? " expanded" : ""}`}
                  onClick={() => setIslandExpanded((value) => !value)}
                  aria-label="Toggle Dynamic Island"
                  aria-expanded={islandExpanded}
                >
                  <span className="island-camera" />
                  {islandExpanded && (
                    <span className="island-content">
                      <strong>{activeApp === "safari" ? "Safari" : "iPhone Simulator"}</strong>
                      <small>{systemSettings.focus ? "Focus is on" : systemSettings.wifi ? "Wi-Fi connected" : "Wi-Fi off"}</small>
                    </span>
                  )}
                </button>

                {locked ? (
                  <div className="lock-screen" onClick={() => setLocked(false)}>
                    <span>{dateLabel}</span><strong>{timeLabel}</strong><small>Tap to unlock</small>
                  </div>
                ) : (
                  <div className="home-screen">
                    <div className="home-date"><span>{dateLabel}</span><strong>{timeLabel}</strong></div>
                    <div className="widget-row">
                      <div className="weather-widget system-widget"><span>CONNECTIVITY</span><strong>{systemSettings.wifi && !systemSettings.airplaneMode ? "Wi-Fi" : "Offline"}</strong><small>{systemSettings.bluetooth ? "Bluetooth on" : "Bluetooth off"}</small><b><Wifi size={20} /></b></div>
                      <div className="calendar-widget"><span>{new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(now).toUpperCase()}</span><strong>{now.getDate()}</strong><small>{systemSettings.focus ? "Focus enabled" : "No focus active"}</small></div>
                    </div>
                    <div className="app-grid">{apps.map((item) => <AppIcon key={item.id} item={item} onOpen={() => openApp(item.id)} />)}</div>
                    <div className="dock">{apps.slice(0, 4).map((item) => <AppIcon key={item.id} item={item} onOpen={() => openApp(item.id)} />)}</div>
                  </div>
                )}

                {activeApp && (
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
                    ) : (
                      <div className="placeholder-app">
                        <div className="placeholder-icon">{activeApp === "settings" ? <Settings /> : activeApp === "photos" ? <Image /> : activeApp === "files" ? <Folder /> : activeApp === "phone" ? <Phone /> : activeApp === "camera" ? <Camera /> : activeApp === "music" ? <Music2 /> : <MessageCircle />}</div>
                        <h2>{activeName}</h2><p>This built-in app is part of the interface prototype.</p><span>More functionality is planned.</span>
                      </div>
                    )}
                    <button className="app-home-indicator" onClick={() => setActiveApp(null)} aria-label="Return to Home" />
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
                    <button className="lock-button" onClick={() => { setLocked(true); setControlCenter(false); setIslandExpanded(false); setActiveApp(null); }}>Lock Device</button>
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
