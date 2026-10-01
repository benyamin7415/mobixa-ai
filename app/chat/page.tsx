"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
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
  "markdown", "md",
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

  return (
    <div className="code-block">
      <div className="code-header">
        <span className="code-language">
          {language || "code"}
        </span>

        <CopyButton
          text={code}
          className="code-copy"
        />
      </div>

      <pre>
        <code>{nodes}</code>
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

  const lines = content
    .replace(/\r/g, "")
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

  for (const line of lines) {
    const match = line.match(
      /^\s*```(.*)$/
    );

    if (match) {
      if (!insideCode) {
        flushText();
        insideCode = true;
        codeLanguage = match[1].trim();
        codeBuffer = [];
      } else {
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
    output.push(
      <CodeBlock
        key={`code-${output.length}`}
        code={codeBuffer.join("\n")}
        language={codeLanguage}
      />
    );
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
              className={`send${
                loading
                  ? " is-loading"
                  : ""
              }`}
              onClick={() => {
                if (loading) {
                  stopGeneration();
                } else {
                  void sendMessage();
                }
              }}
              disabled={
                !loading &&
                !input.trim() &&
                !selectedImage &&
                !lastImageDataUrlRef.current
              }
              aria-label={
                loading
                  ? "توقف"
                  : "ارسال"
              }
            >
              {loading ? (
                <StopIcon />
              ) : (
                <SendIcon />
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
      `}</style>
    </main>
  );
}
