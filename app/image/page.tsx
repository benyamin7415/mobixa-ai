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
        err?.message ||
          "یه مشکلی پیش اومد، دوباره امتحان کن."
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

      setError(
        "دانلود تصویر انجام نشد. دوباره امتحان کن."
      );
    }
  };

  const retryImage = () => {
    if (!prompt.trim() || loading) return;

    generateImage(prompt);
  };

  return (
    <main className="image-page">

      {/* ================================
          FUTURISTIC BACKGROUND
      ================================= */}

      <div className="space-noise" />

      <div className="ambient ambient-purple" />
      <div className="ambient ambient-blue" />

      <div className="aurora aurora-one" />
      <div className="aurora aurora-two" />
      <div className="aurora aurora-three" />

      <div className="light-line line-one">
        <span />
      </div>

      <div className="light-line line-two">
        <span />
      </div>

      <div className="light-line line-three">
        <span />
      </div>

      <div className="light-dot dot-one" />
      <div className="light-dot dot-two" />
      <div className="light-dot dot-three" />
      <div className="light-dot dot-four" />
      <div className="light-dot dot-five" />


      {/* ================================
          MAIN
      ================================= */}

      <div className="image-wrapper">


        {/* ================================
            HEADER
        ================================= */}

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


        {/* ================================
            PROMPT
        ================================= */}

        <section className="prompt-box">

          <textarea
            value={prompt}
            onChange={(e) =>
              setPrompt(e.target.value)
            }
            placeholder={`خب، چی تو ذهنت داری؟
بزن بریم بسازیمش...`}
            maxLength={2048}
            disabled={loading}
          />


          <div className="prompt-footer">

            <div className="counter">
              {prompt.length}/2048
            </div>


            {/* ============================
                SEND BUTTON
            ============================= */}

            <div className="send-button-wrapper">

              <div
                className={
                  prompt.trim()
                    ? "send-light active"
                    : "send-light"
                }
              />

              <button
                className="send-button"
                onClick={() =>
                  generateImage()
                }
                disabled={
                  !prompt.trim() ||
                  loading
                }
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


        {/* ================================
            GENERATING
        ================================= */}

        {loading && (

          <div className="generating-state">

            <div className="generating-orb">

              <div className="generating-ring ring-one" />

              <div className="generating-ring ring-two" />

              <div className="generating-ring ring-three" />


              <div className="generating-core">

                <div className="core-icon">

                  <svg
                    viewBox="0 0 24 24"
                    width="22"
                    height="22"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >

                    <path d="M12 3v18" />

                    <path d="M3 12h18" />

                    <path d="m5.6 5.6 12.8 12.8" />

                    <path d="m18.4 5.6-12.8 12.8" />

                  </svg>

                </div>

              </div>

            </div>


            <div className="generating-text">
              در حال ساخت تصویر
            </div>


            <div className="generating-subtext">
              موبیکسا داره ایده‌تو تبدیل به تصویر می‌کنه...
            </div>


            <div className="generating-dots">

              <span />
              <span />
              <span />

            </div>

          </div>

        )}


        {/* ================================
            ERROR
        ================================= */}

        {error && (

          <div className="error-message">
            {error}
          </div>

        )}


        {/* ================================
            RESULT
        ================================= */}

        {image && !loading && (

          <section className="result">

            <div className="image-card">

              <img
                src={image}
                alt="تصویر ساخته شده توسط موبیکسا"
              />

            </div>


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


      {/* ================================
          STYLES
      ================================= */}

      <style jsx>{`

        * {
          box-sizing: border-box;
        }


        /* ================================
           PAGE
        ================================= */

        .image-page {
          position: relative;

          width: 100%;

          min-height: 100svh;

          overflow-x: hidden;

          direction: rtl;

          color: white;

          background:
            radial-gradient(
              ellipse at 50% -10%,
              rgba(70, 48, 170, 0.28),
              transparent 48%
            ),

            radial-gradient(
              ellipse at 0% 70%,
              rgba(0, 110, 210, 0.14),
              transparent 38%
            ),

            radial-gradient(
              ellipse at 100% 65%,
              rgba(90, 45, 190, 0.14),
              transparent 38%
            ),

            #030407;

          padding:
            68px 20px 80px;
        }


        /* ================================
           BACKGROUND NOISE
        ================================= */

        .space-noise {
          position: absolute;

          inset: 0;

          pointer-events: none;

          opacity: 0.14;

          background-image:
            radial-gradient(
              rgba(255,255,255,0.2) 0.7px,
              transparent 0.7px
            );

          background-size:
            95px 95px;

          mask-image:
            linear-gradient(
              to bottom,
              black,
              transparent 90%
            );
        }


        /* ================================
           AMBIENT
        ================================= */

        .ambient {
          position: absolute;

          width: 460px;

          height: 460px;

          border-radius: 50%;

          filter: blur(125px);

          pointer-events: none;
        }


        .ambient-purple {
          top: -260px;

          left: -180px;

          opacity: 0.22;

          background:
            rgba(91, 61, 255, 0.75);
        }


        .ambient-blue {
          right: -240px;

          bottom: -180px;

          opacity: 0.18;

          background:
            rgba(0, 128, 255, 0.7);
        }


        /* ================================
           AURORA
        ================================= */

        .aurora {
          position: absolute;

          pointer-events: none;

          border-radius: 50%;
        }


        .aurora-one {
          width: 1200px;

          height: 500px;

          left: -310px;

          top: 350px;

          border-top:
            1.5px solid
            rgba(105, 84, 255, 0.7);

          transform:
            rotate(18deg);

          filter:
            drop-shadow(
              0 0 9px
              rgba(96, 83, 255, 0.65)
            );

          opacity: 0.72;
        }


        .aurora-two {
          width: 950px;

          height: 400px;

          right: -330px;

          top: 430px;

          border-top:
            1.5px solid
            rgba(76, 162, 255, 0.72);

          transform:
            rotate(-23deg);

          filter:
            drop-shadow(
              0 0 10px
              rgba(48, 137, 255, 0.65)
            );

          opacity: 0.65;
        }


        .aurora-three {
          width: 1100px;

          height: 430px;

          left: -150px;

          bottom: -30px;

          border-top:
            1px solid
            rgba(73, 104, 255, 0.32);

          transform:
            rotate(11deg);

          filter:
            blur(1px);

          opacity: 0.45;
        }


        /* ================================
           LIGHT LINES
        ================================= */

        .light-line {
          position: absolute;

          width: 1px;

          pointer-events: none;

          background:
            linear-gradient(
              to bottom,
              transparent,
              rgba(111, 95, 255, 0.72),
              transparent
            );

          opacity: 0.55;
        }


        .light-line span {
          position: absolute;

          width: 4px;

          height: 4px;

          left: -1.5px;

          border-radius: 50%;

          background:
            #958aff;

          box-shadow:
            0 0 9px
            rgba(117, 106, 255, 1),

            0 0 20px
            rgba(73, 105, 255, 0.75);
        }


        .line-one {
          left: 8%;

          top: 30%;

          height: 220px;
        }


        .line-one span {
          bottom: 0;
        }


        .line-two {
          right: 15%;

          top: 43%;

          height: 190px;
        }


        .line-two span {
          top: 0;
        }


        .line-three {
          right: 9%;

          bottom: 18%;

          height: 190px;

          opacity: 0.3;
        }


        .line-three span {
          top: 0;
        }


        /* ================================
           LIGHT DOTS
        ================================= */

        .light-dot {
          position: absolute;

          width: 3px;

          height: 3px;

          border-radius: 50%;

          background:
            #8e86ff;

          box-shadow:
            0 0 8px
            rgba(113, 105, 255, 1),

            0 0 20px
            rgba(75, 110, 255, 0.7);

          pointer-events: none;
        }


        .dot-one {
          left: 7%;
          top: 64%;
        }


        .dot-two {
          right: 14%;
          top: 37%;
        }


        .dot-three {
          right: 8%;
          bottom: 28%;
        }


        .dot-four {
          left: 23%;
          top: 53%;
          opacity: 0.45;
        }


        .dot-five {
          right: 30%;
          top: 72%;
          opacity: 0.35;
        }


        /* ================================
           WRAPPER
        ================================= */

        .image-wrapper {
          position: relative;

          z-index: 5;

          width:
            min(850px, 100%);

          margin:
            0 auto;
        }


        /* ================================
           HEADER
        ================================= */

        .image-header {
          text-align: center;

          margin-bottom:
            62px;
        }


        .image-label {
          font-size: 10px;

          font-weight: 700;

          letter-spacing: 4px;

          color:
            rgba(169, 155, 255, 0.76);

          direction: ltr;

          margin-bottom: 15px;

          text-shadow:
            0 0 18px
            rgba(126, 102, 255, 0.32);
        }


        .image-header h1 {
          margin: 0;

          font-size:
            clamp(32px, 6vw, 52px);

          font-weight: 850;

          letter-spacing:
            -1.5px;

          line-height:
            1.25;
        }


        .image-header h1 span {
          background:
            linear-gradient(
              105deg,
              #ffffff,
              #b7a8ff,
              #5edcff,
              #ffffff
            );

          -webkit-background-clip:
            text;

          -webkit-text-fill-color:
            transparent;

          background-clip:
            text;
        }


        .image-header p {
          margin:
            16px auto 0;

          max-width:
            500px;

          color:
            rgba(255,255,255,0.38);

          font-size:
            13px;

          line-height:
            1.9;
        }


        /* ================================
           PROMPT BOX
        ================================= */

        .prompt-box {
          position: relative;

          width: 100%;

          min-height:
            205px;

          margin-top:
            0;

          border-radius:
            25px;

          background:
            linear-gradient(
              135deg,
              rgba(18,21,31,0.84),
              rgba(7,9,14,0.76)
            );

          border:
            1px solid
            rgba(255,255,255,0.105);

          padding:
            17px;

          backdrop-filter:
            blur(25px);

          -webkit-backdrop-filter:
            blur(25px);

          box-shadow:

            0 30px 100px
            rgba(0,0,0,0.56),

            inset 0 1px
            rgba(255,255,255,0.045),

            0 0 55px
            rgba(37,55,120,0.07);

          transition:
            border-color 0.25s ease,
            box-shadow 0.25s ease;
        }


        .prompt-box::before {
          content: "";

          position: absolute;

          inset: 0;

          border-radius:
            inherit;

          pointer-events:
            none;

          background:
            linear-gradient(
              115deg,
              rgba(95,74,255,0.08),
              transparent 35%,
              transparent 70%,
              rgba(0,176,255,0.07)
            );
        }


        .prompt-box:focus-within {
          border-color:
            rgba(128,111,255,0.34);

          box-shadow:

            0 30px 100px
            rgba(0,0,0,0.58),

            0 0 55px
            rgba(82,76,255,0.09),

            inset 0 1px
            rgba(255,255,255,0.05);
        }


        /* ================================
           TEXTAREA
        ================================= */

        .prompt-box textarea {
          position: relative;

          z-index: 2;

          width: 100%;

          height:
            145px;

          resize:
            none;

          border:
            none;

          outline:
            none;

          background:
            transparent;

          color:
            white;

          font-family:
            inherit;

          font-size:
            16px;

          line-height:
            1.9;

          padding:
            8px;

          direction:
            rtl;
        }


        .prompt-box textarea::placeholder {
          color:
            rgba(255,255,255,0.34);

          opacity:
            1;

          white-space:
            pre-line;
        }


        .prompt-box textarea:disabled {
          opacity:
            0.55;
        }


        /* ================================
           FOOTER
        ================================= */

        .prompt-footer {
          position: relative;

          z-index: 3;

          height:
            42px;

          display:
            flex;

          align-items:
            center;

          justify-content:
            space-between;

          direction:
            ltr;

          padding:
            0 5px;
        }


        .counter {
          font-size:
            10px;

          color:
            rgba(255,255,255,0.28);

          direction:
            ltr;
        }


        /* ================================
           SEND BUTTON
        ================================= */

        .send-button-wrapper {
          position: relative;

          width:
            57px;

          height:
            57px;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          isolation:
            isolate;
        }


        /*
          نور کاملاً نزدیک به خود دکمه است
        */

        .send-light {
          position: absolute;

          width:
            57px;

          height:
            57px;

          border-radius:
            18px;

          opacity:
            0;

          background:
            conic-gradient(
              from 0deg,

              transparent 0deg,

              transparent 35deg,

              rgba(92,77,255,0.08) 55deg,

              rgba(130,108,255,1) 95deg,

              rgba(88,210,255,1) 125deg,

              rgba(130,108,255,0.9) 155deg,

              rgba(92,77,255,0.08) 195deg,

              transparent 225deg,

              transparent 360deg
            );

          pointer-events:
            none;

          z-index:
            0;

          filter:
            drop-shadow(
              0 0 4px
              rgba(102,189,255,0.85)
            );
        }


        .send-light.active {
          opacity:
            1;

          animation:
            send-light-spin
            2s
            linear
            infinite;
        }


        .send-light::after {
          content:
            "";

          position:
            absolute;

          inset:
            2px;

          border-radius:
            16px;

          background:
            #050507;
        }


        .send-light::before {
          content:
            "";

          position:
            absolute;

          inset:
            -2px;

          border-radius:
            20px;

          background:
            conic-gradient(
              from 0deg,
              transparent 20deg,
              rgba(108,89,255,0.38) 105deg,
              rgba(78,202,255,0.42) 145deg,
              transparent 225deg
            );

          filter:
            blur(4px);

          opacity:
            0.7;

          z-index:
            -1;
        }


        .send-button {
          position:
            relative;

          z-index:
            2;

          width:
            53px;

          height:
            53px;

          border:
            none;

          border-radius:
            16px;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          color:
            white;

          cursor:
            pointer;

          background:
            linear-gradient(
              145deg,
              #755bff 0%,
              #5b42e7 48%,
              #4933c8 100%
            );

          box-shadow:

            0 8px 30px
            rgba(93,66,238,0.38),

            inset 0 1px
            rgba(255,255,255,0.17),

            inset 0 -1px
            rgba(0,0,0,0.18);

          transition:
            transform 0.18s ease,
            opacity 0.18s ease,
            box-shadow 0.18s ease;
        }


        .send-button:hover:not(:disabled) {
          transform:
            translateY(-1px);

          box-shadow:

            0 10px 35px
            rgba(93,66,238,0.48),

            inset 0 1px
            rgba(255,255,255,0.20);
        }


        .send-button:active:not(:disabled) {
          transform:
            scale(0.95);
        }


        .send-button:disabled {
          cursor:
            not-allowed;

          opacity:
            0.42;
        }


        @keyframes send-light-spin {

          from {
            transform:
              rotate(0deg);
          }

          to {
            transform:
              rotate(360deg);
          }

        }


        /* ================================
           BUTTON SPINNER
        ================================= */

        .button-spinner {
          width:
            19px;

          height:
            19px;

          border-radius:
            50%;

          border:
            2px solid
            rgba(255,255,255,0.28);

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


        /* ================================
           GENERATING
        ================================= */

        .generating-state {
          position:
            relative;

          margin-top:
            25px;

          min-height:
            235px;

          display:
            flex;

          flex-direction:
            column;

          align-items:
            center;

          justify-content:
            center;

          text-align:
            center;

          animation:
            generating-enter
            0.45s
            ease
            both;
        }


        .generating-orb {
          position:
            relative;

          width:
            110px;

          height:
            110px;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          margin-bottom:
            20px;
        }


        .generating-core {
          position:
            relative;

          width:
            50px;

          height:
            50px;

          border-radius:
            17px;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          background:
            linear-gradient(
              145deg,
              #806cff,
              #4935d0
            );

          box-shadow:

            0 0 28px
            rgba(112,91,255,0.6),

            0 0 65px
            rgba(83,105,255,0.25),

            inset 0 1px
            rgba(255,255,255,0.2);

          animation:
            core-pulse
            1.7s
            ease-in-out
            infinite;

          z-index:
            3;
        }


        .core-icon {
          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          color:
            rgba(255,255,255,0.9);

          animation:
            core-icon-spin
            3s
            linear
            infinite;
        }


        .generating-ring {
          position:
            absolute;

          border-radius:
            50%;

          border:
            1px solid
            rgba(126,108,255,0.18);

          pointer-events:
            none;
        }


        .ring-one {
          width:
            70px;

          height:
            70px;

          border-top-color:
            rgba(126,108,255,0.95);

          border-right-color:
            rgba(92,207,255,0.75);

          animation:
            generating-spin
            1.35s
            linear
            infinite;
        }


        .ring-two {
          width:
            91px;

          height:
            91px;

          border-bottom-color:
            rgba(93,103,255,0.78);

          border-left-color:
            rgba(103,210,255,0.52);

          animation:
            generating-spin-reverse
            2.05s
            linear
            infinite;
        }


        .ring-three {
          width:
            108px;

          height:
            108px;

          border-top-color:
            rgba(113,91,255,0.46);

          border-bottom-color:
            rgba(65,174,255,0.32);

          animation:
            generating-spin
            3.1s
            linear
            infinite;
        }


        .generating-text {
          font-size:
            15px;

          font-weight:
            700;

          color:
            rgba(255,255,255,0.9);

          margin-bottom:
            6px;

          text-shadow:
            0 0 20px
            rgba(119,100,255,0.3);
        }


        .generating-subtext {
          font-size:
            11px;

          color:
            rgba(255,255,255,0.34);

          line-height:
            1.8;
        }


        .generating-dots {
          display:
            flex;

          align-items:
            center;

          gap:
            5px;

          margin-top:
            12px;
        }


        .generating-dots span {
          width:
            4px;

          height:
            4px;

          border-radius:
            50%;

          background:
            rgba(151,139,255,0.95);

          box-shadow:
            0 0 8px
            rgba(122,107,255,0.75);

          animation:
            loading-dot
            1.2s
            ease-in-out
            infinite;
        }


        .generating-dots span:nth-child(2) {
          animation-delay:
            0.15s;
        }


        .generating-dots span:nth-child(3) {
          animation-delay:
            0.30s;
        }


        @keyframes generating-spin {

          to {
            transform:
              rotate(360deg);
          }

        }


        @keyframes generating-spin-reverse {

          to {
            transform:
              rotate(-360deg);
          }

        }


        @keyframes core-pulse {

          0%,
          100% {

            transform:
              scale(0.94);

            box-shadow:

              0 0 22px
              rgba(112,91,255,0.48),

              0 0 50px
              rgba(83,105,255,0.18),

              inset 0 1px
              rgba(255,255,255,0.18);
          }

          50% {

            transform:
              scale(1.06);

            box-shadow:

              0 0 34px
              rgba(112,91,255,0.72),

              0 0 78px
              rgba(83,105,255,0.3),

              inset 0 1px
              rgba(255,255,255,0.23);
          }

        }


        @keyframes core-icon-spin {

          0% {
            transform:
              rotate(0deg);
          }

          100% {
            transform:
              rotate(360deg);
          }

        }


        @keyframes loading-dot {

          0%,
          100% {

            transform:
              translateY(0);

            opacity:
              0.3;
          }

          50% {

            transform:
              translateY(-4px);

            opacity:
              1;
          }

        }


        @keyframes generating-enter {

          from {

            opacity:
              0;

            transform:
              translateY(12px);
          }

          to {

            opacity:
              1;

            transform:
              translateY(0);
          }

        }


        /* ================================
           ERROR
        ================================= */

        .error-message {
          margin-top:
            15px;

          padding:
            12px 15px;

          border-radius:
            13px;

          background:
            rgba(255,70,70,0.07);

          border:
            1px solid
            rgba(255,70,70,0.15);

          color:
            #ff9b9b;

          font-size:
            12px;

          text-align:
            center;
        }


        /* ================================
           RESULT
        ================================= */

        .result {
          margin-top:
            40px;

          animation:
            result-enter
            0.5s
            ease
            both;
        }


        .image-card {
          width:
            100%;

          overflow:
            hidden;

          border-radius:
            23px;

          background:
            rgba(255,255,255,0.03);

          border:
            1px solid
            rgba(255,255,255,0.09);

          box-shadow:
            0 30px 80px
            rgba(0,0,0,0.42);
        }


        .image-card img {
          display:
            block;

          width:
            100%;

          height:
            auto;
        }


        @keyframes result-enter {

          from {

            opacity:
              0;

            transform:
              translateY(18px)
              scale(0.985);
          }

          to {

            opacity:
              1;

            transform:
              translateY(0)
              scale(1);
          }

        }


        /* ================================
           ACTIONS
        ================================= */

        .image-actions {
          display:
            flex;

          justify-content:
            center;

          align-items:
            center;

          gap:
            8px;

          margin-top:
            10px;
        }


        .small-action {
          min-width:
            105px;

          height:
            34px;

          padding:
            0 12px;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          gap:
            7px;

          border-radius:
            10px;

          border:
            1px solid
            rgba(255,255,255,0.08);

          background:
            rgba(255,255,255,0.045);

          color:
            rgba(255,255,255,0.72);

          font-family:
            inherit;

          font-size:
            11px;

          font-weight:
            600;

          cursor:
            pointer;

          transition:
            background 0.2s ease,
            border-color 0.2s ease,
            color 0.2s ease,
            transform 0.2s ease;
        }


        .small-action:hover:not(:disabled) {

          background:
            rgba(255,255,255,0.085);

          border-color:
            rgba(255,255,255,0.16);

          color:
            white;

          transform:
            translateY(-1px);
        }


        .small-action:active:not(:disabled) {

          transform:
            scale(0.96);
        }


        .small-action:disabled {

          opacity:
            0.4;

          cursor:
            not-allowed;
        }


        /* ================================
           MOBILE
        ================================= */

        @media (max-width: 600px) {

          .image-page {

            min-height:
              100svh;

            padding:
              45px 14px 70px;
          }


          .image-wrapper {

            width:
              100%;

            margin:
              0 auto;
          }


          .image-header {

            margin-bottom:
              48px;
          }


          .image-label {

            font-size:
              9px;

            letter-spacing:
              3.5px;
          }


          .image-header h1 {

            font-size:
              31px;

            letter-spacing:
              -1px;
          }


          .image-header p {

            font-size:
              12px;

            margin-top:
              13px;
          }


          .prompt-box {

            min-height:
              190px;

            margin-top:
              0;

            border-radius:
              21px;

            padding:
              13px;
          }


          .prompt-box textarea {

            height:
              132px;

            font-size:
              14px;

            padding:
              8px;
          }


          .prompt-footer {

            height:
              39px;
          }


          .send-button-wrapper {

            width:
              57px;

            height:
              57px;
          }


          .send-light {

            width:
              57px;

            height:
              57px;

            border-radius:
              18px;
          }


          .send-button {

            width:
              53px;

            height:
              53px;

            border-radius:
              16px;
          }


          .generating-state {

            min-height:
              220px;

            margin-top:
              20px;
          }


          .generating-orb {

            transform:
              scale(0.92);
          }


          .generating-text {

            font-size:
              14px;
          }


          .generating-subtext {

            font-size:
              10px;
          }


          .small-action {

            min-width:
              100px;

            height:
              33px;
          }


          .aurora-one {

            width:
              900px;

            left:
              -300px;

            top:
              42%;
          }


          .aurora-two {

            width:
              800px;

            right:
              -330px;

            top:
              47%;
          }


          .aurora-three {

            width:
              900px;

            left:
              -220px;

            bottom:
              10%;
          }


          .line-one {

            left:
              8%;

            top:
              32%;

            height:
              160px;
          }


          .line-two {

            right:
              14%;

            top:
              40%;

            height:
              150px;
          }


          .line-three {

            right:
              8%;

            bottom:
              25%;

            height:
              130px;
          }

        }

      `}</style>

    </main>
  );
}
