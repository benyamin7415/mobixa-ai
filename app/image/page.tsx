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
        err?.message || "خطایی هنگام ساخت تصویر رخ داد."
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

      {/* Background */}
      <div className="bg-glow bg-glow-1" />
      <div className="bg-glow bg-glow-2" />

      <div className="image-wrapper">

        {/* Header */}
        <div className="image-header">

          <div className="image-label">
            MOBIXA IMAGE LAB
          </div>

          <h1>
            ایده بده و{" "}
            <span>عکس تحویل بگیر</span>
          </h1>

          <p>
            ایده‌ات را بنویس و بگذار موبیکسا آن را به تصویر تبدیل کند.
          </p>

        </div>

        {/* Prompt Box */}
        <div className="prompt-box">

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="ایده‌ی تصویرت رو اینجا بنویس..."
            maxLength={2048}
            disabled={loading}
          />

          <div className="prompt-footer">

            <div className="counter">
              {prompt.length}/2048
            </div>

            {/* SEND BUTTON */}
            <div className="send-button-wrapper">

              {/* فقط حاشیه نوری چرخان */}
              <div className="rotating-border" />

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
                    width="21"
                    height="21"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
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
        </div>

        {/* Error */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Generated Image */}
        {image && (
          <div className="result">

            <div className="image-card">
              <img
                src={image}
                alt="تصویر ساخته شده توسط موبیکسا"
              />
            </div>

            {/* فقط دو گزینه کوچک زیر عکس */}
            <div className="image-actions">

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

                <span>دانلود</span>
              </button>

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
                  <path d="M20 11a8 8 0 0 0-15.5-2" />
                  <path d="M4 4v5h5" />
                  <path d="M4 13a8 8 0 0 0 15.5 2" />
                  <path d="M20 20v-5h-5" />
                </svg>

                <span>تلاش مجدد</span>
              </button>

            </div>

          </div>
        )}

      </div>

      <style jsx>{`

        * {
          box-sizing: border-box;
        }

        .image-page {
          min-height: 100vh;
          width: 100%;
          position: relative;
          overflow-x: hidden;

          background:
            radial-gradient(
              circle at 50% 10%,
              rgba(112, 88, 255, 0.10),
              transparent 35%
            ),
            #050507;

          color: white;
          direction: rtl;
          padding: 70px 20px 100px;
        }

        .image-wrapper {
          width: min(850px, 100%);
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }

        /* Background glow */

        .bg-glow {
          position: absolute;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.10;
          pointer-events: none;
        }

        .bg-glow-1 {
          top: -180px;
          right: -150px;
          background: #735cff;
        }

        .bg-glow-2 {
          bottom: -200px;
          left: -150px;
          background: #00bfff;
        }

        /* Header */

        .image-header {
          text-align: center;
          margin-bottom: 35px;
        }

        .image-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 3px;
          color: rgba(170, 155, 255, 0.7);
          direction: ltr;
          margin-bottom: 13px;
        }

        .image-header h1 {
          margin: 0;
          font-size: clamp(32px, 6vw, 52px);
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
          margin: 14px auto 0;
          max-width: 500px;
          color: rgba(255, 255, 255, 0.43);
          font-size: 13px;
          line-height: 1.9;
        }

        /* Prompt */

        .prompt-box {
          width: 100%;
          border-radius: 24px;

          background:
            rgba(255, 255, 255, 0.045);

          border: 1px solid rgba(255, 255, 255, 0.09);

          padding: 15px;

          backdrop-filter: blur(20px);

          box-shadow:
            0 25px 70px rgba(0, 0, 0, 0.35),
            inset 0 1px rgba(255, 255, 255, 0.035);

          transition: border-color 0.25s ease;
        }

        .prompt-box:focus-within {
          border-color: rgba(135, 115, 255, 0.32);
        }

        .prompt-box textarea {
          width: 100%;
          min-height: 135px;

          resize: vertical;

          border: none;
          outline: none;

          background: transparent;

          color: white;

          font-family: inherit;
          font-size: 15px;
          line-height: 2;

          padding: 8px;

          direction: rtl;
        }

        .prompt-box textarea::placeholder {
          color: rgba(255, 255, 255, 0.25);
        }

        .prompt-box textarea:disabled {
          opacity: 0.55;
        }

        .prompt-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;

          direction: ltr;

          padding: 7px 5px 2px;
        }

        .counter {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.25);
          direction: ltr;
        }

        /* Send button */

        .send-button-wrapper {
          position: relative;
          width: 53px;
          height: 53px;

          display: flex;
          align-items: center;
          justify-content: center;
        }

        /*
          این فقط همان حاشیه نوری است.
          خود دکمه دست نخورده باقی می‌ماند.
        */

        .rotating-border {
          position: absolute;

          width: 63px;
          height: 63px;

          border-radius: 21px;

          background:
            conic-gradient(
              from 0deg,
              transparent 0deg,
              transparent 220deg,
              rgba(156, 137, 255, 0.05) 245deg,
              rgba(156, 137, 255, 0.95) 300deg,
              rgba(111, 217, 255, 0.9) 330deg,
              transparent 360deg
            );

          animation: rotate-light 1.7s linear infinite;

          filter: blur(1px);

          pointer-events: none;

          z-index: 0;
        }

        /*
          وسط حاشیه را خالی می‌کنیم تا فقط
          یک حلقه نور دور دکمه دیده شود.
        */

        .rotating-border::after {
          content: "";

          position: absolute;

          inset: 2px;

          border-radius: 19px;

          background: #050507;
        }

        .send-button {
          position: relative;
          z-index: 2;

          width: 53px;
          height: 53px;

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
            0 8px 30px rgba(101, 76, 255, 0.32);

          transition:
            transform 0.2s ease,
            opacity 0.2s ease;
        }

        .send-button:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        .send-button:disabled {
          cursor: not-allowed;
          opacity: 0.35;
          box-shadow: none;
        }

        @keyframes rotate-light {
          to {
            transform: rotate(360deg);
          }
        }

        .button-spinner {
          width: 19px;
          height: 19px;

          border-radius: 50%;

          border:
            2px solid rgba(255, 255, 255, 0.3);

          border-top-color: white;

          animation:
            button-spin 0.75s linear infinite;
        }

        @keyframes button-spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* Error */

        .error-message {
          margin-top: 15px;
          padding: 12px 15px;

          border-radius: 13px;

          background: rgba(255, 70, 70, 0.07);
          border: 1px solid rgba(255, 70, 70, 0.15);

          color: #ff9b9b;

          font-size: 12px;
          text-align: center;
        }

        /* Result */

        .result {
          margin-top: 40px;
        }

        .image-card {
          width: 100%;
          overflow: hidden;

          border-radius: 23px;

          background: rgba(255, 255, 255, 0.03);

          border:
            1px solid rgba(255, 255, 255, 0.09);

          box-shadow:
            0 30px 80px rgba(0, 0, 0, 0.42);
        }

        .image-card img {
          display: block;
          width: 100%;
          height: auto;
        }

        /* Small buttons */

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

          padding: 0 12px;

          display: flex;
          align-items: center;
          justify-content: center;

          gap: 7px;

          border-radius: 10px;

          border:
            1px solid rgba(255, 255, 255, 0.08);

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

          transform: translateY(-1px);
        }

        .small-action:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        /* Mobile */

        @media (max-width: 600px) {

          .image-page {
            padding:
              45px 14px 70px;
          }

          .image-header {
            margin-bottom: 27px;
          }

          .image-header h1 {
            font-size: 31px;
          }

          .image-header p {
            font-size: 12px;
          }

          .prompt-box {
            border-radius: 21px;
            padding: 12px;
          }

          .prompt-box textarea {
            min-height: 120px;
            font-size: 14px;
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
