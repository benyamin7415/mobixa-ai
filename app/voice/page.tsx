"use client";

import Link from "next/link";
import { useState } from "react";

const MAX_CHARS = 1000;

const voices = [
  {
    id: "chirp",
    name: "Chirp 3 HD",
    description: "صدای طبیعی و حرفه‌ای",
    icon: "flame",
  },
  {
    id: "neural2",
    name: "Neural2",
    description: "مناسب گویندگی و نریشن",
    icon: "microphone",
  },
  {
    id: "wavenet",
    name: "WaveNet",
    description: "سریع و باکیفیت",
    icon: "lightning",
  },
];

function FlameIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="custom-icon flame-icon"
    >
      <defs>
        <linearGradient
          id="mobixa-flame-gradient"
          x1="4"
          y1="3"
          x2="20"
          y2="22"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.35" stopColor="#c6a8ff" />
          <stop offset="0.72" stopColor="#a36cff" />
          <stop offset="1" stopColor="#63dfff" />
        </linearGradient>
      </defs>

      <path
        d="M13.2 2.7c.3 3.1-1.2 4.7-2.8 6.2-1.1 1-1.9 2-1.9 3.7 0 1.4.8 2.5 2 3.1-.2-1.5.5-2.8 1.8-4 1.8-1.7 3.1-3.3 2.7-6.1 2.5 2.1 4.4 5.1 4.4 8.4 0 4.4-3.2 7.3-7.4 7.3S4.6 18.7 4.6 14.5c0-3.8 2.2-6.5 4.7-8.7-.1 2 .4 3.3 1.2 4.1.4-2.7 1.4-5 2.7-7.2Z"
        fill="url(#mobixa-flame-gradient)"
      />

      <path
        d="M12.3 13.1c-1.1 1.1-1.7 2-1.7 3.2 0 1.5 1 2.5 2.4 2.5s2.5-1 2.5-2.5c0-1.2-.7-2.2-1.8-3.4-.2.9-.6 1.5-1.4 2-.1-.7-.1-1.2 0-1.8Z"
        fill="rgba(255,255,255,0.9)"
      />
    </svg>
  );
}

function LightningIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="custom-feature-icon lightning-icon"
    >
      <defs>
        <linearGradient
          id="mobixa-lightning-gradient"
          x1="5"
          y1="3"
          x2="19"
          y2="21"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.45" stopColor="#b9a0ff" />
          <stop offset="1" stopColor="#63dfff" />
        </linearGradient>
      </defs>

      <path
        d="M13.4 2.7 5.7 13.1h5.1l-1 8.2 8.5-11.2h-5.2l.3-7.4Z"
        fill="url(#mobixa-lightning-gradient)"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="custom-feature-icon lock-icon"
    >
      <defs>
        <linearGradient
          id="mobixa-lock-gradient"
          x1="5"
          y1="3"
          x2="19"
          y2="21"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.5" stopColor="#b9a0ff" />
          <stop offset="1" stopColor="#63dfff" />
        </linearGradient>
      </defs>

      <rect
        x="5"
        y="10"
        width="14"
        height="11"
        rx="3"
        fill="url(#mobixa-lock-gradient)"
      />

      <path
        d="M8 10V7.5a4 4 0 0 1 8 0V10"
        fill="none"
        stroke="rgba(255,255,255,0.9)"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <circle cx="12" cy="15.5" r="1.25" fill="#5d43a8" />

      <path
        d="M12 16.5v2"
        stroke="#5d43a8"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function VoicePage() {
  const [text, setText] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("neural2");
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [error, setError] = useState("");

  const handleTextChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = event.target.value.slice(0, MAX_CHARS);

    setText(value);
    setError("");
  };

  const generateVoice = async () => {
    if (!text.trim()) {
      setError("اول متنی که می‌خوای به صدا تبدیل بشه رو وارد کن.");
      return;
    }

    setLoading(true);
    setError("");

    /*
      اتصال واقعی به Google Cloud TTS
      در مرحله بعد این قسمت را به /api/tts وصل می‌کنیم.
    */

    setTimeout(() => {
      setLoading(false);
      setError("سرویس تولید صدا هنوز متصل نشده؛ مرحله بعد API رو وصل می‌کنیم.");
    }, 700);
  };

  const downloadAudio = () => {
    if (!audioUrl) return;

    const link = document.createElement("a");
    link.href = audioUrl;
    link.download = "mobixa-voice.mp3";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="voice-page">
      <div className="background-orb orb-one" />
      <div className="background-orb orb-two" />
      <div className="background-orb orb-three" />

      <section className="voice-container fade-up">
        {/* Header */}
        <header className="voice-header">
          <div className="brand">
            <div className="brand-orb">
              <span>✦</span>
            </div>

            <div>
              <div className="brand-name">MOBIXA</div>
              <div className="brand-subtitle">VOICE LAB</div>
            </div>
          </div>

          <div className="status">
            <span className="status-dot" />
            AI VOICE
          </div>
        </header>

        {/* Hero */}
        <div className="hero">
          <div className="hero-badge">
            <span>✦</span>
            AI TEXT TO SPEECH
          </div>

          <h1>
            متن بده،
            <br />
            <span>صدا تحویل بگیر.</span>
          </h1>

          <p>
            با هوش مصنوعی MOBIXA متن خودت رو به صدای طبیعی و حرفه‌ای تبدیل کن.
          </p>
        </div>

        {/* Main Card */}
        <section className="voice-card glass-card">
          <div className="section-title">
            <div>
              <h2>متن خودت رو وارد کن</h2>
              <p>متنی که می‌خوای به صدا تبدیل بشه</p>
            </div>

            <div className="character-counter">
              <strong>{text.length}</strong> / {MAX_CHARS}
            </div>
          </div>

          <div className="textarea-wrapper">
            <textarea
              value={text}
              onChange={handleTextChange}
              maxLength={MAX_CHARS}
              placeholder="مثلاً: به دنیای MOBIXA خوش اومدی..."
              dir="rtl"
            />

            <div className="textarea-glow" />
          </div>

          {/* Voice selection */}
          <div className="voice-selection">
            <div className="selection-heading">
              <h3>مدل صدا</h3>
              <span>انتخاب کن</span>
            </div>

            <div className="voice-options">
              {voices.map((voice) => {
                const selected = selectedVoice === voice.id;

                return (
                  <button
                    key={voice.id}
                    type="button"
                    className={`voice-option ${
                      selected ? "selected" : ""
                    }`}
                    onClick={() => setSelectedVoice(voice.id)}
                  >
                    <div className="voice-icon">
                      {voice.icon === "flame" ? (
                        <FlameIcon />
                      ) : voice.icon === "microphone" ? (
                        "🎙️"
                      ) : (
                        <LightningIcon />
                      )}
                    </div>

                    <div className="voice-info">
                      <strong>{voice.name}</strong>
                      <span>{voice.description}</span>
                    </div>

                    <div className="radio">
                      {selected && <span />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Generate button */}
          <button
            type="button"
            className={`generate-button ${loading ? "loading" : ""}`}
            onClick={generateVoice}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner" />
                در حال ساخت صدا...
              </>
            ) : (
              <>
                <span className="button-icon">✦</span>
                ساخت صدا
                <span className="button-arrow">→</span>
              </>
            )}
          </button>

          {/* Error */}
          {error && (
            <div className="error-box">
              <span>⚠</span>
              <p>{error}</p>
            </div>
          )}

          {/* Audio result */}
          {audioUrl && (
            <div className="audio-result">
              <div className="audio-result-header">
                <div>
                  <strong>صدای شما آماده است 🎧</strong>
                  <span>MOBIXA AI VOICE</span>
                </div>

                <div className="success-icon">✓</div>
              </div>

              <audio controls src={audioUrl} />

              <button
                type="button"
                className="download-button"
                onClick={downloadAudio}
              >
                ↓ دانلود صدا
              </button>
            </div>
          )}
        </section>

        {/* Bottom features */}
        <div className="features">
          <div className="feature">
            <span className="custom-feature">
              <LightningIcon />
            </span>

            <div>
              <strong>سریع</strong>
              <small>تولید صدا با AI</small>
            </div>
          </div>

          <div className="feature">
            <span className="microphone-feature">🎙️</span>

            <div>
              <strong>طبیعی</strong>
              <small>صدای نزدیک به انسان</small>
            </div>
          </div>

          <div className="feature">
            <span className="custom-feature">
              <LockIcon />
            </span>

            <div>
              <strong>امن</strong>
              <small>کلید API در سرور</small>
            </div>
          </div>
        </div>

        {/* Back to MOBIXA */}
        <Link href="/" className="back-home-button">
          <span className="back-home-arrow">←</span>
          <span>بازگشت به MOBIXA</span>
        </Link>

        <footer>
          Designed &amp; Developed by <strong>Benyamin</strong>
        </footer>
      </section>

      <style jsx>{`
        .voice-page {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          padding: 32px 20px 50px;
        }

        .background-orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(90px);
          pointer-events: none;
          z-index: -1;
          opacity: 0.35;
        }

        .orb-one {
          width: 320px;
          height: 320px;
          background: #6e50ff;
          top: 5%;
          left: -100px;
          animation: floatOne 10s ease-in-out infinite alternate;
        }

        .orb-two {
          width: 300px;
          height: 300px;
          background: #00c8ff;
          right: -100px;
          top: 45%;
          animation: floatTwo 12s ease-in-out infinite alternate;
        }

        .orb-three {
          width: 250px;
          height: 250px;
          background: #b428ff;
          bottom: -100px;
          left: 40%;
          animation: floatThree 9s ease-in-out infinite alternate;
        }

        .voice-container {
          width: 100%;
          max-width: 920px;
          margin: 0 auto;
        }

        .voice-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 70px;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .brand-orb {
          width: 46px;
          height: 46px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 15px;
          background: linear-gradient(
            135deg,
            rgba(110, 80, 255, 0.35),
            rgba(0, 200, 255, 0.18)
          );
          border: 1px solid rgba(255, 255, 255, 0.16);
          box-shadow: 0 0 30px rgba(110, 80, 255, 0.25);
          font-size: 21px;
        }

        .brand-name {
          font-size: 19px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        .brand-subtitle {
          color: rgba(255, 255, 255, 0.45);
          font-size: 9px;
          letter-spacing: 3px;
          margin-top: 2px;
        }

        .status {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 13px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.04);
          color: rgba(255, 255, 255, 0.6);
          font-size: 10px;
          letter-spacing: 1px;
        }

        .status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #54ff9d;
          box-shadow: 0 0 12px #54ff9d;
        }

        .hero {
          text-align: center;
          margin-bottom: 42px;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.04);
          color: rgba(255, 255, 255, 0.55);
          font-size: 10px;
          letter-spacing: 1.5px;
          margin-bottom: 22px;
        }

        .hero-badge span {
          color: #a88cff;
        }

        .hero h1 {
          margin: 0;
          font-size: clamp(42px, 7vw, 76px);
          line-height: 1.02;
          letter-spacing: -3px;
          font-weight: 900;
        }

        .hero h1 span {
          background: linear-gradient(
            90deg,
            #ffffff,
            #a88cff,
            #63dfff,
            #ffffff
          );
          background-size: 250% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: textGradient 5s linear infinite;
        }

        .hero p {
          max-width: 540px;
          margin: 22px auto 0;
          color: rgba(255, 255, 255, 0.52);
          font-size: 14px;
          line-height: 1.9;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.055);
          border: 1px solid rgba(255, 255, 255, 0.11);
          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);
          box-shadow:
            0 30px 100px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.06);
        }

        .voice-card {
          border-radius: 28px;
          padding: 28px;
        }

        .section-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 18px;
        }

        .section-title h2 {
          margin: 0;
          font-size: 17px;
          font-weight: 700;
        }

        .section-title p {
          margin: 5px 0 0;
          color: rgba(255, 255, 255, 0.4);
          font-size: 11px;
        }

        .character-counter {
          color: rgba(255, 255, 255, 0.35);
          font-size: 11px;
          white-space: nowrap;
        }

        .character-counter strong {
          color: #a88cff;
        }

        .textarea-wrapper {
          position: relative;
        }

        textarea {
          width: 100%;
          min-height: 190px;
          resize: vertical;
          border: 1px solid rgba(255, 255, 255, 0.1);
          outline: none;
          border-radius: 20px;
          padding: 20px;
          background: rgba(0, 0, 0, 0.22);
          color: white;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 15px;
          line-height: 2;
          position: relative;
          z-index: 1;
          transition:
            border-color 0.25s ease,
            box-shadow 0.25s ease;
        }

        textarea::placeholder {
          color: rgba(255, 255, 255, 0.24);
        }

        textarea:focus {
          border-color: rgba(130, 100, 255, 0.5);
          box-shadow:
            0 0 0 4px rgba(110, 80, 255, 0.07),
            0 0 35px rgba(110, 80, 255, 0.08);
        }

        .textarea-glow {
          position: absolute;
          width: 120px;
          height: 120px;
          right: -30px;
          top: -30px;
          border-radius: 50%;
          background: #6e50ff;
          filter: blur(80px);
          opacity: 0.12;
        }

        .voice-selection {
          margin-top: 28px;
        }

        .selection-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .selection-heading h3 {
          margin: 0;
          font-size: 14px;
        }

        .selection-heading span {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.35);
        }

        .voice-options {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        .voice-option {
          position: relative;
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 14px;
          text-align: right;
          border-radius: 17px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.035);
          color: white;
          cursor: pointer;
          transition:
            transform 0.25s ease,
            border-color 0.25s ease,
            background 0.25s ease;
        }

        .voice-option:hover {
          transform: translateY(-2px);
          border-color: rgba(255, 255, 255, 0.18);
          background: rgba(255, 255, 255, 0.06);
        }

        .voice-option.selected {
          border-color: rgba(130, 100, 255, 0.55);
          background: rgba(110, 80, 255, 0.1);
          box-shadow: 0 0 25px rgba(110, 80, 255, 0.08);
        }

        .voice-icon {
          width: 38px;
          height: 38px;
          min-width: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.06);
          font-size: 17px;
        }

        .voice-icon .custom-icon {
          width: 25px;
          height: 25px;
          display: block;
        }

        .voice-icon .flame-icon {
          filter: drop-shadow(0 0 7px rgba(163, 108, 255, 0.45));
        }

        .voice-icon .lightning-icon {
          width: 24px;
          height: 24px;
          filter: drop-shadow(0 0 7px rgba(99, 223, 255, 0.4));
        }

        .voice-info {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .voice-info strong {
          font-size: 12px;
        }

        .voice-info span {
          font-size: 9px;
          color: rgba(255, 255, 255, 0.38);
          white-space: nowrap;
        }

        .radio {
          margin-left: auto;
          width: 16px;
          height: 16px;
          min-width: 16px;
          border: 1px solid rgba(255, 255, 255, 0.25);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .radio span {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #9c82ff;
          box-shadow: 0 0 10px rgba(156, 130, 255, 0.8);
        }

        .generate-button {
          width: 100%;
          margin-top: 24px;
          height: 58px;
          border: none;
          border-radius: 17px;
          background: linear-gradient(100deg, #6e50ff, #8d63ff, #3bcfff);
          color: white;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          box-shadow:
            0 15px 40px rgba(110, 80, 255, 0.25),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease,
            opacity 0.25s ease;
        }

        .generate-button:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow:
            0 20px 55px rgba(110, 80, 255, 0.35),
            inset 0 1px 0 rgba(255, 255, 255, 0.25);
        }

        .generate-button:disabled {
          cursor: wait;
          opacity: 0.75;
        }

        .button-icon {
          font-size: 16px;
        }

        .button-arrow {
          font-size: 19px;
          transition: transform 0.2s ease;
        }

        .generate-button:hover .button-arrow {
          transform: translateX(4px);
        }

        .spinner {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          animation: spin 0.7s linear infinite;
        }

        .error-box {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 14px;
          padding: 13px 15px;
          border-radius: 13px;
          background: rgba(255, 70, 90, 0.08);
          border: 1px solid rgba(255, 70, 90, 0.15);
          color: rgba(255, 170, 180, 0.9);
        }

        .error-box span {
          font-size: 16px;
        }

        .error-box p {
          margin: 0;
          font-size: 11px;
          line-height: 1.7;
        }

        .audio-result {
          margin-top: 20px;
          padding: 18px;
          border-radius: 19px;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(84, 255, 157, 0.12);
        }

        .audio-result-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }

        .audio-result-header div:first-child {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .audio-result-header strong {
          font-size: 13px;
        }

        .audio-result-header span {
          font-size: 9px;
          color: rgba(255, 255, 255, 0.35);
          letter-spacing: 1px;
        }

        .success-icon {
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: rgba(84, 255, 157, 0.1);
          color: #54ff9d;
        }

        audio {
          width: 100%;
          height: 42px;
        }

        .download-button {
          width: 100%;
          margin-top: 12px;
          padding: 12px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.05);
          color: white;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .download-button:hover {
          background: rgba(255, 255, 255, 0.09);
        }

        .features {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-top: 18px;
        }

        .feature {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 15px;
          border-radius: 17px;
          background: rgba(255, 255, 255, 0.035);
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .feature > span {
          font-size: 18px;
        }

        .feature > span.custom-feature {
          width: 23px;
          height: 23px;
          min-width: 23px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .custom-feature-icon {
          width: 22px;
          height: 22px;
          display: block;
        }

        .lightning-icon {
          filter: drop-shadow(0 0 7px rgba(99, 223, 255, 0.45));
        }

        .lock-icon {
          filter: drop-shadow(0 0 7px rgba(163, 108, 255, 0.4));
        }

        .microphone-feature {
          font-size: 18px;
        }

        .feature div {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .feature strong {
          font-size: 11px;
        }

        .feature small {
          color: rgba(255, 255, 255, 0.32);
          font-size: 9px;
        }

        .back-home-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          width: fit-content;
          margin: 28px auto 0;
          padding: 11px 18px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          color: rgba(255, 255, 255, 0.58);
          text-decoration: none;
          font-size: 11px;
          transition:
            transform 0.25s ease,
            border-color 0.25s ease,
            background 0.25s ease,
            color 0.25s ease,
            box-shadow 0.25s ease;
        }

        .back-home-button:hover {
          transform: translateY(-2px);
          border-color: rgba(168, 140, 255, 0.35);
          background: rgba(110, 80, 255, 0.08);
          color: rgba(255, 255, 255, 0.85);
          box-shadow: 0 10px 30px rgba(110, 80, 255, 0.12);
        }

        .back-home-arrow {
          font-size: 17px;
          line-height: 1;
          transition: transform 0.25s ease;
        }

        .back-home-button:hover .back-home-arrow {
          transform: translateX(3px);
        }

        footer {
          text-align: center;
          margin-top: 35px;
          color: rgba(255, 255, 255, 0.25);
          font-size: 9px;
          letter-spacing: 0.5px;
        }

        footer strong {
          color: rgba(255, 255, 255, 0.45);
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes textGradient {
          to {
            background-position: 250% center;
          }
        }

        @keyframes floatOne {
          from {
            transform: translate(0, 0);
          }
          to {
            transform: translate(60px, 50px);
          }
        }

        @keyframes floatTwo {
          from {
            transform: translate(0, 0);
          }
          to {
            transform: translate(-50px, -40px);
          }
        }

        @keyframes floatThree {
          from {
            transform: translate(0, 0);
          }
          to {
            transform: translate(40px, -50px);
          }
        }

        @media (max-width: 700px) {
          .voice-page {
            padding: 20px 14px 35px;
          }

          .voice-header {
            margin-bottom: 50px;
          }

          .hero h1 {
            font-size: 46px;
            letter-spacing: -2px;
          }

          .hero p {
            font-size: 12px;
          }

          .voice-card {
            padding: 18px;
            border-radius: 22px;
          }

          .voice-options {
            grid-template-columns: 1fr;
          }

          .voice-option {
            padding: 13px;
          }

          .features {
            grid-template-columns: 1fr;
          }

          .feature {
            padding: 13px;
          }

          textarea {
            min-height: 170px;
          }
        }

        @media (max-width: 400px) {
          .hero h1 {
            font-size: 40px;
          }

          .brand-subtitle {
            font-size: 8px;
          }

          .status {
            font-size: 8px;
          }
        }
      `}</style>
    </main>
  );
}
