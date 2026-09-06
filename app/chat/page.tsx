"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Message = {
  role: "user" | "assistant";
  content: string;
};

function BackIcon() {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 30 30"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M18 6L9 15L18 24"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 15H24"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CreateIcon() {
  return (
    <svg
      width="38"
      height="38"
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M13 35L16.5 24.5L32.5 8.5C34.2 6.8 36.9 6.8 38.6 8.5C40.3 10.2 40.3 12.9 38.6 14.6L22.6 30.6L13 35Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M29 12L36 19"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M34 7L41 14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LearnIcon() {
  return (
    <svg
      width="38"
      height="38"
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7 13L24 7L41 13L24 19L7 13Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M13 16V29L24 34L35 29V16"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M41 14V27"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IdeaIcon() {
  return (
    <svg
      width="38"
      height="38"
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M16 29C13.5 26.8 12 23.7 12 20C12 13.4 17.4 8 24 8C30.6 8 36 13.4 36 20C36 23.7 34.5 26.8 32 29C30.2 30.6 29 32.4 29 35H19C19 32.4 17.8 30.6 16 29Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M19 40H29"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M20 35H28"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M24 3V1"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M9 8L7 6"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M39 8L41 6"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SpaceSendIcon() {
  return (
    <svg
      width="38"
      height="38"
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="spaceStarGradient"
          x1="8"
          y1="8"
          x2="40"
          y2="40"
        >
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="45%" stopColor="#d9c7ff" />
          <stop offset="100%" stopColor="#63eaff" />
        </linearGradient>
      </defs>

      <ellipse
        cx="24"
        cy="24"
        rx="17"
        ry="8"
        transform="rotate(-28 24 24)"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth="1.2"
      />

      <circle
        cx="38"
        cy="15"
        r="2"
        fill="#63eaff"
      />

      <path
        d="M24 9L26.7 20.9L39 24L26.7 27.1L24 39L21.3 27.1L9 24L21.3 20.9L24 9Z"
        fill="url(#spaceStarGradient)"
      />

      <circle
        cx="24"
        cy="24"
        r="3.2"
        fill="white"
      />
    </svg>
  );
}

function MobixaLogo() {
  return (
    <svg
      className="mobixa-logo"
      viewBox="0 0 220 220"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="logoGradient"
          x1="40"
          y1="40"
          x2="180"
          y2="180"
        >
          <stop offset="0%" stopColor="#9f4cff" />
          <stop offset="48%" stopColor="#5e8cff" />
          <stop offset="100%" stopColor="#00eaff" />
        </linearGradient>

        <filter id="logoGlow">
          <feGaussianBlur
            stdDeviation="7"
            result="blur"
          />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <ellipse
        cx="110"
        cy="110"
        rx="82"
        ry="32"
        transform="rotate(-25 110 110)"
        stroke="rgba(132,82,255,0.75)"
        strokeWidth="2"
      />

      <ellipse
        cx="110"
        cy="110"
        rx="76"
        ry="27"
        transform="rotate(35 110 110)"
        stroke="rgba(0,224,255,0.5)"
        strokeWidth="2"
      />

      <circle
        cx="110"
        cy="110"
        r="62"
        fill="rgba(20,10,55,0.82)"
        stroke="url(#logoGradient)"
        strokeWidth="3"
        filter="url(#logoGlow)"
      />

      <path
        d="M67 148V74L110 116L153 74V148"
        stroke="url(#logoGradient)"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#logoGlow)"
      />

      <circle
        cx="110"
        cy="45"
        r="4"
        fill="#fff"
      />

      <circle
        cx="169"
        cy="116"
        r="3"
        fill="#64eaff"
      />

      <circle
        cx="54"
        cy="95"
        r="3"
        fill="#bd72ff"
      />
    </svg>
  );
}

function MobixaRobot() {
  return (
    <svg
      width="70"
      height="70"
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="robotGradient"
          x1="20"
          y1="20"
          x2="80"
          y2="90"
        >
          <stop offset="0%" stopColor="#b866ff" />
          <stop offset="55%" stopColor="#635cff" />
          <stop offset="100%" stopColor="#00dcff" />
        </linearGradient>

        <filter id="robotGlow">
          <feGaussianBlur
            stdDeviation="3"
            result="blur"
          />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <path
        d="M27 47C27 34 37 25 50 25C63 25 73 34 73 47V66C73 73 67 79 60 79H40C33 79 27 73 27 66V47Z"
        fill="rgba(25,12,62,0.95)"
        stroke="url(#robotGradient)"
        strokeWidth="3"
        filter="url(#robotGlow)"
      />

      <rect
        x="34"
        y="38"
        width="32"
        height="24"
        rx="10"
        fill="#09051b"
        stroke="#8c6bff"
        strokeWidth="2"
      />

      <circle
        cx="44"
        cy="49"
        r="3"
        fill="#00eaff"
      />

      <circle
        cx="56"
        cy="49"
        r="3"
        fill="#00eaff"
      />

      <path
        d="M44 55C47 58 53 58 56 55"
        stroke="#b77cff"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <path
        d="M27 51L18 45"
        stroke="#9a6cff"
        strokeWidth="4"
        strokeLinecap="round"
      />

      <path
        d="M73 51L83 43"
        stroke="#9a6cff"
        strokeWidth="4"
        strokeLinecap="round"
      />

      <path
        d="M84 43L88 37"
        stroke="#00eaff"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <circle
        cx="50"
        cy="70"
        r="5"
        fill="#0b0924"
        stroke="#00eaff"
        strokeWidth="2"
      />

      <path
        d="M39 79L33 89"
        stroke="#8c65ff"
        strokeWidth="4"
        strokeLinecap="round"
      />

      <path
        d="M61 79L67 89"
        stroke="#8c65ff"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Hand() {
  return <span className="hand">👋</span>;
}

export default function ChatPage() {
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef =
    useRef<HTMLDivElement | null>(null);

  const inputRef =
    useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);

  async function sendMessage(text?: string) {
    const messageToSend =
      (text ?? input).trim();

    if (!messageToSend || loading) return;

    setInput("");

    const userMessage: Message = {
      role: "user",
      content: messageToSend,
    };

    setMessages((prev) => [
      ...prev,
      userMessage,
    ]);

    setLoading(true);

    try {
      const response = await fetch(
        "/api/chat",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            message: messageToSend,
          }),
        }
      );

      if (!response.ok) {
        let errorText =
          "خطایی در ارتباط با هوش مصنوعی رخ داد.";

        try {
          const data =
            await response.json();

          errorText =
            data?.error ||
            errorText;
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
        throw new Error(
          "پاسخ Streaming دریافت نشد."
        );
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "",
        },
      ]);

      const reader =
        response.body.getReader();

      const decoder =
        new TextDecoder();

      let buffer = "";
      let assistantText = "";

      while (true) {
        const {
          done,
          value,
        } = await reader.read();

        if (done) break;

        buffer += decoder.decode(
          value,
          {
            stream: true,
          }
        );

        const events =
          buffer.split("\n\n");

        buffer =
          events.pop() || "";

        for (const event of events) {
          const lines =
            event.split("\n");

          for (const line of lines) {
            if (
              !line.startsWith(
                "data:"
              )
            ) {
              continue;
            }

            const dataText =
              line
                .slice(5)
                .trim();

            if (
              !dataText ||
              dataText === "[DONE]"
            ) {
              continue;
            }

            try {
              const parsed =
                JSON.parse(
                  dataText
                );

              const parts =
                parsed
                  ?.candidates?.[0]
                  ?.content?.parts ||
                [];

              const textPart =
                parts.find(
                  (
                    part: {
                      text?: string;
                    }
                  ) =>
                    typeof part?.text ===
                    "string"
                );

              if (
                textPart?.text
              ) {
                assistantText +=
                  textPart.text;

                const currentText =
                  assistantText;

                setMessages(
                  (prev) => {
                    const copy = [
                      ...prev,
                    ];

                    const lastIndex =
                      copy.length - 1;

                    if (
                      lastIndex >= 0 &&
                      copy[
                        lastIndex
                      ].role ===
                        "assistant"
                    ) {
                      copy[
                        lastIndex
                      ] = {
                        ...copy[
                          lastIndex
                        ],
                        content:
                          currentText,
                      };
                    }

                    return copy;
                  }
                );
              }
            } catch {
              // بعضی chunkها ممکن است JSON کامل نباشند.
            }
          }
        }
      }
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "یه خطایی پیش اومد. دوباره امتحان کن.",
        },
      ]);
    } finally {
      setLoading(false);

      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }

  const suggestions = [
    {
      title: "CREATE",
      text: "متنت رو حرفه‌ای کن",
      icon: <CreateIcon />,
      className: "create-card",
    },
    {
      title: "LEARN MODE",
      text: "هر چیزی رو ساده یاد بگیر",
      icon: <LearnIcon />,
      className: "learn-card",
    },
    {
      title: "IDEA LAB",
      text: "یه ایده خفن بساز",
      icon: <IdeaIcon />,
      className: "idea-card",
    },
  ];

  return (
    <main className="page">
      <div className="background-glow glow-one" />
      <div className="background-glow glow-two" />

      <div className="stars stars-one">
        ✦
      </div>

      <div className="stars stars-two">
        ✦
      </div>

      <div className="stars stars-three">
        ✦
      </div>

      <div className="stars stars-four">
        ✦
      </div>

      <div className="stars stars-five">
        ✦
      </div>

      <header className="topbar">
        <button
          className="back-button"
          onClick={() => {
            if (
              window.history.length >
              1
            ) {
              router.back();
            } else {
              router.push("/");
            }
          }}
          aria-label="بازگشت"
        >
          <BackIcon />
          <span>بازگشت</span>
        </button>

        <div className="wordmark">
          <span>
            M O B I X A
          </span>

          <span className="wordmark-ai">
            {" "}
            A I
          </span>
        </div>
      </header>

      <section className="hero">
        <div className="sparkle-top">
          ✦
        </div>

        <div className="logo-wrap">
          <MobixaLogo />
        </div>

        <div className="robot-wrap">
          <MobixaRobot />
        </div>

        <div className="sparkle-bottom">
          ✦
        </div>

        <h1 className="greeting">
          <span>سلام</span>
          <Hand />
        </h1>

        <h2 className="hero-title">
          بزن بریم مهندس
        </h2>

        <div className="neon-line" />

        <p className="intro">
          اینجا هر چیزی که توی ذهنت داری،
          <br />
          می‌تونه شروع یک چیز بزرگ باشه.
          <br />
          ایده بده، سؤال بپرس، بساز.
        </p>
      </section>

      <section className="suggestions">
        {suggestions.map(
          (suggestion) => (
            <button
              key={suggestion.title}
              type="button"
              className={`suggestion-card ${suggestion.className}`}
              onClick={() =>
                sendMessage(
                  suggestion.text
                )
              }
              disabled={loading}
            >
              <div className="suggestion-icon">
                {suggestion.icon}
              </div>

              <div className="suggestion-title">
                {suggestion.title}
              </div>

              <div className="suggestion-text">
                {suggestion.text}
              </div>
            </button>
          )
        )}
      </section>

      <div className="orbital-bg orbital-one" />
      <div className="orbital-bg orbital-two" />

      <section className="chat-area">
        {messages.length > 0 && (
          <div className="messages">
            {messages.map(
              (message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`message ${
                    message.role ===
                    "user"
                      ? "user-message"
                      : "assistant-message"
                  }`}
                >
                  {message.content}
                </div>
              )
            )}

            {loading &&
              messages[
                messages.length - 1
              ]?.role === "user" && (
                <div className="message assistant-message typing">
                  <span />
                  <span />
                  <span />
                </div>
              )}

            <div
              ref={messagesEndRef}
            />
          </div>
        )}
      </section>

      <section className="composer-section">
        <form
          className="composer"
          onSubmit={(event) => {
            event.preventDefault();
            sendMessage();
          }}
        >
          <button
            type="submit"
            className="send-button"
            disabled={
              !input.trim() ||
              loading
            }
            aria-label="ارسال پیام"
          >
            <SpaceSendIcon />
          </button>

          <input
            ref={inputRef}
            value={input}
            onChange={(event) =>
              setInput(
                event.target.value
              )
            }
            placeholder="برای این موضوع چند ایده خلاقانه و خفن بهم بده:"
            dir="rtl"
            disabled={loading}
          />
        </form>

        <div className="footer-note">
          <span>
            Mobixa AI ✦
          </span>

          <span>
            ممکن است گاهی پاسخ نادرست باشد.
          </span>
        </div>
      </section>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .page {
          min-height: 100svh;
          position: relative;
          overflow-x: hidden;
          overflow-y: auto;
          background:
            radial-gradient(
              circle at 50% 38%,
              rgba(91, 29, 174, 0.2),
              transparent 34%
            ),
            linear-gradient(
              180deg,
              #02020a 0%,
              #050318 42%,
              #10063b 72%,
              #031c55 100%
            );
          color: white;
          font-family:
            Arial,
            "Segoe UI",
            Tahoma,
            sans-serif;
          padding-bottom: 125px;
        }

        .background-glow {
          position: fixed;
          pointer-events: none;
          border-radius: 50%;
          filter: blur(70px);
          opacity: 0.45;
        }

        .glow-one {
          width: 280px;
          height: 280px;
          left: -140px;
          top: 42%;
          background: #6b1cff;
        }

        .glow-two {
          width: 260px;
          height: 260px;
          right: -130px;
          bottom: 5%;
          background: #005cff;
        }

        .topbar {
          position: relative;
          z-index: 5;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 42px 34px 0;

          /* فقط برای اینکه بازگشت چپ و MOBIXA راست باشد */
          direction: ltr;
        }

        .back-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          height: 80px;
          min-width: 145px;
          padding: 0 22px;
          border-radius: 45px;
          border: 2px solid #984cff;
          color: white;
          background: rgba(
            23,
            8,
            55,
            0.48
          );
          box-shadow:
            0 0 15px
              rgba(
                139,
                61,
                255,
                0.5
              ),
            inset 0 0 18px
              rgba(
                139,
                61,
                255,
                0.1
              );
          font-size: 20px;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .back-button:active {
          transform: scale(0.96);
        }

        .wordmark {
          font-size: 26px;
          font-weight: 800;
          letter-spacing: 8px;
          white-space: nowrap;
          direction: ltr;
        }

        .wordmark-ai {
          background: linear-gradient(
            90deg,
            #b16cff,
            #00dcff
          );
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .hero {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          flex-direction: column;
          text-align: center;
          padding-top: 18px;
        }

        .logo-wrap {
          width: 150px;
          height: 150px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mobixa-logo {
          width: 100%;
          height: 100%;
          filter:
            drop-shadow(
              0 0 12px
                rgba(
                  146,
                  71,
                  255,
                  0.6
                )
            )
            drop-shadow(
              0 0 24px
                rgba(
                  0,
                  220,
                  255,
                  0.18
                )
            );
        }

        .robot-wrap {
          height: 74px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: -5px;
        }

        .sparkle-top,
        .sparkle-bottom {
          color: white;
          font-size: 29px;
          line-height: 1;
          text-shadow: 0 0 12px white;
        }

        .sparkle-bottom {
          margin-top: -1px;
        }

        .greeting {
          margin: 8px 0 0;
          display: flex;
          align-items: center;
          justify-content: center;
          direction: rtl;
          gap: 13px;
          font-size: 54px;
          font-weight: 700;
          text-shadow:
            0 0 20px
              rgba(
                255,
                255,
                255,
                0.35
              );
        }

        .hand {
          font-size: 48px;
          line-height: 1;
          filter: drop-shadow(
            0 0 12px
              rgba(
                255,
                183,
                77,
                0.45
              )
          );
        }

        .hero-title {
          margin: 6px 0 0;
          font-size: 40px;
          font-weight: 900;
          background: linear-gradient(
            90deg,
            #784eff,
            #00d9ff,
            #a75bff
          );
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          text-shadow:
            0 0 25px
              rgba(
                111,
                69,
                255,
                0.25
              );
        }

        .neon-line {
          width: 280px;
          height: 7px;
          margin-top: 22px;
          border-radius: 999px;
          background: linear-gradient(
            90deg,
            #25104c,
            #a24cff,
            #ffffff,
            #16e5ff,
            #11152f
          );
          box-shadow:
            0 0 8px #963cff,
            0 0 18px
              rgba(
                0,
                225,
                255,
                0.5
              );
        }

        .intro {
          margin: 22px 0 0;
          color: rgba(
            241,
            236,
            255,
            0.85
          );
          font-size: 20px;
          line-height: 2;
          direction: rtl;
        }

        .suggestions {
          position: relative;
          z-index: 3;
          display: grid;
          grid-template-columns: repeat(
            3,
            1fr
          );
          gap: 14px;
          padding: 25px 24px 0;
          max-width: 900px;
          margin: 0 auto;

          /* باعث می‌شود ترتیب دقیقاً همین باشد:
             CREATE | LEARN MODE | IDEA LAB */
          direction: ltr;
        }

        .suggestion-card {
          min-height: 165px;
          border-radius: 30px;
          background: rgba(
            13,
            7,
            44,
            0.72
          );
          padding: 19px 12px 15px;
          cursor: pointer;
          transition:
            transform 0.18s ease,
            background 0.18s ease;
        }

        .suggestion-card:active {
          transform: scale(0.97);
        }

        .suggestion-card:disabled {
          opacity: 0.7;
          cursor: default;
        }

        .create-card {
          border: 2px solid #a94cff;
          box-shadow:
            0 0 16px
              rgba(
                171,
                74,
                255,
                0.16
              ),
            inset 0 0 22px
              rgba(
                133,
                47,
                255,
                0.07
              );
        }

        .learn-card {
          border: 2px solid #00d8ff;
          box-shadow:
            0 0 16px
              rgba(
                0,
                216,
                255,
                0.13
              ),
            inset 0 0 22px
              rgba(
                0,
                190,
                255,
                0.05
              );
        }

        .idea-card {
          border: 2px solid #9b4cff;
          box-shadow:
            0 0 16px
              rgba(
                155,
                76,
                255,
                0.14
              ),
            inset 0 0 22px
              rgba(
                155,
                76,
                255,
                0.05
              );
        }

        .suggestion-icon {
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 7px;
        }

        .create-card
          .suggestion-icon {
          color: #be67ff;
        }

        .learn-card
          .suggestion-icon {
          color: #00e5ff;
        }

        .idea-card
          .suggestion-icon {
          color: #bb66ff;
        }

        .suggestion-title {
          font-size: 17px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .create-card
          .suggestion-title {
          color: #c064ff;
        }

        .learn-card
          .suggestion-title {
          color: #00ddff;
        }

        .idea-card
          .suggestion-title {
          color: #c064ff;
        }

        .suggestion-text {
          margin-top: 10px;
          color: white;
          font-size: 14px;
          line-height: 1.8;
          direction: rtl;
        }

        .orbital-bg {
          position: absolute;
          pointer-events: none;
          border: 1px solid
            rgba(
              92,
              60,
              255,
              0.32
            );
          border-radius: 50%;
          transform: rotate(-18deg);
          filter: drop-shadow(
            0 0 9px
              rgba(
                94,
                70,
                255,
                0.22
              )
          );
        }

        .orbital-one {
          width: 760px;
          height: 270px;
          left: -160px;
          top: 780px;
        }

        .orbital-two {
          width: 600px;
          height: 190px;
          right: -200px;
          top: 1050px;
          border-color: rgba(
            0,
            213,
            255,
            0.2
          );
        }

        .chat-area {
          position: relative;
          z-index: 4;
          width: min(
            94%,
            850px
          );
          margin: 360px auto 0;
        }

        .messages {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 45vh;
          overflow-y: auto;
          padding: 10px;
        }

        .message {
          max-width: 85%;
          padding: 13px 17px;
          border-radius: 18px;
          font-size: 16px;
          line-height: 1.8;
          white-space: pre-wrap;
        }

        /*
          پیام کاربر:
          سمت راست + متن راست‌چین
        */
        .user-message {
          align-self: flex-end;
          background: rgba(
            100,
            55,
            220,
            0.25
          );
          border: 1px solid
            rgba(
              155,
              94,
              255,
              0.55
            );
          text-align: right;
          direction: rtl;
        }

        /*
          پیام هوش مصنوعی:
          سمت چپ + شروع متن از چپ
        */
        .assistant-message {
          align-self: flex-start;
          background: rgba(
            5,
            22,
            58,
            0.7
          );
          border: 1px solid
            rgba(
              0,
              214,
              255,
              0.4
            );
          text-align: left;
          direction: ltr;
        }

        .typing {
          display: flex;
          gap: 5px;
          align-items: center;
          height: 44px;
        }

        .typing span {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #a965ff;
          animation: typing
            1s infinite
            ease-in-out;
        }

        .typing span:nth-child(2) {
          animation-delay: 0.15s;
        }

        .typing span:nth-child(3) {
          animation-delay: 0.3s;
        }

        @keyframes typing {
          0%,
          100% {
            transform: translateY(0);
            opacity: 0.45;
          }

          50% {
            transform: translateY(-5px);
            opacity: 1;
          }
        }

        .composer-section {
          position: fixed;
          z-index: 20;
          left: 0;
          right: 0;
          bottom: 0;
          padding: 0 24px 17px;
          background: linear-gradient(
            180deg,
            transparent,
            rgba(
              3,
              3,
              20,
              0.12
            )
              20%,
            rgba(
              3,
              3,
              20,
              0.8
            )
              60%,
            rgba(
              3,
              3,
              20,
              0.95
            )
          );
        }

        .composer {
          width: min(
            100%,
            850px
          );
          height: 90px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 8px 15px;
          direction: ltr;
          border: 2px solid #4c75ff;
          border-radius: 30px;
          background: rgba(
            5,
            15,
            45,
            0.92
          );
          box-shadow:
            0 0 16px
              rgba(
                41,
                93,
                255,
                0.18
              ),
            inset 0 0 25px
              rgba(
                46,
                61,
                160,
                0.12
              );
        }

        .composer input {
          flex: 1;
          min-width: 0;
          height: 100%;
          border: 0;
          outline: none;
          background: transparent;
          color: white;
          font-size: 19px;
          text-align: right;
          direction: rtl;
          font-family: inherit;
        }

        .composer input::placeholder {
          color: rgba(
            255,
            255,
            255,
            0.92
          );
          opacity: 1;
        }

        .send-button {
          flex: 0 0 auto;
          width: 68px;
          height: 68px;
          border: 0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          background:
            radial-gradient(
              circle at 35% 30%,
              #b975ff 0%,
              #7537e9 42%,
              #3e5cff 75%,
              #132a9e 100%
            );
          box-shadow:
            0 0 14px
              rgba(
                145,
                73,
                255,
                0.75
              ),
            0 0 25px
              rgba(
                0,
                135,
                255,
                0.25
              ),
            inset 0 0 13px
              rgba(
                255,
                255,
                255,
                0.2
              );
          cursor: pointer;
          transition: transform
            0.18s ease;
        }

        .send-button:active {
          transform: scale(0.94);
        }

        .send-button:disabled {
          opacity: 0.55;
          cursor: default;
        }

        .footer-note {
          width: min(
            100%,
            850px
          );
          margin: 7px auto 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: rgba(
            255,
            255,
            255,
            0.28
          );
          font-size: 11px;
          direction: rtl;
        }

        .footer-note span {
          color: rgba(
            179,
            101,
            255,
            0.7
          );
        }

        .stars {
          position: absolute;
          z-index: 1;
          color: #9f83ff;
          text-shadow:
            0 0 10px #8d5fff;
          font-size: 17px;
          pointer-events: none;
        }

        .stars-one {
          left: 12%;
          top: 34%;
        }

        .stars-two {
          right: 12%;
          top: 47%;
        }

        .stars-three {
          right: 7%;
          top: 68%;
        }

        .stars-four {
          left: 8%;
          top: 77%;
          font-size: 10px;
        }

        .stars-five {
          right: 19%;
          top: 86%;
          font-size: 12px;
        }

        @media (max-width: 650px) {
          .topbar {
            padding: 34px 24px 0;
            direction: ltr;
          }

          .back-button {
            min-width: 145px;
            height: 78px;
          }

          .wordmark {
            font-size: 23px;
            letter-spacing: 5px;
          }

          .logo-wrap {
            width: 105px;
            height: 105px;
          }

          .robot-wrap {
            height: 62px;
          }

          .greeting {
            font-size: 47px;
          }

          .hand {
            font-size: 42px;
          }

          .hero-title {
            font-size: 34px;
          }

          .intro {
            font-size: 17px;
            line-height: 1.95;
          }

          .suggestions {
            gap: 10px;
            padding-left: 22px;
            padding-right: 22px;
            direction: ltr;
          }

          .suggestion-card {
            min-height: 165px;
            border-radius: 27px;
            padding-left: 8px;
            padding-right: 8px;
          }

          .suggestion-icon {
            transform: scale(0.88);
          }

          .suggestion-title {
            font-size: 14px;
          }

          .suggestion-text {
            font-size: 12px;
          }

          .chat-area {
            margin-top: 330px;
          }

          .composer-section {
            padding: 0 23px 15px;
          }

          .composer {
            height: 86px;
            border-radius: 29px;
          }

          .send-button {
            width: 64px;
            height: 64px;
          }

          .composer input {
            font-size: 16px;
          }
        }

        @media (max-width: 430px) {
          .topbar {
            padding-left: 20px;
            padding-right: 20px;
            direction: ltr;
          }

          .back-button {
            min-width: 128px;
            height: 72px;
            font-size: 18px;
            padding: 0 16px;
          }

          .wordmark {
            font-size: 19px;
            letter-spacing: 4px;
          }

          .greeting {
            font-size: 43px;
          }

          .hero-title {
            font-size: 31px;
          }

          .neon-line {
            width: 250px;
          }

          .suggestions {
            padding-left: 20px;
            padding-right: 20px;
            gap: 9px;
            direction: ltr;
          }

          .suggestion-card {
            min-height: 155px;
            padding-top: 15px;
          }

          .suggestion-icon {
            height: 43px;
          }

          .suggestion-title {
            font-size: 12px;
          }

          .suggestion-text {
            font-size: 10.5px;
            line-height: 1.7;
          }

          .composer-section {
            padding-left: 20px;
            padding-right: 20px;
          }

          .composer {
            height: 82px;
          }

          .send-button {
            width: 60px;
            height: 60px;
          }

          .composer input {
            font-size: 14px;
          }

          .footer-note {
            font-size: 9px;
          }
        }
      `}</style>
    </main>
  );
}
