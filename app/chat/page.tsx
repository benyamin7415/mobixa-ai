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
   EMBLEM
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
      <div className="background" aria-hidden="true">
        <div className="bg-beam" />
        <div className="bg-aura aura-one" />
        <div className="bg-aura aura-two" />
        <div className="bg-ring" />
        <div className="bg-grain" />
        <div className="bg-vignette" />
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
              <MobixaEmblem />

              <div className="greeting">
                <span className="eyebrow">
                  MOBIXA INTELLIGENCE
                </span>

                <div className="hello">
                  سلام
                </div>

                <h1>
                  <span>
                    بزن بریم
                  </span>{" "}
                  <strong>
                    مهندس
                  </strong>
                </h1>

                <div className="hairline">
                  <i />
                </div>
              </div>

              <p className="intro">
                اینجا هر چیزی که توی
                ذهنت داری،
                <br />
                می‌تونه شروع یک چیز بزرگ
                باشه.
                <span className="intro-sub">
                  ایده بده، سؤال بپرس،
                  بساز.
                </span>
              </p>

              <div className="suggestions">
                <button
                  type="button"
                  className="suggestion create"
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
                  className="suggestion learn"
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
                  className="suggestion idea"
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
                      {message.role ===
                        "assistant" && (
                        <div className="ai-badge">
                          <MobixaMark />
                          <span>
                            MOBIXA AI
                          </span>
                        </div>
                      )}

                      <div className="bubble">
                        {message.role ===
                        "assistant" ? (
                          message.content ? (
                            <MessageContent
                              content={
                                message.content
                              }
                            />
                          ) : loading ? (
                            <div
                              className="typing"
                              aria-label="در حال نوشتن"
                            >
                              <i />
                              <i />
                              <i />
                            </div>
                          ) : null
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
              enterKeyHint="enter"
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
          background: #03040a;
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
          color: #eef0fb;
          -webkit-font-smoothing: antialiased;
          background:
            radial-gradient(
              120% 55% at 50% -8%,
              rgba(86, 62, 196, 0.34),
              transparent 62%
            ),
            radial-gradient(
              80% 45% at 92% 100%,
              rgba(20, 88, 200, 0.2),
              transparent 62%
            ),
            radial-gradient(
              70% 40% at 4% 84%,
              rgba(112, 44, 205, 0.16),
              transparent 62%
            ),
            #03040a;
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

        .bg-beam {
          position: absolute;
          top: 0;
          left: 50%;
          width: 320px;
          height: 480px;
          transform: translateX(-50%);
          background:
            linear-gradient(
              180deg,
              rgba(170, 150, 255, 0.2),
              rgba(120, 100, 255, 0.05)
                60%,
              transparent
            );
          clip-path:
            polygon(
              42% 0,
              58% 0,
              100% 100%,
              0 100%
            );
          filter: blur(22px);
          opacity: 0.8;
        }

        .bg-aura {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          will-change: transform;
        }

        .aura-one {
          width: 360px;
          height: 360px;
          left: -170px;
          top: 34%;
          background:
            rgba(104, 52, 232, 0.4);
          animation:
            auraDriftA 20s ease-in-out
              infinite alternate;
        }

        .aura-two {
          width: 340px;
          height: 340px;
          right: -170px;
          bottom: 6%;
          background:
            rgba(16, 100, 230, 0.26);
          animation:
            auraDriftB 24s ease-in-out
              infinite alternate;
        }

        .bg-ring {
          position: absolute;
          top: -40px;
          left: 50%;
          width: min(118vw, 560px);
          height: min(118vw, 560px);
          transform: translateX(-50%);
          border-radius: 50%;
          border: 1px solid
            rgba(176, 166, 255, 0.1);
          box-shadow:
            inset 0 0 90px
              rgba(110, 82, 255, 0.07);
        }

        .bg-ring::before,
        .bg-ring::after {
          content: "";
          position: absolute;
          border-radius: 50%;
          border: 1px solid
            rgba(176, 166, 255, 0.06);
        }

        .bg-ring::before {
          inset: 12%;
        }

        .bg-ring::after {
          inset: -14%;
        }

        .bg-grain {
          position: absolute;
          inset: 0;
          opacity: 0.08;
          mix-blend-mode: overlay;
          background-image:
            url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
        }

        .bg-vignette {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(
              ellipse at 50% 38%,
              transparent 52%,
              rgba(0, 0, 0, 0.6)
            );
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
          color: #f1f2fc;
        }

        .wordmark b {
          padding: 3px 7px 3px 9px;
          border-radius: 7px;
          border: 1px solid
            rgba(164, 140, 255, 0.5);
          background:
            rgba(120, 90, 255, 0.13);
          color: #d6ccff;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2px;
          box-shadow:
            0 0 14px
              rgba(124, 92, 255, 0.28);
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
            rgba(200, 206, 255, 0.18);
          background:
            rgba(255, 255, 255, 0.045);
          color: #eef0fb;
          box-shadow:
            inset 0 1px 0
              rgba(255, 255, 255, 0.09),
            0 10px 26px
              rgba(0, 0, 0, 0.38);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition:
            border-color 0.2s ease,
            background 0.2s ease;
        }

        .back:hover {
          border-color:
            rgba(170, 150, 255, 0.55);
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
          padding-top: 6px;
          padding-bottom: 12px;
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
          width: 104px;
          height: 104px;
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .emblem-halo {
          position: absolute;
          inset: -34px;
          border-radius: 50%;
          background:
            radial-gradient(
              circle,
              rgba(122, 88, 255, 0.5),
              transparent 68%
            );
          filter: blur(14px);
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
            emblemSpin 9s linear
              infinite;
        }

        .emblem-core {
          position: absolute;
          inset: 7px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            radial-gradient(
              circle at 34% 24%,
              rgba(140, 110, 255, 0.38),
              rgba(12, 11, 34, 0.94)
                68%
            );
          border: 1px solid
            rgba(255, 255, 255, 0.09);
          box-shadow:
            inset 0 0 30px
              rgba(120, 90, 255, 0.25),
            0 22px 50px
              rgba(60, 32, 170, 0.5);
        }

        .emblem-m {
          width: 46px;
          height: 46px;
          filter:
            drop-shadow(
              0 0 8px
                rgba(150, 120, 255, 0.7)
            );
        }

        .greeting {
          margin-top: 22px;
          text-align: center;
        }

        .eyebrow {
          display: block;
          direction: ltr;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 5px;
          color:
            rgba(190, 180, 255, 0.72);
        }

        .hello {
          margin-top: 12px;
          font-size: 18px;
          line-height: 1;
          font-weight: 500;
          color:
            rgba(222, 226, 248, 0.7);
        }

        .greeting h1 {
          margin: 10px 0 0;
          font-size: 36px;
          line-height: 1.2;
          font-weight: 800;
        }

        .greeting h1 span {
          background:
            linear-gradient(
              180deg,
              #ffffff,
              #c9c6ee
            );
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .greeting h1 strong {
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

        .hairline {
          width: 150px;
          height: 1px;
          margin: 18px auto 0;
          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(190, 170, 255, 0.85),
              transparent
            );
          box-shadow:
            0 0 12px
              rgba(150, 120, 255, 0.5);
        }

        .hairline i {
          display: none;
        }

        .intro {
          margin: 16px 0 0;
          max-width: 310px;
          text-align: center;
          font-size: 14px;
          line-height: 2;
          color:
            rgba(222, 226, 248, 0.78);
        }

        .intro-sub {
          display: block;
          margin-top: 2px;
          color:
            rgba(160, 170, 214, 0.7);
          font-size: 13px;
        }

        .suggestions {
          width: 100%;
          max-width: 460px;
          margin-top: 22px;
          display: grid;
          gap: 10px;
        }

        .suggestion {
          position: relative;
          width: 100%;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 14px;
          border-radius: 18px;
          text-align: right;
          color: #eef0fb;
          background:
            linear-gradient(
              135deg,
              rgba(255, 255, 255, 0.06),
              rgba(255, 255, 255, 0.015)
            );
          border: 1px solid
            rgba(200, 206, 255, 0.12);
          box-shadow:
            inset 0 1px 0
              rgba(255, 255, 255, 0.07),
            0 12px 30px
              rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          cursor: pointer;
          transition:
            transform 0.25s
              cubic-bezier(.2,.8,.2,1),
            border-color 0.25s ease,
            box-shadow 0.25s ease;
        }

        .suggestion:hover {
          transform: translateX(-3px);
          border-color:
            rgba(170, 150, 255, 0.5);
          box-shadow:
            inset 0 1px 0
              rgba(255, 255, 255, 0.1),
            0 12px 34px
              rgba(90, 60, 220, 0.28);
        }

        .suggestion:active {
          transform: scale(0.985);
        }

        .s-icon {
          width: 40px;
          height: 40px;
          flex: 0 0 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 13px;
          border: 1px solid
            rgba(170, 150, 255, 0.34);
          background:
            rgba(120, 90, 255, 0.12);
          color: #cfc4ff;
        }

        .s-icon svg {
          width: 21px;
          height: 21px;
          stroke-width: 1.7;
        }

        .suggestion.learn .s-icon {
          border-color:
            rgba(80, 210, 255, 0.34);
          background:
            rgba(40, 190, 255, 0.1);
          color: #a8ecff;
        }

        .suggestion.idea .s-icon {
          border-color:
            rgba(232, 200, 138, 0.4);
          background:
            rgba(232, 200, 138, 0.1);
          color: #f0d9a8;
        }

        .s-text {
          min-width: 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .s-text b {
          direction: ltr;
          text-align: right;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2.2px;
          color: #f4f5fd;
        }

        .s-text span {
          font-size: 13px;
          color:
            rgba(190, 198, 230, 0.7);
        }

        .s-arrow {
          width: 20px;
          height: 20px;
          flex: 0 0 20px;
          color:
            rgba(190, 180, 255, 0.55);
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
          padding-top: 25px;
          padding-bottom: 20px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .message {
          display: flex;
          width: 100%;
          animation:
            riseIn 0.45s
              cubic-bezier(.2,.8,.2,1)
              both;
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

        .ai-message .message-wrapper {
          max-width: 94%;
        }

        .ai-badge {
          display: flex;
          align-items: center;
          gap: 7px;
          margin: 0 4px 7px;
          direction: ltr;
          justify-content: flex-end;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 2.6px;
          color:
            rgba(190, 180, 255, 0.75);
        }

        .ai-mark {
          width: 15px;
          height: 15px;
          color: #b9a8ff;
          filter:
            drop-shadow(
              0 0 5px
                rgba(150, 120, 255, 0.7)
            );
        }

        .bubble {
          position: relative;
          border-radius: 22px;
          padding: 14px 17px;
          font-size: 15px;
          line-height: 1.95;
          overflow-wrap: anywhere;
          color: #eef0fb;
        }

        .user-message .bubble {
          direction: rtl;
          border-bottom-right-radius: 7px;
          background:
            linear-gradient(
              135deg,
              #6c3df0 0%,
              #4a2bc2 55%,
              #33208c 100%
            );
          border: 1px solid
            rgba(255, 255, 255, 0.16);
          box-shadow:
            inset 0 1px 0
              rgba(255, 255, 255, 0.2),
            0 14px 34px
              rgba(70, 40, 200, 0.38);
        }

        .ai-message .bubble {
          direction: rtl;
          border-bottom-left-radius: 7px;
          background:
            linear-gradient(
              160deg,
              rgba(255, 255, 255, 0.065),
              rgba(255, 255, 255, 0.02)
            );
          border: 1px solid
            rgba(200, 208, 255, 0.13);
          box-shadow:
            inset 0 1px 0
              rgba(255, 255, 255, 0.07),
            0 14px 34px
              rgba(0, 0, 0, 0.32);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }

        .typing {
          display: flex;
          align-items: center;
          gap: 6px;
          height: 29px;
          padding: 0 4px;
        }

        .typing i {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #b9a8ff;
          box-shadow:
            0 0 10px
              rgba(150, 120, 255, 0.8);
          animation:
            typingDot 1.2s ease-in-out
              infinite;
        }

        .typing i:nth-child(2) {
          animation-delay: 0.15s;
        }

        .typing i:nth-child(3) {
          animation-delay: 0.3s;
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
            rgba(255, 255, 255, 0.28);
          box-shadow:
            0 6px 18px
              rgba(0, 0, 0, 0.35);
        }

        .user-text {
          white-space: pre-wrap;
        }

        .message-copy {
          margin-top: 8px;
          padding: 5px 11px 5px 12px;
          border: 1px solid
            rgba(200, 206, 255, 0.14);
          border-radius: 999px;
          background:
            rgba(255, 255, 255, 0.04);
          color:
            rgba(205, 212, 242, 0.7);
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          cursor: pointer;
          transition:
            color 0.2s ease,
            border-color 0.2s ease;
        }

        .message-copy:hover {
          color: #ffffff;
          border-color:
            rgba(170, 150, 255, 0.5);
        }

        .message-copy svg {
          width: 15px;
          height: 15px;
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
          color: #ffffff;
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
          color: #a98bff;
          flex: 0 0 auto;
        }

        .list-number {
          color: #8fe4ff;
          min-width: 25px;
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
          padding: 1px 6px;
          border-radius: 6px;
          background:
            rgba(255, 255, 255, 0.08);
          border: 1px solid
            rgba(200, 206, 255, 0.1);
          color: #d3c9ff;
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
          border-radius: 14px;
          background: #06070e;
          border: 1px solid
            rgba(200, 206, 255, 0.13);
        }

        .code-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 11px;
          background:
            rgba(255, 255, 255, 0.04);
          border-bottom: 1px solid
            rgba(200, 206, 255, 0.1);
        }

        .code-language {
          color: #b9b0ff;
          font-size: 9px;
          letter-spacing: 1.5px;
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
          width: 36px;
          height: 36px;
          flex: 0 0 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 11px;
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
          width: 38px;
          height: 38px;
          flex: 0 0 38px;
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
          width: 20px;
          height: 20px;
          filter:
            drop-shadow(
              0 0 4px
                rgba(255, 255, 255, 0.7)
            )
            drop-shadow(
              0 0 9px
                rgba(28, 224, 255, 0.38)
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

        @keyframes emblemSpin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
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

        @keyframes auraDriftA {
          from {
            transform: translate(0, 0);
          }

          to {
            transform: translate(40px, -50px);
          }
        }

        @keyframes auraDriftB {
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

        @media (prefers-reduced-motion: reduce) {
          .home-content > *,
          .message,
          .bg-aura,
          .emblem-halo,
          .emblem-ring,
          .typing i {
            animation: none;
          }
        }

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
            width: 92px;
            height: 92px;
          }

          .emblem-m {
            width: 40px;
            height: 40px;
          }

          .greeting {
            margin-top: 18px;
          }

          .hello {
            font-size: 16px;
          }

          .greeting h1 {
            font-size: 32px;
          }

          .hairline {
            margin-top: 14px;
          }

          .intro {
            margin-top: 12px;
            font-size: 13px;
            line-height: 1.9;
          }

          .intro-sub {
            font-size: 12px;
          }

          .suggestions {
            margin-top: 18px;
            gap: 8px;
          }

          .suggestion {
            padding: 10px 12px;
            border-radius: 16px;
          }

          .s-icon {
            width: 36px;
            height: 36px;
            flex-basis: 36px;
            border-radius: 12px;
          }

          .s-icon svg {
            width: 19px;
            height: 19px;
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
            font-size: 7px;
          }

          .messages {
            padding-top: 20px;
            gap: 16px;
          }

          .message-wrapper {
            max-width: 92%;
          }

          .ai-message .message-wrapper {
            max-width: 96%;
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
          .emblem {
            width: 76px;
            height: 76px;
          }

          .emblem-halo {
            inset: -24px;
          }

          .emblem-m {
            width: 34px;
            height: 34px;
          }

          .greeting {
            margin-top: 14px;
          }

          .greeting h1 {
            font-size: 28px;
          }

          .hello {
            margin-top: 8px;
          }

          .hairline {
            margin-top: 11px;
          }

          .intro {
            margin-top: 9px;
          }

          .intro-sub {
            display: none;
          }

          .suggestions {
            margin-top: 14px;
          }
        }
      `}</style>
    </main>
  );
}
