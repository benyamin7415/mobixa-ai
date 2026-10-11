"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

/*
============================================================
MOBIXA — VOICE LAB (صفحه‌ی ساخت صدا)
============================================================

مسیر فایل در گیت‌هاب:
app/voice/page.tsx

فقط ظاهر و تجربه‌ی کاربری عوض شده.
اتصال به API دقیقاً مثل قبل است:

POST /api/voice
body: { text }
جواب: فایل صوتی (mp3)   |   خطا: { error, details }

هر صدایی که ساخته شود در «کتابخانه‌ی صدای من» نگه داشته می‌شود
(روی همین دستگاه و داخل مرورگر ذخیره می‌شود).
*/

const MAX_CHARS = 1000;
const MAX_SAVED = 40;
const WAVE_BARS = 64;
const MINI_BARS = 30;
const BAR_COUNT = 64;
const CANVAS_SIZE = 300;

type StoredClip = {
  id: number;
  text: string;
  createdAt: number;
  duration: number;
  peaks: number[];
  blob: Blob;
};

type Clip = {
  id: number;
  text: string;
  createdAt: number;
  duration: number;
  peaks: number[];
  url: string;
};

type RGB = [number, number, number];
type OrbMode = "idle" | "busy" | "play";

/* =========================================================
   DATA
========================================================= */

const EXAMPLES = [
  {
    icon: "👋",
    title: "خوش‌آمدگویی",
    text: "سلام و وقت بخیر! به موبیکسا خوش اومدی. اینجا می‌تونی هر متنی رو به یه صدای طبیعی و حرفه‌ای تبدیل کنی.",
  },
  {
    icon: "📰",
    title: "خبر",
    text: "به گزارش خبرنگار ما، امروز صبح یک فناوری جدید هوش مصنوعی معرفی شد که می‌تواند متن را به صدایی کاملاً طبیعی تبدیل کند.",
  },
  {
    icon: "📖",
    title: "داستان",
    text: "روزی روزگاری، در دل یک جنگل پر از نور، روباهی کوچک عاشق ستاره‌ها شد و هر شب برای رسیدن به آن‌ها از بلندترین تپه بالا می‌رفت.",
  },
  {
    icon: "🎯",
    title: "تبلیغ",
    text: "یه لحظه صبر کن! فرصت ویژه‌ی این هفته رو از دست نده. همین حالا شروع کن و تفاوت رو با تمام وجودت حس کن.",
  },
  {
    icon: "🎓",
    title: "آموزشی",
    text: "در این درس یاد می‌گیریم چطور با سه قدم ساده یک برنامه‌ی روزانه بسازیم و قدم به قدم به هدف‌هامون برسیم.",
  },
  {
    icon: "🌍",
    title: "English",
    text: "Hello! Welcome to Mobixa. Turn any text into a natural, professional voice in just a few seconds.",
  },
];

const TIPS = [
  {
    icon: "✂️",
    title: "جمله‌های کوتاه",
    text: "جمله‌های کوتاه‌تر، لحن طبیعی‌تری می‌گیرن.",
  },
  {
    icon: "⏸️",
    title: "علامت‌گذاری",
    text: "ویرگول و نقطه به صدا مکث و نفس میده.",
  },
  {
    icon: "🔢",
    title: "عدد با حروف",
    text: "اعداد رو با حروف بنویس تا درست خونده بشن.",
  },
];

const STAGES = [
  "دارم متنت رو می‌خونم",
  "لحن و مکث‌ها رو تنظیم می‌کنم",
  "دارم صدا رو می‌سازم",
  "لمس نهایی رو می‌زنم",
];

const RATES = [1, 1.25, 1.5, 0.75];

const PALETTES: Record<OrbMode, RGB[]> = {
  idle: [
    [120, 92, 255],
    [40, 176, 255],
    [255, 120, 196],
  ],
  busy: [
    [120, 92, 255],
    [255, 120, 196],
    [255, 204, 140],
  ],
  play: [
    [255, 112, 190],
    [140, 94, 255],
    [40, 200, 255],
  ],
};

/* =========================================================
   HELPERS
========================================================= */

function clamp(v: number, a: number, b: number) {
  return Math.min(b, Math.max(a, v));
}

function toFaDigits(value: string | number) {
  const digits = "۰۱۲۳۴۵۶۷۸۹";

  return String(value).replace(/\d/g, (d) => digits[Number(d)]);
}

function fmt(sec: number) {
  const s = Math.max(0, Math.floor(sec || 0));

  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function rgba(c: RGB, a: number) {
  return `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(
    c[2]
  )},${a})`;
}

function mix(a: RGB, b: RGB, t: number): RGB {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

function timeAgo(createdAt: number, now: number) {
  const diff = Math.max(0, Math.floor((now - createdAt) / 1000));

  if (diff < 45) return "همین الان";

  const min = Math.floor(diff / 60);

  if (min < 60) return `${toFaDigits(Math.max(1, min))} دقیقه پیش`;

  const hours = Math.floor(min / 60);

  if (hours < 24) return `${toFaDigits(hours)} ساعت پیش`;

  return `${toFaDigits(Math.floor(hours / 24))} روز پیش`;
}

/* ---------- ذخیره‌ی دائمی (IndexedDB) ---------- */

const DB_NAME = "mobixa-voice-lab";
const STORE = "clips";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);

    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE, { keyPath: "id" });
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGetAll(): Promise<StoredClip[]> {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, "readonly").objectStore(STORE).getAll();

    req.onsuccess = () => resolve(req.result as StoredClip[]);
    req.onerror = () => reject(req.error);
  });
}

async function idbPut(clip: StoredClip): Promise<void> {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");

    tx.objectStore(STORE).put(clip);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function idbDelete(id: number): Promise<void> {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");

    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function idbClear(): Promise<void> {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");

    tx.objectStore(STORE).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/* ---------- موج صدا (از روی خود فایل صوتی) ---------- */

async function analyseAudio(
  blob: Blob
): Promise<{ peaks: number[]; duration: number }> {
  const AudioCtor: typeof AudioContext =
    window.AudioContext ||
    (
      window as unknown as {
        webkitAudioContext: typeof AudioContext;
      }
    ).webkitAudioContext;

  const ctx = new AudioCtor();

  try {
    const buffer = await blob.arrayBuffer();
    const decoded = await ctx.decodeAudioData(buffer);
    const data = decoded.getChannelData(0);

    const step = Math.max(1, Math.floor(data.length / WAVE_BARS));
    const peaks: number[] = [];

    let max = 0.0001;

    for (let i = 0; i < WAVE_BARS; i++) {
      let sum = 0;
      let n = 0;

      for (let j = i * step; j < Math.min(data.length, (i + 1) * step); j += 4) {
        sum += data[j] * data[j];
        n += 1;
      }

      const v = n ? Math.sqrt(sum / n) : 0;

      peaks.push(v);

      if (v > max) {
        max = v;
      }
    }

    return {
      peaks: peaks.map((v) => clamp(v / (max * 0.95), 0.06, 1)),
      duration: decoded.duration,
    };
  } finally {
    void ctx.close().catch(() => undefined);
  }
}

function fallbackPeaks(): number[] {
  return Array.from(
    { length: WAVE_BARS },
    (_, i) => 0.3 + 0.35 * Math.abs(Math.sin(i * 0.55)) + 0.15 * Math.sin(i * 1.7)
  ).map((v) => clamp(v, 0.08, 1));
}

function resamplePeaks(peaks: number[], count: number): number[] {
  const out: number[] = [];

  for (let i = 0; i < count; i++) {
    const from = Math.floor((i / count) * peaks.length);
    const to = Math.max(from + 1, Math.floor(((i + 1) / count) * peaks.length));

    let max = 0;

    for (let j = from; j < to && j < peaks.length; j++) {
      max = Math.max(max, peaks[j]);
    }

    out.push(max);
  }

  return out;
}

/* =========================================================
   ORB DRAWING
========================================================= */

type OrbFrame = {
  t: number;
  mode: OrbMode;
  lvl: number;
  rot: number;
  colors: RGB[];
  bars: number[];
};

const PARTICLES = Array.from({ length: 22 }, (_, i) => ({
  angle: (i / 22) * Math.PI * 2 + (i % 5) * 0.37,
  radius: 104 + ((i * 37) % 34),
  speed: 0.00018 + ((i * 13) % 7) * 0.00007,
  size: 0.9 + ((i * 7) % 4) * 0.4,
  phase: i * 1.7,
}));

function drawOrb(g: CanvasRenderingContext2D, f: OrbFrame) {
  const { t, mode, lvl, rot, colors, bars } = f;

  const S = CANVAS_SIZE;
  const cx = S / 2;
  const cy = S / 2;
  const TAU = Math.PI * 2;

  const c0 = colors[0];
  const c1 = colors[1];
  const c2 = colors[2];

  const R = 54 * (1 + lvl * 0.12);
  const ringR = 80;
  const busy = mode === "busy";

  g.clearRect(0, 0, S, S);
  g.globalCompositeOperation = "source-over";
  g.globalAlpha = 1;
  g.shadowBlur = 0;

  const halo = g.createRadialGradient(cx, cy, R * 0.5, cx, cy, S / 2);

  halo.addColorStop(0, rgba(c1, 0.2 + lvl * 0.3));
  halo.addColorStop(0.55, rgba(c0, 0.07 + lvl * 0.12));
  halo.addColorStop(1, rgba(c0, 0));

  g.fillStyle = halo;
  g.fillRect(0, 0, S, S);

  /* موج‌های پخش‌شونده */

  const ripple = mode === "play" ? 0.3 : busy ? 0.18 : 0.1;

  for (let j = 0; j < 3; j++) {
    const phase = (((t / 2000 + j / 3) % 1) + 1) % 1;

    g.strokeStyle = rgba(c1, (1 - phase) * ripple);
    g.lineWidth = 1.5;
    g.beginPath();
    g.arc(cx, cy, R + 8 + phase * 70, 0, TAU);
    g.stroke();
  }

  /* مدارها */

  const speed = busy ? 2.4 : 1;

  for (let k = 0; k < 2; k++) {
    const tilt = rot * (k ? -1.3 : 1.1) * speed + k * 1.2;
    const rx = 128 + lvl * 8;
    const ry = 40 + k * 18;

    g.strokeStyle = rgba(k ? [244, 200, 120] : c0, k ? 0.32 : 0.2);
    g.lineWidth = 1;
    g.beginPath();
    g.ellipse(cx, cy, rx, ry, tilt, 0, TAU);
    g.stroke();

    const a = (t / (1100 + k * 400)) * (k ? -1 : 1) * speed + k * 2;
    const ex = rx * Math.cos(a);
    const ey = ry * Math.sin(a);

    const px = cx + ex * Math.cos(tilt) - ey * Math.sin(tilt);
    const py = cy + ex * Math.sin(tilt) + ey * Math.cos(tilt);

    const dot = g.createRadialGradient(px, py, 0, px, py, 10);

    dot.addColorStop(0, "rgba(255,255,255,0.95)");
    dot.addColorStop(0.4, rgba(k ? [244, 200, 120] : c1, 0.5));
    dot.addColorStop(1, rgba(c1, 0));

    g.fillStyle = dot;
    g.beginPath();
    g.arc(px, py, 10, 0, TAU);
    g.fill();
  }

  /* ذره‌ها */

  for (let i = 0; i < PARTICLES.length; i++) {
    const p = PARTICLES[i];

    const a = p.angle + t * p.speed * (1 + lvl * 3 + (busy ? 2 : 0));
    const r = p.radius + Math.sin(t / 700 + p.phase) * 6 + lvl * 16;
    const tw = 0.5 + 0.5 * Math.sin(t / 500 + p.phase);

    g.fillStyle = rgba(mix(c0, c2, (i % 7) / 7), 0.25 + tw * 0.5);
    g.beginPath();
    g.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.92, p.size, 0, TAU);
    g.fill();
  }

  /* کره */

  g.save();
  g.shadowColor = rgba(c1, 0.5);
  g.shadowBlur = 30;
  g.shadowOffsetY = 14;

  const base = g.createRadialGradient(
    cx - R * 0.32,
    cy - R * 0.38,
    R * 0.08,
    cx,
    cy,
    R * 1.08
  );

  base.addColorStop(0, "rgba(255,255,255,1)");
  base.addColorStop(0.3, rgba(mix([255, 255, 255], c0, 0.4), 1));
  base.addColorStop(0.65, rgba(c1, 1));
  base.addColorStop(1, rgba(mix(c2, [34, 12, 110], 0.55), 1));

  g.fillStyle = base;
  g.beginPath();
  g.arc(cx, cy, R, 0, TAU);
  g.fill();
  g.restore();

  g.save();
  g.beginPath();
  g.arc(cx, cy, R, 0, TAU);
  g.clip();

  for (let k = 0; k < 3; k++) {
    const ang = (t / 1300) * (k % 2 ? -1 : 1) * (busy ? 2 : 1) + k * 2.1;
    const dist = R * (0.32 + lvl * 0.28);
    const bx = cx + Math.cos(ang) * dist;
    const by = cy + Math.sin(ang) * dist;
    const rad = R * (0.8 + lvl * 0.3);

    const grad = g.createRadialGradient(bx, by, 0, bx, by, rad);

    grad.addColorStop(0, rgba(colors[(k + 1) % 3], 0.8));
    grad.addColorStop(1, rgba(colors[(k + 1) % 3], 0));

    g.fillStyle = grad;
    g.fillRect(cx - R, cy - R, R * 2, R * 2);
  }

  const glass = g.createRadialGradient(cx, cy + R * 0.95, 0, cx, cy + R * 0.95, R * 1.1);

  glass.addColorStop(0, "rgba(255,255,255,0.55)");
  glass.addColorStop(1, "rgba(255,255,255,0)");

  g.fillStyle = glass;
  g.fillRect(cx - R, cy - R, R * 2, R * 2);
  g.restore();

  g.save();
  g.translate(cx - R * 0.3, cy - R * 0.46);
  g.rotate(-0.55);
  g.scale(1, 0.52);

  const spec = g.createRadialGradient(0, 0, 0, 0, 0, R * 0.5);

  spec.addColorStop(0, "rgba(255,255,255,0.9)");
  spec.addColorStop(1, "rgba(255,255,255,0)");

  g.fillStyle = spec;
  g.beginPath();
  g.arc(0, 0, R * 0.5, 0, TAU);
  g.fill();
  g.restore();

  const rim = g.createLinearGradient(cx - R, cy - R, cx + R, cy + R);

  rim.addColorStop(0, "rgba(255,255,255,0.95)");
  rim.addColorStop(0.5, "rgba(255,255,255,0.12)");
  rim.addColorStop(1, "rgba(255,255,255,0.5)");

  g.strokeStyle = rim;
  g.lineWidth = 1.5;
  g.beginPath();
  g.arc(cx, cy, R - 0.8, 0, TAU);
  g.stroke();

  /* نوارهای صوتی دور کره */

  g.lineCap = "round";
  g.lineWidth = 3;

  for (let i = 0; i < BAR_COUNT; i++) {
    const a = clamp(bars[i] || 0, 0, 1);
    const len = 3 + a * 34;
    const ang = (i / BAR_COUNT) * TAU + rot - Math.PI / 2;

    const pos = (i / BAR_COUNT) * 3;
    const k = Math.floor(pos) % 3;
    const col = mix(colors[k], colors[(k + 1) % 3], pos - Math.floor(pos));

    g.strokeStyle = rgba(col, 0.5 + a * 0.5);
    g.beginPath();
    g.moveTo(cx + Math.cos(ang) * ringR, cy + Math.sin(ang) * ringR);
    g.lineTo(cx + Math.cos(ang) * (ringR + len), cy + Math.sin(ang) * (ringR + len));
    g.stroke();
  }

  g.lineWidth = 1.2;
  g.strokeStyle = rgba(c1, 0.2);
  g.beginPath();
  g.arc(cx, cy, ringR - 9, 0, TAU);
  g.stroke();

  if (busy) {
    g.lineWidth = 3;
    g.strokeStyle = rgba(c2, 0.95);
    g.beginPath();
    g.arc(cx, cy, ringR - 9, t / 280, t / 280 + 1.3);
    g.stroke();
  }
}

/* =========================================================
   ICONS
========================================================= */

const svgProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.9,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

function IconBack() {
  return (
    <svg {...svgProps}>
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

function IconPlay() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" />
    </svg>
  );
}

function IconPause() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <rect x="6" y="4.5" width="4.2" height="15" rx="1.4" />
      <rect x="13.8" y="4.5" width="4.2" height="15" rx="1.4" />
    </svg>
  );
}

function IconDownload() {
  return (
    <svg {...svgProps}>
      <path d="M12 4v11" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 20h14" />
    </svg>
  );
}

function IconCopy() {
  return (
    <svg {...svgProps}>
      <rect x="9" y="9" width="11" height="11" rx="3" />
      <path d="M5 15V7a3 3 0 0 1 3-3h8" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg {...svgProps}>
      <path d="M5 7h14M10 11v6M14 11v6M8 7l1-3h6l1 3M7 7l1 13h8l1-13" />
    </svg>
  );
}

function IconRedo() {
  return (
    <svg {...svgProps}>
      <path d="M20 11a8 8 0 0 0-14.9-3" />
      <path d="M4 4v4h4" />
      <path d="M4 13a8 8 0 0 0 14.9 3" />
      <path d="M20 20v-4h-4" />
    </svg>
  );
}

function IconLib() {
  return (
    <svg {...svgProps}>
      <path d="M5 5v14M9.5 8v8M14 4v16M18.5 8.5v7" />
    </svg>
  );
}

function IconSpark() {
  return (
    <svg {...svgProps}>
      <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" />
      <path d="M19 16l.7 1.8L21.5 18.5l-1.8.7L19 21l-.7-1.8-1.8-.7 1.8-.7L19 16z" />
    </svg>
  );
}

function IconMic() {
  return (
    <svg {...svgProps}>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3" />
    </svg>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function VoicePage() {
  /* ---------- state اصلی (مثل قبل) ---------- */

  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ---------- state ظاهر ---------- */

  const [clips, setClips] = useState<Clip[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [rate, setRate] = useState(1);
  const [elapsed, setElapsed] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [toast, setToast] = useState("");
  const [confirm, setConfirm] = useState<number | "all" | null>(null);
  const [focused, setFocused] = useState(false);
  const [libReady, setLibReady] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const studioRef = useRef<HTMLElement | null>(null);
  const libRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const waveRefs = useRef<Record<string, HTMLElement | null>>({});
  const timeRefs = useRef<Record<string, HTMLElement | null>>({});

  const clipsRef = useRef<Clip[]>([]);
  const activeRef = useRef<number | null>(null);
  const modeRef = useRef<OrbMode>("idle");
  const rateRef = useRef(1);
  const pendingSeek = useRef<number | null>(null);
  const typeTimer = useRef<number | null>(null);
  const toastTimer = useRef<number | null>(null);
  const confirmTimer = useRef<number | null>(null);

  const activeClip = clips.find((c) => c.id === activeId) || null;

  /* ---------- همگام‌سازی refها ---------- */

  useEffect(() => {
    clipsRef.current = clips;
  }, [clips]);

  useEffect(() => {
    activeRef.current = activeId;
  }, [activeId]);

  useEffect(() => {
    rateRef.current = rate;

    if (audioRef.current) {
      audioRef.current.defaultPlaybackRate = rate;
      audioRef.current.playbackRate = rate;
    }
  }, [rate]);

  useEffect(() => {
    modeRef.current = loading ? "busy" : isPlaying ? "play" : "idle";
  }, [loading, isPlaying]);

  /* ---------- فونت وزیرمتن ---------- */

  useEffect(() => {
    const id = "vx-vazirmatn-font";

    if (document.getElementById(id)) {
      return;
    }

    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href =
      "https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css";

    document.head.appendChild(link);
  }, []);

  /* ---------- بارگذاری کتابخانه از حافظه‌ی دستگاه ---------- */

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const stored = await idbGetAll();

        if (cancelled) {
          return;
        }

        const list: Clip[] = stored
          .sort((a, b) => b.createdAt - a.createdAt)
          .map((item) => ({
            id: item.id,
            text: item.text,
            createdAt: item.createdAt,
            duration: item.duration,
            peaks: item.peaks,
            url: URL.createObjectURL(item.blob),
          }));

        setClips(list);
      } catch {
        // حافظه در دسترس نیست؛ فقط در همین نشست نگه داشته می‌شود
      } finally {
        if (!cancelled) {
          setLibReady(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ---------- زمان نسبی ---------- */

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30000);

    return () => window.clearInterval(id);
  }, []);

  /* ---------- زمان‌سنج ساخت ---------- */

  useEffect(() => {
    if (!loading) {
      setElapsed(0);
      return;
    }

    const started = performance.now();

    const id = window.setInterval(() => {
      setElapsed((performance.now() - started) / 1000);
    }, 200);

    return () => window.clearInterval(id);
  }, [loading]);

  /* ---------- بزرگ شدن خودکار کادر متن ---------- */

  useEffect(() => {
    const el = textareaRef.current;

    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 300)}px`;
    }
  }, [text]);

  /* ---------- حلقه‌ی انیمیشن: کره + موج پلیر ---------- */

  useEffect(() => {
    const canvas = canvasRef.current;
    const g = canvas ? canvas.getContext("2d") : null;

    if (canvas && g) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(CANVAS_SIZE * dpr);
      canvas.height = Math.round(CANVAS_SIZE * dpr);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const colors: RGB[] = PALETTES.idle.map((c) => [c[0], c[1], c[2]] as RGB);

    let raf = 0;
    let lvl = 0;
    let rot = 0;
    let lastLabel = 0;

    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);

      if (document.hidden) {
        return;
      }

      const mode = modeRef.current;
      const audio = audioRef.current;
      const clip = clipsRef.current.find((c) => c.id === activeRef.current);

      const target = PALETTES[mode];

      for (let k = 0; k < 3; k++) {
        for (let j = 0; j < 3; j++) {
          colors[k][j] += (target[k][j] - colors[k][j]) * 0.06;
        }
      }

      /* پیشرفت پخش */

      let ratio = 0;

      if (audio && clip) {
        const dur = audio.duration && isFinite(audio.duration) ? audio.duration : clip.duration || 1;

        ratio = clamp(audio.currentTime / dur, 0, 1);

        const wave = waveRefs.current[`main-${clip.id}`];
        const waveMini = waveRefs.current[`mini-${clip.id}`];

        if (wave) wave.style.setProperty("--p", `${ratio * 100}%`);
        if (waveMini) waveMini.style.setProperty("--p", `${ratio * 100}%`);

        if (t - lastLabel > 180) {
          lastLabel = t;

          const a = timeRefs.current[`main-${clip.id}`];
          const b = timeRefs.current[`mini-${clip.id}`];
          const label = `${fmt(audio.currentTime)} / ${fmt(dur)}`;

          if (a) a.textContent = label;
          if (b) b.textContent = label;
        }
      }

      /* سطح صدا */

      let tgt = 0.05;

      if (mode === "play" && clip) {
        const idx = Math.min(clip.peaks.length - 1, Math.floor(ratio * clip.peaks.length));

        tgt = clip.peaks[idx] || 0.2;
      } else if (mode === "busy") {
        tgt = 0.2 + 0.08 * Math.sin(t / 240);
      } else {
        tgt = 0.08 + 0.04 * Math.sin(t / 700);
      }

      lvl += (tgt - lvl) * (tgt > lvl ? 0.35 : 0.12);
      rot += 0.003 + lvl * 0.01;

      /* نوارهای دور کره */

      const bars: number[] = new Array(BAR_COUNT);
      const half = BAR_COUNT / 2;

      for (let i = 0; i < BAR_COUNT; i++) {
        const j = i < half ? i : BAR_COUNT - 1 - i;

        if (mode === "play" && clip) {
          const center = ratio * (clip.peaks.length - 1);
          const idx = clamp(Math.round(center + (j - half / 2) * 0.7), 0, clip.peaks.length - 1);

          bars[i] = clip.peaks[idx] * 0.85 + 0.06 * Math.sin(j + t / 160);
        } else if (mode === "busy") {
          bars[i] = 0.18 + 0.14 * Math.sin(i * 0.5 - t / 170);
        } else {
          bars[i] = 0.07 + 0.04 * Math.sin(i * 0.4 + t / 420);
        }
      }

      if (g) {
        drawOrb(g, { t, mode, lvl, rot, colors, bars });
      }
    };

    raf = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(raf);
  }, []);

  /* ---------- پاک‌سازی ---------- */

  useEffect(() => {
    return () => {
      if (typeTimer.current) window.clearInterval(typeTimer.current);
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
      if (confirmTimer.current) window.clearTimeout(confirmTimer.current);

      clipsRef.current.forEach((c) => URL.revokeObjectURL(c.url));
    };
  }, []);

  /* =========================================================
     ACTIONS
  ========================================================= */

  function showToast(message: string) {
    setToast(message);

    if (toastTimer.current) window.clearTimeout(toastTimer.current);

    toastTimer.current = window.setTimeout(() => setToast(""), 2200);
  }

  const handleTextChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = event.target.value.slice(0, MAX_CHARS);

    setText(value);
    setError("");
  };

  /* ---------- پخش ---------- */

  function playClip(clip: Clip, seekRatio?: number) {
    const audio = audioRef.current;

    if (!audio) return;

    if (activeRef.current === clip.id && seekRatio === undefined) {
      if (audio.paused) {
        audio.play().catch(() => undefined);
      } else {
        audio.pause();
      }

      return;
    }

    if (activeRef.current !== clip.id) {
      audio.src = clip.url;
      activeRef.current = clip.id;
      setActiveId(clip.id);

      pendingSeek.current = seekRatio ?? null;
    } else if (seekRatio !== undefined) {
      const dur = audio.duration && isFinite(audio.duration) ? audio.duration : clip.duration;

      audio.currentTime = seekRatio * dur;
    }

    audio.defaultPlaybackRate = rateRef.current;
    audio.playbackRate = rateRef.current;

    audio.play().catch(() => {
      showToast("برای پخش، دکمه‌ی پخش رو بزن");
    });
  }

  function seekFromPointer(
    event: React.PointerEvent<HTMLDivElement>,
    clip: Clip
  ) {
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = clamp((event.clientX - rect.left) / rect.width, 0, 1);

    playClip(clip, ratio);
  }

  function cycleRate() {
    setRate((r) => RATES[(RATES.indexOf(r) + 1) % RATES.length]);
  }

  /* ---------- ساخت صدا (همان منطق قبلی) ---------- */

  const generateVoice = async () => {
    if (!text.trim()) {
      setError(
        "اول متنی که می‌خوای به صدا تبدیل بشه رو وارد کن."
      );
      return;
    }

    if (loading) return;

    setLoading(true);
    setError("");

    stageRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    try {
      const response = await fetch("/api/voice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text.trim(),
        }),
      });

      if (!response.ok) {
        let message = "ساخت صدا با خطا مواجه شد.";

        try {
          const data = await response.json();

          if (data?.details) {
            message = data.details;
          } else if (data?.error) {
            message = data.error;
          }
        } catch {
          // پاسخ JSON نبود
        }

        throw new Error(message);
      }

      const audioBlob = await response.blob();

      if (!audioBlob.size) {
        throw new Error("فایل صوتی خالی دریافت شد.");
      }

      /* موج و مدت صدا */

      let peaks = fallbackPeaks();
      let duration = 0;

      try {
        const info = await analyseAudio(audioBlob);

        peaks = info.peaks;
        duration = info.duration;
      } catch {
        duration = Math.max(2, text.trim().length / 14);
      }

      const clip: Clip = {
        id: Date.now(),
        text: text.trim(),
        createdAt: Date.now(),
        duration,
        peaks,
        url: URL.createObjectURL(audioBlob),
      };

      const next = [clip, ...clipsRef.current];
      const kept = next.slice(0, MAX_SAVED);
      const dropped = next.slice(MAX_SAVED);

      dropped.forEach((c) => {
        URL.revokeObjectURL(c.url);
        idbDelete(c.id).catch(() => undefined);
      });

      setClips(kept);

      idbPut({
        id: clip.id,
        text: clip.text,
        createdAt: clip.createdAt,
        duration: clip.duration,
        peaks: clip.peaks,
        blob: audioBlob,
      }).catch(() => undefined);

      showToast("صدات آماده شد ✓");

      window.setTimeout(() => playClip(clip), 150);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "ساخت صدا با خطا مواجه شد."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ---------- دانلود (همان منطق قبلی) ---------- */

  const downloadAudio = (clip: Clip) => {
    const link = document.createElement("a");

    link.href = clip.url;
    link.download = `mobixa-voice-${clip.id}.mp3`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("صدا دانلود شد ✓");
  };

  /* ---------- بقیه‌ی کارها ---------- */

  function fillText(value: string) {
    if (loading) return;

    if (typeTimer.current) window.clearInterval(typeTimer.current);

    setText("");
    setError("");

    let i = 0;

    typeTimer.current = window.setInterval(() => {
      i += 2;
      setText(value.slice(0, i));

      if (i >= value.length && typeTimer.current) {
        window.clearInterval(typeTimer.current);
        typeTimer.current = null;
      }
    }, 14);

    studioRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  async function pasteText() {
    try {
      const value = await navigator.clipboard.readText();

      if (value) {
        setText(value.slice(0, MAX_CHARS));
        setError("");
      }
    } catch {
      showToast("اجازه‌ی دسترسی به کلیپ‌بورد داده نشد");
    }
  }

  function clearText() {
    if (typeTimer.current) {
      window.clearInterval(typeTimer.current);
      typeTimer.current = null;
    }

    setText("");
    textareaRef.current?.focus({ preventScroll: true });
  }

  async function copyText(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      showToast("متن کپی شد ✓");
    } catch {
      showToast("کپی نشد");
    }
  }

  function remix(clip: Clip) {
    setText(clip.text);
    setError("");

    studioRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });

    window.setTimeout(() => textareaRef.current?.focus({ preventScroll: true }), 400);
  }

  function askConfirm(target: number | "all") {
    if (confirm === target) {
      if (target === "all") {
        clearAll();
      } else {
        removeClip(target);
      }

      setConfirm(null);
      return;
    }

    setConfirm(target);

    if (confirmTimer.current) window.clearTimeout(confirmTimer.current);

    confirmTimer.current = window.setTimeout(() => setConfirm(null), 2600);
  }

  function stopIfActive(id: number | "all") {
    if (id === "all" || activeRef.current === id) {
      audioRef.current?.pause();

      if (audioRef.current) {
        audioRef.current.removeAttribute("src");
        audioRef.current.load();
      }

      activeRef.current = null;
      setActiveId(null);
      setIsPlaying(false);
    }
  }

  function removeClip(id: number) {
    stopIfActive(id);

    const clip = clipsRef.current.find((c) => c.id === id);

    if (clip) URL.revokeObjectURL(clip.url);

    setClips((old) => old.filter((c) => c.id !== id));
    idbDelete(id).catch(() => undefined);
    showToast("صدا حذف شد");
  }

  function clearAll() {
    stopIfActive("all");

    clipsRef.current.forEach((c) => URL.revokeObjectURL(c.url));

    setClips([]);
    idbClear().catch(() => undefined);
    showToast("کتابخانه خالی شد");
  }

  /* =========================================================
     DERIVED
  ========================================================= */

  const ratio = Math.min(1, text.length / MAX_CHARS);
  const RING = 2 * Math.PI * 10;
  const estSeconds = Math.max(1, Math.round(text.trim().length / 14));
  const stageIndex = Math.min(STAGES.length - 1, Math.floor(elapsed / 1.6));
  const progress = Math.min(94, 100 * (1 - Math.exp(-elapsed / 4)));

  let status = "آماده‌ام؛ متنت رو بده";
  let sub = "یه متن بنویس یا از نمونه‌ها یکی رو انتخاب کن";

  if (loading) {
    status = STAGES[stageIndex];
    sub = "چند ثانیه‌ی دیگه صدات آماده‌ست";
  } else if (isPlaying && activeClip) {
    status = "در حال پخش";
    sub = activeClip.text.slice(0, 60);
  } else if (activeClip) {
    status = "صدا آماده‌ست";
    sub = "برای پخش دوباره، دکمه‌ی پخش رو بزن";
  }

  /* ---------- موج ---------- */

  function renderWave(
    clip: Clip,
    keyName: string,
    count: number,
    className: string
  ) {
    const peaks = resamplePeaks(clip.peaks, count);

    return (
      <div
        className={className}
        data-wave={keyName}
        ref={(el) => {
          waveRefs.current[keyName] = el;
        }}
        onPointerDown={(e) => seekFromPointer(e, clip)}
        role="slider"
        aria-label="موقعیت پخش"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={0}
        tabIndex={0}
      >
        <div className="vx-wave-base">
          {peaks.map((p, i) => (
            <i key={i} style={{ height: `${12 + p * 88}%` }} />
          ))}
        </div>

        <div className="vx-wave-fill">
          {peaks.map((p, i) => (
            <i key={i} style={{ height: `${12 + p * 88}%` }} />
          ))}
        </div>
      </div>
    );
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="vx-root">
      <audio
        ref={audioRef}
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onLoadedMetadata={() => {
          const audio = audioRef.current;

          if (!audio) return;

          audio.defaultPlaybackRate = rateRef.current;
          audio.playbackRate = rateRef.current;

          if (pendingSeek.current !== null && isFinite(audio.duration)) {
            audio.currentTime = pendingSeek.current * audio.duration;
            pendingSeek.current = null;
          }
        }}
      />

      {/* ---------------- BACKGROUND ---------------- */}

      <div className="vx-bg" aria-hidden="true">
        <span className="vx-blob vx-b1" />
        <span className="vx-blob vx-b2" />
        <span className="vx-blob vx-b3" />

        <i className="vx-spark s1">✦</i>
        <i className="vx-spark s2">✦</i>
        <i className="vx-spark s3">✦</i>
        <i className="vx-spark s4">✦</i>
        <i className="vx-spark s5">✦</i>
      </div>

      <div className="vx-scroll" ref={scrollRef}>
        {/* ---------------- TOP BAR ---------------- */}

        <header className="vx-top">
          <Link
            href="/"
            className="vx-pill vx-back"
            aria-label="بازگشت به صفحه اصلی"
          >
            <IconBack />
            <span>بازگشت</span>
          </Link>

          <div className="vx-brand" dir="ltr">
            <i className="vx-logo">
              <IconMic />
            </i>
            <b>MOBIXA</b>
          </div>

          <button
            type="button"
            className="vx-pill vx-lib-btn"
            onClick={() =>
              libRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              })
            }
            aria-label="کتابخانه‌ی صدای من"
          >
            <IconLib />
            <span>{toFaDigits(clips.length)}</span>
          </button>
        </header>

        <main className="vx-wrap">
          {/* ---------------- HERO ---------------- */}

          <section className="vx-hero">
            <div className="vx-label">
              <i className="vx-label-dot" />
              MOBIXA VOICE LAB
            </div>

            <h1>
              متن بده، <span>صدا تحویل بگیر.</span>
            </h1>

            <p>
              متن خودت رو با هوش مصنوعی موبیکسا به صدای طبیعی و
              حرفه‌ای تبدیل کن.
            </p>
          </section>

          {/* ---------------- STAGE (ORB + PLAYER) ---------------- */}

          <section
            className={`vx-stage${isPlaying ? " playing" : ""}${loading ? " busy" : ""}`}
            ref={stageRef}
          >
            <div className="vx-orb">
              <canvas ref={canvasRef} />
            </div>

            <div className="vx-status" key={status}>
              {status}
            </div>

            <div className="vx-sub" dir="auto">
              {sub}
            </div>

            {loading && (
              <div className="vx-progress">
                <span style={{ width: `${progress}%` }} />
              </div>
            )}

            {activeClip && !loading && (
              <div className="vx-player">
                {renderWave(activeClip, `main-${activeClip.id}`, WAVE_BARS, "vx-wave vx-wave-main")}

                <div className="vx-player-row">
                  <span
                    className="vx-time"
                    dir="ltr"
                    ref={(el) => {
                      timeRefs.current[`main-${activeClip.id}`] = el;
                    }}
                  >
                    {`0:00 / ${fmt(activeClip.duration)}`}
                  </span>

                  <button
                    type="button"
                    className="vx-play-big"
                    onClick={() => playClip(activeClip)}
                    aria-label={isPlaying ? "توقف" : "پخش"}
                  >
                    {isPlaying ? <IconPause /> : <IconPlay />}
                  </button>

                  <button
                    type="button"
                    className="vx-rate"
                    onClick={cycleRate}
                    aria-label="سرعت پخش"
                  >
                    {rate}×
                  </button>
                </div>

                <div className="vx-player-actions">
                  <button type="button" onClick={() => downloadAudio(activeClip)}>
                    <IconDownload />
                    <span>دانلود</span>
                  </button>

                  <button type="button" onClick={() => copyText(activeClip.text)}>
                    <IconCopy />
                    <span>کپی متن</span>
                  </button>

                  <button type="button" onClick={() => remix(activeClip)}>
                    <IconRedo />
                    <span>ساخت دوباره</span>
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* ---------------- STUDIO ---------------- */}

          <section
            className={`vx-studio${focused ? " focus" : ""}`}
            ref={studioRef}
          >
            <div className="vx-section-title">
              <div>
                <h2>متن خودت رو وارد کن</h2>
                <p>متنی که می‌خوای به صدا تبدیل بشه</p>
              </div>

              <div className="vx-counter">
                <span dir="ltr">
                  {toFaDigits(text.length)}/{toFaDigits(MAX_CHARS)}
                </span>

                <svg viewBox="0 0 26 26" aria-hidden="true">
                  <circle cx="13" cy="13" r="10" className="bg" />
                  <circle
                    cx="13"
                    cy="13"
                    r="10"
                    className={`fg${ratio > 0.9 ? " warn" : ""}`}
                    strokeDasharray={RING}
                    strokeDashoffset={RING * (1 - ratio)}
                  />
                </svg>
              </div>
            </div>

            <div className="vx-field">
              <textarea
                ref={textareaRef}
                value={text}
                onChange={handleTextChange}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    generateVoice();
                  }
                }}
                maxLength={MAX_CHARS}
                placeholder="از متن خودت، صدای حرفه‌ای بساز…"
                dir="auto"
                rows={5}
                disabled={loading}
              />
            </div>

            <div className="vx-tools">
              <button
                type="button"
                className="vx-chip-btn"
                onClick={pasteText}
                disabled={loading}
              >
                <IconCopy />
                <span>چسباندن</span>
              </button>

              {text && !loading && (
                <button
                  type="button"
                  className="vx-chip-btn vx-quiet"
                  onClick={clearText}
                  aria-label="پاک کردن"
                >
                  <IconTrash />
                </button>
              )}

              <div className="vx-spacer" />

              {text.trim() && (
                <span className="vx-est">
                  حدود {toFaDigits(estSeconds)} ثانیه صدا
                </span>
              )}
            </div>

            {/* ---- Examples ---- */}

            <div className="vx-row-label">
              <IconSpark />
              <span>نمونه متن‌ها (برای شروع)</span>
            </div>

            <div className="vx-examples">
              {EXAMPLES.map((item) => (
                <button
                  key={item.title}
                  type="button"
                  className="vx-example"
                  disabled={loading}
                  onClick={() => fillText(item.text)}
                >
                  <i>{item.icon}</i>
                  <span>{item.title}</span>
                </button>
              ))}
            </div>

            {/* ---- Voice model ---- */}

            <div className="vx-row-label">
              <IconMic />
              <span>مدل صدای MOBIXA</span>
              <em>VOICE AI</em>
            </div>

            <div className="vx-voice-card">
              <div className="vx-voice-wave" aria-hidden="true">
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
              </div>

              <div className="vx-voice-info">
                <strong>صدای اصلی MOBIXA</strong>
                <span>
                  صدای هوش مصنوعی اصلی برای تولید نریشن و محتوای صوتی
                </span>
              </div>

              <div className="vx-check" aria-hidden="true">
                ✓
              </div>
            </div>

            {/* ---- Generate ---- */}

            <button
              type="button"
              className={`vx-generate${text.trim() && !loading ? " ready" : ""}${
                loading ? " busy" : ""
              }`}
              onClick={generateVoice}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="vx-spinner" />
                  <span>در حال ساخت صدا...</span>
                </>
              ) : (
                <>
                  <span className="vx-eq" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                  </span>
                  <span>ساخت صدا</span>
                </>
              )}
            </button>

            <div className="vx-kbd">Ctrl + Enter برای ساخت سریع</div>

            {error && (
              <div className="vx-error" role="alert">
                <i>!</i>
                <p>{error}</p>
              </div>
            )}
          </section>

          {/* ---------------- LIBRARY ---------------- */}

          <section className="vx-section" ref={libRef}>
            <div className="vx-sec-head">
              <div>
                <h2>کتابخانه‌ی صدای من</h2>
                <span>
                  {toFaDigits(clips.length)} صدا · روی این دستگاه
                </span>
              </div>

              {clips.length > 1 && (
                <button
                  type="button"
                  className={`vx-clear${confirm === "all" ? " sure" : ""}`}
                  onClick={() => askConfirm("all")}
                >
                  {confirm === "all" ? "مطمئنی؟ دوباره بزن" : "پاک کردن همه"}
                </button>
              )}
            </div>

            {clips.length === 0 ? (
              <div className="vx-empty">
                <div className="vx-empty-wave" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </div>

                <p>
                  {libReady
                    ? "هر صدایی که بسازی همین‌جا نگه داشته میشه و هر وقت خواستی می‌تونی دوباره پخشش کنی یا دانلودش کنی."
                    : "در حال بارگذاری..."}
                </p>
              </div>
            ) : (
              <div className="vx-list">
                {clips.map((clip, i) => {
                  const active = clip.id === activeId;

                  return (
                    <article
                      key={clip.id}
                      className={`vx-clip${active ? " active" : ""}`}
                      style={{ animationDelay: `${Math.min(i, 8) * 0.04}s` } as CSSProperties}
                    >
                      <div className="vx-clip-top">
                        <button
                          type="button"
                          className="vx-play"
                          onClick={() => playClip(clip)}
                          aria-label={active && isPlaying ? "توقف" : "پخش"}
                        >
                          {active && isPlaying ? <IconPause /> : <IconPlay />}
                        </button>

                        <div className="vx-clip-body">
                          <p dir="auto">{clip.text}</p>

                          <div className="vx-clip-meta">
                            <span>{timeAgo(clip.createdAt, now)}</span>
                            <span>·</span>
                            <span
                              dir="ltr"
                              ref={(el) => {
                                timeRefs.current[`mini-${clip.id}`] = el;
                              }}
                            >
                              {`0:00 / ${fmt(clip.duration)}`}
                            </span>
                          </div>
                        </div>
                      </div>

                      {renderWave(clip, `mini-${clip.id}`, MINI_BARS, "vx-wave vx-wave-mini")}

                      <div className="vx-clip-actions">
                        <button type="button" onClick={() => downloadAudio(clip)}>
                          <IconDownload />
                          <span>دانلود</span>
                        </button>

                        <button type="button" onClick={() => copyText(clip.text)}>
                          <IconCopy />
                          <span>کپی</span>
                        </button>

                        <button type="button" onClick={() => remix(clip)}>
                          <IconRedo />
                          <span>دوباره</span>
                        </button>

                        <button
                          type="button"
                          className={`vx-del${confirm === clip.id ? " sure" : ""}`}
                          onClick={() => askConfirm(clip.id)}
                          aria-label="حذف"
                        >
                          <IconTrash />
                          <span>{confirm === clip.id ? "مطمئنی؟" : "حذف"}</span>
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {/* ---------------- TIPS ---------------- */}

          <section className="vx-section">
            <div className="vx-sec-head">
              <div>
                <h2>برای صدای بهتر</h2>
                <span>سه نکته‌ی کوچیک</span>
              </div>
            </div>

            <div className="vx-tips">
              {TIPS.map((tip) => (
                <div className="vx-tip" key={tip.title}>
                  <i>{tip.icon}</i>
                  <b>{tip.title}</b>
                  <span>{tip.text}</span>
                </div>
              ))}
            </div>
          </section>

          <footer className="vx-foot">
            Designed &amp; Developed by <strong>Benyamin</strong>
          </footer>
        </main>
      </div>

      {toast && <div className="vx-toast">{toast}</div>}

      <style jsx global>{`
        .vx-root {
          --ink: #1d1a3d;
          --violet: #7852f5;
          --violet-d: #4a35d0;
          --pink: #ff78c4;
          --cyan: #28b0ff;
          position: fixed;
          inset: 0;
          z-index: 1;
          direction: rtl;
          color: var(--ink);
          overflow: hidden;
          font-family: Vazirmatn, Tahoma, system-ui, -apple-system,
            "Segoe UI", Roboto, "Noto Sans Arabic", Arial, sans-serif;
          -webkit-font-smoothing: antialiased;
          background:
            radial-gradient(
              120% 60% at 50% -10%,
              rgba(255, 255, 255, 0.75),
              transparent 60%
            ),
            radial-gradient(
              90% 60% at 100% 100%,
              rgba(255, 160, 214, 0.55),
              transparent 62%
            ),
            radial-gradient(
              90% 60% at 0% 90%,
              rgba(140, 190, 255, 0.6),
              transparent 62%
            ),
            linear-gradient(165deg, #cdbfff 0%, #c3d5ff 50%, #e2d0ff 100%);
        }

        .vx-root *,
        .vx-root *::before,
        .vx-root *::after {
          box-sizing: border-box;
        }

        .vx-root button,
        .vx-root textarea {
          font: inherit;
          color: inherit;
          -webkit-tap-highlight-color: transparent;
        }

        .vx-root a {
          text-decoration: none;
        }

        /* ---------- Background ---------- */

        .vx-bg {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
        }

        .vx-bg::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image: radial-gradient(
            rgba(90, 70, 210, 0.2) 1px,
            transparent 1.3px
          );
          background-size: 22px 22px;
          -webkit-mask-image: linear-gradient(to bottom, #000, transparent 70%);
          mask-image: linear-gradient(to bottom, #000, transparent 70%);
        }

        .vx-blob {
          position: absolute;
          border-radius: 50%;
          will-change: transform;
        }

        .vx-b1 {
          width: 520px;
          height: 520px;
          left: -230px;
          top: -40px;
          background: radial-gradient(
            closest-side,
            rgba(139, 108, 255, 0.55),
            transparent
          );
          animation: vxDriftA 18s ease-in-out infinite alternate;
        }

        .vx-b2 {
          width: 500px;
          height: 500px;
          right: -240px;
          top: 36%;
          background: radial-gradient(
            closest-side,
            rgba(70, 200, 255, 0.5),
            transparent
          );
          animation: vxDriftB 22s ease-in-out infinite alternate;
        }

        .vx-b3 {
          width: 440px;
          height: 440px;
          left: 6%;
          bottom: -200px;
          background: radial-gradient(
            closest-side,
            rgba(255, 130, 200, 0.5),
            transparent
          );
          animation: vxDriftA 20s ease-in-out infinite alternate-reverse;
        }

        .vx-spark {
          position: absolute;
          font-style: normal;
          color: #fff;
          text-shadow: 0 0 12px rgba(120, 82, 245, 0.8);
          animation: vxTwinkle 3.6s ease-in-out infinite;
        }

        .vx-spark.s1 {
          top: 9%;
          right: 10%;
          font-size: 16px;
        }
        .vx-spark.s2 {
          top: 24%;
          left: 7%;
          font-size: 11px;
          animation-delay: 0.7s;
        }
        .vx-spark.s3 {
          top: 48%;
          right: 5%;
          font-size: 10px;
          animation-delay: 1.5s;
        }
        .vx-spark.s4 {
          top: 66%;
          left: 11%;
          font-size: 14px;
          animation-delay: 2.1s;
        }
        .vx-spark.s5 {
          top: 86%;
          right: 18%;
          font-size: 11px;
          animation-delay: 1s;
        }

        /* ---------- Scroll ---------- */

        .vx-scroll {
          position: absolute;
          inset: 0;
          overflow-y: auto;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
          scrollbar-width: none;
          scroll-behavior: smooth;
        }

        .vx-scroll::-webkit-scrollbar {
          display: none;
        }

        /* ---------- Top ---------- */

        .vx-top {
          position: sticky;
          top: 0;
          z-index: 20;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 10px;
          padding: calc(env(safe-area-inset-top, 0px) + 10px) 14px 10px;
          background: linear-gradient(
            to bottom,
            rgba(222, 212, 255, 0.98) 0,
            rgba(222, 212, 255, 0.98) 80%,
            rgba(222, 212, 255, 0) 100%
          );
          animation: vxFadeDown 0.6s ease both;
        }

        .vx-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 38px;
          padding: 0 14px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.95);
          background: rgba(255, 255, 255, 0.8);
          box-shadow: 0 6px 18px rgba(86, 66, 200, 0.14);
          font-size: 13px;
          font-weight: 700;
          color: var(--violet-d);
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .vx-pill:active {
          transform: scale(0.94);
        }

        .vx-pill svg {
          width: 17px;
          height: 17px;
        }

        .vx-back {
          justify-self: start;
        }

        .vx-lib-btn {
          justify-self: end;
          font-variant-numeric: tabular-nums;
        }

        .vx-brand {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          letter-spacing: 4px;
          color: #2a1f7a;
        }

        .vx-logo {
          width: 26px;
          height: 26px;
          display: grid;
          place-items: center;
          border-radius: 9px;
          color: #fff;
          background: linear-gradient(135deg, #7852f5, #c25bff 60%, #ff78c4);
          box-shadow: 0 6px 14px rgba(120, 82, 245, 0.45);
        }

        .vx-logo svg {
          width: 15px;
          height: 15px;
        }

        /* ---------- Layout ---------- */

        .vx-wrap {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 760px;
          margin: 0 auto;
          padding: 8px 16px calc(env(safe-area-inset-bottom, 0px) + 40px);
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* ---------- Hero ---------- */

        .vx-hero {
          text-align: center;
          animation: vxRise 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) 0.1s both;
        }

        .vx-label {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 14px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 2.5px;
          color: var(--violet-d);
          background: rgba(255, 255, 255, 0.76);
          border: 1px solid rgba(255, 255, 255, 0.95);
          box-shadow: 0 6px 18px rgba(86, 66, 200, 0.14);
          direction: ltr;
        }

        .vx-label-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--cyan), var(--pink));
          animation: vxPulse 1.8s ease-out infinite;
        }

        .vx-hero h1 {
          margin: 14px 0 8px;
          font-size: clamp(26px, 7vw, 40px);
          line-height: 1.5;
          font-weight: 900;
        }

        .vx-hero h1 span {
          display: inline-block;
          background: linear-gradient(
            90deg,
            #4a35d0,
            #b43fe0 30%,
            #ff5fa8 55%,
            #1f9bff 80%,
            #4a35d0
          );
          background-size: 250% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
          animation: vxFlow 7s linear infinite;
        }

        .vx-hero p {
          margin: 0 auto;
          max-width: 420px;
          font-size: 14.5px;
          font-weight: 500;
          line-height: 1.9;
          color: rgba(29, 26, 61, 0.7);
        }

        /* ---------- Stage ---------- */

        .vx-stage {
          scroll-margin-top: 84px;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 14px 14px 18px;
          border-radius: 32px;
          background: rgba(255, 255, 255, 0.55);
          border: 1px solid rgba(255, 255, 255, 0.95);
          box-shadow:
            0 24px 60px rgba(86, 66, 200, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
          animation: vxRise 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) 0.15s both;
          transition: box-shadow 0.5s ease;
        }

        .vx-stage.playing {
          box-shadow:
            0 28px 70px rgba(255, 112, 190, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
        }

        .vx-orb {
          width: min(76vw, 300px);
          aspect-ratio: 1;
          animation: vxOrbIn 1.1s cubic-bezier(0.2, 0.9, 0.2, 1) 0.25s both;
        }

        .vx-orb canvas {
          width: 100%;
          height: 100%;
          display: block;
        }

        .vx-status {
          margin-top: -10px;
          font-size: 21px;
          font-weight: 900;
          line-height: 1.6;
          text-align: center;
          background: linear-gradient(90deg, #4a35d0, #b43fe0 55%, #1f9bff);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
          animation: vxTextIn 0.5s ease both;
        }

        .vx-sub {
          max-width: 94%;
          min-height: 22px;
          font-size: 13.5px;
          font-weight: 500;
          line-height: 1.8;
          text-align: center;
          color: rgba(29, 26, 61, 0.62);
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .vx-progress {
          width: 80%;
          height: 7px;
          margin-top: 10px;
          overflow: hidden;
          border-radius: 6px;
          background: rgba(120, 82, 245, 0.15);
        }

        .vx-progress span {
          display: block;
          height: 100%;
          border-radius: 6px;
          background: linear-gradient(90deg, #7852f5, #ff78c4, #28b0ff);
          background-size: 200% 100%;
          transition: width 0.4s linear;
          animation: vxFlow 2s linear infinite;
        }

        /* ---------- Player ---------- */

        .vx-player {
          width: 100%;
          margin-top: 12px;
          padding: 14px 14px 12px;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.95);
          box-shadow: 0 10px 26px rgba(86, 66, 200, 0.16);
          animation: vxRise 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }

        .vx-wave {
          position: relative;
          direction: ltr;
          cursor: pointer;
          touch-action: pan-y;
          --p: 0%;
        }

        .vx-wave-main {
          height: 64px;
        }

        .vx-wave-mini {
          height: 34px;
          margin-top: 10px;
        }

        .vx-wave-base,
        .vx-wave-fill {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2px;
        }

        .vx-wave-base i,
        .vx-wave-fill i {
          flex: 1;
          min-width: 2px;
          border-radius: 3px;
          font-style: normal;
        }

        .vx-wave-base i {
          background: rgba(120, 82, 245, 0.22);
        }

        .vx-wave-fill {
          -webkit-clip-path: inset(0 calc(100% - var(--p)) 0 0);
          clip-path: inset(0 calc(100% - var(--p)) 0 0);
        }

        .vx-wave-fill i {
          background: linear-gradient(to top, #7852f5, #ff78c4);
        }

        .vx-player-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 10px;
        }

        .vx-time {
          min-width: 86px;
          font-size: 12.5px;
          font-weight: 700;
          color: rgba(29, 26, 61, 0.65);
          font-variant-numeric: tabular-nums;
        }

        .vx-rate {
          min-width: 58px;
          height: 34px;
          border-radius: 999px;
          border: 1px solid rgba(120, 82, 245, 0.25);
          background: rgba(120, 82, 245, 0.08);
          font-size: 12.5px;
          font-weight: 800;
          color: var(--violet-d);
          cursor: pointer;
          direction: ltr;
        }

        .vx-play-big {
          width: 64px;
          height: 64px;
          display: grid;
          place-items: center;
          border: 0;
          border-radius: 50%;
          color: #fff;
          cursor: pointer;
          background: linear-gradient(135deg, #6a4df0, #b04bff 60%, #ff6fb8);
          box-shadow: 0 14px 30px rgba(106, 77, 240, 0.5);
          transition: transform 0.2s ease;
        }

        .vx-play-big svg {
          width: 28px;
          height: 28px;
        }

        .vx-play-big:active {
          transform: scale(0.92);
        }

        .vx-player-actions {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px dashed rgba(120, 82, 245, 0.2);
        }

        .vx-player-actions button,
        .vx-clip-actions button {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          height: 46px;
          justify-content: center;
          border-radius: 14px;
          border: 1px solid rgba(120, 82, 245, 0.16);
          background: rgba(120, 82, 245, 0.07);
          font-size: 11.5px;
          font-weight: 700;
          color: var(--violet-d);
          cursor: pointer;
          transition: transform 0.2s ease, background 0.2s ease;
        }

        .vx-player-actions button:active,
        .vx-clip-actions button:active {
          transform: scale(0.94);
        }

        .vx-player-actions svg,
        .vx-clip-actions svg {
          width: 17px;
          height: 17px;
        }

        /* ---------- Studio ---------- */

        .vx-studio {
          position: relative;
          padding: 16px;
          border-radius: 28px;
          background: rgba(255, 255, 255, 0.86);
          border: 1px solid rgba(255, 255, 255, 0.95);
          box-shadow:
            0 24px 60px rgba(86, 66, 200, 0.22),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
          animation: vxRise 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) 0.2s both;
          transition: box-shadow 0.35s ease;
        }

        .vx-studio::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1.6px;
          background: linear-gradient(
            120deg,
            #7852f5,
            #28b0ff,
            #ff78c4,
            #7852f5
          );
          background-size: 300% 100%;
          -webkit-mask:
            linear-gradient(#000 0 0) content-box,
            linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask:
            linear-gradient(#000 0 0) content-box exclude,
            linear-gradient(#000 0 0);
          opacity: 0.25;
          transition: opacity 0.35s ease;
          animation: vxFlow 6s linear infinite;
          pointer-events: none;
        }

        .vx-studio.focus {
          box-shadow:
            0 28px 70px rgba(120, 82, 245, 0.34),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
        }

        .vx-studio.focus::before {
          opacity: 0.95;
        }

        .vx-section-title {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 8px;
        }

        .vx-section-title h2 {
          margin: 0;
          font-size: 17px;
          font-weight: 900;
        }

        .vx-section-title p {
          margin: 2px 0 0;
          font-size: 12.5px;
          font-weight: 500;
          color: rgba(29, 26, 61, 0.55);
        }

        .vx-counter {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11.5px;
          font-weight: 700;
          color: rgba(29, 26, 61, 0.5);
          font-variant-numeric: tabular-nums;
        }

        .vx-counter svg {
          width: 28px;
          height: 28px;
          transform: rotate(-90deg);
        }

        .vx-counter circle {
          fill: none;
          stroke-width: 2.4;
        }

        .vx-counter .bg {
          stroke: rgba(120, 82, 245, 0.15);
        }

        .vx-counter .fg {
          stroke: #7852f5;
          stroke-linecap: round;
          transition: stroke-dashoffset 0.25s ease, stroke 0.25s ease;
        }

        .vx-counter .fg.warn {
          stroke: #ff4f7b;
        }

        .vx-field textarea {
          width: 100%;
          min-height: 130px;
          max-height: 300px;
          resize: none;
          padding: 12px 14px;
          border-radius: 18px;
          border: 1px solid rgba(120, 82, 245, 0.16);
          outline: 0;
          background: rgba(255, 255, 255, 0.7);
          font-size: 16.5px;
          font-weight: 500;
          line-height: 2;
          color: var(--ink);
          text-align: start;
          transition: border-color 0.3s ease, background 0.3s ease;
        }

        .vx-field textarea::placeholder {
          color: rgba(29, 26, 61, 0.38);
        }

        .vx-field textarea:focus {
          border-color: rgba(120, 82, 245, 0.45);
          background: #fff;
        }

        .vx-field textarea:disabled {
          opacity: 0.6;
        }

        .vx-tools {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 10px;
        }

        .vx-spacer {
          flex: 1;
        }

        .vx-chip-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 36px;
          padding: 0 13px;
          border-radius: 999px;
          border: 1px solid rgba(120, 82, 245, 0.2);
          background: rgba(120, 82, 245, 0.08);
          font-size: 12.5px;
          font-weight: 700;
          color: var(--violet-d);
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .vx-chip-btn svg {
          width: 16px;
          height: 16px;
        }

        .vx-chip-btn:active {
          transform: scale(0.93);
        }

        .vx-chip-btn:disabled {
          opacity: 0.45;
        }

        .vx-quiet {
          padding: 0 10px;
          color: rgba(29, 26, 61, 0.55);
          background: rgba(29, 26, 61, 0.05);
          border-color: rgba(29, 26, 61, 0.1);
        }

        .vx-est {
          font-size: 12px;
          font-weight: 700;
          color: var(--violet-d);
          padding: 5px 11px;
          border-radius: 999px;
          background: rgba(120, 82, 245, 0.1);
        }

        .vx-row-label {
          display: flex;
          align-items: center;
          gap: 7px;
          margin: 16px 2px 9px;
          font-size: 12.5px;
          font-weight: 800;
          color: rgba(29, 26, 61, 0.7);
        }

        .vx-row-label svg {
          width: 16px;
          height: 16px;
          color: var(--violet);
        }

        .vx-row-label em {
          margin-inline-start: auto;
          font-style: normal;
          font-size: 10px;
          letter-spacing: 1.5px;
          color: var(--violet-d);
          padding: 3px 9px;
          border-radius: 999px;
          background: rgba(120, 82, 245, 0.1);
          direction: ltr;
        }

        .vx-examples {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding: 4px 2px 8px;
          scrollbar-width: none;
        }

        .vx-examples::-webkit-scrollbar {
          display: none;
        }

        .vx-example {
          flex: 0 0 auto;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          height: 40px;
          padding: 0 14px 0 12px;
          border-radius: 999px;
          border: 1px solid rgba(120, 82, 245, 0.18);
          background: rgba(255, 255, 255, 0.9);
          font-size: 13px;
          font-weight: 700;
          color: rgba(29, 26, 61, 0.85);
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.25s ease;
        }

        .vx-example i {
          font-style: normal;
          font-size: 16px;
        }

        .vx-example:active {
          transform: scale(0.94);
        }

        .vx-example:hover {
          box-shadow: 0 8px 18px rgba(120, 82, 245, 0.25);
        }

        .vx-example:disabled {
          opacity: 0.5;
        }

        .vx-voice-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 20px;
          background: linear-gradient(
            135deg,
            rgba(120, 82, 245, 0.1),
            rgba(40, 176, 255, 0.1)
          );
          border: 1.5px solid rgba(120, 82, 245, 0.35);
        }

        .vx-voice-wave {
          width: 46px;
          height: 46px;
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 3px;
          border-radius: 15px;
          background: linear-gradient(135deg, #7852f5, #c25bff);
          box-shadow: 0 8px 18px rgba(120, 82, 245, 0.4);
        }

        .vx-voice-wave i {
          width: 3px;
          height: 16px;
          border-radius: 3px;
          background: #fff;
          animation: vxBar 1.1s ease-in-out infinite;
        }

        .vx-voice-wave i:nth-child(2) {
          animation-delay: 0.1s;
        }
        .vx-voice-wave i:nth-child(3) {
          animation-delay: 0.2s;
        }
        .vx-voice-wave i:nth-child(4) {
          animation-delay: 0.3s;
        }
        .vx-voice-wave i:nth-child(5) {
          animation-delay: 0.4s;
        }
        .vx-voice-wave i:nth-child(6) {
          animation-delay: 0.5s;
        }

        .vx-voice-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }

        .vx-voice-info strong {
          font-size: 14.5px;
          font-weight: 900;
        }

        .vx-voice-info span {
          font-size: 11.5px;
          font-weight: 500;
          line-height: 1.7;
          color: rgba(29, 26, 61, 0.6);
        }

        .vx-check {
          width: 26px;
          height: 26px;
          flex: 0 0 auto;
          display: grid;
          place-items: center;
          border-radius: 50%;
          font-size: 13px;
          font-weight: 900;
          color: #fff;
          background: linear-gradient(135deg, #2bd49a, #28b0ff);
        }

        /* ---------- Generate ---------- */

        .vx-generate {
          position: relative;
          overflow: hidden;
          width: 100%;
          height: 60px;
          margin-top: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          border: 0;
          border-radius: 20px;
          font-size: 18px;
          font-weight: 900;
          color: #fff;
          cursor: pointer;
          background: linear-gradient(
            110deg,
            #6a4df0,
            #9b4dff 40%,
            #ff6fb8 75%,
            #6a4df0
          );
          background-size: 250% 100%;
          box-shadow: 0 16px 34px rgba(106, 77, 240, 0.45);
          transition: transform 0.2s ease, filter 0.3s ease;
          animation: vxFlow 5s linear infinite;
        }

        .vx-generate:active {
          transform: scale(0.97);
        }

        .vx-generate.ready::after {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          width: 60px;
          left: -80px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.55),
            transparent
          );
          transform: skewX(-20deg);
          animation: vxSweep 3.2s ease-in-out infinite;
        }

        .vx-generate:not(.ready):not(.busy) {
          filter: saturate(0.55) brightness(1.04);
          box-shadow: 0 8px 18px rgba(106, 77, 240, 0.2);
        }

        .vx-generate:disabled {
          cursor: default;
        }

        .vx-eq {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          height: 24px;
        }

        .vx-eq i {
          width: 3.5px;
          height: 100%;
          border-radius: 3px;
          background: #fff;
          animation: vxBar 1.1s ease-in-out infinite;
        }

        .vx-generate:not(.ready) .vx-eq i {
          animation-duration: 2.2s;
        }

        .vx-eq i:nth-child(2) {
          animation-delay: 0.12s;
        }
        .vx-eq i:nth-child(3) {
          animation-delay: 0.24s;
        }
        .vx-eq i:nth-child(4) {
          animation-delay: 0.36s;
        }
        .vx-eq i:nth-child(5) {
          animation-delay: 0.48s;
        }

        .vx-spinner {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2.5px solid rgba(255, 255, 255, 0.4);
          border-top-color: #fff;
          animation: vxSpin 0.8s linear infinite;
        }

        .vx-kbd {
          display: none;
          margin-top: 10px;
          text-align: center;
          direction: ltr;
          font-size: 11px;
          color: rgba(29, 26, 61, 0.45);
        }

        @media (hover: hover) and (pointer: fine) {
          .vx-kbd {
            display: block;
          }
        }

        .vx-error {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 14px;
          padding: 13px 16px;
          border-radius: 18px;
          color: #b4234f;
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid rgba(255, 93, 122, 0.35);
          box-shadow: 0 10px 26px rgba(255, 93, 122, 0.18);
          animation: vxRise 0.4s ease both;
        }

        .vx-error i {
          flex: 0 0 auto;
          width: 26px;
          height: 26px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          font-style: normal;
          font-weight: 900;
          color: #fff;
          background: #ff4f7b;
        }

        .vx-error p {
          margin: 0;
          font-size: 13.5px;
          font-weight: 600;
          line-height: 1.8;
        }

        /* ---------- Sections ---------- */

        .vx-section {
          scroll-margin-top: 84px;
          animation: vxRise 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) 0.3s both;
        }

        .vx-sec-head {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 10px;
          margin: 0 4px 12px;
        }

        .vx-sec-head h2 {
          margin: 0;
          font-size: 17px;
          font-weight: 900;
        }

        .vx-sec-head span {
          font-size: 12px;
          font-weight: 600;
          color: rgba(29, 26, 61, 0.55);
        }

        .vx-clear {
          flex: 0 0 auto;
          height: 34px;
          padding: 0 14px;
          border-radius: 999px;
          border: 1px solid rgba(29, 26, 61, 0.15);
          background: rgba(255, 255, 255, 0.75);
          font-size: 12px;
          font-weight: 700;
          color: rgba(29, 26, 61, 0.7);
          cursor: pointer;
        }

        .vx-clear.sure,
        .vx-del.sure {
          color: #fff;
          border-color: transparent;
          background: #ff4f7b;
        }

        .vx-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          padding: 28px 18px;
          text-align: center;
          border-radius: 26px;
          border: 1.5px dashed rgba(120, 82, 245, 0.35);
          background: rgba(255, 255, 255, 0.5);
        }

        .vx-empty-wave {
          display: flex;
          align-items: center;
          gap: 5px;
          height: 40px;
        }

        .vx-empty-wave i {
          width: 5px;
          height: 100%;
          border-radius: 4px;
          background: linear-gradient(to top, #7852f5, #ff78c4);
          animation: vxBar 1.4s ease-in-out infinite;
        }

        .vx-empty-wave i:nth-child(2) {
          animation-delay: 0.12s;
        }
        .vx-empty-wave i:nth-child(3) {
          animation-delay: 0.24s;
        }
        .vx-empty-wave i:nth-child(4) {
          animation-delay: 0.36s;
        }
        .vx-empty-wave i:nth-child(5) {
          animation-delay: 0.48s;
        }
        .vx-empty-wave i:nth-child(6) {
          animation-delay: 0.6s;
        }
        .vx-empty-wave i:nth-child(7) {
          animation-delay: 0.72s;
        }

        .vx-empty p {
          margin: 0;
          max-width: 320px;
          font-size: 13px;
          font-weight: 500;
          line-height: 1.95;
          color: rgba(29, 26, 61, 0.62);
        }

        .vx-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .vx-clip {
          padding: 14px 14px 12px;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.84);
          border: 1px solid rgba(255, 255, 255, 0.95);
          box-shadow: 0 10px 26px rgba(86, 66, 200, 0.15);
          animation: vxRise 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) both;
          transition: box-shadow 0.3s ease, transform 0.3s ease;
        }

        .vx-clip.active {
          box-shadow:
            0 0 0 2px #7852f5,
            0 16px 34px rgba(120, 82, 245, 0.35);
        }

        .vx-clip-top {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .vx-play {
          width: 48px;
          height: 48px;
          flex: 0 0 auto;
          display: grid;
          place-items: center;
          border: 0;
          border-radius: 50%;
          color: #fff;
          cursor: pointer;
          background: linear-gradient(135deg, #6a4df0, #b04bff);
          box-shadow: 0 10px 22px rgba(106, 77, 240, 0.4);
          transition: transform 0.2s ease;
        }

        .vx-play svg {
          width: 20px;
          height: 20px;
        }

        .vx-play:active {
          transform: scale(0.92);
        }

        .vx-clip-body {
          flex: 1;
          min-width: 0;
        }

        .vx-clip-body p {
          margin: 0;
          font-size: 14px;
          font-weight: 500;
          line-height: 1.9;
          text-align: start;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .vx-clip-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 2px;
          font-size: 11.5px;
          font-weight: 600;
          color: rgba(29, 26, 61, 0.5);
          font-variant-numeric: tabular-nums;
        }

        .vx-clip-actions {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          margin-top: 10px;
        }

        .vx-clip-actions button {
          height: 42px;
        }

        .vx-del {
          color: #d6275c;
        }

        /* ---------- Tips ---------- */

        .vx-tips {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        .vx-tip {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 14px 12px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.78);
          border: 1px solid rgba(255, 255, 255, 0.95);
          box-shadow: 0 8px 22px rgba(86, 66, 200, 0.14);
        }

        .vx-tip i {
          width: 36px;
          height: 36px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          font-style: normal;
          font-size: 18px;
          background: linear-gradient(
            135deg,
            rgba(120, 82, 245, 0.16),
            rgba(40, 176, 255, 0.16)
          );
        }

        .vx-tip b {
          margin-top: 6px;
          font-size: 13px;
          font-weight: 900;
        }

        .vx-tip span {
          font-size: 11.5px;
          line-height: 1.8;
          color: rgba(29, 26, 61, 0.62);
        }

        .vx-foot {
          text-align: center;
          padding-top: 4px;
          font-size: 11.5px;
          font-weight: 600;
          color: rgba(29, 26, 61, 0.45);
          direction: ltr;
        }

        .vx-foot strong {
          color: var(--violet-d);
        }

        /* ---------- Toast ---------- */

        .vx-toast {
          position: fixed;
          left: 50%;
          bottom: calc(env(safe-area-inset-bottom, 0px) + 26px);
          z-index: 80;
          transform: translateX(-50%);
          padding: 11px 20px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 700;
          color: #fff;
          background: rgba(29, 26, 61, 0.88);
          box-shadow: 0 12px 30px rgba(20, 14, 52, 0.4);
          animation: vxToast 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }

        /* ---------- Keyframes ---------- */

        @keyframes vxRise {
          from {
            opacity: 0;
            transform: translateY(22px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes vxFadeDown {
          from {
            opacity: 0;
            transform: translateY(-14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes vxTextIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes vxOrbIn {
          from {
            opacity: 0;
            transform: scale(0.3);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes vxToast {
          from {
            opacity: 0;
            transform: translate(-50%, 14px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }

        @keyframes vxDriftA {
          from {
            transform: translate3d(0, 0, 0) scale(1);
          }
          to {
            transform: translate3d(70px, 50px, 0) scale(1.15);
          }
        }

        @keyframes vxDriftB {
          from {
            transform: translate3d(0, 0, 0) scale(1.1);
          }
          to {
            transform: translate3d(-60px, -70px, 0) scale(0.95);
          }
        }

        @keyframes vxTwinkle {
          0%,
          100% {
            opacity: 0.25;
            transform: scale(0.8) rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: scale(1.2) rotate(20deg);
          }
        }

        @keyframes vxFlow {
          from {
            background-position: 0% 50%;
          }
          to {
            background-position: 250% 50%;
          }
        }

        @keyframes vxSweep {
          0%,
          55% {
            left: -80px;
          }
          100% {
            left: 120%;
          }
        }

        @keyframes vxPulse {
          0% {
            box-shadow: 0 0 0 0 rgba(120, 82, 245, 0.55);
          }
          100% {
            box-shadow: 0 0 0 10px rgba(120, 82, 245, 0);
          }
        }

        @keyframes vxSpin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes vxBar {
          0%,
          100% {
            transform: scaleY(0.35);
          }
          50% {
            transform: scaleY(1);
          }
        }

        @media (max-width: 380px) {
          .vx-tips {
            grid-template-columns: 1fr;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .vx-root *,
          .vx-root *::before,
          .vx-root *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </div>
  );
}
