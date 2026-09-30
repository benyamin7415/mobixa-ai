"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  image?: string;
};

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history
  useEffect(() => {
    try {
      const saved = localStorage.getItem("mobixa-chat-history");

      if (!saved) return;

      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        setMessages(parsed);
      }
    } catch {
      localStorage.removeItem("mobixa-chat-history");
    }
  }, []);

  // Save chat history
  useEffect(() => {
    try {
      localStorage.setItem(
        "mobixa-chat-history",
        JSON.stringify(messages)
      );
    } catch {
      // Ignore localStorage errors
    }
  }, [messages]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  // Revoke object URL when component unmounts
  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  function openFilePicker() {
    if (loading) return;
    fileInputRef.current?.click();
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    // Reset input so selecting the same image again works
    event.target.value = "";

    if (!file) return;

    setError("");

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError(
        "این فرمت تصویر پشتیبانی نمی‌شه. JPG، PNG، WEBP یا GIF انتخاب کن."
      );
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError("حجم تصویر نباید بیشتر از ۱۰ مگابایت باشه.");
      return;
    }

    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    const previewUrl = URL.createObjectURL(file);

    setSelectedImage(file);
    setImagePreview(previewUrl);
  }

  function removeSelectedImage() {
    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setSelectedImage(null);
    setImagePreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleTextareaChange(
    event: ChangeEvent<HTMLTextAreaElement>
  ) {
    setInput(event.target.value);

    const textarea = event.target;

    textarea.style.height = "auto";
    textarea.style.height =
      Math.min(textarea.scrollHeight, 150) + "px";
  }

  function clearChat() {
    if (loading) return;

    setMessages([]);
    localStorage.removeItem("mobixa-chat-history");
    setError("");
  }

  async function handleSubmit(event?: FormEvent) {
    event?.preventDefault();

    if (loading) return;

    const text = input.trim();

    if (!text && !selectedImage) {
      return;
    }

    setError("");
    setLoading(true);

    const currentImage = selectedImage;
    const currentPreview = imagePreview;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      image: currentPreview || undefined,
    };

    setMessages((previous) => [...previous, userMessage]);

    setInput("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    // Create FormData instead of putting the image into JSON.
    const formData = new FormData();

    formData.append("message", text);

    if (currentImage) {
      formData.append("image", currentImage);
    }

    removeSelectedImage();

    const assistantId = crypto.randomUUID();

    setMessages((previous) => [
      ...previous,
      {
        id: assistantId,
        role: "assistant",
        content: "",
      },
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = "خطایی در ارتباط با هوش مصنوعی رخ داد.";

        try {
          const data = await response.json();

          if (data?.error) {
            errorMessage = data.error;
          }
        } catch {
          // Response wasn't JSON
        }

        throw new Error(errorMessage);
      }

      if (!response.body) {
        throw new Error("پاسخی از سرور دریافت نشد.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let assistantText = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value, {
          stream: true,
        });

        assistantText += chunk;

        setMessages((previous) =>
          previous.map((message) =>
            message.id === assistantId
              ? {
                  ...message,
                  content: assistantText,
                }
              : message
          )
        );
      }

      const finalChunk = decoder.decode();

      if (finalChunk) {
        assistantText += finalChunk;

        setMessages((previous) =>
          previous.map((message) =>
            message.id === assistantId
              ? {
                  ...message,
                  content: assistantText,
                }
              : message
          )
        );
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "خطای ناشناخته‌ای رخ داد.";

      setError(message);

      setMessages((previous) =>
        previous.filter((item) => item.id !== assistantId)
      );
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  }

  return (
    <main
      dir="rtl"
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 50% 0%, rgba(0,255,255,.08), transparent 35%), #05070b",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <header
        style={{
          height: 64,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 18px",
          borderBottom: "1px solid rgba(255,255,255,.08)",
          background: "rgba(5,7,11,.82)",
          backdropFilter: "blur(18px)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 11,
              display: "grid",
              placeItems: "center",
              background:
                "linear-gradient(135deg,#00eaff,#7c3cff)",
              boxShadow:
                "0 0 24px rgba(0,234,255,.25)",
              fontSize: 17,
              fontWeight: 900,
            }}
          >
            M
          </div>

          <div>
            <div
              style={{
                fontWeight: 800,
                fontSize: 15,
              }}
            >
              MOBIXA AI
            </div>

            <div
              style={{
                color: "rgba(255,255,255,.45)",
                fontSize: 11,
              }}
            >
              هوش مصنوعی موبیکسا
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={clearChat}
          disabled={loading || messages.length === 0}
          style={{
            border: "1px solid rgba(255,255,255,.1)",
            background: "rgba(255,255,255,.04)",
            color:
              loading || messages.length === 0
                ? "rgba(255,255,255,.25)"
                : "#fff",
            borderRadius: 10,
            padding: "8px 12px",
            cursor:
              loading || messages.length === 0
                ? "default"
                : "pointer",
            fontSize: 12,
          }}
        >
          پاک کردن چت
        </button>
      </header>

      {/* Messages */}
      <section
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px 14px 170px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 850,
            margin: "0 auto",
          }}
        >
          {messages.length === 0 ? (
            <div
              style={{
                minHeight: "55vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              <div>
                <div
                  style={{
                    width: 74,
                    height: 74,
                    margin: "0 auto 18px",
                    borderRadius: 25,
                    display: "grid",
                    placeItems: "center",
                    background:
                      "linear-gradient(135deg,rgba(0,234,255,.14),rgba(124,58,237,.18))",
                    border:
                      "1px solid rgba(255,255,255,.1)",
                    boxShadow:
                      "0 0 50px rgba(0,234,255,.08)",
                    fontSize: 30,
                    fontWeight: 900,
                  }}
                >
                  M
                </div>

                <h1
                  style={{
                    margin: 0,
                    fontSize: "clamp(25px,5vw,38px)",
                    fontWeight: 900,
                  }}
                >
                  سلام! 👋
                </h1>

                <p
                  style={{
                    marginTop: 10,
                    color: "rgba(255,255,255,.5)",
                    fontSize: 14,
                  }}
                >
                  هرچی می‌خوای از موبیکسا بپرس
                </p>

                <p
                  style={{
                    marginTop: 6,
                    color: "rgba(255,255,255,.3)",
                    fontSize: 12,
                  }}
                >
                  حتی می‌تونی عکس هم بفرستی 📷
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                style={{
                  display: "flex",
                  justifyContent:
                    message.role === "user"
                      ? "flex-start"
                      : "flex-end",
                  marginBottom: 18,
                }}
              >
                <div
                  style={{
                    maxWidth: "88%",
                    minWidth:
                      message.role === "assistant"
                        ? 60
                        : undefined,
                    padding:
                      message.image || message.content
                        ? "12px 14px"
                        : 0,
                    borderRadius:
                      message.role === "user"
                        ? "18px 18px 5px 18px"
                        : "18px 18px 18px 5px",
                    background:
                      message.role === "user"
                        ? "linear-gradient(135deg,rgba(0,234,255,.12),rgba(124,58,237,.14))"
                        : "rgba(255,255,255,.055)",
                    border:
                      "1px solid rgba(255,255,255,.08)",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    lineHeight: 1.8,
                    fontSize: 14,
                  }}
                >
                  {message.image && (
                    <img
                      src={message.image}
                      alt="تصویر ارسال‌شده"
                      style={{
                        display: "block",
                        width: "min(100%, 320px)",
                        maxHeight: 320,
                        objectFit: "cover",
                        borderRadius: 12,
                        marginBottom:
                          message.content ? 10 : 0,
                      }}
                    />
                  )}

                  {message.content && (
                    <div>{message.content}</div>
                  )}

                  {message.role === "assistant" &&
                    !message.content &&
                    loading && (
                      <div
                        style={{
                          display: "flex",
                          gap: 5,
                          padding: "5px 3px",
                        }}
                      >
                        <span className="mobixa-dot" />
                        <span className="mobixa-dot" />
                        <span className="mobixa-dot" />
                      </div>
                    )}
                </div>
              </div>
            ))
          )}

          {error && (
            <div
              style={{
                margin: "10px auto",
                maxWidth: 600,
                padding: "11px 14px",
                borderRadius: 12,
                border:
                  "1px solid rgba(255,80,80,.2)",
                background:
                  "rgba(255,60,60,.07)",
                color: "#ffb5b5",
                textAlign: "center",
                fontSize: 12,
              }}
            >
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </section>

      {/* Composer */}
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          padding: "12px 12px calc(12px + env(safe-area-inset-bottom))",
          background:
            "linear-gradient(to top, #05070b 65%, transparent)",
          pointerEvents: "none",
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            width: "100%",
            maxWidth: 850,
            margin: "0 auto",
            pointerEvents: "auto",
          }}
        >
          {imagePreview && (
            <div
              style={{
                position: "relative",
                width: 90,
                height: 90,
                marginBottom: 8,
                borderRadius: 14,
                overflow: "hidden",
                border:
                  "1px solid rgba(255,255,255,.15)",
                background: "#111",
              }}
            >
              <img
                src={imagePreview}
                alt="پیش‌نمایش"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />

              <button
                type="button"
                onClick={removeSelectedImage}
                disabled={loading}
                aria-label="حذف تصویر"
                style={{
                  position: "absolute",
                  top: 5,
                  right: 5,
                  width: 24,
                  height: 24,
                  border: 0,
                  borderRadius: "50%",
                  background: "rgba(0,0,0,.7)",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: 16,
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 8,
              padding: 8,
              borderRadius: 20,
              background: "rgba(12,15,22,.92)",
              border:
                "1px solid rgba(255,255,255,.1)",
              boxShadow:
                "0 15px 50px rgba(0,0,0,.4)",
              backdropFilter: "blur(20px)",
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />

            <button
              type="button"
              onClick={openFilePicker}
              disabled={loading}
              aria-label="آپلود تصویر"
              title="آپلود تصویر"
              style={{
                flexShrink: 0,
                width: 42,
                height: 42,
                borderRadius: 14,
                border:
                  "1px solid rgba(255,255,255,.08)",
                background:
                  "rgba(255,255,255,.045)",
                color: loading
                  ? "rgba(255,255,255,.25)"
                  : "#fff",
                cursor: loading
                  ? "default"
                  : "pointer",
                display: "grid",
                placeItems: "center",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect
                  x="3"
                  y="3"
                  width="18"
                  height="18"
                  rx="4"
                />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
              </svg>
            </button>

            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              disabled={loading}
              rows={1}
              placeholder={
                selectedImage
                  ? "درباره این عکس بپرس..."
                  : "پیامت رو بنویس..."
              }
              style={{
                flex: 1,
                minWidth: 0,
                maxHeight: 150,
                resize: "none",
                border: 0,
                outline: 0,
                background: "transparent",
                color: "#fff",
                padding: "10px 4px",
                fontFamily: "inherit",
                fontSize: 14,
                lineHeight: 1.6,
              }}
            />

            <button
              type="submit"
              disabled={
                loading ||
                (!input.trim() && !selectedImage)
              }
              aria-label="ارسال"
              style={{
                flexShrink: 0,
                width: 42,
                height: 42,
                border: 0,
                borderRadius: 14,
                background:
                  loading ||
                  (!input.trim() && !selectedImage)
                    ? "rgba(255,255,255,.06)"
                    : "linear-gradient(135deg,#00d9ff,#7c3cff)",
                color:
                  loading ||
                  (!input.trim() && !selectedImage)
                    ? "rgba(255,255,255,.25)"
                    : "#fff",
                cursor:
                  loading ||
                  (!input.trim() && !selectedImage)
                    ? "default"
                    : "pointer",
                display: "grid",
                placeItems: "center",
              }}
            >
              {loading ? (
                <span
                  style={{
                    width: 17,
                    height: 17,
                    borderRadius: "50%",
                    border:
                      "2px solid rgba(255,255,255,.25)",
                    borderTopColor: "#fff",
                    animation:
                      "mobixa-spin .7s linear infinite",
                  }}
                />
              ) : (
                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m22 2-7 20-4-9-9-4Z" />
                  <path d="M22 2 11 13" />
                </svg>
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        html,
        body {
          margin: 0;
          padding: 0;
          background: #05070b;
        }

        body {
          font-family:
            Arial,
            Tahoma,
            sans-serif;
        }

        textarea::placeholder {
          color: rgba(255, 255, 255, 0.32);
        }

        .mobixa-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.5);
          animation: mobixa-bounce 1.2s infinite ease-in-out;
        }

        .mobixa-dot:nth-child(2) {
          animation-delay: 0.15s;
        }

        .mobixa-dot:nth-child(3) {
          animation-delay: 0.3s;
        }

        @keyframes mobixa-bounce {
          0%,
          60%,
          100% {
            transform: translateY(0);
            opacity: 0.45;
          }

          30% {
            transform: translateY(-4px);
            opacity: 1;
          }
        }

        @keyframes mobixa-spin {
          to {
            transform: rotate(360deg);
          }
        }

        ::-webkit-scrollbar {
          width: 5px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.12);
          border-radius: 20px;
        }
      `}</style>
    </main>
  );
}
