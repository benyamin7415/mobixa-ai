"use client";

import {
  useEffect,
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
      viewBox="0 0 32 32"
      aria-hidden="true"
      className="send-icon"
    >
      <path
        d="M5 16h20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      <path
        d="M18 8l8 8-8 8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M6 11.5c2.2-1.8 4.8-2.7 7.5-2.7"
        fill="none"
        stroke="rgba(255,255,255,.65)"
        strokeWidth="1.4"
        strokeLinecap="round"
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
   MARKDOWN
========================================================= */

function CodeBlock({
  code,
  language,
}: {
  code: string;
  language?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="code-block">
      <div className="code-header">
        <span className="code-language">
          {language || "CODE"}
        </span>

        <button
          type="button"
          className="code-copy"
          onClick={copyCode}
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
      </div>

      <pre>
        <code>{code}</code>
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
    /(`[^`]+`|\*\*[^*]+\*\*)/g
  );

  return (
    <>
      {parts.map((part, index) => {
        if (
          part.startsWith("**") &&
          part.endsWith("**")
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
          part.endsWith("`")
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

        return (
          <span key={index}>
            {part}
          </span>
        );
      })}
    </>
  );
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
        {text.split("\n").map((line, index) => {
          const trimmed = line.trim();

          if (trimmed.startsWith("### ")) {
            return (
              <h3
                key={index}
                className="message-heading heading-3"
              >
                <InlineText
                  text={trimmed.slice(4)}
                />
              </h3>
            );
          }

          if (trimmed.startsWith("## ")) {
            return (
              <h2
                key={index}
                className="message-heading heading-2"
              >
                <InlineText
                  text={trimmed.slice(3)}
                />
              </h2>
            );
          }

          if (trimmed.startsWith("# ")) {
            return (
              <h1
                key={index}
                className="message-heading heading-1"
              >
                <InlineText
                  text={trimmed.slice(2)}
                />
              </h1>
            );
          }

          if (
            trimmed.startsWith("- ") ||
            trimmed.startsWith("• ")
          ) {
            return (
              <div
                key={index}
                className="message-list-item"
              >
                <span className="list-dot">
                  •
                </span>

                <span className="list-content">
                  <InlineText
                    text={trimmed.slice(2)}
                  />
                </span>
              </div>
            );
          }

          const numbered =
            trimmed.match(
              /^(\d+)\.\s(.+)$/
            );

          if (numbered) {
            return (
              <div
                key={index}
                className="message-list-item numbered"
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
          }

          if (!trimmed) {
            return (
              <div
                key={index}
                className="message-space"
              />
            );
          }

          return (
            <div
              key={index}
              className="message-line"
            >
              <InlineText text={line} />
            </div>
          );
        })}
      </div>
    );

    textBuffer = [];
  };

  for (const line of lines) {
    const match = line.match(
      /^```(.*)$/
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
   LOGO
========================================================= */

function MobixaLogo() {
  return (
    <div className="hero-logo">
      <div className="hero-orbit orbit-a" />
      <div className="hero-orbit orbit-b" />
      <div className="hero-orbit orbit-c" />

      <div className="hero-glass">
        <div className="hero-m">
          <span className="m1" />
          <span className="m2" />
          <span className="m3" />
        </div>
      </div>

      <span className="hero-star hero-star-one">
        ✦
      </span>

      <span className="hero-star hero-star-two">
        ✧
      </span>

      <span className="logo-spark spark-a">
        ✦
      </span>

      <span className="logo-spark spark-b">
        ✧
      </span>

      <span className="logo-spark spark-c">
        ·
      </span>
    </div>
  );
}

/* =========================================================
   ROBOT
========================================================= */

function MobixaRobot() {
  return (
    <div className="robot-stage">
      <div className="robot-aura" />

      <svg
        viewBox="0 0 240 240"
        className="robot-svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id="robotHead"
            x1="0"
            y1="0"
            x2="1"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor="#9d7cff"
            />

            <stop
              offset="45%"
              stopColor="#372a86"
            />

            <stop
              offset="100%"
              stopColor="#080a22"
            />
          </linearGradient>

          <linearGradient
            id="robotBody"
            x1="0"
            y1="0"
            x2="1"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor="#6950db"
            />

            <stop
              offset="50%"
              stopColor="#17164d"
            />

            <stop
              offset="100%"
              stopColor="#070918"
            />
          </linearGradient>

          <linearGradient
            id="robotBlue"
            x1="0"
            y1="0"
            x2="1"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor="#e3d4ff"
            />

            <stop
              offset="50%"
              stopColor="#8b5cf6"
            />

            <stop
              offset="100%"
              stopColor="#19d9ff"
            />
          </linearGradient>

          <filter id="robotGlow">
            <feGaussianBlur
              stdDeviation="3"
              result="blur"
            />

            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <line
          x1="120"
          y1="29"
          x2="120"
          y2="14"
          stroke="#6deaff"
          strokeWidth="4"
        />

        <circle
          cx="120"
          cy="10"
          r="7"
          fill="#c18cff"
          filter="url(#robotGlow)"
        />

        <rect
          x="45"
          y="83"
          width="22"
          height="53"
          rx="11"
          fill="#151747"
          stroke="#735cff"
          strokeWidth="4"
        />

        <rect
          x="173"
          y="83"
          width="22"
          height="53"
          rx="11"
          fill="#151747"
          stroke="#735cff"
          strokeWidth="4"
        />

        <rect
          x="58"
          y="34"
          width="124"
          height="112"
          rx="48"
          fill="url(#robotHead)"
          stroke="#a98aff"
          strokeWidth="4"
        />

        <rect
          x="72"
          y="53"
          width="96"
          height="73"
          rx="32"
          fill="#030716"
          stroke="#27cfff"
          strokeOpacity=".45"
          strokeWidth="2"
        />

        <path
          d="M89 83c4-8 12-8 16 0"
          fill="none"
          stroke="#49eaff"
          strokeWidth="5"
          strokeLinecap="round"
        />

        <path
          d="M135 83c4-8 12-8 16 0"
          fill="none"
          stroke="#49eaff"
          strokeWidth="5"
          strokeLinecap="round"
        />

        <path
          d="M105 101c9 9 21 9 30 0"
          fill="none"
          stroke="#9a7cff"
          strokeWidth="4"
          strokeLinecap="round"
        />

        <rect
          x="106"
          y="139"
          width="28"
          height="14"
          rx="7"
          fill="#292469"
        />

        <path
          d="M77 148c8-12 23-17 43-17s35 5 43 17l17 55H60l17-55Z"
          fill="url(#robotBody)"
          stroke="#7967ff"
          strokeWidth="4"
        />

        <circle
          cx="120"
          cy="170"
          r="17"
          fill="#090d2b"
          stroke="#42ddff"
          strokeWidth="3"
        />

        <circle
          cx="120"
          cy="170"
          r="7"
          fill="#32dcff"
          filter="url(#robotGlow)"
        />

        <path
          d="M77 157c-18 4-27 15-35 29"
          fill="none"
          stroke="url(#robotBlue)"
          strokeWidth="15"
          strokeLinecap="round"
        />

        <path
          d="M164 157c18-3 27-14 34-30"
          fill="none"
          stroke="url(#robotBlue)"
          strokeWidth="15"
          strokeLinecap="round"
        />

        <circle
          cx="199"
          cy="119"
          r="13"
          fill="#b99cff"
          filter="url(#robotGlow)"
        />

        <path
          d="M199 111v-27"
          stroke="#d0c2ff"
          strokeWidth="9"
          strokeLinecap="round"
        />

        <path
          d="M214 98l8-7M215 108l10-2"
          stroke="#34dfff"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>

      <span className="robot-star rs-one">
        ✦
      </span>

      <span className="robot-star rs-two">
        ✧
      </span>

      <span className="robot-star rs-three">
        ✦
      </span>
    </div>
  );
}

/* =========================================================
   HAND
========================================================= */

function Hand() {
  return (
    <span
      className="hello-hand"
      aria-hidden="true"
    >
      👋
    </span>
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
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      if (!loading) {
        void sendMessage();
      }
    }
  }

  useEffect(() => {
    if (!scrollRef.current) {
      return;
    }

    scrollRef.current.scrollTo({
      top:
        scrollRef.current
          .scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

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
      <div className="background">
        <div className="purple-cloud cloud-one" />
        <div className="purple-cloud cloud-two" />
        <div className="blue-cloud cloud-three" />

        <div className="neon-wave wave-one" />
        <div className="neon-wave wave-two" />

        <div className="starfield">
          <span>✦</span>
          <span>✧</span>
          <span>·</span>
          <span>✦</span>
          <span>·</span>
          <span>✧</span>
          <span>✦</span>
          <span>·</span>
        </div>
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
        >
          {messages.length === 0 ? (
            <div className="home-content">
              <MobixaLogo />

              <MobixaRobot />

              <div className="greeting">
                <div className="hello">
                  <span>سلام</span>
                  <Hand />
                </div>

                <h1>
                  <span>
                    بزن بریم
                  </span>{" "}
                  <strong>
                    مهندس
                  </strong>
                </h1>

                <div className="under-line">
                  <i />
                </div>
              </div>

              <p className="intro">
                اینجا هر چیزی که توی
                ذهنت داری،
                <br />
                می‌تونه شروع یک چیز بزرگ
                باشه.
                <br />

                <span>
                  ایده بده، سؤال بپرس،
                  بساز.
                </span>
              </p>

              <div className="cards">
                <button
                  type="button"
                  className="card create"
                  onClick={() =>
                    putSuggestion(
                      "این متن رو برای من حرفه‌ای و جذاب‌تر کن:"
                    )
                  }
                >
                  <div className="card-icon">
                    <CreateIcon />
                  </div>

                  <b>CREATE</b>

                  <span>
                    متنت رو حرفه‌ای کن
                  </span>
                </button>

                <button
                  type="button"
                  className="card learn"
                  onClick={() =>
                    putSuggestion(
                      "این موضوع رو خیلی ساده و قابل فهم برام توضیح بده:"
                    )
                  }
                >
                  <div className="card-icon">
                    <LearnIcon />
                  </div>

                  <b>
                    LEARN MODE
                  </b>

                  <span>
                    هر چیزی رو ساده
                    یاد بگیر
                  </span>
                </button>

                <button
                  type="button"
                  className="card idea"
                  onClick={() =>
                    putSuggestion(
                      "برای این موضوع چند ایده خلاقانه و خفن بهم بده:"
                    )
                  }
                >
                  <div className="card-icon">
                    <IdeaIcon />
                  </div>

                  <b>IDEA LAB</b>

                  <span>
                    یه ایده خفن بساز
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="messages">
              {messages.map(
                (message) => (
                  <div
                    key={message.id}
                    className={
                      message.role ===
                      "user"
                        ? "message user-message"
                        : "message ai-message"
                    }
                  >
                    <div className="message-wrapper">
                      <div className="bubble">
                        {message.role ===
                        "assistant" ? (
                          <MessageContent
                            content={
                              message.content
                            }
                          />
                        ) : (
                          <>
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
                              <div className="user-text">
                                <InlineText
                                  text={
                                    message.content
                                  }
                                />
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      {message.role ===
                        "assistant" &&
                        message.content &&
                        !message.content.startsWith(
                          "⚠️"
                        ) && (
                          <button
                            type="button"
                            className="message-copy"
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(
                                  message.content
                                );
                              } catch {}
                            }}
                          >
                            <CopyIcon />
                            <span>
                              کپی
                            </span>
                          </button>
                        )}
                    </div>
                  </div>
                )
              )}
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
              placeholder={
                imagePreview
                  ? "اگر می‌خوای درباره عکس چیزی بپرسی، بنویس..."
                  : "پیامت رو برای موبیکسا بنویس..."
              }
            />

            <button
              type="button"
              className="send"
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
          background: #03040d;
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

        .mobixa {
          position: relative;
          width: 100%;
          height: 100svh;
          min-height: 100svh;
          overflow: hidden;
          color: white;
          background:
            radial-gradient(
              circle at 75% 65%,
              rgba(0, 84, 180, 0.22),
              transparent 32%
            ),
            radial-gradient(
              circle at 15% 65%,
              rgba(102, 24, 255, 0.3),
              transparent 35%
            ),
            #02030b;
        }

        .background {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
        }

        .purple-cloud,
        .blue-cloud {
          position: absolute;
          border-radius: 50%;
          filter: blur(65px);
          opacity: 0.45;
        }

        .cloud-one {
          width: 320px;
          height: 320px;
          left: -140px;
          top: 28%;
          background: #5417d8;
        }

        .cloud-two {
          width: 300px;
          height: 300px;
          right: -130px;
          bottom: 5%;
          background: #2511b5;
        }

        .cloud-three {
          width: 280px;
          height: 280px;
          right: -100px;
          top: 42%;
          background: #0058cf;
          opacity: 0.22;
        }

        .neon-wave {
          position: absolute;
          width: 130%;
          height: 180px;
          left: -15%;
          border-radius: 50%;
          border-top: 1px solid
            rgba(118, 92, 255, 0.45);
          transform: rotate(-10deg);
          filter:
            drop-shadow(
              0 0 8px
                rgba(107, 61, 255, 0.3)
            );
        }

        .wave-one {
          bottom: 17%;
        }

        .wave-two {
          bottom: 3%;
          transform: rotate(7deg);
          border-color:
            rgba(0, 215, 255, 0.22);
        }

        .starfield {
          position: absolute;
          inset: 0;
          color: rgba(170, 130, 255, 0.55);
          font-size: 11px;
        }

        .starfield span {
          position: absolute;
          text-shadow:
            0 0 8px #8d52ff;
        }

        .starfield span:nth-child(1) {
          top: 19%;
          left: 11%;
        }

        .starfield span:nth-child(2) {
          top: 34%;
          right: 15%;
        }

        .starfield span:nth-child(3) {
          top: 55%;
          left: 8%;
        }

        .starfield span:nth-child(4) {
          top: 63%;
          right: 8%;
        }

        .starfield span:nth-child(5) {
          top: 75%;
          left: 20%;
        }

        .starfield span:nth-child(6) {
          top: 48%;
          right: 30%;
        }

        .starfield span:nth-child(7) {
          top: 27%;
          right: 38%;
        }

        .starfield span:nth-child(8) {
          bottom: 13%;
          right: 18%;
        }

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
          gap: 8px;
          padding-top: 7px;
          font-size: 21px;
          font-weight: 900;
          letter-spacing: 5px;
          text-shadow:
            0 0 12px
              rgba(255, 255, 255, 0.22);
        }

        .wordmark b {
          background:
            linear-gradient(
              90deg,
              #b05cff,
              #20dfff
            );
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .back {
          direction: rtl;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          height: 44px;
          padding: 0 17px;
          border-radius: 999px;
          border: 1px solid
            rgba(155, 73, 255, 0.95);
          background:
            rgba(55, 16, 111, 0.25);
          color: white;
          box-shadow:
            0 0 15px
              rgba(144, 59, 255, 0.42),
            inset 0 0 18px
              rgba(94, 70, 255, 0.13);
          backdrop-filter: blur(18px);
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
        }

        .back svg {
          width: 20px;
          height: 20px;
        }

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
          scrollbar-width: none;
          padding: 0 18px;
        }

        .message-area::-webkit-scrollbar {
          display: none;
        }

        .home-content {
          min-height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding-bottom: 10px;
        }

        .hero-logo {
          position: relative;
          width: 210px;
          height: 185px;
          flex: 0 0 auto;
          margin-top: -5px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hero-glass {
          position: relative;
          width: 112px;
          height: 112px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            radial-gradient(
              circle at 35% 25%,
              rgba(181, 122, 255, 0.85),
              rgba(42, 14, 100, 0.48)
                42%,
              rgba(3, 5, 25, 0.92)
                76%
            );
          border: 1px solid
            rgba(132, 89, 255, 0.8);
          box-shadow:
            0 0 25px
              rgba(134, 63, 255, 0.75),
            inset 0 0 30px
              rgba(0, 194, 255, 0.2);
        }

        .hero-orbit {
          position: absolute;
          border-radius: 50%;
          border: 1px solid;
        }

        .orbit-a {
          width: 205px;
          height: 65px;
          transform: rotate(-18deg);
          border-color:
            rgba(170, 79, 255, 0.8);
        }

        .orbit-b {
          width: 205px;
          height: 72px;
          transform: rotate(46deg);
          border-color:
            rgba(0, 209, 255, 0.65);
        }

        .orbit-c {
          width: 150px;
          height: 150px;
          border-color:
            rgba(118, 75, 255, 0.2);
        }

        .hero-m {
          position: relative;
          width: 65px;
          height: 66px;
          filter:
            drop-shadow(
              0 0 7px #ae63ff
            )
            drop-shadow(
              0 0 17px #00d9ff
            );
        }

        .hero-m span {
          position: absolute;
          top: 6px;
          display: block;
          width: 20px;
          height: 54px;
          border-radius: 5px;
          background:
            linear-gradient(
              180deg,
              #f0c5ff,
              #974cff 45%,
              #25dfff
            );
        }

        .m1 {
          left: 2px;
          transform: skewY(27deg);
        }

        .m2 {
          left: 22px;
          top: 18px !important;
          width: 19px !important;
          height: 35px !important;
          transform: rotate(45deg);
        }

        .m3 {
          right: 2px;
          transform: skewY(-27deg);
        }

        .hero-star {
          position: absolute;
          color: white;
          text-shadow:
            0 0 8px #b566ff,
            0 0 16px #00d9ff;
        }

        .hero-star-one {
          top: -3px;
          right: 43px;
          font-size: 21px;
        }

        .hero-star-two {
          bottom: 26px;
          left: 45px;
          font-size: 13px;
        }

        .logo-spark {
          position: absolute;
          color: #d6caff;
          text-shadow:
            0 0 10px #00cfff;
        }

        .spark-a {
          top: 35px;
          left: 10px;
        }

        .spark-b {
          bottom: 22px;
          right: 15px;
        }

        .spark-c {
          top: 55px;
          right: 5px;
        }

        .robot-stage {
          position: relative;
          width: 210px;
          height: 155px;
          flex: 0 0 auto;
          margin-top: -30px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .robot-aura {
          position: absolute;
          width: 125px;
          height: 90px;
          border-radius: 50%;
          background: #7040ff;
          filter: blur(45px);
          opacity: 0.38;
        }

        .robot-svg {
          position: relative;
          width: 160px;
          height: 160px;
          z-index: 2;
          filter:
            drop-shadow(
              0 0 9px
                rgba(114, 81, 255, 0.5)
            )
            drop-shadow(
              0 0 18px
                rgba(0, 210, 255, 0.16)
            );
        }

        .robot-star {
          position: absolute;
          z-index: 3;
          color: #a77cff;
          text-shadow:
            0 0 12px #00d9ff;
        }

        .rs-one {
          top: 26px;
          right: 18px;
        }

        .rs-two {
          bottom: 17px;
          left: 25px;
        }

        .rs-three {
          top: 68px;
          left: 10px;
          font-size: 9px;
        }

        .greeting {
          text-align: center;
          margin-top: -5px;
        }

        .hello {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          font-size: 39px;
          line-height: 1;
          font-weight: 950;
          text-shadow:
            0 0 15px
              rgba(255, 255, 255, 0.3),
            0 0 30px
              rgba(150, 74, 255, 0.4);
        }

        .hello-hand {
          font-size: 34px;
          filter:
            drop-shadow(
              0 0 7px
                rgba(180, 85, 255, 0.8)
            );
          animation:
            wave 2.3s ease-in-out
              infinite;
        }

        .greeting h1 {
          margin: 12px 0 0;
          font-size: 31px;
          line-height: 1.15;
          font-weight: 950;
        }

        .greeting h1 span {
          background:
            linear-gradient(
              90deg,
              #b867ff,
              #9354ff,
              #8d6dff
            );
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .greeting h1 strong {
          background:
            linear-gradient(
              90deg,
              #9259ff,
              #19d8ff
            );
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .under-line {
          width: 145px;
          height: 4px;
          margin: 14px auto 0;
          border-radius: 999px;
          background:
            linear-gradient(
              90deg,
              transparent,
              #b04cff,
              #23dfff,
              transparent
            );
          box-shadow:
            0 0 8px #913eff,
            0 0 16px
              rgba(0, 207, 255, 0.35);
        }

        .under-line i {
          display: block;
          width: 45px;
          height: 2px;
          margin: auto;
          background: white;
          filter: blur(1px);
        }

        .intro {
          margin: 17px 0 0;
          text-align: center;
          font-size: 14px;
          line-height: 2;
          color:
            rgba(239, 239, 255, 0.86);
        }

        .intro span {
          color: #a5afe8;
        }

        .cards {
          width: 100%;
          max-width: 620px;
          margin-top: 19px;
          display: grid;
          grid-template-columns:
            repeat(3, 1fr);
          gap: 9px;
          direction: ltr;
        }

        .card {
          position: relative;
          min-width: 0;
          height: 112px;
          border-radius: 19px;
          padding: 10px 5px 15px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          background:
            rgba(20, 15, 60, 0.42);
          border: 1px solid
            rgba(105, 70, 255, 0.35);
          backdrop-filter: blur(15px);
          cursor: pointer;
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .card:hover {
          transform: translateY(-3px);
          box-shadow:
            0 0 20px
              rgba(124, 63, 255, 0.28);
        }

        .card-icon {
          width: 28px;
          height: 28px;
          margin-bottom: 5px;
        }

        .card-icon svg {
          width: 100%;
          height: 100%;
        }

        .card b {
          direction: ltr;
          font-size: 10px;
          letter-spacing: 0.8px;
        }

        .card span {
          margin-top: 5px;
          font-size: 10px;
          white-space: nowrap;
        }

        .messages {
          padding-top: 25px;
          padding-bottom: 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .message {
          display: flex;
          width: 100%;
        }

        .user-message {
          justify-content: flex-start;
        }

        .ai-message {
          justify-content: flex-end;
        }

        .message-wrapper {
          position: relative;
          max-width: 82%;
          min-width: 0;
        }

        .bubble {
          position: relative;
          border-radius: 22px;
          padding: 14px 17px;
          font-size: 15px;
          line-height: 1.95;
          overflow-wrap: anywhere;
        }

        .user-message .bubble {
          direction: rtl;
          background:
            linear-gradient(
              135deg,
              rgba(94, 32, 165, 0.72),
              rgba(39, 16, 80, 0.88)
            );
          border: 1px solid
            rgba(159, 75, 255, 0.75);
          box-shadow:
            0 0 18px
              rgba(126, 50, 255, 0.2),
            inset 0 0 25px
              rgba(185, 72, 255, 0.08);
        }

        .ai-message .bubble {
          direction: rtl;
          background:
            linear-gradient(
              135deg,
              rgba(7, 35, 78, 0.9),
              rgba(8, 21, 50, 0.92)
            );
          border: 1px solid
            rgba(0, 190, 255, 0.5);
          box-shadow:
            0 0 20px
              rgba(0, 165, 255, 0.13),
            inset 0 0 25px
              rgba(0, 130, 255, 0.06);
        }

        /*
          عکس ارسال‌شده:
          کوچک و دقیقاً بالای متن
        */

        .sent-image {
          display: block;
          width: 74px;
          height: 74px;
          object-fit: cover;
          border-radius: 12px;
          margin-bottom: 9px;
          border: 1px solid
            rgba(185, 110, 255, 0.8);
          box-shadow:
            0 0 12px
              rgba(146, 64, 255, 0.28);
        }

        .user-text {
          white-space: pre-wrap;
        }

        .message-copy {
          margin-top: 5px;
          border: 0;
          background: transparent;
          color:
            rgba(210, 220, 255, 0.65);
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 10px;
          cursor: pointer;
        }

        .message-copy svg {
          width: 18px;
          height: 18px;
        }

        .message-text {
          width: 100%;
        }

        .message-line {
          min-height: 1.5em;
        }

        .message-space {
          height: 5px;
        }

        .message-heading {
          margin:
            4px 0 10px;
          line-height: 1.45;
        }

        .heading-1 {
          font-size: 22px;
        }

        .heading-2 {
          font-size: 19px;
        }

        .heading-3 {
          font-size: 17px;
        }

        .message-list-item {
          display: flex;
          gap: 7px;
          align-items: flex-start;
          margin: 3px 0;
        }

        .list-dot {
          color: #b16cff;
          flex: 0 0 auto;
        }

        .list-number {
          color: #72eaff;
          min-width: 25px;
        }

        .list-content {
          min-width: 0;
        }

        .inline-bold {
          font-weight: 900;
        }

        .inline-code {
          direction: ltr;
          unicode-bidi: plaintext;
          display: inline-block;
          padding: 1px 5px;
          border-radius: 5px;
          background:
            rgba(0, 0, 0, 0.32);
          color: #8eefff;
          font-family:
            Consolas,
            monospace;
          font-size: 0.92em;
        }

        .code-block {
          direction: ltr;
          width: 100%;
          margin: 12px 0;
          overflow: hidden;
          border-radius: 13px;
          background: #070a14;
          border: 1px solid
            rgba(104, 99, 255, 0.45);
        }

        .code-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 7px 9px;
          background:
            rgba(92, 63, 170, 0.18);
          border-bottom: 1px solid
            rgba(115, 94, 220, 0.25);
        }

        .code-language {
          color: #8cdbff;
          font-size: 9px;
          text-transform: uppercase;
        }

        .code-copy {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          border: 0;
          background: transparent;
          color: #d9dcff;
          font-size: 9px;
          cursor: pointer;
        }

        .code-copy svg {
          width: 16px;
          height: 16px;
        }

        .code-block pre {
          margin: 0;
          padding: 13px;
          overflow-x: auto;
        }

        .code-block code {
          color: #e6e8ff;
          font-family:
            Consolas,
            "Courier New",
            monospace;
          font-size: 12px;
          line-height: 1.65;
          white-space: pre;
        }
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
              rgba(3, 4, 14, 0.96),
              rgba(3, 4, 14, 0.68),
              transparent
            );
        }

        .image-preview-wrap {
          width: 100%;
          max-width: 760px;
          margin: 0 auto 8px;
          display: flex;
          justify-content: flex-end;
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
            rgba(27, 14, 65, 0.84);
          border: 1px solid
            rgba(155, 74, 255, 0.65);
          box-shadow:
            0 0 18px
              rgba(114, 47, 255, 0.2);
          backdrop-filter: blur(15px);
        }

        .image-preview {
          width: 54px;
          height: 54px;
          flex: 0 0 54px;
          object-fit: cover;
          border-radius: 10px;
          border: 1px solid
            rgba(143, 99, 255, 0.7);
        }

        .image-preview-info {
          min-width: 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .image-preview-info span {
          font-size: 10px;
          color: white;
        }

        .image-preview-info small {
          color:
            rgba(195, 203, 240, 0.7);
          font-size: 8px;
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
            rgba(180, 91, 255, 0.55);
          background:
            rgba(92, 40, 145, 0.35);
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
            linear-gradient(
              135deg,
              rgba(16, 20, 70, 0.93),
              rgba(7, 10, 36, 0.94)
            );
          border: 1px solid
            rgba(52, 120, 255, 0.72);
          box-shadow:
            0 0 16px
              rgba(77, 60, 255, 0.25),
            inset 0 0 24px
              rgba(67, 41, 170, 0.11);
          backdrop-filter: blur(20px);
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
          color: white;
          padding: 9px 4px;
          text-align: right;
          direction: rtl;
          line-height: 1.65;
          font-size: 14px;
        }

        .composer textarea::placeholder {
          color:
            rgba(194, 202, 239, 0.55);
        }

        .composer textarea:disabled {
          opacity: 0.65;
        }

        .upload {
          position: relative;
          width: 47px;
          height: 47px;
          flex: 0 0 47px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          border: 1px solid
            rgba(137, 75, 255, 0.7);
          background:
            rgba(74, 35, 141, 0.25);
          color: #d8ccff;
          cursor: pointer;
          box-shadow:
            inset 0 0 15px
              rgba(142, 71, 255, 0.1);
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .upload:hover {
          transform: translateY(-1px);
          box-shadow:
            0 0 15px
              rgba(151, 72, 255, 0.35);
        }

        .upload:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .upload-icon {
          width: 25px;
          height: 25px;
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
          background: rgba(8, 9, 26, 0.95);
          border: 1px solid
            rgba(125, 79, 255, 0.5);
          color: white;
          white-space: nowrap;
          font-size: 9px;
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
          width: 54px;
          height: 54px;
          flex: 0 0 54px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          border: 1px solid
            rgba(202, 137, 255, 0.8);
          background:
            radial-gradient(
              circle at 32% 25%,
              rgba(173, 108, 255, 0.8),
              rgba(57, 22, 119, 0.82)
                52%,
              rgba(7, 12, 50, 0.95)
                100%
            );
          color: white;
          cursor: pointer;
          box-shadow:
            0 0 9px
              rgba(183, 83, 255, 0.7),
            0 0 24px
              rgba(96, 46, 255, 0.42),
            inset 0 1px 3px
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
          inset: -5px;
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
          opacity: 0.8;
          animation:
            sendRing 4s linear
            infinite;
        }

        .send::after {
          content: "";
          position: absolute;
          inset: 2px;
          border-radius: 50%;
          border: 1px solid
            rgba(255, 255, 255, 0.17);
          box-shadow:
            inset 0 0 10px
              rgba(255, 255, 255, 0.08),
            inset 0 0 18px
              rgba(0, 220, 255, 0.09);
          pointer-events: none;
        }

        .send:hover {
          transform:
            translateY(-2px)
            scale(1.045);
          filter: brightness(1.12);
          box-shadow:
            0 0 10px
              rgba(195, 103, 255, 1),
            0 0 26px
              rgba(157, 66, 255, 0.9),
            0 0 48px
              rgba(0, 215, 255, 0.4),
            inset 0 1px 3px
              rgba(255, 255, 255, 0.52);
        }

        .send:active {
          transform: scale(0.91);
        }

        .send:focus-visible {
          outline:
            2px solid
              rgba(42, 222, 255, 0.9);
          outline-offset: 4px;
        }

        .send:disabled {
          opacity: 0.45;
          cursor: not-allowed;
          transform: none;
          filter: grayscale(0.15);
        }

        .send:disabled::before {
          animation: none;
          opacity: 0.25;
        }

        .send-icon {
          position: relative;
          z-index: 3;
          width: 25px;
          height: 25px;
          filter:
            drop-shadow(
              0 0 4px
                rgba(255, 255, 255, 0.7)
            )
            drop-shadow(
              0 0 9px
                rgba(28, 224, 255, 0.38)
            );
          transform: translateX(1px);
        }

        .stop-icon {
          position: relative;
          z-index: 3;
          width: 15px;
          height: 15px;
          color: white;
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
            rgba(132, 143, 193, 0.72);
          font-size: 8px;
        }

        .footer span:first-child {
          color:
            rgba(166, 104, 255, 0.85);
        }

        @keyframes sendRing {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @keyframes wave {
          0%,
          100% {
            transform: rotate(-8deg);
          }

          50% {
            transform:
              rotate(8deg)
              translateY(-2px);
          }
        }

        @media (max-width: 500px) {
          .header {
            height: 72px;
            padding:
              16px 18px 0;
          }

          .wordmark {
            font-size: 17px;
            letter-spacing: 4px;
          }

          .back {
            height: 41px;
            padding: 0 14px;
            font-size: 12px;
          }

          .page-content {
            height: calc(100svh - 72px);
          }

          .message-area {
            padding: 0 12px;
          }

          .hero-logo {
            width: 190px;
            height: 158px;
            transform: scale(0.92);
            margin-top: -5px;
          }

          .robot-stage {
            width: 190px;
            height: 138px;
            margin-top: -27px;
          }

          .robot-svg {
            width: 145px;
            height: 145px;
          }

          .hello {
            font-size: 35px;
          }

          .hello-hand {
            font-size: 31px;
          }

          .greeting h1 {
            font-size: 27px;
          }

          .intro {
            margin-top: 13px;
            font-size: 12px;
            line-height: 1.85;
          }

          .cards {
            gap: 6px;
            margin-top: 15px;
          }

          .card {
            height: 98px;
            border-radius: 16px;
            padding: 7px 3px 14px;
          }

          .card-icon {
            width: 24px;
            height: 24px;
          }

          .card b {
            font-size: 8px;
            letter-spacing: 0.5px;
          }

          .card span {
            font-size: 8px;
            margin-top: 4px;
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
            width: 43px;
            height: 43px;
            flex-basis: 43px;
            border-radius: 13px;
          }

          .upload-icon {
            width: 22px;
            height: 22px;
          }

          .upload-tooltip {
            display: none;
          }

          .send {
            width: 49px;
            height: 49px;
            flex-basis: 49px;
          }

          .send-icon {
            width: 23px;
            height: 23px;
          }

          .stop-icon {
            width: 14px;
            height: 14px;
          }

          .footer {
            font-size: 7px;
          }

          .messages {
            padding-top: 20px;
          }

          .message-wrapper {
            max-width: 92%;
          }

          .bubble {
            font-size: 14px;
            line-height: 1.95;
            padding: 13px 14px;
          }

          .sent-image {
            width: 64px;
            height: 64px;
            border-radius: 10px;
            margin-bottom: 8px;
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

          .image-preview-info span {
            font-size: 10px;
          }

          .image-preview-info small {
            font-size: 8px;
          }

          .remove-image {
            width: 27px;
            height: 27px;
            flex-basis: 27px;
          }
        }

        @media (max-height: 760px) and (max-width: 500px) {
          .hero-logo {
            height: 130px;
            transform: scale(0.76);
            margin-top: -17px;
          }

          .robot-stage {
            height: 112px;
            transform: scale(0.78);
            margin-top: -36px;
          }

          .hello {
            font-size: 31px;
          }

          .greeting h1 {
            margin-top: 8px;
            font-size: 24px;
          }

          .intro {
            margin-top: 9px;
          }

          .cards {
            margin-top: 10px;
          }

          .card {
            height: 86px;
          }
        }
      `}</style>
    </main>
  );
}
