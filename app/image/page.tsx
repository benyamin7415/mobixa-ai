"use client";

import { useState, useEffect, useRef } from "react";

/* ============================================================
   CONSTANTS
============================================================ */

const STYLES = [
  { id: "realistic", label: "واقع‌گرایانه", emoji: "📷", tag: "photorealistic, hyperdetailed, 8k, sharp focus" },
  { id: "anime", label: "انیمه", emoji: "🎨", tag: "anime style, studio ghibli inspired, vibrant" },
  { id: "cyberpunk", label: "سایبرپانک", emoji: "🌃", tag: "cyberpunk, neon lights, futuristic, rain" },
  { id: "3d", label: "سه‌بعدی", emoji: "🧊", tag: "3d render, octane, cinema4d, subsurface scattering" },
  { id: "watercolor", label: "آبرنگ", emoji: "🖌️", tag: "watercolor painting, soft washes, paper texture" },
  { id: "oil", label: "نقاشی روغنی", emoji: "🖼️", tag: "oil painting, thick brushstrokes, renaissance" },
  { id: "minimal", label: "مینیمال", emoji: "◻️", tag: "minimalist, clean composition, negative space" },
  { id: "fantasy", label: "فانتزی", emoji: "🐉", tag: "fantasy art, epic scene, magical atmosphere" },
];

const RATIOS = [
  { id: "1:1", label: "مربع", w: 22, h: 22 },
  { id: "16:9", label: "لنداسکیپ", w: 30, h: 17 },
  { id: "9:16", label: "پورتال", w: 17, h: 30 },
  { id: "4:3", label: "کلاسیک", w: 26, h: 20 },
  { id: "3:4", label: "پرتره", w: 20, h: 26 },
];

const SUGGESTIONS = [
  "دختری با موهای آبی زیر باران نئون",
  "شهر آینده در غروب بنفش",
  "گربه‌ای فضانورد روی ماه",
  "جنگل جادویی با قارچ‌های نورانی",
  "اسب بالدار روی اقیانوس ابرها",
];

/* ============================================================
   COMPONENT
============================================================ */

export default function ImagePage() {
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [selectedRatio, setSelectedRatio] = useState("1:1");
  const [history, setHistory] = useState<string[]>([]);
  const [fullscreen, setFullscreen] = useState(false);
  const [toast, setToast] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [progress, setProgress] = useState(0);
  const [lastPrompt, setLastPrompt] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /* ---------- Toast ---------- */
  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 2800);
  };

  /* ---------- Progress simulation ---------- */
  useEffect(() => {
    if (!loading) {
      setProgress(0);
      return;
    }
    setProgress(4);
    const id = setInterval(() => {
      setProgress((p) => (p >= 92 ? 92 : p + Math.max(0.6, (92 - p) * 0.06)));
    }, 220);
    return () => clearInterval(id);
  }, [loading]);

  /* ---------- Keyboard shortcut ---------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        generateImage();
      }
      if (e.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompt, loading, selectedStyle, selectedRatio]);

  /* ---------- Build enriched prompt (does NOT change API) ---------- */
  const buildFinalPrompt = (base: string) => {
    const style = STYLES.find((s) => s.id === selectedStyle);
    const parts = [base.trim()];
    if (style) parts.push(style.tag);
    parts.push(`aspect ratio ${selectedRatio}`);
    return parts.filter(Boolean).join(", ");
  };

  /* ---------- Enhance prompt (client-side only) ---------- */
  const enhancePrompt = () => {
    if (!prompt.trim()) return;
    const extras = [
      "cinematic lighting",
      "highly detailed",
      "dramatic composition",
      "professional color grading",
      "sharp focus",
    ];
    const shuffled = extras.sort(() => Math.random() - 0.5).slice(0, 3);
    setPrompt((p) => `${p.trim()}, ${shuffled.join(", ")}`);
    showToast("پرامپت تقویت شد ✨");
  };

  /* ---------- Generate ---------- */
  const generateImage = async (retryPrompt?: string) => {
    const base = (retryPrompt ?? prompt).trim();
    if (!base || loading) return;

    setLoading(true);
    setError("");
    setLastPrompt(base);

    try {
      const response = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: buildFinalPrompt(base) }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "ساخت تصویر با خطا مواجه شد.");
      }

      setImage(data.image);
      setHistory((h) => [data.image, ...h].slice(0, 12));
      showToast("تصویر با موفقیت ساخته شد 🎉");
    } catch (err: any) {
      const msg = err?.message || "یه مشکلی پیش اومد، دوباره امتحان کن.";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Download ---------- */
  const downloadImage = async (src?: string) => {
    const target = src || image;
    if (!target) return;
    try {
      const response = await fetch(target);
      if (!response.ok) throw new Error("دانلود تصویر انجام نشد.");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `mobixa-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast("تصویر دانلود شد ⬇️");
    } catch (err) {
      console.error("DOWNLOAD_ERROR", err);
      showToast("دانلود تصویر انجام نشد.", "error");
    }
  };

  /* ---------- Retry ---------- */
  const retryImage = () => {
    if (!lastPrompt || loading) return;
    generateImage(lastPrompt);
  };

  /* ---------- Clear ---------- */
  const clearAll = () => {
    setPrompt("");
    setImage(null);
    setError("");
    textareaRef.current?.focus();
  };

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <main className="image-page">
      {/* ============ BACKGROUND LAYERS ============ */}
      <div className="bg-layer grid-layer" />
      <div className="bg-layer noise-layer" />

      <div className="ambient ambient-purple" />
      <div className="ambient ambient-blue" />
      <div className="ambient ambient-cyan" />

      <div className="aurora aurora-one" />
      <div className="aurora aurora-two" />
      <div className="aurora aurora-three" />

      <div className="beam beam-one" />
      <div className="beam beam-two" />

      {/* Floating particles */}
      <div className="particles">
        {Array.from({ length: 22 }).map((_, i) => (
          <span key={i} className={`particle p-${i % 8}`} style={{ left: `${(i * 4.5) % 100}%`, animationDelay: `${i * 0.6}s` }} />
        ))}
      </div>

      {/* ============ MAIN WRAPPER ============ */}
      <div className="wrapper">
        {/* ============ HEADER ============ */}
        <header className="header">
          <div className="badge">
            <span className="badge-dot" />
            <span>MOBIXA · IMAGE LAB</span>
          </div>

          <h1 className="title">
            ایده‌ات رو بگو،
            <br />
            <span className="title-gradient">موبیکسا تصویرشو می‌سازه</span>
          </h1>

          <p className="subtitle">
            یک پرامپت بنویس، استایل و نسبت ابعاد رو انتخاب کن و بذار خلاقیت به پرواز در بیاد.
          </p>
        </header>

        {/* ============ STYLE PRESETS ============ */}
        <section className="section">
          <div className="section-head">
            <span className="section-title">استایل تصویر</span>
            {selectedStyle && (
              <button className="section-clear" onClick={() => setSelectedStyle(null)}>
                پاک کردن
              </button>
            )}
          </div>

          <div className="styles-row">
            {STYLES.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedStyle(selectedStyle === s.id ? null : s.id)}
                className={`style-chip ${selectedStyle === s.id ? "active" : ""}`}
              >
                <span className="style-emoji">{s.emoji}</span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ============ RATIO ============ */}
        <section className="section">
          <div className="section-head">
            <span className="section-title">نسبت ابعاد</span>
          </div>

          <div className="ratios-row">
            {RATIOS.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedRatio(r.id)}
                className={`ratio-chip ${selectedRatio === r.id ? "active" : ""}`}
              >
                <span className="ratio-preview" style={{ width: r.w, height: r.h }} />
                <span className="ratio-label">{r.label}</span>
                <span className="ratio-value">{r.id}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ============ PROMPT BOX ============ */}
        <section className="prompt-section">
          <div className="prompt-glow" />

          <div className="prompt-box">
            <div className="prompt-topbar">
              <div className="prompt-dots">
                <span className="dot dot-red" />
                <span className="dot dot-yellow" />
                <span className="dot dot-green" />
              </div>
              <span className="prompt-label">PROMPT EDITOR</span>
            </div>

            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={"خب، چی تو ذهنت داری؟\nمثلاً: «شهری در آینده با نورهای نئونی بنفش و باران»"}
              maxLength={2048}
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  generateImage();
                }
              }}
            />

            <div className="prompt-footer">
              <div className="prompt-footer-left">
                <button className="mini-btn" onClick={enhancePrompt} disabled={!prompt.trim() || loading}>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3v3" />
                    <path d="M12 18v3" />
                    <path d="M3 12h3" />
                    <path d="M18 12h3" />
                    <path d="m5.6 5.6 2.1 2.1" />
                    <path d="m16.3 16.3 2.1 2.1" />
                    <path d="m5.6 18.4 2.1-2.1" />
                    <path d="m16.3 7.7 2.1-2.1" />
                  </svg>
                  <span>تقویت پرامپت</span>
                </button>

                {prompt && (
                  <button className="mini-btn ghost" onClick={clearAll} disabled={loading}>
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                  </button>
                )}
              </div>

              <div className={`counter ${prompt.length > 1800 ? "warn" : ""}`}>
                {prompt.length} / 2048
              </div>
            </div>

            {/* light sweep */}
            <div className="prompt-sweep" />
          </div>
        </section>

        {/* ============ SUGGESTIONS ============ */}
        {!image && !loading && (
          <section className="suggestions">
            <span className="suggestions-label">💡 پیشنهاد:</span>
            <div className="suggestions-list">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  className="suggestion"
                  onClick={() => setPrompt(s)}
                  disabled={loading}
                >
                  {s}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ============ GENERATE BUTTON ============ */}
        <section className="action-section">
          <button
            className={`generate-btn ${prompt.trim() && !loading ? "ready" : ""}`}
            onClick={() => generateImage()}
            disabled={!prompt.trim() || loading}
          >
            <span className="generate-glow" />

            {loading ? (
              <>
                <span className="spinner" />
                <span>در حال ساخت...</span>
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v4" />
                  <path d="M12 18v4" />
                  <path d="M4.93 4.93l2.83 2.83" />
                  <path d="M16.24 16.24l2.83 2.83" />
                  <path d="M2 12h4" />
                  <path d="M18 12h4" />
                  <path d="M4.93 19.07l2.83-2.83" />
                  <path d="M16.24 7.76l2.83-2.83" />
                </svg>
                <span>ساخت تصویر</span>
              </>
            )}
          </button>

          <p className="hint">
            <kbd>Ctrl</kbd> + <kbd>Enter</kbd> برای ساخت سریع
          </p>
        </section>

        {/* ============ LOADING ============ */}
        {loading && (
          <section className="loading-state">
            <div className="orb">
              <div className="orb-ring ring-a" />
              <div className="orb-ring ring-b" />
              <div className="orb-ring ring-c" />
              <div className="orb-core">
                <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3v18" />
                  <path d="M3 12h18" />
                  <path d="m5.6 5.6 12.8 12.8" />
                  <path d="m18.4 5.6-12.8 12.8" />
                </svg>
              </div>
            </div>

            <div className="loading-title">هوش مصنوعی در حال خلق تصویر...</div>
            <div className="loading-sub">ایده‌ت داره شکل می‌گیره، چند لحظه صبر کن</div>

            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>

            <div className="loading-stages">
              <span className={progress > 10 ? "done" : ""}>تحلیل پرامپت</span>
              <span className={progress > 40 ? "done" : ""}>ساخت قاب</span>
              <span className={progress > 70 ? "done" : ""}>جزئیات نهایی</span>
            </div>
          </section>
        )}

        {/* ============ ERROR ============ */}
        {error && !loading && (
          <div className="error-message">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4" />
              <path d="M12 16h.01" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* ============ RESULT ============ */}
        {image && !loading && (
          <section className="result">
            <div className="result-head">
              <div className="result-title">
                <span className="result-dot" />
                نتیجه
              </div>
              <span className="result-time">آماده</span>
            </div>

            <div className="image-card" onClick={() => setFullscreen(true)}>
              <img src={image} alt="تصویر ساخته شده توسط موبیکسا" />
              <div className="image-overlay">
                <div className="overlay-hint">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h6v6" />
                    <path d="M9 21H3v-6" />
                    <path d="M21 3l-7 7" />
                    <path d="M3 21l7-7" />
                  </svg>
                  <span>نمایش کامل</span>
                </div>
              </div>
            </div>

            <div className="image-actions">
              <button className="action" onClick={() => downloadImage()}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3v12" />
                  <path d="m7 10 5 5 5-5" />
                  <path d="M5 21h14" />
                </svg>
                <span>دانلود</span>
              </button>

              <button className="action" onClick={retryImage} disabled={loading}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 11a8.1 8.1 0 0 0-15.5-2" />
                  <path d="M4 4v5h5" />
                  <path d="M4 13a8.1 8.1 0 0 0 15.5 2" />
                  <path d="M20 20v-5h-5" />
                </svg>
                <span>تلاش مجدد</span>
              </button>

              <button className="action" onClick={() => setFullscreen(true)}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h6v6" />
                  <path d="M9 21H3v-6" />
                  <path d="M21 3l-7 7" />
                  <path d="M3 21l7-7" />
                </svg>
                <span>تمام‌صفحه</span>
              </button>

              <button
                className="action"
                onClick={() => {
                  navigator.clipboard?.writeText(lastPrompt);
                  showToast("پرامپت کپی شد 📋");
                }}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15V5a2 2 0 0 1 2-2h10" />
                </svg>
                <span>کپی پرامپت</span>
              </button>
            </div>
          </section>
        )}

        {/* ============ HISTORY ============ */}
        {history.length > 1 && (
          <section className="history">
            <div className="history-head">
              <span className="section-title">تاریخچه</span>
              <button className="section-clear" onClick={() => setHistory([])}>پاک کردن</button>
            </div>

            <div className="history-strip">
              {history.map((h, i) => (
                <button
                  key={i}
                  className={`history-item ${h === image ? "active" : ""}`}
                  onClick={() => setImage(h)}
                >
                  <img src={h} alt={`history-${i}`} />
                </button>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ============ FULLSCREEN ============ */}
      {fullscreen && image && (
        <div className="fullscreen" onClick={() => setFullscreen(false)}>
          <button className="fullscreen-close" onClick={() => setFullscreen(false)}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
          <img src={image} alt="fullscreen" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {/* ============ TOAST ============ */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          <span className="toast-icon">
            {toast.type === "success" ? "✓" : "!"}
          </span>
          <span>{toast.text}</span>
        </div>
      )}

      {/* ============================================================
         STYLES
      ============================================================ */}
      <style jsx>{`
        * { box-sizing: border-box; }

        /* ============================================================
           PAGE
        ============================================================ */
        .image-page {
          position: relative;
          width: 100%;
          min-height: 100svh;
          overflow-x: hidden;
          direction: rtl;
          color: #fff;
          background: #030407;
          padding: 60px 20px 100px;
          isolation: isolate;
        }

        /* ============================================================
           BACKGROUND LAYERS
        ============================================================ */
        .bg-layer {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }

        .grid-layer {
          background-image:
            linear-gradient(rgba(120, 100, 255, 0.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(120, 100, 255, 0.045) 1px, transparent 1px);
          background-size: 62px 62px;
          mask-image: radial-gradient(ellipse at 50% 30%, black 20%, transparent 75%);
        }

        .noise-layer {
          opacity: 0.15;
          background-image: radial-gradient(rgba(255, 255, 255, 0.35) 0.6px, transparent 0.6px);
          background-size: 3px 3px;
          mix-blend-mode: overlay;
        }

        /* Ambient blobs */
        .ambient {
          position: absolute;
          width: 520px;
          height: 520px;
          border-radius: 50%;
          filter: blur(140px);
          pointer-events: none;
          z-index: 0;
        }

        .ambient-purple {
          top: -240px;
          left: -180px;
          background: rgba(101, 61, 255, 0.5);
          animation: ambient-float 14s ease-in-out infinite;
        }

        .ambient-blue {
          right: -220px;
          bottom: -160px;
          background: rgba(0, 128, 255, 0.42);
          animation: ambient-float 18s ease-in-out infinite reverse;
        }

        .ambient-cyan {
          top: 45%;
          left: 42%;
          width: 420px;
          height: 420px;
          background: rgba(0, 220, 255, 0.14);
          animation: ambient-float 22s ease-in-out infinite;
        }

        @keyframes ambient-float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(40px, -30px) scale(1.08); }
        }

        /* Aurora curves */
        .aurora {
          position: absolute;
          pointer-events: none;
          border-radius: 50%;
          z-index: 0;
        }

        .aurora-one {
          width: 1400px;
          height: 550px;
          left: -360px;
          top: 380px;
          border-top: 1.5px solid rgba(120, 90, 255, 0.75);
          transform: rotate(16deg);
          filter: drop-shadow(0 0 12px rgba(96, 83, 255, 0.7));
          opacity: 0.75;
          animation: aurora-sway 12s ease-in-out infinite;
        }

        .aurora-two {
          width: 1100px;
          height: 460px;
          right: -360px;
          top: 500px;
          border-top: 1.5px solid rgba(76, 162, 255, 0.72);
          transform: rotate(-22deg);
          filter: drop-shadow(0 0 12px rgba(48, 137, 255, 0.65));
          opacity: 0.7;
          animation: aurora-sway 15s ease-in-out infinite reverse;
        }

        .aurora-three {
          width: 1300px;
          height: 480px;
          left: -180px;
          bottom: -50px;
          border-top: 1px solid rgba(90, 120, 255, 0.4);
          transform: rotate(10deg);
          filter: blur(1.4px);
          opacity: 0.5;
        }

        @keyframes aurora-sway {
          0%, 100% { transform: rotate(16deg) translateY(0); }
          50% { transform: rotate(16deg) translateY(-28px); }
        }

        /* Beams */
        .beam {
          position: absolute;
          width: 1px;
          background: linear-gradient(to bottom, transparent, rgba(130, 108, 255, 0.85), transparent);
          opacity: 0.65;
          z-index: 0;
        }

        .beam-one {
          left: 12%;
          top: 22%;
          height: 260px;
          animation: beam-pulse 4s ease-in-out infinite;
        }

        .beam-two {
          right: 14%;
          top: 40%;
          height: 220px;
          animation: beam-pulse 5.4s ease-in-out infinite;
        }

        @keyframes beam-pulse {
          0%, 100% { opacity: 0.25; transform: scaleY(0.9); }
          50% { opacity: 0.9; transform: scaleY(1); }
        }

        /* Particles */
        .particles {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
          z-index: 0;
        }

        .particle {
          position: absolute;
          bottom: -10px;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: #a59bff;
          box-shadow: 0 0 10px rgba(140, 120, 255, 1), 0 0 22px rgba(80, 130, 255, 0.7);
          animation: particle-rise 14s linear infinite;
          opacity: 0;
        }

        .p-0 { animation-duration: 14s; }
        .p-1 { animation-duration: 18s; }
        .p-2 { animation-duration: 12s; background: #7cdcff; }
        .p-3 { animation-duration: 20s; }
        .p-4 { animation-duration: 16s; background: #c4b3ff; }
        .p-5 { animation-duration: 22s; }
        .p-6 { animation-duration: 15s; background: #8db8ff; }
        .p-7 { animation-duration: 19s; }

        @keyframes particle-rise {
          0% { transform: translateY(0) scale(0.4); opacity: 0; }
          15% { opacity: 0.85; }
          85% { opacity: 0.65; }
          100% { transform: translateY(-110vh) scale(1.1); opacity: 0; }
        }

        /* ============================================================
           WRAPPER
        ============================================================ */
        .wrapper {
          position: relative;
          z-index: 5;
          width: min(880px, 100%);
          margin: 0 auto;
        }

        /* ============================================================
           HEADER
        ============================================================ */
        .header {
          text-align: center;
          margin-bottom: 42px;
          animation: fade-up 0.7s ease both;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 14px;
          border-radius: 100px;
          background: rgba(120, 100, 255, 0.08);
          border: 1px solid rgba(140, 120, 255, 0.22);
          font-size: 10px;
          letter-spacing: 3px;
          font-weight: 700;
          color: rgba(190, 175, 255, 0.9);
          direction: ltr;
          margin-bottom: 20px;
          backdrop-filter: blur(12px);
          box-shadow: 0 0 30px rgba(102, 78, 255, 0.15);
        }

        .badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #7c6cff;
          box-shadow: 0 0 10px #7c6cff, 0 0 20px #7c6cff;
          animation: pulse-dot 1.8s ease-in-out infinite;
        }

        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.55; transform: scale(0.7); }
        }

        .title {
          margin: 0;
          font-size: clamp(30px, 5.5vw, 48px);
          font-weight: 850;
          letter-spacing: -1.5px;
          line-height: 1.25;
          color: #fff;
        }

        .title-gradient {
          background: linear-gradient(105deg, #ffffff, #b7a8ff 40%, #5edcff 70%, #ffffff);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradient-shift 6s ease-in-out infinite;
        }

        @keyframes gradient-shift {
          0%, 100% { background-position: 0% center; }
          50% { background-position: 100% center; }
        }

        .subtitle {
          margin: 16px auto 0;
          max-width: 520px;
          color: rgba(255, 255, 255, 0.42);
          font-size: 13.5px;
          line-height: 1.9;
        }

        /* ============================================================
           SECTION
        ============================================================ */
        .section {
          margin-bottom: 22px;
          animation: fade-up 0.7s ease both;
          animation-delay: 0.1s;
        }

        .section-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .section-title {
          font-size: 12px;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.55);
          letter-spacing: 0.5px;
        }

        .section-clear {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.4);
          font-size: 11px;
          font-family: inherit;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .section-clear:hover {
          color: #ff8a8a;
          background: rgba(255, 100, 100, 0.08);
        }

        /* ============================================================
           STYLE CH infiniteIPS
        =;
===========================================================        */
        .styles-row {
          display: }

 flex;
          flex-wrap: wrap;
                 gap @: 8px;
        }

        .style-chip {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 9px 14px;
          border-radius: 100px;
          background: rgba(255, 255, 255, 0.035);
          border: 1px solid rgba(255, 255, 255, 0.09);
          color: rgba(255, 255, 255, 0.72);
          font-family: inherit;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          backdrop-filter: blur(10px);
          transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .style-chip::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: linear-gradient(120deg, rgba(120, 90, 255, 0.4), rgba(90, 210, 255, 0.4));
          opacity: 0;
          transition: opacity 0.25s ease;
        }

        .style-chip:hover {
          border-color: rgba(140, 120, 255, 0.35);
          color: #fff;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(90, 70, 220, 0.18);
        }

        .style-chip.active {
          background: linear-gradient(135deg, rgba(120, 90, 255, 0.28), rgba(90, 180, 255, 0.22));
          border-color: rgba(140, 120, 255, 0.6);
          color: #fff;
          box-shadow: 0 0 24px rgba(120, 90, 255, 0.35), inset 0 1px rgba(255, 255, 255, 0.1);
        }

        .style-chip.active::before { opacity: 0.15; }

        .style-emoji {
          font-size: 14px;
          line-height: 1;
        }

        /* ============================================================
           RATIOS
        ============================================================ */
        .ratios-row {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 8px;
        }

        .ratio-chip {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 12px 8px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.65);
          font-family: inherit;
          font-size: 10px;
          cursor: pointer;
          backdrop-filter: blur(10px);
          transition: all 0.22s ease;
        }

        .ratio-chip:hover {
          border-color: rgba(140, 120, 255, 0.32);
          color: #fff;
          transform: translateY(-2px);
        }

        .ratio-chip.active {
          background: linear-gradient(135deg, rgba(120, 90, 255, 0.22), rgba(90, 180, 255, 0.18));
          border-color: rgba(140, 120, 255, 0.55);
          color: #fff;
          box-shadow: 0 0 20px rgba(120, 90, 255, 0.3);
        }

        .ratio-preview {
          display: block;
          border-radius: 4px;
          background: rgba(180, 165, 255, 0.5);
          border: 1.5px solid rgba(180, 165, 255, 0.85);
          transition: all 0.22s ease;
        }

        .ratio-chip.active .ratio-preview {
          background: linear-gradient(135deg, #8b78ff, #5edcff);
          border-color: #fff;
          box-shadow: 0 0 14px rgba(140, 120, 255, 0.8);
        }

        .ratio-label {
          font-weight: 700;
          font-size: 11px;
        }

        .ratio-value {
          font-size: 9px;
          color: rgba(255, 255, 255, 0.35);
          direction: ltr;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        /* ============================================================
           PROMPT BOX
        ============================================================ */
        .prompt-section {
          position: relative;
          margin-bottom: 20px;
          animation: fade-up 0.7s ease both;
          animation-delay: 0.15s;
        }

        .prompt-glow {
          position: absolute;
          inset: -20px;
          border-radius: 40px;
          background: radial-gradient(ellipse at center, rgba(120, 90, 255, 0.22), transparent 60%);
          filter: blur(30px);
          pointer-events: none;
          opacity: 0.7;
        }

        .prompt-box {
          position: relative;
          width: 100%;
          min-height: 210px;
          border-radius: 22px;
          background: linear-gradient(135deg, rgba(18, 21, 31, 0.88), rgba(7, 9, 14, 0.82));
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 16px 16px 14px;
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          box-shadow:
            0 30px 100px rgba(0, 0, 0, 0.55),
            inset 0 1px rgba(255, 255, 255, 0.05),
            0 0 55px rgba(37, 55, 120, 0.08);
          transition: border-color 0.25s ease, box-shadow 0.25s ease;
          overflow: hidden;
        }

        .prompt-box::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          pointer-events: none;
          background: linear-gradient(115deg, rgba(95, 74, 255, 0.08), transparent 35%, transparent 70%, rgba(0, 176, 255, 0.08));
        }

        .prompt-box:focus-within {
          border-color: rgba(128, 111, 255, 0.4);
          box-shadow:
            0 30px 100px rgba(0, 0, 0, 0.58),
            0 0 55px rgba(82, 76, 255, 0.14),
            inset 0 1px rgba(255, 255, 255, 0.06);
        }

        .prompt-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
          padding: 0 4px;
        }

        .prompt-dots {
          display: flex;
          gap: 5px;
        }

        .dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
        }

        .dot-red { background: #ff5f56; box-shadow: 0 0 8px rgba(255, 95, 86, 0.5); }
        .dot-yellow { background: #ffbd2e; box-shadow: 0 0 8px rgba(255, 189, 46, 0.5); }
        .dot-green { background: #27c93f; box-shadow: 0 0 8px rgba(39, 201, 63, 0.5); }

        .prompt-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 2.5px;
          color: rgba(255, 255, 255, 0.25);
          direction: ltr;
        }

        .prompt-box textarea {
          position: relative;
          z-index: 2;
          width: 100%;
          height: 130px;
          resize: none;
          border: none;
          outline: none;
          background: transparent;
          color: #fff;
          font-family: inherit;
          font-size: 15px;
          line-height: 1.9;
          padding: 6px;
          direction: rtl;
        }

        .prompt-box textarea::placeholder {
          color: rgba(255, 255, 255, 0.32);
          opacity: 1;
          white-space: pre-line;
        }

        .prompt-box textarea:disabled { opacity: 0.55; }

        .prompt-footer {
          position: relative;
          z-index: 3;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 4px 0;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          margin-top: 6px;
        }

        .prompt-footer-left {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .mini-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 11px;
          border-radius: 10px;
          border: 1px solid rgba(140, 120, 255, 0.2);
          background: rgba(120, 90, 255, 0.08);
          color: rgba(200, 185, 255, 0.9);
          font-family: inherit;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .mini-btn:hover:not(:disabled) {
          background: rgba(120, 90, 255, 0.18);
          border-color: rgba(140, 120, 255, 0.45);
          color: #fff;
          box-shadow: 0 0 16px rgba(120, 90, 255, 0.25);
        }

        .mini-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .mini-btn.ghost {
          padding: 7px 9px;
          background: rgba(255, 100, 100, 0.06);
          border-color: rgba(255, 100, 100, 0.15);
          color: rgba(255, 150, 150, 0.75);
        }

        .mini-btn.ghost:hover:not(:disabled) {
          background: rgba(255, 100, 100, 0.14);
          border-color: rgba(255, 100, 100, 0.35);
          color: #ff9b9b;
          box-shadow: 0 0 16px rgba(255, 100, 100, 0.2);
        }

        .counter {
          font-size: 10.5px;
          color: rgba(255, 255, 255, 0.3);
          direction: ltr;
          font-weight: 600;
          transition: color 0.2s ease;
        }

        .counter.warn { color: #ffb16b; }

        .prompt-sweep {
          position: absolute;
          top: 0;
          left: -60%;
          width: 40%;
          height: 100%;
          background: linear-gradient(115deg, transparent, rgba(180, 165, 255, 0.08), transparent);
          pointer-events: none;
          animation: sweep 5s ease-in-out infinite;
        }

        @keyframes sweep {
          0% { left: -60%; }
          60%, 100% { left: 130%; }
        }

        /* ============================================================
           SUGGESTIONS
        ============================================================ */
        .suggestions {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 22px;
          animation: fade-up 0.7s ease both;
          animation-delay: 0.2s;
        }

        .suggestions-label {
          flex-shrink: 0;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.4);
          padding-top: 7px;
        }

        .suggestions-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .suggestion {
          padding: 7px 12px;
          border-radius: 100px;
          background: rgba(255, 255, 255, 0.035);
          border: 1px solid rgba(255, 255, 255, 0.07);
          color: rgba(255, 255, 255, 0.6);
          font-family: inherit;
          font-size: 11.5px;
          cursor: pointer;
          transition: all 0.2s ease;
          backdrop-filter: blur(8px);
        }

        .suggestion:hover {
          background: rgba(120, 90, 255, 0.12);
          border-color: rgba(140, 120, 255, 0.3);
          color: #fff;
          transform: translateY(-1px);
        }

        /* ============================================================
           GENERATE BUTTON
        ============================================================ */
        .action-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          margin-bottom: 26px;
          animation: fade-up 0.7s ease both;
          animation-delay: 0.25s;
        }

        .generate-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 0 36px;
          height: 54px;
          border-radius: 16px;
          border: none;
          background: linear-gradient(145deg, #2a2a3a, #1a1a24);
          color: rgba(255, 255, 255, 0.5);
          font-family: inherit;
          font-size: 14.5px;
          font-weight: 700;
          letter-spacing: 0.3px;
          cursor: not-allowed;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }

        .generate-btn.ready {
          background: linear-gradient(135deg, #755bff 0%, #5b42e7 45%, #4933c8 100%);
          color: #fff;
          cursor: pointer;
          box-shadow:
            0 10px 34px rgba(93, 66, 238, 0.42),
            inset 0 1px rgba(255, 255, 255, 0.18);
        }

        .generate-btn.ready:hover {
          transform: translateY(-2px);
          box-shadow:
            0 14px 44px rgba(93, 66, 238, 0.55),
            0 0 60px rgba(120, 90, 255, 0.35),
            inset 0 1px rgba(255, 255, 255, 0.22);
        }

        .generate-btn.ready:active {
          transform: scale(0.97);
        }

        .generate-btn:disabled {
          cursor: not-allowed;
        }

        .generate-glow {
          position: absolute;
          inset: -2px;
          border-radius: 18px;
          background: conic-gradient(
            from 0deg,
            transparent 0deg,
            transparent 30deg,
            rgba(120, 90, 255, 0.9) 80deg,
            rgba(90, 210, 255, 1) 120deg,
            rgba(120, 90, 255, 0.9) 160deg,
            transparent 210deg,
            transparent 360deg
          );
          filter: blur(6px);
          opacity: 0;
          z-index: -1;
          transition: opacity 0.3s ease;
        }

        .generate-btn.ready .generate-glow {
          opacity: 0.75;
          animation: glow-rotate 3s linear infinite;
        }

        @keyframes glow-rotate {
          to { transform: rotate(360deg); }
        }

        .hint {
          display: flex;
          align-items: center;
          gap: 6px;
          margin: 0;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.32);
        }

        .hint kbd {
          display: inline-block;
          padding: 2px 7px;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          font-family: inherit;
          font-size: 10px;
          direction: ltr;
        }

        .spinner {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.25);
          border-top-color: #fff;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* ============================================================
           LOADING STATE
        ============================================================ */
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 40px 20px;
          margin-bottom: 30px;
          animation: fade-up 0.5s ease both;
        }

        .orb {
          position: relative;
          width: 130px;
          height: 130px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 26px;
        }

        .orb-core {
          position: relative;
          width: 58px;
          height: 58px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.95);
          background: linear-gradient(145deg, #806cff, #4935d0);
          box-shadow:
            0 0 30px rgba(112, 91, 255, 0.65),
            0 0 70px rgba(83, 105, 255, 0.3),
            inset 0 1px rgba(255, 255, 255, 0.22);
          animation: core-pulse 1.8s ease-in-out infinite;
          z-index: 3;
        }

        .orb-core svg {
          animation: core-rotate 3s linear infinite;
        }

        @keyframes core-rotate {
          to { transform: rotate(360deg); }
        }

        @keyframes core-pulse {
          0%, 100% {
            transform: scale(0.94);
            box-shadow:
              0 0 22px rgba(112, 91, 255, 0.5),
              0 0 50px rgba(83, 105, 255, 0.2),
              inset 0 1px rgba(255, 255, 255, 0.2);
          }
          50% {
            transform: scale(1.08);
            box-shadow:
              0 0 40px rgba(112, 91, 255, 0.8),
              0 0 90px rgba(83, 105, 255, 0.4),
              inset 0 1px rgba(255, 255, 255, 0.28);
          }
        }

        .orb-ring {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(126, 108, 255, 0.2);
          pointer-events: none;
        }

        .ring-a {
          width: 82px;
          height: 82px;
          border-top-color: rgba(126, 108, 255, 0.95);
          border-right-color: rgba(92, 207, 255, 0.8);
          animation: spin 1.4s linear infinite;
        }

        .ring-b {
          width: 105px;
          height: 105px;
          border-bottom-color: rgba(93, 103, 255, 0.85);
          border-left-color: rgba(103, 210, 255, 0.6);
          animation: spin-rev 2.1s linear infinite;
        }

        .ring-c {
          width: 128px;
          height: 128px;
          border-top-color: rgba(113, 91, 255, 0.5);
          border-bottom-color: rgba(65, 174, 255, 0.35);
          animation: spin 3.2s linear infinite;
        }

        @keyframes spin-rev {
          to { transform: rotate(-360deg); }
        }

        .loading-title {
          font-size: 15px;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.92);
          margin-bottom: 6px;
          text-shadow: 0 0 20px rgba(119, 100, 255, 0.35);
        }

        .loading-sub {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.4);
          margin-bottom: 24px;
        }

        .progress-track {
          width: min(320px, 100%);
          height: 4px;
          border-radius: 100px;
          background: rgba(255, 255, 255, 0.07);
          overflow: hidden;
          position: relative;
        }

        .progress-fill {
          height: 100%;
          border-radius: 100px;
          background: linear-gradient(90deg, #755bff, #5edcff);
          box-shadow: 0 0 18px rgba(120, 90, 255, 0.8);
          transition: width 0.4s ease;
          position: relative;
        }

        .progress-fill::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
          animation: shimmer 1.4s linearkeyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .loading-stages {
          display: flex;
          gap: 16px;
          margin-top: 18px;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.28);
        }

        .loading-stages span {
          transition: color 0.4s ease;
          position: relative;
        }

        .loading-stages span.done {
          color: rgba(140, 200, 255, 0.9);
          text-shadow: 0 0 12px rgba(120, 180, 255, 0.5);
        }

        /* ============================================================
           ERROR
        ============================================================ */
        .error-message {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px 18px;
          border-radius: 14px;
          background: rgba(255, 70, 70, 0.08);
          border: 1px solid rgba(255, 70, 70, 0.18);
          color: #ff9b9b;
          font-size: 12.5px;
          margin-bottom: 20px;
          animation: fade-up 0.4s ease both;
        }

        /* ============================================================
           RESULT
        ============================================================ */
        .result {
          margin-bottom: 28px;
          animation: result-enter 0.55s cubic-bezier(0.4, 0, 0.2, 1) both;
        }

        @keyframes result-enter {
          from { opacity: 0; transform: translateY(22px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .result-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
          padding: 0 4px;
        }

        .result-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.85);
        }

        .result-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #4ad07a;
          box-shadow: 0 0 12px #4ad07a;
          animation: pulse-dot 2s ease-in-out infinite;
        }

        .result-time {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.35);
        }

        .image-card {
          position: relative;
          width: 100%;
          overflow: hidden;
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow:
            0 30px 90px rgba(0, 0, 0, 0.5),
            0 0 60px rgba(120, 90, 255, 0.12);
          cursor: zoom-in;
          transition: transform 0.4s ease, box-shadow 0.4s ease;
        }

        .image-card:hover {
          transform: translateY(-3px);
          box-shadow:
            0 40px 110px rgba(0, 0, 0, 0.6),
            0 0 80px rgba(120, 90, 255, 0.22);
        }

        .image-card img {
          display: block;
          width: 100%;
          height: auto;
        }

        .image-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(5, 5, 15, 0);
          transition: background 0.3s ease;
        }

        .image-card:hover .image-overlay {
          background: rgba(5, 5, 15, 0.35);
        }

        .overlay-hint {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: 100px;
          background: rgba(0, 0, 0, 0.55);
          border: 1px solid rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(12px);
          color: #fff;
          font-size: 12px;
          font-weight: 600;
          opacity: 0;
          transform: translateY(6px);
          transition: all 0.3s ease;
        }

        .image-card:hover .overlay-hint {
          opacity: 1;
          transform: translateY(0);
        }

        .image-actions {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 8px;
          margin-top: 14px;
        }

        .action {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 10px 16px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.04);
          color: rgba(255, 255, 255, 0.78);
          font-family: inherit;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          backdrop-filter: blur(10px);
          transition: all 0.22s ease;
        }

        .action:hover:not(:disabled) {
          background: rgba(120, 90, 255, 0.14);
          border-color: rgba(140, 120, 255, 0.4);
          color: #fff;
          transform: translateY(-2px);
          box-shadow: 0 8px 22px rgba(120, 90, 255, 0.24);
        }

        .action:active:not(:disabled) {
          transform: scale(0.96);
        }

        .action:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        /* ============================================================
           HISTORY
        ============================================================ */
        .history {
          animation: fade-up 0.6s ease both;
        }

        .history-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
          padding: 0 4px;
        }

        .history-strip {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          padding: 4px 2px 10px;
          scrollbar-width: thin;
          scrollbar-color: rgba(120, 90, 255, 0.35) transparent;
        }

        .history-strip::-webkit-scrollbar {
          height: 5px;
        }

        .history-strip::-webkit-scrollbar-thumb {
          background: rgba(120, 90, 255, 0.35);
          border-radius: 100px;
        }

        .history-item {
          flex-shrink: 0;
          width: 92px;
          height: 92px;
          padding: 0;
          border-radius: 14px;
          overflow: hidden;
          border: 1.5px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.03);
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .history-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .history-item:hover {
          border-color: rgba(140, 120, 255, 0.5);
          transform: translateY(-3px) scale(1.03);
          box-shadow: 0 10px 26px rgba(120, 90, 255, 0.28);
        }

        .history-item.active {
          border-color: #8b78ff;
          box-shadow: 0 0 24px rgba(140, 120, 255, 0.5);
        }

        /* ============================================================
           FULLSCREEN
        ============================================================ */
        .fullscreen {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: rgba(3, 4, 8, 0.92);
          backdrop-filter: blur(24px);
          animation: fade-in 0.3s ease both;
          cursor: zoom-out;
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .fullscreen img {
          max-width: 100%;
          max-height: 100%;
          border-radius: 16px;
          box-shadow: 0 40px 120px rgba(0, 0, 0, 0.7), 0 0 80px rgba(120, 90, 255, 0.25);
          animation: zoom-in 0.35s cubic-bezier(0.4, 0, 0.2, 1) both;
          cursor: default;
        }

        @keyframes zoom-in {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }

        .fullscreen-close {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.15);
          background: rgba(255, 255, 255, 0.06);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          backdrop-filter: blur(12px);
          transition: all 0.2s ease;
        }

        .fullscreen-close:hover {
          background: rgba(255, 90, 90, 0.2);
          border-color: rgba(255, 90, 90, 0.5);
          transform: rotate(90deg);
        }

        /* ============================================================
           TOAST
        ============================================================ */
        .toast {
          position: fixed;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 20px;
          border-radius: 14px;
          font-family: inherit;
          font-size: 13px;
          font-weight: 600;
          color: #fff;
          backdrop-filter: blur(20px);
          animation: toast-in 0.35s cubic-bezier(0.4, 0, 0.2, 1) both;
          z-index: 200;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
        }

        .toast.success {
          background: rgba(30, 200, 100, 0.18);
          border: 1px solid rgba(60, 220, 130, 0.4);
          box-shadow: 0 12px 40px rgba(0, 200, 100, 0.2);
        }

        .toast.error {
          background: rgba(255, 70, 70, 0.18);
          border: 1px solid rgba(255, 90, 90, 0.4);
          box-shadow: 0 12px 40px rgba(255, 70, 70, 0.2);
        }

        .toast-icon {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 800;
          background: rgba(255, 255, 255, 0.15);
        }

        @keyframes toast-in {
          from { opacity: 0; transform: translate(-50%, 30px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }

        /* ============================================================
           FADE UP
        ============================================================ */
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ============================================================
           MOBILE
        ============================================================ */
        @media (max-width: 640px) {
          .image-page { padding: 40px 14px 80px; }

          .header { margin-bottom: 32px; }
          .badge { font-size: 9px; letter-spacing: 2.5px; padding: 6px 12px; }
          .title { font-size: 28px; letter-spacing: -1px; }
          .subtitle { font-size: 12.5px; margin-top: 12px; }

          .ratios-row { grid-template-columns: repeat(5, 1fr); gap: 6px; }
          .ratio-chip { padding: 10px 4px; }
          .ratio-label { font-size: 10px; }
          .ratio-value { font-size: 8.5px; }

          .style-chip { padding: 8px 12px; font-size: 11.5px; }

          .prompt-box { min-height: 190px; border-radius: 18px; padding: 12px; }
          .prompt-box textarea { height: 118px; font-size: 14px; }
          .prompt-footer { padding: 8px 2px 0; }
          .mini-btn { padding: 6px 9px; font-size: 10.5px; }

          .suggestions { flex-direction: column; gap: 8px; }
          .suggestions-label { padding-top: 0; }

          .generate-btn { height: 50px; padding: 0 28px; font-size: 14px; }

          .orb { transform: scale(0.9); }

          .image-actions { gap: 6px; }
          .action { padding: 9px 12px; font-size: 11.5px; }

          .history-item { width: 78px; height: 78px; }

          .fullscreen-close { top: 14px; right: 14px; width: 40px; height: 40px; }
        }
      `}</style>
    </main>
  );
}
