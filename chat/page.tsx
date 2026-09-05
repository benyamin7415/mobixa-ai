توی پیجه چت این کدو قرار بدم؟

"use client";

import { useState } from "react";

export default function ChatPage() {
  const [message, setMessage] = useState("");

  const suggestions = [
    "💡 یه ایده خلاقانه بهم بده",
    "📚 یه موضوع رو ساده توضیح بده",
    "✍️ کمکم کن یه متن بنویسم",
  ];

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

      {/* Chat area */}
      <section className="mx-auto flex min-h-[calc(100vh-90px)] max-w-4xl flex-col">

        {/* Welcome */}
        <div className="flex flex-1 flex-col items-center justify-center text-center">

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

          {/* Suggestions */}
          <div className="mt-8 grid w-full max-w-2xl gap-3 sm:grid-cols-3">
            {suggestions.map((item) => (
              <button
                key={item}
                onClick={() => setMessage(item.slice(2))}
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-sm text-white/65 backdrop-blur-xl transition hover:-translate-y-1 hover:border-violet-400/30 hover:bg-white/[0.07]"
              >
                {item}
              </button>
            ))}
          </div>

        </div>

        {/* Input */}
        <div className="pb-5">

          <div className="rounded-[28px] border border-white/10 bg-white/[0.055] p-2 shadow-[0_20px_70px_rgba(0,0,0,0.35)] backdrop-blur-2xl">

            <div className="flex items-end gap-2">

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="پیامت رو برای موبیکسا بنویس..."
                rows={1}
                className="min-h-[52px] flex-1 resize-none bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-white/25"
              />

              <button
                disabled={!message.trim()}
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
