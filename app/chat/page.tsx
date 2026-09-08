"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Message = {
  id: string;
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
   COPY ICON
========================= */

function CopyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="copy-icon"
    >
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
        d="M16 8V6.5A2.5 2.5 0 0 0 13.5 4H6.5A2.5 2.5 0 0 0 4 6.5v7A2.5 2.5 0 0 0 6.5 16H8"
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
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="copy-icon"
    >
      <path
        d="m5 12 4 4L19 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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

      <span className="logo-spark spark-a">✦</span>
      <span className="logo-spark spark-b">✧</span>
      <span className="logo-spark spark-c">✦</span>
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
   COPY BUTTON
========================= */

function CopyButton({
  text,
  code = false,
}: {
  text: string;
  code?: boolean;
}) {
  const [copied, setCopied] =
    useState(false);

  async function copyText() {
    try {
      await navigator.clipboard.writeText(text);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1600);
    } catch {
      try {
        const textarea =
          document.createElement("textarea");

        textarea.value = text;

        textarea.style.position = "fixed";
        textarea.style.opacity = "0";

        document.body.appendChild(textarea);

        textarea.select();

        document.execCommand("copy");

        textarea.remove();

        setCopied(true);

        window.setTimeout(() => {
          setCopied(false);
        }, 1600);
      } catch {}
    }
  }

  return (
    <button
      type="button"
      className={
        code
          ? "copy-button code-copy-button"
          : "copy-button message-copy-button"
      }
      onClick={copyText}
      aria-label={
        copied ? "کپی شد" : "کپی"
      }
    >
      {copied ? (
        <CheckIcon />
      ) : (
        <CopyIcon />
      )}

      <span>
        {copied ? "کپی شد" : "کپی"}
      </span>
    </button>
  );
}

/* =========================
   INLINE MARKDOWN
========================= */

function renderInlineText(
  text: string
) {
  const parts = text.split(
    /(\*\*[\s\S]*?\*\*|`[^`]+`)/g
  );

  return parts.map((part, index) => {
    if (
      part.startsWith("**") &&
      part.endsWith("**")
    ) {
      return (
        <strong
          key={index}
          className="rich-bold"
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
  });
}

/* =========================
   AI MESSAGE RENDERER
========================= */

function AssistantContent({
  content,
}: {
  content: string;
}) {
  const blocks = [];
  const lines = content.split("\n");

  let normalLines: string[] = [];
  let codeLines: string[] = [];
  let insideCode = false;
  let codeLanguage = "";

  function flushNormal() {
    if (normalLines.length === 0) return;

    const text =
      normalLines.join("\n");

    blocks.push({
      type: "text",
      content: text,
    });

    normalLines = [];
  }

  function flushCode() {
    blocks.push({
      type: "code",
      content: codeLines.join("\n"),
      language: codeLanguage,
    });

    codeLines = [];
    codeLanguage = "";
  }

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (
      trimmed.startsWith("```")
    ) {
      if (!insideCode) {
        flushNormal();

        insideCode = true;

        codeLanguage =
          trimmed
            .replace(/^```/, "")
            .trim();

        return;
      }

      insideCode = false;

      flushCode();

      return;
    }

    if (insideCode) {
      codeLines.push(line);
    } else {
      normalLines.push(line);
    }
  });

  if (insideCode) {
    flushCode();
  }

  flushNormal();

  return (
    <div className="rich-content">
      {blocks.map((block, index) => {
        if (block.type === "code") {
          return (
            <div
              className="code-block"
              key={index}
              dir="ltr"
            >
              <div className="code-header">
                <span className="code-language">
                  {block.language ||
                    "CODE"}
                </span>

                <CopyButton
                  text={block.content}
                  code
                />
              </div>

              <pre>
                <code>
                  {block.content}
                </code>
              </pre>
            </div>
          );
        }

        const text =
          block.content as string;

        const textLines =
          text.split("\n");

        return (
          <div
            key={index}
            className="text-block"
          >
            {textLines.map(
              (line, lineIndex) => {
                const headingMatch =
                  line.match(
                    /^\s*#{1,6}\s+(.*)$/
                  );

                if (headingMatch) {
                  return (
                    <div
                      key={lineIndex}
                      className="rich-heading"
                    >
                      {renderInlineText(
                        headingMatch[1]
                      )}
                    </div>
                  );
                }

                if (
                  /^\s*[-*]\s+/.test(
                    line
                  )
                ) {
                  return (
                    <div
                      key={lineIndex}
                      className="rich-list-item"
                    >
                      <span className="list-dot">
                        •
                      </span>

                      <span>
                        {renderInlineText(
                          line.replace(
                            /^\s*[-*]\s+/,
                            ""
                          )
                        )}
                      </span>
                    </div>
                  );
                }

                if (
                  /^\s*\d+\.\s+/.test(
                    line
                  )
                ) {
                  const match =
                    line.match(
                      /^\s*(\d+)\.\s+(.*)$/
                    );

                  return (
                    <div
                      key={lineIndex}
                      className="rich-list-item numbered"
                    >
                      <span className="list-number">
                        {match?.[1]}.
                      </span>

                      <span>
                        {renderInlineText(
                          match?.[2] || ""
                        )}
                      </span>
                    </div>
                  );
                }

                if (
                  line.trim() === ""
                ) {
                  return (
                    <div
                      key={lineIndex}
                      className="rich-space"
                    />
                  );
                }

                return (
                  <div
                    key={lineIndex}
                    className="rich-line"
                  >
                    {renderInlineText(
                      line
                    )}
                  </div>
                );
              }
            )}
          </div>
        );
      })}
    </div>
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
    useRef<HTMLDivElement | null>(
      null
    );

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

  async function sendMessage(
    custom?: string
  ) {
    const message =
      (custom ?? input).trim();

    if (!message || loading) return;

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
            message,
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
          "پاسخی از سرویس هوش مصنوعی دریافت نشد."
        );
      }

      const reader =
        response.body.getReader();

      const decoder =
        new TextDecoder("utf-8");

      let assistantText = "";

      while (true) {
        const {
          value,
          done,
        } = await reader.read();

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
          "سرویس هوش مصنوعی پاسخی ارسال نکرد."
        );
      }
    } catch (error) {
      const errorText =
        error instanceof Error
          ? error.message
          : "خطایی رخ داد.";

      setMessages((old) =>
        old.map((item) =>
          item.id === assistantId
            ? {
                ...item,
                content: `⚠️ ${errorText}`,
              }
            : item
        )
      );
    } finally {
      setLoading(false);
    }
  }

  function keyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      sendMessage();
    }
  }

  useEffect(() => {
    if (!scrollRef.current) return;

    scrollRef.current.scrollTo({
      top:
        scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length]);

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
                اینجا هر چیزی که توی ذهنت
                داری،
                <br />
                می‌تونه شروع یک چیز بزرگ
                باشه.
                <br />

                <span>
                  ایده بده، سؤال بپرس، بساز.
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

                  <b>LEARN MODE</b>

                  <span>
                    هر چیزی رو ساده یاد بگیر
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
                      <div className="bubble">
                        {message.role ===
                        "assistant" ? (
                          <>
                            <AssistantContent
                              content={
                                message.content
                              }
                            />

                            {message.content.trim() &&
                              !loading && (
                                <div className="message-actions">
                                  <CopyButton
                                    text={
                                      message.content
                                    }
                                  />
                                </div>
                              )}

                            {loading &&
                              isLast && (
                                <span className="cursor">
                                  ▋
                                </span>
                              )}
                          </>
                        ) : (
                          <div className="user-text">
                            {message.content}
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

              sendMessage();
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
              type="submit"
              className="send"
              disabled={
                !input.trim() ||
                loading
              }
            >
              <SendIcon />
            </button>
          </form>

          <div className="footer">
            <span>
              ✦ Mobixa AI
            </span>

            <span>
              ممکن است گاهی پاسخ نادرست باشد.
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
          border: 1px solid rgba(
            122,
            77,
            255,
            0.35
          );
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
          border-color: rgba(
            0,
            194,
            255,
            0.28
          );
        }

        .starfield span {
          position: absolute;
          color: rgba(
            164,
            140,
            255,
            0.7
          );
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
          background: linear-gradient(
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
          border: 1px solid
            rgba(155, 73, 255, 0.95);
          background: rgba(
            55,
            16,
            111,
            0.25
          );
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
              rgba(
                181,
                122,
                255,
                0.85
              ),
              rgba(
                42,
                14,
                100,
                0.48
              )
                42%,
              rgba(
                3,
                5,
                25,
                0.92
              )
                76%
            );
          border: 1px solid
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
          border-color: rgba(
            170,
            79,
            255,
            0.8
          );
          box-shadow:
            0 0 12px
            rgba(161, 74, 255, 0.4);
        }

        .orbit-b {
          width: 205px;
          height: 72px;
          transform: rotate(46deg);
          border-color: rgba(
            0,
            209,
            255,
            0.65
          );
          box-shadow:
            0 0 12px
            rgba(0, 209, 255, 0.35);
        }

        .orbit-c {
          width: 150px;
          height: 150px;
          border-color: rgba(
            118,
            75,
            255,
            0.2
          );
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
          background: linear-gradient(
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
          background: linear-gradient(
            90deg,
            #b867ff,
            #9354ff,
            #8d6dff
          );
          -webkit-background-clip: text;
          color: transparent;
        }

        .greeting h1 strong {
          background: linear-gradient(
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
          background: linear-gradient(
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
          color: rgba(
            239,
            239,
            255,
            0.86
          );
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
          background: rgba(
            20,
            15,
            60,
            0.42
          );
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
          border: 1px solid
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
          border: 1px solid
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
          border: 1px solid
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
        }

        .message {
          display: flex;
          width: 100%;
        }

        .user-message {
          justify-content: flex-start;
        }

        .ai-message {
          justify-content: flex-end;
        }

        .bubble {
          max-width: 86%;
          padding: 14px 17px;
          border-radius: 19px;
          font-size: 15px;
          line-height: 1.95;
          font-weight: 500;
          overflow-wrap: anywhere;
        }

        .user-message .bubble {
          background: rgba(
            91,
            35,
            155,
            0.35
          );

          border: 1px solid
            rgba(157, 78, 255, 0.55);

          color: rgba(
            255,
            255,
            255,
            0.96
          );

          font-weight: 600;
        }

        .ai-message .bubble {
          background: rgba(
            8,
            39,
            77,
            0.5
          );

          border: 1px solid
            rgba(32, 196, 255, 0.4);

          color: rgba(
            250,
            252,
            255,
            0.97
          );
        }

        .user-text {
          white-space: pre-wrap;
        }

        /* =========================
           RICH AI TEXT
        ========================= */

        .rich-content {
          width: 100%;
          font-family:
            Arial,
            Tahoma,
            sans-serif;
          font-weight: 500;
        }

        .text-block {
          width: 100%;
        }

        .rich-line {
          min-height: 1.4em;
          font-weight: 500;
        }

        .rich-bold {
          font-weight: 850;
          color: #ffffff;
          text-shadow:
            0 0 8px
            rgba(255, 255, 255, 0.08);
        }

        .rich-heading {
          margin: 10px 0 7px;
          font-size: 17px;
          line-height: 1.65;
          font-weight: 900;
          color: #ffffff;
          text-shadow:
            0 0 12px
            rgba(150, 95, 255, 0.2);
        }

        .rich-heading:first-child {
          margin-top: 0;
        }

        .rich-space {
          height: 8px;
        }

        .rich-list-item {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 2px 0;
          font-weight: 500;
        }

        .list-dot {
          flex: 0 0 auto;
          color: #b86cff;
          font-size: 17px;
          line-height: 1.5;
          text-shadow:
            0 0 8px
            rgba(180, 90, 255, 0.7);
        }

        .list-number {
          min-width: 24px;
          color: #a978ff;
          font-weight: 800;
        }

        .inline-code {
          direction: ltr;
          display: inline-block;
          margin: 0 3px;
          padding: 1px 6px;
          border-radius: 6px;
          background: rgba(
            0,
            0,
            0,
            0.35
          );
          border: 1px solid
            rgba(82, 197, 255, 0.22);
          color: #7eeaff;
          font-family:
            "SFMono-Regular",
            Consolas,
            "Liberation Mono",
            monospace;
          font-size: 0.9em;
          font-weight: 600;
        }

        /* =========================
           CODE BLOCK
        ========================= */

        .code-block {
          direction: ltr;
          width: 100%;
          margin: 14px 0;
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid
            rgba(100, 155, 255, 0.28);
          background:
            linear-gradient(
              145deg,
              rgba(5, 10, 27, 0.96),
              rgba(8, 14, 34, 0.94)
            );
          box-shadow:
            0 8px 28px
              rgba(0, 0, 0, 0.25),
            inset 0 0 20px
              rgba(70, 100, 255, 0.04);
        }

        .code-header {
          height: 42px;
          padding: 0 9px 0 13px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid
            rgba(120, 160, 255, 0.14);
          background: rgba(
            15,
            23,
            48,
            0.82
          );
        }

        .code-language {
          font-family:
            "SFMono-Regular",
            Consolas,
            monospace;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1px;
          color: rgba(
            172,
            187,
            224,
            0.78
          );
          text-transform: uppercase;
        }

        .code-block pre {
          margin: 0;
          padding: 15px;
          overflow-x: auto;
          direction: ltr;
          text-align: left;
          scrollbar-width: thin;
        }

        .code-block pre::-webkit-scrollbar {
          height: 5px;
        }

        .code-block pre::-webkit-scrollbar-thumb {
          border-radius: 999px;
          background: rgba(
            140,
            110,
            255,
            0.4
          );
        }

        .code-block code {
          font-family:
            "SFMono-Regular",
            "Cascadia Code",
            "Roboto Mono",
            Consolas,
            monospace;
          font-size: 12px;
          line-height: 1.75;
          color: #e8efff;
          white-space: pre;
        }

        /* =========================
           COPY BUTTONS
        ========================= */

        .copy-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          border: 0;
          cursor: pointer;
          color: rgba(
            224,
            233,
            255,
            0.78
          );
          background: transparent;
          transition:
            color 0.18s ease,
            background 0.18s ease,
            transform 0.18s ease;
        }

        .copy-button:hover {
          color: white;
        }

        .copy-button:active {
          transform: scale(0.95);
        }

        .copy-icon {
          width: 15px;
          height: 15px;
          flex: 0 0 15px;
        }

        .code-copy-button {
          min-height: 30px;
          padding: 0 9px;
          border-radius: 8px;
          background: rgba(
            105,
            89,
            210,
            0.13
          );
          border: 1px solid
            rgba(145, 130, 255, 0.18);
          font-size: 10px;
          font-weight: 700;
        }

        .code-copy-button:hover {
          background: rgba(
            125,
            104,
            255,
            0.22
          );
          border-color: rgba(
            160,
            145,
            255,
            0.32
          );
        }

        .message-actions {
          width: 100%;
          margin-top: 10px;
          padding-top: 7px;
          display: flex;
          justify-content: flex-start;
          border-top: 1px solid
            rgba(120, 190, 255, 0.09);
        }

        .message-copy-button {
          min-height: 27px;
          padding: 0 6px;
          border-radius: 7px;
          font-size: 9px;
          opacity: 0.68;
        }

        .message-copy-button:hover {
          opacity: 1;
          background: rgba(
            120,
            150,
            255,
            0.09
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
          background: linear-gradient(
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
          border: 1px solid
            rgba(67, 119, 255, 0.75);
          background: rgba(
            9,
            18,
            49,
            0.78
          );
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
        }

        .composer textarea::placeholder {
          color: rgba(
            173,
            183,
            230,
            0.72
          );
        }

        /* =========================
           FUTURISTIC SEND BUTTON
        ========================= */

        .send {
          position: relative;
          width: 54px;
          height: 54px;
          flex: 0 0 54px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid
            rgba(201, 127, 255, 0.95);
          border-radius: 50%;
          color: white;
          background:
            radial-gradient(
              circle at 31% 24%,
              rgba(
                255,
                255,
                255,
                0.4
              ),
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
              cubic-bezier(
                0.2,
                0.8,
                0.2,
                1
              ),
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
              rgba(
                190,
                91,
                255,
                0.95
              )
                65deg,
              rgba(
                35,
                225,
                255,
                0.95
              )
                145deg,
              transparent 215deg,
              rgba(
                173,
                76,
                255,
                0.9
              )
                300deg,
              transparent 360deg
            );
          z-index: -1;
          filter: blur(1px);
          opacity: 0.8;
          animation:
            sendRing 4s linear
            infinite;
        }

        .send::after {
          content: "";
          position: absolute;
          inset: 2px;
          border-radius: 50%;
          border: 1px solid
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
          outline: 2px solid
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
          color: rgba(
            132,
            143,
            193,
            0.72
          );
          font-size: 8px;
        }

        .footer span:first-child {
          color: rgba(
            166,
            104,
            255,
            0.85
          );
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

        /* =========================
           MOBILE
        ========================= */

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

          .messages {
            padding-top: 20px;
          }

          .bubble {
            max-width: 92%;
            padding: 12px 14px;
            font-size: 14px;
            line-height: 1.95;
          }

          .rich-heading {
            font-size: 16px;
          }

          .code-block {
            margin: 12px 0;
            border-radius: 12px;
          }

          .code-header {
            height: 39px;
          }

          .code-block pre {
            padding: 12px;
          }

          .code-block code {
            font-size: 11px;
            line-height: 1.7;
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

          .footer {
            font-size: 7px;
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
