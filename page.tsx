"use client";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-30" />

      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <section className="relative z-10 text-center max-w-4xl">
        <p className="text-sm tracking-[0.4em] text-white/50 mb-5">
          NEXT GENERATION AI
        </p>

        <h1 className="text-6xl md:text-8xl font-bold tracking-tight">
          <span className="text-gradient">MOBIXA</span>{" "}
          <span className="text-white">AI</span>
        </h1>

        <p className="mt-6 text-white/60 text-lg md:text-xl">
          Your intelligent AI workspace.
        </p>

        <div className="mt-12 flex flex-col sm:flex-row gap-5 justify-center">
          <button className="glass-button primary">
            ✦ AI Chat
          </button>

          <button className="glass-button">
            ◈ AI Image
          </button>
        </div>
      </section>

      <footer className="absolute bottom-8 z-10 text-sm text-white/40">
        Designed &amp; Developed by Benyamin
      </footer>
    </main>
  );
}
