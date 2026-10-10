"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";

/*
============================================================
MOBIXA — IMAGE LAB (صفحه‌ی ساخت تصویر)
============================================================

مسیر فایل در گیت‌هاب:
app/image/page.tsx

فقط ظاهر و تجربه‌ی کاربری عوض شده.
اتصال به API دقیقاً مثل قبل است:

POST /api/image
body: { prompt }
جواب: { success, image, error }
*/

type HistoryItem = {
  id: number;
  url: string;
  prompt: string;
  style: string;
};

type StyleOption = {
  id: string;
  label: string;
  icon: string;
  phrase: string;
};

type IdeaOption = {
  icon: string;
  title: string;
  prompt: string;
  from: string;
  to: string;
};

/* =========================================================
   DATA
========================================================= */

const MAX_LEN = 2048;

const STYLES: StyleOption[] = [
  { id: "none", label: "بدون سبک", icon: "✦", phrase: "" },
  {
    id: "cinematic",
    label: "سینمایی",
    icon: "🎬",
    phrase:
      "cinematic film still, dramatic lighting, shallow depth of field, ultra detailed",
  },
  {
    id: "anime",
    label: "انیمه",
    icon: "🌸",
    phrase:
      "anime style, vibrant colors, clean line art, studio quality illustration",
  },
  {
    id: "3d",
    label: "سه‌بعدی",
    icon: "🧊",
    phrase:
      "3D render, soft studio lighting, smooth materials, highly detailed",
  },
  {
    id: "fantasy",
    label: "فانتزی",
    icon: "🐉",
    phrase:
      "epic fantasy art, magical atmosphere, intricate details, painterly",
  },
  {
    id: "photo",
    label: "واقع‌گرایانه",
    icon: "📷",
    phrase:
      "photorealistic, DSLR photo, natural lighting, sharp focus, 85mm lens",
  },
  {
    id: "watercolor",
    label: "آبرنگ",
    icon: "🎨",
    phrase:
      "watercolor painting, soft washes, delicate textures, paper grain",
  },
  {
    id: "cyberpunk",
    label: "سایبرپانک",
    icon: "🌃",
    phrase:
      "cyberpunk, neon lights, rainy night city, futuristic, high contrast",
  },
  {
    id: "minimal",
    label: "مینیمال",
    icon: "◻️",
    phrase:
      "minimalist design, clean composition, soft pastel colors, lots of negative space",
  },
  {
    id: "oil",
    label: "رنگ روغن",
    icon: "🖼️",
    phrase:
      "oil painting, rich brush strokes, classical composition, museum quality",
  },
];

const BOOSTERS = [
  "نور سینمایی",
  "جزئیات بالا",
  "رنگ‌های زنده",
  "پس‌زمینه‌ی تار",
  "کیفیت ۴K",
  "نور طلایی غروب",
  "زاویه‌ی از پایین",
  "فضای رویایی",
];

const IDEAS: IdeaOption[] = [
  {
    icon: "🌆",
    title: "شهر آینده‌نگر",
    prompt:
      "یک شهر آینده‌نگر شبانه با برج‌های شیشه‌ای و ماشین‌های پرنده، نورهای نئون بنفش و آبی، بارون ملایم",
    from: "#7852f5",
    to: "#28b0ff",
  },
  {
    icon: "🐉",
    title: "اژدهای فانتزی",
    prompt:
      "یک اژدهای باشکوه روی قله‌ی کوه‌های برفی هنگام غروب، بال‌های درخشان و نور طلایی",
    from: "#ff7a59",
    to: "#c25bff",
  },
  {
    icon: "🕌",
    title: "معماری ایرانی",
    prompt:
      "گنبد و ایوان یک مسجد ایرانی با کاشی‌کاری فیروزه‌ای، نور صبح‌گاهی، عکاسی معماری",
    from: "#18c3b5",
    to: "#4a7bff",
  },
  {
    icon: "🐱",
    title: "گربه‌ی فضانورد",
    prompt:
      "یک گربه‌ی کوچولوی بامزه با لباس فضانوردی که کنار ایستگاه فضایی شناوره و زمین پشت سرشه",
    from: "#ff78c4",
    to: "#7852f5",
  },
  {
    icon: "🌲",
    title: "جنگل جادویی",
    prompt:
      "جنگلی جادویی با درخت‌های غول‌پیکر، کرم‌های شب‌تاب و مه‌ی آبی، حال‌وهوای رویایی",
    from: "#2bd49a",
    to: "#2a7bff",
  },
  {
    icon: "☕",
    title: "کافه‌ی دنج",
    prompt:
      "یک کافه‌ی دنج در یک روز بارونی با پنجره‌ی بخارگرفته، فنجان قهوه‌ی داغ و نور گرم",
    from: "#ffb067",
    to: "#ff6f91",
  },
  {
    icon: "🤖",
    title: "ربات مهربون",
    prompt:
      "یک ربات کوچک و مهربان که توی یک گلخانه‌ی آینده‌نگر داره گلدون آبیاری می‌کنه",
    from: "#5ea8ff",
    to: "#b06bff",
  },
  {
    icon: "🏔️",
    title: "قله‌ی رویایی",
    prompt:
      "طلوع خورشید بالای دریای ابر در کوهستان، رنگ‌های صورتی و نارنجی، منظره‌ی پانوراما",
    from: "#ff8fb1",
    to: "#ffbe5c",
  },
];

const PLACEHOLDER_HINTS = [
  "یه گربه‌ی فضانورد کنار ایستگاه فضایی...",
  "شهری در آینده با ماشین‌های پرنده...",
  "جنگلی جادویی با کرم‌های شب‌تاب...",
  "یه کافه‌ی دنج توی یه روز بارونی...",
  "اژدهایی روی قله‌ی کوه‌های برفی...",
];

const STAGES = [
  "دارم ایده‌ات رو درک می‌کنم",
  "رنگ‌ها رو انتخاب می‌کنم",
  "نور و سایه رو می‌چینم",
  "جزئیات رو اضافه می‌کنم",
  "دارم لمس نهایی رو می‌زنم",
];

const SPARKS = Array.from({ length: 14 }, (_, i) => ({
  angle: (i / 14) * 360 + (i % 2) * 12,
  dist: 90 + ((i * 29) % 70),
  size: 6 + ((i * 7) % 7),
  delay: (i % 5) * 0.03,
}));

function toFaDigits(value: string | number) {
  const digits = "۰۱۲۳۴۵۶۷۸۹";

  return String(value).replace(/\d/g, (d) => digits[Number(d)]);
}

/*
  سبک انتخاب‌شده به انتهای ایده‌ی کاربر اضافه می‌شود
  (فرمت درخواست به API همان قبلی است: فقط prompt)
*/
function buildFinalPrompt(text: string, styleId: string): string {
  const style = STYLES.find((item) => item.id === styleId);

  if (!style || !style.phrase) {
    return text.slice(0, MAX_LEN);
  }

  const suffix = `. Style: ${style.phrase}`;

  return `${text.slice(0, MAX_LEN - suffix.length)}${suffix}`;
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

function IconSpark() {
  return (
    <svg {...svgProps}>
      <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" />
      <path d="M19 16l.7 1.8L21.5 18.5l-1.8.7L19 21l-.7-1.8-1.8-.7 1.8-.7L19 16z" />
    </svg>
  );
}

function IconDice() {
  return (
    <svg {...svgProps}>
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <circle cx="9" cy="9" r="1" fill="currentColor" />
      <circle cx="15" cy="15" r="1" fill="currentColor" />
      <circle cx="15" cy="9" r="1" fill="currentColor" />
      <circle cx="9" cy="15" r="1" fill="currentColor" />
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

function IconRetry() {
  return (
    <svg {...svgProps}>
      <path d="M20 11a8 8 0 0 0-14.9-3" />
      <path d="M4 4v4h4" />
      <path d="M4 13a8 8 0 0 0 14.9 3" />
      <path d="M20 20v-4h-4" />
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

function IconExpand() {
  return (
    <svg {...svgProps}>
      <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg {...svgProps}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

function IconClear() {
  return (
    <svg {...svgProps}>
      <path d="M5 7h14M10 11v6M14 11v6M8 7l1-3h6l1 3M7 7l1 13h8l1-13" />
    </svg>
  );
}

function IconGrid() {
  return (
    <svg {...svgProps}>
      <rect x="4" y="4" width="6.5" height="6.5" rx="2" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="2" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="2" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="2" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg {...svgProps}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function ImagePage() {
  const router = useRouter();

  /* ---------- state اصلی (مثل قبل) ---------- */

  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ---------- state ظاهر ---------- */

  const [styleId, setStyleId] = useState("none");
  const [used, setUsed] = useState<{ prompt: string; style: string }>({
    prompt: "",
    style: "none",
  });
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [burstKey, setBurstKey] = useState(0);
  const [viewer, setViewer] = useState(false);
  const [toast, setToast] = useState("");
  const [hintIndex, setHintIndex] = useState(0);
  const [focused, setFocused] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const promptRef = useRef<HTMLElement | null>(null);
  const resultRef = useRef<HTMLElement | null>(null);
  const historyRef = useRef<HTMLElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const controllerRef = useRef<AbortController | null>(null);
  const typeTimer = useRef<number | null>(null);
  const toastTimer = useRef<number | null>(null);
  const idCounter = useRef(0);
  const scrolledFor = useRef<string | null>(null);

  /* =========================================================
     SIDE EFFECTS
  ========================================================= */

  /* فونت وزیرمتن (خوانا و مدرن برای فارسی) */

  useEffect(() => {
    const id = "mx-vazirmatn-font";

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

  /* جمله‌های متحرک داخل کادر ایده */

  useEffect(() => {
    const id = window.setInterval(() => {
      setHintIndex((i) => (i + 1) % PLACEHOLDER_HINTS.length);
    }, 3600);

    return () => {
      window.clearInterval(id);
    };
  }, []);

  /* بزرگ شدن خودکار کادر نوشتن */

  useEffect(() => {
    const el = textareaRef.current;

    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 280)}px`;
    }
  }, [prompt]);

  /* زمان‌سنج مرحله‌ی ساخت */

  useEffect(() => {
    if (!loading) {
      setElapsed(0);
      return;
    }

    const started = performance.now();

    const id = window.setInterval(() => {
      setElapsed((performance.now() - started) / 1000);
    }, 200);

    return () => {
      window.clearInterval(id);
    };
  }, [loading]);

  /* وقتی تصویر آماده شد، نرم به سمتش برو */

  useEffect(() => {
    if (!image || loading) {
      return;
    }

    if (scrolledFor.current === image) {
      return;
    }

    scrolledFor.current = image;

    const id = window.setTimeout(() => {
      resultRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 120);

    return () => {
      window.clearTimeout(id);
    };
  }, [image, loading]);

  /* اگر عکس از کش لود شده بود */

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      setImgLoaded(true);
    }
  }, [image, loading]);

  /* بستن نمای تمام‌صفحه با Escape */

  useEffect(() => {
    if (!viewer) {
      return;
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setViewer(false);
      }
    };

    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [viewer]);

  /* پاک‌سازی */

  useEffect(() => {
    return () => {
      if (typeTimer.current) {
        window.clearInterval(typeTimer.current);
      }

      if (toastTimer.current) {
        window.clearTimeout(toastTimer.current);
      }

      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, []);

  /* =========================================================
     ACTIONS
  ========================================================= */

  function showToast(message: string) {
    setToast(message);

    if (toastTimer.current) {
      window.clearTimeout(toastTimer.current);
    }

    toastTimer.current = window.setTimeout(() => {
      setToast("");
    }, 2200);
  }

  /* ---------- ساخت تصویر (همان منطق قبلی) ---------- */

  const generateImage = async (retryPrompt?: string) => {
    const finalPrompt = (retryPrompt ?? prompt).trim();

    if (!finalPrompt || loading) return;

    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: buildFinalPrompt(finalPrompt, styleId),
        }),
        signal: controller.signal,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "ساخت تصویر با خطا مواجه شد."
        );
      }

      setImage(data.image);
      setImgLoaded(false);
      setUsed({ prompt: finalPrompt, style: styleId });

      idCounter.current += 1;

      setHistory((old) =>
        [
          {
            id: idCounter.current,
            url: data.image as string,
            prompt: finalPrompt,
            style: styleId,
          },
          ...old,
        ].slice(0, 16)
      );
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }

      setError(
        (err instanceof Error && err.message) ||
          "یه مشکلی پیش اومد، دوباره امتحان کن."
      );
    } finally {
      if (controllerRef.current === controller) {
        controllerRef.current = null;
      }

      setLoading(false);
    }
  };

  const cancelGeneration = () => {
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
  };

  /* ---------- دانلود (همان منطق قبلی) ---------- */

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

      showToast("تصویر دانلود شد ✓");
    } catch (err) {
      console.error("DOWNLOAD_ERROR", err);

      setError("دانلود تصویر انجام نشد. دوباره امتحان کن.");
    }
  };

  const retryImage = () => {
    if (!prompt.trim() || loading) return;

    generateImage(prompt);
  };

  /* ---------- بقیه‌ی کارها ---------- */

  function goBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }

  function fillPrompt(text: string) {
    if (loading) {
      return;
    }

    if (typeTimer.current) {
      window.clearInterval(typeTimer.current);
    }

    setPrompt("");

    let index = 0;

    typeTimer.current = window.setInterval(() => {
      index += 2;
      setPrompt(text.slice(0, index));

      if (index >= text.length && typeTimer.current) {
        window.clearInterval(typeTimer.current);
        typeTimer.current = null;
      }
    }, 16);

    promptRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }

  function randomIdea() {
    const pick = IDEAS[Math.floor(Math.random() * IDEAS.length)];

    fillPrompt(pick.prompt);
  }

  function clearPrompt() {
    if (typeTimer.current) {
      window.clearInterval(typeTimer.current);
      typeTimer.current = null;
    }

    setPrompt("");
    textareaRef.current?.focus({ preventScroll: true });
  }

  function toggleBooster(text: string) {
    setPrompt((old) => {
      const current = old.trim();
      const index = current.indexOf(text);

      if (index >= 0) {
        const before = current.slice(0, index).replace(/[،,\s]+$/, "");
        const after = current
          .slice(index + text.length)
          .replace(/^[،,\s]+/, "");

        return before && after ? `${before}، ${after}` : before || after;
      }

      const next = current ? `${current}، ${text}` : text;

      return next.length > MAX_LEN ? old : next;
    });
  }

  async function copyPrompt() {
    const text = used.prompt || prompt;

    try {
      await navigator.clipboard.writeText(text);
      showToast("ایده کپی شد ✓");
    } catch {
      showToast("کپی نشد");
    }
  }

  function newIdea() {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });

    window.setTimeout(() => {
      setPrompt("");
      setStyleId("none");
      textareaRef.current?.focus({ preventScroll: true });
    }, 250);
  }

  function openFromHistory(item: HistoryItem) {
    if (loading) {
      return;
    }

    scrolledFor.current = null;

    setImage(item.url);
    setImgLoaded(false);
    setUsed({ prompt: item.prompt, style: item.style });
    setPrompt(item.prompt);
    setStyleId(item.style);
    setError("");
  }

  function scrollToHistory() {
    historyRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  /* =========================================================
     DERIVED
  ========================================================= */

  const ready = prompt.trim().length > 0 && !loading;

  const ratio = Math.min(1, prompt.length / MAX_LEN);
  const RING = 2 * Math.PI * 10;

  const stageIndex = Math.min(
    STAGES.length - 1,
    Math.floor(elapsed / 4.5)
  );

  const progress = Math.min(94, 100 * (1 - Math.exp(-elapsed / 13)));

  const usedStyle = STYLES.find((item) => item.id === used.style);

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="mx-root">
      {/* ---------------- BACKGROUND ---------------- */}

      <div className="mx-bg" aria-hidden="true">
        <span className="mx-blob mx-b1" />
        <span className="mx-blob mx-b2" />
        <span className="mx-blob mx-b3" />

        <i className="mx-spark s1">✦</i>
        <i className="mx-spark s2">✦</i>
        <i className="mx-spark s3">✦</i>
        <i className="mx-spark s4">✦</i>
        <i className="mx-spark s5">✦</i>
        <i className="mx-spark s6">✦</i>
      </div>

      <div className="mx-scroll" ref={scrollRef}>
        {/* ---------------- TOP BAR ---------------- */}

        <header className="mx-top">
          <button
            type="button"
            className="mx-pill mx-back"
            onClick={goBack}
            aria-label="بازگشت"
          >
            <IconBack />
            <span>بازگشت</span>
          </button>

          <div className="mx-brand" dir="ltr">
            <i className="mx-logo">
              <IconSpark />
            </i>
            <b>MOBIXA</b>
          </div>

          <button
            type="button"
            className="mx-pill mx-hist-btn"
            onClick={scrollToHistory}
            aria-label="ساخته‌های من"
          >
            <IconGrid />
            <span>{toFaDigits(history.length)}</span>
          </button>
        </header>

        <main className="mx-wrap">
          {/* ---------------- HERO ---------------- */}

          <section className="mx-hero">
            <div className="mx-label">
              <i className="mx-label-dot" />
              MOBIXA IMAGE LAB
            </div>

            <h1>
              ایده بده و <span>عکس تحویل بگیر</span>
            </h1>

            <p>یه ایده بده، موبیکسا تصویرشو برات می‌سازه.</p>

            <ol className="mx-steps">
              <li>
                <b>۱</b>
                ایده‌ات رو بنویس
              </li>
              <li className="mx-step-line" aria-hidden="true" />
              <li>
                <b>۲</b>
                سبک رو انتخاب کن
              </li>
              <li className="mx-step-line" aria-hidden="true" />
              <li>
                <b>۳</b>
                تصویرت آماده‌ست
              </li>
            </ol>
          </section>

          {/* ---------------- PROMPT STUDIO ---------------- */}

          <section
            className={`mx-studio${focused ? " focus" : ""}`}
            ref={promptRef}
          >
            <div className="mx-field">
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    (e.ctrlKey || e.metaKey)
                  ) {
                    e.preventDefault();
                    generateImage();
                  }
                }}
                maxLength={MAX_LEN}
                disabled={loading}
                rows={4}
                aria-label="ایده‌ی تصویر"
              />

              {!prompt && (
                <div className="mx-ph" aria-hidden="true">
                  <span className="mx-ph-title">
                    خب، چی تو ذهنت داری؟
                  </span>
                  <span className="mx-ph-hint" key={hintIndex}>
                    {PLACEHOLDER_HINTS[hintIndex]}
                  </span>
                </div>
              )}
            </div>

            <div className="mx-tools">
              <button
                type="button"
                className="mx-chip-btn"
                onClick={randomIdea}
                disabled={loading}
              >
                <IconDice />
                <span>ایده‌ی تصادفی</span>
              </button>

              {prompt && !loading && (
                <button
                  type="button"
                  className="mx-chip-btn mx-chip-quiet"
                  onClick={clearPrompt}
                  aria-label="پاک کردن"
                >
                  <IconClear />
                </button>
              )}

              <div className="mx-spacer" />

              <span className="mx-count-text" dir="ltr">
                {toFaDigits(prompt.length)}/{toFaDigits(MAX_LEN)}
              </span>

              <div
                className="mx-count"
                aria-label={`${prompt.length} از ${MAX_LEN}`}
              >
                <svg viewBox="0 0 26 26" aria-hidden="true">
                  <circle
                    cx="13"
                    cy="13"
                    r="10"
                    className="mx-count-bg"
                  />
                  <circle
                    cx="13"
                    cy="13"
                    r="10"
                    className={`mx-count-fg${
                      ratio > 0.9 ? " warn" : ""
                    }`}
                    strokeDasharray={RING}
                    strokeDashoffset={RING * (1 - ratio)}
                  />
                </svg>
              </div>
            </div>

            {/* ---- Boosters ---- */}

            <div className="mx-row-label">
              <IconSpark />
              <span>افزودنی‌های حرفه‌ای</span>
            </div>

            <div className="mx-chips" role="group" aria-label="افزودنی‌ها">
              {BOOSTERS.map((item) => (
                <button
                  key={item}
                  type="button"
                  disabled={loading}
                  className={`mx-chip${
                    prompt.includes(item) ? " on" : ""
                  }`}
                  onClick={() => toggleBooster(item)}
                >
                  {prompt.includes(item) ? "✓ " : "+ "}
                  {item}
                </button>
              ))}
            </div>

            {/* ---- Styles ---- */}

            <div className="mx-row-label">
              <IconGrid />
              <span>سبک تصویر</span>
            </div>

            <div className="mx-styles" role="radiogroup" aria-label="سبک">
              {STYLES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="radio"
                  aria-checked={styleId === item.id}
                  disabled={loading}
                  className={`mx-style${
                    styleId === item.id ? " on" : ""
                  }`}
                  onClick={() => setStyleId(item.id)}
                >
                  <i>{item.icon}</i>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* ---- Create ---- */}

            <button
              type="button"
              className={`mx-create${ready ? " ready" : ""}`}
              onClick={() => generateImage()}
              disabled={!prompt.trim() || loading}
              aria-label="ساخت تصویر"
            >
              {loading ? (
                <>
                  <span className="mx-spinner" />
                  <span>در حال ساخت...</span>
                </>
              ) : (
                <>
                  <IconSpark />
                  <span>بساز</span>
                </>
              )}
            </button>

            <div className="mx-kbd">
              Ctrl + Enter برای ساخت سریع
            </div>
          </section>

          {/* ---------------- ERROR ---------------- */}

          {error && (
            <div className="mx-error" role="alert">
              <i>!</i>
              <span>{error}</span>
            </div>
          )}

          {/* ---------------- GENERATING ---------------- */}

          {loading && (
            <section className="mx-gen" aria-live="polite">
              <div className="mx-gen-canvas">
                <div className="mx-gen-flow" />
                <div className="mx-gen-aurora" />
                <div className="mx-scan" />

                <i className="mx-fl f1">✦</i>
                <i className="mx-fl f2">✦</i>
                <i className="mx-fl f3">✦</i>
                <i className="mx-fl f4">✦</i>
                <i className="mx-fl f5">✦</i>
                <i className="mx-fl f6">✦</i>

                <div className="mx-orb">
                  <i className="mx-orb-ring r1" />
                  <i className="mx-orb-ring r2" />
                  <i className="mx-orb-ring r3" />
                  <i className="mx-orb-core" />
                </div>

                <div className="mx-gen-info">
                  <div className="mx-stage" key={stageIndex}>
                    {STAGES[stageIndex]}
                  </div>

                  <div className="mx-bar">
                    <span style={{ width: `${progress}%` }} />
                  </div>

                  <div className="mx-gen-meta">
                    <span>{toFaDigits(Math.floor(elapsed))} ثانیه</span>
                    <span>{toFaDigits(Math.round(progress))}٪</span>
                  </div>
                </div>
              </div>

              <div className="mx-gen-prompt" dir="auto">
                {prompt}
              </div>

              <button
                type="button"
                className="mx-cancel"
                onClick={cancelGeneration}
              >
                لغو ساخت
              </button>
            </section>
          )}

          {/* ---------------- RESULT ---------------- */}

          {image && !loading && (
            <section className="mx-result" ref={resultRef}>
              <div className="mx-frame">
                <div className="mx-frame-glow" aria-hidden="true" />

                <div className="mx-frame-inner">
                  <img
                    ref={imgRef}
                    src={image}
                    alt="تصویر ساخته شده توسط موبیکسا"
                    className={`mx-img${imgLoaded ? " in" : ""}`}
                    onLoad={() => {
                      setImgLoaded(true);
                      setBurstKey((k) => k + 1);
                    }}
                    onClick={() => setViewer(true)}
                  />

                  {imgLoaded && <i className="mx-shine" aria-hidden="true" />}

                  <div className="mx-badge">
                    <IconSpark />
                    <span>Mobixa Image Lab</span>
                  </div>
                </div>

                {imgLoaded && (
                  <div className="mx-burst" key={burstKey} aria-hidden="true">
                    {SPARKS.map((s, i) => (
                      <i
                        key={i}
                        style={
                          {
                            "--a": `${s.angle}deg`,
                            "--d": `${s.dist}px`,
                            "--s": `${s.size}px`,
                            animationDelay: `${s.delay}s`,
                          } as CSSProperties
                        }
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="mx-actions">
                <button
                  type="button"
                  className="mx-act mx-act-main"
                  onClick={downloadImage}
                >
                  <IconDownload />
                  <span>دانلود</span>
                </button>

                <button
                  type="button"
                  className="mx-act"
                  onClick={retryImage}
                  disabled={loading}
                >
                  <IconRetry />
                  <span>تلاش مجدد</span>
                </button>
              </div>

              <div className="mx-actions mx-actions-small">
                <button
                  type="button"
                  className="mx-act mx-act-s"
                  onClick={copyPrompt}
                >
                  <IconCopy />
                  <span>کپی ایده</span>
                </button>

                <button
                  type="button"
                  className="mx-act mx-act-s"
                  onClick={() => setViewer(true)}
                >
                  <IconExpand />
                  <span>تمام‌صفحه</span>
                </button>

                <button
                  type="button"
                  className="mx-act mx-act-s"
                  onClick={newIdea}
                >
                  <IconPlus />
                  <span>ایده‌ی جدید</span>
                </button>
              </div>

              {used.prompt && (
                <div className="mx-used">
                  <div className="mx-used-top">
                    <span>ایده‌ی تو</span>

                    {usedStyle && usedStyle.id !== "none" && (
                      <em>
                        {usedStyle.icon} {usedStyle.label}
                      </em>
                    )}
                  </div>

                  <p dir="auto">{used.prompt}</p>
                </div>
              )}
            </section>
          )}

          {/* ---------------- INSPIRATION ---------------- */}

          <section className="mx-section">
            <div className="mx-sec-head">
              <h2>ایده‌هایی برای شروع</h2>
              <span>روی هر کدوم بزن</span>
            </div>

            <div className="mx-ideas">
              {IDEAS.map((idea, i) => (
                <button
                  key={idea.title}
                  type="button"
                  className="mx-idea"
                  disabled={loading}
                  onClick={() => fillPrompt(idea.prompt)}
                  style={
                    {
                      "--from": idea.from,
                      "--to": idea.to,
                      animationDelay: `${0.05 * i}s`,
                    } as CSSProperties
                  }
                >
                  <i className="mx-idea-emoji" aria-hidden="true">
                    {idea.icon}
                  </i>
                  <b>{idea.title}</b>
                  <span>{idea.prompt}</span>
                </button>
              ))}
            </div>
          </section>

          {/* ---------------- HISTORY ---------------- */}

          <section className="mx-section" ref={historyRef}>
            <div className="mx-sec-head">
              <h2>ساخته‌های این نشست</h2>
              <span>{toFaDigits(history.length)} تصویر</span>
            </div>

            {history.length === 0 ? (
              <div className="mx-empty">
                <i>🖼️</i>
                <p>
                  هر تصویری که بسازی همین‌جا نگه داشته میشه تا
                  دوباره بازش کنی.
                </p>
              </div>
            ) : (
              <div className="mx-history">
                {history.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`mx-thumb${
                      item.url === image ? " active" : ""
                    }`}
                    onClick={() => openFromHistory(item)}
                    aria-label={item.prompt}
                  >
                    <img src={item.url} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </section>

          <footer className="mx-foot">
            <IconSpark />
            <span>Mobixa Image Lab</span>
          </footer>
        </main>
      </div>

      {/* ---------------- LIGHTBOX ---------------- */}

      {viewer && image && (
        <div
          className="mx-viewer"
          role="dialog"
          aria-modal="true"
          onClick={() => setViewer(false)}
        >
          <button
            type="button"
            className="mx-viewer-close"
            onClick={() => setViewer(false)}
            aria-label="بستن"
          >
            <IconClose />
          </button>

          <img
            src={image}
            alt="تصویر ساخته شده توسط موبیکسا"
            onClick={(e) => e.stopPropagation()}
          />

          <button
            type="button"
            className="mx-viewer-dl"
            onClick={(e) => {
              e.stopPropagation();
              downloadImage();
            }}
          >
            <IconDownload />
            <span>دانلود</span>
          </button>
        </div>
      )}

      {/* ---------------- TOAST ---------------- */}

      {toast && <div className="mx-toast">{toast}</div>}

      <style jsx global>{`
        .mx-root {
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

        .mx-root *,
        .mx-root *::before,
        .mx-root *::after {
          box-sizing: border-box;
        }

        .mx-root button,
        .mx-root textarea {
          font: inherit;
          color: inherit;
          -webkit-tap-highlight-color: transparent;
        }

        .mx-root ::selection {
          background: rgba(124, 92, 255, 0.28);
        }

        /* ---------- Background ---------- */

        .mx-bg {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
        }

        .mx-bg::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image: radial-gradient(
            rgba(90, 70, 210, 0.2) 1px,
            transparent 1.3px
          );
          background-size: 22px 22px;
          -webkit-mask-image: linear-gradient(to bottom, #000, transparent 72%);
          mask-image: linear-gradient(to bottom, #000, transparent 72%);
        }

        .mx-blob {
          position: absolute;
          border-radius: 50%;
          will-change: transform;
        }

        .mx-b1 {
          width: 520px;
          height: 520px;
          left: -230px;
          top: -40px;
          background: radial-gradient(
            closest-side,
            rgba(139, 108, 255, 0.55),
            transparent
          );
          animation: mxDriftA 18s ease-in-out infinite alternate;
        }

        .mx-b2 {
          width: 500px;
          height: 500px;
          right: -240px;
          top: 36%;
          background: radial-gradient(
            closest-side,
            rgba(70, 200, 255, 0.5),
            transparent
          );
          animation: mxDriftB 22s ease-in-out infinite alternate;
        }

        .mx-b3 {
          width: 440px;
          height: 440px;
          left: 6%;
          bottom: -200px;
          background: radial-gradient(
            closest-side,
            rgba(255, 130, 200, 0.5),
            transparent
          );
          animation: mxDriftA 20s ease-in-out infinite alternate-reverse;
        }

        .mx-spark {
          position: absolute;
          font-style: normal;
          color: #fff;
          text-shadow: 0 0 12px rgba(120, 82, 245, 0.8);
          animation: mxTwinkle 3.6s ease-in-out infinite;
        }

        .mx-spark.s1 {
          top: 10%;
          right: 10%;
          font-size: 16px;
        }
        .mx-spark.s2 {
          top: 20%;
          left: 8%;
          font-size: 11px;
          animation-delay: 0.7s;
        }
        .mx-spark.s3 {
          top: 42%;
          right: 5%;
          font-size: 10px;
          animation-delay: 1.5s;
        }
        .mx-spark.s4 {
          top: 56%;
          left: 12%;
          font-size: 14px;
          animation-delay: 2.1s;
        }
        .mx-spark.s5 {
          top: 74%;
          right: 16%;
          font-size: 12px;
          animation-delay: 1s;
        }
        .mx-spark.s6 {
          top: 88%;
          left: 28%;
          font-size: 9px;
          animation-delay: 2.6s;
        }

        /* ---------- Scroll container ---------- */

        .mx-scroll {
          position: absolute;
          inset: 0;
          overflow-y: auto;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
          scrollbar-width: none;
          scroll-behavior: smooth;
        }

        .mx-scroll::-webkit-scrollbar {
          display: none;
        }

        /* ---------- Top bar ---------- */

        .mx-top {
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
            rgba(225, 215, 255, 0.82),
            rgba(225, 215, 255, 0)
          );
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          animation: mxFadeDown 0.6s ease both;
        }

        .mx-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 38px;
          padding: 0 14px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.95);
          background: rgba(255, 255, 255, 0.78);
          box-shadow: 0 6px 18px rgba(86, 66, 200, 0.14);
          font-size: 13px;
          font-weight: 700;
          color: var(--violet-d);
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .mx-pill:active {
          transform: scale(0.94);
        }

        .mx-pill svg {
          width: 17px;
          height: 17px;
        }

        .mx-back {
          justify-self: start;
        }

        .mx-back svg {
          transform: rotate(0deg);
        }

        .mx-hist-btn {
          justify-self: end;
          font-variant-numeric: tabular-nums;
        }

        .mx-brand {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          letter-spacing: 4px;
          color: #2a1f7a;
        }

        .mx-logo {
          width: 26px;
          height: 26px;
          display: grid;
          place-items: center;
          border-radius: 9px;
          color: #fff;
          background: linear-gradient(135deg, #7852f5, #c25bff 60%, #ff78c4);
          box-shadow: 0 6px 14px rgba(120, 82, 245, 0.45);
        }

        .mx-logo svg {
          width: 15px;
          height: 15px;
        }

        /* ---------- Layout ---------- */

        .mx-wrap {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 760px;
          margin: 0 auto;
          padding: 8px 16px calc(env(safe-area-inset-bottom, 0px) + 40px);
          display: flex;
          flex-direction: column;
          gap: 22px;
        }

        /* ---------- Hero ---------- */

        .mx-hero {
          text-align: center;
          padding-top: 6px;
          animation: mxRise 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) 0.1s both;
        }

        .mx-label {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 14px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 2.5px;
          color: var(--violet-d);
          background: rgba(255, 255, 255, 0.72);
          border: 1px solid rgba(255, 255, 255, 0.95);
          box-shadow: 0 6px 18px rgba(86, 66, 200, 0.14);
          direction: ltr;
        }

        .mx-label-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--cyan), var(--pink));
          animation: mxPulse 1.8s ease-out infinite;
        }

        .mx-hero h1 {
          margin: 16px 0 8px;
          font-size: clamp(28px, 7.6vw, 44px);
          line-height: 1.45;
          font-weight: 900;
          color: var(--ink);
        }

        .mx-hero h1 span {
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
          animation: mxFlow 7s linear infinite;
        }

        .mx-hero p {
          margin: 0;
          font-size: 15px;
          font-weight: 500;
          color: rgba(29, 26, 61, 0.7);
        }

        .mx-steps {
          list-style: none;
          margin: 20px auto 0;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          max-width: 460px;
        }

        .mx-steps li {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 7px;
          font-size: 11.5px;
          font-weight: 700;
          color: rgba(29, 26, 61, 0.75);
          white-space: nowrap;
        }

        .mx-steps li b {
          width: 30px;
          height: 30px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          font-size: 13px;
          color: #fff;
          background: linear-gradient(135deg, #7852f5, #c25bff);
          box-shadow: 0 6px 14px rgba(120, 82, 245, 0.4);
        }

        .mx-steps li.mx-step-line {
          flex: 1;
          height: 2px;
          min-width: 18px;
          margin-bottom: 22px;
          border-radius: 2px;
          background: linear-gradient(
            90deg,
            rgba(120, 82, 245, 0.1),
            rgba(120, 82, 245, 0.5),
            rgba(120, 82, 245, 0.1)
          );
          background-size: 200% 100%;
          animation: mxFlow 3s linear infinite;
        }

        /* ---------- Studio ---------- */

        .mx-studio {
          position: relative;
          padding: 16px;
          border-radius: 28px;
          background: rgba(255, 255, 255, 0.78);
          border: 1px solid rgba(255, 255, 255, 0.95);
          box-shadow:
            0 24px 60px rgba(86, 66, 200, 0.22),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          animation: mxRise 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) 0.2s both;
          transition: box-shadow 0.35s ease;
        }

        .mx-studio::before {
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
          animation: mxFlow 6s linear infinite;
          pointer-events: none;
        }

        .mx-studio.focus {
          box-shadow:
            0 28px 70px rgba(120, 82, 245, 0.34),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
        }

        .mx-studio.focus::before {
          opacity: 0.95;
        }

        .mx-field {
          position: relative;
        }

        .mx-field textarea {
          width: 100%;
          min-height: 118px;
          max-height: 280px;
          resize: none;
          border: 0;
          outline: 0;
          padding: 8px 6px;
          background: transparent;
          font-size: 17px;
          font-weight: 500;
          line-height: 2;
          color: var(--ink);
          text-align: start;
        }

        .mx-field textarea:disabled {
          opacity: 0.55;
        }

        .mx-ph {
          position: absolute;
          inset: 8px 6px auto 6px;
          pointer-events: none;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .mx-ph-title {
          font-size: 17px;
          font-weight: 800;
          line-height: 2;
          color: rgba(29, 26, 61, 0.78);
        }

        .mx-ph-hint {
          font-size: 14.5px;
          font-weight: 500;
          line-height: 1.9;
          color: rgba(29, 26, 61, 0.45);
          animation: mxTextIn 0.6s ease both;
        }

        .mx-tools {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 6px;
          padding-top: 10px;
          border-top: 1px dashed rgba(120, 82, 245, 0.2);
        }

        .mx-spacer {
          flex: 1;
        }

        .mx-chip-btn {
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
          transition: transform 0.2s ease, background 0.2s ease;
        }

        .mx-chip-btn svg {
          width: 17px;
          height: 17px;
        }

        .mx-chip-btn:hover svg {
          animation: mxWiggle 0.6s ease;
        }

        .mx-chip-btn:active {
          transform: scale(0.93);
        }

        .mx-chip-btn:disabled {
          opacity: 0.45;
          cursor: default;
        }

        .mx-chip-quiet {
          padding: 0 10px;
          color: rgba(29, 26, 61, 0.55);
          background: rgba(29, 26, 61, 0.05);
          border-color: rgba(29, 26, 61, 0.1);
        }

        .mx-count {
          position: relative;
          width: 30px;
          height: 30px;
          display: grid;
          place-items: center;
        }

        .mx-count svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          transform: rotate(-90deg);
        }

        .mx-count circle {
          fill: none;
          stroke-width: 2.4;
        }

        .mx-count-bg {
          stroke: rgba(120, 82, 245, 0.15);
        }

        .mx-count-fg {
          stroke: #7852f5;
          stroke-linecap: round;
          transition: stroke-dashoffset 0.25s ease, stroke 0.25s ease;
        }

        .mx-count-fg.warn {
          stroke: #ff4f7b;
        }

        .mx-count-text {
          font-size: 11.5px;
          font-weight: 700;
          color: rgba(29, 26, 61, 0.5);
          font-variant-numeric: tabular-nums;
        }

        .mx-row-label {
          display: flex;
          align-items: center;
          gap: 7px;
          margin: 16px 2px 9px;
          font-size: 12.5px;
          font-weight: 800;
          color: rgba(29, 26, 61, 0.7);
        }

        .mx-row-label svg {
          width: 16px;
          height: 16px;
          color: var(--violet);
        }

        .mx-chips,
        .mx-styles {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding: 2px 2px 6px;
          scrollbar-width: none;
          scroll-snap-type: x proximity;
        }

        .mx-chips::-webkit-scrollbar,
        .mx-styles::-webkit-scrollbar {
          display: none;
        }

        .mx-chip {
          flex: 0 0 auto;
          scroll-snap-align: start;
          height: 34px;
          padding: 0 13px;
          border-radius: 999px;
          border: 1px solid rgba(120, 82, 245, 0.2);
          background: rgba(255, 255, 255, 0.85);
          font-size: 12.5px;
          font-weight: 600;
          color: rgba(29, 26, 61, 0.8);
          cursor: pointer;
          white-space: nowrap;
          transition:
            transform 0.2s ease,
            background 0.25s ease,
            color 0.25s ease,
            box-shadow 0.25s ease;
        }

        .mx-chip:active {
          transform: scale(0.94);
        }

        .mx-chip.on {
          color: #fff;
          border-color: transparent;
          background: linear-gradient(135deg, #7852f5, #b04bff);
          box-shadow: 0 8px 18px rgba(120, 82, 245, 0.4);
        }

        .mx-chip:disabled,
        .mx-style:disabled {
          opacity: 0.5;
          cursor: default;
        }

        .mx-style {
          flex: 0 0 auto;
          scroll-snap-align: start;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          width: 78px;
          padding: 10px 6px 9px;
          border-radius: 18px;
          border: 1px solid rgba(120, 82, 245, 0.16);
          background: rgba(255, 255, 255, 0.85);
          cursor: pointer;
          transition:
            transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1),
            box-shadow 0.25s ease,
            background 0.25s ease;
        }

        .mx-style i {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border-radius: 13px;
          font-style: normal;
          font-size: 20px;
          background: linear-gradient(
            135deg,
            rgba(120, 82, 245, 0.14),
            rgba(40, 176, 255, 0.14)
          );
        }

        .mx-style span {
          font-size: 11.5px;
          font-weight: 700;
          color: rgba(29, 26, 61, 0.8);
          white-space: nowrap;
        }

        .mx-style:active {
          transform: scale(0.94);
        }

        .mx-style.on {
          transform: translateY(-2px);
          background: #fff;
          border-color: transparent;
          box-shadow:
            0 0 0 2px #7852f5,
            0 12px 26px rgba(120, 82, 245, 0.35);
        }

        .mx-style.on i {
          background: linear-gradient(135deg, #7852f5, #c25bff);
        }

        /* ---------- Create button ---------- */

        .mx-create {
          position: relative;
          overflow: hidden;
          width: 100%;
          height: 58px;
          margin-top: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
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
          transition:
            transform 0.2s ease,
            filter 0.3s ease,
            box-shadow 0.3s ease;
          animation: mxFlow 5s linear infinite;
        }

        .mx-create svg {
          width: 22px;
          height: 22px;
        }

        .mx-create.ready::after {
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
          animation: mxSweep 3.2s ease-in-out infinite;
        }

        .mx-create.ready svg {
          animation: mxTwinkleIcon 2.4s ease-in-out infinite;
        }

        .mx-create:active {
          transform: scale(0.97);
        }

        .mx-create:disabled {
          cursor: default;
          filter: saturate(0.35) brightness(1.05);
          box-shadow: 0 8px 18px rgba(106, 77, 240, 0.18);
          animation: none;
        }

        .mx-kbd {
          display: none;
          margin-top: 10px;
          text-align: center;
          direction: ltr;
          font-size: 11px;
          color: rgba(29, 26, 61, 0.45);
        }

        @media (hover: hover) and (pointer: fine) {
          .mx-kbd {
            display: block;
          }
        }

        .mx-spinner {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2.5px solid rgba(255, 255, 255, 0.4);
          border-top-color: #fff;
          animation: mxSpin 0.8s linear infinite;
        }

        /* ---------- Error ---------- */

        .mx-error {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 13px 16px;
          border-radius: 18px;
          font-size: 13.5px;
          font-weight: 600;
          line-height: 1.8;
          color: #b4234f;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(255, 93, 122, 0.35);
          box-shadow: 0 10px 26px rgba(255, 93, 122, 0.18);
          animation: mxRise 0.4s ease both;
        }

        .mx-error i {
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

        /* ---------- Generating ---------- */

        .mx-gen {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          animation: mxRise 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }

        .mx-gen-canvas {
          position: relative;
          width: 100%;
          max-width: 520px;
          aspect-ratio: 1 / 1;
          overflow: hidden;
          border-radius: 30px;
          border: 1px solid rgba(255, 255, 255, 0.95);
          background: linear-gradient(
            135deg,
            #e9defe,
            #cfe3ff,
            #ffd9ee,
            #e9defe
          );
          background-size: 300% 300%;
          box-shadow:
            0 26px 64px rgba(120, 82, 245, 0.34),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
          animation: mxGradMove 6s ease-in-out infinite;
        }

        .mx-gen-flow,
        .mx-gen-aurora {
          position: absolute;
          inset: 0;
        }

        .mx-gen-aurora::before {
          content: "";
          position: absolute;
          left: 50%;
          top: 50%;
          width: 150%;
          height: 150%;
          margin: -75% 0 0 -75%;
          background: conic-gradient(
            from 0deg,
            rgba(120, 82, 245, 0),
            rgba(120, 82, 245, 0.45),
            rgba(40, 176, 255, 0),
            rgba(255, 120, 196, 0.5),
            rgba(120, 82, 245, 0)
          );
          animation: mxSpin 9s linear infinite;
        }

        .mx-scan {
          position: absolute;
          left: 0;
          right: 0;
          height: 90px;
          top: -90px;
          background: linear-gradient(
            to bottom,
            rgba(255, 255, 255, 0),
            rgba(255, 255, 255, 0.7),
            rgba(255, 255, 255, 0)
          );
          animation: mxScan 2.8s ease-in-out infinite;
        }

        .mx-fl {
          position: absolute;
          font-style: normal;
          color: #fff;
          text-shadow: 0 0 14px rgba(120, 82, 245, 0.9);
          animation: mxFloat 4s ease-in-out infinite;
        }

        .mx-fl.f1 {
          left: 14%;
          top: 22%;
          font-size: 18px;
        }
        .mx-fl.f2 {
          right: 16%;
          top: 18%;
          font-size: 12px;
          animation-delay: 0.8s;
        }
        .mx-fl.f3 {
          left: 22%;
          top: 62%;
          font-size: 13px;
          animation-delay: 1.6s;
        }
        .mx-fl.f4 {
          right: 20%;
          top: 56%;
          font-size: 20px;
          animation-delay: 0.4s;
        }
        .mx-fl.f5 {
          left: 48%;
          top: 12%;
          font-size: 10px;
          animation-delay: 2.2s;
        }
        .mx-fl.f6 {
          right: 40%;
          top: 70%;
          font-size: 11px;
          animation-delay: 1.2s;
        }

        .mx-orb {
          position: absolute;
          left: 50%;
          top: 42%;
          width: 120px;
          height: 120px;
          margin: -60px 0 0 -60px;
        }

        .mx-orb-core {
          position: absolute;
          inset: 28px;
          border-radius: 50%;
          background: radial-gradient(
            circle at 32% 28%,
            #fff,
            #c9b6ff 40%,
            #7852f5 75%,
            #4a35d0
          );
          box-shadow:
            0 0 40px rgba(120, 82, 245, 0.7),
            0 14px 30px rgba(74, 53, 208, 0.45);
          animation: mxBreath 2.4s ease-in-out infinite;
        }

        .mx-orb-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 1.5px solid rgba(120, 82, 245, 0.5);
          animation: mxRing 2.8s ease-out infinite;
        }

        .mx-orb-ring.r2 {
          animation-delay: 0.9s;
        }

        .mx-orb-ring.r3 {
          animation-delay: 1.8s;
        }

        .mx-gen-info {
          position: absolute;
          left: 16px;
          right: 16px;
          bottom: 16px;
          padding: 13px 15px 12px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.78);
          border: 1px solid rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          box-shadow: 0 10px 26px rgba(86, 66, 200, 0.2);
        }

        .mx-stage {
          font-size: 14.5px;
          font-weight: 800;
          color: var(--violet-d);
          animation: mxTextIn 0.5s ease both;
        }

        .mx-bar {
          height: 7px;
          margin: 9px 0 7px;
          overflow: hidden;
          border-radius: 6px;
          background: rgba(120, 82, 245, 0.15);
        }

        .mx-bar span {
          display: block;
          height: 100%;
          border-radius: 6px;
          background: linear-gradient(90deg, #7852f5, #ff78c4, #28b0ff);
          background-size: 200% 100%;
          transition: width 0.4s linear;
          animation: mxFlow 2s linear infinite;
        }

        .mx-gen-meta {
          display: flex;
          justify-content: space-between;
          font-size: 11.5px;
          font-weight: 600;
          color: rgba(29, 26, 61, 0.6);
          font-variant-numeric: tabular-nums;
        }

        .mx-gen-prompt {
          width: 100%;
          max-width: 520px;
          padding: 10px 14px;
          border-radius: 16px;
          font-size: 13px;
          line-height: 1.9;
          text-align: start;
          color: rgba(29, 26, 61, 0.78);
          background: rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.9);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .mx-cancel {
          height: 36px;
          padding: 0 18px;
          border-radius: 999px;
          border: 1px solid rgba(29, 26, 61, 0.15);
          background: rgba(255, 255, 255, 0.7);
          font-size: 12.5px;
          font-weight: 700;
          color: rgba(29, 26, 61, 0.7);
          cursor: pointer;
        }

        /* ---------- Result ---------- */

        .mx-result {
          display: flex;
          flex-direction: column;
          gap: 12px;
          scroll-margin-top: 70px;
          animation: mxRise 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }

        .mx-frame {
          position: relative;
          width: 100%;
          max-width: 560px;
          margin: 0 auto;
        }

        .mx-frame-glow {
          position: absolute;
          inset: 6% 4% -4%;
          border-radius: 36px;
          background: linear-gradient(135deg, #7852f5, #28b0ff, #ff78c4);
          opacity: 0.55;
          animation: mxGlow 4s ease-in-out infinite alternate;
        }

        .mx-frame-inner {
          position: relative;
          overflow: hidden;
          border-radius: 30px;
          padding: 7px;
          background: rgba(255, 255, 255, 0.92);
          border: 1px solid rgba(255, 255, 255, 1);
          box-shadow: 0 26px 60px rgba(60, 40, 170, 0.32);
          min-height: 200px;
        }

        .mx-img {
          display: block;
          width: 100%;
          height: auto;
          border-radius: 24px;
          opacity: 0;
          filter: blur(22px) saturate(1.4);
          transform: scale(1.06);
          transition:
            opacity 0.8s ease,
            filter 1s ease,
            transform 1s cubic-bezier(0.2, 0.8, 0.2, 1);
          cursor: zoom-in;
        }

        .mx-img.in {
          opacity: 1;
          filter: blur(0) saturate(1);
          transform: scale(1);
        }

        .mx-shine {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 90px;
          left: -120px;
          pointer-events: none;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.6),
            transparent
          );
          transform: skewX(-20deg);
          animation: mxSweepOnce 1.3s ease 0.35s 1 both;
        }

        .mx-badge {
          position: absolute;
          left: 16px;
          bottom: 16px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 11px;
          border-radius: 999px;
          font-size: 10.5px;
          font-weight: 800;
          letter-spacing: 0.4px;
          color: #fff;
          direction: ltr;
          background: rgba(29, 26, 61, 0.45);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }

        .mx-badge svg {
          width: 13px;
          height: 13px;
        }

        .mx-burst {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 0;
          height: 0;
          pointer-events: none;
        }

        .mx-burst i {
          position: absolute;
          left: 0;
          top: 0;
          width: var(--s);
          height: var(--s);
          border-radius: 50%;
          background: radial-gradient(circle, #fff, #ffd1ef 45%, #a98bff);
          box-shadow: 0 0 12px rgba(160, 120, 255, 0.9);
          opacity: 0;
          animation: mxBurst 1.1s cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }

        .mx-actions {
          display: flex;
          gap: 10px;
          width: 100%;
          max-width: 560px;
          margin: 0 auto;
        }

        .mx-act {
          flex: 1;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.95);
          background: rgba(255, 255, 255, 0.82);
          box-shadow: 0 8px 22px rgba(86, 66, 200, 0.16);
          font-size: 14px;
          font-weight: 800;
          color: var(--violet-d);
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .mx-act svg {
          width: 19px;
          height: 19px;
        }

        .mx-act:active {
          transform: scale(0.95);
        }

        .mx-act:disabled {
          opacity: 0.5;
        }

        .mx-act-main {
          flex: 1.4;
          color: #fff;
          border-color: transparent;
          background: linear-gradient(135deg, #6a4df0, #b04bff);
          box-shadow: 0 12px 26px rgba(106, 77, 240, 0.42);
        }

        .mx-actions-small .mx-act {
          height: 46px;
          flex-direction: column;
          gap: 2px;
          font-size: 11.5px;
          border-radius: 16px;
        }

        .mx-actions-small .mx-act svg {
          width: 17px;
          height: 17px;
        }

        .mx-used {
          width: 100%;
          max-width: 560px;
          margin: 0 auto;
          padding: 12px 15px 13px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.78);
          border: 1px solid rgba(255, 255, 255, 0.95);
          box-shadow: 0 8px 22px rgba(86, 66, 200, 0.14);
        }

        .mx-used-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 4px;
          font-size: 11.5px;
          font-weight: 800;
          color: var(--violet-d);
        }

        .mx-used-top em {
          font-style: normal;
          padding: 3px 10px;
          border-radius: 999px;
          background: rgba(120, 82, 245, 0.12);
        }

        .mx-used p {
          margin: 0;
          font-size: 14px;
          font-weight: 500;
          line-height: 1.95;
          text-align: start;
          color: var(--ink);
        }

        /* ---------- Sections ---------- */

        .mx-section {
          animation: mxRise 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) 0.3s both;
          scroll-margin-top: 70px;
        }

        .mx-sec-head {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin: 0 4px 12px;
        }

        .mx-sec-head h2 {
          margin: 0;
          font-size: 17px;
          font-weight: 900;
          color: var(--ink);
        }

        .mx-sec-head span {
          font-size: 12px;
          font-weight: 600;
          color: rgba(29, 26, 61, 0.55);
        }

        .mx-ideas {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        @media (min-width: 640px) {
          .mx-ideas {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        .mx-idea {
          position: relative;
          overflow: hidden;
          min-height: 150px;
          padding: 14px 13px 13px;
          display: flex;
          flex-direction: column;
          gap: 5px;
          text-align: start;
          border-radius: 22px;
          border: 1px solid rgba(255, 255, 255, 0.95);
          background:
            linear-gradient(
              160deg,
              rgba(255, 255, 255, 0.92),
              rgba(255, 255, 255, 0.7)
            );
          box-shadow: 0 10px 26px rgba(86, 66, 200, 0.16);
          cursor: pointer;
          animation: mxRise 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) both;
          transition:
            transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1),
            box-shadow 0.3s ease;
        }

        .mx-idea::before {
          content: "";
          position: absolute;
          width: 120px;
          height: 120px;
          left: -34px;
          bottom: -44px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--from), var(--to));
          opacity: 0.28;
          transition: opacity 0.3s ease, transform 0.4s ease;
        }

        .mx-idea:hover::before,
        .mx-idea:active::before {
          opacity: 0.5;
          transform: scale(1.25);
        }

        .mx-idea:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 34px rgba(86, 66, 200, 0.26);
        }

        .mx-idea:active {
          transform: scale(0.96);
        }

        .mx-idea:disabled {
          opacity: 0.55;
          cursor: default;
        }

        .mx-idea-emoji {
          position: relative;
          width: 40px;
          height: 40px;
          display: grid;
          place-items: center;
          border-radius: 14px;
          font-style: normal;
          font-size: 22px;
          background: linear-gradient(135deg, var(--from), var(--to));
          box-shadow: 0 8px 16px rgba(60, 40, 170, 0.25);
        }

        .mx-idea b {
          position: relative;
          margin-top: 5px;
          font-size: 14px;
          font-weight: 900;
          color: var(--ink);
        }

        .mx-idea span {
          position: relative;
          font-size: 11.5px;
          line-height: 1.8;
          color: rgba(29, 26, 61, 0.62);
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* ---------- History ---------- */

        .mx-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 24px 18px;
          text-align: center;
          border-radius: 24px;
          border: 1.5px dashed rgba(120, 82, 245, 0.35);
          background: rgba(255, 255, 255, 0.5);
        }

        .mx-empty i {
          font-style: normal;
          font-size: 30px;
          animation: mxFloat 3.6s ease-in-out infinite;
        }

        .mx-empty p {
          margin: 0;
          max-width: 300px;
          font-size: 13px;
          font-weight: 500;
          line-height: 1.9;
          color: rgba(29, 26, 61, 0.62);
        }

        .mx-history {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          padding: 4px 2px 10px;
          scrollbar-width: none;
        }

        .mx-history::-webkit-scrollbar {
          display: none;
        }

        .mx-thumb {
          flex: 0 0 auto;
          width: 96px;
          height: 96px;
          padding: 0;
          overflow: hidden;
          border-radius: 20px;
          border: 2px solid rgba(255, 255, 255, 0.95);
          background: rgba(255, 255, 255, 0.7);
          box-shadow: 0 8px 20px rgba(86, 66, 200, 0.2);
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.25s ease;
        }

        .mx-thumb img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }

        .mx-thumb:active {
          transform: scale(0.94);
        }

        .mx-thumb.active {
          border-color: #7852f5;
          box-shadow:
            0 0 0 2px rgba(120, 82, 245, 0.35),
            0 12px 26px rgba(120, 82, 245, 0.4);
        }

        .mx-foot {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding-top: 4px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.5px;
          color: rgba(29, 26, 61, 0.45);
          direction: ltr;
        }

        .mx-foot svg {
          width: 14px;
          height: 14px;
        }

        /* ---------- Viewer ---------- */

        .mx-viewer {
          position: fixed;
          inset: 0;
          z-index: 60;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 54px 14px 90px;
          background: rgba(20, 14, 52, 0.86);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          animation: mxFadeIn 0.3s ease both;
        }

        .mx-viewer img {
          max-width: 100%;
          max-height: 100%;
          border-radius: 18px;
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.5);
          animation: mxZoomIn 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }

        .mx-viewer-close {
          position: absolute;
          top: calc(env(safe-area-inset-top, 0px) + 12px);
          right: 14px;
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.3);
          background: rgba(255, 255, 255, 0.16);
          color: #fff;
          cursor: pointer;
        }

        .mx-viewer-close svg {
          width: 20px;
          height: 20px;
        }

        .mx-viewer-dl {
          position: absolute;
          bottom: calc(env(safe-area-inset-bottom, 0px) + 20px);
          left: 50%;
          transform: translateX(-50%);
          display: inline-flex;
          align-items: center;
          gap: 8px;
          height: 48px;
          padding: 0 26px;
          border: 0;
          border-radius: 999px;
          font-size: 14px;
          font-weight: 800;
          color: #fff;
          background: linear-gradient(135deg, #6a4df0, #b04bff);
          box-shadow: 0 12px 28px rgba(106, 77, 240, 0.5);
          cursor: pointer;
        }

        .mx-viewer-dl svg {
          width: 18px;
          height: 18px;
        }

        /* ---------- Toast ---------- */

        .mx-toast {
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
          animation: mxToast 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }

        /* ---------- Keyframes ---------- */

        @keyframes mxRise {
          from {
            opacity: 0;
            transform: translateY(22px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes mxFadeDown {
          from {
            opacity: 0;
            transform: translateY(-14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes mxFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes mxZoomIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes mxTextIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes mxToast {
          from {
            opacity: 0;
            transform: translate(-50%, 14px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }

        @keyframes mxDriftA {
          from {
            transform: translate3d(0, 0, 0) scale(1);
          }
          to {
            transform: translate3d(70px, 50px, 0) scale(1.15);
          }
        }

        @keyframes mxDriftB {
          from {
            transform: translate3d(0, 0, 0) scale(1.1);
          }
          to {
            transform: translate3d(-60px, -70px, 0) scale(0.95);
          }
        }

        @keyframes mxTwinkle {
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

        @keyframes mxTwinkleIcon {
          0%,
          100% {
            transform: scale(1) rotate(0deg);
          }
          50% {
            transform: scale(1.18) rotate(14deg);
          }
        }

        @keyframes mxFlow {
          from {
            background-position: 0% 50%;
          }
          to {
            background-position: 250% 50%;
          }
        }

        @keyframes mxGradMove {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes mxSweep {
          0%,
          55% {
            left: -80px;
          }
          100% {
            left: 120%;
          }
        }

        @keyframes mxSweepOnce {
          from {
            left: -120px;
          }
          to {
            left: 120%;
          }
        }

        @keyframes mxPulse {
          0% {
            box-shadow: 0 0 0 0 rgba(120, 82, 245, 0.55);
          }
          100% {
            box-shadow: 0 0 0 10px rgba(120, 82, 245, 0);
          }
        }

        @keyframes mxSpin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes mxWiggle {
          0%,
          100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(-18deg);
          }
          75% {
            transform: rotate(18deg);
          }
        }

        @keyframes mxScan {
          0% {
            top: -90px;
          }
          100% {
            top: 100%;
          }
        }

        @keyframes mxFloat {
          0%,
          100% {
            transform: translateY(0) scale(0.9);
            opacity: 0.4;
          }
          50% {
            transform: translateY(-14px) scale(1.15);
            opacity: 1;
          }
        }

        @keyframes mxBreath {
          0%,
          100% {
            transform: scale(0.94);
          }
          50% {
            transform: scale(1.1);
          }
        }

        @keyframes mxRing {
          0% {
            transform: scale(0.5);
            opacity: 0.9;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        @keyframes mxGlow {
          from {
            opacity: 0.4;
            transform: scale(0.98);
          }
          to {
            opacity: 0.7;
            transform: scale(1.03);
          }
        }

        @keyframes mxBurst {
          0% {
            opacity: 1;
            transform: rotate(var(--a)) translateX(0) scale(0.4);
          }
          100% {
            opacity: 0;
            transform: rotate(var(--a)) translateX(var(--d)) scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .mx-root *,
          .mx-root *::before,
          .mx-root *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </div>
  );
}
