"use client";

import { useEffect, useState } from "react";

export default function ImagePage() {
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadingStage, setLoadingStage] = useState(0);

  const stages = [
    "دارم ایده‌تو می‌گیرم...",
    "دارم صحنه رو می‌سازم...",
    "نور و جزئیات رو اضافه می‌کنم...",
    "تقریباً آماده‌ست...",
  ];

  const examples = [
    {
      title: "سینمایی",
      text: "یک شهر آینده‌نگر در شب، خیابان خیس، نورهای نئونی بنفش و آبی، فضای سینمایی و واقع‌گرایانه",
    },
    {
      title: "فانتزی",
      text: "یک قلعه شناور بالای ابرها، غروب طلایی، جزئیات جادویی، فضای رویایی و باشکوه",
    },
    {
      title: "محصول",
      text: "یک محصول تکنولوژی مدرن روی میز شیشه‌ای، نور استودیویی حرفه‌ای، پس‌زمینه مینیمال و لوکس",
    },
    {
      title: "پرتره",
      text: "پرتره سینمایی یک شخصیت مرموز، نور نرم از کنار، پس‌زمینه تاریک، جزئیات بسیار بالا",
    },
  ];

  useEffect(() => {
    if (!loading) {
      setLoadingStage(0);
      return;
    }

    const timer = window.setInterval(() => {
      setLoadingStage((current) =>
        current < stages.length - 1 ? current + 1 : current
      );
    }, 2200);

    return () => window.clearInterval(timer);
  }, [loading]);

  const generateImage = async (retryPrompt?: string) => {
    const finalPrompt = (retryPrompt ?? prompt).trim();

    if (!finalPrompt || loading) return;

    setLoading(true);
    setError("");
    setImage(null);
    setLoadingStage(0);

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
        throw new Error(data.error || "ساخت تصویر با خطا مواجه شد.");
      }

      setImage(data.image);
    } catch (err: any) {
      setError(
        err?.message || "یه مشکلی پیش اومد، دوباره امتحان کن."
      );
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
      setError("دانلود تصویر انجام نشد. دوباره امتحان کن.");
    }
  };

  const retryImage = () => {
    if (!prompt.trim() || loading) return;
    generateImage(prompt);
  };

  const useExample = (text: string) => {
    if (loading) return;
    setPrompt(text);
    setError("");
    setImage(null);
  };

  const clearPrompt = () => {
    if (loading) return;
    setPrompt("");
    setError("");
    setImage(null);
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      generateImage();
    }
  };

  return (
    <main className="image-page">
      <div className="background-grid" />
      <div className="space-noise" />

      <div className="ambient ambient-purple" />
      <div className="ambient ambient-blue" />
      <div className="ambient ambient-cyan" />

      <div className="aurora aurora-one" />
      <div className="aurora aurora-two" />
      <div className="aurora aurora-three" />

      <div className="floating-orb orb-one" />
      <div className="floating-orb orb-two" />
      <div className="floating-orb orb-three" />

      <div className="light-line line-one"><span /></div>
      <div className="light-line line-two"><span /></div>
      <div className="light-line line-three"><span /></div>

      <div className="image-wrapper">
        <header className="image-header">
          <div className="brand-pill">
            <span className="brand-dot" />
            <span>MOBIXA</span>
            <i>IMAGE LAB</i>
          </div>

          <div className="hero-icon">
            <div className="hero-icon-ring ring-a" />
            <div className="hero-icon-ring ring-b" />
            <div className="hero-icon-core">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 18.5 9.2 13l3.1 3.1L16 12l4 4.5" />
                <circle cx="8" cy="8" r="2.2" />
              </svg>
            </div>
          </div>

          <h1>
            ایده بده،
            <span> تصویر بساز.</span>
          </h1>

          <p>
            چیزی که توی ذهنت هست رو بنویس؛
            <br className="desktop-break" />
            موبیکسا تبدیلش می‌کنه به یک تصویر واقعی.
          </p>

          <div className="hero-meta">
            <span><b /> آماده برای خلق</span>
            <span className="meta-separator" />
            <span>فقط با یک ایده</span>
          </div>
        </header>

        <section className={`creator-shell ${loading ? "is-loading" : ""}`}>
          <div className="shell-topline">
            <div className="prompt-title">
              <span className="sparkle-small">✦</span>
              <span>ایده‌ی تصویرت</span>
            </div>

            <button
              className="clear-button"
              onClick={clearPrompt}
              disabled={!prompt || loading}
              type="button"
            >
              پاک کردن
            </button>
          </div>

          <div className="prompt-area">
            <div className="prompt-glow" />

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`مثلاً:
یک ربات کوچک در یک کافه‌ی نئونی در تهران،
شب بارانی، نور سینمایی، واقع‌گرایانه و پرجزئیات`}
              maxLength={2048}
              disabled={loading}
              aria-label="توضیح تصویر"
            />

            <div className="prompt-bottom">
              <div className="prompt-hint">
                <span className="keyboard-key">⌘</span>
                <span>+</span>
                <span className="keyboard-key">Enter</span>
                <span>برای ساخت سریع</span>
              </div>

              <div className="counter">
                {prompt.length}
                <span>/2048</span>
              </div>
            </div>
          </div>

          <div className="idea-strip">
            <div className="idea-strip-title">
              <span>برای شروع</span>
              <small>یک ایده انتخاب کن</small>
            </div>

            <div className="idea-list">
              {examples.map((example) => (
                <button
                  key={example.title}
                  type="button"
                  className="idea-chip"
                  onClick={() => useExample(example.text)}
                  disabled={loading}
                >
                  <span className="chip-spark">✦</span>
                  {example.title}
                </button>
              ))}
            </div>
          </div>

          <button
            className={`generate-button ${prompt.trim() ? "active" : ""}`}
            onClick={() => generateImage()}
            disabled={!prompt.trim() || loading}
            type="button"
          >
            <span className="generate-button-shine" />

            <span className="generate-content">
              {loading ? (
                <>
                  <span className="button-loader">
                    <span />
                    <span />
                    <span />
                  </span>
                  <span>در حال خلق تصویر...</span>
                </>
              ) : (
                <>
                  <span className="wand-icon">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="m15 4 1.1 2.9L19 8l-2.9 1.1L15 12l-1.1-2.9L11 8l2.9-1.1L15 4Z" />
                      <path d="m7 12 .8 2.2L10 15l-2.2.8L7 18l-.8-2.2L4 15l2.2-.8L7 12Z" />
                      <path d="m19 14 .7 1.8L21.5 16l-1.8.7L19 18.5l-.7-1.8-1.8-.7 1.8-.7L19 14Z" />
                    </svg>
                  </span>
                  <span>ساخت تصویر</span>
                  <span className="arrow-icon">←</span>
                </>
              )}
            </span>
          </button>

          <div className="creator-footer">
            <span><i /> ایده‌ات خصوصی می‌مونه</span>
            <span>حداکثر ۲۰۴۸ کاراکتر</span>
          </div>
        </section>

        {loading && (
          <section className="generation-panel">
            <div className="generation-visual">
              <div className="visual-ring visual-ring-one" />
              <div className="visual-ring visual-ring-two" />
              <div className="visual-ring visual-ring-three" />

              <div className="generation-core">
                <div className="core-stars">
                  <span>✦</span>
                  <span>✧</span>
                  <span>✦</span>
                </div>

                <div className="core-square">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M5 18 10.2 12.7l3.1 3.1L17 12l2 2" />
                    <circle cx="9" cy="8" r="1.6" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="generation-copy">
              <div className="generation-label">
                {stages[loadingStage]}
              </div>

              <div className="generation-subtitle">
                موبیکسا داره ایده‌تو به تصویر تبدیل می‌کنه
              </div>

              <div className="generation-progress">
                <span className="progress-track">
                  <span
                    className="progress-fill"
                    style={{
                      width: `${Math.min(
                        28 + loadingStage * 22,
                        92
                      )}%`,
                    }}
                  />
                </span>
                <span className="progress-dots">
                  <i className={loadingStage >= 0 ? "on" : ""} />
                  <i className={loadingStage >= 1 ? "on" : ""} />
                  <i className={loadingStage >= 2 ? "on" : ""} />
                  <i className={loadingStage >= 3 ? "on" : ""} />
                </span>
              </div>
            </div>
          </section>
        )}

        {error && (
          <div className="error-message" role="alert">
            <div className="error-icon">!</div>
            <div>
              <strong>یه چیزی درست پیش نرفت</strong>
              <span>{error}</span>
            </div>
          </div>
        )}

        {image && !loading && (
          <section className="result">
            <div className="result-heading">
              <div>
                <span className="result-kicker">YOUR CREATION</span>
                <h2>اینم چیزی که ساختی ✦</h2>
              </div>

              <div className="result-status">
                <span />
                ساخته شد
              </div>
            </div>

            <div className="image-card">
              <div className="image-card-glow" />
              <div className="image-frame">
                <img
                  src={image}
                  alt="تصویر ساخته شده توسط موبیکسا"
                />
              </div>

              <div className="image-overlay">
                <span>AI CREATION</span>
              </div>
            </div>

            <div className="image-actions">
              <button
                className="action-primary"
                onClick={downloadImage}
                type="button"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 3v12" />
                  <path d="m7 10 5 5 5-5" />
                  <path d="M5 21h14" />
                </svg>
                <span>دانلود تصویر</span>
              </button>

              <button
                className="action-secondary"
                onClick={retryImage}
                disabled={loading}
                type="button"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20 11a8.1 8.1 0 0 0-15.5-2" />
                  <path d="M4 4v5h5" />
                  <path d="M4 13a8.1 8.1 0 0 0 15.5 2" />
                  <path d="M20 20v-5h-5" />
                </svg>
                <span>دوباره بساز</span>
              </button>
            </div>

            <div className="result-note">
              <span>✦</span>
              از همین ایده دوباره استفاده کن و نتیجه‌ی جدید بگیر.
            </div>
          </section>
        )}

        {!loading && !image && !error && (
          <section className="empty-showcase">
            <div className="showcase-line">
              <span />
              <small>اینجا قراره ایده‌هات زنده بشن</small>
              <span />
            </div>

            <div className="mini-cards">
              <div className="mini-card mini-card-one">
                <span className="mini-icon">✦</span>
                <strong>تصور کن</strong>
                <small>هر چیزی که توی ذهنت هست</small>
              </div>

              <div className="mini-card mini-card-two">
                <span className="mini-icon">◌</span>
                <strong>توصیف کن</strong>
                <small>با چند کلمه ساده</small>
              </div>

              <div className="mini-card mini-card-three">
                <span className="mini-icon">⌁</span>
                <strong>خلق کن</strong>
                <small>و نتیجه رو ببین</small>
              </div>
            </div>
          </section>
        )}

        <footer className="image-footer">
          <span>Designed &amp; Developed by Benyamin</span>
          <span className="footer-mark">MOBIXA AI</span>
        </footer>
      </div>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .image-page {
          position: relative;
          min-height: 100svh;
          width: 100%;
          overflow-x: hidden;
          direction: rtl;
          color: #fff;
          background:
            radial-gradient(
              ellipse at 50% -15%,
              rgba(111, 78, 255, 0.2),
              transparent 43%
            ),
            radial-gradient(
              ellipse at 0% 55%,
              rgba(45, 107, 255, 0.11),
              transparent 36%
            ),
            radial-gradient(
              ellipse at 100% 75%,
              rgba(0, 213, 255, 0.07),
              transparent 35%
            ),
            #030408;
          padding: 34px 18px 55px;
          isolation: isolate;
        }

        .background-grid {
          position: fixed;
          inset: 0;
          z-index: -5;
          pointer-events: none;
          opacity: 0.2;
          background-image:
            linear-gradient(
              rgba(133, 113, 255, 0.035) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(133, 113, 255, 0.035) 1px,
              transparent 1px
            );
          background-size: 64px 64px;
          mask-image: linear-gradient(
            to bottom,
            black,
            transparent 90%
          );
        }

        .space-noise {
          position: fixed;
          inset: 0;
          z-index: -4;
          pointer-events: none;
          opacity: 0.11;
          background-image: radial-gradient(
            rgba(255, 255, 255, 0.28) 0.65px,
            transparent 0.65px
          );
          background-size: 86px 86px;
          mask-image: linear-gradient(
            to bottom,
            black,
            transparent 88%
          );
        }

        .ambient {
          position: fixed;
          z-index: -3;
          width: 480px;
          height: 480px;
          border-radius: 50%;
          filter: blur(130px);
          pointer-events: none;
          animation: ambient-float 12s ease-in-out infinite alternate;
        }

        .ambient-purple {
          top: -290px;
          left: -170px;
          opacity: 0.22;
          background: rgba(100, 72, 255, 0.75);
        }

        .ambient-blue {
          right: -250px;
          bottom: -220px;
          opacity: 0.16;
          animation-delay: -4s;
          background: rgba(28, 125, 255, 0.65);
        }

        .ambient-cyan {
          width: 320px;
          height: 320px;
          right: 34%;
          top: 33%;
          opacity: 0.05;
          filter: blur(110px);
          animation-delay: -7s;
          background: #39d8ff;
        }

        .aurora {
          position: fixed;
          z-index: -2;
          pointer-events: none;
          border-radius: 50%;
          opacity: 0.5;
          border-top: 1px solid rgba(118, 98, 255, 0.42);
          filter: drop-shadow(0 0 12px rgba(100, 91, 255, 0.22));
          animation: aurora-drift 14s ease-in-out infinite alternate;
        }

        .aurora-one {
          width: 1200px;
          height: 500px;
          left: -350px;
          top: 32%;
          transform: rotate(18deg);
        }

        .aurora-two {
          width: 1050px;
          height: 420px;
          right: -370px;
          top: 47%;
          border-top-color: rgba(58, 176, 255, 0.38);
          transform: rotate(-22deg);
          animation-delay: -5s;
        }

        .aurora-three {
          width: 1100px;
          height: 450px;
          left: -180px;
          bottom: -40px;
          border-top-color: rgba(104, 88, 255, 0.18);
          animation-delay: -9s;
        }

        .floating-orb {
          position: fixed;
          z-index: -1;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          pointer-events: none;
          background: #9b8fff;
          box-shadow:
            0 0 8px rgba(123, 110, 255, 0.95),
            0 0 22px rgba(75, 112, 255, 0.7);
          animation: orb-float 6s ease-in-out infinite;
        }

        .orb-one {
          left: 8%;
          top: 34%;
        }

        .orb-two {
          right: 11%;
          top: 58%;
          animation-delay: -2s;
        }

        .orb-three {
          right: 27%;
          top: 20%;
          opacity: 0.5;
          animation-delay: -4s;
        }

        .light-line {
          position: fixed;
          z-index: -1;
          width: 1px;
          pointer-events: none;
          opacity: 0.35;
          background: linear-gradient(
            to bottom,
            transparent,
            rgba(125, 105, 255, 0.75),
            transparent
          );
        }

        .light-line span {
          position: absolute;
          width: 4px;
          height: 4px;
          left: -1.5px;
          border-radius: 50%;
          background: #a49aff;
          box-shadow:
            0 0 9px #786dff,
            0 0 22px rgba(55, 155, 255, 0.75);
          animation: light-travel 4s linear infinite;
        }

        .line-one {
          left: 7%;
          top: 28%;
          height: 190px;
        }

        .line-two {
          right: 9%;
          top: 48%;
          height: 210px;
        }

        .line-three {
          right: 18%;
          bottom: 15%;
          height: 140px;
          opacity: 0.2;
        }

        .line-three span {
          animation-delay: -2s;
        }

        .image-wrapper {
          position: relative;
          z-index: 5;
          width: min(900px, 100%);
          margin: 0 auto;
        }

        .image-header {
          text-align: center;
          padding: 8px 0 28px;
          animation: hero-enter 0.8s ease both;
        }

        .brand-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          height: 30px;
          padding: 0 13px;
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.035);
          box-shadow:
            inset 0 1px rgba(255, 255, 255, 0.06),
            0 10px 30px rgba(0, 0, 0, 0.16);
          color: rgba(255, 255, 255, 0.65);
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 2.5px;
          direction: ltr;
          backdrop-filter: blur(14px);
        }

        .brand-pill i {
          color: rgba(155, 139, 255, 0.75);
          font-style: normal;
          font-size: 8px;
          letter-spacing: 2px;
        }

        .brand-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #8f7dff;
          box-shadow: 0 0 11px #7766ff;
          animation: dot-pulse 1.8s ease-in-out infinite;
        }

        .hero-icon {
          position: relative;
          width: 64px;
          height: 64px;
          margin: 22px auto 18px;
          display: grid;
          place-items: center;
        }

        .hero-icon-ring {
          position: absolute;
          inset: 0;
          border: 1px solid rgba(126, 107, 255, 0.16);
          border-radius: 20px;
          transform: rotate(45deg);
        }

        .ring-a {
          animation: hero-ring 8s linear infinite;
        }

        .ring-b {
          inset: 7px;
          border-color: rgba(56, 203, 255, 0.14);
          animation: hero-ring-reverse 7s linear infinite;
        }

        .hero-icon-core {
          position: relative;
          width: 43px;
          height: 43px;
          display: grid;
          place-items: center;
          border-radius: 14px;
          background:
            linear-gradient(
              145deg,
              rgba(124, 103, 255, 0.95),
              rgba(56, 159, 255, 0.62)
            );
          border: 1px solid rgba(255, 255, 255, 0.16);
          box-shadow:
            0 0 35px rgba(105, 87, 255, 0.35),
            inset 0 1px rgba(255, 255, 255, 0.25);
          animation: core-breathe 2.7s ease-in-out infinite;
        }

        .hero-icon-core svg {
          width: 21px;
          height: 21px;
          fill: none;
          stroke: rgba(255, 255, 255, 0.95);
          stroke-width: 1.6;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .image-header h1 {
          margin: 0;
          font-size: clamp(35px, 7vw, 59px);
          line-height: 1.2;
          letter-spacing: -2.2px;
          font-weight: 900;
        }

        .image-header h1 span {
          background: linear-gradient(
            105deg,
            #ffffff 10%,
            #b7a7ff 45%,
            #5edcff 72%,
            #ffffff 95%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          background-size: 180% auto;
          animation: gradient-flow 5s linear infinite;
        }

        .image-header p {
          margin: 15px auto 0;
          color: rgba(255, 255, 255, 0.42);
          font-size: 13px;
          line-height: 2;
          max-width: 570px;
        }

        .hero-meta {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 12px;
          margin-top: 14px;
          color: rgba(255, 255, 255, 0.27);
          font-size: 9px;
        }

        .hero-meta b {
          display: inline-block;
          width: 5px;
          height: 5px;
          margin-left: 5px;
          border-radius: 50%;
          background: #55e6b4;
          box-shadow: 0 0 10px rgba(85, 230, 180, 0.8);
        }

        .meta-separator {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.18);
        }

        .creator-shell {
          position: relative;
          overflow: hidden;
          padding: 17px;
          border-radius: 29px;
          background:
            linear-gradient(
              145deg,
              rgba(19, 21, 32, 0.9),
              rgba(7, 9, 15, 0.86)
            );
          border: 1px solid rgba(255, 255, 255, 0.09);
          box-shadow:
            0 35px 100px rgba(0, 0, 0, 0.5),
            0 0 70px rgba(82, 70, 255, 0.07),
            inset 0 1px rgba(255, 255, 255, 0.055);
          backdrop-filter: blur(26px);
          animation: shell-enter 0.8s 0.12s ease both;
        }

        .creator-shell::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            linear-gradient(
              120deg,
              rgba(105, 79, 255, 0.1),
              transparent 32%,
              transparent 66%,
              rgba(0, 199, 255, 0.055)
            );
        }

        .creator-shell::after {
          content: "";
          position: absolute;
          top: 0;
          left: 15%;
          right: 15%;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(152, 137, 255, 0.7),
            rgba(77, 214, 255, 0.5),
            transparent
          );
          opacity: 0.65;
        }

        .shell-topline {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 11px;
          padding: 0 3px;
        }

        .prompt-title {
          display: flex;
          align-items: center;
          gap: 7px;
          color: rgba(255, 255, 255, 0.74);
          font-size: 11px;
          font-weight: 700;
        }

        .sparkle-small {
          color: #9a89ff;
          text-shadow: 0 0 12px rgba(139, 117, 255, 0.9);
        }

        .clear-button {
          border: 0;
          background: transparent;
          color: rgba(255, 255, 255, 0.27);
          font: inherit;
          font-size: 9px;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .clear-button:hover:not(:disabled) {
          color: rgba(255, 255, 255, 0.7);
        }

        .clear-button:disabled {
          opacity: 0.25;
          cursor: default;
        }

        .prompt-area {
          position: relative;
          z-index: 2;
          overflow: hidden;
          min-height: 215px;
          border-radius: 22px;
          border: 1px solid rgba(255, 255, 255, 0.075);
          background:
            radial-gradient(
              circle at 90% 0%,
              rgba(99, 78, 255, 0.07),
              transparent 35%
            ),
            rgba(2, 4, 9, 0.6);
          transition:
            border-color 0.25s ease,
            box-shadow 0.25s ease,
            transform 0.25s ease;
        }

        .prompt-area:focus-within {
          border-color: rgba(125, 106, 255, 0.4);
          box-shadow:
            0 0 0 3px rgba(112, 93, 255, 0.055),
            0 0 55px rgba(91, 73, 255, 0.08);
          transform: translateY(-1px);
        }

        .prompt-glow {
          position: absolute;
          top: -100px;
          right: -100px;
          width: 250px;
          height: 250px;
          border-radius: 50%;
          background: rgba(102, 83, 255, 0.09);
          filter: blur(70px);
          pointer-events: none;
        }

        .prompt-area textarea {
          position: relative;
          z-index: 2;
          display: block;
          width: 100%;
          height: 166px;
          padding: 18px 18px 8px;
          resize: none;
          border: 0;
          outline: 0;
          background: transparent;
          color: rgba(255, 255, 255, 0.94);
          font-family: inherit;
          font-size: 15px;
          line-height: 2;
          direction: rtl;
        }

        .prompt-area textarea::placeholder {
          color: rgba(255, 255, 255, 0.27);
          opacity: 1;
          white-space: pre-line;
        }

        .prompt-area textarea:disabled {
          opacity: 0.45;
        }

        .prompt-bottom {
          position: relative;
          z-index: 3;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 37px;
          padding: 0 14px;
          direction: ltr;
        }

        .prompt-hint {
          display: flex;
          align-items: center;
          gap: 4px;
          color: rgba(255, 255, 255, 0.2);
          font-size: 8px;
          direction: ltr;
        }

        .keyboard-key {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 18px;
          height: 17px;
          padding: 0 4px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-bottom-color: rgba(255, 255, 255, 0.15);
          border-radius: 5px;
          background: rgba(255, 255, 255, 0.035);
          color: rgba(255, 255, 255, 0.32);
          font-size: 8px;
        }

        .counter {
          color: rgba(255, 255, 255, 0.22);
          font-size: 9px;
          direction: ltr;
        }

        .counter span {
          color: rgba(255, 255, 255, 0.13);
        }

        .idea-strip {
          position: relative;
          z-index: 3;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin: 13px 2px 14px;
        }

        .idea-strip-title {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 115px;
        }

        .idea-strip-title span {
          color: rgba(255, 255, 255, 0.5);
          font-size: 9px;
          font-weight: 700;
        }

        .idea-strip-title small {
          color: rgba(255, 255, 255, 0.19);
          font-size: 8px;
        }

        .idea-list {
          display: flex;
          justify-content: flex-end;
          gap: 6px;
          flex-wrap: wrap;
        }

        .idea-chip {
          height: 30px;
          padding: 0 10px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.035);
          color: rgba(255, 255, 255, 0.46);
          font-family: inherit;
          font-size: 9px;
          cursor: pointer;
          transition:
            transform 0.2s ease,
            background 0.2s ease,
            border-color 0.2s ease,
            color 0.2s ease;
        }

        .idea-chip:hover:not(:disabled) {
          transform: translateY(-2px);
          border-color: rgba(133, 112, 255, 0.28);
          background: rgba(107, 85, 255, 0.09);
          color: rgba(255, 255, 255, 0.85);
        }

        .idea-chip:disabled {
          opacity: 0.35;
          cursor: default;
        }

        .chip-spark {
          color: #9d8dff;
          font-size: 8px;
        }

        .generate-button {
          position: relative;
          z-index: 3;
          overflow: hidden;
          width: 100%;
          height: 58px;
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 17px;
          background:
            linear-gradient(
              135deg,
              rgba(102, 84, 230, 0.55),
              rgba(57, 50, 142, 0.55)
            );
          color: rgba(255, 255, 255, 0.38);
          font-family: inherit;
          font-size: 12px;
          font-weight: 800;
          cursor: not-allowed;
          box-shadow:
            inset 0 1px rgba(255, 255, 255, 0.08),
            0 12px 35px rgba(0, 0, 0, 0.2);
          transition:
            transform 0.22s ease,
            background 0.25s ease,
            box-shadow 0.25s ease,
            color 0.25s ease;
        }

        .generate-button.active {
          color: #fff;
          cursor: pointer;
          background:
            linear-gradient(
              105deg,
              #725cff,
              #5b50e9 48%,
              #357fdc
            );
          border-color: rgba(164, 151, 255, 0.28);
          box-shadow:
            0 12px 38px rgba(85, 67, 230, 0.3),
            0 0 35px rgba(75, 156, 255, 0.08),
            inset 0 1px rgba(255, 255, 255, 0.22);
        }

        .generate-button.active:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow:
            0 16px 46px rgba(85, 67, 230, 0.4),
            0 0 45px rgba(75, 156, 255, 0.11),
            inset 0 1px rgba(255, 255, 255, 0.25);
        }

        .generate-button:active:not(:disabled) {
          transform: scale(0.985);
        }

        .generate-button:disabled {
          opacity: 0.7;
        }

        .generate-button-shine {
          position: absolute;
          top: -70%;
          left: -30%;
          width: 25%;
          height: 240%;
          transform: rotate(24deg);
          background: linear-gradient(
            to right,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          opacity: 0;
        }

        .generate-button.active .generate-button-shine {
          opacity: 1;
          animation: button-shine 3.8s ease-in-out infinite;
        }

        .generate-content {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          height: 100%;
        }

        .wand-icon {
          display: grid;
          place-items: center;
          width: 23px;
          height: 23px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.13);
        }

        .wand-icon svg {
          width: 14px;
          height: 14px;
          fill: none;
          stroke: currentColor;
          stroke-width: 1.4;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .arrow-icon {
          margin-right: 4px;
          font-size: 17px;
          transition: transform 0.2s ease;
        }

        .generate-button:hover .arrow-icon {
          transform: translateX(-3px);
        }

        .button-loader {
          display: inline-flex;
          gap: 4px;
        }

        .button-loader span {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #fff;
          animation: button-dot 1s ease-in-out infinite;
        }

        .button-loader span:nth-child(2) {
          animation-delay: 0.13s;
        }

        .button-loader span:nth-child(3) {
          animation-delay: 0.26s;
        }

        .creator-footer {
          position: relative;
          z-index: 3;
          display: flex;
          justify-content: space-between;
          padding: 10px 4px 0;
          color: rgba(255, 255, 255, 0.17);
          font-size: 8px;
        }

        .creator-footer i {
          display: inline-block;
          width: 4px;
          height: 4px;
          margin-left: 4px;
          border-radius: 50%;
          background: #5ee2b1;
          box-shadow: 0 0 8px rgba(94, 226, 177, 0.7);
        }

        .generation-panel {
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          gap: 25px;
          min-height: 215px;
          margin-top: 20px;
          padding: 22px 30px;
          border: 1px solid rgba(255, 255, 255, 0.065);
          border-radius: 25px;
          background:
            radial-gradient(
              circle at 20% 50%,
              rgba(92, 75, 255, 0.09),
              transparent 35%
            ),
            rgba(9, 11, 18, 0.75);
          box-shadow:
            0 25px 70px rgba(0, 0, 0, 0.28),
            inset 0 1px rgba(255, 255, 255, 0.035);
          animation: panel-enter 0.45s ease both;
        }

        .generation-panel::before {
          content: "";
          position: absolute;
          top: 0;
          left: -40%;
          width: 40%;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            #8b7aff,
            #58dfff,
            transparent
          );
          animation: scan-line 2.7s linear infinite;
        }

        .generation-visual {
          position: relative;
          flex: 0 0 145px;
          width: 145px;
          height: 145px;
          display: grid;
          place-items: center;
        }

        .visual-ring {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(124, 108, 255, 0.17);
        }

        .visual-ring-one {
          width: 75px;
          height: 75px;
          border-top-color: rgba(131, 112, 255, 0.95);
          border-right-color: rgba(65, 206, 255, 0.7);
          animation: spin 1.5s linear infinite;
        }

        .visual-ring-two {
          width: 108px;
          height: 108px;
          border-bottom-color: rgba(105, 95, 255, 0.75);
          border-left-color: rgba(65, 201, 255, 0.42);
          animation: spin-reverse 2.3s linear infinite;
        }

        .visual-ring-three {
          width: 140px;
          height: 140px;
          border-top-color: rgba(114, 96, 255, 0.25);
          border-bottom-color: rgba(65, 201, 255, 0.17);
          animation: spin 4s linear infinite;
        }

        .generation-core {
          position: relative;
          width: 55px;
          height: 55px;
          display: grid;
          place-items: center;
          border-radius: 18px;
          background: linear-gradient(
            145deg,
            #7e6cff,
            #3d68d8
          );
          box-shadow:
            0 0 28px rgba(108, 91, 255, 0.55),
            0 0 70px rgba(70, 130, 255, 0.2),
            inset 0 1px rgba(255, 255, 255, 0.24);
          animation: core-breathe 1.8s ease-in-out infinite;
          z-index: 2;
        }

        .core-square {
          width: 27px;
          height: 27px;
          display: grid;
          place-items: center;
          border-radius: 9px;
          border: 1px solid rgba(255, 255, 255, 0.22);
          background: rgba(255, 255, 255, 0.08);
        }

        .core-square svg {
          width: 16px;
          height: 16px;
          fill: none;
          stroke: rgba(255, 255, 255, 0.95);
          stroke-width: 1.5;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .core-stars {
          position: absolute;
          inset: -17px;
          pointer-events: none;
        }

        .core-stars span {
          position: absolute;
          color: rgba(197, 190, 255, 0.9);
          font-size: 10px;
          animation: star-float 1.8s ease-in-out infinite;
        }

        .core-stars span:nth-child(1) {
          top: 0;
          right: 3px;
        }

        .core-stars span:nth-child(2) {
          bottom: 4px;
          left: 0;
          animation-delay: -0.6s;
        }

        .core-stars span:nth-child(3) {
          top: 40%;
          left: -4px;
          font-size: 6px;
          animation-delay: -1.1s;
        }

        .generation-copy {
          min-width: 0;
          flex: 1;
        }

        .generation-label {
          font-size: 16px;
          font-weight: 800;
          color: rgba(255, 255, 255, 0.9);
          text-shadow: 0 0 20px rgba(119, 100, 255, 0.28);
          animation: text-breathe 2s ease-in-out infinite;
        }

        .generation-subtitle {
          margin-top: 7px;
          color: rgba(255, 255, 255, 0.3);
          font-size: 10px;
        }

        .generation-progress {
          margin-top: 20px;
        }

        .progress-track {
          display: block;
          width: 100%;
          height: 3px;
          overflow: hidden;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.055);
        }

        .progress-fill {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(
            90deg,
            #7661ff,
            #55dfff
          );
          box-shadow: 0 0 12px rgba(91, 172, 255, 0.5);
          transition: width 0.8s ease;
        }

        .progress-dots {
          display: flex;
          justify-content: space-between;
          margin-top: 8px;
        }

        .progress-dots i {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.12);
          transition: 0.4s ease;
        }

        .progress-dots i.on {
          background: #9d8cff;
          box-shadow: 0 0 9px rgba(123, 104, 255, 0.8);
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 11px;
          margin-top: 16px;
          padding: 13px 15px;
          border: 1px solid rgba(255, 91, 91, 0.13);
          border-radius: 15px;
          background: rgba(255, 70, 70, 0.055);
          color: #ffb0b0;
          animation: panel-enter 0.35s ease both;
        }

        .error-icon {
          flex: 0 0 25px;
          width: 25px;
          height: 25px;
          display: grid;
          place-items: center;
          border-radius: 8px;
          background: rgba(255, 84, 84, 0.12);
          color: #ff9292;
          font-size: 11px;
          font-weight: 800;
        }

        .error-message div:last-child {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .error-message strong {
          font-size: 10px;
        }

        .error-message span {
          color: rgba(255, 190, 190, 0.6);
          font-size: 9px;
        }

        .result {
          margin-top: 28px;
          animation: result-enter 0.65s ease both;
        }

        .result-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 13px;
          padding: 0 4px;
        }

        .result-kicker {
          display: block;
          margin-bottom: 5px;
          color: rgba(158, 143, 255, 0.7);
          font-size: 7px;
          font-weight: 800;
          letter-spacing: 2.5px;
          direction: ltr;
        }

        .result-heading h2 {
          margin: 0;
          font-size: 17px;
          font-weight: 800;
        }

        .result-status {
          display: flex;
          align-items: center;
          gap: 6px;
          color: rgba(255, 255, 255, 0.28);
          font-size: 8px;
        }

        .result-status span {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #57dfad;
          box-shadow: 0 0 10px rgba(87, 223, 173, 0.7);
        }

        .image-card {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 25px;
          background: rgba(255, 255, 255, 0.025);
          box-shadow:
            0 35px 90px rgba(0, 0, 0, 0.48),
            0 0 55px rgba(85, 70, 255, 0.06);
        }

        .image-card-glow {
          position: absolute;
          inset: -20%;
          z-index: 0;
          background: radial-gradient(
            circle,
            rgba(108, 89, 255, 0.12),
            transparent 45%
          );
          filter: blur(35px);
          pointer-events: none;
        }

        .image-frame {
          position: relative;
          z-index: 1;
          overflow: hidden;
          margin: 7px;
          border-radius: 19px;
          background: #08090d;
        }

        .image-frame::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          border: 1px solid rgba(255, 255, 255, 0.055);
          border-radius: inherit;
          box-shadow: inset 0 0 70px rgba(0, 0, 0, 0.18);
        }

        .image-card img {
          display: block;
          width: 100%;
          height: auto;
          animation: image-reveal 0.8s ease both;
        }

        .image-overlay {
          position: absolute;
          z-index: 2;
          top: 17px;
          left: 17px;
          padding: 6px 8px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 7px;
          background: rgba(0, 0, 0, 0.28);
          color: rgba(255, 255, 255, 0.5);
          font-size: 6px;
          letter-spacing: 1.8px;
          direction: ltr;
          backdrop-filter: blur(10px);
        }

        .image-actions {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 11px;
        }

        .action-primary,
        .action-secondary {
          min-width: 135px;
          height: 39px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          border-radius: 11px;
          font-family: inherit;
          font-size: 9px;
          font-weight: 700;
          cursor: pointer;
          transition:
            transform 0.2s ease,
            background 0.2s ease,
            border-color 0.2s ease;
        }

        .action-primary {
          border: 1px solid rgba(145, 130, 255, 0.22);
          background: linear-gradient(
            135deg,
            rgba(113, 91, 255, 0.38),
            rgba(64, 107, 215, 0.25)
          );
          color: rgba(255, 255, 255, 0.86);
        }

        .action-secondary {
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.04);
          color: rgba(255, 255, 255, 0.55);
        }

        .action-primary:hover,
        .action-secondary:hover:not(:disabled) {
          transform: translateY(-2px);
          border-color: rgba(150, 137, 255, 0.32);
        }

        .action-primary svg,
        .action-secondary svg {
          width: 15px;
          height: 15px;
          fill: none;
          stroke: currentColor;
          stroke-width: 1.7;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .action-secondary:disabled {
          opacity: 0.4;
          cursor: default;
        }

        .result-note {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 12px;
          color: rgba(255, 255, 255, 0.18);
          font-size: 8px;
        }

        .result-note span {
          color: #9a88ff;
        }

        .empty-showcase {
          margin-top: 35px;
          animation: fade-up 0.8s 0.25s ease both;
        }

        .showcase-line {
          display: flex;
          align-items: center;
          gap: 12px;
          color: rgba(255, 255, 255, 0.18);
        }

        .showcase-line span {
          flex: 1;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.07)
          );
        }

        .showcase-line span:last-child {
          transform: rotate(180deg);
        }

        .showcase-line small {
          white-space: nowrap;
          font-size: 8px;
        }

        .mini-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-top: 12px;
        }

        .mini-card {
          min-height: 77px;
          padding: 13px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 15px;
          background: rgba(255, 255, 255, 0.018);
          transition:
            transform 0.25s ease,
            background 0.25s ease,
            border-color 0.25s ease;
        }

        .mini-card:hover {
          transform: translateY(-3px);
          background: rgba(110, 89, 255, 0.045);
          border-color: rgba(129, 111, 255, 0.13);
        }

        .mini-icon {
          display: block;
          margin-bottom: 7px;
          color: #8d7dff;
          font-size: 12px;
        }

        .mini-card strong {
          display: block;
          color: rgba(255, 255, 255, 0.48);
          font-size: 9px;
        }

        .mini-card small {
          display: block;
          margin-top: 3px;
          color: rgba(255, 255, 255, 0.18);
          font-size: 7px;
        }

        .image-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 42px;
          padding: 0 4px;
          color: rgba(255, 255, 255, 0.13);
          font-size: 8px;
          direction: ltr;
        }

        .footer-mark {
          color: rgba(142, 126, 255, 0.33);
          font-size: 7px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        @keyframes hero-enter {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shell-enter {
          from {
            opacity: 0;
            transform: translateY(18px) scale(0.985);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes panel-enter {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes result-enter {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.985);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes image-reveal {
          from {
            opacity: 0;
            transform: scale(1.025);
            filter: blur(8px);
          }
          to {
            opacity: 1;
            transform: scale(1);
            filter: blur(0);
          }
        }

        @keyframes fade-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes gradient-flow {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 180% 50%;
          }
        }

        @keyframes hero-ring {
          to {
            transform: rotate(405deg);
          }
        }

        @keyframes hero-ring-reverse {
          to {
            transform: rotate(-405deg);
          }
        }

        @keyframes core-breathe {
          0%,
          100% {
            transform: scale(0.96);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes dot-pulse {
          0%,
          100% {
            opacity: 0.5;
            transform: scale(0.85);
          }
          50% {
            opacity: 1;
            transform: scale(1.15);
          }
        }

        @keyframes ambient-float {
          from {
            transform: translate3d(0, 0, 0) scale(1);
          }
          to {
            transform: translate3d(22px, 18px, 0) scale(1.05);
          }
        }

        @keyframes aurora-drift {
          from {
            transform: translateX(-10px) rotate(18deg);
          }
          to {
            transform: translateX(28px) rotate(21deg);
          }
        }

        @keyframes orb-float {
          0%,
          100% {
            transform: translateY(0);
            opacity: 0.35;
          }
          50% {
            transform: translateY(-18px);
            opacity: 0.9;
          }
        }

        @keyframes light-travel {
          from {
            top: 0;
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          85% {
            opacity: 1;
          }
          to {
            top: calc(100% - 4px);
            opacity: 0;
          }
        }

        @keyframes button-shine {
          0% {
            left: -30%;
          }
          55%,
          100% {
            left: 130%;
          }
        }

        @keyframes button-dot {
          0%,
          100% {
            transform: translateY(0);
            opacity: 0.35;
          }
          50% {
            transform: translateY(-4px);
            opacity: 1;
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes spin-reverse {
          to {
            transform: rotate(-360deg);
          }
        }

        @keyframes star-float {
          0%,
          100% {
            transform: translateY(0) scale(0.8);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-4px) scale(1.15);
            opacity: 1;
          }
        }

        @keyframes text-breathe {
          0%,
          100% {
            opacity: 0.75;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes scan-line {
          from {
            left: -40%;
          }
          to {
            left: 140%;
          }
        }

        @media (max-width: 680px) {
          .image-page {
            padding: 23px 11px 38px;
          }

          .image-header {
            padding-top: 5px;
            padding-bottom: 22px;
          }

          .brand-pill {
            height: 27px;
            font-size: 8px;
            letter-spacing: 2px;
          }

          .image-header h1 {
            font-size: 34px;
            letter-spacing: -1.6px;
          }

          .image-header p {
            font-size: 11px;
            line-height: 1.9;
          }

          .desktop-break {
            display: none;
          }

          .hero-meta {
            font-size: 8px;
          }

          .creator-shell {
            padding: 12px;
            border-radius: 23px;
          }

          .prompt-area {
            min-height: 205px;
            border-radius: 18px;
          }

          .prompt-area textarea {
            height: 157px;
            padding: 15px 14px 6px;
            font-size: 13px;
            line-height: 1.95;
          }

          .prompt-hint {
            display: none;
          }

          .idea-strip {
            display: block;
          }

          .idea-strip-title {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 7px;
          }

          .idea-list {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 5px;
          }

          .idea-chip {
            width: 100%;
            justify-content: center;
            height: 29px;
            padding: 0 5px;
            font-size: 8px;
          }

          .chip-spark {
            display: none;
          }

          .generate-button {
            height: 54px;
            border-radius: 15px;
          }

          .creator-footer {
            font-size: 7px;
          }

          .generation-panel {
            flex-direction: column;
            justify-content: center;
            gap: 3px;
            min-height: 320px;
            padding: 20px;
            text-align: center;
          }

          .generation-visual {
            flex-basis: 145px;
          }

          .generation-copy {
            width: 100%;
          }

          .generation-progress {
            margin-top: 15px;
          }

          .result-heading h2 {
            font-size: 15px;
          }

          .action-primary,
          .action-secondary {
            flex: 1;
            min-width: 0;
            height: 38px;
          }

          .mini-cards {
            gap: 5px;
          }

          .mini-card {
            min-height: 72px;
            padding: 10px;
          }

          .mini-card small {
            display: none;
          }

          .image-footer {
            margin-top: 30px;
            font-size: 7px;
          }
        }

        @media (max-width: 390px) {
          .image-header h1 {
            font-size: 31px;
          }

          .hero-icon {
            margin-top: 17px;
            margin-bottom: 14px;
          }

          .idea-list {
            grid-template-columns: repeat(2, 1fr);
          }

          .prompt-bottom {
            padding: 0 10px;
          }

          .image-actions {
            gap: 5px;
          }

          .action-primary,
          .action-secondary {
            font-size: 8px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </main>
  );
}
