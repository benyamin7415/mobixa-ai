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

      {/* =========================================
          FUTURISTIC BACKGROUND
      ========================================= */}

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


      {/* =========================================
          CONTENT
      ========================================= */}

      <div className="image-wrapper">

        {/* =====================================
            HEADER
        ===================================== */}

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


        {/* =====================================
            PROMPT BOX
        ===================================== */}

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


            {/* =================================
                SEND BUTTON
            ================================= */}

            <div className="send-button-wrapper">

              {/* نور دقیقاً چسبیده به دکمه */}
              <div className="send-light" />

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


        {/* =====================================
            ERROR
        ===================================== */}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}


        {/* =====================================
            GENERATED IMAGE
        ===================================== */}

        {image && (
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


      {/* =========================================
          STYLES
      ========================================= */}

      <style jsx>{`

        * {
          box-sizing: border-box;
        }


        /* =========================================
           PAGE
        ========================================= */

        .image-page {
          position: relative;

          width: 100%;

          min-height: 100svh;

          overflow: hidden;

          color: white;

          direction: rtl;

          background:
            radial-gradient(
              ellipse at 50% -10%,
              rgba(57, 40, 150, 0.28),
              transparent 48%
            ),

            radial-gradient(
              ellipse at 5% 75%,
              rgba(0, 99, 180, 0.14),
              transparent 35%
            ),

            radial-gradient(
              ellipse at 100% 65%,
              rgba(80, 42, 180, 0.14),
              transparent 35%
            ),

            #030407;

          padding:
            68px 20px 32px;
        }


        /* =========================================
           SUBTLE NOISE
        ========================================= */

        .space-noise {
          position: absolute;

          inset: 0;

          pointer-events: none;

          opacity: 0.18;

          background-image:
            radial-gradient(
              rgba(255,255,255,0.18) 0.7px,
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


        /* =========================================
           AMBIENT LIGHT
        ========================================= */

        .ambient {
          position: absolute;

          width: 430px;

          height: 430px;

          border-radius: 50%;

          filter: blur(120px);

          pointer-events: none;

          opacity: 0.20;
        }


        .ambient-purple {
          top: -250px;

          left: -170px;

          background:
            rgba(86, 54, 255, 0.65);
        }


        .ambient-blue {
          right: -230px;

          bottom: -170px;

          background:
            rgba(0, 119, 255, 0.50);
        }


        /* =========================================
           FUTURISTIC AURORA WAVES
        ========================================= */

        .aurora {
          position: absolute;

          pointer-events: none;

          border-radius: 50%;

          transform-origin: center;

          opacity: 0.65;
        }


        .aurora-one {
          width: 1200px;

          height: 500px;

          left: -310px;

          top: 350px;

          border-top:
            2px solid
            rgba(104, 82, 255, 0.70);

          border-radius:
            50%;

          transform:
            rotate(18deg);

          filter:
            blur(1px)
            drop-shadow(
              0 0 9px
              rgba(96, 83, 255, 0.65)
            );

          box-shadow:
            0 -12px 45px
            rgba(67, 69, 255, 0.13);
        }


        .aurora-two {
          width: 950px;

          height: 400px;

          right: -330px;

          top: 430px;

          border-top:
            1.5px solid
            rgba(77, 159, 255, 0.75);

          transform:
            rotate(-23deg);

          filter:
            blur(1px)
            drop-shadow(
              0 0 10px
              rgba(48, 137, 255, 0.75)
            );
        }


        .aurora-three {
          width: 1100px;

          height: 430px;

          left: -150px;

          bottom: -30px;

          border-top:
            1px solid
            rgba(73, 104, 255, 0.38);

          transform:
            rotate(11deg);

          filter:
            blur(2px);

          opacity: 0.38;
        }


        /* =========================================
           LIGHT LINES
        ========================================= */

        .light-line {
          position: absolute;

          width: 1px;

          pointer-events: none;

          background:
            linear-gradient(
              to bottom,
              transparent,
              rgba(104, 84, 255, 0.75),
              transparent
            );

          opacity: 0.65;
        }


        .light-line span {
          position: absolute;

          width: 5px;

          height: 5px;

          left: -2px;

          border-radius: 50%;

          background:
            #8e82ff;

          box-shadow:
            0 0 8px
            rgba(116, 105, 255, 0.95),

            0 0 20px
            rgba(86, 92, 255, 0.70);
        }


        .line-one {
          left: 8%;

          top: 29%;

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

          opacity: 0.38;
        }


        .line-three span {
          top: 0;
        }


        /* =========================================
           LIGHT DOTS
        ========================================= */

        .light-dot {
          position: absolute;

          width: 4px;

          height: 4px;

          border-radius: 50%;

          background:
            #8c83ff;

          box-shadow:
            0 0 8px
            rgba(113, 105, 255, 1),

            0 0 22px
            rgba(75, 110, 255, 0.75);

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


        /* =========================================
           MAIN WRAPPER

           مهم:
           کل محتوا حداقل به اندازه viewport است
           و prompt با margin-top:auto
           به پایین هل داده می‌شود.
        ========================================= */

        .image-wrapper {
          position: relative;

          z-index: 5;

          width:
            min(850px, 100%);

          min-height:
            calc(100svh - 100px);

          margin:
            0 auto;

          display: flex;

          flex-direction: column;
        }


        /* =========================================
           HEADER
        ========================================= */

        .image-header {
          text-align: center;

          flex-shrink: 0;
        }


        .image-label {
          font-size: 10px;

          font-weight: 700;

          letter-spacing: 4px;

          color:
            rgba(169, 155, 255, 0.78);

          direction: ltr;

          margin-bottom: 15px;

          text-shadow:
            0 0 18px
            rgba(126, 102, 255, 0.35);
        }


        .image-header h1 {
          margin: 0;

          font-size:
            clamp(32px, 6vw, 52px);

          font-weight: 850;

          letter-spacing: -1.5px;

          line-height: 1.25;

          text-shadow:
            0 4px 30px
            rgba(0, 0, 0, 0.35);
        }


        .image-header h1 span {
          background:
            linear-gradient(
              105deg,
              #ffffff 4%,
              #b7a8ff 42%,
              #5edcff 72%,
              #ffffff 100%
            );

          -webkit-background-clip: text;

          -webkit-text-fill-color: transparent;

          background-clip: text;
        }


        .image-header p {
          margin:
            16px auto 0;

          max-width:
            500px;

          color:
            rgba(255, 255, 255, 0.38);

          font-size: 13px;

          line-height: 1.9;
        }


        /* =========================================
           PROMPT BOX

           اینجا دیگر margin ثابت نداریم.
           margin-top:auto یعنی کادر همیشه
           به پایین صفحه هل داده می‌شود.
        ========================================= */

        .prompt-box {
          position: relative;

          width: 100%;

          min-height: 205px;

          margin-top: auto;

          flex-shrink: 0;

          border-radius: 25px;

          background:
            linear-gradient(
              135deg,
              rgba(18, 21, 31, 0.78),
              rgba(8, 10, 15, 0.72)
            );

          border:
            1px solid
            rgba(255, 255, 255, 0.11);

          padding: 17px;

          backdrop-filter:
            blur(25px);

          -webkit-backdrop-filter:
            blur(25px);

          box-shadow:

            0 30px 100px
            rgba(0, 0, 0, 0.55),

            inset 0 1px
            rgba(255, 255, 255, 0.045),

            0 0 50px
            rgba(37, 55, 120, 0.07);

          overflow: visible;

          transition:
            border-color 0.25s ease,
            box-shadow 0.25s ease;
        }


        .prompt-box::before {
          content: "";

          position: absolute;

          inset: 0;

          border-radius: inherit;

          pointer-events: none;

          background:
            linear-gradient(
              115deg,
              rgba(95, 74, 255, 0.08),
              transparent 35%,
              transparent 70%,
              rgba(0, 176, 255, 0.07)
            );
        }


        .prompt-box:focus-within {
          border-color:
            rgba(128, 111, 255, 0.32);

          box-shadow:

            0 30px 100px
            rgba(0, 0, 0, 0.58),

            0 0 55px
            rgba(82, 76, 255, 0.08),

            inset 0 1px
            rgba(255, 255, 255, 0.05);
        }


        /* =========================================
           TEXTAREA
        ========================================= */

        .prompt-box textarea {
          position: relative;

          z-index: 2;

          width: 100%;

          height: 145px;

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
            rgba(255, 255, 255, 0.34);

          opacity: 1;

          white-space: pre-line;
        }


        .prompt-box textarea:disabled {
          opacity: 0.55;
        }


        /* =========================================
           FOOTER
        ========================================= */

        .prompt-footer {
          position: relative;

          z-index: 3;

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
            rgba(255, 255, 255, 0.28);

          direction: ltr;
        }


        /* =========================================
           SEND BUTTON WRAPPER

           فقط 57px
           خود دکمه 53px

           یعنی فقط 2px حاشیه.
        ========================================= */

        .send-button-wrapper {
          position: relative;

          width: 57px;

          height: 57px;

          display: flex;

          align-items: center;

          justify-content: center;

          isolation: isolate;
        }


        /* =========================================
           SEND LIGHT

           نور دقیقاً به خود دکمه چسبیده
        ========================================= */

        .send-light {
          position: absolute;

          width: 57px;

          height: 57px;

          border-radius: 18px;

          background:
            conic-gradient(
              from 0deg,

              transparent 0deg,

              transparent 30deg,

              rgba(92, 77, 255, 0.08) 55deg,

              rgba(125, 106, 255, 0.95) 95deg,

              rgba(91, 205, 255, 1) 125deg,

              rgba(121, 106, 255, 0.95) 155deg,

              rgba(92, 77, 255, 0.08) 195deg,

              transparent 225deg,

              transparent 360deg
            );

          animation:
            send-light-spin
            2.3s
            linear
            infinite;

          pointer-events: none;

          z-index: 0;

          filter:
            drop-shadow(
              0 0 4px
              rgba(102, 189, 255, 0.75)
            );
        }


        /*
          مرکز نور حذف می‌شود
          و فقط لبه باقی می‌ماند.
        */

        .send-light::after {
          content: "";

          position: absolute;

          inset: 2px;

          border-radius: 16px;

          background:
            #050507;
        }


        /*
          هاله‌ی خیلی نزدیک به لبه
        */

        .send-light::before {
          content: "";

          position: absolute;

          inset: -2px;

          border-radius: 20px;

          background:
            conic-gradient(
              from 0deg,

              transparent 20deg,

              rgba(108, 89, 255, 0.38) 105deg,

              rgba(78, 202, 255, 0.40) 145deg,

              transparent 225deg
            );

          filter:
            blur(6px);

          opacity: 0.6;

          z-index: -1;
        }


        /* =========================================
           SEND BUTTON
        ========================================= */

        .send-button {
          position: relative;

          z-index: 2;

          width: 53px;

          height: 53px;

          border: none;

          border-radius: 16px;

          display: flex;

          align-items: center;

          justify-content: center;

          color: white;

          cursor: pointer;

          background:
            linear-gradient(
              145deg,
              #755bff 0%,
              #5b42e7 48%,
              #4933c8 100%
            );

          box-shadow:

            0 8px 30px
            rgba(93, 66, 238, 0.38),

            inset 0 1px
            rgba(255, 255, 255, 0.17),

            inset 0 -1px
            rgba(0, 0, 0, 0.18);

          transition:
            transform 0.18s ease,
            opacity 0.18s ease,
            box-shadow 0.18s ease;
        }


        .send-button:hover:not(:disabled) {
          transform:
            translateY(-1px);

          box-shadow:

            0 10px 34px
            rgba(93, 66, 238, 0.48),

            inset 0 1px
            rgba(255, 255, 255, 0.20);
        }


        .send-button:active:not(:disabled) {
          transform:
            scale(0.95);
        }


        .send-button:disabled {
          cursor: not-allowed;

          opacity: 0.42;
        }


        /* =========================================
           SEND LIGHT ANIMATION
        ========================================= */

        @keyframes send-light-spin {

          0% {
            transform:
              rotate(0deg);
          }

          100% {
            transform:
              rotate(360deg);
          }

        }


        /* =========================================
           LOADING
        ========================================= */

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


        /* =========================================
           ERROR
        ========================================= */

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


        /* =========================================
           RESULT
        ========================================= */

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


        /* =========================================
           ACTION BUTTONS
        ========================================= */

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


        /* =========================================
           MOBILE
        ========================================= */

        @media (max-width: 600px) {

          .image-page {
            min-height: 100svh;

            padding:
              42px 14px 18px;
          }


          .image-wrapper {
            min-height:
              calc(100svh - 60px);
          }


          .image-label {
            font-size: 9px;

            letter-spacing: 3.5px;

            margin-bottom: 13px;
          }


          .image-header h1 {
            font-size: 31px;

            letter-spacing: -1px;
          }


          .image-header p {
            margin-top: 13px;

            font-size: 12px;
          }


          /*
             هیچ margin ثابت وجود ندارد.
             margin-top:auto باعث می‌شود
             کادر به پایین viewport بچسبد.
          */

          .prompt-box {
            min-height: 190px;

            margin-top: auto;

            border-radius: 22px;

            padding: 13px;
          }


          .prompt-box textarea {
            height: 132px;

            font-size: 14px;

            padding: 8px;
          }


          .prompt-footer {
            height: 39px;
          }


          .counter {
            font-size: 10px;
          }


          /* دکمه */

          .send-button-wrapper {
            width: 57px;

            height: 57px;
          }


          .send-light {
            width: 57px;

            height: 57px;

            border-radius: 18px;
          }


          .send-button {
            width: 53px;

            height: 53px;

            border-radius: 16px;
          }


          .send-light::after {
            border-radius: 16px;
          }


          .send-light::before {
            border-radius: 20px;
          }


          .small-action {
            min-width: 100px;

            height: 33px;
          }


          .aurora-one {
            width: 900px;

            left: -300px;

            top: 42%;

            transform:
              rotate(18deg);
          }


          .aurora-two {
            width: 800px;

            right: -330px;

            top: 47%;
          }


          .aurora-three {
            width: 900px;

            left: -220px;

            bottom: 10%;
          }


          .line-one {
            left: 8%;

            top: 32%;

            height: 160px;
          }


          .line-two {
            right: 14%;

            top: 40%;

            height: 150px;
          }


          .line-three {
            right: 8%;

            bottom: 25%;

            height: 130px;
          }

        }

      `}</style>

    </main>
  );
}
