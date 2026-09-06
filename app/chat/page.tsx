"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

function MobixaLogo() {
  return (
    <div className="logo-orbit">
      <div className="orbit orbit-one" />
      <div className="orbit orbit-two" />

      <div className="logo-sphere">
        <div className="logo-m">
          <span className="m-left" />
          <span className="m-center" />
          <span className="m-right" />
        </div>

        <div className="logo-star star-one">✦</div>
        <div className="logo-star star-two">✦</div>
      </div>
    </div>
  );
}

function Robot() {
  return (
    <div className="robot-wrap">
      <div className="robot-glow" />

      <div className="robot">
        <div className="robot-head">
          <div className="robot-ear left" />
          <div className="robot-ear right" />

          <div className="robot-face">
            <div className="robot-eye left-eye" />
            <div className="robot-eye right-eye" />

            <div className="robot-smile" />
          </div>
        </div>

        <div className="robot-body">
          <div className="robot-chest">
            <div />
          </div>

          <div className="robot-arm left-arm" />
          <div className="robot-arm right-arm">
            <div className="robot-finger" />
          </div>
        </div>
      </div>

      <div className="robot-spark spark-one">✦</div>
      <div className="robot-spark spark-two">✧</div>
      <div className="robot-spark spark-three">✦</div>
    </div>
  );
}

function HandSticker() {
  return (
    <span className="hand-sticker" aria-hidden="true">
      👋
    </span>
  );
}

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M19 12H5M11 6l-6 6 6 6"
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
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M21 3 10.5 13.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="m21 3-7 18-3.5-7.5L3 10l18-7Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CreateIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="m4 20 4.5-1 10-10-3.5-3.5-10 10L4 20Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="m13.5 6.5 3.5 3.5M7 17l3 3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M18.5 3v3M17 4.5h3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LearnIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 5.5 12 3l9 2.5v13L12 21l-9-2.5v-13Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M12 3v18M3 5.5l9 2.7 9-2.7"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function IdeaIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 18h6M10 21h4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M8 14.5c-1.2-1-2-2.5-2-4.2A6 6 0 0 1 18 10.3c0 1.7-.8 3.2-2 4.2-.8.7-1.3 1.5-1.4 2.5h-5.2c-.1-1-.6-1.8-1.4-2.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M20 4v2M19 5h2M4 5v2M3 6h2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function ChatPage() {
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);

  function handleBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }

  function useSuggestion(text: string) {
    setInput(text);

    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  }

  async function sendMessage(customMessage?: string) {
    const message = (customMessage ?? input).trim();

    if (!message || loading) return;

    setInput("");

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: message,
    };

    const assistantId = crypto.randomUUID();

    setMessages((prev) => [
      ...prev,
      userMessage,
      {
        id: assistantId,
        role: "assistant",
        content: "",
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
        let errorText = "خطایی در ارتباط با هوش مصنوعی رخ داد.";

        try {
          const errorData = await response.json();
          errorText = errorData?.error || errorText;
        } catch {}

        throw new Error(errorText);
      }

      if (!response.body) {
        throw new Error("پاسخ Streaming دریافت نشد.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let buffer = "";
      let assistantText = "";

      while (true) {
        const { value, done } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, {
          stream: true,
        });

        const events = buffer.split("\n\n");

        buffer = events.pop() || "";

        for (const event of events) {
          const lines = event.split("\n");

          for (const line of lines) {
            if (!line.startsWith("data:")) continue;

            const rawData = line.slice(5).trim();

            if (!rawData || rawData === "[DONE]") continue;

            try {
              const parsed = JSON.parse(rawData);

              const text =
                parsed?.candidates?.[0]?.content?.parts?.find(
                  (part: { text?: string }) =>
                    typeof part.text === "string"
                )?.text ?? "";

              if (!text) continue;

              assistantText += text;

              setMessages((prev) =>
                prev.map((item) =>
                  item.id === assistantId
                    ? {
                        ...item,
                        content: assistantText,
                      }
                    : item
                )
              );
            } catch {
              // بعضی eventها ممکن است JSON کامل نباشند.
            }
          }
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "خطایی رخ داد.";

      setMessages((prev) =>
        prev.map((item) =>
          item.id === assistantId
            ? {
                ...item,
                content: `⚠️ ${errorMessage}`,
              }
            : item
        )
      );
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  useEffect(() => {
    const element = messagesRef.current;

    if (!element) return;

    element.scrollTo({
      top: element.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length]);

  return (
    <main
      dir="rtl"
      className="mobixa-page min-h-[100svh] overflow-hidden bg-[#02030b] text-white"
    >
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="bg-glow glow-purple" />
        <div className="bg-glow glow-blue" />
        <div className="bg-glow glow-bottom" />

        <div className="light-line line-one" />
        <div className="light-line line-two" />
        <div className="light-line line-three" />

        <div className="stars">
          <span>✦</span>
          <span>·</span>
          <span>✧</span>
          <span>·</span>
          <span>✦</span>
          <span>·</span>
          <span>✧</span>
          <span>·</span>
          <span>✦</span>
        </div>
      </div>

      {/* Header */}
      <header className="relative z-20 mx-auto flex w-full max-w-5xl items-center justify-between px-5 pb-2 pt-6 sm:px-8">
        <button
          type="button"
          onClick={handleBack}
          className="back-button"
        >
          <BackIcon />
          <span>بازگشت</span>
        </button>

        <div className="brand">
          <span>MOBIXA</span>
          <b>AI</b>
        </div>
      </header>

      {/* Main */}
      <section className="relative z-10 mx-auto flex h-[calc(100svh-91px)] min-h-0 w-full max-w-5xl flex-col px-4 sm:px-8">
        <div
          ref={messagesRef}
          className="min-h-0 flex-1 overflow-y-auto pb-4 pt-1 scrollbar-none"
        >
          {messages.length === 0 ? (
            <div className="flex min-h-full flex-col items-center">
              {/* Logo */}
              <div className="logo-zone">
                <MobixaLogo />
              </div>

              {/* Robot */}
              <Robot />

              {/* Greeting */}
              <div className="welcome-block">
                <div className="hello-line">
                  <span>سلام</span>
                  <HandSticker />
                </div>

                <h1>
                  <span>بزن بریم</span>{" "}
                  <strong>مهندس</strong>
                </h1>

                <div className="welcome-line" />
              </div>

              <p className="intro">
                اینجا هر چیزی که توی ذهنت داری،
                <br />
                می‌تونه شروع یک چیز بزرگ باشه.
                <br />
                <span>ایده بده، سؤال بپرس، بساز.</span>
              </p>

              {/* Suggestions */}
              <div className="suggestions">
                <button
                  type="button"
                  onClick={() =>
                    useSuggestion(
                      "این متن رو برای من حرفه‌ای‌تر و جذاب‌تر کن:"
                    )
                  }
                  className="suggestion-card purple-card"
                >
                  <div className="suggestion-icon">
                    <CreateIcon />
                  </div>

                  <div className="suggestion-content">
                    <span className="suggestion-title">CREATE</span>
                    <span className="suggestion-text">
                      متنت رو حرفه‌ای کن
                    </span>
                  </div>

                  <span className="card-arrow">↗</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    useSuggestion(
                      "این موضوع رو خیلی ساده و قابل فهم برام توضیح بده:"
                    )
                  }
                  className="suggestion-card blue-card"
                >
                  <div className="suggestion-icon">
                    <LearnIcon />
                  </div>

                  <div className="suggestion-content">
                    <span className="suggestion-title">LEARN MODE</span>
                    <span className="suggestion-text">
                      هر چیزی رو ساده یاد بگیر
                    </span>
                  </div>

                  <span className="card-arrow">↗</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    useSuggestion(
                      "برای این موضوع چند ایده خلاقانه و خفن بهم بده:"
                    )
                  }
                  className="suggestion-card violet-card"
                >
                  <div className="suggestion-icon">
                    <IdeaIcon />
                  </div>

                  <div className="suggestion-content">
                    <span className="suggestion-title">IDEA LAB</span>
                    <span className="suggestion-text">
                      یه ایده خفن بساز
                    </span>
                  </div>

                  <span className="card-arrow">↗</span>
                </button>
              </div>

              <div className="empty-space" />
            </div>
          ) : (
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-1 pb-8 pt-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={
                    message.role === "user"
                      ? "message-row user-row"
                      : "message-row assistant-row"
                  }
                >
                  <div
                    className={
                      message.role === "user"
                        ? "message-bubble user-bubble"
                        : "message-bubble assistant-bubble"
                    }
                  >
                    {message.content}

                    {message.role === "assistant" &&
                      loading &&
                      message.id === messages[messages.length - 1]?.id && (
                        <span className="typing-cursor">▋</span>
                      )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="relative z-30 shrink-0 pb-3 pt-2 sm:pb-5">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
            className="composer"
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="پیامت رو برای موبیکسا بنویس..."
              rows={1}
              disabled={loading}
              className="composer-input"
            />

            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="send-button"
              aria-label="ارسال پیام"
            >
              <SendIcon />
            </button>
          </form>

          <div className="footer-note">
            <span>✦ Mobixa AI</span>
            <span>ممکن است گاهی پاسخ نادرست باشد.</span>
          </div>
        </div>
      </section>

      <style jsx>{`
        .mobixa-page {
          position: relative;
          min-height: 100svh;
          font-family:
            Arial,
            Tahoma,
            system-ui,
            sans-serif;
        }

        .mobixa-page * {
          box-sizing: border-box;
        }

        .bg-glow {
          position: absolute;
          border-radius: 999px;
          filter: blur(80px);
          opacity: 0.42;
        }

        .glow-purple {
          width: 360px;
          height: 360px;
          left: -170px;
          top: 180px;
          background: #7c22ff;
        }

        .glow-blue {
          width: 340px;
          height: 340px;
          right: -170px;
          top: 400px;
          background: #0066ff;
        }

        .glow-bottom {
          width: 430px;
          height: 180px;
          left: 50%;
          bottom: -100px;
          transform: translateX(-50%);
          background: #6d21ff;
          opacity: 0.3;
        }

        .light-line {
          position: absolute;
          height: 1px;
          width: 70%;
          opacity: 0.5;
          background: linear-gradient(
            90deg,
            transparent,
            #9b5cff,
            #00cfff,
            transparent
          );
          transform-origin: center;
        }

        .line-one {
          top: 390px;
          left: -10%;
          transform: rotate(-25deg);
        }

        .line-two {
          top: 520px;
          right: -15%;
          transform: rotate(27deg);
        }

        .line-three {
          bottom: 170px;
          left: 15%;
          transform: rotate(-5deg);
          opacity: 0.2;
        }

        .stars {
          position: absolute;
          inset: 0;
          color: #9a8cff;
          font-size: 10px;
          opacity: 0.55;
        }

        .stars span {
          position: absolute;
        }

        .stars span:nth-child(1) {
          top: 15%;
          left: 12%;
        }

        .stars span:nth-child(2) {
          top: 24%;
          right: 14%;
        }

        .stars span:nth-child(3) {
          top: 36%;
          left: 8%;
        }

        .stars span:nth-child(4) {
          top: 44%;
          right: 10%;
        }

        .stars span:nth-child(5) {
          top: 60%;
          left: 14%;
        }

        .stars span:nth-child(6) {
          top: 68%;
          right: 15%;
        }

        .stars span:nth-child(7) {
          top: 78%;
          left: 9%;
        }

        .stars span:nth-child(8) {
          top: 84%;
          right: 12%;
        }

        .stars span:nth-child(9) {
          top: 30%;
          left: 48%;
        }

        .back-button {
          display: flex;
          height: 42px;
          align-items: center;
          gap: 7px;
          border-radius: 999px;
          border: 1px solid rgba(157, 84, 255, 0.9);
          padding: 0 14px 0 11px;
          color: white;
          background:
            linear-gradient(
              135deg,
              rgba(104, 27, 255, 0.42),
              rgba(0, 142, 255, 0.13)
            );
          box-shadow:
            0 0 16px rgba(132, 44, 255, 0.38),
            inset 0 0 16px rgba(96, 52, 255, 0.15);
          backdrop-filter: blur(15px);
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .back-button:hover {
          transform: translateY(-1px);
          box-shadow:
            0 0 24px rgba(132, 44, 255, 0.55),
            inset 0 0 18px rgba(96, 52, 255, 0.2);
        }

        .back-button svg {
          width: 20px;
          height: 20px;
        }

        .brand {
          direction: ltr;
          letter-spacing: 4px;
          font-size: 18px;
          font-weight: 800;
          text-shadow: 0 0 15px rgba(255, 255, 255, 0.18);
        }

        .brand b {
          margin-left: 5px;
          background: linear-gradient(90deg, #a855f7, #22d3ee);
          -webkit-background-clip: text;
          color: transparent;
        }

        .logo-zone {
          height: 180px;
          width: 100%;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          margin-top: 3px;
        }

        .logo-orbit {
          position: relative;
          width: 155px;
          height: 155px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo-sphere {
          position: relative;
          width: 105px;
          height: 105px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            radial-gradient(
              circle at 35% 25%,
              rgba(179, 126, 255, 0.8),
              rgba(43, 12, 102, 0.48) 42%,
              rgba(2, 5, 20, 0.9) 75%
            );
          border: 1px solid rgba(125, 87, 255, 0.65);
          box-shadow:
            0 0 22px rgba(135, 55, 255, 0.72),
            inset 0 0 28px rgba(29, 159, 255, 0.28);
        }

        .logo-m {
          position: relative;
          width: 55px;
          height: 55px;
          filter:
            drop-shadow(0 0 7px #b16cff)
            drop-shadow(0 0 14px #00cfff);
        }

        .logo-m span {
          position: absolute;
          top: 6px;
          width: 17px;
          height: 45px;
          border-radius: 5px;
          background: linear-gradient(
            180deg,
            #ecb6ff,
            #8f43ff 46%,
            #20d9ff
          );
        }

        .m-left {
          left: 3px;
          transform: skewY(28deg);
        }

        .m-center {
          left: 19px;
          height: 32px !important;
          top: 13px !important;
          transform: rotate(45deg) skewY(-17deg);
        }

        .m-right {
          right: 3px;
          transform: skewY(-28deg);
        }

        .orbit {
          position: absolute;
          border: 1px solid rgba(118, 83, 255, 0.7);
          border-radius: 50%;
          box-shadow: 0 0 12px rgba(85, 160, 255, 0.22);
        }

        .orbit-one {
          width: 155px;
          height: 55px;
          transform: rotate(-18deg);
        }

        .orbit-two {
          width: 150px;
          height: 65px;
          transform: rotate(54deg);
          border-color: rgba(0, 204, 255, 0.55);
        }

        .logo-star {
          position: absolute;
          color: #fff;
          text-shadow:
            0 0 8px #a96cff,
            0 0 18px #00d9ff;
        }

        .star-one {
          top: -2px;
          right: 16px;
        }

        .star-two {
          bottom: 5px;
          left: 18px;
          font-size: 13px;
        }

        .robot-wrap {
          position: relative;
          width: 150px;
          height: 132px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: -4px;
        }

        .robot-glow {
          position: absolute;
          width: 110px;
          height: 90px;
          border-radius: 50%;
          background: #7c3cff;
          filter: blur(42px);
          opacity: 0.4;
        }

        .robot {
          position: relative;
          width: 95px;
          height: 115px;
          z-index: 2;
        }

        .robot-head {
          position: absolute;
          width: 76px;
          height: 61px;
          left: 9px;
          top: 4px;
          border-radius: 31px 31px 27px 27px;
          border: 2px solid #829aff;
          background:
            radial-gradient(
              circle at 50% 35%,
              #18275d,
              #050918 72%
            );
          box-shadow:
            0 0 10px #6347ff,
            inset 0 0 14px rgba(0, 214, 255, 0.2);
        }

        .robot-face {
          position: absolute;
          inset: 10px;
          border-radius: 22px;
          border: 1px solid rgba(96, 203, 255, 0.5);
          background: #030715;
        }

        .robot-eye {
          position: absolute;
          width: 9px;
          height: 9px;
          top: 22px;
          border-radius: 50%;
          background: #43e7ff;
          box-shadow:
            0 0 7px #00d9ff,
            0 0 15px #8a5cff;
        }

        .left-eye {
          left: 18px;
        }

        .right-eye {
          right: 18px;
        }

        .robot-smile {
          position: absolute;
          width: 17px;
          height: 8px;
          left: 50%;
          bottom: 12px;
          transform: translateX(-50%);
          border-bottom: 2px solid #5bdcff;
          border-radius: 0 0 15px 15px;
        }

        .robot-ear {
          position: absolute;
          width: 14px;
          height: 25px;
          top: 18px;
          border-radius: 8px;
          border: 2px solid #6d68ff;
          background: #10163a;
        }

        .robot-ear.left {
          left: -9px;
        }

        .robot-ear.right {
          right: -9px;
        }

        .robot-body {
          position: absolute;
          width: 72px;
          height: 63px;
          left: 11px;
          top: 58px;
          border-radius: 25px 25px 20px 20px;
          background: linear-gradient(
            145deg,
            #11183b,
            #060914
          );
          border: 1px solid rgba(118, 116, 255, 0.8);
          box-shadow:
            0 0 13px rgba(92, 68, 255, 0.6),
            inset 0 0 12px rgba(0, 214, 255, 0.15);
        }

        .robot-chest {
          position: absolute;
          width: 22px;
          height: 22px;
          top: 19px;
          left: 25px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #56dfff;
          box-shadow: 0 0 10px #634cff;
        }

        .robot-chest div {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #00d9ff;
          box-shadow: 0 0 8px #00d9ff;
        }

        .robot-arm {
          position: absolute;
          width: 34px;
          height: 10px;
          top: 17px;
          border-radius: 10px;
          background: linear-gradient(
            90deg,
            #5446d9,
            #8e6cff
          );
        }

        .left-arm {
          left: -26px;
          transform: rotate(25deg);
        }

        .right-arm {
          right: -27px;
          transform: rotate(-40deg);
        }

        .robot-finger {
          position: absolute;
          width: 8px;
          height: 20px;
          right: -5px;
          top: -9px;
          border-radius: 8px;
          background: #9b8aff;
          transform: rotate(15deg);
          box-shadow: 0 0 8px #816aff;
        }

        .robot-spark {
          position: absolute;
          z-index: 4;
          color: #8f8cff;
          text-shadow: 0 0 12px #00d9ff;
        }

        .spark-one {
          top: 14px;
          right: 3px;
        }

        .spark-two {
          bottom: 16px;
          left: 3px;
          color: #b66cff;
        }

        .spark-three {
          top: 42px;
          left: 0;
          font-size: 9px;
        }

        .welcome-block {
          margin-top: -1px;
          text-align: center;
        }

        .hello-line {
          direction: rtl;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          font-size: 34px;
          line-height: 1;
          font-weight: 900;
          text-shadow:
            0 0 12px rgba(255, 255, 255, 0.24),
            0 0 25px rgba(133, 68, 255, 0.4);
        }

        .hand-sticker {
          display: inline-flex;
          font-size: 31px;
          transform: rotate(-8deg);
          filter:
            drop-shadow(0 0 7px rgba(168, 85, 247, 0.8))
            drop-shadow(0 0 13px rgba(0, 212, 255, 0.35));
          animation: handWave 2.4s ease-in-out infinite;
        }

        .welcome-block h1 {
          margin: 12px 0 0;
          font-size: 29px;
          line-height: 1.2;
          font-weight: 950;
        }

        .welcome-block h1 span {
          background: linear-gradient(
            90deg,
            #e88cff,
            #a855f7,
            #6d8cff
          );
          -webkit-background-clip: text;
          color: transparent;
        }

        .welcome-block h1 strong {
          background: linear-gradient(
            90deg,
            #8b5cf6,
            #22d3ee
          );
          -webkit-background-clip: text;
          color: transparent;
        }

        .welcome-line {
          width: 105px;
          height: 2px;
          margin: 11px auto 0;
          border-radius: 999px;
          background: linear-gradient(
            90deg,
            transparent,
            #a855f7,
            #22d3ee,
            transparent
          );
          box-shadow: 0 0 9px rgba(129, 76, 255, 0.8);
        }

        .intro {
          margin: 14px auto 0;
          max-width: 430px;
          text-align: center;
          font-size: 14px;
          line-height: 2;
          color: rgba(232, 235, 255, 0.86);
        }

        .intro span {
          color: #9ba6e8;
        }

        .suggestions {
          width: 100%;
          max-width: 590px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 9px;
          margin-top: 18px;
        }

        .suggestion-card {
          min-width: 0;
          min-height: 106px;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-radius: 18px;
          padding: 10px 6px 8px;
          overflow: hidden;
          color: white;
          cursor: pointer;
          backdrop-filter: blur(15px);
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .suggestion-card:hover {
          transform: translateY(-3px);
        }

        .purple-card {
          border: 1px solid rgba(184, 70, 255, 0.7);
          background: rgba(60, 12, 105, 0.3);
          box-shadow:
            0 0 18px rgba(165, 57, 255, 0.22),
            inset 0 0 20px rgba(165, 57, 255, 0.09);
        }

        .blue-card {
          border: 1px solid rgba(0, 191, 255, 0.75);
          background: rgba(5, 56, 105, 0.3);
          box-shadow:
            0 0 18px rgba(0, 191, 255, 0.2),
            inset 0 0 20px rgba(0, 191, 255, 0.08);
        }

        .violet-card {
          border: 1px solid rgba(143, 66, 255, 0.75);
          background: rgba(66, 14, 120, 0.28);
          box-shadow:
            0 0 18px rgba(143, 66, 255, 0.22),
            inset 0 0 20px rgba(143, 66, 255, 0.08);
        }

        .suggestion-icon {
          width: 27px;
          height: 27px;
          margin-bottom: 4px;
        }

        .suggestion-icon svg {
          width: 100%;
          height: 100%;
        }

        .purple-card .suggestion-icon,
        .purple-card .suggestion-title {
          color: #d36cff;
        }

        .blue-card .suggestion-icon,
        .blue-card .suggestion-title {
          color: #2ed9ff;
        }

        .violet-card .suggestion-icon,
        .violet-card .suggestion-title {
          color: #bd6cff;
        }

        .suggestion-content {
          display: flex;
          min-width: 0;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .suggestion-title {
          direction: ltr;
          font-size: 10px;
          line-height: 1;
          font-weight: 900;
          letter-spacing: 1px;
        }

        .suggestion-text {
          margin-top: 5px;
          color: rgba(245, 245, 255, 0.9);
          font-size: 10px;
          line-height: 1.5;
          white-space: nowrap;
        }

        .card-arrow {
          position: absolute;
          bottom: 5px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 13px;
          opacity: 0.8;
        }

        .empty-space {
          min-height: 10px;
          flex: 1;
        }

        .composer {
          width: 100%;
          max-width: 760px;
          min-height: 62px;
          margin: 0 auto;
          display: flex;
          direction: rtl;
          align-items: center;
          gap: 9px;
          border-radius: 22px;
          border: 1px solid rgba(65, 118, 255, 0.72);
          padding: 7px 8px 7px 10px;
          background:
            linear-gradient(
              110deg,
              rgba(29, 17, 70, 0.86),
              rgba(4, 17, 48, 0.88)
            );
          box-shadow:
            0 0 24px rgba(67, 60, 255, 0.2),
            inset 0 0 25px rgba(0, 183, 255, 0.07);
          backdrop-filter: blur(22px);
        }

        .composer-input {
          flex: 1;
          min-width: 0;
          min-height: 42px;
          max-height: 120px;
          resize: none;
          border: 0;
          outline: none;
          background: transparent;
          color: white;
          padding: 9px 8px;
          font-family: inherit;
          font-size: 14px;
          line-height: 1.6;
          text-align: right;
        }

        .composer-input::placeholder {
          color: rgba(179, 188, 235, 0.72);
        }

        .send-button {
          width: 49px;
          height: 49px;
          flex: 0 0 49px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(171, 100, 255, 0.8);
          border-radius: 50%;
          color: white;
          background:
            radial-gradient(
              circle at 30% 25%,
              #b875ff,
              #6937e8 48%,
              #315aff
            );
          box-shadow:
            0 0 16px rgba(145, 72, 255, 0.7),
            0 0 28px rgba(0, 180, 255, 0.2);
          cursor: pointer;
          transition: 0.2s ease;
        }

        .send-button:hover:not(:disabled) {
          transform: scale(1.06);
          box-shadow:
            0 0 20px rgba(145, 72, 255, 0.9),
            0 0 32px rgba(0, 180, 255, 0.3);
        }

        .send-button:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .send-button svg {
          width: 22px;
          height: 22px;
          transform: rotate(180deg);
        }

        .footer-note {
          width: 100%;
          max-width: 760px;
          margin: 7px auto 0;
          display: flex;
          justify-content: space-between;
          padding: 0 7px;
          color: rgba(129, 143, 197, 0.7);
          font-size: 8px;
        }

        .footer-note span:first-child {
          color: rgba(166, 118, 255, 0.78);
        }

        .message-row {
          display: flex;
          width: 100%;
        }

        .user-row {
          justify-content: flex-start;
        }

        .assistant-row {
          justify-content: flex-end;
        }

        .message-bubble {
          max-width: min(82%, 650px);
          border-radius: 18px;
          padding: 12px 15px;
          white-space: pre-wrap;
          line-height: 1.9;
          font-size: 14px;
        }

        .user-bubble {
          border: 1px solid rgba(136, 77, 255, 0.55);
          background: rgba(87, 37, 150, 0.32);
          box-shadow: 0 0 18px rgba(115, 58, 255, 0.1);
        }

        .assistant-bubble {
          border: 1px solid rgba(22, 178, 255, 0.38);
          background: rgba(9, 35, 73, 0.48);
          box-shadow: 0 0 18px rgba(22, 178, 255, 0.08);
        }

        .typing-cursor {
          display: inline-block;
          margin-right: 3px;
          color: #8b5cf6;
          animation: blink 0.7s infinite;
        }

        @keyframes blink {
          0%,
          45% {
            opacity: 1;
          }

          46%,
          100% {
            opacity: 0;
          }
        }

        @keyframes handWave {
          0%,
          100% {
            transform: rotate(-8deg);
          }

          50% {
            transform: rotate(7deg) translateY(-2px);
          }
        }

        @media (max-width: 430px) {
          .logo-zone {
            height: 157px;
          }

          .logo-orbit {
            transform: scale(0.86);
          }

          .robot-wrap {
            transform: scale(0.88);
            margin-top: -10px;
          }

          .hello-line {
            font-size: 31px;
          }

          .welcome-block h1 {
            font-size: 26px;
          }

          .intro {
            margin-top: 10px;
            font-size: 12px;
            line-height: 1.85;
          }

          .suggestions {
            gap: 6px;
            margin-top: 13px;
          }

          .suggestion-card {
            min-height: 96px;
            border-radius: 15px;
            padding: 7px 3px;
          }

          .suggestion-icon {
            width: 23px;
            height: 23px;
          }

          .suggestion-title {
            font-size: 8px;
            letter-spacing: 0.6px;
          }

          .suggestion-text {
            font-size: 8px;
            margin-top: 4px;
          }

          .card-arrow {
            font-size: 11px;
            bottom: 4px;
          }

          .composer {
            min-height: 58px;
            border-radius: 19px;
          }

          .send-button {
            width: 45px;
            height: 45px;
            flex-basis: 45px;
          }

          .footer-note {
            font-size: 7px;
          }
        }

        @media (max-height: 740px) {
          .logo-zone {
            height: 130px;
          }

          .logo-orbit {
            transform: scale(0.72);
          }

          .robot-wrap {
            transform: scale(0.7);
            margin-top: -22px;
          }

          .welcome-block h1 {
            margin-top: 5px;
            font-size: 23px;
          }

          .hello-line {
            font-size: 27px;
          }

          .intro {
            margin-top: 7px;
            line-height: 1.6;
          }

          .suggestions {
            margin-top: 9px;
          }

          .suggestion-card {
            min-height: 83px;
          }
        }

        @media (min-width: 700px) {
          .suggestions {
            gap: 13px;
          }

          .suggestion-card {
            min-height: 116px;
          }

          .suggestion-title {
            font-size: 11px;
          }

          .suggestion-text {
            font-size: 11px;
          }
        }
      `}</style>
    </main>
  );
}
