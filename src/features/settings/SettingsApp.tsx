import { useState } from "react";
import {
  BatteryFull, Bell, Bluetooth, ChevronLeft, ChevronRight, CircleUserRound,
  Focus, Lock, Moon, Plane, Search, ShieldCheck, Smartphone, Sun, Wifi
} from "lucide-react";

export interface SystemSettingsState {
  airplaneMode: boolean;
  wifi: boolean;
  bluetooth: boolean;
  focus: boolean;
  darkAppearance: boolean;
  locationServices: boolean;
  batteryPercentage: boolean;
  brightness: number;
}

interface SettingsAppProps {
  settings: SystemSettingsState;
  onChange: <K extends keyof SystemSettingsState>(key: K, value: SystemSettingsState[K]) => void;
}

type SettingsPage = "main" | "display" | "privacy" | "notifications" | "about";

function SettingSwitch({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      className={`ios-switch ${checked ? "is-on" : ""}`}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
    >
      <span />
    </button>
  );
}

export function SettingsApp({ settings, onChange }: SettingsAppProps) {
  const [page, setPage] = useState<SettingsPage>("main");
  const [query, setQuery] = useState("");

  const goBack = () => setPage("main");
  const row = (icon: React.ReactNode, title: string, detail: string, action: () => void) => (
    <button className="ios-settings-row" onClick={action}>
      <span className="ios-settings-icon">{icon}</span>
      <span className="ios-settings-label">{title}</span>
      <span className="ios-settings-detail">{detail}</span>
      <ChevronRight size={15} />
    </button>
  );
  const toggleRow = (icon: React.ReactNode, title: string, value: boolean, key: keyof SystemSettingsState) => (
    <div className="ios-settings-row">
      <span className="ios-settings-icon">{icon}</span>
      <span className="ios-settings-label">{title}</span>
      <SettingSwitch checked={value} onChange={(next) => onChange(key, next as never)} />
    </div>
  );

  if (page === "display") {
    return (
      <div className="ios-settings-page">
        <header className="ios-settings-nav"><button onClick={goBack}><ChevronLeft size={17} />Settings</button><strong>Display & Brightness</strong><span /></header>
        <div className="ios-settings-content">
          <div className="ios-settings-preview"><Sun size={24} /><strong>Display</strong><span>Adjust the screen appearance and brightness.</span></div>
          <h4>APPEARANCE</h4>
          <div className="ios-settings-group">
            <div className="ios-settings-row"><span className="ios-settings-icon"><Moon /></span><span className="ios-settings-label">Dark Appearance</span><SettingSwitch checked={settings.darkAppearance} onChange={(value) => onChange("darkAppearance", value)} /></div>
          </div>
          <h4>BRIGHTNESS</h4>
          <div className="ios-settings-group ios-brightness-control"><Sun size={15} /><input aria-label="Brightness" type="range" min="10" max="100" value={settings.brightness} onChange={(event) => onChange("brightness", Number(event.target.value))} /><Sun size={19} /></div>
          <p className="ios-settings-footnote">Brightness changes are simulated in this device preview.</p>
        </div>
      </div>
    );
  }

  if (page === "privacy") {
    return (
      <div className="ios-settings-page">
        <header className="ios-settings-nav"><button onClick={goBack}><ChevronLeft size={17} />Settings</button><strong>Privacy & Security</strong><span /></header>
        <div className="ios-settings-content">
          <div className="ios-settings-group">
            <div className="ios-settings-row"><span className="ios-settings-icon"><ShieldCheck /></span><span className="ios-settings-label">Location Services</span><SettingSwitch checked={settings.locationServices} onChange={(value) => onChange("locationServices", value)} /></div>
          </div>
          <p className="ios-settings-footnote">Control which simulated features can use location information. No device location is accessed.</p>
        </div>
      </div>
    );
  }

  if (page === "notifications") {
    return (
      <div className="ios-settings-page">
        <header className="ios-settings-nav"><button onClick={goBack}><ChevronLeft size={17} />Settings</button><strong>Notifications</strong><span /></header>
        <div className="ios-settings-content">
          <div className="ios-settings-preview"><Bell size={24} /><strong>Notifications</strong><span>Notification delivery settings for this preview.</span></div>
          <p className="ios-settings-footnote">App-specific notification permissions will be available when additional app simulations are implemented.</p>
        </div>
      </div>
    );
  }

  if (page === "about") {
    return (
      <div className="ios-settings-page">
        <header className="ios-settings-nav"><button onClick={goBack}><ChevronLeft size={17} />Settings</button><strong>About</strong><span /></header>
        <div className="ios-settings-content">
          <div className="ios-settings-about"><Smartphone size={34} /><strong>iPhone Simulator</strong><span>Desktop Preview 0.2.0</span></div>
          <div className="ios-settings-group">
            <div className="ios-settings-row"><span className="ios-settings-label">Model</span><span className="ios-settings-detail">iPhone profile</span></div>
            <div className="ios-settings-row"><span className="ios-settings-label">Software Version</span><span className="ios-settings-detail">Preview build</span></div>
          </div>
        </div>
      </div>
    );
  }

  const normalizedQuery = query.trim().toLowerCase();
  const show = (value: string) => !normalizedQuery || value.toLowerCase().includes(normalizedQuery);

  return (
    <div className="ios-settings-page">
      <header className="ios-settings-main-header"><h2>Settings</h2></header>
      <div className="ios-settings-content">
        <label className="ios-settings-search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search" /></label>
        {!normalizedQuery && <button className="ios-account-card" onClick={() => setPage("about")}><span><CircleUserRound size={30} /></span><span><strong>Apple Account</strong><small>Sign in to your iPhone</small></span><ChevronRight size={17} /></button>}
        {(show("airplane mode") || show("wi-fi") || show("bluetooth") || show("focus")) && <h4>CONNECTIVITY</h4>}
        <div className="ios-settings-group">
          {show("airplane mode") && <div className="ios-settings-row"><span className="ios-settings-icon orange"><Plane /></span><span className="ios-settings-label">Airplane Mode</span><SettingSwitch checked={settings.airplaneMode} onChange={(value) => onChange("airplaneMode", value)} /></div>}
          {show("wi-fi") && <div className="ios-settings-row"><span className="ios-settings-icon blue"><Wifi /></span><span className="ios-settings-label">Wi-Fi</span><span className="ios-settings-detail">{settings.wifi ? "Connected" : "Off"}</span><SettingSwitch checked={settings.wifi} onChange={(value) => onChange("wifi", value)} /></div>}
          {show("bluetooth") && <div className="ios-settings-row"><span className="ios-settings-icon blue"><Bluetooth /></span><span className="ios-settings-label">Bluetooth</span><span className="ios-settings-detail">{settings.bluetooth ? "On" : "Off"}</span><SettingSwitch checked={settings.bluetooth} onChange={(value) => onChange("bluetooth", value)} /></div>}
          {show("focus") && <div className="ios-settings-row"><span className="ios-settings-icon purple"><Focus /></span><span className="ios-settings-label">Focus</span><SettingSwitch checked={settings.focus} onChange={(value) => onChange("focus", value)} /></div>}
        </div>
        {(show("notifications") || show("display") || show("privacy") || show("about")) && <h4>SETTINGS</h4>}
        <div className="ios-settings-group">
          {show("notifications") && row(<Bell />, "Notifications", "", () => setPage("notifications"))}
          {show("display") && row(<Sun />, "Display & Brightness", "", () => setPage("display"))}
          {show("privacy") && row(<ShieldCheck />, "Privacy & Security", "", () => setPage("privacy"))}
          {show("about") && row(<Smartphone />, "General / About", "", () => setPage("about"))}
          {show("battery percentage") && <div className="ios-settings-row"><span className="ios-settings-icon green"><BatteryFull /></span><span className="ios-settings-label">Battery Percentage</span><SettingSwitch checked={settings.batteryPercentage} onChange={(value) => onChange("batteryPercentage", value)} /></div>}
        </div>
      </div>
    </div>
  );
}
