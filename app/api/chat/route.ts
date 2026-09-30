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
  "qwen/qwen3.6-27b";

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
      },
    }
  );
}

function getMimeTypeFromDataUrl(
  dataUrl: string
): string | null {
  const match =
    dataUrl.match(
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

  if (message.trim()) {
    currentParts.push({
      text: message,
    });
  }

  if (image) {
    currentParts.push({
      inlineData: {
        mimeType:
          image.mimeType,
        data: image.base64,
      },
    });
  }

  if (!currentParts.length) {
    currentParts.push({
      text:
        "این تصویر را بررسی کن و دقیقاً بر اساس محتوای واقعی تصویر توضیح بده.",
    });
  }

  contents.push({
    role: "user",
    parts: currentParts,
  });

  return contents;
}

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
            "این تصویر را دقیقاً بررسی کن و فقط بر اساس محتوای واقعی تصویر پاسخ بده.",
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
            "این تصویر را دقیقاً بررسی کن و فقط بر اساس محتوای واقعی تصویر پاسخ بده.",
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
        generationConfig: {
          temperature: 0.7,
        },
      }),
    });

  if (!response.ok) {
    const errorBody =
      await response.text();

    throw new Error(
      `Gemini ${response.status}: ${errorBody.slice(
        0,
        500
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

            buffer +=
              decoder.decode(
                value,
                {
                  stream: true,
                }
              );

            const lines =
              buffer.split("\n");

            buffer =
              lines.pop() || "";

            for (const rawLine of lines) {
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
                // Ignore incomplete SSE JSON.
              }
            }
          }

          if (buffer.trim()) {
            const line =
              buffer.trim();

            if (
              line.startsWith(
                "data:"
              )
            ) {
              const data =
                line
                  .slice(5)
                  .trim();

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
                // Ignore incomplete final JSON.
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
        500
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

            buffer +=
              decoder.decode(
                value,
                {
                  stream: true,
                }
              );

            const lines =
              buffer.split("\n");

            buffer =
              lines.pop() || "";

            for (const rawLine of lines) {
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
                // Ignore malformed chunks.
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
        500
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

            buffer +=
              decoder.decode(
                value,
                {
                  stream: true,
                }
              );

            const lines =
              buffer.split("\n");

            buffer =
              lines.pop() || "";

            for (const rawLine of lines) {
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
                // Ignore malformed chunks.
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
      image =
        validateImage(
          body.image
        );
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "تصویر نامعتبر است.";

      return jsonError(
        errorMessage,
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

    /*
      =========================
      1. GEMINI
      =========================
    */

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
      }
    }

    /*
      =========================
      2. OPENROUTER
      =========================
    */

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
      }
    }

    /*
      =========================
      3. GROQ
      =========================
    */

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
      }
    }

    /*
      =========================
      NO PROVIDER
      =========================
    */

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
