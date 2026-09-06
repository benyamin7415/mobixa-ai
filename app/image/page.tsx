"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

/* =========================
   ICONS
========================= */

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

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M21 3 10 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="m21 3-7 18-3.5-7.5L3 10l18-7Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* =========================
   MOBIXA LOGO
========================= */

function MobixaLogo() {
  return (
    <div className="hero-logo">
      <div className="hero-orbit orbit-a" />
      <div className="hero-orbit orbit-b" />
      <div className="hero-orbit orbit-c" />

      <div className="hero-glass">
        <div className="hero-m">
          <span className="m1" />
          <span className="m2" />
          <span className="m3" />
        </div>

        <span className="hero-star hero-star-one">✦</span>
        <span className="hero-star hero-star-two">✦</span>
      </div>

      <span className="logo-spark spark-a">✦</span>
      <span className="logo-spark spark-b">✧</span>
      <span className="logo-spark spark-c">✦</span>
    </div>
  );
}

/* =========================
   ROBOT
========================= */

function MobixaRobot() {
  return (
    <div className="robot-stage">
      <div className="robot-aura" />

      <svg
        className="robot-svg"
        viewBox="0 0 240 240"
        role="img"
        aria-label="Mobixa AI robot"
      >
        <defs>
          <linearGradient id="robotHead" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a975ff" />
            <stop offset="45%" stopColor="#372a86" />
            <stop offset="100%" stopColor="#080a22" />
          </linearGradient>

          <linearGradient id="robotBody" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6950db" />
            <stop offset="50%" stopColor="#17164d" />
            <stop offset="100%" stopColor="#070918" />
          </linearGradient>

          <linearGradient id="robotBlue" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e3d4ff" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#19d9ff" />
          </linearGradient>

          <filter id="robotGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <line
          x1="120"
          y1="29"
          x2="120"
          y2="14"
          stroke="#6deaff"
          strokeWidth="4"
        />

        <circle
          cx="120"
          cy="10"
          r="7"
          fill="#c18cff"
          filter="url(#robotGlow)"
        />

        <rect
          x="45"
          y="83"
          width="22"
          height="53"
          rx="11"
          fill="#151747"
          stroke="#735cff"
          strokeWidth="4"
        />

        <rect
          x="173"
          y="83"
          width="22"
          height="53"
          rx="11"
          fill="#151747"
          stroke="#735cff"
          strokeWidth="4"
        />

        <rect
          x="58"
          y="34"
          width="124"
          height="112"
          rx="48"
          fill="url(#robotHead)"
          stroke="#a98aff"
          strokeWidth="4"
        />

        <rect
          x="72"
          y="53"
          width="96"
          height="73"
          rx="32"
          fill="#030716"
          stroke="#27cfff"
          strokeOpacity=".45"
          strokeWidth="2"
        />

        <path
          d="M89 83c4-8 12-8 16 0"
          fill="none"
          stroke="#49eaff"
          strokeWidth="5"
          strokeLinecap="round"
        />

        <path
          d="M135 83c4-8 12-8 16 0"
          fill="none"
          stroke="#49eaff"
          strokeWidth="5"
          strokeLinecap="round"
        />

        <path
          d="M105 101c9 9 21 9 30 0"
          fill="none"
          stroke="#9a7cff"
          strokeWidth="4"
          strokeLinecap="round"
        />

        <rect
          x="106"
          y="139"
          width="28"
          height="14"
          rx="7"
          fill="#292469"
        />

        <path
          d="M77 148c8-12 23-17 43-17s35 5 43 17l17 55H60l17-55Z"
          fill="url(#robotBody)"
          stroke="#7967ff"
          strokeWidth="4"
        />

        <circle
          cx="120"
          cy="170"
          r="17"
          fill="#090d2b"
          stroke="#42ddff"
          strokeWidth="3"
        />

        <circle
          cx="120"
          cy="170"
          r="7"
          fill="#32dcff"
          filter="url(#robotGlow)"
        />

        <path
          d="M77 157c-18 4-27 15-35 29"
          fill="none"
          stroke="url(#robotBlue)"
          strokeWidth="15"
          strokeLinecap="round"
        />

        <path
          d="M164 157c18-3 27-14 34-30"
          fill="none"
          stroke="url(#robotBlue)"
          strokeWidth="15"
          strokeLinecap="round"
        />

        <circle
          cx="199"
          cy="119"
          r="13"
          fill="#b99cff"
          filter="url(#robotGlow)"
        />

        <path
          d="M199 111v-27"
          stroke="#d0c2ff"
          strokeWidth="9"
          strokeLinecap="round"
        />

        <path
          d="M214 98l8-7M215 108l10-2"
          stroke="#34dfff"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

/* =========================
   PAGE
========================= */

export default function ImagePage() {
  const router = useRouter();

  const [input, setInput] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  function goBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }

  async function generateImage() {
    const prompt = input.trim();

    if (!prompt || loading) return;

    setLoading(true);
    setError("");
    setImage(null);

    try {
      const response = await fetch("/api/image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "در ساخت تصویر مشکلی پیش آمد."
        );
      }

      if (!data?.image) {
        throw new Error("تصویری دریافت نشد.");
      }

      setImage(data.image);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "در ساخت تصویر مشکلی پیش آمد."
      );
    } finally {
      setLoading(false);
    }
  }

  function keyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      generateImage();
    }
  }

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  return (
    <main dir="rtl" className="mobixa">
      <div className="background">
        <div className="purple-cloud cloud-one" />
        <div className="purple-cloud cloud-two" />
        <div className="blue-cloud cloud-three" />

        <div className="neon-wave wave-one" />
        <div className="neon-wave wave-two" />

        <div className="starfield">
          <span>✦</span>
          <span>✧</span>
          <span>·</span>
          <span>✦</span>
          <span>·</span>
          <span>✧</span>
          <span>✦</span>
          <span>·</span>
        </div>
      </div>

      <header className="header">
        <button
          className="back"
          onClick={goBack}
          type="button"
        >
          <BackIcon />
          <span>بازگشت</span>
        </button>

        <div className="wordmark">
          <span>MOBIXA</span>
          <b>AI</b>
        </div>
      </header>

      <section className="page-content">
        <div className="image-scroll">
          {!image && !loading && !error ? (
            <div className="home-content">
              <MobixaLogo />

              <MobixaRobot />

              <div className="greeting">
                <h1>
                  <span>ایده بده و عکس تحویل بگیر</span>{" "}
                  <strong>هنرمند</strong>
                </h1>

                <div className="under-line">
                  <i />
                </div>
              </div>

              <p className="intro">
                هر چیزی که توی ذهنت داری رو توصیف کن،
                <br />
                موبیکسا برات به تصویرش می‌کشه.
                <br />
                <span>فقط ایده‌ات رو بنویس.</span>
              </p>
            </div>
          ) : (
            <div className="result-area">
              {loading && (
                <div className="loading-box">
                  <div className="loading-orbit">
                    <span />
                  </div>

                  <h2>در حال ساخت تصویر...</h2>

                  <p>
                    موبیکسا داره ایده‌ات رو به تصویر تبدیل می‌کنه ✨
                  </p>
                </div>
              )}

              {error && !loading && (
                <div className="error-box">
                  <div className="error-icon">!</div>

                  <h2>اوه! مشکلی پیش اومد</h2>

                  <p>{error}</p>
                </div>
              )}

              {image && !loading && (
                <div className="generated-image-box">
                  <div className="image-glow" />

                  <img
                    src={image}
                    alt="تصویر تولید شده توسط Mobixa AI"
                  />

                  <div className="image-caption">
                    <span>✦ ساخته‌شده با Mobixa AI</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="composer-zone">
          <form
            className={`composer ${
              input.trim() ? "composer-active" : ""
            }`}
            onSubmit={(event) => {
              event.preventDefault();
              generateImage();
            }}
          >
            <textarea
              ref={textareaRef}
              value={input}
              disabled={loading}
              onChange={(event) =>
                setInput(event.target.value)
              }
              onKeyDown={keyDown}
              rows={1}
              placeholder="توضیح تصویری که می‌خوای بسازم..."
            />

            <button
              type="submit"
              className="send"
              disabled={!input.trim() || loading}
            >
              <SendIcon />
            </button>
          </form>

          <div className="footer">
            <span>✦ Mobixa AI</span>

            <span>
              تصاویر توسط هوش مصنوعی تولید می‌شوند.
            </span>
          </div>
        </div>
      </section>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .mobixa {
          position: relative;
          width: 100%;
          height: 100svh;
          overflow: hidden;
          background:
            radial-gradient(
              circle at 15% 45%,
              rgba(89, 21, 180, 0.35),
              transparent 30%
            ),
            radial-gradient(
              circle at 90% 75%,
              rgba(0, 84, 190, 0.3),
              transparent 34%
            ),
            #02030b;
          color: white;
          font-family:
            Arial,
            Tahoma,
            sans-serif;
        }

        .background {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
        }

        .purple-cloud {
          position: absolute;
          border-radius: 50%;
          filter: blur(75px);
          opacity: 0.4;
        }

        .cloud-one {
          width: 330px;
          height: 330px;
          left: -190px;
          top: 270px;
          background: #681cff;
        }

        .cloud-two {
          width: 270px;
          height: 270px;
          left: 30%;
          bottom: -160px;
          background: #4f18d6;
        }

        .cloud-three {
          position: absolute;
          width: 300px;
          height: 300px;
          right: -190px;
          top: 500px;
          border-radius: 50%;
          background: #006cff;
          filter: blur(90px);
          opacity: 0.28;
        }

        .neon-wave {
          position: absolute;
          width: 850px;
          height: 260px;
          border: 1px solid rgba(122, 77, 255, 0.35);
          border-radius: 50%;
        }

        .wave-one {
          left: -480px;
          top: 550px;
          transform: rotate(-22deg);
          box-shadow: 0 0 14px rgba(91, 58, 255, 0.3);
        }

        .wave-two {
          right: -500px;
          top: 690px;
          transform: rotate(25deg);
          border-color: rgba(0, 194, 255, 0.28);
        }

        .starfield span {
          position: absolute;
          color: rgba(164, 140, 255, 0.7);
          font-size: 10px;
        }

        .starfield span:nth-child(1) {
          top: 25%;
          left: 12%;
        }

        .starfield span:nth-child(2) {
          top: 40%;
          right: 12%;
        }

        .starfield span:nth-child(3) {
          top: 53%;
          left: 8%;
        }

        .starfield span:nth-child(4) {
          top: 65%;
          right: 8%;
        }

        .starfield span:nth-child(5) {
          top: 73%;
          left: 15%;
        }

        .starfield span:nth-child(6) {
          top: 83%;
          right: 18%;
        }

        .starfield span:nth-child(7) {
          top: 31%;
          left: 47%;
        }

        .starfield span:nth-child(8) {
          top: 58%;
          right: 31%;
        }

        .header {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 1100px;
          margin: 0 auto;
          height: 82px;
          padding: 20px 24px 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          direction: ltr;
        }

        .wordmark {
          direction: ltr;
          font-size: 21px;
          font-weight: 900;
          letter-spacing: 5px;
          text-shadow: 0 0 15px rgba(255, 255, 255, 0.18);
        }

        .wordmark b {
          margin-left: 6px;
          background: linear-gradient(
            90deg,
            #b05cff,
            #20dfff
          );
          -webkit-background-clip: text;
          color: transparent;
        }

        .back {
          direction: rtl;
          display: flex;
          align-items: center;
          gap: 7px;
          height: 44px;
          padding: 0 16px;
          border-radius: 999px;
          border: 1px solid rgba(155, 73, 255, 0.95);
          background: rgba(55, 16, 111, 0.25);
          color: white;
          box-shadow:
            0 0 15px rgba(144, 59, 255, 0.42),
            inset 0 0 18px rgba(94, 70, 255, 0.13);
          backdrop-filter: blur(18px);
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
        }

        .back svg {
          width: 20px;
          height: 20px;
        }

        .page-content {
          position: relative;
          z-index: 5;
          width: 100%;
          max-width: 900px;
          height: calc(100svh - 82px);
          margin: 0 auto;
          display: flex;
          flex-direction: column;
        }

        .image-scroll {
          min-height: 0;
          flex: 1;
          overflow-y: auto;
          scrollbar-width: none;
          padding: 0 18px;
        }

        .image-scroll::-webkit-scrollbar {
          display: none;
        }

        .home-content {
          min-height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding-bottom: 40px;
        }

        /* =========================
           LOGO
        ========================= */

        .hero-logo {
          position: relative;
          width: 210px;
          height: 185px;
          flex: 0 0 auto;
          margin-top: -5px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hero-glass {
          position: relative;
          width: 112px;
          height: 112px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            radial-gradient(
              circle at 35% 25%,
              rgba(181, 122, 255, 0.85),
              rgba(42, 14, 100, 0.48) 42%,
              rgba(3, 5, 25, 0.92) 76%
            );
          border: 1px solid rgba(132, 89, 255, 0.8);
          box-shadow:
            0 0 25px rgba(134, 63, 255, 0.75),
            inset 0 0 30px rgba(0, 194, 255, 0.2);
        }

        .hero-orbit {
          position: absolute;
          border-radius: 50%;
          border: 1px solid;
        }

        .orbit-a {
          width: 205px;
          height: 65px;
          transform: rotate(-18deg);
          border-color: rgba(170, 79, 255, 0.8);
          box-shadow: 0 0 12px rgba(161, 74, 255, 0.4);
        }

        .orbit-b {
          width: 205px;
          height: 72px;
          transform: rotate(46deg);
          border-color: rgba(0, 209, 255, 0.65);
          box-shadow: 0 0 12px rgba(0, 209, 255, 0.35);
        }

        .orbit-c {
          width: 150px;
          height: 150px;
          border-color: rgba(118, 75, 255, 0.2);
        }

        .hero-m {
          position: relative;
          width: 65px;
          height: 66px;
          filter:
            drop-shadow(0 0 7px #ae63ff)
            drop-shadow(0 0 17px #00d9ff);
        }

        .hero-m span {
          position: absolute;
          top: 6px;
          display: block;
          width: 20px;
          height: 54px;
          border-radius: 5px;
          background: linear-gradient(
            180deg,
            #f0c5ff,
            #974cff 45%,
            #25dfff
          );
        }

        .m1 {
          left: 2px;
          transform: skewY(27deg);
        }

        .m2 {
          left: 22px;
          top: 18px !important;
          width: 19px !important;
          height: 35px !important;
          transform: rotate(45deg);
        }

        .m3 {
          right: 2px;
          transform: skewY(-27deg);
        }

        .hero-star {
          position: absolute;
          color: white;
          text-shadow:
            0 0 8px #b566ff,
            0 0 16px #00d9ff;
        }

        .hero-star-one {
          top: -3px;
          right: 43px;
          font-size: 21px;
        }

        .hero-star-two {
          bottom: 26px;
          left: 45px;
          font-size: 13px;
        }

        .logo-spark {
          position: absolute;
          color: #d6caff;
          text-shadow: 0 0 10px #00cfff;
        }

        .spark-a {
          top: 35px;
          left: 10px;
        }

        .spark-b {
          bottom: 22px;
          right: 15px;
        }

        .spark-c {
          top: 55px;
          right: 5px;
        }

        /* =========================
           ROBOT
        ========================= */

        .robot-stage {
          position: relative;
          width: 210px;
          height: 155px;
          flex: 0 0 auto;
          margin-top: -30px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .robot-aura {
          position: absolute;
          width: 125px;
          height: 90px;
          border-radius: 50%;
          background: #7040ff;
          filter: blur(45px);
          opacity: 0.38;
        }

        .robot-svg {
          position: relative;
          width: 160px;
          height: 160px;
          z-index: 2;
          filter:
            drop-shadow(0 0 9px rgba(114, 81, 255, 0.5))
            drop-shadow(0 0 18px rgba(0, 210, 255, 0.16));
        }

        /* =========================
           GREETING
        ========================= */

        .greeting {
          text-align: center;
          margin-top: -5px;
        }

        .greeting h1 {
          margin: 12px 0 0;
          font-size: 30px;
          line-height: 1.35;
          font-weight: 950;
        }

        .greeting h1 span {
          background: linear-gradient(
            90deg,
            #b867ff,
            #9354ff,
            #8d6dff
          );
          -webkit-background-clip: text;
          color: transparent;
        }

        .greeting h1 strong {
          background: linear-gradient(
            90deg,
            #9259ff,
            #19d8ff
          );
          -webkit-background-clip: text;
          color: transparent;
        }

        .under-line {
          width: 180px;
          height: 4px;
          margin: 14px auto 0;
          border-radius: 999px;
          background: linear-gradient(
            90deg,
            transparent,
            #b04cff,
            #23dfff,
            transparent
          );
          box-shadow:
            0 0 8px #913eff,
            0 0 16px rgba(0, 207, 255, 0.35);
        }

        .under-line i {
          display: block;
          width: 45px;
          height: 2px;
          margin: auto;
          background: white;
          filter: blur(1px);
        }

        .intro {
          margin: 17px 0 0;
          text-align: center;
          font-size: 14px;
          line-height: 2;
          color: rgba(239, 239, 255, 0.86);
        }

        .intro span {
          color: #a5afe8;
        }

        /* =========================
           RESULT
        ========================= */

        .result-area {
          width: 100%;
          min-height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 35px 0 45px;
        }

        .loading-box,
        .error-box {
          text-align: center;
          padding: 35px 25px;
          border-radius: 24px;
          background: rgba(13, 13, 40, 0.6);
          border: 1px solid rgba(137, 83, 255, 0.35);
          backdrop-filter: blur(18px);
          box-shadow:
            0 0 35px rgba(105, 56, 255, 0.15),
            inset 0 0 30px rgba(0, 200, 255, 0.04);
        }

        .loading-box h2,
        .error-box h2 {
          margin: 18px 0 7px;
          font-size: 18px;
        }

        .loading-box p,
        .error-box p {
          margin: 0;
          color: rgba(220, 222, 250, 0.72);
          font-size: 12px;
          line-height: 1.8;
        }

        .loading-orbit {
          width: 62px;
          height: 62px;
          margin: 0 auto;
          border: 2px solid rgba(139, 92, 246, 0.25);
          border-top-color: #c06cff;
          border-right-color: #19d9ff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          box-shadow:
            0 0 18px rgba(153, 71, 255, 0.45);
        }

        .loading-orbit span {
          display: block;
          width: 9px;
          height: 9px;
          margin: -5px auto 0;
          border-radius: 50%;
          background: #d28cff;
          box-shadow: 0 0 14px #20dfff;
        }

        .error-icon {
          width: 52px;
          height: 52px;
          margin: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          color: white;
          font-size: 24px;
          font-weight: 900;
          background: rgba(129, 54, 210, 0.35);
          border: 1px solid rgba(199, 101, 255, 0.7);
          box-shadow: 0 0 20px rgba(172, 67, 255, 0.35);
        }

        .generated-image-box {
          position: relative;
          width: min(100%, 700px);
          padding: 10px;
          border-radius: 25px;
          background: rgba(12, 10, 36, 0.7);
          border: 1px solid rgba(145, 91, 255, 0.65);
          box-shadow:
            0 0 35px rgba(125, 55, 255, 0.3),
            0 0 70px rgba(0, 180, 255, 0.08);
          backdrop-filter: blur(18px);
          z-index: 2;
        }

        .generated-image-box img {
          position: relative;
          z-index: 2;
          display: block;
          width: 100%;
          height: auto;
          border-radius: 17px;
        }

        .image-glow {
          position: absolute;
          inset: 15%;
          background: linear-gradient(
            90deg,
            #8d4cff,
            #20dfff
          );
          filter: blur(55px);
          opacity: 0.18;
        }

        .image-caption {
          position: relative;
          z-index: 3;
          padding: 9px 5px 2px;
          text-align: center;
          color: rgba(190, 168, 255, 0.78);
          font-size: 9px;
        }

        /* =========================
           COMPOSER
        ========================= */

        .composer-zone {
          position: relative;
          z-index: 20;
          flex: 0 0 auto;
          width: 100%;
          padding: 8px 18px 12px;
          background: linear-gradient(
            180deg,
            transparent,
            rgba(2, 3, 11, 0.25)
          );
        }

        .composer {
          position: relative;
          width: 100%;
          max-width: 760px;
          min-height: 64px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 7px 8px;
          border-radius: 23px;
          border: 1px solid rgba(67, 119, 255, 0.45);
          background: rgba(9, 18, 49, 0.78);
          box-shadow:
            0 0 25px rgba(76, 61, 255, 0.12),
            inset 0 0 25px rgba(0, 185, 255, 0.03);
          backdrop-filter: blur(20px);
          overflow: hidden;
        }

        .composer::before {
          content: "";
          position: absolute;
          inset: -2px;
          border-radius: 25px;
          padding: 2px;
          background: conic-gradient(
            from 0deg,
            transparent 0deg,
            transparent 55deg,
            #9a4dff 100deg,
            #21dfff 150deg,
            transparent 205deg,
            transparent 360deg
          );
          -webkit-mask:
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          animation: borderSpin 2.4s linear infinite;
          pointer-events: none;
        }

        .composer-active {
          border-color: rgba(139, 78, 255, 0.72);
          box-shadow:
            0 0 25px rgba(76, 61, 255, 0.24),
            0 0 45px rgba(0, 190, 255, 0.08),
            inset 0 0 25px rgba(0, 185, 255, 0.06);
        }

        .composer-active::before {
          opacity: 1;
        }

        .composer textarea {
          position: relative;
          z-index: 2;
          flex: 1;
          min-width: 0;
          min-height: 44px;
          max-height: 110px;
          resize: none;
          outline: none;
          border: 0;
          background: transparent;
          color: white;
          padding: 9px;
          text-align: right;
          font-family: inherit;
          font-size: 14px;
          line-height: 1.6;
        }

        .composer textarea::placeholder {
          color: rgba(173, 183, 230, 0.72);
        }

        .send {
          position: relative;
          z-index: 2;
          width: 51px;
          height: 51px;
          flex: 0 0 51px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(188, 101, 255, 0.85);
          border-radius: 50%;
          background:
            radial-gradient(
              circle at 30% 25%,
              #bd78ff,
              #7139eb 48%,
              #3260ff
            );
          color: white;
          box-shadow:
            0 0 16px rgba(146, 70, 255, 0.7),
            0 0 27px rgba(0, 186, 255, 0.18);
          cursor: pointer;
        }

        .send:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          box-shadow: none;
          background: rgba(55, 62, 95, 0.55);
          border-color: rgba(105, 115, 155, 0.35);
        }

        .send svg {
          width: 23px;
          height: 23px;
          transform: rotate(180deg);
        }

        .footer {
          width: 100%;
          max-width: 760px;
          margin: 6px auto 0;
          padding: 0 7px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: rgba(132, 143, 193, 0.72);
          font-size: 8px;
        }

        .footer span:first-child {
          color: rgba(166, 104, 255, 0.85);
        }

        @keyframes borderSpin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 500px) {
          .header {
            height: 72px;
            padding: 16px 18px 0;
          }

          .wordmark {
            font-size: 17px;
            letter-spacing: 4px;
          }

          .back {
            height: 41px;
            padding: 0 14px;
            font-size: 12px;
          }

          .page-content {
            height: calc(100svh - 72px);
          }

          .image-scroll {
            padding: 0 12px;
          }

          .hero-logo {
            width: 190px;
            height: 158px;
            transform: scale(0.92);
            margin-top: -5px;
          }

          .robot-stage {
            width: 190px;
            height: 138px;
            margin-top: -27px;
          }

          .robot-svg {
            width: 145px;
            height: 145px;
          }

          .greeting h1 {
            font-size: 25px;
          }

          .intro {
            margin-top: 13px;
            font-size: 12px;
            line-height: 1.85;
          }

          .composer-zone {
            padding: 7px 12px 10px;
          }

          .composer {
            min-height: 59px;
            border-radius: 20px;
          }

          .send {
            width: 47px;
            height: 47px;
            flex-basis: 47px;
          }

          .footer {
            font-size: 7px;
          }

          .generated-image-box {
            border-radius: 20px;
            padding: 7px;
          }

          .generated-image-box img {
            border-radius: 14px;
          }
        }

        @media (max-height: 760px) and (max-width: 500px) {
          .hero-logo {
            height: 130px;
            transform: scale(0.76);
            margin-top: -17px;
          }

          .robot-stage {
            height: 112px;
            transform: scale(0.78);
            margin-top: -36px;
          }

          .greeting h1 {
            margin-top: 8px;
            font-size: 23px;
          }

          .intro {
            margin-top: 9px;
          }
        }
      `}</style>
    </main>
  );
}
