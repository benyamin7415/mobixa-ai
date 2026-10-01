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

function CreateIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path
        d="m5 27 5.5-1.5L25 11l-4-4L6.5 21.5 5 27Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      <path
        d="m18 8 4 4M22 4v4M20 6h4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LearnIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path
        d="M4 7 16 3l12 4v18l-12 4-12-4V7Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      <path
        d="M16 3v26M4 7l12 4 12-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function IdeaIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path
        d="M10 23c-2-1.7-3-4.1-3-6.8C7 10.6 11 7 16 7s9 3.6 9 9.2c0 2.7-1 5.1-3 6.8-1.2 1-1.8 2.2-2 3.5H12c-.2-1.3-.8-2.5-2-3.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />

      <path
        d="M12 30h8M14 26h4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <path
        d="M16 2v2M28 10h-2M6 10H4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
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
   BRAND
========================================================= */

function MobixaEmblem() {
  return (
    <div className="emblem" aria-hidden="true">
      <div className="emblem-halo" />
      <div className="emblem-ring" />

      <div className="emblem-core">
        <svg viewBox="0 0 48 48" className="emblem-m">
          <defs>
            <linearGradient
              id="emblemGrad"
              x1="0"
              y1="0"
              x2="1"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#f4eeff"
              />

              <stop
                offset="55%"
                stopColor="#a98bff"
              />

              <stop
                offset="100%"
                stopColor="#35d8ff"
              />
            </linearGradient>
          </defs>

          <path
            d="M11 35V13l13 15 13-15v22"
            fill="none"
            stroke="url(#emblemGrad)"
            strokeWidth="3.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

function MobixaMark() {
  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden="true"
      className="ai-mark"
    >
      <path
        d="M11 35V13l13 15 13-15v22"
        fill="none"
        stroke="currentColor"
        strokeWidth="4.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M15 6l-6 6 6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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

  function goBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }

  function putSuggestion(text: string) {
    setInput(text);

    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
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
              <MobixaEmblem />

              <h1 className="home-title">
                <span>بزن بریم</span>{" "}
                <strong>مهندس</strong>
              </h1>

              <p className="home-sub">
                هر چیزی که توی ذهنته بپرس،
                ایده بده، بساز.
              </p>

              <div className="suggestions">
                <button
                  type="button"
                  className="suggestion"
                  onClick={() =>
                    putSuggestion(
                      "این متن رو برای من حرفه‌ای و جذاب‌تر کن:"
                    )
                  }
                >
                  <span className="s-icon">
                    <CreateIcon />
                  </span>

                  <span className="s-text">
                    <b>CREATE</b>

                    <span>
                      متنت رو حرفه‌ای کن
                    </span>
                  </span>

                  <span className="s-arrow">
                    <ChevronIcon />
                  </span>
                </button>

                <button
                  type="button"
                  className="suggestion"
                  onClick={() =>
                    putSuggestion(
                      "این موضوع رو خیلی ساده و قابل فهم برام توضیح بده:"
                    )
                  }
                >
                  <span className="s-icon">
                    <LearnIcon />
                  </span>

                  <span className="s-text">
                    <b>LEARN MODE</b>

                    <span>
                      هر چیزی رو ساده
                      یاد بگیر
                    </span>
                  </span>

                  <span className="s-arrow">
                    <ChevronIcon />
                  </span>
                </button>

                <button
                  type="button"
                  className="suggestion"
                  onClick={() =>
                    putSuggestion(
                      "برای این موضوع چند ایده خلاقانه و خفن بهم بده:"
                    )
                  }
                >
                  <span className="s-icon">
                    <IdeaIcon />
                  </span>

                  <span className="s-text">
                    <b>IDEA LAB</b>

                    <span>
                      یه ایده خفن بساز
                    </span>
                  </span>

                  <span className="s-arrow">
                    <ChevronIcon />
                  </span>
                </button>
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
                      <div
                        className={`ai-avatar${
                          streaming
                            ? " working"
                            : ""
                        }`}
                      >
                        <MobixaMark />
                      </div>

                      <div className="ai-body">
                        <div
                          className={`ai-content${
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
          background: #07070c;
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
            rgba(139, 123, 255, 0.38);
        }

        .mobixa {
          position: relative;
          width: 100%;
          height: 100svh;
          min-height: 100svh;
          overflow: hidden;
          color: #ececf4;
          -webkit-font-smoothing: antialiased;
          background:
            radial-gradient(
              110% 50% at 50% -10%,
              rgba(112, 92, 240, 0.26),
              transparent 64%
            ),
            #07070c;
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
          filter: blur(90px);
          will-change: transform;
        }

        .glow-one {
          width: 340px;
          height: 340px;
          left: -180px;
          top: 40%;
          background:
            rgba(104, 60, 230, 0.26);
          animation:
            glowDriftA 22s ease-in-out
              infinite alternate;
        }

        .glow-two {
          width: 320px;
          height: 320px;
          right: -180px;
          bottom: 8%;
          background:
            rgba(28, 110, 230, 0.18);
          animation:
            glowDriftB 26s ease-in-out
              infinite alternate;
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
        }

        .wordmark {
          direction: ltr;
          display: flex;
          align-items: center;
          gap: 10px;
          padding-top: 9px;
          font-size: 15px;
          font-weight: 600;
          letter-spacing: 7px;
          color: #f1f1f8;
        }

        .wordmark b {
          padding: 3px 7px 3px 9px;
          border-radius: 7px;
          border: 1px solid
            rgba(164, 140, 255, 0.45);
          background:
            rgba(120, 90, 255, 0.12);
          color: #d6ccff;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2px;
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
            rgba(255, 255, 255, 0.1);
          background:
            rgba(255, 255, 255, 0.04);
          color: #ececf4;
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition:
            border-color 0.2s ease,
            background 0.2s ease;
        }

        .back:hover {
          border-color:
            rgba(160, 145, 255, 0.5);
          background:
            rgba(130, 100, 255, 0.1);
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

        .home-content > * {
          animation:
            riseIn 0.8s
              cubic-bezier(.2,.8,.2,1)
              both;
        }

        .home-content > :nth-child(2) {
          animation-delay: 0.08s;
        }

        .home-content > :nth-child(3) {
          animation-delay: 0.16s;
        }

        .home-content > :nth-child(4) {
          animation-delay: 0.26s;
        }

        .emblem {
          position: relative;
          width: 78px;
          height: 78px;
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .emblem-halo {
          position: absolute;
          inset: -26px;
          border-radius: 50%;
          background:
            radial-gradient(
              circle,
              rgba(122, 88, 255, 0.45),
              transparent 68%
            );
          filter: blur(12px);
          animation:
            haloPulse 5s ease-in-out
              infinite;
        }

        .emblem-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          padding: 1.5px;
          background:
            conic-gradient(
              from 0deg,
              transparent 0deg,
              rgba(196, 150, 255, 0.95)
                70deg,
              rgba(53, 216, 255, 0.9)
                150deg,
              transparent 230deg,
              transparent 360deg
            );
          -webkit-mask:
            linear-gradient(#000 0 0)
              content-box,
            linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask:
            linear-gradient(#000 0 0)
              content-box,
            linear-gradient(#000 0 0);
          mask-composite: exclude;
          animation:
            spin 9s linear infinite;
        }

        .emblem-core {
          position: absolute;
          inset: 6px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            radial-gradient(
              circle at 34% 24%,
              rgba(140, 110, 255, 0.34),
              rgba(12, 11, 30, 0.95)
                68%
            );
          border: 1px solid
            rgba(255, 255, 255, 0.08);
        }

        .emblem-m {
          width: 34px;
          height: 34px;
          filter:
            drop-shadow(
              0 0 7px
                rgba(150, 120, 255, 0.65)
            );
        }

        .home-title {
          margin: 24px 0 0;
          font-size: 34px;
          line-height: 1.25;
          font-weight: 800;
          text-align: center;
        }

        .home-title span {
          color: #ffffff;
        }

        .home-title strong {
          background:
            linear-gradient(
              90deg,
              #b79bff,
              #6fdcff
            );
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .home-sub {
          margin: 10px 0 0;
          max-width: 300px;
          text-align: center;
          font-size: 14.5px;
          line-height: 1.9;
          color:
            rgba(236, 236, 244, 0.6);
        }

        .suggestions {
          width: 100%;
          max-width: 440px;
          margin-top: 28px;
          display: grid;
          gap: 10px;
        }

        .suggestion {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 12px 14px;
          border-radius: 16px;
          text-align: right;
          color: #ececf4;
          background:
            rgba(255, 255, 255, 0.035);
          border: 1px solid
            rgba(255, 255, 255, 0.09);
          cursor: pointer;
          transition:
            transform 0.25s
              cubic-bezier(.2,.8,.2,1),
            border-color 0.25s ease,
            background 0.25s ease;
        }

        .suggestion:hover {
          transform: translateY(-2px);
          border-color:
            rgba(160, 145, 255, 0.42);
          background:
            rgba(255, 255, 255, 0.06);
        }

        .suggestion:active {
          transform: scale(0.985);
        }

        .s-icon {
          width: 38px;
          height: 38px;
          flex: 0 0 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          background:
            rgba(139, 123, 255, 0.13);
          color: #cbc1ff;
        }

        .s-icon svg {
          width: 20px;
          height: 20px;
          stroke-width: 1.7;
        }

        .s-text {
          min-width: 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .s-text b {
          direction: ltr;
          text-align: right;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2px;
          color:
            rgba(190, 180, 255, 0.8);
        }

        .s-text span {
          font-size: 14px;
          color: #f1f1f8;
        }

        .s-arrow {
          width: 18px;
          height: 18px;
          flex: 0 0 18px;
          color:
            rgba(236, 236, 244, 0.35);
          transition:
            transform 0.25s ease,
            color 0.25s ease;
        }

        .s-arrow svg {
          width: 100%;
          height: 100%;
        }

        .suggestion:hover .s-arrow {
          transform: translateX(-3px);
          color: #d8ceff;
        }

        /* =====================================================
           MESSAGES
        ===================================================== */

        .messages {
          padding-top: 22px;
          padding-bottom: 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .message {
          display: flex;
          width: 100%;
        }

        /* ---- user ---- */

        .user-message {
          justify-content: flex-start;
        }

        .user-bubble {
          max-width: 84%;
          min-width: 0;
          padding: 11px 16px;
          border-radius: 20px;
          border-bottom-right-radius: 6px;
          font-size: 15.5px;
          line-height: 1.9;
          color: #f6f6fc;
          overflow-wrap: anywhere;
          background:
            linear-gradient(
              135deg,
              rgba(139, 123, 255, 0.26),
              rgba(104, 84, 240, 0.14)
            );
          border: 1px solid
            rgba(160, 145, 255, 0.28);
          box-shadow:
            0 8px 24px
              rgba(60, 40, 170, 0.18);
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
            rgba(255, 255, 255, 0.2);
        }

        /* ---- assistant ---- */

        .ai-message {
          align-items: flex-start;
          gap: 12px;
          animation:
            riseIn 0.5s
              cubic-bezier(.2,.8,.2,1)
              both;
        }

        .ai-avatar {
          position: relative;
          width: 30px;
          height: 30px;
          flex: 0 0 30px;
          margin-top: 1px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          color: #ffffff;
          background:
            radial-gradient(
              circle at 32% 24%,
              #9d82ff,
              #5b3fe0 62%,
              #3a2aa8
            );
          border: 1px solid
            rgba(255, 255, 255, 0.18);
          box-shadow:
            0 4px 14px
              rgba(106, 77, 240, 0.4);
        }

        .ai-mark {
          width: 16px;
          height: 16px;
        }

        .ai-avatar::before {
          content: "";
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          padding: 1.5px;
          background:
            conic-gradient(
              from 0deg,
              transparent,
              rgba(196, 150, 255, 0.95)
                90deg,
              rgba(53, 216, 255, 0.9)
                180deg,
              transparent 270deg
            );
          -webkit-mask:
            linear-gradient(#000 0 0)
              content-box,
            linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask:
            linear-gradient(#000 0 0)
              content-box,
            linear-gradient(#000 0 0);
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .ai-avatar.working::before {
          opacity: 1;
          animation:
            spin 1.1s linear infinite;
        }

        .ai-avatar.working {
          animation:
            avatarPulse 1.6s ease-in-out
              infinite;
        }

        .ai-body {
          min-width: 0;
          flex: 1;
        }

        .ai-content {
          padding-top: 2px;
          font-size: 15.5px;
          line-height: 2;
          color:
            rgba(242, 242, 250, 0.95);
          overflow-wrap: anywhere;
        }

        .ai-content.is-error {
          padding: 10px 14px;
          border-radius: 14px;
          color: #ffd0d4;
          background:
            rgba(255, 90, 105, 0.09);
          border: 1px solid
            rgba(255, 110, 120, 0.3);
        }

        .stopped-note {
          font-size: 13px;
          color:
            rgba(236, 236, 244, 0.45);
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
              rgba(190, 190, 218, 0.4)
                30%,
              #ffffff 50%,
              rgba(190, 190, 218, 0.4)
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
          background: #b9a8ff;
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
              #c4b5ff,
              #6a4df0
            );
          box-shadow:
            0 0 10px
              rgba(139, 123, 255, 0.85);
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
          font-weight: 700;
          color: #ffffff;
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
          color: #a98bff;
          flex: 0 0 auto;
        }

        .list-number {
          color: #a99bff;
          font-weight: 700;
          min-width: 24px;
        }

        .list-content {
          min-width: 0;
        }

        .inline-bold {
          font-weight: 800;
          color: #ffffff;
        }

        .inline-code {
          direction: ltr;
          unicode-bidi: plaintext;
          display: inline-block;
          padding: 0 6px;
          border-radius: 6px;
          background:
            rgba(255, 255, 255, 0.08);
          color: #d9d0ff;
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
          color: #a99bff;
          text-decoration: underline;
          text-underline-offset: 3px;
          text-decoration-color:
            rgba(169, 155, 255, 0.4);
        }

        .message-rule {
          height: 1px;
          margin: 14px 0;
          border: 0;
          background:
            rgba(255, 255, 255, 0.1);
        }

        .message-quote {
          margin: 10px 0;
          padding: 8px 14px;
          border-radius: 10px;
          border-inline-start: 3px solid
            rgba(160, 145, 255, 0.7);
          background:
            rgba(255, 255, 255, 0.035);
          color:
            rgba(236, 236, 244, 0.75);
        }

        .table-wrap {
          margin: 12px 0;
          overflow-x: auto;
          border-radius: 12px;
          border: 1px solid
            rgba(255, 255, 255, 0.1);
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
            rgba(255, 255, 255, 0.07);
        }

        .message-table th {
          background:
            rgba(255, 255, 255, 0.05);
          color: #ffffff;
          font-weight: 700;
        }

        .message-table tr:last-child td {
          border-bottom: 0;
        }

        /* code block */

        .code-block {
          direction: ltr;
          text-align: left;
          width: 100%;
          margin: 14px 0;
          overflow: hidden;
          border-radius: 14px;
          background: #0b0c12;
          border: 1px solid
            rgba(255, 255, 255, 0.09);
          box-shadow:
            0 12px 32px
              rgba(0, 0, 0, 0.35);
          animation:
            lineIn 0.45s ease both;
        }

        .code-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 8px 6px 14px;
          background:
            rgba(255, 255, 255, 0.04);
          border-bottom: 1px solid
            rgba(255, 255, 255, 0.07);
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
            rgba(210, 214, 240, 0.65);
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
            rgba(220, 224, 248, 0.75);
          font-size: 12px;
          cursor: pointer;
          transition:
            background 0.2s ease,
            color 0.2s ease;
        }

        .code-copy:hover {
          background:
            rgba(255, 255, 255, 0.08);
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
            rgba(255, 255, 255, 0.18)
            transparent;
        }

        .code-block code {
          color: #e4e6f5;
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
          color: #6f7794;
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
            rgba(236, 236, 244, 0.48);
          font-size: 12px;
          cursor: pointer;
          transition:
            background 0.2s ease,
            color 0.2s ease;
        }

        .message-copy:hover {
          background:
            rgba(255, 255, 255, 0.07);
          color: #ffffff;
        }

        .message-copy.copied {
          color: #7ee2a8;
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
          margin-top: -24px;
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
            rgba(255, 255, 255, 0.16);
          background:
            rgba(28, 28, 42, 0.92);
          color: #ffffff;
          box-shadow:
            0 8px 24px
              rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
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
              rgba(7, 7, 12, 0.96),
              rgba(7, 7, 12, 0.7),
              transparent
            );
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
            rgba(26, 26, 40, 0.88);
          border: 1px solid
            rgba(160, 145, 255, 0.35);
          backdrop-filter: blur(15px);
        }

        .image-preview {
          width: 54px;
          height: 54px;
          flex: 0 0 54px;
          object-fit: cover;
          border-radius: 10px;
          border: 1px solid
            rgba(255, 255, 255, 0.2);
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
          color: white;
        }

        .image-preview-info small {
          color:
            rgba(210, 214, 240, 0.6);
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
            rgba(255, 255, 255, 0.16);
          background:
            rgba(255, 255, 255, 0.07);
          color: white;
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
            rgba(24, 24, 36, 0.86);
          border: 1px solid
            rgba(255, 255, 255, 0.1);
          box-shadow:
            0 12px 40px
              rgba(0, 0, 0, 0.45),
            inset 0 1px 0
              rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          transition:
            border-color 0.25s ease,
            box-shadow 0.25s ease;
        }

        .composer:focus-within {
          border-color:
            rgba(150, 132, 255, 0.6);
          box-shadow:
            0 0 0 4px
              rgba(139, 123, 255, 0.12),
            0 12px 40px
              rgba(0, 0, 0, 0.45),
            inset 0 1px 0
              rgba(255, 255, 255, 0.05);
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
          color: #f4f4fa;
          caret-color: #a99bff;
          padding: 9px 4px;
          text-align: right;
          direction: rtl;
          line-height: 26px;
          font-size: 16px;
        }

        .composer textarea::placeholder {
          color:
            rgba(210, 214, 240, 0.45);
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
            rgba(255, 255, 255, 0.11);
          background:
            rgba(255, 255, 255, 0.04);
          color:
            rgba(236, 236, 244, 0.72);
          cursor: pointer;
          transition:
            transform 0.2s ease,
            border-color 0.2s ease,
            background 0.2s ease,
            color 0.2s ease;
        }

        .upload:hover {
          transform: translateY(-1px);
          border-color:
            rgba(160, 145, 255, 0.55);
          background:
            rgba(139, 123, 255, 0.14);
          color: #ffffff;
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
          background: rgba(12, 12, 20, 0.95);
          border: 1px solid
            rgba(255, 255, 255, 0.14);
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
            rgba(255, 255, 255, 0.26);
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
              rgba(255, 255, 255, 0.4);
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
              rgba(35, 225, 255, 0.95)
                145deg,
              transparent 215deg,
              rgba(173, 76, 255, 0.9)
                300deg,
              transparent 360deg
            );
          filter: blur(1px);
          opacity: 0.7;
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
            rgba(255, 255, 255, 0.16);
          pointer-events: none;
        }

        .send:hover {
          transform:
            translateY(-1px)
            scale(1.06);
          filter: brightness(1.1);
          box-shadow:
            0 8px 26px
              rgba(125, 90, 255, 0.7),
            inset 0 1px 2px
              rgba(255, 255, 255, 0.45);
        }

        .send:active {
          transform: scale(0.9);
        }

        .send:focus-visible {
          outline:
            2px solid
              rgba(42, 222, 255, 0.9);
          outline-offset: 4px;
        }

        .send:disabled {
          opacity: 0.4;
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
            rgba(210, 214, 240, 0.4);
          font-size: 10px;
          line-height: 10px;
        }

        .footer span:first-child {
          color:
            rgba(166, 140, 255, 0.8);
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

        @keyframes spin {
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

        @keyframes avatarPulse {
          0%,
          100% {
            box-shadow:
              0 4px 14px
                rgba(106, 77, 240, 0.4);
          }

          50% {
            box-shadow:
              0 4px 26px
                rgba(140, 110, 255, 0.85);
          }
        }

        @keyframes glowDriftA {
          from {
            transform: translate(0, 0);
          }

          to {
            transform: translate(40px, -50px);
          }
        }

        @keyframes glowDriftB {
          from {
            transform: translate(0, 0);
          }

          to {
            transform: translate(-40px, 45px);
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

        @media (prefers-reduced-motion: reduce) {
          .home-content > *,
          .message,
          .user-bubble,
          .message-text > *,
          .code-block,
          .bg-glow,
          .emblem-halo,
          .emblem-ring,
          .ai-avatar,
          .ai-avatar::before,
          .thinking-text,
          .thinking-dots i,
          .ai-content.streaming
            .message-text:last-child
            > :last-child::after {
            animation: none;
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

          .emblem {
            width: 68px;
            height: 68px;
          }

          .emblem-m {
            width: 30px;
            height: 30px;
          }

          .home-title {
            margin-top: 20px;
            font-size: 30px;
          }

          .home-sub {
            font-size: 13.5px;
          }

          .suggestions {
            margin-top: 22px;
            gap: 8px;
          }

          .suggestion {
            padding: 10px 12px;
          }

          .s-icon {
            width: 36px;
            height: 36px;
            flex-basis: 36px;
          }

          .messages {
            padding-top: 18px;
            gap: 22px;
          }

          .user-bubble {
            max-width: 88%;
            font-size: 15px;
            padding: 10px 14px;
          }

          .ai-message {
            gap: 10px;
          }

          .ai-avatar {
            width: 28px;
            height: 28px;
            flex-basis: 28px;
          }

          .ai-content {
            font-size: 15px;
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
        }

        @media (max-height: 760px) and (max-width: 500px) {
          .emblem {
            width: 56px;
            height: 56px;
          }

          .emblem-halo {
            inset: -20px;
          }

          .emblem-m {
            width: 26px;
            height: 26px;
          }

          .home-title {
            margin-top: 16px;
            font-size: 26px;
          }

          .home-sub {
            margin-top: 6px;
          }

          .suggestions {
            margin-top: 16px;
          }
        }
      `}</style>
    </main>
  );
}
