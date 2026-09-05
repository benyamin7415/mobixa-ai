"use client";

import { useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const suggestions = [
    "💡 یه ایده خلاقانه بهم بده",
    "📚 یه موضوع رو ساده توضیح بده",
    "✍️ کمکم کن یه متن بنویسم",
  ];

  async function sendMessage(text?: string) {
    const userMessage = (text ?? message).trim();

    if (!userMessage || loading) return;

    setMessage("");
    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage },
    ]);

    setLoading(true);

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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "خطایی رخ داد.");
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "متأسفانه خطایی رخ داد.",
        },
      ]);
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

  return (
    <main className="min-h-screen px-4 py-5 sm:px-6">

      {/* Header */}
      <header className="mx-auto flex max-w-5xl items-center justify-between">
        <a
          href="/"
          className="text-sm text-white/45 transition hover:text-white"
        >
          ← بازگشت
        </a>

        <div className="text-xl font-black tracking-[0.16em]">
          MOBIXA
          <span className="text-violet-400"> AI</span>
        </div>
      </header>

      {/* Chat */}
      <section className="mx-auto flex min-h-[calc(100vh-90px)] max-w-4xl flex-col">

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-8">

          {messages.length === 0 ? (
            <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">

              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-[28px] border border-violet-400/20 bg-violet-500/10 text-4xl shadow-[0_0_50px_rgba(139,92,246,0.15)]">
                🤖
              </div>

              <div className="text-sm text-violet-300">
                MOBIXA AI
              </div>

              <h1 className="mt-3 text-3xl font-black sm:text-5xl">
                سلام بنیامین 👋
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-7 text-white/45 sm:text-base">
                من دستیار هوش مصنوعی موبیکسا هستم.
                <br />
                هر چیزی می‌خوای بپرس یا از پیشنهادهای زیر شروع کن.
              </p>

              <div className="mt-8 grid w-full max-w-2xl gap-3 sm:grid-cols-3">
                {suggestions.map((item) => (
                  <button
                    key={item}
                    onClick={() => sendMessage(item.slice(2))}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-sm text-white/65 backdrop-blur-xl transition hover:-translate-y-1 hover:border-violet-400/30 hover:bg-white/[0.07]"
                  >
                    {item}
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
                        ? "bg-violet-500/15 text-white border border-violet-400/10"
                        : "glass-card text-white/85"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-end">
                  <div className="glass-card rounded-3xl px-5 py-4 text-sm text-white/40">
                    موبیکسا در حال فکر کردنه...
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Input */}
        <div className="pb-5">

          <div className="rounded-[28px] border border-white/10 bg-white/[0.055] p-2 shadow-[0_20px_70px_rgba(0,0,0,0.35)] backdrop-blur-2xl">

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
                onClick={() => sendMessage()}
                disabled={!message.trim() || loading}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-xl text-black transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-30"
              >
                ↑
              </button>

            </div>

            <div className="px-4 pb-1 pt-1 text-[10px] text-white/20">
              Mobixa AI ممکن است گاهی پاسخ نادرست بدهد.
            </div>

          </div>

          <div className="mt-4 text-center text-[11px] text-white/20">
            Crafted by BENYAMIN
          </div>

        </div>

      </section>

    </main>
  );
}
