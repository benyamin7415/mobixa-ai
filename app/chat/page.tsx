"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type ChatHistoryMessage = {
  role: "user" | "assistant";
  content: string;
};

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
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className="send-icon"
    >
      <path
        d="M5 16h20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      <path
        d="M18 8l8 8-8 8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M6 11.5c2.2-1.8 4.8-2.7 7.5-2.7"
        fill="none"
        stroke="rgba(255,255,255,.65)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="stop-icon"
    >
      <rect
        x="7"
        y="7"
        width="10"
        height="10"
        rx="2"
        fill="currentColor"
      />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect
        x="8"
        y="8"
        width="11"
        height="11"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      <path
        d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="m5 12 4 4L19 6"
        fill="none"
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
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path
        d="m5 27 5.5-1.5L25 11l-4-4L6.5 21.5 5 27Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      <path
        d="m18 8 4 4M22 4v4M20 6h4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LearnIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path
        d="M4 7 16 3l12 4v18l-12 4-12-4V7Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      <path
        d="M16 3v26M4 7l12 4 12-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function IdeaIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path
        d="M10 23c-2-1.7-3-4.1-3-6.8C7 10.6 11 7 16 7s9 3.6 9 9.2c0 2.7-1 5.1-3 6.8-1.2 1-1.8 2.2-2 3.5H12c-.2-1.3-.8-2.5-2-3.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />

      <path
        d="M12 30h8M14 26h4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <path
        d="M16 2v2M28 10h-2M6 10H4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* =========================
   MARKDOWN / MESSAGE RENDERER
========================= */

function CodeBlock({
  code,
  language,
}: {
  code: string;
  language?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="code-block">
      <div className="code-header">
        <div className="code-language">
          {language || "CODE"}
        </div>

        <button
          type="button"
          className="code-copy"
          onClick={copyCode}
          aria-label={copied ? "کپی شد" : "کپی کد"}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
        </button>
      </div>

      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}

function InlineText({
  text,
}: {
  text: string;
}) {
  const parts = text.split(
    /(`[^`]+`|\*\*[^*]+\*\*)/g
  );

  return (
    <>
      {parts.map((part, index) => {
        if (
          part.startsWith("**") &&
          part.endsWith("**")
        ) {
          return (
            <strong
              key={index}
              className="inline-bold"
            >
              {part.slice(2, -2)}
            </strong>
          );
        }

        if (
          part.startsWith("`") &&
          part.endsWith("`")
        ) {
          return (
            <code
              key={index}
              className="inline-code"
            >
              {part.slice(1, -1)}
            </code>
          );
        }

        return (
          <span key={index}>
            {part}
          </span>
        );
      })}
    </>
  );
}

function MessageContent({
  content,
}: {
  content: string;
}) {
  const blocks: ReactNode[] = [];

  const lines = content
    .replace(/\r/g, "")
    .split("\n");

  let textBuffer: string[] = [];
  let codeBuffer: string[] = [];
  let codeLanguage = "";
  let insideCode = false;

  function flushText() {
    if (!textBuffer.length) return;

    const text = textBuffer.join("\n");

    if (text.trim()) {
      blocks.push(
        <div
          key={`text-${blocks.length}`}
          className="message-text"
        >
          {text.split("\n").map((line, index) => {
            const trimmed = line.trim();

            if (
              trimmed.startsWith("### ")
            ) {
              return (
                <h3
                  key={index}
                  className="message-heading heading-3"
                >
                  <InlineText
                    text={trimmed.slice(4)}
                  />
                </h3>
              );
            }

            if (
              trimmed.startsWith("## ")
            ) {
              return (
                <h2
                  key={index}
                  className="message-heading heading-2"
                >
                  <InlineText
                    text={trimmed.slice(3)}
                  />
                </h2>
              );
            }

            if (
              trimmed.startsWith("# ")
            ) {
              return (
                <h1
                  key={index}
                  className="message-heading heading-1"
                >
                  <InlineText
                    text={trimmed.slice(2)}
                  />
                </h1>
              );
            }

            if (
              trimmed.startsWith("- ") ||
              trimmed.startsWith("• ")
            ) {
              return (
                <div
                  key={index}
                  className="message-list-item"
                >
                  <span className="list-dot">
                    •
                  </span>

                  <span className="list-content">
                    <InlineText
                      text={trimmed.slice(2)}
                    />
                  </span>
                </div>
              );
            }

            if (
              /^\d+\.\s/.test(trimmed)
            ) {
              const match =
                trimmed.match(
                  /^(\d+)\.\s(.+)$/
                );

              if (match) {
                return (
                  <div
                    key={index}
                    className="message-list-item numbered"
                  >
                    <span className="list-number">
                      {match[1]}.
                    </span>

                    <span className="list-content">
                      <InlineText
                        text={match[2]}
                      />
                    </span>
                  </div>
                );
              }
            }

            if (!trimmed) {
              return (
                <div
                  key={index}
                  className="message-space"
                />
              );
            }

            return (
              <div
                key={index}
                className="message-line"
              >
                <InlineText text={line} />
              </div>
            );
          })}
        </div>
      );
    }

    textBuffer = [];
  }

  function flushCode() {
    if (!codeBuffer.length) return;

    blocks.push(
      <CodeBlock
        key={`code-${blocks.length}`}
        code={codeBuffer.join("\n")}
        language={codeLanguage}
      />
    );

    codeBuffer = [];
    codeLanguage = "";
  }

  for (const line of lines) {
    const fence = line.match(
      /^```([\w#+.-]*)\s*$/
    );

    if (fence) {
      if (!insideCode) {
        flushText();

        insideCode = true;
        codeLanguage =
          fence[1] || "";
      } else {
        flushCode();
        insideCode = false;
      }

      continue;
    }

    if (insideCode) {
      codeBuffer.push(line);
    } else {
      textBuffer.push(line);
    }
  }

  if (insideCode) {
    flushCode();
  } else {
    flushText();
  }

  return (
    <div className="rich-message">
      {blocks}
    </div>
  );
}

/* =========================
   COPY FULL MESSAGE
========================= */

function CopyMessageButton({
  content,
}: {
  content: string;
}) {
  const [copied, setCopied] =
    useState(false);

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(
        content
      );

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      className="message-copy"
      onClick={copyMessage}
      aria-label={
        copied
          ? "کپی شد"
          : "کپی پاسخ"
      }
    >
      {copied ? (
        <CheckIcon />
      ) : (
        <CopyIcon />
      )}
    </button>
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

        <span className="hero-star hero-star-one">
          ✦
        </span>

        <span className="hero-star hero-star-two">
          ✦
        </span>
      </div>

      <span className="logo-spark spark-a">
        ✦
      </span>

      <span className="logo-spark spark-b">
        ✧
      </span>

      <span className="logo-spark spark-c">
        ✦
      </span>
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
          <linearGradient
            id="robotHead"
            x1="0"
            y1="0"
            x2="1"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor="#a975ff"
            />
            <stop
              offset="45%"
              stopColor="#372a86"
            />
            <stop
              offset="100%"
              stopColor="#080a22"
            />
          </linearGradient>

          <linearGradient
            id="robotBody"
            x1="0"
            y1="0"
            x2="1"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor="#6950db"
            />
            <stop
              offset="50%"
              stopColor="#17164d"
            />
            <stop
              offset="100%"
              stopColor="#070918"
            />
          </linearGradient>

          <linearGradient
            id="robotBlue"
            x1="0"
            y1="0"
            x2="1"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor="#e3d4ff"
            />
            <stop
              offset="50%"
              stopColor="#8b5cf6"
            />
            <stop
              offset="100%"
              stopColor="#19d9ff"
            />
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

      <span className="robot-star rs-one">
        ✦
      </span>

      <span className="robot-star rs-two">
        ✧
      </span>

      <span className="robot-star rs-three">
        ✦
      </span>
    </div>
  );
}

/* =========================
   HAND
========================= */

function Hand() {
  return (
    <span
      className="hello-hand"
      aria-hidden="true"
    >
      👋
    </span>
  );
}

/* =========================
   PAGE
========================= */

export default function ChatPage() {
  const router = useRouter();

  const [messages, setMessages] =
    useState<Message[]>([]);

  const [input, setInput] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const textareaRef =
    useRef<HTMLTextAreaElement | null>(
      null
    );

  const scrollRef =
    useRef<HTMLDivElement | null>(null);

  const abortControllerRef =
    useRef<AbortController | null>(null);

  function goBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }

  function putSuggestion(text: string) {
    setInput(text);

    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  }

  function stopGeneration() {
    abortControllerRef.current?.abort();
  }

  async function sendMessage(custom?: string) {
    const message = (
      custom ?? input
    ).trim();

    if (!message || loading) return;

    const history: ChatHistoryMessage[] =
      messages
        .filter(
          (item) =>
            item.content.trim()
        )
        .slice(-30)
        .map(
          ({
            role,
            content,
          }) => ({
            role,
            content,
          })
        );

    setInput("");

    const userId =
      crypto.randomUUID();

    const assistantId =
      crypto.randomUUID();

    setMessages((old) => [
      ...old,

      {
        id: userId,
        role: "user",
        content: message,
      },

      {
        id: assistantId,
        role: "assistant",
        content: "",
      },
    ]);

    setLoading(true);

    const controller =
      new AbortController();

    abortControllerRef.current =
      controller;

    try {
      const response = await fetch(
        "/api/chat",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          signal:
            controller.signal,

          body: JSON.stringify({
            message,
            history,
          }),
        }
      );

      if (!response.ok) {
        let errorMessage =
          "سرویس هوش مصنوعی در دسترس نیست.";

        try {
          const data =
            await response.json();

          errorMessage =
            data?.error ||
            errorMessage;
        } catch {}

        throw new Error(
          errorMessage
        );
      }

      if (!response.body) {
        throw new Error(
          "پاسخی از سرویس دریافت نشد."
        );
      }

      const reader =
        response.body.getReader();

      const decoder =
        new TextDecoder("utf-8");

      let assistantText = "";

      while (true) {
        const { value, done } =
          await reader.read();

        if (done) break;

        const chunk =
          decoder.decode(value, {
            stream: true,
          });

        if (!chunk) continue;

        assistantText += chunk;

        setMessages((old) =>
          old.map((item) =>
            item.id === assistantId
              ? {
                  ...item,
                  content:
                    assistantText,
                }
              : item
          )
        );
      }

      const finalChunk =
        decoder.decode();

      if (finalChunk) {
        assistantText +=
          finalChunk;

        setMessages((old) =>
          old.map((item) =>
            item.id === assistantId
              ? {
                  ...item,
                  content:
                    assistantText,
                }
              : item
          )
        );
      }

      if (!assistantText.trim()) {
        throw new Error(
          "پاسخی دریافت نشد."
        );
      }
    } catch (error) {
      if (
        error instanceof Error &&
        error.name === "AbortError"
      ) {
        return;
      }

      const errorText =
        error instanceof Error
          ? error.message
          : "خطایی رخ داد.";

      setMessages((old) =>
        old.map((item) =>
          item.id === assistantId
            ? {
                ...item,
                content:
                  `⚠️ ${errorText}`,
              }
            : item
        )
      );
    } finally {
      if (
        abortControllerRef.current ===
        controller
      ) {
        abortControllerRef.current =
          null;
      }

      setLoading(false);
    }
  }

  function keyDown(
    event: KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      if (!loading) {
        sendMessage();
      }
    }
  }

  useEffect(() => {
    if (!scrollRef.current) return;

    scrollRef.current.scrollTo({
      top:
        scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  return (
    <main
      dir="rtl"
      className="mobixa"
    >
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
        <div
          ref={scrollRef}
          className="message-area"
        >
          {messages.length === 0 ? (
            <div className="home-content">
              <MobixaLogo />

              <MobixaRobot />

              <div className="greeting">
                <div className="hello">
                  <span>سلام</span>
                  <Hand />
                </div>

                <h1>
                  <span>بزن بریم</span>{" "}
                  <strong>
                    مهندس
                  </strong>
                </h1>

                <div className="under-line">
                  <i />
                </div>
              </div>

              <p className="intro">
                اینجا هر چیزی که توی
                ذهنت داری،
                <br />
                می‌تونه شروع یک چیز بزرگ
                باشه.
                <br />

                <span>
                  ایده بده، سؤال بپرس،
                  بساز.
                </span>
              </p>

              <div className="cards">
                <button
                  type="button"
                  className="card create"
                  onClick={() =>
                    putSuggestion(
                      "این متن رو برای من حرفه‌ای و جذاب‌تر کن:"
                    )
                  }
                >
                  <div className="card-icon">
                    <CreateIcon />
                  </div>

                  <b>CREATE</b>

                  <span>
                    متنت رو حرفه‌ای کن
                  </span>
                </button>

                <button
                  type="button"
                  className="card learn"
                  onClick={() =>
                    putSuggestion(
                      "این موضوع رو خیلی ساده و قابل فهم برام توضیح بده:"
                    )
                  }
                >
                  <div className="card-icon">
                    <LearnIcon />
                  </div>

                  <b>
                    LEARN MODE
                  </b>

                  <span>
                    هر چیزی رو ساده
                    یاد بگیر
                  </span>
                </button>

                <button
                  type="button"
                  className="card idea"
                  onClick={() =>
                    putSuggestion(
                      "برای این موضوع چند ایده خلاقانه و خفن بهم بده:"
                    )
                  }
                >
                  <div className="card-icon">
                    <IdeaIcon />
                  </div>

                  <b>IDEA LAB</b>

                  <span>
                    یه ایده خفن بساز
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="messages">
              {messages.map(
                (message, index) => {
                  const isLast =
                    index ===
                    messages.length - 1;

                  return (
                    <div
                      key={message.id}
                      className={
                        message.role ===
                        "user"
                          ? "message user-message"
                          : "message ai-message"
                      }
                    >
                      <div className="message-wrapper">
                        <div className="bubble">
                          {message.role ===
                          "assistant" ? (
                            <MessageContent
                              content={
                                message.content
                              }
                            />
                          ) : (
                            <div className="user-text">
                              {message.content}
                            </div>
                          )}

                          {message.role ===
                            "assistant" &&
                            loading &&
                            isLast && (
                              <span className="cursor">
                                ▋
                              </span>
                            )}
                        </div>

                        {message.role ===
                          "assistant" &&
                          message.content.trim() &&
                          !loading && (
                            <div className="message-actions">
                              <CopyMessageButton
                                content={
                                  message.content
                                }
                              />
                            </div>
                          )}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>

        <div className="composer-zone">
          <form
            className="composer"
            onSubmit={(event) => {
              event.preventDefault();

              if (!loading) {
                sendMessage();
              }
            }}
          >
            <textarea
              ref={textareaRef}
              value={input}
              disabled={loading}
              onChange={(event) =>
                setInput(
                  event.target.value
                )
              }
              onKeyDown={keyDown}
              rows={1}
              placeholder="پیامت رو برای موبیکسا بنویس..."
            />

            <button
              type="button"
              className="send"
              disabled={
                !input.trim() &&
                !loading
              }
              onClick={() => {
                if (loading) {
                  stopGeneration();
                } else {
                  sendMessage();
                }
              }}
              aria-label={
                loading
                  ? "توقف تولید پاسخ"
                  : "ارسال پیام"
              }
            >
              {loading ? (
                <StopIcon />
              ) : (
                <SendIcon />
              )}
            </button>
          </form>

          <div className="footer">
            <span>
              ✦ Mobixa AI
            </span>

            <span>
              ممکن است گاهی پاسخ نادرست
              باشد.
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
          border: 1px solid
            rgba(122, 77, 255, 0.35);
          border-radius: 50%;
          filter: blur(0.2px);
        }

        .wave-one {
          left: -480px;
          top: 550px;
          transform: rotate(-22deg);
          box-shadow:
            0 0 14px
              rgba(91, 58, 255, 0.3);
        }

        .wave-two {
          right: -500px;
          top: 690px;
          transform: rotate(25deg);
          border-color:
            rgba(0, 194, 255, 0.28);
        }

        .starfield span {
          position: absolute;
          color:
            rgba(164, 140, 255, 0.7);
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
          text-shadow:
            0 0 15px
              rgba(255, 255, 255, 0.18);
        }

        .wordmark b {
          margin-left: 6px;
          background:
            linear-gradient(
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
          border:
            1px solid
              rgba(155, 73, 255, 0.95);
          background:
            rgba(55, 16, 111, 0.25);
          color: white;
          box-shadow:
            0 0 15px
              rgba(144, 59, 255, 0.42),
            inset 0 0 18px
              rgba(94, 70, 255, 0.13);
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

        .message-area {
          min-height: 0;
          flex: 1;
          overflow-y: auto;
          scrollbar-width: none;
          padding: 0 18px;
        }

        .message-area::-webkit-scrollbar {
          display: none;
        }

        .home-content {
          min-height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding-bottom: 10px;
        }

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
              rgba(42, 14, 100, 0.48)
                42%,
              rgba(3, 5, 25, 0.92)
                76%
            );
          border:
            1px solid
              rgba(132, 89, 255, 0.8);
          box-shadow:
            0 0 25px
              rgba(134, 63, 255, 0.75),
            inset 0 0 30px
              rgba(0, 194, 255, 0.2);
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
          border-color:
            rgba(170, 79, 255, 0.8);
          box-shadow:
            0 0 12px
              rgba(161, 74, 255, 0.4);
        }

        .orbit-b {
          width: 205px;
          height: 72px;
          transform: rotate(46deg);
          border-color:
            rgba(0, 209, 255, 0.65);
          box-shadow:
            0 0 12px
              rgba(0, 209, 255, 0.35);
        }

        .orbit-c {
          width: 150px;
          height: 150px;
          border-color:
            rgba(118, 75, 255, 0.2);
        }

        .hero-m {
          position: relative;
          width: 65px;
          height: 66px;
          filter:
            drop-shadow(
              0 0 7px #ae63ff
            )
            drop-shadow(
              0 0 17px #00d9ff
            );
        }

        .hero-m span {
          position: absolute;
          top: 6px;
          display: block;
          width: 20px;
          height: 54px;
          border-radius: 5px;
          background:
            linear-gradient(
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
          text-shadow:
            0 0 10px #00cfff;
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
            drop-shadow(
              0 0 9px
                rgba(114, 81, 255, 0.5)
            )
            drop-shadow(
              0 0 18px
                rgba(0, 210, 255, 0.16)
            );
        }

        .robot-star {
          position: absolute;
          z-index: 3;
          color: #a77cff;
          text-shadow:
            0 0 12px #00d9ff;
        }

        .rs-one {
          top: 26px;
          right: 18px;
        }

        .rs-two {
          bottom: 17px;
          left: 25px;
        }

        .rs-three {
          top: 68px;
          left: 10px;
          font-size: 9px;
        }

        .greeting {
          text-align: center;
          margin-top: -5px;
        }

        .hello {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          font-size: 39px;
          line-height: 1;
          font-weight: 950;
          text-shadow:
            0 0 15px
              rgba(255, 255, 255, 0.3),
            0 0 30px
              rgba(150, 74, 255, 0.4);
        }

        .hello-hand {
          font-size: 34px;
          filter:
            drop-shadow(
              0 0 7px
                rgba(180, 85, 255, 0.8)
            )
            drop-shadow(
              0 0 13px
                rgba(0, 214, 255, 0.3)
            );
          animation:
            wave 2.3s ease-in-out
              infinite;
        }

        .greeting h1 {
          margin: 12px 0 0;
          font-size: 31px;
          line-height: 1.15;
          font-weight: 950;
        }

        .greeting h1 span {
          background:
            linear-gradient(
              90deg,
              #b867ff,
              #9354ff,
              #8d6dff
            );
          -webkit-background-clip: text;
          color: transparent;
        }

        .greeting h1 strong {
          background:
            linear-gradient(
              90deg,
              #9259ff,
              #19d8ff
            );
          -webkit-background-clip: text;
          color: transparent;
        }

        .under-line {
          width: 145px;
          height: 4px;
          margin: 14px auto 0;
          border-radius: 999px;
          background:
            linear-gradient(
              90deg,
              transparent,
              #b04cff,
              #23dfff,
              transparent
            );
          box-shadow:
            0 0 8px #913eff,
            0 0 16px
              rgba(0, 207, 255, 0.35);
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
          color:
            rgba(239, 239, 255, 0.86);
        }

        .intro span {
          color: #a5afe8;
        }

        .cards {
          width: 100%;
          max-width: 620px;
          margin-top: 19px;
          display: grid;
          grid-template-columns:
            repeat(3, 1fr);
          gap: 9px;
          direction: ltr;
        }

        .card {
          position: relative;
          min-width: 0;
          height: 112px;
          border-radius: 19px;
          padding: 10px 5px 15px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          background:
            rgba(20, 15, 60, 0.42);
          backdrop-filter: blur(15px);
          cursor: pointer;
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .card:hover {
          transform: translateY(-3px);
        }

        .card-icon {
          width: 28px;
          height: 28px;
          margin-bottom: 5px;
        }

        .card-icon svg {
          width: 100%;
          height: 100%;
        }

        .card b {
          direction: ltr;
          font-size: 10px;
          letter-spacing: 0.8px;
        }

        .card span {
          margin-top: 5px;
          font-size: 10px;
          white-space: nowrap;
        }

        .card::before,
        .card::after,
        .card small {
          content: none !important;
          display: none !important;
          visibility: hidden !important;
        }

        .create {
          border:
            1px solid
              rgba(196, 73, 255, 0.8);
          box-shadow:
            0 0 20px
              rgba(188, 64, 255, 0.18),
            inset 0 0 22px
              rgba(179, 60, 255, 0.08);
        }

        .create .card-icon,
        .create b {
          color: #cf70ff;
        }

        .learn {
          border:
            1px solid
              rgba(0, 206, 255, 0.82);
          box-shadow:
            0 0 20px
              rgba(0, 199, 255, 0.17),
            inset 0 0 22px
              rgba(0, 199, 255, 0.08);
        }

        .learn .card-icon,
        .learn b {
          color: #27dfff;
        }

        .idea {
          border:
            1px solid
              rgba(165, 74, 255, 0.8);
          box-shadow:
            0 0 20px
              rgba(147, 68, 255, 0.18),
            inset 0 0 22px
              rgba(147, 68, 255, 0.08);
        }

        .idea .card-icon,
        .idea b {
          color: #c06cff;
        }

        /* =========================
           MESSAGES
        ========================= */

        .messages {
          width: 100%;
          max-width: 750px;
          margin: 0 auto;
          padding: 28px 0;
          display: flex;
          flex-direction: column;
          gap: 15px;
          min-width: 0;
        }

        .message {
          display: flex;
          width: 100%;
          min-width: 0;
        }

        .user-message {
          justify-content: flex-start;
        }

        .ai-message {
          justify-content: flex-end;
        }

        .message-wrapper {
          width: auto;
          max-width: 86%;
          min-width: 0;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .ai-message .message-wrapper {
          align-items: flex-end;
          min-width: 0;
        }

        .bubble {
          width: auto;
          max-width: 100%;
          min-width: 0;
          padding: 14px 17px;
          border-radius: 19px;
          font-size: 15px;
          line-height: 2;
          font-weight: 500;
          overflow: hidden;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .user-message .bubble {
          background:
            rgba(91, 35, 155, 0.35);
          border:
            1px solid
              rgba(157, 78, 255, 0.55);
          font-weight: 500;
        }

        .ai-message .bubble {
          background:
            rgba(8, 39, 77, 0.5);
          border:
            1px solid
              rgba(32, 196, 255, 0.4);

          box-shadow:
            0 4px 25px
              rgba(0, 100, 255, 0.07);
        }

        .user-text {
          min-width: 0;
          max-width: 100%;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .rich-message {
          width: 100%;
          min-width: 0;
          max-width: 100%;
          direction: rtl;
          text-align: right;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .message-text {
          width: 100%;
          min-width: 0;
          max-width: 100%;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .message-line {
          min-height: 1.8em;
          min-width: 0;
          max-width: 100%;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .message-space {
          height: 8px;
        }

        .message-heading {
          max-width: 100%;
          min-width: 0;
          margin: 13px 0 8px;
          line-height: 1.45;
          font-weight: 850;
          letter-spacing: -0.2px;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .heading-1 {
          font-size: 21px;
        }

        .heading-2 {
          font-size: 19px;
        }

        .heading-3 {
          font-size: 17px;
        }

        .inline-bold {
          font-weight: 850;
          color: #ffffff;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .inline-code {
          direction: ltr;
          unicode-bidi: plaintext;
          display: inline-block;
          max-width: 100%;
          padding: 1px 6px;
          margin: 0 2px;
          border-radius: 6px;
          background:
            rgba(7, 16, 38, 0.9);
          border:
            1px solid
              rgba(90, 150, 255, 0.25);
          color: #bdefff;
          font-family:
            "SFMono-Regular",
            Consolas,
            monospace;
          font-size: 0.88em;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .message-list-item {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          margin: 4px 0;
          padding-right: 4px;
          min-width: 0;
          max-width: 100%;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .list-content {
          min-width: 0;
          max-width: 100%;
          flex: 1 1 auto;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .list-dot {
          flex: 0 0 auto;
          color: #a96cff;
          font-size: 17px;
          line-height: 1.7;
        }

        .list-number {
          flex: 0 0 auto;
          color: #9e75ff;
          font-weight: 800;
        }

        /* =========================
           CODE BLOCK
        ========================= */

        .code-block {
          direction: ltr;
          width: 100%;
          max-width: 100%;
          min-width: 0;
          margin: 15px 0;
          border-radius: 14px;
          overflow: hidden;
          background:
            rgba(3, 7, 18, 0.96);
          border:
            1px solid
              rgba(90, 130, 255, 0.3);
          box-shadow:
            0 8px 30px
              rgba(0, 0, 0, 0.22),
            inset 0 0 25px
              rgba(60, 80, 180, 0.05);
        }

        .code-header {
          min-height: 39px;
          max-width: 100%;
          min-width: 0;
          padding: 6px 8px 6px 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background:
            rgba(13, 19, 39, 0.95);
          border-bottom:
            1px solid
              rgba(90, 130, 255, 0.18);
        }

        .code-language {
          direction: ltr;
          min-width: 0;
          color:
            rgba(190, 201, 235, 0.72);
          font-family:
            "SFMono-Regular",
            Consolas,
            monospace;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .code-copy {
          flex: 0 0 auto;

          width: 27px;
          height: 27px;

          padding: 0;

          border: 1px solid
            rgba(130, 100, 255, 0.18);

          border-radius: 8px;

          display: flex;
          align-items: center;
          justify-content: center;

          background:
            rgba(100, 75, 220, 0.06);

          color:
            rgba(220, 228, 255, 0.62);

          cursor: pointer;

          box-shadow:
            inset 0 0 10px
              rgba(120, 80, 255, 0.03);

          transition:
            background 0.22s ease,
            color 0.22s ease,
            border-color 0.22s ease,
            box-shadow 0.22s ease,
            transform 0.15s ease;
        }

        .code-copy:hover {
          background:
            rgba(135, 85, 255, 0.18);

          color: white;

          border-color:
            rgba(150, 105, 255, 0.42);

          box-shadow:
            0 0 12px
              rgba(125, 75, 255, 0.18),
            inset 0 0 10px
              rgba(255, 255, 255, 0.025);
        }

        .code-copy:active {
          transform: scale(0.9);
        }

        .code-copy svg {
          width: 14px;
          height: 14px;
        }

        .code-block pre {
          direction: ltr;
          display: block;
          width: 100%;
          max-width: 100%;
          margin: 0;
          padding: 15px;
          overflow-x: auto;
          overflow-y: hidden;
          text-align: left;
          white-space: pre;
          scrollbar-width: thin;
        }

        .code-block code {
          color: #e9eeff;
          font-family:
            "SFMono-Regular",
            "Cascadia Code",
            Consolas,
            "Liberation Mono",
            monospace;
          font-size: 12.5px;
          line-height: 1.75;
          font-weight: 500;
        }

        /* =========================
           COPY MESSAGE
        ========================= */

        .message-actions {
          width: 100%;
          display: flex;
          justify-content: flex-start;
          direction: ltr;
          margin-top: 5px;
          padding-left: 3px;
        }

        .message-copy {
          position: relative;

          width: 30px;
          height: 30px;

          padding: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border: 1px solid
            rgba(135, 100, 255, 0.28);

          border-radius: 9px;

          background:
            linear-gradient(
              145deg,
              rgba(91, 58, 190, 0.16),
              rgba(12, 165, 220, 0.07)
            );

          color:
            rgba(210, 220, 255, 0.68);

          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);

          box-shadow:
            0 0 0
              rgba(133, 76, 255, 0),
            inset 0 0 12px
              rgba(120, 80, 255, 0.05);

          cursor: pointer;

          transition:
            transform 0.18s ease,
            color 0.22s ease,
            border-color 0.22s ease,
            background 0.22s ease,
            box-shadow 0.22s ease;
        }

        .message-copy::before {
          content: "";

          position: absolute;
          inset: -1px;

          border-radius: inherit;

          background:
            linear-gradient(
              135deg,
              rgba(175, 90, 255, 0.55),
              transparent 35%,
              rgba(0, 210, 255, 0.35)
            );

          opacity: 0;

          pointer-events: none;

          transition:
            opacity 0.25s ease;
        }

        .message-copy:hover {
          color:
            rgba(255, 255, 255, 0.95);

          border-color:
            rgba(158, 108, 255, 0.65);

          background:
            linear-gradient(
              145deg,
              rgba(119, 69, 230, 0.25),
              rgba(0, 184, 255, 0.10)
            );

          box-shadow:
            0 0 12px
              rgba(128, 73, 255, 0.22),
            0 0 24px
              rgba(0, 193, 255, 0.08),
            inset 0 0 12px
              rgba(150, 100, 255, 0.08);

          transform:
            translateY(-1px)
            scale(1.04);
        }

        .message-copy:hover::before {
          opacity: 1;
        }

        .message-copy:active {
          transform: scale(0.88);
        }

        .message-copy svg {
          position: relative;
          z-index: 2;

          width: 14px;
          height: 14px;

          transition:
            transform 0.2s ease,
            filter 0.2s ease;
        }

        .message-copy:hover svg {
          transform: scale(1.08);

          filter:
            drop-shadow(
              0 0 4px
              rgba(174, 112, 255, 0.8)
            )
            drop-shadow(
              0 0 7px
              rgba(0, 211, 255, 0.35)
            );
        }

        .cursor {
          display: inline-block;
          margin-right: 3px;
          color: #a76bff;
          animation:
            blink 0.7s infinite;
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
          background:
            linear-gradient(
              180deg,
              transparent,
              rgba(2, 3, 11, 0.25)
            );
        }

        .composer {
          width: 100%;
          max-width: 760px;
          min-height: 64px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 7px 8px;
          border-radius: 23px;
          border:
            1px solid
              rgba(67, 119, 255, 0.75);
          background:
            rgba(9, 18, 49, 0.78);
          box-shadow:
            0 0 25px
              rgba(76, 61, 255, 0.2),
            inset 0 0 25px
              rgba(0, 185, 255, 0.05);
          backdrop-filter: blur(20px);
        }

        .composer textarea {
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
          font-weight: 500;
        }

        .composer textarea::placeholder {
          color:
            rgba(173, 183, 230, 0.72);
        }

        /* =========================
           SEND BUTTON
        ========================= */

        .send {
          position: relative;
          width: 54px;
          height: 54px;
          flex: 0 0 54px;
          display: flex;
          align-items: center;
          justify-content: center;
          border:
            1px solid
              rgba(201, 127, 255, 0.95);
          border-radius: 50%;
          color: white;
          background:
            radial-gradient(
              circle at 31% 24%,
              rgba(255, 255, 255, 0.4),
              transparent 22%
            ),
            radial-gradient(
              circle at 34% 28%,
              #c477ff 0%,
              #883ff2 35%,
              #4c35cf 67%,
              #142d87 100%
            );
          box-shadow:
            0 0 8px
              rgba(190, 94, 255, 0.95),
            0 0 18px
              rgba(144, 63, 255, 0.75),
            0 0 34px
              rgba(0, 211, 255, 0.25),
            inset 0 1px 3px
              rgba(255, 255, 255, 0.48),
            inset 0 -8px 16px
              rgba(10, 7, 55, 0.48);
          cursor: pointer;
          isolation: isolate;
          transition:
            transform 0.22s
              cubic-bezier(.2,.8,.2,1),
            box-shadow 0.22s ease,
            filter 0.22s ease;
        }

        .send::before {
          content: "";
          position: absolute;
          inset: -5px;
          border-radius: 50%;
          background:
            conic-gradient(
              from 0deg,
              transparent 0deg,
              rgba(190, 91, 255, 0.95) 65deg,
              rgba(35, 225, 255, 0.95) 145deg,
              transparent 215deg,
              rgba(173, 76, 255, 0.9) 300deg,
              transparent 360deg
            );
          z-index: -1;
          filter: blur(1px);
          opacity: 0.8;
          animation:
            sendRing 4s linear infinite;
        }

        .send::after {
          content: "";
          position: absolute;
          inset: 2px;
          border-radius: 50%;
          border:
            1px solid
              rgba(255, 255, 255, 0.17);
          box-shadow:
            inset 0 0 10px
              rgba(255, 255, 255, 0.08),
            inset 0 0 18px
              rgba(0, 220, 255, 0.09);
          pointer-events: none;
        }

        .send:hover {
          transform:
            translateY(-2px)
            scale(1.045);
          filter: brightness(1.12);
          box-shadow:
            0 0 10px
              rgba(195, 103, 255, 1),
            0 0 26px
              rgba(157, 66, 255, 0.9),
            0 0 48px
              rgba(0, 215, 255, 0.4),
            inset 0 1px 3px
              rgba(255, 255, 255, 0.52),
            inset 0 -8px 16px
              rgba(13, 10, 62, 0.38);
        }

        .send:active {
          transform: scale(0.91);
          box-shadow:
            0 0 8px
              rgba(177, 83, 255, 0.8),
            0 0 18px
              rgba(0, 208, 255, 0.25),
            inset 0 4px 12px
              rgba(11, 8, 48, 0.58);
        }

        .send:focus-visible {
          outline:
            2px solid
              rgba(42, 222, 255, 0.9);
          outline-offset: 4px;
        }

        .send:disabled {
          opacity: 0.45;
          cursor: not-allowed;
          transform: none;
          filter: grayscale(0.15);
          box-shadow:
            0 0 8px
              rgba(126, 78, 190, 0.22),
            inset 0 1px 2px
              rgba(255, 255, 255, 0.15);
        }

        .send:disabled::before {
          animation: none;
          opacity: 0.25;
        }

        .send-icon {
          position: relative;
          z-index: 3;
          width: 25px;
          height: 25px;
          filter:
            drop-shadow(
              0 0 4px
                rgba(255, 255, 255, 0.7)
            )
            drop-shadow(
              0 0 9px
                rgba(28, 224, 255, 0.38)
            );
          transform: translateX(1px);
          transition:
            transform 0.22s ease,
            filter 0.22s ease;
        }

        .send:hover .send-icon {
          transform:
            translateX(3px)
            scale(1.07);
          filter:
            drop-shadow(
              0 0 5px
                rgba(255, 255, 255, 0.95)
            )
            drop-shadow(
              0 0 13px
                rgba(31, 225, 255, 0.58)
            );
        }

        .send:active .send-icon {
          transform:
            translateX(4px)
            scale(0.94);
        }

        .stop-icon {
          position: relative;
          z-index: 3;
          width: 15px;
          height: 15px;
          color: white;
          filter:
            drop-shadow(
              0 0 4px
                rgba(255, 255, 255, 0.75)
            )
            drop-shadow(
              0 0 8px
                rgba(28, 224, 255, 0.35)
            );
        }

        @keyframes sendRing {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        .footer {
          width: 100%;
          max-width: 760px;
          margin: 6px auto 0;
          padding: 0 7px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color:
            rgba(132, 143, 193, 0.72);
          font-size: 8px;
        }

        .footer span:first-child {
          color:
            rgba(166, 104, 255, 0.85);
        }

        @keyframes wave {
          0%,
          100% {
            transform: rotate(-8deg);
          }

          50% {
            transform:
              rotate(8deg)
              translateY(-2px);
          }
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

          .message-area {
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

          .hello {
            font-size: 35px;
          }

          .hello-hand {
            font-size: 31px;
          }

          .greeting h1 {
            font-size: 27px;
          }

          .intro {
            margin-top: 13px;
            font-size: 12px;
            line-height: 1.85;
          }

          .cards {
            gap: 6px;
            margin-top: 15px;
          }

          .card {
            height: 98px;
            border-radius: 16px;
            padding: 7px 3px 14px;
          }

          .card-icon {
            width: 24px;
            height: 24px;
          }

          .card b {
            font-size: 8px;
            letter-spacing: 0.5px;
          }

          .card span {
            font-size: 8px;
            margin-top: 4px;
          }

          .composer-zone {
            padding: 7px 12px 10px;
          }

          .composer {
            min-height: 59px;
            border-radius: 20px;
          }

          .send {
            width: 49px;
            height: 49px;
            flex-basis: 49px;
          }

          .send-icon {
            width: 23px;
            height: 23px;
          }

          .stop-icon {
            width: 14px;
            height: 14px;
          }

          .footer {
            font-size: 7px;
          }

          .messages {
            padding-top: 20px;
          }

          .message-wrapper {
            max-width: 92%;
            min-width: 0;
          }

          .bubble {
            max-width: 100%;
            min-width: 0;
            font-size: 14px;
            line-height: 1.95;
            padding: 13px 14px;
          }

          .message-actions {
            margin-top: 4px;
            padding-left: 2px;
          }

          .message-copy {
            width: 29px;
            height: 29px;
            border-radius: 8px;
          }

          .message-copy svg {
            width: 13px;
            height: 13px;
          }

          .code-block {
            max-width: 100%;
            margin: 12px 0;
            border-radius: 12px;
          }

          .code-block pre {
            max-width: 100%;
            padding: 12px;
          }

          .code-block code {
            font-size: 11.5px;
          }

          .heading-1 {
            font-size: 19px;
          }

          .heading-2 {
            font-size: 17px;
          }

          .heading-3 {
            font-size: 16px;
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

          .hello {
            font-size: 31px;
          }

          .greeting h1 {
            margin-top: 8px;
            font-size: 24px;
          }

          .intro {
            margin-top: 9px;
          }

          .cards {
            margin-top: 10px;
          }

          .card {
            height: 86px;
          }
        }
      `}</style>
    </main>
  );
}
