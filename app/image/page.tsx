"use client";

import { useState } from "react";

export default function ImagePage() {
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateImage = async (retryPrompt?: string) => {
    const finalPrompt = (retryPrompt ?? prompt).trim();

    if (!finalPrompt || loading) return;

    setLoading(true);
    setError("");

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
    } catch (err: any) {
      setError(
        err?.message || "یه مشکلی پیش اومد، دوباره امتحان کن."
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (!image) return;

    const link = document.createElement("a");

    link.href = image;
    link.download = "mobixa-image.jpg";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  };

  const retryImage = () => {
    if (!prompt.trim() || loading) return;

    generateImage(prompt);
  };

  return (
    <main className="image-page">

      {/* =========================
          BACKGROUND GLOWS
      ========================= */}

      <div className="bg-glow bg-glow-1" />
      <div className="bg-glow bg-glow-2" />

      <div className="image-wrapper">

        {/* =========================
            HEADER
        ========================= */}

        <header className="image-header">

          <div className="image-label">
            MOBIXA IMAGE LAB
          </div>

          <h1>
            ایده بده و{" "}
            <span>عکس تحویل بگیر</span>
          </h1>

          <p>
            یه ایده بده، موبیکسا تصویرشو برات می‌سازه.
          </p>

        </header>


        {/* =========================
            PROMPT BOX
        ========================= */}

        <section className="prompt-box">

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={`خب، چی تو ذهنت داری؟
بزن بریم بسازیمش...`}
            maxLength={2048}
            disabled={loading}
          />


          <div className="prompt-footer">

            <div className="counter">
              {prompt.length}/2048
            </div>


            {/* =========================
                SEND BUTTON
            ========================= */}

            <div className="send-button-wrapper">

              {/* نور چرخان واقعی دور دکمه */}
              <div className="send-light-ring" />

              <button
                className="send-button"
                onClick={() => generateImage()}
                disabled={!prompt.trim() || loading}
                aria-label="ساخت تصویر"
              >

                {loading ? (
                  <span className="button-spinner" />
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    width="22"
                    height="22"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 2 11 13" />
                    <path d="m22 2-7 20-4-9-9-4Z" />
                  </svg>
                )}

              </button>

            </div>

          </div>

        </section>


        {/* =========================
            ERROR
        ========================= */}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}


        {/* =========================
            GENERATED IMAGE
        ========================= */}

        {image && (
          <section className="result">

            <div className="image-card">

              <img
                src={image}
                alt="تصویر ساخته شده توسط موبیکسا"
              />

            </div>


            {/* =========================
                IMAGE ACTIONS
            ========================= */}

            <div className="image-actions">

              {/* DOWNLOAD */}

              <button
                className="small-action"
                onClick={downloadImage}
              >

                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 3v12" />
                  <path d="m7 10 5 5 5-5" />
                  <path d="M5 21h14" />
                </svg>

                <span>
                  دانلود
                </span>

              </button>


              {/* RETRY */}

              <button
                className="small-action"
                onClick={retryImage}
                disabled={loading}
              >

                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 11a8.1 8.1 0 0 0-15.5-2" />
                  <path d="M4 4v5h5" />
                  <path d="M4 13a8.1 8.1 0 0 0 15.5 2" />
                  <path d="M20 20v-5h-5" />
                </svg>

                <span>
                  تلاش مجدد
                </span>

              </button>

            </div>

          </section>
        )}

      </div>


      {/* =========================
          STYLES
      ========================= */}

      <style jsx>{`

        * {
          box-sizing: border-box;
        }


        /* =================================
           PAGE
        ================================= */

        .image-page {
          min-height: 100vh;

          width: 100%;

          position: relative;

          overflow-x: hidden;

          background:
            radial-gradient(
              circle at 50% 4%,
              rgba(112, 88, 255, 0.12),
              transparent 36%
            ),
            #050507;

          color: white;

          direction: rtl;

          padding:
            70px 20px 120px;
        }


        /* =================================
           MAIN WRAPPER
        ================================= */

        .image-wrapper {
          width: min(850px, 100%);

          margin: 0 auto;

          position: relative;

          z-index: 2;
        }


        /* =================================
           BACKGROUND GLOW
        ================================= */

        .bg-glow {
          position: absolute;

          width: 420px;

          height: 420px;

          border-radius: 50%;

          filter: blur(125px);

          opacity: 0.09;

          pointer-events: none;
        }


        .bg-glow-1 {
          top: -180px;

          right: -160px;

          background: #735cff;
        }


        .bg-glow-2 {
          bottom: -200px;

          left: -160px;

          background: #00bfff;
        }


        /* =================================
           HEADER
        ================================= */

        .image-header {
          text-align: center;

          margin-bottom: 0;
        }


        .image-label {
          font-size: 10px;

          font-weight: 700;

          letter-spacing: 3px;

          color:
            rgba(170, 155, 255, 0.72);

          direction: ltr;

          margin-bottom: 14px;
        }


        .image-header h1 {
          margin: 0;

          font-size:
            clamp(32px, 6vw, 52px);

          font-weight: 850;

          letter-spacing: -1.5px;

          line-height: 1.25;
        }


        .image-header h1 span {
          background:
            linear-gradient(
              110deg,
              #ffffff,
              #a393ff,
              #6edcff
            );

          -webkit-background-clip: text;

          -webkit-text-fill-color: transparent;
        }


        .image-header p {
          margin:
            15px auto 0;

          max-width: 500px;

          color:
            rgba(255, 255, 255, 0.40);

          font-size: 13px;

          line-height: 1.9;
        }


        /* =================================
           PROMPT BOX

           عمداً خیلی پایین‌تر از هدر
        ================================= */

        .prompt-box {
          width: 100%;

          min-height: 210px;

          margin-top: 175px;

          border-radius: 25px;

          background:
            rgba(255, 255, 255, 0.045);

          border:
            1px solid
            rgba(255, 255, 255, 0.10);

          padding: 17px;

          backdrop-filter: blur(22px);

          -webkit-backdrop-filter: blur(22px);

          box-shadow:
            0 25px 75px
            rgba(0, 0, 0, 0.36),

            inset 0 1px
            rgba(255, 255, 255, 0.035);

          transition:
            border-color 0.25s ease,
            box-shadow 0.25s ease;
        }


        .prompt-box:focus-within {
          border-color:
            rgba(135, 115, 255, 0.32);

          box-shadow:
            0 30px 85px
            rgba(0, 0, 0, 0.42),

            0 0 35px
            rgba(115, 92, 255, 0.05),

            inset 0 1px
            rgba(255, 255, 255, 0.035);
        }


        /* =================================
           TEXTAREA
        ================================= */

        .prompt-box textarea {
          width: 100%;

          height: 150px;

          resize: none;

          border: none;

          outline: none;

          background: transparent;

          color: white;

          font-family: inherit;

          font-size: 16px;

          line-height: 1.9;

          padding: 8px;

          direction: rtl;
        }


        .prompt-box textarea::placeholder {
          color:
            rgba(255, 255, 255, 0.32);

          opacity: 1;

          white-space: pre-line;
        }


        .prompt-box textarea:disabled {
          opacity: 0.55;
        }


        /* =================================
           PROMPT FOOTER
        ================================= */

        .prompt-footer {
          height: 42px;

          display: flex;

          align-items: center;

          justify-content: space-between;

          direction: ltr;

          padding:
            0 5px;
        }


        .counter {
          font-size: 10px;

          color:
            rgba(255, 255, 255, 0.25);

          direction: ltr;
        }


        /* =================================
           SEND BUTTON WRAPPER
        ================================= */

        .send-button-wrapper {
          position: relative;

          width: 61px;

          height: 61px;

          display: flex;

          align-items: center;

          justify-content: center;

          isolation: isolate;
        }


        /* =================================
           REAL ROTATING LIGHT RING

           این دیگه مربع جدا نیست.
           دقیقاً حاشیه‌ی خود دکمه است.
        ================================= */

        .send-light-ring {
          position: absolute;

          inset: 0;

          border-radius: 21px;

          background:
            conic-gradient(
              from 0deg,

              transparent 0deg,

              transparent 35deg,

              rgba(104, 78, 255, 0.08) 65deg,

              rgba(115, 92, 255, 0.95) 115deg,

              rgba(111, 217, 255, 1) 165deg,

              rgba(130, 110, 255, 0.35) 210deg,

              transparent 270deg,

              transparent 360deg
            );

          animation:
            send-ring-rotate
            2.2s
            linear
            infinite;

          filter:
            drop-shadow(
              0 0 5px
              rgba(115, 92, 255, 0.55)
            );

          pointer-events: none;

          z-index: 0;
        }


        /* هاله‌ی نرم‌تر پشت نور */

        .send-light-ring::before {
          content: "";

          position: absolute;

          inset: -4px;

          border-radius: 24px;

          background:
            conic-gradient(
              from 0deg,

              transparent 0deg,

              transparent 70deg,

              rgba(115, 92, 255, 0.45) 130deg,

              rgba(111, 217, 255, 0.55) 175deg,

              transparent 245deg,

              transparent 360deg
            );

          filter: blur(7px);

          opacity: 0.55;

          z-index: -1;
        }


        /*
          مرکز رینگ خالی می‌شود
          تا فقط خود حاشیه دیده شود
        */

        .send-light-ring::after {
          content: "";

          position: absolute;

          inset: 3px;

          border-radius: 18px;

          background: #050507;
        }


        /* =================================
           SEND BUTTON
        ================================= */

        .send-button {
          position: relative;

          z-index: 2;

          width: 55px;

          height: 55px;

          border: none;

          border-radius: 17px;

          display: flex;

          align-items: center;

          justify-content: center;

          color: white;

          cursor: pointer;

          background:
            linear-gradient(
              145deg,
              #735cff,
              #4d3ad9
            );

          box-shadow:
            0 8px 30px
            rgba(101, 76, 255, 0.32),

            inset 0 1px
            rgba(255, 255, 255, 0.12);

          transition:
            transform 0.2s ease,
            opacity 0.2s ease,
            box-shadow 0.2s ease;
        }


        .send-button:hover:not(:disabled) {
          transform:
            translateY(-1px);

          box-shadow:
            0 10px 35px
            rgba(101, 76, 255, 0.42),

            inset 0 1px
            rgba(255, 255, 255, 0.15);
        }


        .send-button:active:not(:disabled) {
          transform:
            scale(0.96);
        }


        .send-button:disabled {
          cursor: not-allowed;

          opacity: 0.38;

          box-shadow:
            none;
        }


        /* =================================
           RING ANIMATION
        ================================= */

        @keyframes send-ring-rotate {

          from {
            transform:
              rotate(0deg);
          }

          to {
            transform:
              rotate(360deg);
          }

        }


        /* =================================
           LOADING SPINNER
        ================================= */

        .button-spinner {
          width: 19px;

          height: 19px;

          border-radius: 50%;

          border:
            2px solid
            rgba(255, 255, 255, 0.28);

          border-top-color:
            white;

          animation:
            button-spin
            0.75s
            linear
            infinite;
        }


        @keyframes button-spin {

          to {
            transform:
              rotate(360deg);
          }

        }


        /* =================================
           ERROR
        ================================= */

        .error-message {
          margin-top: 15px;

          padding:
            12px 15px;

          border-radius: 13px;

          background:
            rgba(255, 70, 70, 0.07);

          border:
            1px solid
            rgba(255, 70, 70, 0.15);

          color:
            #ff9b9b;

          font-size: 12px;

          text-align: center;
        }


        /* =================================
           RESULT
        ================================= */

        .result {
          margin-top: 40px;
        }


        .image-card {
          width: 100%;

          overflow: hidden;

          border-radius: 23px;

          background:
            rgba(255, 255, 255, 0.03);

          border:
            1px solid
            rgba(255, 255, 255, 0.09);

          box-shadow:
            0 30px 80px
            rgba(0, 0, 0, 0.42);
        }


        .image-card img {
          display: block;

          width: 100%;

          height: auto;
        }


        /* =================================
           IMAGE ACTIONS
        ================================= */

        .image-actions {
          display: flex;

          justify-content: center;

          align-items: center;

          gap: 8px;

          margin-top: 10px;
        }


        .small-action {
          min-width: 105px;

          height: 34px;

          padding:
            0 12px;

          display: flex;

          align-items: center;

          justify-content: center;

          gap: 7px;

          border-radius: 10px;

          border:
            1px solid
            rgba(255, 255, 255, 0.08);

          background:
            rgba(255, 255, 255, 0.045);

          color:
            rgba(255, 255, 255, 0.72);

          font-family: inherit;

          font-size: 11px;

          font-weight: 600;

          cursor: pointer;

          transition:
            background 0.2s ease,
            border-color 0.2s ease,
            color 0.2s ease,
            transform 0.2s ease;
        }


        .small-action:hover:not(:disabled) {
          background:
            rgba(255, 255, 255, 0.085);

          border-color:
            rgba(255, 255, 255, 0.16);

          color: white;

          transform:
            translateY(-1px);
        }


        .small-action:disabled {
          opacity: 0.4;

          cursor: not-allowed;
        }


        /* =================================
           MOBILE
        ================================= */

        @media (max-width: 600px) {

          .image-page {
            padding:
              45px 14px 80px;
          }


          .image-header {
            margin-bottom: 0;
          }


          .image-header h1 {
            font-size: 31px;
          }


          .image-header p {
            font-size: 12px;
          }


          /* کادر روی موبایل هم خیلی پایین‌تر */

          .prompt-box {
            min-height: 195px;

            margin-top: 145px;

            border-radius: 21px;

            padding: 13px;
          }


          .prompt-box textarea {
            height: 135px;

            font-size: 14px;
          }


          .send-button-wrapper {
            width: 59px;

            height: 59px;
          }


          .send-button {
            width: 53px;

            height: 53px;

            border-radius: 16px;
          }


          .send-light-ring {
            border-radius: 20px;
          }


          .send-light-ring::after {
            border-radius: 17px;
          }


          .small-action {
            min-width: 100px;

            height: 33px;
          }

        }

      `}</style>

    </main>
  );
}
