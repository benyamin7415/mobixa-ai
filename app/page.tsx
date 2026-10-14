"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

/* =========================================================
   FONTS (Google Fonts — اگر لود نشد، فونت‌های جایگزین استفاده می‌شوند)
========================================================= */

const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Sora:wght@400;600;800&family=Vazirmatn:wght@300;400;500;700;800;900&display=swap";

/* =========================================================
   HOOKS
========================================================= */

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const update = () => setReduced(query.matches);

    update();

    query.addEventListener("change", update);

    return () => {
      query.removeEventListener("change", update);
    };
  }, []);

  return reduced;
}

function useInView<T extends Element>(threshold = 0.25) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { threshold }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold]);

  return [ref, inView] as const;
}

/*
  تایپ و پاک‌کردن چرخشی عبارت‌ها.
*/
function useTypewriterLoop(
  phrases: string[],
  active: boolean
) {
  const [text, setText] = useState("");

  useEffect(() => {
    if (!active || phrases.length === 0) {
      return;
    }

    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;
    let timer = 0;

    const tick = () => {
      const phrase = phrases[phraseIndex];

      if (!deleting) {
        charIndex += 1;
        setText(phrase.slice(0, charIndex));

        if (charIndex >= phrase.length) {
          deleting = true;
          timer = window.setTimeout(tick, 1700);
          return;
        }

        timer = window.setTimeout(tick, 58);
        return;
      }

      charIndex -= 1;
      setText(phrase.slice(0, charIndex));

      if (charIndex <= 0) {
        deleting = false;
        phraseIndex =
          (phraseIndex + 1) % phrases.length;

        timer = window.setTimeout(tick, 380);
        return;
      }

      timer = window.setTimeout(tick, 26);
    };

    timer = window.setTimeout(tick, 600);

    return () => {
      window.clearTimeout(timer);
    };
  }, [active, phrases]);

  return text;
}

/* =========================================================
   ICONS
========================================================= */

function ArrowIcon() {
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

function SendUpIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 19V5M5.5 11.5 12 5l6.5 6.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v6a2.5 2.5 0 0 1-2.5 2.5H11l-4 3.5V15h-.5A2.5 2.5 0 0 1 4 12.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 9.2h6M9 11.8h3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect
        x="3.5"
        y="4.5"
        width="17"
        height="15"
        rx="4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle
        cx="9"
        cy="10"
        r="1.6"
        fill="currentColor"
      />
      <path
        d="m5.5 17 4.2-4 3 2.6 2.3-2.2 3.5 3.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect
        x="9"
        y="3.5"
        width="6"
        height="11"
        rx="3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v2.5M9 20.5h6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M8 5.8v12.4a1 1 0 0 0 1.5.9l10-6.2a1 1 0 0 0 0-1.8l-10-6.2A1 1 0 0 0 8 5.8Z"
        fill="currentColor"
      />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 2.5c.6 4.6 2.9 6.9 7.5 7.5-4.6.6-6.9 2.9-7.5 7.5-.6-4.6-2.9-6.9-7.5-7.5 4.6-.6 6.9-2.9 7.5-7.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

/* =========================================================
   SMALL PIECES
========================================================= */

/*
  کارت با نور دنبال‌کننده‌ی انگشت/ماوس و کمی چرخش سه‌بعدی.
*/
function GlowCard({
  href,
  className,
  children,
  label,
}: {
  href: string;
  className: string;
  children: ReactNode;
  label: string;
}) {
  const ref = useRef<HTMLAnchorElement | null>(null);

  function onMove(
    event: ReactPointerEvent<HTMLAnchorElement>
  ) {
    const element = ref.current;

    if (!element) {
      return;
    }

    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    element.style.setProperty("--mx", `${x}px`);
    element.style.setProperty("--my", `${y}px`);

    if (event.pointerType === "mouse") {
      const rx = (x / rect.width - 0.5) * 5;
      const ry = (y / rect.height - 0.5) * -5;

      element.style.setProperty("--rx", `${rx}deg`);
      element.style.setProperty("--ry", `${ry}deg`);
    }
  }

  function onLeave() {
    const element = ref.current;

    if (!element) {
      return;
    }

    element.style.setProperty("--rx", "0deg");
    element.style.setProperty("--ry", "0deg");
  }

  return (
    <Link
      ref={ref}
      href={href}
      className={`hm-card ${className}`}
      aria-label={label}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <span className="hm-card-spot" aria-hidden="true" />
      <span className="hm-card-ring" aria-hidden="true" />
      {children}
    </Link>
  );
}

/*
  دمو زنده‌ی گفتگو: سؤال کاربر، فکر کردن و تایپ جواب.
*/
const CHAT_SCENES = [
  {
    q: "یه کپشن بامزه برای عکس کوهنوردیم بنویس",
    a: "«قله فتح شد، ولی دلم هنوز اون بالاست ⛰️✨»",
  },
  {
    q: "مفهوم بلاکچین رو تو دو جمله ساده بگو",
    a: "بلاکچین یه دفتر حساب مشترکه که همه نسخه‌ی یکسانش رو دارن و هیچ‌کس تنها نمی‌تونه دستش ببره 🔗",
  },
  {
    q: "برای اسم برندم یه ایده‌ی خفن بده",
    a: "«نوا» — کوتاه، خوش‌آهنگ و به‌یادموندنی. بریم سراغ لوگوش؟ 🚀",
  },
];

function ChatDemo({ reduced }: { reduced: boolean }) {
  const [boxRef, inView] = useInView<HTMLDivElement>(0.3);
  const [scene, setScene] = useState(0);
  const [phase, setPhase] = useState<
    "ask" | "think" | "type" | "hold"
  >("ask");
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (reduced) {
      setPhase("hold");
      setTyped(CHAT_SCENES[0].a);
      return;
    }

    if (!inView) {
      return;
    }

    let cancelled = false;
    const timers: number[] = [];

    const later = (fn: () => void, ms: number) => {
      timers.push(
        window.setTimeout(() => {
          if (!cancelled) {
            fn();
          }
        }, ms)
      );
    };

    const answer = CHAT_SCENES[scene].a;

    setPhase("ask");
    setTyped("");

    later(() => setPhase("think"), 900);

    later(() => {
      setPhase("type");

      let index = 0;

      const step = () => {
        if (cancelled) {
          return;
        }

        index += 1;
        setTyped(answer.slice(0, index));

        if (index < answer.length) {
          timers.push(window.setTimeout(step, 32));
        } else {
          setPhase("hold");

          later(() => {
            setScene(
              (current) =>
                (current + 1) % CHAT_SCENES.length
            );
          }, 2600);
        }
      };

      step();
    }, 2100);

    return () => {
      cancelled = true;
      timers.forEach((timer) =>
        window.clearTimeout(timer)
      );
    };
  }, [inView, scene, reduced]);

  const current = CHAT_SCENES[scene];

  return (
    <div className="hm-chat-demo" ref={boxRef} aria-hidden="true">
      <div className="hm-bubble hm-bubble-user" key={`q-${scene}`}>
        {current.q}
      </div>

      <div className="hm-bubble hm-bubble-ai">
        {phase === "think" || phase === "ask" ? (
          <span className="hm-dots">
            <i />
            <i />
            <i />
          </span>
        ) : (
          <>
            {typed}
            {phase === "type" && (
              <span className="hm-caret" />
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   DATA
========================================================= */

const PLACEHOLDERS = [
  "یه ایده برای استارتاپم بده…",
  "این متن رو حرفه‌ای‌تر کن…",
  "یه تصویر از شهر آینده بساز…",
  "این متن رو به صدا تبدیل کن…",
  "مفهوم سختی رو ساده برام توضیح بده…",
];

type Chip = {
  text: string;
  href: string;
  tone: "violet" | "cyan" | "pink";
  icon: string;
};

const ROW_ONE: Chip[] = [
  { text: "یه کپشن بامزه برای عکس کوهنوردی بنویس", href: "/chat", tone: "violet", icon: "💬" },
  { text: "این کد رو برام دیباگ کن", href: "/chat", tone: "violet", icon: "🧩" },
  { text: "برنامه‌ی هفتگی مطالعه‌م رو بچین", href: "/chat", tone: "violet", icon: "🗓️" },
  { text: "یه ایمیل رسمی ولی گرم بنویس", href: "/chat", tone: "violet", icon: "✉️" },
  { text: "بلاکچین رو ساده توضیح بده", href: "/chat", tone: "violet", icon: "🔗" },
  { text: "برای اسم برندم ۱۰ تا ایده بده", href: "/chat", tone: "violet", icon: "💡" },
];

const ROW_TWO: Chip[] = [
  { text: "شهری آینده‌نگر در غروب طلایی", href: "/image", tone: "cyan", icon: "🌇" },
  { text: "پرتره‌ی سینمایی با نور نئون", href: "/image", tone: "cyan", icon: "🎞️" },
  { text: "گربه‌ی فضانورد روی ماه", href: "/image", tone: "cyan", icon: "🚀" },
  { text: "این متن رو با صدای گرم بخون", href: "/voice", tone: "pink", icon: "🎙️" },
  { text: "تبریک تولد با صدای دلنشین", href: "/voice", tone: "pink", icon: "🎂" },
  { text: "روایت یه داستان کوتاه شبانه", href: "/voice", tone: "pink", icon: "🌙" },
];

const STEPS = [
  {
    n: "۰۱",
    title: "بنویس",
    text: "هر چی تو ذهنته؛ سؤال، توصیف یا یه متن ساده.",
  },
  {
    n: "۰۲",
    title: "انتخاب کن",
    text: "گفتگو، تصویر یا صدا؟ ابزارِ دلخواهت یه کلیک فاصله داره.",
  },
  {
    n: "۰۳",
    title: "نتیجه رو بگیر",
    text: "چند لحظه بعد نتیجه آماده‌ست و می‌تونی همین‌جا ادامه بدی.",
  },
];

const WAVE_BARS = Array.from({ length: 26 }, (_, index) => {
  const height = 22 + ((index * 37) % 62);
  return { height, delay: (index % 9) * 0.11 };
});

/* =========================================================
   MARQUEE
========================================================= */

function MarqueeRow({
  chips,
  reverse,
}: {
  chips: Chip[];
  reverse?: boolean;
}) {
  const doubled = [...chips, ...chips];

  return (
    <div className={`hm-marquee${reverse ? " reverse" : ""}`}>
      <div className="hm-marquee-track">
        {doubled.map((chip, index) => (
          <Link
            key={`${chip.text}-${index}`}
            href={chip.href}
            className={`hm-chip tone-${chip.tone}`}
            tabIndex={index >= chips.length ? -1 : 0}
            aria-hidden={index >= chips.length}
          >
            <span className="hm-chip-icon">{chip.icon}</span>
            {chip.text}
          </Link>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function Home() {
  const rootRef = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();

  const [scrolled, setScrolled] = useState(false);
  const [showDock, setShowDock] = useState(false);
  const [placeholderActive, setPlaceholderActive] =
    useState(false);

  const placeholder = useTypewriterLoop(
    PLACEHOLDERS,
    placeholderActive && !reduced
  );


  /* اسکرول: هدر شیشه‌ای + دوک پایین */
  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;

      const y = window.scrollY;

      setScrolled(y > 14);
      setShowDock(y > 520);
    };

    const onScroll = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(update);
      }
    };

    update();

    window.addEventListener("scroll", onScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", onScroll);

      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, []);

  /* ظاهر شدن نرم بخش‌ها هنگام اسکرول */
  useEffect(() => {
    const root = rootRef.current;

    if (!root) {
      return;
    }

    root.classList.add("hm-js");

    const elements = Array.from(
      root.querySelectorAll<HTMLElement>(".hm-reveal")
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -6% 0px",
      }
    );

    elements.forEach((element) =>
      observer.observe(element)
    );

    return () => {
      observer.disconnect();
      root.classList.remove("hm-js");
    };
  }, []);

  /* شروع تایپ placeholder بعد از ظاهر شدن هیرو */
  useEffect(() => {
    const timer = window.setTimeout(
      () => setPlaceholderActive(true),
      900
    );

    return () => window.clearTimeout(timer);
  }, []);

  function magnet(
    event: ReactPointerEvent<HTMLAnchorElement>
  ) {
    if (event.pointerType !== "mouse") {
      return;
    }

    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();

    const x =
      (event.clientX - rect.left - rect.width / 2) * 0.18;
    const y =
      (event.clientY - rect.top - rect.height / 2) * 0.28;

    element.style.transform = `translate(${x}px, ${y}px)`;
  }

  function unmagnet(
    event: ReactPointerEvent<HTMLAnchorElement>
  ) {
    event.currentTarget.style.transform = "";
  }

  return (
    <main className="hm-root" ref={rootRef}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin=""
      />
      <link rel="stylesheet" href={FONTS_HREF} />

      {/* ============ BACKGROUND ============ */}
      <div className="hm-bg" aria-hidden="true">
        <div className="hm-aurora" />
        <div className="hm-blob hm-blob-a" />
        <div className="hm-blob hm-blob-b" />
        <div className="hm-blob hm-blob-c" />
        <div className="hm-blob hm-blob-d" />
        <div className="hm-grid" />

        <span className="hm-star s1"><SparkIcon /></span>
        <span className="hm-star s2"><SparkIcon /></span>
        <span className="hm-star s3"><SparkIcon /></span>
        <span className="hm-star s4"><SparkIcon /></span>
        <span className="hm-star s5"><SparkIcon /></span>

        <div className="hm-grain" />
      </div>

      {/* ============ HEADER ============ */}
      <header className={`hm-header${scrolled ? " solid" : ""}`}>
        <Link href="/" className="hm-logo" aria-label="Mobixa AI">
          <span className="hm-logo-word">MOBIXA</span>
          <b>AI</b>
        </Link>

        <nav className="hm-nav" aria-label="ابزارها">
          <Link href="/chat">گفتگو</Link>
          <Link href="/image">تصویر</Link>
          <Link href="/voice">
            صدا
            <i className="hm-new-dot" />
          </Link>
        </nav>

        <Link href="/chat" className="hm-header-cta">
          <span>شروع کن</span>
          <ArrowIcon />
        </Link>
      </header>

      {/* ============ HERO ============ */}
      <section className="hm-hero">
        <div className="hm-float f1" aria-hidden="true">
          <span className="hm-float-dot violet" />
          یه ایده خفن بده
        </div>

        <div className="hm-float f2" aria-hidden="true">
          <span className="hm-float-wave">
            <i /><i /><i /><i /><i />
          </span>
          ۰:۱۲
        </div>

        <div className="hm-float f3" aria-hidden="true">
          <span className="hm-float-img" />
          در حال ساخت…
        </div>

        <div className="hm-hero-chip hm-rise" style={{ "--d": "0s" } as CSSProperties}>
          <span className="hm-hero-chip-star"><SparkIcon /></span>
          به دنیای Mobixa AI خوش آمدی
        </div>

        <h1 className="hm-title">
          <span className="hm-title-line hm-rise" style={{ "--d": "0.1s" } as CSSProperties}>
            ایده‌ات را به
          </span>
          <span className="hm-title-line hm-title-grad hm-rise" style={{ "--d": "0.22s" } as CSSProperties}>
            واقعیت تبدیل کن
          </span>
        </h1>

        <p className="hm-sub hm-rise" style={{ "--d": "0.36s" } as CSSProperties}>
          با موبیکسا با هوش مصنوعی گفتگو کن، تصویر بساز یا متن
          خودت را به صدای طبیعی تبدیل کن.
        </p>

        <Link
          href="/chat"
          className="hm-prompt hm-rise"
          style={{ "--d": "0.5s" } as CSSProperties}
          aria-label="شروع گفتگو با موبیکسا"
          onPointerMove={magnet}
          onPointerLeave={unmagnet}
        >
          <span className="hm-prompt-glow" aria-hidden="true" />

          <span className="hm-prompt-inner">
            <span className="hm-prompt-text">
              {reduced ? PLACEHOLDERS[0] : placeholder}
              {!reduced && <span className="hm-caret thin" />}
            </span>

            <span className="hm-prompt-send">
              <SendUpIcon />
            </span>
          </span>
        </Link>

        <div className="hm-quick hm-rise" style={{ "--d": "0.64s" } as CSSProperties}>
          <Link href="/chat" className="hm-quick-link tone-violet">
            <ChatIcon />
            گفتگو
          </Link>

          <Link href="/image" className="hm-quick-link tone-cyan">
            <ImageIcon />
            تصویر
          </Link>

          <Link href="/voice" className="hm-quick-link tone-pink">
            <MicIcon />
            صدا
            <em>NEW</em>
          </Link>
        </div>

        <div className="hm-scroll-hint hm-rise" style={{ "--d": "0.9s" } as CSSProperties} aria-hidden="true">
          <span />
        </div>
      </section>

      {/* ============ TOOLS ============ */}
      <section className="hm-section hm-tools" id="tools">
        <div className="hm-section-head hm-reveal">
          <span className="hm-eyebrow">TOOLS</span>
          <h2>سه ابزار،
