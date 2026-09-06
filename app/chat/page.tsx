"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Message = {
  role: "user" | "assistant";
  content: string;
};

/* ---------- Custom Mobixa Icons ---------- */

function MobixaMark() {
  return (
    <div className="relative flex h-24 w-24 items-center justify-center">
      <div className="absolute inset-0 rounded-[30px] border border-violet-400/30 bg-violet-500/[0.06] shadow-[0_0_50px_rgba(139,92,246,0.18)]" />

      <div className="absolute h-16 w-16 rounded-full border border-cyan-300/20 shadow-[0_0_35px_rgba(34,211,238,0.12)]" />

      <div className="absolute h-3 w-3 -translate-y-[38px] rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.9)]" />

      <svg
        viewBox="0 0 80 80"
        className="relative z-10 h-16 w-16"
        fill="none"
      >
        <defs>
          <linearGradient
            id="mobixaGradient"
            x1="10"
            y1="10"
            x2="70"
            y2="70"
          >
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="48%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>

        <path
          d="M15 58V23L25 16L40 31L55 16L65 23V58"
          stroke="url(#mobixaGradient)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M25 43L40 56L55 43"
          stroke="url(#mobixaGradient)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.9"
        />

        <circle
          cx="40"
          cy="40"
          r="4"
          fill="#ffffff"
          className="animate-pulse"
        />
      </svg>
    </div>
  );
}

function WaveSticker() {
  return (
    <div className="relative inline-flex h-12 w-12 items-center justify-center">
      <div className="absolute inset-0 rounded-2xl border border-cyan-300/20 bg-cyan-400/[0.05] shadow-[0_0_30px_rgba(34,211,238,0.12)]" />

      <div className="absolute inset-1 rounded-[14px] border border-violet-400/20" />

      <svg
        viewBox="0 0 64 64"
        className="relative h-9 w-9"
        fill="none"
      >
        <defs>
          <linearGradient
            id="waveGradient"
            x1="10"
            y1="10"
            x2="55"
            y2="55"
          >
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>

        <path
          d="M17 31V19C17 17 18.5 15.5 20.5 15.5C22.5 15.5 24 17 24 19V29"
          stroke="url(#waveGradient)"
          strokeWidth="4"
          strokeLinecap="round"
        />

        <path
          d="M24 29V14C24 12 25.5 10.5 27.5 10.5C29.5 10.5 31 12 31 14V29"
          stroke="url(#waveGradient)"
          strokeWidth="4"
          strokeLinecap="round"
        />

        <path
          d="M31 29V16C31 14 32.5 12.5 34.5 12.5C36.5 12.5 38 14 38 16V30"
          stroke="url(#waveGradient)"
          strokeWidth="4"
          strokeLinecap="round"
        />

        <path
          d="M38 30V21C38 19 39.5 17.5 41.5 17.5C43.5 17.5 45 19 45 21V37C45 47 39 53 30 53C22 53 16 48 13 40L10 32C9.2 30 10.2 28 12.2 27.4C14.2 26.8 16 28 17 31Z"
          stroke="url(#waveGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M47 13L49 17L53 19L49 21L47 25L45 21L41 19L45 17L47 13Z"
          fill="#c084fc"
        />
      </svg>
    </div>
  );
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 3L10.5 13.5" />
      <path d="M21 3L14.5 21L10.5 13.5L3 9.5L21 3Z" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 12H5" />
      <path d="M11 18L5 12L11 6" />
    </svg>
  );
}

function IdeaIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M8.5 14.5C7.2 13.3 6.5 11.7 6.5 10A5.5 5.5 0 0112 4.5 5.5 5.5 0 0117.5 10c0 1.7-.7 3.3-2 4.5-.8.8-1.5 1.5-1.5 2.5h-4c0-1-.7-1.7-1.5-2.5Z" />
      <path d="M12 1v1" />
      <path d="M4.5 3.5l.8.8" />
      <path d="M19.5 3.5l-.8.8" />
    </svg>
  );
}

function LearnIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 5.5A2.5 2.5 0 016.5 3H11v16H6.5A2.5 2.5 0 014 16.5v-11Z" />
      <path d="M20 5.5A2.5 2.5 0 0017.5 3H13v16h4.5a2.5 2.5 0 002.5-2.5v-11Z" />
      <path d="M7 7h2" />
      <path d="M15 7h2" />
      <path d="M7 10h2" />
      <path d="M15 10h2" />
    </svg>
  );
}

function CreateIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 20h4L19 9a2.8 2.8 0 00-4-4L4 16v4Z" />
      <path d="M13.5 6.5l4 4" />
      <path d="M14 20h6" />
    </svg>
  );
}

export default function ChatPage() {
  const router = useRouter();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const previousMessageCount = useRef(0);

  const suggestions = [
    {
      title: "IDEA LAB",
      text: "یه ایده خفن بساز",
      icon: <IdeaIcon />,
      accent: "violet",
      prompt: "یه ایده خلاقانه و خفن بهم بده",
    },
    {
      title: "LEARN MODE",
      text: "هر چیزی رو ساده یاد بگیر",
      icon: <LearnIcon />,
      accent: "cyan",
      prompt: "یه موضوع رو خیلی ساده برام توضیح بده",
    },
    {
      title: "CREATE",
      text: "متنت رو حرفه‌ای کن",
      icon: <CreateIcon />,
      accent: "fuchsia",
      prompt: "کمکم کن یه متن حرفه‌ای بنویسم",
    },
  ];

  useEffect(() => {
    try {
      localStorage.removeItem("mobixa-chat-history");
    } catch {
      // مشکلی نیست.
    }
  }, []);

  useEffect(() => {
    if (messages.length === 0) {
      previousMessageCount.current = 0;
      return;
    }

    if (messages.length !== previousMessageCount.current) {
      bottomRef.current?.scrollIntoView({
        behavior:
          previousMessageCount.current === 0 ? "auto" : "smooth",
        block: "end",
      });

      previousMessageCount.current = messages.length;
    }
  }, [messages.length]);

  async function sendMessage(text?: string) {
    const userMessage = (text ?? message).trim();

    if (!userMessage || loading) return;

    setMessage("");
    setLoading(true);

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userMessage,
      },
      {
        role: "assistant",
        content: "",
      },
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
        }),
      });

      if (!response.ok) {
        let errorMessage = "خطایی در ارتباط با سرور رخ داد.";

        try {
          const data = await response.json();

          if (data?.error) {
            errorMessage = data.error;
          }
        } catch {}

        throw new Error(errorMessage);
      }

      if (!response.body) {
        throw new Error("پاسخ Streaming دریافت نشد.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let buffer = "";
      let assistantText = "";

      const updateAssistant = (content: string) => {
        setMessages((prev) => {
          const updated = [...prev];

          if (
            updated.length > 0 &&
            updated[updated.length - 1].role === "assistant"
          ) {
            updated[updated.length - 1] = {
              role: "assistant",
              content,
            };
          }

          return updated;
        });
      };

      while (true) {
        const { value, done } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const events = buffer.split("\n\n");

        buffer = events.pop() ?? "";

        for (const event of events) {
          const lines = event.split("\n");

          for (const line of lines) {
            if (!line.startsWith("data:")) continue;

            const data = line.slice(5).trim();

            if (!data || data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);

              const text =
                parsed?.candidates?.[0]?.content?.parts?.find(
                  (part: { text?: string }) =>
                    typeof part.text === "string"
                )?.text ?? "";

              if (text) {
                assistantText += text;
                updateAssistant(assistantText);
              }
            } catch {
              // منتظر کامل شدن قطعه بعدی می‌مانیم.
            }
          }
        }
      }

      if (!assistantText) {
        updateAssistant("متأسفانه پاسخی دریافت نشد.");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "متأسفانه خطایی رخ داد.";

      setMessages((prev) => {
        const updated = [...prev];

        if (
          updated.length > 0 &&
          updated[updated.length - 1].role === "assistant"
        ) {
          updated[updated.length - 1] = {
            role: "assistant",
            content: errorMessage,
          };
        }

        return updated;
      });
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function handleBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }

  return (
    <main className="relative h-screen overflow-hidden bg-[#03030a] px-4 py-5 text-white sm:px-6">
      {/* Background atmosphere */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-10 h-96 w-96 rounded-full bg-violet-600/[0.08] blur-[120px]" />
        <div className="absolute -right-40 bottom-20 h-96 w-96 rounded-full bg-cyan-500/[0.07] blur-[120px]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(124,58,237,0.08),transparent_35%)]" />

        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.16) 0.6px, transparent 0.6px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      <header className="relative z-20 mx-auto flex max-w-5xl items-center justify-between">
        <button
          type="button"
          onClick={handleBack}
          className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-xs text-white/55 backdrop-blur-xl transition duration-300 hover:border-violet-400/40 hover:bg-violet-500/[0.08] hover:text-white hover:shadow-[0_0_30px_rgba(139,92,246,0.14)]"
        >
          <BackIcon />

          <span>بازگشت</span>
        </button>

        <div className="text-lg font-black tracking-[0.18em] sm:text-xl">
          MOBIXA
          <span className="ml-1 bg-gradient-to-r from-violet-400 to-cyan-300 bg-clip-text text-transparent">
            AI
          </span>
        </div>
      </header>

      <section className="relative z-10 mx-auto flex h-[calc(100vh-90px)] min-h-0 max-w-4xl flex-col">
        {/* Messages */}
        <div className="min-h-0 flex-1 overflow-y-auto py-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {messages.length === 0 ? (
            <div className="flex min-h-full flex-col items-center justify-center pb-6 text-center">
              {/* Custom Mobixa mark */}
              <div className="mb-4">
                <MobixaMark />
              </div>

              <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-violet-300/80">
                MOBIXA AI
              </div>

              {/* Greeting */}
              <div className="mt-5 flex flex-col items-center">
                <div className="flex items-center gap-3">
                  <WaveSticker />

                  <h1 className="bg-gradient-to-r from-white via-white to-violet-200 bg-clip-text text-4xl font-black tracking-tight text-transparent sm:text-6xl">
                    سلام
                  </h1>
                </div>

                <h2 className="mt-2 bg-gradient-to-r from-violet-400 via-fuchsia-300 to-cyan-300 bg-clip-text text-3xl font-black tracking-tight text-transparent sm:text-5xl">
                  بزن بریم مهندس
                </h2>

                <div className="mt-3 h-[2px] w-32 rounded-full bg-gradient-to-r from-transparent via-violet-400 to-transparent opacity-70" />
              </div>

              <p className="mt-7 max-w-xl text-sm leading-8 text-white/55 sm:text-base">
                اینجا هر چیزی که توی ذهنت داری،
                <br />
                می‌تونه شروع یک چیز بزرگ باشه.
              </p>

              <p className="mt-1 text-xs text-white/30 sm:text-sm">
                ایده بده، سؤال بپرس، بساز.
              </p>

              {/* Suggestions */}
              <div className="mt-8 grid w-full max-w-3xl gap-3 sm:grid-cols-3">
                {suggestions.map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => sendMessage(item.prompt)}
                    className={`group relative overflow-hidden rounded-[24px] border bg-white/[0.025] p-5 text-right backdrop-blur-2xl transition duration-300 hover:-translate-y-1 ${
                      item.accent === "violet"
                        ? "border-violet-400/15 hover:border-violet-400/45 hover:shadow-[0_20px_60px_rgba(139,92,246,0.12)]"
                        : item.accent === "cyan"
                          ? "border-cyan-400/15 hover:border-cyan-400/45 hover:shadow-[0_20px_60px_rgba(34,211,238,0.1)]"
                          : "border-fuchsia-400/15 hover:border-fuchsia-400/45 hover:shadow-[0_20px_60px_rgba(217,70,239,0.12)]"
                    }`}
                  >
                    <div
                      className={`absolute -right-10 -top-10 h-24 w-24 rounded-full blur-3xl ${
                        item.accent === "violet"
                          ? "bg-violet-500/15"
                          : item.accent === "cyan"
                            ? "bg-cyan-500/15"
                            : "bg-fuchsia-500/15"
                      }`}
                    />

                    <div className="relative">
                      <div
                        className={`mb-5 flex h-11 w-11 items-center justify-center rounded-2xl border ${
                          item.accent === "violet"
                            ? "border-violet-400/20 bg-violet-500/10 text-violet-300"
                            : item.accent === "cyan"
                              ? "border-cyan-400/20 bg-cyan-500/10 text-cyan-300"
                              : "border-fuchsia-400/20 bg-fuchsia-500/10 text-fuchsia-300"
                        }`}
                      >
                        {item.icon}
                      </div>

                      <div className="text-[10px] font-bold tracking-[0.2em] text-white/40">
                        {item.title}
                      </div>

                      <div className="mt-2 text-sm font-semibold text-white/80">
                        {item.text}
                      </div>

                      <div
                        className={`mt-5 flex h-8 w-8 items-center justify-center rounded-full border transition duration-300 group-hover:translate-x-1 ${
                          item.accent === "violet"
                            ? "border-violet-400/30 text-violet-300"
                            : item.accent === "cyan"
                              ? "border-cyan-400/30 text-cyan-300"
                              : "border-fuchsia-400/30 text-fuchsia-300"
                        }`}
                      >
                        <ArrowIcon />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.role === "user"
                      ? "justify-start"
                      : "justify-end"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-3xl px-5 py-4 text-sm leading-7 ${
                      msg.role === "user"
                        ? "border border-violet-400/10 bg-violet-500/15 text-white"
                        : "glass-card text-white/85"
                    }`}
                  >
                    {msg.content}

                    {loading &&
                      msg.role === "assistant" &&
                      index === messages.length - 1 && (
                        <span className="ml-1 inline-block animate-pulse text-violet-300">
                          ▋
                        </span>
                      )}
                  </div>
                </div>
              ))}

              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="shrink-0 pb-5 pt-2">
          <div className="group relative rounded-[28px] border border-white/10 bg-white/[0.045] p-2 shadow-[0_20px_80px_rgba(0,0,0,0.4)] backdrop-blur-2xl transition duration-300 focus-within:border-violet-400/25 focus-within:shadow-[0_20px_80px_rgba(124,58,237,0.12)]">
            <div className="flex items-end gap-2">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="پیامت رو برای موبیکسا بنویس..."
                rows={1}
                disabled={loading}
                className="min-h-[52px] flex-1 resize-none bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-white/25"
              />

              <button
                type="button"
                onClick={() => sendMessage()}
                disabled={!message.trim() || loading}
                aria-label="ارسال پیام"
                className="group/send relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 text-white shadow-[0_0_25px_rgba(139,92,246,0.22)] transition duration-300 hover:scale-105 hover:shadow-[0_0_35px_rgba(139,92,246,0.38)] disabled:cursor-not-allowed disabled:opacity-25 disabled:shadow-none"
              >
                <span className="absolute inset-0 bg-white/20 opacity-0 transition group-hover/send:opacity-100" />

                <span className="relative z-10 transition duration-300 group-hover/send:translate-x-0.5 group-hover/send:-translate-y-0.5">
                  <SendIcon />
                </span>
              </button>
            </div>

            <div className="px-4 pb-1 pt-1 text-[10px] text-white/20">
              Mobixa AI ممکن است گاهی پاسخ نادرست بدهد.
            </div>
          </div>

          <div className="mt-4 text-center text-[10px] tracking-wide text-white/20">
            Crafted by BENYAMIN
          </div>
        </div>
      </section>
    </main>
  );
}
