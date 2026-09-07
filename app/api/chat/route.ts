import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== "string") {
      return new Response(
        JSON.stringify({
          error: "پیام معتبر نیست.",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
        }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "Gemini API Key تنظیم نشده است.",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
        }
      );
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:streamGenerateContent?alt=sse",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
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

    if (!response.ok) {
      let errorMessage = "خطا در ارتباط با Gemini";

      try {
        const data = await response.json();

        errorMessage =
          data?.error?.message ||
          data?.error?.status ||
          errorMessage;
      } catch {}

      return new Response(
        JSON.stringify({
          error: errorMessage,
        }),
        {
          status: response.status,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
        }
      );
    }

    if (!response.body) {
      return new Response(
        JSON.stringify({
          error: "پاسخ Streaming از Gemini دریافت نشد.",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
        }
      );
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        let buffer = "";

        try {
          while (true) {
            const { value, done } = await reader.read();

            buffer += decoder.decode(
              value || new Uint8Array(),
              {
                stream: !done,
              }
            );

            // Gemini از SSE استفاده می‌کند.
            // هم \n\n و هم \r\n\r\n را پشتیبانی می‌کنیم.
            const events = buffer.split(/\r?\n\r?\n/);

            buffer = events.pop() || "";

            for (const event of events) {
              const lines = event.split(/\r?\n/);

              for (const line of lines) {
                const trimmedLine = line.trim();

                if (!trimmedLine.startsWith("data:")) {
                  continue;
                }

                const raw = trimmedLine
                  .slice(5)
                  .trim();

                if (!raw || raw === "[DONE]") {
                  continue;
                }

                let data: any;

                try {
                  data = JSON.parse(raw);
                } catch (error) {
                  console.error(
                    "GEMINI_JSON_PARSE_ERROR:",
                    raw
                  );
                  continue;
                }

                // اگر خود Gemini خطا را داخل Stream فرستاد
                if (data?.error?.message) {
                  throw new Error(
                    data.error.message
                  );
                }

                const parts =
                  data?.candidates?.[0]?.content?.parts;

                if (!Array.isArray(parts)) {
                  continue;
                }

                for (const part of parts) {
                  if (
                    typeof part?.text === "string" &&
                    part.text.length > 0
                  ) {
                    // فقط متن واقعی Gemini را
                    // برای Frontend می‌فرستیم.
                    controller.enqueue(
                      encoder.encode(part.text)
                    );
                  }
                }
              }
            }

            if (done) {
              break;
            }
          }

          // اگر در انتهای Stream چیزی داخل buffer مانده باشد
          if (buffer.trim()) {
            const lines = buffer.split(/\r?\n/);

            for (const line of lines) {
              const trimmedLine = line.trim();

              if (!trimmedLine.startsWith("data:")) {
                continue;
              }

              const raw = trimmedLine
                .slice(5)
                .trim();

              if (!raw || raw === "[DONE]") {
                continue;
              }

              let data: any;

              try {
                data = JSON.parse(raw);
              } catch {
                continue;
              }

              if (data?.error?.message) {
                throw new Error(
                  data.error.message
                );
              }

              const parts =
                data?.candidates?.[0]?.content?.parts;

              if (!Array.isArray(parts)) {
                continue;
              }

              for (const part of parts) {
                if (
                  typeof part?.text === "string" &&
                  part.text.length > 0
                ) {
                  controller.enqueue(
                    encoder.encode(part.text)
                  );
                }
              }
            }
          }

          controller.close();
        } catch (error) {
          console.error(
            "GEMINI_STREAM_ERROR:",
            error
          );

          controller.error(error);
        } finally {
          reader.releaseLock();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type":
          "text/plain; charset=utf-8",

        "Cache-Control":
          "no-cache, no-transform",

        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.error(
      "CHAT_API_ERROR:",
      error
    );

    const errorMessage =
      error instanceof Error
        ? error.message
        : "خطایی در سرور رخ داد.";

    return new Response(
      JSON.stringify({
        error: errorMessage,
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
