import { NextRequest } from "next/server";

type HistoryMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatRequest = {
  message?: string;
  image?: string | null;
  history?: HistoryMessage[];
};

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const GEMINI_MODEL = "gemini-3.6-flash";

const OPENROUTER_MODEL =
  "google/gemini-3-flash-preview";

const GROQ_MODEL =
  "qwen/qwen3.8-27b";

function jsonError(
  message: string,
  status: number
) {
  return new Response(
    JSON.stringify({
      error: message,
    }),
    {
      status,
      headers: {
        "Content-Type":
          "application/json; charset=utf-8",
        "Cache-Control":
          "no-store",
      },
    }
  );
}

/* =========================================================
   IMAGE HELPERS
========================================================= */

function getMimeTypeFromDataUrl(
  dataUrl: string
): string | null {
  const match = dataUrl.match(
    /^data:(image\/(?:jpeg|png|webp));base64,/i
  );

  return match?.[1]?.toLowerCase() || null;
}

function getBase64FromDataUrl(
  dataUrl: string
): string | null {
  const commaIndex =
    dataUrl.indexOf(",");

  if (commaIndex === -1) {
    return null;
  }

  return dataUrl.slice(
    commaIndex + 1
  );
}

function getBase64ByteSize(
  base64: string
): number {
  const padding =
    base64.endsWith("==")
      ? 2
      : base64.endsWith("=")
        ? 1
        : 0;

  return Math.floor(
    (base64.length * 3) / 4
  ) - padding;
}

function validateImage(
  image: unknown
):
  | {
      mimeType: string;
      base64: string;
    }
  | null {
  if (
    typeof image !== "string" ||
    !image
  ) {
    return null;
  }

  const mimeType =
    getMimeTypeFromDataUrl(image);

  if (
    !mimeType ||
    !ALLOWED_IMAGE_TYPES.has(
      mimeType
    )
  ) {
    throw new Error(
      "فرمت تصویر پشتیبانی نمی‌شود. فقط JPG، PNG و WEBP مجاز هستند."
    );
  }

  const base64 =
    getBase64FromDataUrl(image);

  if (!base64) {
    throw new Error(
      "داده تصویر معتبر نیست."
    );
  }

  const byteSize =
    getBase64ByteSize(base64);

  if (byteSize > MAX_IMAGE_BYTES) {
    throw new Error(
      "حجم تصویر نباید بیشتر از ۵ مگابایت باشد."
    );
  }

  return {
    mimeType,
    base64,
  };
}

/* =========================================================
   HISTORY
========================================================= */

function sanitizeHistory(
  history: unknown
): HistoryMessage[] {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .filter((item) => {
      if (
        !item ||
        typeof item !== "object"
      ) {
        return false;
      }

      const candidate =
        item as Partial<HistoryMessage>;

      return (
        (candidate.role === "user" ||
          candidate.role === "assistant") &&
        typeof candidate.content ===
          "string" &&
        candidate.content.trim()
      );
    })
    .slice(-30)
    .map((item) => {
      const candidate =
        item as HistoryMessage;

      return {
        role: candidate.role,
        content:
          candidate.content.slice(
            0,
            20000
          ),
      };
    });
}

/* =========================================================
   GEMINI
========================================================= */

function extractGeminiText(
  value: any
): string {
  const parts =
    value?.candidates?.[0]?.content
      ?.parts;

  if (!Array.isArray(parts)) {
    return "";
  }

  return parts
    .map((part: any) =>
      typeof part?.text === "string"
        ? part.text
        : ""
    )
    .join("");
}

function buildGeminiContents(
  history: HistoryMessage[],
  message: string,
  image: {
    mimeType: string;
    base64: string;
  } | null
) {
  const contents: any[] =
    history.map((item) => ({
      role:
        item.role === "assistant"
          ? "model"
          : "user",
      parts: [
        {
          text: item.content,
        },
      ],
    }));

  const currentParts: any[] = [];

  if (image) {
    currentParts.push({
      text:
        message.trim() ||
        "این تصویر را با دقت بررسی کن و فقط بر اساس محتوای واقعی همین تصویر پاسخ بده. اگر متن، مسئله، نمودار، جدول یا اطلاعاتی داخل تصویر وجود دارد، ابتدا همان موارد را از تصویر استخراج و سپس تحلیل کن. درباره چیزهایی که در تصویر وجود ندارند حدس نزن.",
    });

    currentParts.push({
      inlineData: {
        mimeType:
          image.mimeType,
        data: image.base64,
      },
    });
  } else {
    currentParts.push({
      text:
        message ||
        "لطفاً به این درخواست پاسخ بده.",
    });
  }

  contents.push({
    role: "user",
    parts: currentParts,
  });

  return contents;
}

async function streamGemini(
  apiKey: string,
  history: HistoryMessage[],
  message: string,
  image: {
    mimeType: string;
    base64: string;
  } | null
): Promise<Response> {
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse&key=${encodeURIComponent(apiKey)}`;

  const response =
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        contents:
          buildGeminiContents(
            history,
            message,
            image
          ),
      }),
    });

  if (!response.ok) {
    const errorBody =
      await response.text();

    throw new Error(
      `Gemini ${response.status}: ${errorBody.slice(
        0,
        800
      )}`
    );
  }

  if (!response.body) {
    throw new Error(
      "Gemini response body is empty."
    );
  }

  const reader =
    response.body.getReader();

  const decoder =
    new TextDecoder();

  const encoder =
    new TextEncoder();

  let buffer = "";

  const stream =
    new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          while (true) {
            const {
              value,
              done,
            } = await reader.read();

            if (done) {
              break;
            }

            buffer += decoder.decode(
              value,
              {
                stream: true,
              }
            );

            const lines =
              buffer.split("\n");

            buffer =
              lines.pop() || "";

            for (
              const rawLine of lines
            ) {
              const line =
                rawLine.trim();

              if (
                !line.startsWith(
                  "data:"
                )
              ) {
                continue;
              }

              const data =
                line
                  .slice(5)
                  .trim();

              if (!data) {
                continue;
              }

              try {
                const parsed =
                  JSON.parse(data);

                const text =
                  extractGeminiText(
                    parsed
                  );

                if (text) {
                  controller.enqueue(
                    encoder.encode(
                      text
                    )
                  );
                }
              } catch {
                // Ignore malformed/incomplete SSE data.
              }
            }
          }

          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type":
        "text/plain; charset=utf-8",
      "Cache-Control":
        "no-cache, no-transform",
      "X-Accel-Buffering":
        "no",
    },
  });
}

/* =========================================================
   OPENROUTER
========================================================= */

function buildOpenRouterMessages(
  history: HistoryMessage[],
  message: string,
  image: string | null
) {
  const messages: any[] =
    history.map((item) => ({
      role: item.role,
      content: item.content,
    }));

  if (image) {
    messages.push({
      role: "user",
      content: [
        {
          type: "text",
          text:
            message.trim() ||
            "این تصویر را با دقت بررسی کن. فقط بر اساس محتوای واقعی همین تصویر پاسخ بده و چیزی را که در تصویر نیست حدس نزن.",
        },
        {
          type: "image_url",
          image_url: {
            url: image,
          },
        },
      ],
    });
  } else {
    messages.push({
      role: "user",
      content:
        message ||
        "لطفاً به این درخواست پاسخ بده.",
    });
  }

  return messages;
}

async function streamOpenRouter(
  apiKey: string,
  history: HistoryMessage[],
  message: string,
  image: string | null
): Promise<Response> {
  const response =
    await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${apiKey}`,

          "HTTP-Referer":
            "https://mobixa-ai.benyaminkazemi3308.workers.dev",

          "X-Title":
            "MOBIXA AI",
        },

        body: JSON.stringify({
          model:
            OPENROUTER_MODEL,

          messages:
            buildOpenRouterMessages(
              history,
              message,
              image
            ),

          stream: true,

          temperature: 0.7,
        }),
      }
    );

  if (!response.ok) {
    const errorBody =
      await response.text();

    throw new Error(
      `OpenRouter ${response.status}: ${errorBody.slice(
        0,
        800
      )}`
    );
  }

  if (!response.body) {
    throw new Error(
      "OpenRouter response body is empty."
    );
  }

  const reader =
    response.body.getReader();

  const decoder =
    new TextDecoder();

  const encoder =
    new TextEncoder();

  let buffer = "";

  const stream =
    new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          while (true) {
            const {
              value,
              done,
            } = await reader.read();

            if (done) {
              break;
            }

            buffer += decoder.decode(
              value,
              {
                stream: true,
              }
            );

            const lines =
              buffer.split("\n");

            buffer =
              lines.pop() || "";

            for (
              const rawLine of lines
            ) {
              const line =
                rawLine.trim();

              if (
                !line.startsWith(
                  "data:"
                )
              ) {
                continue;
              }

              const data =
                line
                  .slice(5)
                  .trim();

              if (
                !data ||
                data === "[DONE]"
              ) {
                continue;
              }

              try {
                const parsed =
                  JSON.parse(data);

                const text =
                  parsed?.choices?.[0]
                    ?.delta?.content;

                if (
                  typeof text ===
                    "string" &&
                  text
                ) {
                  controller.enqueue(
                    encoder.encode(
                      text
                    )
                  );
                }
              } catch {
                // Ignore malformed SSE chunks.
              }
            }
          }

          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type":
        "text/plain; charset=utf-8",
      "Cache-Control":
        "no-cache, no-transform",
      "X-Accel-Buffering":
        "no",
    },
  });
}

/* =========================================================
   GROQ
========================================================= */

function buildGroqMessages(
  history: HistoryMessage[],
  message: string,
  image: string | null
) {
  const messages: any[] =
    history.map((item) => ({
      role: item.role,
      content: item.content,
    }));

  if (image) {
    messages.push({
      role: "user",
      content: [
        {
          type: "text",
          text:
            message.trim() ||
            "این تصویر را با دقت بررسی کن و فقط بر اساس محتوای واقعی تصویر پاسخ بده. اگر متن یا مسئله‌ای داخل تصویر است، ابتدا آن را بخوان و سپس تحلیل کن.",
        },
        {
          type: "image_url",
          image_url: {
            url: image,
          },
        },
      ],
    });
  } else {
    messages.push({
      role: "user",
      content:
        message ||
        "لطفاً به این درخواست پاسخ بده.",
    });
  }

  return messages;
}

async function streamGroq(
  apiKey: string,
  history: HistoryMessage[],
  message: string,
  image: string | null
): Promise<Response> {
  const response =
    await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${apiKey}`,
        },

        body: JSON.stringify({
          model:
            GROQ_MODEL,

          messages:
            buildGroqMessages(
              history,
              message,
              image
            ),

          stream: true,

          temperature: 0.7,
        }),
      }
    );

  if (!response.ok) {
    const errorBody =
      await response.text();

    throw new Error(
      `Groq ${response.status}: ${errorBody.slice(
        0,
        800
      )}`
    );
  }

  if (!response.body) {
    throw new Error(
      "Groq response body is empty."
    );
  }

  const reader =
    response.body.getReader();

  const decoder =
    new TextDecoder();

  const encoder =
    new TextEncoder();

  let buffer = "";

  const stream =
    new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          while (true) {
            const {
              value,
              done,
            } = await reader.read();

            if (done) {
              break;
            }

            buffer += decoder.decode(
              value,
              {
                stream: true,
              }
            );

            const lines =
              buffer.split("\n");

            buffer =
              lines.pop() || "";

            for (
              const rawLine of lines
            ) {
              const line =
                rawLine.trim();

              if (
                !line.startsWith(
                  "data:"
                )
              ) {
                continue;
              }

              const data =
                line
                  .slice(5)
                  .trim();

              if (
                !data ||
                data === "[DONE]"
              ) {
                continue;
              }

              try {
                const parsed =
                  JSON.parse(data);

                const text =
                  parsed?.choices?.[0]
                    ?.delta?.content;

                if (
                  typeof text ===
                    "string" &&
                  text
                ) {
                  controller.enqueue(
                    encoder.encode(
                      text
                    )
                  );
                }
              } catch {
                // Ignore malformed SSE chunks.
              }
            }
          }

          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type":
        "text/plain; charset=utf-8",
      "Cache-Control":
        "no-cache, no-transform",
      "X-Accel-Buffering":
        "no",
    },
  });
}

/* =========================================================
   POST
========================================================= */

export async function POST(
  request: NextRequest
) {
  try {
    const body =
      (await request.json()) as ChatRequest;

    const message =
      typeof body.message ===
      "string"
        ? body.message.trim()
        : "";

    let image:
      | {
          mimeType: string;
          base64: string;
        }
      | null = null;

    try {
      image = validateImage(
        body.image
      );
    } catch (error) {
      return jsonError(
        error instanceof Error
          ? error.message
          : "تصویر نامعتبر است.",
        400
      );
    }

    if (
      !message &&
      !image
    ) {
      return jsonError(
        "پیام یا تصویر لازم است.",
        400
      );
    }

    const history =
      sanitizeHistory(
        body.history
      );

    const geminiKey =
      process.env.GEMINI_API_KEY;

    const openRouterKey =
      process.env
        .OPENROUTER_API_KEY;

    const groqKey =
      process.env.GROQ_API_KEY;

    const errors: string[] = [];

    /* =====================================================
       1. GEMINI
    ===================================================== */

    if (geminiKey) {
      try {
        return await streamGemini(
          geminiKey,
          history,
          message,
          image
        );
      } catch (error) {
        errors.push(
          error instanceof Error
            ? error.message
            : "Gemini failed."
        );

        console.error(
          "Gemini failed:",
          error
        );
      }
    }

    /* =====================================================
       2. OPENROUTER
    ===================================================== */

    if (openRouterKey) {
      try {
        return await streamOpenRouter(
          openRouterKey,
          history,
          message,
          body.image || null
        );
      } catch (error) {
        errors.push(
          error instanceof Error
            ? error.message
            : "OpenRouter failed."
        );

        console.error(
          "OpenRouter failed:",
          error
        );
      }
    }

    /* =====================================================
       3. GROQ
    ===================================================== */

    if (groqKey) {
      try {
        return await streamGroq(
          groqKey,
          history,
          message,
          body.image || null
        );
      } catch (error) {
        errors.push(
          error instanceof Error
            ? error.message
            : "Groq failed."
        );

        console.error(
          "Groq failed:",
          error
        );
      }
    }

    /* =====================================================
       NO KEYS
    ===================================================== */

    if (
      !geminiKey &&
      !openRouterKey &&
      !groqKey
    ) {
      return jsonError(
        "هیچ سرویس هوش مصنوعی روی سرور تنظیم نشده است.",
        500
      );
    }

    console.error(
      "All AI providers failed:",
      errors
    );

    return jsonError(
      "در حال حاضر سرویس هوش مصنوعی در دسترس نیست. لطفاً کمی بعد دوباره تلاش کن.",
      503
    );
  } catch (error) {
    console.error(
      "Chat route error:",
      error
    );

    return jsonError(
      "در پردازش درخواست مشکلی پیش آمد.",
      500
    );
  }
}
