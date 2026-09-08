import { NextRequest } from "next/server";

const SYSTEM_INSTRUCTION = `
تو Mobixa AI هستی؛ یک دستیار هوش مصنوعی حرفه‌ای، سریع، دقیق و طبیعی.

مهم‌ترین قوانین پاسخ‌گویی:

1. همیشه دقیقاً به چیزی که کاربر پرسیده پاسخ بده و به کلمات و منظور او توجه زیادی کن.
2. پاسخ‌ها باید طبیعی، انسانی، روان و شبیه یک دستیار حرفه‌ای مثل ChatGPT باشند.
3. اگر کاربر فارسی صحبت می‌کند، فارسی روان و طبیعی جواب بده.
4. پاسخ‌ها را بی‌دلیل طولانی نکن. اگر سؤال ساده است، پاسخ ساده و مستقیم بده.
5. اگر سؤال نیاز به توضیح دارد، مرحله‌به‌مرحله و واضح توضیح بده.
6. اگر کاربر در برنامه‌نویسی یا دیباگ کردن کد مشکل دارد، دقیقاً مشکل را پیدا کن و راه‌حل عملی بده.
7. اگر کاربر کد کامل یک فایل را خواست، کل فایل را یک‌جا و کامل ارائه کن.
8. در پاسخ‌های عادی از Markdown سنگین استفاده نکن.
9. از علامت‌های اضافی مثل ### و ** برای تزئین متن استفاده نکن.
10. هرگز اطلاعات داخلی مربوط به Provider، مدل، API، سیستم moderation یا وضعیت داخلی سرویس را به کاربر نشان نده.
11. هرگز متن‌هایی مثل User Safety، Safety Status، Provider Status یا اطلاعات داخلی سیستم را در پاسخ نیاور.
12. اگر کاربر درباره سازنده Mobixa AI پرسید، بگو سازنده آن بنیامین است.
13. اگر کاربر درباره خود Mobixa AI پرسید، آن را یک دستیار هوش مصنوعی حرفه‌ای معرفی کن.
14. اگر اطلاعات کافی برای پاسخ وجود ندارد، واضح بگو چه چیزی لازم است.
15. هیچ‌وقت وانمود نکن کاری را انجام داده‌ای که واقعاً انجام نداده‌ای.
`;

function cleanErrorMessage(message: string) {
  const text = String(message || "");

  if (/quota|rate.?limit|too many requests|429/i.test(text)) {
    return "سرویس هوش مصنوعی فعلاً به سقف درخواست‌ها رسیده است. چند لحظه بعد دوباره امتحان کن.";
  }

  if (/high demand|currently experiencing high demand/i.test(text)) {
    return "سرویس هوش مصنوعی فعلاً شلوغ است. چند لحظه بعد دوباره امتحان کن.";
  }

  if (/timeout|timed out/i.test(text)) {
    return "پاسخ‌گویی سرویس بیش از حد طول کشید. دوباره امتحان کن.";
  }

  if (/network|fetch failed|connection|connect/i.test(text)) {
    return "ارتباط با سرویس هوش مصنوعی برقرار نشد. دوباره امتحان کن.";
  }

  if (/api.?key|authentication|unauthorized|401|invalid.*key/i.test(text)) {
    return "اتصال سرویس هوش مصنوعی نیاز به بررسی تنظیمات دارد.";
  }

  if (/403|forbidden/i.test(text)) {
    return "دسترسی سرویس هوش مصنوعی رد شد. تنظیمات اتصال باید بررسی شود.";
  }

  if (/404|not found/i.test(text)) {
    return "مدل یا سرویس هوش مصنوعی در دسترس نیست.";
  }

  return "سرویس هوش مصنوعی در حال حاضر در دسترس نیست. لطفاً دوباره امتحان کن.";
}

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

function createGeminiStream(response: Response) {
  if (!response.body) {
    throw new Error("Gemini response body is empty");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let buffer = "";

  return new ReadableStream({
    async pull(controller) {
      try {
        const { done, value } = await reader.read();

        if (done) {
          if (buffer.trim()) {
            const lines = buffer.split("\n");

            for (const line of lines) {
              if (!line.startsWith("data:")) continue;

              const jsonText = line.slice(5).trim();

              if (!jsonText || jsonText === "[DONE]") continue;

              try {
                const data = JSON.parse(jsonText);

                const text =
                  data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

                if (text) {
                  controller.enqueue(sanitizeOutput(text));
                }
              } catch {}
            }
          }

          controller.close();
          return;
        }

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data:")) continue;

          const jsonText = line.slice(5).trim();

          if (!jsonText || jsonText === "[DONE]") continue;

          try {
            const data = JSON.parse(jsonText);

            const text =
              data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

            if (text) {
              const cleaned = sanitizeOutput(text);

              if (cleaned) {
                controller.enqueue(cleaned);
              }
            }
          } catch {}
        }
      } catch (error) {
        console.error(
          "GEMINI_STREAM_ERROR:",
          error instanceof Error ? error.message : String(error)
        );

        controller.error(error);
      }
    },
  });
}

async function createOpenRouterStream(
  message: string,
  apiKey: string
) {
  console.error(
    "OPENROUTER_DIAG_START " +
      JSON.stringify({
        keyPresent: Boolean(apiKey),
        model: "openrouter/free",
      })
  );

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
    const errorMessage =
      error instanceof Error ? error.message : String(error);

    console.error(
      "OPENROUTER_FETCH_ERROR " +
        JSON.stringify({
          message: errorMessage,
        })
    );

    throw new Error(errorMessage);
  }

  console.error(
    "OPENROUTER_RESPONSE " +
      JSON.stringify({
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        contentType:
          response.headers.get("content-type") || "",
      })
  );

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

    console.error(
      "OPENROUTER_HTTP_ERROR " +
        JSON.stringify({
          status: response.status,
          statusText: response.statusText,
          providerMessage,
          body: rawBody.slice(0, 3000),
        })
    );

    throw new Error(
      providerMessage ||
        `OpenRouter HTTP ${response.status}`
    );
  }

  if (!response.body) {
    console.error(
      "OPENROUTER_BODY_ERROR: response body is empty"
    );

    throw new Error("OpenRouter response body is empty");
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

          if (!jsonText || jsonText === "[DONE]") continue;

          try {
            const data = JSON.parse(jsonText);

            const text =
              data?.choices?.[0]?.delta?.content || "";

            if (text) {
              const cleaned = sanitizeOutput(text);

              if (cleaned) {
                controller.enqueue(cleaned);
              }
            }
          } catch {}
        }
      } catch (error) {
        console.error(
          "OPENROUTER_STREAM_ERROR:",
          error instanceof Error
            ? error.message
            : String(error)
        );

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
            "Content-Type": "application/json",
          },
        }
      );
    }

    const geminiKey =
      process.env.GEMINI_API_KEY;

    const openRouterKey =
      process.env.OPENROUTER_API_KEY;

    console.error(
      "AI_KEYS_STATUS " +
        JSON.stringify({
          geminiKeyPresent: Boolean(geminiKey),
          openRouterKeyPresent: Boolean(openRouterKey),
        })
    );

    if (!geminiKey) {
      console.error(
        "GEMINI_KEY_MISSING: GEMINI_API_KEY is not configured"
      );

      return new Response(
        JSON.stringify({
          error:
            "تنظیمات سرویس هوش مصنوعی کامل نیست.",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
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
            "Content-Type": "application/json",
            "x-goog-api-key": geminiKey,
            Accept: "text/event-stream",
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [
                {
                  text: SYSTEM_INSTRUCTION,
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

      console.error(
        "GEMINI_RESPONSE " +
          JSON.stringify({
            status: geminiResponse.status,
            statusText: geminiResponse.statusText,
            ok: geminiResponse.ok,
            contentType:
              geminiResponse.headers.get(
                "content-type"
              ) || "",
          })
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : String(error);

      console.error(
        "GEMINI_FETCH_ERROR " +
          JSON.stringify({
            message: errorMessage,
          })
      );

      geminiResponse = new Response(null, {
        status: 503,
      });
    }

    if (geminiResponse.ok && geminiResponse.body) {
      console.error("GEMINI_SUCCESS");

      return new Response(
        createGeminiStream(geminiResponse),
        {
          headers: {
            "Content-Type":
              "text/plain; charset=utf-8",
            "Cache-Control":
              "no-cache, no-transform",
            Connection: "keep-alive",
          },
        }
      );
    }

    let geminiErrorMessage = "";

    try {
      const rawGeminiError =
        await geminiResponse.text();

      try {
        const data =
          JSON.parse(rawGeminiError);

        geminiErrorMessage =
          data?.error?.message ||
          data?.error?.status ||
          "";
      } catch {
        geminiErrorMessage =
          rawGeminiError.slice(0, 2000);
      }

      console.error(
        "GEMINI_HTTP_ERROR " +
          JSON.stringify({
            status: geminiResponse.status,
            body: rawGeminiError.slice(0, 3000),
            parsedMessage:
              geminiErrorMessage,
          })
      );
    } catch (error) {
      console.error(
        "GEMINI_ERROR_READ_FAILED:",
        error instanceof Error
          ? error.message
          : String(error)
      );
    }

    const fallbackStatuses = [
      408,
      409,
      425,
      429,
      500,
      502,
      503,
      504,
    ];

    if (
      !fallbackStatuses.includes(
        geminiResponse.status
      )
    ) {
      return new Response(
        JSON.stringify({
          error: cleanErrorMessage(
            geminiErrorMessage ||
              `Gemini HTTP ${geminiResponse.status}`
          ),
        }),
        {
          status: geminiResponse.status,
          headers: {
            "Content-Type":
              "application/json",
          },
        }
      );
    }

    console.error(
      "GEMINI_FALLBACK_TRIGGERED " +
        JSON.stringify({
          status: geminiResponse.status,
          reason:
            geminiErrorMessage ||
            "unknown",
        })
    );

    if (!openRouterKey) {
      console.error(
        "OPENROUTER_KEY_MISSING: OPENROUTER_API_KEY is not configured"
      );

      return new Response(
        JSON.stringify({
          error:
            "سرویس اصلی در دسترس نیست و سرویس پشتیبان نیز تنظیم نشده است.",
        }),
        {
          status: 503,
          headers: {
            "Content-Type":
              "application/json",
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

      console.error(
        "OPENROUTER_SUCCESS"
      );

      return new Response(
        openRouterStream,
        {
          headers: {
            "Content-Type":
              "text/plain; charset=utf-8",
            "Cache-Control":
              "no-cache, no-transform",
            Connection: "keep-alive",
          },
        }
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : String(error);

      console.error(
        "OPENROUTER_FALLBACK_ERROR " +
          JSON.stringify({
            message: errorMessage,
          })
      );

      return new Response(
        JSON.stringify({
          error:
            "سرویس هوش مصنوعی فعلاً در دسترس نیست. لطفاً چند لحظه بعد دوباره امتحان کن.",
        }),
        {
          status: 503,
          headers: {
            "Content-Type":
              "application/json",
          },
        }
      );
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : String(error);

    console.error(
      "CHAT_ROUTE_ERROR " +
        JSON.stringify({
          message: errorMessage,
        })
    );

    return new Response(
      JSON.stringify({
        error:
          "خطایی در پردازش درخواست رخ داد.",
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
}
