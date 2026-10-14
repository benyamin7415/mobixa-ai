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
   SIGNATURE (امضای بنیامین — پاک‌سازی و نرم‌سازی‌شده از روی امضای اصلی)
========================================================= */

const SIGNATURE_VIEWBOX = "0 0 1359 559";

const SIGNATURE_PATH =
  "M31 501C32 504 32 506 33 508C34 510 36 513 38 515C40 518 41 519 44 521C46 523 50 525 53 526C55 528 57 528 60 528C63 528 66 529 71 528C76 527 83 526 91 524C98 522 107 520 115 516C122 513 128 510 136 505C144 500 158 490 163 486C169 481 168 482 170 479C173 475 176 468 180 465C184 462 189 462 195 461C200 460 207 461 212 460C217 459 220 458 225 456C229 455 232 454 237 451C242 448 249 441 254 439C258 436 261 435 263 434C265 433 264 433 263 432C263 432 265 431 261 432C256 434 243 440 237 443C231 445 231 445 226 445C221 446 211 446 208 446C205 446 206 446 205 445C205 445 203 445 203 443C203 442 203 440 205 435C208 430 214 420 217 412C221 404 225 394 227 386C230 379 229 377 233 369C236 361 244 342 247 336C250 330 249 334 250 334C250 334 251 333 251 335C252 338 252 345 253 349C254 352 256 355 257 357C259 359 259 359 261 360C263 361 264 362 269 362C273 362 282 362 289 360C296 358 302 352 310 350C318 348 330 350 336 350C342 350 341 350 345 349C349 348 356 346 359 344C363 343 364 342 367 340C370 338 375 332 378 329C380 326 381 325 383 322C385 318 387 316 388 310C390 304 392 293 393 287C394 280 394 278 395 270C397 263 400 251 402 243C403 235 403 228 403 224C404 220 405 220 405 219C406 218 407 217 407 217C408 217 408 217 409 218C409 219 409 220 409 223C408 225 408 225 407 232C406 239 406 256 404 266C403 276 401 282 400 291C399 300 397 316 397 323C397 330 397 330 398 333C399 336 399 338 401 340C402 341 404 343 406 344C408 345 411 345 414 346C416 346 419 346 422 345C425 344 428 343 432 342C435 341 440 341 444 340C447 339 449 338 452 335C456 333 463 327 466 325C470 323 473 322 475 322C476 322 476 320 476 323C476 326 475 337 475 340C475 343 476 341 476 341C476 341 477 343 478 340C479 337 480 329 482 326C483 323 483 322 485 322C486 321 488 321 489 322C490 322 490 321 492 323C494 325 500 330 502 332C504 334 504 333 506 334C508 335 512 335 514 335C516 335 518 334 520 333C523 332 521 336 528 329C536 321 559 296 566 289C573 282 567 289 569 289C570 290 573 292 576 293C578 294 580 295 583 295C586 295 589 295 593 295C596 295 601 293 602 293C604 293 604 293 603 296C603 298 601 308 601 310C600 313 602 311 602 311C603 311 603 312 604 310C605 308 606 303 607 300C609 298 608 295 611 294C614 293 621 295 625 295C630 294 634 294 637 293C640 292 641 291 644 288C647 286 653 279 656 277C658 275 657 276 660 276C663 276 668 278 676 277C684 277 695 273 707 272C719 270 722 269 747 268C772 267 833 267 859 267C885 268 887 269 902 270C916 270 932 269 946 269C961 269 980 270 990 270C1001 271 988 272 1011 272C1034 273 1092 273 1126 273C1159 274 1196 276 1213 276C1230 277 1218 275 1228 275C1238 275 1260 275 1272 274C1285 273 1296 269 1304 267C1312 265 1318 265 1322 264C1325 264 1325 263 1326 263C1326 263 1327 262 1326 262C1325 262 1324 263 1318 263C1312 263 1301 263 1289 263C1278 263 1264 261 1247 261C1230 261 1207 262 1186 262C1166 261 1155 259 1126 259C1096 258 1033 258 1011 258C988 257 1007 256 990 256C973 255 925 255 906 255C887 254 902 253 876 252C849 252 774 253 747 253C720 254 723 254 712 256C701 257 687 260 681 261C674 262 673 262 672 262C670 262 671 262 671 259C671 255 672 246 672 242C672 238 672 238 671 237C671 236 670 233 670 235C669 238 668 248 667 252C666 256 665 256 664 258C662 260 662 260 660 261C658 263 654 265 652 265C651 266 652 266 651 265C650 264 648 262 647 260C646 257 646 250 646 248C645 246 645 246 644 246C643 246 643 246 642 248C642 250 642 251 642 255C642 259 645 266 643 269C641 273 632 274 628 276C625 278 623 281 620 283C617 284 611 289 610 286C609 282 611 267 613 260C614 254 618 248 619 245C620 242 619 243 618 243C618 243 619 240 617 243C615 247 609 256 606 263C603 269 600 277 599 280C598 284 600 282 598 282C596 282 591 281 588 280C585 280 583 278 582 277C581 276 581 278 582 275C582 273 584 275 586 263C589 251 595 223 598 202C600 182 602 151 603 139C603 127 602 133 602 131C602 129 600 129 600 125C600 122 602 113 602 108C603 103 603 102 602 94C602 86 598 70 598 61C597 52 598 43 598 39C597 35 597 37 596 37C595 37 595 37 594 39C594 41 596 38 594 49C591 60 583 90 580 102C577 114 580 117 578 121C577 125 574 126 573 128C571 131 571 126 569 137C567 149 561 185 559 198C557 211 556 208 555 216C554 223 553 234 552 242C552 250 551 258 552 264C552 270 558 272 555 278C553 284 542 293 536 300C529 306 520 315 517 318C513 322 514 320 513 320C512 321 513 321 511 320C509 319 504 314 501 312C498 311 497 311 495 310C494 310 492 310 490 310C488 310 485 312 482 312C478 313 474 311 469 313C464 314 456 318 451 321C447 323 446 327 443 329C440 331 436 332 435 332C434 332 434 333 434 331C434 328 435 319 435 316C435 313 434 314 434 313C434 313 433 312 433 313C432 313 432 314 431 316C431 317 431 320 431 323C430 326 429 332 427 334C424 336 418 334 415 334C413 334 412 334 411 331C411 328 410 326 411 316C413 305 417 285 419 270C421 254 422 232 423 223C423 213 423 215 423 212C422 209 420 211 420 204C420 197 423 185 422 170C421 156 416 127 414 116C413 105 415 106 415 104C414 102 414 102 413 102C412 102 412 99 411 104C411 109 411 120 409 133C408 146 404 170 402 181C401 192 402 195 401 200C400 204 396 206 394 209C392 212 391 212 390 217C389 222 388 231 387 240C385 249 382 260 380 269C378 278 378 287 377 293C376 299 377 301 373 306C369 312 358 323 354 327C350 331 351 330 349 330C347 331 344 332 340 332C336 332 331 330 325 330C319 330 308 330 302 331C297 332 296 333 292 335C289 337 284 342 281 344C278 346 276 347 274 347C272 348 270 348 269 347C268 347 268 349 267 344C266 339 264 328 264 318C264 309 266 302 268 289C271 275 278 248 280 236C282 223 282 226 283 215C284 204 287 182 288 171C288 159 287 154 287 147C288 140 289 134 289 132C289 129 289 126 287 131C285 136 282 156 280 164C278 172 276 172 274 180C272 187 268 200 267 210C265 220 267 221 264 239C260 257 251 301 247 316C242 330 241 320 236 327C232 335 224 352 221 361C218 369 218 373 216 379C213 386 211 393 207 401C203 409 195 421 192 429C189 436 189 441 187 444C186 447 186 446 184 446C182 447 177 448 174 448C172 448 173 447 168 446C163 445 152 443 144 441C137 438 130 436 124 433C118 430 112 426 108 423C104 420 101 418 99 416C98 415 92 421 100 414C107 408 132 388 143 378C154 368 161 359 166 354C170 349 167 353 171 347C175 341 184 326 187 319C190 311 191 308 192 302C193 296 193 289 193 285C193 280 192 280 191 276C190 272 189 266 187 261C185 256 183 253 180 248C176 243 170 234 166 230C162 225 161 224 158 222C154 220 150 219 147 218C143 218 141 218 138 219C135 220 130 222 127 224C123 226 121 227 117 231C113 234 107 240 102 246C97 252 92 258 86 267C80 275 72 291 68 298C64 306 63 308 61 312C60 317 58 320 57 324C56 328 56 330 55 336C55 341 55 351 55 357C56 363 56 363 58 370C60 377 63 390 66 397C69 404 74 411 76 414C78 417 80 411 76 415C72 419 60 431 54 438C48 446 44 453 40 458C37 463 37 466 35 469C34 472 33 475 32 479C32 482 31 486 31 490C30 494 31 498 31 501ZM163 462C163 463 162 465 160 468C158 471 155 474 150 479C144 483 134 490 128 494C122 498 121 499 114 501C107 504 94 508 86 510C79 512 76 513 71 513C66 514 59 513 56 512C53 512 54 511 52 510C51 509 48 506 47 504C46 501 46 498 45 495C45 492 45 488 46 485C47 481 47 479 49 475C50 472 51 469 53 465C56 461 58 457 62 451C67 446 78 435 82 431C86 427 80 424 87 427C94 430 116 444 124 449C133 453 132 452 138 454C144 456 156 458 160 460C164 461 163 460 163 462ZM147 234C149 235 149 234 153 239C156 243 165 254 169 260C173 266 175 271 177 275C178 280 178 282 179 285C179 288 179 290 179 294C178 298 177 304 176 308C174 312 173 315 171 320C168 324 166 329 162 335C158 341 153 347 147 354C140 360 131 370 125 375C119 380 118 382 111 387C105 391 93 402 88 403C83 405 82 398 81 396C80 394 81 398 79 392C77 386 71 367 70 358C68 350 68 345 69 339C70 333 70 330 73 323C76 316 82 303 85 295C89 287 93 281 96 277C98 273 98 273 102 269C106 264 113 256 117 251C122 246 126 242 130 240C133 237 136 236 139 235C142 234 145 233 147 234ZM587 138C587 139 588 136 588 145C587 153 586 176 585 187C584 199 582 203 580 213C578 222 577 237 576 245C574 253 572 257 571 260C570 263 569 264 569 264C568 264 567 264 567 262C567 261 566 263 566 257C566 251 567 236 568 226C569 216 573 203 574 195C576 187 575 184 576 177C577 171 580 163 581 157C583 151 583 144 584 140C585 137 586 137 587 138Z";

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

  const [sigRef, sigInView] = useInView<HTMLDivElement>(0.45);
  const [sigDrawn, setSigDrawn] = useState(false);

  useEffect(() => {
    if (sigInView) {
      setSigDrawn(true);
    }
  }, [sigInView]);

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
          <h2>سه ابزار، یک جا</h2>
          <p>هر کدوم رو بزنی، همون لحظه وارد می‌شی.</p>
        </div>

        <div className="hm-bento">
          {/* CHAT */}
          <div className="hm-reveal hm-bento-chat" style={{ "--rd": "0s" } as CSSProperties}>
            <GlowCard href="/chat" className="tone-violet big" label="چت با هوش مصنوعی">
              <div className="hm-card-top">
                <span className="hm-tile"><ChatIcon /></span>
              </div>

              <ChatDemo reduced={reduced} />

              <div className="hm-card-body">
                <h3>چت با هوش مصنوعی</h3>
                <p>
                  سوال بپرس، ایده بگیر، یاد بگیر و با هوش مصنوعی
                  موبیکسا گفتگو کن.
                </p>
              </div>

              <div className="hm-card-foot">
                <span className="hm-card-cta">شروع گفتگو</span>
                <span className="hm-arrow"><ArrowIcon /></span>
              </div>
            </GlowCard>
          </div>

          {/* IMAGE */}
          <div className="hm-reveal hm-bento-image" style={{ "--rd": "0.1s" } as CSSProperties}>
            <GlowCard href="/image" className="tone-cyan" label="ساخت تصویر با هوش مصنوعی">
              <div className="hm-card-top">
                <span className="hm-tile"><ImageIcon /></span>
              </div>

              <div className="hm-art" aria-hidden="true">
                <div className="hm-art-canvas">
                  <span className="hm-art-orb o1" />
                  <span className="hm-art-orb o2" />
                  <span className="hm-art-orb o3" />
                  <span className="hm-art-scan" />
                </div>

                <div className="hm-art-bar">
                  <span className="hm-art-label">در حال ساخت…</span>
                  <span className="hm-art-progress"><i /></span>
                </div>
              </div>

              <div className="hm-card-body">
                <h3>ساخت تصویر با هوش مصنوعی</h3>
                <p>
                  چیزی که در ذهنت داری توصیف کن و آن را به یک تصویر
                  خلاقانه تبدیل کن.
                </p>
              </div>

              <div className="hm-card-foot">
                <span className="hm-card-cta">ساخت تصویر</span>
                <span className="hm-arrow"><ArrowIcon /></span>
              </div>
            </GlowCard>
          </div>

          {/* VOICE */}
          <div className="hm-reveal hm-bento-voice" style={{ "--rd": "0.2s" } as CSSProperties}>
            <GlowCard href="/voice" className="tone-pink" label="تبدیل متن به صدا با هوش مصنوعی">
              <div className="hm-card-top">
                <span className="hm-tile"><MicIcon /></span>
                <span className="hm-new">NEW</span>
              </div>

              <div className="hm-player" aria-hidden="true">
                <span className="hm-play"><PlayIcon /></span>

                <span className="hm-wave">
                  {WAVE_BARS.map((bar, index) => (
                    <i
                      key={index}
                      style={
                        {
                          "--h": `${bar.height}%`,
                          "--wd": `${bar.delay}s`,
                        } as CSSProperties
                      }
                    />
                  ))}
                </span>

                <span className="hm-time">۰:۱۲</span>
              </div>

              <div className="hm-card-body">
                <h3>تبدیل متن به صدا با هوش مصنوعی</h3>
                <p>
                  متن خودت را وارد کن، مدل صدا را انتخاب کن و آن را
                  به یک صدای طبیعی و حرفه‌ای تبدیل کن.
                </p>
              </div>

              <div className="hm-card-foot">
                <span className="hm-card-cta">ساخت صدا</span>
                <span className="hm-arrow"><ArrowIcon /></span>
              </div>
            </GlowCard>
          </div>
        </div>
      </section>

      {/* ============ INSPIRATION MARQUEE ============ */}
      <section className="hm-section hm-inspire">
        <div className="hm-section-head hm-reveal">
          <span className="hm-eyebrow">INSPIRATION</span>
          <h2>از کجا شروع کنم؟ از همین‌ها.</h2>
          <p>روی هر کدوم بزنی، مستقیم می‌ری سراغش.</p>
        </div>

        <div className="hm-reveal" style={{ "--rd": "0.1s" } as CSSProperties}>
          <MarqueeRow chips={ROW_ONE} />
          <MarqueeRow chips={ROW_TWO} reverse />
        </div>
      </section>

      {/* ============ STEPS ============ */}
      <section className="hm-section hm-steps-section">
        <div className="hm-section-head hm-reveal">
          <span className="hm-eyebrow">HOW IT WORKS</span>
          <h2>از ایده تا نتیجه، سه قدم</h2>
        </div>

        <ol className="hm-steps">
          {STEPS.map((step, index) => (
            <li
              key={step.n}
              className="hm-step hm-reveal"
              style={{ "--rd": `${index * 0.12}s` } as CSSProperties}
            >
              <span className="hm-step-n">{step.n}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ============ CTA BAND ============ */}
      <section className="hm-section hm-cta-section">
        <div className="hm-cta hm-reveal">
          <span className="hm-cta-star c1"><SparkIcon /></span>
          <span className="hm-cta-star c2"><SparkIcon /></span>
          <span className="hm-cta-star c3"><SparkIcon /></span>

          <h2>آماده‌ای اولین ایده‌ات رو بسازی؟</h2>
          <p>فقط کافیه شروع کنی؛ بقیه‌اش با موبیکساست.</p>

          <div className="hm-cta-actions">
            <Link
              href="/chat"
              className="hm-cta-main"
              onPointerMove={magnet}
              onPointerLeave={unmagnet}
            >
              شروع گفتگو
              <ArrowIcon />
            </Link>

            <Link href="/image" className="hm-cta-ghost">
              ساخت تصویر
            </Link>
          </div>
        </div>
      </section>

      {/* ============ MAKER ============ */}
      <section className="hm-section hm-maker-section">
        <div className="hm-maker hm-reveal">
          <span className="hm-eyebrow sora">THE MAKER</span>

          <p className="hm-maker-kicker hm-serif">
            Designed &amp; built by
          </p>

          <h2 className="hm-maker-name hm-serif">
            Benyamin
          </h2>

          <p className="hm-maker-fa">
            هر جزئیاتِ موبیکسا، از اولین ایده تا آخرین پیکسل، با
            وسواس و عشق ساخته شده.
          </p>

          <div
            className={`hm-sign${sigDrawn ? " drawn" : ""}`}
            ref={sigRef}
          >
            <span className="hm-sign-x" aria-hidden="true">×</span>

            <div className="hm-sign-art">
              <svg
                viewBox={SIGNATURE_VIEWBOX}
                role="img"
                aria-label="امضای بنیامین"
              >
                <defs>
                  <linearGradient
                    id="hmInk"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="0.4"
                  >
                    <stop offset="0%" stopColor="#1c2bb4" />
                    <stop offset="55%" stopColor="#3b3fe0" />
                    <stop offset="100%" stopColor="#7b4dff" />
                  </linearGradient>
                </defs>

                <path
                  d={SIGNATURE_PATH}
                  fill="url(#hmInk)"
                  fillRule="evenodd"
                />
              </svg>
            </div>

            <span className="hm-sign-line" aria-hidden="true" />
          </div>

          <p className="hm-sign-caption">
            <span className="hm-serif">Benyamin</span>
            <i />
            Founder &amp; Developer
          </p>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="hm-footer">
        <div className="hm-footer-links">
          <Link href="/chat">گفتگو با هوش مصنوعی</Link>
          <Link href="/image">ساخت تصویر</Link>
          <Link href="/voice">ساخت صدا</Link>
        </div>

        <p className="hm-footer-tag hm-serif">
          Built with curiosity. Designed for the future.
        </p>

        <div className="hm-watermark" aria-hidden="true">
          MOBIXA
        </div>
      </footer>

      {/* ============ MOBILE DOCK ============ */}
      <nav
        className={`hm-dock${showDock ? " show" : ""}`}
        aria-label="دسترسی سریع"
      >
        <Link href="/chat" className="tone-violet">
          <ChatIcon />
          <span>گفتگو</span>
        </Link>

        <Link href="/image" className="tone-cyan">
          <ImageIcon />
          <span>تصویر</span>
        </Link>

        <Link href="/voice" className="tone-pink">
          <MicIcon />
          <span>صدا</span>
        </Link>
      </nav>

      <style jsx global>{`
        /* =====================================================
           ROOT
        ===================================================== */

        html:has(.hm-root),
        body:has(.hm-root) {
          background: #e0dcff;
        }

        body:has(.hm-root)::before,
        body:has(.hm-root)::after {
          display: none;
        }

        .hm-root {
          --ink: #1b1740;
          --muted: rgba(27, 23, 64, 0.64);
          --violet: #6d4cff;
          --blue: #3e7bff;
          --cyan: #1fc3f2;
          --pink: #ff5fae;

          position: relative;
          z-index: 0;
          isolation: isolate;
          min-height: 100vh;
          overflow-x: clip;
          color: var(--ink);
          font-family:
            "Vazirmatn",
            Tahoma,
            "Segoe UI",
            Arial,
            sans-serif;
          -webkit-font-smoothing: antialiased;
          background:
            radial-gradient(
              90% 40% at 50% 0%,
              rgba(255, 255, 255, 0.7),
              transparent 70%
            ),
            linear-gradient(
              180deg,
              #d9d3ff 0%,
              #d2e1ff 32%,
              #e4dbff 64%,
              #f2dcf3 100%
            );
        }

        :where(.hm-root h1, .hm-root h2, .hm-root h3, .hm-root p) {
          margin: 0;
        }

        :where(.hm-root a) {
          color: inherit;
          text-decoration: none;
        }

        .hm-root a:focus-visible {
          outline: 2px solid rgba(109, 76, 255, 0.9);
          outline-offset: 3px;
        }

        .hm-serif {
          font-family:
            "Instrument Serif",
            "Playfair Display",
            Georgia,
            "Times New Roman",
            serif;
          font-style: italic;
          font-weight: 400;
        }

        .tone-violet {
          --tone: #6d4cff;
          --tone2: #3e7bff;
          --tone-ink: #4a36d6;
          --spot: rgba(109, 76, 255, 0.2);
        }

        .tone-cyan {
          --tone: #1fc3f2;
          --tone2: #5b8bff;
          --tone-ink: #0a7fa6;
          --spot: rgba(31, 195, 242, 0.22);
        }

        .tone-pink {
          --tone: #ff5fae;
          --tone2: #a56bff;
          --tone-ink: #c2347f;
          --spot: rgba(255, 95, 174, 0.2);
        }

        /* =====================================================
           BACKGROUND
        ===================================================== */

        .hm-bg {
          position: absolute;
          inset: 0;
          z-index: -1;
          overflow: hidden;
          pointer-events: none;
        }

        .hm-aurora {
          position: absolute;
          top: -300px;
          left: 50%;
          width: 880px;
          height: 880px;
          margin-left: -440px;
          border-radius: 50%;
          background:
            conic-gradient(
              from 0deg,
              rgba(109, 76, 255, 0),
              rgba(109, 76, 255, 0.4),
              rgba(31, 195, 242, 0.34),
              rgba(255, 95, 174, 0.34),
              rgba(255, 180, 138, 0.28),
              rgba(109, 76, 255, 0)
            );
          filter: blur(64px);
          opacity: 0.85;
          animation: hmSpinSlow 48s linear infinite;
        }

        .hm-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          will-change: transform;
        }

        .hm-blob-a {
          top: 160px;
          left: -180px;
          width: 340px;
          height: 340px;
          background: rgba(139, 108, 255, 0.45);
          animation: hmDriftA 20s ease-in-out infinite alternate;
        }

        .hm-blob-b {
          top: 980px;
          right: -190px;
          width: 360px;
          height: 360px;
          background: rgba(31, 195, 242, 0.36);
          animation: hmDriftB 24s ease-in-out infinite alternate;
        }

        .hm-blob-c {
          top: 1900px;
          left: -170px;
          width: 340px;
          height: 340px;
          background: rgba(255, 111, 181, 0.34);
          animation: hmDriftA 26s ease-in-out infinite alternate;
        }

        .hm-blob-d {
          top: 2900px;
          right: -170px;
          width: 340px;
          height: 340px;
          background: rgba(139, 108, 255, 0.4);
          animation: hmDriftB 22s ease-in-out infinite alternate;
        }

        .hm-grid {
          position: absolute;
          inset: 0 0 auto 0;
          height: 900px;
          background-image:
            radial-gradient(
              rgba(80, 60, 200, 0.22) 1px,
              transparent 1.4px
            );
          background-size: 24px 24px;
          -webkit-mask-image:
            linear-gradient(#000, transparent 85%);
          mask-image:
            linear-gradient(#000, transparent 85%);
        }

        .hm-star {
          position: absolute;
          width: 14px;
          height: 14px;
          color: #ffffff;
          filter:
            drop-shadow(0 0 6px rgba(109, 76, 255, 0.9))
            drop-shadow(0 0 14px rgba(109, 76, 255, 0.5));
          animation: hmTwinkle 4.2s ease-in-out infinite;
        }

        .hm-star svg {
          width: 100%;
          height: 100%;
        }

        .hm-star.s1 { top: 150px; left: 11%; }
        .hm-star.s2 { top: 260px; right: 12%; width: 18px; height: 18px; animation-delay: 0.9s; }
        .hm-star.s3 { top: 520px; left: 6%; width: 10px; height: 10px; animation-delay: 1.7s; }
        .hm-star.s4 { top: 640px; right: 8%; width: 12px; height: 12px; animation-delay: 2.4s; }
        .hm-star.s5 { top: 1180px; left: 14%; width: 12px; height: 12px; animation-delay: 1.2s; }

        .hm-grain {
          position: absolute;
          inset: 0;
          opacity: 0.07;
          mix-blend-mode: overlay;
          background-image:
            url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
        }

        /* =====================================================
           HEADER
        ===================================================== */

        .hm-header {
          position: fixed;
          top: 12px;
          inset-inline: 12px;
          z-index: 70;
          max-width: 1120px;
          height: 60px;
          margin-inline: auto;
          padding: 0 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          border-radius: 20px;
          border: 1px solid transparent;
          transition:
            background 0.35s ease,
            border-color 0.35s ease,
            box-shadow 0.35s ease,
            backdrop-filter 0.35s ease;
          animation: hmDrop 0.8s cubic-bezier(.2,.8,.2,1) both;
        }

        .hm-header.solid {
          background: rgba(255, 255, 255, 0.62);
          border-color: rgba(255, 255, 255, 0.95);
          box-shadow: 0 14px 40px rgba(70, 55, 190, 0.16);
          -webkit-backdrop-filter: blur(20px);
          backdrop-filter: blur(20px);
        }

        .hm-logo {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          direction: ltr;
        }

        .hm-logo-word {
          font-family: "Sora", "Vazirmatn", sans-serif;
          font-size: 16px;
          font-weight: 800;
          letter-spacing: 0.2em;
          color: var(--ink);
        }

        .hm-logo b {
          padding: 3px 7px 3px 9px;
          border-radius: 7px;
          font-family: "Sora", sans-serif;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.14em;
          color: #fff;
          background: linear-gradient(135deg, #7c5cff, #3e7bff);
          box-shadow: 0 6px 16px rgba(100, 80, 240, 0.4);
        }

        .hm-nav {
          display: none;
          align-items: center;
          gap: 6px;
        }

        .hm-nav a {
          position: relative;
          padding: 8px 14px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          color: var(--muted);
          transition:
            color 0.2s ease,
            background 0.2s ease;
        }

        .hm-nav a:hover {
          color: var(--ink);
          background: rgba(255, 255, 255, 0.6);
        }

        .hm-new-dot {
          display: inline-block;
          width: 7px;
          height: 7px;
          margin-inline-start: 6px;
          border-radius: 50%;
          background: var(--pink);
          box-shadow: 0 0 10px var(--pink);
          animation: hmPulseDot 1.8s ease-in-out infinite;
        }

        .hm-header-cta {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 9px 15px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 700;
          color: #fff;
          background: var(--ink);
          box-shadow: 0 10px 24px rgba(27, 23, 64, 0.28);
          transition:
            transform 0.25s ease,
            background 0.25s ease;
        }

        .hm-header-cta svg {
          width: 16px;
          height: 16px;
          transition: transform 0.25s ease;
        }

        .hm-header-cta:hover {
          transform: translateY(-1px);
          background: linear-gradient(135deg, #5a3df0, #3e7bff);
        }

        .hm-header-cta:hover svg {
          transform: translateX(-3px);
        }

        /* =====================================================
           HERO
        ===================================================== */

        .hm-hero {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          max-width: 1120px;
          margin: 0 auto;
          padding: 128px 20px 36px;
          text-align: center;
        }

        .hm-rise {
          animation: hmRise 0.95s cubic-bezier(.2,.8,.2,1) var(--d, 0s) both;
        }

        .hm-hero-chip {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 8px 16px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 700;
          color: var(--tone-ink, #4a36d6);
          --tone-ink: #4a36d6;
          background: rgba(255, 255, 255, 0.66);
          border: 1px solid rgba(255, 255, 255, 0.95);
          box-shadow: 0 10px 28px rgba(100, 80, 230, 0.18);
          -webkit-backdrop-filter: blur(14px);
          backdrop-filter: blur(14px);
        }

        .hm-hero-chip-star {
          width: 15px;
          height: 15px;
          color: var(--pink);
          animation: hmSpinSlow 9s linear infinite;
        }

        .hm-hero-chip-star svg {
          width: 100%;
          height: 100%;
        }

        .hm-title {
          margin-top: 22px;
          font-size: clamp(38px, 8.6vw, 78px);
          line-height: 1.28;
          font-weight: 900;
          letter-spacing: -0.01em;
        }

        .hm-title-line {
          display: block;
        }

        .hm-title .hm-title-grad.hm-rise {
          background: linear-gradient(
            90deg,
            #5b3df0,
            #2f7bff,
            #ff5fae,
            #5b3df0
          );
          background-size: 260% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation:
            hmRise 0.95s cubic-bezier(.2,.8,.2,1) var(--d, 0s) both,
            hmGradText 7s linear infinite;
        }

        .hm-sub {
          max-width: 560px;
          margin-top: 20px;
          font-size: clamp(14.5px, 2.4vw, 17px);
          line-height: 2;
          color: var(--muted);
        }

        .hm-float {
          position: absolute;
          display: none;
          align-items: center;
          gap: 9px;
          padding: 9px 15px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 600;
          background: rgba(255, 255, 255, 0.78);
          border: 1px solid rgba(255, 255, 255, 0.98);
          box-shadow: 0 16px 38px rgba(80, 60, 200, 0.18);
          animation: hmFloat 6.5s ease-in-out infinite;
        }

        .hm-float.f1 { top: 190px; inset-inline-end: 6%; }
        .hm-float.f2 { top: 300px; inset-inline-start: 5%; animation-delay: 1.4s; }
        .hm-float.f3 { top: 440px; inset-inline-start: 12%; animation-delay: 2.6s; }

        .hm-float-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--violet);
          box-shadow: 0 0 10px var(--violet);
        }

        .hm-float-wave {
          display: inline-flex;
          align-items: center;
          gap: 2px;
          height: 16px;
        }

        .hm-float-wave i {
          width: 3px;
          height: 100%;
          border-radius: 3px;
          background: linear-gradient(180deg, #ff5fae, #a56bff);
          transform-origin: center;
          animation: hmWave 1s ease-in-out infinite;
        }

        .hm-float-wave i:nth-child(2) { animation-delay: 0.12s; }
        .hm-float-wave i:nth-child(3) { animation-delay: 0.24s; }
        .hm-float-wave i:nth-child(4) { animation-delay: 0.36s; }
        .hm-float-wave i:nth-child(5) { animation-delay: 0.48s; }

        .hm-float-img {
          width: 18px;
          height: 18px;
          border-radius: 6px;
          background: linear-gradient(135deg, #1fc3f2, #d8c9ff, #ffb4d6);
          animation: hmHue 4s ease-in-out infinite;
        }

        /* prompt bar */

        .hm-prompt {
          position: relative;
          display: block;
          width: min(660px, 100%);
          margin-top: 34px;
          padding: 2px;
          border-radius: 26px;
          overflow: hidden;
          box-shadow:
            0 24px 60px rgba(90, 70, 220, 0.28),
            0 4px 14px rgba(90, 70, 220, 0.12);
          transition:
            transform 0.3s cubic-bezier(.2,.8,.2,1),
            box-shadow 0.3s ease;
        }

        .hm-prompt:hover {
          box-shadow:
            0 30px 70px rgba(90, 70, 220, 0.38),
            0 6px 18px rgba(90, 70, 220, 0.16);
        }

        .hm-prompt-glow {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 170%;
          aspect-ratio: 1;
          background:
            conic-gradient(
              from 0deg,
              #6d4cff,
              #1fc3f2,
              #ff5fae,
              #ffb48a,
              #6d4cff
            );
          transform: translate(-50%, -50%);
          animation: hmSpinCenter 6s linear infinite;
        }

        .hm-prompt-inner {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          min-height: 64px;
          padding: 10px 22px 10px 10px;
          border-radius: 24px;
          background: #fbfaff;
        }

        .hm-prompt-text {
          min-width: 0;
          flex: 1;
          overflow: hidden;
          text-align: start;
          text-overflow: ellipsis;
          white-space: nowrap;
          padding-inline-start: 12px;
          font-size: 16px;
          font-weight: 500;
          color: rgba(27, 23, 64, 0.55);
        }

        .hm-caret {
          display: inline-block;
          width: 7px;
          height: 1.05em;
          margin-inline-start: 5px;
          vertical-align: -0.2em;
          border-radius: 2px;
          background: linear-gradient(180deg, #8b6cff, #3e7bff);
          box-shadow: 0 0 10px rgba(124, 92, 255, 0.7);
          animation: hmBlink 1s steps(2, start) infinite;
        }

        .hm-caret.thin {
          width: 2px;
          border-radius: 1px;
        }

        .hm-prompt-send {
          position: relative;
          width: 46px;
          height: 46px;
          flex: 0 0 46px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          color: #fff;
          background:
            radial-gradient(
              circle at 32% 24%,
              #a58aff,
              #6a4df0 58%,
              #4535c8
            );
          box-shadow:
            0 8px 20px rgba(106, 77, 240, 0.5),
            inset 0 1px 2px rgba(255, 255, 255, 0.45);
          transition: transform 0.3s cubic-bezier(.2,.8,.2,1);
        }

        .hm-prompt-send svg {
          width: 22px;
          height: 22px;
        }

        .hm-prompt:hover .hm-prompt-send {
          transform: scale(1.1) translateY(-2px);
        }

        .hm-quick {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 10px;
          margin-top: 22px;
        }

        .hm-quick-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 17px;
          border-radius: 999px;
          font-size: 14px;
          font-weight: 700;
          color: var(--tone-ink);
          background: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.98);
          box-shadow: 0 8px 22px rgba(80, 60, 200, 0.12);
          transition:
            transform 0.25s cubic-bezier(.2,.8,.2,1),
            border-color 0.25s ease,
            box-shadow 0.25s ease;
        }

        .hm-quick-link svg {
          width: 18px;
          height: 18px;
        }

        .hm-quick-link:hover {
          transform: translateY(-3px);
          border-color: var(--tone);
          box-shadow: 0 14px 30px rgba(80, 60, 200, 0.2);
        }

        .hm-quick-link em {
          padding: 2px 7px;
          border-radius: 999px;
          font-size: 9px;
          font-style: normal;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #fff;
          background: linear-gradient(135deg, #ff5fae, #a56bff);
        }

        .hm-scroll-hint {
          display: grid;
          place-items: start center;
          width: 24px;
          height: 38px;
          margin-top: 38px;
          padding-top: 7px;
          border: 2px solid rgba(27, 23, 64, 0.22);
          border-radius: 14px;
        }

        .hm-scroll-hint span {
          width: 4px;
          height: 8px;
          border-radius: 3px;
          background: var(--violet);
          animation: hmScrollDot 1.8s ease-in-out infinite;
        }

        /* =====================================================
           SECTIONS
        ===================================================== */

        .hm-section {
          position: relative;
          max-width: 1120px;
          margin: 0 auto;
          padding: 64px 18px 0;
        }

        .hm-section-head {
          margin-bottom: 30px;
          text-align: center;
        }

        .hm-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
          font-family: "Sora", sans-serif;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.3em;
          color: #5a3fe6;
          direction: ltr;
        }

        .hm-eyebrow::before,
        .hm-eyebrow::after {
          content: "";
          width: 22px;
          height: 1px;
          background: linear-gradient(90deg, transparent, #6d4cff);
        }

        .hm-eyebrow::after {
          transform: scaleX(-1);
        }

        .hm-section-head h2 {
          font-size: clamp(26px, 5.4vw, 42px);
          line-height: 1.4;
          font-weight: 900;
        }

        .hm-section-head p {
          margin-top: 8px;
          font-size: 15px;
          color: var(--muted);
        }

        .hm-js .hm-reveal {
          opacity: 0;
          transform: translateY(28px) scale(0.985);
          transition:
            opacity 0.85s cubic-bezier(.2,.8,.2,1) var(--rd, 0s),
            transform 0.85s cubic-bezier(.2,.8,.2,1) var(--rd, 0s);
        }

        .hm-js .hm-reveal.in {
          opacity: 1;
          transform: none;
        }

        /* =====================================================
           BENTO CARDS
        ===================================================== */

        .hm-bento {
          display: grid;
          gap: 18px;
        }

        .hm-bento > div {
          min-width: 0;
        }

        .hm-card {
          position: relative;
          display: flex;
          flex-direction: column;
          height: 100%;
          padding: 22px;
          border-radius: 30px;
          overflow: hidden;
          text-align: start;
          background:
            linear-gradient(
              160deg,
              rgba(255, 255, 255, 0.86),
              rgba(255, 255, 255, 0.56)
            );
          border: 1px solid rgba(255, 255, 255, 0.98);
          box-shadow:
            0 26px 60px rgba(70, 55, 190, 0.16),
            inset 0 1px 0 #ffffff;
          -webkit-backdrop-filter: blur(18px);
          backdrop-filter: blur(18px);
          transform:
            perspective(900px)
            rotateX(var(--ry, 0deg))
            rotateY(var(--rx, 0deg));
          transition:
            transform 0.4s cubic-bezier(.2,.8,.2,1),
            box-shadow 0.4s ease;
        }

        .hm-card:hover {
          box-shadow:
            0 36px 80px rgba(70, 55, 190, 0.26),
            inset 0 1px 0 #ffffff;
        }

        .hm-card:active {
          transform: scale(0.99);
        }

        .hm-card > *:not(.hm-card-spot):not(.hm-card-ring) {
          position: relative;
          z-index: 1;
        }

        .hm-card-spot {
          position: absolute;
          inset: 0;
          z-index: 0;
          opacity: 0;
          background:
            radial-gradient(
              380px circle at var(--mx, 50%) var(--my, 0%),
              var(--spot),
              transparent 65%
            );
          transition: opacity 0.35s ease;
          pointer-events: none;
        }

        .hm-card:hover .hm-card-spot {
          opacity: 1;
        }

        .hm-card-ring {
          position: absolute;
          inset: 0;
          z-index: 2;
          padding: 1.5px;
          border-radius: inherit;
          background:
            linear-gradient(
              135deg,
              var(--tone),
              transparent 38%,
              transparent 62%,
              var(--tone2)
            );
          -webkit-mask:
            linear-gradient(#000 0 0) content-box,
            linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask:
            linear-gradient(#000 0 0) content-box,
            linear-gradient(#000 0 0);
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.35s ease;
          pointer-events: none;
        }

        .hm-card:hover .hm-card-ring {
          opacity: 1;
        }

        .hm-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .hm-tile {
          display: grid;
          place-items: center;
          width: 48px;
          height: 48px;
          border-radius: 16px;
          color: #fff;
          background: linear-gradient(135deg, var(--tone), var(--tone2));
          box-shadow: 0 12px 26px color-mix(in srgb, var(--tone) 45%, transparent);
        }

        .hm-tile svg {
          width: 25px;
          height: 25px;
        }

        .hm-new {
          padding: 4px 11px;
          border-radius: 999px;
          font-family: "Sora", sans-serif;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.1em;
          color: #fff;
          background: linear-gradient(135deg, #ff5fae, #a56bff);
          box-shadow: 0 8px 20px rgba(255, 95, 174, 0.4);
          animation: hmPulseBadge 2.4s ease-in-out infinite;
        }

        .hm-card-body {
          margin-top: 20px;
        }

        .hm-card-body h3 {
          font-size: 21px;
          line-height: 1.55;
          font-weight: 800;
        }

        .hm-card-body p {
          margin-top: 8px;
          font-size: 14px;
          line-height: 1.95;
          color: var(--muted);
        }

        .hm-card-foot {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: auto;
          padding-top: 20px;
        }

        .hm-card-cta {
          font-size: 14.5px;
          font-weight: 800;
          color: var(--tone-ink);
        }

        .hm-arrow {
          display: grid;
          place-items: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          color: var(--tone-ink);
          border: 1.5px solid color-mix(in srgb, var(--tone) 40%, transparent);
          background: rgba(255, 255, 255, 0.7);
          transition:
            transform 0.35s cubic-bezier(.2,.8,.2,1),
            background 0.3s ease,
            color 0.3s ease;
        }

        .hm-arrow svg {
          width: 19px;
          height: 19px;
        }

        .hm-card:hover .hm-arrow {
          transform: translateX(-6px);
          color: #fff;
          background: linear-gradient(135deg, var(--tone), var(--tone2));
          border-color: transparent;
        }

        /* chat demo */

        .hm-chat-demo {
          display: flex;
          flex-direction: column;
          gap: 10px;
          min-height: 150px;
          margin-top: 20px;
          padding: 14px;
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.9);
        }

        .hm-bubble {
          max-width: 90%;
          padding: 10px 14px;
          border-radius: 18px;
          font-size: 13.5px;
          line-height: 1.85;
        }

        .hm-bubble-user {
          align-self: flex-start;
          border-bottom-right-radius: 5px;
          color: #fff;
          background: linear-gradient(135deg, #7c5cff, #3e7bff);
          box-shadow: 0 10px 22px rgba(91, 80, 240, 0.3);
          animation: hmPop 0.5s cubic-bezier(.2,.9,.3,1.15) both;
        }

        .hm-bubble-ai {
          align-self: flex-end;
          min-height: 42px;
          border-bottom-left-radius: 5px;
          color: var(--ink);
          background: #fff;
          box-shadow: 0 10px 22px rgba(70, 55, 190, 0.12);
        }

        .hm-dots {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          height: 22px;
        }

        .hm-dots i {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #7c5cff;
          animation: hmDot 1.2s ease-in-out infinite;
        }

        .hm-dots i:nth-child(2) { animation-delay: 0.15s; }
        .hm-dots i:nth-child(3) { animation-delay: 0.3s; }

        /* image art */

        .hm-art {
          margin-top: 20px;
        }

        .hm-art-canvas {
          position: relative;
          aspect-ratio: 16 / 10;
          border-radius: 22px;
          overflow: hidden;
          background:
            linear-gradient(
              135deg,
              #b9e9ff,
              #d9caff 55%,
              #ffd1e8
            );
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.8);
        }

        .hm-art-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(16px);
        }

        .hm-art-orb.o1 {
          width: 55%;
          height: 80%;
          top: -10%;
          inset-inline-start: -8%;
          background: rgba(109, 76, 255, 0.55);
          animation: hmOrb 6s ease-in-out infinite alternate;
        }

        .hm-art-orb.o2 {
          width: 50%;
          height: 70%;
          bottom: -18%;
          inset-inline-end: -6%;
          background: rgba(255, 95, 174, 0.55);
          animation: hmOrb 7.5s ease-in-out infinite alternate-reverse;
        }

        .hm-art-orb.o3 {
          width: 34%;
          height: 50%;
          top: 22%;
          inset-inline-start: 34%;
          background: rgba(31, 195, 242, 0.6);
          animation: hmOrb 5s ease-in-out infinite alternate;
        }

        .hm-art-scan {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 38%;
          background:
            linear-gradient(
              100deg,
              rgba(255, 255, 255, 0),
              rgba(255, 255, 255, 0.7),
              rgba(255, 255, 255, 0)
            );
          animation: hmScan 3.4s ease-in-out infinite;
        }

        .hm-art-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 12px;
        }

        .hm-art-label {
          font-size: 12px;
          font-weight: 700;
          color: var(--tone-ink);
          white-space: nowrap;
        }

        .hm-art-progress {
          position: relative;
          flex: 1;
          height: 6px;
          border-radius: 999px;
          overflow: hidden;
          background: rgba(31, 195, 242, 0.18);
        }

        .hm-art-progress i {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: linear-gradient(90deg, #1fc3f2, #6d4cff, #ff5fae);
          transform-origin: right;
          animation: hmProgress 4.4s ease-in-out infinite;
        }

        /* voice player */

        .hm-player {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 20px;
          padding: 12px 14px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.62);
          border: 1px solid rgba(255, 255, 255, 0.95);
        }

        .hm-play {
          display: grid;
          place-items: center;
          width: 42px;
          height: 42px;
          flex: 0 0 42px;
          border-radius: 50%;
          color: #fff;
          background: linear-gradient(135deg, #ff5fae, #a56bff);
          box-shadow: 0 10px 22px rgba(255, 95, 174, 0.4);
        }

        .hm-play svg {
          width: 18px;
          height: 18px;
          margin-inline-start: -2px;
        }

        .hm-wave {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 3px;
          height: 40px;
        }

        .hm-wave i {
          flex: 1;
          max-width: 5px;
          height: var(--h);
          border-radius: 4px;
          background: linear-gradient(180deg, #ff5fae, #a56bff);
          transform-origin: center;
          animation: hmWave 1.15s ease-in-out var(--wd) infinite;
        }

        .hm-time {
          font-size: 12px;
          font-weight: 700;
          color: var(--tone-ink);
        }

        /* =====================================================
           MARQUEE
        ===================================================== */

        .hm-inspire {
          padding-inline: 0;
        }

        .hm-marquee {
          direction: ltr;
          padding: 7px 0;
          overflow: hidden;
          -webkit-mask-image:
            linear-gradient(90deg, transparent, #000 9%, #000 91%, transparent);
          mask-image:
            linear-gradient(90deg, transparent, #000 9%, #000 91%, transparent);
        }

        .hm-marquee-track {
          display: flex;
          gap: 12px;
          width: max-content;
          padding-inline-end: 12px;
          animation: hmMarquee 46s linear infinite;
        }

        .hm-marquee.reverse .hm-marquee-track {
          animation-direction: reverse;
          animation-duration: 54s;
        }

        .hm-marquee:hover .hm-marquee-track {
          animation-play-state: paused;
        }

        .hm-chip {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          direction: rtl;
          padding: 12px 20px;
          border-radius: 999px;
          font-size: 14.5px;
          font-weight: 600;
          white-space: nowrap;
          background: rgba(255, 255, 255, 0.72);
          border: 1px solid rgba(255, 255, 255, 0.98);
          box-shadow: 0 10px 26px rgba(80, 60, 200, 0.1);
          transition:
            transform 0.25s cubic-bezier(.2,.8,.2,1),
            border-color 0.25s ease,
            box-shadow 0.25s ease;
        }

        .hm-chip-icon {
          font-size: 16px;
        }

        .hm-chip:hover {
          transform: translateY(-3px);
          border-color: var(--tone);
          box-shadow: 0 16px 34px rgba(80, 60, 200, 0.2);
        }

        /* =====================================================
           STEPS
        ===================================================== */

        .hm-steps {
          position: relative;
          display: grid;
          gap: 30px;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .hm-step {
          position: relative;
          display: grid;
          grid-template-columns: 58px 1fr;
          column-gap: 16px;
          align-items: start;
          text-align: start;
        }

        .hm-step:not(:last-child)::after {
          content: "";
          position: absolute;
          inset-inline-start: 28px;
          top: 62px;
          bottom: -26px;
          width: 2px;
          border-radius: 2px;
          background:
            linear-gradient(
              180deg,
              rgba(109, 76, 255, 0.5),
              rgba(31, 195, 242, 0.15)
            );
        }

        .hm-step-n {
          grid-row: span 2;
          display: grid;
          place-items: center;
          width: 58px;
          height: 58px;
          border-radius: 50%;
          font-family: "Sora", "Vazirmatn", sans-serif;
          font-size: 17px;
          font-weight: 800;
          color: var(--ink);
          border: 2px solid transparent;
          background-clip: padding-box, border-box;
          background-origin: border-box;
          background-image:
            linear-gradient(#fff, #fff),
            linear-gradient(135deg, #6d4cff, #1fc3f2, #ff5fae);
          box-shadow: 0 14px 30px rgba(80, 60, 200, 0.2);
        }

        .hm-step h3 {
          padding-top: 6px;
          font-size: 20px;
          font-weight: 800;
        }

        .hm-step p {
          margin-top: 6px;
          font-size: 14.5px;
          line-height: 1.95;
          color: var(--muted);
        }

        /* =====================================================
           CTA
        ===================================================== */

        .hm-cta {
          position: relative;
          overflow: hidden;
          padding: 48px 22px;
          border-radius: 36px;
          text-align: center;
          color: #fff;
          background:
            linear-gradient(
              120deg,
              #5a3df0,
              #3b7bff 48%,
              #ff6fb5
            );
          background-size: 220% 220%;
          box-shadow: 0 34px 80px rgba(80, 60, 220, 0.4);
          animation: hmGradient 10s ease-in-out infinite;
        }

        .hm-cta::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            radial-gradient(
              60% 80% at 80% 0%,
              rgba(255, 255, 255, 0.28),
              transparent 60%
            ),
            radial-gradient(
              rgba(255, 255, 255, 0.22) 1px,
              transparent 1.4px
            );
          background-size: auto, 22px 22px;
          -webkit-mask-image: linear-gradient(#000, transparent 90%);
          mask-image: linear-gradient(#000, transparent 90%);
        }

        .hm-cta > * {
          position: relative;
        }

        .hm-cta h2 {
          font-size: clamp(26px, 5.4vw, 42px);
          line-height: 1.5;
          font-weight: 900;
        }

        .hm-cta p {
          margin-top: 8px;
          font-size: 15.5px;
          color: rgba(255, 255, 255, 0.86);
        }

        .hm-cta-actions {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 12px;
          margin-top: 28px;
        }

        .hm-cta-main {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 15px 28px;
          border-radius: 999px;
          overflow: hidden;
          font-size: 16px;
          font-weight: 800;
          color: #2b1fa8;
          background: #fff;
          box-shadow: 0 18px 40px rgba(20, 10, 90, 0.3);
          transition:
            transform 0.25s cubic-bezier(.2,.8,.2,1),
            box-shadow 0.25s ease;
        }

        .hm-cta-main::after {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          width: 40%;
          background:
            linear-gradient(
              100deg,
              transparent,
              rgba(109, 76, 255, 0.28),
              transparent
            );
          animation: hmShine 3.2s ease-in-out infinite;
        }

        .hm-cta-main svg {
          width: 20px;
          height: 20px;
          transition: transform 0.25s ease;
        }

        .hm-cta-main:hover svg {
          transform: translateX(-4px);
        }

        .hm-cta-ghost {
          display: inline-flex;
          align-items: center;
          padding: 15px 26px;
          border-radius: 999px;
          font-size: 15px;
          font-weight: 700;
          color: #fff;
          border: 1.5px solid rgba(255, 255, 255, 0.55);
          background: rgba(255, 255, 255, 0.12);
          transition:
            background 0.25s ease,
            transform 0.25s ease;
        }

        .hm-cta-ghost:hover {
          background: rgba(255, 255, 255, 0.24);
          transform: translateY(-2px);
        }

        .hm-cta-star {
          position: absolute;
          width: 18px;
          height: 18px;
          color: #fff;
          filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.9));
          animation: hmTwinkle 3.6s ease-in-out infinite;
        }

        .hm-cta-star svg {
          width: 100%;
          height: 100%;
        }

        .hm-cta-star.c1 { top: 22px; inset-inline-start: 10%; }
        .hm-cta-star.c2 { bottom: 26px; inset-inline-end: 12%; width: 14px; height: 14px; animation-delay: 1.2s; }
        .hm-cta-star.c3 { top: 40%; inset-inline-end: 5%; width: 10px; height: 10px; animation-delay: 2.1s; }

        /* =====================================================
           MAKER
        ===================================================== */

        .hm-maker {
          position: relative;
          overflow: hidden;
          padding: 50px 20px 42px;
          border-radius: 36px;
          text-align: center;
          background:
            linear-gradient(
              160deg,
              rgba(255, 255, 255, 0.9),
              rgba(255, 255, 255, 0.58)
            );
          border: 1px solid rgba(255, 255, 255, 0.98);
          box-shadow:
            0 30px 80px rgba(70, 55, 190, 0.18),
            inset 0 1px 0 #fff;
        }

        .hm-maker::before {
          content: "";
          position: absolute;
          inset: 0 0 auto 0;
          height: 60%;
          background:
            repeating-radial-gradient(
              circle at 50% -30%,
              rgba(109, 76, 255, 0.09) 0 1px,
              transparent 1px 15px
            );
          -webkit-mask-image: linear-gradient(#000, transparent);
          mask-image: linear-gradient(#000, transparent);
          pointer-events: none;
        }

        .hm-maker > * {
          position: relative;
        }

        .hm-maker-kicker {
          direction: ltr;
          margin-top: 6px;
          font-size: clamp(22px, 5vw, 30px);
          color: rgba(27, 23, 64, 0.62);
        }

        .hm-maker-name {
          direction: ltr;
          margin-top: 2px;
          font-size: clamp(56px, 16vw, 132px);
          line-height: 1.04;
          padding: 0 0.16em 0.06em;
          white-space: nowrap;
          background:
            linear-gradient(
              100deg,
              #2b2a8f,
              #6d4cff 38%,
              #1fc3f2 68%,
              #ff5fae
            );
          background-size: 220% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: hmGradText 8s linear infinite;
        }

        .hm-maker-fa {
          max-width: 440px;
          margin: 10px auto 0;
          font-size: 14.5px;
          line-height: 2;
          color: var(--muted);
        }

        .hm-sign {
          position: relative;
          width: min(360px, 88%);
          margin: 30px auto 0;
        }

        .hm-sign-x {
          position: absolute;
          left: -8px;
          bottom: 16px;
          font-family: Georgia, serif;
          font-size: 22px;
          color: rgba(27, 23, 64, 0.34);
        }

        .hm-sign-art {
          direction: ltr;
        }

        .hm-js .hm-sign:not(.drawn) .hm-sign-art {
          clip-path: inset(-12% 100% -12% 0);
        }

        .hm-sign.drawn .hm-sign-art {
          animation: hmSignDraw 3.4s cubic-bezier(.5,.05,.35,1) 0.3s both;
        }

        .hm-sign-art svg {
          display: block;
          width: 100%;
          height: auto;
          overflow: visible;
        }

        .hm-sign-line {
          display: block;
          height: 1px;
          margin-top: -6px;
          background:
            linear-gradient(
              90deg,
              rgba(27, 23, 64, 0.38),
              rgba(27, 23, 64, 0.06)
            );
          transform-origin: left;
        }

        .hm-js .hm-sign:not(.drawn) .hm-sign-line {
          transform: scaleX(0);
        }

        .hm-sign.drawn .hm-sign-line {
          animation: hmLineGrow 1s cubic-bezier(.2,.8,.2,1) 0.1s both;
        }

        .hm-sign-caption {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          direction: ltr;
          margin-top: 16px;
          font-family: "Sora", sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(27, 23, 64, 0.52);
        }

        .hm-sign-caption .hm-serif {
          font-size: 19px;
          letter-spacing: 0;
          text-transform: none;
          color: var(--ink);
        }

        .hm-sign-caption i {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #6d4cff;
        }

        /* =====================================================
           FOOTER
        ===================================================== */

        .hm-footer {
          position: relative;
          margin-top: 70px;
          padding-top: 10px;
          overflow: hidden;
          text-align: center;
        }

        .hm-footer-links {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 10px 26px;
          padding: 0 18px;
        }

        .hm-footer-links a {
          font-size: 14px;
          font-weight: 600;
          color: var(--muted);
          transition: color 0.2s ease;
        }

        .hm-footer-links a:hover {
          color: var(--violet);
        }

        .hm-footer-tag {
          direction: ltr;
          margin-top: 18px;
          padding: 0 18px;
          font-size: 20px;
          color: rgba(27, 23, 64, 0.6);
        }

        .hm-watermark {
          display: block;
          direction: ltr;
          margin: 24px 0 -0.13em;
          font-family: "Sora", "Vazirmatn", sans-serif;
          font-size: clamp(84px, 27vw, 300px);
          font-weight: 800;
          line-height: 0.8;
          letter-spacing: -0.04em;
          background:
            linear-gradient(
              180deg,
              rgba(109, 76, 255, 0.42),
              rgba(109, 76, 255, 0) 88%
            );
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          user-select: none;
        }

        /* =====================================================
           MOBILE DOCK
        ===================================================== */

        .hm-dock {
          position: fixed;
          left: 50%;
          bottom: calc(14px + env(safe-area-inset-bottom));
          z-index: 80;
          display: flex;
          gap: 4px;
          padding: 6px;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.74);
          border: 1px solid rgba(255, 255, 255, 0.98);
          box-shadow: 0 20px 54px rgba(60, 45, 170, 0.3);
          -webkit-backdrop-filter: blur(22px);
          backdrop-filter: blur(22px);
          opacity: 0;
          pointer-events: none;
          transform: translate(-50%, 150%);
          transition:
            transform 0.55s cubic-bezier(.2,.9,.3,1.1),
            opacity 0.3s ease;
        }

        .hm-dock.show {
          opacity: 1;
          pointer-events: auto;
          transform: translate(-50%, 0);
        }

        .hm-dock a {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          min-width: 78px;
          padding: 9px 14px;
          border-radius: 18px;
          font-size: 11.5px;
          font-weight: 700;
          color: var(--tone-ink);
          transition:
            background 0.2s ease,
            transform 0.2s ease;
        }

        .hm-dock a svg {
          width: 22px;
          height: 22px;
        }

        .hm-dock a:active {
          transform: scale(0.94);
          background: rgba(109, 76, 255, 0.12);
        }

        /* =====================================================
           KEYFRAMES
        ===================================================== */

        @keyframes hmRise {
          from {
            opacity: 0;
            transform: translateY(24px);
            filter: blur(8px);
          }

          to {
            opacity: 1;
            transform: none;
            filter: blur(0);
          }
        }

        @keyframes hmDrop {
          from {
            opacity: 0;
            transform: translateY(-24px);
          }

          to {
            opacity: 1;
            transform: none;
          }
        }

        @keyframes hmPop {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.92);
          }

          to {
            opacity: 1;
            transform: none;
          }
        }

        @keyframes hmSpinSlow {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes hmSpinCenter {
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }

        @keyframes hmGradText {
          from {
            background-position: 0% 50%;
          }

          to {
            background-position: 220% 50%;
          }
        }

        @keyframes hmGradient {
          0%,
          100% {
            background-position: 0% 50%;
          }

          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes hmFloat {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-12px);
          }
        }

        @keyframes hmDriftA {
          from {
            transform: translate(0, 0);
          }

          to {
            transform: translate(50px, 40px);
          }
        }

        @keyframes hmDriftB {
          from {
            transform: translate(0, 0);
          }

          to {
            transform: translate(-50px, -40px);
          }
        }

        @keyframes hmTwinkle {
          0%,
          100% {
            opacity: 0.25;
            transform: scale(0.8);
          }

          50% {
            opacity: 1;
            transform: scale(1.15);
          }
        }

        @keyframes hmBlink {
          0%,
          100% {
            opacity: 1;
          }

          50% {
            opacity: 0.15;
          }
        }

        @keyframes hmDot {
          0%,
          80%,
          100% {
            opacity: 0.3;
            transform: translateY(0);
          }

          40% {
            opacity: 1;
            transform: translateY(-4px);
          }
        }

        @keyframes hmWave {
          0%,
          100% {
            transform: scaleY(0.3);
          }

          50% {
            transform: scaleY(1);
          }
        }

        @keyframes hmHue {
          0%,
          100% {
            filter: hue-rotate(0deg);
          }

          50% {
            filter: hue-rotate(60deg);
          }
        }

        @keyframes hmPulseDot {
          0%,
          100% {
            transform: scale(1);
            opacity: 1;
          }

          50% {
            transform: scale(1.5);
            opacity: 0.5;
          }
        }

        @keyframes hmPulseBadge {
          0%,
          100% {
            transform: scale(1);
          }

          50% {
            transform: scale(1.08);
          }
        }

        @keyframes hmScrollDot {
          0% {
            opacity: 0;
            transform: translateY(0);
          }

          40% {
            opacity: 1;
          }

          100% {
            opacity: 0;
            transform: translateY(14px);
          }
        }

        @keyframes hmOrb {
          from {
            transform: translate(0, 0) scale(1);
          }

          to {
            transform: translate(18%, -12%) scale(1.25);
          }
        }

        @keyframes hmScan {
          0% {
            inset-inline-start: -45%;
          }

          100% {
            inset-inline-start: 110%;
          }
        }

        @keyframes hmProgress {
          0% {
            transform: scaleX(0.06);
          }

          70%,
          100% {
            transform: scaleX(1);
          }
        }

        @keyframes hmMarquee {
          to {
            transform: translateX(-50%);
          }
        }

        @keyframes hmShine {
          0% {
            inset-inline-start: -50%;
          }

          60%,
          100% {
            inset-inline-start: 130%;
          }
        }

        @keyframes hmSignDraw {
          0% {
            clip-path: inset(-12% 100% -12% 0);
          }

          26% {
            clip-path: inset(-12% 79% -12% 0);
          }

          62% {
            clip-path: inset(-12% 47% -12% 0);
          }

          100% {
            clip-path: inset(-12% -2% -12% 0);
          }
        }

        @keyframes hmLineGrow {
          from {
            transform: scaleX(0);
          }

          to {
            transform: scaleX(1);
          }
        }

        /* =====================================================
           RESPONSIVE
        ===================================================== */

        @media (min-width: 760px) {
          .hm-nav {
            display: inline-flex;
          }

          .hm-steps {
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
          }

          .hm-steps::before {
            content: "";
            position: absolute;
            top: 28px;
            inset-inline: 16.6%;
            height: 2px;
            border-radius: 2px;
            background:
              linear-gradient(
                90deg,
                rgba(255, 95, 174, 0.55),
                rgba(31, 195, 242, 0.55),
                rgba(109, 76, 255, 0.55)
              );
          }

          .hm-step {
            grid-template-columns: 1fr;
            justify-items: center;
            text-align: center;
          }

          .hm-step:not(:last-child)::after {
            display: none;
          }

          .hm-step-n {
            grid-row: auto;
            margin-bottom: 14px;
          }

          .hm-step h3 {
            padding-top: 0;
          }
        }

        @media (min-width: 900px) {
          .hm-float {
            display: inline-flex;
          }

          .hm-dock {
            display: none;
          }

          .hm-bento {
            grid-template-columns: 1.15fr 1fr;
            grid-template-rows: auto auto;
          }

          .hm-bento-chat {
            grid-row: span 2;
          }

          .hm-card {
            padding: 26px;
          }
        }

        @media (max-width: 899px) {
          .hm-footer {
            padding-bottom: 96px;
          }
        }

        @media (max-width: 520px) {
          .hm-hero {
            padding-top: 112px;
          }

          .hm-prompt-inner {
            min-height: 58px;
          }

          .hm-prompt-text {
            font-size: 15px;
          }

          .hm-section {
            padding-top: 54px;
          }

          .hm-cta {
            padding: 40px 18px;
          }

          .hm-header-cta {
            padding: 9px 14px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hm-root *,
          .hm-root *::before,
          .hm-root *::after {
            animation: none !important;
            transition-duration: 0.01ms !important;
          }

          .hm-js .hm-reveal {
            opacity: 1;
            transform: none;
          }

          .hm-js .hm-sign:not(.drawn) .hm-sign-art {
            clip-path: none;
          }

          .hm-js .hm-sign:not(.drawn) .hm-sign-line {
            transform: none;
          }
        }
      `}</style>
    </main>
  );
}
