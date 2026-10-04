"use client";

import { useEffect, useRef, useState } from "react";

/*
============================================================
MOBIXA — LIVE VOICE (صفحه‌ی مکالمه‌ی صوتی زنده)
============================================================

مسیر فایل در گیت‌هاب:
app/chat/LiveVoice.tsx

این کامپوننت کاملاً مستقل است و به ظاهر صفحه‌ی چت دست نمی‌زند.

جریان کار هر نوبت:
1) میکروفون گوش می‌دهد و وقتی کاربر ساکت شد، صدا را برمی‌دارد
2) /api/live  → تبدیل صدا به متن (Deepgram)
3) /api/chat  → جواب هوش مصنوعی (همان API فعلی چت)
4) /api/voice → تبدیل جواب به صدا (همان API فعلی ElevenLabs)
5) دوباره به حالت گوش دادن برمی‌گردد
*/

export type LiveHistoryItem = {
  role: "user" | "assistant";
  content: string;
};

type LiveVoiceProps = {
  history: LiveHistoryItem[];
  onTurn: (userText: string, assistantText: string) => void;
  onClose: () => void;
};

type Status =
  | "connecting"
  | "listening"
  | "thinking"
  | "speaking"
  | "error";

type RGB = [number, number, number];

type TtsItem = {
  text: string;
  blob: Blob | null;
};

/* =========================================================
   SETTINGS
========================================================= */

const VOICE_PREFIX =
  "[حالت مکالمه‌ی صوتی زنده: این پیام از طریق صدا آمده و جوابت هم با صدا خوانده می‌شود. " +
  "خیلی کوتاه، گرم و محاوره‌ای جواب بده (حداکثر دو تا سه جمله). " +
  "هیچ مارک‌داون، لیست، جدول، کد، لینک یا ایموجی ننویس. " +
  "جمله‌ها ساده و مناسب شنیدن باشند. اگر کاربر توضیح کامل خواست، خلاصه و روان بگو.]\n\n";

const SILENCE_END_MS = 1100;
const MIN_SPEECH_MS = 350;
const MAX_UTTERANCE_MS = 30000;
const NO_SPEECH_RESET_MS = 25000;
const ENVELOPE_FPS = 30;
const BAR_COUNT = 72;
const HISTORY_LIMIT = 16;
const CANVAS_SIZE = 340;

const SILENT_WAV =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";

const IDLE_LINES = [
  "بگو، من دارم گوش می‌دم",
  "هر ایده‌ای داری با صدات بریز بیرون",
  "راحت و آروم صحبت کن",
  "من اینجام تا باهات حرف بزنم",
];

const STATUS_LABELS: Record<Status, string> = {
  connecting: "در حال آماده‌سازی...",
  listening: "دارم گوش می‌دم",
  thinking: "دارم فکر می‌کنم",
  speaking: "موبیکسا داره حرف می‌زنه",
  error: "مشکلی پیش اومد",
};

const PALETTES: Record<Status, RGB[]> = {
  connecting: [
    [139, 108, 255],
    [255, 122, 200],
    [94, 168, 255],
  ],
  listening: [
    [43, 200, 255],
    [124, 92, 255],
    [194, 123, 255],
  ],
  thinking: [
    [139, 108, 255],
    [255, 122, 200],
    [94, 168, 255],
  ],
  speaking: [
    [255, 111, 208],
    [154, 107, 255],
    [54, 217, 255],
  ],
  error: [
    [255, 93, 122],
    [180, 80, 160],
    [120, 90, 200],
  ],
};

/* =========================================================
   HELPERS
========================================================= */

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function rgba(color: RGB, alpha: number) {
  return `rgba(${Math.round(color[0])},${Math.round(
    color[1]
  )},${Math.round(color[2])},${alpha})`;
}

function mixColor(a: RGB, b: RGB, t: number): RGB {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

function toFaDigits(value: string) {
  const digits = "۰۱۲۳۴۵۶۷۸۹";

  return value.replace(/\d/g, (d) => digits[Number(d)]);
}

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;

  return toFaDigits(
    `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  );
}

/*
  متن را برای خواندن با صدا و نمایش تمیز می‌کند
  (بدون مارک‌داون، لینک، کد و ایموجی).
*/
function cleanForSpeech(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[*_#>~|]+/g, " ")
    .replace(/^\s*[-•]\s+/gm, "")
    .replace(
      /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}✦]/gu,
      ""
    )
    .replace(/\s+/g, " ")
    .trim();
}

/*
  اولین جمله‌ی کامل را از متنِ در حال دریافت جدا می‌کند
  تا صدا زودتر شروع شود.
*/
function takeSentences(
  buffer: string,
  minLength: number
): { ready: string; rest: string } {
  for (let i = 0; i < buffer.length - 1; i++) {
    const ch = buffer[i];

    const isEnd =
      ch === "." ||
      ch === "!" ||
      ch === "?" ||
      ch === "؟" ||
      ch === "…" ||
      ch === "؛" ||
      ch === "\n";

    if (!isEnd) {
      continue;
    }

    if (ch !== "\n" && !/\s/.test(buffer[i + 1])) {
      continue;
    }

    const candidate = buffer.slice(0, i + 1);

    if (cleanForSpeech(candidate).length >= minLength) {
      return {
        ready: candidate,
        rest: buffer.slice(i + 1),
      };
    }
  }

  return { ready: "", rest: buffer };
}

function pickRecorderMime(): string {
  if (typeof MediaRecorder === "undefined") {
    return "";
  }

  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];

  for (const type of candidates) {
    try {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    } catch {
      // ignore
    }
  }

  return "";
}

/* =========================================================
   ICONS
========================================================= */

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect
        x="9"
        y="3"
        width="6"
        height="11"
        rx="3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
      />
      <path
        d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MicOffIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M15 9.3V6a3 3 0 0 0-5.9-.8M9 9v2a3 3 0 0 0 4.6 2.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
      <path
        d="M5.5 11.5a6.5 6.5 0 0 0 10.4 5.2M18.5 11.5c0 .8-.1 1.5-.4 2.2M12 18v3M4 4l16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

function EndIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6 6l12 12M18 6 6 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* =========================================================
   COMPONENT
========================================================= */

export default function LiveVoice({
  history,
  onTurn,
  onClose,
}: LiveVoiceProps) {
  const [status, setStatus] = useState<Status>("connecting");
  const [muted, setMuted] = useState(false);
  const [closing, setClosing] = useState(false);
  const [userText, setUserText] = useState("");
  const [aiText, setAiText] = useState("");
  const [notice, setNotice] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [needTap, setNeedTap] = useState(false);
  const [lineIndex, setLineIndex] = useState(0);
  const [seconds, setSeconds] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const captionRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const statusRef = useRef<Status>("connecting");
  const mutedRef = useRef(false);
  const closingRef = useRef(false);

  const historyRef = useRef<LiveHistoryItem[]>(
    history.slice(-HISTORY_LIMIT)
  );

  const onTurnRef = useRef(onTurn);
  const onCloseRef = useRef(onClose);

  const actionsRef = useRef({
    orbTap: () => {},
    toggleMute: () => {},
    retry: () => {},
    shutdown: () => {},
  });

  useEffect(() => {
    onTurnRef.current = onTurn;
    onCloseRef.current = onClose;
  });

  /* ---------- زمان مکالمه ---------- */

  const timerPaused =
    status === "connecting" || status === "error";

  useEffect(() => {
    if (timerPaused) {
      return;
    }

    const id = window.setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);

    return () => {
      window.clearInterval(id);
    };
  }, [timerPaused]);

  /* ---------- جمله‌های انگیزشی در حالت گوش دادن ---------- */

  useEffect(() => {
    if (status !== "listening") {
      return;
    }

    const id = window.setInterval(() => {
      setLineIndex((i) => (i + 1) % IDLE_LINES.length);
    }, 4500);

    return () => {
      window.clearInterval(id);
    };
  }, [status]);

  /* ---------- اسکرول خودکار متن ---------- */

  useEffect(() => {
    const el = captionRef.current;

    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [aiText, userText]);

  /* =======================================================
     MAIN ENGINE
  ======================================================= */

  useEffect(() => {
    let disposed = false;
    let raf = 0;
    let frame = 0;

    let stream: MediaStream | null = null;
    let micAnalyser: AnalyserNode | null = null;
    let micSource: MediaStreamAudioSourceNode | null = null;
    let timeBuf = new Uint8Array(0);
    let freqBuf = new Uint8Array(0);

    let recorder: MediaRecorder | null = null;
    let chunks: Blob[] = [];
    const recorderMime = pickRecorderMime();

    let wakeLock: { release: () => Promise<void> } | null = null;

    let turnId = 0;
    let abortCtrl: AbortController | null = null;
    let ttsFailures = 0;
    let playSeq = 0;
    let stopCurrent: (() => void) | null = null;
    let tapPlay: (() => void) | null = null;
    let envelope: Float32Array | null = null;
    let synthSpeaking = false;
    let noticeTimer = 0;

    /* VAD */
    let noise = 0.01;
    let calibFrames = 0;
    let calibSum = 0;
    let threshold = 0.03;
    let loudFrames = 0;
    let speaking = false;
    let speechStart = 0;
    let lastVoice = 0;
    let listenStart = 0;
    let micLevel = 0;

    /* Visuals */
    let lvl = 0;
    let rot = 0;
    const colors: RGB[] = PALETTES.connecting.map(
      (c) => [c[0], c[1], c[2]] as RGB
    );

    /* ---------- Audio context (ساخته می‌شود در همان لحظه‌ی لمس) ---------- */

    const AudioCtor: typeof AudioContext =
      window.AudioContext ||
      (
        window as unknown as {
          webkitAudioContext: typeof AudioContext;
        }
      ).webkitAudioContext;

    const actx = new AudioCtor();

    void actx.resume().catch(() => undefined);

    /* ---------- Audio element برای پخش صدای هوش مصنوعی ---------- */

    const audio = new Audio();
    audio.preload = "auto";
    audio.setAttribute("playsinline", "true");
    audioRef.current = audio;

    /*
      پخش یک صدای خالی برای باز شدن قفل پخش صدا در مرورگرها (به‌خصوص iOS)
    */
    audio.src = SILENT_WAV;
    void audio.play().catch(() => undefined);

    /* ---------- State helpers ---------- */

    function setStatusSafe(next: Status) {
      statusRef.current = next;

      if (!disposed) {
        setStatus(next);
      }
    }

    function showNotice(message: string) {
      if (disposed) {
        return;
      }

      setNotice(message);

      window.clearTimeout(noticeTimer);

      noticeTimer = window.setTimeout(() => {
        setNotice("");
      }, 3800);
    }

    /* ---------- Wake lock ---------- */

    try {
      const wl = (
        navigator as unknown as {
          wakeLock?: {
            request: (
              type: "screen"
            ) => Promise<{ release: () => Promise<void> }>;
          };
        }
      ).wakeLock;

      if (wl) {
        wl.request("screen")
          .then((lock) => {
            if (disposed) {
              void lock.release().catch(() => undefined);
            } else {
              wakeLock = lock;
            }
          })
          .catch(() => undefined);
      }
    } catch {
      // ignore
    }

    /* =====================================================
       RECORDER
    ===================================================== */

    function startRecorder(): boolean {
      if (!stream) {
        return false;
      }

      try {
        chunks = [];

        const rec = recorderMime
          ? new MediaRecorder(stream, { mimeType: recorderMime })
          : new MediaRecorder(stream);

        rec.ondataavailable = (event: BlobEvent) => {
          if (event.data && event.data.size > 0) {
            chunks.push(event.data);
          }
        };

        rec.start(200);
        recorder = rec;

        return true;
      } catch (error) {
        console.error("RECORDER_START_ERROR:", error);
        return false;
      }
    }

    function discardRecorder() {
      const rec = recorder;
      recorder = null;

      if (rec) {
        rec.onstop = null;
        rec.ondataavailable = null;

        try {
          if (rec.state !== "inactive") {
            rec.stop();
          }
        } catch {
          // ignore
        }
      }

      chunks = [];
    }

    function resetVad() {
      speaking = false;
      loudFrames = 0;
      listenStart = performance.now();
    }

    function beginListening() {
      if (disposed || !stream) {
        return;
      }

      discardRecorder();
      resetVad();

      if (!startRecorder()) {
        fatal(
          "ضبط صدا روی این مرورگر پشتیبانی نمی‌شود. مرورگر Chrome یا Safari جدید رو امتحان کن."
        );
        return;
      }

      setStatusSafe("listening");
    }

    function endUtterance() {
      const rec = recorder;
      recorder = null;

      if (!rec) {
        beginListening();
        return;
      }

      setStatusSafe("thinking");
      speaking = false;
      loudFrames = 0;

      rec.onstop = () => {
        const type = rec.mimeType || recorderMime || "audio/webm";
        const blob = new Blob(chunks, { type });
        chunks = [];

        void runTurn(blob);
      };

      try {
        rec.stop();
      } catch {
        beginListening();
      }
    }

    function finishSpeech() {
      const duration = lastVoice - speechStart;

      speaking = false;
      loudFrames = 0;

      if (duration < MIN_SPEECH_MS) {
        beginListening();
        return;
      }

      endUtterance();
    }

    /* =====================================================
       MIC ANALYSIS + VAD
    ===================================================== */

    function processMic() {
      if (!micAnalyser) {
        return;
      }

      micAnalyser.getByteTimeDomainData(timeBuf);
      micAnalyser.getByteFrequencyData(freqBuf);

      let sum = 0;

      for (let i = 0; i < timeBuf.length; i++) {
        const x = (timeBuf[i] - 128) / 128;
        sum += x * x;
      }

      const rms = Math.sqrt(sum / timeBuf.length);

      if (mutedRef.current) {
        micLevel *= 0.9;
        return;
      }

      const now = performance.now();

      if (calibFrames < 40) {
        calibSum += rms;
        calibFrames += 1;
        noise = Math.min(0.025, calibSum / calibFrames);
      }

      threshold = Math.max(0.022, noise * 2.6 + 0.012);

      const loud = rms > threshold;

      if (!loud && !speaking) {
        noise = Math.min(0.025, noise * 0.99 + rms * 0.01);
      }

      micLevel = clamp((rms - noise) / 0.16, 0, 1);

      if (loud) {
        loudFrames += 1;
      } else {
        loudFrames = 0;
      }

      if (!speaking) {
        if (loudFrames >= 4) {
          speaking = true;
          speechStart = now - 70;
          lastVoice = now;
        } else if (now - listenStart > NO_SPEECH_RESET_MS) {
          beginListening();
        }

        return;
      }

      if (loud) {
        lastVoice = now;
      }

      if (
        now - lastVoice > SILENCE_END_MS ||
        now - speechStart > MAX_UTTERANCE_MS
      ) {
        finishSpeech();
      }
    }

    /* =====================================================
       TTS + PLAYBACK
    ===================================================== */

    async function fetchTts(
      text: string,
      signal: AbortSignal
    ): Promise<TtsItem> {
      if (ttsFailures >= 2) {
        return { text, blob: null };
      }

      try {
        const response = await fetch("/api/voice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
          signal,
        });

        if (!response.ok) {
          throw new Error(`TTS ${response.status}`);
        }

        const blob = await response.blob();

        if (blob.size < 200) {
          throw new Error("TTS empty");
        }

        ttsFailures = 0;

        return { text, blob };
      } catch (error) {
        if (!signal.aborted) {
          ttsFailures += 1;
          console.error("LIVE_TTS_ERROR:", error);
        }

        return { text, blob: null };
      }
    }

    async function computeEnvelope(
      blob: Blob
    ): Promise<Float32Array | null> {
      try {
        const buffer = await blob.arrayBuffer();
        const decoded = await actx.decodeAudioData(buffer);
        const channel = decoded.getChannelData(0);

        const hop = Math.max(
          1,
          Math.floor(decoded.sampleRate / ENVELOPE_FPS)
        );

        const count = Math.ceil(channel.length / hop);
        const env = new Float32Array(count);

        let max = 0.0001;

        for (let i = 0; i < count; i++) {
          const from = i * hop;
          const to = Math.min(channel.length, from + hop);

          let sum = 0;
          let n = 0;

          for (let j = from; j < to; j += 2) {
            sum += channel[j] * channel[j];
            n += 1;
          }

          const value = n ? Math.sqrt(sum / n) : 0;
          env[i] = value;

          if (value > max) {
            max = value;
          }
        }

        for (let i = 0; i < count; i++) {
          env[i] = Math.min(1, env[i] / (max * 0.85));
        }

        return env;
      } catch {
        return null;
      }
    }

    function playBlob(blob: Blob): Promise<void> {
      return new Promise<void>((resolve) => {
        const url = URL.createObjectURL(blob);
        const myPlay = ++playSeq;
        let finished = false;

        envelope = null;

        const finish = () => {
          if (finished) {
            return;
          }

          finished = true;
          audio.onended = null;
          audio.onerror = null;

          try {
            audio.pause();
          } catch {
            // ignore
          }

          URL.revokeObjectURL(url);

          if (stopCurrent === finish) {
            stopCurrent = null;
          }

          tapPlay = null;
          envelope = null;

          if (!disposed) {
            setNeedTap(false);
          }

          resolve();
        };

        stopCurrent = finish;

        audio.onended = finish;
        audio.onerror = finish;
        audio.src = url;

        void computeEnvelope(blob).then((env) => {
          if (myPlay === playSeq && !finished) {
            envelope = env;
          }
        });

        audio.play().catch((error: unknown) => {
          const name =
            error instanceof Error ? error.name : "";

          if (name === "NotAllowedError") {
            tapPlay = () => {
              audio
                .play()
                .then(() => {
                  if (!disposed) {
                    setNeedTap(false);
                  }
                })
                .catch(finish);
            };

            if (!disposed) {
              setNeedTap(true);
            }
          } else {
            finish();
          }
        });
      });
    }

    /*
      اگر ElevenLabs جواب نداد، از صدای خود مرورگر استفاده می‌شود
      (اگر صدای فارسی داشته باشد). در غیر این صورت متن فقط نمایش داده می‌شود.
    */
    function speakFallback(text: string): Promise<void> {
      return new Promise<void>((resolve) => {
        let done = false;
        let timer = 0;

        const finish = () => {
          if (done) {
            return;
          }

          done = true;
          window.clearTimeout(timer);
          synthSpeaking = false;

          if (stopCurrent === finish) {
            stopCurrent = null;
          }

          resolve();
        };

        stopCurrent = finish;
        synthSpeaking = true;

        const synth = window.speechSynthesis;

        const voice = synth
          ? synth
              .getVoices()
              .find((v) => v.lang.toLowerCase().startsWith("fa"))
          : undefined;

        if (!synth || !voice) {
          timer = window.setTimeout(
            finish,
            Math.min(7000, 700 + text.length * 55)
          );
          return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = voice;
        utterance.lang = voice.lang;
        utterance.onend = finish;
        utterance.onerror = finish;

        timer = window.setTimeout(finish, 60000);

        try {
          synth.speak(utterance);
        } catch {
          finish();
        }
      });
    }

    async function playItem(item: TtsItem) {
      setStatusSafe("speaking");

      if (item.blob) {
        await playBlob(item.blob);
      } else {
        await speakFallback(item.text);
      }
    }

    /* =====================================================
       ONE FULL TURN: STT → CHAT → TTS
    ===================================================== */

    async function runTurn(blob: Blob) {
      const myTurn = ++turnId;
      const ctrl = new AbortController();
      abortCtrl = ctrl;

      const alive = () => !disposed && turnId === myTurn;

      let heardText = "";
      let fullText = "";
      let recorded = false;

      const record = () => {
        if (recorded) {
          return;
        }

        recorded = true;

        const reply = cleanForSpeech(fullText);

        if (heardText && reply) {
          historyRef.current = [
            ...historyRef.current,
            { role: "user" as const, content: heardText },
            { role: "assistant" as const, content: reply },
          ].slice(-HISTORY_LIMIT);

          onTurnRef.current(heardText, reply);
        }
      };

      try {
        /* ---------- 1) صدا → متن ---------- */

        const sttResponse = await fetch("/api/live?lang=fa", {
          method: "POST",
          headers: {
            "Content-Type": blob.type || "audio/webm",
          },
          body: blob,
          signal: ctrl.signal,
        });

        const sttData = (await sttResponse
          .json()
          .catch(() => null)) as {
          transcript?: string;
          error?: string;
        } | null;

        if (!alive()) {
          return;
        }

        if (!sttResponse.ok) {
          throw new Error(
            sttData?.error || "تشخیص صدا انجام نشد."
          );
        }

        heardText = (sttData?.transcript || "").trim();

        if (heardText.length < 2) {
          beginListening();
          return;
        }

        setUserText(heardText);
        setAiText("");

        /* ---------- 2) متن → جواب هوش مصنوعی ---------- */

        const chatResponse = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: ctrl.signal,
          body: JSON.stringify({
            message: VOICE_PREFIX + heardText,
            history: historyRef.current,
            image: null,
          }),
        });

        if (!chatResponse.ok) {
          let message = "سرویس هوش مصنوعی در دسترس نیست.";

          try {
            const data = await chatResponse.json();

            if (data && typeof data.error === "string") {
              message = data.error;
            }
          } catch {
            // ignore
          }

          throw new Error(message);
        }

        if (!chatResponse.body) {
          throw new Error("پاسخی از سرویس دریافت نشد.");
        }

        /* ---------- 3) جواب → صدا (جمله به جمله) ---------- */

        const items: Promise<TtsItem>[] = [];
        let pending = "";
        let finished = false;
        let started = false;
        let playerPromise: Promise<void> = Promise.resolve();

        const runPlayer = async () => {
          let index = 0;

          while (alive()) {
            if (index < items.length) {
              const item = await items[index];
              index += 1;

              if (!alive()) {
                return;
              }

              await playItem(item);
            } else if (finished) {
              return;
            } else {
              await sleep(40);
            }
          }
        };

        const enqueue = (raw: string) => {
          const clean = cleanForSpeech(raw);

          if (!clean) {
            return;
          }

          items.push(fetchTts(clean, ctrl.signal));

          if (!started) {
            started = true;
            playerPromise = runPlayer();
          }
        };

        const reader = chatResponse.body.getReader();
        const decoder = new TextDecoder("utf-8");

        while (true) {
          const { value, done } = await reader.read();

          if (done) {
            break;
          }

          if (!alive()) {
            try {
              await reader.cancel();
            } catch {
              // ignore
            }

            break;
          }

          if (!value) {
            continue;
          }

          const chunk = decoder.decode(value, { stream: true });

          if (!chunk) {
            continue;
          }

          fullText += chunk;
          pending += chunk;

          setAiText(cleanForSpeech(fullText));

          for (;;) {
            const taken = takeSentences(
              pending,
              items.length === 0 ? 14 : 45
            );

            if (!taken.ready) {
              break;
            }

            enqueue(taken.ready);
            pending = taken.rest;
          }
        }

        if (alive() && pending.trim()) {
          enqueue(pending);
          pending = "";
        }

        finished = true;

        await playerPromise;

        if (!alive()) {
          return;
        }

        if (!cleanForSpeech(fullText)) {
          showNotice("جوابی دریافت نشد. دوباره بگو.");
        }

        record();
        beginListening();
      } catch (error) {
        if (!alive()) {
          return;
        }

        console.error("LIVE_TURN_ERROR:", error);

        const raw = error instanceof Error ? error.message : "";

        const message = /failed to fetch|network|load failed/i.test(
          raw
        )
          ? "ارتباط با سرور برقرار نشد. اینترنتت رو چک کن."
          : raw || "یه مشکلی پیش اومد. دوباره امتحان کن.";

        showNotice(message);
        beginListening();
      } finally {
        record();

        if (abortCtrl === ctrl) {
          abortCtrl = null;
        }
      }
    }

    /* =====================================================
       ACTIONS
    ===================================================== */

    function interrupt() {
      turnId += 1;

      if (abortCtrl) {
        abortCtrl.abort();
        abortCtrl = null;
      }

      if (stopCurrent) {
        stopCurrent();
      }

      try {
        audio.pause();
      } catch {
        // ignore
      }

      try {
        window.speechSynthesis?.cancel();
      } catch {
        // ignore
      }

      synthSpeaking = false;
      envelope = null;
      tapPlay = null;

      if (!disposed) {
        setNeedTap(false);
      }
    }

    function orbTap() {
      void actx.resume().catch(() => undefined);

      if (tapPlay) {
        const play = tapPlay;
        tapPlay = null;
        play();
        return;
      }

      const current = statusRef.current;

      if (current === "speaking" || current === "thinking") {
        interrupt();
        beginListening();
        return;
      }

      if (current === "listening" && speaking) {
        finishSpeech();
      }
    }

    function toggleMute() {
      const next = !mutedRef.current;
      mutedRef.current = next;

      if (!disposed) {
        setMuted(next);
      }

      if (stream) {
        stream.getAudioTracks().forEach((track) => {
          track.enabled = !next;
        });
      }

      speaking = false;
      loudFrames = 0;
      listenStart = performance.now();
    }

    function releaseMic() {
      discardRecorder();

      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        stream = null;
      }

      if (micSource) {
        try {
          micSource.disconnect();
        } catch {
          // ignore
        }

        micSource = null;
      }

      micAnalyser = null;
    }

    function fatal(message: string) {
      releaseMic();
      interrupt();

      if (!disposed) {
        setErrorMsg(message);
      }

      setStatusSafe("error");
    }

    function shutdown() {
      if (disposed) {
        return;
      }

      interrupt();
      disposed = true;

      releaseMic();

      window.clearTimeout(noticeTimer);

      try {
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
      } catch {
        // ignore
      }

      if (wakeLock) {
        void wakeLock.release().catch(() => undefined);
        wakeLock = null;
      }
    }

    /* =====================================================
       INIT (میکروفون)
    ===================================================== */

    async function init() {
      setStatusSafe("connecting");

      if (!disposed) {
        setErrorMsg("");
      }

      try {
        if (
          !navigator.mediaDevices ||
          typeof navigator.mediaDevices.getUserMedia !== "function"
        ) {
          throw new Error("NO_MEDIA");
        }

        if (typeof MediaRecorder === "undefined") {
          throw new Error("NO_RECORDER");
        }

        const media = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        if (disposed) {
          media.getTracks().forEach((track) => track.stop());
          return;
        }

        stream = media;

        if (mutedRef.current) {
          media.getAudioTracks().forEach((track) => {
            track.enabled = false;
          });
        }

        void actx.resume().catch(() => undefined);

        micSource = actx.createMediaStreamSource(media);

        const analyser = actx.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.6;

        micSource.connect(analyser);

        micAnalyser = analyser;
        timeBuf = new Uint8Array(analyser.fftSize);
        freqBuf = new Uint8Array(analyser.frequencyBinCount);

        calibFrames = 0;
        calibSum = 0;

        await sleep(900);

        if (disposed) {
          return;
        }

        beginListening();
      } catch (error) {
        console.error("LIVE_INIT_ERROR:", error);

        const name =
          error instanceof Error ? error.name : "";

        const text = error instanceof Error ? error.message : "";

        if (
          name === "NotAllowedError" ||
          name === "SecurityError"
        ) {
          fatal(
            "دسترسی به میکروفون داده نشد. از تنظیمات مرورگر، اجازه‌ی میکروفون رو برای این سایت فعال کن و دوباره امتحان کن."
          );
        } else if (
          name === "NotFoundError" ||
          name === "OverconstrainedError"
        ) {
          fatal("میکروفونی روی دستگاهت پیدا نشد.");
        } else if (text === "NO_MEDIA") {
          fatal(
            "این مرورگر به میکروفون دسترسی نمی‌ده. سایت باید با HTTPS باز بشه."
          );
        } else if (text === "NO_RECORDER") {
          fatal(
            "ضبط صدا روی این مرورگر پشتیبانی نمی‌شود. Chrome یا Safari جدید رو امتحان کن."
          );
        } else {
          fatal("راه‌اندازی میکروفون انجام نشد. دوباره امتحان کن.");
        }
      }
    }

    actionsRef.current = {
      orbTap,
      toggleMute,
      retry: () => {
        void init();
      },
      shutdown,
    };

    /* =====================================================
       CANVAS DRAWING
    ===================================================== */

    const canvas = canvasRef.current;
    const g = canvas ? canvas.getContext("2d") : null;

    if (canvas && g) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(CANVAS_SIZE * dpr);
      canvas.height = Math.round(CANVAS_SIZE * dpr);

      g.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function aiLevel(t: number): number {
      if (synthSpeaking) {
        return (
          0.34 +
          0.26 * Math.sin(t / 110) * Math.sin(t / 330)
        );
      }

      if (audio.paused) {
        return 0.05;
      }

      if (envelope && envelope.length > 0) {
        const index = Math.min(
          envelope.length - 1,
          Math.floor(audio.currentTime * ENVELOPE_FPS)
        );

        return envelope[index] || 0;
      }

      return (
        0.34 + 0.26 * Math.sin(t / 110) * Math.sin(t / 330)
      );
    }

    function draw(t: number) {
      if (!g) {
        return;
      }

      const st = statusRef.current;
      const target = PALETTES[st];

      for (let k = 0; k < 3; k++) {
        for (let j = 0; j < 3; j++) {
          colors[k][j] += (target[k][j] - colors[k][j]) * 0.06;
        }
      }

      let tgt = 0.04;

      if (st === "listening") {
        tgt = mutedRef.current ? 0.02 : micLevel;
      } else if (st === "speaking") {
        tgt = aiLevel(t);
      } else if (st === "thinking") {
        tgt = 0.16 + 0.07 * Math.sin(t / 240);
      } else if (st === "connecting") {
        tgt = 0.1 + 0.05 * Math.sin(t / 300);
      }

      lvl += (tgt - lvl) * (tgt > lvl ? 0.35 : 0.12);
      rot += 0.003 + lvl * 0.01;

      const cx = CANVAS_SIZE / 2;
      const cy = CANVAS_SIZE / 2;
      const baseR = 62;
      const ringR = baseR + 34;

      g.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      /* --- هاله‌ی بیرونی --- */

      g.globalCompositeOperation = "source-over";

      const halo = g.createRadialGradient(
        cx,
        cy,
        baseR * 0.4,
        cx,
        cy,
        CANVAS_SIZE / 2
      );

      halo.addColorStop(0, rgba(colors[1], 0.1 + lvl * 0.28));
      halo.addColorStop(1, rgba(colors[1], 0));

      g.fillStyle = halo;
      g.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      /* --- لکه‌های نورانی چرخان --- */

      g.globalCompositeOperation = "lighter";

      for (let k = 0; k < 3; k++) {
        const angle =
          (t / 1800) * (k % 2 ? -1 : 1) + k * 2.1;

        const dist = 16 + lvl * 28;
        const bx = cx + Math.cos(angle) * dist;
        const by = cy + Math.sin(angle) * dist;
        const radius = baseR * (0.95 + lvl * 0.45);

        const blob = g.createRadialGradient(
          bx,
          by,
          0,
          bx,
          by,
          radius
        );

        blob.addColorStop(0, rgba(colors[k], 0.85));
        blob.addColorStop(1, rgba(colors[k], 0));

        g.fillStyle = blob;
        g.beginPath();
        g.arc(bx, by, radius, 0, Math.PI * 2);
        g.fill();
      }

      /* --- هسته‌ی روشن --- */

      const coreR = baseR * 0.55 * (1 + lvl * 0.3);

      const core = g.createRadialGradient(cx, cy, 0, cx, cy, coreR);

      core.addColorStop(0, "rgba(255,255,255,0.55)");
      core.addColorStop(1, "rgba(255,255,255,0)");

      g.fillStyle = core;
      g.beginPath();
      g.arc(cx, cy, coreR, 0, Math.PI * 2);
      g.fill();

      /* --- حلقه‌ی نوارهای صوتی --- */

      g.globalCompositeOperation = "source-over";
      g.lineCap = "round";
      g.lineWidth = 3;

      const half = BAR_COUNT / 2;
      const useMic =
        st === "listening" &&
        !mutedRef.current &&
        freqBuf.length > 0;

      for (let i = 0; i < BAR_COUNT; i++) {
        const j = i < half ? i : BAR_COUNT - 1 - i;

        let a: number;

        if (useMic) {
          const bin = 2 + Math.floor((j / half) * 38);
          const v = (freqBuf[bin] || 0) / 255;

          a = Math.min(1, Math.pow(v, 1.4) * 1.5) * 0.8 + lvl * 0.2;
        } else if (st === "thinking" || st === "connecting") {
          a = 0.16 + 0.12 * Math.sin(i * 0.5 - t / 180);
        } else if (st === "speaking") {
          const w =
            0.5 +
            0.5 *
              Math.sin(j * 0.8 + t / 130) *
              Math.sin(j * 0.35 - t / 260);

          a = lvl * (0.35 + 0.65 * w) + 0.04;
        } else {
          a = 0.06 + 0.03 * Math.sin(i * 0.4 + t / 400);
        }

        a = clamp(a, 0, 1);

        const len = 3 + a * 46;
        const ang = (i / BAR_COUNT) * Math.PI * 2 + rot - Math.PI / 2;

        const x0 = cx + Math.cos(ang) * ringR;
        const y0 = cy + Math.sin(ang) * ringR;
        const x1 = cx + Math.cos(ang) * (ringR + len);
        const y1 = cy + Math.sin(ang) * (ringR + len);

        const pos = (i / BAR_COUNT) * 3;
        const k = Math.floor(pos) % 3;
        const color = mixColor(
          colors[k],
          colors[(k + 1) % 3],
          pos - Math.floor(pos)
        );

        g.strokeStyle = rgba(color, 0.5 + a * 0.5);
        g.beginPath();
        g.moveTo(x0, y0);
        g.lineTo(x1, y1);
        g.stroke();
      }

      /* --- حلقه‌ی باریک و کمان چرخان --- */

      g.lineWidth = 1.2;
      g.strokeStyle = "rgba(255,255,255,0.14)";
      g.beginPath();
      g.arc(cx, cy, ringR - 10, 0, Math.PI * 2);
      g.stroke();

      if (st === "thinking" || st === "connecting") {
        g.lineWidth = 3;
        g.strokeStyle = rgba(colors[2], 0.9);
        g.beginPath();
        g.arc(
          cx,
          cy,
          ringR - 10,
          t / 280,
          t / 280 + 1.3
        );
        g.stroke();
      }
    }

    function loop(t: number) {
      raf = requestAnimationFrame(loop);
      frame += 1;

      if (frame % 45 === 0 && actx.state === "suspended") {
        void actx.resume().catch(() => undefined);
      }

      if (micAnalyser && statusRef.current === "listening") {
        processMic();
      } else {
        micLevel *= 0.85;
      }

      draw(t);
    }

    raf = requestAnimationFrame(loop);

    void init();

    return () => {
      shutdown();
      cancelAnimationFrame(raf);
      void actx.close().catch(() => undefined);
    };
  }, []);

  /* =======================================================
     UI
  ======================================================= */

  function requestClose() {
    if (closingRef.current) {
      return;
    }

    closingRef.current = true;
    setClosing(true);

    actionsRef.current.shutdown();

    window.setTimeout(() => {
      onCloseRef.current();
    }, 430);
  }

  let hint = "";

  if (status === "listening") {
    hint = muted
      ? "میکروفون بی‌صداست"
      : IDLE_LINES[lineIndex % IDLE_LINES.length];
  } else if (status === "thinking") {
    hint = "یه لحظه...";
  } else if (status === "speaking") {
    hint = "برای قطع کردن، روی دایره بزن";
  } else if (status === "connecting") {
    hint = "میکروفون در حال روشن شدنه";
  }

  if (needTap) {
    hint = "برای شنیدن پاسخ، روی دایره بزن";
  }

  return (
    <div
      className={`lv-root st-${status}${closing ? " closing" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="مکالمه‌ی صوتی زنده"
    >
      <div className="lv-bg" aria-hidden="true">
        <span className="lv-blob lv-b1" />
        <span className="lv-blob lv-b2" />
        <span className="lv-blob lv-b3" />
      </div>

      <header className="lv-top">
        <div className="lv-badge">
          <i className="lv-dot" />
          <span>مکالمه‌ی زنده</span>
        </div>

        <div className="lv-time" dir="ltr">
          {formatTime(seconds)}
        </div>
      </header>

      <main className="lv-stage">
        <button
          type="button"
          className="lv-orb"
          onClick={() => actionsRef.current.orbTap()}
          aria-label="دایره‌ی مکالمه؛ برای قطع کردن صحبت یا ارسال سریع لمس کن"
          disabled={status === "error"}
        >
          <canvas ref={canvasRef} />
        </button>

        {status === "error" ? (
          <div className="lv-error">
            <p>{errorMsg}</p>

            <button
              type="button"
              className="lv-retry"
              onClick={() => actionsRef.current.retry()}
            >
              تلاش دوباره
            </button>
          </div>
        ) : (
          <>
            <div className="lv-status" key={status} aria-live="polite">
              {STATUS_LABELS[status]}
            </div>

            <div className="lv-hint" key={hint}>
              {hint}
            </div>
          </>
        )}

        {(userText || aiText) && status !== "error" && (
          <div className="lv-captions" ref={captionRef}>
            {userText && <p className="lv-user">{userText}</p>}
            {aiText && <p className="lv-ai">{aiText}</p>}
          </div>
        )}
      </main>

      {notice && <div className="lv-notice">{notice}</div>}

      <footer className="lv-controls">
        <div className="lv-ctl">
          <button
            type="button"
            className={`lv-btn lv-mute${muted ? " on" : ""}`}
            onClick={() => actionsRef.current.toggleMute()}
            aria-pressed={muted}
            aria-label={
              muted ? "روشن کردن میکروفون" : "بی‌صدا کردن میکروفون"
            }
            disabled={status === "error"}
          >
            {muted ? <MicOffIcon /> : <MicIcon />}
          </button>

          <span>{muted ? "روشن کردن" : "بی‌صدا"}</span>
        </div>

        <div className="lv-ctl">
          <button
            type="button"
            className="lv-btn lv-end"
            onClick={requestClose}
            aria-label="پایان مکالمه"
          >
            <EndIcon />
          </button>

          <span>پایان</span>
        </div>
      </footer>

      <style jsx global>{`
        .lv-root {
          --c1: #8b6cff;
          --c2: #ff7ac8;
          --c3: #5ea8ff;
          position: fixed;
          inset: 0;
          z-index: 9999;
          height: 100vh;
          height: 100dvh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          direction: rtl;
          text-align: center;
          color: #fff;
          overflow: hidden;
          font-family: Tahoma, Arial, sans-serif;
          -webkit-font-smoothing: antialiased;
          padding: calc(env(safe-area-inset-top, 0px) + 16px) 20px
            calc(env(safe-area-inset-bottom, 0px) + 22px);
          background: radial-gradient(
            120% 70% at 50% -10%,
            #34208a 0%,
            #170f40 52%,
            #0a0720 100%
          );
          animation: lvReveal 0.85s cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }

        .lv-root.st-listening {
          --c1: #2bc8ff;
          --c2: #7c5cff;
          --c3: #c27bff;
        }

        .lv-root.st-thinking,
        .lv-root.st-connecting {
          --c1: #8b6cff;
          --c2: #ff7ac8;
          --c3: #5ea8ff;
        }

        .lv-root.st-speaking {
          --c1: #ff6fd0;
          --c2: #9a6bff;
          --c3: #36d9ff;
        }

        .lv-root.st-error {
          --c1: #ff5d7a;
          --c2: #7c5cff;
          --c3: #c27bff;
        }

        .lv-root.closing {
          pointer-events: none;
          animation: lvHide 0.42s cubic-bezier(0.5, 0, 0.8, 0.4) forwards;
        }

        .lv-root button {
          font: inherit;
          -webkit-tap-highlight-color: transparent;
        }

        /* ---------- Background ---------- */

        .lv-bg {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
        }

        .lv-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          opacity: 0.38;
          will-change: transform;
          transition: background-color 1.2s ease;
        }

        .lv-b1 {
          width: 380px;
          height: 380px;
          left: -140px;
          top: 8%;
          background-color: var(--c1);
          animation: lvDriftA 14s ease-in-out infinite alternate;
        }

        .lv-b2 {
          width: 360px;
          height: 360px;
          right: -150px;
          top: 42%;
          background-color: var(--c2);
          animation: lvDriftB 17s ease-in-out infinite alternate;
        }

        .lv-b3 {
          width: 300px;
          height: 300px;
          left: 22%;
          bottom: -130px;
          opacity: 0.28;
          background-color: var(--c3);
          animation: lvDriftA 20s ease-in-out infinite alternate-reverse;
        }

        /* ---------- Top ---------- */

        .lv-top {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 560px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          animation: lvFadeDown 0.7s ease 0.35s both;
        }

        .lv-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 14px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.18);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .lv-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #ff5d7a;
          animation: lvPulseDot 1.6s ease-out infinite;
        }

        .lv-time {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.7);
          font-variant-numeric: tabular-nums;
        }

        /* ---------- Stage ---------- */

        .lv-stage {
          position: relative;
          z-index: 2;
          flex: 1;
          min-height: 0;
          width: 100%;
          max-width: 560px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .lv-orb {
          position: relative;
          width: min(86vw, 360px);
          aspect-ratio: 1;
          padding: 0;
          border: 0;
          border-radius: 50%;
          background: transparent;
          cursor: pointer;
          flex-shrink: 0;
          animation: lvOrbIn 1.1s cubic-bezier(0.2, 0.9, 0.2, 1) 0.25s both;
        }

        .lv-orb:disabled {
          cursor: default;
          opacity: 0.6;
        }

        .lv-orb canvas {
          width: 100%;
          height: 100%;
          display: block;
        }

        .lv-status {
          margin-top: -8px;
          font-size: 21px;
          font-weight: 700;
          background: linear-gradient(90deg, #fff, #d9ccff, #fff);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
          animation: lvTextIn 0.5s ease both;
        }

        .lv-hint {
          min-height: 20px;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.64);
          animation: lvTextIn 0.6s ease both;
        }

        .lv-captions {
          width: 100%;
          max-height: 24vh;
          margin-top: 10px;
          padding: 14px 6px 0;
          overflow-y: auto;
          scrollbar-width: none;
          -webkit-mask-image: linear-gradient(
            to bottom,
            transparent 0,
            #000 24%
          );
          mask-image: linear-gradient(to bottom, transparent 0, #000 24%);
        }

        .lv-captions::-webkit-scrollbar {
          display: none;
        }

        .lv-captions p {
          margin: 0 0 8px;
          animation: lvTextIn 0.4s ease both;
        }

        .lv-user {
          font-size: 13px;
          line-height: 1.8;
          color: rgba(160, 222, 255, 0.82);
        }

        .lv-ai {
          font-size: 15px;
          line-height: 1.95;
          color: rgba(255, 255, 255, 0.95);
        }

        .lv-error {
          max-width: 360px;
          padding: 0 8px;
          animation: lvTextIn 0.5s ease both;
        }

        .lv-error p {
          margin: 0 0 14px;
          font-size: 14px;
          line-height: 1.9;
          color: rgba(255, 255, 255, 0.86);
        }

        .lv-retry {
          padding: 11px 24px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          background: rgba(255, 255, 255, 0.14);
          color: #fff;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
        }

        /* ---------- Notice ---------- */

        .lv-notice {
          position: relative;
          z-index: 3;
          max-width: 92%;
          margin-bottom: 14px;
          padding: 9px 16px;
          border-radius: 14px;
          font-size: 12.5px;
          line-height: 1.7;
          background: rgba(255, 93, 122, 0.2);
          border: 1px solid rgba(255, 140, 160, 0.4);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          animation: lvTextIn 0.35s ease both;
        }

        /* ---------- Controls ---------- */

        .lv-controls {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          gap: 34px;
          animation: lvFadeUp 0.7s ease 0.5s both;
        }

        .lv-ctl {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          font-size: 11.5px;
          color: rgba(255, 255, 255, 0.7);
        }

        .lv-btn {
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.11);
          color: #fff;
          cursor: pointer;
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          transition: transform 0.2s ease, background 0.25s ease;
        }

        .lv-btn svg {
          width: 25px;
          height: 25px;
        }

        .lv-btn:active {
          transform: scale(0.92);
        }

        .lv-btn:disabled {
          opacity: 0.4;
          cursor: default;
        }

        .lv-mute.on {
          background: #fff;
          color: #2a1a6e;
        }

        .lv-end {
          border-color: rgba(255, 255, 255, 0.35);
          background: linear-gradient(145deg, #ff6b88, #e0245e);
          box-shadow: 0 8px 26px rgba(255, 70, 110, 0.5);
        }

        /* ---------- Keyframes ---------- */

        @keyframes lvReveal {
          from {
            clip-path: circle(0% at 50% calc(100% - 56px));
            opacity: 0.4;
          }
          to {
            clip-path: circle(150% at 50% calc(100% - 56px));
            opacity: 1;
          }
        }

        @keyframes lvHide {
          from {
            clip-path: circle(150% at 50% calc(100% - 56px));
            opacity: 1;
          }
          to {
            clip-path: circle(0% at 50% calc(100% - 56px));
            opacity: 0;
          }
        }

        @keyframes lvOrbIn {
          from {
            opacity: 0;
            transform: scale(0.25);
            filter: blur(14px);
          }
          to {
            opacity: 1;
            transform: scale(1);
            filter: blur(0);
          }
        }

        @keyframes lvDriftA {
          from {
            transform: translate3d(0, 0, 0) scale(1);
          }
          to {
            transform: translate3d(70px, 50px, 0) scale(1.15);
          }
        }

        @keyframes lvDriftB {
          from {
            transform: translate3d(0, 0, 0) scale(1.1);
          }
          to {
            transform: translate3d(-60px, -70px, 0) scale(0.95);
          }
        }

        @keyframes lvPulseDot {
          0% {
            box-shadow: 0 0 0 0 rgba(255, 93, 122, 0.7);
          }
          100% {
            box-shadow: 0 0 0 10px rgba(255, 93, 122, 0);
          }
        }

        @keyframes lvTextIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes lvFadeDown {
          from {
            opacity: 0;
            transform: translateY(-12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes lvFadeUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-height: 660px) {
          .lv-orb {
            width: min(68vw, 270px);
          }

          .lv-captions {
            max-height: 16vh;
          }

          .lv-btn {
            width: 52px;
            height: 52px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .lv-blob,
          .lv-dot {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
