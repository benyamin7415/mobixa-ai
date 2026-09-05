"use client";

import { useState } from "react";

export default function Home() {
  const [active, setActive] = useState<"chat" | "image" | null>(null);

  return (
    <main className="mobixa-page">
      {/* Animated background */}
      <div className="background">
        <div className="orb orb-one" />
        <div className="orb orb-two" />
        <div className="orb orb-three" />

        <div className="grid" />

        {Array.from({ length: 30 }).map((_, i) => (
          <span
            key={i}
            className="particle"
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${(i * 61) % 100}%`,
              animationDelay: `${(i % 8) * 0.7}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="header">
        <div className="logo">
          <span className="logo-mark">M</span>
          <span className="logo-text">MOBIXA</span>
          <span className="logo-ai">AI</span>
        </div>

        <div className="status">
          <span className="status-dot" />
          هوش مصنوعی آماده است
        </div>
      </header>

      {/* Main */}
      <section className="hero">
        <div className="hero-badge">
          <span>✦</span>
          آینده، همین حالاست
        </div>

        <h1>
          هوش مصنوعی،
          <br />
          <span>به سبک موبیکسا</span>
        </h1>

        <p className="subtitle">
          با موبیکسا فکر کن، خلق کن و ایده‌هات رو به واقعیت تبدیل کن.
        </p>

        {/* Feature cards */}
        <div className="features">
          <button
            className="feature-card chat-card"
            onClick={() => setActive("chat")}
          >
            <div className="card-glow" />

            <div className="icon-box">
              <span>✦</span>
            </div>

            <div className="card-content">
              <span className="card-number">01</span>
              <h2>چت با هوش مصنوعی</h2>
              <p>
                گفتگو کن، سؤال بپرس و ایده‌هات رو با هوش مصنوعی توسعه بده.
              </p>
            </div>

            <div className="arrow">↗</div>
          </button>

          <button
            className="feature-card image-card"
            onClick={() => setActive("image")}
          >
            <div className="card-glow" />

            <div className="icon-box image-icon">
              <span>◈</span>
            </div>

            <div className="card-content">
              <span className="card-number">02</span>
              <h2>ساخت تصویر</h2>
              <p>
                چیزی که تصور می‌کنی رو توصیف کن و اجازه بده موبیکسا خلقش کنه.
              </p>
            </div>

            <div className="arrow">↗</div>
          </button>
        </div>

        <div className="hint">
          <span>انتخاب کن و شروع کن</span>
          <div className="hint-line" />
        </div>
      </section>

      {/* Modal */}
      {active && (
        <div className="modal-backdrop" onClick={() => setActive(null)}>
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close-button"
              onClick={() => setActive(null)}
              aria-label="بستن"
            >
              ×
            </button>

            {active === "chat" ? (
              <>
                <div className="modal-icon">✦</div>

                <span className="modal-label">MOBIXA AI</span>

                <h2>خوش اومدی 👋</h2>

                <p>
                  من موبیکسا هستم.
                  <br />
                  آماده‌ام باهات گفتگو کنم.
                </p>

                <div className="suggestions">
                  <button>💡 یه ایده بهم بده</button>
                  <button>📝 یه متن برام بنویس</button>
                  <button>📚 یه موضوع رو توضیح بده</button>
                </div>

                <div className="chat-input">
                  <span>پیامت رو اینجا بنویس...</span>
                  <button>↑</button>
                </div>
              </>
            ) : (
              <>
                <div className="modal-icon image-modal-icon">◈</div>

                <span className="modal-label">MOBIXA CREATE</span>

                <h2>ایده‌ات رو بساز ✨</h2>

                <p>
                  تصویری که توی ذهنت داری رو توصیف کن.
                </p>

                <div className="prompt-box">
                  <span>
                    مثلاً: یک شهر آینده‌نگر در شب با نورهای نئونی...
                  </span>
                </div>

                <div className="image-options">
                  <button>مربع</button>
                  <button>عمودی</button>
                  <button>افقی</button>
                </div>

                <button className="generate-button">
                  ✦ ساخت تصویر
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="footer-line" />

        <div className="signature">
          <span>Crafted by</span>
          <strong>BENYAMIN</strong>
        </div>

        <p>Built with curiosity. Designed for the future.</p>
      </footer>
    </main>
  );
}
