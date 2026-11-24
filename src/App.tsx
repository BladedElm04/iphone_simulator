import { useState } from "react";
import type { ComponentType, HTMLAttributes } from "react";
import {
  Activity, AppWindow, BatteryFull, Bluetooth, Camera, ChevronLeft, Compass,
  ExternalLink, Folder, Globe, Image, Lock, MessageCircle, Music2, Phone, Search,
  Settings, Smartphone, Wifi, X
} from "lucide-react";

type ElectronWebviewProps = HTMLAttributes<HTMLElement> & { src: string; partition: string; webpreferences: string };
const ElectronWebview = "webview" as unknown as ComponentType<ElectronWebviewProps>;

const isDesktopElectron = Boolean((window as Window & { desktopRuntime?: { isElectron: boolean } }).desktopRuntime?.isElectron);

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

function StatusBar() {
  return (
    <div className="status-bar">
      <span>9:41</span>
      <div className="status-icons"><Activity size={13} /><Wifi size={15} /><BatteryFull size={18} /></div>
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
  const [address, setAddress] = useState("https://example.com");
  const [device, setDevice] = useState("iPhone 16 Pro");
  const [controlCenter, setControlCenter] = useState(false);
  const [locked, setLocked] = useState(false);
  const [deviceMenu, setDeviceMenu] = useState(false);
  const [browserUrl, setBrowserUrl] = useState("https://example.com");
  const [browserReloadKey, setBrowserReloadKey] = useState(0);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");

  const openApp = (id: AppId) => {
    setActiveApp(id);
    setControlCenter(false);
  };

  const navigate = () => {
    const input = address.trim();
    if (!input) return;

    const isWebAddress = /^(https?:\/\/)?(localhost|[\w-]+\.)+[a-z]{2,}([:/?#].*)?$/i.test(input)
      || /^https?:\/\//i.test(input)
      || /^localhost([:/].*)?$/i.test(input);

    const target = isWebAddress
      ? (/^https?:\/\//i.test(input) ? input : `https://${input}`)
      : `https://www.google.com/search?q=${encodeURIComponent(input)}`;

    setAddress(target);
    setBrowserUrl(target);
    setBrowserReloadKey((value) => value + 1);
  };

  const openWebsiteInBrowser = () => {
    window.open(browserUrl, "_blank", "noopener,noreferrer");
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
            {["iPhone 16 Pro", "iPhone 16", "iPhone 15 Pro", "iPhone 14"].map((name) => (
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
              <div className="screen">
                <div className="wallpaper" />
                <StatusBar />
                <button className="dynamic-island" onClick={() => setControlCenter(!controlCenter)} aria-label="Toggle Control Center"><span /></button>

                {locked ? (
                  <div className="lock-screen" onClick={() => setLocked(false)}>
                    <span>Tuesday, November 24</span><strong>9:41</strong><small>Tap to unlock</small>
                  </div>
                ) : (
                  <div className="home-screen">
                    <div className="home-date"><span>Tuesday, November 24</span><strong>9:41</strong></div>
                    <div className="widget-row">
                      <div className="weather-widget"><span>WEATHER</span><strong>22°</strong><small>Partly cloudy</small><b>☀</b></div>
                      <div className="calendar-widget"><span>TUE</span><strong>24</strong><small>No events today</small></div>
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
                      <div className="browser-app">
                        <div className="browser-address"><Lock size={12} /><input value={address} onChange={(event) => setAddress(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") navigate(); }} aria-label="Website address" /><button onClick={navigate} aria-label="Go to website"><Search size={14} /></button><button onClick={() => setBrowserReloadKey((value) => value + 1)} aria-label="Reload website"><Activity size={14} /></button></div>
                        <div className="browser-content">
                          {isDesktopElectron ? (
                            <ElectronWebview
                              key={browserReloadKey}
                              className="browser-viewport"
                              src={browserUrl}
                              partition="persist:iphone-simulator-browser"
                              webpreferences="contextIsolation=yes,nodeIntegration=no,sandbox=yes"
                            />
                          ) : (
                            <>
                              <iframe key={browserReloadKey} className="browser-viewport" src={browserUrl} title="Website preview" />
                              <div className="browser-note">
                                <span>Some websites block embedded previews. You can still open the page in a regular browser tab.</span>
                                <button onClick={openWebsiteInBrowser}><ExternalLink size={13} />Open website</button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
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
                    <div className="control-grid"><div><Wifi />Wi-Fi</div><div><Activity />Focus</div><div><Bluetooth />Bluetooth</div><div><Lock />Screen Lock</div></div>
                    <button className="lock-button" onClick={() => { setLocked(true); setControlCenter(false); setActiveApp(null); }}>Lock Device</button>
                  </section>
                )}
                <button className="home-indicator" onClick={() => { setActiveApp(null); setControlCenter(false); }} aria-label="Return to Home" />
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
          <button className="control-button" onClick={() => { setActiveApp(null); setControlCenter(false); setLocked(false); }}><AppWindow size={16} />Go to Home Screen</button>
        </section>
        <section className="inspector-section"><h3>Runtime Status</h3><div className="runtime-status"><span className="online-dot" />Preview running</div><p>This preview does not boot iOS or execute native iOS apps. Connect a supported runtime to test real applications.</p></section>
        <footer className="inspector-footer"><span>iPhone Simulator</span><span>Build 0.1.0</span></footer>
      </aside>
    </main>
  );
}
