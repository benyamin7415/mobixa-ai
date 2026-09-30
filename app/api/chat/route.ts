import { NextRequest } from "next/server";

export const runtime = "nodejs";

type HistoryMessage = {
  role: "user" | "assistant";
  content: string;
  image?: string | null;
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
const OPENROUTER_MODEL = "google/gemini-3-flash-preview";
const GROQ_MODEL = "qwen/qwen3.6-27b";

const VISION_INSTRUCTION = `
اگر تصویر وجود دارد، خودِ تصویر را واقعاً بررسی کن و آن را منبع اصلی پاسخ قرار بده.

تمام بخش‌های قابل مشاهده تصویر را با دقت بررسی کن؛
متن، اعداد، اشیا، نمودارها، فرمول‌ها، نوشته‌های ریز و جزئیات مرتبط را بررسی کن.

اگر کاربر همراه تصویر متن یا سؤال فرستاده است:
دقیقاً همان دستور کاربر را روی همان تصویر اجرا کن و موضوع را عوض نکن.

اگر کاربر فقط تصویر فرستاده و هیچ متن یا سؤالی نداده است:
خود تصویر را بررسی کن و بدون ساختن دستور اضافی از طرف کاربر، محتوای واقعی تصویر را تحلیل کن.

اگر کاربر بعداً درباره تصویری که قبلاً در همین مکالمه فرستاده سؤال کرد:
تصویر قبلی را از تاریخچه مکالمه در نظر بگیر و پاسخ را بر اساس همان تصویر بده.

اگر بخشی از تصویر واقعاً قابل تشخیص نیست، صادقانه بگو قابل تشخیص نیست و حدس نزن.

هرگز چیزی را که واقعاً در تصویر قابل مشاهده نیست به تصویر نسبت نده.
`;

function jsonError(message: string, status: number) {
  return new Response(
    JSON.stringify({
      error: message,
    }),
    {
      status,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    }
  );
}

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
  const commaIndex = dataUrl.indexOf(",");

  if (commaIndex === -1) {
    return null;
  }

  return dataUrl.slice(commaIndex + 1);
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

  return (
    Math.floor(
      (base64.length * 3) / 4
    ) - padding
  );
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

  if (
    byteSize >
    MAX_IMAGE_BYTES
  ) {
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

      const hasText =
        typeof candidate.content ===
          "string" &&
        Boolean(
          candidate.content.trim()
        );

      const hasImage =
        typeof candidate.image ===
          "string" &&
        candidate.image.startsWith(
          "data:image/"
        );

      return (
        (
          candidate.role === "user" ||
          candidate.role === "assistant"
        ) &&
        (hasText || hasImage)
      );
    })
    .slice(-30)
    .map((item) => {
      const candidate =
        item as HistoryMessage;

      let image:
        | string
        | null = null;

      if (
        typeof candidate.image ===
          "string" &&
        candidate.image
      ) {
        try {
          const checked =
            validateImage(
              candidate.image
            );

          if (checked) {
            image =
              candidate.image;
          }
        } catch {
          image = null;
        }
      }

      return {
        role:
          candidate.role,
        content:
          typeof candidate.content ===
            "string"
            ? candidate.content.slice(
                0,
                20000
              )
            : "",
        image,
      };
    });
}

function extractGeminiText(
  value: any
): string {
  const parts =
    value?.candidates?.[0]
      ?.content?.parts;

  if (!Array.isArray(parts)) {
    return "";
  }

  return parts
    .map((part: any) =>
      typeof part?.text ===
        "string"
        ? part.text
        : ""
    )
    .join("");
}

function buildGeminiContents(
  history: HistoryMessage[],
  message: string,
  image:
    | {
        mimeType: string;
        base64: string;
      }
    | null
) {
  const contents: any[] = [];

  for (const item of history) {
    const parts: any[] = [];

    if (
      item.content &&
      item.content.trim()
    ) {
      parts.push({
        text: item.content,
      });
    }

    if (item.image) {
      try {
        const historyImage =
          validateImage(
            item.image
          );

        if (historyImage) {
          parts.push({
            inlineData: {
              mimeType:
                historyImage.mimeType,
              data:
                historyImage.base64,
            },
          });
        }
      } catch {
        // Ignore invalid historical images.
      }
    }

    if (parts.length) {
      contents.push({
        role:
          item.role === "assistant"
            ? "model"
            : "user",
        parts,
      });
    }
  }

  const currentParts: any[] = [];

  /*
    مهم:
    اگر کاربر فقط عکس فرستاده،
    هیچ متن ساختگی به مدل اضافه نمی‌کنیم.
  */

  if (
    message &&
    message.trim()
  ) {
    currentParts.push({
      text: message,
    });
  }

  if (image) {
    currentParts.push({
      inlineData: {
        mimeType:
          image.mimeType,
        data:
          image.base64,
      },
    });
  }

  if (currentParts.length) {
    contents.push({
      role: "user",
      parts: currentParts,
    });
  }

  return contents;
}

function buildOpenRouterMessages(
  history: HistoryMessage[],
  message: string,
  image: string | null
) {
  const messages: any[] = [
    {
      role: "system",
      content:
        VISION_INSTRUCTION,
    },
  ];

  for (const item of history) {
    if (item.image) {
      const content: any[] = [];

      if (
        item.content &&
        item.content.trim()
      ) {
        content.push({
          type: "text",
          text: item.content,
        });
      }

      content.push({
        type: "image_url",
        image_url: {
          url: item.image,
        },
      });

      messages.push({
        role: item.role,
        content,
      });
    } else if (
      item.content &&
      item.content.trim()
    ) {
      messages.push({
        role: item.role,
        content: item.content,
      });
    }
  }

  if (image) {
    const content: any[] = [];

    if (
      message &&
      message.trim()
    ) {
      content.push({
        type: "text",
        text: message,
      });
    }

    content.push({
      type: "image_url",
      image_url: {
        url: image,
      },
    });

    messages.push({
      role: "user",
      content,
    });
  } else if (
    message &&
    message.trim()
  ) {
    messages.push({
      role: "user",
      content: message,
    });
  }

  return messages;
}

function buildGroqMessages(
  history: HistoryMessage[],
  message: string,
  image: string | null
) {
  const messages: any[] = [
    {
      role: "system",
      content:
        VISION_INSTRUCTION,
    },
  ];

  for (const item of history) {
    if (item.image) {
      const content: any[] = [];

      if (
        item.content &&
        item.content.trim()
      ) {
        content.push({
          type: "text",
          text: item.content,
        });
      }

      content.push({
        type: "image_url",
        image_url: {
          url: item.image,
        },
      });

      messages.push({
        role: item.role,
        content,
      });
    } else if (
      item.content &&
      item.content.trim()
    ) {
      messages.push({
        role: item.role,
        content: item.content,
      });
    }
  }

  if (image) {
    const content: any[] = [];

    if (
      message &&
      message.trim()
    ) {
      content.push({
        type: "text",
        text: message,
      });
    }

    content.push({
      type: "image_url",
      image_url: {
        url: image,
      },
    });

    messages.push({
      role: "user",
      content,
    });
  } else if (
    message &&
    message.trim()
  ) {
    messages.push({
      role: "user",
      content: message,
    });
  }

  return messages;
}

async function streamGemini(
  apiKey: string,
  history: HistoryMessage[],
  message: string,
  image:
    | {
        mimeType: string;
        base64: string;
      }
    | null
): Promise<Response> {
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse&key=${encodeURIComponent(
      apiKey
    )}`;

  const response =
    await fetch(
      url,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text:
                  VISION_INSTRUCTION,
              },
            ],
          },
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
      }
    );

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
    new ReadableStream<
      Uint8Array
    >({
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
                const text =
                  extractGeminiText(
                    JSON.parse(data)
                  );

                if (text) {
                  controller.enqueue(
                    encoder.encode(
                      text
                    )
                  );
                }
              } catch {
                // Ignore malformed/incomplete SSE chunks.
              }
            }
          }

          const finalLine =
            buffer.trim();

          if (
            finalLine.startsWith(
              "data:"
            )
          ) {
            try {
              const data =
                finalLine
                  .slice(5)
                  .trim();

              const text =
                extractGeminiText(
                  JSON.parse(data)
                );

              if (text) {
                controller.enqueue(
                  encoder.encode(text)
                );
              }
            } catch {
              // Ignore malformed final chunk.
            }
          }

          controller.close();
        } catch (error) {
          controller.error(
            error
          );
        }
      },
    });

  return new Response(
    stream,
    {
      status: 200,
      headers: {
        "Content-Type":
          "text/plain; charset=utf-8",
        "Cache-Control":
          "no-cache, no-transform",
        "X-Accel-Buffering":
          "no",
      },
    }
  );
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
    new ReadableStream<
      Uint8Array
    >({
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
                // Ignore malformed chunks.
              }
            }
          }

          controller.close();
        } catch (error) {
          controller.error(
            error
          );
        }
      },
    });

  return new Response(
    stream,
    {
      status: 200,
      headers: {
        "Content-Type":
          "text/plain; charset=utf-8",
        "Cache-Control":
          "no-cache, no-transform",
        "X-Accel-Buffering":
          "no",
      },
    }
  );
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
    new ReadableStream<
      Uint8Array
    >({
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
                // Ignore malformed chunks.
              }
            }
          }

          controller.close();
        } catch (error) {
          controller.error(
            error
          );
        }
      },
    });

  return new Response(
    stream,
    {
      status: 200,
      headers: {
        "Content-Type":
          "text/plain; charset=utf-8",
        "Cache-Control":
          "no-cache, no-transform",
        "X-Accel-Buffering":
          "no",
      },
    }
  );
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
      process.env.OPENROUTER_API_KEY;

    const groqKey =
      process.env.GROQ_API_KEY;

    const errors: string[] = [];

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
