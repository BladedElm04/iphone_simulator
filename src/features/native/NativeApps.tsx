import { useEffect, useRef, useState } from "react";
import {
  Camera, FileText, Image as ImageIcon, MapPin, MessageCircle, Music2,
  Phone, Play, Pause, Plus, Search, Send, Trash2, Upload, Video
} from "lucide-react";

export type NativeAppId = "photos" | "files" | "phone" | "messages" | "camera" | "music" | "maps";

interface NativeAppsProps {
  app: NativeAppId;
  dark: boolean;
  volume: number;
}

interface LocalAsset {
  id: string;
  name: string;
  url: string;
  type: string;
}

interface ChatMessage {
  id: number;
  text: string;
  time: string;
  outgoing: boolean;
}

const formatTime = () => new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date());

export function NativeApps({ app, dark, volume }: NativeAppsProps) {
  const [assets, setAssets] = useState<LocalAsset[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, text: "Welcome to the iPhone Simulator. This is a local demo conversation.", time: formatTime(), outgoing: false }
  ]);
  const [message, setMessage] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [callActive, setCallActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [cameraReady, setCameraReady] = useState(false);
  const [mapQuery, setMapQuery] = useState("New York");
  const [mapSearch, setMapSearch] = useState("New York");
  const [playing, setPlaying] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState<LocalAsset | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const assetUrlsRef = useRef<Set<string>>(new Set());

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    assetUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    assetUrlsRef.current.clear();
  }, []);

  useEffect(() => {
    if (app !== "camera" && streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setCameraReady(false);
    }
  }, [app]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume, selectedAudio]);

  useEffect(() => {
    if (cameraReady && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraReady]);

  const importFiles = (files: FileList | null) => {
    if (!files) return;
    const next = Array.from(files).map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random()}`,
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type
    }));
    next.forEach((asset) => assetUrlsRef.current.add(asset.url));
    setAssets((current) => [...current, ...next]);
    const audio = next.find((asset) => asset.type.startsWith("audio/"));
    if (audio && app === "music") setSelectedAudio(audio);
  };

  const removeAsset = (id: string) => {
    setAssets((current) => {
      const target = current.find((asset) => asset.id === id);
      if (target) { URL.revokeObjectURL(target.url); assetUrlsRef.current.delete(target.url); }
      return current.filter((asset) => asset.id !== id);
    });
  };

  const startCamera = async () => {
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraReady(true);
    } catch (error) {
      setCameraError(error instanceof Error ? error.message : "Camera permission was denied or no camera is available.");
    }
  };

  const takePhoto = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `Camera-${Date.now()}.jpg`, { type: "image/jpeg" });
      const url = URL.createObjectURL(file);
      assetUrlsRef.current.add(url);
      setAssets((current) => [...current, { id: `camera-${Date.now()}`, name: file.name, url, type: file.type }]);
    }, "image/jpeg", 0.92);
  };

  const sendMessage = () => {
    const text = message.trim();
    if (!text) return;
    setMessages((current) => [...current, { id: Date.now(), text, time: formatTime(), outgoing: true }]);
    setMessage("");
  };

  const title = {
    photos: "Library", files: "Browse", phone: "Keypad", messages: "Messages",
    camera: "Camera", music: "Library", maps: "Explore"
  }[app];

  return (
    <div className={`native-app native-app-${app}${dark ? " dark" : ""}`}>
      <header className="native-app-heading"><h2>{title}</h2>{app === "photos" || app === "files" || app === "music" ? (
        <button className="native-icon-button" onClick={() => fileInputRef.current?.click()} aria-label="Import files"><Plus size={18} /></button>
      ) : null}</header>
      <input ref={fileInputRef} className="native-hidden-input" type="file" multiple accept={app === "photos" ? "image/*" : app === "music" ? "audio/*" : undefined} onChange={(event) => importFiles(event.target.files)} />

      {app === "photos" && (
        <div className="native-scroll">
          <div className="native-section-title">Recent</div>
          {assets.filter((asset) => asset.type.startsWith("image/")).length === 0 ? (
            <button className="native-empty-state" onClick={() => fileInputRef.current?.click()}><ImageIcon size={32} /><strong>Your photos will appear here</strong><span>Import images or take a photo with Camera</span><b><Upload size={13} /> Import Photos</b></button>
          ) : <div className="photo-grid">{assets.filter((asset) => asset.type.startsWith("image/")).map((asset) => <button key={asset.id} className="photo-tile" onClick={() => window.open(asset.url, "_blank")}><img src={asset.url} alt={asset.name} /></button>)}</div>}
        </div>
      )}

      {app === "files" && (
        <div className="native-scroll">
          <button className="native-location-card" onClick={() => fileInputRef.current?.click()}><Upload size={19} /><span><strong>On My iPhone</strong><small>Import files from this computer</small></span></button>
          <div className="native-section-title">Recently Added</div>
          {assets.length === 0 ? <div className="native-empty-state"><FileText size={30} /><strong>No recent files</strong><span>Choose the + button to import files</span></div> : assets.map((asset) => <div className="native-file-row" key={asset.id}><FileText size={19} /><span><strong>{asset.name}</strong><small>{asset.type || "File"}</small></span><a href={asset.url} download={asset.name}>Save</a><button onClick={() => removeAsset(asset.id)} aria-label="Delete file"><Trash2 size={15} /></button></div>)}
        </div>
      )}

      {app === "messages" && (
        <div className="messages-layout">
          <div className="messages-contact"><span className="messages-avatar">JD</span><span><strong>Demo Contact</strong><small>iMessage</small></span></div>
          <div className="messages-thread">{messages.map((item) => <div className={`message-bubble ${item.outgoing ? "outgoing" : "incoming"}`} key={item.id}><span>{item.text}</span><small>{item.time}</small></div>)}</div>
          <form className="message-composer" onSubmit={(event) => { event.preventDefault(); sendMessage(); }}><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="iMessage" aria-label="Message" /><button type="submit" aria-label="Send message" disabled={!message.trim()}><Send size={17} /></button></form>
        </div>
      )}

      {app === "camera" && (
        <div className="camera-layout">
          <div className="camera-viewfinder">{cameraReady ? <video ref={videoRef} autoPlay muted playsInline /> : <div><Camera size={35} /><span>Camera preview</span></div>}</div>
          {cameraError && <p className="native-inline-error">{cameraError}</p>}
          <div className="camera-controls"><button onClick={() => void startCamera()}><Video size={17} />{cameraReady ? "Restart" : "Enable Camera"}</button><button className="camera-shutter" onClick={takePhoto} disabled={!cameraReady} aria-label="Take photo"><span /></button><span className="camera-spacer" /></div>
          <p className="native-footnote">Camera access uses your computer's webcam and requires permission.</p>
        </div>
      )}

      {app === "music" && (
        <div className="music-layout">
          <div className="music-art"><Music2 size={48} /></div>
          <strong>{selectedAudio?.name ?? "No song selected"}</strong><span>{selectedAudio ? "Local audio file" : "Import an audio file to start listening"}</span>
          <audio ref={audioRef} src={selectedAudio?.url} onEnded={() => setPlaying(false)} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} controls />
          <button className="native-primary-button" onClick={() => fileInputRef.current?.click()}><Plus size={15} /> Add Music</button>
          {assets.filter((asset) => asset.type.startsWith("audio/")).map((asset) => <button className="native-list-row" key={asset.id} onClick={() => { setSelectedAudio(asset); setPlaying(false); }}>{asset.name}<Play size={14} /></button>)}
          {selectedAudio && <button className="native-secondary-button" onClick={() => { if (playing) audioRef.current?.pause(); else void audioRef.current?.play(); }}>{playing ? <Pause size={15} /> : <Play size={15} />}{playing ? "Pause" : "Play"}</button>}
        </div>
      )}

      {app === "phone" && (
        <div className="phone-layout">
          <div className="phone-number">{phoneNumber || "Enter Number"}</div>
          <div className="phone-keypad">{["1","2","3","4","5","6","7","8","9","*","0","#"].map((digit) => <button key={digit} onClick={() => setPhoneNumber((value) => value + digit)}>{digit}</button>)}</div>
          <div className="phone-actions"><button className="phone-call-button" onClick={() => setCallActive((value) => !value)} disabled={!phoneNumber}><Phone size={19} />{callActive ? "End Demo Call" : "Call"}</button><button onClick={() => setPhoneNumber((value) => value.slice(0, -1))}><Trash2 size={16} /></button></div>
          {callActive && <div className="native-call-status">Simulated call in progress · {phoneNumber}</div>}
          <p className="native-footnote">Calls are simulated. No telephone network is connected.</p>
        </div>
      )}

      {app === "maps" && (
        <div className="maps-layout">
          <form className="maps-search" onSubmit={(event) => { event.preventDefault(); setMapSearch(mapQuery.trim() || "New York"); }}><Search size={16} /><input value={mapQuery} onChange={(event) => setMapQuery(event.target.value)} placeholder="Search Maps" /><button type="submit">Go</button></form>
          <iframe title="Map preview" src={`https://www.google.com/maps?q=${encodeURIComponent(mapSearch)}&output=embed`} loading="lazy" />
          <a className="native-map-link" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapSearch)}`} target="_blank" rel="noreferrer"><MapPin size={15} /> Open full map</a>
        </div>
      )}
    </div>
  );
}
