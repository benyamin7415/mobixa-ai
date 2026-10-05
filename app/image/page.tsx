"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  image?: string | null;
};

type HistoryMessage = {
  role: "user" | "assistant";
  content: string;
};

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

/* =========================================================
   ICONS
========================================================= */

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
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="send-icon"
    >
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

function ImageUploadIcon() {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className="upload-icon"
    >
      <rect
        x="4"
        y="6"
        width="24"
        height="20"
        rx="5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />

      <circle
        cx="11"
        cy="12"
        r="2.3"
        fill="currentColor"
      />

      <path
        d="m7 23 6.5-6 4.5 4 3-3 4 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M22 9v7M18.5 12.5H25.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="m7 7 10 10M17 7 7 17"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* =========================================================
   COPY
========================================================= */

function copyWithFallback(text: string) {
  const area = document.createElement("textarea");

  area.value = text;
  area.style.position = "fixed";
  area.style.opacity = "0";
  area.style.pointerEvents = "none";

  document.body.appendChild(area);
  area.select();

  try {
    document.execCommand("copy");
  } catch {
    // کپی پشتیبانی نشد.
  }

  document.body.removeChild(area);
}

function CopyButton({
  text,
  className,
}: {
  text: string;
  className: string;
}) {
  const [copied, setCopied] = useState(false);

  const timerRef =
    useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(
          timerRef.current
        );
      }
    };
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(
        text
      );
    } catch {
      copyWithFallback(text);
    }

    setCopied(true);

    if (timerRef.current) {
      window.clearTimeout(
        timerRef.current
      );
    }

    timerRef.current =
      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
  }

  return (
    <button
      type="button"
      className={`${className}${
        copied ? " copied" : ""
      }`}
      onClick={copy}
      aria-label="کپی"
    >
      {copied ? (
        <>
          <CheckIcon />
          <span>کپی شد</span>
        </>
      ) : (
        <>
          <CopyIcon />
          <span>کپی</span>
        </>
      )}
    </button>
  );
}

/* =========================================================
   CODE HIGHLIGHT
========================================================= */

const KEYWORDS = new Set([
  "const", "let", "var", "function", "return",
  "if", "else", "for", "while", "do", "switch",
  "case", "break", "continue", "new", "class",
  "extends", "import", "from", "export",
  "default", "async", "await", "try", "catch",
  "finally", "throw", "typeof", "instanceof",
  "in", "of", "this", "super", "static",
  "public", "private", "protected", "interface",
  "type", "enum", "implements", "void",
  "def", "elif", "lambda", "pass", "with", "as",
  "is", "not", "and", "or", "yield", "global",
  "raise", "except", "del", "self",
  "None", "True", "False",
  "true", "false", "null", "undefined", "NaN",
  "fn", "mut", "pub", "use", "struct", "impl",
  "match", "func", "package", "defer", "go",
  "namespace", "using", "echo", "fi", "then",
  "done", "int", "string", "bool", "float",
  "double", "char", "long",
  "SELECT", "FROM", "WHERE", "INSERT", "INTO",
  "VALUES", "UPDATE", "DELETE", "CREATE",
  "TABLE", "JOIN", "ON", "ORDER", "BY",
  "GROUP", "LIMIT", "AND", "OR",
]);

const HASH_COMMENT_LANGUAGES = [
  "python", "py", "bash", "sh", "shell",
  "zsh", "yaml", "yml", "ruby", "rb",
  "toml", "dockerfile", "r", "perl",
];

const PLAIN_LANGUAGES = [
  "", "text", "txt", "plaintext",
  "markdown", "md", "prompt",
];

/*
  بلاک‌های متنی (پرامپت، کپشن، ایمیل و ...)
  باید خط‌به‌خط بشکنند و از کادر بیرون نزنند.
*/
const WRAP_LANGUAGES = [
  "text", "txt", "plaintext",
  "markdown", "md", "prompt",
];

const SLASH_PATTERN =
  /(\/\/.*|\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`)|(\b\d+(?:\.\d+)?\b)|(\b[A-Za-z_$][\w$]*\b)/g;

const HASH_PATTERN =
  /(#.*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')|(\b\d+(?:\.\d+)?\b)|(\b[A-Za-z_$][\w$]*\b)/g;

function highlightCode(
  code: string,
  language: string
): ReactNode[] {
  const lang = language.toLowerCase();

  if (
    PLAIN_LANGUAGES.includes(lang) ||
    code.length > 20000
  ) {
    return [code];
  }

  try {
    const base =
      HASH_COMMENT_LANGUAGES.includes(lang)
        ? HASH_PATTERN
        : SLASH_PATTERN;

    const pattern = new RegExp(
      base.source,
      "g"
    );

    const output: ReactNode[] = [];

    let last = 0;
    let key = 0;
    let match: RegExpExecArray | null;

    while (
      (match = pattern.exec(code)) !== null
    ) {
      if (match.index > last) {
        output.push(
          code.slice(last, match.index)
        );
      }

      const token = match[0];
      let tokenClass = "";

      if (match[1]) {
        tokenClass = "tk-comment";
      } else if (match[2]) {
        tokenClass = "tk-string";
      } else if (match[3]) {
        tokenClass = "tk-number";
      } else if (match[4]) {
        if (KEYWORDS.has(token)) {
          tokenClass = "tk-keyword";
        } else {
          let next = pattern.lastIndex;

          while (
            code[next] === " " ||
            code[next] === "\t"
          ) {
            next += 1;
          }

          if (code[next] === "(") {
            tokenClass = "tk-function";
          } else if (
            token.length > 1 &&
            /^[A-Z][A-Za-z0-9_]*$/.test(
              token
            )
          ) {
            tokenClass = "tk-type";
          }
        }
      }

      if (tokenClass) {
        output.push(
          <span
            key={key++}
            className={tokenClass}
          >
            {token}
          </span>
        );
      } else {
        output.push(token);
      }

      last = pattern.lastIndex;
    }

    if (last < code.length) {
      output.push(code.slice(last));
    }

    return output;
  } catch {
    return [code];
  }
}

/* =========================================================
   MARKDOWN
========================================================= */

function CodeBlock({
  code,
  language,
}: {
  code: string;
  language?: string;
}) {
  const nodes = useMemo(
    () =>
      highlightCode(
        code,
        language || ""
      ),
    [code, language]
  );

  const lang = (language || "").toLowerCase();

  const wrap = WRAP_LANGUAGES.includes(lang);

  return (
    <div className="code-block">
      <div className="code-header">
        <span className="code-language">
          {wrap ? "متن" : language || "code"}
        </span>

        <CopyButton
          text={code}
          className="code-copy"
        />
      </div>

      <pre className={wrap ? "wrap" : undefined}>
        <code dir={wrap ? "auto" : undefined}>
          {nodes}
        </code>
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
    /(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\(https?:\/\/[^\s)]+\))/g
  );

  return (
    <>
      {parts.map((part, index) => {
        if (
          part.startsWith("**") &&
          part.endsWith("**") &&
          part.length > 4
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
          part.endsWith("`") &&
          part.length > 2
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

        const link = part.match(
          /^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/
        );

        if (link) {
          return (
            <a
              key={index}
              href={link[2]}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-link"
            >
              {link[1]}
            </a>
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

function splitTableRow(line: string) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function renderLines(
  lines: string[]
): ReactNode[] {
  const nodes: ReactNode[] = [];

  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      nodes.push(
        <div
          key={i}
          className="message-space"
        />
      );

      i += 1;
      continue;
    }

    if (
      /^(-{3,}|\*{3,}|_{3,})$/.test(
        trimmed
      )
    ) {
      nodes.push(
        <hr
          key={i}
          className="message-rule"
        />
      );

      i += 1;
      continue;
    }

    if (trimmed.startsWith("### ")) {
      nodes.push(
        <h3
          key={i}
          dir="auto"
          className="message-heading heading-3"
        >
          <InlineText
            text={trimmed.slice(4)}
          />
        </h3>
      );

      i += 1;
      continue;
    }

    if (trimmed.startsWith("## ")) {
      nodes.push(
        <h2
          key={i}
          dir="auto"
          className="message-heading heading-2"
        >
          <InlineText
            text={trimmed.slice(3)}
          />
        </h2>
      );

      i += 1;
      continue;
    }

    if (trimmed.startsWith("# ")) {
      nodes.push(
        <h1
          key={i}
          dir="auto"
          className="message-heading heading-1"
        >
          <InlineText
            text={trimmed.slice(2)}
          />
        </h1>
      );

      i += 1;
      continue;
    }

    if (trimmed.startsWith(">")) {
      const start = i;
      const quote: string[] = [];

      while (
        i < lines.length &&
        lines[i].trim().startsWith(">")
      ) {
        quote.push(
          lines[i]
            .trim()
            .replace(/^>\s?/, "")
        );

        i += 1;
      }

      nodes.push(
        <blockquote
          key={start}
          dir="auto"
          className="message-quote"
        >
          {quote.map((item, index) => (
            <div key={index}>
              <InlineText text={item} />
            </div>
          ))}
        </blockquote>
      );

      continue;
    }

    if (
      trimmed.startsWith("|") &&
      i + 1 < lines.length &&
      /^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?$/.test(
        lines[i + 1].trim()
      )
    ) {
      const start = i;
      const header = splitTableRow(line);
      const rows: string[][] = [];

      i += 2;

      while (
        i < lines.length &&
        lines[i].trim().startsWith("|")
      ) {
        rows.push(
          splitTableRow(lines[i])
        );

        i += 1;
      }

      nodes.push(
        <div
          key={start}
          className="table-wrap"
        >
          <table className="message-table">
            <thead>
              <tr>
                {header.map(
                  (cell, index) => (
                    <th key={index}>
                      <InlineText
                        text={cell}
                      />
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody>
              {rows.map(
                (row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map(
                      (cell, index) => (
                        <td key={index}>
                          <InlineText
                            text={cell}
                          />
                        </td>
                      )
                    )}
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      );

      continue;
    }

    const indent = Math.min(
      line.length - line.trimStart().length,
      8
    );

    const bullet = trimmed.match(
      /^[-*•]\s+(.+)$/
    );

    if (bullet) {
      nodes.push(
        <div
          key={i}
          dir="auto"
          className="message-list-item"
          style={{
            marginInlineStart:
              indent * 5,
          }}
        >
          <span className="list-dot">
            •
          </span>

          <span className="list-content">
            <InlineText text={bullet[1]} />
          </span>
        </div>
      );

      i += 1;
      continue;
    }

    const numbered = trimmed.match(
      /^(\d+)[.)]\s+(.+)$/
    );

    if (numbered) {
      nodes.push(
        <div
          key={i}
          dir="auto"
          className="message-list-item numbered"
          style={{
            marginInlineStart:
              indent * 5,
          }}
        >
          <span className="list-number">
            {numbered[1]}.
          </span>

          <span className="list-content">
            <InlineText
              text={numbered[2]}
            />
          </span>
        </div>
      );

      i += 1;
      continue;
    }

    nodes.push(
      <div
        key={i}
        dir="auto"
        className="message-line"
      >
        <InlineText text={line} />
      </div>
    );

    i += 1;
  }

  return nodes;
}

function MessageContent({
  content,
}: {
  content: string;
}) {
  if (!content) {
    return null;
  }

  /*
    اگر مدل سه‌بک‌تیک را وسط یک خط نوشته بود،
    آن را به ابتدای یک خط جدید می‌بریم.
  */

  const lines = content
    .replace(/\r/g, "")
    .replace(/([^\n`])(```)/g, "$1\n$2")
    .split("\n");

  const output: ReactNode[] = [];

  let textBuffer: string[] = [];
  let codeBuffer: string[] = [];
  let codeLanguage = "";
  let insideCode = false;

  const flushText = () => {
    if (!textBuffer.length) {
      return;
    }

    const text = textBuffer.join("\n");

    if (!text.trim()) {
      textBuffer = [];
      return;
    }

    output.push(
      <div
        key={`text-${output.length}`}
        className="message-text"
      >
        {renderLines(text.split("\n"))}
      </div>
    );

    textBuffer = [];
  };

  const pushCode = () => {
    output.push(
      <CodeBlock
        key={`code-${output.length}`}
        code={codeBuffer.join("\n")}
        language={codeLanguage}
      />
    );

    codeBuffer = [];
    codeLanguage = "";
    insideCode = false;
  };

  for (const line of lines) {
    const match = line.match(
      /^\s*```(.*)$/
    );

    if (match) {
      const info = match[1].trim();

      if (!insideCode) {
        flushText();

        insideCode = true;
        codeBuffer = [];
        codeLanguage = "";

        /*
          ```text  یا  ```ts کد...
          اولین کلمه اگر شبیه اسم زبان بود
          زبان است و بقیه‌ی خط، محتوای کد.
        */

        /*
          کادر تک‌خطی: ```متن```
          (بدون اسم زبان)
        */

        if (info.endsWith("```")) {
          codeBuffer.push(
            info.slice(0, -3).trim()
          );

          pushCode();
          continue;
        }

        const info2 = info.match(
          /^([A-Za-z0-9_+#.-]{1,20})(?:\s+(.*))?$/
        );

        let rest = "";

        if (info2) {
          codeLanguage = info2[1];
          rest = info2[2] || "";
        } else {
          rest = info;
        }

        /*
          کادر تک‌خطی: ```متن```
        */

        if (rest.endsWith("```")) {
          codeBuffer.push(
            rest.slice(0, -3).trim()
          );

          pushCode();
          continue;
        }

        if (rest) {
          codeBuffer.push(rest);
        }
      } else {
        pushCode();

        /*
          اگر بعد از بستن کادر در همان خط متنی بود،
          آن را به عنوان متن عادی نگه می‌داریم.
        */

        if (info) {
          textBuffer.push(info);
        }
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
    pushCode();
  }

  flushText();

  return <>{output}</>;
}

/* =========================================================
   ICONS 2
========================================================= */

function ArrowDownIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 5v14M6 13l6 6 6-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* =========================================================
   LIVE VOICE — مکالمه صوتی زنده
   (همه‌ی منطق مکالمه صوتی در همین بخش جداست
   و به منطق ارسال پیام متنی دست نمی‌زند)
========================================================= */

type LivePhase =
  | "starting"
  | "listening"
  | "hearing"
  | "thinking"
  | "speaking"
  | "error";

type LiveVoiceProps = {
  open: boolean;
  origin: { x: number; y: number };
  micPromise: Promise<MediaStream> | null;
  onClose: () => void;
  getHistory: () => HistoryMessage[];
  onTurnStart: (userText: string) => string;
  onAssistantUpdate: (
    id: string,
    content: string
  ) => void;
};

const LIVE_TARGET_RATE = 16000;
const LIVE_MAX_SPOKEN_CHARS = 1400;

const LIVE_STATUS_TEXT: Record<LivePhase, string> = {
  starting: "در حال آماده‌سازی…",
  listening: "گوش می‌دم… بگو",
  hearing: "دارم می‌شنوم",
  thinking: "دارم فکر می‌کنم…",
  speaking: "موبیکسا داره جواب می‌ده",
  error: "یه مشکلی پیش اومد",
};

/*
  ضبط صدا در AudioWorklet (بدون فشار روی رشته‌ی اصلی).
  اگر مرورگر پشتیبانی نکند، ScriptProcessor جایگزین می‌شود.
*/
const LIVE_WORKLET_SOURCE = `
class MobixaCapture extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffer = new Float32Array(2048);
    this.length = 0;
  }

  process(inputs) {
    const channel = inputs[0] && inputs[0][0];

    if (!channel) {
      return true;
    }

    for (let i = 0; i < channel.length; i++) {
      this.buffer[this.length++] = channel[i];

      if (this.length === this.buffer.length) {
        this.port.postMessage(this.buffer.slice(0));
        this.length = 0;
      }
    }

    return true;
  }
}

registerProcessor("mobixa-capture", MobixaCapture);
`;

let sharedAudioContext: AudioContext | null = null;

const workletReady = new WeakSet<AudioContext>();

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") {
    return null;
  }

  const Ctor =
    window.AudioContext ||
    (
      window as unknown as {
        webkitAudioContext?: typeof AudioContext;
      }
    ).webkitAudioContext;

  if (!Ctor) {
    return null;
  }

  if (
    !sharedAudioContext ||
    sharedAudioContext.state === "closed"
  ) {
    sharedAudioContext = new Ctor();
  }

  return sharedAudioContext;
}

/*
  باید مستقیم داخل کلیک کاربر صدا زده شود
  (قانون Safari برای پخش صدا).
*/
function unlockAudio() {
  const ctx = getAudioContext();

  if (!ctx) {
    return;
  }

  if (ctx.state === "suspended") {
    void ctx.resume();
  }

  try {
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();

    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
  } catch {
    // ignore
  }
}

function requestMicrophone(): Promise<MediaStream> {
  if (
    typeof navigator === "undefined" ||
    !navigator.mediaDevices ||
    !navigator.mediaDevices.getUserMedia
  ) {
    const rejected = Promise.reject(
      new Error("unsupported")
    );

    rejected.catch(() => undefined);

    return rejected;
  }

  const request =
    navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

  request.catch(() => undefined);

  return request;
}

function micErrorMessage(error: unknown): string {
  const name =
    error instanceof Error ? error.name : "";

  if (
    name === "NotAllowedError" ||
    name === "SecurityError"
  ) {
    return "دسترسی به میکروفون داده نشده. از تنظیمات مرورگر اجازه بده و دوباره امتحان کن.";
  }

  if (
    name === "NotFoundError" ||
    name === "OverconstrainedError"
  ) {
    return "میکروفونی روی این دستگاه پیدا نشد.";
  }

  if (
    error instanceof Error &&
    error.message === "unsupported"
  ) {
    return "این مرورگر دسترسی به میکروفون رو پشتیبانی نمی‌کنه (یا صفحه امن نیست).";
  }

  return "میکروفون راه‌اندازی نشد. دوباره امتحان کن.";
}

function isAbortError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    error.name === "AbortError"
  );
}

/*
  هر چیزی که نباید بلند خوانده شود حذف می‌شود:
  کد، مارک‌داون، لینک و ایموجی.
*/
function cleanForSpeech(input: string): string {
  return input
    .replace(/`{3}[\s\S]*?(?:`{3}|$)/g, " ")
    .replace(/`/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/^[ \t]*[#>\-*•]+[ \t]+/gm, "")
    .replace(/[*_#>~|]/g, " ")
    .replace(/\p{Extended_Pictographic}/gu, "")
    .replace(/[\u200d\ufe0f]/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

/*
  جمله‌های کامل‌شده را از متنِ در حال دریافت جدا می‌کند
  تا هر جمله فوراً به صدا تبدیل و پخش شود.
*/
function extractSpeechChunks(
  text: string,
  from: number,
  final: boolean
): { chunks: string[]; next: number } {
  const chunks: string[] = [];

  let start = from;
  let i = from;

  while (i < text.length) {
    const ch = text[i];

    let boundary = false;

    if (ch === "\n") {
      boundary = true;
    } else if (
      ch === "." ||
      ch === "!" ||
      ch === "?" ||
      ch === "؟" ||
      ch === "…"
    ) {
      const following = text[i + 1];

      boundary =
        following === undefined
          ? final
          : /[\s"'”»)\]]/.test(following);
    } else if (
      (ch === "،" || ch === ",") &&
      i - start > 120
    ) {
      const following = text[i + 1];

      boundary =
        following === undefined
          ? final
          : /\s/.test(following);
    }

    if (boundary) {
      let end = i + 1;

      while (
        end < text.length &&
        /["'”»)\]]/.test(text[end])
      ) {
        end += 1;
      }

      const piece = text.slice(start, end).trim();

      const letters = piece.replace(
        /[^\p{L}\p{N}]/gu,
        ""
      ).length;

      /*
        جمله‌ی خیلی کوتاه با جمله‌ی بعدی ادغام می‌شود.
      */
      if (letters >= 6 || (final && letters > 0)) {
        chunks.push(piece);
        start = end;
      }

      i = end;
      continue;
    }

    i += 1;
  }

  if (final) {
    const rest = text.slice(start).trim();

    if (rest && /[\p{L}\p{N}]/u.test(rest)) {
      chunks.push(rest);
    }

    start = text.length;
  }

  return { chunks, next: start };
}

function downsample(
  input: Float32Array,
  inRate: number,
  outRate: number
): Float32Array {
  if (inRate <= outRate) {
    return input;
  }

  const ratio = inRate / outRate;
  const length = Math.floor(input.length / ratio);
  const output = new Float32Array(length);

  for (let i = 0; i < length; i++) {
    const start = Math.floor(i * ratio);

    const end = Math.min(
      input.length,
      Math.floor((i + 1) * ratio)
    );

    let sum = 0;

    for (let j = start; j < end; j++) {
      sum += input[j];
    }

    output[i] =
      end > start
        ? sum / (end - start)
        : input[start];
  }

  return output;
}

function encodeWav(
  samples: Float32Array,
  rate: number
): Blob {
  const buffer = new ArrayBuffer(
    44 + samples.length * 2
  );

  const view = new DataView(buffer);

  const writeText = (
    offset: number,
    value: string
  ) => {
    for (let i = 0; i < value.length; i++) {
      view.setUint8(
        offset + i,
        value.charCodeAt(i)
      );
    }
  };

  writeText(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeText(8, "WAVE");
  writeText(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, rate, true);
  view.setUint32(28, rate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeText(36, "data");
  view.setUint32(40, samples.length * 2, true);

  for (let i = 0; i < samples.length; i++) {
    const value = Math.max(
      -1,
      Math.min(1, samples[i])
    );

    view.setInt16(
      44 + i * 2,
      value < 0 ? value * 0x8000 : value * 0x7fff,
      true
    );
  }

  return new Blob([buffer], { type: "audio/wav" });
}

async function synthesizeSpeech(
  text: string,
  ctx: AudioContext,
  signal: AbortSignal
): Promise<AudioBuffer> {
  const response = await fetch("/api/live/speak", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
    signal,
  });

  if (!response.ok) {
    const data = (await response
      .json()
      .catch(() => null)) as { error?: string } | null;

    throw new Error(
      data?.error || "نتونستم صدای جواب رو بسازم."
    );
  }

  const bytes = await response.arrayBuffer();

  return await new Promise<AudioBuffer>(
    (resolve, reject) => {
      ctx.decodeAudioData(bytes, resolve, reject);
    }
  );
}

/*
  صف پخش: جمله‌ها هم‌زمان به صدا تبدیل می‌شوند
  ولی به ترتیب و بدون فاصله پخش می‌شوند.
*/
function createSpeechPlayer(
  ctx: AudioContext,
  destination: AudioNode,
  signal: AbortSignal,
  hooks: {
    onFirstAudio: () => void;
    onError: (message: string) => void;
  }
) {
  const queue: Array<Promise<AudioBuffer | null>> = [];
  const sources = new Set<AudioBufferSourceNode>();

  let head = 0;
  let pumping = false;
  let finished = false;
  let stopped = false;
  let firstPlayed = false;
  let nextTime = 0;
  let chars = 0;
  let resolveDone: () => void = () => undefined;

  const done = new Promise<void>((resolve) => {
    resolveDone = resolve;
  });

  const maybeDone = () => {
    if (
      stopped ||
      (finished &&
        !pumping &&
        head >= queue.length &&
        sources.size === 0)
    ) {
      resolveDone();
    }
  };

  const pump = async () => {
    if (pumping) {
      return;
    }

    pumping = true;

    while (!stopped && head < queue.length) {
      const buffer = await queue[head++];

      if (stopped) {
        break;
      }

      if (!buffer) {
        continue;
      }

      const source = ctx.createBufferSource();

      source.buffer = buffer;
      source.connect(destination);

      const startAt = Math.max(
        ctx.currentTime + 0.03,
        nextTime
      );

      source.start(startAt);
      nextTime = startAt + buffer.duration;

      sources.add(source);

      source.onended = () => {
        sources.delete(source);
        maybeDone();
      };

      if (!firstPlayed) {
        firstPlayed = true;
        hooks.onFirstAudio();
      }
    }

    pumping = false;
    maybeDone();
  };

  return {
    push(text: string) {
      if (
        stopped ||
        signal.aborted ||
        chars >= LIVE_MAX_SPOKEN_CHARS
      ) {
        return;
      }

      chars += text.length;

      queue.push(
        synthesizeSpeech(text, ctx, signal).catch(
          (error: unknown) => {
            if (!isAbortError(error)) {
              hooks.onError(
                error instanceof Error
                  ? error.message
                  : ""
              );
            }

            return null;
          }
        )
      );

      void pump();
    },

    finish() {
      finished = true;
      maybeDone();
    },

    stop() {
      stopped = true;

      sources.forEach((source) => {
        source.onended = null;

        try {
          source.stop();
        } catch {
          // ignore
        }

        source.disconnect();
      });

      sources.clear();
      resolveDone();
    },

    done,
  };
}

/* ---- icons ---- */

function VoiceWaveIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="send-icon voice-icon"
    >
      <rect className="vb vb1" x="2.6" y="9.2" width="2.6" height="5.6" rx="1.3" />
      <rect className="vb vb2" x="6.9" y="5.6" width="2.6" height="12.8" rx="1.3" />
      <rect className="vb vb3" x="11.2" y="2.8" width="2.6" height="18.4" rx="1.3" />
      <rect className="vb vb4" x="15.5" y="6.4" width="2.6" height="11.2" rx="1.3" />
      <rect className="vb vb5" x="19.8" y="9.6" width="2.6" height="4.8" rx="1.3" />
    </svg>
  );
}

function LiveMicIcon({ off }: { off?: boolean }) {
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
        strokeWidth="1.9"
      />
      <path
        d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v2.5M9 20.5h6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {off && (
        <path
          d="M4 4l16 16"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

function LiveEndIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="m6.5 6.5 11 11M17.5 6.5l-11 11"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LiveStopIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect
        x="6.5"
        y="6.5"
        width="11"
        height="11"
        rx="3"
        fill="currentColor"
      />
    </svg>
  );
}

function LiveChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="m6 9 6 6 6-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ---- component ---- */

function LiveVoice(props: LiveVoiceProps) {
  const { open, origin, micPromise } = props;

  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);
  const [phase, setPhase] =
    useState<LivePhase>("starting");
  const [muted, setMuted] = useState(false);
  const [userLine, setUserLine] = useState("");
  const [aiLine, setAiLine] = useState("");
  const [notice, setNotice] = useState("");
  const [fatal, setFatal] = useState("");

  const handlersRef = useRef({
    onClose: props.onClose,
    getHistory: props.getHistory,
    onTurnStart: props.onTurnStart,
    onAssistantUpdate: props.onAssistantUpdate,
  });

  useEffect(() => {
    handlersRef.current = {
      onClose: props.onClose,
      getHistory: props.getHistory,
      onTurnStart: props.onTurnStart,
      onAssistantUpdate: props.onAssistantUpdate,
    };
  });

  const phaseRef = useRef<LivePhase>("starting");
  const mutedRef = useRef(false);
  const mountedRef = useRef(false);

  const analysersRef = useRef<{
    mic: AnalyserNode | null;
    out: AnalyserNode | null;
  }>({ mic: null, out: null });

  const engineRef = useRef<{
    interrupt: () => void;
    setMuted: (value: boolean) => void;
  } | null>(null);

  const canvasRef =
    useRef<HTMLCanvasElement | null>(null);

  const orbRef = useRef<HTMLDivElement | null>(null);

  /* نمایش / مخفی‌شدن با انیمیشن */

  useEffect(() => {
    if (open) {
      mountedRef.current = true;
      setMounted(true);
      setClosing(false);
      return;
    }

    if (!mountedRef.current) {
      return;
    }

    setClosing(true);

    const timer = window.setTimeout(() => {
      mountedRef.current = false;
      setMounted(false);
      setClosing(false);
    }, 480);

    return () => {
      window.clearTimeout(timer);
    };
  }, [open]);

  /* میکروفون اصلی هنگام بستن آزاد می‌شود */

  useEffect(() => {
    if (!micPromise) {
      return;
    }

    return () => {
      micPromise
        .then((stream) =>
          stream
            .getTracks()
            .forEach((track) => track.stop())
        )
        .catch(() => undefined);
    };
  }, [micPromise]);

  /* کلید Esc */

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKey = (event: Event) => {
      if (
        (event as unknown as { key?: string }).key ===
        "Escape"
      ) {
        handlersRef.current.onClose();
      }
    };

    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  /* ======================================================
     موتور مکالمه
  ====================================================== */

  useEffect(() => {
    if (!open || !micPromise) {
      return;
    }

    let alive = true;
    let noticeTimer = 0;

    const cleanups: Array<() => void> = [];

    const own = (fn: () => void) => {
      if (alive) {
        cleanups.push(fn);
      } else {
        fn();
      }
    };

    const goPhase = (next: LivePhase) => {
      phaseRef.current = next;
      setPhase(next);
    };

    const fail = (message: string) => {
      if (!alive) {
        return;
      }

      setFatal(message);
      goPhase("error");
    };

    const showNotice = (message: string, ms = 3200) => {
      if (!alive) {
        return;
      }

      window.clearTimeout(noticeTimer);
      setNotice(message);

      if (message) {
        noticeTimer = window.setTimeout(() => {
          setNotice("");
        }, ms);
      }
    };

    own(() => window.clearTimeout(noticeTimer));

    setFatal("");
    setNotice("");
    setUserLine("");
    setAiLine("");
    setMuted(false);
    mutedRef.current = false;
    goPhase("starting");

    void (async () => {
      const ctx = getAudioContext();

      if (!ctx) {
        fail("مرورگرت ضبط و پخش صدا رو پشتیبانی نمی‌کنه.");
        return;
      }

      try {
        if (ctx.state === "suspended") {
          await ctx.resume();
        }
      } catch {
        // ignore
      }

      let original: MediaStream;

      try {
        original = await micPromise;
      } catch (error) {
        fail(micErrorMessage(error));
        return;
      }

      if (!alive) {
        return;
      }

      const stream = original.clone();

      own(() =>
        stream.getTracks().forEach((track) => track.stop())
      );

      const source = ctx.createMediaStreamSource(stream);

      own(() => source.disconnect());

      const micAnalyser = ctx.createAnalyser();

      micAnalyser.fftSize = 512;
      micAnalyser.smoothingTimeConstant = 0.8;
      source.connect(micAnalyser);

      /* صدای میکروفون هرگز به بلندگو وصل نمی‌شود */
      const sink = ctx.createGain();

      sink.gain.value = 0;
      sink.connect(ctx.destination);

      own(() => sink.disconnect());

      const outGain = ctx.createGain();
      const outAnalyser = ctx.createAnalyser();

      outAnalyser.fftSize = 512;
      outAnalyser.smoothingTimeConstant = 0.78;

      outGain.connect(outAnalyser);
      outAnalyser.connect(ctx.destination);

      own(() => {
        outGain.disconnect();
        outAnalyser.disconnect();
      });

      analysersRef.current = {
        mic: micAnalyser,
        out: outAnalyser,
      };

      /* صفحه حین مکالمه خاموش نشود */
      try {
        navigator.wakeLock
          ?.request("screen")
          .then((lock) => {
            if (alive) {
              own(() => {
                void lock.release().catch(() => undefined);
              });
            } else {
              void lock.release().catch(() => undefined);
            }
          })
          .catch(() => undefined);
      } catch {
        // ignore
      }

      /* ---------- تشخیص شروع و پایان حرف ---------- */

      let noise = 0.008;
      let speechRun = 0;
      let silenceRun = 0;
      let voiced = 0;
      let total = 0;
      let utterance: Float32Array[] = [];
      let preroll: Float32Array[] = [];
      let prerollDur = 0;

      let currentAbort: AbortController | null = null;

      let currentPlayer: ReturnType<
        typeof createSpeechPlayer
      > | null = null;

      const resetUtterance = () => {
        utterance = [];
        speechRun = 0;
        silenceRun = 0;
        voiced = 0;
        total = 0;
      };

      const lastPart = (text: string) =>
        text.length > 170
          ? `…${text.slice(-170)}`
          : text;

      const runTurn = async (text: string) => {
        const controller = new AbortController();

        currentAbort = controller;

        const handlers = handlersRef.current;
        const history = handlers.getHistory();
        const assistantId = handlers.onTurnStart(text);

        let warned = false;

        const player = createSpeechPlayer(
          ctx,
          outGain,
          controller.signal,
          {
            onFirstAudio: () => {
              if (alive && !controller.signal.aborted) {
                goPhase("speaking");
              }
            },

            onError: (message) => {
              if (
                !warned &&
                alive &&
                !controller.signal.aborted
              ) {
                warned = true;

                showNotice(
                  message ||
                    "صدای جواب در دسترس نیست؛ متنش توی چت هست.",
                  5200
                );
              }
            },
          }
        );

        currentPlayer = player;

        let full = "";
        let emitted = 0;

        try {
          const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            signal: controller.signal,
            body: JSON.stringify({
              message: text,
              history,
              image: null,
              mode: "voice",
            }),
          });

          if (!response.ok || !response.body) {
            let message =
              "سرویس هوش مصنوعی در دسترس نیست.";

            try {
              const data = await response.json();

              if (
                data &&
                typeof data.error === "string"
              ) {
                message = data.error;
              }
            } catch {
              // پاسخ JSON نبود.
            }

            handlers.onAssistantUpdate(
              assistantId,
              `⚠️ ${message}`
            );

            player.stop();
            showNotice(message, 4500);
            goPhase("listening");
            return;
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder("utf-8");

          while (true) {
            const { value, done } = await reader.read();

            if (done) {
              break;
            }

            if (!value) {
              continue;
            }

            const chunk = decoder.decode(value, {
              stream: true,
            });

            if (!chunk) {
              continue;
            }

            full += chunk;

            handlers.onAssistantUpdate(
              assistantId,
              full
            );

            const spoken = cleanForSpeech(full);

            const result = extractSpeechChunks(
              spoken,
              emitted,
              false
            );

            emitted = result.next;

            result.chunks.forEach((piece) =>
              player.push(piece)
            );

            setAiLine(lastPart(spoken));
          }

          full += decoder.decode();

          handlers.onAssistantUpdate(
            assistantId,
            full.trim()
              ? full
              : "پاسخی از هوش مصنوعی دریافت نشد."
          );

          const spokenFinal = cleanForSpeech(full);

          extractSpeechChunks(
            spokenFinal,
            emitted,
            true
          ).chunks.forEach((piece) =>
            player.push(piece)
          );

          setAiLine(lastPart(spokenFinal));

          player.finish();

          await player.done;

          if (!alive || controller.signal.aborted) {
            return;
          }

          goPhase("listening");
        } catch (error) {
          player.stop();

          if (!alive || isAbortError(error)) {
            return;
          }

          if (!full.trim()) {
            handlers.onAssistantUpdate(
              assistantId,
              "⚠️ ارتباط با هوش مصنوعی قطع شد."
            );
          }

          showNotice(
            "ارتباط با هوش مصنوعی قطع شد. دوباره بگو.",
            4500
          );

          goPhase("listening");
        }
      };

      const handleUtterance = async (
        chunks: Float32Array[]
      ) => {
        const controller = new AbortController();

        currentAbort = controller;

        try {
          const size = chunks.reduce(
            (sum, chunk) => sum + chunk.length,
            0
          );

          const merged = new Float32Array(size);

          let offset = 0;

          for (const chunk of chunks) {
            merged.set(chunk, offset);
            offset += chunk.length;
          }

          const wav = encodeWav(
            downsample(
              merged,
              ctx.sampleRate,
              LIVE_TARGET_RATE
            ),
            LIVE_TARGET_RATE
          );

          const response = await fetch(
            "/api/live/transcribe",
            {
              method: "POST",
              headers: {
                "Content-Type": "audio/wav",
              },
              body: wav,
              signal: controller.signal,
            }
          );

          const data = (await response
            .json()
            .catch(() => null)) as {
            text?: string;
            error?: string;
          } | null;

          if (!alive || controller.signal.aborted) {
            return;
          }

          if (!response.ok) {
            showNotice(
              data?.error ||
                "نتونستم صدات رو تشخیص بدم."
            );

            goPhase("listening");
            return;
          }

          const text = (data?.text || "").trim();

          if (!text) {
            showNotice("نشنیدم؛ یه بار دیگه بگو");
            goPhase("listening");
            return;
          }

          setUserLine(text);
          setAiLine("");

          await runTurn(text);
        } catch (error) {
          if (!alive || isAbortError(error)) {
            return;
          }

          showNotice(
            "ارتباط برقرار نشد. دوباره بگو."
          );

          goPhase("listening");
        }
      };

      const onChunk = (data: Float32Array) => {
        if (!alive) {
          return;
        }

        const current = phaseRef.current;
        const duration = data.length / ctx.sampleRate;

        /*
          وقتی هوش مصنوعی فکر می‌کند یا حرف می‌زند،
          میکروفون نادیده گرفته می‌شود
          (جلوگیری از شنیدن صدای خودش).
        */

        if (
          mutedRef.current ||
          (current !== "listening" &&
            current !== "hearing")
        ) {
          if (preroll.length) {
            preroll = [];
            prerollDur = 0;
          }

          return;
        }

        let sum = 0;

        for (let i = 0; i < data.length; i++) {
          sum += data[i] * data[i];
        }

        const rms = Math.sqrt(sum / data.length);

        const speechThreshold = Math.max(
          0.028,
          noise * 3
        );

        const silenceThreshold = Math.max(
          0.016,
          noise * 1.8
        );

        if (current === "listening") {
          if (rms < speechThreshold * 0.8) {
            noise = Math.min(
              0.03,
              noise * 0.95 + rms * 0.05
            );
          }

          preroll.push(new Float32Array(data));
          prerollDur += duration;

          while (
            prerollDur > 0.6 &&
            preroll.length > 1
          ) {
            const old = preroll.shift();

            if (old) {
              prerollDur -=
                old.length / ctx.sampleRate;
            }
          }

          speechRun =
            rms > speechThreshold
              ? speechRun + duration
              : 0;

          if (speechRun >= 0.14) {
            utterance = preroll;
            preroll = [];
            prerollDur = 0;

            silenceRun = 0;
            voiced = speechRun;

            total = utterance.reduce(
              (sum2, chunk) =>
                sum2 + chunk.length / ctx.sampleRate,
              0
            );

            setUserLine("");
            setAiLine("");

            goPhase("hearing");
          }

          return;
        }

        /* hearing */

        utterance.push(new Float32Array(data));
        total += duration;

        if (rms > silenceThreshold) {
          silenceRun = 0;
          voiced += duration;
        } else {
          silenceRun += duration;
        }

        if (silenceRun >= 0.95 || total >= 28) {
          const captured = utterance;
          const heard = voiced;

          resetUtterance();

          if (heard < 0.3) {
            goPhase("listening");
            return;
          }

          goPhase("thinking");

          void handleUtterance(captured);
        }
      };

      /* ---------- اتصال ضبط ---------- */

      let capturing = false;

      try {
        if (!ctx.audioWorklet) {
          throw new Error("no worklet");
        }

        if (!workletReady.has(ctx)) {
          const blob = new Blob(
            [LIVE_WORKLET_SOURCE],
            { type: "application/javascript" }
          );

          const url = URL.createObjectURL(blob);

          try {
            await ctx.audioWorklet.addModule(url);
          } finally {
            URL.revokeObjectURL(url);
          }

          workletReady.add(ctx);
        }

        if (!alive) {
          return;
        }

        const node = new AudioWorkletNode(
          ctx,
          "mobixa-capture"
        );

        node.port.onmessage = (
          event: MessageEvent<Float32Array>
        ) => onChunk(event.data);

        source.connect(node);
        node.connect(sink);

        own(() => {
          node.port.onmessage = null;
          node.disconnect();
        });

        capturing = true;
      } catch {
        // از ScriptProcessor استفاده می‌کنیم.
      }

      if (!alive) {
        return;
      }

      if (!capturing) {
        const processor = ctx.createScriptProcessor(
          2048,
          1,
          1
        );

        processor.onaudioprocess = (event) =>
          onChunk(
            new Float32Array(
              event.inputBuffer.getChannelData(0)
            )
          );

        source.connect(processor);
        processor.connect(sink);

        own(() => {
          processor.onaudioprocess = null;
          processor.disconnect();
        });
      }

      const interrupt = () => {
        currentAbort?.abort();
        currentPlayer?.stop();

        currentAbort = null;
        currentPlayer = null;

        if (
          alive &&
          phaseRef.current !== "error"
        ) {
          resetUtterance();
          goPhase("listening");
        }
      };

      own(() => {
        currentAbort?.abort();
        currentPlayer?.stop();
      });

      engineRef.current = {
        interrupt,

        setMuted: (value: boolean) => {
          mutedRef.current = value;

          stream
            .getAudioTracks()
            .forEach((track) => {
              track.enabled = !value;
            });

          if (
            value &&
            phaseRef.current === "hearing"
          ) {
            resetUtterance();
            goPhase("listening");
          }
        },
      };

      goPhase("listening");
    })();

    return () => {
      alive = false;

      cleanups
        .splice(0)
        .reverse()
        .forEach((fn) => {
          try {
            fn();
          } catch {
            // ignore
          }
        });

      engineRef.current = null;

      analysersRef.current = {
        mic: null,
        out: null,
      };
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, micPromise]);

  /* ======================================================
     انیمیشن موج و اورب (۶۰ فریم در ثانیه)
  ====================================================== */

  useEffect(() => {
    if (!mounted) {
      return;
    }

    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const g = canvas.getContext("2d");

    if (!g) {
      return;
    }

    const dpr = Math.min(
      window.devicePixelRatio || 1,
      2
    );

    const size = canvas.clientWidth || 340;

    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);

    g.scale(dpr, dpr);

    const BARS = 72;
    const smooth = new Float32Array(BARS);

    const makeBuffer = (length: number) =>
      new Uint8Array(length);

    let micData = makeBuffer(0);
    let outData = makeBuffer(0);

    let level = 0;
    let frame = 0;

    const render = (time: number) => {
      frame = requestAnimationFrame(render);

      if (document.hidden) {
        return;
      }

      const current = phaseRef.current;

      let data: Uint8Array | null = null;

      if (current === "speaking") {
        const analyser = analysersRef.current.out;

        if (analyser) {
          if (
            outData.length !==
            analyser.frequencyBinCount
          ) {
            outData = makeBuffer(
              analyser.frequencyBinCount
            );
          }

          analyser.getByteFrequencyData(outData);
          data = outData;
        }
      } else if (
        (current === "listening" ||
          current === "hearing") &&
        !mutedRef.current
      ) {
        const analyser = analysersRef.current.mic;

        if (analyser) {
          if (
            micData.length !==
            analyser.frequencyBinCount
          ) {
            micData = makeBuffer(
              analyser.frequencyBinCount
            );
          }

          analyser.getByteFrequencyData(micData);
          data = micData;
        }
      }

      const half = BARS / 2;

      let sum = 0;

      for (let i = 0; i < BARS; i++) {
        const k = i < half ? i : BARS - 1 - i;

        let value: number;

        if (data) {
          const bin = 2 + Math.floor((k / half) * 38);

          value = Math.pow(
            (data[bin] || 0) / 255,
            1.15
          );
        } else if (current === "thinking") {
          value =
            0.22 +
            0.2 * Math.sin(time * 0.004 + i * 0.42);
        } else {
          value =
            0.06 +
            0.03 * Math.sin(time * 0.002 + i * 0.5);
        }

        const target = Math.max(
          0,
          Math.min(1, value)
        );

        smooth[i] +=
          (target - smooth[i]) *
          (target > smooth[i] ? 0.55 : 0.2);

        if (i < 24) {
          sum += smooth[i];
        }
      }

      level = Math.max(level * 0.9, sum / 24);

      const orb = orbRef.current;

      if (orb) {
        orb.style.setProperty(
          "--lvl",
          Math.min(1, level * 1.4).toFixed(3)
        );
      }

      g.clearRect(0, 0, size, size);

      const cx = size / 2;
      const cy = size / 2;
      const radius = size * 0.285;

      const hueBase =
        current === "speaking"
          ? 292
          : current === "hearing"
          ? 262
          : current === "thinking"
          ? 270 + ((time * 0.03) % 80)
          : 212;

      g.lineCap = "round";
      g.lineWidth = Math.max(3, size * 0.012);
      g.shadowBlur = 8;
      g.shadowColor = "rgba(124, 92, 255, 0.55)";

      for (let i = 0; i < BARS; i++) {
        const angle =
          (i / BARS) * Math.PI * 2 - Math.PI / 2;

        const length = 4 + smooth[i] * size * 0.15;

        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        g.strokeStyle = `hsla(${
          hueBase + (i / BARS) * 70
        }, 92%, 62%, ${0.55 + smooth[i] * 0.45})`;

        g.beginPath();
        g.moveTo(
          cx + cos * radius,
          cy + sin * radius
        );
        g.lineTo(
          cx + cos * (radius + length),
          cy + sin * (radius + length)
        );
        g.stroke();
      }
    };

    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [mounted]);

  if (!mounted) {
    return null;
  }

  const statusText =
    muted && phase === "listening"
      ? "میکروفون بسته‌ست"
      : LIVE_STATUS_TEXT[phase];

  const canInterrupt =
    phase === "speaking" || phase === "thinking";

  return (
    <div
      className={`lv-root phase-${phase}${
        closing ? " closing" : ""
      }`}
      style={
        {
          "--ox": `${origin.x}px`,
          "--oy": `${origin.y}px`,
        } as CSSProperties
      }
      role="dialog"
      aria-modal="true"
      aria-label="مکالمه صوتی"
    >
      <div className="lv-bg" aria-hidden="true">
        <i className="lv-glow g-listen" />
        <i className="lv-glow g-hear" />
        <i className="lv-glow g-think" />
        <i className="lv-glow g-speak" />

        <span className="lv-spark k1" />
        <span className="lv-spark k2" />
        <span className="lv-spark k3" />
        <span className="lv-spark k4" />
        <span className="lv-spark k5" />
        <span className="lv-spark k6" />
        <span className="lv-spark k7" />
        <span className="lv-spark k8" />
      </div>

      <header className="lv-top">
        <button
          type="button"
          className="lv-minimize"
          onClick={() => handlersRef.current.onClose()}
          aria-label="بازگشت به چت"
        >
          <LiveChevronIcon />
          <span>چت</span>
        </button>

        <div className="lv-brand">
          <span>MOBIXA</span>
          <b>LIVE</b>
        </div>

        <span className="lv-top-space" />
      </header>

      {phase === "error" ? (
        <div className="lv-fatal">
          <div className="lv-fatal-card">
            <span className="lv-fatal-icon">
              <LiveMicIcon off />
            </span>

            <p>{fatal}</p>

            <button
              type="button"
              onClick={() =>
                handlersRef.current.onClose()
              }
            >
              بازگشت به چت
            </button>
          </div>
        </div>
      ) : (
        <div className="lv-stage">
          <div className="lv-status">
            <i className="lv-status-dot" />
            <span key={statusText}>{statusText}</span>
          </div>

          <div className="lv-orb-wrap">
            <i className="lv-ring r1" />
            <i className="lv-ring r2" />
            <i className="lv-ring r3" />

            <canvas
              ref={canvasRef}
              className="lv-canvas"
              aria-hidden="true"
            />

            <div
              className="lv-orb"
              ref={orbRef}
              aria-hidden="true"
            >
              <div className="lv-orb-body">
                <i className="o o-listen" />
                <i className="o o-hear" />
                <i className="o o-speak" />
                <i className="o o-think" />
                <i className="o o-gloss" />
              </div>
            </div>
          </div>

          <div className="lv-captions" aria-live="polite">
            {userLine && (
              <p className="lv-user" dir="auto" key={userLine}>
                {userLine}
              </p>
            )}

            {aiLine && (
              <p className="lv-ai" dir="auto">
                {aiLine}
              </p>
            )}

            {notice && (
              <p className="lv-notice" dir="auto" key={notice}>
                {notice}
              </p>
            )}

            {!userLine && !aiLine && !notice && (
              <p className="lv-hint">
                هر وقت آماده‌ای شروع کن، من گوشم با توئه ✨
              </p>
            )}
          </div>
        </div>
      )}

      <div className="lv-controls">
        <button
          type="button"
          className={`lv-btn${muted ? " is-on" : ""}`}
          onClick={() => {
            const next = !muted;

            setMuted(next);
            engineRef.current?.setMuted(next);
          }}
          aria-label={
            muted ? "باز کردن میکروفون" : "بستن میکروفون"
          }
          aria-pressed={muted}
          disabled={phase === "error"}
        >
          <LiveMicIcon off={muted} />
        </button>

        <button
          type="button"
          className="lv-btn lv-end"
          onClick={() => handlersRef.current.onClose()}
          aria-label="پایان مکالمه"
        >
          <LiveEndIcon />
        </button>

        <button
          type="button"
          className={`lv-btn${
            canInterrupt ? "" : " is-hidden"
          }`}
          onClick={() => engineRef.current?.interrupt()}
          aria-label="قطع کردن"
          tabIndex={canInterrupt ? 0 : -1}
        >
          <LiveStopIcon />
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function ChatPage() {
  const router = useRouter();

  const [messages, setMessages] =
    useState<Message[]>([]);

  const [input, setInput] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [selectedImage, setSelectedImage] =
    useState<File | null>(null);

  const [imagePreview, setImagePreview] =
    useState<string | null>(null);

  /*
    آخرین عکس واقعی کاربر.

    اگر کاربر:
    1. عکس بفرستد
    2. بعداً درباره همان عکس سؤال کند

    همان عکس دوباره برای API فرستاده می‌شود.
  */
  const lastImageDataUrlRef =
    useRef<string | null>(null);

  const textareaRef =
    useRef<HTMLTextAreaElement | null>(
      null
    );

  const imageInputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  const scrollRef =
    useRef<HTMLDivElement | null>(null);

  const abortControllerRef =
    useRef<AbortController | null>(null);

  const previewUrlRef =
    useRef<string | null>(null);

  /*
    فقط وقتی کاربر نزدیک انتهای چت است،
    هنگام دریافت پاسخ خودکار پایین می‌رویم.
  */
  const stickToBottomRef =
    useRef(true);

  const [showJump, setShowJump] =
    useState(false);

  const [greeting, setGreeting] =
    useState("سلام");

  const [showIntro, setShowIntro] =
    useState(true);

  /*
    مکالمه صوتی زنده
  */
  const messagesRef = useRef<Message[]>([]);

  const sendButtonRef =
    useRef<HTMLButtonElement | null>(null);

  const [liveOpen, setLiveOpen] =
    useState(false);

  const [liveOrigin, setLiveOrigin] =
    useState({ x: 0, y: 0 });

  const [liveMic, setLiveMic] =
    useState<Promise<MediaStream> | null>(null);

  useEffect(() => {
    messagesRef.current = messages;
  });

  useEffect(() => {
    const hour =
      new Date().getHours();

    if (hour >= 5 && hour < 12) {
      setGreeting("صبح بخیر");
    } else if (hour >= 12 && hour < 17) {
      setGreeting("ظهر بخیر");
    } else if (hour >= 17 && hour < 20) {
      setGreeting("عصر بخیر");
    } else {
      setGreeting("شب بخیر");
    }
  }, []);

  /*
    انیمیشن ورود کوتاه؛
    بعد از اتمام از صفحه حذف می‌شود.
  */
  useEffect(() => {
    const timer = window.setTimeout(
      () => {
        setShowIntro(false);
      },
      2100
    );

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  function openLive() {
    const rect =
      sendButtonRef.current?.getBoundingClientRect();

    setLiveOrigin(
      rect
        ? {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
          }
        : {
            x: window.innerWidth / 2,
            y: window.innerHeight - 70,
          }
    );

    unlockAudio();

    setLiveMic(requestMicrophone());
    setLiveOpen(true);

    if (typeof navigator.vibrate === "function") {
      navigator.vibrate(12);
    }
  }

  function closeLive() {
    setLiveOpen(false);
    setLiveMic(null);
  }

  function liveGetHistory(): HistoryMessage[] {
    return messagesRef.current
      .filter((item) => item.content.trim())
      .slice(-12)
      .map((item) => ({
        role: item.role,
        content: item.content.slice(0, 20000),
      }));
  }

  function liveTurnStart(userText: string): string {
    const userId = crypto.randomUUID();
    const assistantId = crypto.randomUUID();

    setMessages((old) => [
      ...old,
      {
        id: userId,
        role: "user",
        content: userText,
      },
      {
        id: assistantId,
        role: "assistant",
        content: "",
      },
    ]);

    return assistantId;
  }

  function liveAssistantUpdate(
    id: string,
    content: string
  ) {
    setMessages((old) =>
      old.map((item) =>
        item.id === id
          ? { ...item, content }
          : item
      )
    );
  }

  function goBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }

  function openImagePicker() {
    if (loading) {
      return;
    }

    imageInputRef.current?.click();
  }

  function handleImageSelect(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      !ALLOWED_IMAGE_TYPES.includes(
        file.type
      )
    ) {
      event.target.value = "";

      window.alert(
        "فقط تصاویر JPG، PNG و WEBP پشتیبانی می‌شوند."
      );

      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      event.target.value = "";

      window.alert(
        "حجم تصویر نباید بیشتر از ۵ مگابایت باشد."
      );

      return;
    }

    if (previewUrlRef.current) {
      URL.revokeObjectURL(
        previewUrlRef.current
      );
    }

    const previewUrl =
      URL.createObjectURL(file);

    previewUrlRef.current =
      previewUrl;

    setSelectedImage(file);
    setImagePreview(previewUrl);

    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  }

  function removeSelectedImage() {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(
        previewUrlRef.current
      );

      previewUrlRef.current = null;
    }

    setSelectedImage(null);
    setImagePreview(null);

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  }

  function stopGeneration() {
    abortControllerRef.current?.abort();
  }

  async function fileToDataUrl(
    file: File
  ): Promise<string> {
    const rawDataUrl =
      await new Promise<string>(
        (resolve, reject) => {
          const reader =
            new FileReader();

          reader.onload = () => {
            if (
              typeof reader.result ===
              "string"
            ) {
              resolve(reader.result);
            } else {
              reject(
                new Error(
                  "نتوانستم تصویر را آماده کنم."
                )
              );
            }
          };

          reader.onerror = () => {
            reject(
              new Error(
                "خواندن تصویر ناموفق بود."
              )
            );
          };

          reader.readAsDataURL(file);
        }
      );

    /*
      برای جلوگیری از درخواست‌های خیلی سنگین،
      تصویر در مرورگر کوچک می‌شود.
    */

    return await new Promise<string>(
      (resolve) => {
        const img = new Image();

        img.onload = () => {
          try {
            const maxDimension = 2048;

            const originalWidth =
              img.naturalWidth ||
              img.width;

            const originalHeight =
              img.naturalHeight ||
              img.height;

            const largest =
              Math.max(
                originalWidth,
                originalHeight
              );

            const scale =
              largest > maxDimension
                ? maxDimension / largest
                : 1;

            const width =
              Math.max(
                1,
                Math.round(
                  originalWidth * scale
                )
              );

            const height =
              Math.max(
                1,
                Math.round(
                  originalHeight * scale
                )
              );

            const canvas =
              document.createElement(
                "canvas"
              );

            canvas.width = width;
            canvas.height = height;

            const context =
              canvas.getContext("2d");

            if (!context) {
              resolve(rawDataUrl);
              return;
            }

            context.drawImage(
              img,
              0,
              0,
              width,
              height
            );

            const compressed =
              canvas.toDataURL(
                "image/jpeg",
                0.84
              );

            resolve(
              compressed ||
              rawDataUrl
            );
          } catch {
            resolve(rawDataUrl);
          }
        };

        img.onerror = () => {
          resolve(rawDataUrl);
        };

        img.src = rawDataUrl;
      }
    );
  }

  /*
  ==========================================================
  SEND MESSAGE
  ==========================================================
  */

  async function sendMessage(
    customMessage?: string
  ) {
    const message =
      (
        customMessage ??
        input
      ).trim();

    /*
      سه حالت داریم:

      1. فقط متن
      2. فقط عکس
      3. متن + عکس

      هر سه باید قابل ارسال باشند.
    */

    if (
      !message &&
      !selectedImage &&
      !lastImageDataUrlRef.current
    ) {
      return;
    }

    if (loading) {
      return;
    }

    const imageFile =
      selectedImage;

    const imagePreviewForMessage =
      imagePreview;

    let imageDataUrl:
      string | null = null;

    try {
      /*
        اگر کاربر عکس جدید انتخاب کرده،
        آن را به Data URL تبدیل می‌کنیم.
      */

      if (imageFile) {
        if (
          imageFile.size >
          MAX_IMAGE_BYTES
        ) {
          throw new Error(
            "حجم تصویر نباید بیشتر از ۵ مگابایت باشد."
          );
        }

        if (
          !ALLOWED_IMAGE_TYPES.includes(
            imageFile.type
          )
        ) {
          throw new Error(
            "فقط تصاویر JPG، PNG و WEBP پشتیبانی می‌شوند."
          );
        }

        imageDataUrl =
          await fileToDataUrl(
            imageFile
          );

        /*
          برای سؤال بعدی هم ذخیره می‌کنیم.
        */

        lastImageDataUrlRef.current =
          imageDataUrl;
      }
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "تصویر آماده ارسال نشد."
      );

      return;
    }

    /*
      اگر عکس جدید داریم، همان عکس را بفرست.

      اگر عکس جدید نداریم ولی قبلاً عکس ارسال شده،
      همان عکس قبلی را برای سؤال جدید بفرست.
    */

    const imageForRequest =
      imageDataUrl ||
      lastImageDataUrlRef.current ||
      null;

    /*
      فقط متن پیام‌های قبلی در history می‌رود.
      عکس فعلی جداگانه در image ارسال می‌شود.
    */

    const history: HistoryMessage[] =
      messages
        .filter(
          (item) =>
            item.content.trim()
        )
        .slice(-12)
        .map((item) => ({
          role: item.role,
          content:
            item.content.slice(
              0,
              20000
            ),
        }));

    setInput("");

    /*
      فقط عکس انتخاب‌شده از composer پاک می‌شود.
      lastImageDataUrlRef باقی می‌ماند تا سؤال بعدی
      همچنان بتواند درباره همان عکس باشد.
    */

    removeSelectedImage();

    const userId =
      crypto.randomUUID();

    const assistantId =
      crypto.randomUUID();

    /*
      اگر فقط عکس باشد:

      content = ""

      بنابراین هیچ جمله مصنوعی داخل پیام کاربر
      نمایش داده نمی‌شود.
    */

    setMessages((old) => [
      ...old,
      {
        id: userId,
        role: "user",
        content: message,
        image:
          imageDataUrl ||
          imagePreviewForMessage,
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
      const response =
        await fetch(
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
              image:
                imageForRequest,
            }),
          }
        );

      if (!response.ok) {
        let errorMessage =
          "سرویس هوش مصنوعی در دسترس نیست.";

        try {
          const data =
            await response.json();

          if (
            data &&
            typeof data.error ===
              "string"
          ) {
            errorMessage =
              data.error;
          }
        } catch {
          // پاسخ JSON نبود.
        }

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
        new TextDecoder(
          "utf-8"
        );

      let assistantText = "";

      while (true) {
        const {
          value,
          done,
        } = await reader.read();

        if (done) {
          break;
        }

        if (!value) {
          continue;
        }

        const chunk =
          decoder.decode(
            value,
            {
              stream: true,
            }
          );

        if (!chunk) {
          continue;
        }

        assistantText += chunk;

        setMessages((old) =>
          old.map((item) =>
            item.id ===
            assistantId
              ? {
                  ...item,
                  content:
                    assistantText,
                }
              : item
          )
        );
      }

      /*
        باقی‌مانده decoder
      */

      const finalChunk =
        decoder.decode();

      if (finalChunk) {
        assistantText +=
          finalChunk;

        setMessages((old) =>
          old.map((item) =>
            item.id ===
            assistantId
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
        setMessages((old) =>
          old.map((item) =>
            item.id ===
            assistantId
              ? {
                  ...item,
                  content:
                    "پاسخی از هوش مصنوعی دریافت نشد.",
                }
              : item
          )
        );
      }
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.name ===
          "AbortError"
      ) {
        return;
      }

      const errorMessage =
        error instanceof Error
          ? error.message
          : "در دریافت پاسخ مشکلی پیش آمد.";

      setMessages((old) =>
        old.map((item) =>
          item.id ===
          assistantId
            ? {
                ...item,
                content:
                  `⚠️ ${errorMessage}`,
              }
            : item
        )
      );
    } finally {
      setLoading(false);

      abortControllerRef.current =
        null;
    }
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>
  ) {
    // Enter فقط خط جدید می‌سازد؛
    // ارسال فقط با دکمه ارسال انجام می‌شود.
    if (event.key === "Enter") {
      return;
    }
  }

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";

    textarea.style.height = `${Math.min(
      Math.max(44, textarea.scrollHeight),
      110
    )}px`;
  }, [input]);

  function handleScroll() {
    const element = scrollRef.current;

    if (!element) {
      return;
    }

    const distance =
      element.scrollHeight -
      element.scrollTop -
      element.clientHeight;

    stickToBottomRef.current =
      distance < 140;

    setShowJump(distance > 260);
  }

  function scrollToBottom() {
    const element = scrollRef.current;

    if (!element) {
      return;
    }

    stickToBottomRef.current = true;

    element.scrollTo({
      top: element.scrollHeight,
      behavior: "smooth",
    });
  }

  useEffect(() => {
    const element = scrollRef.current;

    if (!element) {
      return;
    }

    const last =
      messages[messages.length - 1];

    /*
      پیام جدید ارسال شده:
      همیشه به پایین برو.
    */

    if (
      last &&
      last.role === "assistant" &&
      !last.content
    ) {
      stickToBottomRef.current = true;
    }

    if (!stickToBottomRef.current) {
      return;
    }

    element.scrollTo({
      top: element.scrollHeight,
      behavior: loading
        ? "auto"
        : "smooth",
    });
  }, [messages, loading]);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(
          previewUrlRef.current
        );
      }

      abortControllerRef.current?.abort();
    };
  }, []);

  /*
    وقتی کادر خالی است، دکمه‌ی ارسال به
    دکمه‌ی مکالمه صوتی تبدیل می‌شود
    (بدون اشغال کردن جای اضافه).
  */
  const showVoice =
    !loading &&
    !input.trim() &&
    !selectedImage;

  return (
    <main
      dir="rtl"
      className="mobixa"
    >
      <div className="background" aria-hidden="true">
        <div className="bg-glow glow-one" />
        <div className="bg-glow glow-two" />
        <div className="bg-glow glow-three" />
        <div className="bg-grid" />

        <span className="bg-spark sp-1">✦</span>
        <span className="bg-spark sp-2">✧</span>
        <span className="bg-spark sp-3">✦</span>
        <span className="bg-spark sp-4">✧</span>
        <span className="bg-spark sp-5">✦</span>
        <span className="bg-spark sp-6">✧</span>

        <div className="bg-grain" />
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
          onScroll={handleScroll}
        >
          {messages.length === 0 ? (
            <div className="home-content">
              <div className="home-chip">
                <span>✦</span>
                {greeting}
              </div>

              <h1 className="home-title">
                <span>بزن بریم</span>{" "}
                <strong>مهندس</strong>
              </h1>

              <div
                className="rotator"
                aria-hidden="true"
              >
                <span>ایده بده</span>
                <span>سؤال بپرس</span>
                <span>کد بنویس</span>
                <span>
                  متنت رو حرفه‌ای کن
                </span>
                <span>
                  عکس رو تحلیل کن
                </span>
              </div>

              <p className="home-sub">
                هر چیزی که توی ذهنته،
                همین‌جا شروع می‌شه.
              </p>

              <div className="home-hint">
                <ArrowDownIcon />

                <span>
                  پیامت رو پایین بنویس
                </span>
              </div>
            </div>
          ) : (
            <div className="messages">
              {messages.map(
                (message, index) => {
                  const isLast =
                    index ===
                    messages.length - 1;

                  const streaming =
                    loading &&
                    isLast &&
                    message.role ===
                      "assistant";

                  if (
                    message.role === "user"
                  ) {
                    return (
                      <div
                        key={message.id}
                        className="message user-message"
                      >
                        <div className="user-bubble">
                          {message.image && (
                            <img
                              src={
                                message.image
                              }
                              alt="تصویر ارسال‌شده"
                              className="sent-image"
                            />
                          )}

                          {message.content && (
                            <div
                              className="user-text"
                              dir="auto"
                            >
                              <InlineText
                                text={
                                  message.content
                                }
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }

                  const isError =
                    message.content.startsWith(
                      "⚠️"
                    );

                  return (
                    <div
                      key={message.id}
                      className="message ai-message"
                    >
                      <div className="ai-body">
                        <div
                          className={`ai-content ai-bubble${
                            streaming
                              ? " streaming"
                              : ""
                          }${
                            isError
                              ? " is-error"
                              : ""
                          }`}
                        >
                          {message.content ? (
                            <MessageContent
                              content={
                                message.content
                              }
                            />
                          ) : loading &&
                            isLast ? (
                            <div
                              className="thinking"
                              role="status"
                            >
                              <span className="thinking-text">
                                در حال فکر کردن
                              </span>

                              <span className="thinking-dots">
                                <i />
                                <i />
                                <i />
                              </span>
                            </div>
                          ) : (
                            <span className="stopped-note">
                              پاسخ متوقف شد
                            </span>
                          )}
                        </div>

                        {message.content &&
                          !isError &&
                          !streaming && (
                            <div className="message-actions">
                              <CopyButton
                                text={
                                  message.content
                                }
                                className="message-copy"
                              />
                            </div>
                          )}
                      </div>
                    </div>
                  );
                }
              )}

              <div className="jump-wrap">
                <button
                  type="button"
                  className={`jump${
                    showJump
                      ? " show"
                      : ""
                  }`}
                  onClick={scrollToBottom}
                  aria-label="رفتن به آخرین پیام"
                  tabIndex={
                    showJump ? 0 : -1
                  }
                >
                  <ArrowDownIcon />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="composer-zone">
          {imagePreview && (
            <div className="image-preview-wrap">
              <div className="image-preview-card">
                <img
                  src={imagePreview}
                  alt="پیش‌نمایش تصویر"
                  className="image-preview"
                />

                <div className="image-preview-info">
                  <span>
                    تصویر آماده ارسال است
                  </span>

                  <small>
                    می‌تونی بدون متن هم
                    ارسالش کنی
                  </small>
                </div>

                <button
                  type="button"
                  className="remove-image"
                  onClick={
                    removeSelectedImage
                  }
                  aria-label="حذف تصویر"
                >
                  <CloseIcon />
                </button>
              </div>
            </div>
          )}

          <div className="composer">
            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={
                handleImageSelect
              }
              hidden
            />

            <button
              type="button"
              className="upload"
              onClick={
                openImagePicker
              }
              disabled={loading}
              aria-label="انتخاب تصویر"
            >
              <ImageUploadIcon />

              <span className="upload-tooltip">
                ارسال تصویر
              </span>
            </button>

            <textarea
              ref={textareaRef}
              value={input}
              onChange={(event) =>
                setInput(
                  event.target.value
                )
              }
              onKeyDown={
                handleKeyDown
              }
              disabled={loading}
              rows={1}
              enterKeyHint="enter"
              placeholder={
                imagePreview
                  ? "اگر می‌خوای درباره عکس چیزی بپرسی، بنویس..."
                  : "پیامت رو برای موبیکسا بنویس..."
              }
            />

            <button
              type="button"
              ref={sendButtonRef}
              className={`send${
                loading
                  ? " is-loading"
                  : ""
              }${
                showVoice
                  ? " is-voice"
                  : ""
              }`}
              onClick={() => {
                if (loading) {
                  stopGeneration();
                } else if (showVoice) {
                  openLive();
                } else {
                  void sendMessage();
                }
              }}
              aria-label={
                loading
                  ? "توقف"
                  : showVoice
                  ? "مکالمه صوتی"
                  : "ارسال"
              }
            >
              {loading ? (
                <StopIcon />
              ) : (
                <span className="send-swap">
                  <span className="swap-arrow">
                    <SendIcon />
                  </span>

                  <span className="swap-voice">
                    <VoiceWaveIcon />
                  </span>
                </span>
              )}
            </button>
          </div>

          <div className="footer">
            <span>
              Mobixa AI ✦
            </span>

            <span>
              ممکن است گاهی پاسخ نادرست باشد.
            </span>
          </div>
        </div>
      </section>

      {showIntro && (
        <div
          className="intro-overlay"
          aria-hidden="true"
        >
          <div className="intro-glow" />

          <div className="intro-word">
            {"MOBIXA"
              .split("")
              .map((letter, index) => (
                <span
                  key={index}
                  style={{
                    animationDelay: `${
                      0.12 + index * 0.08
                    }s`,
                  }}
                >
                  {letter}
                </span>
              ))}
          </div>

          <div className="intro-line" />

          <div className="intro-tag">
            AI
          </div>
        </div>
      )}

      <LiveVoice
        open={liveOpen}
        origin={liveOrigin}
        micPromise={liveMic}
        onClose={closeLive}
        getHistory={liveGetHistory}
        onTurnStart={liveTurnStart}
        onAssistantUpdate={liveAssistantUpdate}
      />

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        html,
        body {
          margin: 0;
          padding: 0;
          width: 100%;
          min-height: 100%;
          background: #d9d0ff;
        }

        body {
          overflow: hidden;
          font-family:
            Tahoma,
            Arial,
            sans-serif;
        }

        button,
        textarea,
        input {
          font: inherit;
        }

        button {
          -webkit-tap-highlight-color:
            transparent;
        }

        ::selection {
          background:
            rgba(124, 92, 255, 0.28);
        }

        .mobixa {
          position: relative;
          width: 100%;
          height: 100svh;
          min-height: 100svh;
          overflow: hidden;
          color: #1d1a3d;
          -webkit-font-smoothing: antialiased;
          background:
            radial-gradient(
              120% 60% at 50% -10%,
              rgba(255, 255, 255, 0.7),
              transparent 60%
            ),
            radial-gradient(
              90% 60% at 100% 100%,
              rgba(255, 160, 214, 0.55),
              transparent 62%
            ),
            radial-gradient(
              90% 60% at 0% 90%,
              rgba(140, 190, 255, 0.6),
              transparent 62%
            ),
            linear-gradient(
              165deg,
              #cdbfff 0%,
              #c3d5ff 50%,
              #e2d0ff 100%
            );
        }

        /* =====================================================
           BACKGROUND
        ===================================================== */

        .background {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
        }

        .bg-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          will-change: transform;
        }

        .glow-one {
          width: 340px;
          height: 340px;
          left: -150px;
          top: 6%;
          background:
            rgba(139, 108, 255, 0.5);
          animation:
            glowDriftA 18s ease-in-out
              infinite alternate;
        }

        .glow-two {
          width: 320px;
          height: 320px;
          right: -160px;
          top: 38%;
          background:
            rgba(70, 200, 255, 0.42);
          animation:
            glowDriftB 22s ease-in-out
              infinite alternate;
        }

        .glow-three {
          width: 320px;
          height: 320px;
          left: 10%;
          bottom: -140px;
          background:
            rgba(255, 130, 200, 0.45);
          animation:
            glowDriftC 20s ease-in-out
              infinite alternate;
        }

        .bg-grid {
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(
              rgba(90, 70, 210, 0.2) 1px,
              transparent 1.3px
            );
          background-size: 22px 22px;
          -webkit-mask-image:
            linear-gradient(
              to bottom,
              #000,
              transparent 72%
            );
          mask-image:
            linear-gradient(
              to bottom,
              #000,
              transparent 72%
            );
        }

        .bg-spark {
          position: absolute;
          color: #ffffff;
          text-shadow:
            0 0 10px
              rgba(124, 92, 255, 0.9),
            0 0 22px
              rgba(124, 92, 255, 0.5);
          animation:
            twinkle 4s ease-in-out
              infinite;
        }

        .sp-1 {
          top: 17%;
          left: 12%;
          font-size: 14px;
        }

        .sp-2 {
          top: 26%;
          right: 14%;
          font-size: 18px;
          animation-delay: 0.8s;
        }

        .sp-3 {
          top: 52%;
          left: 7%;
          font-size: 11px;
          animation-delay: 1.6s;
        }

        .sp-4 {
          top: 60%;
          right: 9%;
          font-size: 15px;
          animation-delay: 2.2s;
        }

        .sp-5 {
          top: 38%;
          left: 46%;
          font-size: 10px;
          animation-delay: 1.2s;
        }

        .sp-6 {
          top: 72%;
          left: 22%;
          font-size: 13px;
          animation-delay: 2.8s;
        }

        .bg-grain {
          position: absolute;
          inset: 0;
          opacity: 0.06;
          mix-blend-mode: overlay;
          background-image:
            url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
        }

        /* =====================================================
           HEADER
        ===================================================== */

        .header {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 900px;
          height: 82px;
          margin: 0 auto;
          padding: 18px 24px 0;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          direction: ltr;
          animation:
            introDown 0.7s
              cubic-bezier(.2,.8,.2,1)
              1.35s backwards;
        }

        .wordmark {
          direction: ltr;
          display: flex;
          align-items: center;
          gap: 10px;
          padding-top: 9px;
          font-size: 15px;
          font-weight: 800;
          letter-spacing: 7px;
          color: #1d1a3d;
        }

        .wordmark b {
          padding: 3px 7px 3px 9px;
          border-radius: 7px;
          background:
            linear-gradient(
              135deg,
              #7c5cff,
              #4f7cff
            );
          color: #ffffff;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2px;
          box-shadow:
            0 6px 16px
              rgba(100, 80, 240, 0.4);
        }

        .back {
          direction: rtl;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          height: 42px;
          padding: 0 17px;
          border-radius: 999px;
          border: 1px solid
            rgba(255, 255, 255, 0.9);
          background:
            rgba(255, 255, 255, 0.55);
          color: #1d1a3d;
          box-shadow:
            0 8px 24px
              rgba(90, 70, 200, 0.16);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition:
            background 0.2s ease,
            transform 0.2s ease;
        }

        .back:hover {
          background:
            rgba(255, 255, 255, 0.85);
          transform: translateY(-1px);
        }

        .back svg {
          width: 18px;
          height: 18px;
        }

        /* =====================================================
           LAYOUT
        ===================================================== */

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
          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          padding: 0 18px;
        }

        .message-area::-webkit-scrollbar {
          display: none;
        }

        /* =====================================================
           HOME
        ===================================================== */

        .home-content {
          min-height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding-bottom: 26px;
        }

        .home-content > :nth-child(1) {
          animation:
            homeIn 0.8s
              cubic-bezier(.2,.8,.2,1)
              1.45s backwards;
        }

        .home-content > :nth-child(2) {
          animation:
            homeIn 0.8s
              cubic-bezier(.2,.8,.2,1)
              1.55s backwards;
        }

        .home-content > :nth-child(3) {
          animation:
            homeIn 0.8s
              cubic-bezier(.2,.8,.2,1)
              1.65s backwards;
        }

        .home-content > :nth-child(4) {
          animation:
            homeIn 0.8s
              cubic-bezier(.2,.8,.2,1)
              1.75s backwards;
        }

        .home-content > :nth-child(5) {
          animation:
            homeIn 0.8s
              cubic-bezier(.2,.8,.2,1)
              1.9s backwards;
        }

        .home-chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 15px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 700;
          color: #4a36d6;
          background:
            rgba(255, 255, 255, 0.62);
          border: 1px solid
            rgba(255, 255, 255, 0.95);
          box-shadow:
            0 8px 22px
              rgba(100, 80, 230, 0.18);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }

        .home-chip span {
          color: #ec4899;
        }

        .home-title {
          margin: 20px 0 0;
          font-size: 42px;
          line-height: 1.25;
          font-weight: 900;
          text-align: center;
          color: #1d1a3d;
        }

        .home-title span {
          color: #1d1a3d;
        }

        .home-title strong {
          background:
            linear-gradient(
              90deg,
              #6a4df0,
              #3b82f6,
              #ec4899,
              #6a4df0
            );
          background-size: 250% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation:
            titleShift 6s linear
              infinite;
        }

        .rotator {
          position: relative;
          width: 100%;
          height: 40px;
          margin-top: 12px;
          font-size: 22px;
          font-weight: 800;
          text-align: center;
        }

        .rotator span {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #4a36d6;
          opacity: 0;
          animation:
            wordCycle 12.5s ease-in-out
              infinite both;
        }

        .rotator span:nth-child(1) {
          animation-delay: 1.8s;
        }

        .rotator span:nth-child(2) {
          animation-delay: 4.3s;
        }

        .rotator span:nth-child(3) {
          animation-delay: 6.8s;
        }

        .rotator span:nth-child(4) {
          animation-delay: 9.3s;
        }

        .rotator span:nth-child(5) {
          animation-delay: 11.8s;
        }

        .home-sub {
          margin: 6px 0 0;
          max-width: 300px;
          text-align: center;
          font-size: 14.5px;
          line-height: 1.9;
          color:
            rgba(29, 26, 61, 0.68);
        }

        .home-hint {
          margin-top: 30px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 15px;
          border-radius: 999px;
          font-size: 13px;
          color:
            rgba(29, 26, 61, 0.7);
          background:
            rgba(255, 255, 255, 0.5);
          border: 1px solid
            rgba(255, 255, 255, 0.9);
        }

        .home-hint svg {
          width: 16px;
          height: 16px;
          color: #6a4df0;
          animation:
            hintBounce 1.8s ease-in-out
              infinite;
        }

        /* =====================================================
           MESSAGES
        ===================================================== */

        .messages {
          padding-top: 22px;
          padding-bottom: 24px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .message {
          display: flex;
          width: 100%;
        }

        /* ---- user (right) ---- */

        .user-message {
          justify-content: flex-start;
        }

        .user-bubble {
          max-width: 84%;
          min-width: 0;
          padding: 11px 16px;
          border-radius: 22px;
          border-bottom-right-radius: 6px;
          font-size: 15.5px;
          line-height: 1.9;
          color: #ffffff;
          overflow-wrap: anywhere;
          background:
            linear-gradient(
              135deg,
              #7c5cff 0%,
              #5b6cff 55%,
              #3b8cff 100%
            );
          border: 1px solid
            rgba(255, 255, 255, 0.35);
          box-shadow:
            0 12px 28px
              rgba(91, 80, 240, 0.35),
            inset 0 1px 0
              rgba(255, 255, 255, 0.3);
          transform-origin:
            right bottom;
          animation:
            userIn 0.42s
              cubic-bezier(.2,.9,.3,1.15)
              both;
        }

        .user-text {
          white-space: pre-wrap;
        }

        .sent-image {
          display: block;
          width: 120px;
          height: 120px;
          object-fit: cover;
          border-radius: 13px;
          margin-bottom: 9px;
          border: 1px solid
            rgba(255, 255, 255, 0.5);
        }

        /* ---- assistant (left) ---- */

        .ai-message {
          justify-content: flex-end;
        }

        .ai-body {
          max-width: 94%;
          min-width: 0;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          transform-origin:
            left bottom;
          animation:
            aiIn 0.5s
              cubic-bezier(.2,.9,.3,1.1)
              both;
        }

        .ai-bubble {
          min-width: 0;
          max-width: 100%;
          padding: 12px 16px;
          border-radius: 22px;
          border-bottom-left-radius: 6px;
          font-size: 15.5px;
          line-height: 2;
          color: #1d1a3d;
          overflow-wrap: anywhere;
          background:
            rgba(255, 255, 255, 0.76);
          border: 1px solid
            rgba(255, 255, 255, 0.95);
          box-shadow:
            0 12px 32px
              rgba(86, 66, 200, 0.16),
            inset 0 1px 0
              rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }

        .ai-bubble.is-error {
          color: #a8202c;
          background:
            rgba(255, 235, 238, 0.85);
          border-color:
            rgba(220, 70, 85, 0.35);
        }

        .stopped-note {
          font-size: 13px;
          color:
            rgba(29, 26, 61, 0.5);
        }

        /* thinking */

        .thinking {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          height: 30px;
          font-size: 14.5px;
        }

        .thinking-text {
          background:
            linear-gradient(
              100deg,
              rgba(29, 26, 61, 0.38)
                30%,
              #6a4df0 50%,
              rgba(29, 26, 61, 0.38)
                70%
            );
          background-size: 260% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation:
            shimmer 2.1s linear
              infinite;
        }

        .thinking-dots {
          display: inline-flex;
          gap: 4px;
        }

        .thinking-dots i {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #7c5cff;
          animation:
            typingDot 1.2s ease-in-out
              infinite;
        }

        .thinking-dots i:nth-child(2) {
          animation-delay: 0.15s;
        }

        .thinking-dots i:nth-child(3) {
          animation-delay: 0.3s;
        }

        /* streaming caret */

        .ai-content.streaming
          .message-text:last-child
          > :last-child:not(.message-rule):not(.table-wrap):not(.message-space)::after {
          content: "";
          display: inline-block;
          width: 7px;
          height: 1.05em;
          margin-inline-start: 5px;
          vertical-align: -0.2em;
          border-radius: 2px;
          background:
            linear-gradient(
              180deg,
              #8b6cff,
              #4f7cff
            );
          box-shadow:
            0 0 10px
              rgba(124, 92, 255, 0.7);
          animation:
            caretBlink 1s steps(2, start)
              infinite;
        }

        /* new lines fade in while streaming */

        .message-text > * {
          animation:
            lineIn 0.4s ease both;
        }

        .message-text {
          width: 100%;
        }

        .message-line {
          min-height: 1.5em;
        }

        .message-space {
          height: 6px;
        }

        .message-heading {
          margin: 14px 0 6px;
          line-height: 1.5;
          font-weight: 800;
          color: #120f33;
        }

        .message-text
          > .message-heading:first-child {
          margin-top: 2px;
        }

        .heading-1 {
          font-size: 21px;
        }

        .heading-2 {
          font-size: 18px;
        }

        .heading-3 {
          font-size: 16.5px;
        }

        .message-list-item {
          display: flex;
          gap: 9px;
          align-items: flex-start;
          margin: 4px 0;
        }

        .list-dot {
          color: #7c5cff;
          flex: 0 0 auto;
        }

        .list-number {
          color: #6a4df0;
          font-weight: 800;
          min-width: 24px;
        }

        .list-content {
          min-width: 0;
        }

        .inline-bold {
          font-weight: 800;
          color: #120f33;
        }

        .inline-code {
          direction: ltr;
          unicode-bidi: plaintext;
          display: inline-block;
          padding: 0 6px;
          border-radius: 6px;
          background:
            rgba(106, 77, 240, 0.11);
          color: #4a36d6;
          font-family:
            ui-monospace,
            SFMono-Regular,
            Menlo,
            Consolas,
            monospace;
          font-size: 0.88em;
          line-height: 1.7;
        }

        .inline-link {
          color: #4a36d6;
          text-decoration: underline;
          text-underline-offset: 3px;
          text-decoration-color:
            rgba(74, 54, 214, 0.4);
        }

        .message-rule {
          height: 1px;
          margin: 14px 0;
          border: 0;
          background:
            rgba(29, 26, 61, 0.12);
        }

        .message-quote {
          margin: 10px 0;
          padding: 8px 14px;
          border-radius: 10px;
          border-inline-start: 3px solid
            #7c5cff;
          background:
            rgba(106, 77, 240, 0.07);
          color:
            rgba(29, 26, 61, 0.78);
        }

        .table-wrap {
          margin: 12px 0;
          overflow-x: auto;
          border-radius: 12px;
          border: 1px solid
            rgba(29, 26, 61, 0.12);
        }

        .message-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13.5px;
          line-height: 1.7;
        }

        .message-table th,
        .message-table td {
          padding: 8px 12px;
          text-align: start;
          white-space: nowrap;
          border-bottom: 1px solid
            rgba(29, 26, 61, 0.08);
        }

        .message-table th {
          background:
            rgba(106, 77, 240, 0.09);
          color: #120f33;
          font-weight: 800;
        }

        .message-table tr:last-child td {
          border-bottom: 0;
        }

        /* code block */

        .code-block {
          direction: ltr;
          text-align: left;
          width: 100%;
          margin: 12px 0;
          overflow: hidden;
          border-radius: 14px;
          background: #14122b;
          border: 1px solid
            rgba(255, 255, 255, 0.08);
          box-shadow:
            0 14px 34px
              rgba(30, 20, 90, 0.35);
          animation:
            lineIn 0.45s ease both;
        }

        .code-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 8px 6px 14px;
          background:
            rgba(255, 255, 255, 0.06);
          border-bottom: 1px solid
            rgba(255, 255, 255, 0.08);
        }

        .code-language {
          font-family:
            ui-monospace,
            SFMono-Regular,
            Menlo,
            Consolas,
            monospace;
          font-size: 11.5px;
          font-weight: 600;
          letter-spacing: 0.3px;
          color:
            rgba(210, 214, 240, 0.7);
          text-transform: lowercase;
        }

        .code-copy {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 10px;
          border: 0;
          border-radius: 8px;
          background: transparent;
          color:
            rgba(220, 224, 248, 0.8);
          font-size: 12px;
          cursor: pointer;
          transition:
            background 0.2s ease,
            color 0.2s ease;
        }

        .code-copy:hover {
          background:
            rgba(255, 255, 255, 0.1);
          color: #ffffff;
        }

        .code-copy.copied {
          color: #7ee2a8;
        }

        .code-copy svg {
          width: 15px;
          height: 15px;
        }

        .code-block pre {
          margin: 0;
          padding: 14px 16px;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
          scrollbar-color:
            rgba(255, 255, 255, 0.22)
            transparent;
        }

        .code-block code {
          color: #e8eaf8;
          font-family:
            ui-monospace,
            SFMono-Regular,
            Menlo,
            Consolas,
            "Courier New",
            monospace;
          font-size: 12.5px;
          line-height: 1.7;
          white-space: pre;
          tab-size: 2;
        }

        .code-block pre.wrap {
          overflow-x: hidden;
        }

        .code-block pre.wrap code {
          display: block;
          text-align: start;
          font-family: inherit;
          font-size: 14.5px;
          line-height: 1.95;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .tk-keyword {
          color: #c9a9ff;
        }

        .tk-string {
          color: #a5e3b5;
        }

        .tk-number {
          color: #ffc58f;
        }

        .tk-comment {
          color: #7d86a8;
          font-style: italic;
        }

        .tk-function {
          color: #8fd1ff;
        }

        .tk-type {
          color: #ffd68f;
        }

        /* actions */

        .message-actions {
          margin-top: 6px;
          display: flex;
        }

        .message-copy {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 10px;
          border: 0;
          border-radius: 8px;
          background: transparent;
          color:
            rgba(29, 26, 61, 0.55);
          font-size: 12px;
          cursor: pointer;
          transition:
            background 0.2s ease,
            color 0.2s ease;
        }

        .message-copy:hover {
          background:
            rgba(255, 255, 255, 0.7);
          color: #4a36d6;
        }

        .message-copy.copied {
          color: #138a55;
        }

        .message-copy svg {
          width: 15px;
          height: 15px;
        }

        /* jump to bottom */

        .jump-wrap {
          position: sticky;
          bottom: 10px;
          z-index: 6;
          height: 0;
          margin-top: -18px;
          display: flex;
          justify-content: center;
          pointer-events: none;
        }

        .jump {
          width: 36px;
          height: 36px;
          margin-top: -36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          border: 1px solid
            rgba(255, 255, 255, 0.95);
          background:
            rgba(255, 255, 255, 0.9);
          color: #4a36d6;
          box-shadow:
            0 8px 24px
              rgba(86, 66, 200, 0.28);
          cursor: pointer;
          opacity: 0;
          transform:
            translateY(8px)
            scale(0.8);
          pointer-events: none;
          transition:
            opacity 0.25s ease,
            transform 0.25s
              cubic-bezier(.2,.8,.2,1);
        }

        .jump.show {
          opacity: 1;
          transform:
            translateY(0)
            scale(1);
          pointer-events: auto;
        }

        .jump svg {
          width: 18px;
          height: 18px;
        }

        /* =====================================================
           COMPOSER
        ===================================================== */

        .composer-zone {
          position: relative;
          z-index: 20;
          width: 100%;
          padding:
            7px 18px
            10px;
          background:
            linear-gradient(
              to top,
              rgba(214, 204, 255, 0.92),
              rgba(214, 204, 255, 0.55)
                60%,
              transparent
            );
          animation:
            introUp 0.8s
              cubic-bezier(.2,.8,.2,1)
              1.5s backwards;
        }

        .image-preview-wrap {
          width: 100%;
          max-width: 760px;
          margin: 0 auto 8px;
          display: flex;
          justify-content: flex-end;
          animation:
            riseIn 0.35s
              cubic-bezier(.2,.8,.2,1)
              both;
        }

        .image-preview-card {
          width: min(
            330px,
            100%
          );
          min-height: 70px;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 7px 8px;
          border-radius: 16px;
          background:
            rgba(255, 255, 255, 0.82);
          border: 1px solid
            rgba(255, 255, 255, 0.95);
          box-shadow:
            0 10px 28px
              rgba(86, 66, 200, 0.2);
          backdrop-filter: blur(15px);
        }

        .image-preview {
          width: 54px;
          height: 54px;
          flex: 0 0 54px;
          object-fit: cover;
          border-radius: 10px;
          border: 1px solid
            rgba(106, 77, 240, 0.3);
        }

        .image-preview-info {
          min-width: 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .image-preview-info span {
          font-size: 11px;
          font-weight: 700;
          color: #1d1a3d;
        }

        .image-preview-info small {
          color:
            rgba(29, 26, 61, 0.6);
          font-size: 9px;
        }

        .remove-image {
          width: 29px;
          height: 29px;
          flex: 0 0 29px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          border: 1px solid
            rgba(106, 77, 240, 0.25);
          background:
            rgba(106, 77, 240, 0.1);
          color: #4a36d6;
          cursor: pointer;
        }

        .remove-image svg {
          width: 17px;
          height: 17px;
        }

        .composer {
          width: 100%;
          max-width: 760px;
          min-height: 66px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 7px 7px 7px 9px;
          border-radius: 25px;
          background:
            rgba(255, 255, 255, 0.8);
          border: 1px solid
            rgba(255, 255, 255, 0.98);
          box-shadow:
            0 14px 40px
              rgba(86, 66, 200, 0.24),
            inset 0 1px 0
              rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          transition:
            border-color 0.25s ease,
            box-shadow 0.25s ease;
        }

        .composer:focus-within {
          border-color:
            rgba(124, 92, 255, 0.7);
          box-shadow:
            0 0 0 4px
              rgba(124, 92, 255, 0.18),
            0 14px 40px
              rgba(86, 66, 200, 0.28),
            inset 0 1px 0
              rgba(255, 255, 255, 0.9);
        }

        .composer textarea {
          min-width: 0;
          flex: 1;
          height: 44px;
          max-height: 110px;
          resize: none;
          border: 0;
          outline: 0;
          background: transparent;
          color: #1d1a3d;
          caret-color: #6a4df0;
          padding: 9px 4px;
          text-align: right;
          direction: rtl;
          line-height: 26px;
          font-size: 16px;
        }

        .composer textarea::placeholder {
          color:
            rgba(29, 26, 61, 0.42);
        }

        .composer textarea:disabled {
          opacity: 0.6;
        }

        .upload {
          position: relative;
          width: 36px;
          height: 36px;
          flex: 0 0 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          border: 1px solid
            rgba(106, 77, 240, 0.25);
          background:
            rgba(106, 77, 240, 0.08);
          color: #5b3fe0;
          cursor: pointer;
          transition:
            transform 0.2s ease,
            border-color 0.2s ease,
            background 0.2s ease;
        }

        .upload:hover {
          transform: translateY(-1px);
          border-color:
            rgba(106, 77, 240, 0.6);
          background:
            rgba(106, 77, 240, 0.16);
        }

        .upload:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .upload-icon {
          width: 19px;
          height: 19px;
        }

        .upload-tooltip {
          position: absolute;
          bottom: calc(100% + 9px);
          right: 50%;
          transform:
            translateX(50%)
            translateY(4px);
          padding: 5px 8px;
          border-radius: 7px;
          background: #1d1a3d;
          color: white;
          white-space: nowrap;
          font-size: 10px;
          opacity: 0;
          pointer-events: none;
          transition:
            opacity 0.2s ease,
            transform 0.2s ease;
        }

        .upload:hover .upload-tooltip {
          opacity: 1;
          transform:
            translateX(50%)
            translateY(0);
        }

        .send {
          position: relative;
          isolation: isolate;
          width: 38px;
          height: 38px;
          flex: 0 0 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          border: 1px solid
            rgba(255, 255, 255, 0.5);
          background:
            radial-gradient(
              circle at 32% 24%,
              #a58aff,
              #6a4df0 58%,
              #4535c8
            );
          color: white;
          cursor: pointer;
          box-shadow:
            0 6px 18px
              rgba(106, 77, 240, 0.5),
            inset 0 1px 2px
              rgba(255, 255, 255, 0.45);
          transition:
            transform 0.22s
              cubic-bezier(.2,.8,.2,1),
            box-shadow 0.22s ease,
            filter 0.22s ease;
        }

        /*
          نور چرخان دور دکمه ارسال
        */

        .send::before {
          content: "";
          position: absolute;
          inset: -3px;
          z-index: -1;
          border-radius: 50%;
          background:
            conic-gradient(
              from 0deg,
              transparent 0deg,
              rgba(190, 91, 255, 0.95)
                65deg,
              rgba(35, 200, 255, 0.95)
                145deg,
              transparent 215deg,
              rgba(255, 110, 190, 0.9)
                300deg,
              transparent 360deg
            );
          filter: blur(1px);
          opacity: 0.8;
          animation:
            sendRing 5s linear
            infinite;
        }

        .send.is-loading::before {
          opacity: 1;
          animation-duration: 1.4s;
        }

        .send::after {
          content: "";
          position: absolute;
          inset: 2px;
          border-radius: 50%;
          border: 1px solid
            rgba(255, 255, 255, 0.3);
          pointer-events: none;
        }

        .send:hover {
          transform:
            translateY(-1px)
            scale(1.06);
          filter: brightness(1.08);
          box-shadow:
            0 8px 26px
              rgba(125, 90, 255, 0.65),
            inset 0 1px 2px
              rgba(255, 255, 255, 0.5);
        }

        .send:active {
          transform: scale(0.9);
        }

        .send:focus-visible {
          outline:
            2px solid
              rgba(42, 160, 255, 0.9);
          outline-offset: 4px;
        }

        .send:disabled {
          opacity: 0.45;
          cursor: not-allowed;
          transform: none;
          filter: grayscale(0.2);
        }

        .send:disabled::before {
          animation: none;
          opacity: 0.2;
        }

        .send-icon {
          position: relative;
          z-index: 3;
          width: 20px;
          height: 20px;
          filter:
            drop-shadow(
              0 0 4px
                rgba(255, 255, 255, 0.5)
            );
          transform: none;
        }

        .stop-icon {
          position: relative;
          z-index: 3;
          width: 15px;
          height: 15px;
          color: white;
        }

        /*
          چیدمان کادر تایپ (صفحه راست‌به‌چپ است):
          ارسال = راست، نوشتن = وسط، عکس = چپ
        */

        .send {
          order: 1;
        }

        .composer textarea {
          order: 2;
        }

        .upload {
          order: 3;
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
            rgba(29, 26, 61, 0.52);
          font-size: 10px;
          line-height: 10px;
        }

        .footer span:first-child {
          color: #6a4df0;
          font-weight: 700;
        }

        /* =====================================================
           INTRO
        ===================================================== */

        .intro-overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          pointer-events: none;
          background:
            linear-gradient(
              150deg,
              #6b4bff 0%,
              #4f80ff 52%,
              #ff8ccf 100%
            );
          animation:
            introReveal 0.85s
              cubic-bezier(.7,0,.2,1)
              1.15s forwards;
        }

        .intro-glow {
          position: absolute;
          width: 420px;
          height: 420px;
          border-radius: 50%;
          background:
            radial-gradient(
              circle,
              rgba(255, 255, 255, 0.4),
              transparent 65%
            );
          animation:
            haloPulse 2.4s ease-in-out
              infinite;
        }

        .intro-word,
        .intro-line,
        .intro-tag {
          position: relative;
          animation:
            introFade 0.4s ease
              1.0s forwards;
        }

        .intro-word {
          display: flex;
          direction: ltr;
          font-size: 40px;
          font-weight: 900;
          letter-spacing: 8px;
          color: #ffffff;
          text-shadow:
            0 0 24px
              rgba(255, 255, 255, 0.6);
        }

        .intro-word span {
          display: inline-block;
          opacity: 0;
          animation:
            introLetter 0.6s
              cubic-bezier(.2,.8,.2,1)
              forwards;
        }

        .intro-line {
          width: 0;
          height: 2px;
          border-radius: 2px;
          background:
            rgba(255, 255, 255, 0.9);
          box-shadow:
            0 0 14px
              rgba(255, 255, 255, 0.9);
          animation:
            introLine 0.7s
              cubic-bezier(.2,.8,.2,1)
              0.5s forwards,
            introFade 0.4s ease
              1.0s forwards;
        }

        .intro-tag {
          padding: 4px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 3px;
          color: #ffffff;
          border: 1px solid
            rgba(255, 255, 255, 0.7);
          background:
            rgba(255, 255, 255, 0.18);
        }

        /* =====================================================
           KEYFRAMES
        ===================================================== */

        @keyframes sendRing {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @keyframes riseIn {
          from {
            opacity: 0;
            transform: translateY(14px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes homeIn {
          from {
            opacity: 0;
            transform:
              translateY(22px)
              scale(0.96);
          }

          to {
            opacity: 1;
            transform: none;
          }
        }

        @keyframes introDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }

          to {
            opacity: 1;
            transform: none;
          }
        }

        @keyframes introUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }

          to {
            opacity: 1;
            transform: none;
          }
        }

        @keyframes userIn {
          from {
            opacity: 0;
            transform:
              translateY(12px)
              scale(0.94);
          }

          to {
            opacity: 1;
            transform:
              translateY(0)
              scale(1);
          }
        }

        @keyframes aiIn {
          from {
            opacity: 0;
            transform:
              translateX(-10px)
              translateY(8px)
              scale(0.96);
          }

          to {
            opacity: 1;
            transform: none;
          }
        }

        @keyframes lineIn {
          from {
            opacity: 0;
            transform: translateY(5px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes haloPulse {
          0%,
          100% {
            opacity: 0.55;
            transform: scale(0.96);
          }

          50% {
            opacity: 0.95;
            transform: scale(1.04);
          }
        }

        @keyframes glowDriftA {
          from {
            transform: translate(0, 0);
          }

          to {
            transform: translate(50px, 40px);
          }
        }

        @keyframes glowDriftB {
          from {
            transform: translate(0, 0);
          }

          to {
            transform: translate(-50px, -40px);
          }
        }

        @keyframes glowDriftC {
          from {
            transform: translate(0, 0);
          }

          to {
            transform: translate(40px, -50px);
          }
        }

        @keyframes twinkle {
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

        @keyframes titleShift {
          from {
            background-position: 0% 0;
          }

          to {
            background-position: 250% 0;
          }
        }

        @keyframes wordCycle {
          0% {
            opacity: 0;
            transform: translateY(14px);
          }

          4%,
          17% {
            opacity: 1;
            transform: translateY(0);
          }

          21%,
          100% {
            opacity: 0;
            transform: translateY(-14px);
          }
        }

        @keyframes hintBounce {
          0%,
          100% {
            transform: translateY(-2px);
          }

          50% {
            transform: translateY(3px);
          }
        }

        @keyframes typingDot {
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

        @keyframes shimmer {
          from {
            background-position: 150% 0;
          }

          to {
            background-position: -50% 0;
          }
        }

        @keyframes caretBlink {
          0%,
          100% {
            opacity: 1;
          }

          50% {
            opacity: 0.15;
          }
        }

        @keyframes introLetter {
          from {
            opacity: 0;
            transform:
              translateY(18px)
              scale(0.9);
          }

          to {
            opacity: 1;
            transform: none;
          }
        }

        @keyframes introLine {
          from {
            width: 0;
          }

          to {
            width: 150px;
          }
        }

        @keyframes introFade {
          to {
            opacity: 0;
            transform: translateY(-10px);
          }
        }

        @keyframes introReveal {
          from {
            -webkit-clip-path:
              circle(150% at 50% 50%);
            clip-path:
              circle(150% at 50% 50%);
          }

          to {
            -webkit-clip-path:
              circle(0% at 50% 50%);
            clip-path:
              circle(0% at 50% 50%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .intro-overlay {
            display: none;
          }

          .header,
          .composer-zone,
          .home-content > *,
          .message,
          .user-bubble,
          .ai-body,
          .message-text > *,
          .code-block,
          .bg-glow,
          .bg-spark,
          .rotator span,
          .home-title strong,
          .home-hint svg,
          .thinking-text,
          .thinking-dots i,
          .ai-content.streaming
            .message-text:last-child
            > :last-child::after {
            animation: none;
          }

          .rotator span:first-child {
            opacity: 1;
          }
        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 500px) {
          .header {
            height: 72px;
            padding:
              16px 18px 0;
          }

          .wordmark {
            font-size: 13px;
            letter-spacing: 5px;
            padding-top: 8px;
          }

          .back {
            height: 40px;
            padding: 0 14px;
            font-size: 12px;
          }

          .page-content {
            height: calc(100svh - 72px);
          }

          .message-area {
            padding: 0 14px;
          }

          .home-title {
            margin-top: 18px;
            font-size: 36px;
          }

          .rotator {
            font-size: 20px;
            height: 36px;
          }

          .home-sub {
            font-size: 13.5px;
          }

          .home-hint {
            margin-top: 24px;
          }

          .messages {
            padding-top: 18px;
            gap: 16px;
          }

          .user-bubble {
            max-width: 88%;
            font-size: 15px;
            padding: 10px 14px;
          }

          .ai-body {
            max-width: 96%;
          }

          .ai-bubble {
            font-size: 15px;
            padding: 11px 14px;
          }

          .sent-image {
            width: 104px;
            height: 104px;
          }

          .composer-zone {
            padding:
              7px 12px 10px;
          }

          .composer {
            min-height: 59px;
            border-radius: 20px;
            gap: 6px;
          }

          .upload {
            width: 34px;
            height: 34px;
            flex-basis: 34px;
            border-radius: 10px;
          }

          .upload-icon {
            width: 18px;
            height: 18px;
          }

          .upload-tooltip {
            display: none;
          }

          .send {
            width: 36px;
            height: 36px;
            flex-basis: 36px;
          }

          .send-icon {
            width: 19px;
            height: 19px;
          }

          .stop-icon {
            width: 14px;
            height: 14px;
          }

          .footer {
            font-size: 9px;
            line-height: 9px;
          }

          .image-preview-card {
            width: min(
              310px,
              100%
            );
            min-height: 68px;
            padding: 6px 7px;
            border-radius: 15px;
          }

          .image-preview {
            width: 52px;
            height: 52px;
            flex-basis: 52px;
            border-radius: 10px;
          }

          .remove-image {
            width: 27px;
            height: 27px;
            flex-basis: 27px;
          }

          .intro-word {
            font-size: 34px;
            letter-spacing: 6px;
          }
        }

        @media (max-height: 760px) and (max-width: 500px) {
          .home-title {
            margin-top: 14px;
            font-size: 32px;
          }

          .home-hint {
            margin-top: 18px;
          }
        }

        /* =====================================================
           LIVE VOICE — دکمه داخل کادر پیام
        ===================================================== */

        .send-swap {
          position: relative;
          z-index: 3;
          display: grid;
          place-items: center;
          width: 100%;
          height: 100%;
        }

        .send-swap > span {
          grid-area: 1 / 1;
          display: grid;
          place-items: center;
          transition:
            opacity 0.28s ease,
            transform 0.42s cubic-bezier(.2,.9,.3,1.25);
        }

        .send:not(.is-voice) .swap-voice {
          opacity: 0;
          transform: scale(0.35) rotate(-80deg);
        }

        .send.is-voice .swap-arrow {
          opacity: 0;
          transform: translateY(9px) scale(0.35);
        }

        .voice-icon .vb {
          fill: currentColor;
          transform-box: fill-box;
          transform-origin: center;
        }

        .send.is-voice .voice-icon .vb {
          animation: lvBar 1.25s ease-in-out infinite;
        }

        .send.is-voice .voice-icon .vb2 { animation-delay: 0.12s; }
        .send.is-voice .voice-icon .vb3 { animation-delay: 0.24s; }
        .send.is-voice .voice-icon .vb4 { animation-delay: 0.36s; }
        .send.is-voice .voice-icon .vb5 { animation-delay: 0.48s; }

        @keyframes lvBar {
          0%,
          100% {
            transform: scaleY(0.55);
          }

          50% {
            transform: scaleY(1.12);
          }
        }

        /* =====================================================
           LIVE VOICE — صفحه مکالمه
        ===================================================== */

        .lv-root {
          position: fixed;
          inset: 0;
          z-index: 300;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          color: #1d1a3d;
          direction: rtl;
          font-family: inherit;
          background:
            radial-gradient(
              120% 60% at 50% -10%,
              rgba(255, 255, 255, 0.75),
              transparent 60%
            ),
            linear-gradient(
              165deg,
              #d3c7ff 0%,
              #c4d8ff 52%,
              #e5d3ff 100%
            );
          -webkit-clip-path: circle(150vmax at var(--ox) var(--oy));
          clip-path: circle(150vmax at var(--ox) var(--oy));
          animation:
            lvOpen 0.85s cubic-bezier(.2,.8,.2,1) both;
        }

        .lv-root.closing {
          animation:
            lvClose 0.46s cubic-bezier(.6,0,.4,1) both;
        }

        @keyframes lvOpen {
          from {
            -webkit-clip-path: circle(0px at var(--ox) var(--oy));
            clip-path: circle(0px at var(--ox) var(--oy));
          }

          to {
            -webkit-clip-path: circle(150vmax at var(--ox) var(--oy));
            clip-path: circle(150vmax at var(--ox) var(--oy));
          }
        }

        @keyframes lvClose {
          from {
            -webkit-clip-path: circle(150vmax at var(--ox) var(--oy));
            clip-path: circle(150vmax at var(--ox) var(--oy));
          }

          to {
            -webkit-clip-path: circle(0px at var(--ox) var(--oy));
            clip-path: circle(0px at var(--ox) var(--oy));
          }
        }

        .lv-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .lv-glow {
          position: absolute;
          inset: -10%;
          opacity: 0;
          transition: opacity 0.9s ease;
        }

        .g-listen {
          background:
            radial-gradient(55% 40% at 50% 46%, rgba(70, 190, 255, 0.55), transparent 70%),
            radial-gradient(40% 30% at 15% 90%, rgba(100, 140, 255, 0.4), transparent 70%);
        }

        .g-hear {
          background:
            radial-gradient(58% 42% at 50% 46%, rgba(130, 90, 255, 0.6), transparent 70%),
            radial-gradient(40% 30% at 85% 90%, rgba(190, 110, 255, 0.4), transparent 70%);
        }

        .g-think {
          background:
            radial-gradient(55% 40% at 50% 46%, rgba(150, 100, 255, 0.5), transparent 70%),
            radial-gradient(45% 35% at 20% 85%, rgba(255, 110, 190, 0.38), transparent 70%),
            radial-gradient(40% 30% at 85% 15%, rgba(60, 190, 255, 0.35), transparent 70%);
        }

        .g-speak {
          background:
            radial-gradient(60% 44% at 50% 46%, rgba(255, 110, 190, 0.55), transparent 70%),
            radial-gradient(45% 35% at 80% 88%, rgba(150, 100, 255, 0.5), transparent 70%),
            radial-gradient(40% 30% at 15% 12%, rgba(255, 190, 140, 0.35), transparent 70%);
        }

        .phase-starting .g-listen,
        .phase-listening .g-listen,
        .phase-error .g-listen,
        .phase-hearing .g-hear,
        .phase-thinking .g-think,
        .phase-speaking .g-speak {
          opacity: 1;
        }

        .lv-spark {
          position: absolute;
          bottom: -20px;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #ffffff;
          box-shadow:
            0 0 10px rgba(124, 92, 255, 0.9),
            0 0 22px rgba(124, 92, 255, 0.5);
          opacity: 0;
          animation: lvRise 9s ease-in infinite;
        }

        .lv-spark.k1 { left: 8%; animation-delay: 0s; }
        .lv-spark.k2 { left: 22%; animation-delay: 2.4s; width: 4px; height: 4px; }
        .lv-spark.k3 { left: 36%; animation-delay: 5.1s; }
        .lv-spark.k4 { left: 50%; animation-delay: 1.2s; width: 8px; height: 8px; }
        .lv-spark.k5 { left: 63%; animation-delay: 6.3s; width: 4px; height: 4px; }
        .lv-spark.k6 { left: 76%; animation-delay: 3.3s; }
        .lv-spark.k7 { left: 88%; animation-delay: 7.2s; width: 5px; height: 5px; }
        .lv-spark.k8 { left: 94%; animation-delay: 4.2s; width: 4px; height: 4px; }

        @keyframes lvRise {
          0% {
            opacity: 0;
            transform: translateY(0) scale(0.6);
          }

          15% {
            opacity: 0.9;
          }

          100% {
            opacity: 0;
            transform: translateY(-78vh) scale(1.2);
          }
        }

        .lv-top {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: calc(16px + env(safe-area-inset-top)) 18px 0;
          animation: lvFade 0.7s ease 0.35s both;
        }

        .lv-minimize {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 40px;
          padding: 0 14px 0 10px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.95);
          background: rgba(255, 255, 255, 0.6);
          color: #1d1a3d;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          -webkit-backdrop-filter: blur(16px);
          backdrop-filter: blur(16px);
          box-shadow: 0 8px 22px rgba(80, 60, 200, 0.16);
        }

        .lv-minimize svg {
          width: 20px;
          height: 20px;
        }

        .lv-brand {
          display: flex;
          align-items: center;
          gap: 8px;
          direction: ltr;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 5px;
        }

        .lv-brand b {
          padding: 3px 7px 3px 9px;
          border-radius: 7px;
          font-size: 9px;
          letter-spacing: 2px;
          color: #fff;
          background: linear-gradient(135deg, #ff5fae, #7c5cff);
          box-shadow: 0 6px 16px rgba(124, 92, 255, 0.4);
        }

        .lv-top-space {
          width: 74px;
        }

        .lv-stage {
          position: relative;
          z-index: 1;
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 18px;
          padding: 0 22px;
        }

        .lv-status {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 9px 18px;
          border-radius: 999px;
          font-size: 14px;
          font-weight: 700;
          background: rgba(255, 255, 255, 0.66);
          border: 1px solid rgba(255, 255, 255, 0.96);
          box-shadow: 0 10px 28px rgba(80, 60, 200, 0.16);
          -webkit-backdrop-filter: blur(14px);
          backdrop-filter: blur(14px);
          animation: lvDrop 0.7s cubic-bezier(.2,.8,.2,1) 0.45s both;
        }

        .lv-status span {
          animation: lvFlip 0.45s cubic-bezier(.2,.8,.2,1) both;
        }

        .lv-status-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #39b5ff;
          box-shadow: 0 0 12px #39b5ff;
          animation: lvDot 1.6s ease-in-out infinite;
          transition:
            background 0.5s ease,
            box-shadow 0.5s ease;
        }

        .phase-hearing .lv-status-dot {
          background: #7c5cff;
          box-shadow: 0 0 12px #7c5cff;
        }

        .phase-thinking .lv-status-dot {
          background: #c264ff;
          box-shadow: 0 0 12px #c264ff;
        }

        .phase-speaking .lv-status-dot {
          background: #ff5fae;
          box-shadow: 0 0 12px #ff5fae;
        }

        .lv-orb-wrap {
          position: relative;
          display: grid;
          place-items: center;
          width: min(340px, 86vw);
          height: min(340px, 86vw);
          animation: lvPop 1s cubic-bezier(.2,1.15,.3,1) 0.3s both;
        }

        .lv-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .lv-ring {
          position: absolute;
          width: 44%;
          height: 44%;
          border-radius: 50%;
          border: 1.5px solid rgba(124, 92, 255, 0.4);
          opacity: 0;
          pointer-events: none;
        }

        .phase-listening .lv-ring,
        .phase-hearing .lv-ring,
        .phase-speaking .lv-ring {
          animation: lvRipple 3.4s ease-out infinite;
        }

        .phase-hearing .lv-ring {
          animation-duration: 2.2s;
        }

        .lv-ring.r2 {
          animation-delay: 1.1s;
        }

        .lv-ring.r3 {
          animation-delay: 2.2s;
        }

        .phase-hearing .lv-ring.r2 {
          animation-delay: 0.7s;
        }

        .phase-hearing .lv-ring.r3 {
          animation-delay: 1.4s;
        }

        @keyframes lvRipple {
          0% {
            transform: scale(1);
            opacity: 0.55;
          }

          100% {
            transform: scale(2.3);
            opacity: 0;
          }
        }

        .lv-orb {
          --lvl: 0;
          position: relative;
          width: 44%;
          height: 44%;
          border-radius: 50%;
          transform: scale(calc(1 + var(--lvl) * 0.2));
          will-change: transform;
          filter: drop-shadow(0 22px 44px rgba(90, 60, 230, 0.4));
        }

        .lv-orb-body {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          animation: lvBreathe 4.2s ease-in-out infinite;
        }

        .lv-orb .o {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          opacity: 0;
          transition: opacity 0.7s ease;
        }

        .o-listen {
          background:
            radial-gradient(
              circle at 32% 26%,
              #f1fcff 0,
              #86dcff 28%,
              #4f8bff 62%,
              #3a4fe0 100%
            );
        }

        .o-hear {
          background:
            radial-gradient(
              circle at 32% 26%,
              #f5f0ff,
              #b89cff 30%,
              #7c5cff 64%,
              #4a35d4 100%
            );
        }

        .o-speak {
          background:
            radial-gradient(
              circle at 32% 26%,
              #fff1f9,
              #ff9fd0 28%,
              #c264ff 62%,
              #6a45f0 100%
            );
        }

        .o-think {
          background:
            conic-gradient(
              from 0deg,
              #6d4cff,
              #1fc3f2,
              #ff5fae,
              #6d4cff
            );
          animation: lvSpin 2.2s linear infinite;
        }

        .o-gloss {
          opacity: 1 !important;
          background:
            radial-gradient(
              circle at 30% 22%,
              rgba(255, 255, 255, 0.9),
              transparent 44%
            );
          mix-blend-mode: screen;
        }

        .phase-starting .o-listen,
        .phase-listening .o-listen,
        .phase-error .o-listen,
        .phase-hearing .o-hear,
        .phase-thinking .o-think,
        .phase-speaking .o-speak {
          opacity: 1;
        }

        .lv-captions {
          width: min(420px, 100%);
          min-height: 104px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          text-align: center;
          animation: lvRiseIn 0.8s cubic-bezier(.2,.8,.2,1) 0.6s both;
        }

        .lv-captions p {
          margin: 0;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 3;
          overflow: hidden;
          overflow-wrap: anywhere;
        }

        .lv-user {
          font-size: 14.5px;
          line-height: 1.9;
          color: rgba(29, 26, 61, 0.62);
          animation: lvRiseIn 0.45s ease both;
        }

        .lv-ai {
          font-size: 19px;
          line-height: 1.85;
          font-weight: 700;
          color: #1d1a3d;
        }

        .lv-notice {
          padding: 6px 14px;
          border-radius: 12px;
          font-size: 13px;
          line-height: 1.8;
          color: #8a2a52;
          background: rgba(255, 255, 255, 0.7);
          animation: lvRiseIn 0.4s ease both;
        }

        .lv-hint {
          font-size: 15px;
          line-height: 1.9;
          color: rgba(29, 26, 61, 0.62);
        }

        .lv-controls {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 18px;
          padding: 10px 20px calc(30px + env(safe-area-inset-bottom));
          animation: lvRiseIn 0.8s cubic-bezier(.2,.8,.2,1) 0.7s both;
        }

        .lv-btn {
          display: grid;
          place-items: center;
          width: 58px;
          height: 58px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.97);
          background: rgba(255, 255, 255, 0.72);
          color: #3b2fb8;
          cursor: pointer;
          -webkit-backdrop-filter: blur(16px);
          backdrop-filter: blur(16px);
          box-shadow: 0 14px 34px rgba(80, 60, 200, 0.22);
          transition:
            transform 0.3s cubic-bezier(.2,.9,.3,1.25),
            opacity 0.3s ease,
            background 0.25s ease,
            color 0.25s ease;
        }

        .lv-btn svg {
          width: 26px;
          height: 26px;
        }

        .lv-btn:hover {
          transform: translateY(-2px) scale(1.05);
        }

        .lv-btn:active {
          transform: scale(0.92);
        }

        .lv-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .lv-btn.is-on {
          color: #fff;
          background: linear-gradient(135deg, #8b6cff, #4f7cff);
        }

        .lv-btn.is-hidden {
          opacity: 0;
          pointer-events: none;
          transform: scale(0.5);
        }

        .lv-btn.lv-end {
          width: 70px;
          height: 70px;
          color: #fff;
          border-color: rgba(255, 255, 255, 0.5);
          background: linear-gradient(135deg, #ff6b9a, #ff4570);
          box-shadow:
            0 16px 38px rgba(255, 69, 112, 0.45),
            inset 0 1px 2px rgba(255, 255, 255, 0.5);
        }

        .lv-btn.lv-end svg {
          width: 30px;
          height: 30px;
        }

        .lv-fatal {
          position: relative;
          z-index: 1;
          flex: 1;
          display: grid;
          place-items: center;
          padding: 0 24px;
        }

        .lv-fatal-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          width: min(380px, 100%);
          padding: 32px 24px;
          border-radius: 28px;
          text-align: center;
          background: rgba(255, 255, 255, 0.78);
          border: 1px solid rgba(255, 255, 255, 0.98);
          box-shadow: 0 26px 60px rgba(80, 60, 200, 0.22);
          animation: lvPop 0.7s cubic-bezier(.2,1.15,.3,1) both;
        }

        .lv-fatal-icon {
          display: grid;
          place-items: center;
          width: 58px;
          height: 58px;
          border-radius: 50%;
          color: #fff;
          background: linear-gradient(135deg, #ff6b9a, #ff4570);
          box-shadow: 0 14px 30px rgba(255, 69, 112, 0.4);
        }

        .lv-fatal-icon svg {
          width: 28px;
          height: 28px;
        }

        .lv-fatal-card p {
          margin: 0;
          font-size: 15px;
          line-height: 2;
          color: #1d1a3d;
        }

        .lv-fatal-card button {
          padding: 12px 26px;
          border: 0;
          border-radius: 999px;
          font-size: 14px;
          font-weight: 800;
          color: #fff;
          cursor: pointer;
          background: linear-gradient(135deg, #7c5cff, #4f7cff);
          box-shadow: 0 12px 28px rgba(100, 80, 240, 0.4);
        }

        @keyframes lvFade {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        @keyframes lvDrop {
          from {
            opacity: 0;
            transform: translateY(-16px);
          }

          to {
            opacity: 1;
            transform: none;
          }
        }

        @keyframes lvRiseIn {
          from {
            opacity: 0;
            transform: translateY(18px);
          }

          to {
            opacity: 1;
            transform: none;
          }
        }

        @keyframes lvFlip {
          from {
            opacity: 0;
            transform: translateY(8px);
          }

          to {
            opacity: 1;
            transform: none;
          }
        }

        @keyframes lvPop {
          from {
            opacity: 0;
            transform: scale(0.4);
          }

          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes lvBreathe {
          0%,
          100% {
            transform: scale(1);
          }

          50% {
            transform: scale(1.045);
          }
        }

        @keyframes lvSpin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes lvDot {
          0%,
          100% {
            transform: scale(1);
            opacity: 1;
          }

          50% {
            transform: scale(1.5);
            opacity: 0.55;
          }
        }

        @media (max-height: 700px) {
          .lv-stage {
            gap: 10px;
          }

          .lv-orb-wrap {
            width: min(280px, 74vw);
            height: min(280px, 74vw);
          }

          .lv-captions {
            min-height: 84px;
          }

          .lv-ai {
            font-size: 17px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .lv-root,
          .lv-root.closing {
            animation: lvFade 0.2s ease both;
            -webkit-clip-path: none;
            clip-path: none;
          }

          .lv-spark,
          .lv-ring,
          .lv-orb-body,
          .o-think,
          .lv-status-dot,
          .send.is-voice .voice-icon .vb {
            animation: none !important;
          }
        }
      `}</style>
    </main>
  );
}
