"use client";

import { useState } from "react";

export default function Home() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <main className="min-h-screen px-5 py-6 sm:px-8">

      {/* Header */}
      <header className="mx-auto flex max-w-6xl items-center justify-between">
        <div>
          <div className="text-2xl font-black tracking-[0.18em]">
            MOBIXA
            <span className="text-violet-400"> AI</span>
          </div>
          <div className="mt-1 text-xs text-white/40">
            هوش مصنوعی، ساده‌تر از همیشه
          </div>
        </div>

        <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/60 backdrop-blur-xl">
          ✦ آینده اینجاست
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto flex max-w-5xl flex-col items-center pt-20 text-center sm:pt-28">

        <div className="fade-up mb-5 rounded-full border border-violet-400/20 bg-violet-400/10 px-4 py-2 text-sm text-violet-200">
          ✨ به دنیای Mobixa AI خوش آمدی
        </div>

        <h1 className="fade-up text-4xl font-black leading-tight sm:text-6xl">
          ایده‌ات را به
          <br />
          <span className="bg-gradient-to-r from-violet-300 via-white to-cyan-300 bg-clip-text text-transparent">
            واقعیت تبدیل کن
          </span>
        </h1>

        <p className="fade-up mt-6 max-w-2xl text-sm leading-7 text-white/55 sm:text-base">
          با موبیکسا با هوش مصنوعی گفتگو کن یا ایده‌هایت را به تصاویر
          خلاقانه تبدیل کن.
        </p>
      </section>

      {/* Main Cards */}
      <section className="mx-auto mt-14 grid max-w-5xl gap-5 md:grid-cols-2">

        {/* Chat */}
        <button
          onClick={() => setActive("chat")}
          className="glass-card group relative min-h-[260px] overflow-hidden rounded-[32px] p-7 text-right"
        >
          <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-violet-500/20 blur-3xl transition-all duration-500 group-hover:bg-violet-500/35" />

          <div className="relative flex h-full flex-col justify-between">

            <div>
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/15 text-3xl">
                🤖
              </div>

              <h2 className="text-2xl font-bold">
                چت با هوش مصنوعی
              </h2>

              <p className="mt-3 max-w-sm text-sm leading-6 text-white/45">
                سوال بپرس، ایده بگیر، یاد بگیر و با هوش مصنوعی موبیکسا
                گفتگو کن.
              </p>
            </div>

            <div className="mt-8 flex items-center justify-between">
              <span className="text-sm text-violet-300">
                شروع گفتگو
              </span>

              <span className="text-xl transition-transform duration-300 group-hover:-translate-x-2">
                ←
              </span>
            </div>

          </div>
        </button>

        {/* Image */}
        <button
          onClick={() => setActive("image")}
          className="glass-card group relative min-h-[260px] overflow-hidden rounded-[32px] p-7 text-right"
        >
          <div className="absolute -left-20 -bottom-20 h-48 w-48 rounded-full bg-cyan-500/20 blur-3xl transition-all duration-500 group-hover:bg-cyan-500/35" />

          <div className="relative flex h-full flex-col justify-between">

            <div>
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10 text-3xl">
                ✨
              </div>

              <h2 className="text-2xl font-bold">
                ساخت تصویر با هوش مصنوعی
              </h2>

              <p className="mt-3 max-w-sm text-sm leading-6 text-white/45">
                چیزی که در ذهنت داری توصیف کن و آن را به یک تصویر خلاقانه
                تبدیل کن.
              </p>
            </div>

            <div className="mt-8 flex items-center justify-between">
              <span className="text-sm text-cyan-300">
                ساخت تصویر
              </span>

              <span className="text-xl transition-transform duration-300 group-hover:-translate-x-2">
                ←
              </span>
            </div>

          </div>
        </button>

      </section>

      {/* Quick actions */}
      <section className="mx-auto mt-8 max-w-5xl">
        <div className="glass-card rounded-3xl p-5">
          <div className="mb-4 text-sm font-semibold text-white/70">
            🚀 با موبیکسا چه کارهایی می‌تونی بکنی؟
          </div>

          <div className="grid gap-3 sm:grid-cols-3">

            <div className="rounded-2xl bg-white/[0.035] p-4">
              <div className="text-xl">💡</div>
              <div className="mt-2 text-sm font-semibold">
                ایده‌پردازی
              </div>
              <div className="mt-1 text-xs text-white/35">
                برای پروژه‌ها و کارهات ایده بگیر.
              </div>
            </div>

            <div className="rounded-2xl bg-white/[0.035] p-4">
              <div className="text-xl">📚</div>
              <div className="mt-2 text-sm font-semibold">
                یادگیری
              </div>
              <div className="mt-1 text-xs text-white/35">
                موضوعات مختلف را ساده یاد بگیر.
              </div>
            </div>

            <div className="rounded-2xl bg-white/[0.035] p-4">
              <div className="text-xl">🎨</div>
              <div className="mt-2 text-sm font-semibold">
                خلاقیت
              </div>
              <div className="mt-1 text-xs text-white/35">
                ایده‌هایت را به تصویر تبدیل کن.
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto mt-20 max-w-5xl border-t border-white/10 py-8 text-center">

        <div className="text-sm text-white/35">
          Crafted by
        </div>

        <div className="mt-1 text-xl font-bold tracking-widest">
          BENYAMIN
        </div>

        <div className="mt-3 text-xs text-white/25">
          Built with curiosity. Designed for the future.
        </div>

      </footer>

      {/* Temporary interaction message */}
      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-5 backdrop-blur-md"
          onClick={() => setActive(null)}
        >
          <div
            className="glass-card w-full max-w-md rounded-[32px] p-8 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-4xl">
              {active === "chat" ? "🤖" : "✨"}
            </div>

            <h2 className="mt-5 text-2xl font-bold">
              {active === "chat"
                ? "چت موبیکسا"
                : "ساخت تصویر"}
            </h2>

            <p className="mt-3 text-sm leading-7 text-white/45">
              این بخش در مرحله بعد به رابط اصلی موبیکسا متصل می‌شود.
            </p>

            <button
              onClick={() => setActive(null)}
              className="mt-7 rounded-2xl bg-white px-6 py-3 text-sm font-bold text-black transition hover:scale-105"
            >
              بستن
            </button>
          </div>
        </div>
      )}

    </main>
  );
}
