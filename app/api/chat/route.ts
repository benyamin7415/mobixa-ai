import { NextRequest } from "next/server";

function jsonResponse(
  data: any,
  status: number
) {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        "Content-Type":
          "application/json; charset=utf-8",
      },
    }
  );
}

function shouldFallbackToOpenRouter(
  status: number
) {
  return (
    status === 408 ||
    status === 409 ||
    status === 425 ||
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504
  );
}

async function getErrorMessage(
  response: Response,
  defaultMessage: string
) {
  try {
    const data = await response.json();

    return (
      data?.error?.message ||
      data?.error?.status ||
      defaultMessage
    );
  } catch {
    return defaultMessage;
  }
}

async function createOpenRouterResponse(
  message: string
) {
  const openRouterKey =
    process.env.OPENROUTER_API_KEY;

  if (!openRouterKey) {
    return jsonResponse(
      {
        error:
          "OpenRouter API Key تنظیم نشده است.",
      },
      500
    );
  }

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          Authorization:
            `Bearer ${openRouterKey}`,

          Accept:
            "text/event-stream",

          "HTTP-Referer":
            "https://mobixa-ai.com",

          "X-Title":
            "Mobixa AI",
        },

        body: JSON.stringify({
          model: "openrouter/free",

          stream: true,

          messages: [
            {
              role: "user",
              content: message,
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorMessage =
        await getErrorMessage(
          response,
          "خطا در ارتباط با OpenRouter"
        );

      return jsonResponse(
        {
          error: errorMessage,
        },
        response.status
      );
    }

    if (!response.body) {
      return jsonResponse(
        {
          error:
            "پاسخ Streaming از OpenRouter دریافت نشد.",
        },
        500
      );
    }

    const reader =
      response.body.getReader();

    const decoder =
      new TextDecoder();

    const encoder =
      new TextEncoder();

    const stream =
      new ReadableStream({
        async start(controller) {
          let buffer = "";

          try {
            while (true) {
              const {
                value,
                done,
              } = await reader.read();

              buffer += decoder.decode(
                value ||
                  new Uint8Array(),
                {
                  stream: !done,
                }
              );

              const events =
                buffer.split(
                  /\r?\n\r?\n/
                );

              buffer =
                events.pop() || "";

              for (
                const event of events
              ) {
                const lines =
                  event.split(
                    /\r?\n/
                  );

                for (
                  const line of lines
                ) {
                  const trimmedLine =
                    line.trim();

                  if (
                    !trimmedLine.startsWith(
                      "data:"
                    )
                  ) {
                    continue;
                  }

                  const raw =
                    trimmedLine
                      .slice(5)
                      .trim();

                  if (
                    !raw ||
                    raw === "[DONE]"
                  ) {
                    continue;
                  }

                  let data: any;

                  try {
                    data =
                      JSON.parse(raw);
                  } catch {
                    continue;
                  }

                  if (
                    data?.error?.message
                  ) {
                    throw new Error(
                      data.error.message
                    );
                  }

                  const content =
                    data
                      ?.choices?.[0]
                      ?.delta
                      ?.content;

                  if (
                    typeof content ===
                      "string" &&
                    content.length > 0
                  ) {
                    controller.enqueue(
                      encoder.encode(
                        content
                      )
                    );
                  }
                }
              }

              if (done) {
                break;
              }
            }

            if (buffer.trim()) {
              const lines =
                buffer.split(
                  /\r?\n/
                );

              for (
                const line of lines
              ) {
                const trimmedLine =
                  line.trim();

                if (
                  !trimmedLine.startsWith(
                    "data:"
                  )
                ) {
                  continue;
                }

                const raw =
                  trimmedLine
                    .slice(5)
                    .trim();

                if (
                  !raw ||
                  raw === "[DONE]"
                ) {
                  continue;
                }

                let data: any;

                try {
                  data =
                    JSON.parse(raw);
                } catch {
                  continue;
                }

                if (
                  data?.error?.message
                ) {
                  throw new Error(
                    data.error.message
                  );
                }

                const content =
                  data
                    ?.choices?.[0]
                    ?.delta
                    ?.content;

                if (
                  typeof content ===
                    "string" &&
                  content.length > 0
                ) {
                  controller.enqueue(
                    encoder.encode(
                      content
                    )
                  );
                }
              }
            }

            controller.close();
          } catch (error) {
            console.error(
              "OPENROUTER_STREAM_ERROR:",
              error
            );

            controller.error(
              error
            );
          } finally {
            reader.releaseLock();
          }
        },
      });

    return new Response(
      stream,
      {
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
  } catch (error) {
    console.error(
      "OPENROUTER_REQUEST_ERROR:",
      error
    );

    return jsonResponse(
      {
        error:
          error instanceof Error
            ? error.message
            : "خطا در ارتباط با OpenRouter",
      },
      502
    );
  }
}

export async function POST(
  request: NextRequest
) {
  try {
    const { message } =
      await request.json();

    if (
      !message ||
      typeof message !== "string"
    ) {
      return jsonResponse(
        {
          error:
            "پیام معتبر نیست.",
        },
        400
      );
    }

    const geminiKey =
      process.env.GEMINI_API_KEY;

    const openRouterKey =
      process.env.OPENROUTER_API_KEY;

    /*
     * اگر Gemini Key وجود نداشته باشد،
     * مستقیماً از OpenRouter استفاده می‌کنیم.
     */

    if (!geminiKey) {
      console.warn(
        "GEMINI_API_KEY is missing. Using OpenRouter fallback."
      );

      if (openRouterKey) {
        return createOpenRouterResponse(
          message
        );
      }

      return jsonResponse(
        {
          error:
            "Gemini و OpenRouter API Key تنظیم نشده‌اند.",
        },
        500
      );
    }

    let geminiResponse: Response;

    /*
     * درخواست اصلی به Gemini
     */

    try {
      geminiResponse =
        await fetch(
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
      /*
       * اگر خود درخواست Gemini
       * اصلاً برقرار نشد،
       * می‌رویم سراغ OpenRouter.
       */

      console.error(
        "GEMINI_FETCH_ERROR:",
        error
      );

      if (openRouterKey) {
        console.warn(
          "Falling back to OpenRouter."
        );

        return createOpenRouterResponse(
          message
        );
      }

      return jsonResponse(
        {
          error:
            error instanceof Error
              ? error.message
              : "خطا در ارتباط با Gemini",
        },
        502
      );
    }

    /*
     * اگر Gemini خطای HTTP بدهد
     */

    if (!geminiResponse.ok) {
      const errorMessage =
        await getErrorMessage(
          geminiResponse,
          "خطا در ارتباط با Gemini"
        );

      console.error(
        "GEMINI_HTTP_ERROR:",
        geminiResponse.status,
        errorMessage
      );

      /*
       * خطاهای موقتی و محدودیت quota
       * باعث فعال شدن OpenRouter می‌شوند.
       */

      if (
        openRouterKey &&
        shouldFallbackToOpenRouter(
          geminiResponse.status
        )
      ) {
        console.warn(
          "Gemini unavailable/rate-limited. Falling back to OpenRouter."
        );

        return createOpenRouterResponse(
          message
        );
      }

      /*
       * اگر خطا مثلاً API Key اشتباه،
       * درخواست نامعتبر و... باشد،
       * بی‌دلیل OpenRouter را صدا نمی‌زنیم.
       */

      return jsonResponse(
        {
          error:
            errorMessage,
        },
        geminiResponse.status
      );
    }

    /*
     * Gemini پاسخ موفق داده،
     * پس همان پاسخ را Streaming می‌کنیم.
     */

    if (!geminiResponse.body) {
      console.error(
        "GEMINI_NO_STREAM_BODY"
      );

      if (openRouterKey) {
        return createOpenRouterResponse(
          message
        );
      }

      return jsonResponse(
        {
          error:
            "پاسخ Streaming از Gemini دریافت نشد.",
        },
        500
      );
    }

    const reader =
      geminiResponse.body.getReader();

    const decoder =
      new TextDecoder();

    const encoder =
      new TextEncoder();

    const stream =
      new ReadableStream({
        async start(controller) {
          let buffer = "";

          let hasEmittedText =
            false;

          try {
            while (true) {
              const {
                value,
                done,
              } = await reader.read();

              buffer += decoder.decode(
                value ||
                  new Uint8Array(),
                {
                  stream: !done,
                }
              );

              const events =
                buffer.split(
                  /\r?\n\r?\n/
                );

              buffer =
                events.pop() || "";

              for (
                const event of events
              ) {
                const lines =
                  event.split(
                    /\r?\n/
                  );

                for (
                  const line of lines
                ) {
                  const trimmedLine =
                    line.trim();

                  if (
                    !trimmedLine.startsWith(
                      "data:"
                    )
                  ) {
                    continue;
                  }

                  const raw =
                    trimmedLine
                      .slice(5)
                      .trim();

                  if (
                    !raw ||
                    raw === "[DONE]"
                  ) {
                    continue;
                  }

                  let data: any;

                  try {
                    data =
                      JSON.parse(raw);
                  } catch {
                    console.error(
                      "GEMINI_JSON_PARSE_ERROR:",
                      raw
                    );

                    continue;
                  }

                  /*
                   * اگر Gemini داخل SSE
                   * خودش error فرستاد
                   */

                  if (
                    data?.error?.message
                  ) {
                    throw new Error(
                      data.error.message
                    );
                  }

                  const parts =
                    data
                      ?.candidates?.[0]
                      ?.content?.parts;

                  if (
                    !Array.isArray(
                      parts
                    )
                  ) {
                    continue;
                  }

                  for (
                    const part of parts
                  ) {
                    if (
                      typeof part?.text ===
                        "string" &&
                      part.text.length >
                        0
                    ) {
                      hasEmittedText =
                        true;

                      controller.enqueue(
                        encoder.encode(
                          part.text
                        )
                      );
                    }
                  }
                }
              }

              if (done) {
                break;
              }
            }

            /*
             * پردازش آخرین تکه‌ی باقی‌مانده
             */

            if (buffer.trim()) {
              const lines =
                buffer.split(
                  /\r?\n/
                );

              for (
                const line of lines
              ) {
                const trimmedLine =
                  line.trim();

                if (
                  !trimmedLine.startsWith(
                    "data:"
                  )
                ) {
                  continue;
                }

                const raw =
                  trimmedLine
                    .slice(5)
                    .trim();

                if (
                  !raw ||
                  raw === "[DONE]"
                ) {
                  continue;
                }

                let data: any;

                try {
                  data =
                    JSON.parse(raw);
                } catch {
                  continue;
                }

                if (
                  data?.error?.message
                ) {
                  throw new Error(
                    data.error.message
                  );
                }

                const parts =
                  data
                    ?.candidates?.[0]
                    ?.content?.parts;

                if (
                  !Array.isArray(
                    parts
                  )
                ) {
                  continue;
                }

                for (
                  const part of parts
                ) {
                  if (
                    typeof part?.text ===
                      "string" &&
                    part.text.length >
                      0
                  ) {
                    hasEmittedText =
                      true;

                    controller.enqueue(
                      encoder.encode(
                        part.text
                      )
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

            /*
             * اگر Gemini قبل از فرستادن
             * حتی یک کلمه خراب شد،
             * OpenRouter را فعال می‌کنیم.
             *
             * اگر بخشی از جواب قبلاً آمده باشد،
             * دوباره درخواست نمی‌زنیم تا
             * جواب تکراری نشود.
             */

            if (
              !hasEmittedText &&
              openRouterKey
            ) {
              try {
                const fallbackResponse =
                  await fetch(
                    "https://openrouter.ai/api/v1/chat/completions",
                    {
                      method: "POST",

                      headers: {
                        "Content-Type":
                          "application/json",

                        Authorization:
                          `Bearer ${openRouterKey}`,

                        Accept:
                          "text/event-stream",

                        "HTTP-Referer":
                          "https://mobixa-ai.com",

                        "X-Title":
                          "Mobixa AI",
                      },

                      body: JSON.stringify({
                        model:
                          "openrouter/free",

                        stream: true,

                        messages: [
                          {
                            role: "user",
                            content:
                              message,
                          },
                        ],
                      }),
                    }
                  );

                if (
                  !fallbackResponse.ok ||
                  !fallbackResponse.body
                ) {
                  const fallbackError =
                    await getErrorMessage(
                      fallbackResponse,
                      "OpenRouter نیز در دسترس نیست."
                    );

                  controller.error(
                    new Error(
                      fallbackError
                    )
                  );

                  return;
                }

                const fallbackReader =
                  fallbackResponse.body.getReader();

                const fallbackDecoder =
                  new TextDecoder();

                let fallbackBuffer =
                  "";

                try {
                  while (true) {
                    const {
                      value,
                      done,
                    } =
                      await fallbackReader.read();

                    fallbackBuffer +=
                      fallbackDecoder.decode(
                        value ||
                          new Uint8Array(),
                        {
                          stream:
                            !done,
                        }
                      );

                    const events =
                      fallbackBuffer.split(
                        /\r?\n\r?\n/
                      );

                    fallbackBuffer =
                      events.pop() ||
                      "";

                    for (
                      const event of events
                    ) {
                      const lines =
                        event.split(
                          /\r?\n/
                        );

                      for (
                        const line of lines
                      ) {
                        const trimmedLine =
                          line.trim();

                        if (
                          !trimmedLine.startsWith(
                            "data:"
                          )
                        ) {
                          continue;
                        }

                        const raw =
                          trimmedLine
                            .slice(5)
                            .trim();

                        if (
                          !raw ||
                          raw ===
                            "[DONE]"
                        ) {
                          continue;
                        }

                        let data: any;

                        try {
                          data =
                            JSON.parse(
                              raw
                            );
                        } catch {
                          continue;
                        }

                        if (
                          data?.error
                            ?.message
                        ) {
                          throw new Error(
                            data.error
                              .message
                          );
                        }

                        const content =
                          data
                            ?.choices?.[0]
                            ?.delta
                            ?.content;

                        if (
                          typeof content ===
                            "string" &&
                          content.length >
                            0
                        ) {
                          controller.enqueue(
                            encoder.encode(
                              content
                            )
                          );
                        }
                      }
                    }

                    if (done) {
                      break;
                    }
                  }

                  controller.close();
                } finally {
                  fallbackReader.releaseLock();
                }
              } catch (fallbackError) {
                console.error(
                  "OPENROUTER_FALLBACK_ERROR:",
                  fallbackError
                );

                controller.error(
                  fallbackError
                );
              }

              return;
            }

            controller.error(
              error
            );
          } finally {
            reader.releaseLock();
          }
        },
      });

    return new Response(
      stream,
      {
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
  } catch (error) {
    console.error(
      "CHAT_API_ERROR:",
      error
    );

    const errorMessage =
      error instanceof Error
        ? error.message
        : "خطایی در سرور رخ داد.";

    return jsonResponse(
      {
        error:
          errorMessage,
      },
      500
    );
  }
}
