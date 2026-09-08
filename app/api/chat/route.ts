import { NextRequest } from "next/server";

const SYSTEM_INSTRUCTION = `
تو Mobixa AI هستی؛ یک دستیار هوش مصنوعی حرفه‌ای، دقیق، سریع و طبیعی.

همیشه به منظور واقعی کاربر توجه کن و پاسخ را متناسب با سؤال او بده.
اگر کاربر فارسی صحبت می‌کند، فارسی روان و طبیعی پاسخ بده.
اگر سؤال ساده است، کوتاه و مستقیم جواب بده.
اگر نیاز به توضیح دارد، مرحله‌به‌مرحله توضیح بده.
در برنامه‌نویسی و دیباگ، مشکل را دقیق پیدا کن و راه‌حل عملی بده.
اگر کاربر کد کامل خواست، کل فایل را یکجا ارائه کن.
از اطلاعات داخلی Provider، API، moderation یا سیستم استفاده نکن.
از عبارت‌هایی مثل User Safety، Safety Status یا Provider Status در پاسخ استفاده نکن.
`;

function sanitizeOutput(text: string) {
  return String(text || "")
    .replace(
      /^\s*(User Safety|User Safety Status|User Safety Result|Safety Status|Safety Result)\s*:\s*.*$/gim,
      ""
    )
    .replace(
      /^\s*(Model|Provider|Moderation|Internal Status|System Status)\s*:\s*.*$/gim,
      ""
    )
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/^[-*_]{3,}\s*$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

function createGeminiStream(response: Response) {
  if (!response.body) {
    throw new Error("GEMINI_BODY_EMPTY");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let buffer = "";

  return new ReadableStream({
    async pull(controller) {
      try {
        const { done, value } = await reader.read();

        if (done) {
          controller.close();
          return;
        }

        buffer += decoder.decode(value, {
          stream: true,
        });

        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data:")) continue;

          const jsonText = line.slice(5).trim();

          if (!jsonText || jsonText === "[DONE]") {
            continue;
          }

          try {
            const data = JSON.parse(jsonText);

            const text =
              data?.candidates?.[0]?.content?.parts?.[0]?.text ||
              "";

            if (text) {
              const cleaned = sanitizeOutput(text);

              if (cleaned) {
                controller.enqueue(cleaned);
              }
            }
          } catch {}
        }
      } catch (error) {
        controller.error(error);
      }
    },
  });
}

async function createOpenRouterStream(
  message: string,
  apiKey: string
) {
  let response: Response;

  try {
    response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer":
            "https://mobixa-ai.benyaminkazemi3308.workers.dev",
          "X-Title": "Mobixa AI",
        },
        body: JSON.stringify({
          model: "openrouter/free",
          stream: true,
          messages: [
            {
              role: "system",
              content: SYSTEM_INSTRUCTION,
            },
            {
              role: "user",
              content: message,
            },
          ],
        }),
      }
    );
  } catch (error) {
    throw new Error(
      "OPENROUTER_FETCH_FAILED: " +
        getErrorMessage(error)
    );
  }

  if (!response.ok) {
    const rawBody = await response.text().catch(() => "");

    let providerMessage = "";

    try {
      const data = JSON.parse(rawBody);

      providerMessage =
        data?.error?.message ||
        data?.error?.code ||
        "";
    } catch {}

    throw new Error(
      "OPENROUTER_HTTP_" +
        response.status +
        ": " +
        (
          providerMessage ||
          rawBody ||
          response.statusText ||
          "Unknown OpenRouter error"
        )
    );
  }

  if (!response.body) {
    throw new Error(
      "OPENROUTER_BODY_EMPTY"
    );
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let buffer = "";

  return new ReadableStream({
    async pull(controller) {
      try {
        const { done, value } = await reader.read();

        if (done) {
          controller.close();
          return;
        }

        buffer += decoder.decode(value, {
          stream: true,
        });

        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data:")) continue;

          const jsonText = line.slice(5).trim();

          if (!jsonText || jsonText === "[DONE]") {
            continue;
          }

          try {
            const data = JSON.parse(jsonText);

            const text =
              data?.choices?.[0]?.delta?.content ||
              "";

            if (text) {
              const cleaned = sanitizeOutput(text);

              if (cleaned) {
                controller.enqueue(cleaned);
              }
            }
          } catch {}
        }
      } catch (error) {
        controller.error(error);
      }
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = body?.message;

    if (
      !message ||
      typeof message !== "string" ||
      !message.trim()
    ) {
      return new Response(
        JSON.stringify({
          error: "پیام معتبر نیست.",
        }),
        {
          status: 400,
          headers: {
            "Content-Type":
              "application/json",
          },
        }
      );
    }

    const geminiKey =
      process.env.GEMINI_API_KEY;

    const openRouterKey =
      process.env.OPENROUTER_API_KEY;

    if (!geminiKey) {
      return new Response(
        JSON.stringify({
          error:
            "DEBUG: GEMINI_API_KEY پیدا نشد.",
        }),
        {
          status: 500,
          headers: {
            "Content-Type":
              "application/json",
          },
        }
      );
    }

    let geminiResponse: Response;

    try {
      geminiResponse = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:streamGenerateContent?alt=sse",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            "x-goog-api-key":
              geminiKey,
            Accept:
              "text/event-stream",
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [
                {
                  text:
                    SYSTEM_INSTRUCTION,
                },
              ],
            },
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: message,
                  },
                ],
              },
            ],
          }),
        }
      );
    } catch (error) {
      geminiResponse = new Response(
        JSON.stringify({
          error: {
            message:
              getErrorMessage(error),
          },
        }),
        {
          status: 503,
        }
      );
    }

    if (
      geminiResponse.ok &&
      geminiResponse.body
    ) {
      return new Response(
        createGeminiStream(
          geminiResponse
        ),
        {
          headers: {
            "Content-Type":
              "text/plain; charset=utf-8",
            "Cache-Control":
              "no-cache, no-transform",
            Connection:
              "keep-alive",
          },
        }
      );
    }

    let geminiError = "";

    try {
      const raw =
        await geminiResponse.text();

      try {
        const data =
          JSON.parse(raw);

        geminiError =
          data?.error?.message ||
          data?.error?.status ||
          raw;
      } catch {
        geminiError = raw;
      }
    } catch (error) {
      geminiError =
        getErrorMessage(error);
    }

    if (!openRouterKey) {
      return new Response(
        JSON.stringify({
          error:
            "DEBUG_GEMINI_FAILED\n\n" +
            "HTTP Status: " +
            geminiResponse.status +
            "\n\n" +
            "Gemini Error:\n" +
            geminiError +
            "\n\n" +
            "OpenRouter API Key: MISSING",
        }),
        {
          status: 503,
          headers: {
            "Content-Type":
              "application/json; charset=utf-8",
          },
        }
      );
    }

    try {
      const openRouterStream =
        await createOpenRouterStream(
          message,
          openRouterKey
        );

      return new Response(
        openRouterStream,
        {
          headers: {
            "Content-Type":
              "text/plain; charset=utf-8",
            "Cache-Control":
              "no-cache, no-transform",
            Connection:
              "keep-alive",
          },
        }
      );
    } catch (error) {
      const openRouterError =
        getErrorMessage(error);

      return new Response(
        JSON.stringify({
          error:
            "DEBUG_AI_FAILURE\n\n" +
            "========== GEMINI ==========\n" +
            "HTTP Status: " +
            geminiResponse.status +
            "\n\n" +
            geminiError +
            "\n\n" +
            "========== OPENROUTER ==========\n" +
            openRouterError,
        }),
        {
          status: 503,
          headers: {
            "Content-Type":
              "application/json; charset=utf-8",
          },
        }
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({
        error:
          "DEBUG_ROUTE_ERROR\n\n" +
          getErrorMessage(error),
      }),
      {
        status: 500,
        headers: {
          "Content-Type":
            "application/json; charset=utf-8",
        },
      }
    );
  }
}
