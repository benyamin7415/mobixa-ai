"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

/* =========================================================
   CONSTANTS
========================================================= */

const MAX_PROMPT = 2048;

const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Sora:wght@400;600;800&family=Vazirmatn:wght@300;400;500;700;800;900&display=swap";

type StyleOption = {
  id: string;
  fa: string;
  en: string;
};

/*
  استایل‌ها فقط وقتی انتخاب شوند به انتهای ایده اضافه می‌شوند.
  اگر هیچ‌کدام انتخاب نشود، دقیقاً همان متن خود کاربر ارسال می‌شود.
*/
const STYLE_OPTIONS: StyleOption[] = [
  { id: "cinematic", fa: "سینمایی", en: "cinematic lighting, film still, dramatic atmosphere" },
  { id: "realistic", fa: "فوق‌واقعی", en: "ultra realistic photo, 8k detail, natural light" },
  { id: "anime", fa: "انیمه", en: "anime style, vibrant colors, clean line art" },
  { id: "3d", fa: "سه‌بعدی", en: "3D render, soft studio light, smooth materials" },
  { id: "watercolor", fa: "آبرنگ", en: "watercolor painting, soft edges, delicate texture" },
  { id: "neon", fa: "نئونی", en: "neon cyberpunk, glowing lights, night city" },
  { id: "fantasy", fa: "فانتزی", en: "fantasy illustration, magical atmosphere, epic scale" },
  { id: "minimal", fa: "مینیمال", en: "minimalist, clean composition, soft pastel colors" },
];

const IDEAS: string[] = [
  "گربه‌ای فضانورد که روی ماه چای می‌نوشد، نور طلایی غروب",
  "شهری آینده‌نگر بالای ابرها، غروب بنفش، سینمایی",
  "جنگل شیشه‌ای با کرم‌های شب‌تاب آبی",
  "کتابخانه‌ای بی‌انتها با پلکان‌های معلق و نور گرم",
  "پرتره‌ی یک ربات پیر با چشم‌های مهربان، نور نئون",
  "ماهی‌های رنگی که بالای یک روستای کوهستانی در آسمان شنا می‌کنند",
  "کافه‌ای کوچک زیر باران در توکیو، انعکاس نورها روی خیابان",
  "اژدهای کریستالی روی قله‌ای برفی هنگام طلوع",
  "ساعتی غول‌پیکر وسط کویر که زمان از آن شن می‌شود",
  "نهنگی از جنس کهکشان که بین ستاره‌ها شنا می‌کند",
];

const STAGES = [
  "دارم ایده‌ت رو می‌فهمم",
  "ترکیب‌بندی رو می‌چینم",
  "رنگ‌ها رو می‌ریزم",
  "جزئیات رو می‌سازم",
  "پرداخت نهایی",
];

type HistoryItem = {
  id: string;
  image: string;
  prompt: string;
  styles: string[];
};

/* =========================================================
   HELPERS
========================================================= */

function hashString(text: string): number {
  let h = 2166136261;

  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }

  return h >>> 0;
}

function seeded(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;

  return x - Math.floor(x);
}

function hash2(x: number, y: number, step: number): number {
  let h = (x * 374761393 + y * 668265263 + step * 1442695041) | 0;

  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;

  return h >>> 0;
}

function hslToRgb(
  h: number,
  s: number,
  l: number
): [number, number, number] {
  const hue = ((h % 360) + 360) % 360;
  const sat = s / 100;
  const lig = l / 100;

  const k = (n: number) => (n + hue / 30) % 12;
  const a = sat * Math.min(lig, 1 - lig);

  const f = (n: number) =>
    lig - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

  return [
    Math.round(f(0) * 255),
    Math.round(f(8) * 255),
    Math.round(f(4) * 255),
  ];
}

function buildPrompt(base: string, styleIds: string[]): string {
  const extra = STYLE_OPTIONS.filter((option) =>
    styleIds.includes(option.id)
  )
    .map((option) => option.en)
    .join(", ");

  if (!extra) {
    return base;
  }

  return `${base}, ${extra}`.slice(0, MAX_PROMPT);
}

function preloadImage(url: string): Promise<void> {
  return new Promise((resolve) => {
    const probe = new window.Image();

    const timer = window.setTimeout(resolve, 15000);

    const finish = () => {
      window.clearTimeout(timer);
      resolve();
    };

    probe.onload = finish;
    probe.onerror = finish;
    probe.src = url;
  });
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const update = () => setReduced(query.matches);

    update();

    query.addEventListener("change", update);

    return () => {
      query.removeEventListener("change", update);
    };
  }, []);

  return reduced;
}

/* =========================================================
   ICONS
========================================================= */

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M19 12H5M11 6l-6 6 6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 2.5c.6 4.6 2.9 6.9 7.5 7.5-4.6.6-6.9 2.9-7.5 7.5-.6-4.6-2.9-6.9-7.5-7.5 4.6-.6 6.9-2.9 7.5-7.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

function WandIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="m5 19 9.5-9.5M13 6l5 5M16.5 3v3M15 4.5h3M20.5 8v2M19.5 9h2M6 4v2M5 5h2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 3v12M7 10l5 5 5-5M5 21h14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RetryIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M20 11a8.1 8.1 0 0 0-15.5-2M4 4v5h5M4 13a8.1 8.1 0 0 0 15.5 2M20 20v-5h-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect
        x="8"
        y="8"
        width="11"
        height="11"
        rx="2.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
      />
      <path
        d="M16 8V6.5A2.5 2.5 0 0 0 13.5 4h-7A2.5 2.5 0 0 0 4 6.5v7A2.5 2.5 0 0 0 6.5 16H8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="m5 12 4.5 4.5L19 7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ExpandIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="m6.5 6.5 11 11M17.5 6.5l-11 11"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* =========================================================
   DIFFUSION CANVAS
   یک بومِ زنده که مثل مدل‌های انتشار (diffusion)
   از نویز شروع می‌کند و کم‌کم به تصویر شفاف می‌رسد.
   رنگ‌هایش از روی متن ایده‌ی خود کاربر ساخته می‌شود،
   پس هر ایده، ظاهر مخصوص خودش را دارد.
========================================================= */

function DiffusionCanvas({
  seedText,
  mode,
  finishing,
  onDone,
  reduced,
}: {
  seedText: string;
  mode: "demo" | "generate";
  finishing: boolean;
  onDone: () => void;
  reduced: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const finishingRef = useRef(finishing);
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    finishingRef.current = finishing;
    onDoneRef.current = onDone;
  });

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const g = canvas.getContext("2d");

    if (!g) {
      return;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssSize = canvas.clientWidth || 360;

    canvas.width = Math.round(cssSize * dpr);
    canvas.height = Math.round(cssSize * dpr);

    const size = canvas.width;

    const seed = hashString(seedText || "mobixa");

    const hue = seed % 360;

    /* پالت ۲۵۶ رنگی از روی ایده */

    const stops = [
      hslToRgb(hue, 86, 74),
      hslToRgb(hue + 58, 88, 68),
      hslToRgb(hue + 140, 90, 72),
      hslToRgb(hue + 215, 84, 70),
    ];

    const lut = new Uint8ClampedArray(256 * 3);

    for (let i = 0; i < 256; i++) {
      const pos = (i / 255) * (stops.length - 1);
      const index = Math.min(stops.length - 2, Math.floor(pos));
      const mix = pos - index;

      for (let c = 0; c < 3; c++) {
        lut[i * 3 + c] =
          stops[index][c] +
          (stops[index + 1][c] - stops[index][c]) * mix;
      }
    }

    const s1 = seeded(seed) * 6;
    const s2 = seeded(seed + 1) * 6;
    const s3 = seeded(seed + 2) * 6;

    const small = document.createElement("canvas");
    const sctx = small.getContext("2d");

    if (!sctx) {
      return;
    }

    let imageData: ImageData | null = null;
    let lastN = 0;
    let p = mode === "demo" ? 0.4 : 0;
    let doneAt = 0;
    let called = false;
    let frame = 0;

    const start = performance.now();

    const render = (now: number) => {
      frame = requestAnimationFrame(render);

      if (document.hidden) {
        return;
      }

      const t = (now - start) / 1000;

      let target: number;

      if (mode === "demo") {
        target = 0.5 + 0.42 * Math.sin(t * 0.55);
        p += (target - p) * 0.08;
      } else {
        target = finishingRef.current
          ? 1
          : 0.94 * (1 - Math.exp(-t / 8.5));

        p += (target - p) * (finishingRef.current ? 0.1 : 0.04);

        if (finishingRef.current && p > 0.985) {
          if (!doneAt) {
            doneAt = now;
          }

          if (!called && now - doneAt > 420) {
            called = true;
            onDoneRef.current();
          }
        }
      }

      const N = Math.max(
        6,
        Math.min(96, Math.floor(6 + 90 * Math.pow(Math.max(0, p), 1.5)))
      );

      if (N !== lastN || !imageData) {
        small.width = N;
        small.height = N;
        imageData = sctx.createImageData(N, N);
        lastN = N;
      }

      const data = imageData.data;
      const noiseAmount = Math.pow(1 - Math.min(1, p), 1.35);
      const step = reduced ? 0 : Math.floor(t * 10);

      for (let y = 0; y < N; y++) {
        for (let x = 0; x < N; x++) {
          const u = x / N;
          const v = y / N;

          const wave =
            Math.sin(u * 3.1 + t * 0.55 + s1) +
            Math.cos(v * 3.4 - t * 0.45 + s2) +
            Math.sin((u + v) * 2.3 + t * 0.35 + s3);

          const dx = u - 0.5;
          const dy = v - 0.56;
          const blob = Math.exp(-(dx * dx + dy * dy) / 0.07);

          let m = (wave + 3) / 6;

          m = Math.max(0, Math.min(1, m * 0.8 + blob * 0.35));

          const li = ((m * 255) | 0) * 3;

          let r = lut[li];
          let gr = lut[li + 1];
          let b = lut[li + 2];

          if (noiseAmount > 0.01) {
            const h = hash2(x, y, step);
            const k = noiseAmount * 0.92;

            r += ((h & 255) - r) * k;
            gr += (((h >> 8) & 255) - gr) * k;
            b += (((h >> 16) & 255) - b) * k;
          }

          const idx = (y * N + x) * 4;

          data[idx] = r;
          data[idx + 1] = gr;
          data[idx + 2] = b;
          data[idx + 3] = 255;
        }
      }

      sctx.putImageData(imageData, 0, 0);

      g.imageSmoothingEnabled = p > 0.82;
      g.drawImage(small, 0, 0, size, size);

      /* خط اسکن نورانی */

      if (!reduced) {
        const y = ((t * 0.3) % 1.25) * size - size * 0.1;

        const band = g.createLinearGradient(
          0,
          y - size * 0.12,
          0,
          y + size * 0.02
        );

        band.addColorStop(0, "rgba(255,255,255,0)");
        band.addColorStop(0.85, "rgba(255,255,255,0.5)");
        band.addColorStop(1, "rgba(255,255,255,0)");

        g.fillStyle = band;
        g.fillRect(0, y - size * 0.12, size, size * 0.14);
      }

      /* جرقه‌های چشمک‌زن */

      for (let i = 0; i < 7; i++) {
        const sx = seeded(seed + i * 3) * size;
        const sy = seeded(seed + i * 3 + 1) * size;
        const alpha = Math.max(0, Math.sin(t * 1.8 + i * 1.7));
        const arm = size * 0.016 * (0.6 + alpha);

        g.strokeStyle = `rgba(255,255,255,${(alpha * 0.9).toFixed(2)})`;
        g.lineWidth = Math.max(1.5, size * 0.004);
        g.lineCap = "round";

        g.beginPath();
        g.moveTo(sx - arm, sy);
        g.lineTo(sx + arm, sy);
        g.moveTo(sx, sy - arm);
        g.lineTo(sx, sy + arm);
        g.stroke();
      }
    };

    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [seedText, mode, reduced]);

  return <canvas ref={canvasRef} className="im-diffusion" aria-hidden="true" />;
}

/* =========================================================
   GENERATING STAGE
========================================================= */

function GeneratingStage({
  prompt,
  finishing,
  onDone,
  reduced,
}: {
  prompt: string;
  finishing: boolean;
  onDone: () => void;
  reduced: boolean;
}) {
  const [stage, setStage] = useState(0);
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const stageTimer = window.setInterval(() => {
      setStage((current) => Math.min(current + 1, STAGES.length - 1));
    }, 3200);

    const slowTimer = window.setTimeout(() => setSlow(true), 28000);

    return () => {
      window.clearInterval(stageTimer);
      window.clearTimeout(slowTimer);
    };
  }, []);

  const words = useMemo(
    () =>
      prompt
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 9),
    [prompt]
  );

  const label = finishing ? "تمومه! دارم نشونت می‌دم ✨" : STAGES[stage];

  return (
    <div className="im-stage-card" role="status" aria-live="polite">
      <div className="im-frame">
        <DiffusionCanvas
          seedText={prompt}
          mode="generate"
          finishing={finishing}
          onDone={onDone}
          reduced={reduced}
        />

        <div className="im-corners" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </div>

        {!reduced && (
          <div className="im-words" aria-hidden="true">
            {words.map((word, index) => {
              const angle = seeded(index * 7.31 + 1.3) * Math.PI * 2;

              return (
                <span
                  key={`${word}-${index}`}
                  style={
                    {
                      "--cx": Math.cos(angle).toFixed(3),
                      "--cy": Math.sin(angle).toFixed(3),
                      "--wd": `${(index * 0.62).toFixed(2)}s`,
                    } as CSSProperties
                  }
                >
                  {word}
                </span>
              );
            })}
          </div>
        )}

        <div className="im-core" aria-hidden="true">
          <i />
        </div>
      </div>

      <div className="im-stage-info">
        <div className="im-stage-label" key={label}>
          {label}
        </div>

        <div className="im-stage-dots" aria-hidden="true">
          {STAGES.map((item, index) => (
            <i
              key={item}
              className={
                finishing || index <= stage ? "on" : undefined
              }
            />
          ))}
        </div>

        <div className="im-stage-sub">
          {slow
            ? "کمی طول کشید، ولی داره تموم می‌شه…"
            : "هر کلمه‌ی ایده‌ت داره به پیکسل تبدیل می‌شه…"}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function ImagePage() {
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [styles, setStyles] = useState<string[]>([]);
  const [stageOpen, setStageOpen] = useState(false);
  const [imageReady, setImageReady] = useState(true);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [zoom, setZoom] = useState(false);
  const [copied, setCopied] = useState(false);

  const reduced = useReducedMotion();

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLElement | null>(null);
  const typerRef = useRef(0);
  const copyTimerRef = useRef(0);
  const aliveRef = useRef(true);

  useEffect(() => {
    aliveRef.current = true;

    return () => {
      aliveRef.current = false;
      window.clearInterval(typerRef.current);
      window.clearTimeout(copyTimerRef.current);
    };
  }, []);

  /* رشد خودکار کادر نوشتن */

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";

    textarea.style.height = `${Math.min(
      Math.max(112, textarea.scrollHeight),
      260
    )}px`;
  }, [prompt]);

  /* Esc بستن نمای بزرگ */

  useEffect(() => {
    if (!zoom) {
      return;
    }

    const onKey = (event: Event) => {
      if (
        (event as unknown as { key?: string }).key === "Escape"
      ) {
        setZoom(false);
      }
    };

    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [zoom]);

  /* ====================================================
     ساخت تصویر — همان منطق و همان API قبلی
  ==================================================== */

  const generateImage = async (retryPrompt?: string) => {
    const base = (retryPrompt ?? prompt).trim();

    if (!base || loading) return;

    const finalPrompt = buildPrompt(base, styles);

    window.clearInterval(typerRef.current);

    setLoading(true);
    setError("");
    setStageOpen(true);
    setImageReady(false);

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        stageRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    });

    try {
      const response = await fetch("/api/image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: finalPrompt,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "ساخت تصویر با خطا مواجه شد."
        );
      }

      setImage(data.image);

      setHistory((old) =>
        [
          {
            id:
              typeof crypto !== "undefined" &&
              "randomUUID" in crypto
                ? crypto.randomUUID()
                : String(Date.now()),
            image: data.image as string,
            prompt: base,
            styles,
          },
          ...old,
        ].slice(0, 8)
      );

      await preloadImage(data.image as string);

      if (aliveRef.current) {
        setImageReady(true);
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : "یه مشکلی پیش اومد، دوباره امتحان کن."
      );

      setStageOpen(false);
      setImageReady(true);
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = async () => {
    if (!image) return;

    try {
      const response = await fetch(image);

      if (!response.ok) {
        throw new Error("دانلود تصویر انجام نشد.");
      }

      const blob = await response.blob();

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = "mobixa-image.jpg";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
    } catch (err) {
      console.error("DOWNLOAD_ERROR", err);

      setError(
        "دانلود تصویر انجام نشد. دوباره امتحان کن."
      );
    }
  };

  const retryImage = () => {
    if (!prompt.trim() || loading) return;

    generateImage(prompt);
  };

  /* ====================================================
     امکانات اضافه (فقط ظاهر و تجربه)
  ==================================================== */

  const typeIdea = (text: string) => {
    if (loading) return;

    window.clearInterval(typerRef.current);

    let index = 0;

    setPrompt("");
    setError("");

    typerRef.current = window.setInterval(() => {
      index += 2;

      setPrompt(text.slice(0, index));

      if (index >= text.length) {
        window.clearInterval(typerRef.current);
        textareaRef.current?.focus();
      }
    }, 22);
  };

  const surprise = () => {
    const pick = IDEAS[Math.floor(Math.random() * IDEAS.length)];

    typeIdea(pick);
  };

  const toggleStyle = (id: string) => {
    setStyles((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const copyPrompt = async () => {
    const text = prompt.trim();

    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // کپی پشتیبانی نشد.
    }

    setCopied(true);

    window.clearTimeout(copyTimerRef.current);

    copyTimerRef.current = window.setTimeout(
      () => setCopied(false),
      1700
    );
  };

  const openHistory = (item: HistoryItem) => {
    if (loading) return;

    setImage(item.image);
    setPrompt(item.prompt);
    setStyles(item.styles);
    setStageOpen(false);
    setError("");
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (
      event.key === "Enter" &&
      (event.ctrlKey || event.metaKey)
    ) {
      event.preventDefault();
      generateImage();
    }
  };

  const tiltMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const element = cardRef.current;

    if (!element || event.pointerType !== "mouse") {
      return;
    }

    const rect = element.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    element.style.setProperty("--rx", `${((x - 0.5) * 8).toFixed(2)}deg`);
    element.style.setProperty("--ry", `${((0.5 - y) * 8).toFixed(2)}deg`);
    element.style.setProperty("--gx", `${(x * 100).toFixed(1)}%`);
    element.style.setProperty("--gy", `${(y * 100).toFixed(1)}%`);
  };

  const tiltLeave = () => {
    const element = cardRef.current;

    if (!element) {
      return;
    }

    element.style.setProperty("--rx", "0deg");
    element.style.setProperty("--ry", "0deg");
  };

  const hasPrompt = prompt.trim().length > 0;
  const finishing = !loading && imageReady;
  const showStage = stageOpen;
  const showResult = !!image && !stageOpen && !loading;
  const showEmpty = !showStage && !showResult;

  const ring = Math.min(1, prompt.length / MAX_PROMPT);

  return (
    <main className="im-root">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin=""
      />
      <link rel="stylesheet" href={FONTS_HREF} />

      {/* ============ BACKGROUND ============ */}
      <div className="im-bg" aria-hidden="true">
        <div className="im-aurora" />
        <div className="im-blob b1" />
        <div className="im-blob b2" />
        <div className="im-blob b3" />
        <div className="im-grid" />

        <span className="im-star s1"><SparkIcon /></span>
        <span className="im-star s2"><SparkIcon /></span>
        <span className="im-star s3"><SparkIcon /></span>
        <span className="im-star s4"><SparkIcon /></span>

        <div className="im-grain" />
      </div>

      {/* ============ HEADER ============ */}
      <header className="im-header">
        <Link href="/" className="im-logo" aria-label="Mobixa AI">
          <span className="im-logo-word">MOBIXA</span>
          <b>AI</b>
        </Link>

        <Link href="/" className="im-back">
          <BackIcon />
          <span>بازگشت</span>
        </Link>
      </header>

      <div className="im-wrap">
        {/* ============ HERO ============ */}
        <section className="im-hero">
          <div className="im-eyebrow im-in" style={{ "--d": "0s" } as CSSProperties}>
            <span className="im-eyebrow-star"><SparkIcon /></span>
            MOBIXA IMAGE LAB
          </div>

          <h1 className="im-title im-in" style={{ "--d": "0.08s" } as CSSProperties}>
            ایده بده و{" "}
            <span>عکس تحویل بگیر</span>
          </h1>

          <p className="im-sub im-in" style={{ "--d": "0.16s" } as CSSProperties}>
            یه ایده بده، موبیکسا تصویرشو برات می‌سازه.
          </p>
        </section>

        <div className="im-grid-layout">
          {/* ============ STUDIO ============ */}
          <section
            className="im-studio im-in"
            style={{ "--d": "0.24s" } as CSSProperties}
          >
            <div className="im-studio-head">
              <span className="im-studio-title">
                <i />
                ایده‌ی تو
              </span>

              <button
                type="button"
                className="im-surprise"
                onClick={surprise}
                disabled={loading}
              >
                <WandIcon />
                <span>یه ایده بده</span>
              </button>
            </div>

            <div className="im-field">
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => {
                  window.clearInterval(typerRef.current);
                  setPrompt(e.target.value);
                }}
                onKeyDown={onKeyDown}
                placeholder={`خب، چی تو ذهنت داری؟
بزن بریم بسازیمش...`}
                maxLength={MAX_PROMPT}
                disabled={loading}
              />

              <div className="im-field-foot">
                <div className="im-counter" aria-label="تعداد حروف">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="9.5" className="track" />
                    <circle
                      cx="12"
                      cy="12"
                      r="9.5"
                      className="bar"
                      style={{
                        strokeDasharray: 59.7,
                        strokeDashoffset: 59.7 * (1 - ring),
                      }}
                    />
                  </svg>

                  <span>{prompt.length}/{MAX_PROMPT}</span>
                </div>

                <button
                  type="button"
                  className="im-copy"
                  onClick={copyPrompt}
                  disabled={!hasPrompt}
                >
                  {copied ? <CheckIcon /> : <CopyIcon />}
                  <span>{copied ? "کپی شد" : "کپی ایده"}</span>
                </button>
              </div>
            </div>

            <div className="im-styles" role="group" aria-label="استایل">
              <span className="im-styles-label">استایل</span>

              <div className="im-styles-row">
                {STYLE_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`im-style${
                      styles.includes(option.id) ? " on" : ""
                    }`}
                    onClick={() => toggleStyle(option.id)}
                    disabled={loading}
                    aria-pressed={styles.includes(option.id)}
                  >
                    {option.fa}
                  </button>
                ))}
              </div>
            </div>

            <div className="im-cta-row">
              <div className="im-hint-keys" aria-hidden="true">
                <kbd>Ctrl</kbd>
                <kbd>Enter</kbd>
              </div>

              <div className="im-gen-wrap">
                <div
                  className={`im-gen-light${hasPrompt && !loading ? " active" : ""}`}
                  aria-hidden="true"
                />

                <button
                  type="button"
                  className="im-gen"
                  onClick={() => generateImage()}
                  disabled={!hasPrompt || loading}
                  aria-label="ساخت تصویر"
                >
                  {loading ? (
                    <>
                      <span className="im-spinner" />
                      <span>در حال ساخت…</span>
                    </>
                  ) : (
                    <>
                      <span className="im-gen-icon"><SparkIcon /></span>
                      <span>بساز</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="im-error" role="alert">
                <span>!</span>
                {error}
              </div>
            )}
          </section>

          {/* ============ STAGE ============ */}
          <section
            ref={stageRef}
            className="im-stage im-in"
            style={{ "--d": "0.32s" } as CSSProperties}
          >
            {showStage && (
              <GeneratingStage
                prompt={prompt}
                finishing={finishing}
                onDone={() => {
                  setStageOpen(false);

                  if (
                    typeof navigator !== "undefined" &&
                    typeof navigator.vibrate === "function"
                  ) {
                    navigator.vibrate(18);
                  }
                }}
                reduced={reduced}
              />
            )}

            {showEmpty && (
              <div className="im-empty">
                <div className="im-frame demo">
                  <DiffusionCanvas
                    seedText="mobixa"
                    mode="demo"
                    finishing={false}
                    onDone={() => undefined}
                    reduced={reduced}
                  />

                  <div className="im-corners" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                    <i />
                  </div>

                  <div className="im-empty-label">
                    <b>بوم خالیِ تو</b>
                    <span>اینجا تصویرت متولد می‌شه</span>
                  </div>
                </div>

                <div className="im-ideas">
                  <span className="im-ideas-title">ایده‌ی آماده</span>

                  <div className="im-ideas-row">
                    {IDEAS.slice(0, 6).map((idea) => (
                      <button
                        key={idea}
                        type="button"
                        className="im-idea"
                        onClick={() => typeIdea(idea)}
                        disabled={loading}
                      >
                        {idea}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {showResult && image && (
              <div className="im-result">
                <div
                  className="im-card reveal"
                  key={image}
                  ref={cardRef}
                  onPointerMove={tiltMove}
                  onPointerLeave={tiltLeave}
                >
                  <div className="im-card-inner">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image}
                      alt="تصویر ساخته شده توسط موبیکسا"
                      onClick={() => setZoom(true)}
                      onError={() =>
                        setError("نمایش تصویر انجام نشد. دوباره امتحان کن.")
                      }
                    />

                    <span className="im-gloss" aria-hidden="true" />
                    <span className="im-flash" aria-hidden="true" />

                    <button
                      type="button"
                      className="im-expand"
                      onClick={() => setZoom(true)}
                      aria-label="نمایش بزرگ"
                    >
                      <ExpandIcon />
                    </button>
                  </div>

                  <div className="im-burst" aria-hidden="true">
                    {Array.from({ length: 14 }, (_, index) => (
                      <i
                        key={index}
                        style={
                          {
                            "--ba": `${(index / 14) * 360}deg`,
                            "--bd": `${110 + seeded(index + 3) * 90}px`,
                            "--bs": `${0.6 + seeded(index + 9) * 0.9}`,
                          } as CSSProperties
                        }
                      />
                    ))}
                  </div>
                </div>

                <div className="im-actions">
                  <button
                    type="button"
                    className="im-action primary"
                    onClick={downloadImage}
                  >
                    <DownloadIcon />
                    <span>دانلود</span>
                  </button>

                  <button
                    type="button"
                    className="im-action"
                    onClick={retryImage}
                    disabled={loading}
                  >
                    <RetryIcon />
                    <span>تلاش مجدد</span>
                  </button>
                </div>
              </div>
            )}

            {history.length > 0 && !showStage && (
              <div className="im-gallery">
                <span className="im-ideas-title">ساخته‌های این نشست</span>

                <div className="im-gallery-row">
                  {history.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`im-thumb${
                        item.image === image ? " on" : ""
                      }`}
                      onClick={() => openHistory(item)}
                      aria-label={item.prompt}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image} alt="" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* ============ INSPIRATION MARQUEE ============ */}
        <section className="im-marquee-section im-in" style={{ "--d": "0.4s" } as CSSProperties}>
          <div className="im-marquee-head">
            <span className="im-ideas-title">الهام بگیر</span>
            <b>از هر کدوم شروع کن، بقیه‌اش با موبیکساست</b>
          </div>

          <div className="im-marquee">
            <div className="im-marquee-track">
              {[...IDEAS, ...IDEAS].map((idea, index) => (
                <button
                  key={`${idea}-${index}`}
                  type="button"
                  className="im-chip"
                  tabIndex={index >= IDEAS.length ? -1 : 0}
                  aria-hidden={index >= IDEAS.length}
                  disabled={loading}
                  onClick={() => {
                    typeIdea(idea);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  <span className="im-chip-dot" />
                  {idea}
                </button>
              ))}
            </div>
          </div>
        </section>

        <footer className="im-footer">
          <span className="im-footer-serif">Made with curiosity</span>
          <i />
          <span>MOBIXA IMAGE LAB</span>
        </footer>
      </div>

      {/* ============ LIGHTBOX ============ */}
      {zoom && image && (
        <div
          className="im-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="نمایش بزرگ تصویر"
          onClick={() => setZoom(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="تصویر بزرگ" />

          <button
            type="button"
            className="im-lightbox-close"
            onClick={() => setZoom(false)}
            aria-label="بستن"
          >
            <CloseIcon />
          </button>
        </div>
      )}

      <style jsx global>{`
        /* =====================================================
           ROOT
        ===================================================== */

        html:has(.im-root),
        body:has(.im-root) {
          background: #dcd6ff;
        }

        body:has(.im-root)::before,
        body:has(.im-root)::after {
          display: none;
        }

        .im-root {
          --ink: #1b1740;
          --muted: rgba(27, 23, 64, 0.64);
          --violet: #6d4cff;
          --blue: #3e7bff;
          --cyan: #1fc3f2;
          --pink: #ff5fae;

          position: relative;
          z-index: 0;
          isolation: isolate;
          min-height: 100vh;
          overflow-x: clip;
          color: var(--ink);
          font-family:
            "Vazirmatn",
            Tahoma,
            "Segoe UI",
            Arial,
            sans-serif;
          -webkit-font-smoothing: antialiased;
          background:
            radial-gradient(
              90% 40% at 50% 0%,
              rgba(255, 255, 255, 0.7),
              transparent 70%
            ),
            linear-gradient(
              180deg,
              #d9d3ff 0%,
              #cfe0ff 34%,
              #e3d9ff 66%,
              #f1dbf3 100%
            );
        }

        :where(.im-root h1, .im-root p) {
          margin: 0;
        }

        :where(.im-root a) {
          color: inherit;
          text-decoration: none;
        }

        :where(.im-root button) {
          font: inherit;
          color: inherit;
        }

        .im-root button {
          -webkit-tap-highlight-color: transparent;
        }

        .im-root a:focus-visible,
        .im-root button:focus-visible,
        .im-root textarea:focus-visible {
          outline: 2px solid rgba(109, 76, 255, 0.9);
          outline-offset: 3px;
        }

        /* =====================================================
           BACKGROUND
        ===================================================== */

        .im-bg {
          position: absolute;
          inset: 0;
          z-index: -1;
          overflow: hidden;
          pointer-events: none;
        }

        .im-aurora {
          position: absolute;
          top: -280px;
          left: 50%;
          width: 860px;
          height: 860px;
          margin-left: -430px;
          border-radius: 50%;
          background:
            conic-gradient(
              from 0deg,
              rgba(109, 76, 255, 0),
              rgba(109, 76, 255, 0.4),
              rgba(31, 195, 242, 0.34),
              rgba(255, 95, 174, 0.34),
              rgba(255, 180, 138, 0.28),
              rgba(109, 76, 255, 0)
            );
          filter: blur(64px);
          opacity: 0.85;
          animation: imSpin 50s linear infinite;
        }

        .im-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          will-change: transform;
        }

        .im-blob.b1 {
          top: 220px;
          left: -180px;
          width: 340px;
          height: 340px;
          background: rgba(139, 108, 255, 0.45);
          animation: imDriftA 20s ease-in-out infinite alternate;
        }

        .im-blob.b2 {
          top: 760px;
          right: -190px;
          width: 360px;
          height: 360px;
          background: rgba(31, 195, 242, 0.36);
          animation: imDriftB 24s ease-in-out infinite alternate;
        }

        .im-blob.b3 {
          top: 1300px;
          left: -170px;
          width: 340px;
          height: 340px;
          background: rgba(255, 111, 181, 0.34);
          animation: imDriftA 26s ease-in-out infinite alternate;
        }

        .im-grid {
          position: absolute;
          inset: 0 0 auto 0;
          height: 900px;
          background-image:
            radial-gradient(
              rgba(80, 60, 200, 0.22) 1px,
              transparent 1.4px
            );
          background-size: 24px 24px;
          -webkit-mask-image: linear-gradient(#000, transparent 85%);
          mask-image: linear-gradient(#000, transparent 85%);
        }

        .im-star {
          position: absolute;
          width: 14px;
          height: 14px;
          color: #fff;
          filter:
            drop-shadow(0 0 6px rgba(109, 76, 255, 0.9))
            drop-shadow(0 0 14px rgba(109, 76, 255, 0.5));
          animation: imTwinkle 4.2s ease-in-out infinite;
        }

        .im-star svg {
          width: 100%;
          height: 100%;
        }

        .im-star.s1 { top: 150px; left: 10%; }
        .im-star.s2 { top: 240px; right: 11%; width: 18px; height: 18px; animation-delay: 0.9s; }
        .im-star.s3 { top: 520px; left: 6%; width: 10px; height: 10px; animation-delay: 1.7s; }
        .im-star.s4 { top: 640px; right: 8%; width: 12px; height: 12px; animation-delay: 2.4s; }

        .im-grain {
          position: absolute;
          inset: 0;
          opacity: 0.07;
          mix-blend-mode: overlay;
          background-image:
            url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
        }

        /* =====================================================
           HEADER
        ===================================================== */

        .im-header {
          position: fixed;
          top: 12px;
          inset-inline: 12px;
          z-index: 70;
          max-width: 1120px;
          height: 60px;
          margin-inline: auto;
          padding: 0 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.62);
          border: 1px solid rgba(255, 255, 255, 0.95);
          box-shadow: 0 14px 40px rgba(70, 55, 190, 0.16);
          -webkit-backdrop-filter: blur(20px);
          backdrop-filter: blur(20px);
          animation: imDrop 0.8s cubic-bezier(.2,.8,.2,1) both;
        }

        .im-logo {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          direction: ltr;
        }

        .im-logo-word {
          font-family: "Sora", "Vazirmatn", sans-serif;
          font-size: 16px;
          font-weight: 800;
          letter-spacing: 0.2em;
        }

        .im-logo b {
          padding: 3px 7px 3px 9px;
          border-radius: 7px;
          font-family: "Sora", sans-serif;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.14em;
          color: #fff;
          background: linear-gradient(135deg, #7c5cff, #3e7bff);
          box-shadow: 0 6px 16px rgba(100, 80, 240, 0.4);
        }

        .im-back {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 16px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 700;
          background: rgba(255, 255, 255, 0.75);
          border: 1px solid rgba(255, 255, 255, 0.98);
          box-shadow: 0 8px 22px rgba(80, 60, 200, 0.14);
          transition:
            transform 0.25s cubic-bezier(.2,.8,.2,1),
            background 0.25s ease;
        }

        .im-back svg {
          width: 17px;
          height: 17px;
        }

        .im-back:hover {
          transform: translateY(-1px);
          background: #fff;
        }

        /* =====================================================
           LAYOUT / HERO
        ===================================================== */

        .im-wrap {
          position: relative;
          max-width: 1120px;
          margin: 0 auto;
          padding: 100px 16px 28px;
        }

        .im-in {
          animation: imRise 0.95s cubic-bezier(.2,.8,.2,1) var(--d, 0s) both;
        }

        .im-hero {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .im-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 8px 16px;
          border-radius: 999px;
          font-family: "Sora", sans-serif;
          font-size: 11.5px;
          font-weight: 800;
          letter-spacing: 0.22em;
          color: #4a36d6;
          direction: ltr;
          background: rgba(255, 255, 255, 0.66);
          border: 1px solid rgba(255, 255, 255, 0.95);
          box-shadow: 0 10px 28px rgba(100, 80, 230, 0.18);
          -webkit-backdrop-filter: blur(14px);
          backdrop-filter: blur(14px);
        }

        .im-eyebrow-star {
          width: 15px;
          height: 15px;
          color: var(--pink);
          animation: imSpin 9s linear infinite;
        }

        .im-eyebrow-star svg {
          width: 100%;
          height: 100%;
        }

        .im-title {
          margin-top: 18px;
          text-wrap: balance;
          font-size: clamp(29px, 7.4vw, 64px);
          line-height: 1.3;
          font-weight: 900;
          letter-spacing: -0.01em;
        }

        .im-title span {
          background: linear-gradient(
            90deg,
            #5b3df0,
            #2f7bff,
            #ff5fae,
            #5b3df0
          );
          background-size: 260% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: imGradText 7s linear infinite;
        }

        .im-sub {
          max-width: 520px;
          margin-top: 14px;
          font-size: clamp(14.5px, 2.4vw, 17px);
          line-height: 2;
          color: var(--muted);
        }

        .im-grid-layout {
          display: grid;
          gap: 22px;
          margin-top: 30px;
          align-items: start;
        }

        .im-grid-layout > * {
          min-width: 0;
        }

        /* =====================================================
           STUDIO
        ===================================================== */

        .im-studio {
          position: relative;
          padding: 20px;
          border-radius: 30px;
          background:
            linear-gradient(
              160deg,
              rgba(255, 255, 255, 0.88),
              rgba(255, 255, 255, 0.58)
            );
          border: 1px solid rgba(255, 255, 255, 0.98);
          box-shadow:
            0 26px 60px rgba(70, 55, 190, 0.16),
            inset 0 1px 0 #fff;
          -webkit-backdrop-filter: blur(18px);
          backdrop-filter: blur(18px);
          transition:
            border-color 0.3s ease,
            box-shadow 0.3s ease;
        }

        .im-studio:focus-within {
          border-color: rgba(124, 92, 255, 0.55);
          box-shadow:
            0 0 0 4px rgba(124, 92, 255, 0.14),
            0 30px 70px rgba(70, 55, 190, 0.22),
            inset 0 1px 0 #fff;
        }

        .im-studio-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 14px;
        }

        .im-studio-title {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          font-size: 15px;
          font-weight: 800;
        }

        .im-studio-title i {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: var(--violet);
          box-shadow: 0 0 12px var(--violet);
          animation: imPulseDot 1.8s ease-in-out infinite;
        }

        .im-surprise {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 14px;
          border: 0;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 800;
          color: #4a36d6;
          cursor: pointer;
          background: rgba(109, 76, 255, 0.12);
          transition:
            transform 0.25s cubic-bezier(.2,.9,.3,1.25),
            background 0.25s ease;
        }

        .im-surprise svg {
          width: 18px;
          height: 18px;
          transition: transform 0.5s cubic-bezier(.2,.9,.3,1.25);
        }

        .im-surprise:hover:not(:disabled) {
          transform: translateY(-2px);
          background: rgba(109, 76, 255, 0.2);
        }

        .im-surprise:hover:not(:disabled) svg {
          transform: rotate(-18deg) scale(1.12);
        }

        .im-surprise:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .im-field {
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.78);
          border: 1px solid rgba(109, 76, 255, 0.16);
          transition: border-color 0.25s ease;
        }

        .im-field:focus-within {
          border-color: rgba(124, 92, 255, 0.5);
        }

        .im-field textarea {
          display: block;
          width: 100%;
          min-height: 112px;
          max-height: 260px;
          padding: 16px 18px 6px;
          border: 0;
          outline: 0;
          resize: none;
          background: transparent;
          color: var(--ink);
          caret-color: #6a4df0;
          font: inherit;
          font-size: 16px;
          line-height: 1.95;
          text-align: start;
        }

        .im-field textarea::placeholder {
          color: rgba(27, 23, 64, 0.42);
        }

        .im-field textarea:disabled {
          opacity: 0.6;
        }

        .im-field-foot {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 4px 12px 10px 14px;
        }

        .im-counter {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          direction: ltr;
          font-size: 11.5px;
          font-weight: 700;
          color: rgba(27, 23, 64, 0.5);
        }

        .im-counter svg {
          width: 22px;
          height: 22px;
          transform: rotate(-90deg);
        }

        .im-counter circle {
          fill: none;
          stroke-width: 2.6;
        }

        .im-counter .track {
          stroke: rgba(27, 23, 64, 0.1);
        }

        .im-counter .bar {
          stroke: #6d4cff;
          stroke-linecap: round;
          transition: stroke-dashoffset 0.25s ease;
        }

        .im-copy {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 11px;
          border: 0;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 700;
          color: rgba(27, 23, 64, 0.55);
          background: transparent;
          cursor: pointer;
          transition:
            background 0.2s ease,
            color 0.2s ease;
        }

        .im-copy svg {
          width: 15px;
          height: 15px;
        }

        .im-copy:hover:not(:disabled) {
          color: #4a36d6;
          background: rgba(109, 76, 255, 0.1);
        }

        .im-copy:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        /* styles */

        .im-styles {
          margin-top: 16px;
        }

        .im-styles-label {
          display: block;
          margin-bottom: 9px;
          font-size: 12.5px;
          font-weight: 800;
          color: rgba(27, 23, 64, 0.55);
        }

        .im-styles-row {
          display: flex;
          gap: 8px;
          margin: 0 -20px;
          padding: 2px 20px 8px;
          overflow-x: auto;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
        }

        .im-styles-row::-webkit-scrollbar {
          display: none;
        }

        .im-style {
          flex: 0 0 auto;
          padding: 9px 16px;
          border: 1px solid rgba(255, 255, 255, 0.98);
          border-radius: 999px;
          font-size: 13.5px;
          font-weight: 700;
          cursor: pointer;
          background: rgba(255, 255, 255, 0.78);
          box-shadow: 0 6px 16px rgba(80, 60, 200, 0.1);
          transition:
            transform 0.25s cubic-bezier(.2,.9,.3,1.25),
            background 0.25s ease,
            color 0.25s ease,
            box-shadow 0.25s ease;
        }

        .im-style:hover:not(:disabled) {
          transform: translateY(-2px);
        }

        .im-style.on {
          color: #fff;
          background: linear-gradient(135deg, #7c5cff, #3e7bff);
          border-color: transparent;
          box-shadow: 0 10px 24px rgba(100, 80, 240, 0.4);
          transform: scale(1.04);
        }

        .im-style:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        /* generate */

        .im-cta-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: 16px;
        }

        .im-hint-keys {
          display: none;
          align-items: center;
          gap: 5px;
        }

        .im-hint-keys kbd {
          padding: 4px 9px;
          border-radius: 8px;
          font-family: "Sora", sans-serif;
          font-size: 11px;
          font-weight: 700;
          color: rgba(27, 23, 64, 0.55);
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(27, 23, 64, 0.12);
          border-bottom-width: 2px;
        }

        .im-gen-wrap {
          position: relative;
          flex: 1;
        }

        .im-gen-light {
          position: absolute;
          inset: 10px 8% -10px;
          border-radius: 999px;
          background: linear-gradient(90deg, #7c5cff, #3e7bff, #ff5fae);
          filter: blur(22px);
          opacity: 0;
          transition: opacity 0.4s ease;
          pointer-events: none;
        }

        .im-gen-light.active {
          opacity: 0.6;
          animation: imGlowPulse 2.6s ease-in-out infinite;
        }

        .im-gen {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 11px;
          width: 100%;
          height: 58px;
          padding: 0 28px;
          border: 1px solid rgba(255, 255, 255, 0.55);
          border-radius: 999px;
          overflow: hidden;
          font-size: 17px;
          font-weight: 900;
          color: #fff;
          cursor: pointer;
          background: linear-gradient(
            110deg,
            #6a4df0,
            #3e7bff 45%,
            #ff5fae 90%
          );
          background-size: 200% 100%;
          box-shadow:
            0 16px 36px rgba(100, 80, 240, 0.42),
            inset 0 1px 2px rgba(255, 255, 255, 0.5);
          transition:
            transform 0.3s cubic-bezier(.2,.9,.3,1.25),
            filter 0.3s ease,
            box-shadow 0.3s ease;
        }

        .im-gen::after {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          width: 40%;
          background: linear-gradient(
            100deg,
            transparent,
            rgba(255, 255, 255, 0.5),
            transparent
          );
          animation: imShine 3.4s ease-in-out infinite;
          pointer-events: none;
        }

        .im-gen:hover:not(:disabled) {
          transform: translateY(-2px) scale(1.015);
          background-position: 100% 0;
          filter: brightness(1.06);
        }

        .im-gen:active:not(:disabled) {
          transform: scale(0.97);
        }

        .im-gen:disabled {
          cursor: not-allowed;
          filter: grayscale(0.55);
          opacity: 0.55;
          box-shadow: none;
        }

        .im-gen:disabled::after {
          display: none;
        }

        .im-gen-icon {
          display: grid;
          place-items: center;
          width: 21px;
          height: 21px;
          transition: transform 0.6s cubic-bezier(.2,.9,.3,1.25);
        }

        .im-gen-icon svg {
          width: 100%;
          height: 100%;
        }

        .im-gen:hover:not(:disabled) .im-gen-icon {
          transform: rotate(180deg) scale(1.2);
        }

        .im-spinner {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2.5px solid rgba(255, 255, 255, 0.4);
          border-top-color: #fff;
          animation: imSpin 0.8s linear infinite;
        }

        .im-error {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-top: 14px;
          padding: 12px 14px;
          border-radius: 16px;
          font-size: 14px;
          line-height: 1.9;
          color: #a8202c;
          background: rgba(255, 235, 238, 0.88);
          border: 1px solid rgba(220, 70, 85, 0.3);
          animation: imRise 0.5s cubic-bezier(.2,.8,.2,1) both;
        }

        .im-error span {
          display: grid;
          place-items: center;
          flex: 0 0 22px;
          height: 22px;
          margin-top: 3px;
          border-radius: 50%;
          font-size: 13px;
          font-weight: 900;
          color: #fff;
          background: #e5484d;
        }

        /* =====================================================
           STAGE
        ===================================================== */

        .im-stage {
          scroll-margin-top: 84px;
          display: flex;
          flex-direction: column;
          gap: 22px;
        }

        .im-stage-card,
        .im-empty,
        .im-result {
          width: 100%;
          max-width: 560px;
          margin-inline: auto;
        }

        .im-frame {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          border-radius: 30px;
          overflow: hidden;
          background: #d9d0ff;
          border: 1px solid rgba(255, 255, 255, 0.98);
          box-shadow:
            0 30px 70px rgba(70, 55, 190, 0.28),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
        }

        .im-diffusion {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: block;
        }

        .im-corners i {
          position: absolute;
          width: 26px;
          height: 26px;
          border: 3px solid rgba(255, 255, 255, 0.95);
          filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.8));
          animation: imCorner 2.4s ease-in-out infinite;
        }

        .im-corners i:nth-child(1) { top: 16px; right: 16px; border-left: 0; border-bottom: 0; border-top-right-radius: 10px; }
        .im-corners i:nth-child(2) { top: 16px; left: 16px; border-right: 0; border-bottom: 0; border-top-left-radius: 10px; }
        .im-corners i:nth-child(3) { bottom: 16px; right: 16px; border-left: 0; border-top: 0; border-bottom-right-radius: 10px; }
        .im-corners i:nth-child(4) { bottom: 16px; left: 16px; border-right: 0; border-top: 0; border-bottom-left-radius: 10px; }

        .im-words {
          position: absolute;
          inset: 0;
          --R: min(36vw, 170px);
          pointer-events: none;
        }

        .im-words span {
          position: absolute;
          left: 50%;
          top: 50%;
          padding: 5px 12px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 800;
          white-space: nowrap;
          color: var(--ink);
          background: rgba(255, 255, 255, 0.86);
          box-shadow: 0 8px 20px rgba(80, 60, 200, 0.28);
          opacity: 0;
          animation: imWord 5.6s cubic-bezier(.5, 0, .3, 1) var(--wd) infinite;
        }

        .im-core {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          pointer-events: none;
        }

        .im-core i {
          width: 58px;
          height: 58px;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.95);
          box-shadow:
            0 0 30px rgba(255, 255, 255, 0.8),
            inset 0 0 20px rgba(255, 255, 255, 0.6);
          animation: imCore 2.2s ease-out infinite;
        }

        .im-stage-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          margin-top: 20px;
          text-align: center;
        }

        .im-stage-label {
          font-size: 19px;
          font-weight: 900;
          background: linear-gradient(90deg, #5b3df0, #2f7bff, #ff5fae);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: imFlip 0.55s cubic-bezier(.2,.8,.2,1) both;
        }

        .im-stage-dots {
          display: flex;
          gap: 7px;
        }

        .im-stage-dots i {
          width: 26px;
          height: 6px;
          border-radius: 999px;
          background: rgba(27, 23, 64, 0.14);
          transition:
            background 0.5s ease,
            box-shadow 0.5s ease;
        }

        .im-stage-dots i.on {
          background: linear-gradient(90deg, #7c5cff, #ff5fae);
          box-shadow: 0 0 12px rgba(124, 92, 255, 0.55);
        }

        .im-stage-sub {
          font-size: 14px;
          line-height: 1.9;
          color: var(--muted);
        }

        /* empty */

        .im-empty {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .im-empty-label {
          position: absolute;
          left: 50%;
          bottom: 22px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          min-width: 70%;
          padding: 12px 18px;
          border-radius: 20px;
          text-align: center;
          transform: translateX(-50%);
          background: rgba(255, 255, 255, 0.72);
          border: 1px solid rgba(255, 255, 255, 0.98);
          box-shadow: 0 14px 34px rgba(70, 55, 190, 0.2);
          -webkit-backdrop-filter: blur(14px);
          backdrop-filter: blur(14px);
        }

        .im-empty-label b {
          font-size: 16px;
          font-weight: 900;
        }

        .im-empty-label span {
          font-size: 13px;
          color: var(--muted);
        }

        .im-ideas-title {
          display: block;
          margin-bottom: 10px;
          font-size: 12.5px;
          font-weight: 800;
          color: rgba(27, 23, 64, 0.55);
        }

        .im-ideas-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .im-idea {
          max-width: 100%;
          padding: 10px 15px;
          border: 1px solid rgba(255, 255, 255, 0.98);
          border-radius: 16px;
          font-size: 13.5px;
          line-height: 1.8;
          text-align: start;
          cursor: pointer;
          background: rgba(255, 255, 255, 0.74);
          box-shadow: 0 8px 20px rgba(80, 60, 200, 0.1);
          transition:
            transform 0.25s cubic-bezier(.2,.9,.3,1.25),
            border-color 0.25s ease,
            box-shadow 0.25s ease;
        }

        .im-idea:hover:not(:disabled) {
          transform: translateY(-3px);
          border-color: rgba(124, 92, 255, 0.55);
          box-shadow: 0 14px 30px rgba(80, 60, 200, 0.2);
        }

        /* result */

        .im-result {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .im-card {
          --rx: 0deg;
          --ry: 0deg;
          --gx: 50%;
          --gy: 30%;
          position: relative;
          transform: perspective(1000px) rotateY(var(--rx)) rotateX(var(--ry));
          transition: transform 0.35s cubic-bezier(.2,.8,.2,1);
        }

        .im-card-inner {
          position: relative;
          border-radius: 30px;
          overflow: hidden;
          background: #d9d0ff;
          border: 1px solid rgba(255, 255, 255, 0.98);
          box-shadow:
            0 34px 80px rgba(70, 55, 190, 0.32),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
        }

        .im-card-inner img {
          display: block;
          width: 100%;
          height: auto;
          max-height: 82vh;
          object-fit: contain;
          cursor: zoom-in;
        }

        .im-gloss {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0;
          background: radial-gradient(
            420px circle at var(--gx) var(--gy),
            rgba(255, 255, 255, 0.34),
            transparent 60%
          );
          transition: opacity 0.3s ease;
        }

        .im-card:hover .im-gloss {
          opacity: 1;
        }

        .im-flash {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0;
          background: radial-gradient(
            circle at 50% 50%,
            #fff,
            rgba(255, 255, 255, 0.4) 50%,
            transparent 80%
          );
        }

        .im-expand {
          position: absolute;
          top: 14px;
          left: 14px;
          display: grid;
          place-items: center;
          width: 40px;
          height: 40px;
          border: 1px solid rgba(255, 255, 255, 0.95);
          border-radius: 14px;
          color: var(--ink);
          cursor: pointer;
          background: rgba(255, 255, 255, 0.78);
          box-shadow: 0 10px 24px rgba(40, 30, 120, 0.25);
          -webkit-backdrop-filter: blur(12px);
          backdrop-filter: blur(12px);
          transition: transform 0.25s cubic-bezier(.2,.9,.3,1.25);
        }

        .im-expand svg {
          width: 20px;
          height: 20px;
        }

        .im-expand:hover {
          transform: scale(1.1);
        }

        .im-card.reveal .im-card-inner img {
          animation: imDevelop 1.4s cubic-bezier(.2,.8,.2,1) both;
        }

        .im-card.reveal .im-flash {
          animation: imFlash 1.2s ease-out both;
        }

        .im-burst {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .im-burst i {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 9px;
          height: 9px;
          margin: -4.5px;
          border-radius: 50%;
          opacity: 0;
          background: linear-gradient(135deg, #fff, #ffc8ec);
          box-shadow:
            0 0 12px rgba(255, 255, 255, 0.95),
            0 0 24px rgba(160, 120, 255, 0.7);
        }

        .im-card.reveal .im-burst i {
          animation: imBurst 1.3s cubic-bezier(.2,.8,.3,1) 0.15s both;
        }

        .im-actions {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 10px;
          animation: imRise 0.8s cubic-bezier(.2,.8,.2,1) 0.5s both;
        }

        .im-action {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 13px 24px;
          border: 1px solid rgba(255, 255, 255, 0.98);
          border-radius: 999px;
          font-size: 15px;
          font-weight: 800;
          cursor: pointer;
          background: rgba(255, 255, 255, 0.8);
          box-shadow: 0 10px 26px rgba(80, 60, 200, 0.14);
          transition:
            transform 0.28s cubic-bezier(.2,.9,.3,1.25),
            box-shadow 0.28s ease;
        }

        .im-action svg {
          width: 19px;
          height: 19px;
        }

        .im-action:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 16px 34px rgba(80, 60, 200, 0.24);
        }

        .im-action:active:not(:disabled) {
          transform: scale(0.96);
        }

        .im-action:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .im-action.primary {
          color: #fff;
          border-color: rgba(255, 255, 255, 0.5);
          background: linear-gradient(135deg, #6a4df0, #3e7bff);
          box-shadow: 0 16px 34px rgba(100, 80, 240, 0.42);
        }

        /* gallery */

        .im-gallery {
          width: 100%;
          max-width: 560px;
          margin-inline: auto;
        }

        .im-gallery-row {
          display: flex;
          gap: 10px;
          padding: 4px 4px 10px;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .im-gallery-row::-webkit-scrollbar {
          display: none;
        }

        .im-thumb {
          flex: 0 0 auto;
          width: 66px;
          height: 66px;
          padding: 0;
          border: 2px solid rgba(255, 255, 255, 0.95);
          border-radius: 18px;
          overflow: hidden;
          cursor: pointer;
          background: #d9d0ff;
          box-shadow: 0 10px 22px rgba(80, 60, 200, 0.18);
          transition:
            transform 0.28s cubic-bezier(.2,.9,.3,1.25),
            border-color 0.25s ease,
            box-shadow 0.25s ease;
        }

        .im-thumb img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .im-thumb:hover {
          transform: translateY(-3px);
        }

        .im-thumb.on {
          border-color: #7c5cff;
          box-shadow:
            0 0 0 3px rgba(124, 92, 255, 0.28),
            0 12px 26px rgba(100, 80, 240, 0.4);
          transform: scale(1.06);
        }

        /* footer */

        .im-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-top: 44px;
          direction: ltr;
          font-family: "Sora", sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.2em;
          color: rgba(27, 23, 64, 0.48);
        }

        .im-footer-serif {
          font-family: "Instrument Serif", Georgia, serif;
          font-style: italic;
          font-size: 19px;
          letter-spacing: 0;
          color: rgba(27, 23, 64, 0.62);
        }

        .im-footer i {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: var(--violet);
        }

        /* lightbox */

        .im-lightbox {
          position: fixed;
          inset: 0;
          z-index: 400;
          display: grid;
          place-items: center;
          padding: 20px;
          cursor: zoom-out;
          background: rgba(20, 14, 60, 0.8);
          -webkit-backdrop-filter: blur(14px);
          backdrop-filter: blur(14px);
          animation: imFade 0.3s ease both;
        }

        .im-lightbox img {
          max-width: min(94vw, 1100px);
          max-height: 88vh;
          border-radius: 22px;
          box-shadow: 0 40px 100px rgba(0, 0, 0, 0.5);
          animation: imZoomIn 0.45s cubic-bezier(.2,.9,.3,1.1) both;
        }

        .im-lightbox-close {
          position: absolute;
          top: calc(18px + env(safe-area-inset-top));
          left: 18px;
          display: grid;
          place-items: center;
          width: 46px;
          height: 46px;
          border: 1px solid rgba(255, 255, 255, 0.5);
          border-radius: 50%;
          color: #fff;
          cursor: pointer;
          background: rgba(255, 255, 255, 0.18);
        }

        .im-lightbox-close svg {
          width: 22px;
          height: 22px;
        }

        /* =====================================================
           KEYFRAMES
        ===================================================== */

        @keyframes imRise {
          from {
            opacity: 0;
            transform: translateY(26px);
            filter: blur(8px);
          }

          to {
            opacity: 1;
            transform: none;
            filter: blur(0);
          }
        }

        @keyframes imDrop {
          from {
            opacity: 0;
            transform: translateY(-24px);
          }

          to {
            opacity: 1;
            transform: none;
          }
        }

        @keyframes imSpin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes imGradText {
          from {
            background-position: 0% 50%;
          }

          to {
            background-position: 220% 50%;
          }
        }

        @keyframes imDriftA {
          from {
            transform: translate(0, 0);
          }

          to {
            transform: translate(50px, 40px);
          }
        }

        @keyframes imDriftB {
          from {
            transform: translate(0, 0);
          }

          to {
            transform: translate(-50px, -40px);
          }
        }

        @keyframes imTwinkle {
          0%,
          100% {
            opacity: 0.25;
            transform: scale(0.8);
          }

          50% {
            opacity: 1;
            transform: scale(1.15);
          }
        }

        @keyframes imPulseDot {
          0%,
          100% {
            transform: scale(1);
            opacity: 1;
          }

          50% {
            transform: scale(1.5);
            opacity: 0.5;
          }
        }

        @keyframes imGlowPulse {
          0%,
          100% {
            opacity: 0.45;
            transform: scale(0.96);
          }

          50% {
            opacity: 0.75;
            transform: scale(1.04);
          }
        }

        @keyframes imShine {
          0% {
            inset-inline-start: -50%;
          }

          60%,
          100% {
            inset-inline-start: 130%;
          }
        }

        @keyframes imCorner {
          0%,
          100% {
            opacity: 0.55;
            transform: scale(1);
          }

          50% {
            opacity: 1;
            transform: scale(1.12);
          }
        }

        @keyframes imCore {
          0% {
            opacity: 0.9;
            transform: scale(0.45);
          }

          100% {
            opacity: 0;
            transform: scale(2.6);
          }
        }

        @keyframes imWord {
          0% {
            opacity: 0;
            transform:
              translate(-50%, -50%)
              translate(
                calc(var(--R) * var(--cx)),
                calc(var(--R) * var(--cy))
              )
              scale(1);
          }

          12% {
            opacity: 1;
          }

          70% {
            opacity: 0.95;
          }

          100% {
            opacity: 0;
            filter: blur(5px);
            transform:
              translate(-50%, -50%)
              translate(0px, 0px)
              scale(0.15);
          }
        }

        @keyframes imFlip {
          from {
            opacity: 0;
            transform: translateY(12px);
          }

          to {
            opacity: 1;
            transform: none;
          }
        }

        @keyframes imDevelop {
          0% {
            -webkit-clip-path: circle(0% at 50% 50%);
            clip-path: circle(0% at 50% 50%);
            filter: blur(24px) saturate(1.7) brightness(1.3);
            transform: scale(1.08);
          }

          55% {
            filter: blur(7px) saturate(1.25) brightness(1.1);
          }

          100% {
            -webkit-clip-path: circle(150% at 50% 50%);
            clip-path: circle(150% at 50% 50%);
            filter: none;
            transform: none;
          }
        }

        @keyframes imFlash {
          0% {
            opacity: 0.95;
          }

          100% {
            opacity: 0;
          }
        }

        @keyframes imBurst {
          0% {
            opacity: 0;
            transform: rotate(var(--ba)) translateX(0) scale(0.2);
          }

          18% {
            opacity: 1;
          }

          100% {
            opacity: 0;
            transform:
              rotate(var(--ba))
              translateX(var(--bd))
              scale(var(--bs));
          }
        }

        @keyframes imFade {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        @keyframes imZoomIn {
          from {
            opacity: 0;
            transform: scale(0.88);
          }

          to {
            opacity: 1;
            transform: none;
          }
        }

        /* =====================================================
           RESPONSIVE
        ===================================================== */

        @media (min-width: 960px) {
          .im-wrap {
            padding-top: 112px;
          }

          .im-grid-layout {
            grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr);
            gap: 30px;
          }

          .im-studio {
            padding: 26px;
          }

          .im-styles-row {
            margin: 0 -26px;
            padding-inline: 26px;
          }

          .im-hint-keys {
            display: inline-flex;
          }

          .im-gen-wrap {
            flex: 0 1 270px;
          }

          .im-stage {
            position: sticky;
            top: 92px;
          }
        }

        @media (max-width: 520px) {
          .im-wrap {
            padding-inline: 14px;
          }

          .im-studio {
            padding: 16px;
          }

          .im-styles-row {
            margin: 0 -16px;
            padding-inline: 16px;
          }

          .im-gen {
            height: 56px;
            font-size: 16px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .im-root *,
          .im-root *::before,
          .im-root *::after {
            animation: none !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* =====================================================
           IDEAS PANEL + INSPIRATION MARQUEE
        ===================================================== */

        .im-ideas {
          padding: 14px;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.58);
          border: 1px solid rgba(255, 255, 255, 0.96);
          box-shadow: 0 14px 40px rgba(70, 55, 190, 0.12);
        }

        .im-marquee-section {
          margin: 40px -16px 0;
        }

        .im-marquee-head {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          margin-bottom: 14px;
          text-align: center;
        }

        .im-marquee-head .im-ideas-title {
          margin-bottom: 0;
          color: #5a3fe6;
          letter-spacing: 0.2em;
        }

        .im-marquee-head b {
          font-size: clamp(18px, 4vw, 24px);
          font-weight: 900;
        }

        .im-marquee {
          direction: ltr;
          overflow: hidden;
          padding: 6px 0;
          -webkit-mask-image:
            linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
          mask-image:
            linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
        }

        .im-marquee-track {
          display: flex;
          gap: 12px;
          width: max-content;
          padding-inline-end: 12px;
          animation: imMarquee 70s linear infinite;
        }

        .im-marquee:hover .im-marquee-track {
          animation-play-state: paused;
        }

        .im-chip {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          direction: rtl;
          padding: 13px 22px;
          border: 1px solid rgba(255, 255, 255, 0.98);
          border-radius: 999px;
          font-family: inherit;
          font-size: 14.5px;
          font-weight: 600;
          white-space: nowrap;
          color: #1b1740;
          cursor: pointer;
          background: rgba(255, 255, 255, 0.74);
          box-shadow: 0 10px 26px rgba(80, 60, 200, 0.1);
          transition:
            transform 0.25s cubic-bezier(.2,.9,.3,1.25),
            box-shadow 0.25s ease;
        }

        .im-chip:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 16px 34px rgba(80, 60, 200, 0.2);
        }

        .im-chip:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .im-chip-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: linear-gradient(135deg, #7c5cff, #ff5fae);
        }

        @keyframes imMarquee {
          to {
            transform: translateX(-50%);
          }
        }

        @keyframes imPop {
          from {
            opacity: 0;
            transform: scale(0.94);
          }

          to {
            opacity: 1;
            transform: none;
          }
        }

      `}</style>
    </main>
  );
}
