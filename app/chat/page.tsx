"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

function SendIcon() {
  return (
    <svg
      className="send-icon"
      viewBox="0 0 32 32"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="aiStarGradient"
          x1="5"
          y1="4"
          x2="27"
          y2="28"
        >
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="45%" stopColor="#e7c8ff" />
          <stop offset="100%" stopColor="#8defff" />
        </linearGradient>

        <filter id="starGlow">
          <feGaussianBlur stdDeviation="1.4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* AI four-point star */}
      <path
        d="
          M16 2.8
          C16.8 2.8 17.2 4.1 17.7 6.4
          C18.5 10.1 19.9 11.5 23.6 12.3
          C25.9 12.8 27.2 13.2 27.2 14
          C27.2 14.8 25.9 15.2 23.6 15.7
          C19.9 16.5 18.5 17.9 17.7 21.6
          C17.2 23.9 16.8 25.2 16 25.2
          C15.2 25.2 14.8 23.9 14.3 21.6
          C13.5 17.9 12.1 16.5 8.4 15.7
          C6.1 15.2 4.8 14.8 4.8 14
          C4.8 13.2 6.1 12.8 8.4 12.3
          C12.1 11.5 13.5 10.1 14.3 6.4
          C14.8 4.1 15.2 2.8 16 2.8
          Z
        "
        fill="url(#aiStarGradient)"
        filter="url(#starGlow)"
      />

      {/* Small AI sparkle */}
      <path
        d="M25.5 4.8v4.2M23.4 6.9h4.2"
        stroke="#ffffff"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity=".9"
      />

      {/* Tiny center highlight */}
      <circle
        cx="16"
        cy="14"
        r="2"
        fill="#ffffff"
        opacity=".75"
      />
    </svg>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  function handleInput(value: string) {
    setInput(value);

    const textarea = textareaRef.current;

    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(
      textarea.scrollHeight,
      140
    )}px`;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const message = input.trim();

    if (!message || loading) return;

    setInput("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: message,
      },
    ]);

    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
        }),
      });

      if (!response.ok) {
        let errorText = "خطایی رخ داد.";

        try {
          const data = await response.json();

          if (data?.error) {
            errorText = data.error;
          }
        } catch {}

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: errorText,
          },
        ]);

        return;
      }

      if (!response.body) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "پاسخ Streaming دریافت نشد.",
          },
        ]);

        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let assistantText = "";

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "",
        },
      ]);

      while (true) {
        const { value, done } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value, {
          stream: true,
        });

        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data:")) continue;

          const data = line.slice(5).trim();

          if (!data || data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);

            const text =
              parsed?.candidates?.[0]?.content?.parts
                ?.map((part: { text?: string }) => part.text || "")
                .join("") || "";

            if (text) {
              assistantText += text;

              setMessages((prev) => {
                const updated = [...prev];

                const lastIndex = updated.length - 1;

                if (
                  lastIndex >= 0 &&
                  updated[lastIndex].role === "assistant"
                ) {
                  updated[lastIndex] = {
                    ...updated[lastIndex],
                    content: assistantText,
                  };
                }

                return updated;
              });
            }
          } catch {}
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "ارتباط با سرور برقرار نشد.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSuggestion(text: string) {
    handleInput(text);

    setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
  }

  return (
    <main className="page">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="header">
        <button
          className="back-button"
          type="button"
          onClick={() => window.history.back()}
          aria-label="بازگشت"
        >
          <span>‹</span>
        </button>

        <div className="brand">
          MOBIXA <span>AI</span>
        </div>
      </header>

      <section className="hero">
        <div className="logo-orbit">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="orbit orbit-three" />

          <div className="logo-glow">
            <div className="logo-m">M</div>
          </div>

          <span className="spark spark-one">✦</span>
          <span className="spark spark-two">✦</span>
          <span className="spark spark-three">✧</span>
        </div>

        <div className="robot">
          <div className="robot-head">
            <div className="robot-ear left" />
            <div className="robot-ear right" />

            <div className="robot-face">
              <div className="robot-eye left-eye" />
              <div className="robot-eye right-eye" />
              <div className="robot-mouth" />
            </div>

            <div className="robot-antenna">
              <span />
            </div>
          </div>

          <div className="robot-body">
            <div className="robot-core">✦</div>
          </div>

          <div className="robot-hand">
            <div className="robot-finger" />
          </div>
        </div>

        <div className="greeting">
          <div className="hello">
            سلام <span className="hello-hand">👋</span>
          </div>

          <div className="subtitle">
            بزن بریم مهندس
          </div>
        </div>
      </section>

      {messages.length === 0 ? (
        <section className="suggestions">
          <button
            type="button"
            className="card"
            onClick={() =>
              handleSuggestion(
                "این متن رو برای من حرفه‌ای‌تر و جذاب‌تر کن"
              )
            }
          >
            <div className="card-icon">✦</div>

            <div>
              <strong>CREATE</strong>
              <p>متنت رو حرفه‌ای کن</p>
            </div>
          </button>

          <button
            type="button"
            className="card"
            onClick={() =>
              handleSuggestion(
                "این موضوع رو خیلی ساده و قابل فهم بهم یاد بده"
              )
            }
          >
            <div className="card-icon">◈</div>

            <div>
              <strong>LEARN MODE</strong>
              <p>هر چیزی رو ساده یاد بگیر</p>
            </div>
          </button>

          <button
            type="button"
            className="card"
            onClick={() =>
              handleSuggestion(
                "یه ایده خفن و خلاقانه برای من بساز"
              )
            }
          >
            <div className="card-icon">✧</div>

            <div>
              <strong>IDEA LAB</strong>
              <p>یه ایده خفن بساز</p>
            </div>
          </button>
        </section>
      ) : (
        <section className="messages">
          {messages.map((message, index) => (
            <div
              key={index}
              className={
                message.role === "user"
                  ? "message-row user-message"
                  : "message-row ai-message"
              }
            >
              <div
                className={
                  message.role === "user"
                    ? "message user-bubble"
                    : "message ai-bubble"
                }
              >
                {message.content}
                {message.role === "assistant" &&
                  loading &&
                  index === messages.length - 1 && (
                    <span className="typing-cursor">▋</span>
                  )}
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </section>
      )}

      <form className="composer" onSubmit={handleSubmit}>
        <div className="input-shell">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => handleInput(e.target.value)}
            placeholder="هرچی تو ذهنت هست بنویس..."
            rows={1}
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();

                if (input.trim() && !loading) {
                  e.currentTarget.form?.requestSubmit();
                }
              }
            }}
          />

          <button
            type="submit"
            className="send"
            disabled={!input.trim() || loading}
            aria-label="ارسال پیام"
          >
            <SendIcon />
          </button>
        </div>

        <div className="disclaimer">
          Mobixa AI ممکن است گاهی اشتباه کند؛ پاسخ‌ها را بررسی کنید.
        </div>
      </form>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .page {
          min-height: 100dvh;
          width: 100%;
          overflow-x: hidden;
          background:
            radial-gradient(
              circle at 50% 20%,
              rgba(91, 44, 160, 0.18),
              transparent 34%
            ),
            radial-gradient(
              circle at 20% 80%,
              rgba(0, 174, 255, 0.08),
              transparent 30%
            ),
            #05030d;
          color: white;
          position: relative;
          padding: 20px 22px 25px;
          font-family:
            Arial,
            "Segoe UI",
            sans-serif;
          direction: rtl;
        }

        .ambient {
          position: fixed;
          pointer-events: none;
          border-radius: 50%;
          filter: blur(90px);
          opacity: 0.3;
        }

        .ambient-one {
          width: 260px;
          height: 260px;
          background: #782cff;
          top: 15%;
          left: -130px;
        }

        .ambient-two {
          width: 240px;
          height: 240px;
          background: #00bfff;
          right: -120px;
          bottom: 15%;
        }

        .header {
          width: 100%;
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          direction: ltr;
          position: relative;
          z-index: 10;
        }

        .back-button {
          width: 43px;
          height: 43px;
          border-radius: 14px;
          border: 1px solid rgba(182, 111, 255, 0.5);
          background: rgba(25, 15, 45, 0.72);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 31px;
          line-height: 1;
          cursor: pointer;
          box-shadow:
            0 0 15px rgba(142, 60, 255, 0.22),
            inset 0 0 15px rgba(130, 60, 255, 0.08);
          transition: 0.25s ease;
        }

        .back-button:hover {
          transform: translateX(-3px);
          border-color: rgba(35, 224, 255, 0.75);
          box-shadow:
            0 0 22px rgba(142, 60, 255, 0.38),
            0 0 35px rgba(35, 224, 255, 0.12);
        }

        .brand {
          font-size: 15px;
          font-weight: 800;
          letter-spacing: 3px;
          color: #f8f2ff;
          text-shadow: 0 0 13px rgba(174, 103, 255, 0.7);
        }

        .brand span {
          color: #9f72ff;
        }

        .hero {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding-top: 25px;
          position: relative;
          z-index: 2;
        }

        .logo-orbit {
          width: 185px;
          height: 185px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo-glow {
          width: 105px;
          height: 105px;
          border-radius: 50%;
          background:
            radial-gradient(
              circle at 35% 30%,
              rgba(255, 255, 255, 0.28),
              transparent 25%
            ),
            radial-gradient(
              circle,
              #8e4fff 0%,
              #5421c7 42%,
              #17102f 78%,
              transparent 79%
            );
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(199, 146, 255, 0.6);
          box-shadow:
            0 0 22px rgba(132, 62, 255, 0.8),
            0 0 55px rgba(89, 42, 255, 0.35),
            inset 0 0 25px rgba(255, 255, 255, 0.1);
        }

        .logo-m {
          font-size: 61px;
          font-weight: 900;
          font-style: italic;
          color: white;
          text-shadow:
            0 0 8px #fff,
            0 0 20px #a760ff,
            0 0 35px #713cff;
        }

        .orbit {
          position: absolute;
          border: 1px solid rgba(159, 95, 255, 0.4);
          border-radius: 50%;
          transform: rotate(-24deg);
        }

        .orbit-one {
          width: 174px;
          height: 66px;
          box-shadow: 0 0 12px rgba(139, 67, 255, 0.3);
        }

        .orbit-two {
          width: 165px;
          height: 75px;
          transform: rotate(48deg);
          border-color: rgba(34, 214, 255, 0.3);
        }

        .orbit-three {
          width: 145px;
          height: 145px;
          border-color: rgba(165, 102, 255, 0.15);
        }

        .spark {
          position: absolute;
          color: #cda5ff;
          text-shadow:
            0 0 8px #a55dff,
            0 0 17px #7c42ff;
          animation: blink 2.2s ease-in-out infinite;
        }

        .spark-one {
          top: 25px;
          right: 12px;
        }

        .spark-two {
          bottom: 30px;
          left: 14px;
          animation-delay: 0.7s;
        }

        .spark-three {
          top: 72px;
          left: 2px;
          animation-delay: 1.2s;
        }

        .robot {
          position: relative;
          width: 130px;
          height: 125px;
          margin-top: -5px;
          filter: drop-shadow(0 0 18px rgba(118, 55, 255, 0.5));
        }

        .robot-head {
          position: absolute;
          width: 78px;
          height: 62px;
          left: 24px;
          top: 6px;
          border-radius: 25px;
          background:
            linear-gradient(
              145deg,
              #a77bff,
              #4d29a5 60%,
              #20113e
            );
          border: 1px solid rgba(203, 169, 255, 0.65);
          box-shadow:
            inset 0 0 18px rgba(255, 255, 255, 0.12),
            0 0 20px rgba(123, 68, 255, 0.5);
        }

        .robot-face {
          position: absolute;
          inset: 11px;
          border-radius: 17px;
          background: #090713;
          border: 1px solid rgba(156, 104, 255, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
        }

        .robot-eye {
          width: 9px;
          height: 13px;
          border-radius: 50%;
          background: #8eeeff;
          box-shadow:
            0 0 7px #36dfff,
            0 0 14px rgba(54, 223, 255, 0.8);
        }

        .robot-mouth {
          position: absolute;
          width: 17px;
          height: 4px;
          border-radius: 20px;
          bottom: 10px;
          background: #b275ff;
          box-shadow: 0 0 8px #9c5dff;
        }

        .robot-ear {
          position: absolute;
          width: 9px;
          height: 24px;
          top: 19px;
          border-radius: 5px;
          background: #7445db;
          border: 1px solid rgba(199, 166, 255, 0.4);
        }

        .robot-ear.left {
          left: -7px;
        }

        .robot-ear.right {
          right: -7px;
        }

        .robot-antenna {
          position: absolute;
          width: 2px;
          height: 11px;
          background: #a96aff;
          top: -10px;
          left: 38px;
          box-shadow: 0 0 7px #a96aff;
        }

        .robot-antenna span {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #65eaff;
          top: -5px;
          left: -2px;
          box-shadow: 0 0 10px #65eaff;
        }

        .robot-body {
          position: absolute;
          width: 66px;
          height: 55px;
          left: 31px;
          top: 64px;
          border-radius: 19px 19px 25px 25px;
          background: linear-gradient(
            150deg,
            #7446d8,
            #29154e
          );
          border: 1px solid rgba(184, 143, 255, 0.5);
        }

        .robot-core {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          margin: 13px auto;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          background: rgba(37, 217, 255, 0.12);
          border: 1px solid rgba(55, 225, 255, 0.55);
          box-shadow:
            0 0 12px rgba(35, 220, 255, 0.45);
        }

        .robot-hand {
          position: absolute;
          right: 1px;
          top: 63px;
          width: 28px;
          height: 42px;
          border-radius: 16px;
          background: linear-gradient(
            150deg,
            #9c6aff,
            #42228d
          );
          transform: rotate(-18deg);
          border: 1px solid rgba(204, 170, 255, 0.55);
        }

        .robot-finger {
          position: absolute;
          width: 9px;
          height: 26px;
          border-radius: 8px;
          background: #a978ff;
          top: -17px;
          right: 7px;
          box-shadow: 0 0 9px rgba(156, 100, 255, 0.7);
        }

        .greeting {
          text-align: center;
          margin-top: 2px;
        }

        .hello {
          font-size: 26px;
          font-weight: 800;
          color: #fff;
          text-shadow: 0 0 17px rgba(173, 102, 255, 0.7);
        }

        .hello-hand {
          display: inline-block;
          margin-right: 7px;
          filter: drop-shadow(0 0 7px rgba(255, 255, 255, 0.35));
        }

        .subtitle {
          margin-top: 8px;
          font-size: 21px;
          font-weight: 900;
          background: linear-gradient(
            90deg,
            #c786ff,
            #7e54ff,
            #43e4ff
          );
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          text-shadow: 0 0 20px rgba(140, 78, 255, 0.3);
        }

        .suggestions {
          width: 100%;
          max-width: 850px;
          margin: 32px auto 0;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 11px;
          direction: ltr;
          position: relative;
          z-index: 3;
        }

        .card {
          min-width: 0;
          height: 72px;
          padding: 10px 12px;
          border-radius: 17px;
          border: 1px solid rgba(163, 94, 255, 0.28);
          background:
            linear-gradient(
              145deg,
              rgba(33, 20, 59, 0.88),
              rgba(11, 9, 23, 0.8)
            );
          color: white;
          display: flex;
          align-items: center;
          gap: 10px;
          text-align: right;
          cursor: pointer;
          direction: rtl;
          box-shadow:
            0 0 18px rgba(108, 54, 255, 0.08),
            inset 0 0 20px rgba(148, 75, 255, 0.035);
          transition:
            transform 0.25s ease,
            border-color 0.25s ease,
            box-shadow 0.25s ease;
        }

        .card:hover {
          transform: translateY(-3px);
          border-color: rgba(173, 99, 255, 0.7);
          box-shadow:
            0 0 25px rgba(125, 56, 255, 0.2),
            0 0 35px rgba(27, 209, 255, 0.06);
        }

        .card::before,
        .card::after,
        .card small {
          content: none !important;
          display: none !important;
          visibility: hidden !important;
        }

        .card-icon {
          width: 35px;
          height: 35px;
          flex: 0 0 35px;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #e8d6ff;
          background: rgba(137, 74, 255, 0.13);
          border: 1px solid rgba(173, 108, 255, 0.3);
          box-shadow: 0 0 12px rgba(137, 74, 255, 0.12);
        }

        .card strong {
          display: block;
          font-size: 9px;
          letter-spacing: 1.5px;
          color: #ae78ff;
          margin-bottom: 3px;
        }

        .card p {
          margin: 0;
          font-size: 12px;
          color: #e5def1;
          white-space: nowrap;
        }

        .messages {
          width: 100%;
          max-width: 850px;
          margin: 25px auto 125px;
          padding: 0 4px;
          display: flex;
          flex-direction: column;
          gap: 13px;
          position: relative;
          z-index: 3;
        }

        .message-row {
          width: 100%;
          display: flex;
        }

        .user-message {
          justify-content: flex-start;
        }

        .ai-message {
          justify-content: flex-end;
        }

        .message {
          max-width: min(78%, 680px);
          padding: 13px 17px;
          border-radius: 18px;
          font-size: 14px;
          line-height: 1.8;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .user-bubble {
          background: linear-gradient(
            135deg,
            rgba(112, 55, 205, 0.75),
            rgba(58, 39, 125, 0.65)
          );
          border: 1px solid rgba(181, 116, 255, 0.35);
          box-shadow: 0 0 18px rgba(107, 50, 255, 0.12);
        }

        .ai-bubble {
          background: rgba(18, 14, 31, 0.88);
          border: 1px solid rgba(65, 205, 255, 0.18);
          box-shadow: 0 0 18px rgba(26, 205, 255, 0.06);
        }

        .typing-cursor {
          margin-right: 3px;
          color: #9e72ff;
          animation: blink 0.8s infinite;
        }

        .composer {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 20;
          padding: 14px 20px 10px;
          background: linear-gradient(
            to top,
            #05030d 60%,
            rgba(5, 3, 13, 0)
          );
        }

        .input-shell {
          width: 100%;
          max-width: 850px;
          margin: 0 auto;
          min-height: 64px;
          display: flex;
          align-items: flex-end;
          gap: 10px;
          padding: 7px 7px 7px 9px;
          border-radius: 22px;
          background: rgba(16, 11, 28, 0.94);
          border: 1px solid rgba(149, 87, 255, 0.35);
          box-shadow:
            0 0 25px rgba(98, 48, 255, 0.1),
            inset 0 0 25px rgba(111, 55, 255, 0.025);
          backdrop-filter: blur(18px);
        }

        textarea {
          flex: 1;
          min-width: 0;
          min-height: 48px;
          max-height: 140px;
          resize: none;
          border: none;
          outline: none;
          background: transparent;
          color: #fff;
          font-size: 14px;
          line-height: 1.7;
          padding: 11px 9px;
          font-family: inherit;
          direction: rtl;
        }

        textarea::placeholder {
          color: rgba(209, 194, 231, 0.45);
        }

        textarea:disabled {
          opacity: 0.7;
        }

        /* =========================
           FUTURISTIC AI SEND BUTTON
           ========================= */

        .send {
          position: relative;
          isolation: isolate;
          overflow: visible;
          width: 51px;
          height: 51px;
          flex: 0 0 51px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          border: 1px solid rgba(202, 126, 255, 0.85);
          border-radius: 50%;
          appearance: none;
          -webkit-appearance: none;
          background:
            radial-gradient(
              circle at 32% 24%,
              rgba(255, 255, 255, 0.35),
              transparent 17%
            ),
            radial-gradient(
              circle at 50% 48%,
              #9d5dff 0%,
              #7139eb 45%,
              #3260ff 100%
            );
          color: white;
          cursor: pointer;
          box-shadow:
            0 0 13px rgba(146, 70, 255, 0.72),
            0 0 28px rgba(0, 186, 255, 0.2),
            inset 0 0 13px rgba(255, 255, 255, 0.12);
          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease,
            filter 0.25s ease;
        }

        /* rotating energy ring */
        .send::before {
          content: "";
          position: absolute;
          inset: -5px;
          border-radius: 50%;
          border: 2px solid rgba(125, 80, 255, 0.22);
          border-top-color: #d06aff;
          border-right-color: #25e3ff;
          box-shadow:
            0 0 8px rgba(196, 83, 255, 0.65),
            0 0 15px rgba(32, 220, 255, 0.2);
          z-index: 0;
          pointer-events: none;
          animation: sendRing 3s linear infinite;
        }

        /* glass shine */
        .send::after {
          content: "";
          position: absolute;
          inset: 3px;
          border-radius: 50%;
          background:
            linear-gradient(
              135deg,
              rgba(255, 255, 255, 0.18),
              transparent 38%,
              rgba(255, 255, 255, 0.025)
            );
          z-index: 1;
          pointer-events: none;
        }

        .send-icon {
          position: relative;
          z-index: 3;
          width: 29px;
          height: 29px;
          display: block;
          transform: rotate(0deg);
          filter:
            drop-shadow(0 0 4px rgba(255, 255, 255, 0.9))
            drop-shadow(0 0 9px rgba(184, 93, 255, 0.8));
          transition:
            transform 0.25s ease,
            filter 0.25s ease;
        }

        .send:not(:disabled):hover {
          transform: translateY(-2px) scale(1.05);
          box-shadow:
            0 0 18px rgba(164, 79, 255, 0.95),
            0 0 34px rgba(0, 205, 255, 0.3),
            inset 0 0 16px rgba(255, 255, 255, 0.15);
        }

        .send:not(:disabled):hover .send-icon {
          transform: scale(1.1) rotate(8deg);
          filter:
            drop-shadow(0 0 5px #fff)
            drop-shadow(0 0 12px #bd65ff)
            drop-shadow(0 0 18px rgba(33, 225, 255, 0.7));
        }

        .send:not(:disabled):active {
          transform: scale(0.94);
        }

        .send:not(:disabled):active .send-icon {
          transform: scale(0.94) rotate(-4deg);
        }

        .send:focus-visible {
          outline: 2px solid rgba(52, 224, 255, 0.9);
          outline-offset: 4px;
        }

        .send:disabled {
          opacity: 0.42;
          cursor: not-allowed;
          filter: saturate(0.55);
          box-shadow:
            0 0 9px rgba(117, 62, 190, 0.2),
            inset 0 0 9px rgba(255, 255, 255, 0.04);
        }

        .send:disabled::before {
          opacity: 0.28;
          animation-duration: 7s;
        }

        .send:disabled .send-icon {
          filter:
            drop-shadow(0 0 3px rgba(255, 255, 255, 0.35));
        }

        .disclaimer {
          width: 100%;
          max-width: 850px;
          margin: 7px auto 0;
          text-align: center;
          color: rgba(190, 177, 211, 0.35);
          font-size: 9px;
        }

        @keyframes sendRing {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @keyframes blink {
          0%,
          100% {
            opacity: 1;
          }

          50% {
            opacity: 0.35;
          }
        }

        @media (max-width: 700px) {
          .page {
            padding: 15px 13px 20px;
          }

          .hero {
            padding-top: 17px;
          }

          .logo-orbit {
            width: 165px;
            height: 165px;
          }

          .logo-glow {
            width: 94px;
            height: 94px;
          }

          .logo-m {
            font-size: 54px;
          }

          .suggestions {
            margin-top: 25px;
            gap: 7px;
          }

          .card {
            height: 69px;
            padding: 8px;
            gap: 7px;
            border-radius: 15px;
          }

          .card-icon {
            width: 30px;
            height: 30px;
            flex-basis: 30px;
            border-radius: 9px;
          }

          .card strong {
            font-size: 7px;
            letter-spacing: 1px;
          }

          .card p {
            font-size: 9px;
          }

          .messages {
            margin-bottom: 120px;
          }

          .message {
            max-width: 88%;
            font-size: 13px;
          }

          .composer {
            padding: 10px 10px 8px;
          }

          .input-shell {
            min-height: 59px;
            border-radius: 19px;
          }

          textarea {
            min-height: 45px;
            font-size: 13px;
          }

          .send {
            width: 47px;
            height: 47px;
            flex-basis: 47px;
          }

          .send-icon {
            width: 27px;
            height: 27px;
          }

          .disclaimer {
            font-size: 8px;
          }
        }

        @media (max-width: 430px) {
          .brand {
            font-size: 12px;
            letter-spacing: 2px;
          }

          .back-button {
            width: 39px;
            height: 39px;
          }

          .suggestions {
            gap: 5px;
          }

          .card {
            height: 64px;
            padding: 6px;
          }

          .card-icon {
            width: 27px;
            height: 27px;
            flex-basis: 27px;
            font-size: 12px;
          }

          .card strong {
            font-size: 6.5px;
          }

          .card p {
            font-size: 8px;
          }
        }
      `}</style>
    </main>
  );
}
