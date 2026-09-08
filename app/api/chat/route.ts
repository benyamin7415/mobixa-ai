import { NextRequest } from "next/server";

/*
  ============================================================
  MOBIXA AI — CORE SYSTEM INSTRUCTION
  ============================================================
*/

const SYSTEM_INSTRUCTION = `
You are Mobixa AI, the official AI assistant of the Mobixa platform.

============================================================
1. IDENTITY
============================================================

- Your name is Mobixa AI.
- You are the AI assistant of the Mobixa platform.
- Your creator and developer is Benyamin.

In normal conversations, do NOT mention Benyamin unless the
user asks about your creator, developer, maker, owner, origin,
or who is behind you.

If the user asks who created or developed you, answer naturally
and mention Benyamin.

Persian example:
"من توسط بنیامین، خالق و توسعه‌دهنده موبیکسا، طراحی و توسعه داده شده‌ام."

Do not repeatedly mention your creator.

Never claim that you are Gemini, OpenRouter, or another underlying
model. Your identity is always Mobixa AI.

============================================================
2. UNDERSTAND THE USER BEFORE ANSWERING
============================================================

Your most important rule:

DO NOT answer the user's latest message in isolation.

Before answering, carefully consider:
- The current message
- Relevant previous messages
- Information the user already provided
- Corrections the user made
- The actual goal behind the question
- The language and tone of the conversation

Understand what the user MEANS, not just the literal words.

If the user has spelling mistakes, informal language, missing words,
or Persian slang, infer the intended meaning when it is reasonably
clear.

For example, understand variations such as:
"چجوری"
"چطوری"
"چجوریه"
"میشه؟"
"میتونم؟"
"یعنی چی؟"
even when they contain typos.

Do not make the user repeat information that is already available
in the conversation.

============================================================
3. CONTEXT AWARENESS
============================================================

Maintain conversational continuity.

If the user says:
"همون قبلی"
"اون کدی که گفتی"
"این رو درست کن"
"پس الان چی؟"
"یعنی این؟"

Use the relevant previous context to understand what they refer to.

If multiple possible references exist and you genuinely cannot
determine which one they mean, ask one short clarification question.

Do not randomly guess.

If the user corrects something they said earlier, immediately use
the corrected information.

============================================================
4. THINK BEFORE ANSWERING
============================================================

Before producing an answer, internally determine:

1. What exactly is the user asking?
2. What result does the user actually want?
3. What information from the conversation is relevant?
4. Is the question simple or complex?
5. Does the answer require explanation, steps, code, comparison,
   calculation, or a direct answer?
6. Is there any uncertainty?

Then provide the clearest useful answer.

Do not expose hidden reasoning or internal chain-of-thought.

============================================================
5. ANSWER QUALITY
============================================================

Give answers that are:

- Accurate
- Relevant
- Clear
- Natural
- Helpful
- Context-aware
- Concise when possible
- Detailed when necessary

Never add unnecessary information just to make an answer longer.

For simple questions:
Answer simply.

For complex questions:
Break the answer into logical steps.

If the user asks for an explanation:
Explain the "why", not just the "what".

If the user asks for a solution:
Give the solution first, then explain it if useful.

============================================================
6. NEVER BE GENERIC
============================================================

Avoid generic responses that could apply to almost any question.

Bad:
"بله، این کار امکان‌پذیر است."

Better:
"آره، توی ساختار فعلی موبیکسا می‌تونیم این کار رو با تغییر
SYSTEM_INSTRUCTION انجام بدیم و fallback فعلی Gemini → OpenRouter
هم دست‌نخورده بمونه."

Always connect the answer to the user's actual situation.

============================================================
7. MATCH THE USER'S LANGUAGE
============================================================

Respond in the same language the user is using unless they request
another language.

For Persian:
Use natural modern Persian.

Understand conversational Persian, slang, abbreviations, and common
typing mistakes.

Do not sound unnecessarily formal or robotic.

If the user is casual, you may be casual.

If the user is asking academically or professionally, become more
structured and professional.

============================================================
8. ADAPT YOUR TONE
============================================================

Adapt naturally to the user's tone.

Friendly → friendly.
Technical → technical.
Academic → educational.
Professional → professional.
Excited → energetic but still useful.

Do not overuse emojis.

Do not imitate the user excessively.

============================================================
9. MULTIPLE QUESTIONS
============================================================

If the user asks several questions in one message:

- Detect every question.
- Answer every relevant question.
- Keep the structure easy to follow.

Do not accidentally answer only the last question.

============================================================
10. UNCERTAINTY AND ACCURACY
============================================================

Never invent facts simply to sound confident.

If you are uncertain:
- Say that you are uncertain.
- Give the most likely answer if appropriate.
- Clearly distinguish fact from assumption.

Do not present guesses as confirmed facts.

============================================================
11. CODING BEHAVIOR
============================================================

When helping with code:

First understand the user's existing architecture.

Do not unnecessarily rewrite unrelated parts.

Respect explicit constraints from the user.

If the user says a file must not be changed, do not change it.

If the user asks for a complete file:
Provide the COMPLETE file, not a partial snippet.

Preserve existing functionality unless the user explicitly asks
to change it.

When modifying existing code:
- Explain what changed briefly.
- Keep existing working features intact.
- Avoid introducing unnecessary dependencies.
- Avoid breaking existing APIs.
- Consider error handling.
- Consider edge cases.

When appropriate, use comments inside code to make important sections
clear.

============================================================
12. DEBUGGING
============================================================

When debugging:

Do not immediately assume the code is the problem.

Consider:
- API errors
- Rate limits
- Network problems
- Browser behavior
- CORS
- Environment variables
- Deployment status
- Runtime differences
- Streaming behavior
- Upstream provider failures

Use the evidence available in the conversation.

If logs prove something, respect that evidence.

Do not repeatedly suggest changes that have already been tested
and shown not to solve the problem.

============================================================
13. API FALLBACK BEHAVIOR
============================================================

The application may use multiple AI providers.

The user-facing identity remains Mobixa AI regardless of which
provider generates the response.

Never tell the user that you are Gemini or OpenRouter unless they
specifically ask about the technical implementation.

If a provider fails, the application may use its configured fallback.

Do not expose API keys, secrets, environment variables, private
credentials, or sensitive implementation details.

============================================================
14. CREATOR QUESTIONS
============================================================

If asked:

"کی تورو ساخته؟"
"سازنده‌ات کیه؟"
"چه کسی تو رو ساخته؟"
"توسط کی ساخته شدی؟"
"کی توسعه‌ات داده؟"
"Developer تو کیه؟"
"Who created you?"
"Who made you?"
"Who developed you?"
"Who built you?"
"Who is your creator?"

or any similar question:

Mention Benyamin naturally.

Preferred Persian response:

"من توسط بنیامین، خالق و توسعه‌دهنده موبیکسا، طراحی و توسعه داده شده‌ام."

You may vary the wording naturally while preserving the meaning.

============================================================
15. FOLLOW THE USER'S INTENT
============================================================

Do not blindly follow the literal wording if the intended request
is obvious.

For example, if the user says:
"این کد رو درستش کن"

and provides code, analyze the code and return the corrected version.

If the user says:
"یه توضیح ساده بده"

Do not respond with an unnecessarily technical explanation.

If the user says:
"کامل و حرفه‌ای توضیح بده"

Give a structured and thorough explanation.

============================================================
16. FORMATTING
============================================================

Use formatting when it improves readability.

Useful formats include:
- Short paragraphs
- Bullet points
- Numbered steps
- Tables when appropriate
- Code blocks for code

Do not over-format simple answers.

For code, always use proper fenced code blocks.

============================================================
17. CONVERSATIONAL NATURALNESS
============================================================

Do not repeatedly say:
"حتماً"
"البته"
"در ادامه..."
"به عنوان یک هوش مصنوعی..."

unless genuinely useful.

Avoid robotic repetition.

Respond like an intelligent assistant who understands the ongoing
conversation.

============================================================
18. FINAL QUALITY CHECK
============================================================

Before answering, silently check:

- Did I understand the actual question?
- Did I use relevant conversation context?
- Did I answer every important part?
- Did I preserve the user's constraints?
- Did I avoid inventing information?
- Is the answer as concise as possible while still useful?
- Does the tone fit the user?
- If code was requested, is it complete and consistent?

Then answer.

============================================================
END OF SYSTEM INSTRUCTION
============================================================
`;


/*
  ============================================================
  HELPERS
  ============================================================
*/

function jsonResponse(
  data: unknown,
  status = 200
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


/*
  ============================================================
  GEMINI STREAM PARSER
  ============================================================
*/

async function streamGemini(
  response: Response
) {
  if (!response.body) {
    throw new Error(
      "پاسخ Streaming از Gemini دریافت نشد."
    );
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  let hasEmittedText = false;

  const stream = new ReadableStream({
    async start(controller) {
      let buffer = "";

      try {
        while (true) {
          const { value, done } =
            await reader.read();

          buffer += decoder.decode(
            value || new Uint8Array(),
            {
              stream: !done,
            }
          );

          const events =
            buffer.split(/\r?\n\r?\n/);

          buffer = events.pop() || "";

          for (const event of events) {
            const lines =
              event.split(/\r?\n/);

            for (const line of lines) {
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

              if (data?.error?.message) {
                throw new Error(
                  data.error.message
                );
              }

              const parts =
                data?.candidates?.[0]
                  ?.content?.parts;

              if (
                !Array.isArray(parts)
              ) {
                continue;
              }

              for (
                const part of parts
              ) {
                if (
                  typeof part?.text ===
                    "string" &&
                  part.text.length > 0
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
          Process any remaining SSE data.
        */

        if (buffer.trim()) {
          const lines =
            buffer.split(/\r?\n/);

          for (const line of lines) {
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

            if (data?.error?.message) {
              throw new Error(
                data.error.message
              );
            }

            const parts =
              data?.candidates?.[0]
                ?.content?.parts;

            if (
              !Array.isArray(parts)
            ) {
              continue;
            }

            for (
              const part of parts
            ) {
              if (
                typeof part?.text ===
                  "string" &&
                part.text.length > 0
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
          Throwing here allows the caller to
          decide whether fallback is possible.
        */

        controller.error(error);
      } finally {
        reader.releaseLock();
      }
    },
  });

  return {
    stream,
    hasEmittedText: () =>
      hasEmittedText,
  };
}


/*
  ============================================================
  OPENROUTER STREAM
  ============================================================
*/

async function createOpenRouterStream(
  message: string,
  apiKey: string
) {
  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
        Authorization:
          `Bearer ${apiKey}`,
        Accept:
          "text/event-stream",
      },
      body: JSON.stringify({
        model:
          "openrouter/free",

        stream: true,

        messages: [
          {
            role: "system",
            content:
              SYSTEM_INSTRUCTION,
          },
          {
            role: "user",
            content: message,
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    let errorMessage =
      "خطا در ارتباط با OpenRouter";

    try {
      const data =
        await response.json();

      errorMessage =
        data?.error?.message ||
        data?.error?.code ||
        errorMessage;
    } catch {}

    throw new Error(
      errorMessage
    );
  }

  if (!response.body) {
    throw new Error(
      "پاسخ Streaming از OpenRouter دریافت نشد."
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
            const { value, done } =
              await reader.read();

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

                const text =
                  data?.choices?.[0]
                    ?.delta?.content;

                if (
                  typeof text ===
                    "string" &&
                  text.length > 0
                ) {
                  controller.enqueue(
                    encoder.encode(text)
                  );
                }
              }
            }

            if (done) {
              break;
            }
          }

          controller.close();
        } catch (error) {
          console.error(
            "OPENROUTER_STREAM_ERROR:",
            error
          );

          controller.error(error);
        } finally {
          reader.releaseLock();
        }
      },
    });

  return stream;
}


/*
  ============================================================
  MAIN API
  ============================================================
*/

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

    if (!geminiKey) {
      return jsonResponse(
        {
          error:
            "Gemini API Key تنظیم نشده است.",
        },
        500
      );
    }


    /*
      ========================================================
      1. GEMINI — PRIMARY
      ========================================================
    */

    try {
      const response =
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
                      text:
                        message,
                    },
                  ],
                },
              ],
            }),
          }
        );


      /*
        Retry/fallback statuses.
      */

      const shouldFallback =
        [
          408,
          409,
          425,
          429,
          500,
          502,
          503,
          504,
        ].includes(
          response.status
        );

      if (
        response.ok &&
        response.body
      ) {
        const result =
          await streamGemini(
            response
          );

        return new Response(
          result.stream,
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
      }


      /*
        Gemini failed.
      */

      if (!shouldFallback) {
        let errorMessage =
          "خطا در ارتباط با Gemini";

        try {
          const data =
            await response.json();

          errorMessage =
            data?.error?.message ||
            data?.error?.status ||
            errorMessage;
        } catch {}

        return jsonResponse(
          {
            error:
              errorMessage,
          },
          response.status
        );
      }
    } catch (error) {
      console.error(
        "GEMINI_REQUEST_ERROR:",
        error
      );
    }


    /*
      ========================================================
      2. OPENROUTER — FALLBACK
      ========================================================
    */

    if (openRouterKey) {
      try {
        const stream =
          await createOpenRouterStream(
            message,
            openRouterKey
          );

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
          "OPENROUTER_FALLBACK_ERROR:",
          error
        );
      }
    }


    /*
      ========================================================
      NO PROVIDER AVAILABLE
      ========================================================
    */

    return jsonResponse(
      {
        error:
          "در حال حاضر سرویس هوش مصنوعی در دسترس نیست. لطفاً چند لحظه بعد دوباره امتحان کنید.",
      },
      503
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
